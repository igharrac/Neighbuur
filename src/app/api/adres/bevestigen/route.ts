import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { generateUitnodigingscode } from "@/lib/utils";

/**
 * Slaat pas iets op nadat de gebruiker het geresolvede adres heeft
 * bevestigd ("Ja, klopt"). Twee paden:
 * - confirmed: { addressId } — normaal pad, adres al door /api/adres/zoeken
 *   geresolved en gecachet.
 * - provisional: { developmentPhaseId, constructionNumber } — nieuwbouw
 *   zonder definitief adres, alleen bouwnummer bekend.
 *
 * Doet: find-or-create residence (voorkomt dubbele woning-records per
 * adres) → find-or-create residential cluster (gebouw-identiteit i.p.v.
 * postcode-string) → optionele development-verrijking (alleen afgeleid,
 * nooit gekozen) → woonhistorie bijwerken → resident_profiles koppelen.
 */
export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profiel } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profiel) return NextResponse.json({ error: "Nog geen profiel — rond eerst de naam-stap af" }, { status: 400 });

  const body = await request.json();
  const admin = createAdminSupabase();

  let residenceId: string;
  let clusterId: string | null = null;
  let developmentId: string | null = null;
  let developmentPhaseId: string | null = null;

  if (body.addressId) {
    // ── Confirmed pad: adres al geresolved via /api/adres/zoeken ──
    const { data: address, error: addressError } = await admin
      .from("addresses")
      .select("id, bag_pand_ids, postal_code")
      .eq("id", body.addressId)
      .maybeSingle();
    if (addressError || !address) {
      return NextResponse.json({ error: "Adres niet gevonden" }, { status: 404 });
    }

    const { data: bestaandeResidence } = await admin
      .from("residences")
      .select("id, residential_cluster_id, development_id, development_phase_id")
      .eq("address_id", address.id)
      .maybeSingle();

    if (bestaandeResidence) {
      residenceId = bestaandeResidence.id;
      clusterId = bestaandeResidence.residential_cluster_id;
      developmentId = bestaandeResidence.development_id;
      developmentPhaseId = bestaandeResidence.development_phase_id;
    } else {
      const bagPandIds = (address.bag_pand_ids ?? []) as string[];

      if (bagPandIds.length > 0) {
        const { data: clusterResult, error: clusterError } = await admin.rpc("find_or_create_residential_cluster", {
          p_bag_pand_ids: bagPandIds,
          p_type: "building",
        });
        if (clusterError) return NextResponse.json({ error: clusterError.message }, { status: 500 });
        clusterId = clusterResult;

        // Development-verrijking: alleen afgeleid, nooit gekozen. Geen
        // match is volkomen normaal (bestaande bouw zonder project).
        const { data: cluster } = await admin
          .from("residential_clusters")
          .select("development_id, development_phase_id")
          .eq("id", clusterId)
          .maybeSingle();

        if (cluster?.development_id) {
          developmentId = cluster.development_id;
          developmentPhaseId = cluster.development_phase_id;
        } else {
          const { data: phaseByPand } = await admin
            .from("development_phases")
            .select("id, development_id")
            .overlaps("bag_pand_ids", bagPandIds)
            .maybeSingle();
          const { data: phaseByPostcode } = phaseByPand
            ? { data: null }
            : await admin
                .from("development_phases")
                .select("id, development_id")
                .contains("postal_codes", [address.postal_code])
                .maybeSingle();
          const matchedPhase = phaseByPand ?? phaseByPostcode;
          if (matchedPhase) {
            developmentPhaseId = matchedPhase.id;
            developmentId = matchedPhase.development_id;
            await admin
              .from("residential_clusters")
              .update({ development_id: matchedPhase.development_id, development_phase_id: matchedPhase.id })
              .eq("id", clusterId);
          }
        }
      }
      // bagPandIds leeg: adres bestaat, geen gebouwrelatie — clusterId
      // blijft null, normale individuele toegang (geen community-detectie
      // mogelijk voor deze bewoner alleen).

      const { data: nieuweResidence, error: residenceError } = await admin
        .from("residences")
        .insert({
          address_id: address.id,
          residential_cluster_id: clusterId,
          development_id: developmentId,
          development_phase_id: developmentPhaseId,
          status: "confirmed",
        })
        .select("id")
        .single();
      if (residenceError) return NextResponse.json({ error: residenceError.message }, { status: 500 });
      residenceId = nieuweResidence.id;
    }
  } else if (body.developmentPhaseId && body.constructionNumber) {
    // ── Provisional pad: nieuwbouw zonder definitief adres ──
    const constructionNumber = String(body.constructionNumber).trim();

    const { data: bestaandeResidence } = await admin
      .from("residences")
      .select("id, residential_cluster_id, development_id, development_phase_id")
      .eq("development_phase_id", body.developmentPhaseId)
      .eq("construction_number", constructionNumber)
      .maybeSingle();

    if (bestaandeResidence) {
      residenceId = bestaandeResidence.id;
      clusterId = bestaandeResidence.residential_cluster_id;
      developmentId = bestaandeResidence.development_id;
      developmentPhaseId = bestaandeResidence.development_phase_id;
    } else {
      const { data: phase, error: phaseError } = await admin
        .from("development_phases")
        .select("id, development_id")
        .eq("id", body.developmentPhaseId)
        .maybeSingle();
      if (phaseError || !phase) return NextResponse.json({ error: "Project-fase niet gevonden" }, { status: 404 });

      developmentPhaseId = phase.id;
      developmentId = phase.development_id;

      const clusterKey = `phase:${phase.id}`;
      const { data: bestaandCluster } = await admin
        .from("residential_clusters")
        .select("id")
        .eq("cluster_key", clusterKey)
        .maybeSingle();
      if (bestaandCluster) {
        clusterId = bestaandCluster.id;
      } else {
        const { data: nieuwCluster, error: clusterError } = await admin
          .from("residential_clusters")
          .insert({
            type: "development_phase",
            cluster_key: clusterKey,
            bag_pand_ids: [],
            development_id: phase.development_id,
            development_phase_id: phase.id,
            created_from: "auto",
          })
          .select("id")
          .single();
        if (clusterError) return NextResponse.json({ error: clusterError.message }, { status: 500 });
        clusterId = nieuwCluster.id;
      }

      const { data: nieuweResidence, error: residenceError } = await admin
        .from("residences")
        .insert({
          residential_cluster_id: clusterId,
          development_id: developmentId,
          development_phase_id: developmentPhaseId,
          construction_number: constructionNumber,
          status: "provisional",
        })
        .select("id")
        .single();
      if (residenceError) return NextResponse.json({ error: residenceError.message }, { status: 500 });
      residenceId = nieuweResidence.id;
    }
  } else {
    return NextResponse.json({ error: "addressId of developmentPhaseId+constructionNumber vereist" }, { status: 400 });
  }

  // ── Woonhistorie + resident_profiles koppelen ──
  await admin.from("resident_residence_history").update({ ended_at: new Date().toISOString() }).eq("user_id", user.id).is("ended_at", null);
  await admin.from("resident_residence_history").insert({ user_id: user.id, residence_id: residenceId });

  const { data: bestaandProfiel } = await admin.from("resident_profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (bestaandProfiel) {
    await admin.from("resident_profiles").update({ current_residence_id: residenceId }).eq("user_id", user.id);
  } else {
    let inviteCode = generateUitnodigingscode();
    for (let i = 0; i < 5; i++) {
      const { data: bestaandeCode } = await admin.from("resident_profiles").select("id").eq("invite_code", inviteCode).maybeSingle();
      if (!bestaandeCode) break;
      inviteCode = generateUitnodigingscode();
    }
    await admin.from("resident_profiles").insert({ user_id: user.id, current_residence_id: residenceId, invite_code: inviteCode });
  }

  return NextResponse.json({ residenceId, clusterId, developmentId });
}

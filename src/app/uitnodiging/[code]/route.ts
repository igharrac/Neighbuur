import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { generateUitnodigingscode } from "@/lib/utils";
import { notifyUser } from "@/lib/notify";

export async function GET(request: Request, { params }: { params: { code: string } }) {
  const { code } = params;
  const { origin } = new URL(request.url);
  const admin = createAdminSupabase();

  // Zoek de uitnodiger via zijn persoonlijke code
  const { data: uitnodigerProfiel } = await admin
    .from("bewoner_profielen")
    .select("user_id, community_id, wijk_id, communities(slug)")
    .eq("uitnodigingscode", code)
    .maybeSingle();

  if (!uitnodigerProfiel) {
    return NextResponse.redirect(`${origin}/`);
  }

  const communitySlug = (uitnodigerProfiel.communities as unknown as { slug: string } | null)?.slug;

  // Is de bezoeker ingelogd?
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?invite=${code}`);
  }

  const { data: profiel } = await supabase.from("profielen").select("id").eq("id", user.id).maybeSingle();
  if (!profiel) {
    return NextResponse.redirect(`${origin}/onboarding?invite=${code}`);
  }

  // Jezelf uitnodigen via je eigen link doet niets bijzonders
  if (user.id === uitnodigerProfiel.user_id) {
    return NextResponse.redirect(`${origin}/community/${communitySlug}`);
  }

  // Voeg toe aan de community (idempotent)
  await admin
    .from("community_leden")
    .upsert(
      { community_id: uitnodigerProfiel.community_id, user_id: user.id, rol: "lid" },
      { onConflict: "community_id,user_id", ignoreDuplicates: true }
    );

  // Zorg dat de nieuwe gebruiker zelf ook een uitnodigingscode heeft
  const { data: eigenBewonerProfiel } = await admin
    .from("bewoner_profielen")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!eigenBewonerProfiel) {
    let eigenCode = generateUitnodigingscode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await admin
        .from("bewoner_profielen")
        .select("id")
        .eq("uitnodigingscode", eigenCode)
        .maybeSingle();
      if (!existing) break;
      eigenCode = generateUitnodigingscode();
    }

    await admin.from("bewoner_profielen").insert({
      user_id: user.id,
      community_id: uitnodigerProfiel.community_id,
      wijk_id: uitnodigerProfiel.wijk_id,
      uitnodigingscode: eigenCode,
    });
  }

  // Log deze acceptatie + notificeer de uitnodiger (eenmalig per persoon)
  const { data: bestaandeLog } = await admin
    .from("uitnodigingen")
    .select("id")
    .eq("uitnodiger_id", uitnodigerProfiel.user_id)
    .eq("gebruikt_door", user.id)
    .maybeSingle();

  if (!bestaandeLog) {
    await admin.from("uitnodigingen").insert({
      uitnodiger_id: uitnodigerProfiel.user_id,
      code,
      community_id: uitnodigerProfiel.community_id,
      gebruikt_door: user.id,
      gebruikt_op: new Date().toISOString(),
    });

    const { data: nieuweGebruiker } = await admin.from("profielen").select("naam").eq("id", user.id).maybeSingle();
    const naam = nieuweGebruiker?.naam ?? "Iemand";

    await notifyUser(admin, {
      userId: uitnodigerProfiel.user_id,
      type: "uitnodiging",
      titelNl: "Nieuwe buur via jouw link!",
      titelEn: "New neighbour via your link!",
      inhoudNl: `${naam} heeft zich aangemeld via jouw uitnodigingslink!`,
      inhoudEn: `${naam} signed up via your invite link!`,
      link: `/community/${communitySlug}`,
    });
  }

  return NextResponse.redirect(`${origin}/community/${communitySlug}`);
}

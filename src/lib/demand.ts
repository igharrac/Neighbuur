import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { notifyUser } from "@/lib/notify";

const DREMPEL = 3;

/**
 * Generalisatie van het community-drempel-patroon (meld-drempel) naar
 * dienst-behoefte: meldt bewoners in een residential cluster dat er
 * genoeg gedeelde interesse is in dezelfde categorie. Wordt aangeroepen
 * ná een geslaagde boeking — server-side direct, niet via een losse
 * HTTP-call naar zichzelf (in tegenstelling tot meld-drempel/meld-
 * gestart, die vanuit client-componenten getriggerd worden en dus wél
 * een aparte fetch nodig hebben).
 *
 * Telt UNIEKE woningen, niet boekingen/accounts — zelfde reden als
 * overal elders: 3 huisgenoten met dezelfde boeking zijn geen 3 buren.
 */
export async function meldBehoefteBijDrempel(
  admin: SupabaseClient<Database>,
  { clusterId, categoryId }: { clusterId: string; categoryId: string }
): Promise<{ verstuurd: number; reden?: string }> {
  const { data: aantal } = await admin.rpc("count_residences_with_category_booking", {
    p_cluster_id: clusterId,
    p_category_id: categoryId,
  });
  const aantalUniekeWoningen = typeof aantal === "number" ? aantal : 0;

  if (aantalUniekeWoningen < DREMPEL) {
    return { verstuurd: 0, reden: "drempel nog niet bereikt" };
  }

  const { data: categorie } = await admin.from("categories").select("name_nl, name_en, slug").eq("id", categoryId).maybeSingle();
  if (!categorie) return { verstuurd: 0, reden: "categorie niet gevonden" };

  const { data: bewoners } = await admin
    .from("resident_profiles")
    .select("user_id, show_community_suggestions, current_residence_id")
    .not("current_residence_id", "is", null);

  const { data: residences } = await admin.from("residences").select("id").eq("residential_cluster_id", clusterId);
  const residenceIds = new Set((residences ?? []).map((r) => r.id));
  const clusterBewoners = (bewoners ?? []).filter((b) => b.current_residence_id && residenceIds.has(b.current_residence_id));

  if (clusterBewoners.length === 0) return { verstuurd: 0, reden: "geen bewoners in cluster" };

  const { data: reedsGeboekt } = await admin
    .from("bookings")
    .select("customer_id")
    .eq("category_id", categoryId)
    .in(
      "customer_id",
      clusterBewoners.map((b) => b.user_id)
    );
  const heeftAlGeboekt = new Set((reedsGeboekt ?? []).map((b) => b.customer_id));

  let verstuurd = 0;
  for (const bewoner of clusterBewoners) {
    if (heeftAlGeboekt.has(bewoner.user_id)) continue;
    if (bewoner.show_community_suggestions === false) continue;

    await notifyUser(admin, {
      userId: bewoner.user_id,
      type: "system",
      titelNl: `${aantalUniekeWoningen} buren hebben ook interesse in ${categorie.name_nl}`,
      titelEn: `${aantalUniekeWoningen} neighbours are also interested in ${categorie.name_en}`,
      inhoudNl: "Misschien is het interessant om samen op te trekken — bekijk vakmensen in de buurt.",
      inhoudEn: "Might be worth teaming up — check out professionals in the area.",
      link: `/zoeken?categorie=${categorie.slug}`,
    });
    verstuurd++;
  }

  return { verstuurd };
}

import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";

/**
 * Meldt alle community-loze bewoners in een residential cluster dat de
 * community-drempel is bereikt. Wordt aangeroepen door de bewoner wiens
 * eigen adres-bevestiging de teller net op de drempel bracht — dat is de
 * natuurlijke, eenmalige trigger: iedereen ná hen ziet een teller die al
 * boven de drempel zit en roept dit dus niet nogmaals aan.
 *
 * Telt UNIEKE woningen, niet accounts — meerdere huisgenoten op hetzelfde
 * adres tellen niet als aparte buren voor de drempel (wel als aparte
 * notificatie-ontvangers).
 */
export async function POST(request: Request) {
  const { clusterId } = await request.json();
  if (!clusterId) {
    return NextResponse.json({ error: "clusterId is verplicht" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: cluster } = await admin
    .from("residential_clusters")
    .select("community_threshold, development_id")
    .eq("id", clusterId)
    .maybeSingle();

  let threshold = cluster?.community_threshold;
  if (threshold == null && cluster?.development_id) {
    const { data: development } = await admin
      .from("developments")
      .select("community_threshold")
      .eq("id", cluster.development_id)
      .maybeSingle();
    threshold = development?.community_threshold ?? undefined;
  }
  threshold = threshold ?? 3;

  const { data: bewoners } = await admin
    .from("resident_profiles")
    .select("user_id, show_community_suggestions, current_residence_id")
    .is("community_id", null)
    .not("current_residence_id", "is", null);

  // Filteren op deze cluster kan niet met één query (geen directe FK-join
  // beschikbaar via de client), dus residences van dit cluster apart ophalen.
  const { data: residences } = await admin.from("residences").select("id").eq("residential_cluster_id", clusterId);
  const residenceIds = new Set((residences ?? []).map((r) => r.id));

  const clusterBewoners = (bewoners ?? []).filter((b) => b.current_residence_id && residenceIds.has(b.current_residence_id));
  const aantalUniekeWoningen = new Set(clusterBewoners.map((b) => b.current_residence_id)).size;

  if (aantalUniekeWoningen < threshold) {
    return NextResponse.json({ verstuurd: 0, reden: "drempel nog niet bereikt" });
  }

  let verstuurd = 0;
  for (const bewoner of clusterBewoners) {
    if (!bewoner.show_community_suggestions) continue;
    await notifyUser(admin, {
      userId: bewoner.user_id,
      type: "system",
      titelNl: "Genoeg buren voor een community!",
      titelEn: "Enough neighbours for a community!",
      inhoudNl: `Er zijn nu ${aantalUniekeWoningen} woningen uit je buurt actief. Start samen een community.`,
      inhoudEn: `There are now ${aantalUniekeWoningen} homes from your area active. Start a community together.`,
      link: "/plan",
    });
    verstuurd++;
  }

  return NextResponse.json({ verstuurd });
}

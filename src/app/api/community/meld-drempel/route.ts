import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";

/**
 * Meldt alle community-loze bewoners in een adres-cluster dat de
 * community-drempel is bereikt. Wordt aangeroepen door de bewoner wiens
 * eigen inschrijving de teller net op de drempel bracht (handleAdresNext) —
 * dat is de natuurlijke, eenmalige trigger: iedereen ná hen ziet een teller
 * die al boven de drempel zit en roept dit dus niet nogmaals aan.
 */
export async function POST(request: Request) {
  const { developmentId, postcode } = await request.json();
  if (!developmentId || !postcode) {
    return NextResponse.json({ error: "developmentId en postcode zijn verplicht" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: development } = await admin
    .from("developments")
    .select("community_threshold")
    .eq("id", developmentId)
    .maybeSingle();
  const threshold = development?.community_threshold ?? 3;

  const { data: leden } = await admin
    .from("resident_profiles")
    .select("user_id, show_community_suggestions")
    .eq("development_id", developmentId)
    .eq("postal_code", postcode)
    .is("community_id", null);

  const aantal = leden?.length ?? 0;
  if (aantal < threshold) {
    return NextResponse.json({ verstuurd: 0, reden: "drempel nog niet bereikt" });
  }

  let verstuurd = 0;
  for (const lid of leden ?? []) {
    if (!lid.show_community_suggestions) continue;
    await notifyUser(admin, {
      userId: lid.user_id,
      type: "system",
      titelNl: "Genoeg buren voor een community!",
      titelEn: "Enough neighbours for a community!",
      inhoudNl: `Er zijn nu ${aantal} bewoners uit ${postcode} actief. Start samen een community.`,
      inhoudEn: `There are now ${aantal} residents from ${postcode} active. Start a community together.`,
      link: "/plan",
    });
    verstuurd++;
  }

  return NextResponse.json({ verstuurd });
}

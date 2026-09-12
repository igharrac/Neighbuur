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
  const { wijkId, postcode } = await request.json();
  if (!wijkId || !postcode) {
    return NextResponse.json({ error: "wijkId en postcode zijn verplicht" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: wijk } = await admin.from("districts").select("community_threshold").eq("id", wijkId).maybeSingle();
  const threshold = wijk?.community_threshold ?? 3;

  const { data: leden } = await admin
    .from("bewoner_profielen")
    .select("user_id, toon_community_suggesties")
    .eq("district_id", wijkId)
    .eq("postcode", postcode)
    .is("community_id", null);

  const aantal = leden?.length ?? 0;
  if (aantal < threshold) {
    return NextResponse.json({ verstuurd: 0, reden: "drempel nog niet bereikt" });
  }

  let verstuurd = 0;
  for (const lid of leden ?? []) {
    if (!lid.toon_community_suggesties) continue;
    await notifyUser(admin, {
      userId: lid.user_id,
      type: "systeem",
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

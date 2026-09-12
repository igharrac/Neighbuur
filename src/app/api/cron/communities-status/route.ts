import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Zet communities zonder leden op status 'slapend' (niet meer actief
 * voorstellen, wel nog bestaand/doorzoekbaar — reviews en geschiedenis
 * blijven waardevol), en zet ze terug op 'actief' zodra ze weer leden
 * hebben. Bedoeld om periodiek aangeroepen te worden (zie vercel.json).
 *
 * Vereenvoudiging t.o.v. het oorspronkelijke voorstel: geen "X maanden
 * zonder leden"-vertraging, want er wordt nergens bijgehouden sinds
 * wanneer een community leeg is. Direct op 'slapend' zetten bij 0 leden
 * is voor nu het pragmatische alternatief.
 */
export async function GET() {
  const admin = createAdminSupabase();

  const { data: communities } = await admin.from("communities").select("id, status");
  if (!communities) return NextResponse.json({ bijgewerkt: 0 });

  let bijgewerkt = 0;
  for (const c of communities) {
    const { count } = await admin
      .from("community_leden")
      .select("user_id", { count: "exact", head: true })
      .eq("community_id", c.id);

    const nieuweStatus = (count ?? 0) === 0 ? "slapend" : "actief";
    if (nieuweStatus !== c.status) {
      await admin.from("communities").update({ status: nieuweStatus }).eq("id", c.id);
      bijgewerkt++;
    }
  }

  return NextResponse.json({ bijgewerkt, totaal: communities.length });
}

import { NextResponse } from "next/server";
import { resolvePostcode4Centroid } from "@/lib/bag";

/**
 * Geeft het middelpunt (stad + lat/lng) van een 4-cijferig postcode-
 * gebied terug — voor het vakman-werkgebied (postcode + straal-km).
 * Schrijft niets weg; de aanroeper (registratie- of profielformulier)
 * neemt de teruggegeven waarden mee in zijn eigen insert/update, zelfde
 * patroon als /api/adres/zoeken voor bewoners.
 */
export async function POST(request: Request) {
  const { postcode } = await request.json();
  const postcode4 = String(postcode ?? "").trim().slice(0, 4);
  if (!/^\d{4}$/.test(postcode4)) {
    return NextResponse.json({ found: false, error: "Ongeldige postcode" }, { status: 400 });
  }

  try {
    const centroid = await resolvePostcode4Centroid(postcode4);
    if (!centroid) return NextResponse.json({ found: false });
    return NextResponse.json({
      found: true,
      city: centroid.city,
      municipality: centroid.municipality,
      lat: centroid.latitude,
      lng: centroid.longitude,
    });
  } catch (err) {
    return NextResponse.json(
      { found: false, error: err instanceof Error ? err.message : "Postcode opzoeken mislukt" },
      { status: 503 }
    );
  }
}

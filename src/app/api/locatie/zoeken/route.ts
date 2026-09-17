import { NextResponse } from "next/server";
import { resolvePostcode4Centroid, resolvePlaceCentroid } from "@/lib/bag";

/**
 * Zoekt het middelpunt van een locatie voor de zoekpagina — accepteert
 * zowel een 4-cijferige postcode als een plaatsnaam ("Amersfoort").
 * Schrijft niets weg, zelfde patroon als /api/vakman/werkgebied.
 */
export async function POST(request: Request) {
  const { query } = await request.json();
  const trimmed = String(query ?? "").trim();
  if (!trimmed) {
    return NextResponse.json({ found: false, error: "Locatie ontbreekt" }, { status: 400 });
  }

  try {
    const centroid = /^\d{4}$/.test(trimmed.slice(0, 4)) && trimmed.length <= 7
      ? await resolvePostcode4Centroid(trimmed.slice(0, 4))
      : await resolvePlaceCentroid(trimmed);

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
      { found: false, error: err instanceof Error ? err.message : "Locatie opzoeken mislukt" },
      { status: 503 }
    );
  }
}

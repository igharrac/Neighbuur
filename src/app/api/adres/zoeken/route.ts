import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resolveAddress } from "@/lib/bag";

/**
 * Zoekt een adres op (postcode + huisnummer + optionele toevoeging) en
 * cachet het resultaat in `addresses` — voorkomt herhaalde externe calls
 * voor hetzelfde adres. Schrijft nog niets aan een gebruiker/residence;
 * dat gebeurt pas na expliciete bevestiging via /api/adres/bevestigen.
 */
export async function POST(request: Request) {
  const { postcode, huisnummer, toevoeging } = await request.json();
  if (!postcode || !huisnummer) {
    return NextResponse.json({ error: "postcode en huisnummer zijn verplicht" }, { status: 400 });
  }

  const postcodeNorm = String(postcode).trim().toUpperCase().replace(/\s+/g, "");
  const huisnummerNorm = String(huisnummer).trim();

  const result = await resolveAddress(postcodeNorm, huisnummerNorm, toevoeging || null);

  if (result.status === "error") {
    return NextResponse.json({ found: false, error: result.message }, { status: 503 });
  }
  if (result.status === "not-found") {
    return NextResponse.json({ found: false });
  }
  if (result.status === "ambiguous") {
    return NextResponse.json({ found: false, ambiguous: true, candidates: result.candidates });
  }

  const { address } = result;
  const admin = createAdminSupabase();

  const { data: row, error } = await admin
    .from("addresses")
    .upsert(
      {
        bag_nummeraanduiding_id: address.bagNummeraanduidingId,
        bag_verblijfsobject_id: address.bagVerblijfsobjectId,
        bag_pand_ids: address.bagPandIds,
        street: address.street,
        postal_code: address.postalCode,
        house_number: address.houseNumber,
        house_number_suffix: address.houseNumberSuffix,
        city: address.city,
        municipality: address.municipality,
        latitude: address.latitude,
        longitude: address.longitude,
        source: "bag",
        raw: address.raw as never,
      },
      { onConflict: "bag_nummeraanduiding_id" }
    )
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ found: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    found: true,
    addressId: row.id,
    formatted: address.formatted,
    street: address.street,
    houseNumber: address.houseNumber,
    houseNumberSuffix: address.houseNumberSuffix,
    postalCode: address.postalCode,
    city: address.city,
  });
}

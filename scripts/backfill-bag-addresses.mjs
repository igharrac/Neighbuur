/**
 * Backfill: resolveert bestaande resident_profiles-rijen (uit de oude
 * postal_code/house_number-velden) naar het nieuwe residence/cluster-
 * model. Idempotent — rijen met al een current_residence_id worden
 * overgeslagen.
 *
 * Rijen zonder postal_code/house_number (bv. direct via een seed-script
 * aan een community gekoppeld) worden overgeslagen — er valt niets te
 * resolven. Rijen die wél een adres hebben maar niet in BAG voorkomen
 * (bv. een test-adres) worden ook overgeslagen en gerapporteerd —
 * blokkeert nooit een bestaand account.
 *
 * Gebruik: node scripts/backfill-bag-addresses.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=")).map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const LOCATIESERVER_BASE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";
const BAG_OGC_BASE = "https://api.pdok.nl/kadaster/bag/ogc/v2";

async function resolveAddress(postcode, huisnummer) {
  const params = new URLSearchParams();
  params.append("q", "*");
  params.append("fq", `postcode:${postcode}`);
  params.append("fq", `huisnummer:${huisnummer}`);
  params.append("fq", "type:adres");
  params.append("fl", "*");
  params.append("rows", "1");

  const res = await fetch(`${LOCATIESERVER_BASE}/free?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data?.response?.docs?.[0];
  if (!doc) return null;

  const pandRes = await fetch(
    `${BAG_OGC_BASE}/collections/verblijfsobject/items?identificatie=${encodeURIComponent(doc.adresseerbaarobject_id)}&f=json`
  );
  let bagPandIds = [];
  if (pandRes.ok) {
    const pandData = await pandRes.json();
    const hrefs = pandData?.features?.[0]?.properties?.["pand.href"] ?? [];
    bagPandIds = (
      await Promise.all(
        hrefs.map(async (href) => {
          const r = await fetch(`${href}?f=json`);
          if (!r.ok) return null;
          const d = await r.json();
          return d?.properties?.identificatie ?? null;
        })
      )
    ).filter(Boolean);
  }

  const point = doc.centroide_ll?.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);

  return {
    bagNummeraanduidingId: doc.nummeraanduiding_id,
    bagVerblijfsobjectId: doc.adresseerbaarobject_id,
    bagPandIds,
    street: doc.straatnaam ?? null,
    postalCode: doc.postcode,
    houseNumber: doc.huisnummer,
    houseNumberSuffix: doc.huis_nlt !== String(doc.huisnummer) ? doc.huis_nlt.replace(String(doc.huisnummer), "").replace(/^-/, "") || null : null,
    city: doc.woonplaatsnaam ?? null,
    municipality: doc.gemeentenaam ?? null,
    latitude: point ? Number(point[2]) : null,
    longitude: point ? Number(point[1]) : null,
    raw: doc,
  };
}

console.log("── Rijen zonder current_residence_id ophalen ──");
const { data: rows } = await admin
  .from("resident_profiles")
  .select("id, user_id, postal_code, house_number, house_number_suffix")
  .is("current_residence_id", null);

const teVerwerken = (rows ?? []).filter((r) => r.postal_code && r.house_number);
console.log(`${rows?.length ?? 0} rijen zonder residence, ${teVerwerken.length} met een adres om te resolven.`);

let opgelost = 0;
let overgeslagen = 0;

for (const row of teVerwerken) {
  const postcodeNorm = row.postal_code.trim().toUpperCase().replace(/\s+/g, "");
  const resolved = await resolveAddress(postcodeNorm, row.house_number);

  if (!resolved) {
    console.log(`  ! ${row.id}: ${postcodeNorm} ${row.house_number} niet gevonden in BAG — overgeslagen, blijft zonder residence.`);
    overgeslagen++;
    continue;
  }

  const { data: addressRow, error: addressError } = await admin
    .from("addresses")
    .upsert(
      {
        bag_nummeraanduiding_id: resolved.bagNummeraanduidingId,
        bag_verblijfsobject_id: resolved.bagVerblijfsobjectId,
        bag_pand_ids: resolved.bagPandIds,
        street: resolved.street,
        postal_code: resolved.postalCode,
        house_number: resolved.houseNumber,
        house_number_suffix: resolved.houseNumberSuffix,
        city: resolved.city,
        municipality: resolved.municipality,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        source: "bag",
        raw: resolved.raw,
      },
      { onConflict: "bag_nummeraanduiding_id" }
    )
    .select("id")
    .single();
  if (addressError) {
    console.log(`  ✗ ${row.id}: addresses upsert mislukt — ${addressError.message}`);
    continue;
  }

  let residenceId;
  const { data: bestaandeResidence } = await admin.from("residences").select("id, residential_cluster_id").eq("address_id", addressRow.id).maybeSingle();
  if (bestaandeResidence) {
    residenceId = bestaandeResidence.id;
  } else {
    let clusterId = null;
    if (resolved.bagPandIds.length > 0) {
      const { data: cid } = await admin.rpc("find_or_create_residential_cluster", { p_bag_pand_ids: resolved.bagPandIds, p_type: "building" });
      clusterId = cid;
    }
    const { data: nieuweResidence, error: residenceError } = await admin
      .from("residences")
      .insert({ address_id: addressRow.id, residential_cluster_id: clusterId, status: "confirmed" })
      .select("id")
      .single();
    if (residenceError) {
      console.log(`  ✗ ${row.id}: residences insert mislukt — ${residenceError.message}`);
      continue;
    }
    residenceId = nieuweResidence.id;
  }

  await admin.from("resident_residence_history").update({ ended_at: new Date().toISOString() }).eq("user_id", row.user_id).is("ended_at", null);
  await admin.from("resident_residence_history").insert({ user_id: row.user_id, residence_id: residenceId });
  await admin.from("resident_profiles").update({ current_residence_id: residenceId }).eq("id", row.id);

  console.log(`  ✓ ${row.id}: ${resolved.street} ${resolved.houseNumber}, ${resolved.city} → residence ${residenceId}`);
  opgelost++;
}

console.log(`\nKlaar. ${opgelost} opgelost, ${overgeslagen} niet gevonden in BAG, ${(rows?.length ?? 0) - teVerwerken.length} zonder adresgegevens overgeslagen.`);

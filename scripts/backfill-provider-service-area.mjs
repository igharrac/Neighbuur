/**
 * Geocodeert het werkgebied (service_area_postcode) van bestaande
 * professional_profiles naar lat/lng + stad, via dezelfde PDOK-
 * Locatieserver als de resident-adresflow (nu met een postcode-only
 * lookup, zie src/lib/bag.ts::resolvePostcode4Centroid).
 *
 * Dedupliceert op uniek postcode-prefix om het aantal PDOK-calls te
 * beperken (~368 providers delen doorgaans een handvol postcodes).
 * Idempotent: slaat providers over die al lat/lng hebben, tenzij
 * --force is meegegeven.
 *
 * Gebruik: node scripts/backfill-provider-service-area.mjs [--force]
 */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const force = process.argv.includes("--force");

const LOCATIESERVER_BASE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1";

function parsePoint(centroideLl) {
  if (!centroideLl) return { lat: null, lng: null };
  const match = centroideLl.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return { lat: null, lng: null };
  return { lng: Number(match[1]), lat: Number(match[2]) };
}

async function resolvePostcode4Centroid(postcode4) {
  const params = new URLSearchParams();
  params.append("q", "*");
  params.append("fq", `postcode:${postcode4}*`);
  params.append("fq", "type:postcode");
  params.append("fl", "postcode,woonplaatsnaam,gemeentenaam,centroide_ll");
  params.append("rows", "1");

  const res = await fetch(`${LOCATIESERVER_BASE}/free?${params.toString()}`);
  if (!res.ok) throw new Error(`Locatieserver gaf status ${res.status}`);
  const data = await res.json();
  const doc = data?.response?.docs?.[0];
  if (!doc) return null;
  const { lat, lng } = parsePoint(doc.centroide_ll ?? null);
  if (lat === null || lng === null) return null;
  return { city: doc.woonplaatsnaam ?? null, lat, lng };
}

let query = admin.from("professional_profiles").select("id, company_name, service_area_postcode, service_area_lat");
if (!force) query = query.is("service_area_lat", null);
const { data: providers, error } = await query;
if (error) throw error;

console.log(`${providers.length} providers te geocoderen (force=${force}).`);

const uniekePostcodes = [...new Set(providers.map((p) => p.service_area_postcode).filter(Boolean))];
console.log(`${uniekePostcodes.length} unieke postcode-prefixes.`);

const cache = new Map();
let opgezocht = 0;
let nietGevonden = [];

for (const postcode of uniekePostcodes) {
  try {
    const centroid = await resolvePostcode4Centroid(postcode);
    if (centroid) {
      cache.set(postcode, centroid);
    } else {
      nietGevonden.push(postcode);
    }
  } catch (err) {
    console.error(`  ✗ ${postcode}: ${err.message}`);
    nietGevonden.push(postcode);
  }
  opgezocht++;
  if (opgezocht % 20 === 0) console.log(`  ...${opgezocht}/${uniekePostcodes.length} postcodes opgezocht`);
  // Lichte throttle — beleefd blijven tegen de gratis PDOK-dienst.
  await new Promise((r) => setTimeout(r, 80));
}

console.log(`\nPostcodes opgelost: ${cache.size}/${uniekePostcodes.length}. Niet gevonden: ${nietGevonden.join(", ") || "geen"}`);

let bijgewerkt = 0;
let overgeslagen = 0;
for (const p of providers) {
  const centroid = p.service_area_postcode ? cache.get(p.service_area_postcode) : null;
  if (!centroid) {
    overgeslagen++;
    continue;
  }
  const { error: updateError } = await admin
    .from("professional_profiles")
    .update({ service_area_lat: centroid.lat, service_area_lng: centroid.lng, service_area_city: centroid.city })
    .eq("id", p.id);
  if (updateError) {
    console.error(`  ✗ update ${p.company_name}: ${updateError.message}`);
    overgeslagen++;
  } else {
    bijgewerkt++;
  }
}

console.log(`\nKlaar. ${bijgewerkt} providers bijgewerkt, ${overgeslagen} overgeslagen (geen match of al gevuld).`);

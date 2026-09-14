/**
 * Genereert een logo (kleurvlak + vakgebied-icoon, als SVG) voor elke
 * demo-vakman, en uploadt dat naar de bestaande publieke 'vakman-logos'
 * storage-bucket.
 *
 * Het icoon komt uit dezelfde Phosphor-iconset die de rest van de app al
 * gebruikt (categories.icon, bv. "PaintBrush" voor schilderen) — dus
 * visueel consistent met de rest van Neighbuur, en geen bestaand merklogo,
 * dus geen impersonatie-risico.
 *
 * Uitzondering: demo.vakman.nieuw@neighbuur.test blijft bewust zonder logo,
 * want dat account demonstreert juist het "nieuw/incompleet profiel"-scenario
 * (zie scripts/seed-demo-accounts.mjs) — logo ontbreken is daar het punt.
 *
 * Idempotent én herschrijfbaar: draai opnieuw om bestaande demo-logo's te
 * vervangen door deze icoon-versie (upsert op hetzelfde bestandspad).
 * Gebruik: node scripts/generate-vakman-logos.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const PALET = [
  "#C1440E", "#A73400", "#2E5339", "#1E4D6B", "#5B3A8E", "#8E3A5C",
  "#B08900", "#3D5A80", "#6B4226", "#4A5859", "#7A3B69", "#2F6690",
  "#8C6A00", "#4E6E58", "#9C4A1A", "#3B3486",
];

// Phosphor-iconpaden (weight "fill", viewBox 0 0 256 256) — dezelfde set als
// categories.icon in supabase/migrations/0001_complete_schema.sql.
const ICOON_PAD = {
  stucwerk:
    "M232,56V88a4,4,0,0,1-4,4H136V52a4,4,0,0,1,4-4h84A8,8,0,0,1,232,56Zm-4,52H184v44h44a4,4,0,0,0,4-4V112A4,4,0,0,0,228,108ZM88,152h80V108H88Zm-60,0H72V108H28a4,4,0,0,0-4,4v36A4,4,0,0,0,28,152Zm200,16H136v36a4,4,0,0,0,4,4h84a8,8,0,0,0,8-8V172A4,4,0,0,0,228,168ZM28,92h92V52a4,4,0,0,0-4-4H32a8,8,0,0,0-8,8V88A4,4,0,0,0,28,92Zm-4,80v28a8,8,0,0,0,8,8h84a4,4,0,0,0,4-4V168H28A4,4,0,0,0,24,172Z",
  schilderen:
    "M232,32a8,8,0,0,0-8-8c-44.08,0-89.31,49.71-114.43,82.63A60,60,0,0,0,32,164c0,30.88-19.54,44.73-20.47,45.37A8,8,0,0,0,16,224H92a60,60,0,0,0,57.37-77.57C182.3,121.31,232,76.08,232,32ZM124.42,113.55q5.14-6.66,10.09-12.55A76.23,76.23,0,0,1,155,121.49q-5.9,4.94-12.55,10.09A60.54,60.54,0,0,0,124.42,113.55Zm42.7-2.68a92.57,92.57,0,0,0-22-22c31.78-34.53,55.75-45,69.9-47.91C212.17,55.12,201.65,79.09,167.12,110.87Z",
  vloeren:
    "M120,56v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40h48A16,16,0,0,1,120,56Zm80-16H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-96,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96,0H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z",
  keuken:
    "M88,48V16a8,8,0,0,1,16,0V48a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V16a8,8,0,0,0-16,0V48A8,8,0,0,0,128,56Zm32,0a8,8,0,0,0,8-8V16a8,8,0,0,0-16,0V48A8,8,0,0,0,160,56Zm94.4,35.2a8,8,0,0,0-11.2-1.6L224,104V80a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8v24L12.8,89.6a8,8,0,0,0-9.6,12.8L32,124v60a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V124l28.8-21.6A8,8,0,0,0,254.4,91.2Z",
  badkamer:
    "M240,96H216a8,8,0,0,0-8-8H136a8,8,0,0,0-8,8H64V52A12,12,0,0,1,76,40a12.44,12.44,0,0,1,12.16,9.59,8,8,0,0,0,15.68-3.18A28.32,28.32,0,0,0,76,24,28,28,0,0,0,48,52V96H16a8,8,0,0,0-8,8v40a56.06,56.06,0,0,0,56,56v16a8,8,0,0,0,16,0V200h96v16a8,8,0,0,0,16,0V200a56.06,56.06,0,0,0,56-56V104A8,8,0,0,0,240,96Zm-40,8v40H144V104Z",
  tuin:
    "M128,187.85a72.44,72.44,0,0,0,8,4.62V232a8,8,0,0,1-16,0V192.47A72.44,72.44,0,0,0,128,187.85ZM198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.22,72.22,0,0,0,120,192.47V156.94L76.42,135.16a8,8,0,1,1,7.16-14.32L120,139.06V88a8,8,0,0,1,16,0v27.06l36.42-18.22a8,8,0,1,1,7.16,14.32L136,132.94v59.53A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59Z",
  raamdecoratie:
    "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM88,192H56a8,8,0,0,1-8-8V152a8,8,0,0,1,16,0v24H88a8,8,0,0,1,0,16Zm120-88a8,8,0,0,1-16,0V80H168a8,8,0,0,1,0-16h32a8,8,0,0,1,8,8Z",
  elektra:
    "M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z",
  verhuizen:
    "M255.43,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A8.13,8.13,0,0,0,255.43,117ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208ZM32,136V72H176v64Zm160,72a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm0-96V88h34.58l9.6,24Z",
  beveiliging:
    "M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm-34.32,69.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z",
};

function kleurVoor(id) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return { kleur: PALET[hash % PALET.length], hash };
}

// Wat vorm-variatie tussen de badges, deterministisch per vakman.
function vormVoor(hash) {
  const r = hash % 10;
  if (r < 6) return 52; // afgeronde vierkant (meerderheid)
  if (r < 8) return 88; // "squircle"
  return 128; // volledige cirkel
}

function svgLogo(iconPad, id) {
  const { kleur, hash } = kleurVoor(id);
  const rx = vormVoor(hash);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="${rx}" fill="${kleur}"/>
  <svg x="58" y="58" width="140" height="140" viewBox="0 0 256 256">
    <path d="${iconPad}" fill="#FDF8F3"/>
  </svg>
</svg>`;
}

console.log("── Categorieën en demo-vakmensen ophalen ──");
const { data: catRows } = await admin.from("categories").select("id, slug");
const catSlugById = Object.fromEntries((catRows ?? []).map((c) => [c.id, c.slug]));

const { data: alle, error } = await admin
  .from("professional_profiles")
  .select("id, company_name, specialties, logo_url, profile_strength, user_id, profiles:user_id(email)")
  .in("registration_source", ["demo-seed", "demo-seed-bulk", "demo-seed-scenario"]);
if (error) throw new Error(error.message);

const teDoen = (alle ?? []).filter((v) => v.profiles?.email !== "demo.vakman.nieuw@neighbuur.test");
const overgeslagen = (alle ?? []).length - teDoen.length;
console.log(`Demo-vakmensen: ${alle?.length ?? 0} (${overgeslagen} bewust overgeslagen: nieuw/incompleet-scenario)`);

let gelukt = 0;
let mislukt = 0;

for (const v of teDoen) {
  const eersteCategorieSlug = catSlugById[v.specialties?.[0]];
  const iconPad = ICOON_PAD[eersteCategorieSlug] ?? ICOON_PAD.stucwerk;
  const svg = svgLogo(iconPad, v.id);
  const path = `${v.id}/logo.svg`;

  const { error: uploadError } = await admin.storage
    .from("vakman-logos")
    .upload(path, new Blob([svg], { type: "image/svg+xml" }), { contentType: "image/svg+xml", upsert: true });
  if (uploadError) {
    console.error(`  ✗ ${v.company_name}: upload-fout — ${uploadError.message}`);
    mislukt++;
    continue;
  }

  const { data: publicUrlData } = admin.storage.from("vakman-logos").getPublicUrl(path);
  const urlMetCacheBust = `${publicUrlData.publicUrl}?v=2`;
  const nieuweSterkte = Math.min((v.profile_strength ?? 0) + (v.logo_url ? 0 : 20), 100);

  const { error: updateError } = await admin
    .from("professional_profiles")
    .update({ logo_url: urlMetCacheBust, profile_strength: nieuweSterkte })
    .eq("id", v.id);
  if (updateError) {
    console.error(`  ✗ ${v.company_name}: db-update-fout — ${updateError.message}`);
    mislukt++;
    continue;
  }

  gelukt++;
  if (gelukt % 50 === 0) console.log(`  ... ${gelukt} logo's aangemaakt`);
}

console.log(`\n── Klaar ──`);
console.log(`Logo's aangemaakt/vervangen: ${gelukt}`);
console.log(`Mislukt: ${mislukt}`);
console.log(`Bewust overgeslagen (demo.vakman.nieuw): ${overgeslagen}`);

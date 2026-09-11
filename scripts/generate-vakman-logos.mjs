/**
 * Genereert een eenvoudig, abstract logo (kleurvlak + monogram, als SVG) voor
 * elke demo-vakman die nog geen logo_url heeft, en uploadt dat naar de
 * bestaande publieke 'vakman-logos' storage-bucket.
 *
 * Bewust géén bestaande merklogo's gebruikt — dit zijn gegenereerde
 * monogram-badges, dus geen impersonatie-risico.
 *
 * Uitzondering: demo.vakman.nieuw@neighbuur.test blijft bewust zonder logo,
 * want dat account demonstreert juist het "nieuw/incompleet profiel"-scenario
 * (zie scripts/seed-demo-accounts.mjs) — logo ontbreken is daar het punt.
 *
 * Idempotent: slaat vakmensen over die al een logo_url hebben.
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
const STOPWOORDEN = new Set(["van", "de", "der", "den", "ten", "in", "&"]);

function initialen(bedrijfsnaam) {
  const woorden = bedrijfsnaam
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .filter((w) => w.length > 0 && !STOPWOORDEN.has(w.toLowerCase()));
  const bron = woorden.length > 0 ? woorden : bedrijfsnaam.split(/\s+/);
  if (bron.length === 1) {
    // CamelCase merknaam-mashup (bv. "UrbanFix"): pak eerste letter + eerste hoofdletter verderop
    const w = bron[0];
    const tweede = [...w.slice(1)].find((ch) => ch === ch.toUpperCase() && ch !== ch.toLowerCase());
    return (w[0] + (tweede ?? w[1] ?? "")).toUpperCase();
  }
  return (bron[0][0] + bron[1][0]).toUpperCase();
}

function kleurVoor(id) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALET[hash % PALET.length];
}

function svgLogo(bedrijfsnaam, id) {
  const letters = initialen(bedrijfsnaam);
  const kleur = kleurVoor(id);
  const fontSize = letters.length > 2 ? 84 : 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="48" fill="${kleur}"/>
  <text x="128" y="128" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="${fontSize}" fill="#FDF8F3" letter-spacing="2">${letters}</text>
</svg>`;
}

console.log("── Demo-vakmensen zonder logo ophalen ──");
const { data: alle, error } = await admin
  .from("vakman_profielen")
  .select("id, bedrijfsnaam, logo_url, profiel_sterkte, user_id, profielen:user_id(email)")
  .in("registratie_bron", ["demo-seed", "demo-seed-bulk", "demo-seed-scenario"])
  .is("logo_url", null);
if (error) throw new Error(error.message);

const teDoen = (alle ?? []).filter((v) => v.profielen?.email !== "demo.vakman.nieuw@neighbuur.test");
const overgeslagen = (alle ?? []).length - teDoen.length;
console.log(`Gevonden zonder logo: ${alle?.length ?? 0} (${overgeslagen} bewust overgeslagen: nieuw/incompleet-scenario)`);

let gelukt = 0;
let mislukt = 0;

for (const v of teDoen) {
  const svg = svgLogo(v.bedrijfsnaam, v.id);
  const path = `${v.id}/logo.svg`;

  const { error: uploadError } = await admin.storage
    .from("vakman-logos")
    .upload(path, new Blob([svg], { type: "image/svg+xml" }), { contentType: "image/svg+xml", upsert: true });
  if (uploadError) {
    console.error(`  ✗ ${v.bedrijfsnaam}: upload-fout — ${uploadError.message}`);
    mislukt++;
    continue;
  }

  const { data: publicUrlData } = admin.storage.from("vakman-logos").getPublicUrl(path);
  const nieuweSterkte = Math.min((v.profiel_sterkte ?? 0) + 20, 100);

  const { error: updateError } = await admin
    .from("vakman_profielen")
    .update({ logo_url: publicUrlData.publicUrl, profiel_sterkte: nieuweSterkte })
    .eq("id", v.id);
  if (updateError) {
    console.error(`  ✗ ${v.bedrijfsnaam}: db-update-fout — ${updateError.message}`);
    mislukt++;
    continue;
  }

  gelukt++;
  if (gelukt % 50 === 0) console.log(`  ... ${gelukt} logo's aangemaakt`);
}

console.log(`\n── Klaar ──`);
console.log(`Logo's aangemaakt: ${gelukt}`);
console.log(`Mislukt: ${mislukt}`);
console.log(`Bewust overgeslagen (demo.vakman.nieuw): ${overgeslagen}`);

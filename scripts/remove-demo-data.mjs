/**
 * Verwijdert alle data die door scripts/seed-demo-data.mjs is aangemaakt.
 * Laat de bestaande test-accounts (test-vakman@/test-bewoner@neighbuur.test)
 * en hun eigen boekingen/reviews met rust — verwijdert alleen de nieuw
 * toegevoegde demo-vakmensen, demo-buren, en hun boekingen/reviews/deelname.
 *
 * Gebruik: node scripts/remove-demo-data.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

console.log("── Demo-vakmensen zoeken (registratie_bron = 'demo-seed') ──");
const { data: vakmen } = await admin.from("vakman_profielen").select("id, user_id, bedrijfsnaam").eq("registratie_bron", "demo-seed");
console.log(`Gevonden: ${vakmen?.length ?? 0}`);

console.log("── Demo-buren zoeken (e-mail op @neighbuur.test, naam start met 'Demo ') ──");
const { data: buren } = await admin.from("profielen").select("id, naam, email").ilike("naam", "Demo %");
console.log(`Gevonden: ${buren?.length ?? 0}`);

const vakmanUserIds = (vakmen ?? []).map((v) => v.user_id);
const buurUserIds = (buren ?? []).map((b) => b.id);
const alleDemoUserIds = [...vakmanUserIds, ...buurUserIds];

if (alleDemoUserIds.length === 0) {
  console.log("Niets te verwijderen.");
  process.exit(0);
}

console.log("\n── Reviews van/over demo-accounts verwijderen ──");
const { data: vakmanIds } = await admin.from("vakman_profielen").select("id").eq("registratie_bron", "demo-seed");
const vIds = (vakmanIds ?? []).map((v) => v.id);
if (vIds.length) await admin.from("reviews").delete().in("vakman_id", vIds);
if (buurUserIds.length) await admin.from("reviews").delete().in("auteur_id", buurUserIds);

console.log("── Boekingen met demo-vakmensen verwijderen ──");
if (vIds.length) await admin.from("boekingen").delete().in("vakman_id", vIds);

console.log("── Groepskorting-deelname van demo-buren verwijderen ──");
if (buurUserIds.length) await admin.from("groepskorting_deelnemers").delete().in("user_id", buurUserIds);

console.log("── Community-lidmaatschap van demo-buren verwijderen ──");
if (buurUserIds.length) await admin.from("community_leden").delete().in("user_id", buurUserIds);

console.log("── Vakman- en bewonerprofielen verwijderen ──");
if (vIds.length) await admin.from("vakman_profielen").delete().in("id", vIds);
if (buurUserIds.length) await admin.from("bewoner_profielen").delete().in("user_id", buurUserIds);

console.log("── Profielen + auth-accounts verwijderen ──");
for (const userId of alleDemoUserIds) {
  await admin.from("profielen").delete().eq("id", userId);
  await admin.auth.admin.deleteUser(userId).catch(() => {});
}

console.log(`\nKlaar. ${alleDemoUserIds.length} demo-accounts en hun data verwijderd.`);
console.log("Let op: de handmatig toegevoegde 'Hoveniers- & Schuttingdeal' en de opschoning van");
console.log("bestaande test-bewoner boekingen (omschrijving-teksten) blijven staan — die horen bij");
console.log("de community zelf, niet bij een specifiek demo-account.");

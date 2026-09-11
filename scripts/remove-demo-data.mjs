/**
 * Verwijdert alle data die door de seed-scripts is aangemaakt:
 * - scripts/seed-demo-data.mjs       (registratie_bron 'demo-seed', "Demo *"-buren)
 * - scripts/seed-companies.mjs       (registratie_bron 'demo-seed-bulk', 350 vakbedrijven)
 * - scripts/seed-demo-accounts.mjs   (registratie_bron 'demo-seed-scenario', demo.bewoner.xxx en demo.vakman.xxx accounts)
 *
 * Laat de bestaande test-accounts (test-vakman@/test-bewoner@neighbuur.test)
 * en hun eigen boekingen/reviews met rust.
 *
 * Gebruik: node scripts/remove-demo-data.mjs
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

const DEMO_VAKMAN_BRONNEN = ["demo-seed", "demo-seed-bulk", "demo-seed-scenario"];

console.log(`── Demo-vakmensen zoeken (registratie_bron in ${JSON.stringify(DEMO_VAKMAN_BRONNEN)}) ──`);
const { data: vakmen } = await admin
  .from("vakman_profielen")
  .select("id, user_id, bedrijfsnaam")
  .in("registratie_bron", DEMO_VAKMAN_BRONNEN);
const vIds = (vakmen ?? []).map((v) => v.id);
const vakmanUserIds = (vakmen ?? []).map((v) => v.user_id);
console.log(`Gevonden: ${vakmen?.length ?? 0}`);

console.log("── Demo-bewoners zoeken (naam 'Demo …' of demo.bewoner.*/demo-buur-*@neighbuur.test) ──");
const { data: burenA } = await admin.from("profielen").select("id, naam, email").ilike("naam", "Demo %");
const { data: burenB } = await admin.from("profielen").select("id, naam, email").ilike("email", "demo.bewoner.%@neighbuur.test");
const { data: burenC } = await admin.from("profielen").select("id, naam, email").ilike("email", "demo-buur-%@neighbuur.test");
const buurUserIds = [...new Set([...(burenA ?? []), ...(burenB ?? []), ...(burenC ?? [])].map((b) => b.id))];
console.log(`Gevonden: ${buurUserIds.length}`);

const alleDemoUserIds = [...new Set([...vakmanUserIds, ...buurUserIds])];

if (alleDemoUserIds.length === 0) {
  console.log("Niets te verwijderen.");
  process.exit(0);
}

console.log("\n── Review-stemmen en -reacties opruimen ──");
if (alleDemoUserIds.length) await admin.from("review_votes").delete().in("user_id", alleDemoUserIds);
if (vIds.length) await admin.from("review_reacties").delete().in("vakman_id", vIds);

console.log("── Reviews van/over demo-accounts verwijderen ──");
if (vIds.length) await admin.from("reviews").delete().in("vakman_id", vIds);
if (alleDemoUserIds.length) await admin.from("reviews").delete().in("auteur_id", alleDemoUserIds);

console.log("── Gesprekken (en cascaderende berichten/deelnemers) van demo-accounts verwijderen ──");
const { data: deelnames } = await admin.from("gesprek_deelnemers").select("gesprek_id").in("user_id", alleDemoUserIds);
const gesprekIds = [...new Set((deelnames ?? []).map((d) => d.gesprek_id))];
if (gesprekIds.length) await admin.from("gesprekken").delete().in("id", gesprekIds);

console.log("── Notificaties van demo-accounts verwijderen ──");
if (alleDemoUserIds.length) await admin.from("notificaties").delete().in("user_id", alleDemoUserIds);

console.log("── Beschikbaarheid en werk-foto's van demo-vakmensen verwijderen ──");
if (vIds.length) await admin.from("beschikbaarheid").delete().in("vakman_id", vIds);
if (vIds.length) await admin.from("werk_fotos").delete().in("vakman_id", vIds);

console.log("── Boekingen met demo-vakmensen of demo-bewoners verwijderen ──");
if (vIds.length) await admin.from("boekingen").delete().in("vakman_id", vIds);
if (buurUserIds.length) await admin.from("boekingen").delete().in("klant_id", buurUserIds);

console.log("── Groepskorting-deelname van demo-bewoners verwijderen ──");
if (alleDemoUserIds.length) await admin.from("groepskorting_deelnemers").delete().in("user_id", alleDemoUserIds);

console.log("── Uitnodigingen van demo-accounts verwijderen ──");
if (alleDemoUserIds.length) await admin.from("uitnodigingen").delete().in("uitnodiger_id", alleDemoUserIds);

console.log("── Community-lidmaatschap van demo-bewoners verwijderen ──");
if (buurUserIds.length) await admin.from("community_leden").delete().in("user_id", buurUserIds);

console.log("── Vakman- en bewonerprofielen verwijderen ──");
if (vIds.length) await admin.from("vakman_profielen").delete().in("id", vIds);
if (buurUserIds.length) await admin.from("bewoner_profielen").delete().in("user_id", buurUserIds);

console.log("── Profielen + auth-accounts verwijderen ──");
let verwijderd = 0;
for (const userId of alleDemoUserIds) {
  await admin.from("profielen").delete().eq("id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId).catch((e) => ({ error: e }));
  if (!error) verwijderd++;
}

console.log(`\nKlaar. ${alleDemoUserIds.length} demo-accounts en hun data verwijderd (${verwijderd} auth-accounts).`);
console.log("Let op: de handmatig toegevoegde 'Hoveniers- & Schuttingdeal' en de opschoning van");
console.log("bestaande test-bewoner boekingen (omschrijving-teksten) blijven staan — die horen bij");
console.log("de community zelf, niet bij een specifiek demo-account.");

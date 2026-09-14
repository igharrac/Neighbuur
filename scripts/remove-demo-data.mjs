/**
 * Verwijdert alle data die door de seed-scripts is aangemaakt:
 * - scripts/seed-demo-data.mjs       (registration_source 'demo-seed', "Demo *"-buren)
 * - scripts/seed-companies.mjs       (registration_source 'demo-seed-bulk', 350 vakbedrijven)
 * - scripts/seed-demo-accounts.mjs   (registration_source 'demo-seed-scenario', demo.bewoner.xxx en demo.vakman.xxx accounts)
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

console.log(`── Demo-vakmensen zoeken (registration_source in ${JSON.stringify(DEMO_VAKMAN_BRONNEN)}) ──`);
const { data: vakmen } = await admin
  .from("professional_profiles")
  .select("id, user_id, company_name")
  .in("registration_source", DEMO_VAKMAN_BRONNEN);
const vIds = (vakmen ?? []).map((v) => v.id);
const vakmanUserIds = (vakmen ?? []).map((v) => v.user_id);
console.log(`Gevonden: ${vakmen?.length ?? 0}`);

console.log("── Demo-bewoners zoeken (naam 'Demo …' of demo.bewoner.*/demo-buur-*@neighbuur.test) ──");
const { data: burenA } = await admin.from("profiles").select("id, name, email").ilike("name", "Demo %");
const { data: burenB } = await admin.from("profiles").select("id, name, email").ilike("email", "demo.bewoner.%@neighbuur.test");
const { data: burenC } = await admin.from("profiles").select("id, name, email").ilike("email", "demo-buur-%@neighbuur.test");
const buurUserIds = [...new Set([...(burenA ?? []), ...(burenB ?? []), ...(burenC ?? [])].map((b) => b.id))];
console.log(`Gevonden: ${buurUserIds.length}`);

const alleDemoUserIds = [...new Set([...vakmanUserIds, ...buurUserIds])];

if (alleDemoUserIds.length === 0) {
  console.log("Niets te verwijderen.");
  process.exit(0);
}

console.log("── Gegenereerde logo's uit storage verwijderen ──");
let logosVerwijderd = 0;
for (const vId of vIds) {
  const { data: files } = await admin.storage.from("vakman-logos").list(vId);
  if (files?.length) {
    await admin.storage.from("vakman-logos").remove(files.map((f) => `${vId}/${f.name}`));
    logosVerwijderd += files.length;
  }
}
console.log(`Verwijderd: ${logosVerwijderd} bestand(en)`);

console.log("\n── Review-stemmen en -reacties opruimen ──");
if (alleDemoUserIds.length) await admin.from("review_votes").delete().in("user_id", alleDemoUserIds);
if (vIds.length) await admin.from("review_replies").delete().in("professional_id", vIds);

console.log("── Reviews van/over demo-accounts verwijderen ──");
if (vIds.length) await admin.from("reviews").delete().in("professional_id", vIds);
if (alleDemoUserIds.length) await admin.from("reviews").delete().in("author_id", alleDemoUserIds);

console.log("── Gesprekken (en cascaderende berichten/deelnemers) van demo-accounts verwijderen ──");
const { data: deelnames } = await admin.from("conversation_participants").select("conversation_id").in("user_id", alleDemoUserIds);
const gesprekIds = [...new Set((deelnames ?? []).map((d) => d.conversation_id))];
if (gesprekIds.length) await admin.from("conversations").delete().in("id", gesprekIds);

console.log("── Notificaties van demo-accounts verwijderen ──");
if (alleDemoUserIds.length) await admin.from("notifications").delete().in("user_id", alleDemoUserIds);

console.log("── Beschikbaarheid en werk-foto's van demo-vakmensen verwijderen ──");
if (vIds.length) await admin.from("availability").delete().in("professional_id", vIds);
if (vIds.length) await admin.from("work_photos").delete().in("professional_id", vIds);

console.log("── Boekingen met demo-vakmensen of demo-bewoners verwijderen ──");
if (vIds.length) await admin.from("bookings").delete().in("professional_id", vIds);
if (buurUserIds.length) await admin.from("bookings").delete().in("customer_id", buurUserIds);

console.log("── Groepskorting-deelname van demo-bewoners verwijderen ──");
if (alleDemoUserIds.length) await admin.from("group_discount_participants").delete().in("user_id", alleDemoUserIds);

console.log("── Uitnodigingen van demo-accounts verwijderen ──");
if (alleDemoUserIds.length) await admin.from("invitations").delete().in("inviter_id", alleDemoUserIds);

console.log("── Woning-historie van demo-bewoners verwijderen ──");
if (buurUserIds.length) await admin.from("resident_residence_history").delete().in("user_id", buurUserIds);

console.log("── Community-lidmaatschap van demo-bewoners verwijderen ──");
if (buurUserIds.length) await admin.from("community_members").delete().in("user_id", buurUserIds);

console.log("── Vakman- en bewonerprofielen verwijderen ──");
if (vIds.length) await admin.from("professional_profiles").delete().in("id", vIds);
if (buurUserIds.length) await admin.from("resident_profiles").delete().in("user_id", buurUserIds);

console.log("── Fictieve adres-scenario's van scripts/seed-demo-addresses.mjs opruimen ──");
// Herkenbaar aan de eigen prefixes die dat script gebruikt: bag-id's
// beginnend met '9999' (nooit een echt BAG-pand-id) en cluster_key's
// beginnend met 'demo:'.
const { data: demoAddresses } = await admin.from("addresses").select("id").like("bag_nummeraanduiding_id", "9999%");
const demoAddressIds = (demoAddresses ?? []).map((a) => a.id);
const { data: demoClusters } = await admin.from("residential_clusters").select("id").like("cluster_key", "demo:%");
const demoClusterIds = (demoClusters ?? []).map((c) => c.id);

if (demoClusterIds.length) await admin.from("communities").delete().in("residential_cluster_id", demoClusterIds);
if (demoAddressIds.length) await admin.from("residences").delete().in("address_id", demoAddressIds);
if (demoClusterIds.length) await admin.from("residences").delete().in("residential_cluster_id", demoClusterIds);
if (demoClusterIds.length) await admin.from("residential_clusters").delete().in("id", demoClusterIds);
if (demoAddressIds.length) await admin.from("addresses").delete().in("id", demoAddressIds);

const { data: demoDevelopment } = await admin.from("developments").select("id").eq("slug", "de-nieuwe-kern").maybeSingle();
if (demoDevelopment) {
  await admin.from("development_phases").delete().eq("development_id", demoDevelopment.id);
  await admin.from("developments").delete().eq("id", demoDevelopment.id);
}
console.log(`Verwijderd: ${demoAddressIds.length} adressen, ${demoClusterIds.length} clusters, evt. 'De Nieuwe Kern'-fixture.`);

console.log("── Profielen + auth-accounts verwijderen ──");
let verwijderd = 0;
for (const userId of alleDemoUserIds) {
  await admin.from("profiles").delete().eq("id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId).catch((e) => ({ error: e }));
  if (!error) verwijderd++;
}

console.log(`\nKlaar. ${alleDemoUserIds.length} demo-accounts en hun data verwijderd (${verwijderd} auth-accounts).`);
console.log("Let op: de handmatig toegevoegde 'Hoveniers- & Schuttingdeal' en de opschoning van");
console.log("bestaande test-bewoner boekingen (omschrijving-teksten) blijven staan — die horen bij");
console.log("de community zelf, niet bij een specifiek demo-account.");

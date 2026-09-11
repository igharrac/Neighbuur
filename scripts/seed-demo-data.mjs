/**
 * Vult de database met representatieve demo-data (geen lorem ipsum) zodat het
 * platform als "levend" te bekijken is: vakmensen over alle categorieën,
 * boekingen in elke status, buurtreviews, een groepskorting en een paar
 * buren in de bestaande testcommunity "Vathorst Blok C".
 *
 * Idempotent: opnieuw draaien maakt niets dubbel (matcht op e-mail/bedrijfsnaam).
 *
 * Verwijderen: alle demo-vakmensen staan met registratie_bron = 'demo-seed',
 * alle demo-bewoners met e-mailadres eindigend op '@neighbuur.test' en naam
 * beginnend met 'Demo '. Zie scripts/remove-demo-data.mjs.
 *
 * Gebruik: node scripts/seed-demo-data.mjs
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

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUser(email, naam, rol) {
  const { data: existing } = await admin.from("profielen").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: "DemoSeed123!",
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);

  const userId = created.user.id;
  const { error: profielError } = await admin.from("profielen").insert({ id: userId, naam, email, rol });
  if (profielError) throw new Error(`profielen insert (${email}): ${profielError.message}`);
  return userId;
}

async function ensureVakman({ email, naam, bedrijfsnaam, categorieSlug, bio, postcode, km, verzekerd = true }) {
  const { data: cat } = await admin.from("categorieen").select("id").eq("slug", categorieSlug).maybeSingle();
  if (!cat) throw new Error(`categorie ${categorieSlug} niet gevonden`);

  const userId = await ensureUser(email, naam, "vakman");

  const { data: existing } = await admin.from("vakman_profielen").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return { id: existing.id, userId, categorieId: cat.id };

  const slug = slugify(bedrijfsnaam);
  const { data: vakman, error } = await admin
    .from("vakman_profielen")
    .insert({
      user_id: userId,
      bedrijfsnaam,
      slug,
      kvk_nummer: "69" + Math.floor(1000000 + Math.random() * 8999999),
      kvk_geverifieerd: true,
      bio,
      specialismes: [cat.id],
      contact_voorkeur: "app",
      werkgebied_postcode: postcode,
      werkgebied_km: km,
      verzekerd,
      geverifieerd: true,
      registratie_bron: "demo-seed",
      profiel_sterkte: 85,
    })
    .select("id")
    .single();
  if (error) throw new Error(`vakman_profielen insert (${bedrijfsnaam}): ${error.message}`);
  return { id: vakman.id, userId, categorieId: cat.id };
}

console.log("── Community & wijk ophalen ──");
const { data: community } = await admin.from("communities").select("id, naam, slug").eq("slug", "vathorst-blok-c").maybeSingle();
const { data: wijk } = await admin.from("wijken").select("id, naam, slug").eq("slug", "vathorst").maybeSingle();
if (!community || !wijk) throw new Error("Community/wijk 'vathorst-blok-c' niet gevonden — draai dit script na de bestaande testdata-setup.");
console.log(`Community: ${community.naam} (${community.slug}) — wijk ${wijk.naam}`);

console.log("\n── Vakmensen aanmaken (over alle categorieën) ──");
const VAKMEN = [
  { email: "demo-vakman-schilderen@neighbuur.test", naam: "Willem van Dijk", bedrijfsnaam: "Van Dijk Schilderwerken", categorieSlug: "schilderen", bio: "Specialist in binnen- en buitenschilderwerk voor nieuwbouw. Strak, stofvrij en op tijd.", postcode: "3823", km: 20 },
  { email: "demo-vakman-vloeren@neighbuur.test", naam: "Peter Hoekstra", bedrijfsnaam: "VloerDirect Amersfoort", categorieSlug: "vloeren", bio: "PVC, laminaat en gietvloeren. Gratis inmeten tijdens de voorschouw.", postcode: "3821", km: 25 },
  { email: "demo-vakman-keuken@neighbuur.test", naam: "Sander Mulder", bedrijfsnaam: "Keukenmontage Midden-NL", categorieSlug: "keuken", bio: "Montage van alle grote keukenmerken, inclusief leidingwerk en inbouwapparatuur.", postcode: "3811", km: 30 },
  { email: "demo-vakman-badkamer@neighbuur.test", naam: "Rick Bakker", bedrijfsnaam: "SaniPlan Badkamers", categorieSlug: "badkamer", bio: "Complete badkamerinstallatie: tegelwerk, sanitair en leidingwerk in één hand.", postcode: "3823", km: 20 },
  { email: "demo-vakman-tuin@neighbuur.test", naam: "Tom Jansen", bedrijfsnaam: "GroenRijk Hoveniers", categorieSlug: "tuin", bio: "Tuinaanleg, bestrating en schuttingen voor nieuwbouwtuinen — ook collectief per straat.", postcode: "3821", km: 25 },
  { email: "demo-vakman-elektra@neighbuur.test", naam: "Erik de Vries", bedrijfsnaam: "De Vries Elektrotechniek", categorieSlug: "elektra", bio: "Meterkastuitbreiding, laadpalen en smart-home aansluitingen volgens NEN 1010.", postcode: "3823", km: 15 },
  { email: "demo-vakman-verhuizen@neighbuur.test", naam: "Jasper Smit", bedrijfsnaam: "Snel & Netjes Verhuisservice", categorieSlug: "verhuizen", bio: "Verhuizingen, verhuisliften en tijdelijke opslag voor de hele regio.", postcode: "3800", km: 40 },
  { email: "demo-vakman-beveiliging@neighbuur.test", naam: "Mark de Boer", bedrijfsnaam: "SecuHome Installaties", categorieSlug: "beveiliging", bio: "Gelijksluitende cilinders, alarmsystemen en camerabewaking voor nieuwbouwwoningen.", postcode: "3821", km: 20 },
  { email: "demo-vakman-raamdecoratie@neighbuur.test", naam: "Linda Visser", bedrijfsnaam: "Raamstijl Interieur", categorieSlug: "raamdecoratie", bio: "Inmeten en monteren van gordijnen, shutters en jaloezieën op maat.", postcode: "3823", km: 20 },
];

const vakmenById = {};
for (const v of VAKMEN) {
  const result = await ensureVakman(v);
  vakmenById[v.categorieSlug] = result;
  console.log(`  ✓ ${v.bedrijfsnaam} (${v.categorieSlug})`);
}

const { data: topstuc } = await admin.from("vakman_profielen").select("id, user_id").eq("slug", "topstuc-afbouw").maybeSingle();
if (topstuc) vakmenById["stucwerk"] = { id: topstuc.id, userId: topstuc.user_id };

console.log("\n── Demo-buren aanmaken (naast de bestaande test-bewoner) ──");
const BUREN = [
  { email: "demo-buur-1@neighbuur.test", naam: "Demo Jeroen K." },
  { email: "demo-buur-2@neighbuur.test", naam: "Demo Sanne R." },
  { email: "demo-buur-3@neighbuur.test", naam: "Demo Adam de Groot" },
];
const burenIds = [];
for (const b of BUREN) {
  const userId = await ensureUser(b.email, b.naam, "bewoner");
  const { data: bp } = await admin.from("bewoner_profielen").select("id").eq("user_id", userId).maybeSingle();
  if (!bp) {
    await admin.from("bewoner_profielen").insert({ user_id: userId, community_id: community.id, wijk_id: wijk.id });
  }
  const { data: lid } = await admin.from("community_leden").select("user_id").eq("community_id", community.id).eq("user_id", userId).maybeSingle();
  if (!lid) {
    await admin.from("community_leden").insert({ community_id: community.id, user_id: userId, rol: "lid" });
  }
  burenIds.push(userId);
  console.log(`  ✓ ${b.naam}`);
}

const { data: testBewoner } = await admin.from("profielen").select("id, naam").eq("email", "test-bewoner@neighbuur.test").maybeSingle();
if (testBewoner) {
  const { data: lid } = await admin.from("community_leden").select("user_id").eq("community_id", community.id).eq("user_id", testBewoner.id).maybeSingle();
  if (!lid) {
    await admin.from("community_leden").insert({ community_id: community.id, user_id: testBewoner.id, rol: "lid" });
    console.log(`  ✓ ${testBewoner.naam} toegevoegd als lid van Blok C (ontbrak nog)`);
  }
}

console.log("\n── Boekingen opschonen + aanvullen (test-bewoner) ──");
await admin.from("boekingen").delete().ilike("omschrijving", "%Playwright%");
await admin
  .from("boekingen")
  .update({ omschrijving: "Offerte tuinaanleg opgevraagd, uiteindelijk zelf geregeld met de buren." })
  .eq("klant_id", testBewoner.id)
  .eq("status", "geannuleerd")
  .ilike("omschrijving", "%afwijzen-flow%");

const inTweeWeken = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const inVierWeken = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const NIEUWE_BOEKINGEN = [
  { vakman: "elektra", omschrijving: "Meterkastuitbreiding + laadpaal op de oprit.", datum: inTweeWeken, status: "bevestigd" },
  { vakman: "schilderen", omschrijving: "Kozijnen en plafonds binnenzijde sausklaar maken.", datum: inVierWeken, status: "bevestigd" },
  { vakman: "vloeren", omschrijving: "PVC visgraat in woonkamer en hal, ca. 45m².", datum: null, status: "aangevraagd" },
];

for (const b of NIEUWE_BOEKINGEN) {
  const vakman = vakmenById[b.vakman];
  if (!vakman) continue;
  const { data: existing } = await admin
    .from("boekingen")
    .select("id")
    .eq("klant_id", testBewoner.id)
    .eq("vakman_id", vakman.id)
    .eq("omschrijving", b.omschrijving)
    .maybeSingle();
  if (existing) continue;
  await admin.from("boekingen").insert({
    klant_id: testBewoner.id,
    vakman_id: vakman.id,
    community_id: community.id,
    omschrijving: b.omschrijving,
    datum: b.datum,
    status: b.status,
  });
  console.log(`  ✓ ${b.status}: ${b.omschrijving}`);
}

console.log("\n── Reviews toevoegen ──");
const { data: afgerondeBoeking } = await admin
  .from("boekingen")
  .select("id, vakman_id")
  .eq("klant_id", testBewoner.id)
  .eq("status", "afgerond")
  .maybeSingle();

const REVIEWS = [
  {
    auteurId: testBewoner.id,
    vakmanId: afgerondeBoeking?.vakman_id ?? vakmenById["stucwerk"]?.id,
    boekingId: afgerondeBoeking?.id ?? null,
    tekst: "TopStuc heeft ons hele huis gespackspoten in 2 dagen. Netjes afgewerkt, stofvrij opgeleverd en precies op tijd.",
    scores: { kwaliteit: 5, stiptheid: 5, communicatie: 5, prijs: 4 },
  },
  {
    auteurId: burenIds[0],
    vakmanId: vakmenById["elektra"]?.id,
    boekingId: null,
    tekst: "Meterkast en laadpaal in één dag geregeld, duidelijke uitleg vooraf over de kosten.",
    scores: { kwaliteit: 5, stiptheid: 4, communicatie: 5, prijs: 4 },
  },
  {
    auteurId: burenIds[1],
    vakmanId: vakmenById["schilderen"]?.id,
    boekingId: null,
    tekst: "Strak schilderwerk, precies de kleuren die we wilden. Wel iets later gestart dan gepland.",
    scores: { kwaliteit: 5, stiptheid: 3, communicatie: 4, prijs: 4 },
  },
  {
    auteurId: burenIds[2],
    vakmanId: vakmenById["tuin"]?.id,
    boekingId: null,
    tekst: "Mooie schutting en bestrating, en dankzij de buurtdeal een stuk voordeliger dan losse offertes.",
    scores: { kwaliteit: 5, stiptheid: 5, communicatie: 4, prijs: 5 },
  },
];

for (const r of REVIEWS) {
  if (!r.vakmanId) continue;
  const { data: existing } = await admin.from("reviews").select("id").eq("auteur_id", r.auteurId).eq("vakman_id", r.vakmanId).maybeSingle();
  if (existing) continue;
  await admin.from("reviews").insert({
    auteur_id: r.auteurId,
    vakman_id: r.vakmanId,
    boeking_id: r.boekingId,
    community_id: community.id,
    tekst: r.tekst,
    scores: r.scores,
  });
  console.log(`  ✓ review voor vakman ${r.vakmanId}`);
}

console.log("\n── Groepskorting toevoegen ──");
const { data: bestaandeDeal } = await admin.from("groepskortingen").select("id").eq("community_id", community.id).maybeSingle();
let dealId = bestaandeDeal?.id;
if (!bestaandeDeal) {
  const { data: deal } = await admin
    .from("groepskortingen")
    .insert({
      community_id: community.id,
      categorie_id: vakmenById["tuin"]?.categorieId,
      titel_nl: "Hoveniers- & Schuttingdeal",
      titel_en: "Landscaping & Fencing deal",
      beschrijving_nl: "Gezamenlijk tuinaanleg en schuttingen laten plaatsen voor Blok C. Hoe meer buren, hoe hoger de korting.",
      beschrijving_en: "Have your garden and fencing installed together for Block C. The more neighbours join, the bigger the discount.",
      min_deelnemers: 10,
      prijs_normaal: 250000,
      prijs_groep: 195000,
      actief: true,
    })
    .select("id")
    .single();
  dealId = deal.id;
  console.log("  ✓ Hoveniers- & Schuttingdeal aangemaakt");
}

const deelnemerIds = [testBewoner.id, ...burenIds];
for (const userId of deelnemerIds) {
  const { data: existing } = await admin.from("groepskorting_deelnemers").select("id").eq("groepskorting_id", dealId).eq("user_id", userId).maybeSingle();
  if (!existing) {
    await admin.from("groepskorting_deelnemers").insert({ groepskorting_id: dealId, user_id: userId });
  }
}
console.log(`  ✓ ${deelnemerIds.length} deelnemers aangemeld`);

console.log("\nKlaar. Log in als test-bewoner@neighbuur.test (TestBewoner123!) om het resultaat te zien.");

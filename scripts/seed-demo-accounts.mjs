/**
 * Maakt 14 vaste demo-loginaccounts aan via de normale auth-flow, elk met
 * een duidelijk ander scenario, zodat je met een vast wachtwoord kunt
 * inloggen en direct verschillende UI-/businessstates ziet.
 *
 * 6 bewoners (demo.bewoner.*@neighbuur.test) + 8 vakbedrijven
 * (demo.vakman.*@neighbuur.test). Wachtwoord voor alle accounts:
 * process.env.DEMO_USER_PASSWORD (zie .env.local) — nooit in code of git.
 *
 * Draai dit NA scripts/seed-demo-data.mjs (hergebruikt test-bewoner en de
 * "Demo buur"-accounts van dat script voor kruisverwijzingen als klant bij
 * een paar van de vakman-scenario's, en de community/development-fixture)
 * en bij voorkeur ook na scripts/seed-companies.mjs. Alles is idempotent.
 *
 * Bekende schema-beperking: bookings.professional_id is NOT NULL, dus een
 * "geen passende vakman gevonden"-aanvraag kan niet zonder professional_id
 * bestaan. Scenario 6 (demo.bewoner.nomatch) simuleert dit daarom als een
 * geannuleerde boeking met een uitleg-tekst, niet als een boeking zonder
 * vakman — zie de toelichting onderaan het script.
 *
 * Draai hierna optioneel scripts/generate-vakman-logos.mjs voor logo's.
 * Verwijderen: scripts/remove-demo-data.mjs
 * Gebruik: node scripts/seed-demo-accounts.mjs
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

if (!env.DEMO_USER_PASSWORD) {
  throw new Error("DEMO_USER_PASSWORD ontbreekt in .env.local");
}

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
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: env.DEMO_USER_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);
  const userId = created.user.id;
  const { error: profielError } = await admin.from("profiles").insert({ id: userId, name: naam, email, role: rol });
  if (profielError) throw new Error(`profiles insert (${email}): ${profielError.message}`);
  return userId;
}

async function ensureBewoner(email, naam) {
  const userId = await ensureUser(email, naam, "resident");
  const { data: bp } = await admin.from("resident_profiles").select("id").eq("user_id", userId).maybeSingle();
  if (!bp) {
    await admin.from("resident_profiles").insert({ user_id: userId, community_id: community.id, development_id: development.id });
  }
  const { data: lid } = await admin
    .from("community_members")
    .select("user_id")
    .eq("community_id", community.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!lid) {
    await admin.from("community_members").insert({ community_id: community.id, user_id: userId, role: "member" });
  }
  return userId;
}

async function ensureVakman({ email, naam, bedrijfsnaam, categorieSlugs, bio, postcode, km = 20, verzekerd, kvkGeverifieerd, profielSterkte }) {
  const cats = categorieSlugs.map((s) => catIdBySlug[s]).filter(Boolean);
  if (cats.length === 0) throw new Error(`geen categorieën gevonden voor ${bedrijfsnaam} (${categorieSlugs})`);

  const userId = await ensureUser(email, naam, "professional");
  const { data: existing } = await admin.from("professional_profiles").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return { id: existing.id, userId, categorieId: cats[0] };

  let slug = slugify(bedrijfsnaam);
  let poging = 1;
  while (true) {
    const { data: botsing } = await admin.from("professional_profiles").select("id").eq("slug", slug).maybeSingle();
    if (!botsing) break;
    poging++;
    slug = `${slugify(bedrijfsnaam)}-${poging}`;
  }

  const { data: vakman, error } = await admin
    .from("professional_profiles")
    .insert({
      user_id: userId,
      company_name: bedrijfsnaam,
      slug,
      kvk_number: kvkGeverifieerd ? "69" + Math.floor(1000000 + Math.random() * 8999999) : null,
      kvk_verified: kvkGeverifieerd,
      bio,
      specialties: cats,
      contact_preference: "app",
      service_area_postcode: postcode,
      service_area_km: km,
      insured: verzekerd,
      verified: kvkGeverifieerd && verzekerd,
      registration_source: "demo-seed-scenario",
      profile_strength: profielSterkte,
    })
    .select("id")
    .single();
  if (error) throw new Error(`professional_profiles insert (${bedrijfsnaam}): ${error.message}`);
  return { id: vakman.id, userId, categorieId: cats[0] };
}

async function ensureBoeking({ klantId, vakmanId, categorieId, omschrijving, datum, status }) {
  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("customer_id", klantId)
    .eq("professional_id", vakmanId)
    .eq("description", omschrijving)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("bookings")
    .insert({
      customer_id: klantId,
      professional_id: vakmanId,
      category_id: categorieId,
      community_id: community.id,
      description: omschrijving,
      date: datum,
      status,
    })
    .select("id")
    .single();
  if (error) throw new Error(`booking insert (${omschrijving}): ${error.message}`);
  return data.id;
}

async function ensureReview({ auteurId, vakmanId, boekingId, tekst, scores }) {
  const { data: existing } = await admin.from("reviews").select("id").eq("author_id", auteurId).eq("professional_id", vakmanId).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("reviews")
    .insert({ author_id: auteurId, professional_id: vakmanId, booking_id: boekingId, community_id: community.id, text: tekst, scores })
    .select("id")
    .single();
  if (error) throw new Error(`review insert: ${error.message}`);
  return data.id;
}

async function ensureGesprekMetBerichten({ boekingId, klantId, vakmanUserId, berichten }) {
  const { data: bestaand } = await admin.from("conversations").select("id").eq("booking_id", boekingId).maybeSingle();
  if (bestaand) return bestaand.id;
  const { data: gesprek, error } = await admin.from("conversations").insert({ booking_id: boekingId }).select("id").single();
  if (error) throw new Error(`conversation insert: ${error.message}`);
  await admin.from("conversation_participants").insert([
    { conversation_id: gesprek.id, user_id: klantId },
    { conversation_id: gesprek.id, user_id: vakmanUserId },
  ]);
  for (const b of berichten) {
    await admin.from("messages").insert({
      conversation_id: gesprek.id,
      sender_id: b.van === "klant" ? klantId : vakmanUserId,
      text: b.tekst,
      read_at: b.gelezen === false ? null : new Date().toISOString(),
    });
  }
  return gesprek.id;
}

// ── Development, community en categorieën ophalen ──
console.log("── Development, community en categorieën ophalen ──");
const { data: development } = await admin.from("developments").select("id, name, slug").eq("slug", "vathorst").maybeSingle();
const { data: community } = await admin.from("communities").select("id, name, slug").eq("slug", "vathorst-blok-c").maybeSingle();
if (!community || !development) throw new Error("Community/development 'vathorst-blok-c' niet gevonden — draai eerst scripts/seed-demo-data.mjs.");

const { data: catRows } = await admin.from("categories").select("id, slug");
const catIdBySlug = Object.fromEntries((catRows ?? []).map((c) => [c.slug, c.id]));

// Bestaande pool van klanten uit scripts/seed-demo-data.mjs, hergebruikt voor
// kruisverwijzingen (extra leads/boekingen) zodat de 6 nieuwe scenario-
// bewoners zelf niet worden "vervuild" met activiteit die niet bij hun eigen
// scenario hoort.
async function bestaandeKlant(email) {
  const { data } = await admin.from("profiles").select("id, name").eq("email", email).maybeSingle();
  if (!data) console.warn(`  (let op: ${email} niet gevonden — draai scripts/seed-demo-data.mjs eerst voor volle kruisverwijzingen)`);
  return data?.id ?? null;
}
const testBewonerId = await bestaandeKlant("test-bewoner@neighbuur.test");
const buur1Id = await bestaandeKlant("demo-buur-1@neighbuur.test");
const buur2Id = await bestaandeKlant("demo-buur-2@neighbuur.test");
const buur3Id = await bestaandeKlant("demo-buur-3@neighbuur.test");

// ══════════════════════════════════════════════════════════════
// 8 VAKBEDRIJVEN
// ══════════════════════════════════════════════════════════════
console.log("\n── Vakman-scenario's aanmaken ──");

const nieuw = await ensureVakman({
  email: "demo.vakman.nieuw@neighbuur.test",
  naam: "Daan de Ruiter",
  bedrijfsnaam: "De Ruiter Klusbedrijf",
  categorieSlugs: ["schilderen"],
  bio: null,
  postcode: "3823",
  km: 15,
  verzekerd: false,
  kvkGeverifieerd: false,
  profielSterkte: 20,
});
console.log(`  ✓ nieuw/incompleet — ${nieuw.id}`);

const normaal = await ensureVakman({
  email: "demo.vakman.normaal@neighbuur.test",
  naam: "Peter Hoekstra",
  bedrijfsnaam: "Hoekstra Vloerwerken",
  categorieSlugs: ["vloeren"],
  bio: "PVC, laminaat en gietvloeren voor nieuwbouwwoningen. Gratis inmeten tijdens de voorschouw.",
  postcode: "3821",
  km: 25,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 68,
});
console.log(`  ✓ normaal — ${normaal.id}`);

const top = await ensureVakman({
  email: "demo.vakman.top@neighbuur.test",
  naam: "Sander Mulder",
  bedrijfsnaam: "Mulder Keukenstudio",
  categorieSlugs: ["keuken"],
  bio: "Montage van alle grote keukenmerken inclusief leidingwerk en inbouwapparatuur. 12 jaar ervaring in nieuwbouwprojecten, altijd stofvrij opgeleverd.",
  postcode: "3811",
  km: 30,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 96,
});
console.log(`  ✓ topprofiel — ${top.id}`);

const druk = await ensureVakman({
  email: "demo.vakman.druk@neighbuur.test",
  naam: "Erik de Vries",
  bedrijfsnaam: "Volt & Vries Elektrotechniek",
  categorieSlugs: ["elektra"],
  bio: "Meterkastuitbreiding, laadpalen en smart-home aansluitingen volgens NEN 1010.",
  postcode: "3823",
  km: 15,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 78,
});
console.log(`  ✓ druk/volgeboekt — ${druk.id}`);

const leads = await ensureVakman({
  email: "demo.vakman.leads@neighbuur.test",
  naam: "Rick Bakker",
  bedrijfsnaam: "Bakker Badkamerspecialist",
  categorieSlugs: ["badkamer"],
  bio: "Complete badkamerinstallatie: tegelwerk, sanitair en leidingwerk in één hand.",
  postcode: "3823",
  km: 20,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 72,
});
console.log(`  ✓ nieuwe ongelezen leads — ${leads.id}`);

const geenLeads = await ensureVakman({
  email: "demo.vakman.geenleads@neighbuur.test",
  naam: "Linda Visser",
  bedrijfsnaam: "Visser Raamdecoratie",
  categorieSlugs: ["raamdecoratie"],
  bio: "Inmeten en monteren van gordijnen, shutters en jaloezieën op maat.",
  postcode: "3823",
  km: 20,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 55,
});
console.log(`  ✓ zonder leads — ${geenLeads.id}`);

const deal = await ensureVakman({
  email: "demo.vakman.deal@neighbuur.test",
  naam: "Tom Jansen",
  bedrijfsnaam: "Jansen Tuin & Schutting",
  categorieSlugs: ["tuin"],
  bio: "Tuinaanleg, bestrating en schuttingen voor nieuwbouwtuinen — ook collectief per straat.",
  postcode: "3821",
  km: 25,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 74,
});
console.log(`  ✓ collectieve deal — ${deal.id}`);

const multidienst = await ensureVakman({
  email: "demo.vakman.multidienst@neighbuur.test",
  naam: "Soufiane Bensaid",
  bedrijfsnaam: "AllroundKlus Amersfoort",
  categorieSlugs: ["stucwerk", "schilderen", "vloeren"],
  bio: "Eén aanspreekpunt voor stucwerk, schilderwerk én vloeren — handig als je meerdere ruimtes tegelijk laat afwerken.",
  postcode: "3823",
  km: 25,
  verzekerd: true,
  kvkGeverifieerd: true,
  profielSterkte: 80,
});
console.log(`  ✓ meerdere diensten — ${multidienst.id}`);

// ══════════════════════════════════════════════════════════════
// 6 BEWONERS
// ══════════════════════════════════════════════════════════════
console.log("\n── Bewoner-scenario's aanmaken ──");

const leeg = await ensureBewoner("demo.bewoner.leeg@neighbuur.test", "Demo Bewoner Leeg");
console.log(`  ✓ leeg — ${leeg}`);

const actief = await ensureBewoner("demo.bewoner.actief@neighbuur.test", "Demo Bewoner Actief");
console.log(`  ✓ actief — ${actief}`);

const vol = await ensureBewoner("demo.bewoner.vol@neighbuur.test", "Demo Bewoner Vol");
console.log(`  ✓ vol — ${vol}`);

const dealBewoner = await ensureBewoner("demo.bewoner.deal@neighbuur.test", "Demo Bewoner Deal");
console.log(`  ✓ deal — ${dealBewoner}`);

const review = await ensureBewoner("demo.bewoner.review@neighbuur.test", "Demo Bewoner Review");
console.log(`  ✓ review — ${review}`);

const nomatch = await ensureBewoner("demo.bewoner.nomatch@neighbuur.test", "Demo Bewoner Nomatch");
console.log(`  ✓ nomatch — ${nomatch}`);

// ══════════════════════════════════════════════════════════════
// Boekingen, gesprekken, reviews, groepskorting — de scenario's koppelen
// ══════════════════════════════════════════════════════════════
console.log("\n── Boekingen en gesprekken koppelen ──");

const dagen = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// --- actief: 2 actieve aanvragen + 1 gesprek ---
const bLeadsVoorActief = await ensureBoeking({
  klantId: actief,
  vakmanId: leads.id,
  categorieId: leads.categorieId,
  omschrijving: "Badkamer volledig renoveren, inclusief nieuw sanitair en vloerverwarming.",
  datum: null,
  status: "requested",
});
const bNormaalVoorActief = await ensureBoeking({
  klantId: actief,
  vakmanId: normaal.id,
  categorieId: normaal.categorieId,
  omschrijving: "PVC visgraat in woonkamer en hal, ca. 42m².",
  datum: dagen(12),
  status: "confirmed",
});
await ensureGesprekMetBerichten({
  boekingId: bNormaalVoorActief,
  klantId: actief,
  vakmanUserId: normaal.userId,
  berichten: [
    { van: "klant", tekst: "Hoi, kunnen jullie ook de plinten meteen meenemen in de visgraatvloer?" },
    { van: "vakman", tekst: "Zeker, dat kan gewoon mee in de offerte. Ik zet het erbij en stuur je vandaag nog een bijgewerkte planning." },
    { van: "klant", tekst: "Top, dank je! Dan zien we jullie op de afgesproken datum." },
  ],
});
console.log("  ✓ demo.bewoner.actief: 2 aanvragen + gesprek");

// --- vol: afgerond x2 (met reviews), bevestigd x1, deelnemer groepskorting ---
const bTopVoorVol = await ensureBoeking({
  klantId: vol,
  vakmanId: top.id,
  categorieId: top.categorieId,
  omschrijving: "Complete keukenmontage inclusief inbouwapparatuur en aansluiting.",
  datum: dagen(-20),
  status: "completed",
});
await ensureReview({
  auteurId: vol,
  vakmanId: top.id,
  boekingId: bTopVoorVol,
  tekst: "Onze keuken is in twee dagen vakkundig gemonteerd, inclusief alle inbouwapparatuur. Communicatie via de app was steeds duidelijk en ze kwamen exact op de afgesproken tijd.",
  scores: { kwaliteit: 5, stiptheid: 5, communicatie: 5, prijs: 4 },
});
const bDealVoorVol = await ensureBoeking({
  klantId: vol,
  vakmanId: deal.id,
  categorieId: deal.categorieId,
  omschrijving: "Achtertuin volledig aanleggen inclusief nieuwe schutting.",
  datum: dagen(-8),
  status: "completed",
});
await ensureReview({
  auteurId: vol,
  vakmanId: deal.id,
  boekingId: bDealVoorVol,
  tekst: "Onze achtertuin is in één week helemaal aangelegd, inclusief nieuwe schutting. Dankzij de buurtdeal een stuk voordeliger dan een losse offerte.",
  scores: { kwaliteit: 5, stiptheid: 5, communicatie: 4, prijs: 5 },
});
await ensureBoeking({
  klantId: vol,
  vakmanId: druk.id,
  categorieId: druk.categorieId,
  omschrijving: "Laadpaal plaatsen op de oprit en extra groep in meterkast.",
  datum: dagen(16),
  status: "confirmed",
});
console.log("  ✓ demo.bewoner.vol: 2 afgerond + reviews, 1 bevestigd");

// --- review: afgerond, bewust GEEN review (open reviewverzoek) ---
await ensureBoeking({
  klantId: review,
  vakmanId: multidienst.id,
  categorieId: multidienst.categorieId,
  omschrijving: "Plafonds en kozijnen sausklaar maken in drie slaapkamers.",
  datum: dagen(-5),
  status: "completed",
});
console.log("  ✓ demo.bewoner.review: afgerond, nog geen review (open reviewverzoek)");

// --- nomatch: geannuleerd met uitleg (schema staat geen boeking zonder vakman toe) ---
await ensureBoeking({
  klantId: nomatch,
  vakmanId: nieuw.id,
  categorieId: nieuw.categorieId,
  omschrijving: "Buitengevel schilderen — geen geschikte vakman binnen het werkgebied gevonden, aanvraag automatisch geannuleerd.",
  datum: null,
  status: "cancelled",
});
console.log("  ✓ demo.bewoner.nomatch: geannuleerde aanvraag (geen match gevonden)");

// --- leads: extra aanvragen uit bestaande klantenpool ---
if (testBewonerId) {
  await ensureBoeking({
    klantId: testBewonerId,
    vakmanId: leads.id,
    categorieId: leads.categorieId,
    omschrijving: "Badkamer op de eerste verdieping vervangen, inclusief inloopdouche.",
    datum: null,
    status: "requested",
  });
}
if (buur1Id) {
  await ensureBoeking({
    klantId: buur1Id,
    vakmanId: leads.id,
    categorieId: leads.categorieId,
    omschrijving: "Gastentoilet betegelen en nieuw fonteintje plaatsen.",
    datum: null,
    status: "requested",
  });
}
console.log("  ✓ demo.vakman.leads: extra ongelezen aanvragen uit bestaande klantenpool");

// --- druk: extra bevestigde boekingen uit bestaande klantenpool, verspreid over 4 weken ---
const drukExtra = [
  { klantId: testBewonerId, omschrijving: "Buitenverlichting bij voordeur aansluiten.", dagenVooruit: 7 },
  { klantId: buur1Id, omschrijving: "Rookmelders en slimme meter laten controleren.", dagenVooruit: 10 },
  { klantId: buur2Id, omschrijving: "Voorbereiding aansluiting voor zonnepanelen.", dagenVooruit: 18 },
  { klantId: buur3Id, omschrijving: "Extra wandcontactdozen in werkkamer plaatsen.", dagenVooruit: 25 },
];
for (const b of drukExtra) {
  if (!b.klantId) continue;
  await ensureBoeking({
    klantId: b.klantId,
    vakmanId: druk.id,
    categorieId: druk.categorieId,
    omschrijving: b.omschrijving,
    datum: dagen(b.dagenVooruit),
    status: "confirmed",
  });
}
const beschikbaarheidRijen = Array.from({ length: 14 }, (_, i) => ({ professional_id: druk.id, date: dagen(i), status: "booked" }));
for (const rij of beschikbaarheidRijen) {
  const { data: bestaat } = await admin.from("availability").select("id").eq("professional_id", rij.professional_id).eq("date", rij.date).maybeSingle();
  if (!bestaat) await admin.from("availability").insert(rij);
}
console.log("  ✓ demo.vakman.druk: extra bevestigde boekingen + 14 dagen 'bezet'");

// --- top: extra afgeronde boekingen + reviews uit bestaande klantenpool ---
function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
const topExtra = [
  { klantId: testBewonerId, tekst: "Nette montage van onze nieuwe keuken, precies zoals besproken. Enige puntje: iets later gestart dan gepland.", scores: { kwaliteit: 5, stiptheid: 3, communicatie: 4, prijs: 4 }, omschrijving: "Keukenmontage inclusief aansluiten vaatwasser en kookplaat." },
  { klantId: buur1Id, tekst: "Snel en professioneel de keuken geplaatst, ook de kleine aanpassingen achteraf keurig opgelost.", scores: { kwaliteit: 5, stiptheid: 5, communicatie: 5, prijs: 5 }, omschrijving: "Keukenmontage met maatwerk kastenwand." },
  { klantId: buur2Id, tekst: "Duidelijke communicatie vooraf over de planning en precies binnen de afgesproken twee dagen klaar.", scores: { kwaliteit: 4, stiptheid: 5, communicatie: 5, prijs: 4 }, omschrijving: "Keuken monteren inclusief inbouwkoelkast." },
];
for (const t of topExtra) {
  if (!t.klantId) continue;
  const boekingId = await ensureBoeking({
    klantId: t.klantId,
    vakmanId: top.id,
    categorieId: top.categorieId,
    omschrijving: t.omschrijving,
    datum: dagen(-randInt(3, 30)),
    status: "completed",
  });
  await ensureReview({ auteurId: t.klantId, vakmanId: top.id, boekingId, tekst: t.tekst, scores: t.scores });
}
console.log("  ✓ demo.vakman.top: extra afgeronde boekingen + reviews");

// --- normaal: 1 extra afgeronde boeking + review uit bestaande klantenpool ---
if (testBewonerId) {
  const boekingId = await ensureBoeking({
    klantId: testBewonerId,
    vakmanId: normaal.id,
    categorieId: normaal.categorieId,
    omschrijving: "Laminaatvloer leggen in twee slaapkamers.",
    datum: dagen(-10),
    status: "completed",
  });
  await ensureReview({
    auteurId: testBewonerId,
    vakmanId: normaal.id,
    boekingId,
    tekst: "Laminaat netjes gelegd binnen een dag, precies de kleur die we wilden. Prima prijs-kwaliteitverhouding.",
    scores: { kwaliteit: 4, stiptheid: 4, communicatie: 4, prijs: 5 },
  });
}
console.log("  ✓ demo.vakman.normaal: extra afgeronde boeking + review");

// --- deal & vol: deelname aan de bestaande groepskorting ---
console.log("\n── Groepskorting-deelname koppelen ──");
const { data: bestaandeDeal } = await admin.from("group_discounts").select("id").eq("community_id", community.id).maybeSingle();
let dealId = bestaandeDeal?.id;
if (!dealId) {
  const { data: nieuweDeal, error } = await admin
    .from("group_discounts")
    .insert({
      community_id: community.id,
      category_id: catIdBySlug["tuin"],
      title_nl: "Hoveniers- & Schuttingdeal",
      title_en: "Landscaping & Fencing deal",
      description_nl: "Gezamenlijk tuinaanleg en schuttingen laten plaatsen voor Blok C. Hoe meer buren, hoe hoger de korting.",
      description_en: "Have your garden and fencing installed together for Block C. The more neighbours join, the bigger the discount.",
      min_participants: 10,
      price_normal: 250000,
      price_group: 195000,
      active: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`group_discount insert: ${error.message}`);
  dealId = nieuweDeal.id;
}
for (const userId of [dealBewoner, vol]) {
  const { data: bestaat } = await admin.from("group_discount_participants").select("id").eq("group_discount_id", dealId).eq("user_id", userId).maybeSingle();
  if (!bestaat) await admin.from("group_discount_participants").insert({ group_discount_id: dealId, user_id: userId });
}
console.log("  ✓ demo.bewoner.deal en demo.bewoner.vol nemen deel aan de Hoveniers- & Schuttingdeal");

// ══════════════════════════════════════════════════════════════
console.log("\n════════════════════════════════════════════════════════");
console.log("Klaar. Wachtwoord voor alle onderstaande accounts: waarde van DEMO_USER_PASSWORD in .env.local");
console.log("════════════════════════════════════════════════════════\n");
console.log("BEWONERS:");
console.log("  demo.bewoner.leeg@neighbuur.test      — leeg Mijn Plan, wel gekoppeld aan Vathorst Blok C");
console.log("  demo.bewoner.actief@neighbuur.test    — 2 actieve aanvragen + 1 gesprek");
console.log("  demo.bewoner.vol@neighbuur.test       — actief + afgerond + reviews + deelname groepskorting");
console.log("  demo.bewoner.deal@neighbuur.test      — deelnemer Hoveniers- & Schuttingdeal");
console.log("  demo.bewoner.review@neighbuur.test    — afgeronde opdracht, open reviewverzoek");
console.log("  demo.bewoner.nomatch@neighbuur.test   — geannuleerde aanvraag (geen match gevonden)");
console.log("\nVAKBEDRIJVEN:");
console.log("  demo.vakman.nieuw@neighbuur.test       — nieuw/incompleet profiel (geen bio/kvk/verzekering)");
console.log("  demo.vakman.normaal@neighbuur.test     — normaal profiel, gemiddelde activiteit");
console.log("  demo.vakman.top@neighbuur.test         — topprofiel, veel afgeronde klussen + sterke reviews");
console.log("  demo.vakman.druk@neighbuur.test        — druk/volgeboekt, 14 dagen geen ruimte");
console.log("  demo.vakman.leads@neighbuur.test       — meerdere nieuwe ongelezen aanvragen");
console.log("  demo.vakman.geenleads@neighbuur.test   — nul boekingen");
console.log("  demo.vakman.deal@neighbuur.test        — categorie tuin, gekoppeld aan actieve groepskorting");
console.log("  demo.vakman.multidienst@neighbuur.test — meerdere specialismes (stucwerk, schilderen, vloeren)");

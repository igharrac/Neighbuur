/**
 * Vult de database met 350 fictieve maar geloofwaardige vakbedrijven,
 * verspreid over alle "vakman"-categorieën en over Amsterdam en omgeving
 * (postcodes 10xx–21xx: centrum, stadsdelen, Zaanstad, Haarlem, Amstelveen,
 * Diemen, Almere, Purmerend, Hoofddorp, Weesp, Aalsmeer, Uithoorn e.o.).
 *
 * Namen worden gegenereerd uit woordenbanken (familienamen NL + internationaal,
 * merknaam-achtige combinaties, kleine zelfstandigen, installatiebedrijven),
 * zodat de dataset divers aanvoelt zonder bestaande bedrijven te imiteren.
 * Bedrijfsnaam, specialisme en beschrijving sluiten altijd op elkaar aan.
 *
 * Idempotent: opnieuw draaien maakt niets dubbel (matcht op e-mail).
 * Alle 350 accounts krijgen registratie_bron = 'demo-seed-bulk' en wachtwoord
 * process.env.DEMO_USER_PASSWORD (zie .env.local) — dit zijn geen accounts
 * die je normaal handmatig inlogt, ze vormen de "levende" achtergronddata.
 *
 * Draai hierna optioneel scripts/generate-vakman-logos.mjs voor logo's.
 * Verwijderen: scripts/remove-demo-data.mjs
 * Gebruik: node scripts/seed-companies.mjs
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

// ── Kleine seeded RNG (reproduceerbaar, maar idempotentie loopt via e-mail) ──
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260911);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1));
const chance = (p) => rng() < p;

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Woordenbanken ──────────────────────────────────────────────

const SURNAMES_NL = [
  "Van Dijk", "De Vries", "Jansen", "Bakker", "Visser", "Smit", "Meijer", "De Boer", "Mulder", "De Groot",
  "Bos", "Vos", "Peters", "Hendriks", "Van Leeuwen", "Dekker", "Brouwer", "De Wit", "Dijkstra", "Smits",
  "De Graaf", "Van der Meer", "Van den Berg", "Kuipers", "Jacobs", "Vermeulen", "Van der Linden", "Van der Heijden",
  "Kramer", "Van Dam", "Bosch", "Peeters", "Willems", "Van der Wal", "Van der Velde", "Groen", "Van Vliet",
  "Verhoeven", "Koster", "Scholten", "Timmermans", "Van Beek", "De Ruiter", "Van der Laan", "Blom", "Schouten",
];

const SURNAMES_INTL = [
  "El Amrani", "Yilmaz", "Bensaid", "Özdemir", "Kaya", "Chahid", "Idrissi", "Demir", "Aydin", "Boukhris",
  "Ouassini", "Karimi", "Haidari", "Nguyen", "Tran", "Kowalski", "Nowak", "Ionescu", "Popescu", "Silva",
  "Santos", "Pereira", "Costa", "Ferreira", "Rossi", "Romano", "Petrov", "Novak", "Singh", "Khan", "Patel",
  "Osei", "Mensah", "Adjei", "Diallo", "Cissé", "Toure", "Reyes", "Morales", "Hassan", "Farah",
];

const VOORNAMEN_NL_M = ["Willem", "Jeroen", "Bas", "Rick", "Tom", "Erik", "Jasper", "Mark", "Peter", "Sander", "Dennis", "Niels", "Martijn", "Tim", "Thijs", "Wouter", "Joris", "Bram", "Pieter", "Koen"];
const VOORNAMEN_NL_V = ["Linda", "Anne", "Sanne", "Eva", "Femke", "Marloes", "Lotte", "Iris", "Naomi", "Sophie", "Marieke", "Esther", "Fleur", "Nienke", "Wendy"];
const VOORNAMEN_INTL_M = ["Yassin", "Mehmet", "Karim", "Ibrahim", "Amir", "Aziz", "Rashid", "Hakan", "Emre", "Bilal", "Soufiane", "Reza", "Ali", "Kwame", "Idris", "Marek", "Andrei", "Miguel", "Rafael", "Diego"];
const VOORNAMEN_INTL_V = ["Fatima", "Zeynep", "Amina", "Leyla", "Yasmin", "Elif", "Nour", "Amara", "Ines", "Ana", "Elena", "Mariana"];

const BRAND_PREFIX = [
  "Nova", "Urban", "Prime", "Metro", "Pure", "Bright", "Elite", "Vista", "Solid", "Grand",
  "Zenith", "Apex", "Casa", "Nordic", "Cityline", "Northside", "Southgate", "Brightside", "Clearline", "Trueform",
  "Modus", "Loft", "Delta", "Stonewell", "Craftline", "Evergreen", "Firstclass", "Newground", "Wellhome", "Buildwise",
];

const CATEGORIE_WORDS = {
  stucwerk: { woorden: ["Stucwerken", "Afbouw", "Pleisterwerk", "Wandafwerking", "Stukadoors"], enkelvoud: "Stucwerk", brandSuffix: ["Afbouw", "Finish", "Walls", "Plaster"] },
  schilderen: { woorden: ["Schilderwerken", "Schilders", "Verfwerken", "Schilderbedrijf"], enkelvoud: "Schilderwerk", brandSuffix: ["Paint", "Colours", "Finish", "Brush"] },
  vloeren: { woorden: ["Vloeren", "Vloerwerken", "Parket", "Vloerenspecialist"], enkelvoud: "Vloer", brandSuffix: ["Floors", "Flooring", "Parquet"] },
  keuken: { woorden: ["Keukens", "Keukenmontage", "Keukenbouw", "Keukenstudio"], enkelvoud: "Keuken", brandSuffix: ["Kitchens", "Interiors", "Living"] },
  badkamer: { woorden: ["Badkamers", "Sanitair", "Tegelwerk", "Badkamerinstallaties"], enkelvoud: "Badkamer", brandSuffix: ["Bathrooms", "Sanitary", "Tiles"] },
  tuin: { woorden: ["Hoveniers", "Tuinaanleg", "Tuinen", "Groenvoorziening", "Tuinservice"], enkelvoud: "Tuin", brandSuffix: ["Gardens", "Green", "Outdoor", "Landscapes"] },
  raamdecoratie: { woorden: ["Raamdecoratie", "Zonwering", "Interieur", "Gordijnen"], enkelvoud: "Raamstijl", brandSuffix: ["Interiors", "Blinds", "Drapes", "Shades"] },
  elektra: { woorden: ["Elektrotechniek", "Installatietechniek", "Elektro", "Techniek"], enkelvoud: "Elektra", brandSuffix: ["Electric", "Power", "Tech", "Volt"] },
  verhuizen: { woorden: ["Verhuizingen", "Verhuisservice", "Transport", "Verhuisbedrijf"], enkelvoud: "Verhuisservice", brandSuffix: ["Movers", "Moving", "Logistics", "Transport"] },
  beveiliging: { woorden: ["Beveiliging", "Installaties", "SmartHome", "Beveiligingstechniek"], enkelvoud: "Beveiliging", brandSuffix: ["Security", "Secure", "Guard", "Shield"] },
};

const LOCATIES = [
  { naam: "Amsterdam-Centrum", stad: "Amsterdam", pcMin: 1011, pcMax: 1018 },
  { naam: "Amsterdam-Noord", stad: "Amsterdam", pcMin: 1031, pcMax: 1039 },
  { naam: "Amsterdam-West", stad: "Amsterdam", pcMin: 1051, pcMax: 1059 },
  { naam: "Amsterdam Nieuw-West", stad: "Amsterdam", pcMin: 1061, pcMax: 1069 },
  { naam: "Amsterdam-Zuid", stad: "Amsterdam", pcMin: 1071, pcMax: 1079 },
  { naam: "Amsterdam-Oost", stad: "Amsterdam", pcMin: 1091, pcMax: 1099 },
  { naam: "Amsterdam Zuidoost", stad: "Amsterdam", pcMin: 1101, pcMax: 1109 },
  { naam: "IJburg", stad: "Amsterdam", pcMin: 1087, pcMax: 1087 },
  { naam: "Zaandam", stad: "Zaanstad", pcMin: 1500, pcMax: 1508 },
  { naam: "Haarlem", stad: "Haarlem", pcMin: 2011, pcMax: 2035 },
  { naam: "Amstelveen", stad: "Amstelveen", pcMin: 1181, pcMax: 1187 },
  { naam: "Diemen", stad: "Diemen", pcMin: 1111, pcMax: 1112 },
  { naam: "Almere", stad: "Almere", pcMin: 1315, pcMax: 1354 },
  { naam: "Purmerend", stad: "Purmerend", pcMin: 1441, pcMax: 1447 },
  { naam: "Hoofddorp", stad: "Haarlemmermeer", pcMin: 2130, pcMax: 2135 },
  { naam: "Weesp", stad: "Weesp", pcMin: 1380, pcMax: 1381 },
  { naam: "Landsmeer", stad: "Landsmeer", pcMin: 1121, pcMax: 1121 },
  { naam: "Uithoorn", stad: "Uithoorn", pcMin: 1421, pcMax: 1422 },
  { naam: "Aalsmeer", stad: "Aalsmeer", pcMin: 1430, pcMax: 1432 },
  { naam: "Duivendrecht", stad: "Ouder-Amstel", pcMin: 1191, pcMax: 1191 },
];

const BIO_TEMPLATES_NL = [
  (w, loc, jaren) => `${w.woorden.length ? "" : ""}Al ${jaren} jaar actief in en rond ${loc.stad} met ${w.enkelvoud.toLowerCase()} voor nieuwbouwwoningen. Duidelijke offerte vooraf, geen verrassingen achteraf.`,
  (w, loc) => `Klein team, korte lijnen: we plannen zelf in en werken netjes op afspraak. Gespecialiseerd in ${w.enkelvoud.toLowerCase()} voor projecten in ${loc.stad} en omstreken.`,
  (w, loc, jaren) => `${jaren} jaar ervaring in nieuwbouw. We werken veel voor hele straten en blokken tegelijk, dus vraag gerust naar de mogelijkheden voor een buurtdeal.`,
  (w, loc) => `Vaste prijzen, vaste planning. Actief in ${loc.stad} en de regio, met een team dat gewend is aan opleverwerk in nieuwbouwwijken.`,
  (w, loc) => `Familiebedrijf met oog voor detail. We werken volgens vaste kwaliteitschecks en leveren altijd stofvrij en netjes op in ${loc.stad}.`,
  (w) => `Modern bedrijf met een klein vast team vakmensen. Snel schakelen via de app, transparante planning, geen tussenpersonen.`,
];

function contactNaam(intl) {
  if (intl) {
    const v = chance(0.75) ? pick(VOORNAMEN_INTL_M) : pick(VOORNAMEN_INTL_V);
    return `${v} ${pick(SURNAMES_INTL)}`;
  }
  const v = chance(0.75) ? pick(VOORNAMEN_NL_M) : pick(VOORNAMEN_NL_V);
  return `${v} ${pick(SURNAMES_NL)}`;
}

const gebruikteNamen = new Set();
const ALFABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function genereerBedrijfsnaam(catSlug) {
  const w = CATEGORIE_WORDS[catSlug];
  const patroon = randInt(1, 7);
  let naam;
  switch (patroon) {
    case 1: // familienaam NL
      naam = `${pick(SURNAMES_NL)} ${pick(w.woorden)}`;
      break;
    case 2: // familienaam internationaal
      naam = `${pick(SURNAMES_INTL)} ${pick(w.woorden)}`;
      break;
    case 3: // brand mashup (geen spatie)
      naam = `${pick(BRAND_PREFIX)}${pick(w.brandSuffix)}`;
      break;
    case 4: // brand + locatie
      naam = `${pick(BRAND_PREFIX)}${pick(w.brandSuffix)} ${pick(LOCATIES).stad}`;
      break;
    case 5: { // initialen (installatiebedrijf-stijl)
      const initials = `${pick(ALFABET.split(""))}&${pick(ALFABET.split(""))}`;
      naam = `${initials} ${pick(w.woorden)}`;
      break;
    }
    case 6: // studio-stijl kleine zelfstandige
      naam = `Studio ${w.enkelvoud}`;
      break;
    default: { // professioneel bedrijf met meerdere medewerkers
      const suffix = pick(["Groep", "Nederland", "& Zonen", "Vakmensen", "Team"]);
      naam = `${pick(BRAND_PREFIX)} ${pick(w.woorden)} ${suffix}`;
    }
  }
  if (gebruikteNamen.has(naam)) return genereerBedrijfsnaam(catSlug);
  gebruikteNamen.add(naam);
  return naam;
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

async function ensureUser(email, naam, rol) {
  const { data: existing } = await admin.from("profielen").select("id").eq("email", email).maybeSingle();
  if (existing) return { id: existing.id, bestondAl: true };

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: env.DEMO_USER_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);

  const userId = created.user.id;
  const { error: profielError } = await admin.from("profielen").insert({ id: userId, naam, email, rol });
  if (profielError) throw new Error(`profielen insert (${email}): ${profielError.message}`);
  return { id: userId, bestondAl: false };
}

console.log("── Categorieën ophalen ──");
const { data: catRows } = await admin.from("categorieen").select("id, slug").eq("type", "vakman");
const catIdBySlug = Object.fromEntries((catRows ?? []).map((c) => [c.slug, c.id]));
const CATEGORIE_SLUGS = Object.keys(CATEGORIE_WORDS).filter((s) => catIdBySlug[s]);
if (CATEGORIE_SLUGS.length !== Object.keys(CATEGORIE_WORDS).length) {
  console.warn("Let op: niet alle verwachte categorieën gevonden in de database, ga door met de rest.");
}

const AANTAL_PER_CATEGORIE = 35; // 10 categorieën × 35 = 350
let aangemaakt = 0;
let oversloegen = 0;
const perCategorieTeller = {};

for (const catSlug of CATEGORIE_SLUGS) {
  const w = CATEGORIE_WORDS[catSlug];
  perCategorieTeller[catSlug] = 0;

  for (let i = 0; i < AANTAL_PER_CATEGORIE; i++) {
    const intl = chance(0.4);
    const bedrijfsnaam = genereerBedrijfsnaam(catSlug);
    const persoon = contactNaam(intl);
    const loc = pick(LOCATIES);
    const postcode = pad4(randInt(loc.pcMin, loc.pcMax));
    const jaren = randInt(2, 18);
    const verzekerd = chance(0.8);
    const kvkGeverifieerd = chance(0.85);
    const bio = pick(BIO_TEMPLATES_NL)(w, loc, jaren);
    const slug = slugify(bedrijfsnaam);
    const email = `${slug}@neighbuur.test`;

    const { id: userId, bestondAl } = await ensureUser(email, persoon, "vakman");

    const { data: existingVakman } = await admin.from("vakman_profielen").select("id").eq("user_id", userId).maybeSingle();
    if (existingVakman) {
      oversloegen++;
      perCategorieTeller[catSlug]++;
      continue;
    }

    let vakmanSlug = slug;
    let poging = 1;
    while (true) {
      const { data: slugBotsing } = await admin.from("vakman_profielen").select("id").eq("slug", vakmanSlug).maybeSingle();
      if (!slugBotsing) break;
      poging++;
      vakmanSlug = `${slug}-${poging}`;
    }

    const profielSterkte =
      40 + (bio ? 10 : 0) + (verzekerd ? 15 : 0) + (kvkGeverifieerd ? 10 : 0) + randInt(0, 15);

    const { error } = await admin.from("vakman_profielen").insert({
      user_id: userId,
      bedrijfsnaam,
      slug: vakmanSlug,
      kvk_nummer: "69" + Math.floor(1000000 + rng() * 8999999),
      kvk_geverifieerd: kvkGeverifieerd,
      bio,
      specialismes: [catIdBySlug[catSlug]],
      contact_voorkeur: pick(["app", "app", "app", "whatsapp", "telefoon"]),
      werkgebied_postcode: postcode,
      werkgebied_km: randInt(15, 40),
      verzekerd,
      geverifieerd: kvkGeverifieerd && verzekerd,
      registratie_bron: "demo-seed-bulk",
      profiel_sterkte: Math.min(profielSterkte, 100),
    });
    if (error) {
      console.error(`  ✗ ${bedrijfsnaam}: ${error.message}`);
      continue;
    }
    aangemaakt++;
    perCategorieTeller[catSlug]++;
    if (aangemaakt % 25 === 0) console.log(`  ... ${aangemaakt} bedrijven aangemaakt`);
  }
}

console.log("\n── Klaar ──");
console.log(`Nieuw aangemaakt: ${aangemaakt}`);
console.log(`Al aanwezig (overgeslagen): ${oversloegen}`);
console.log("Per categorie:");
for (const [slug, n] of Object.entries(perCategorieTeller)) {
  console.log(`  ${slug.padEnd(15)} ${n}`);
}

/**
 * Seed voor de 10 adres/woning-scenario's uit het adres-eerst redesign
 * (addresses/residential_clusters/residences/resident_residence_history).
 * Gebruikt GEEN live BAG-calls — adressen en pand-id's zijn fictief maar
 * structureel realistisch, zodat dit script altijd en overal werkt,
 * ook zonder netwerktoegang tot PDOK.
 *
 * Dekt:
 *  A. bestaand appartementencomplex zonder development
 *  B. bestaand woonblok zonder development (handmatig gegroepeerd cluster)
 *  C. nieuwbouwdevelopment met meerdere buildings
 *  D. development zonder definitief adres (alleen bouwnummer)
 *  E. woning zonder community
 *  F. cluster met 1 unieke woning
 *  G. cluster met 2 unieke woningen
 *  H. cluster met 3+ unieke woningen (community-suggestie testbaar)
 *  I. cluster met bestaande community
 *  J. meerdere accounts op één woning (threshold-logica testbaar)
 *
 * Idempotent: opnieuw draaien maakt niets dubbel (matcht op e-mail /
 * bag_nummeraanduiding_id / cluster_key / development_phase_id+bouwnummer).
 *
 * Gebruik: node scripts/seed-demo-addresses.mjs
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

if (!env.DEMO_USER_PASSWORD) throw new Error("DEMO_USER_PASSWORD ontbreekt in .env.local");

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(input) {
  return input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function ensureUser(email, naam) {
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await admin.auth.admin.createUser({ email, password: env.DEMO_USER_PASSWORD, email_confirm: true });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);
  const userId = created.user.id;
  const { error: profielError } = await admin.from("profiles").insert({ id: userId, name: naam, email, role: "resident" });
  if (profielError) throw new Error(`profiles insert (${email}): ${profielError.message}`);
  return userId;
}

async function ensureAddress({ bagId, bagPandIds, street, postcode, huisnummer, suffix, city, municipality }) {
  const { data, error } = await admin
    .from("addresses")
    .upsert(
      {
        bag_nummeraanduiding_id: bagId,
        bag_verblijfsobject_id: bagId + "-vo",
        bag_pand_ids: bagPandIds,
        street,
        postal_code: postcode,
        house_number: huisnummer,
        house_number_suffix: suffix ?? null,
        city,
        municipality: municipality ?? city,
        source: "manual",
      },
      { onConflict: "bag_nummeraanduiding_id" }
    )
    .select("id")
    .single();
  if (error) throw new Error(`addresses upsert (${bagId}): ${error.message}`);
  return data.id;
}

async function ensureCluster({ clusterKey, type, bagPandIds, name, developmentId, developmentPhaseId, createdFrom, communityThreshold }) {
  const { data: existing } = await admin.from("residential_clusters").select("id").eq("cluster_key", clusterKey).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("residential_clusters")
    .insert({
      type,
      cluster_key: clusterKey,
      bag_pand_ids: bagPandIds ?? [],
      name: name ?? null,
      development_id: developmentId ?? null,
      development_phase_id: developmentPhaseId ?? null,
      created_from: createdFrom ?? "manual",
      community_threshold: communityThreshold ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`residential_clusters insert (${clusterKey}): ${error.message}`);
  return data.id;
}

async function ensureConfirmedResidence({ addressId, clusterId, developmentId, developmentPhaseId }) {
  const { data: existing } = await admin.from("residences").select("id").eq("address_id", addressId).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("residences")
    .insert({ address_id: addressId, residential_cluster_id: clusterId, development_id: developmentId ?? null, development_phase_id: developmentPhaseId ?? null, status: "confirmed" })
    .select("id")
    .single();
  if (error) throw new Error(`residences insert (address ${addressId}): ${error.message}`);
  return data.id;
}

async function ensureProvisionalResidence({ developmentPhaseId, constructionNumber, clusterId, developmentId }) {
  const { data: existing } = await admin
    .from("residences")
    .select("id")
    .eq("development_phase_id", developmentPhaseId)
    .eq("construction_number", constructionNumber)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("residences")
    .insert({ residential_cluster_id: clusterId, development_id: developmentId, development_phase_id: developmentPhaseId, construction_number: constructionNumber, status: "provisional" })
    .select("id")
    .single();
  if (error) throw new Error(`residences insert (provisional ${constructionNumber}): ${error.message}`);
  return data.id;
}

async function linkResident(userId, residenceId, communityId = null) {
  const { data: existingProfiel } = await admin.from("resident_profiles").select("id, current_residence_id").eq("user_id", userId).maybeSingle();

  if (!existingProfiel) {
    let code = generateInviteCode();
    for (let i = 0; i < 5; i++) {
      const { data: bestaat } = await admin.from("resident_profiles").select("id").eq("invite_code", code).maybeSingle();
      if (!bestaat) break;
      code = generateInviteCode();
    }
    await admin.from("resident_profiles").insert({ user_id: userId, current_residence_id: residenceId, community_id: communityId, invite_code: code });
  } else if (existingProfiel.current_residence_id !== residenceId) {
    await admin.from("resident_residence_history").update({ ended_at: new Date().toISOString() }).eq("user_id", userId).is("ended_at", null);
    await admin.from("resident_profiles").update({ current_residence_id: residenceId, community_id: communityId }).eq("id", existingProfiel.id);
  }

  const { data: openHistorie } = await admin.from("resident_residence_history").select("id").eq("user_id", userId).eq("residence_id", residenceId).maybeSingle();
  if (!openHistorie) {
    await admin.from("resident_residence_history").insert({ user_id: userId, residence_id: residenceId });
  }

  if (communityId) {
    await admin.from("community_members").upsert({ community_id: communityId, user_id: userId, role: "member" }, { onConflict: "community_id,user_id", ignoreDuplicates: true });
  }
}

// ══════════════════════════════════════════════════════════════
// A. Bestaand appartementencomplex zonder development
// (dubbelt als F: cluster met 1 unieke woning, en E: woning zonder community)
// ══════════════════════════════════════════════════════════════
console.log("── A/E/F: bestaand appartementencomplex, 1 woning, geen community ──");
{
  const userId = await ensureUser("demo.adres.complex@neighbuur.test", "Demo Adres Complex");
  const addressId = await ensureAddress({
    bagId: "9999100000000101",
    bagPandIds: ["9999100000000101"],
    street: "Vondelkade",
    postcode: "1054GA",
    huisnummer: 12,
    suffix: "A",
    city: "Amsterdam",
  });
  const clusterId = await ensureCluster({ clusterKey: "demo:complex-vondelkade-12", type: "apartment_complex", bagPandIds: ["9999100000000101"], name: "Vondelkade 12", createdFrom: "auto" });
  const residenceId = await ensureConfirmedResidence({ addressId, clusterId });
  await linkResident(userId, residenceId);
  console.log("  ✓ demo.adres.complex@neighbuur.test — Vondelkade 12-A, geen community");
}

// ══════════════════════════════════════════════════════════════
// B/I. Bestaand woonblok zonder development, MET bestaande community
// (3 losse panden, handmatig gegroepeerd tot 1 blok-cluster)
// ══════════════════════════════════════════════════════════════
console.log("\n── B/I: bestaand woonblok (3 losse panden), met bestaande community ──");
{
  const blokPandIds = ["9999100000000201", "9999100000000202", "9999100000000203"];
  const clusterId = await ensureCluster({
    clusterKey: "demo:blok-dorpsstraat",
    type: "block",
    bagPandIds: blokPandIds,
    name: "Dorpsstraat 3-7",
    createdFrom: "manual",
  });

  const { data: bestaandeCommunity } = await admin.from("communities").select("id").eq("slug", "dorpsstraat-buren").maybeSingle();
  let communityId = bestaandeCommunity?.id;
  if (!communityId) {
    const { data: nieuweCommunity, error } = await admin
      .from("communities")
      .insert({ residential_cluster_id: clusterId, name: "Dorpsstraat Buren", slug: "dorpsstraat-buren", type: "blok", description: "Rijwoningen aan de Dorpsstraat, geen nieuwbouwproject.", active: true, status: "active" })
      .select("id")
      .single();
    if (error) throw new Error(`communities insert (dorpsstraat-buren): ${error.message}`);
    communityId = nieuweCommunity.id;
  }

  const huisnummers = [3, 5, 7];
  const emails = ["demo.adres.blok1@neighbuur.test", "demo.adres.blok2@neighbuur.test", "demo.adres.blok3@neighbuur.test"];
  for (let i = 0; i < 3; i++) {
    const userId = await ensureUser(emails[i], `Demo Adres Blok ${i + 1}`);
    const addressId = await ensureAddress({ bagId: blokPandIds[i], bagPandIds: [blokPandIds[i]], street: "Dorpsstraat", postcode: "1391GH", huisnummer: huisnummers[i], city: "Weesp" });
    const residenceId = await ensureConfirmedResidence({ addressId, clusterId });
    await linkResident(userId, residenceId, communityId);
    console.log(`  ✓ ${emails[i]} — Dorpsstraat ${huisnummers[i]}, lid van Dorpsstraat Buren`);
  }
}

// ══════════════════════════════════════════════════════════════
// C. Nieuwbouwdevelopment met meerdere buildings
// ══════════════════════════════════════════════════════════════
console.log("\n── C: nieuwbouwdevelopment met meerdere buildings ──");
let nieuweKernId;
let fase1Id;
let fase2Id;
{
  const { data: bestaand } = await admin.from("developments").select("id").eq("slug", "de-nieuwe-kern").maybeSingle();
  if (bestaand) {
    nieuweKernId = bestaand.id;
  } else {
    const { data, error } = await admin
      .from("developments")
      .insert({ name: "De Nieuwe Kern", city: "Almere", slug: "de-nieuwe-kern", active: true, home_count: 120 })
      .select("id")
      .single();
    if (error) throw new Error(`developments insert: ${error.message}`);
    nieuweKernId = data.id;
  }

  const { data: bestaandeFase1 } = await admin.from("development_phases").select("id").eq("development_id", nieuweKernId).eq("name", "Fase 1").maybeSingle();
  if (bestaandeFase1) {
    fase1Id = bestaandeFase1.id;
  } else {
    const { data, error } = await admin
      .from("development_phases")
      .insert({ development_id: nieuweKernId, name: "Fase 1", postal_codes: ["1318AB"], sort_order: 1 })
      .select("id")
      .single();
    if (error) throw new Error(`development_phases insert (Fase 1): ${error.message}`);
    fase1Id = data.id;
  }

  const gebouwen = [
    { pand: "9999100000000301", straat: "Kernlaan", huisnummer: 1, naam: "Blok A" },
    { pand: "9999100000000302", straat: "Kernlaan", huisnummer: 21, naam: "Blok B" },
  ];
  const emails = ["demo.adres.nieuwbouw1@neighbuur.test", "demo.adres.nieuwbouw2@neighbuur.test"];
  for (let i = 0; i < 2; i++) {
    const g = gebouwen[i];
    const userId = await ensureUser(emails[i], `Demo Adres Nieuwbouw ${i + 1}`);
    const addressId = await ensureAddress({ bagId: g.pand, bagPandIds: [g.pand], street: g.straat, postcode: "1318AB", huisnummer: g.huisnummer, city: "Almere" });
    const clusterId = await ensureCluster({ clusterKey: `demo:${g.pand}`, type: "building", bagPandIds: [g.pand], name: g.naam, developmentId: nieuweKernId, developmentPhaseId: fase1Id, createdFrom: "auto" });
    const residenceId = await ensureConfirmedResidence({ addressId, clusterId, developmentId: nieuweKernId, developmentPhaseId: fase1Id });
    await linkResident(userId, residenceId);
    console.log(`  ✓ ${emails[i]} — De Nieuwe Kern, Fase 1, ${g.naam}`);
  }
}

// ══════════════════════════════════════════════════════════════
// D. Development zonder definitief adres (alleen bouwnummer)
// ══════════════════════════════════════════════════════════════
console.log("\n── D: nieuwbouw zonder definitief adres (alleen bouwnummer) ──");
{
  const { data: bestaandeFase2 } = await admin.from("development_phases").select("id").eq("development_id", nieuweKernId).eq("name", "Fase 2").maybeSingle();
  if (bestaandeFase2) {
    fase2Id = bestaandeFase2.id;
  } else {
    const { data, error } = await admin
      .from("development_phases")
      .insert({ development_id: nieuweKernId, name: "Fase 2 (verkoop, nog geen adressen)", postal_codes: [], sort_order: 2 })
      .select("id")
      .single();
    if (error) throw new Error(`development_phases insert (Fase 2): ${error.message}`);
    fase2Id = data.id;
  }

  const clusterId = await ensureCluster({ clusterKey: `demo:phase:${fase2Id}`, type: "development_phase", developmentId: nieuweKernId, developmentPhaseId: fase2Id, createdFrom: "auto" });
  const userId = await ensureUser("demo.adres.bouwnummer@neighbuur.test", "Demo Adres Bouwnummer");
  const residenceId = await ensureProvisionalResidence({ developmentPhaseId: fase2Id, constructionNumber: "18", clusterId, developmentId: nieuweKernId });
  await linkResident(userId, residenceId);
  console.log("  ✓ demo.adres.bouwnummer@neighbuur.test — De Nieuwe Kern, Fase 2, bouwnummer 18 (nog geen adres)");
}

// ══════════════════════════════════════════════════════════════
// G. Cluster met 2 unieke woningen (nog onder de drempel)
// ══════════════════════════════════════════════════════════════
console.log("\n── G: cluster met 2 unieke woningen ──");
{
  const pandIds = ["9999100000000401"];
  const clusterId = await ensureCluster({ clusterKey: "demo:twee-woningen", type: "building", bagPandIds: pandIds, name: "Twee Woningen", createdFrom: "auto" });
  const huisnummers = [22, 24];
  const emails = ["demo.adres.twee1@neighbuur.test", "demo.adres.twee2@neighbuur.test"];
  for (let i = 0; i < 2; i++) {
    const userId = await ensureUser(emails[i], `Demo Adres Twee ${i + 1}`);
    const addressId = await ensureAddress({ bagId: `9999100000000401-${huisnummers[i]}`, bagPandIds: pandIds, street: "Kanaalweg", postcode: "3526KL", huisnummer: huisnummers[i], city: "Utrecht" });
    const residenceId = await ensureConfirmedResidence({ addressId, clusterId });
    await linkResident(userId, residenceId);
    console.log(`  ✓ ${emails[i]} — Kanaalweg ${huisnummers[i]}`);
  }
}

// ══════════════════════════════════════════════════════════════
// H. Cluster met 3+ unieke woningen, NOG GEEN community
// (community-suggestie/"start jullie community" handmatig testbaar)
// ══════════════════════════════════════════════════════════════
console.log("\n── H: cluster met 3 unieke woningen, drempel bereikt, nog geen community ──");
{
  const pandIds = ["9999100000000501"];
  const clusterId = await ensureCluster({ clusterKey: "demo:drie-woningen", type: "building", bagPandIds: pandIds, name: "Drie Woningen", createdFrom: "auto" });
  const huisnummers = [8, 10, 12];
  const emails = ["demo.adres.drie1@neighbuur.test", "demo.adres.drie2@neighbuur.test", "demo.adres.drie3@neighbuur.test"];
  for (let i = 0; i < 3; i++) {
    const userId = await ensureUser(emails[i], `Demo Adres Drie ${i + 1}`);
    const addressId = await ensureAddress({ bagId: `9999100000000501-${huisnummers[i]}`, bagPandIds: pandIds, street: "Havenstraat", postcode: "2011AB", huisnummer: huisnummers[i], city: "Haarlem" });
    const residenceId = await ensureConfirmedResidence({ addressId, clusterId });
    await linkResident(userId, residenceId);
    console.log(`  ✓ ${emails[i]} — Havenstraat ${huisnummers[i]}`);
  }
  console.log("  → log in als demo.adres.drie1@neighbuur.test en ga naar Mijn Plan om 'Start jullie community' te testen.");
}

// ══════════════════════════════════════════════════════════════
// J. Meerdere accounts op één woning (threshold-logica: telt als 1, niet 3)
// ══════════════════════════════════════════════════════════════
console.log("\n── J: meerdere accounts op één woning ──");
{
  const addressId = await ensureAddress({ bagId: "9999100000000601", bagPandIds: ["9999100000000601"], street: "Huisgenotenstraat", postcode: "3011AB", huisnummer: 4, city: "Rotterdam" });
  const clusterId = await ensureCluster({ clusterKey: "demo:huisgenoten", type: "building", bagPandIds: ["9999100000000601"], name: "Huisgenotenstraat 4", createdFrom: "auto" });
  const residenceId = await ensureConfirmedResidence({ addressId, clusterId });

  const emails = ["demo.adres.huisgenoot1@neighbuur.test", "demo.adres.huisgenoot2@neighbuur.test", "demo.adres.huisgenoot3@neighbuur.test"];
  for (let i = 0; i < 3; i++) {
    const userId = await ensureUser(emails[i], `Demo Adres Huisgenoot ${i + 1}`);
    await linkResident(userId, residenceId);
  }
  const { data: telling } = await admin.rpc("count_residences_in_cluster", { p_cluster_id: clusterId });
  console.log(`  ✓ 3 accounts op Huisgenotenstraat 4 — count_residences_in_cluster geeft ${telling} (hoort 1 te zijn, niet 3)`);
}

console.log("\nKlaar. Wachtwoord voor alle demo.adres.*-accounts: waarde van DEMO_USER_PASSWORD in .env.local");

/**
 * Controleert de 14 demo-loginaccounts uit scripts/seed-demo-accounts.mjs:
 *
 * 1. Bestaan alle accounts, en zijn auth-user en profiel correct gekoppeld?
 * 2. Werkt inloggen via de normale auth-flow (anon client + wachtwoord)?
 * 3. Komt elk account terecht in de juiste rol (bewoner -> /plan, vakman -> /dashboard)?
 * 4. RLS: kan een bewoner een vakmanprofiel van iemand anders muteren? (moet falen)
 * 5. RLS: kan een vakman boekingen/berichten van een bewoner zien die niet van hem is? (moet leeg/gefilterd zijn)
 *
 * Gebruikt zowel de service-role client (voor het opzoeken van id's/verwachtingen)
 * als losse anon-clients per account (om precies te simuleren wat een ingelogde
 * gebruiker via RLS wel/niet mag).
 *
 * Gebruik: node scripts/verify-demo-accounts.mjs
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

if (!env.DEMO_USER_PASSWORD) throw new Error("DEMO_USER_PASSWORD ontbreekt in .env.local");

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BEWONERS = [
  "demo.bewoner.leeg@neighbuur.test",
  "demo.bewoner.actief@neighbuur.test",
  "demo.bewoner.vol@neighbuur.test",
  "demo.bewoner.deal@neighbuur.test",
  "demo.bewoner.review@neighbuur.test",
  "demo.bewoner.nomatch@neighbuur.test",
];
const VAKMEN = [
  "demo.vakman.nieuw@neighbuur.test",
  "demo.vakman.normaal@neighbuur.test",
  "demo.vakman.top@neighbuur.test",
  "demo.vakman.druk@neighbuur.test",
  "demo.vakman.leads@neighbuur.test",
  "demo.vakman.geenleads@neighbuur.test",
  "demo.vakman.deal@neighbuur.test",
  "demo.vakman.multidienst@neighbuur.test",
];

let fouten = 0;
let waarschuwingen = 0;
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.log(`  ✗ ${msg}`);
  fouten++;
};
const warn = (msg) => {
  console.log(`  ! ${msg}`);
  waarschuwingen++;
};

function anonClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// ══════════════════════════════════════════════════════════════
// 1 + 2 + 3: accounts bestaan, auth<->profiel gekoppeld, login werkt, juiste rol
// ══════════════════════════════════════════════════════════════
console.log("── 1-3. Accounts, koppeling en login ──");

const sessies = {}; // email -> { client, user, profiel }

for (const email of [...BEWONERS, ...VAKMEN]) {
  const verwachteRol = BEWONERS.includes(email) ? "bewoner" : "vakman";

  const { data: profiel } = await admin.from("profielen").select("id, naam, email, rol").eq("email", email).maybeSingle();
  if (!profiel) {
    fail(`${email}: geen profiel gevonden`);
    continue;
  }

  const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(profiel.id);
  if (authErr || !authUser?.user) {
    fail(`${email}: profiel.id (${profiel.id}) heeft geen bijbehorende auth-user`);
    continue;
  }
  if (authUser.user.email !== email) {
    fail(`${email}: auth-email (${authUser.user.email}) komt niet overeen met profiel-email`);
    continue;
  }
  if (profiel.rol !== verwachteRol) {
    fail(`${email}: rol is '${profiel.rol}', verwacht '${verwachteRol}'`);
    continue;
  }

  const client = anonClient();
  const { data: loginData, error: loginErr } = await client.auth.signInWithPassword({ email, password: env.DEMO_USER_PASSWORD });
  if (loginErr || !loginData.session) {
    fail(`${email}: inloggen mislukt — ${loginErr?.message}`);
    continue;
  }

  if (verwachteRol === "vakman") {
    const { data: vp } = await admin.from("vakman_profielen").select("id").eq("user_id", profiel.id).maybeSingle();
    if (!vp) {
      fail(`${email}: rol vakman maar geen vakman_profielen-rij — zou op /registreer/vakman belanden i.p.v. /dashboard`);
      continue;
    }
  } else {
    const { data: bp } = await admin.from("bewoner_profielen").select("id").eq("user_id", profiel.id).maybeSingle();
    if (!bp) {
      fail(`${email}: rol bewoner maar geen bewoner_profielen-rij — zou vastlopen op /plan`);
      continue;
    }
  }

  sessies[email] = { client, userId: profiel.id, rol: verwachteRol };
  pass(`${email} — login ok, rol '${verwachteRol}' correct, landt op ${verwachteRol === "vakman" ? "/dashboard" : "/plan"}`);
}

// ══════════════════════════════════════════════════════════════
// 4. RLS: bewoner mag geen vakmandata van een ander muteren
// ══════════════════════════════════════════════════════════════
console.log("\n── 4. RLS: bewoner kan geen vakmanprofiel muteren ──");

const bewonerSessie = sessies["demo.bewoner.actief@neighbuur.test"];
const { data: eenVakman } = await admin.from("vakman_profielen").select("id, bedrijfsnaam").eq("user_id", sessies["demo.vakman.top@neighbuur.test"]?.userId).maybeSingle();

if (bewonerSessie && eenVakman) {
  const { data: updateResult, error: updateErr } = await bewonerSessie.client
    .from("vakman_profielen")
    .update({ bedrijfsnaam: "GEHACKT" })
    .eq("id", eenVakman.id)
    .select();

  if (updateErr) {
    pass(`bewoner-update op vakman_profielen geweigerd door RLS (${updateErr.message})`);
  } else if (!updateResult || updateResult.length === 0) {
    pass("bewoner-update op vakman_profielen: RLS liet 0 rijen toe (policy 'own_manage' filtert stil, geen wijziging)");
  } else {
    fail(`bewoner kon vakman_profielen van iemand anders wijzigen! (${eenVakman.bedrijfsnaam} -> GEHACKT)`);
    // direct herstellen
    await admin.from("vakman_profielen").update({ bedrijfsnaam: eenVakman.bedrijfsnaam }).eq("id", eenVakman.id);
  }
} else {
  warn("kon RLS-check 'bewoner muteert vakman' niet uitvoeren (sessie of testdata ontbreekt)");
}

// Ter vergelijking: bewoner mag WEL zijn eigen bewoner_profielen updaten
if (bewonerSessie) {
  const { error: ownUpdateErr } = await bewonerSessie.client
    .from("bewoner_profielen")
    .update({ adres: "Testlaan 1" })
    .eq("user_id", bewonerSessie.userId);
  if (ownUpdateErr) {
    warn(`bewoner kon eigen bewoner_profielen niet updaten (${ownUpdateErr.message}) — mogelijk te streng`);
  } else {
    pass("bewoner kan (zoals verwacht) wel zijn eigen bewoner_profielen updaten");
  }
}

// ══════════════════════════════════════════════════════════════
// 5. RLS: vakman ziet geen boekingen/berichten van een bewoner die niet van hem is
// ══════════════════════════════════════════════════════════════
console.log("\n── 5. RLS: vakman ziet geen privédata van andere bewoners ──");

const vakmanSessie = sessies["demo.vakman.geenleads@neighbuur.test"]; // heeft bewust 0 eigen boekingen
if (vakmanSessie) {
  const { data: zichtbareBoekingen, error: boekingErr } = await vakmanSessie.client.from("boekingen").select("id, klant_id, vakman_id");
  if (boekingErr) {
    warn(`vakman-select op boekingen gaf een fout (${boekingErr.message}) i.p.v. gefilterde lege lijst`);
  } else if ((zichtbareBoekingen ?? []).length === 0) {
    pass("vakman zonder eigen boekingen ziet 0 boekingen via RLS (policy 'own_read' filtert correct)");
  } else {
    fail(`vakman zonder eigen boekingen ziet toch ${zichtbareBoekingen.length} boeking(en) van anderen!`);
  }

  const { data: zichtbareBerichten, error: berichtErr } = await vakmanSessie.client.from("berichten").select("id, gesprek_id, van_id, tekst");
  if (berichtErr) {
    warn(`vakman-select op berichten gaf een fout (${berichtErr.message}) i.p.v. gefilterde lege lijst`);
  } else if ((zichtbareBerichten ?? []).length === 0) {
    pass("vakman zonder eigen gesprekken ziet 0 berichten via RLS (policy 'own_read' filtert correct)");
  } else {
    fail(`vakman zonder eigen gesprekken ziet toch ${zichtbareBerichten.length} bericht(en) van anderen!`);
  }
} else {
  warn("kon RLS-check 'vakman ziet andermans data' niet uitvoeren (sessie ontbreekt)");
}

// Ter vergelijking: de "actief"-bewoner moet wél haar eigen gesprek zien
const actiefSessie = sessies["demo.bewoner.actief@neighbuur.test"];
if (actiefSessie) {
  const { data: eigenBerichten, error } = await actiefSessie.client.from("berichten").select("id, tekst");
  if (error) {
    warn(`bewoner 'actief' kon eigen berichten niet lezen (${error.message})`);
  } else if ((eigenBerichten ?? []).length > 0) {
    pass(`bewoner 'actief' ziet (zoals verwacht) ${eigenBerichten.length} eigen bericht(en)`);
  } else {
    fail("bewoner 'actief' zou minstens 1 eigen bericht moeten zien (gesprek uit seed-demo-accounts.mjs), maar ziet er 0");
  }
}

// ══════════════════════════════════════════════════════════════
console.log("\n════════════════════════════════════════════════════════");
if (fouten === 0) {
  console.log(`Alle checks geslaagd${waarschuwingen ? ` (${waarschuwingen} waarschuwing(en), geen blokkerende fouten)` : ""}.`);
} else {
  console.log(`${fouten} fout(en) gevonden, ${waarschuwingen} waarschuwing(en). Zie hierboven.`);
}
process.exit(fouten > 0 ? 1 : 0);

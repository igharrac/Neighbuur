/**
 * Genereert een kant-en-klare, eenmalig bruikbare inloglink voor een
 * demo-account — open 'm in je browser en je bent meteen ingelogd, zonder
 * dat er een e-mail hoeft te worden verstuurd.
 *
 * Waarom dit nodig is: het echte /login-scherm stuurt alleen een code per
 * e-mail/sms. Dat werkt niet voor de @neighbuur.test-demo-adressen, want
 * Supabase weigert daar sowieso naartoe te versturen ("Email address ...
 * is invalid" — .test is een gereserveerd, niet-bestaand domein volgens
 * RFC 2606). Deze link gaat via de Supabase admin-API rechtstreeks een
 * sessie aanmaken, zonder de blokkerende verzendstap.
 *
 * Gebruik:
 *   node scripts/demo-login-link.mjs demo.bewoner.vol@neighbuur.test
 *   node scripts/demo-login-link.mjs demo.vakman.top@neighbuur.test
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

const email = process.argv[2];
if (!email) {
  console.error("Gebruik: node scripts/demo-login-link.mjs <email>");
  process.exit(1);
}

const APP_URL = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: profiel } = await admin.from("profiles").select("id, name, role").eq("email", email).maybeSingle();
if (!profiel) {
  console.error(`Geen profiel gevonden voor ${email}`);
  process.exit(1);
}

const next = profiel.role === "vakman" ? "/dashboard" : "/plan";
const { data, error } = await admin.auth.admin.generateLink({
  type: "magiclink",
  email,
  options: { redirectTo: `${APP_URL}/auth/magic?next=${encodeURIComponent(next)}` },
});
if (error) throw new Error(error.message);

console.log(`\n${profiel.name} (${profiel.role}) — ${email}`);
console.log(`\nOpen deze link in je browser om direct ingelogd te zijn:\n`);
console.log(data.properties.action_link);
console.log(`\nEenmalig bruikbaar, geldig 1 uur.`);

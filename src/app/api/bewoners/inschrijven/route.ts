import { NextResponse } from "next/server";
import { createPublicSupabase } from "@/lib/supabase-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lichte lead-capture voor /bewoners/inschrijven — geen account, geen
 * magic-link, alleen een rij in resident_interest_signups (public_insert
 * RLS, zie migratie 0065). Bewust geen Supabase Auth hier: de brief wil
 * dit binnen 20 seconden afrondbaar, een auth-roundtrip zou dat breken.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const postcode = String(body.postcode ?? "").trim();
  const homePlans = body.homePlans ? String(body.homePlans).trim() : null;
  const lang = body.lang === "en" ? "en" : "nl";
  const utm = body.utm ?? {};

  if (!firstName || !postcode || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Vul alle verplichte velden correct in" }, { status: 400 });
  }

  const supabase = createPublicSupabase();
  const { error } = await supabase.from("resident_interest_signups").insert({
    first_name: firstName,
    email,
    postcode,
    home_plans: homePlans,
    lang,
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
    utm_content: utm.utm_content ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

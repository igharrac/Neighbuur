import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import type { ReviewScores } from "@/types";

const MIN_TEKST = 20;
const MAX_TEKST = 500;
const MAX_FOTOS = 5;
const SCORE_KEYS: (keyof ReviewScores)[] = ["kwaliteit", "stiptheid", "communicatie", "prijs"];

/**
 * Reviews met een booking_id gelden als "geverifieerde opdracht" (zie
 * review_complete.verified). Die belofte is alleen waar als hier —
 * server-side, met de service role — daadwerkelijk gecontroleerd wordt
 * dat de boeking van deze klant is, bij deze vakman hoort en afgerond
 * is. Voorheen gebeurde de insert rechtstreeks vanuit de browser met
 * alleen een "author_id = auth.uid()"-RLS-check, wat booking_id volledig
 * ongevalideerd liet — precies het lek dat verified onbetrouwbaar maakte.
 */
export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const professionalId = body?.professionalId as string | undefined;
  const bookingId = (body?.bookingId as string | null | undefined) ?? null;
  const text = (body?.text as string | undefined)?.trim() ?? "";
  const scoresInput = (body?.scores as Partial<ReviewScores> | undefined) ?? {};
  const fotoUrls = Array.isArray(body?.fotoUrls) ? (body.fotoUrls as string[]).slice(0, MAX_FOTOS) : [];

  if (!professionalId) return NextResponse.json({ error: "Vakman ontbreekt" }, { status: 400 });
  if (text.length < MIN_TEKST || text.length > MAX_TEKST) {
    return NextResponse.json({ error: `Tekst moet tussen ${MIN_TEKST} en ${MAX_TEKST} tekens zijn` }, { status: 400 });
  }
  const scores: Partial<ReviewScores> = {};
  for (const key of SCORE_KEYS) {
    const v = scoresInput[key];
    if (v !== undefined) {
      if (typeof v !== "number" || v < 1 || v > 5) {
        return NextResponse.json({ error: "Ongeldige score" }, { status: 400 });
      }
      scores[key] = v;
    }
  }

  const admin = createAdminSupabase();

  let communityId: string | null = null;

  if (bookingId) {
    const { data: boeking } = await admin
      .from("bookings")
      .select("id, customer_id, professional_id, status, community_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!boeking) return NextResponse.json({ error: "Boeking niet gevonden" }, { status: 404 });
    if (boeking.customer_id !== user.id) {
      return NextResponse.json({ error: "Deze boeking hoort niet bij jouw account" }, { status: 403 });
    }
    if (boeking.professional_id !== professionalId) {
      return NextResponse.json({ error: "Deze boeking hoort niet bij deze vakman" }, { status: 400 });
    }
    if (boeking.status !== "completed") {
      return NextResponse.json({ error: "Alleen afgeronde opdrachten kunnen een geverifieerde review krijgen" }, { status: 400 });
    }
    communityId = boeking.community_id;
  } else {
    // Onverifieerde review (geen boeking) — community_id komt uit het
    // huidige woonprofiel van de auteur, puur voor de "reviews uit deze
    // buurt"-weergave, niet voor verificatie.
    const { data: bewonerProfiel } = await admin.from("resident_profiles").select("community_id").eq("user_id", user.id).maybeSingle();
    communityId = bewonerProfiel?.community_id ?? null;
  }

  const { data: review, error: insertError } = await admin
    .from("reviews")
    .insert({
      author_id: user.id,
      professional_id: professionalId,
      booking_id: bookingId,
      community_id: communityId,
      text,
      scores,
      foto_urls: fotoUrls,
    })
    .select("id, author_id, professional_id, booking_id, community_id, text, scores, foto_urls, upvote_score, created_at, updated_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Deze boeking is al gereviewd" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message ?? "Review plaatsen is niet gelukt" }, { status: 500 });
  }

  return NextResponse.json({ review });
}

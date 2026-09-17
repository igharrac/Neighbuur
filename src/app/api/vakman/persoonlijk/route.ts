import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * Het persoonlijke/inlog-afhankelijke deel van een vakmanprofiel —
 * losgetrokken van de publieke paginadata (vakman/[slug]/page.tsx) zodat
 * die laatste zonder cookies() gerenderd kan worden en dus ISR-gecached
 * mag zijn. Deze route zelf blijft wél altijd dynamisch (logisch, moet
 * de sessie lezen) maar dat kost alleen de secundaire, niet-LCP-
 * kritische UI (eigenaar-knoppen, "al gereviewed", stem-status,
 * buurt-badge) — nooit de zichtbare hoofdinhoud.
 */
export async function POST(request: Request) {
  const { professionalId } = await request.json();
  if (!professionalId) {
    return NextResponse.json({ error: "professionalId ontbreekt" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  const [{ data: professional }, { data: reviews }, {
    data: { user },
  }] = await Promise.all([
    supabase.from("professional_profiles").select("user_id").eq("id", professionalId).maybeSingle(),
    supabase.from("reviews").select("id, author_id, booking_id, community_id").eq("professional_id", professionalId),
    supabase.auth.getUser(),
  ]);

  if (!user) {
    return NextResponse.json({
      isLoggedIn: false,
      isOwner: false,
      heeftAlGereviewed: false,
      votedReviewIds: [],
      communityId: null,
      opdrachtenInJouwBuurt: 0,
    });
  }

  const isOwner = professional?.user_id === user.id;
  const heeftAlGereviewed = (reviews ?? []).some((r) => r.author_id === user.id);
  const reviewIds = (reviews ?? []).map((r) => r.id);

  const [votesResult, bewonerResult] = await Promise.all([
    reviewIds.length > 0
      ? supabase.from("review_votes").select("review_id").eq("user_id", user.id).in("review_id", reviewIds)
      : Promise.resolve({ data: [] as { review_id: string }[] }),
    supabase.from("resident_profiles").select("community_id").eq("user_id", user.id).maybeSingle(),
  ]);

  const communityId = bewonerResult.data?.community_id ?? null;
  // "geverifieerd" = booking_id is gezet, zelfde logica als de
  // review_complete-view — hier op de rauwe reviews-tabel, want deze
  // route selecteert bewust maar een paar kolommen.
  const opdrachtenInJouwBuurt = communityId
    ? (reviews ?? []).filter((r) => r.booking_id !== null && r.community_id === communityId).length
    : 0;

  return NextResponse.json({
    isLoggedIn: true,
    isOwner,
    heeftAlGereviewed,
    votedReviewIds: (votesResult.data ?? []).map((v) => v.review_id as string),
    communityId,
    opdrachtenInJouwBuurt,
  });
}

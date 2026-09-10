import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";
import type { ReviewScores } from "@/types";

/** Notificeert de vakman (in-app + push + e-mail) nadat een klant een review heeft geplaatst. */
export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const reviewId = body?.reviewId as string | undefined;
  if (!reviewId) return NextResponse.json({ error: "reviewId ontbreekt" }, { status: 400 });

  const admin = createAdminSupabase();

  const { data: review } = await admin
    .from("reviews")
    .select("id, auteur_id, vakman_id, scores, vakman_profielen(user_id, bedrijfsnaam, slug)")
    .eq("id", reviewId)
    .maybeSingle();
  if (!review || review.auteur_id !== user.id) {
    return NextResponse.json({ error: "Review niet gevonden" }, { status: 404 });
  }

  const vakman = review.vakman_profielen as unknown as { user_id: string; bedrijfsnaam: string; slug: string } | null;
  if (!vakman) return NextResponse.json({ ok: true });

  const { data: auteurProfiel } = await admin.from("profielen").select("naam").eq("id", user.id).maybeSingle();
  const klantNaam = auteurProfiel?.naam ?? "Een klant";

  const scores = review.scores as ReviewScores;
  const scoreWaarden = Object.values(scores ?? {}).filter((v): v is number => typeof v === "number");
  const sterren = scoreWaarden.length
    ? Math.round(scoreWaarden.reduce((a, b) => a + b, 0) / scoreWaarden.length)
    : 5;

  const link = `/vakman/${vakman.slug}#reviews`;

  await notifyUser(admin, {
    userId: vakman.user_id,
    type: "review",
    titelNl: "Nieuwe review ontvangen",
    titelEn: "New review received",
    inhoudNl: `${klantNaam} heeft een review van ${sterren} sterren achtergelaten.`,
    inhoudEn: `${klantNaam} left a ${sterren}-star review.`,
    link,
    email: { type: "review-ontvangen", data: { klantNaam, sterren, link } },
  });

  return NextResponse.json({ ok: true });
}

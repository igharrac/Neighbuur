import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { VakmanProfielClient } from "@/components/features/vakman/VakmanProfielClient";
import type { ReviewComplete, ProfessionalProfile } from "@/types";

export default async function VakmanPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!professional) notFound();

  // Deze twee zijn onafhankelijk van elkaar (de een leest profiles, de
  // ander is een cookie-check) — parallel laten lopen scheelt een hele
  // netwerk-rondreis t.o.v. twee losse awaits.
  const [{ data: eigenaarProfiel }, {
    data: { user: viewer },
  }] = await Promise.all([
    supabase.from("profiles").select("deactivated_at, deleted_at").eq("id", professional.user_id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (eigenaarProfiel?.deleted_at) notFound();

  const bekijktEigenProfiel = !!viewer && viewer.id === professional.user_id;

  if (eigenaarProfiel?.deactivated_at && !bekijktEigenProfiel) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-display-sm text-warmzwart mb-2">Dit profiel is tijdelijk niet actief</h1>
        <p className="text-body text-warmgrijs">Deze vakman heeft zijn profiel gepauzeerd. Kom later nog eens terug.</p>
      </div>
    );
  }

  const user = viewer;

  // Reviews, beschikbaarheid en categorieën hangen alledrie alleen af van
  // professional.id (of van niets) — geen enkele reden om ze na elkaar
  // op te halen. author_name/author_avatar worden bewust niet
  // opgehaald — deze pagina is publiek (ook voor niet-ingelogde
  // bezoekers), en een review mag geen bewoner identificeerbaar maken.
  // "Buur" hieronder vervangt de echte naam voordat er ook maar iets
  // naar de client gaat.
  const [{ data: reviews }, { data: beschikbaarheidRows }, alleCategorieen] = await Promise.all([
    supabase
      .from("review_complete")
      .select(
        "id, author_id, professional_id, booking_id, community_id, text, scores, foto_urls, upvote_score, created_at, updated_at, reply_text, reply_date, reply_company, verified"
      )
      .eq("professional_id", professional.id)
      .order("upvote_score", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("availability").select("date, status").eq("professional_id", professional.id),
    getCategorieen(),
  ]);

  const alleReviews = (reviews ?? []).map((r) => ({ ...r, author_name: "Buur", author_avatar: null })) as ReviewComplete[];
  const vakmanCategorieen = alleCategorieen.filter((c) => c.type === "professional");

  const beschikbaarheid: Record<string, "available" | "booked"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  let votedReviewIds: string[] = [];
  let communityId: string | null = null;

  if (user) {
    const reviewIds = alleReviews.map((r) => r.id);
    const [votesResult, bewonerResult] = await Promise.all([
      reviewIds.length > 0
        ? supabase.from("review_votes").select("review_id").eq("user_id", user.id).in("review_id", reviewIds)
        : Promise.resolve({ data: [] as { review_id: string }[] }),
      supabase.from("resident_profiles").select("community_id").eq("user_id", user.id).maybeSingle(),
    ]);
    votedReviewIds = (votesResult.data ?? []).map((v) => v.review_id as string);
    communityId = bewonerResult.data?.community_id ?? null;
  }

  const isOwner = !!user && user.id === professional.user_id;
  const heeftAlGereviewed = !!user && alleReviews.some((r) => r.author_id === user.id);

  // Alleen geverifieerde reviews tellen mee — "opdrachten uitgevoerd",
  // niet "reviews geschreven". Drempel (magBuurtAantalTonen) zit in de
  // client-component, hier alleen het rauwe aantal berekenen.
  const opdrachtenInJouwBuurt = communityId
    ? alleReviews.filter((r) => r.verified && r.community_id === communityId).length
    : 0;

  return (
    <VakmanProfielClient
      professional={professional as ProfessionalProfile}
      reviews={alleReviews}
      votedReviewIds={votedReviewIds}
      isOwner={isOwner}
      isLoggedIn={!!user}
      heeftAlGereviewed={heeftAlGereviewed}
      communityId={communityId}
      opdrachtenInJouwBuurt={opdrachtenInJouwBuurt}
      beschikbaarheid={beschikbaarheid}
      categories={vakmanCategorieen}
    />
  );
}

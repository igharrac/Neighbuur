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

  const { data: eigenaarProfiel } = await supabase
    .from("profiles")
    .select("deactivated_at, deleted_at")
    .eq("id", professional.user_id)
    .maybeSingle();

  if (eigenaarProfiel?.deleted_at) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  const bekijktEigenProfiel = !!viewer && viewer.id === professional.user_id;

  if (eigenaarProfiel?.deactivated_at && !bekijktEigenProfiel) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-display-sm text-warmzwart mb-2">Dit profiel is tijdelijk niet actief</h1>
        <p className="text-body text-warmgrijs">Deze vakman heeft zijn profiel gepauzeerd. Kom later nog eens terug.</p>
      </div>
    );
  }

  const { data: reviews } = await supabase
    .from("review_complete")
    .select("*")
    .eq("professional_id", professional.id)
    .order("upvote_score", { ascending: false })
    .order("created_at", { ascending: false });

  const alleReviews = (reviews ?? []) as ReviewComplete[];
  const user = viewer;

  let votedReviewIds: string[] = [];
  let communityId: string | null = null;

  if (user) {
    const reviewIds = alleReviews.map((r) => r.id);
    if (reviewIds.length > 0) {
      const { data: votes } = await supabase
        .from("review_votes")
        .select("review_id")
        .eq("user_id", user.id)
        .in("review_id", reviewIds);
      votedReviewIds = (votes ?? []).map((v) => v.review_id as string);
    }

    const { data: bewoner } = await supabase
      .from("resident_profiles")
      .select("community_id")
      .eq("user_id", user.id)
      .maybeSingle();
    communityId = bewoner?.community_id ?? null;
  }

  const isOwner = !!user && user.id === professional.user_id;
  const heeftAlGereviewed = !!user && alleReviews.some((r) => r.author_id === user.id);

  const { data: beschikbaarheidRows } = await supabase
    .from("availability")
    .select("date, status")
    .eq("professional_id", professional.id);

  const beschikbaarheid: Record<string, "available" | "booked"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  const alleCategorieen = await getCategorieen();
  const vakmanCategorieen = alleCategorieen.filter((c) => c.type === "professional");

  return (
    <VakmanProfielClient
      professional={professional as ProfessionalProfile}
      reviews={alleReviews}
      votedReviewIds={votedReviewIds}
      isOwner={isOwner}
      isLoggedIn={!!user}
      heeftAlGereviewed={heeftAlGereviewed}
      communityId={communityId}
      beschikbaarheid={beschikbaarheid}
      categories={vakmanCategorieen}
    />
  );
}

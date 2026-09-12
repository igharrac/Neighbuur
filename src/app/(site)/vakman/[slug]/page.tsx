import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { VakmanProfielClient } from "@/components/features/vakman/VakmanProfielClient";
import type { ReviewCompleet, VakmanProfiel } from "@/types";

export default async function VakmanPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: vakman } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!vakman) notFound();

  const { data: reviews } = await supabase
    .from("review_compleet")
    .select("*")
    .eq("vakman_id", vakman.id)
    .order("upvote_score", { ascending: false })
    .order("created_at", { ascending: false });

  const alleReviews = (reviews ?? []) as ReviewCompleet[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const isOwner = !!user && user.id === vakman.user_id;
  const heeftAlGereviewed = !!user && alleReviews.some((r) => r.auteur_id === user.id);

  const { data: beschikbaarheidRows } = await supabase
    .from("availability")
    .select("date, status")
    .eq("professional_id", vakman.id);

  const beschikbaarheid: Record<string, "beschikbaar" | "bezet"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  const alleCategorieen = await getCategorieen();
  const vakmanCategorieen = alleCategorieen.filter((c) => c.type === "professional");

  return (
    <VakmanProfielClient
      vakman={vakman as VakmanProfiel}
      reviews={alleReviews}
      votedReviewIds={votedReviewIds}
      isOwner={isOwner}
      isLoggedIn={!!user}
      heeftAlGereviewed={heeftAlGereviewed}
      communityId={communityId}
      beschikbaarheid={beschikbaarheid}
      categorieen={vakmanCategorieen}
    />
  );
}

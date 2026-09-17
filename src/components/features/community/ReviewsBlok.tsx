import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { Avatar } from "@/components/ui/Avatar";
import { UpvoteButton } from "@/components/features/reviews/UpvoteButton";

interface ReviewsBlokData {
  aantal?: number;
}

interface ReviewRow {
  id: string;
  text: string;
  scores: Record<string, number>;
  upvote_score: number;
  verified: boolean;
  created_at: string;
}

export async function ReviewsBlok({ data, community_id }: { data: ReviewsBlokData; community_id: string }) {
  const aantal = data.aantal ?? 5;
  const supabase = createServerSupabase();
  // author_name/author_avatar bewust niet opgehaald — zie toelichting in
  // vakman/[slug]/page.tsx.
  const { data: reviews } = await supabase
    .from("review_complete")
    .select("id, text, scores, upvote_score, verified, created_at")
    .eq("community_id", community_id)
    .order("upvote_score", { ascending: false })
    .limit(aantal);

  const rows = (reviews ?? []) as ReviewRow[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let votedReviewIds: string[] = [];
  if (user && rows.length > 0) {
    const { data: votes } = await supabase
      .from("review_votes")
      .select("review_id")
      .eq("user_id", user.id)
      .in("review_id", rows.map((r) => r.id));
    votedReviewIds = (votes ?? []).map((v) => v.review_id as string);
  }
  const votedSet = new Set(votedReviewIds);

  return (
    <div>
      <h3 className="font-display text-display-sm text-warmzwart mb-4">Reviews uit deze buurt</h3>
      {rows.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Nog geen reviews in deze buurt.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.id} className="border border-lijn rounded-md p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <Avatar naam="Buur" size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-body-sm">Buur</span>
                      {r.verified && <SealCheck size={14} weight="fill" className="text-groen" />}
                    </div>
                    <span className="text-body-xs text-warmgrijs">
                      {new Date(r.created_at).toLocaleDateString("nl-NL")}
                    </span>
                  </div>
                </div>
                <UpvoteButton reviewId={r.id} initialScore={r.upvote_score} initialVoted={votedSet.has(r.id)} />
              </div>
              <p className="text-body-sm text-warmgrijs-dark leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/Avatar";
import { UpvoteButton } from "./UpvoteButton";
import { ReplyForm } from "./ReplyForm";
import type { ReviewComplete } from "@/types";

const SCORE_LABELS: Record<string, string> = {
  kwaliteit: "kwaliteit",
  stiptheid: "stipt op tijd",
  communicatie: "communicatie",
  prijs: "prijs",
};

function relatief(datum: string): string {
  const dagen = Math.floor((Date.now() - new Date(datum).getTime()) / 86400000);
  if (dagen < 1) return "Vandaag";
  if (dagen === 1) return "1 dag geleden";
  if (dagen < 7) return `${dagen} dagen geleden`;
  const weken = Math.floor(dagen / 7);
  if (weken < 5) return `${weken} ${weken === 1 ? "week" : "weken"} geleden`;
  const maanden = Math.floor(dagen / 30);
  return `${maanden} ${maanden === 1 ? "maand" : "maanden"} geleden`;
}

interface ReviewCardProps {
  review: ReviewComplete;
  vakmanId: string;
  bedrijfsnaam: string;
  isVakmanOwner: boolean;
  initialVoted: boolean;
}

export function ReviewCard({ review, vakmanId, bedrijfsnaam, isVakmanOwner, initialVoted }: ReviewCardProps) {
  return (
    <div className="card-flat p-6">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar naam={review.author_name} src={review.author_avatar} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-body-sm">{review.author_name}</span>
              {review.verified && (
                <span className="badge badge-groen !text-[9px] !py-0 !px-2">
                  <SealCheck size={10} weight="fill" /> Geverifieerde klus
                </span>
              )}
            </div>
            <div className="text-body-xs text-warmgrijs">
              {review.community_name ? `${review.community_name} · ` : ""}
              {relatief(review.created_at)}
            </div>
          </div>
        </div>
        <UpvoteButton reviewId={review.id} initialScore={review.upvote_score} initialVoted={initialVoted} />
      </div>

      <p className="text-body-sm text-warmgrijs-dark leading-relaxed mb-3">{review.text}</p>

      {review.foto_urls.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
          {review.foto_urls.map((url) => (
            <img key={url} src={url} alt="" className="w-20 h-20 rounded-md object-cover shrink-0" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(review.scores).map(([key, val]) =>
          val ? (
            <span key={key} className="badge badge-groen">
              {val}.0 {SCORE_LABELS[key] ?? key}
            </span>
          ) : null
        )}
      </div>

      <ReplyForm
        reviewId={review.id}
        vakmanId={vakmanId}
        bedrijfsnaam={bedrijfsnaam}
        isOwner={isVakmanOwner}
        initialTekst={review.reply_text}
      />
    </div>
  );
}

import type { ReactNode } from "react";

interface AuthQuoteCardProps {
  quote: string;
  meta: ReactNode;
}

/** Zwevende quote-/testimonial-kaart voor onderin het fotopaneel van AuthSplitScreen. */
export function AuthQuoteCard({ quote, meta }: AuthQuoteCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-strong p-4">
      <p className="font-semibold text-body-sm text-warmzwart leading-snug">{quote}</p>
      <div className="text-body-xs text-warmgrijs-dark mt-2">{meta}</div>
    </div>
  );
}

interface AuthRatingBadgeProps {
  score: string;
  label: string;
}

/** Zwevend sterren-/ratingbadge bovenin het fotopaneel van AuthSplitScreen. */
export function AuthRatingBadge({ score, label }: AuthRatingBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full shadow-medium px-4 py-2">
      <span className="text-oker text-body-sm tracking-wide">★★★★★</span>
      <span className="font-bold text-body-sm text-warmzwart">{score}</span>
      <span className="text-body-xs text-warmgrijs">{label}</span>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Star, CheckCircle, SealCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PremiumBadge } from "@/components/features/premium/PremiumBadge";
import type { ProfessionalOverview } from "@/types";

interface VakmanCardProps {
  vakman: ProfessionalOverview;
  categorieNamen: string[];
}

export function VakmanCard({ vakman, categorieNamen }: VakmanCardProps) {
  const initiaal = vakman.company_name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/vakman/${vakman.slug}`}
      className="card-flat p-5 flex items-center gap-4 no-underline min-h-11"
    >
      {vakman.logo_url ? (
        <img src={vakman.logo_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-terracotta to-terracotta-700 flex items-center justify-center text-white font-display font-black text-xl shrink-0">
          {initiaal}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-body-lg text-warmzwart truncate min-w-0">{vakman.company_name}</h3>
          {vakman.review_count > 0 && (
            <span className="flex items-center gap-1 text-body-sm font-semibold text-warmzwart shrink-0">
              <Star size={14} weight="fill" className="text-oker" />
              {vakman.avg_score.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-body-sm text-warmgrijs truncate">
          {categorieNamen.length > 0 && `${categorieNamen.join(", ")} · `}
          {vakman.service_area_postcode && `${vakman.service_area_postcode} · `}
          {vakman.review_count} {vakman.review_count === 1 ? "review" : "reviews"}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {vakman.is_premium && <PremiumBadge />}
          {vakman.verified && (
            <span className="badge badge-groen !text-[10px] !py-0.5 !px-2">
              <CheckCircle size={10} weight="fill" /> Geverifieerd
            </span>
          )}
          {vakman.profile_strength >= 80 && (
            <span className="badge badge-blauw !text-[10px] !py-0.5 !px-2">
              <SealCheck size={10} weight="fill" /> Profiel compleet
            </span>
          )}
        </div>
      </div>

      <ArrowRight size={18} className="text-warmgrijs shrink-0" />
    </Link>
  );
}

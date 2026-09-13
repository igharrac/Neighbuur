/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Star, CheckCircle, SealCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PremiumBadge } from "@/components/features/premium/PremiumBadge";
import type { ProfessionalOverview } from "@/types";

interface VakmanCardProps {
  professional: ProfessionalOverview;
  categoryNames: string[];
}

export function VakmanCard({ professional, categoryNames }: VakmanCardProps) {
  const initiaal = professional.company_name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/vakman/${professional.slug}`}
      className="card-flat p-5 flex items-center gap-4 no-underline min-h-11"
    >
      {professional.logo_url ? (
        <img src={professional.logo_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-terracotta to-terracotta-700 flex items-center justify-center text-white font-display font-black text-xl shrink-0">
          {initiaal}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-body-lg text-warmzwart truncate min-w-0">{professional.company_name}</h3>
          {professional.review_count > 0 && (
            <span className="flex items-center gap-1 text-body-sm font-semibold text-warmzwart shrink-0">
              <Star size={14} weight="fill" className="text-oker" />
              {professional.avg_score.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-body-sm text-warmgrijs truncate">
          {categoryNames.length > 0 && `${categoryNames.join(", ")} · `}
          {professional.service_area_postcode && `${professional.service_area_postcode} · `}
          {professional.review_count} {professional.review_count === 1 ? "review" : "reviews"}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {professional.is_premium && <PremiumBadge />}
          {professional.verified && (
            <span className="badge badge-groen !text-[10px] !py-0.5 !px-2">
              <CheckCircle size={10} weight="fill" /> Geverifieerd
            </span>
          )}
          {professional.profile_strength >= 80 && (
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

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Star, CheckCircle, SealCheck, ArrowRight, Lightning } from "@phosphor-icons/react/dist/ssr";
import { PremiumBadge } from "@/components/features/premium/PremiumBadge";
import { magBuurtOpdrachtenBadgeTonen } from "@/lib/localTrust";
import type { ProfessionalOverview } from "@/types";

interface VakmanCardProps {
  professional: ProfessionalOverview;
  categoryNames: string[];
  /** Berekende afstand tot een opgegeven zoeklocatie (alleen gezet als er gezocht is op locatie). */
  distanceKm?: number;
  /** Naam van de opgegeven zoeklocatie, voor de "buren kozen"-badge. */
  buurtPlaats?: string | null;
  /** Aantal afgeronde Neighbuur-opdrachten van deze provider in buurtPlaats. */
  buurtOpdrachten?: number;
}

export function VakmanCard({ professional, categoryNames, distanceKm, buurtPlaats, buurtOpdrachten }: VakmanCardProps) {
  const initiaal = professional.company_name.charAt(0).toUpperCase();
  const hoofdCategorie = categoryNames[0];
  const toonBuurtBadge = buurtPlaats && magBuurtOpdrachtenBadgeTonen(buurtOpdrachten ?? 0);

  return (
    <Link
      href={`/vakman/${professional.slug}`}
      className="card-flat p-5 flex items-center gap-4 no-underline min-h-11"
    >
      {professional.logo_url ? (
        <img src={professional.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sage to-sage-700 flex flex-col items-center justify-center text-white shrink-0 px-1">
          <span className="font-display font-black text-xl leading-none">{initiaal}</span>
          {hoofdCategorie && (
            <span className="text-[8px] font-semibold uppercase tracking-wider text-sage-100 mt-1 text-center leading-tight line-clamp-1">
              {hoofdCategorie}
            </span>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-display font-bold text-body-lg text-warmzwart min-w-0 break-words">{professional.company_name}</h3>
          {professional.review_count > 0 && (
            <span className="flex items-center gap-1 bg-oker-light text-oker text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              <Star size={11} weight="fill" />
              {professional.avg_score.toFixed(1)}
              <span className="font-medium opacity-80">({professional.review_count})</span>
            </span>
          )}
        </div>
        <p className="text-body-sm text-warmgrijs truncate mt-0.5">
          {categoryNames.length > 0 && `${categoryNames.join(", ")} · `}
          {distanceKm !== undefined
            ? `${distanceKm < 1 ? "< 1" : distanceKm.toFixed(1)} km`
            : professional.service_area_postcode}
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
          {toonBuurtBadge && (
            <span className="badge !bg-sage-100 !text-sage-700 !text-[10px] !py-0.5 !px-2">
              <Lightning size={10} weight="fill" /> {buurtOpdrachten} buren uit {buurtPlaats} kozen {professional.company_name}
            </span>
          )}
        </div>
      </div>

      <ArrowRight size={18} className="text-warmgrijs shrink-0" />
    </Link>
  );
}

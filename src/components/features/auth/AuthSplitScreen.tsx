/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/layout/nav";
import type { ReactNode } from "react";

interface AuthSplitScreenProps {
  photoUrl: string;
  photoAlt: string;
  topBadge?: ReactNode;
  bottomCard?: ReactNode;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Gedeelde shell voor alle auth-schermen (inloggen, check-je-mail,
 * vakman-registratiestappen): links het formulier, rechts een foto met
 * een optioneel badge/kaart-overlay. Bouwt op bestaande designtokens
 * (sage/warmzwart/warmgrijs/cream/lijn, .btn-primary/.input/shadow-*)
 * voort, introduceert geen nieuwe stijlen.
 *
 * Op mobiel bewust GEEN gecentreerde kaart met rand/schaduw (voelde als
 * een modal bovenop een pagina) — volle breedte/hoogte, natuurlijke
 * doorloop i.p.v. geforceerde viewport-centrering (voorkomt 100vh-
 * gedoe met mobiele browser-chrome), met een vaste terugknop+logo
 * bovenaan als duidelijke navigatie. Vanaf md: ongewijzigd de bestaande
 * gecentreerde split-kaart met foto.
 */
export function AuthSplitScreen({ photoUrl, photoAlt, topBadge, bottomCard, backLabel = "← Terug naar Neighbuur", children }: AuthSplitScreenProps) {
  return (
    <div className="min-h-screen bg-white md:flex md:items-center md:justify-center md:bg-cream-warm md:px-6 md:py-10">
      <div className="w-full md:max-w-[1200px]">
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            aria-label={backLabel.replace("← ", "")}
            className="w-9 h-9 -ml-1.5 flex items-center justify-center text-warmzwart"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <Logo />
          <span className="w-9" aria-hidden />
        </div>

        <div className="bg-white md:rounded md:border-2 md:border-warmzwart md:shadow-[3px_3px_0_0_#1A1A18] overflow-hidden grid grid-cols-1 md:grid-cols-2 md:min-h-[640px]">
          <div className="px-6 pb-10 sm:p-10 md:p-12 flex flex-col md:justify-center">{children}</div>

          <div className="hidden md:flex relative flex-col justify-between p-6">
            <img src={photoUrl} alt={photoAlt} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />

            {topBadge && <div className="relative">{topBadge}</div>}
            {bottomCard && <div className="relative mt-auto">{bottomCard}</div>}
          </div>
        </div>

        <p className="hidden md:block text-center mt-6">
          <Link href="/" className="text-body-sm text-warmgrijs hover:text-sage">
            {backLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

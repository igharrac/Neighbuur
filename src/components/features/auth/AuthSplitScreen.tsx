/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
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
 * een optioneel badge/kaart-overlay. Puur presentationeel — bouwt op
 * bestaande designtokens (sage/warmzwart/warmgrijs/cream/lijn,
 * .btn-primary/.input/shadow-*) voort, introduceert geen nieuwe stijlen.
 * backLabel is een prop (i.p.v. hardcoded) zodat elke caller 'm zelf kan
 * vertalen via haar eigen i18n-dict.
 */
export function AuthSplitScreen({ photoUrl, photoAlt, topBadge, bottomCard, backLabel = "← Terug naar Neighbuur", children }: AuthSplitScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-cream-warm">
      <div className="w-full max-w-[1200px]">
        <div className="bg-white rounded-2xl shadow-strong border border-lijn overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[640px]">
          <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">{children}</div>

          <div className="hidden md:flex relative flex-col justify-between p-6">
            <img src={photoUrl} alt={photoAlt} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />

            {topBadge && <div className="relative">{topBadge}</div>}
            {bottomCard && <div className="relative mt-auto">{bottomCard}</div>}
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-body-sm text-warmgrijs hover:text-sage">
            {backLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLang } from "@/lib/hooks/useLang";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { ProviderSteps } from "@/components/features/marketing/ProviderSteps";

/* Lokale SVG i.p.v. @phosphor-icons/react — zie neighbuur-a/page.tsx. */
function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/**
 * VARIANT D — SAMENVOEGING VOOR OVERNAME (herzien)
 * Eerste poging smolt de "why now"-sectie samen in de hero, maar de
 * feedback was dat die eigen sectie (met eigen titel/tekst/CTA, exact
 * zoals nu live) moest blijven bestaan — alleen hoger op de pagina
 * (vóór de stappen i.p.v. erna). De hero zelf krijgt alleen een
 * teaser-eyebrow + een duidelijkere illustratie (pin + signaalringen +
 * huisjes, i.p.v. abstracte losse cirkels).
 * Vanaf de stappen-sectie: de échte productiecomponenten
 * (MarketingHeader/ProviderSteps/MarketingFooter), zodat dit een
 * getrouwe preview is van hoe de samenvoeging er in productie
 * daadwerkelijk uit zou zien. Niets in de echte /(marketing)/page.tsx
 * is aangepast.
 */
export default function VakmanScenarioD() {
  const { dict } = useLang();

  return (
    <div className="bg-cream-warm min-h-screen">
      <MarketingHeader cross={{ href: "/bewoners", label: dict.marketing.forResidents }} />

      {/* ── HERO + WHY NOW SAMENGEVOEGD (uit vakman-c) ──
         Foto houdt haar eigen 3:2-verhouding (geen geforceerde hoogte-
         matching meer met de tekstkolom) en krijgt ruime ademruimte
         eronder vóór de volgende sectie begint. */}
      <section className="px-6 pt-4 pb-16 lg:px-[72px] lg:pt-4 lg:pb-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-x-10 lg:gap-x-12 gap-y-10 lg:items-start">
          <div className="lg:col-span-6">
            <div className="pb-4 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-[#385729]" />
                <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                  We bereiden regio&apos;s voor
                </span>
              </span>
            </div>
            <h1 className="font-display font-bold text-[38px] leading-[45px] sm:text-[54px] sm:leading-[60px] tracking-[-1px] text-warmzwart pb-5">
              <span className="block">{dict.providerHome.title}</span>
              <span className="block font-display italic font-normal text-[#385729]">{dict.providerHome.titleAccent}</span>
            </h1>
            <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[480px] pb-8">
              {dict.providerHome.body}
            </p>
            <Link
              href="/registreer/vakman"
              className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
            >
              {dict.providerHome.cta}
              <ArrowRight size={14} />
            </Link>
            <p className="font-body text-[13px] text-warmgrijs mt-3">{dict.providerHome.microcopy}</p>
          </div>

          <div className="lg:col-span-6">
            <img
              src="/design-explorations/hero-vakmensen-regio.png"
              alt="Vakmensen aan het werk in een nieuwbouwwijk, met een telefoon die het 'Jouw regio'-overzicht van nieuwe klussen toont"
              className="w-full aspect-[3/2] object-cover rounded block"
            />
          </div>
        </div>
      </section>

      {/* ── VANAF HIER: echte productiecomponenten, ongewijzigd ── */}
      <ProviderSteps />

      {/* ── WHY NOW — los blok, zoals nu live, alleen hoger geplaatst (vóór de bewoners-link i.p.v. onderaan).
         Na de stappen i.p.v. direct na de hero, zodat de twee CTA-knoppen niet vlak op elkaar staan. ── */}
      <section className="px-6 py-16 lg:px-[72px] lg:py-20 bg-sand-light">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="font-display font-bold text-[28px] sm:text-[32px] leading-[36px] sm:leading-[40px] tracking-[-0.38px] text-warmzwart mb-3">
            {dict.providerHome.whyNowTitle}
          </h2>
          <p className="font-body text-[16px] leading-[25px] text-warmgrijs-dark mb-8">{dict.providerHome.whyNowBody}</p>
          <Link
            href="/registreer/vakman"
            className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
          >
            {dict.providerHome.cta}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-[72px] lg:pb-20">
        <div className="max-w-[720px] mx-auto text-center border-t border-lijn pt-10">
          <p className="font-body text-[15px] text-warmgrijs-dark">
            <span className="font-semibold text-warmzwart">{dict.providerHome.residentPrompt}</span>{" "}
            {dict.providerHome.residentBody}{" "}
            <Link href="/bewoners" className="text-sage font-semibold hover:underline whitespace-nowrap">
              {dict.providerHome.residentLink}
            </Link>
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

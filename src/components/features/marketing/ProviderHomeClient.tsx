"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { ProviderHero } from "@/components/features/marketing/ProviderHero";
import { ProviderSteps } from "@/components/features/marketing/ProviderSteps";

export function ProviderHomeClient() {
  const { dict } = useLang();

  useEffect(() => {
    track("provider_home_view");
  }, []);

  return (
    <>
      <MarketingHeader cross={{ href: "/bewoners", label: dict.marketing.forResidents }} />

      <ProviderHero />
      <ProviderSteps />

      {/* Why join now — bewust geen cijfers, zie plan §7 */}
      <section className="px-6 py-16 lg:px-[72px] lg:py-20">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="font-display font-bold text-[28px] sm:text-[32px] leading-[36px] sm:leading-[40px] tracking-[-0.38px] text-warmzwart mb-3">
            {dict.providerHome.whyNowTitle}
          </h2>
          <p className="font-body text-[16px] leading-[25px] text-warmgrijs-dark mb-8">{dict.providerHome.whyNowBody}</p>
          <Link
            href="/registreer/vakman"
            onClick={() => track("provider_signup_click", { source: "why_now" })}
            className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
          >
            {dict.providerHome.cta}
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </section>

      {/* Onopvallende route naar de bewoners-pagina */}
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
    </>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";

export function ProviderHero() {
  const { dict } = useLang();

  return (
    <section className="relative overflow-hidden px-6 pt-4 pb-16 lg:px-[72px] lg:pt-4 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 hidden lg:flex justify-center">
        <div className="relative w-full max-w-[1200px]">
          <div className="absolute right-0 top-[40px] h-[460px] w-[42%]">
            <img
              src="/images/vakman-hero.jpg"
              alt={dict.providerHome.imageAlt}
              className="absolute inset-0 h-full w-full hard-lg object-cover"
            />
            <div className="hard absolute -bottom-5 -left-5 bg-white px-4 py-3 max-w-[220px]">
              <p className="font-body font-bold text-[13px] leading-[18px] text-warmzwart">{dict.providerHome.imageOverlay1}</p>
              <p className="font-body text-[12px] leading-[16px] text-warmgrijs mt-0.5">{dict.providerHome.imageOverlay2}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="pb-4 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
              <span className="w-2 h-2 rounded-full bg-[#385729]" />
              <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                {dict.providerHome.eyebrow}
              </span>
            </span>
          </div>

          <h1 className="font-display font-bold text-[40px] leading-[48px] sm:text-[64px] sm:leading-[70px] tracking-[-1.12px] text-warmzwart pb-6">
            <span className="block">{dict.providerHome.title}</span>
            <span className="block font-display italic font-normal text-[#385729]">{dict.providerHome.titleAccent}</span>
          </h1>

          <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[480px] pb-8">
            {dict.providerHome.body}
          </p>

          <Link
            href="/registreer/vakman"
            onClick={() => track("provider_signup_click", { source: "hero" })}
            className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
          >
            {dict.providerHome.cta}
            <ArrowRight size={14} weight="bold" />
          </Link>
          <p className="font-body text-[13px] text-warmgrijs mt-3">{dict.providerHome.microcopy}</p>
        </div>
      </div>
    </section>
  );
}

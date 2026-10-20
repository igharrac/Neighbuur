/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";

export function ProviderHero() {
  const { dict } = useLang();

  return (
    <section className="px-6 pt-4 pb-16 lg:px-[72px] lg:pt-4 lg:pb-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-x-10 lg:gap-x-12 gap-y-10 lg:items-start">
        <div className="lg:col-span-6">
          <div className="pb-4 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
              <span className="w-2 h-2 rounded-full bg-[#385729]" />
              <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                {dict.providerHome.eyebrow}
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
            onClick={() => track("provider_signup_click", { source: "hero" })}
            className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
          >
            {dict.providerHome.cta}
            <ArrowRight size={14} weight="bold" />
          </Link>
          <p className="font-body text-[13px] text-warmgrijs mt-3">{dict.providerHome.microcopy}</p>
        </div>

        <div className="lg:col-span-6">
          <img
            src="/images/vakman-regio-hero.png"
            alt={dict.providerHome.imageAlt}
            className="w-full aspect-[3/2] object-cover rounded block"
          />
        </div>
      </div>
    </section>
  );
}

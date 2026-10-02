/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export function ResidentHomeClient() {
  const { dict } = useLang();

  useEffect(() => {
    track("resident_page_view");
  }, []);

  return (
    <>
      <MarketingHeader cross={{ href: "/", label: dict.marketing.forProfessionals }} />

      <section className="px-6 py-12 lg:px-[72px] lg:py-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="pb-4 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-[#385729]" />
                <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                  {dict.residentHome.eyebrow}
                </span>
              </span>
            </div>

            <h1 className="font-display font-bold text-[36px] leading-[44px] sm:text-[52px] sm:leading-[58px] tracking-[-1.12px] text-warmzwart pb-6">
              <span className="block">{dict.residentHome.title}</span>
              <span className="block font-display italic font-normal text-[#385729]">{dict.residentHome.titleAccent}</span>
            </h1>

            <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[480px] pb-8">
              {dict.residentHome.body}
            </p>

            <Link
              href="/bewoners/inschrijven"
              onClick={() => track("resident_signup_click")}
              className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
            >
              {dict.residentHome.cta}
              <ArrowRight size={14} weight="bold" />
            </Link>
            <p className="font-body text-[13px] text-warmgrijs mt-3">{dict.residentHome.microcopy}</p>
          </div>

          <div className="lg:col-span-5">
            <img
              src="/images/wijk-actief.png"
              alt={dict.residentHome.imageAlt}
              className="hard-lg w-full h-[260px] sm:h-[340px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-[72px] lg:pb-20">
        <div className="max-w-[720px] mx-auto text-center border-t border-lijn pt-10">
          <p className="font-body text-[15px] text-warmgrijs-dark">
            <span className="font-semibold text-warmzwart">{dict.residentHome.providerPrompt}</span>{" "}
            <Link href="/" className="text-sage font-semibold hover:underline whitespace-nowrap">
              {dict.residentHome.providerLink}
            </Link>
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

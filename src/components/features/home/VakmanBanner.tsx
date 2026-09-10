/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

export function VakmanBanner() {
  const { dict } = useLang();
  const features = [dict.proCta.feature1, dict.proCta.feature2, dict.proCta.feature3];

  return (
    <section className="bg-cream-warm px-6 pt-6 pb-16 lg:px-[72px] lg:pt-6 lg:pb-[72px]">
      <div className="max-w-[1200px] mx-auto bg-[#f4ece8] rounded-[24px] p-8 lg:p-12 drop-shadow-[0px_8px_15px_rgba(92,64,40,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8">
          <p className="font-body font-bold text-[12px] tracking-[1.2px] uppercase text-[#a73400] mb-1">
            {dict.proCta.eyebrow}
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] leading-[40px] sm:leading-[46px] tracking-[-0.38px] text-[#1e1b19] mb-2">
            {dict.proCta.title}{" "}
            <span className="text-[#a73400]">{dict.proCta.titleAccent}</span>
          </h2>
          <p className="font-body text-[15px] leading-[22px] text-[#594139] max-w-[672px] mb-6">
            {dict.proCta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-6">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle size={17} weight="fill" className="text-[#2c694e] shrink-0" />
                <span className="font-body font-semibold text-[12px] tracking-[0.24px] text-[#1e1b19]">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/registreer/vakman"
            className="inline-flex items-center gap-2 rounded-full bg-[#a73400] px-10 py-4 font-body font-semibold text-[14px] text-white no-underline whitespace-nowrap drop-shadow-[0px_4px_8px_rgba(167,52,0,0.3)]"
          >
            {dict.proCta.button}
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] bg-[#eee7e3]">
            <img src={dict.proCta.image} alt={dict.proCta.imageAlt} className="w-full h-[220px] sm:h-[244px] object-cover block" />
          </div>
        </div>
      </div>
    </section>
  );
}

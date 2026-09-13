/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowRight, Medal } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { CommunityOverview } from "@/lib/communities";

export function WijkActivatie({ communities }: { communities: CommunityOverview[] }) {
  const { dict } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toLowerCase();
    const match = trimmed
      ? communities.find(
          (c) => c.name.toLowerCase().includes(trimmed) || c.district_name.toLowerCase().includes(trimmed)
        )
      : undefined;
    router.push(match ? `/wijk/${match.slug}` : "/login");
  }

  return (
    <section className="bg-sand-light px-6 py-16 lg:p-[72px]">
      <div className="max-w-[1200px] mx-auto bg-white rounded-[24px] p-6 sm:p-8 lg:p-12 drop-shadow-[0px_8px_15px_rgba(92,64,40,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl overflow-hidden bg-[#f4ece8] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
            <img src={dict.community.image} alt={dict.community.imageAlt} className="w-full h-[200px] sm:h-[253px] object-cover block" />
          </div>
          <div className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-xl bg-[#a73400] px-4 py-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <Medal size={18} weight="fill" className="text-white shrink-0" />
            <span className="font-body font-bold text-[14px] text-white whitespace-nowrap">{dict.community.activeBadge}</span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="font-body font-bold text-[12px] tracking-[1.2px] uppercase text-[#a73400] mb-1">
            {dict.community.eyebrow}
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] leading-[40px] sm:leading-[46px] tracking-[-0.38px] text-[#1e1b19] mb-2">
            {dict.community.title}
          </h2>
          <p className="font-body text-[15px] leading-[22px] text-[#594139] max-w-[540px] mb-6">
            {dict.community.subtitle}
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="flex-1 min-w-0 flex items-center gap-2 rounded-full bg-sand-light px-4 py-3">
              <MagnifyingGlass size={16} className="text-[#8d7168] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.community.searchPlaceholder}
                className="flex-1 min-w-0 bg-transparent font-body text-[15px] text-[#1e1b19] placeholder:text-[#8d7168] outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1e1b19] px-8 py-3.5 font-body font-semibold text-[14px] text-cream-warm whitespace-nowrap"
            >
              {dict.community.cta}
              <ArrowRight size={11} weight="bold" />
            </button>
          </form>

          {/* Illustratieve voorbeeldkaart — geen live statistiek (geen backend voor "% aangesloten"/"actieve klussen"/"voordeel") */}
          <div className="bg-sand-light rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2c694e] shrink-0" />
                <span className="font-body font-bold text-[18px] text-[#1e1b19]">{dict.community.sampleName}</span>
              </div>
              <span className="font-body font-bold text-[12px] tracking-[0.24px] text-[#2c694e] whitespace-nowrap">
                {dict.community.samplePercentage}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#e9e1dd] overflow-hidden">
              <div className="h-full w-[84%] rounded-full bg-[#2c694e]" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-[13px] text-[#594139]">{dict.community.sampleKlussen}</span>
              <span className="font-body font-semibold text-[13px] text-[#a73400] whitespace-nowrap">
                {dict.community.sampleVoordeel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

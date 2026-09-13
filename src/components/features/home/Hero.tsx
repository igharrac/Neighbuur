/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, MapPin, ArrowRight, Star, Tag } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { CommunityOverview } from "@/lib/communities";

const AVATARS = [
  { init: "MB", bg: "#cb4914", color: "#fffbff" },
  { init: "LK", bg: "#9a6b35", color: "#fffbff" },
  { init: "JS", bg: "#2c694e", color: "#ffffff" },
  { init: "+2k", bg: "#e9e1dd", color: "#1e1b19" },
];

interface HeroProps {
  communities: CommunityOverview[];
}

export function Hero({ communities }: HeroProps) {
  const { dict } = useLang();
  const router = useRouter();
  const [zoekterm, setZoekterm] = useState("");
  const [locatie, setLocatie] = useState("");

  function handleZoeken() {
    const trimmed = zoekterm.trim();
    router.push(trimmed ? `/zoeken?q=${encodeURIComponent(trimmed)}` : "/zoeken");
  }

  const pillCommunities = communities.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-cream-warm px-6 py-12 lg:px-[72px] lg:py-24">
      {/* Achtergrondfoto + gradients — gecapt op dezelfde breedte als de rest van de pagina-content
         (max-w-[1200px], zoals de Diensten-tegels), i.p.v. edge-to-edge van de sectie. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:flex justify-center">
        <div className="relative w-full max-w-[1200px]">
          {/* Beeld + gradients in een eigen box, zodat de zwevende kaart er precies aan kan hangen */}
          <div className="absolute right-0 top-[60px] h-[481px] w-[75%]">
            <img
              src={dict.hero.heroImage}
              alt={dict.hero.heroAlt}
              className="absolute inset-0 h-full w-full rounded-tr-[24px] rounded-br-[24px] object-cover"
            />
            <div
              className="absolute inset-0 rounded-tr-[24px] rounded-br-[24px]"
              style={{
                backgroundImage:
                  "linear-gradient(121.38deg, #fff8f5 6.273%, #fff8f5 36.117%, rgba(255,248,245,0.769) 52.063%, rgba(255,248,245,0) 71.443%)",
              }}
            />
            <div className="absolute inset-0 rounded-tr-[24px] rounded-br-[24px] bg-gradient-to-t from-cream-warm from-0% via-transparent via-50% to-[rgba(255,248,245,0.6)] to-100%" />

            {/* Zwevende kaart — "collectieve deal", hangt over de rechteronderhoek van het beeld */}
            <div className="absolute -bottom-10 right-16 w-[320px] pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-[6px] border border-[#f4ece8] flex flex-col gap-2 p-[17px] rounded-2xl shadow-[0px_12px_28px_rgba(92,64,40,0.1)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-[#b1f0ce] px-2 py-0.5 font-body font-semibold text-[11px] tracking-[0.275px] uppercase text-[#0e5138]">
                    {dict.hero.dealTag}
                  </span>
                  <Tag size={16} weight="fill" className="text-[#0e5138] shrink-0" />
                </div>
                <p className="font-display font-bold text-[18px] text-[#1e1b19]">{dict.hero.dealTitle}</p>
                <p className="font-body text-[13px] leading-[18px] text-[#594139]">{dict.hero.dealSubtitle}</p>
                <div className="h-1.5 w-full rounded-full bg-[#f4ece8] overflow-hidden mt-1">
                  <div className="h-full w-[84%] rounded-full bg-[#2c694e]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="pb-4 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ffdbcf]/95 backdrop-blur-[6px] px-4 py-1">
              <span className="w-2 h-2 rounded-full bg-[#a73400]" />
              <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                {dict.hero.eyebrow}
              </span>
            </span>
          </div>

          <h1 className="font-display font-bold text-[40px] leading-[48px] sm:text-[56px] sm:leading-[64px] tracking-[-1.12px] text-[#1e1b19] pb-4 pr-0 lg:pr-[96px]">
            <span className="block">{dict.hero.title}</span>
            <span
              className="block font-display italic font-normal text-[#a73400] [text-decoration-line:underline] [text-decoration-style:wavy] [text-decoration-color:#ffdbcf] [text-underline-position:from-font] [text-decoration-skip-ink:none]"
            >
              {dict.hero.titleAccent}
            </span>
          </h1>

          <p className="font-body text-[17px] leading-[26px] text-[#594139] max-w-[576px] pb-8">
            {dict.hero.subtitle}
          </p>

          {/* Zoekcapsule — categorieveld is functioneel (-> /zoeken?q=), locatieveld nog niet
             (er bestaat nog geen postcode/wijk-matching in de backend) */}
          <div className="bg-white/95 backdrop-blur-[6px] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-[28px] sm:rounded-full w-full max-w-[672px] drop-shadow-[0px_8px_30px_rgba(92,64,40,0.08)]">
            <div className="flex items-center gap-2 flex-1 min-w-0 pl-4 py-2">
              <MagnifyingGlass size={17} className="text-[#594139] shrink-0" />
              <input
                type="text"
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleZoeken()}
                placeholder={dict.hero.searchCategoryPlaceholder}
                className="flex-1 min-w-0 font-body text-[15px] text-[#1e1b19] placeholder:text-[#8d7168] outline-none bg-transparent"
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-[#e9e1dd] shrink-0" />
            <div className="flex items-center gap-2 sm:w-[164px] pl-4 sm:pl-0 py-2">
              <MapPin size={18} className="text-[#594139] shrink-0" />
              <input
                type="text"
                value={locatie}
                onChange={(e) => setLocatie(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleZoeken()}
                placeholder={dict.hero.searchLocationPlaceholder}
                className="flex-1 min-w-0 font-body text-[15px] text-[#1e1b19] placeholder:text-[#8d7168] outline-none bg-transparent"
              />
            </div>
            <button
              onClick={handleZoeken}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a73400] px-8 py-3.5 font-body font-semibold text-[14px] text-white whitespace-nowrap drop-shadow-[0px_4px_7px_rgba(167,52,0,0.3)]"
            >
              {dict.hero.searchButton}
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>

          {pillCommunities.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6">
              <span className="font-body font-medium text-[12px] tracking-[0.24px] text-[#8d7168]">
                {dict.hero.activeRegionLabel}
              </span>
              {pillCommunities.map((c) => (
                <Link
                  key={c.id}
                  href={`/wijk/${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece8] px-3 py-1 no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2c694e]" />
                  <span className="font-body font-semibold text-[12px] tracking-[0.24px] text-[#1e1b19]">
                    {c.name} ({c.member_count} {dict.hero.buren})
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-8">
            <div className="flex items-center">
              {AVATARS.map((a, i) => (
                <span
                  key={a.init}
                  style={{ backgroundColor: a.bg, color: a.color, marginLeft: i === 0 ? 0 : -8 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-body font-semibold text-[12px] tracking-[0.24px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] border-2 border-cream-warm"
                >
                  {a.init}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} weight="fill" className="text-[#a73400]" />
                ))}
                <span className="font-body font-bold text-[14px] text-[#1e1b19] pl-1">4.8 / 5</span>
              </div>
              <p className="font-body text-[13px] text-[#594139]">2.847 {dict.hero.trustCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

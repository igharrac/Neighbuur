/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, MapPin, ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

export function Hero() {
  const { dict } = useLang();
  const router = useRouter();
  const [zoekterm, setZoekterm] = useState("");
  const [locatie, setLocatie] = useState("");

  function handleZoeken() {
    const trimmed = zoekterm.trim();
    router.push(trimmed ? `/zoeken?q=${encodeURIComponent(trimmed)}` : "/zoeken");
  }

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

            {/* Zwevende "collectieve deal"-kaart verborgen — de cijfers erin zijn puur
               illustratief (geen backend voor % aangesloten/besparing), zie ook de
               vergelijkbare kaart in WijkActivatie.tsx. Pas weer aanzetten zodra dit
               op echte data draait. dict.hero.dealTag/dealTitle/dealSubtitle blijven
               staan voor als dat zover is. */}
          </div>
        </div>
      </div>

      <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="pb-4 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 backdrop-blur-[6px] px-4 py-1">
              <span className="w-2 h-2 rounded-full bg-[#385729]" />
              <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                {dict.hero.eyebrow}
              </span>
            </span>
          </div>

          <h1 className="font-display font-bold text-[40px] leading-[48px] sm:text-[84px] sm:leading-[92px] tracking-[-1.12px] text-[#1e1b19] pb-6 pr-0 lg:pr-[96px]">
            <span className="block">{dict.hero.title}</span>
            <span className="block font-display italic font-normal text-[#385729]">{dict.hero.titleAccent}</span>
          </h1>

          <p className="font-body text-[17px] leading-[26px] text-[#594139] max-w-[576px] pb-20">
            {dict.hero.subtitle}
          </p>

          {/* Zoekcapsule — categorieveld is functioneel (-> /zoeken?q=), locatieveld nog niet
             (er bestaat nog geen postcode/wijk-matching in de backend) */}
          <div className="bg-white/95 backdrop-blur-[6px] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-[12px] w-full max-w-[672px] border border-warmzwart">
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
              className="hard inline-flex items-center justify-center gap-2 bg-[#385729] px-8 py-3.5 font-body font-semibold text-[14px] text-white whitespace-nowrap"
            >
              {dict.hero.searchButton}
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { MagnifyingGlass, UsersThree, CheckCircle, type IconProps } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

const STAP_STIJL: { bg: string; iconColor: string; labelColor: string; blob: string; Icon: React.ComponentType<IconProps> }[] = [
  { bg: "#C4DAB9", iconColor: "#385729", labelColor: "#385729", blob: "63% 37% 54% 46% / 43% 47% 53% 57%", Icon: MagnifyingGlass },
  { bg: "#b1f0ce", iconColor: "#2c694e", labelColor: "#2c694e", blob: "42% 58% 68% 32% / 46% 39% 61% 54%", Icon: UsersThree },
  { bg: "#ffddbb", iconColor: "#7d531f", labelColor: "#7d531f", blob: "55% 45% 40% 60% / 60% 45% 55% 40%", Icon: CheckCircle },
];

/* Twee korte accentstreepjes naast het icoon — het "spark"-detail uit het
   referentiebeeld, geeft de blob net dat neobrutalist-illustratieve gevoel
   i.p.v. een kale icoon-in-cirkel. Kleur = de blob-kleur zelf, niet het
   icoon. Drie varianten (hoek/lengte/positie) zodat de drie kaarten niet
   een 1-op-1 kopie van elkaar ogen. */
const SPARK_VARIANTEN = [
  { paths: ["M5 15L11 5", "M13 17.5L17.5 9"], pos: "-top-1.5 -right-1.5" },
  { paths: ["M6 16L10 4", "M14.5 18L17.5 11"], pos: "-top-1 -right-2" },
  { paths: ["M4 13L14 6", "M12.5 16.5L18 12"], pos: "-top-2 -right-1" },
];

function AccentSpark({ color, variant }: { color: string; variant: number }) {
  const { paths, pos } = SPARK_VARIANTEN[variant];
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={`absolute ${pos} pointer-events-none`}>
      <path d={paths[0]} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d={paths[1]} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function HoeHetWerkt() {
  const { dict } = useLang();

  return (
    <section className="bg-sand-light px-6 py-16 lg:px-10 lg:py-24">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-12 lg:gap-[72px]">
        <div className="max-w-[672px] flex flex-col items-center gap-2 text-center">
          <span className="font-body font-bold text-[12px] tracking-[1.2px] uppercase text-[#385729]">
            {dict.steps.eyebrow}
          </span>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] leading-[40px] sm:leading-[46px] tracking-[-0.38px] text-[#1e1b19]">
            {dict.steps.title}
          </h2>
          <p className="font-body text-[15px] leading-[22px] text-[#594139]">{dict.steps.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          {dict.steps.items.map((stap, i) => {
            const stijl = STAP_STIJL[i];
            const Icon = stijl.Icon;
            return (
              <div key={stap.n} className="hard-lg bg-white p-8">
                <div
                  className="relative w-16 h-16 flex items-center justify-center mb-6"
                  style={{ backgroundColor: stijl.bg, borderRadius: stijl.blob }}
                >
                  <Icon size={30} weight="bold" style={{ color: stijl.iconColor }} />
                  <AccentSpark color={stijl.bg} variant={i} />
                </div>
                <p
                  className="font-body font-bold text-[12px] tracking-[0.6px] uppercase mb-1"
                  style={{ color: stijl.labelColor }}
                >
                  STAP 0{stap.n}
                </p>
                <h3 className="font-body font-bold text-[18px] leading-[24px] text-[#1e1b19] mb-2">{stap.title}</h3>
                <p className="font-body text-[15px] leading-[22px] text-[#594139]">{stap.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

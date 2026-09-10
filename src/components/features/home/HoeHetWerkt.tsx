"use client";

import { MagnifyingGlass, UsersThree, CheckCircle, type IconProps } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

const STAP_STIJL: { bg: string; iconColor: string; labelColor: string; Icon: React.ComponentType<IconProps> }[] = [
  { bg: "#ffdbcf", iconColor: "#a73400", labelColor: "#a73400", Icon: MagnifyingGlass },
  { bg: "#b1f0ce", iconColor: "#2c694e", labelColor: "#2c694e", Icon: UsersThree },
  { bg: "#ffddbb", iconColor: "#7d531f", labelColor: "#7d531f", Icon: CheckCircle },
];

export function HoeHetWerkt() {
  const { dict } = useLang();

  return (
    <section className="bg-sand-light px-6 py-16 lg:px-10 lg:py-24">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-12 lg:gap-[72px]">
        <div className="max-w-[672px] flex flex-col items-center gap-2 text-center">
          <span className="font-body font-bold text-[12px] tracking-[1.2px] uppercase text-[#a73400]">
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
              <div key={stap.n} className="bg-white rounded-[24px] p-8 drop-shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: stijl.bg }}
                >
                  <Icon size={22} weight="bold" style={{ color: stijl.iconColor }} />
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

"use client";

import { ChatCircleText, WhatsappLogo, Copy } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";

export function WhatsappCommunityCta() {
  const { dict } = useLang();
  const { showToast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText("https://neighbuur.nl");
    showToast(dict.cta.copy, "success");
  }

  function handleWhatsappShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(dict.cta.whatsappMessage)}`;
    window.open(url, "_blank");
  }

  return (
    <section className="bg-cream-warm px-6 py-8 lg:px-[72px]">
      <div className="max-w-[1200px] mx-auto hard-lg bg-sand-light p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#2c694e] flex items-center justify-center">
            <ChatCircleText size={30} weight="fill" className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-[22px] sm:text-[26px] leading-[28px] sm:leading-[32px] text-[#1e1b19] mb-1">
              {dict.cta.title}
            </h2>
            <p className="font-body text-[15px] leading-[22px] text-[#594139] max-w-[576px]">{dict.cta.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={handleWhatsappShare}
            className="hard inline-flex items-center justify-center gap-2 bg-[#2c694e] px-8 py-3.5 font-body font-semibold text-[14px] text-white whitespace-nowrap"
          >
            <WhatsappLogo size={17} weight="fill" />
            {dict.cta.whatsapp}
          </button>
          <button
            onClick={handleCopyLink}
            className="hard inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 font-body font-semibold text-[14px] text-[#1e1b19] whitespace-nowrap"
          >
            <Copy size={15} />
            {dict.cta.copy}
          </button>
        </div>
      </div>
    </section>
  );
}

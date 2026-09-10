"use client";

import { Crown, X } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

type Variant = "limiet" | "fotos" | "dashboard" | "review";

interface PremiumUpsellProps {
  variant: Variant;
  onDismiss?: () => void;
  className?: string;
}

const TEKSTEN: Record<Variant, { titel: { nl: string; en: string }; subtitel: { nl: string; en: string } }> = {
  limiet: {
    titel: { nl: "Je gratis limiet is bereikt", en: "Your free limit is reached" },
    subtitel: {
      nl: "Upgrade naar Pro voor onbeperkte boekingsaanvragen.",
      en: "Upgrade to Pro for unlimited booking requests.",
    },
  },
  fotos: {
    titel: { nl: "Meer ruimte voor je werk", en: "More room for your work" },
    subtitel: {
      nl: "Gratis profielen tonen 3 foto's. Met Pro toon je er tot 12.",
      en: "Free profiles show 3 photos. With Pro you can show up to 12.",
    },
  },
  dashboard: {
    titel: { nl: "Wist je dat Pro-vakmensen 2x meer boekingen krijgen?", en: "Did you know Pro professionals get 2x more bookings?" },
    subtitel: {
      nl: "Topplaatsing in zoekresultaten, tot 12 foto's en een gouden badge.",
      en: "Top placement in search results, up to 12 photos and a gold badge.",
    },
  },
  review: {
    titel: { nl: "Goed bezig!", en: "Nice work!" },
    subtitel: {
      nl: "Met Pro sta je bovenaan bij zoekopdrachten. Probeer 14 dagen gratis.",
      en: "With Pro you'll rank at the top of search results. Try 14 days free.",
    },
  },
};

export function PremiumUpsell({ variant, onDismiss, className = "" }: PremiumUpsellProps) {
  const { lang } = useLang();
  const tekst = TEKSTEN[variant];

  return (
    <div
      className={`relative rounded bg-gradient-to-br from-amber-50 to-sand p-5 border border-amber-200/60 ${className}`}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label={lang === "nl" ? "Sluiten" : "Dismiss"}
          className="absolute top-3 right-3 w-7 h-7 rounded-sm flex items-center justify-center text-warmgrijs hover:bg-warmzwart/[0.04] transition-colors"
        >
          <X size={14} />
        </button>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 shrink-0 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center">
          <Crown size={18} weight="fill" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-body-lg font-bold text-warmzwart">{tekst.titel[lang]}</h3>
          <p className="text-body-sm text-warmgrijs mt-0.5">{tekst.subtitel[lang]}</p>
        </div>
      </div>

      <a
        href="mailto:pro@neighbuur.nl?subject=Upgrade%20naar%20Neighbuur%20Pro"
        className="btn-primary justify-center mt-4 w-full sm:w-auto"
      >
        {lang === "nl" ? "Upgrade naar Pro" : "Upgrade to Pro"}
      </a>
    </div>
  );
}

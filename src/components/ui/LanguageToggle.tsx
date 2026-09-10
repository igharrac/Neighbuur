"use client";

import { useLang } from "@/lib/hooks/useLang";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`inline-flex items-center rounded-sm bg-sand p-0.5 text-body-xs font-bold ${className}`}
      role="group"
      aria-label="Taal wisselen"
    >
      {(["nl", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 rounded-sm uppercase transition-colors ${
            lang === code ? "bg-warmzwart text-white" : "text-warmgrijs hover:text-warmzwart"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

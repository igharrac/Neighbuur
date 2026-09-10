"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getDictionary, type Lang, type Dictionary } from "@/lib/i18n";

const COOKIE_NAME = "nt_lang";
const STORAGE_KEY = "nt_lang";

interface LangContextValue {
  lang: Lang;
  dict: Dictionary;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

function persist(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=31536000;samesite=lax`;
}

export function LangProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored && stored !== lang && (stored === "nl" || stored === "en")) {
        setLangState(stored);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    persist(next);
    document.documentElement.lang = next;
  }

  return (
    <LangContext.Provider value={{ lang, dict: getDictionary(lang), setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang moet binnen LangProvider gebruikt worden");
  return ctx;
}

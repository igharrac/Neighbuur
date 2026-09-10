"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadSimple, X, ShareFat } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";

const VISIT_KEY = "nb_visit_count";
const DISMISSED_KEY = "nb_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallBanner() {
  const { lang } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasCountedVisit = useRef(false);

  useEffect(() => {
    try {
      if (isStandalone() || localStorage.getItem(DISMISSED_KEY) === "1") return;

      // Voorkomt dubbele telling door React Strict Mode's dubbele effect-run in dev.
      if (hasCountedVisit.current) return;
      hasCountedVisit.current = true;

      const count = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
      localStorage.setItem(VISIT_KEY, String(count));
      if (count < 2) return;

      if (isIOS()) {
        setShowIOSHint(true);
        setVisible(true);
      }
    } catch {
      // localStorage kan onbeschikbaar zijn (privémodus) — banner blijft dan verborgen.
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // negeren
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  const title =
    lang === "en" ? "Add Neighbuur to your home screen" : "Voeg Neighbuur toe aan je startscherm";
  const body =
    lang === "en"
      ? "For the fastest, app-like experience."
      : "Voor de snelste ervaring, net als een echte app.";
  const iosBody =
    lang === "en"
      ? "Tap Share, then “Add to Home Screen”."
      : "Tik op Delen, en dan op “Zet op beginscherm”.";

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-[360px] z-[90] animate-slide-up">
      <div className="bg-white rounded-xl shadow-strong border border-lijn p-4 flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 bg-terracotta rounded-lg flex items-center justify-center text-white">
          {showIOSHint ? <ShareFat size={20} weight="fill" /> : <DownloadSimple size={20} weight="bold" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-body-sm text-warmzwart">{title}</p>
          <p className="text-body-xs text-warmgrijs mt-0.5">{showIOSHint ? iosBody : body}</p>
          {!showIOSHint && (
            <button onClick={install} className="btn-primary !py-2 !px-4 !text-body-sm mt-3">
              {lang === "en" ? "Install" : "Installeren"}
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label={lang === "en" ? "Close" : "Sluiten"}
          className="min-w-11 min-h-11 -m-2.5 flex items-center justify-center text-warmgrijs hover:text-warmzwart shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

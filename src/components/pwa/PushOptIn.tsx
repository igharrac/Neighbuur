"use client";

import { useEffect, useState } from "react";
import { BellRinging, X } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { usePushSubscribe } from "@/lib/hooks/usePushSubscribe";

const DISMISSED_KEY = "nt_push_optin_dismissed";

export function PushOptIn() {
  const { dict, lang } = useLang();
  const { permission, subscribing, subscribe } = usePushSubscribe();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }

  if (permission === "unsupported" || permission === "granted") return null;
  if (permission === "denied") {
    return (
      <div className="rounded bg-sand p-4 text-body-sm text-warmgrijs-dark mb-4">{dict.notificaties.pushDenied}</div>
    );
  }
  if (dismissed) return null;

  return (
    <div className="relative rounded bg-white border border-lijn p-5 mb-4 flex items-start gap-3">
      <div className="w-10 h-10 shrink-0 rounded-sm bg-sage-100 text-sage flex items-center justify-center">
        <BellRinging size={18} weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-body-lg font-bold text-warmzwart">{dict.notificaties.pushTitle}</h3>
        <p className="text-body-sm text-warmgrijs mt-0.5">{dict.notificaties.pushSubtitle}</p>
        <button onClick={subscribe} disabled={subscribing} className="btn-primary mt-3 disabled:opacity-40">
          {dict.notificaties.pushButton}
        </button>
      </div>
      <button
        onClick={handleDismiss}
        aria-label={lang === "nl" ? "Sluiten" : "Dismiss"}
        className="absolute top-3 right-3 w-7 h-7 rounded-sm flex items-center justify-center text-warmgrijs hover:bg-warmzwart/[0.04] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

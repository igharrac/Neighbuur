"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import { useAuthPhoto } from "@/lib/hooks/useAuthPhoto";
import { AuthSplitScreen } from "@/components/features/auth/AuthSplitScreen";
import { AuthQuoteCard } from "@/components/features/auth/AuthQuoteCard";

type Step = "start" | "checking-email";

const RESEND_COOLDOWN = 30;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const next = searchParams.get("next");
  const { dict } = useLang();
  const { showToast } = useToast();
  const photoUrl = useAuthPhoto("resident");

  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function onboardingUrl() {
    const params = new URLSearchParams();
    params.set("role", "resident");
    if (invite) params.set("invite", invite);
    if (next) params.set("next", next);
    return `/onboarding?${params.toString()}`;
  }

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendLink() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/magic?next=${encodeURIComponent(onboardingUrl())}`,
      },
    });

    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setStep("checking-email");
    startCooldown();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingUrl())}` },
    });
  }

  return (
    <AuthSplitScreen
      photoUrl={photoUrl}
      photoAlt="Nieuwbouwwoning met verhuisdozen"
      backLabel={dict.login.back}
      bottomCard={
        <AuthQuoteCard
          quote="„Samen regelen we stucwerk, tuin en zonnepanelen met burenkorting.”"
          meta="Vathorst Blok C • Amersfoort"
        />
      }
    >
      {step === "start" && (
        <div className="animate-fade-in">
          <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.login.welcome}</h1>
          <p className="text-body text-warmgrijs mb-6">{dict.login.subtitle}</p>

          <label className="text-body-sm font-semibold block mb-1.5">
            {dict.login.emailLabel} <span className="text-terracotta">*</span>
          </label>
          <input
            type="email"
            className="input mb-4"
            placeholder={dict.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
          />

          <button
            className="btn-primary w-full"
            onClick={handleSendLink}
            disabled={loading || !email.includes("@")}
          >
            {loading ? "Bezig..." : dict.login.createAccount}
          </button>

          <div className="flex items-center gap-4 my-6 text-body-xs text-warmgrijs">
            <span className="flex-1 h-px bg-lijn" />
            {dict.login.or}
            <span className="flex-1 h-px bg-lijn" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-sm border-2 border-lijn font-semibold text-body hover:border-warmzwart hover:shadow-soft transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {dict.login.google}
          </button>

          <p className="text-center text-body-xs text-warmgrijs mt-6">
            {dict.login.terms}{" "}
            <a href="#" className="text-warmgrijs-dark underline">{dict.login.termsLink}</a> &{" "}
            <a href="#" className="text-warmgrijs-dark underline">{dict.login.privacyLink}</a>
          </p>

          <div className="border-t border-lijn mt-6 pt-4 text-center">
            <p className="text-body-sm text-warmgrijs">{dict.login.newAccountHint}</p>
            <p className="text-body-xs text-warmgrijs-dark mt-1">
              {dict.login.professionalHint}{" "}
              <Link href="/registreer/vakman" className="font-medium text-warmzwart underline">
                {dict.login.professionalLink}
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === "checking-email" && (
        <div className="animate-fade-in text-center">
          <div className="w-14 h-14 rounded-full bg-terracotta-50 text-terracotta flex items-center justify-center mx-auto mb-4">
            <EnvelopeSimple size={26} weight="fill" />
          </div>
          <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.login.checkEmailTitle}</h1>
          <p className="text-body text-warmgrijs mb-6">
            {dict.login.checkEmailSubtitle}{" "}
            <span className="font-semibold text-warmzwart">{email}</span>
          </p>

          <button
            className="text-body-sm text-terracotta font-semibold hover:underline disabled:opacity-40 disabled:pointer-events-none"
            onClick={handleSendLink}
            disabled={cooldown > 0 || loading}
          >
            {cooldown > 0 ? `${dict.login.resend} (0:${cooldown.toString().padStart(2, "0")})` : dict.login.resend}
          </button>
          <p className="mt-3">
            <button onClick={() => setStep("start")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
              ← {dict.login.wrongEmail}
            </button>
          </p>
        </div>
      )}
    </AuthSplitScreen>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { House, ArrowLeft, EnvelopeSimple, DeviceMobile } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";

type Method = "phone" | "email";
type Step = "start" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const next = searchParams.get("next");
  const { dict } = useLang();
  const { showToast } = useToast();

  const [method, setMethod] = useState<Method>("phone");
  const [step, setStep] = useState<Step>("start");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // E-mail-codes zijn in dit Supabase-project 8 cijfers, sms-codes 6 —
  // de invoervakjes worden bij het versturen op de juiste lengte gezet.
  const otpLength = method === "email" ? 8 : 6;

  const fullPhone = "+31" + phone.replace(/\s/g, "").replace(/^0/, "");
  const maskedPhone = "+31 6 ****" + phone.slice(-2);

  function onboardingUrl() {
    const params = new URLSearchParams();
    if (invite) params.set("invite", invite);
    if (next) params.set("next", next);
    const qs = params.toString();
    return qs ? `/onboarding?${qs}` : "/onboarding";
  }

  async function handleSendCode() {
    setLoading(true);
    const supabase = createClient();

    const { error } =
      method === "phone"
        ? await supabase.auth.signInWithOtp({ phone: fullPhone })
        : await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setOtp(Array(otpLength).fill(""));
    setStep("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  function handleOtpInput(idx: number, val: string) {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < otp.length - 1) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  async function handleVerify() {
    setLoading(true);
    const supabase = createClient();
    const token = otp.join("");

    const { error } =
      method === "phone"
        ? await supabase.auth.verifyOtp({ phone: fullPhone, token, type: "sms" })
        : await supabase.auth.verifyOtp({ email, token, type: "email" });

    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    router.push(onboardingUrl());
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingUrl())}` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-terracotta/[0.04] blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
            <span className="w-10 h-10 bg-terracotta rounded-lg flex items-center justify-center text-white">
              <House weight="fill" size={22} />
            </span>
            <span className="font-display font-black text-[26px] text-warmzwart">
              Neigh<span className="text-terracotta">buur</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded shadow-strong p-10">
          {/* ── STEP: Start (telefoon / e-mail / google) ── */}
          {step === "start" && (
            <div className="animate-fade-in">
              <h1 className="font-display text-display-sm text-center mb-1.5">{dict.login.welcome}</h1>
              <p className="text-center text-body text-warmgrijs mb-6">{dict.login.subtitle}</p>

              <div className="flex gap-1.5 mb-2 bg-cream rounded-sm p-1">
                <span className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-body-sm font-semibold bg-white shadow-soft text-warmzwart">
                  🔑 {dict.login.asResident}
                </span>
                <Link
                  href="/registreer/vakman"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-body-sm font-semibold text-warmgrijs hover:text-warmzwart transition-colors"
                >
                  🔧 {dict.login.asProfessional}
                </Link>
              </div>
              <p className="text-center text-body-xs text-warmgrijs mb-6">{dict.login.existingAccountHint}</p>

              <div className="flex gap-1.5 mb-5 bg-cream rounded-sm p-1">
                <button
                  onClick={() => setMethod("phone")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-body-sm font-semibold transition-colors ${
                    method === "phone" ? "bg-white shadow-soft text-warmzwart" : "text-warmgrijs"
                  }`}
                >
                  <DeviceMobile size={16} /> {dict.login.phone}
                </button>
                <button
                  onClick={() => setMethod("email")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-body-sm font-semibold transition-colors ${
                    method === "email" ? "bg-white shadow-soft text-warmzwart" : "text-warmgrijs"
                  }`}
                >
                  <EnvelopeSimple size={16} /> E-mail
                </button>
              </div>

              {method === "phone" ? (
                <>
                  <label className="text-body-sm font-semibold block mb-1.5">{dict.login.phone}</label>
                  <div className="flex gap-2 mb-4">
                    <span className="flex items-center justify-center w-[72px] px-3 py-3.5 rounded-sm border-2 border-lijn bg-cream text-body font-medium text-center">
                      🇳🇱 +31
                    </span>
                    <input
                      type="tel"
                      className="input flex-1"
                      placeholder="6 12345678"
                      maxLength={10}
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="text-body-sm font-semibold block mb-1.5">E-mail</label>
                  <input
                    type="email"
                    className="input mb-4"
                    placeholder="jij@voorbeeld.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  />
                </>
              )}

              <button
                className="btn-primary w-full"
                onClick={handleSendCode}
                disabled={loading || (method === "phone" ? phone.replace(/\s/g, "").length < 9 : !email.includes("@"))}
              >
                {method === "phone" ? dict.login.sendCode : dict.login.sendCodeEmail}
                <ArrowLeft size={16} weight="bold" className="rotate-180" />
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
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <div className="animate-fade-in">
              <h1 className="font-display text-display-sm text-center mb-1.5">{dict.login.enterCode}</h1>
              <p className="text-center text-body text-warmgrijs mb-6">
                {method === "phone" ? dict.login.codeSent : dict.login.codeSentEmail}{" "}
                <span className="font-semibold text-warmzwart">
                  {method === "phone" ? maskedPhone : email}
                </span>
              </p>

              <div className="flex gap-1.5 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="flex-1 min-w-0 h-[52px] text-center font-display text-[18px] font-bold border-2 border-lijn rounded-sm outline-none transition-all focus:border-terracotta focus:shadow-glow"
                  />
                ))}
              </div>

              <button
                className="btn-primary w-full"
                onClick={handleVerify}
                disabled={loading || otp.some((d) => !d)}
              >
                {dict.login.verify}
                <ArrowLeft size={16} weight="bold" className="rotate-180" />
              </button>

              <p className="text-center mt-4">
                <button onClick={handleSendCode} className="text-body-sm text-terracotta font-medium hover:underline">
                  {dict.login.resend}
                </button>
              </p>
              <p className="text-center mt-3">
                <button onClick={() => setStep("start")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                  ← {dict.login.otherNumber}
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-body-sm text-warmgrijs hover:text-terracotta">
            ← {dict.login.back}
          </Link>
        </p>
      </div>
    </div>
  );
}

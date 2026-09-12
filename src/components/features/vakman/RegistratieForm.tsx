"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, DeviceMobile, EnvelopeSimple, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { KvkInput, isValidKvK } from "@/components/features/vakman/KvkInput";
import { slugify } from "@/lib/utils";
import type { Categorie } from "@/types";

type Step = 1 | 2 | 3;
type Method = "phone" | "email";
type AuthStep = "start" | "otp";

const STRAAL_OPTIES = [5, 10, 15, 25];

export function RegistratieForm({ refBron }: { refBron?: string }) {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfiel } = useAuth();
  const { showToast } = useToast();

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>(1);

  // Step 1 — identificatie
  const [method, setMethod] = useState<Method>("phone");
  const [authStep, setAuthStep] = useState<AuthStep>("start");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [authLoadingLocal, setAuthLoadingLocal] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 2 — basisprofiel
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [kvkNummer, setKvkNummer] = useState("");
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);
  const [hoofdcategorieId, setHoofdcategorieId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [straal, setStraal] = useState(15);

  // Step 3 — contact
  const [contactVoorkeur, setContactVoorkeur] = useState<"telefoon" | "whatsapp" | "app">("app");
  const [akkoord, setAkkoord] = useState(false);
  const [saving, setSaving] = useState(false);

  const fullPhone = "+31" + phone.replace(/\s/g, "").replace(/^0/, "");
  const maskedPhone = "+31 6 ****" + phone.slice(-2);

  // E-mail-codes zijn in dit Supabase-project 8 cijfers, sms-codes 6.
  const otpLength = method === "email" ? 8 : 6;

  // Bepaal of deze gebruiker al ingelogd/geregistreerd is
  useEffect(() => {
    if (authLoading) return;

    async function check() {
      if (!user) {
        setChecking(false);
        return;
      }

      const supabase = createClient();
      const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (profiel) {
        router.replace(profiel.role === "vakman" ? "/dashboard" : "/plan");
        return;
      }

      // Ingelogd maar nog geen profiel: door naar stap 2
      setStep(2);
      setChecking(false);
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Categorieën laden voor stap 2
  useEffect(() => {
    async function loadCategorieen() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "vakman")
        .eq("active", true)
        .order("sort_order");
      setCategorieen((data ?? []) as Categorie[]);
    }
    loadCategorieen();
  }, []);

  const registreerNext = `/registreer/vakman${refBron ? `?ref=${encodeURIComponent(refBron)}` : ""}`;

  async function handleSendCode() {
    setAuthLoadingLocal(true);
    const supabase = createClient();
    const { error } =
      method === "phone"
        ? await supabase.auth.signInWithOtp({ phone: fullPhone })
        : await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(registreerNext)}`,
            },
          });

    setAuthLoadingLocal(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setOtp(Array(otpLength).fill(""));
    setAuthStep("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  function handleOtpInput(idx: number, val: string) {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < otp.length - 1) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otp.length);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < otp.length; i++) next[i] = pasted[i] ?? next[i];
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, otp.length - 1)]?.focus();
  }

  async function handleVerify() {
    setAuthLoadingLocal(true);
    const supabase = createClient();
    const token = otp.join("");
    const { error } =
      method === "phone"
        ? await supabase.auth.verifyOtp({ phone: fullPhone, token, type: "sms" })
        : await supabase.auth.verifyOtp({ email, token, type: "email" });

    setAuthLoadingLocal(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    await refreshProfiel();
    setStep(2);
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(registreerNext)}` },
    });
  }

  function canContinueStep2() {
    return bedrijfsnaam.trim().length > 0 && isValidKvK(kvkNummer) && hoofdcategorieId;
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();

    const { error: profielError } = await supabase.from("profiles").insert({
      id: user.id,
      name: bedrijfsnaam,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: "vakman",
      language: "nl",
    });

    if (profielError) {
      setSaving(false);
      showToast(profielError.message, "error");
      return;
    }

    const baseSlug = slugify(bedrijfsnaam);
    let slug = baseSlug;
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from("vakman_profielen").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const { error: vakmanError } = await supabase.from("vakman_profielen").insert({
      user_id: user.id,
      bedrijfsnaam,
      slug,
      kvk_nummer: kvkNummer.replace(/\s/g, ""),
      specialismes: [hoofdcategorieId],
      contact_voorkeur: contactVoorkeur,
      werkgebied_postcode: postcode || null,
      werkgebied_km: straal,
      registratie_bron: refBron ?? null,
      profiel_sterkte: 20,
    });

    setSaving(false);
    if (vakmanError) {
      showToast(vakmanError.message, "error");
      return;
    }

    router.push("/dashboard");
  }

  if (checking) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
      <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-terracotta/[0.04] blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2.5">
            <span className="w-10 h-10 bg-terracotta rounded-lg flex items-center justify-center text-white font-display font-black">
              N
            </span>
            <span className="font-display font-black text-[24px] text-warmzwart">
              Neigh<span className="text-terracotta">buur</span>
            </span>
          </span>
        </div>

        {/* Stap-indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-body-sm transition-colors ${
                  step === s
                    ? "bg-terracotta text-white"
                    : step > s
                    ? "bg-groen text-white"
                    : "bg-cream-dark text-warmgrijs"
                }`}
              >
                {step > s ? <Check size={15} weight="bold" /> : s}
              </div>
              {i < 2 && (
                <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-groen" : "bg-lijn"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded shadow-strong p-8 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                {authStep === "start" ? (
                  <>
                    <h1 className="font-display text-display-sm text-center mb-1.5">Word vakman-partner</h1>
                    <p className="text-center text-body text-warmgrijs mb-6">
                      Registreer in 60 seconden en ontvang aanvragen uit nieuwbouwwijken
                    </p>

                    <div className="flex gap-1.5 mb-5 bg-cream rounded-sm p-1">
                      <button
                        onClick={() => setMethod("phone")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-body-sm font-semibold transition-colors ${
                          method === "phone" ? "bg-white shadow-soft text-warmzwart" : "text-warmgrijs"
                        }`}
                      >
                        <DeviceMobile size={16} /> Telefoon
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
                    ) : (
                      <input
                        type="email"
                        className="input mb-4"
                        placeholder="jij@bedrijf.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                      />
                    )}

                    <button
                      className="btn-primary w-full"
                      onClick={handleSendCode}
                      disabled={
                        authLoadingLocal ||
                        (method === "phone" ? phone.replace(/\s/g, "").length < 9 : !email.includes("@"))
                      }
                    >
                      Stuur code
                      <ArrowLeft size={16} weight="bold" className="rotate-180" />
                    </button>

                    <div className="flex items-center gap-4 my-5 text-body-xs text-warmgrijs">
                      <span className="flex-1 h-px bg-lijn" />
                      of
                      <span className="flex-1 h-px bg-lijn" />
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-sm border-2 border-lijn font-semibold text-body hover:border-warmzwart hover:shadow-soft transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Doorgaan met Google
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="font-display text-display-sm text-center mb-1.5">Code invoeren</h1>
                    <p className="text-center text-body text-warmgrijs mb-6">
                      We stuurden een code naar{" "}
                      <span className="font-semibold text-warmzwart">
                        {method === "phone" ? maskedPhone : email}
                      </span>
                    </p>

                    <div className="flex gap-1.5 justify-center mb-6">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={handleOtpPaste}
                          className="flex-1 min-w-0 h-[52px] text-center font-display text-[18px] font-bold border-2 border-lijn rounded-sm outline-none transition-all focus:border-terracotta focus:shadow-glow"
                        />
                      ))}
                    </div>

                    <button
                      className="btn-primary w-full"
                      onClick={handleVerify}
                      disabled={authLoadingLocal || otp.some((d) => !d)}
                    >
                      Verifiëren
                      <ArrowLeft size={16} weight="bold" className="rotate-180" />
                    </button>
                    <p className="text-center mt-3">
                      <button onClick={() => setAuthStep("start")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                        ← Ander nummer
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-display-sm text-center mb-1.5">Jouw bedrijf</h1>
                <p className="text-center text-body text-warmgrijs mb-6">Basisgegevens voor je profiel</p>

                <label className="text-body-sm font-semibold block mb-1.5">Bedrijfsnaam</label>
                <input
                  className="input mb-5"
                  placeholder="Bijv. TopStuc Vloeren"
                  value={bedrijfsnaam}
                  onChange={(e) => setBedrijfsnaam(e.target.value)}
                />

                <div className="mb-5">
                  <KvkInput value={kvkNummer} onChange={setKvkNummer} />
                </div>

                <label className="text-body-sm font-semibold block mb-1.5">Hoofdcategorie</label>
                <select
                  className="input mb-5"
                  value={hoofdcategorieId}
                  onChange={(e) => setHoofdcategorieId(e.target.value)}
                >
                  <option value="">Kies een categorie...</option>
                  {categorieen.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_nl}
                    </option>
                  ))}
                </select>

                <label className="text-body-sm font-semibold block mb-1.5">Werkgebied</label>
                <div className="flex gap-2 mb-6">
                  <input
                    className="input flex-1"
                    placeholder="Postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                  <select
                    className="input !w-[110px]"
                    value={straal}
                    onChange={(e) => setStraal(Number(e.target.value))}
                  >
                    {STRAAL_OPTIES.map((km) => (
                      <option key={km} value={km}>
                        {km} km
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={() => setStep(3)}
                  disabled={!canContinueStep2()}
                >
                  Verder
                  <ArrowLeft size={16} weight="bold" className="rotate-180" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-display-sm text-center mb-1.5">Bijna klaar!</h1>
                <p className="text-center text-body text-warmgrijs mb-6">Hoe zijn klanten bij je te bereiken?</p>

                <div className="flex flex-col gap-2.5 mb-6">
                  {(
                    [
                      { value: "telefoon" as const, label: "Telefoon" },
                      { value: "whatsapp" as const, label: "WhatsApp" },
                      { value: "app" as const, label: "Via de app" },
                    ]
                  ).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setContactVoorkeur(option.value)}
                      className={`flex items-center gap-3 p-4 rounded-sm border-2 text-left transition-all ${
                        contactVoorkeur === option.value
                          ? "border-terracotta bg-terracotta-50"
                          : "border-lijn hover:border-terracotta hover:bg-terracotta-50/50"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          contactVoorkeur === option.value ? "border-terracotta bg-terracotta" : "border-lijn"
                        }`}
                      />
                      <span className="font-semibold text-body-sm">{option.label}</span>
                    </button>
                  ))}
                </div>

                <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={akkoord}
                    onChange={(e) => setAkkoord(e.target.checked)}
                  />
                  <span className="text-body-sm text-warmgrijs">
                    Ik ga akkoord met de{" "}
                    <a href="/voorwaarden/vakman" target="_blank" rel="noopener noreferrer" className="text-terracotta underline">
                      voorwaarden voor vakmensen
                    </a>{" "}
                    van Neighbuur
                  </span>
                </label>

                <button
                  className="btn-primary w-full"
                  onClick={handleFinish}
                  disabled={!akkoord || saving}
                >
                  {saving ? "Bezig..." : "Registreren"}
                  <ArrowLeft size={16} weight="bold" className="rotate-180" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

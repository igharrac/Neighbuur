"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, EnvelopeSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useLang } from "@/lib/hooks/useLang";
import { useAuthPhoto } from "@/lib/hooks/useAuthPhoto";
import { AuthSplitScreen } from "@/components/features/auth/AuthSplitScreen";
import { AuthQuoteCard, AuthRatingBadge } from "@/components/features/auth/AuthQuoteCard";
import { KvkInput, isValidKvK } from "@/components/features/vakman/KvkInput";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

type Step = 1 | 2 | 3;
type AuthStep = "start" | "checking-email";

const STRAAL_OPTIES = [5, 10, 15, 25];
const RESEND_COOLDOWN = 30;

export function RegistratieForm({ refBron }: { refBron?: string }) {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const { dict } = useLang();
  const photoUrl = useAuthPhoto("professional");

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>(1);

  // Step 1 — identificatie
  const [authStep, setAuthStep] = useState<AuthStep>("start");
  const [email, setEmail] = useState("");
  const [authLoadingLocal, setAuthLoadingLocal] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Step 2 — basisprofiel
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [kvkNummer, setKvkNummer] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoofdcategorieId, setHoofdcategorieId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [straal, setStraal] = useState(15);

  // Step 3 — contact
  const [contactVoorkeur, setContactVoorkeur] = useState<"phone" | "whatsapp" | "app">("app");
  const [akkoord, setAkkoord] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bepaal of deze gebruiker al ingelogd/geregistreerd is
  useEffect(() => {
    if (authLoading) return;

    async function check() {
      if (!user) {
        setChecking(false);
        return;
      }

      const supabase = createClient();
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (profile) {
        router.replace(profile.role === "professional" ? "/dashboard" : "/plan");
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
        .eq("type", "professional")
        .eq("active", true)
        .order("sort_order");
      setCategories((data ?? []) as Category[]);
    }
    loadCategorieen();
  }, []);

  const registreerNext = `/registreer/vakman${refBron ? `?ref=${encodeURIComponent(refBron)}` : ""}`;

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
    setAuthLoadingLocal(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
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
    setAuthStep("checking-email");
    startCooldown();
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
      role: "professional",
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
      const { data: existing } = await supabase.from("professional_profiles").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const { error: vakmanError } = await supabase.from("professional_profiles").insert({
      user_id: user.id,
      company_name: bedrijfsnaam,
      slug,
      kvk_number: kvkNummer.replace(/\s/g, ""),
      specialties: [hoofdcategorieId],
      contact_preference: contactVoorkeur,
      service_area_postcode: postcode || null,
      service_area_km: straal,
      registration_source: refBron ?? null,
      profile_strength: 20,
    });

    setSaving(false);
    if (vakmanError) {
      showToast(vakmanError.message, "error");
      return;
    }

    router.push("/dashboard");
  }

  if (checking) return <div className="min-h-screen" />;

  const stepIndicator = (
    <div className="flex items-center gap-2 mb-8">
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
          {i < 2 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-groen" : "bg-lijn"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <AuthSplitScreen
      photoUrl={photoUrl}
      photoAlt="Vakman in een nieuwbouwwoning met tablet"
      topBadge={<AuthRatingBadge score="4.9" label="(180+ vakmensen)" />}
      bottomCard={
        <AuthQuoteCard
          quote="“Via Neighbuur vullen we complete nieuwbouwstraten in één week. Geen tussenpersonen, direct contact met bewoners.”"
          meta={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-warmzwart">Dennis van der Meer</span>
              <span>Afbouwpartner Amersfoort</span>
            </div>
          }
        />
      }
    >
      {stepIndicator}
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
                <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.registratie.title}</h1>
                <p className="text-body text-warmgrijs mb-6">{dict.registratie.subtitle}</p>

                <label className="text-body-sm font-semibold block mb-1.5">{dict.login.emailLabel}</label>
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
                  disabled={authLoadingLocal || !email.includes("@")}
                >
                  {dict.login.createAccount}
                </button>

                <div className="flex items-center gap-4 my-5 text-body-xs text-warmgrijs">
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
              </>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-terracotta-50 text-terracotta flex items-center justify-center mx-auto mb-4">
                  <EnvelopeSimple size={26} weight="fill" />
                </div>
                <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.login.checkEmailTitle}</h1>
                <p className="text-body text-warmgrijs mb-6">
                  {dict.login.checkEmailSubtitle} <span className="font-semibold text-warmzwart">{email}</span>
                </p>

                <button
                  className="text-body-sm text-terracotta font-semibold hover:underline disabled:opacity-40 disabled:pointer-events-none"
                  onClick={handleSendLink}
                  disabled={cooldown > 0 || authLoadingLocal}
                >
                  {cooldown > 0 ? `${dict.login.resend} (0:${cooldown.toString().padStart(2, "0")})` : dict.login.resend}
                </button>
                <p className="mt-3">
                  <button onClick={() => setAuthStep("start")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                    ← {dict.login.wrongEmail}
                  </button>
                </p>
              </div>
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
            <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.registratie.step2Title}</h1>
            <p className="text-body text-warmgrijs mb-6">{dict.registratie.step2Subtitle}</p>

            <label className="text-body-sm font-semibold block mb-1.5">{dict.registratie.companyLabel}</label>
            <input
              className="input mb-5"
              placeholder={dict.registratie.companyPlaceholder}
              value={bedrijfsnaam}
              onChange={(e) => setBedrijfsnaam(e.target.value)}
            />

            <div className="mb-5">
              <KvkInput value={kvkNummer} onChange={setKvkNummer} />
            </div>

            <label className="text-body-sm font-semibold block mb-1.5">{dict.registratie.categoryLabel}</label>
            <select
              className="input mb-5"
              value={hoofdcategorieId}
              onChange={(e) => setHoofdcategorieId(e.target.value)}
            >
              <option value="">{dict.registratie.categoryPlaceholder}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_nl}
                </option>
              ))}
            </select>

            <label className="text-body-sm font-semibold block mb-1.5">{dict.registratie.areaLabel}</label>
            <div className="flex gap-2 mb-6">
              <input
                className="input flex-1"
                placeholder={dict.registratie.areaPostcodePlaceholder}
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
              {dict.registratie.next}
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
            <h1 className="font-display text-display-sm text-warmzwart mb-1.5">{dict.registratie.step3Title}</h1>
            <p className="text-body text-warmgrijs mb-6">{dict.registratie.step3Subtitle}</p>

            <div className="flex flex-col gap-2.5 mb-6">
              {(
                [
                  { value: "phone" as const, label: dict.registratie.contactPhone },
                  { value: "whatsapp" as const, label: dict.registratie.contactWhatsapp },
                  { value: "app" as const, label: dict.registratie.contactApp },
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
                {dict.registratie.termsPrefix}{" "}
                <a href="/voorwaarden/vakman" target="_blank" rel="noopener noreferrer" className="text-terracotta underline">
                  {dict.registratie.termsLink}
                </a>{" "}
                {dict.registratie.termsSuffix}
              </span>
            </label>

            <button
              className="btn-primary w-full"
              onClick={handleFinish}
              disabled={!akkoord || saving}
            >
              {saving ? dict.registratie.saving : dict.registratie.finish}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthSplitScreen>
  );
}

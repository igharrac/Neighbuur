"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { House, ArrowLeft, MagnifyingGlass, Users, Sparkle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import { generateUitnodigingscode } from "@/lib/utils";
import type { UserRole, Development } from "@/types";

type Step = "naam-rol" | "wijk" | "adres" | "detectie";

const STANDAARD_THRESHOLD = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const next = searchParams.get("next");
  const roleParam = searchParams.get("role") as Extract<UserRole, "resident" | "professional"> | null;
  const { dict, lang } = useLang();
  const { showToast } = useToast();

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>("naam-rol");

  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState<Extract<UserRole, "resident" | "professional"> | null>(
    roleParam === "resident" ? "resident" : null
  );
  const [akkoord, setAkkoord] = useState(false);

  const [wijkQuery, setWijkQuery] = useState("");
  const [wijken, setWijken] = useState<Development[]>([]);
  const [gekozenWijk, setGekozenWijk] = useState<Development | null>(null);

  // Adres — gebruikt voor de buren-detectie, nooit zichtbaar voor anderen
  // zonder dat ze zelf lid worden van dezelfde community.
  const [postcode, setPostcode] = useState("");
  const [huisnummer, setHuisnummer] = useState("");
  const [huisnummerToevoeging, setHuisnummerToevoeging] = useState("");
  const [gebouwLabel, setGebouwLabel] = useState("");

  // Detectie-resultaat
  const [bestaandeCommunity, setBestaandeCommunity] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [clusterTelling, setClusterTelling] = useState(1);
  const [threshold, setThreshold] = useState(STANDAARD_THRESHOLD);
  const [nieuweTitel, setNieuweTitel] = useState("");

  const [saving, setSaving] = useState(false);

  // ── Check bestaande sessie/profiel ──
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(invite ? `/login?invite=${encodeURIComponent(invite)}` : "/login");
        return;
      }

      const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (profiel) {
        if (invite) {
          router.replace(`/uitnodiging/${invite}`);
        } else {
          router.replace(next || (profiel.role === "professional" ? "/dashboard" : "/plan"));
        }
        return;
      }

      // Nieuwe gebruiker die al via /login als vakman aangaf verder te
      // willen — meteen door, geen rolvraag nogmaals tonen.
      if (roleParam === "professional") {
        router.replace("/registreer/vakman");
        return;
      }

      setChecking(false);
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, invite]);

  // ── Wijken laden + filteren ──
  useEffect(() => {
    if (step !== "wijk") return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("developments").select("*").eq("active", true).order("name");
      setWijken((data ?? []) as Development[]);
    }
    load();
  }, [step]);

  const gefilterdeWijken = wijken.filter((w) =>
    `${w.name} ${w.city}`.toLowerCase().includes(wijkQuery.toLowerCase())
  );

  async function handleNaamRolNext() {
    if (!naam || !rol) return;

    if (rol === "professional") {
      // Vakman-registratie heeft zijn eigen akkoord-stap met vakman-specifieke
      // voorwaarden (RegistratieForm.tsx) — hier nog niks opslaan/vragen.
      router.push("/registreer/vakman");
      return;
    }

    if (!akkoord) return;

    if (invite) {
      // Invite bepaalt de community — sla alleen het profiel op en laat de
      // /uitnodiging/[code] handler de rest afronden.
      setSaving(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name: naam,
        email: user.email ?? null,
        phone: user.phone ?? null,
        role: "resident",
        language: lang,
      });

      setSaving(false);
      if (error) {
        showToast(error.message, "error");
        return;
      }
      router.push(`/uitnodiging/${invite}`);
      return;
    }

    setStep("wijk");
  }

  function handleKiesWijk(wijk: Development) {
    setGekozenWijk(wijk);
    setStep("adres");
  }

  async function handleAdresNext() {
    if (!postcode.trim() || !huisnummer.trim() || !gekozenWijk) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const postcodeNorm = postcode.trim().toUpperCase().replace(/\s+/g, "");
    const gebouwNorm = gebouwLabel.trim() || null;

    // Account bestaat vanaf hier — met of zonder community. Community-
    // koppeling gebeurt pas na een expliciete keuze op de volgende stap.
    const { error: profielError } = await supabase.from("profiles").insert({
      id: user.id,
      name: naam,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: "resident",
      language: lang,
    });
    if (profielError) {
      setSaving(false);
      showToast(profielError.message, "error");
      return;
    }

    let code = generateUitnodigingscode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from("resident_profiles").select("id").eq("invite_code", code).maybeSingle();
      if (!existing) break;
      code = generateUitnodigingscode();
    }

    const { error: bewonerError } = await supabase.from("resident_profiles").insert({
      user_id: user.id,
      development_id: gekozenWijk.id,
      postal_code: postcodeNorm,
      house_number: huisnummer.trim(),
      house_number_suffix: huisnummerToevoeging.trim() || null,
      building_label: gebouwNorm,
      invite_code: code,
    });
    if (bewonerError) {
      setSaving(false);
      showToast(bewonerError.message, "error");
      return;
    }

    // Detectie: bestaat er al een community voor dit adres-cluster?
    const { data: bestaande } = await supabase
      .from("communities")
      .select("id, name, slug")
      .eq("development_id", gekozenWijk.id)
      .eq("postcode_cluster", postcodeNorm)
      .neq("status", "dormant")
      .maybeSingle();

    if (bestaande) {
      setBestaandeCommunity(bestaande);
    } else {
      const { data: telling } = await supabase.rpc("count_residents_in_cluster", {
        p_development_id: gekozenWijk.id,
        p_postcode: postcodeNorm,
        p_gebouw_label: gebouwNorm,
      });
      const aantal = typeof telling === "number" ? telling : 1;
      setClusterTelling(aantal);

      const drempel = gekozenWijk.community_threshold ?? STANDAARD_THRESHOLD;
      if (aantal === drempel) {
        // Deze inschrijving heeft de drempel net bereikt — eenmalige melding
        // aan het hele cluster. Bewust fire-and-forget: mag de onboarding-
        // flow nooit blokkeren of laten falen.
        fetch("/api/community/meld-drempel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ developmentId: gekozenWijk.id, postcode: postcodeNorm }),
        }).catch(() => {});
      }
    }
    setThreshold(gekozenWijk.community_threshold ?? STANDAARD_THRESHOLD);
    setSaving(false);
    setStep("detectie");
  }

  async function handleWordLid() {
    if (!bestaandeCommunity) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("community_members").insert({ community_id: bestaandeCommunity.id, user_id: user.id, role: "member" });
    await supabase.from("resident_profiles").update({ community_id: bestaandeCommunity.id }).eq("user_id", user.id);

    setSaving(false);
    router.push(`/community/${bestaandeCommunity.slug}`);
  }

  async function handleStartCommunity() {
    if (!gekozenWijk) return;
    setSaving(true);
    const supabase = createClient();
    const postcodeNorm = postcode.trim().toUpperCase().replace(/\s+/g, "");

    const { data, error } = await supabase.rpc("start_community", {
      p_development_id: gekozenWijk.id,
      p_postcode: postcodeNorm,
      p_titel_nl: nieuweTitel.trim() || null,
    });

    setSaving(false);
    const resultaat = data?.[0] as { id: string; slug: string; aangemaakt: boolean } | undefined;
    if (error || !resultaat) {
      showToast(error?.message ?? "Kon community niet starten", "error");
      return;
    }
    if (resultaat.aangemaakt) {
      fetch("/api/community/meld-gestart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: resultaat.id }),
      }).catch(() => {});
    }
    router.push(`/community/${resultaat.slug}`);
  }

  if (checking) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-terracotta/[0.04] blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative">
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

        <div className="bg-white rounded shadow-strong p-8 sm:p-10 animate-fade-in">
          {/* ── Stap: naam + rol ── */}
          {step === "naam-rol" && (
            <>
              <h1 className="font-display text-display-sm text-center mb-1.5">{dict.login.almostDone}</h1>
              <p className="text-center text-body text-warmgrijs mb-8">{dict.login.tellUs}</p>

              <label className="text-body-sm font-semibold block mb-1.5">{dict.login.yourName}</label>
              <input
                type="text"
                className="input mb-5"
                placeholder={dict.login.namePlaceholder}
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
              />

              {!roleParam && (
                <>
                  <label className="text-body-sm font-semibold block mb-2">{dict.login.whatDescribes}</label>
                  <div className="flex flex-col gap-2.5 mb-6">
                    {(
                      [
                        { value: "resident" as const, icon: "🏠", title: dict.login.resident, sub: dict.login.residentSub },
                        { value: "professional" as const, icon: "🔧", title: dict.login.professional, sub: dict.login.professionalSub },
                      ]
                    ).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRol(option.value)}
                        className={`flex items-center gap-3.5 p-4 rounded-sm border-2 text-left transition-all ${
                          rol === option.value
                            ? "border-terracotta bg-terracotta-50"
                            : "border-lijn hover:border-terracotta hover:bg-terracotta-50/50"
                        }`}
                      >
                        <span className="text-[22px]">{option.icon}</span>
                        <div>
                          <div className="font-semibold text-body-sm">{option.title}</div>
                          <div className="text-body-xs text-warmgrijs">{option.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {rol === "resident" && (
                <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={akkoord}
                    onChange={(e) => setAkkoord(e.target.checked)}
                  />
                  <span className="text-body-sm text-warmgrijs">
                    Ik ga akkoord met de{" "}
                    <a href="/voorwaarden/bewoner" target="_blank" rel="noopener noreferrer" className="text-terracotta underline">
                      voorwaarden voor bewoners
                    </a>{" "}
                    van Neighbuur
                  </span>
                </label>
              )}

              <button
                className="btn-primary w-full"
                onClick={handleNaamRolNext}
                disabled={saving || !naam || !rol || (rol === "resident" && !akkoord)}
              >
                {dict.login.letsGo}
                <ArrowLeft size={16} weight="bold" className="rotate-180" />
              </button>
            </>
          )}

          {/* ── Stap: wijk kiezen ── */}
          {step === "wijk" && (
            <>
              <h1 className="font-display text-display-sm text-center mb-1.5">In welke wijk woon je?</h1>
              <p className="text-center text-body text-warmgrijs mb-6">Zoek of kies je nieuwbouwwijk</p>

              <div className="relative mb-4">
                <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgrijs" />
                <input
                  className="input !pl-10"
                  placeholder="Zoek op wijk of stad..."
                  value={wijkQuery}
                  onChange={(e) => setWijkQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                {gefilterdeWijken.length === 0 && (
                  <p className="text-body-sm text-warmgrijs text-center py-4">Geen wijken gevonden.</p>
                )}
                {gefilterdeWijken.map((wijk) => (
                  <button
                    key={wijk.id}
                    onClick={() => handleKiesWijk(wijk)}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-sm border-2 border-lijn hover:border-terracotta hover:bg-terracotta-50/50 transition-all text-left"
                  >
                    <div>
                      <div className="font-semibold text-body-sm">{wijk.name}</div>
                      <div className="text-body-xs text-warmgrijs">{wijk.city}</div>
                    </div>
                    <ArrowLeft size={15} weight="bold" className="rotate-180 text-warmgrijs" />
                  </button>
                ))}
              </div>

              <button onClick={() => setStep("naam-rol")} className="text-body-sm text-warmgrijs hover:text-warmzwart mt-5">
                ← Terug
              </button>
            </>
          )}

          {/* ── Stap: adres invullen ── */}
          {step === "adres" && gekozenWijk && (
            <>
              <h1 className="font-display text-display-sm text-center mb-1.5">Wat is je adres?</h1>
              <p className="text-center text-body text-warmgrijs mb-6">
                In <span className="font-semibold text-warmzwart">{gekozenWijk.name}</span> — dit gebruiken we alleen
                om te zien welke buren al actief zijn. Niet zichtbaar voor anderen, tenzij je samen lid wordt van
                dezelfde community.
              </p>

              <label className="text-body-sm font-semibold block mb-1.5">Postcode</label>
              <input
                className="input mb-4"
                placeholder="1234 AB"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                autoFocus
              />

              <label className="text-body-sm font-semibold block mb-1.5">Huisnummer</label>
              <div className="flex gap-2 mb-4">
                <input
                  className="input flex-1"
                  placeholder="12"
                  value={huisnummer}
                  onChange={(e) => setHuisnummer(e.target.value)}
                />
                <input
                  className="input !w-[110px]"
                  placeholder="Toev. (optioneel)"
                  value={huisnummerToevoeging}
                  onChange={(e) => setHuisnummerToevoeging(e.target.value)}
                />
              </div>

              <label className="text-body-sm font-semibold block mb-1.5">Gebouw of toren (optioneel)</label>
              <input
                className="input mb-6"
                placeholder="Bijv. Toren A"
                value={gebouwLabel}
                onChange={(e) => setGebouwLabel(e.target.value)}
              />

              <button
                className="btn-primary w-full mb-3"
                onClick={handleAdresNext}
                disabled={saving || !postcode.trim() || !huisnummer.trim()}
              >
                {saving ? "Bezig..." : "Volgende"}
                <ArrowLeft size={16} weight="bold" className="rotate-180" />
              </button>
              <button onClick={() => setStep("wijk")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                ← Andere wijk
              </button>
            </>
          )}

          {/* ── Stap: detectie-resultaat ── */}
          {step === "detectie" && gekozenWijk && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-terracotta-50 flex items-center justify-center mx-auto mb-4">
                {bestaandeCommunity || clusterTelling >= threshold ? (
                  <Users size={22} className="text-terracotta" weight="fill" />
                ) : (
                  <Sparkle size={22} className="text-terracotta" weight="fill" />
                )}
              </div>

              {bestaandeCommunity ? (
                <>
                  <h1 className="font-display text-display-sm mb-1.5">Je buren hebben al een community gestart.</h1>
                  <p className="text-body text-warmgrijs mb-6">
                    <span className="font-semibold text-warmzwart">{bestaandeCommunity.name}</span> is al actief voor
                    jouw adres.
                  </p>
                  <button className="btn-primary w-full" onClick={handleWordLid} disabled={saving}>
                    {saving ? "Bezig..." : "Word lid"}
                    <ArrowLeft size={16} weight="bold" className="rotate-180" />
                  </button>
                </>
              ) : clusterTelling >= threshold ? (
                <>
                  <h1 className="font-display text-display-sm mb-1.5">
                    Er zijn inmiddels {clusterTelling} bewoners uit {gebouwLabel || postcode} actief.
                  </h1>
                  <p className="text-body text-warmgrijs mb-6">
                    Genoeg buren voor een eigen community. Jij mag 'm starten — of iemand anders doet dat straks.
                  </p>
                  <input
                    className="input mb-3 text-left"
                    placeholder={`Bijv. Buurtgroep ${postcode}`}
                    value={nieuweTitel}
                    onChange={(e) => setNieuweTitel(e.target.value)}
                  />
                  <button className="btn-primary w-full mb-3" onClick={handleStartCommunity} disabled={saving}>
                    {saving ? "Bezig..." : "Start jullie community"}
                    <ArrowLeft size={16} weight="bold" className="rotate-180" />
                  </button>
                  <button onClick={() => router.push(next || "/plan")} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                    Liever later
                  </button>
                </>
              ) : (
                <>
                  <h1 className="font-display text-display-sm mb-1.5">
                    Je bent een van de eerste bewoners uit dit blok op Neighbuur.
                  </h1>
                  <p className="text-body text-warmgrijs mb-6">
                    Zodra er {threshold} buren zijn, kun je samen een community starten. Nodig gerust buren uit om
                    het sneller te laten gebeuren.
                  </p>
                  <button className="btn-primary w-full" onClick={() => router.push(next || "/plan")}>
                    Naar Mijn Plan
                    <ArrowLeft size={16} weight="bold" className="rotate-180" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

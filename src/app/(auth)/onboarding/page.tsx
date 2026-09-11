"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { House, ArrowLeft, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import { generateUitnodigingscode, slugify } from "@/lib/utils";
import type { UserRole, Wijk, Community } from "@/types";

type Step = "naam-rol" | "wijk" | "community";

const COMMUNITY_TYPES = ["blok", "flat", "verdieping", "portiek"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const next = searchParams.get("next");
  const { dict, lang } = useLang();
  const { showToast } = useToast();

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>("naam-rol");

  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState<Extract<UserRole, "bewoner" | "vakman"> | null>(null);

  const [wijkQuery, setWijkQuery] = useState("");
  const [wijken, setWijken] = useState<Wijk[]>([]);
  const [gekozenWijk, setGekozenWijk] = useState<Wijk | null>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [voorstellen, setVoorstellen] = useState(false);
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [nieuwType, setNieuwType] = useState<(typeof COMMUNITY_TYPES)[number]>("blok");

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

      const { data: profiel } = await supabase.from("profielen").select("rol").eq("id", user.id).maybeSingle();

      if (profiel) {
        if (invite) {
          router.replace(`/uitnodiging/${invite}`);
        } else {
          router.replace(next || (profiel.rol === "vakman" ? "/dashboard" : "/plan"));
        }
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
      const { data } = await supabase.from("wijken").select("*").eq("actief", true).order("naam");
      setWijken((data ?? []) as Wijk[]);
    }
    load();
  }, [step]);

  const gefilterdeWijken = wijken.filter((w) =>
    `${w.naam} ${w.stad}`.toLowerCase().includes(wijkQuery.toLowerCase())
  );

  // ── Communities laden voor gekozen wijk ──
  useEffect(() => {
    if (!gekozenWijk) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("communities")
        .select("*")
        .eq("wijk_id", gekozenWijk!.id)
        .eq("actief", true)
        .order("naam");
      setCommunities((data ?? []) as Community[]);
    }
    load();
  }, [gekozenWijk]);

  async function handleNaamRolNext() {
    if (!naam || !rol) return;

    if (rol === "vakman") {
      router.push("/registreer/vakman");
      return;
    }

    if (invite) {
      // Invite bepaalt de community — sla alleen het profiel op en laat de
      // /uitnodiging/[code] handler de rest afronden.
      setSaving(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profielen").insert({
        id: user.id,
        naam,
        email: user.email ?? null,
        telefoon: user.phone ?? null,
        rol: "bewoner",
        taal: lang,
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

  function handleKiesWijk(wijk: Wijk) {
    setGekozenWijk(wijk);
    setStep("community");
  }

  async function joinCommunity(community: { id: string; wijk_id: string; slug: string }, beheerder: boolean) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profielError } = await supabase.from("profielen").insert({
      id: user.id,
      naam,
      email: user.email ?? null,
      telefoon: user.phone ?? null,
      rol: "bewoner",
      taal: lang,
    });
    if (profielError) {
      setSaving(false);
      showToast(profielError.message, "error");
      return;
    }

    await supabase
      .from("community_leden")
      .insert({ community_id: community.id, user_id: user.id, rol: beheerder ? "beheerder" : "lid" });

    let code = generateUitnodigingscode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("bewoner_profielen")
        .select("id")
        .eq("uitnodigingscode", code)
        .maybeSingle();
      if (!existing) break;
      code = generateUitnodigingscode();
    }

    const { error: bewonerError } = await supabase.from("bewoner_profielen").insert({
      user_id: user.id,
      community_id: community.id,
      wijk_id: community.wijk_id,
      uitnodigingscode: code,
    });

    setSaving(false);
    if (bewonerError) {
      showToast(bewonerError.message, "error");
      return;
    }

    router.push(`/community/${community.slug}`);
  }

  async function handleVoorstellen() {
    if (!nieuweNaam.trim() || !gekozenWijk) return;
    setSaving(true);
    const supabase = createClient();

    const baseSlug = slugify(`${gekozenWijk.naam}-${nieuweNaam}`);
    let slug = baseSlug;
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from("communities").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const { data: nieuweCommunity, error } = await supabase
      .from("communities")
      .insert({ wijk_id: gekozenWijk.id, naam: nieuweNaam, slug, type: nieuwType, actief: true })
      .select()
      .single();

    if (error || !nieuweCommunity) {
      setSaving(false);
      showToast(error?.message ?? "Kon community niet aanmaken", "error");
      return;
    }

    await joinCommunity(nieuweCommunity, true);
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

              <label className="text-body-sm font-semibold block mb-2">{dict.login.whatDescribes}</label>
              <div className="flex flex-col gap-2.5 mb-6">
                {(
                  [
                    { value: "bewoner" as const, icon: "🏠", title: dict.login.resident, sub: dict.login.residentSub },
                    { value: "vakman" as const, icon: "🔧", title: dict.login.professional, sub: dict.login.professionalSub },
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

              <button className="btn-primary w-full" onClick={handleNaamRolNext} disabled={saving || !naam || !rol}>
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
                      <div className="font-semibold text-body-sm">{wijk.naam}</div>
                      <div className="text-body-xs text-warmgrijs">{wijk.stad}</div>
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

          {/* ── Stap: community kiezen ── */}
          {step === "community" && gekozenWijk && (
            <>
              <h1 className="font-display text-display-sm text-center mb-1.5">Welk blok is van jou?</h1>
              <p className="text-center text-body text-warmgrijs mb-6">
                Communities in <span className="font-semibold text-warmzwart">{gekozenWijk.naam}</span>
              </p>

              {!voorstellen ? (
                <>
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto mb-4">
                    {communities.length === 0 && (
                      <p className="text-body-sm text-warmgrijs text-center py-4">Nog geen communities in deze wijk.</p>
                    )}
                    {communities.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => joinCommunity(c, false)}
                        disabled={saving}
                        className="flex items-center justify-between gap-2 p-3.5 rounded-sm border-2 border-lijn hover:border-terracotta hover:bg-terracotta-50/50 transition-all text-left"
                      >
                        <div>
                          <div className="font-semibold text-body-sm">{c.naam}</div>
                          <div className="text-body-xs text-warmgrijs capitalize">{c.type}</div>
                        </div>
                        <ArrowLeft size={15} weight="bold" className="rotate-180 text-warmgrijs" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setVoorstellen(true)}
                    className="text-body-sm text-terracotta font-semibold hover:underline"
                  >
                    Mijn blok staat er niet bij → Stel voor
                  </button>
                </>
              ) : (
                <div className="animate-fade-in">
                  <label className="text-body-sm font-semibold block mb-1.5">Naam van je blok/flat</label>
                  <input
                    className="input mb-4"
                    placeholder="Bijv. Blok D"
                    value={nieuweNaam}
                    onChange={(e) => setNieuweNaam(e.target.value)}
                  />
                  <label className="text-body-sm font-semibold block mb-2">Type</label>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {COMMUNITY_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setNieuwType(type)}
                        className={`px-3.5 py-2 rounded-sm text-body-sm font-semibold capitalize border-2 transition-colors ${
                          nieuwType === type ? "border-terracotta bg-terracotta-50 text-terracotta" : "border-lijn text-warmgrijs"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn-primary w-full mb-3"
                    onClick={handleVoorstellen}
                    disabled={saving || !nieuweNaam.trim()}
                  >
                    {saving ? "Bezig..." : "Voorstellen & doorgaan"}
                    <Check size={16} weight="bold" />
                  </button>
                  <button onClick={() => setVoorstellen(false)} className="text-body-sm text-warmgrijs hover:text-warmzwart">
                    ← Terug naar lijst
                  </button>
                </div>
              )}

              {!voorstellen && (
                <button onClick={() => setStep("wijk")} className="text-body-sm text-warmgrijs hover:text-warmzwart mt-5 block">
                  ← Andere wijk
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

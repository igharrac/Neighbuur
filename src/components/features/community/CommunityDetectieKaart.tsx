"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Sparkle, ArrowRight, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";

export type DetectieResultaat =
  | { type: "bestaande"; name: string; slug: string; communityId: string }
  | { type: "drempel"; postcode: string; telling: number; threshold: number; developmentId: string }
  | { type: "vroeg"; threshold: number };

export function CommunityDetectieKaart(props: DetectieResultaat) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [titel, setTitel] = useState("");
  const [verborgen, setVerborgen] = useState(false);

  async function nietMeerTonen() {
    setVerborgen(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("resident_profiles").update({ show_community_suggestions: false }).eq("user_id", user.id);
  }

  if (verborgen) return null;

  async function wordLid() {
    if (props.type !== "bestaande") return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("community_members").insert({ community_id: props.communityId, user_id: user.id, role: "member" });
    await supabase.from("resident_profiles").update({ community_id: props.communityId }).eq("user_id", user.id);
    router.push(`/community/${props.slug}`);
  }

  async function start() {
    if (props.type !== "drempel") return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("start_community", {
      p_development_id: props.developmentId,
      p_postcode: props.postcode,
      p_titel_nl: titel.trim() || null,
    });
    setSaving(false);
    const resultaat = data?.[0] as { id: string; slug: string; aangemaakt: boolean } | undefined;
    if (error || !resultaat) return;
    if (resultaat.aangemaakt) {
      fetch("/api/community/meld-gestart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: resultaat.id }),
      }).catch(() => {});
    }
    router.push(`/community/${resultaat.slug}`);
  }

  if (props.type === "bestaande") {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0px_4px_10px_rgba(92,64,40,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-groen/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-groen" weight="fill" />
          </span>
          <div>
            <h3 className="font-body font-bold text-[15px] text-warmzwart">Je buren hebben al een community gestart</h3>
            <p className="font-body text-[13px] text-warmgrijs">{props.name} is actief voor jouw adres.</p>
          </div>
        </div>
        <button onClick={wordLid} disabled={saving} className="btn-primary shrink-0 !py-2.5">
          {saving ? "Bezig..." : "Word lid"}
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    );
  }

  if (props.type === "drempel") {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center shrink-0">
            <Users size={18} className="text-terracotta" weight="fill" />
          </span>
          <div>
            <h3 className="font-body font-bold text-[15px] text-warmzwart">
              Er zijn inmiddels {props.telling} bewoners uit {props.postcode} actief
            </h3>
            <p className="font-body text-[13px] text-warmgrijs">Genoeg buren voor een eigen community.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder={`Bijv. Buurtgroep ${props.postcode}`}
            className="input flex-1 !py-2.5 !text-[14px]"
          />
          <button onClick={start} disabled={saving} className="btn-primary shrink-0 !py-2.5">
            {saving ? "Bezig..." : "Start jullie community"}
            <ArrowRight size={15} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0px_4px_10px_rgba(92,64,40,0.04)] flex items-start gap-3">
      <span className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center shrink-0">
        <Sparkle size={18} className="text-terracotta" weight="fill" />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-body font-bold text-[15px] text-warmzwart">Je bent een van de eerste bewoners uit dit blok op Neighbuur</h3>
        <p className="font-body text-[13px] text-warmgrijs">
          Zodra er {props.threshold} buren zijn, kun je samen een community starten.
        </p>
      </div>
      <button
        onClick={nietMeerTonen}
        title="Niet meer tonen"
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-warmgrijs hover:bg-cream hover:text-warmzwart transition-colors"
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  );
}

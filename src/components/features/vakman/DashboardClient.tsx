"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { ProfielSterkte } from "@/components/features/vakman/ProfielSterkte";
import { LogoPrompt } from "@/components/features/vakman/LogoPrompt";
import { BookingCard } from "@/components/features/booking/BookingCard";
import { PremiumUpsell } from "@/components/features/premium/PremiumUpsell";
import type { BoekingMetKlant, BoekingStatus, VakmanProfiel } from "@/types";

const UPSELL_DISMISSED_KEY = "nt_premium_upsell_dismissed";

interface DashboardClientProps {
  vakman: VakmanProfiel;
  werkFotoCount: number;
  heeftBeschikbaarheid: boolean;
  boekingen: BoekingMetKlant[];
  gesprekPerKlant: Record<string, string>;
}

export function DashboardClient({
  vakman: initialVakman,
  werkFotoCount,
  heeftBeschikbaarheid,
  boekingen: initialBoekingen,
  gesprekPerKlant,
}: DashboardClientProps) {
  const [vakman, setVakman] = useState(initialVakman);
  const [boekingen, setBoekingen] = useState(initialBoekingen);
  const [upsellZichtbaar, setUpsellZichtbaar] = useState(false);

  useEffect(() => {
    try {
      setUpsellZichtbaar(localStorage.getItem(UPSELL_DISMISSED_KEY) !== "1");
    } catch {
      setUpsellZichtbaar(true);
    }
  }, []);

  function handleDismissUpsell() {
    setUpsellZichtbaar(false);
    try {
      localStorage.setItem(UPSELL_DISMISSED_KEY, "1");
    } catch {}
  }

  function handleStatusChange(id: string, status: BoekingStatus) {
    setBoekingen((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const limietBereikt = !vakman.is_premium && vakman.aanvragen_deze_maand >= vakman.aanvragen_limiet;
  const nieuweAanvragen = boekingen.filter((b) => b.status === "aangevraagd");
  const lopendeKlussen = boekingen.filter((b) => b.status === "bevestigd");
  const afgeslotenKlussen = boekingen.filter((b) => b.status === "afgerond" || b.status === "geannuleerd");

  async function handleLogoUploaded(url: string) {
    const supabase = createClient();
    await supabase.from("vakman_profielen").update({ logo_url: url }).eq("id", vakman.id);

    const { data: sterkte } = await supabase.rpc("bereken_profiel_sterkte", { v_id: vakman.id });
    const nieuweSterkte = sterkte ?? vakman.profiel_sterkte;
    await supabase.from("vakman_profielen").update({ profiel_sterkte: nieuweSterkte }).eq("id", vakman.id);

    setVakman((v) => ({ ...v, logo_url: url, profiel_sterkte: nieuweSterkte }));
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md text-warmzwart">Welkom, {vakman.bedrijfsnaam}</h1>
        <p className="text-body text-warmgrijs mt-1">Je profiel is {vakman.profiel_sterkte}% compleet</p>
      </div>

      {!vakman.logo_url && (
        <LogoPrompt vakmanId={vakman.id} bedrijfsnaam={vakman.bedrijfsnaam} onUploaded={handleLogoUploaded} />
      )}

      <ProfielSterkte vakman={vakman} werkFotoCount={werkFotoCount} heeftBeschikbaarheid={heeftBeschikbaarheid} />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/profiel" className="btn-primary">
          Bewerk profiel
          <ArrowRight size={16} weight="bold" />
        </Link>
        <Link href={`/vakman/${vakman.slug}`} className="btn-secondary">
          Bekijk mijn pagina
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>

      {!vakman.is_premium && limietBereikt && <PremiumUpsell variant="limiet" />}
      {!vakman.is_premium && !limietBereikt && upsellZichtbaar && (
        <PremiumUpsell variant="dashboard" onDismiss={handleDismissUpsell} />
      )}

      {nieuweAanvragen.length > 0 && (
        <div>
          <h2 className="font-display text-display-sm text-warmzwart mb-3">
            Nieuwe aanvragen
            <span className="badge badge-terracotta ml-2">{nieuweAanvragen.length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {nieuweAanvragen.map((boeking) => (
              <BookingCard
                key={boeking.id}
                boeking={boeking}
                gesprekId={gesprekPerKlant[boeking.customer_id] ?? null}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {lopendeKlussen.length > 0 && (
        <div>
          <h2 className="font-display text-display-sm text-warmzwart mb-3">Lopende klussen</h2>
          <div className="flex flex-col gap-3">
            {lopendeKlussen.map((boeking) => (
              <BookingCard
                key={boeking.id}
                boeking={boeking}
                gesprekId={gesprekPerKlant[boeking.customer_id] ?? null}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {afgeslotenKlussen.length > 0 && (
        <div>
          <h2 className="font-display text-display-sm text-warmzwart mb-3">Afgerond &amp; geannuleerd</h2>
          <div className="flex flex-col gap-3">
            {afgeslotenKlussen.map((boeking) => (
              <BookingCard
                key={boeking.id}
                boeking={boeking}
                gesprekId={gesprekPerKlant[boeking.customer_id] ?? null}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

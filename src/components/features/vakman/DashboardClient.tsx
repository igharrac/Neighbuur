"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { ProfielSterkte } from "@/components/features/vakman/ProfielSterkte";
import { LogoPrompt } from "@/components/features/vakman/LogoPrompt";
import { BookingCard } from "@/components/features/booking/BookingCard";
import { PremiumUpsell } from "@/components/features/premium/PremiumUpsell";
import type { BookingWithCustomer, BookingStatus, ProfessionalProfile } from "@/types";

const UPSELL_DISMISSED_KEY = "nt_premium_upsell_dismissed";

interface DashboardClientProps {
  vakman: ProfessionalProfile;
  werkFotoCount: number;
  heeftBeschikbaarheid: boolean;
  boekingen: BookingWithCustomer[];
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

  function handleStatusChange(id: string, status: BookingStatus) {
    setBoekingen((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const limietBereikt = !vakman.is_premium && vakman.requests_this_month >= vakman.requests_limit;
  const nieuweAanvragen = boekingen.filter((b) => b.status === "requested");
  const lopendeKlussen = boekingen.filter((b) => b.status === "confirmed");
  const afgeslotenKlussen = boekingen.filter((b) => b.status === "completed" || b.status === "cancelled");

  async function handleLogoUploaded(url: string) {
    const supabase = createClient();
    await supabase.from("professional_profiles").update({ logo_url: url }).eq("id", vakman.id);

    const { data: sterkte } = await supabase.rpc("calculate_profile_strength", { v_id: vakman.id });
    const nieuweSterkte = sterkte ?? vakman.profile_strength;
    await supabase.from("professional_profiles").update({ profile_strength: nieuweSterkte }).eq("id", vakman.id);

    setVakman((v) => ({ ...v, logo_url: url, profile_strength: nieuweSterkte }));
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md text-warmzwart">Welkom, {vakman.company_name}</h1>
        <p className="text-body text-warmgrijs mt-1">Je profiel is {vakman.profile_strength}% compleet</p>
      </div>

      {!vakman.logo_url && (
        <LogoPrompt vakmanId={vakman.id} bedrijfsnaam={vakman.company_name} onUploaded={handleLogoUploaded} />
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

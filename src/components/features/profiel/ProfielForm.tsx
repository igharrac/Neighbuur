"use client";

import { useState } from "react";
import { MapPin } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AccountActions } from "@/components/features/profiel/AccountActions";
import { WijzigAdresModal } from "@/components/features/profiel/WijzigAdresModal";
import type { Profile } from "@/types";

interface ProfielFormProps {
  profile: Profile;
  adres: string | null;
}

export function ProfielForm({ profile: initialProfile, adres }: ProfielFormProps) {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [savingBasis, setSavingBasis] = useState(false);
  const [savingTaal, setSavingTaal] = useState(false);
  const [adresModalOpen, setAdresModalOpen] = useState(false);

  const [naam, setNaam] = useState(profile.name);
  const [telefoon, setTelefoon] = useState(profile.phone ?? "");

  async function handleSaveBasis() {
    setSavingBasis(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name: naam, phone: telefoon || null })
      .eq("id", profile.id);

    setSavingBasis(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setProfile((v) => ({ ...v, name: naam, phone: telefoon || null }));
    showToast("Basisgegevens opgeslagen", "success");
  }

  async function handleAvatarUploaded(url: string) {
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
    setProfile((v) => ({ ...v, avatar_url: url }));
    showToast("Foto geüpload", "success");
  }

  async function handleTaalWijzigen(taal: "nl" | "en") {
    setSavingTaal(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ language: taal }).eq("id", profile.id);
    setSavingTaal(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setProfile((v) => ({ ...v, language: taal }));
    showToast("Taal bijgewerkt", "success");
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md text-warmzwart">Mijn profiel</h1>
      </div>

      {/* ── Basisgegevens ── */}
      <section className="card-flat p-6">
        <h2 className="font-display text-display-sm text-warmzwart mb-4">Basisgegevens</h2>
        <div className="flex flex-col gap-4">
          <div className="max-w-[140px]">
            <ImageUploader bucket="avatars" pathPrefix={`${profile.id}/avatar`} value={profile.avatar_url ?? undefined} onUploaded={handleAvatarUploaded} aspect="square" />
          </div>

          <Input label="Naam" value={naam} onChange={(e) => setNaam(e.target.value)} />
          <Input label="Telefoon" value={telefoon} onChange={(e) => setTelefoon(e.target.value)} placeholder="06 12345678" />

          <div>
            <label className="text-body-sm font-semibold block mb-1.5">E-mail</label>
            <input className="input" value={profile.email ?? ""} disabled />
          </div>

          <Button size="sm" onClick={handleSaveBasis} disabled={savingBasis} className="self-start">
            {savingBasis ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </section>

      {/* ── Taal ── */}
      <section className="card-flat p-6">
        <h2 className="font-display text-display-sm text-warmzwart mb-4">Taal</h2>
        <div className="flex gap-2">
          {(["nl", "en"] as const).map((taal) => (
            <button
              key={taal}
              onClick={() => handleTaalWijzigen(taal)}
              disabled={savingTaal}
              className={`px-4 py-2 rounded-sm text-body-sm font-semibold border-2 transition-colors ${
                profile.language === taal ? "border-terracotta bg-terracotta-50 text-terracotta" : "border-lijn text-warmgrijs"
              }`}
            >
              {taal === "nl" ? "Nederlands" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* ── Mijn adres (alleen bewoners) ── */}
      {profile.role === "resident" && (
        <section className="card-flat p-6">
          <h2 className="font-display text-display-sm text-warmzwart mb-4">Mijn adres</h2>
          {adres ? (
            <p className="flex items-start gap-2 text-body text-warmzwart mb-4">
              <MapPin size={18} className="text-terracotta shrink-0 mt-0.5" />
              {adres}
            </p>
          ) : (
            <p className="text-body text-warmgrijs mb-4">Nog geen adres bekend.</p>
          )}
          <Button variant="secondary" size="sm" onClick={() => setAdresModalOpen(true)}>
            Adres wijzigen
          </Button>
          <WijzigAdresModal open={adresModalOpen} onClose={() => setAdresModalOpen(false)} />
        </section>
      )}

      {/* ── Account ── */}
      <AccountActions />
    </div>
  );
}

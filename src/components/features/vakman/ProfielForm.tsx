"use client";

import { useEffect, useState } from "react";
import { FileText, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { WerkFotoGrid } from "@/components/features/vakman/WerkFotoGrid";
import { BeschikbaarheidEditor } from "@/components/features/vakman/BeschikbaarheidEditor";
import type { Categorie, VakmanProfiel } from "@/types";

const STRAAL_OPTIES = [5, 10, 15, 25];

interface WerkFoto {
  id: string;
  foto_url: string;
  bijschrift: string | null;
}

interface ProfielFormProps {
  vakman: VakmanProfiel;
  werkFotos: WerkFoto[];
  beschikbaarheid: Record<string, "beschikbaar" | "bezet">;
}

export function ProfielForm({ vakman: initialVakman, werkFotos, beschikbaarheid }: ProfielFormProps) {
  const { showToast } = useToast();
  const [vakman, setVakman] = useState(initialVakman);
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);
  const [savingBasis, setSavingBasis] = useState(false);
  const [savingVerrijking, setSavingVerrijking] = useState(false);

  const [bedrijfsnaam, setBedrijfsnaam] = useState(vakman.bedrijfsnaam);
  const [hoofdcategorieId, setHoofdcategorieId] = useState(vakman.specialismes[0] ?? "");
  const [postcode, setPostcode] = useState(vakman.werkgebied_postcode ?? "");
  const [straal, setStraal] = useState(vakman.werkgebied_km);
  const [contactVoorkeur, setContactVoorkeur] = useState(vakman.contact_voorkeur);

  const [website, setWebsite] = useState(vakman.website ?? "");
  const [bio, setBio] = useState(vakman.bio ?? "");

  const { upload: uploadVerzekering, uploading: uploadingVerzekering } = useImageUpload({
    bucket: "vakman-documenten",
    pathPrefix: `${vakman.id}/verzekering`,
    isPrivate: true,
    accept: ["image/jpeg", "image/png", "application/pdf"],
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("categorieen").select("*").eq("type", "vakman").eq("actief", true).order("sorteer");
      setCategorieen((data ?? []) as Categorie[]);
    }
    load();
  }, []);

  async function recalcSterkte() {
    const supabase = createClient();
    const { data: sterkte } = await supabase.rpc("bereken_profiel_sterkte", { v_id: vakman.id });
    if (sterkte != null) {
      await supabase.from("vakman_profielen").update({ profiel_sterkte: sterkte }).eq("id", vakman.id);
      setVakman((v) => ({ ...v, profiel_sterkte: sterkte }));
    }
  }

  async function handleSaveBasis() {
    setSavingBasis(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("vakman_profielen")
      .update({
        bedrijfsnaam,
        specialismes: hoofdcategorieId ? [hoofdcategorieId] : [],
        werkgebied_postcode: postcode || null,
        werkgebied_km: straal,
        contact_voorkeur: contactVoorkeur,
      })
      .eq("id", vakman.id);

    setSavingBasis(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setVakman((v) => ({ ...v, bedrijfsnaam, werkgebied_postcode: postcode, werkgebied_km: straal, contact_voorkeur: contactVoorkeur }));
    showToast("Basisgegevens opgeslagen", "success");
  }

  async function handleLogoUploaded(url: string) {
    const supabase = createClient();
    await supabase.from("vakman_profielen").update({ logo_url: url }).eq("id", vakman.id);
    setVakman((v) => ({ ...v, logo_url: url }));
    await recalcSterkte();
    showToast("Logo geüpload", "success");
  }

  async function handleSaveVerrijking() {
    setSavingVerrijking(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("vakman_profielen")
      .update({ website: website || null, bio: bio || null })
      .eq("id", vakman.id);

    setSavingVerrijking(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setVakman((v) => ({ ...v, website, bio }));
    await recalcSterkte();
    showToast("Opgeslagen", "success");
  }

  async function handleVerzekeringUpload(file: File | undefined) {
    if (!file) return;
    const path = await uploadVerzekering(file);
    if (!path) return;

    const supabase = createClient();
    await supabase.from("vakman_profielen").update({ verzekering_url: path, verzekerd: true }).eq("id", vakman.id);
    setVakman((v) => ({ ...v, verzekering_url: path, verzekerd: true }));
    await recalcSterkte();
    showToast("Verzekeringsbewijs geüpload", "success");
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-md text-warmzwart">Profiel bewerken</h1>
        <p className="text-body text-warmgrijs mt-1">Profielsterkte: {vakman.profiel_sterkte}%</p>
      </div>

      {/* ── Basis ── */}
      <section className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Basis</h2>
        <div className="flex flex-col gap-4">
          <Input name="bedrijfsnaam" label="Bedrijfsnaam" value={bedrijfsnaam} onChange={(e) => setBedrijfsnaam(e.target.value)} />

          <div>
            <label className="text-body-sm font-semibold block mb-1.5">KvK-nummer</label>
            <div className="flex items-center gap-2">
              <input className="input flex-1" value={vakman.kvk_nummer ?? ""} disabled />
              {vakman.kvk_geverifieerd && (
                <span className="flex items-center gap-1 text-body-xs font-semibold text-groen shrink-0">
                  <Check size={14} weight="bold" /> Geverifieerd
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-body-sm font-semibold block mb-1.5">Hoofdcategorie</label>
            <select className="input" value={hoofdcategorieId} onChange={(e) => setHoofdcategorieId(e.target.value)}>
              <option value="">Kies een categorie...</option>
              {categorieen.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.naam_nl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-body-sm font-semibold block mb-1.5">Werkgebied</label>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
              <select className="input !w-[110px]" value={straal} onChange={(e) => setStraal(Number(e.target.value))}>
                {STRAAL_OPTIES.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-body-sm font-semibold block mb-2">Contactvoorkeur</label>
            <div className="flex gap-2 flex-wrap">
              {(["telefoon", "whatsapp", "app"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setContactVoorkeur(opt)}
                  className={`px-4 py-2 rounded-sm text-body-sm font-semibold capitalize border-2 transition-colors ${
                    contactVoorkeur === opt ? "border-terracotta bg-terracotta-50 text-terracotta" : "border-lijn text-warmgrijs"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <Button size="sm" onClick={handleSaveBasis} disabled={savingBasis} className="self-start">
            {savingBasis ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </section>

      {/* ── Logo ── */}
      <section id="logo" className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Logo</h2>
        <div className="max-w-[200px]">
          <ImageUploader bucket="vakman-logos" pathPrefix={`${vakman.id}/logo`} value={vakman.logo_url} onUploaded={handleLogoUploaded} aspect="square" />
        </div>
      </section>

      {/* ── Website & bio ── */}
      <section className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Over je bedrijf</h2>
        <div className="flex flex-col gap-4">
          <Input id="website" name="website" label="Website" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />

          <div id="bio">
            <label className="text-body-sm font-semibold block mb-1.5">Bio</label>
            <textarea
              className="input min-h-[120px] resize-y"
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Vertel iets over je bedrijf en manier van werken..."
            />
            <p className="text-body-xs text-warmgrijs mt-1 text-right">{bio.length}/500</p>
          </div>

          <Button size="sm" onClick={handleSaveVerrijking} disabled={savingVerrijking} className="self-start">
            {savingVerrijking ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </section>

      {/* ── Werkfoto's ── */}
      <section id="fotos" className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Werkfoto&apos;s</h2>
        <WerkFotoGrid vakmanId={vakman.id} initialFotos={werkFotos} isPremium={vakman.is_premium} />
      </section>

      {/* ── Beschikbaarheid ── */}
      <section id="beschikbaarheid" className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Beschikbaarheid — komende 4 weken</h2>
        <BeschikbaarheidEditor vakmanId={vakman.id} initialData={beschikbaarheid} />
      </section>

      {/* ── Verzekeringsbewijs ── */}
      <section id="verzekering" className="bg-white rounded-md shadow-soft p-6">
        <h2 className="font-bold text-body mb-4">Verzekeringsbewijs</h2>
        {vakman.verzekering_url ? (
          <p className="flex items-center gap-2 text-body-sm text-groen font-medium">
            <Check size={16} weight="bold" /> Bewijs geüpload
          </p>
        ) : (
          <label className="inline-flex items-center gap-2 btn-secondary cursor-pointer">
            <FileText size={16} />
            {uploadingVerzekering ? "Uploaden..." : "Bestand kiezen"}
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => handleVerzekeringUpload(e.target.files?.[0])}
            />
          </label>
        )}
      </section>
    </div>
  );
}

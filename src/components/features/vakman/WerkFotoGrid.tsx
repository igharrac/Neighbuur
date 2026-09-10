/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { Plus, Trash, Spinner } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { PremiumUpsell } from "@/components/features/premium/PremiumUpsell";

interface WerkFoto {
  id: string;
  foto_url: string;
  bijschrift: string | null;
}

const GRATIS_MAX_FOTOS = 3;
const PREMIUM_MAX_FOTOS = 12;

export function WerkFotoGrid({
  vakmanId,
  initialFotos,
  isPremium,
}: {
  vakmanId: string;
  initialFotos: WerkFoto[];
  isPremium: boolean;
}) {
  const [fotos, setFotos] = useState(initialFotos);
  const [toonUpsell, setToonUpsell] = useState(false);
  const { upload, uploading } = useImageUpload({ bucket: "vakman-werkfotos", pathPrefix: `${vakmanId}/${crypto.randomUUID()}` });
  const inputRef = useRef<HTMLInputElement>(null);

  const maxFotos = isPremium ? PREMIUM_MAX_FOTOS : GRATIS_MAX_FOTOS;

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (fotos.length >= maxFotos) {
      setToonUpsell(true);
      return;
    }
    const url = await upload(file);
    if (!url) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("werk_fotos")
      .insert({ vakman_id: vakmanId, foto_url: url })
      .select()
      .single();

    if (!error && data) setFotos((prev) => [...prev, data as WerkFoto]);
  }

  async function handleCaptionSave(id: string, bijschrift: string) {
    const supabase = createClient();
    await supabase.from("werk_fotos").update({ bijschrift }).eq("id", id);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("werk_fotos").delete().eq("id", id);
    setFotos((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative rounded-md overflow-hidden bg-cream aspect-square">
            <img src={foto.foto_url} alt={foto.bijschrift ?? ""} className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(foto.id)}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-sm bg-warmzwart/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Verwijderen"
            >
              <Trash size={13} />
            </button>
            <input
              defaultValue={foto.bijschrift ?? ""}
              onBlur={(e) => handleCaptionSave(foto.id, e.target.value)}
              placeholder="Bijschrift..."
              className="absolute bottom-0 left-0 right-0 bg-warmzwart/70 text-white text-body-xs px-2 py-1.5 outline-none placeholder:text-white/60"
            />
          </div>
        ))}

        {fotos.length < PREMIUM_MAX_FOTOS && (
          <button
            onClick={() => (fotos.length >= maxFotos ? setToonUpsell(true) : inputRef.current?.click())}
            disabled={uploading}
            className="aspect-square rounded-md border-2 border-dashed border-lijn hover:border-warmgrijs transition-colors flex flex-col items-center justify-center gap-1.5 text-warmgrijs"
          >
            {uploading ? <Spinner size={22} className="animate-spin" /> : <Plus size={22} />}
            <span className="text-body-xs font-medium">Foto toevoegen</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
      {toonUpsell && <PremiumUpsell variant="fotos" onDismiss={() => setToonUpsell(false)} className="mt-3" />}
      <p className="text-body-xs text-warmgrijs mt-2">{fotos.length}/{maxFotos} foto&apos;s</p>
    </div>
  );
}

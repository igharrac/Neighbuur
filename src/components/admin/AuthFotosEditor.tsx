"use client";

import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { AuthPhotoRow } from "@/app/(site)/admin/auth-fotos/page";

const CATEGORY_LABELS: Record<AuthPhotoRow["category"], string> = {
  resident: "Bewoner-schermen",
  professional: "Vakman-schermen",
};

export function AuthFotosEditor({ initialPhotos }: { initialPhotos: AuthPhotoRow[] }) {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState(initialPhotos);

  async function handleUploaded(category: AuthPhotoRow["category"], url: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("auth_photos")
      .insert({ url, category, active: true })
      .select()
      .single();

    if (error || !data) {
      showToast(error?.message ?? "Foto opslaan is niet gelukt.", "error");
      return;
    }
    setPhotos((prev) => [data as AuthPhotoRow, ...prev]);
    showToast("Foto toegevoegd", "success");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deze foto verwijderen?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("auth_photos").delete().eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast("Foto verwijderd", "success");
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-10">
      <h1 className="font-display text-display-md text-warmzwart mb-1">Login-foto's</h1>
      <p className="text-body text-warmgrijs mb-8">
        Deze foto's wisselen willekeurig af op de inlog- en registratieschermen. Elke categorie heeft haar eigen pool.
      </p>

      {(Object.keys(CATEGORY_LABELS) as AuthPhotoRow["category"][]).map((category) => {
        const fotosInCategorie = photos.filter((p) => p.category === category);
        return (
          <div key={category} className="mb-10">
            <h2 className="font-bold text-body mb-3">{CATEGORY_LABELS[category]}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {fotosInCategorie.map((foto) => (
                <div key={foto.id} className="group relative rounded-md overflow-hidden bg-cream aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDelete(foto.id)}
                    className="absolute top-1.5 right-1.5 w-8 h-8 rounded-sm bg-warmzwart/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Verwijderen"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))}
            </div>

            {fotosInCategorie.length === 0 && (
              <p className="text-body-sm text-warmgrijs mb-4">
                Nog geen foto's — het scherm gebruikt tot dan de vaste fallback-afbeelding.
              </p>
            )}

            <div className="max-w-[240px]">
              <ImageUploader
                bucket="auth-photos"
                pathPrefix={category}
                aspect="banner"
                onUploaded={(url) => handleUploaded(category, url)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

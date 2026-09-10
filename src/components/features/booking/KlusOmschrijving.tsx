/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { Camera, X, Spinner } from "@phosphor-icons/react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import type { Categorie } from "@/types";

const MAX_FOTOS = 5;
const MAX_TEKST = 500;

interface KlusOmschrijvingProps {
  categorieen: Categorie[];
  categorieId: string;
  onCategorieChange: (id: string) => void;
  omschrijving: string;
  onOmschrijvingChange: (tekst: string) => void;
  fotoUrls: string[];
  onFotoUrlsChange: (urls: string[]) => void;
  klantId: string;
}

export function KlusOmschrijving({
  categorieen,
  categorieId,
  onCategorieChange,
  omschrijving,
  onOmschrijvingChange,
  fotoUrls,
  onFotoUrlsChange,
  klantId,
}: KlusOmschrijvingProps) {
  const { upload, uploading } = useImageUpload({
    bucket: "boeking-fotos",
    pathPrefix: `${klantId}/${crypto.randomUUID()}`,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFoto(file: File | undefined) {
    if (!file || fotoUrls.length >= MAX_FOTOS) return;
    const url = await upload(file);
    if (url) onFotoUrlsChange([...fotoUrls, url]);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-display-sm mb-4">Beschrijf je klus</h3>
        <label className="text-body-sm font-semibold block mb-1.5">Categorie</label>
        <select className="input mb-4" value={categorieId} onChange={(e) => onCategorieChange(e.target.value)}>
          <option value="">Kies een categorie (optioneel)...</option>
          {categorieen.map((c) => (
            <option key={c.id} value={c.id}>
              {c.naam_nl}
            </option>
          ))}
        </select>

        <label className="text-body-sm font-semibold block mb-1.5">Omschrijving</label>
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder="Bijv. Woonkamer + hal spackspuiten, ongeveer 40m²"
          value={omschrijving}
          onChange={(e) => onOmschrijvingChange(e.target.value.slice(0, MAX_TEKST))}
        />
        <p className="text-body-xs text-warmgrijs text-right mt-1">
          {omschrijving.length}/{MAX_TEKST}
        </p>
      </div>

      <div>
        <span className="text-body-sm font-semibold block mb-1.5">Foto&apos;s (optioneel)</span>
        <div className="flex flex-wrap gap-2">
          {fotoUrls.map((url) => (
            <div key={url} className="relative w-16 h-16 rounded-sm overflow-hidden bg-cream">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onFotoUrlsChange(fotoUrls.filter((u) => u !== url))}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-sm bg-warmzwart/70 text-white flex items-center justify-center"
                aria-label="Verwijder foto"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {fotoUrls.length < MAX_FOTOS && (
            <label className="w-16 h-16 rounded-sm border-2 border-dashed border-lijn flex items-center justify-center text-warmgrijs cursor-pointer hover:border-warmgrijs-dark transition-colors">
              {uploading ? <Spinner size={18} className="animate-spin" /> : <Camera size={18} />}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFoto(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        <p className="text-body-xs text-warmgrijs mt-1.5">Max {MAX_FOTOS} foto&apos;s</p>
      </div>
    </div>
  );
}

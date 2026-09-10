/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, UploadSimple, Spinner } from "@phosphor-icons/react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";

type Aspect = "square" | "banner";

interface ImageUploaderProps {
  bucket: string;
  pathPrefix: string;
  value?: string | null;
  onUploaded: (url: string) => void;
  aspect?: Aspect;
  label?: string;
}

const aspectClass: Record<Aspect, string> = {
  square: "aspect-square",
  banner: "aspect-[21/9]",
};

export function ImageUploader({ bucket, pathPrefix, value, onUploaded, aspect = "square", label }: ImageUploaderProps) {
  const { upload, uploading, error } = useImageUpload({ bucket, pathPrefix });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const url = await upload(file);
    if (url) onUploaded(url);
  }

  return (
    <div className="w-full">
      {label && <label className="text-body-sm font-semibold block mb-1.5">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative w-full ${aspectClass[aspect]} rounded-md border-2 border-dashed cursor-pointer overflow-hidden transition-colors flex items-center justify-center group ${
          dragOver ? "border-terracotta bg-terracotta-50" : "border-lijn bg-cream hover:border-warmgrijs"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-warmzwart/0 group-hover:bg-warmzwart/50 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-body-sm font-semibold flex items-center gap-1.5">
                <UploadSimple size={16} weight="bold" />
                Vervangen
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-warmgrijs px-4 text-center">
            <ImageIcon size={28} />
            <span className="text-body-xs font-medium">Sleep een afbeelding hierheen of klik om te uploaden</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Spinner size={24} className="animate-spin text-terracotta" />
          </div>
        )}
      </div>
      {error && <p className="text-body-xs text-terracotta mt-1.5">{error}</p>}
    </div>
  );
}

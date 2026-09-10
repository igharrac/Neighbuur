"use client";

import { useRef, useState } from "react";
import { Buildings, UploadSimple } from "@phosphor-icons/react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { Avatar } from "@/components/ui/Avatar";

const CONFETTI_COLORS = ["bg-terracotta", "bg-groen", "bg-blauw", "bg-lavendel", "bg-oker"];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`absolute top-0 w-2 h-2 rounded-sm ${p.color} animate-confetti-fall`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

interface LogoPromptProps {
  vakmanId: string;
  bedrijfsnaam: string;
  onUploaded: (url: string) => void;
}

export function LogoPrompt({ vakmanId, bedrijfsnaam, onUploaded }: LogoPromptProps) {
  const { upload, uploading } = useImageUpload({ bucket: "vakman-logos", pathPrefix: `${vakmanId}/logo` });
  const [celebrating, setCelebrating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const url = await upload(file);
    if (!url) return;

    setCelebrating(true);
    setTimeout(() => onUploaded(url), 1600);
  }

  return (
    <div className="relative bg-terracotta-50 rounded p-6 md:p-7 overflow-hidden">
      {celebrating && <Confetti />}

      {celebrating ? (
        <div className="text-center py-6">
          <p className="font-display text-display-sm text-terracotta mb-1">Profiel 20% completer!</p>
          <p className="text-body-sm text-warmgrijs">Je logo staat live op je profiel.</p>
        </div>
      ) : (
        <>
          <h3 className="font-bold text-body mb-1">📸 Voeg je logo toe</h3>
          <p className="text-body-sm text-warmgrijs mb-5">
            Vakmensen met een logo krijgen <span className="font-semibold text-terracotta">3x meer aanvragen</span>
          </p>

          <div className="flex items-center justify-center gap-6 mb-5">
            <div className="text-center">
              <Avatar naam={bedrijfsnaam} size="lg" className="opacity-50 grayscale mx-auto" />
              <p className="text-body-xs text-warmgrijs mt-2">Zonder logo</p>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-white shadow-medium ring-2 ring-terracotta/30 flex items-center justify-center mx-auto">
                <Buildings size={28} weight="fill" className="text-terracotta" />
              </div>
              <p className="text-body-xs font-semibold text-groen mt-2">Met logo</p>
              <span className="absolute -top-2 -right-2 badge badge-terracotta">3x meer</span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-primary w-full"
          >
            <UploadSimple size={16} weight="bold" />
            {uploading ? "Uploaden..." : "Logo uploaden"}
          </button>
        </>
      )}
    </div>
  );
}

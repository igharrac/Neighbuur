/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Star, Camera, X, Spinner } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { createClient } from "@/lib/supabase";
import type { ReviewCompleet, ReviewScores } from "@/types";

const SCORE_LABELS: { key: keyof ReviewScores; label: string }[] = [
  { key: "kwaliteit", label: "Kwaliteit" },
  { key: "stiptheid", label: "Stiptheid" },
  { key: "communicatie", label: "Communicatie" },
  { key: "prijs", label: "Prijs" },
];

const MAX_FOTOS = 5;
const MIN_TEKST = 20;
const MAX_TEKST = 500;

function StarRow({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-sm font-medium text-warmzwart">{label}</span>
      <div className="flex -mr-2.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} van 5 sterren`}
            className="min-w-11 min-h-11 flex items-center justify-center text-oker"
          >
            <Star size={22} weight={n <= value ? "fill" : "regular"} />
          </button>
        ))}
      </div>
    </div>
  );
}

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  vakmanId: string;
  bedrijfsnaam: string;
  communityId?: string | null;
  boekingId?: string | null;
  onSuccess: (review: ReviewCompleet) => void;
}

export function ReviewForm({
  open,
  onClose,
  vakmanId,
  bedrijfsnaam,
  communityId = null,
  boekingId = null,
  onSuccess,
}: ReviewFormProps) {
  const { user, profiel } = useAuth();
  const { showToast } = useToast();
  const { upload, uploading } = useImageUpload({
    bucket: "review-fotos",
    pathPrefix: `${user?.id ?? "anoniem"}/${crypto.randomUUID()}`,
  });
  const [scores, setScores] = useState<Partial<ReviewScores>>({});
  const [tekst, setTekst] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const allScoresGiven = SCORE_LABELS.every((s) => (scores[s.key] ?? 0) > 0);
  const tekstValid = tekst.trim().length >= MIN_TEKST && tekst.length <= MAX_TEKST;
  const canSubmit = allScoresGiven && tekstValid && !submitting;

  function reset() {
    setScores({});
    setTekst("");
    setFotoUrls([]);
  }

  async function handleFotoUpload(file: File | undefined) {
    if (!file || fotoUrls.length >= MAX_FOTOS) return;
    const url = await upload(file);
    if (url) setFotoUrls((prev) => [...prev, url]);
  }

  async function handleSubmit() {
    if (!user || !canSubmit) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        auteur_id: user.id,
        vakman_id: vakmanId,
        boeking_id: boekingId,
        community_id: communityId,
        tekst: tekst.trim(),
        scores,
        foto_urls: fotoUrls,
      })
      .select("*")
      .single();

    setSubmitting(false);

    if (error || !data) {
      showToast(error?.message ?? "Review plaatsen is niet gelukt.", "error");
      return;
    }

    const nieuweReview: ReviewCompleet = {
      ...data,
      scores: scores as Partial<ReviewScores>,
      foto_urls: data.foto_urls ?? [],
      upvote_score: data.upvote_score ?? 0,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
      auteur_naam: profiel?.naam ?? "Jij",
      auteur_avatar: profiel?.avatar_url ?? null,
      community_naam: null,
      reactie_tekst: null,
      reactie_datum: null,
      reactie_bedrijf: null,
      geverifieerd: !!boekingId,
    };

    showToast("Bedankt voor je review! Je buren kunnen deze nu zien.", "success");
    fetch("/api/reviews/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: data.id }),
    }).catch(() => {});
    onSuccess(nieuweReview);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Review voor ${bedrijfsnaam}`}>
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-body-sm font-semibold block mb-2">Beoordeling</span>
          <div className="flex flex-col gap-2">
            {SCORE_LABELS.map((s) => (
              <StarRow
                key={s.key}
                label={s.label}
                value={scores[s.key] ?? 0}
                onChange={(v) => setScores((prev) => ({ ...prev, [s.key]: v }))}
              />
            ))}
          </div>
        </div>

        <div>
          <Textarea
            id="review-tekst"
            label="Je ervaring"
            value={tekst}
            onChange={(e) => setTekst(e.target.value.slice(0, MAX_TEKST))}
            placeholder="Vertel over je ervaring... (min. 20 tekens)"
            rows={5}
          />
          <p className="text-body-xs text-warmgrijs text-right mt-1">
            {tekst.length}/{MAX_TEKST}
          </p>
        </div>

        <div>
          <span className="text-body-sm font-semibold block mb-1.5">Foto&apos;s (optioneel)</span>
          <div className="flex flex-wrap gap-2">
            {fotoUrls.map((url) => (
              <div key={url} className="relative w-16 h-16 rounded-md overflow-hidden bg-cream">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-sm bg-warmzwart/70 text-white flex items-center justify-center"
                  aria-label="Verwijder foto"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {fotoUrls.length < MAX_FOTOS && (
              <label className="w-16 h-16 rounded-md border-2 border-dashed border-lijn flex items-center justify-center text-warmgrijs cursor-pointer hover:border-warmgrijs-dark transition-colors">
                {uploading ? <Spinner size={18} className="animate-spin" /> : <Camera size={18} />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleFotoUpload(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
          <p className="text-body-xs text-warmgrijs mt-1.5">Max {MAX_FOTOS} foto&apos;s</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary justify-center disabled:opacity-40 disabled:pointer-events-none"
        >
          {submitting ? "Bezig..." : "Review plaatsen →"}
        </button>
      </div>
    </Modal>
  );
}

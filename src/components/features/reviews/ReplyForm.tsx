"use client";

import { useState } from "react";
import { ChatCircleText } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const MAX_TEKST = 300;

interface ReplyFormProps {
  reviewId: string;
  vakmanId: string;
  bedrijfsnaam: string;
  isOwner: boolean;
  initialTekst?: string | null;
}

export function ReplyForm({ reviewId, vakmanId, bedrijfsnaam, isOwner, initialTekst = null }: ReplyFormProps) {
  const { showToast } = useToast();
  const [tekst, setTekst] = useState(initialTekst ?? "");
  const [savedTekst, setSavedTekst] = useState(initialTekst);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const waarde = tekst.trim();
    if (waarde.length === 0) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("review_reacties")
      .upsert({ review_id: reviewId, vakman_id: vakmanId, tekst: waarde }, { onConflict: "review_id" });

    setSubmitting(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setSavedTekst(waarde);
    setEditing(false);
    showToast("Reactie geplaatst.", "success");
  }

  if (!isOwner && !savedTekst) return null;

  if (savedTekst && !editing) {
    return (
      <div className="mt-3 bg-cream rounded-md p-3.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-body-xs font-semibold text-warmzwart">Reactie van {bedrijfsnaam}</span>
          {isOwner && (
            <button
              onClick={() => {
                setTekst(savedTekst);
                setEditing(true);
              }}
              className="text-body-xs text-terracotta font-semibold min-h-11 flex items-center"
            >
              Bewerken
            </button>
          )}
        </div>
        <p className="text-body-sm text-warmgrijs-dark">{savedTekst}</p>
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <div className="mt-3">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-body-sm font-semibold text-warmgrijs hover:text-warmzwart min-h-11"
        >
          <ChatCircleText size={16} /> Reageer
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={tekst}
            onChange={(e) => setTekst(e.target.value.slice(0, MAX_TEKST))}
            placeholder="Bedank je klant of reageer op de review..."
            className="input min-h-[80px] resize-y !text-body-sm"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-body-xs text-warmgrijs">{tekst.length}/{MAX_TEKST}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setTekst(savedTekst ?? "");
                }}
                className="btn-ghost !py-2"
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || tekst.trim().length === 0}
                className="btn-primary !py-2 !px-4 !text-body-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? "Bezig..." : "Plaatsen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

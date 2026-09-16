"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { DatumKiezer } from "./DatumKiezer";
import { KlusOmschrijving } from "./KlusOmschrijving";
import { BookingBevestiging } from "./BookingBevestiging";
import type { Category } from "@/types";

type Stap = 1 | 2 | 3;

interface BookingFlowProps {
  open: boolean;
  onClose: () => void;
  professionalId: string;
  companyName: string;
  logoUrl: string | null;
  beschikbaarheid: Record<string, "available" | "booked">;
  categories: Category[];
  communityId: string | null;
}

export function BookingFlow({
  open,
  onClose,
  professionalId,
  companyName,
  logoUrl,
  beschikbaarheid,
  categories,
  communityId,
}: BookingFlowProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [stap, setStap] = useState<Stap>(1);
  const [datum, setDatum] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  function reset() {
    setStap(1);
    setDatum(null);
    setCategoryId("");
    setDescription("");
    setPhotoUrls([]);
    setVerstuurd(false);
    setConversationId(null);
  }

  function handleClose() {
    onClose();
    if (verstuurd) reset();
  }

  async function handleVerstuur() {
    if (!user) return;
    setSubmitting(true);

    const res = await fetch("/api/boekingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vakmanId: professionalId,
        datum,
        categorieId: categoryId || null,
        omschrijving: description,
        fotoUrls: photoUrls,
        communityId,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      showToast(body.error ?? "Aanvraag versturen is niet gelukt.", "error");
      return;
    }

    const body = await res.json();
    setConversationId(body.gesprekId ?? null);
    setVerstuurd(true);
  }

  const categoryName = categories.find((c) => c.id === categoryId)?.name_nl ?? null;
  const kanVerder = stap !== 2 || description.trim().length > 0;

  return (
    <Modal open={open} onClose={handleClose} title={verstuurd ? undefined : `Boek ${companyName}`}>
      {verstuurd ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-groen-light text-groen flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} weight="fill" />
          </div>
          <h3 className="font-display text-display-sm mb-2">Aanvraag verstuurd!</h3>
          <p className="text-body-sm text-warmgrijs mb-6">
            {companyName} ontvangt een bericht en neemt snel contact met je op.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                handleClose();
                if (conversationId) router.push(`/berichten/${conversationId}`);
              }}
              className="btn-primary justify-center"
            >
              Bekijk gesprek
            </button>
            <button onClick={handleClose} className="btn-ghost justify-center">
              Sluiten
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= stap ? "bg-sage" : "bg-lijn"}`} />
            ))}
          </div>

          {stap === 1 && <DatumKiezer beschikbaarheid={beschikbaarheid} waarde={datum} onChange={setDatum} />}
          {stap === 2 && user && (
            <KlusOmschrijving
              categories={categories}
              categoryId={categoryId}
              onCategorieChange={setCategoryId}
              description={description}
              onOmschrijvingChange={setDescription}
              photoUrls={photoUrls}
              onFotoUrlsChange={setPhotoUrls}
              klantId={user.id}
            />
          )}
          {stap === 3 && (
            <BookingBevestiging
              companyName={companyName}
              logoUrl={logoUrl}
              datum={datum}
              categoryName={categoryName}
              description={description}
              photoUrls={photoUrls}
            />
          )}

          <div className="flex items-center justify-between gap-3">
            {stap > 1 ? (
              <button onClick={() => setStap((s) => (s - 1) as Stap)} className="btn-ghost">
                ← Terug
              </button>
            ) : (
              <span />
            )}

            {stap < 3 ? (
              <button
                onClick={() => setStap((s) => (s + 1) as Stap)}
                disabled={!kanVerder}
                className="btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                Volgende →
              </button>
            ) : (
              <button
                onClick={handleVerstuur}
                disabled={submitting}
                className="btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? "Bezig..." : "Boekingsaanvraag versturen →"}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

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
  const [categorieId, setCategorieId] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [gesprekId, setGesprekId] = useState<string | null>(null);

  function reset() {
    setStap(1);
    setDatum(null);
    setCategorieId("");
    setOmschrijving("");
    setFotoUrls([]);
    setVerstuurd(false);
    setGesprekId(null);
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
        categorieId: categorieId || null,
        omschrijving,
        fotoUrls,
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
    setGesprekId(body.gesprekId ?? null);
    setVerstuurd(true);
  }

  const categorieNaam = categories.find((c) => c.id === categorieId)?.name_nl ?? null;
  const kanVerder = stap !== 2 || omschrijving.trim().length > 0;

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
                if (gesprekId) router.push(`/berichten/${gesprekId}`);
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
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= stap ? "bg-terracotta" : "bg-lijn"}`} />
            ))}
          </div>

          {stap === 1 && <DatumKiezer beschikbaarheid={beschikbaarheid} waarde={datum} onChange={setDatum} />}
          {stap === 2 && user && (
            <KlusOmschrijving
              categories={categories}
              categorieId={categorieId}
              onCategorieChange={setCategorieId}
              omschrijving={omschrijving}
              onOmschrijvingChange={setOmschrijving}
              fotoUrls={fotoUrls}
              onFotoUrlsChange={setFotoUrls}
              klantId={user.id}
            />
          )}
          {stap === 3 && (
            <BookingBevestiging
              bedrijfsnaam={companyName}
              logoUrl={logoUrl}
              datum={datum}
              categorieNaam={categorieNaam}
              omschrijving={omschrijving}
              fotoUrls={fotoUrls}
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

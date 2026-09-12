"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ChatCircle, SealCheck } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { BookingStatusBadge } from "./BookingStatusBadge";
import type { BoekingMetKlant, BoekingStatus } from "@/types";

interface BookingCardProps {
  boeking: BoekingMetKlant;
  gesprekId: string | null;
  onStatusChange: (id: string, status: BoekingStatus) => void;
}

export function BookingCard({ boeking, gesprekId, onStatusChange }: BookingCardProps) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function wijzigStatus(status: Extract<BoekingStatus, "bevestigd" | "geannuleerd" | "afgerond">) {
    setBusy(true);
    const res = await fetch(`/api/boekingen/${boeking.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);

    if (!res.ok) {
      showToast("Kon status niet bijwerken.", "error");
      return;
    }
    onStatusChange(boeking.id, status);
  }

  const datumLabel = boeking.date
    ? new Date(boeking.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
    : "Datum nog te overleggen";

  return (
    <div className="card-flat p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar naam={boeking.klant_naam} src={boeking.klant_avatar} size="md" />
          <div className="min-w-0">
            <div className="font-semibold text-body-sm truncate">
              {boeking.klant_naam}
              {boeking.community_naam && <span className="text-warmgrijs font-normal"> · {boeking.community_naam}</span>}
            </div>
            <div className="text-body-xs text-warmgrijs truncate">
              {boeking.categorie_naam ? `${boeking.categorie_naam} · ` : ""}
              {datumLabel}
            </div>
          </div>
        </div>
        <BookingStatusBadge status={boeking.status} />
      </div>

      {boeking.description && (
        <p className="text-body-sm text-warmgrijs-dark mb-3">&ldquo;{boeking.description}&rdquo;</p>
      )}

      <div className="flex flex-wrap gap-2">
        {boeking.status === "aangevraagd" && (
          <>
            <button
              onClick={() => wijzigStatus("bevestigd")}
              disabled={busy}
              className="btn-primary !py-2 !px-4 !text-body-sm disabled:opacity-40"
            >
              <CheckCircle size={16} weight="bold" /> Accepteren
            </button>
            <button
              onClick={() => wijzigStatus("geannuleerd")}
              disabled={busy}
              className="btn-secondary !py-2 !px-4 !text-body-sm disabled:opacity-40"
            >
              <XCircle size={16} /> Afwijzen
            </button>
          </>
        )}
        {boeking.status === "bevestigd" && (
          <button
            onClick={() => wijzigStatus("afgerond")}
            disabled={busy}
            className="btn-primary !py-2 !px-4 !text-body-sm disabled:opacity-40"
          >
            <SealCheck size={16} weight="bold" /> Markeer als afgerond
          </button>
        )}
        {gesprekId && (
          <Link href={`/berichten/${gesprekId}`} className="btn-ghost !py-2 !px-4 !text-body-sm">
            <ChatCircle size={16} /> Bericht
          </Link>
        )}
      </div>
    </div>
  );
}

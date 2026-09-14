"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/hooks/useAuth";

const BEVESTIGINGSTEKST = "VERWIJDEREN";

/**
 * Gedeeld tussen /profiel (bewoners + vakmensen) en /dashboard/profiel
 * (bedrijfsprofiel-pagina van vakmensen) — precies één implementatie
 * voor deactiveren/verwijderen, ongeacht rol.
 */
export function AccountActions() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const [deactiverenOpen, setDeactiverenOpen] = useState(false);
  const [verwijderenOpen, setVerwijderenOpen] = useState(false);
  const [bevestiging, setBevestiging] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDeactiveren() {
    setSaving(true);
    const res = await fetch("/api/account/deactiveren", { method: "POST" });
    setSaving(false);
    if (!res.ok) {
      showToast("Account pauzeren lukte niet, probeer het nog eens.", "error");
      return;
    }
    await signOut();
    router.push("/login");
  }

  async function handleVerwijderen() {
    setSaving(true);
    const res = await fetch("/api/account/verwijderen", { method: "POST" });
    setSaving(false);
    if (!res.ok) {
      showToast("Account verwijderen lukte niet, probeer het nog eens.", "error");
      return;
    }
    await signOut();
    router.push("/");
  }

  return (
    <div className="card-flat p-6">
      <h2 className="font-display text-display-sm text-warmzwart mb-1.5">Account</h2>
      <p className="text-body-sm text-warmgrijs mb-6">Je account tijdelijk pauzeren of permanent verwijderen.</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => setDeactiverenOpen(true)}>
          Account pauzeren
        </Button>
        <Button
          variant="ghost"
          className="!text-terracotta hover:!bg-terracotta-50"
          onClick={() => {
            setBevestiging("");
            setVerwijderenOpen(true);
          }}
        >
          Account verwijderen
        </Button>
      </div>

      <Modal open={deactiverenOpen} onClose={() => setDeactiverenOpen(false)} title="Account pauzeren?">
        <p className="text-body text-warmgrijs mb-6">
          Je account en gegevens blijven bestaan, maar zijn tijdelijk niet zichtbaar voor anderen. Log op elk moment
          weer in om je account automatisch te heractiveren.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeactiverenOpen(false)} disabled={saving}>
            Annuleren
          </Button>
          <Button onClick={handleDeactiveren} disabled={saving}>
            {saving ? "Bezig..." : "Ja, pauzeer mijn account"}
          </Button>
        </div>
      </Modal>

      <Modal open={verwijderenOpen} onClose={() => setVerwijderenOpen(false)} title="Account verwijderen?">
        <div className="text-body text-warmgrijs mb-4 space-y-2">
          <p>Dit is permanent en kan niet ongedaan gemaakt worden. Er gebeurt het volgende:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Je naam, e-mailadres, telefoonnummer en adres worden verwijderd.</li>
            <li>Je kunt niet meer inloggen.</li>
            <li>
              Reviews of boekingen waar je onderdeel van was blijven zichtbaar voor andere gebruikers, maar tonen
              voortaan "Verwijderde gebruiker" in plaats van je naam.
            </li>
          </ul>
        </div>
        <label className="text-body-sm font-semibold block mb-1.5">
          Typ <span className="text-terracotta">{BEVESTIGINGSTEKST}</span> ter bevestiging
        </label>
        <Input value={bevestiging} onChange={(e) => setBevestiging(e.target.value)} className="mb-5" autoFocus />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setVerwijderenOpen(false)} disabled={saving}>
            Annuleren
          </Button>
          <Button
            onClick={handleVerwijderen}
            disabled={saving || bevestiging !== BEVESTIGINGSTEKST}
            className="!bg-terracotta"
          >
            {saving ? "Bezig..." : "Verwijder mijn account"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

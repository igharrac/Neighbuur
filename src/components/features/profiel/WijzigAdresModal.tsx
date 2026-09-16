"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface AdresResultaat {
  addressId: string;
  formatted: string;
}

interface AdresKandidaat {
  formatted: string;
  huisNlt: string;
}

interface WijzigAdresModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Hergebruikt /api/adres/zoeken + /api/adres/bevestigen (dezelfde routes
 * als onboarding) — bevestigen voor een al-gekoppelde bewoner werkt daar
 * al correct (sluit de oude woonhistorie af, opent de nieuwe), dus hier
 * puur een nieuw UI-toegangspunt, geen nieuwe adreslogica.
 */
export function WijzigAdresModal({ open, onClose }: WijzigAdresModalProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [postcode, setPostcode] = useState("");
  const [huisnummer, setHuisnummer] = useState("");
  const [toevoeging, setToevoeging] = useState("");
  const [zoeken, setZoeken] = useState(false);
  const [nietGevonden, setNietGevonden] = useState(false);
  const [kandidaten, setKandidaten] = useState<AdresKandidaat[] | null>(null);
  const [resultaat, setResultaat] = useState<AdresResultaat | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setPostcode("");
    setHuisnummer("");
    setToevoeging("");
    setNietGevonden(false);
    setKandidaten(null);
    setResultaat(null);
  }

  async function handleZoeken() {
    if (!postcode.trim() || !huisnummer.trim()) return;
    setZoeken(true);
    setNietGevonden(false);
    setKandidaten(null);

    const res = await fetch("/api/adres/zoeken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: postcode.trim(), huisnummer: huisnummer.trim(), toevoeging: toevoeging.trim() || null }),
    });
    const data = await res.json();
    setZoeken(false);

    if (!res.ok || data.error) {
      showToast("Adres opzoeken lukte even niet. Probeer het nog eens.", "error");
      return;
    }
    if (data.ambiguous) {
      setKandidaten(data.candidates);
      return;
    }
    if (!data.found) {
      setNietGevonden(true);
      return;
    }
    setResultaat({ addressId: data.addressId, formatted: data.formatted });
  }

  function handleKiesKandidaat(kandidaat: AdresKandidaat) {
    const suffix = kandidaat.huisNlt.replace(huisnummer.trim(), "").replace(/^-/, "");
    setToevoeging(suffix);
    setKandidaten(null);
    handleZoeken();
  }

  async function handleBevestigen() {
    if (!resultaat) return;
    setSaving(true);
    const res = await fetch("/api/adres/bevestigen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: resultaat.addressId }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      showToast(data.error ?? "Adres bevestigen lukte niet, probeer het nog eens.", "error");
      return;
    }

    showToast("Adres bijgewerkt", "success");
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Adres wijzigen"
    >
      {!resultaat ? (
        <>
          <div className="flex flex-col gap-4 mb-2">
            <Input label="Postcode" placeholder="1234 AB" value={postcode} onChange={(e) => setPostcode(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Input label="Huisnummer" placeholder="12" value={huisnummer} onChange={(e) => setHuisnummer(e.target.value)} className="flex-1" />
              <Input
                label="Toev."
                placeholder="optioneel"
                value={toevoeging}
                onChange={(e) => setToevoeging(e.target.value)}
                className="!w-[110px]"
              />
            </div>
          </div>

          {nietGevonden && (
            <p className="text-body-xs text-sage mb-4">Dit adres kunnen we niet vinden. Controleer de postcode en het huisnummer.</p>
          )}

          {kandidaten && kandidaten.length > 0 && (
            <div className="mb-4">
              <p className="text-body-xs text-warmgrijs mb-2">Welke van deze klopt?</p>
              <div className="flex flex-col gap-2">
                {kandidaten.map((k) => (
                  <button
                    key={k.huisNlt}
                    onClick={() => handleKiesKandidaat(k)}
                    className="p-3 rounded-sm border-2 border-lijn hover:border-sage hover:bg-sage-50/50 text-left text-body-sm"
                  >
                    {k.formatted}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleZoeken} disabled={zoeken || !postcode.trim() || !huisnummer.trim()} className="w-full mt-2">
            {zoeken ? "Zoeken..." : "Adres zoeken"}
          </Button>
        </>
      ) : (
        <div className="text-center">
          <p className="text-body text-warmgrijs mb-6">{resultaat.formatted}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setResultaat(null)} disabled={saving} className="flex-1">
              Terug
            </Button>
            <Button onClick={handleBevestigen} disabled={saving} className="flex-1">
              {saving ? "Bezig..." : "Ja, klopt"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

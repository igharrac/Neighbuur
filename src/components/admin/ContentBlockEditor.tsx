"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ContentBlokType } from "@/types";

interface ContentBlockEditorProps {
  type: ContentBlokType;
  communityId: string;
  storagePathId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
  saving: boolean;
}

const KLEUR_OPTIONS = ["terracotta", "groen", "blauw", "oker"] as const;
const KLEUR_CLASS: Record<(typeof KLEUR_OPTIONS)[number], string> = {
  terracotta: "bg-terracotta-100 text-terracotta",
  groen: "bg-groen-light text-groen",
  blauw: "bg-blauw-light text-blauw",
  oker: "bg-oker-light text-oker",
};

interface VakmanResult {
  id: string;
  company_name: string;
}

export function ContentBlockEditor({
  type,
  communityId,
  storagePathId,
  initialData,
  onSave,
  onCancel,
  saving,
}: ContentBlockEditorProps) {
  const [data, setData] = useState(initialData);
  const [vakmanQuery, setVakmanQuery] = useState("");
  const [vakmanResults, setVakmanResults] = useState<VakmanResult[]>([]);
  const [vakmanNaam, setVakmanNaam] = useState<string | null>(null);

  function set(field: string, value: unknown) {
    setData((d) => ({ ...d, [field]: value }));
  }

  useEffect(() => {
    if (type !== "professional_spotlight" || vakmanQuery.trim().length < 2) {
      setVakmanResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const supabase = createClient();
      const { data: results } = await supabase
        .from("professional_profiles")
        .select("id, company_name")
        .ilike("company_name", `%${vakmanQuery}%`)
        .limit(6);
      setVakmanResults((results ?? []) as VakmanResult[]);
    }, 300);
    return () => clearTimeout(timeout);
  }, [vakmanQuery, type]);

  return (
    <div className="border border-lijn rounded-md p-5 bg-cream">
      <div className="flex flex-col gap-4">
        {type === "hero_banner" && (
          <>
            <ImageUploader
              bucket="community-images"
              pathPrefix={`${communityId}/${storagePathId}`}
              value={data.afbeelding_url}
              onUploaded={(url) => set("afbeelding_url", url)}
              aspect="banner"
              label="Afbeelding"
            />
            <Input name="titel" label="Titel" value={data.titel ?? ""} onChange={(e) => set("titel", e.target.value)} />
            <Input name="subtitel" label="Subtitel" value={data.subtitel ?? ""} onChange={(e) => set("subtitel", e.target.value)} />
          </>
        )}

        {type === "text" && (
          <>
            <Input name="titel" label="Titel" value={data.titel ?? ""} onChange={(e) => set("titel", e.target.value)} />
            <Textarea
              name="inhoud"
              label="Inhoud"
              rows={6}
              value={data.inhoud ?? ""}
              onChange={(e) => set("inhoud", e.target.value)}
            />
          </>
        )}

        {type === "image" && (
          <>
            <ImageUploader
              bucket="community-images"
              pathPrefix={`${communityId}/${storagePathId}`}
              value={data.afbeelding_url}
              onUploaded={(url) => set("afbeelding_url", url)}
              aspect="square"
              label="Afbeelding"
            />
            <Input name="bijschrift" label="Bijschrift" value={data.bijschrift ?? ""} onChange={(e) => set("bijschrift", e.target.value)} />
          </>
        )}

        {type === "announcement" && (
          <>
            <Input name="titel" label="Titel" value={data.titel ?? ""} onChange={(e) => set("titel", e.target.value)} />
            <Textarea
              name="inhoud"
              label="Inhoud"
              rows={3}
              value={data.inhoud ?? ""}
              onChange={(e) => set("inhoud", e.target.value)}
            />
            <div>
              <label className="text-body-sm font-semibold block mb-1.5">Kleur</label>
              <div className="flex gap-2">
                {KLEUR_OPTIONS.map((kleur) => (
                  <button
                    key={kleur}
                    type="button"
                    onClick={() => set("kleur", kleur)}
                    className={`px-3 py-1.5 rounded-sm text-body-xs font-semibold capitalize border-2 transition-colors ${
                      data.kleur === kleur ? "border-warmzwart" : "border-transparent"
                    } ${KLEUR_CLASS[kleur]}`}
                  >
                    {kleur}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {type === "reviews" && (
          <Input
            name="aantal"
            label="Aantal te tonen"
            type="number"
            min={1}
            max={20}
            value={data.aantal ?? 5}
            onChange={(e) => set("aantal", Number(e.target.value))}
          />
        )}

        {type === "residents" && (
          <label className="flex items-center gap-2 text-body-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={data.toon_aantal ?? true}
              onChange={(e) => set("toon_aantal", e.target.checked)}
            />
            Toon aantal bewoners
          </label>
        )}

        {type === "group_discounts" && (
          <p className="text-body-sm text-warmgrijs">
            Dit blok toont automatisch de actieve groepskortingen van deze community. Geen instellingen nodig.
          </p>
        )}

        {type === "professional_spotlight" && (
          <div>
            <label className="text-body-sm font-semibold block mb-1.5">Vakman</label>
            {vakmanNaam || data.vakman_id ? (
              <div className="flex items-center justify-between gap-2 border-2 border-lijn rounded-md px-4 py-3">
                <span className="text-body-sm font-medium">{vakmanNaam ?? "Geselecteerd"}</span>
                <button
                  type="button"
                  className="text-body-xs text-terracotta font-semibold"
                  onClick={() => {
                    set("vakman_id", undefined);
                    setVakmanNaam(null);
                  }}
                >
                  Wijzig
                </button>
              </div>
            ) : (
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgrijs" />
                <input
                  className="input !pl-10"
                  placeholder="Zoek op bedrijfsnaam..."
                  value={vakmanQuery}
                  onChange={(e) => setVakmanQuery(e.target.value)}
                />
                {vakmanResults.length > 0 && (
                  <div className="mt-1.5 border border-lijn rounded-md bg-white shadow-soft overflow-hidden">
                    {vakmanResults.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-body-sm hover:bg-cream transition-colors"
                        onClick={() => {
                          set("vakman_id", v.id);
                          setVakmanNaam(v.company_name);
                          setVakmanResults([]);
                        }}
                      >
                        {v.company_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-5">
        <Button size="sm" onClick={() => onSave(data)} disabled={saving}>
          {saving ? "Opslaan..." : "Opslaan"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CaretUp, CaretDown, PencilSimple, Trash, Plus } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";
import type { CommunityContentBlok, ContentBlokType } from "@/types";

const TYPE_LABELS: Record<ContentBlokType, string> = {
  hero_banner: "Hero banner",
  tekst: "Tekst",
  afbeelding: "Afbeelding",
  reviews: "Reviews",
  groepskortingen: "Groepskortingen",
  bewoners: "Bewoners",
  aankondiging: "Aankondiging",
  vakman_spotlight: "Vakman spotlight",
};

const ALL_TYPES = Object.keys(TYPE_LABELS) as ContentBlokType[];

function blockPreview(blok: CommunityContentBlok): string {
  if (blok.data.titel) return String(blok.data.titel);
  if (blok.data.bijschrift) return String(blok.data.bijschrift);
  if (blok.type === "vakman_spotlight") return blok.data.vakman_id ? "Vakman geselecteerd" : "Geen vakman gekozen";
  return "—";
}

export function CommunityEditorClient({
  communityId,
  communityNaam,
  initialBlocks,
}: {
  communityId: string;
  communityNaam: string;
  initialBlocks: CommunityContentBlok[];
}) {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState(
    [...initialBlocks].sort((a, b) => a.positie - b.positie)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<ContentBlokType | "">("");
  const [saving, setSaving] = useState(false);

  async function handleSaveNew(type: ContentBlokType, data: Record<string, unknown>) {
    setSaving(true);
    const supabase = createClient();
    const positie = blocks.length > 0 ? Math.max(...blocks.map((b) => b.positie)) + 1 : 0;
    const { data: inserted, error } = await supabase
      .from("community_content_blokken")
      .insert({ community_id: communityId, type, positie, data, actief: true })
      .select()
      .single();

    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setBlocks((prev) => [...prev, inserted as CommunityContentBlok]);
    setAddingType("");
    showToast("Blok toegevoegd", "success");
  }

  async function handleSaveEdit(blockId: string, data: Record<string, unknown>) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("community_content_blokken").update({ data }).eq("id", blockId);

    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data } : b)));
    setEditingId(null);
    showToast("Blok opgeslagen", "success");
  }

  async function handleDelete(blockId: string) {
    if (!window.confirm("Dit blok verwijderen?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("community_content_blokken")
      .update({ actief: false })
      .eq("id", blockId);

    if (error) {
      showToast(error.message, "error");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    showToast("Blok verwijderd", "success");
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const a = blocks[index];
    const b = blocks[target];
    const next = [...blocks];
    next[index] = { ...b, positie: a.positie };
    next[target] = { ...a, positie: b.positie };
    next.sort((x, y) => x.positie - y.positie);
    setBlocks(next);

    const supabase = createClient();
    await Promise.all([
      supabase.from("community_content_blokken").update({ positie: b.positie }).eq("id", a.id),
      supabase.from("community_content_blokken").update({ positie: a.positie }).eq("id", b.id),
    ]);
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <h1 className="font-display text-display-md text-warmzwart mb-1">Community-editor</h1>
      <p className="text-body text-warmgrijs mb-8">{communityNaam}</p>

      <div className="flex flex-col gap-3 mb-8">
        {blocks.length === 0 && (
          <p className="text-body-sm text-warmgrijs">Nog geen content-blokken. Voeg er hieronder een toe.</p>
        )}

        {blocks.map((blok, i) =>
          editingId === blok.id ? (
            <ContentBlockEditor
              key={blok.id}
              type={blok.type}
              communityId={communityId}
              storagePathId={blok.id}
              initialData={blok.data}
              saving={saving}
              onCancel={() => setEditingId(null)}
              onSave={(data) => handleSaveEdit(blok.id, data)}
            />
          ) : (
            <div
              key={blok.id}
              className="flex items-center gap-3 border border-lijn rounded-md px-4 py-3 bg-white"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  className="text-warmgrijs hover:text-warmzwart disabled:opacity-20"
                >
                  <CaretUp size={14} weight="bold" />
                </button>
                <button
                  onClick={() => handleMove(i, 1)}
                  disabled={i === blocks.length - 1}
                  className="text-warmgrijs hover:text-warmzwart disabled:opacity-20"
                >
                  <CaretDown size={14} weight="bold" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <span className="badge badge-terracotta">{TYPE_LABELS[blok.type]}</span>
                <p className="text-body-sm text-warmzwart truncate mt-1">{blockPreview(blok)}</p>
              </div>

              <button
                onClick={() => setEditingId(blok.id)}
                className="p-2 text-warmgrijs hover:text-warmzwart"
                aria-label="Bewerken"
              >
                <PencilSimple size={16} />
              </button>
              <button
                onClick={() => handleDelete(blok.id)}
                className="p-2 text-warmgrijs hover:text-terracotta"
                aria-label="Verwijderen"
              >
                <Trash size={16} />
              </button>
            </div>
          )
        )}
      </div>

      <div className="border-t border-lijn pt-6">
        <h2 className="font-bold text-body mb-3">Nieuw blok toevoegen</h2>
        {addingType ? (
          <ContentBlockEditor
            type={addingType}
            communityId={communityId}
            storagePathId={crypto.randomUUID()}
            initialData={{}}
            saving={saving}
            onCancel={() => setAddingType("")}
            onSave={(data) => handleSaveNew(addingType, data)}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setAddingType(type)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-lijn text-body-sm font-medium hover:border-terracotta hover:text-terracotta transition-colors"
              >
                <Plus size={14} weight="bold" />
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Herladen
        </Button>
      </div>
    </div>
  );
}

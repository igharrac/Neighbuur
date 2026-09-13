/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { CaretUp, CaretDown, PencilSimple, Trash, Plus } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";
import type { Category, CategoryType } from "@/types";

type FormState = Partial<Category>;

const emptyForm: FormState = {
  name_nl: "",
  name_en: "",
  description_nl: "",
  description_en: "",
  slug: "",
  type: "professional",
  icon: "",
  image_url: null,
  active: true,
};

export function CategorieEditor({ initialCategorieen }: { initialCategorieen: Category[] }) {
  const { showToast } = useToast();
  const [categorieen, setCategorieen] = useState(
    [...initialCategorieen].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(cat: Category) {
    setForm(cat);
    setSlugTouched(true);
    setEditingId(cat.id);
  }

  function startAdd() {
    setForm(emptyForm);
    setSlugTouched(false);
    setEditingId("new");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "name_nl" && !slugTouched ? { slug: slugify(value as string) } : {}),
    }));
  }

  async function handleSave() {
    if (!form.name_nl || !form.name_en || !form.slug) {
      showToast("Naam (NL+EN) en slug zijn verplicht", "error");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name_nl: form.name_nl,
      name_en: form.name_en,
      description_nl: form.description_nl || null,
      description_en: form.description_en || null,
      slug: form.slug,
      type: form.type as CategoryType,
      icon: form.icon || null,
      image_url: form.image_url || null,
      active: form.active ?? true,
    };

    if (editingId === "new") {
      const sortOrder = categorieen.length > 0 ? Math.max(...categorieen.map((c) => c.sort_order)) + 1 : 1;
      const { data, error } = await supabase
        .from("categories")
        .insert({ ...payload, sort_order: sortOrder })
        .select()
        .single();

      setSaving(false);
      if (error) {
        showToast(error.message, "error");
        return;
      }
      setCategorieen((prev) => [...prev, data as Category]);
      showToast("Categorie toegevoegd", "success");
    } else if (editingId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingId);

      setSaving(false);
      if (error) {
        showToast(error.message, "error");
        return;
      }
      setCategorieen((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
      );
      showToast("Categorie opgeslagen", "success");
    }

    cancelEdit();
  }

  async function handleDelete(cat: Category) {
    const supabase = createClient();
    const { data: gekoppeld } = await supabase
      .from("professional_profiles")
      .select("id")
      .contains("specialties", [cat.id])
      .limit(1);

    if (gekoppeld && gekoppeld.length > 0) {
      showToast("Kan niet verwijderen: er zijn vakmensen aan deze categorie gekoppeld.", "error");
      return;
    }

    if (!window.confirm(`"${cat.name_nl}" verwijderen?`)) return;

    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setCategorieen((prev) => prev.filter((c) => c.id !== cat.id));
    showToast("Categorie verwijderd", "success");
  }

  async function toggleActief(cat: Category) {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ active: !cat.active })
      .eq("id", cat.id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setCategorieen((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c)));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categorieen.length) return;

    const a = categorieen[index];
    const b = categorieen[target];
    const next = [...categorieen];
    next[index] = { ...b, sort_order: a.sort_order };
    next[target] = { ...a, sort_order: b.sort_order };
    next.sort((x, y) => x.sort_order - y.sort_order);
    setCategorieen(next);

    const supabase = createClient();
    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-md text-warmzwart mb-1">Categorieën</h1>
          <p className="text-body text-warmgrijs">{categorieen.length} categorieën</p>
        </div>
        {editingId === null && (
          <Button size="sm" onClick={startAdd}>
            <Plus size={15} weight="bold" />
            Nieuwe categorie
          </Button>
        )}
      </div>

      {editingId !== null && (
        <div className="border border-lijn rounded-md p-6 bg-cream mb-8">
          <h2 className="font-bold text-body mb-4">
            {editingId === "new" ? "Nieuwe categorie" : "Categorie bewerken"}
          </h2>
          <div className="flex flex-col gap-4">
            <ImageUploader
              bucket="categorie-images"
              pathPrefix={`${editingId === "new" ? crypto.randomUUID() : editingId}`}
              value={form.image_url}
              onUploaded={(url) => setField("image_url", url)}
              aspect="square"
              label="Afbeelding"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="name_nl"
                label="Naam (NL)"
                value={form.name_nl ?? ""}
                onChange={(e) => setField("name_nl", e.target.value)}
              />
              <Input
                name="name_en"
                label="Naam (EN)"
                value={form.name_en ?? ""}
                onChange={(e) => setField("name_en", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="description_nl"
                label="Beschrijving (NL)"
                value={form.description_nl ?? ""}
                onChange={(e) => setField("description_nl", e.target.value)}
              />
              <Input
                name="description_en"
                label="Beschrijving (EN)"
                value={form.description_en ?? ""}
                onChange={(e) => setField("description_en", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                name="slug"
                label="Slug"
                value={form.slug ?? ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", slugify(e.target.value));
                }}
              />
              <div>
                <label className="text-body-sm font-semibold block mb-1.5">Type</label>
                <select
                  value={form.type ?? "professional"}
                  onChange={(e) => setField("type", e.target.value as CategoryType)}
                  className="input"
                >
                  <option value="professional">Vakman</option>
                  <option value="compare">Vergelijk</option>
                </select>
              </div>
              <Input
                name="icon"
                label="Icoon"
                placeholder="bv. Tree"
                value={form.icon ?? ""}
                onChange={(e) => setField("icon", e.target.value)}
                hint="Phosphor icon naam"
              />
            </div>

            <label className="flex items-center gap-2 text-body-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Actief (zichtbaar op homepage)
            </label>
          </div>

          <div className="flex gap-2 mt-5">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Opslaan..." : "Opslaan"}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
              Annuleren
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {categorieen.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-3 border border-lijn rounded-md px-4 py-3 bg-white">
            <div className="flex flex-col">
              <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="text-warmgrijs hover:text-warmzwart disabled:opacity-20">
                <CaretUp size={14} weight="bold" />
              </button>
              <button onClick={() => handleMove(i, 1)} disabled={i === categorieen.length - 1} className="text-warmgrijs hover:text-warmzwart disabled:opacity-20">
                <CaretDown size={14} weight="bold" />
              </button>
            </div>

            <div className="w-11 h-11 rounded-md bg-cream overflow-hidden shrink-0">
              {cat.image_url && (
                <img src={cat.image_url} alt={cat.name_nl} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-body-sm text-warmzwart truncate">
                {cat.name_nl} <span className="text-warmgrijs font-normal">/ {cat.name_en}</span>
              </p>
              <span className="badge badge-blauw mt-0.5">{cat.type}</span>
            </div>

            <button
              onClick={() => toggleActief(cat)}
              className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${cat.active ? "bg-groen" : "bg-lijn"}`}
              aria-label="Actief wisselen"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${cat.active ? "translate-x-5" : ""}`}
              />
            </button>

            <button onClick={() => startEdit(cat)} className="p-2 text-warmgrijs hover:text-warmzwart" aria-label="Bewerken">
              <PencilSimple size={16} />
            </button>
            <button onClick={() => handleDelete(cat)} className="p-2 text-warmgrijs hover:text-terracotta" aria-label="Verwijderen">
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

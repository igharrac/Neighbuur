"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/types";

const AFSTAND_OPTIES = [5, 10, 15, 25, 50];
const RATING_OPTIES = [
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
  { value: "5", label: "Alleen 5.0" },
];

export function SearchFilters({ categorieen }: { categorieen: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleParam(key: string) {
    setParam(key, searchParams.get(key) === "1" ? null : "1");
  }

  const categorie = searchParams.get("categorie") ?? "";
  const afstand = searchParams.get("afstand") ?? "";
  const rating = searchParams.get("rating") ?? "";
  const beschikbaar = searchParams.get("beschikbaar") === "1";
  const geverifieerd = searchParams.get("geverifieerd") === "1";

  return (
    <div className="flex items-center gap-2 min-w-max">
      <select
        className="input !w-auto !py-2.5 !text-body-sm min-h-11"
        value={categorie}
        onChange={(e) => setParam("categorie", e.target.value || null)}
      >
        <option value="">Categorie</option>
        {categorieen.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name_nl}
          </option>
        ))}
      </select>

      <select
        className="input !w-auto !py-2.5 !text-body-sm min-h-11"
        value={afstand}
        onChange={(e) => setParam("afstand", e.target.value || null)}
      >
        <option value="">Afstand</option>
        {AFSTAND_OPTIES.map((km) => (
          <option key={km} value={km}>
            {km} km
          </option>
        ))}
      </select>

      <select
        className="input !w-auto !py-2.5 !text-body-sm min-h-11"
        value={rating}
        onChange={(e) => setParam("rating", e.target.value || null)}
      >
        <option value="">Rating</option>
        {RATING_OPTIES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => toggleParam("beschikbaar")}
        className={`min-h-11 px-4 rounded-sm text-body-sm font-semibold border whitespace-nowrap transition-colors ${
          beschikbaar ? "bg-groen text-white border-groen" : "bg-white text-warmgrijs border-lijn hover:border-warmgrijs-dark"
        }`}
      >
        Beschikbaar deze week
      </button>

      <button
        type="button"
        onClick={() => toggleParam("geverifieerd")}
        className={`min-h-11 px-4 rounded-sm text-body-sm font-semibold border whitespace-nowrap transition-colors ${
          geverifieerd ? "bg-groen text-white border-groen" : "bg-white text-warmgrijs border-lijn hover:border-warmgrijs-dark"
        }`}
      >
        Geverifieerd
      </button>
    </div>
  );
}

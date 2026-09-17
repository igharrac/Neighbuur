"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, ArrowRight, CaretRight } from "@phosphor-icons/react";
import { SearchFilters } from "./SearchFilters";
import { VakmanCard } from "@/components/features/vakman/VakmanCard";
import type { Category, ProfessionalOverview } from "@/types";

interface SearchPageProps {
  professionals: ProfessionalOverview[];
  categories: Category[];
  categoryNamePerSlug: Record<string, string>;
  totaalAantal: number;
  huidigePagina: number;
  totaalPaginas: number;
}

export function SearchPage({
  professionals,
  categories,
  categoryNamePerSlug,
  totaalAantal,
  huidigePagina,
  totaalPaginas,
}: SearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const actieveCategorieNaam = categoryNamePerSlug[searchParams.get("categorie") ?? ""];

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function gaNaarPagina(pagina: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (pagina <= 1) params.delete("pagina");
    else params.set("pagina", String(pagina));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <nav className="flex items-center gap-1.5 text-body-xs text-warmgrijs mb-3">
        <Link href="/diensten" className="hover:text-warmzwart">
          Diensten
        </Link>
        {actieveCategorieNaam && (
          <>
            <CaretRight size={10} />
            <span className="text-warmzwart font-medium">{actieveCategorieNaam}</span>
          </>
        )}
      </nav>

      <h1 className="font-display text-display-md mb-5">Vind een vakman in jouw buurt</h1>

      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white border border-lijn rounded-full shadow-soft mb-4 pl-5 pr-1.5 py-1.5 gap-3"
      >
        <MagnifyingGlass size={18} className="text-warmgrijs shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Stukadoor in Amersfoort"
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-body-sm placeholder:text-warmgrijs py-2"
        />
        <button type="submit" className="btn-primary !rounded-full !py-2.5 !px-5 shrink-0">
          Zoeken <ArrowRight size={15} weight="bold" />
        </button>
      </form>

      <div className="mb-5 overflow-x-auto scrollbar-none -mx-6 px-6">
        <SearchFilters categories={categories} />
      </div>

      <p className="text-body-sm text-warmgrijs mb-4">
        {totaalAantal} {totaalAantal === 1 ? "vakman" : "vakmensen"} gevonden
      </p>

      {professionals.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Geen vakmensen gevonden met deze filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {professionals.map((v) => (
            <VakmanCard
              key={v.id}
              professional={v}
              categoryNames={(v.category_slugs ?? [])
                .map((slug) => categoryNamePerSlug[slug])
                .filter((naam): naam is string => Boolean(naam))}
            />
          ))}
        </div>
      )}

      {totaalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => gaNaarPagina(huidigePagina - 1)}
            disabled={huidigePagina <= 1}
            className="text-body-sm font-medium text-sage disabled:text-warmgrijs/40 disabled:pointer-events-none hover:underline"
          >
            ← Vorige
          </button>
          <span className="text-body-xs text-warmgrijs">
            Pagina {huidigePagina} van {totaalPaginas}
          </span>
          <button
            onClick={() => gaNaarPagina(huidigePagina + 1)}
            disabled={huidigePagina >= totaalPaginas}
            className="text-body-sm font-medium text-sage disabled:text-warmgrijs/40 disabled:pointer-events-none hover:underline"
          >
            Volgende →
          </button>
        </div>
      )}
    </div>
  );
}

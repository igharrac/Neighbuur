"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, MapPin, ArrowRight, CaretRight } from "@phosphor-icons/react";
import { SearchFilters } from "./SearchFilters";
import { VakmanCard } from "@/components/features/vakman/VakmanCard";
import { useToast } from "@/components/ui/Toast";
import type { Category, ProfessionalOverview } from "@/types";

interface SearchPageProps {
  professionals: (ProfessionalOverview & { distance_km?: number })[];
  categories: Category[];
  categoryNamePerSlug: Record<string, string>;
  totaalAantal: number;
  huidigePagina: number;
  totaalPaginas: number;
  plaatsNaam: string | null;
  buurtOpdrachtenPerProvider: Record<string, number>;
}

export function SearchPage({
  professionals,
  categories,
  categoryNamePerSlug,
  totaalAantal,
  huidigePagina,
  totaalPaginas,
  plaatsNaam,
  buurtOpdrachtenPerProvider,
}: SearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [locatie, setLocatie] = useState(plaatsNaam ?? "");
  const [zoekenBezig, setZoekenBezig] = useState(false);

  const actieveCategorieNaam = categoryNamePerSlug[searchParams.get("categorie") ?? ""];

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("pagina");

    const locatieTrimmed = locatie.trim();
    if (!locatieTrimmed) {
      params.delete("lat");
      params.delete("lng");
      params.delete("plaats");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    // Locatietekst is ongewijzigd t.o.v. wat al is opgezocht (bv. alleen de
    // vrije-tekst-zoekterm is aangepast) — geen nieuwe PDOK-aanroep nodig,
    // gewoon de al bekende lat/lng/plaats-params behouden.
    if (plaatsNaam && locatieTrimmed.toLowerCase() === plaatsNaam.toLowerCase()) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    setZoekenBezig(true);
    const res = await fetch("/api/locatie/zoeken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: locatieTrimmed }),
    });
    const json = await res.json().catch(() => null);
    setZoekenBezig(false);

    if (!json?.found) {
      showToast("Kon deze locatie niet vinden. Probeer een plaatsnaam of postcode (bijv. 3821).", "error");
      return;
    }

    params.set("lat", String(json.lat));
    params.set("lng", String(json.lng));
    params.set("plaats", json.city ?? locatieTrimmed);
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
        className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-lijn rounded-2xl sm:rounded-full shadow-soft mb-4 p-1.5 gap-1.5"
      >
        <div className="flex items-center flex-1 min-w-0 pl-3.5">
          <MagnifyingGlass size={17} className="text-warmgrijs shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Stukadoor"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-body-sm placeholder:text-warmgrijs py-2.5 px-2.5"
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-lijn shrink-0" />
        <div className="flex items-center flex-1 min-w-0 pl-3.5 sm:border-none border-t border-lijn sm:pt-0 pt-1.5">
          <MapPin size={17} className="text-warmgrijs shrink-0" />
          <input
            value={locatie}
            onChange={(e) => setLocatie(e.target.value)}
            placeholder="Locatie of postcode"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-body-sm placeholder:text-warmgrijs py-2.5 px-2.5"
          />
        </div>
        <button type="submit" disabled={zoekenBezig} className="btn-primary !rounded-full !py-2.5 !px-5 shrink-0 disabled:opacity-60">
          {zoekenBezig ? "Zoeken…" : "Zoeken"} {!zoekenBezig && <ArrowRight size={15} weight="bold" />}
        </button>
      </form>

      <div className="mb-5 overflow-x-auto scrollbar-none -mx-6 px-6">
        <SearchFilters categories={categories} />
      </div>

      <p className="text-body-sm text-warmgrijs mb-4">
        {totaalAantal} {totaalAantal === 1 ? "vakman" : "vakmensen"} gevonden
        {plaatsNaam && ` in en rond ${plaatsNaam}`}
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
              distanceKm={v.distance_km}
              buurtPlaats={plaatsNaam}
              buurtOpdrachten={buurtOpdrachtenPerProvider[v.id]}
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

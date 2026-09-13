"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { SearchFilters } from "./SearchFilters";
import { VakmanCard } from "@/components/features/vakman/VakmanCard";
import type { Category, ProfessionalOverview } from "@/types";

interface SearchPageProps {
  vakmen: ProfessionalOverview[];
  categorieen: Category[];
  categorieNaamPerSlug: Record<string, string>;
}

export function SearchPage({ vakmen, categorieen, categorieNaamPerSlug }: SearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <h1 className="font-display text-display-md mb-5">Vind een vakman</h1>

      <form onSubmit={handleSearch} className="relative mb-4">
        <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgrijs pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Stukadoor in Amersfoort"
          className="input !pl-11"
        />
      </form>

      <div className="mb-5 overflow-x-auto scrollbar-none -mx-6 px-6">
        <SearchFilters categorieen={categorieen} />
      </div>

      <p className="text-body-sm text-warmgrijs mb-4">
        {vakmen.length} {vakmen.length === 1 ? "vakman" : "vakmensen"} gevonden
      </p>

      {vakmen.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Geen vakmensen gevonden met deze filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {vakmen.map((v) => (
            <VakmanCard
              key={v.id}
              vakman={v}
              categorieNamen={(v.category_slugs ?? [])
                .map((slug) => categorieNaamPerSlug[slug])
                .filter((naam): naam is string => Boolean(naam))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

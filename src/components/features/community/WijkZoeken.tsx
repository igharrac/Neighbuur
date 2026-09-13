"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";

interface DistrictOption {
  name: string;
  slug: string;
  stad: string;
  postcode: string | null;
}

interface CommunityOption {
  name: string;
  slug: string;
  districtName: string;
}

export function WijkZoeken({ districts, communities }: { districts: DistrictOption[]; communities: CommunityOption[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [geenResultaat, setGeenResultaat] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const communityMatch = communities.find((c) => c.name.toLowerCase().includes(q));
    if (communityMatch) {
      router.push(`/community/${communityMatch.slug}`);
      return;
    }

    const wijkMatch = districts.find(
      (w) => w.name.toLowerCase().includes(q) || w.stad.toLowerCase().includes(q) || w.postcode?.toLowerCase().includes(q)
    );
    if (wijkMatch) {
      router.push(`/wijk/${wijkMatch.slug}`);
      return;
    }

    setGeenResultaat(true);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-[560px]">
        <div className="flex-1 min-w-0 flex items-center gap-2 rounded-full bg-white px-4 py-3.5 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
          <MagnifyingGlass size={17} className="text-warmgrijs shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setGeenResultaat(false);
            }}
            placeholder="Postcode, wijk of nieuwbouwproject..."
            className="flex-1 min-w-0 bg-transparent font-body text-[15px] text-warmzwart placeholder:text-warmgrijs outline-none"
          />
        </div>
        <button type="submit" className="btn-primary !rounded-full justify-center">
          Zoeken
          <ArrowRight size={14} weight="bold" />
        </button>
      </form>
      {geenResultaat && (
        <p className="font-body text-[13px] text-warmgrijs mt-2">
          Geen wijk of project gevonden voor &ldquo;{query}&rdquo; — bekijk hieronder alle actieve wijken.
        </p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { CommunityOverzicht } from "@/lib/communities";

const DOT_COLORS = ["bg-terracotta", "bg-groen", "bg-blauw", "bg-lavendel", "bg-oker"];

export function CommunitySearch({ communities }: { communities: CommunityOverzicht[] }) {
  const { dict } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push("/login");
  }

  return (
    <section className="px-6 py-14 md:py-16" id="buurt">
      <div className="max-w-[560px] mx-auto text-center">
        <p className="font-body text-body-sm font-semibold tracking-wider uppercase text-terracotta mb-3">
          {dict.community.eyebrow}
        </p>
        <h2 className="font-display text-display-lg text-warmzwart mb-2">{dict.community.title}</h2>
        <p className="text-body text-warmgrijs mb-6">{dict.community.subtitle}</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.community.searchPlaceholder}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-sm border border-lijn bg-white text-body-sm outline-none transition-colors focus:border-terracotta"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-sm bg-warmzwart text-white text-body-sm font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            {dict.community.cta}
            <MagnifyingGlass size={15} weight="bold" />
          </button>
        </form>

        {communities.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:justify-center mt-6 pb-1 snap-x snap-mandatory scrollbar-none">
            {communities.map((c, i) => (
              <Link
                key={c.id}
                href="/login"
                className="shrink-0 snap-start flex items-center gap-2 bg-white border border-lijn rounded-sm pl-2.5 pr-3.5 py-1.5 text-body-xs font-medium text-warmzwart no-underline transition-colors hover:border-terracotta"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                {c.wijk_naam} {c.naam}
                <span className="text-warmgrijs">
                  · {c.aantal_leden} {dict.community.members}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

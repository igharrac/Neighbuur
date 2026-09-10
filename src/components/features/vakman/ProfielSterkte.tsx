"use client";

import Link from "next/link";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import type { VakmanProfiel } from "@/types";

interface ProfielSterkteProps {
  vakman: VakmanProfiel;
  werkFotoCount: number;
  heeftBeschikbaarheid: boolean;
}

interface ChecklistItem {
  label: string;
  done: boolean;
  punten: number;
  href: string;
}

export function ProfielSterkte({ vakman, werkFotoCount, heeftBeschikbaarheid }: ProfielSterkteProps) {
  const items: ChecklistItem[] = [
    { label: "Bedrijfsnaam", done: !!vakman.bedrijfsnaam, punten: 10, href: "/dashboard/profiel" },
    { label: "KvK-nummer", done: !!vakman.kvk_nummer, punten: 10, href: "/dashboard/profiel" },
    { label: "Logo uploaden", done: !!vakman.logo_url, punten: 20, href: "/dashboard/profiel#logo" },
    { label: "Bio schrijven", done: !!vakman.bio, punten: 10, href: "/dashboard/profiel#bio" },
    { label: "Website toevoegen", done: !!vakman.website, punten: 5, href: "/dashboard/profiel#website" },
    { label: "3+ werkfoto's", done: werkFotoCount >= 3, punten: 15, href: "/dashboard/profiel#fotos" },
    { label: "Beschikbaarheid instellen", done: heeftBeschikbaarheid, punten: 10, href: "/dashboard/profiel#beschikbaarheid" },
    { label: "Verzekeringsbewijs", done: !!vakman.verzekering_url, punten: 15, href: "/dashboard/profiel#verzekering" },
  ];

  const pct = Math.min(100, Math.max(0, vakman.profiel_sterkte));

  return (
    <div className="bg-white rounded-md shadow-soft p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-body">Profiel vervolledigen</h2>
        <span className="font-display font-bold text-body text-terracotta">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-cream-dark overflow-hidden mb-5">
        <div
          className="h-full bg-terracotta rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-cream transition-colors no-underline group"
          >
            {item.done ? (
              <CheckCircle size={20} weight="fill" className="text-groen shrink-0" />
            ) : (
              <Circle size={20} className="text-lijn shrink-0" />
            )}
            <span className={`text-body-sm flex-1 ${item.done ? "text-warmgrijs line-through" : "text-warmzwart font-medium"}`}>
              {item.label}
            </span>
            {!item.done && (
              <span className="text-body-xs font-semibold text-terracotta shrink-0">+{item.punten}pt</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

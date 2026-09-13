/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { Category } from "@/types";

export function CategoryTile({ categorie }: { categorie: Category }) {
  const { lang } = useLang();
  const naam = lang === "nl" ? categorie.name_nl : categorie.name_en;
  const beschrijving = lang === "nl" ? categorie.description_nl : categorie.description_en;
  const href = `/zoeken?categorie=${categorie.slug}`;

  return (
    <Link
      href={href}
      className="group no-underline flex flex-col bg-[#F5F0E8] rounded overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-medium"
    >
      <div className="w-full aspect-square overflow-hidden">
        {categorie.image_url ? (
          <img
            src={categorie.image_url}
            alt={naam}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-terracotta-50" />
        )}
      </div>
      <div className="flex items-end justify-between gap-2 px-4 pt-3.5 pb-4">
        <div className="min-w-0">
          <h4 className="font-bold text-body-sm text-warmzwart leading-tight truncate">{naam}</h4>
          {beschrijving && (
            <p className="text-body-xs text-warmgrijs mt-0.5 leading-snug line-clamp-2">{beschrijving}</p>
          )}
        </div>
        <span className="shrink-0 w-7 h-7 rounded-full bg-terracotta-100 text-terracotta flex items-center justify-center transition-colors group-hover:bg-terracotta group-hover:text-white">
          <ArrowRight size={14} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

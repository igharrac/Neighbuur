/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { Category } from "@/types";

export function CategoryTile({ category }: { category: Category }) {
  const { lang } = useLang();
  const naam = lang === "nl" ? category.name_nl : category.name_en;
  const beschrijving = lang === "nl" ? category.description_nl : category.description_en;
  const href = `/zoeken?categorie=${category.slug}`;

  return (
    <Link
      href={href}
      className="group no-underline flex flex-col bg-[#F5F0E8] rounded overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-medium"
    >
      <div className="w-full aspect-square overflow-hidden">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={naam}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-sage-50" />
        )}
      </div>
      <div className="relative min-h-[88px] px-4 pt-3.5 pb-4">
        <div className="min-w-0 pr-9">
          <h4 className="font-bold text-body-sm text-warmzwart leading-tight truncate">{naam}</h4>
          {beschrijving && (
            <p className="text-body-xs text-warmgrijs mt-0.5 leading-snug line-clamp-2">{beschrijving}</p>
          )}
        </div>
        <span className="absolute bottom-4 right-4 shrink-0 w-7 h-7 rounded-full bg-sage-100 text-sage flex items-center justify-center transition-colors group-hover:bg-sage group-hover:text-white">
          <ArrowRight size={14} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

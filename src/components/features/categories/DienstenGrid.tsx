/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import type { Category } from "@/types";

export function DienstenGrid({ categories }: { categories: Category[] }) {
  const { lang } = useLang();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => {
        const naam = lang === "nl" ? category.name_nl : category.name_en;
        const beschrijving = lang === "nl" ? category.description_nl : category.description_en;

        return (
          <Link
            key={category.id}
            href={`/zoeken?categorie=${category.slug}`}
            className="group no-underline bg-white rounded-2xl overflow-hidden shadow-[0px_4px_10px_rgba(92,64,40,0.04)] hover:-translate-y-1 hover:shadow-[0px_12px_24px_rgba(92,64,40,0.1)] transition-all duration-300"
          >
            <div className="w-full aspect-[4/3] overflow-hidden bg-sand-light">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={naam}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-display font-bold text-[19px] text-warmzwart">{naam}</h3>
                <span className="shrink-0 w-8 h-8 rounded-full bg-terracotta-100 text-terracotta flex items-center justify-center transition-colors group-hover:bg-terracotta group-hover:text-white">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </div>
              {beschrijving && (
                <p className="font-body text-[14px] leading-[20px] text-warmgrijs-dark line-clamp-2">{beschrijving}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { Logo } from "@/components/layout/nav";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface MarketingHeaderProps {
  /** Rustige kruislink naar de andere doelgroep (provider ↔ resident). Niet tonen samen met `back`. */
  cross?: { href: string; label: string };
  /** Terug-navigatie i.p.v. een kruislink — gebruikt op de signup/confirmation-pagina's. */
  back?: { href: string; label: string };
}

/**
 * Minimale header voor de 6 publieke marketing-/signup-pagina's — bewust
 * géén conventionele site-nav (geen diensten/wijk-links, geen inloggen),
 * zodat de pagina calm en single-purpose blijft.
 */
export function MarketingHeader({ cross, back }: MarketingHeaderProps) {
  return (
    <header className="px-6 py-5 lg:px-[72px]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-5">
          <LanguageToggle />
          {cross && (
            <Link href={cross.href} className="text-body-sm font-medium text-warmgrijs hover:text-warmzwart transition-colors whitespace-nowrap">
              {cross.label}
            </Link>
          )}
          {back && (
            <Link href={back.href} className="inline-flex items-center gap-1.5 text-body-sm font-medium text-warmgrijs hover:text-warmzwart transition-colors whitespace-nowrap">
              <ArrowLeft size={14} weight="bold" />
              {back.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

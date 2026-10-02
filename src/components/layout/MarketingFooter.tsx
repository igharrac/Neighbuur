"use client";

import Link from "next/link";
import { useLang } from "@/lib/hooks/useLang";

/**
 * Lichte footer voor de marketing-pagina's — in tegenstelling tot de
 * bestaande site-wide Footer (die `hidden md:block` is) blijft deze ook
 * op mobiel zichtbaar, en bevat een onopvallende "Inloggen"-link zodat
 * bestaande gebruikers met een verlopen sessie altijd een weg terug
 * naar /login kunnen vinden (de marketing-header zelf heeft die link
 * bewust niet, conform de brief).
 */
export function MarketingFooter() {
  const { dict } = useLang();

  return (
    <footer className="text-center py-10 px-6 border-t border-lijn">
      <p className="text-body-sm text-warmgrijs">
        <Link href="/voorwaarden/vakman" className="text-sage hover:underline">{dict.footer.terms}</Link>
        {" · "}
        <Link href="/privacy" className="text-sage hover:underline">{dict.footer.privacy}</Link>
        {" · "}
        <Link href="/login" className="text-sage hover:underline">{dict.nav.login}</Link>
      </p>
      <p className="text-body-xs text-warmgrijs-light mt-2">
        © {new Date().getFullYear()} Neighbuur
      </p>
    </footer>
  );
}

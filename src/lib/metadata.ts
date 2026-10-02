import { cookies } from "next/headers";
import { getDictionary, type Lang } from "@/lib/i18n";

/**
 * Leest de `nt_lang`-cookie (gezet door useLang/LanguageToggle) server-side,
 * puur voor <title>/<meta description> van de nieuwe marketingpagina's —
 * de rest van de site doet dit bewust niet (zie i18n-audit in het plan),
 * dit raakt alleen deze pagina's.
 */
export function getLangFromCookie(): Lang {
  const stored = cookies().get("nt_lang")?.value;
  return stored === "en" ? "en" : "nl";
}

export function getDict() {
  return getDictionary(getLangFromCookie());
}

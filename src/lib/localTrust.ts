/**
 * Privacydrempel voor "X opdrachten in jouw buurt" op het publieke
 * vakmanprofiel — een klein cluster met 1-2 opdrachten zou de enige buur
 * die deze vakman inhuurde bijna identificeren. Transparant en op één
 * plek aan te passen (zelfde principe als LAGE_DEKKING_GRENS in
 * providerCoverage.ts), geen score.
 */
export const MIN_ZICHTBAAR_BUURT_AANTAL = 3;

export function magBuurtAantalTonen(aantal: number): boolean {
  return aantal >= MIN_ZICHTBAAR_BUURT_AANTAL;
}

/**
 * Drempel voor de "X buren uit [plaats] kozen [provider]"-badge op de
 * zoekpagina. Dit is een aggregaat-telling (afgeronde Neighbuur-
 * opdrachten in die stad, geen reviewtekst/reviewer), dus een lager
 * risico dan MIN_ZICHTBAAR_BUURT_AANTAL — maar "1 buur koos" leest als
 * zwak bewijs i.p.v. sterk, dus ook hier een kleine, transparante grens.
 */
export const MIN_BUURT_OPDRACHTEN_BADGE = 2;

export function magBuurtOpdrachtenBadgeTonen(aantal: number): boolean {
  return aantal >= MIN_BUURT_OPDRACHTEN_BADGE;
}

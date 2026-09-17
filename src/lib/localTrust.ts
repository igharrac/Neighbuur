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

/**
 * Grens voor "aandacht nodig" in de coverage-weergave — puur een
 * weergave-hint, geen score. Transparant en op één plek aan te passen
 * (§11 van de opdracht: geen black-box, wel configureerbaar). Nog geen
 * "voldoende dekking"-uitspraak — we weten nog niet hoeveel providers
 * genoeg is, dat volgt pas uit echte launch-data.
 */
export const LAGE_DEKKING_GRENS = 5;

export function heeftAandachtNodig(providerCount: number): boolean {
  return providerCount < LAGE_DEKKING_GRENS;
}

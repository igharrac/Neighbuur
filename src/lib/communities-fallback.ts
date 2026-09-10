import type { CommunityOverzicht } from "@/lib/communities";

/** Fallback-communities zolang wijken/communities nog niet zijn ingevoerd in Supabase. */
export const fallbackCommunities: CommunityOverzicht[] = [
  { id: "fallback-1", naam: "Blok C", slug: "vathorst-blok-c", wijk_naam: "Vathorst", aantal_leden: 47 },
  { id: "fallback-2", naam: "Blok A", slug: "vathorst-blok-a", wijk_naam: "Vathorst", aantal_leden: 31 },
  { id: "fallback-3", naam: "Blok 7", slug: "de-hoef-blok-7", wijk_naam: "De Hoef", aantal_leden: 24 },
  { id: "fallback-4", naam: "Fase 2", slug: "nieuwveen-noord-fase-2", wijk_naam: "Nieuwveen Noord", aantal_leden: 12 },
];

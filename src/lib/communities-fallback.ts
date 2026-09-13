import type { CommunityOverzicht } from "@/lib/communities";

/** Fallback-communities zolang wijken/communities nog niet zijn ingevoerd in Supabase. */
export const fallbackCommunities: CommunityOverzicht[] = [
  { id: "fallback-1", name: "Blok C", slug: "vathorst-blok-c", district_name: "Vathorst", member_count: 47 },
  { id: "fallback-2", name: "Blok A", slug: "vathorst-blok-a", district_name: "Vathorst", member_count: 31 },
  { id: "fallback-3", name: "Blok 7", slug: "de-hoef-blok-7", district_name: "De Hoef", member_count: 24 },
  { id: "fallback-4", name: "Fase 2", slug: "nieuwveen-noord-fase-2", district_name: "Nieuwveen Noord", member_count: 12 },
];

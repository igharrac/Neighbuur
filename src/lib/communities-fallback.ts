import type { CommunityOverview } from "@/lib/communities";

/** Fallback-communities zolang wijken/communities nog niet zijn ingevoerd in Supabase. */
export const fallbackCommunities: CommunityOverview[] = [
  { id: "fallback-1", name: "Blok C", slug: "vathorst-blok-c", development_name: "Vathorst", member_count: 47 },
  { id: "fallback-2", name: "Blok A", slug: "vathorst-blok-a", development_name: "Vathorst", member_count: 31 },
  { id: "fallback-3", name: "Blok 7", slug: "de-hoef-blok-7", development_name: "De Hoef", member_count: 24 },
  { id: "fallback-4", name: "Fase 2", slug: "nieuwveen-noord-fase-2", development_name: "Nieuwveen Noord", member_count: 12 },
];

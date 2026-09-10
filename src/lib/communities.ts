import { createServerSupabase } from "@/lib/supabase-server";
import { fallbackCommunities } from "@/lib/communities-fallback";

export interface CommunityOverzicht {
  id: string;
  naam: string;
  slug: string;
  wijk_naam: string;
  aantal_leden: number;
}

/** Haalt de meest actieve communities op (voor social proof op de homepage), met fallback. */
export async function getActiveCommunities(limit = 5): Promise<CommunityOverzicht[]> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("community_overzicht")
      .select("id, naam, slug, wijk_naam, aantal_leden")
      .order("aantal_leden", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return fallbackCommunities;
    return data as CommunityOverzicht[];
  } catch {
    return fallbackCommunities;
  }
}

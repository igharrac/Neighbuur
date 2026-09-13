import { createServerSupabase } from "@/lib/supabase-server";
import { fallbackCommunities } from "@/lib/communities-fallback";

export interface CommunityOverzicht {
  id: string;
  name: string;
  slug: string;
  district_name: string;
  member_count: number;
}

/** Haalt de meest actieve communities op (voor social proof op de homepage), met fallback. */
export async function getActiveCommunities(limit = 5): Promise<CommunityOverzicht[]> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("community_overzicht")
      .select("id, name, slug, district_name, member_count")
      .order("member_count", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return fallbackCommunities;
    return data.map((c) => ({
      id: c.id!,
      name: c.name!,
      slug: c.slug!,
      district_name: c.district_name!,
      member_count: Number(c.member_count ?? 0),
    }));
  } catch {
    return fallbackCommunities;
  }
}

import { createServerSupabase } from "@/lib/supabase-server";
import { fallbackCommunities } from "@/lib/communities-fallback";

export interface CommunityOverview {
  id: string;
  name: string;
  slug: string;
  development_name: string | null;
  member_count: number;
}

/** Haalt de meest actieve communities op (voor social proof op de homepage), met fallback. */
export async function getActiveCommunities(limit = 5): Promise<CommunityOverview[]> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("community_overview")
      .select("id, name, slug, development_name, member_count")
      .order("member_count", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return fallbackCommunities;
    return data.map((c) => ({
      id: c.id!,
      name: c.name!,
      slug: c.slug!,
      development_name: c.development_name,
      member_count: Number(c.member_count ?? 0),
    }));
  } catch {
    return fallbackCommunities;
  }
}

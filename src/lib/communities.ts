import { createServerSupabase } from "@/lib/supabase-server";

export interface CommunityOverview {
  id: string;
  name: string;
  slug: string;
  development_name: string | null;
  member_count: number;
  residence_count: number;
  active_deals: number;
}

export interface CommunityStats extends CommunityOverview {
  /** Boekingen met status "requested", via community_active_bookings_count (security definer, telt geen rijen vrij). */
  active_bookings: number;
  /** Gemiddeld prijsvoordeel in procenten over actieve group_discounts met zowel price_normal als price_group ingevuld — null als die er niet zijn. */
  avg_discount_pct: number | null;
}

/**
 * Haalt de meest actieve communities op (voor de zoekfunctie en als
 * "voorbeeld"-community op de homepage voor bezoekers zonder eigen wijk).
 * Geeft bewust een lege lijst terug i.p.v. verzonnen placeholder-communities
 * als de query niets oplevert — zie WijkActivatie.tsx voor hoe dat wordt
 * afgehandeld.
 */
export async function getActiveCommunities(limit = 5): Promise<CommunityOverview[]> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("community_overview")
      .select("id, name, slug, development_name, member_count, residence_count, active_deals")
      .order("member_count", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id!,
      name: c.name!,
      slug: c.slug!,
      development_name: c.development_name,
      member_count: Number(c.member_count ?? 0),
      residence_count: Number(c.residence_count ?? 0),
      active_deals: Number(c.active_deals ?? 0),
    }));
  } catch {
    return [];
  }
}

/** Voegt de echte actieve-klussen-telling en het gemiddelde dealvoordeel toe aan een community. */
async function enrichCommunityStats(base: CommunityOverview): Promise<CommunityStats> {
  const supabase = createServerSupabase();

  const [{ data: activeBookings }, { data: deals }] = await Promise.all([
    supabase.rpc("community_active_bookings_count", { p_community_id: base.id }),
    supabase
      .from("group_discounts")
      .select("price_normal, price_group")
      .eq("community_id", base.id)
      .eq("active", true),
  ]);

  // Alleen deals die daadwerkelijk goedkoper zijn tellen mee — een
  // groepsprijs die niet lager is dan de normale prijs is geen "voordeel"
  // en moet het gemiddelde niet kunnen vertekenen richting 0 of negatief.
  const dealsWithRealDiscount = (deals ?? []).filter(
    (d): d is { price_normal: number; price_group: number } =>
      d.price_normal != null && d.price_group != null && d.price_normal > 0 && d.price_group < d.price_normal
  );
  const avgDiscountPct =
    dealsWithRealDiscount.length > 0
      ? (dealsWithRealDiscount.reduce((sum, d) => sum + (d.price_normal - d.price_group) / d.price_normal, 0) /
          dealsWithRealDiscount.length) *
        100
      : null;

  return {
    ...base,
    active_bookings: Number(activeBookings ?? 0),
    avg_discount_pct: avgDiscountPct,
  };
}

/**
 * Community van de ingelogde bewoner zelf (via resident_profiles.community_id),
 * met de echte, gescopete cijfers erbij. Geeft null als de bewoner nog geen
 * community heeft — dan toont de homepage een voorbeeld-community i.p.v.
 * "jouw wijk"-cijfers die niet van hen zijn.
 */
export async function getMyCommunityStats(userId: string): Promise<CommunityStats | null> {
  const supabase = createServerSupabase();

  const { data: profiel } = await supabase
    .from("resident_profiles")
    .select("community_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profiel?.community_id) return null;

  const { data: community } = await supabase
    .from("community_overview")
    .select("id, name, slug, development_name, member_count, residence_count, active_deals")
    .eq("id", profiel.community_id)
    .maybeSingle();
  if (!community) return null;

  return enrichCommunityStats({
    id: community.id!,
    name: community.name!,
    slug: community.slug!,
    development_name: community.development_name,
    member_count: Number(community.member_count ?? 0),
    residence_count: Number(community.residence_count ?? 0),
    active_deals: Number(community.active_deals ?? 0),
  });
}

/** Verrijkt de meest actieve community uit een lijst (voor bezoekers zonder eigen wijk). */
export async function getFeaturedCommunityStats(communities: CommunityOverview[]): Promise<CommunityStats | null> {
  if (communities.length === 0) return null;
  return enrichCommunityStats(communities[0]);
}

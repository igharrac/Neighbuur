import { getCategorieen } from "@/lib/categorieen";
import { getActiveCommunities, getMyCommunityStats, getFeaturedCommunityStats } from "@/lib/communities";
import { createServerSupabase } from "@/lib/supabase-server";
import { HomePageClient } from "@/components/features/home/HomePageClient";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const [categories, communities, { data: { user } }] = await Promise.all([
    getCategorieen(),
    getActiveCommunities(),
    supabase.auth.getUser(),
  ]);

  // Eigen wijk tonen als de bewoner er een heeft; anders de actiefste
  // community als voorbeeld — nooit platformbrede verzonnen cijfers.
  const myCommunityStats = user ? await getMyCommunityStats(user.id) : null;
  const featuredCommunityStats = myCommunityStats ? null : await getFeaturedCommunityStats(communities);

  return (
    <HomePageClient
      categories={categories}
      communities={communities}
      myCommunityStats={myCommunityStats}
      featuredCommunityStats={featuredCommunityStats}
    />
  );
}

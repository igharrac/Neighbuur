import { getCategorieen } from "@/lib/categorieen";
import { getActiveCommunities } from "@/lib/communities";
import { HomePageClient } from "@/components/features/home/HomePageClient";

export default async function HomePage() {
  const [categories, communities] = await Promise.all([
    getCategorieen(),
    getActiveCommunities(),
  ]);
  return <HomePageClient categories={categories} communities={communities} />;
}

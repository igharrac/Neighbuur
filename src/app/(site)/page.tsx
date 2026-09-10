import { getCategorieen } from "@/lib/categorieen";
import { getActiveCommunities } from "@/lib/communities";
import { HomePageClient } from "@/components/features/home/HomePageClient";

export default async function HomePage() {
  const [categorieen, communities] = await Promise.all([
    getCategorieen(),
    getActiveCommunities(),
  ]);
  return <HomePageClient categorieen={categorieen} communities={communities} />;
}

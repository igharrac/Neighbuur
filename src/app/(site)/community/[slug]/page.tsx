import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { HeroBanner } from "@/components/features/community/HeroBanner";
import { CommunityHeader } from "@/components/features/community/CommunityHeader";
import { ContentBlock } from "@/components/features/community/ContentBlock";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import type { CommunityContentBlock } from "@/types";
import type { Lang } from "@/lib/i18n";

interface CommunityOverzichtRow {
  id: string;
  district_id: string;
  name: string;
  slug: string;
  type: string;
  district_name: string;
  member_count: number;
  review_count: number;
  active_deals: number;
}

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const lang: Lang = cookies().get("nt_lang")?.value === "en" ? "en" : "nl";
  const supabase = createServerSupabase();

  const { data: community } = await supabase
    .from("community_overzicht")
    .select("id, district_id, name, slug, type, district_name, member_count, review_count, active_deals")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!community) notFound();
  const c: CommunityOverzichtRow = {
    id: community.id!,
    district_id: community.district_id!,
    name: community.name!,
    slug: community.slug!,
    type: community.type!,
    district_name: community.district_name!,
    member_count: Number(community.member_count ?? 0),
    review_count: Number(community.review_count ?? 0),
    active_deals: Number(community.active_deals ?? 0),
  };

  const { data: blokken } = await supabase
    .from("community_content_blocks")
    .select("id, community_id, type, position, data, active")
    .eq("community_id", c.id)
    .eq("active", true)
    .order("position", { ascending: true });

  const alleBlokken = (blokken ?? []) as CommunityContentBlock[];
  const heroBlok = alleBlokken.find((b) => b.type === "hero_banner");
  const overigeBlokken = alleBlokken.filter((b) => b.id !== heroBlok?.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  if (user) {
    const { data: lid } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", c.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isMember = !!lid;
  }

  return (
    <PullToRefresh>
      <div className="bg-cream-warm min-h-screen">
        <div className="max-w-[800px] mx-auto px-6 py-10">
          {heroBlok && <div className="mb-6"><HeroBanner data={heroBlok.data} /></div>}

          <CommunityHeader
            naam={c.name}
            type={c.type}
            wijkNaam={c.district_name}
            wijkId={c.district_id}
            communityId={c.id}
            aantalLeden={c.member_count}
            aantalReviews={c.review_count}
            lopendeActies={c.active_deals}
            initialIsMember={isMember}
          />

          <div className="flex flex-col gap-6">
            {overigeBlokken.length === 0 ? (
              <p className="font-body text-[14px] text-warmgrijs">Deze community-pagina heeft nog geen content.</p>
            ) : (
              overigeBlokken.map((blok) => (
                <div key={blok.id} className="bg-white rounded-2xl shadow-[0px_4px_10px_rgba(92,64,40,0.04)] p-6 md:p-8">
                  <ContentBlock type={blok.type} data={blok.data} community_id={c.id} lang={lang} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

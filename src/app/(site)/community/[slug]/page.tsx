import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { HeroBanner } from "@/components/features/community/HeroBanner";
import { CommunityHeader } from "@/components/features/community/CommunityHeader";
import { ContentBlock } from "@/components/features/community/ContentBlock";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import type { CommunityContentBlok } from "@/types";
import type { Lang } from "@/lib/i18n";

interface CommunityOverzichtRow {
  id: string;
  wijk_id: string;
  naam: string;
  slug: string;
  type: string;
  wijk_naam: string;
  aantal_leden: number;
  aantal_reviews: number;
  lopende_acties: number;
}

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const lang: Lang = cookies().get("nt_lang")?.value === "en" ? "en" : "nl";
  const supabase = createServerSupabase();

  const { data: community } = await supabase
    .from("community_overzicht")
    .select("id, wijk_id, naam, slug, type, wijk_naam, aantal_leden, aantal_reviews, lopende_acties")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!community) notFound();
  const c = community as CommunityOverzichtRow;

  const { data: blokken } = await supabase
    .from("community_content_blokken")
    .select("id, community_id, type, positie, data, actief")
    .eq("community_id", c.id)
    .eq("actief", true)
    .order("positie", { ascending: true });

  const alleBlokken = (blokken ?? []) as CommunityContentBlok[];
  const heroBlok = alleBlokken.find((b) => b.type === "hero_banner");
  const overigeBlokken = alleBlokken.filter((b) => b.id !== heroBlok?.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  if (user) {
    const { data: lid } = await supabase
      .from("community_leden")
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
            naam={c.naam}
            type={c.type}
            wijkNaam={c.wijk_naam}
            wijkId={c.wijk_id}
            communityId={c.id}
            aantalLeden={c.aantal_leden}
            aantalReviews={c.aantal_reviews}
            lopendeActies={c.lopende_acties}
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

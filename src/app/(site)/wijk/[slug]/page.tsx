import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { CommunityCard } from "@/components/features/community/CommunityCard";
import { formatDate } from "@/lib/utils";
import type { District } from "@/types";

interface CommunityOverzichtRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  member_count: number;
  review_count: number;
}

export default async function WijkPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: wijk } = await supabase.from("districts").select("*").eq("slug", params.slug).maybeSingle();
  if (!wijk) notFound();
  const w = wijk as District;

  const { data: communities } = await supabase
    .from("community_overzicht")
    .select("id, name, slug, type, member_count, review_count")
    .eq("district_id", w.id)
    .order("name");

  const rows: CommunityOverzichtRow[] = (communities ?? []).map((c) => ({
    id: c.id!,
    name: c.name!,
    slug: c.slug!,
    type: c.type!,
    member_count: Number(c.member_count ?? 0),
    review_count: Number(c.review_count ?? 0),
  }));

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6 py-14">
        <Link href="/wijk" className="font-body text-[13px] text-warmgrijs hover:text-terracotta no-underline">
          ← Alle wijken
        </Link>
        <div className="mt-3 mb-10">
          <h1 className="font-display font-bold text-[38px] leading-[44px] text-warmzwart mb-2">
            {w.name}, <span className="text-warmgrijs">{w.city}</span>
          </h1>
          <div className="flex flex-wrap gap-4 font-body text-[14px] text-warmgrijs">
            {w.completion_date && <span>Opleverdatum: {formatDate(w.completion_date)}</span>}
            {w.home_count != null && <span>{w.home_count} woningen</span>}
            <span>{rows.length} {rows.length === 1 ? "blok" : "blokken"}</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="font-body text-[15px] text-warmgrijs">Nog geen communities in deze wijk.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rows.map((c) => (
              <CommunityCard
                key={c.id}
                naam={c.name}
                type={c.type}
                slug={c.slug}
                aantalLeden={c.member_count}
                aantalReviews={c.review_count}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

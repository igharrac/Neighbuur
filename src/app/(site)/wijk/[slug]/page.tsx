import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { CommunityCard } from "@/components/features/community/CommunityCard";
import { formatDate } from "@/lib/utils";
import type { Wijk } from "@/types";

interface CommunityOverzichtRow {
  id: string;
  naam: string;
  slug: string;
  type: string;
  aantal_leden: number;
  aantal_reviews: number;
}

export default async function WijkPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: wijk } = await supabase.from("wijken").select("*").eq("slug", params.slug).maybeSingle();
  if (!wijk) notFound();
  const w = wijk as Wijk;

  const { data: communities } = await supabase
    .from("community_overzicht")
    .select("id, naam, slug, type, aantal_leden, aantal_reviews")
    .eq("wijk_id", w.id)
    .order("naam");

  const rows: CommunityOverzichtRow[] = (communities ?? []).map((c) => ({
    id: c.id!,
    naam: c.naam!,
    slug: c.slug!,
    type: c.type!,
    aantal_leden: Number(c.aantal_leden ?? 0),
    aantal_reviews: Number(c.aantal_reviews ?? 0),
  }));

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6 py-14">
        <Link href="/wijk" className="font-body text-[13px] text-warmgrijs hover:text-terracotta no-underline">
          ← Alle wijken
        </Link>
        <div className="mt-3 mb-10">
          <h1 className="font-display font-bold text-[38px] leading-[44px] text-warmzwart mb-2">
            {w.naam}, <span className="text-warmgrijs">{w.stad}</span>
          </h1>
          <div className="flex flex-wrap gap-4 font-body text-[14px] text-warmgrijs">
            {w.opleverdatum && <span>Opleverdatum: {formatDate(w.opleverdatum)}</span>}
            {w.aantal_woningen != null && <span>{w.aantal_woningen} woningen</span>}
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
                naam={c.naam}
                type={c.type}
                slug={c.slug}
                aantalLeden={c.aantal_leden}
                aantalReviews={c.aantal_reviews}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

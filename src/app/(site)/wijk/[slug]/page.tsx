import { notFound } from "next/navigation";
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

  const rows = (communities ?? []) as CommunityOverzichtRow[];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display text-display-md text-warmzwart mb-2">
          {w.naam}, <span className="text-warmgrijs">{w.stad}</span>
        </h1>
        <div className="flex flex-wrap gap-4 text-body-sm text-warmgrijs">
          {w.opleverdatum && <span>Opleverdatum: {formatDate(w.opleverdatum)}</span>}
          {w.aantal_woningen != null && <span>{w.aantal_woningen} woningen</span>}
          <span>{rows.length} {rows.length === 1 ? "blok" : "blokken"}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-body text-warmgrijs">Nog geen communities in deze wijk.</p>
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
  );
}

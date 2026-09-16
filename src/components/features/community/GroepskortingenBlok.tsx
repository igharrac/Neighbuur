import { Users } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";

interface GroepskortingRow {
  id: string;
  title_nl: string;
  title_en: string;
  description_nl: string | null;
  description_en: string | null;
  min_participants: number;
  price_normal: number | null;
  price_group: number | null;
}

export async function GroepskortingenBlok({ community_id, lang }: { community_id: string; lang: Lang }) {
  const supabase = createServerSupabase();
  const { data: kortingen } = await supabase
    .from("group_discounts")
    .select("id, title_nl, title_en, description_nl, description_en, min_participants, price_normal, price_group")
    .eq("community_id", community_id)
    .eq("active", true);

  const rows = (kortingen ?? []) as GroepskortingRow[];
  const ids = rows.map((r) => r.id);

  const countByKorting: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: deelnemers } = await supabase
      .from("group_discount_participants")
      .select("group_discount_id")
      .in("group_discount_id", ids);
    (deelnemers ?? []).forEach((d) => {
      countByKorting[d.group_discount_id] = (countByKorting[d.group_discount_id] ?? 0) + 1;
    });
  }

  return (
    <div>
      <h3 className="font-display text-display-sm text-warmzwart mb-4">Groepskortingen</h3>
      {rows.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Geen lopende acties in deze buurt.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((k) => {
            const aantal = countByKorting[k.id] ?? 0;
            const pct = Math.min(100, Math.round((aantal / k.min_participants) * 100));
            return (
              <div key={k.id} className="border border-lijn rounded-md p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-bold text-body-sm">{lang === "nl" ? k.title_nl : k.title_en}</h4>
                  {k.price_group != null && (
                    <span className="text-body-sm font-bold text-sage shrink-0">
                      €{(k.price_group / 100).toFixed(0)}
                    </span>
                  )}
                </div>
                {(lang === "nl" ? k.description_nl : k.description_en) && (
                  <p className="text-body-xs text-warmgrijs mb-3">
                    {lang === "nl" ? k.description_nl : k.description_en}
                  </p>
                )}
                <div className="h-1.5 rounded-full bg-cream-dark overflow-hidden mb-1.5">
                  <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="flex items-center gap-1.5 text-body-xs text-warmgrijs">
                  <Users size={13} />
                  {aantal} / {k.min_participants} nodig
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

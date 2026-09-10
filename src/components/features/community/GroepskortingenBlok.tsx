import { Users } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";

interface GroepskortingRow {
  id: string;
  titel_nl: string;
  titel_en: string;
  beschrijving_nl: string | null;
  beschrijving_en: string | null;
  min_deelnemers: number;
  prijs_normaal: number | null;
  prijs_groep: number | null;
}

export async function GroepskortingenBlok({ community_id, lang }: { community_id: string; lang: Lang }) {
  const supabase = createServerSupabase();
  const { data: kortingen } = await supabase
    .from("groepskortingen")
    .select("id, titel_nl, titel_en, beschrijving_nl, beschrijving_en, min_deelnemers, prijs_normaal, prijs_groep")
    .eq("community_id", community_id)
    .eq("actief", true);

  const rows = (kortingen ?? []) as GroepskortingRow[];
  const ids = rows.map((r) => r.id);

  const countByKorting: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: deelnemers } = await supabase
      .from("groepskorting_deelnemers")
      .select("groepskorting_id")
      .in("groepskorting_id", ids);
    (deelnemers ?? []).forEach((d) => {
      countByKorting[d.groepskorting_id] = (countByKorting[d.groepskorting_id] ?? 0) + 1;
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
            const pct = Math.min(100, Math.round((aantal / k.min_deelnemers) * 100));
            return (
              <div key={k.id} className="border border-lijn rounded-md p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-bold text-body-sm">{lang === "nl" ? k.titel_nl : k.titel_en}</h4>
                  {k.prijs_groep != null && (
                    <span className="text-body-sm font-bold text-terracotta shrink-0">
                      €{(k.prijs_groep / 100).toFixed(0)}
                    </span>
                  )}
                </div>
                {(lang === "nl" ? k.beschrijving_nl : k.beschrijving_en) && (
                  <p className="text-body-xs text-warmgrijs mb-3">
                    {lang === "nl" ? k.beschrijving_nl : k.beschrijving_en}
                  </p>
                )}
                <div className="h-1.5 rounded-full bg-cream-dark overflow-hidden mb-1.5">
                  <div className="h-full bg-terracotta rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="flex items-center gap-1.5 text-body-xs text-warmgrijs">
                  <Users size={13} />
                  {aantal} / {k.min_deelnemers} nodig
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

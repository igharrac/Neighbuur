import { createServerSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { SearchPage } from "@/components/features/search/SearchPage";
import type { VakmanOverzicht } from "@/types";

interface ZoekenSearchParams {
  categorie?: string;
  afstand?: string;
  rating?: string;
  beschikbaar?: string;
  geverifieerd?: string;
  q?: string;
}

export default async function ZoekenPage({ searchParams }: { searchParams: ZoekenSearchParams }) {
  const supabase = createServerSupabase();
  const alleCategorieen = await getCategorieen();
  const vakmanCategorieen = alleCategorieen.filter((c) => c.type === "professional");

  let query = supabase.from("vakman_overzicht").select("*");

  if (searchParams.categorie) {
    query = query.contains("categorie_slugs", [searchParams.categorie]);
  }
  if (searchParams.afstand) {
    query = query.gte("werkgebied_km", Number(searchParams.afstand));
  }
  if (searchParams.rating) {
    query = query.gte("gem_score", Number(searchParams.rating));
  }
  if (searchParams.geverifieerd === "1") {
    query = query.eq("geverifieerd", true);
  }
  if (searchParams.q) {
    query = query.ilike("bedrijfsnaam", `%${searchParams.q}%`);
  }

  query = query.order("is_premium", { ascending: false }).order("gem_score", { ascending: false });

  const { data } = await query;
  let vakmen = (data ?? []).map((v) => ({
    ...v,
    review_count: Number(v.review_count ?? 0),
    score_kwaliteit: Number(v.score_kwaliteit ?? 0),
    afgeronde_klussen: Number(v.afgeronde_klussen ?? 0),
  })) as unknown as VakmanOverzicht[];

  if (searchParams.beschikbaar === "1" && vakmen.length > 0) {
    const vandaag = new Date();
    const over7Dagen = new Date(vandaag);
    over7Dagen.setDate(vandaag.getDate() + 7);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    const { data: beschikbaarheid } = await supabase
      .from("availability")
      .select("professional_id")
      .eq("status", "beschikbaar")
      .gte("date", toDateStr(vandaag))
      .lte("date", toDateStr(over7Dagen))
      .in("professional_id", vakmen.map((v) => v.id));

    const beschikbareIds = new Set((beschikbaarheid ?? []).map((b) => b.professional_id as string));
    vakmen = vakmen.filter((v) => beschikbareIds.has(v.id));
  }

  const categorieNaamPerSlug: Record<string, string> = Object.fromEntries(
    alleCategorieen.map((c) => [c.slug, c.name_nl])
  );

  return (
    <SearchPage vakmen={vakmen} categorieen={vakmanCategorieen} categorieNaamPerSlug={categorieNaamPerSlug} />
  );
}

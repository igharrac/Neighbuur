import { createServerSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { SearchPage } from "@/components/features/search/SearchPage";
import type { ProfessionalOverview } from "@/types";

interface ZoekenSearchParams {
  categorie?: string;
  afstand?: string;
  rating?: string;
  beschikbaar?: string;
  geverifieerd?: string;
  q?: string;
  pagina?: string;
}

const PAGINA_GROOTTE = 20;

export default async function ZoekenPage({ searchParams }: { searchParams: ZoekenSearchParams }) {
  const supabase = createServerSupabase();
  const allCategories = await getCategorieen();
  const professionalCategories = allCategories.filter((c) => c.type === "professional");

  let query = supabase
    .from("professional_overview")
    .select("*", { count: "exact" })
    .is("deactivated_at", null)
    .is("deleted_at", null);

  if (searchParams.categorie) {
    query = query.contains("category_slugs", [searchParams.categorie]);
  }
  if (searchParams.afstand) {
    query = query.gte("service_area_km", Number(searchParams.afstand));
  }
  if (searchParams.rating) {
    query = query.gte("avg_score", Number(searchParams.rating));
  }
  if (searchParams.geverifieerd === "1") {
    query = query.eq("verified", true);
  }
  if (searchParams.q) {
    query = query.ilike("company_name", `%${searchParams.q}%`);
  }

  // Beschikbaarheid staat los van de andere filters (eigen tabel) — eerst de
  // beschikbare provider-id's ophalen en als filter meegeven, zodat paginering
  // (.range hieronder) correct blijft werken over het volledige, al-gefilterde
  // resultaat i.p.v. alleen over de providers die toevallig op de huidige pagina staan.
  if (searchParams.beschikbaar === "1") {
    const vandaag = new Date();
    const over7Dagen = new Date(vandaag);
    over7Dagen.setDate(vandaag.getDate() + 7);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    const { data: beschikbaarheid } = await supabase
      .from("availability")
      .select("professional_id")
      .eq("status", "available")
      .gte("date", toDateStr(vandaag))
      .lte("date", toDateStr(over7Dagen));

    const beschikbareIds = [...new Set((beschikbaarheid ?? []).map((b) => b.professional_id as string))];
    // Lege lijst zou "in.()" opleveren (ongeldig filter) — val terug op een
    // niet-bestaand id zodat de query gewoon 0 resultaten geeft.
    query = query.in("id", beschikbareIds.length > 0 ? beschikbareIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  query = query.order("is_premium", { ascending: false }).order("avg_score", { ascending: false });

  const huidigePagina = Math.max(1, Number(searchParams.pagina ?? "1") || 1);
  const from = (huidigePagina - 1) * PAGINA_GROOTTE;
  const to = from + PAGINA_GROOTTE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const professionals = (data ?? []).map((v) => ({
    ...v,
    review_count: Number(v.review_count ?? 0),
    avg_score: Number(v.avg_score ?? 0),
    completed_jobs: Number(v.completed_jobs ?? 0),
  })) as unknown as ProfessionalOverview[];

  const totaalAantal = count ?? 0;
  const totaalPaginas = Math.max(1, Math.ceil(totaalAantal / PAGINA_GROOTTE));

  const categoryNamePerSlug: Record<string, string> = Object.fromEntries(
    allCategories.map((c) => [c.slug, c.name_nl])
  );

  return (
    <SearchPage
      professionals={professionals}
      categories={professionalCategories}
      categoryNamePerSlug={categoryNamePerSlug}
      totaalAantal={totaalAantal}
      huidigePagina={huidigePagina}
      totaalPaginas={totaalPaginas}
    />
  );
}

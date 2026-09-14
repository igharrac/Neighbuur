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
}

export default async function ZoekenPage({ searchParams }: { searchParams: ZoekenSearchParams }) {
  const supabase = createServerSupabase();
  const allCategories = await getCategorieen();
  const professionalCategories = allCategories.filter((c) => c.type === "professional");

  let query = supabase.from("professional_overview").select("*").is("deactivated_at", null).is("deleted_at", null);

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

  query = query.order("is_premium", { ascending: false }).order("avg_score", { ascending: false });

  const { data } = await query;
  let professionals = (data ?? []).map((v) => ({
    ...v,
    review_count: Number(v.review_count ?? 0),
    avg_score: Number(v.avg_score ?? 0),
    completed_jobs: Number(v.completed_jobs ?? 0),
  })) as unknown as ProfessionalOverview[];

  if (searchParams.beschikbaar === "1" && professionals.length > 0) {
    const vandaag = new Date();
    const over7Dagen = new Date(vandaag);
    over7Dagen.setDate(vandaag.getDate() + 7);
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    const { data: beschikbaarheid } = await supabase
      .from("availability")
      .select("professional_id")
      .eq("status", "available")
      .gte("date", toDateStr(vandaag))
      .lte("date", toDateStr(over7Dagen))
      .in("professional_id", professionals.map((v) => v.id));

    const beschikbareIds = new Set((beschikbaarheid ?? []).map((b) => b.professional_id as string));
    professionals = professionals.filter((v) => beschikbareIds.has(v.id));
  }

  const categoryNamePerSlug: Record<string, string> = Object.fromEntries(
    allCategories.map((c) => [c.slug, c.name_nl])
  );

  return (
    <SearchPage professionals={professionals} categories={professionalCategories} categoryNamePerSlug={categoryNamePerSlug} />
  );
}

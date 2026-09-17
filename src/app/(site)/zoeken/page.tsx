import { createServerSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { SearchPage } from "@/components/features/search/SearchPage";
import { distanceKm } from "@/lib/geo";
import type { ProfessionalOverview } from "@/types";

interface ZoekenSearchParams {
  categorie?: string;
  afstand?: string;
  rating?: string;
  beschikbaar?: string;
  geverifieerd?: string;
  q?: string;
  pagina?: string;
  lat?: string;
  lng?: string;
  plaats?: string;
}

const PAGINA_GROOTTE = 20;

export default async function ZoekenPage({ searchParams }: { searchParams: ZoekenSearchParams }) {
  const supabase = createServerSupabase();
  const allCategories = await getCategorieen();
  const professionalCategories = allCategories.filter((c) => c.type === "professional");

  const zoekLat = searchParams.lat ? Number(searchParams.lat) : null;
  const zoekLng = searchParams.lng ? Number(searchParams.lng) : null;
  const heeftLocatie = zoekLat !== null && zoekLng !== null && !Number.isNaN(zoekLat) && !Number.isNaN(zoekLng);

  let query = supabase
    .from("professional_overview")
    .select("*", { count: "exact" })
    .is("deactivated_at", null)
    .is("deleted_at", null);

  if (searchParams.categorie) {
    query = query.contains("category_slugs", [searchParams.categorie]);
  }
  // "Afstand" betekent, zodra er een locatie is opgegeven, straks een
  // echte afstand tot die locatie (hieronder in JS berekend) i.p.v. de
  // straal die de provider zelf claimt — de DB-filter hieronder blijft
  // dus alleen gelden voor de locatie-loze situatie.
  if (searchParams.afstand && !heeftLocatie) {
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
    query = query.in("id", beschikbareIds.length > 0 ? beschikbareIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const huidigePagina = Math.max(1, Number(searchParams.pagina ?? "1") || 1);
  const categoryNamePerSlug: Record<string, string> = Object.fromEntries(
    allCategories.map((c) => [c.slug, c.name_nl])
  );

  let professionals: (ProfessionalOverview & { distance_km?: number })[];
  let totaalAantal: number;

  if (heeftLocatie) {
    // Met een locatie sorteren we op werkelijke afstand — dat is geen
    // kolom om op te ORDER BY'en, dus hier álle (al door de bovenstaande
    // filters beperkte) providers ophalen en in JS sorteren/pagineren.
    // Nooit meer dan de ~370 actieve providers in totaal, dus geen
    // performanceprobleem op deze schaal.
    query = query.order("is_premium", { ascending: false });
    const { data } = await query;
    let alle = (data ?? []).map((v) => ({
      ...v,
      review_count: Number(v.review_count ?? 0),
      avg_score: Number(v.avg_score ?? 0),
      completed_jobs: Number(v.completed_jobs ?? 0),
    })) as unknown as (ProfessionalOverview & { distance_km?: number })[];

    alle = alle
      .filter((p) => p.service_area_lat != null && p.service_area_lng != null)
      .map((p) => ({ ...p, distance_km: distanceKm(zoekLat!, zoekLng!, p.service_area_lat!, p.service_area_lng!) }))
      .filter((p) => (searchParams.afstand ? p.distance_km! <= Number(searchParams.afstand) : true))
      .sort((a, b) => {
        if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
        return a.distance_km! - b.distance_km!;
      });

    totaalAantal = alle.length;
    professionals = alle.slice((huidigePagina - 1) * PAGINA_GROOTTE, huidigePagina * PAGINA_GROOTTE);
  } else {
    query = query.order("is_premium", { ascending: false }).order("avg_score", { ascending: false });
    const from = (huidigePagina - 1) * PAGINA_GROOTTE;
    query = query.range(from, from + PAGINA_GROOTTE - 1);
    const { data, count } = await query;
    professionals = (data ?? []).map((v) => ({
      ...v,
      review_count: Number(v.review_count ?? 0),
      avg_score: Number(v.avg_score ?? 0),
      completed_jobs: Number(v.completed_jobs ?? 0),
    })) as unknown as ProfessionalOverview[];
    totaalAantal = count ?? 0;
  }

  // "X buren uit [plaats] kozen [provider]" — alleen zinvol met een
  // opgegeven plaats, en alleen gebaseerd op daadwerkelijk afgeronde
  // Neighbuur-opdrachten in die stad (nooit verzonnen).
  let buurtOpdrachtenPerProvider: Record<string, number> = {};
  if (searchParams.plaats && professionals.length > 0) {
    const { data: ervaring } = await supabase.rpc("provider_local_experience_by_city_public");
    buurtOpdrachtenPerProvider = Object.fromEntries(
      (ervaring ?? [])
        .filter((r) => r.city?.toLowerCase() === searchParams.plaats!.toLowerCase())
        .map((r) => [r.professional_id, Number(r.completed_jobs)])
    );
  }

  const totaalPaginas = Math.max(1, Math.ceil(totaalAantal / PAGINA_GROOTTE));

  return (
    <SearchPage
      professionals={professionals}
      categories={professionalCategories}
      categoryNamePerSlug={categoryNamePerSlug}
      totaalAantal={totaalAantal}
      huidigePagina={huidigePagina}
      totaalPaginas={totaalPaginas}
      plaatsNaam={searchParams.plaats ?? null}
      buurtOpdrachtenPerProvider={buurtOpdrachtenPerProvider}
    />
  );
}

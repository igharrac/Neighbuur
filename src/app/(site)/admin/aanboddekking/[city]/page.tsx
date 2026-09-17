import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SealCheck, Warning } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { LAGE_DEKKING_GRENS, heeftAandachtNodig } from "@/lib/providerCoverage";

interface CategoryRow {
  category_id: string;
  category_name: string;
  category_slug: string;
  provider_count: number;
}

interface ProviderRow {
  provider_id: string;
  company_name: string;
  verified: boolean;
  profile_strength: number | null;
  has_logo: boolean;
  has_description: boolean;
  category_name: string;
  local_completed_jobs: number;
  review_count: number | null;
}

const PAGINA_GROOTTE = 40;

export default async function AdminAanboddekkingStadPage({
  params,
  searchParams,
}: {
  params: { city: string };
  searchParams: { categorie?: string; status?: string; profiel?: string; pagina?: string };
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const cityName = decodeURIComponent(params.city);

  const { data: catData } = await supabase
    .from("admin_provider_coverage_by_city_category")
    .select("*")
    .eq("city", cityName)
    .order("provider_count", { ascending: false });
  if (!catData || catData.length === 0) notFound();

  const categorieen: CategoryRow[] = (catData as unknown as Record<string, string | number>[]).map((c) => ({
    category_id: String(c.category_id),
    category_name: String(c.category_name),
    category_slug: String(c.category_slug),
    provider_count: Number(c.provider_count ?? 0),
  }));

  const maxCount = Math.max(...categorieen.map((c) => c.provider_count), 1);
  const aandachtNodig = categorieen.filter((c) => heeftAandachtNodig(c.provider_count));

  // Providerlijst voor deze stad — desgewenst gefilterd op categorie.
  // Eén stad tegelijk is klein genoeg (nooit in de buurt van de 1000-
  // rijenlimiet) om direct uit de ruwe coverage-view te lezen; dedupe
  // op provider_id omdat een provider met N diensten hier N rijen geeft.
  let providerQuery = supabase
    .from("admin_provider_coverage")
    .select(
      "provider_id, company_name, verified, profile_strength, has_logo, has_description, category_name, category_slug, local_completed_jobs, review_count"
    )
    .eq("city", cityName);
  if (searchParams.categorie) providerQuery = providerQuery.eq("category_slug", searchParams.categorie);
  const { data: providerData } = await providerQuery;

  const providersPerId = new Map<string, ProviderRow & { categorieen: string[] }>();
  for (const r of (providerData ?? []) as unknown as (ProviderRow & { category_slug: string })[]) {
    const bestaand = providersPerId.get(r.provider_id);
    if (bestaand) {
      bestaand.categorieen.push(r.category_name);
    } else {
      providersPerId.set(r.provider_id, { ...r, categorieen: [r.category_name] });
    }
  }
  let providers = [...providersPerId.values()].sort((a, b) => (b.profile_strength ?? 0) - (a.profile_strength ?? 0));

  const totaalProviders = providers.length;
  const metLokaleErvaring = providers.filter((p) => p.local_completed_jobs > 0).length;
  const metReviews = providers.filter((p) => (p.review_count ?? 0) > 0).length;

  if (searchParams.status === "geverifieerd") providers = providers.filter((p) => p.verified);
  if (searchParams.status === "nietgeverifieerd") providers = providers.filter((p) => !p.verified);
  if (searchParams.profiel === "compleet") providers = providers.filter((p) => p.has_logo && p.has_description);
  if (searchParams.profiel === "incompleet") providers = providers.filter((p) => !p.has_logo || !p.has_description);

  const gefilterdAantal = providers.length;
  const huidigePagina = Math.max(1, Number(searchParams.pagina ?? "1") || 1);
  const totaalPaginas = Math.max(1, Math.ceil(gefilterdAantal / PAGINA_GROOTTE));
  const paginaProviders = providers.slice((huidigePagina - 1) * PAGINA_GROOTTE, huidigePagina * PAGINA_GROOTTE);

  const actieveCategorieFilter = categorieen.find((c) => c.category_slug === searchParams.categorie);

  const bouwQuery = (overrides: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { categorie: searchParams.categorie, status: searchParams.status, profiel: searchParams.profiel, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/aanboddekking/${encodeURIComponent(cityName)}${s ? `?${s}` : ""}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin/aanboddekking" className="text-body-sm text-warmgrijs hover:text-sage inline-flex items-center gap-1.5 mb-4">
        <ArrowLeft size={14} weight="bold" />
        Alle gebieden
      </Link>

      <h1 className="font-display text-display-sm text-warmzwart mb-1">{cityName}</h1>
      <p className="text-body-sm text-warmgrijs mb-8">
        {totaalProviders} providers · {categorieen.length}{" "}
        {categorieen.length === 1 ? "dienst vertegenwoordigd" : "diensten vertegenwoordigd"} · {metLokaleErvaring} met lokale ervaring ·{" "}
        {metReviews} met reviews
      </p>

      <h2 className="font-display font-bold text-[19px] text-warmzwart mb-4">Aanbod per dienst</h2>
      <div className="card-flat p-5 mb-8">
        <div className="flex flex-col gap-2.5">
          {categorieen.map((c) => (
            <div key={c.category_id} className="flex items-center gap-2">
              <Link
                href={bouwQuery({
                  categorie: searchParams.categorie === c.category_slug ? undefined : c.category_slug,
                  pagina: undefined,
                })}
                className={`flex-1 flex items-center gap-3 no-underline rounded-sm px-2 py-1.5 -mx-2 transition-colors ${
                  searchParams.categorie === c.category_slug ? "bg-sage-50" : "hover:bg-cream"
                }`}
              >
                <span className="w-28 shrink-0 text-body-sm text-warmzwart truncate">{c.category_name}</span>
                <div className="flex-1 h-2.5 rounded-full bg-sand overflow-hidden">
                  <div
                    className={`h-full rounded-full ${heeftAandachtNodig(c.provider_count) ? "bg-oker" : "bg-sage"}`}
                    style={{ width: `${(c.provider_count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-body-sm font-semibold text-warmzwart shrink-0">{c.provider_count}</span>
              </Link>
              <Link
                href={`/admin/aanboddekking/dienst/${c.category_slug}`}
                title="Vergelijk deze dienst tussen steden"
                className="text-body-xs text-warmgrijs hover:text-sage shrink-0 no-underline"
              >
                andere steden →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {aandachtNodig.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-[19px] text-warmzwart mb-1 flex items-center gap-2">
            <Warning size={18} className="text-oker" weight="fill" />
            Aandacht nodig
          </h2>
          <p className="text-body-xs text-warmgrijs mb-4">
            Minder dan {LAGE_DEKKING_GRENS} providers — een vuistregel, geen harde uitspraak over voldoende dekking.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {aandachtNodig.map((c) => (
              <div key={c.category_id} className="border border-oker/40 bg-oker-light rounded-md px-4 py-3">
                <p className="font-semibold text-body-sm text-warmzwart">{c.category_name}</p>
                <p className="text-body-xs text-warmgrijs">{c.provider_count} providers</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold text-[19px] text-warmzwart">
          Providers {actieveCategorieFilter && <span className="font-normal text-warmgrijs">· {actieveCategorieFilter.category_name}</span>}
        </h2>
        <div className="flex items-center gap-2 text-body-xs">
          <span className="text-warmgrijs mr-1">Status:</span>
          {[
            ["alle", undefined],
            ["geverifieerd", "geverifieerd"],
            ["niet geverifieerd", "nietgeverifieerd"],
          ].map(([label, val]) => (
            <Link
              key={label}
              href={bouwQuery({ status: val, pagina: undefined })}
              className={`px-2.5 py-1 rounded-full no-underline ${
                (searchParams.status ?? undefined) === val ? "bg-sage text-white" : "bg-sand text-warmgrijs hover:bg-sand-light"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="text-warmgrijs mx-1">Profiel:</span>
          {[
            ["alle", undefined],
            ["compleet", "compleet"],
            ["incompleet", "incompleet"],
          ].map(([label, val]) => (
            <Link
              key={label}
              href={bouwQuery({ profiel: val, pagina: undefined })}
              className={`px-2.5 py-1 rounded-full no-underline ${
                (searchParams.profiel ?? undefined) === val ? "bg-sage text-white" : "bg-sand text-warmgrijs hover:bg-sand-light"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-body-xs text-warmgrijs mb-3">
        {gefilterdAantal === totaalProviders ? `${totaalProviders} providers` : `${gefilterdAantal} van ${totaalProviders} providers`}
      </p>
      <div className="card-flat overflow-hidden !p-0">
        <div className="divide-y divide-lijn">
          {paginaProviders.length === 0 ? (
            <p className="p-5 text-body-sm text-warmgrijs">Geen providers voor deze filtercombinatie.</p>
          ) : (
            paginaProviders.map((p) => (
              <div key={p.provider_id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body font-semibold text-[14px] text-warmzwart truncate flex items-center gap-1.5">
                    {p.company_name}
                    {p.verified && <SealCheck size={14} className="text-sage shrink-0" weight="fill" />}
                  </p>
                  <p className="text-body-xs text-warmgrijs mt-0.5 truncate">{p.categorieen.join(", ")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-body-xs text-warmgrijs">
                  {!p.has_logo && <span className="px-2 py-0.5 rounded-full bg-sand">geen logo</span>}
                  {!p.has_description && <span className="px-2 py-0.5 rounded-full bg-sand">geen omschrijving</span>}
                  {p.local_completed_jobs > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-sage-50 text-sage font-medium">{p.local_completed_jobs} opdrachten hier</span>
                  )}
                  {(p.review_count ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-sage-50 text-sage font-medium">{p.review_count} reviews</span>
                  )}
                  <span className="font-semibold text-warmzwart">{p.profile_strength ?? 0}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totaalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Link
            href={bouwQuery({ pagina: huidigePagina > 1 ? String(huidigePagina - 1) : undefined })}
            aria-disabled={huidigePagina <= 1}
            className={`text-body-sm no-underline ${huidigePagina <= 1 ? "text-warmgrijs/40 pointer-events-none" : "text-sage hover:underline"}`}
          >
            ← Vorige
          </Link>
          <span className="text-body-xs text-warmgrijs">
            Pagina {huidigePagina} van {totaalPaginas}
          </span>
          <Link
            href={bouwQuery({ pagina: huidigePagina < totaalPaginas ? String(huidigePagina + 1) : undefined })}
            aria-disabled={huidigePagina >= totaalPaginas}
            className={`text-body-sm no-underline ${huidigePagina >= totaalPaginas ? "text-warmgrijs/40 pointer-events-none" : "text-sage hover:underline"}`}
          >
            Volgende →
          </Link>
        </div>
      )}
    </div>
  );
}

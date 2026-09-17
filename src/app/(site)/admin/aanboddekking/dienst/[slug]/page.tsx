import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Warning } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { heeftAandachtNodig } from "@/lib/providerCoverage";

interface CityRow {
  city: string;
  provider_count: number;
}

export default async function AdminAanboddekkingDienstPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: categorieRaw } = await supabase
    .from("categories")
    .select("id, name_nl, slug")
    .eq("slug", params.slug)
    .eq("type", "professional")
    .maybeSingle();
  if (!categorieRaw) notFound();
  const categorie = { id: categorieRaw.id, name: categorieRaw.name_nl, slug: categorieRaw.slug };

  const { data: cityData } = await supabase
    .from("admin_provider_coverage_by_city_category")
    .select("city, provider_count")
    .eq("category_id", categorie.id)
    .order("provider_count", { ascending: false });

  const steden: CityRow[] = ((cityData ?? []) as unknown as Record<string, string | number>[]).map((c) => ({
    city: String(c.city),
    provider_count: Number(c.provider_count ?? 0),
  }));

  const maxCount = Math.max(...steden.map((s) => s.provider_count), 1);
  const totaalProviders = steden.reduce((sum, s) => sum + s.provider_count, 0);
  const zwakkeSteden = steden.filter((s) => heeftAandachtNodig(s.provider_count));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin/aanboddekking" className="text-body-sm text-warmgrijs hover:text-sage inline-flex items-center gap-1.5 mb-4">
        <ArrowLeft size={14} weight="bold" />
        Alle gebieden
      </Link>

      <h1 className="font-display text-display-sm text-warmzwart mb-1">{categorie.name}</h1>
      <p className="text-body-sm text-warmgrijs mb-8">
        {totaalProviders} providers in {steden.length} {steden.length === 1 ? "stad" : "steden"}
      </p>

      {steden.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Nog geen providers met deze dienst en een herkend werkgebied.</p>
      ) : (
        <div className="card-flat p-5 mb-8">
          <div className="flex flex-col gap-2.5">
            {steden.map((s) => (
              <Link
                key={s.city}
                href={`/admin/aanboddekking/${encodeURIComponent(s.city)}?categorie=${categorie.slug}`}
                className="flex items-center gap-3 no-underline rounded-sm px-2 py-1.5 -mx-2 hover:bg-cream transition-colors"
              >
                <span className="w-32 shrink-0 text-body-sm text-warmzwart truncate">{s.city}</span>
                <div className="flex-1 h-2.5 rounded-full bg-sand overflow-hidden">
                  <div
                    className={`h-full rounded-full ${heeftAandachtNodig(s.provider_count) ? "bg-oker" : "bg-sage"}`}
                    style={{ width: `${(s.provider_count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-body-sm font-semibold text-warmzwart shrink-0">{s.provider_count}</span>
                <ArrowRight size={14} className="text-warmgrijs shrink-0" weight="bold" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {zwakkeSteden.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-oker bg-oker-light px-4 py-3">
          <Warning size={18} className="text-oker shrink-0 mt-0.5" weight="fill" />
          <p className="text-body-sm text-warmzwart">
            Lage dekking voor <b>{categorie.name}</b> in: {zwakkeSteden.map((s) => s.city).join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}

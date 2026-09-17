import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Buildings, Users, Warning, SealCheck, MapPin } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

interface CityRow {
  city: string;
  provider_count: number;
  category_count: number;
  providers_with_local_experience: number;
  providers_with_reviews: number;
}

export default async function AdminAanboddekkingPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: cityData } = await supabase
    .from("admin_provider_coverage_by_city")
    .select("*")
    .order("provider_count", { ascending: false });
  const steden: CityRow[] = ((cityData ?? []) as unknown as Record<string, string | number>[]).map((c) => ({
    city: String(c.city),
    provider_count: Number(c.provider_count ?? 0),
    category_count: Number(c.category_count ?? 0),
    providers_with_local_experience: Number(c.providers_with_local_experience ?? 0),
    providers_with_reviews: Number(c.providers_with_reviews ?? 0),
  }));

  const { count: categorieCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("type", "professional");

  // Kwaliteits-/volledigheidscijfers — over ALLE actieve providers, niet
  // per stad (§10: een los overzichtspaneel). Admin-client nodig omdat
  // we hier ook providers zónder werkgebied willen meetellen, die vallen
  // buiten de (RLS-vrije, want public_read) coverage-views niet weg maar
  // moeten wél apart zichtbaar zijn — vandaar een rechtstreekse telling.
  const admin = createAdminSupabase();
  const { data: alleProviders } = await admin
    .from("professional_profiles")
    .select("id, logo_url, bio, specialties, service_area_postcode, service_area_lat, user_id, verified");
  const { data: profielenStatus } = await admin.from("profiles").select("id, deactivated_at, deleted_at");
  const statusPerUser = new Map((profielenStatus ?? []).map((p) => [p.id, p]));

  const actieveProviders = (alleProviders ?? []).filter((p) => {
    const status = statusPerUser.get(p.user_id);
    return status && !status.deactivated_at && !status.deleted_at;
  });

  const zonderWerkgebied = actieveProviders.filter((p) => !p.service_area_postcode || p.service_area_lat == null);
  const totaalActief = actieveProviders.length;
  const pct = (n: number) => (totaalActief === 0 ? 0 : Math.round((n / totaalActief) * 100));

  const kwaliteit = {
    compleet: pct(actieveProviders.filter((p) => p.logo_url && p.bio && (p.specialties?.length ?? 0) > 0 && p.service_area_lat != null).length),
    logo: pct(actieveProviders.filter((p) => p.logo_url).length),
    beschrijving: pct(actieveProviders.filter((p) => p.bio).length),
    diensten: pct(actieveProviders.filter((p) => (p.specialties?.length ?? 0) > 0).length),
    werkgebied: pct(actieveProviders.filter((p) => p.service_area_lat != null).length),
    geverifieerd: pct(actieveProviders.filter((p) => p.verified).length),
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-display-sm text-warmzwart mb-1">Aanboddekking</h1>
      <p className="text-body-sm text-warmgrijs mb-8">
        Waar kunnen we bewoners activeren? Geteld op werkgebied — een provider gevestigd buiten een stad telt hier
        mee zodra zijn straal die stad bereikt, niet alleen op vestigingsadres.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Actieve providers</p>
          <p className="font-display text-display-sm text-warmzwart">{totaalActief}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Steden met dekking</p>
          <p className="font-display text-display-sm text-warmzwart">{steden.length}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Diensten totaal</p>
          <p className="font-display text-display-sm text-warmzwart">{categorieCount ?? "—"}</p>
        </div>
      </div>

      {zonderWerkgebied.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-oker bg-oker-light px-4 py-3 mb-8">
          <Warning size={18} className="text-oker shrink-0 mt-0.5" weight="fill" />
          <p className="text-body-sm text-warmzwart">
            <b>{zonderWerkgebied.length}</b> actieve {zonderWerkgebied.length === 1 ? "provider heeft" : "providers hebben"} geen
            bruikbaar werkgebied (postcode niet herkend of ontbreekt) en tellen daarom nergens hierboven mee.
          </p>
        </div>
      )}

      <h2 className="font-display text-display-sm text-warmzwart mb-1">Providerkwaliteit</h2>
      <p className="text-body-sm text-warmgrijs mb-4">Over alle {totaalActief} actieve providers.</p>
      <div className="card-flat p-5 mb-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          ["Compleet profiel", kwaliteit.compleet],
          ["Logo", kwaliteit.logo],
          ["Beschrijving", kwaliteit.beschrijving],
          ["Diensten", kwaliteit.diensten],
          ["Werkgebied", kwaliteit.werkgebied],
          ["Geverifieerd", kwaliteit.geverifieerd],
        ].map(([label, waarde]) => (
          <div key={label as string}>
            <p className="text-body-sm text-warmgrijs">{label}</p>
            <p className="font-display text-display-sm text-warmzwart">{waarde}%</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-display-sm text-warmzwart mb-4">Per stad</h2>
      {steden.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Nog geen providers met een herkend werkgebied.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {steden.map((s) => (
            <Link
              key={s.city}
              href={`/admin/aanboddekking/${encodeURIComponent(s.city)}`}
              className="card-flat p-5 flex items-center justify-between gap-4 no-underline hover:-translate-y-0.5 hover:shadow-medium transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center shrink-0">
                  <Buildings size={18} className="text-sage" weight="fill" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-[17px] text-warmzwart truncate">{s.city}</h3>
                  <div className="flex items-center gap-4 text-body-xs text-warmgrijs mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {s.provider_count} providers
                    </span>
                    <span>
                      {s.category_count}/{categorieCount ?? "?"} diensten vertegenwoordigd
                    </span>
                    {s.providers_with_local_experience > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {s.providers_with_local_experience} met lokale ervaring
                      </span>
                    )}
                    {s.providers_with_reviews > 0 && (
                      <span className="flex items-center gap-1">
                        <SealCheck size={13} />
                        {s.providers_with_reviews} met reviews
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-sage shrink-0" weight="bold" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

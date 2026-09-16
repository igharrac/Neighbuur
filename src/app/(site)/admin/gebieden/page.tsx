import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, House, Users, Buildings, MapPin } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { bepaalActiviteitsniveau, ACTIVITEIT_LABEL, ACTIVITEIT_KLASSE } from "@/lib/gebieden";

interface CityRow {
  city: string;
  residence_count: number;
  resident_account_count: number;
  cluster_count: number;
  community_count: number;
  new_residences_7d: number;
  new_residences_30d: number;
  new_residences_90d: number;
}

export default async function AdminGebiedenPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data } = await supabase.from("admin_city_overview").select("*");
  const steden: CityRow[] = ((data ?? []) as unknown as Record<string, string | number | null>[])
    .map((r) => ({
      city: String(r.city),
      residence_count: Number(r.residence_count ?? 0),
      resident_account_count: Number(r.resident_account_count ?? 0),
      cluster_count: Number(r.cluster_count ?? 0),
      community_count: Number(r.community_count ?? 0),
      new_residences_7d: Number(r.new_residences_7d ?? 0),
      new_residences_30d: Number(r.new_residences_30d ?? 0),
      new_residences_90d: Number(r.new_residences_90d ?? 0),
    }))
    .sort((a, b) => b.new_residences_30d - a.new_residences_30d || b.residence_count - a.residence_count);

  const totaalWoningen = steden.reduce((s, c) => s + c.residence_count, 0);
  const totaalNieuw30d = steden.reduce((s, c) => s + c.new_residences_30d, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-display-sm text-warmzwart mb-1">Gebieden</h1>
      <p className="text-body-sm text-warmgrijs mb-8">
        Waar ontstaat organische lokale dichtheid? Geteld op unieke woningen, niet accounts.
      </p>

      {steden.length === 0 ? (
        <div className="card-flat p-8 text-center">
          <p className="text-body text-warmgrijs">
            Nog geen bevestigde woningen met een bekende stad — zodra bewoners een adres bevestigen, verschijnen ze
            hier.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card-flat p-5">
              <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Steden</p>
              <p className="font-display text-display-sm text-warmzwart">{steden.length}</p>
            </div>
            <div className="card-flat p-5">
              <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Unieke woningen</p>
              <p className="font-display text-display-sm text-warmzwart">{totaalWoningen.toLocaleString("nl-NL")}</p>
            </div>
            <div className="card-flat p-5">
              <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Nieuw · 30d</p>
              <p className="font-display text-display-sm text-groen">+{totaalNieuw30d.toLocaleString("nl-NL")}</p>
            </div>
            <div className="card-flat p-5">
              <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Communities</p>
              <p className="font-display text-display-sm text-warmzwart">
                {steden.reduce((s, c) => s + c.community_count, 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {steden.map((s) => {
              const niveau = bepaalActiviteitsniveau(s.residence_count, s.new_residences_30d);
              return (
                <Link
                  key={s.city}
                  href={`/admin/gebieden/${encodeURIComponent(s.city)}`}
                  className="card-flat p-5 flex items-center justify-between gap-4 no-underline hover:-translate-y-0.5 hover:shadow-medium transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-terracotta" weight="fill" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-bold text-[17px] text-warmzwart truncate">{s.city}</h2>
                        <span className={`text-body-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ACTIVITEIT_KLASSE[niveau]}`}>
                          {ACTIVITEIT_LABEL[niveau]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-body-xs text-warmgrijs mt-1">
                        <span className="flex items-center gap-1">
                          <House size={13} />
                          {s.residence_count} {s.residence_count === 1 ? "woning" : "woningen"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          {s.resident_account_count} {s.resident_account_count === 1 ? "account" : "accounts"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Buildings size={13} />
                          {s.cluster_count} {s.cluster_count === 1 ? "cluster" : "clusters"} · {s.community_count}{" "}
                          {s.community_count === 1 ? "community" : "communities"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-body-xs text-warmgrijs">7d / 30d / 90d</p>
                      <p className="text-body-sm font-semibold text-warmzwart">
                        +{s.new_residences_7d} / +{s.new_residences_30d} / +{s.new_residences_90d}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-terracotta" weight="bold" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

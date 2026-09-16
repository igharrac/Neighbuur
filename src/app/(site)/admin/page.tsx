import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { TrendSparkline } from "@/components/admin/TrendSparkline";

const currency = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

function growth(current: number, past: number | undefined) {
  if (past === undefined) return null;
  return current - past;
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span className={`text-body-xs font-semibold ${positive ? "text-groen" : "text-sage"}`}>
      {positive ? "+" : ""}
      {value}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: snapshots } = await supabase
    .from("platform_stats_daily")
    .select("*")
    .order("snapshot_date", { ascending: false })
    .limit(30);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-display-sm text-warmzwart mb-2">Platform-cijfers</h1>
        <p className="text-body text-warmgrijs">
          Nog geen cijfers beschikbaar — de dagelijkse platform-stats cron moet minimaal één keer gedraaid hebben.
        </p>
      </div>
    );
  }

  const latest = snapshots[0];
  const chronological = [...snapshots].reverse();
  const weekAgo = snapshots.find((s) => s.snapshot_date <= sevenDaysAgo());
  const monthAgo = snapshots.find((s) => s.snapshot_date <= thirtyDaysAgo());

  function sevenDaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }
  function thirtyDaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }

  const residentGrowthWeek = growth(latest.resident_count, weekAgo?.resident_count);
  const professionalGrowthWeek = growth(latest.professional_count, weekAgo?.professional_count);
  const residentGrowthMonth = growth(latest.resident_count, monthAgo?.resident_count);
  const professionalGrowthMonth = growth(latest.professional_count, monthAgo?.professional_count);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-display-sm text-warmzwart mb-1">Platform-cijfers</h1>
      <p className="text-body-sm text-warmgrijs mb-8">
        Peildatum {new Date(latest.snapshot_date).toLocaleDateString("nl-NL")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-flat p-6">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-3">
            Bewoners & vakmensen
          </p>
          <p className="font-display text-display-sm text-warmzwart">{latest.resident_count.toLocaleString("nl-NL")}</p>
          <p className="text-body-sm text-warmgrijs mb-1">bewoners</p>
          <p className="font-display text-display-sm text-warmzwart mt-3">
            {latest.professional_count.toLocaleString("nl-NL")}
          </p>
          <p className="text-body-sm text-warmgrijs mb-1">
            vakmensen{" "}
            <span className="text-warmgrijs-dark">
              ({latest.verified_professional_count.toLocaleString("nl-NL")} geverifieerd)
            </span>
          </p>
          <div className="flex items-center gap-3 mt-4 text-warmgrijs">
            <TrendSparkline values={chronological.map((s) => s.resident_count + s.professional_count)} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-body-xs text-warmgrijs">
            <span>
              7d <GrowthBadge value={residentGrowthWeek !== null && professionalGrowthWeek !== null ? residentGrowthWeek + professionalGrowthWeek : null} />
            </span>
            <span>
              30d <GrowthBadge value={residentGrowthMonth !== null && professionalGrowthMonth !== null ? residentGrowthMonth + professionalGrowthMonth : null} />
            </span>
          </div>
        </div>

        <div className="card-flat p-6">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-3">Communities</p>
          <p className="font-display text-display-sm text-warmzwart">{latest.active_community_count.toLocaleString("nl-NL")}</p>
          <p className="text-body-sm text-warmgrijs mb-1">actief</p>
          <p className="text-body-sm text-warmgrijs-dark">{latest.dormant_community_count.toLocaleString("nl-NL")} slapend</p>
          <p className="text-body-sm text-warmgrijs mt-3">
            gem. {latest.avg_members_per_community.toFixed(1)} leden / community
          </p>
          <div className="mt-4 text-warmgrijs">
            <TrendSparkline values={chronological.map((s) => s.active_community_count)} />
          </div>
        </div>

        <div className="card-flat p-6">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-3">Boekingen & omzet</p>
          <p className="font-display text-display-sm text-warmzwart">{latest.bookings_total.toLocaleString("nl-NL")}</p>
          <p className="text-body-sm text-warmgrijs mb-1">boekingen ({latest.bookings_completed.toLocaleString("nl-NL")} afgerond)</p>
          <p className="font-display text-display-sm text-warmzwart mt-3">{currency.format(Number(latest.revenue_total_cents) / 100)}</p>
          <p className="text-body-sm text-warmgrijs mb-1">omzet (afgeronde boekingen)</p>
          <div className="mt-4 text-warmgrijs">
            <TrendSparkline values={chronological.map((s) => Number(s.revenue_total_cents))} />
          </div>
        </div>
      </div>
    </div>
  );
}

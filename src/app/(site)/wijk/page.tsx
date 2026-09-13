import Link from "next/link";
import { ArrowRight, MapPin, House } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { WijkZoeken } from "@/components/features/community/WijkZoeken";

interface WijkRow {
  id: string;
  name: string;
  slug: string;
  city: string;
  postal_code: string | null;
  home_count: number | null;
}

interface CommunityRow {
  name: string;
  slug: string;
  district_id: string;
}

export default async function WijkIndexPage() {
  const supabase = createServerSupabase();

  const { data: wijkenData } = await supabase
    .from("districts")
    .select("id, name, slug, city, postal_code, home_count")
    .eq("active", true)
    .order("name");
  const wijken = (wijkenData ?? []) as WijkRow[];

  const { data: communitiesData } = await supabase.from("communities").select("name, slug, district_id").eq("active", true);
  const communities = (communitiesData ?? []) as CommunityRow[];

  const communitiesPerWijk = new Map<string, number>();
  communities.forEach((c) => communitiesPerWijk.set(c.district_id, (communitiesPerWijk.get(c.district_id) ?? 0) + 1));

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="max-w-[640px] mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdbcf] px-4 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#a73400]" />
            <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
              Mijn wijk
            </span>
          </span>
          <h1 className="font-display font-bold text-[38px] sm:text-[48px] leading-[44px] sm:leading-[54px] text-warmzwart mb-3">
            Wat gebeurt er al rondom{" "}
            <span className="italic text-terracotta [text-decoration-line:underline] [text-decoration-style:wavy] [text-decoration-color:#ffdbcf] [text-underline-position:from-font]">
              jouw nieuwe woning
            </span>
            ?
          </h1>
          <p className="font-body text-[16px] leading-[24px] text-warmgrijs-dark mb-6">
            Zoek je postcode, wijk of nieuwbouwproject en ontdek welke buren er al zijn, welke vakmensen actief zijn
            en welke wijkdeals lopen.
          </p>
          <WijkZoeken
            wijken={wijken.map((w) => ({ naam: w.name, slug: w.slug, stad: w.city, postcode: w.postal_code }))}
            communities={communities.map((c) => ({
              naam: c.name,
              slug: c.slug,
              wijkNaam: wijken.find((w) => w.id === c.district_id)?.name ?? "",
            }))}
          />
        </div>

        <h2 className="font-display font-bold text-[22px] text-warmzwart mb-5">Actieve wijken</h2>

        {wijken.length === 0 ? (
          <p className="font-body text-[15px] text-warmgrijs">Nog geen actieve wijken bekend.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wijken.map((w) => (
              <Link
                key={w.id}
                href={`/wijk/${w.slug}`}
                className="bg-white rounded-2xl p-6 no-underline shadow-[0px_4px_10px_rgba(92,64,40,0.04)] hover:-translate-y-0.5 hover:shadow-[0px_8px_15px_rgba(92,64,40,0.08)] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-display font-bold text-[19px] text-warmzwart">{w.name}</h3>
                  <ArrowRight size={16} className="text-terracotta shrink-0 mt-1" weight="bold" />
                </div>
                <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5 mb-1">
                  <MapPin size={14} />
                  {w.city}
                  {w.postal_code && ` · ${w.postal_code}`}
                </p>
                {w.home_count != null && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5">
                    <House size={14} />
                    {w.home_count} woningen
                  </p>
                )}
                <p className="font-body font-semibold text-[13px] text-terracotta mt-3">
                  {communitiesPerWijk.get(w.id) ?? 0} {communitiesPerWijk.get(w.id) === 1 ? "actief blok" : "actieve blokken"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

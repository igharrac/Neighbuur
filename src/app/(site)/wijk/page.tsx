import Link from "next/link";
import { ArrowRight, MapPin, House, Users, Star, Tag, HandWaving } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { WijkZoeken } from "@/components/features/community/WijkZoeken";

type EigenPlekje =
  | {
      type: "community";
      name: string;
      slug: string;
      street: string | null;
      city: string | null;
      residenceCount: number;
      memberCount: number;
      reviewCount: number;
      activeDeals: number;
    }
  | {
      type: "vroeg";
      street: string | null;
      city: string | null;
      telling: number;
    };

interface WijkRow {
  id: string;
  name: string;
  slug: string;
  city: string;
  postal_code: string | null;
  home_count: number | null;
}

interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  development_id: string | null;
  city: string | null;
  residence_count: number;
  member_count: number;
}

/**
 * Eén kaart in de "Actieve gebieden"-grid — kan een development zijn
 * (bestaand gedrag) óf een community zonder development (nieuw, additief).
 * Beide krijgen hetzelfde kaart-uiterlijk, alleen de bestemming verschilt:
 * een development linkt naar /wijk/[slug] (kan meerdere communities
 * bevatten), een standalone community linkt direct naar /community/[slug]
 * (er is geen /wijk-equivalent voor een los cluster).
 */
interface GebiedKaart {
  key: string;
  href: string;
  title: string;
  city: string | null;
  postalCode: string | null;
  homeCount: number | null;
  subMetric: string;
}

export default async function WijkIndexPage() {
  const supabase = createServerSupabase();

  // Gepersonaliseerde sectie: alleen voor ingelogde bewoners met een
  // bevestigde woning. Uitgelogde/adresloze bezoekers zien onveranderd
  // de generieke, doorzoekbare directory hieronder.
  let eigenPlekje: EigenPlekje | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: bewonerProfiel } = await supabase
      .from("resident_profiles")
      .select("community_id, current_residence_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (bewonerProfiel?.current_residence_id) {
      const { data: residence } = await supabase
        .from("residences")
        .select("residential_cluster_id, address_id")
        .eq("id", bewonerProfiel.current_residence_id)
        .maybeSingle();

      let street: string | null = null;
      let city: string | null = null;
      if (residence?.address_id) {
        const { data: address } = await supabase.from("addresses").select("street, city").eq("id", residence.address_id).maybeSingle();
        street = address?.street ?? null;
        city = address?.city ?? null;
      }

      if (bewonerProfiel.community_id) {
        const { data: community } = await supabase
          .from("community_overview")
          .select("name, slug, member_count, review_count, active_deals, residence_count")
          .eq("id", bewonerProfiel.community_id)
          .maybeSingle();
        if (community?.name && community.slug) {
          eigenPlekje = {
            type: "community",
            name: community.name,
            slug: community.slug,
            street,
            city,
            residenceCount: Number(community.residence_count ?? 0),
            memberCount: Number(community.member_count ?? 0),
            reviewCount: Number(community.review_count ?? 0),
            activeDeals: Number(community.active_deals ?? 0),
          };
        }
      } else if (residence?.residential_cluster_id) {
        const { data: telling } = await supabase.rpc("count_residences_in_cluster", { p_cluster_id: residence.residential_cluster_id });
        eigenPlekje = { type: "vroeg", street, city, telling: typeof telling === "number" ? telling : 1 };
      }
    }
  }

  const { data: wijkenData } = await supabase
    .from("developments")
    .select("id, name, slug, city, postal_code, home_count")
    .eq("active", true)
    .order("name");
  const wijken = (wijkenData ?? []) as WijkRow[];

  const { data: communitiesData } = await supabase
    .from("community_overview")
    .select("id, name, slug, type, development_id, city, residence_count, member_count")
    .eq("active", true);
  const communities = (communitiesData ?? []).map((c) => ({
    id: c.id!,
    name: c.name!,
    slug: c.slug!,
    type: c.type!,
    development_id: c.development_id,
    city: c.city,
    residence_count: Number(c.residence_count ?? 0),
    member_count: Number(c.member_count ?? 0),
  })) as CommunityRow[];

  const communitiesPerWijk = new Map<string, number>();
  communities.forEach((c) => {
    if (!c.development_id) return;
    communitiesPerWijk.set(c.development_id, (communitiesPerWijk.get(c.development_id) ?? 0) + 1);
  });

  // ── Gebieden-grid: bestaande developments + communities zonder
  // development (bestaande flats/complexen/blokken) — additief naast
  // elkaar, geen van beide vervangt de ander.
  const developmentKaarten: GebiedKaart[] = wijken.map((w) => ({
    key: `dev-${w.id}`,
    href: `/wijk/${w.slug}`,
    title: w.name,
    city: w.city,
    postalCode: w.postal_code,
    homeCount: w.home_count,
    subMetric: `${communitiesPerWijk.get(w.id) ?? 0} ${communitiesPerWijk.get(w.id) === 1 ? "actief blok" : "actieve blokken"}`,
  }));

  const standaloneKaarten: GebiedKaart[] = communities
    .filter((c) => !c.development_id)
    .map((c) => ({
      key: `comm-${c.id}`,
      href: `/community/${c.slug}`,
      title: c.name,
      city: c.city,
      postalCode: null,
      homeCount: c.residence_count || null,
      subMetric: `${c.member_count} ${c.member_count === 1 ? "bewoner" : "bewoners"} aangesloten`,
    }));

  const gebiedenKaarten = [...developmentKaarten, ...standaloneKaarten];

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
            <span className="italic text-terracotta">jouw woning</span>?
          </h1>
          <p className="font-body text-[16px] leading-[24px] text-warmgrijs-dark mb-6">
            Zoek je postcode, buurt of nieuwbouwproject en ontdek welke buren er al zijn — in een nieuwbouwproject,
            een bestaande flat, een appartementencomplex of gewoon jouw straat.
          </p>
          <WijkZoeken
            districts={wijken.map((w) => ({ name: w.name, slug: w.slug, stad: w.city, postcode: w.postal_code }))}
            communities={communities.map((c) => ({
              name: c.name,
              slug: c.slug,
              districtName: wijken.find((w) => w.id === c.development_id)?.name ?? "",
            }))}
          />
        </div>

        {eigenPlekje && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-[22px] text-warmzwart mb-5">Jouw omgeving</h2>
            {eigenPlekje.type === "community" ? (
              <Link
                href={`/community/${eigenPlekje.slug}`}
                className="block bg-white rounded-2xl p-6 no-underline shadow-[0px_4px_10px_rgba(92,64,40,0.04)] hover:-translate-y-0.5 hover:shadow-[0px_8px_15px_rgba(92,64,40,0.08)] transition-all max-w-[560px]"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-bold text-[20px] text-warmzwart">{eigenPlekje.name}</h3>
                  <ArrowRight size={16} className="text-terracotta shrink-0 mt-1" weight="bold" />
                </div>
                {(eigenPlekje.street || eigenPlekje.city) && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5 mb-4">
                    <MapPin size={14} />
                    {[eigenPlekje.street, eigenPlekje.city].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-5 font-body text-[13px] text-warmgrijs">
                  <span className="flex items-center gap-1.5">
                    <House size={15} />
                    {eigenPlekje.residenceCount} {eigenPlekje.residenceCount === 1 ? "woning" : "woningen"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={15} />
                    {eigenPlekje.memberCount} bewoners
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star size={15} />
                    {eigenPlekje.reviewCount} reviews
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag size={15} />
                    {eigenPlekje.activeDeals} acties
                  </span>
                </div>
              </Link>
            ) : eigenPlekje.telling <= 1 ? (
              <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_10px_rgba(92,64,40,0.04)] max-w-[560px]">
                <div className="flex items-center gap-2 mb-2">
                  <HandWaving size={18} className="text-terracotta" weight="fill" />
                  <h3 className="font-display font-bold text-[18px] text-warmzwart">Goed om je erbij te hebben</h3>
                </div>
                {(eigenPlekje.street || eigenPlekje.city) && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5 mb-3">
                    <MapPin size={14} />
                    {[eigenPlekje.street, eigenPlekje.city].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="font-body text-[15px] text-warmzwart mb-4">
                  Je bent een van de eerste Neighbuur-bewoners in jouw omgeving. Je kunt Neighbuur gewoon gebruiken —
                  zodra meer buren aansluiten, laten we je zien wat jullie samen kunnen regelen.
                </p>
                <Link href="/diensten" className="btn-secondary inline-flex">
                  Ontdek diensten
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_10px_rgba(92,64,40,0.04)] max-w-[560px]">
                <div className="flex items-center gap-2 mb-2">
                  <House size={18} className="text-terracotta" weight="fill" />
                  <h3 className="font-display font-bold text-[18px] text-warmzwart">Je buurt begint te groeien</h3>
                </div>
                {(eigenPlekje.street || eigenPlekje.city) && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5 mb-3">
                    <MapPin size={14} />
                    {[eigenPlekje.street, eigenPlekje.city].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="font-body text-[15px] text-warmzwart">
                  Er zijn inmiddels {eigenPlekje.telling} woningen uit jouw omgeving actief op Neighbuur. Zodra er
                  genoeg buren zijn, kunnen jullie samen een community starten via{" "}
                  <Link href="/plan" className="text-terracotta underline">
                    Mijn Plan
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        )}

        <h2 className="font-display font-bold text-[22px] text-warmzwart mb-5">Actieve gebieden</h2>

        {gebiedenKaarten.length === 0 ? (
          <p className="font-body text-[15px] text-warmgrijs">Nog geen actieve gebieden bekend.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gebiedenKaarten.map((k) => (
              <Link
                key={k.key}
                href={k.href}
                className="bg-white rounded-2xl p-6 no-underline shadow-[0px_4px_10px_rgba(92,64,40,0.04)] hover:-translate-y-0.5 hover:shadow-[0px_8px_15px_rgba(92,64,40,0.08)] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-display font-bold text-[19px] text-warmzwart">{k.title}</h3>
                  <ArrowRight size={16} className="text-terracotta shrink-0 mt-1" weight="bold" />
                </div>
                {(k.city || k.postalCode) && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5 mb-1">
                    <MapPin size={14} />
                    {k.city}
                    {k.postalCode && ` · ${k.postalCode}`}
                  </p>
                )}
                {k.homeCount != null && (
                  <p className="font-body text-[13px] text-warmgrijs flex items-center gap-1.5">
                    <House size={14} />
                    {k.homeCount} woningen
                  </p>
                )}
                <p className="font-body font-semibold text-[13px] text-terracotta mt-3">{k.subMetric}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

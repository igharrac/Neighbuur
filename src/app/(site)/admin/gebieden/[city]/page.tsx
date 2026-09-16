import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, House, Users, Buildings, Star, Tag, ChartBar, Info } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { bepaalActiviteitsniveau, ACTIVITEIT_LABEL, ACTIVITEIT_KLASSE } from "@/lib/gebieden";

interface ClusterRow {
  cluster_id: string;
  cluster_name: string | null;
  cluster_type: string;
  development_name: string | null;
  residence_count: number;
  resident_account_count: number;
  community_count: number;
  new_residences_30d: number;
  topCategorie: DienstTelling | null;
}

interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  residence_count: number;
  member_count: number;
  review_count: number;
  active_deals: number;
}

interface DienstTelling {
  categorieNaam: string;
  aantal: number;
}

/**
 * "Meest gevraagde diensten" — best-effort afgeleid uit bookings, niet
 * uit een apart behoefte-signaal (dat bestaat niet, en wordt in deze
 * fase bewust niet gebouwd). Een booking is een concreet verzoek aan
 * een specifieke vakman, geen live "ik heb hier interesse in"-vlag —
 * geannuleerde boekingen tellen daarom niet mee, maar dit blijft
 * historische vraag, geen actuele behoefte. Zie opleverrapport.
 */
async function laadMeestGevraagdeDiensten(residenceIds: string[]): Promise<DienstTelling[]> {
  if (residenceIds.length === 0) return [];
  const admin = createAdminSupabase();

  const { data: bewoners } = await admin
    .from("resident_profiles")
    .select("user_id")
    .in("current_residence_id", residenceIds);
  const userIds = (bewoners ?? []).map((b) => b.user_id);
  if (userIds.length === 0) return [];

  const { data: boekingen } = await admin
    .from("bookings")
    .select("category_id, categories(name_nl)")
    .in("customer_id", userIds)
    .neq("status", "cancelled")
    .not("category_id", "is", null);

  const telling = new Map<string, number>();
  for (const b of (boekingen ?? []) as unknown as { category_id: string | null; categories: { name_nl: string } | null }[]) {
    const naam = b.categories?.name_nl;
    if (!naam) continue;
    telling.set(naam, (telling.get(naam) ?? 0) + 1);
  }

  return [...telling.entries()]
    .map(([categorieNaam, aantal]) => ({ categorieNaam, aantal }))
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, 6);
}

/**
 * Zelfde bron als laadMeestGevraagdeDiensten, maar op cluster- i.p.v.
 * stad-niveau — de granulariteit die de roadmap bedoelt met "3 buren
 * willen een hovenier" (Fase 2). Alleen de populairste categorie, voor
 * een compacte hint per cluster-rij.
 */
async function laadTopCategorieVoorCluster(clusterId: string): Promise<DienstTelling | null> {
  const admin = createAdminSupabase();
  const { data: residences } = await admin.from("residences").select("id").eq("residential_cluster_id", clusterId);
  const top = await laadMeestGevraagdeDiensten((residences ?? []).map((r) => r.id));
  return top[0] ?? null;
}

export default async function AdminGebiedPage({ params }: { params: { city: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const cityName = decodeURIComponent(params.city);

  const { data: cityRowRaw } = await supabase.from("admin_city_overview").select("*").eq("city", cityName).maybeSingle();
  if (!cityRowRaw) notFound();

  const cityRow = {
    city: String(cityRowRaw.city),
    residence_count: Number(cityRowRaw.residence_count ?? 0),
    resident_account_count: Number(cityRowRaw.resident_account_count ?? 0),
    cluster_count: Number(cityRowRaw.cluster_count ?? 0),
    community_count: Number(cityRowRaw.community_count ?? 0),
    new_residences_7d: Number(cityRowRaw.new_residences_7d ?? 0),
    new_residences_30d: Number(cityRowRaw.new_residences_30d ?? 0),
    new_residences_90d: Number(cityRowRaw.new_residences_90d ?? 0),
  };

  const { data: clusterData } = await supabase.from("admin_cluster_overview").select("*").eq("city", cityName);
  const clustersZonderVraag = ((clusterData ?? []) as unknown as Record<string, string | number | null>[])
    .map((c) => ({
      cluster_id: String(c.cluster_id),
      cluster_name: c.cluster_name as string | null,
      cluster_type: String(c.cluster_type),
      development_name: c.development_name as string | null,
      residence_count: Number(c.residence_count ?? 0),
      resident_account_count: Number(c.resident_account_count ?? 0),
      community_count: Number(c.community_count ?? 0),
      new_residences_30d: Number(c.new_residences_30d ?? 0),
    }))
    .sort((a, b) => b.residence_count - a.residence_count);

  const clusters: ClusterRow[] = await Promise.all(
    clustersZonderVraag.map(async (c) => ({ ...c, topCategorie: await laadTopCategorieVoorCluster(c.cluster_id) }))
  );

  const overigeWoningen = Math.max(0, cityRow.residence_count - clusters.reduce((s, c) => s + c.residence_count, 0));

  const { data: communityData } = await supabase
    .from("community_overview")
    .select("id, name, slug, type, residence_count, member_count, review_count, active_deals")
    .eq("city", cityName)
    .eq("active", true);
  const communities: CommunityRow[] = (communityData ?? []).map((c) => ({
    id: c.id!,
    name: c.name!,
    slug: c.slug!,
    type: c.type!,
    residence_count: Number(c.residence_count ?? 0),
    member_count: Number(c.member_count ?? 0),
    review_count: Number(c.review_count ?? 0),
    active_deals: Number(c.active_deals ?? 0),
  }));

  // Woning-ID's voor deze stad — nodig voor de diensten-telling. Kan niet
  // in één PostgREST-query via de coalesce(address.city, development.city)
  // die de views gebruiken, dus apart via de admin-client opgehaald
  // (zelfde aanpak als /api/community/meld-drempel).
  const admin = createAdminSupabase();
  const { data: addrIds } = await admin.from("addresses").select("id").ilike("city", cityName);
  const { data: devIds } = await admin.from("developments").select("id").ilike("city", cityName);
  const addressIdList = (addrIds ?? []).map((a) => a.id);
  const developmentIdList = (devIds ?? []).map((d) => d.id);

  let residenceIds: string[] = [];
  if (addressIdList.length > 0) {
    const { data } = await admin.from("residences").select("id").in("address_id", addressIdList);
    residenceIds = residenceIds.concat((data ?? []).map((r) => r.id));
  }
  if (developmentIdList.length > 0) {
    const { data } = await admin.from("residences").select("id").in("development_id", developmentIdList).is("address_id", null);
    residenceIds = residenceIds.concat((data ?? []).map((r) => r.id));
  }
  const diensten = await laadMeestGevraagdeDiensten([...new Set(residenceIds)]);

  const niveau = bepaalActiviteitsniveau(cityRow.residence_count, cityRow.new_residences_30d);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin/gebieden" className="text-body-sm text-warmgrijs hover:text-terracotta inline-flex items-center gap-1.5 mb-4">
        <ArrowLeft size={14} weight="bold" />
        Alle gebieden
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-display-sm text-warmzwart">{cityRow.city}</h1>
        <span className={`text-body-xs font-semibold px-2.5 py-1 rounded-full ${ACTIVITEIT_KLASSE[niveau]}`}>
          {ACTIVITEIT_LABEL[niveau]}
        </span>
      </div>
      <p className="text-body-sm text-warmgrijs mb-8">Geteld op unieke woningen, niet accounts.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Unieke woningen</p>
          <p className="font-display text-display-sm text-warmzwart">{cityRow.residence_count}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Resident accounts</p>
          <p className="font-display text-display-sm text-warmzwart">{cityRow.resident_account_count}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Communities</p>
          <p className="font-display text-display-sm text-warmzwart">{cityRow.community_count}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs mb-1">Groei 7d / 30d / 90d</p>
          <p className="font-display text-display-sm text-groen">
            +{cityRow.new_residences_7d} / +{cityRow.new_residences_30d} / +{cityRow.new_residences_90d}
          </p>
        </div>
      </div>

      <h2 className="font-display font-bold text-[19px] text-warmzwart mb-4 flex items-center gap-2">
        <Buildings size={18} className="text-terracotta" weight="fill" />
        Residential clusters
      </h2>
      {clusters.length === 0 ? (
        <p className="text-body-sm text-warmgrijs mb-8">Geen clusters — alle woningen in deze stad staan los.</p>
      ) : (
        <div className="card-flat overflow-hidden mb-3 !p-0">
          <div className="divide-y divide-lijn">
            {clusters.map((c) => {
              const clusterNiveau = bepaalActiviteitsniveau(c.residence_count, c.new_residences_30d);
              return (
                <div key={c.cluster_id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-[14px] text-warmzwart truncate">
                      {c.cluster_name ?? "Naamloos cluster"}
                      <span className="font-normal text-warmgrijs"> · {c.cluster_type}</span>
                      {c.development_name && <span className="font-normal text-warmgrijs"> · {c.development_name}</span>}
                    </p>
                    <p className="text-body-xs text-warmgrijs mt-0.5">
                      {c.resident_account_count} {c.resident_account_count === 1 ? "account" : "accounts"} ·{" "}
                      {c.community_count} {c.community_count === 1 ? "community" : "communities"}
                      {c.new_residences_30d > 0 && ` · +${c.new_residences_30d} laatste 30d`}
                    </p>
                    {c.topCategorie && (
                      <p className="text-body-xs text-terracotta mt-1 flex items-center gap-1">
                        <ChartBar size={12} weight="bold" />
                        Populair: {c.topCategorie.categorieNaam} ({c.topCategorie.aantal}×)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-body-xs font-semibold px-2 py-0.5 rounded-full ${ACTIVITEIT_KLASSE[clusterNiveau]}`}>
                      {ACTIVITEIT_LABEL[clusterNiveau]}
                    </span>
                    <span className="flex items-center gap-1 text-body-sm font-semibold text-warmzwart">
                      <House size={14} />
                      {c.residence_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {overigeWoningen > 0 && (
        <p className="text-body-xs text-warmgrijs mb-8">
          + {overigeWoningen} {overigeWoningen === 1 ? "woning" : "woningen"} zonder clusterrelatie (los adres, geen BAG-pand-koppeling)
        </p>
      )}

      <h2 className="font-display font-bold text-[19px] text-warmzwart mb-4 flex items-center gap-2 mt-6">
        <Users size={18} className="text-terracotta" weight="fill" />
        Communities
      </h2>
      {communities.length === 0 ? (
        <p className="text-body-sm text-warmgrijs mb-8">Nog geen community in deze stad.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/community/${c.slug}`}
              className="card-flat p-4 no-underline hover:-translate-y-0.5 hover:shadow-medium transition-all"
            >
              <p className="font-body font-bold text-[15px] text-warmzwart">{c.name}</p>
              <p className="text-body-xs text-warmgrijs mb-2">{c.type}</p>
              <div className="flex items-center gap-4 text-body-xs text-warmgrijs">
                <span className="flex items-center gap-1">
                  <House size={13} />
                  {c.residence_count}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {c.member_count}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={13} />
                  {c.review_count}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={13} />
                  {c.active_deals}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="font-display font-bold text-[19px] text-warmzwart mb-2 flex items-center gap-2 mt-6">
        <ChartBar size={18} className="text-terracotta" weight="fill" />
        Meest gevraagde diensten
      </h2>
      <p className="text-body-xs text-warmgrijs flex items-start gap-1.5 mb-4 max-w-[560px]">
        <Info size={14} className="shrink-0 mt-0.5" />
        Gebaseerd op boekingen van bewoners in deze stad — een historisch signaal, geen live behoefte-peiling.
      </p>
      {diensten.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Nog geen boekingen om op te tellen in deze stad.</p>
      ) : (
        <div className="card-flat p-5 max-w-[480px]">
          <div className="flex flex-col gap-2.5">
            {diensten.map((d) => {
              const maxAantal = diensten[0].aantal;
              return (
                <div key={d.categorieNaam} className="flex items-center gap-3">
                  <span className="text-body-sm text-warmzwart w-32 shrink-0 truncate">{d.categorieNaam}</span>
                  <div className="flex-1 h-2 rounded-full bg-sand overflow-hidden">
                    <div className="h-full rounded-full bg-terracotta" style={{ width: `${(d.aantal / maxAantal) * 100}%` }} />
                  </div>
                  <span className="text-body-sm font-semibold text-warmzwart w-6 text-right shrink-0">{d.aantal}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

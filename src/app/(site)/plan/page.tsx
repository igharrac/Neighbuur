import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkle,
  Clock,
  CheckCircle,
  SealCheck,
  ArrowRight,
  Users,
  ChatCircle,
  Tag,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resolveGesprekPartner } from "@/lib/chat";
import { BookingStatusBadge } from "@/components/features/booking/BookingStatusBadge";
import { CommunityDetectieKaart, type DetectieResultaat } from "@/components/features/community/CommunityDetectieKaart";
import type { BoekingStatus } from "@/types";

interface BoekingRij {
  id: string;
  status: BoekingStatus;
  omschrijving: string | null;
  datum: string | null;
  created_at: string;
  vakman: { bedrijfsnaam: string; slug: string } | null;
  categorieNaam: string | null;
}

function formatDatum(datum: string | null): string | null {
  if (!datum) return null;
  return new Date(datum).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}

export default async function PlanPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/plan");

  const { data: profiel } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
  const voornaam = (profiel?.name ?? "buur").split(" ")[0];

  const { data: bewonerProfiel } = await supabase
    .from("resident_profiles")
    .select("community_id, district_id, postal_code, show_community_suggestions")
    .eq("user_id", user.id)
    .maybeSingle();

  let community: { naam: string; slug: string; aantal_leden: number; wijk_naam: string | null } | null = null;
  if (bewonerProfiel?.community_id) {
    const { data: c } = await supabase
      .from("community_overzicht")
      .select("naam, slug, aantal_leden, wijk_naam")
      .eq("id", bewonerProfiel.community_id)
      .maybeSingle();
    if (c) community = { naam: c.naam!, slug: c.slug!, aantal_leden: Number(c.aantal_leden ?? 0), wijk_naam: c.wijk_naam };
  }

  // Geen community? Dan proberen we buren te detecteren (organische
  // communityvorming) — alleen mogelijk als er een postcode bekend is
  // (oudere/demo-accounts zonder adres slaan dit gewoon over).
  let detectie: DetectieResultaat | null = null;
  if (!community && bewonerProfiel?.district_id && bewonerProfiel?.postal_code && bewonerProfiel.show_community_suggestions !== false) {
    const { data: bestaande } = await supabase
      .from("communities")
      .select("id, naam, slug")
      .eq("district_id", bewonerProfiel.district_id)
      .eq("postcode_cluster", bewonerProfiel.postal_code)
      .neq("status", "slapend")
      .maybeSingle();

    if (bestaande) {
      detectie = { type: "bestaande", naam: bestaande.naam, slug: bestaande.slug, communityId: bestaande.id };
    } else {
      const { data: wijkRow } = await supabase
        .from("districts")
        .select("community_threshold")
        .eq("id", bewonerProfiel.district_id)
        .maybeSingle();
      const { data: telling } = await supabase.rpc("count_residents_in_cluster", {
        p_wijk_id: bewonerProfiel.district_id,
        p_postcode: bewonerProfiel.postal_code,
        p_gebouw_label: null,
      });
      const threshold = wijkRow?.community_threshold ?? 3;
      const count = typeof telling === "number" ? telling : 1;
      detectie =
        count >= threshold
          ? { type: "drempel", postcode: bewonerProfiel.postal_code, telling: count, threshold, wijkId: bewonerProfiel.district_id }
          : { type: "vroeg", threshold };
    }
  }

  const { data: boekingenData } = await supabase
    .from("bookings")
    .select("id, status, description, date, created_at, professional_profiles(company_name, slug), categories(name_nl)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const boekingen: BoekingRij[] = ((boekingenData ?? []) as unknown as {
    id: string;
    status: BoekingStatus;
    description: string | null;
    date: string | null;
    created_at: string;
    professional_profiles: { company_name: string; slug: string } | null;
    categories: { name_nl: string } | null;
  }[]).map((b) => ({
    id: b.id,
    status: b.status,
    omschrijving: b.description,
    datum: b.date,
    created_at: b.created_at,
    vakman: b.professional_profiles ? { bedrijfsnaam: b.professional_profiles.company_name, slug: b.professional_profiles.slug } : null,
    categorieNaam: b.categories?.name_nl ?? null,
  }));

  const inAfwachting = boekingen.filter((b) => b.status === "requested");
  const bevestigd = boekingen.filter((b) => b.status === "confirmed");
  const afgesloten = boekingen.filter((b) => b.status === "completed" || b.status === "cancelled");
  const totaal = boekingen.length;
  const geregeld = bevestigd.length + boekingen.filter((b) => b.status === "completed").length;
  const leeg = totaal === 0;

  const groepskortingen: {
    id: string;
    titel: string;
    beschrijving: string | null;
    minDeelnemers: number;
    prijsNormaal: number | null;
    prijsGroep: number | null;
    deelnemers: number;
    meegedaan: boolean;
  }[] = [];
  if (bewonerProfiel?.community_id) {
    const { data: gk } = await supabase
      .from("groepskortingen")
      .select("id, titel_nl, beschrijving_nl, min_deelnemers, prijs_normaal, prijs_groep")
      .eq("community_id", bewonerProfiel.community_id)
      .eq("actief", true);

    for (const deal of gk ?? []) {
      const { count } = await supabase
        .from("groepskorting_deelnemers")
        .select("id", { count: "exact", head: true })
        .eq("groepskorting_id", deal.id);
      const { data: eigen } = await supabase
        .from("groepskorting_deelnemers")
        .select("id")
        .eq("groepskorting_id", deal.id)
        .eq("user_id", user.id)
        .maybeSingle();
      groepskortingen.push({
        id: deal.id,
        titel: deal.titel_nl,
        beschrijving: deal.beschrijving_nl,
        minDeelnemers: deal.min_deelnemers,
        prijsNormaal: deal.prijs_normaal,
        prijsGroep: deal.prijs_groep,
        deelnemers: count ?? 0,
        meegedaan: !!eigen,
      });
    }
  }

  let buurtreviews: { id: string; tekst: string; auteur_naam: string; reactie_bedrijf: string | null }[] = [];
  if (bewonerProfiel?.community_id) {
    const { data: r } = await supabase
      .from("review_compleet")
      .select("id, text, author_name, reply_company, created_at")
      .eq("community_id", bewonerProfiel.community_id)
      .order("created_at", { ascending: false })
      .limit(3);
    buurtreviews = (r ?? []).map((row) => ({
      id: row.id!,
      tekst: row.text!,
      auteur_naam: row.author_name!,
      reactie_bedrijf: row.reply_company,
    }));
  }

  const admin = createAdminSupabase();
  let recentGesprek: { id: string; naam: string; laatsteBericht: string | null } | null = null;
  const { data: mijnDeelnames } = await admin.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
  if (mijnDeelnames?.length) {
    const { data: gesprekken } = await admin
      .from("conversations")
      .select(
        "id, created_at, conversation_participants(user_id, profiles(name, avatar_url, role)), laatste:messages(text, created_at)"
      )
      .in(
        "id",
        mijnDeelnames.map((d) => d.conversation_id)
      )
      .order("created_at", { ascending: false, foreignTable: "messages" })
      .limit(1, { foreignTable: "messages" })
      .order("created_at", { ascending: false })
      .limit(1);

    const g = gesprekken?.[0] as unknown as
      | { id: string; conversation_participants: { user_id: string; profiles: { name: string; avatar_url: string | null; role: string } | null }[]; laatste: { text: string }[] | { text: string } | null }
      | undefined;
    if (g) {
      const andere = g.conversation_participants.find((d) => d.user_id !== user.id);
      if (andere) {
        const partner = await resolveGesprekPartner(admin, andere);
        const laatste = Array.isArray(g.laatste) ? g.laatste[0] : g.laatste;
        recentGesprek = { id: g.id, naam: partner.naam, laatsteBericht: laatste?.text ?? null };
      }
    }
  }

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-10 lg:py-14">
        {/* ── Hero-banner ── */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-[0px_8px_15px_rgba(92,64,40,0.06)] mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.6px] text-terracotta mb-2">
              <Sparkle size={14} weight="fill" />
              Jouw persoonlijke plan
            </span>
            <h1 className="font-display font-bold text-[32px] sm:text-[38px] leading-[40px] sm:leading-[46px] text-warmzwart mb-2">
              Welkom terug, {voornaam}!
            </h1>
            <p className="font-body text-[15px] leading-[22px] text-warmgrijs-dark max-w-[560px]">
              {community
                ? `Jouw stappenplan voor ${community.naam}${community.wijk_naam ? `, ${community.wijk_naam}` : ""}.`
                : "Jouw persoonlijke overzicht van aanvragen, afspraken en buurtdeals."}
            </p>
          </div>
          {!leeg && (
            <div className="lg:col-span-4 bg-sand-light rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body font-semibold text-[13px] text-warmzwart">Voortgang</span>
                <span className="font-display font-bold text-[15px] text-terracotta">
                  {geregeld} van {totaal} geregeld
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full bg-terracotta transition-all"
                  style={{ width: `${totaal ? Math.round((geregeld / totaal) * 100) : 0}%` }}
                />
              </div>
              <p className="font-body text-[12px] text-warmgrijs mt-2">
                {inAfwachting.length} in afwachting · {bevestigd.length} bevestigd
              </p>
            </div>
          )}
        </div>

        {/* ── Buren-detectie (alleen als er nog geen community is) ── */}
        {detectie && (
          <div className="mb-8">
            <CommunityDetectieKaart {...detectie} />
          </div>
        )}

        {/* ── Lege staat ── */}
        {leeg && (
          <div className="bg-white rounded-[24px] p-10 sm:p-16 text-center shadow-[0px_8px_15px_rgba(92,64,40,0.06)]">
            <div className="w-14 h-14 rounded-full bg-sand-light flex items-center justify-center mx-auto mb-4">
              <Sparkle size={22} className="text-terracotta" weight="fill" />
            </div>
            <h2 className="font-display font-bold text-[24px] text-warmzwart mb-2">Je plan is nog leeg</h2>
            <p className="font-body text-[15px] text-warmgrijs max-w-[420px] mx-auto mb-6">
              Voeg je eerste dienst toe en bouw stap voor stap aan je nieuwe thuis.
            </p>
            <Link href="/diensten" className="btn-primary inline-flex">
              Bekijk diensten
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        )}

        {!leeg && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Hoofdkolom: tijdlijn ── */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              {inAfwachting.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-terracotta" weight="fill" />
                    <h2 className="font-display font-bold text-[20px] text-warmzwart">In afwachting</h2>
                    <span className="badge badge-terracotta">{inAfwachting.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {inAfwachting.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl p-5 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="font-body font-bold text-[16px] text-warmzwart">
                            {b.categorieNaam ?? "Klus"}
                            {b.vakman && <span className="font-normal text-warmgrijs"> · {b.vakman.bedrijfsnaam}</span>}
                          </h3>
                          <BookingStatusBadge status={b.status} />
                        </div>
                        {b.omschrijving && <p className="font-body text-[14px] text-warmgrijs-dark mb-3">{b.omschrijving}</p>}
                        <p className="font-body text-[12px] text-warmgrijs">Wacht op reactie van de vakman</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {bevestigd.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={18} className="text-groen" weight="fill" />
                    <h2 className="font-display font-bold text-[20px] text-warmzwart">Al geregeld &amp; afgestemd</h2>
                  </div>
                  <div className="bg-white rounded-2xl divide-y divide-lijn overflow-hidden shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                    {bevestigd.map((b) => (
                      <div key={b.id} className="p-5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-body font-semibold text-[15px] text-warmzwart truncate">
                            {b.categorieNaam ?? "Klus"}
                            {b.vakman && <span className="font-normal text-warmgrijs"> · {b.vakman.bedrijfsnaam}</span>}
                          </p>
                          <p className="font-body text-[13px] text-warmgrijs">
                            {formatDatum(b.datum) ?? "Datum nog af te stemmen via het gesprek"}
                          </p>
                        </div>
                        {b.vakman && (
                          <Link
                            href={`/vakman/${b.vakman.slug}`}
                            className="font-body font-semibold text-[13px] text-terracotta whitespace-nowrap no-underline hover:underline"
                          >
                            Bekijk vakman →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {groepskortingen.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={18} className="text-terracotta" weight="fill" />
                    <h2 className="font-display font-bold text-[20px] text-warmzwart">Collectieve wijkdeals</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {groepskortingen.map((deal) => (
                      <div key={deal.id} className="bg-sand-light rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-body font-bold text-[15px] text-warmzwart">{deal.titel}</p>
                          {deal.beschrijving && (
                            <p className="font-body text-[13px] text-warmgrijs-dark mt-0.5">{deal.beschrijving}</p>
                          )}
                          <p className="font-body text-[12px] text-warmgrijs mt-1">
                            {deal.deelnemers} van {deal.minDeelnemers} buren aangemeld
                            {deal.prijsGroep != null && ` · groepsprijs €${(deal.prijsGroep / 100).toFixed(0)}`}
                          </p>
                        </div>
                        <span className="shrink-0 font-body font-semibold text-[13px] text-terracotta whitespace-nowrap">
                          {deal.meegedaan ? "Je doet mee ✓" : "Bekijk wijkdeal →"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {afgesloten.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <SealCheck size={18} className="text-warmgrijs" />
                    <h2 className="font-display font-bold text-[20px] text-warmzwart">Afgerond &amp; geannuleerd</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {afgesloten.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 opacity-80">
                        <p className="font-body text-[14px] text-warmgrijs-dark truncate">
                          {b.categorieNaam ?? "Klus"}
                          {b.vakman && ` · ${b.vakman.bedrijfsnaam}`}
                        </p>
                        <BookingStatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Zijkolom ── */}
            <aside className="lg:col-span-4 flex flex-col gap-5">
              {buurtreviews.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                  <h3 className="font-body font-bold text-[14px] text-warmzwart mb-3 flex items-center gap-1.5">
                    <Star size={15} className="text-oker" weight="fill" />
                    Buurtreviews
                  </h3>
                  <div className="flex flex-col gap-3">
                    {buurtreviews.map((r) => (
                      <div key={r.id} className="border-b border-lijn-light last:border-0 pb-3 last:pb-0">
                        <p className="font-body text-[13px] text-warmgrijs-dark leading-[19px] line-clamp-2">&ldquo;{r.tekst}&rdquo;</p>
                        <p className="font-body text-[12px] text-warmgrijs mt-1">
                          {r.auteur_naam}
                          {r.reactie_bedrijf && ` · over ${r.reactie_bedrijf}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentGesprek && (
                <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                  <h3 className="font-body font-bold text-[14px] text-warmzwart mb-2 flex items-center gap-1.5">
                    <ChatCircle size={15} className="text-blauw" weight="fill" />
                    Recent contact
                  </h3>
                  <p className="font-body text-[13px] text-warmzwart-dark font-semibold">{recentGesprek.naam}</p>
                  {recentGesprek.laatsteBericht && (
                    <p className="font-body text-[13px] text-warmgrijs line-clamp-2 mt-0.5">{recentGesprek.laatsteBericht}</p>
                  )}
                  <Link
                    href={`/berichten/${recentGesprek.id}`}
                    className="inline-block mt-2 font-body font-semibold text-[13px] text-terracotta no-underline hover:underline"
                  >
                    Open gesprek →
                  </Link>
                </div>
              )}

              {community && (
                <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_10px_rgba(92,64,40,0.04)]">
                  <h3 className="font-body font-bold text-[14px] text-warmzwart mb-2 flex items-center gap-1.5">
                    <Users size={15} className="text-groen" weight="fill" />
                    {community.naam}
                  </h3>
                  <p className="font-body text-[13px] text-warmgrijs mb-3">{community.aantal_leden} buren aangesloten</p>
                  <Link
                    href={`/community/${community.slug}`}
                    className="font-body font-semibold text-[13px] text-terracotta no-underline hover:underline"
                  >
                    Bekijk je wijk →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-10 pt-6 border-t border-lijn flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-body text-[14px] text-warmgrijs">
            Mis je nog buren? Hoe meer buren meedoen, hoe voordeliger de wijkdeals.
          </p>
          <Link href="/profiel/uitnodigen" className="font-body font-semibold text-[14px] text-terracotta no-underline hover:underline whitespace-nowrap">
            Deel uitnodigingslink →
          </Link>
        </div>
      </div>
    </div>
  );
}

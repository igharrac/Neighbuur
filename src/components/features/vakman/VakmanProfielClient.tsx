"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  CheckCircle,
  Phone,
  ChatCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Briefcase,
  CalendarBlank,
  Camera,
  ArrowRight,
} from "@phosphor-icons/react";
import { ReviewForm } from "@/components/features/reviews/ReviewForm";
import { ReviewCard } from "@/components/features/reviews/ReviewCard";
import { BookingFlow } from "@/components/features/booking/BookingFlow";
import { PremiumBadge } from "@/components/features/premium/PremiumBadge";
import { magBuurtAantalTonen } from "@/lib/localTrust";
import type { Category, ReviewComplete, ProfessionalProfile } from "@/types";

type Tab = "beschikbaarheid" | "werk" | "reviews" | "over";

interface Persoonlijk {
  isLoggedIn: boolean;
  isOwner: boolean;
  heeftAlGereviewed: boolean;
  votedReviewIds: string[];
  communityId: string | null;
  opdrachtenInJouwBuurt: number;
}

const PERSOONLIJK_LEEG: Persoonlijk = {
  isLoggedIn: false,
  isOwner: false,
  heeftAlGereviewed: false,
  votedReviewIds: [],
  communityId: null,
  opdrachtenInJouwBuurt: 0,
};

const CONTACT_VOORKEUR_LABELS: Record<ProfessionalProfile["contact_preference"], string> = {
  phone: "Telefoon",
  whatsapp: "WhatsApp",
  app: "Via de app",
};

/* Demo data — werkfoto's worden pas in een latere fase live gekoppeld */
const WERKFOTOS = [
  { titel: "Spackspuiten woonkamer", loc: "Blok C #42" },
  { titel: "Stucwerk hal + trap", loc: "Blok A #18" },
  { titel: "Badkamer wanden", loc: "Blok C #7" },
  { titel: "Sierpleister slaapkamer", loc: "Blok B #31" },
  { titel: "Plafonds gladpleister", loc: "Blok A #22" },
  { titel: "Complete afwerking", loc: "Blok C #55" },
];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildDagen(aantal: number): Date[] {
  const dagen: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < aantal; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dagen.push(d);
  }
  return dagen;
}

/**
 * Leest ?review={boekingId} uit de URL. Eigen componentje omdat
 * useSearchParams() een Suspense-boundary vereist zodra de pagina
 * (dankzij generateStaticParams) statisch geprerenderd wordt — die
 * boundary hier lokaal houden i.p.v. om de hele pagina, anders zou de
 * hoofdinhoud niet meer instant uit de ISR-cache getoond worden.
 */
function ReviewParamLezer({ onFound }: { onFound: (boekingId: string) => void }) {
  const searchParams = useSearchParams();
  const boekingId = searchParams.get("review");
  useEffect(() => {
    if (boekingId) onFound(boekingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boekingId]);
  return null;
}

interface VakmanProfielClientProps {
  professional: ProfessionalProfile;
  reviews: ReviewComplete[];
  beschikbaarheid: Record<string, "available" | "booked">;
  categories: Category[];
  isDeactivated: boolean;
}

export function VakmanProfielClient({
  professional,
  reviews,
  beschikbaarheid,
  categories,
  isDeactivated,
}: VakmanProfielClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("beschikbaarheid");
  const [alleReviews, setAlleReviews] = useState(reviews);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewBoekingId, setReviewBoekingId] = useState<string | null>(null);
  const [pendingReviewBoekingId, setPendingReviewBoekingId] = useState<string | null>(null);
  const [bookingFlowOpen, setBookingFlowOpen] = useState(false);
  const [persoonlijk, setPersoonlijk] = useState<Persoonlijk>(PERSOONLIJK_LEEG);
  const [persoonlijkGeladen, setPersoonlijkGeladen] = useState(false);
  const { isLoggedIn, isOwner, heeftAlGereviewed, communityId, opdrachtenInJouwBuurt } = persoonlijk;
  const votedSet = new Set(persoonlijk.votedReviewIds);

  const initiaal = professional.company_name.charAt(0).toUpperCase();
  const dagen = buildDagen(14);

  // Inlog-afhankelijk deel apart ophalen (zie page.tsx) — houdt de
  // publieke hoofdinhoud ISR-cachebaar. Wordt in de praktijk vrijwel
  // altijd binnen een fractie van een seconde na de eerste render
  // opgehaald; tot die tijd tonen we de uitgelogde/vreemdeling-variant.
  useEffect(() => {
    let geannuleerd = false;
    fetch("/api/vakman/persoonlijk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalId: professional.id }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (geannuleerd) return;
        setPersoonlijk({
          isLoggedIn: !!json.isLoggedIn,
          isOwner: !!json.isOwner,
          heeftAlGereviewed: !!json.heeftAlGereviewed,
          votedReviewIds: json.votedReviewIds ?? [],
          communityId: json.communityId ?? null,
          opdrachtenInJouwBuurt: json.opdrachtenInJouwBuurt ?? 0,
        });
        setPersoonlijkGeladen(true);
      })
      .catch(() => setPersoonlijkGeladen(true));
    return () => {
      geannuleerd = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professional.id]);

  // Vanuit het review-verzoek (24u na afronding) komt de gebruiker binnen
  // met ?review={boeking_id} — pas openen zodra we weten of hij al
  // gereviewd heeft (anders knippert het formulier soms onnodig open).
  // pendingReviewBoekingId komt van ReviewParamLezer hieronder (los
  // component, want useSearchParams() vereist een eigen Suspense-
  // boundary — die mag niet de hele pagina omvatten, anders verdwijnt
  // het voordeel van de statisch gecachede hoofdinhoud).
  useEffect(() => {
    if (!persoonlijkGeladen || !pendingReviewBoekingId) return;
    if (isLoggedIn && !isOwner && !heeftAlGereviewed) {
      setReviewBoekingId(pendingReviewBoekingId);
      setReviewFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persoonlijkGeladen, pendingReviewBoekingId]);

  function handleSchrijfReview() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setReviewBoekingId(null);
    setReviewFormOpen(true);
  }

  function handleBoekNu() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setBookingFlowOpen(true);
  }

  // Gepauzeerd profiel: standaard de neutrale melding tonen (veilige
  // aanname "bezoeker is geen eigenaar") totdat het persoonlijke deel
  // bevestigt dat de bezoeker wél de eigenaar is — nooit eerst de volle
  // inhoud laten zien en die daarna pas verbergen.
  if (isDeactivated && !(persoonlijkGeladen && isOwner)) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-display-sm text-warmzwart mb-2">Dit profiel is tijdelijk niet actief</h1>
        <p className="text-body text-warmgrijs">Deze vakman heeft zijn profiel gepauzeerd. Kom later nog eens terug.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <Suspense fallback={null}>
        <ReviewParamLezer onFound={setPendingReviewBoekingId} />
      </Suspense>
      {/* ── Hero card ── */}
      <div className="card p-8 flex flex-col md:flex-row gap-7 mb-7">
        {professional.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={professional.logo_url}
            alt={professional.company_name}
            className="w-[100px] h-[100px] rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-sage to-sage-700 flex items-center justify-center text-white font-display font-black text-4xl flex-shrink-0">
            {initiaal}
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-display-md mb-1">{professional.company_name}</h1>
          <p className="text-body text-warmgrijs mb-3">{professional.bio || "Vakman op Neighbuur"}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {professional.is_premium && <PremiumBadge size="md" />}
            {professional.verified && (
              <span className="badge badge-groen">
                <CheckCircle size={12} weight="fill" /> Geverifieerd
              </span>
            )}
            {professional.service_area_postcode && (
              <span className="badge badge-blauw">
                <MapPin size={12} weight="fill" /> {professional.service_area_postcode} · {professional.service_area_km} km
              </span>
            )}
          </div>
          <div className="flex gap-6 flex-wrap">
            {[
              { val: professional.avg_score > 0 ? professional.avg_score.toFixed(1) : "—", label: "Score" },
              { val: String(professional.review_count), label: "Reviews" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <span className="font-display font-bold text-[22px] block">{s.val}</span>
                <span className="text-body-xs text-warmgrijs">{s.label}</span>
              </div>
            ))}
          </div>
          {magBuurtAantalTonen(opdrachtenInJouwBuurt) && (
            <p className="text-body-sm font-semibold text-sage mt-3 flex items-center gap-1.5">
              <MapPin size={15} weight="fill" />
              {opdrachtenInJouwBuurt} opdrachten uitgevoerd in jouw buurt
            </p>
          )}
        </div>
        <div className="flex md:flex-col gap-3 justify-center flex-shrink-0">
          <button className="btn-primary">
            <Phone size={18} weight="fill" /> Bellen
          </button>
          <Link
            href={isLoggedIn ? `/berichten/nieuw?vakman=${professional.id}` : "/login"}
            className="btn-secondary"
          >
            <ChatCircle size={18} /> Bericht
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b-2 border-lijn mb-6 overflow-x-auto">
        {([
          { id: "beschikbaarheid" as Tab, icon: CalendarBlank, label: "Beschikbaarheid" },
          { id: "werk" as Tab, icon: Camera, label: "Werk in je wijk" },
          { id: "reviews" as Tab, icon: Star, label: `Reviews (${alleReviews.length})` },
          { id: "over" as Tab, icon: Briefcase, label: "Over" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-body-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors min-h-11 ${
              tab === t.id
                ? "text-sage border-sage"
                : "text-warmgrijs border-transparent hover:text-warmzwart"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Beschikbaarheid ── */}
      {tab === "beschikbaarheid" && (
        <div className="animate-fade-in">
          <h3 className="font-display text-display-sm mb-4">Komende 2 weken</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dagen.map((dag) => {
              const key = toDateStr(dag);
              const status = beschikbaarheid[key];
              return (
                <div
                  key={key}
                  className={`text-center py-3 px-1 rounded-sm border-[1.5px] text-body-sm font-semibold min-h-11 ${
                    status === "available"
                      ? "bg-groen-light border-groen text-groen"
                      : "bg-cream-dark border-lijn text-warmgrijs"
                  }`}
                >
                  <span className="text-body-xs uppercase block opacity-70">
                    {dag.toLocaleDateString("nl-NL", { weekday: "short" })}
                  </span>
                  <span className="text-base block">{dag.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 text-body-xs text-warmgrijs mb-5">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-groen" /> Beschikbaar</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lijn" /> Onbekend/bezet</span>
          </div>
          {!isOwner && (
            <button onClick={handleBoekNu} className="btn-primary">
              Boek nu <ArrowRight size={16} weight="bold" />
            </button>
          )}
        </div>
      )}

      {/* ── Tab: Werk ── */}
      {tab === "werk" && (
        <div className="animate-fade-in">
          <h3 className="font-display text-display-sm mb-4">Foto&apos;s van werk in je wijk</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WERKFOTOS.map((foto) => (
              <div key={foto.titel} className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group">
                <div className="w-full h-full bg-sand flex flex-col items-center justify-center gap-2 group-hover:bg-sage-50 transition-colors">
                  <Camera size={28} className="text-warmgrijs" />
                  <span className="text-body-xs text-warmgrijs text-center px-2 font-medium">{foto.titel}</span>
                </div>
                <span className="absolute bottom-2 left-2 bg-warmzwart/70 text-white text-body-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {foto.loc}
                </span>
              </div>
            ))}
          </div>
          <p className="text-body-xs text-warmgrijs mt-3 text-center italic">
            Foto-placeholders — in productie worden hier echte werkfoto&apos;s getoond
          </p>
        </div>
      )}

      {/* ── Tab: Reviews ── */}
      {tab === "reviews" && (
        <div className="animate-fade-in flex flex-col gap-4">
          {!isOwner && (
            <button
              onClick={handleSchrijfReview}
              disabled={heeftAlGereviewed}
              className="btn-secondary self-start disabled:opacity-40 disabled:pointer-events-none"
            >
              {heeftAlGereviewed ? "Je hebt al een review geplaatst" : "Schrijf een review"}
            </button>
          )}

          {alleReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body-sm text-warmgrijs">Nog geen reviews via Neighbuur.</p>
              <p className="text-body-xs text-warmgrijs mt-1">
                {professional.company_name} heeft hier nog geen afgeronde opdrachten via Neighbuur.
              </p>
            </div>
          ) : (
            alleReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                professionalId={professional.id}
                companyName={professional.company_name}
                isProfessionalOwner={isOwner}
                initialVoted={votedSet.has(review.id)}
                isEigenBuurt={!!communityId && review.community_id === communityId}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Over ── */}
      {tab === "over" && (
        <div className="animate-fade-in max-w-[600px]">
          <h3 className="font-display text-display-sm mb-3">Over {professional.company_name}</h3>
          <p className="text-body text-warmgrijs-dark leading-relaxed mb-6">
            {professional.bio || "Deze vakman heeft nog geen bio toegevoegd."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: MapPin,
                label: "Werkgebied",
                value: professional.service_area_postcode ? `${professional.service_area_postcode} (${professional.service_area_km} km)` : "Onbekend",
              },
              { icon: Clock, label: "Contactvoorkeur", value: CONTACT_VOORKEUR_LABELS[professional.contact_preference] },
              {
                icon: Briefcase,
                label: "KvK",
                value: professional.kvk_number ? `${professional.kvk_number} · ${professional.kvk_verified ? "Geverifieerd" : "Nog niet geverifieerd"}` : "Niet opgegeven",
              },
              { icon: ShieldCheck, label: "Verzekerd", value: professional.insured ? "Bedrijfsaansprakelijkheid ✓" : "Niet opgegeven" },
            ].map((info) => (
              <div key={info.label} className="card-flat p-4">
                <div className="flex items-center gap-2 mb-1">
                  <info.icon size={14} className="text-warmgrijs" />
                  <span className="font-semibold text-body-xs">{info.label}</span>
                </div>
                <p className="text-body-sm text-warmgrijs">{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky book bar ── */}
      {!isOwner && (
        <>
          <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-[900px] bg-white border-t border-lijn pt-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex items-center justify-between md:rounded-t-xl md:shadow-strong">
            <div>
              <span className="font-display font-bold text-[22px]">Neem contact op</span>
              <span className="block text-body-xs text-warmgrijs">{professional.service_area_km} km werkgebied</span>
            </div>
            <button onClick={handleBoekNu} className="btn-primary !py-3.5 !px-8 !text-base min-h-11">
              Boek nu
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
          <div className="h-[calc(5rem+env(safe-area-inset-bottom))]" />
        </>
      )}

      <ReviewForm
        open={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        professionalId={professional.id}
        companyName={professional.company_name}
        communityId={communityId}
        boekingId={reviewBoekingId}
        onSuccess={(nieuweReview) => {
          setAlleReviews((prev) => [nieuweReview, ...prev]);
          setTab("reviews");
          setPersoonlijk((prev) => ({ ...prev, heeftAlGereviewed: true }));
          // Ververst de server-gefetchte hero-stats (gem_score/aantal_reviews)
          // zodra de update_vakman_stats-trigger die heeft bijgewerkt. Met
          // ISR (revalidate=300) kan dit tot enkele minuten vertraagd zijn
          // t.o.v. het echte cijfer — de nieuwe review zelf staat wel meteen
          // in de lijst via de lokale state hierboven.
          router.refresh();
        }}
      />

      <BookingFlow
        open={bookingFlowOpen}
        onClose={() => setBookingFlowOpen(false)}
        professionalId={professional.id}
        companyName={professional.company_name}
        logoUrl={professional.logo_url}
        beschikbaarheid={beschikbaarheid}
        categories={categories}
        communityId={communityId}
      />
    </div>
  );
}

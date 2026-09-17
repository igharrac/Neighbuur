"use client";

import { useEffect, useState } from "react";
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
import type { Category, ReviewComplete, ProfessionalProfile } from "@/types";

type Tab = "beschikbaarheid" | "werk" | "reviews" | "over";

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

interface VakmanProfielClientProps {
  professional: ProfessionalProfile;
  reviews: ReviewComplete[];
  votedReviewIds: string[];
  isOwner: boolean;
  isLoggedIn: boolean;
  heeftAlGereviewed: boolean;
  communityId: string | null;
  beschikbaarheid: Record<string, "available" | "booked">;
  categories: Category[];
}

export function VakmanProfielClient({
  professional,
  reviews,
  votedReviewIds,
  isOwner,
  isLoggedIn,
  heeftAlGereviewed,
  communityId,
  beschikbaarheid,
  categories,
}: VakmanProfielClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("beschikbaarheid");
  const [alleReviews, setAlleReviews] = useState(reviews);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewBoekingId, setReviewBoekingId] = useState<string | null>(null);
  const [bookingFlowOpen, setBookingFlowOpen] = useState(false);
  const votedSet = new Set(votedReviewIds);

  const initiaal = professional.company_name.charAt(0).toUpperCase();
  const dagen = buildDagen(14);

  // Vanuit het review-verzoek (24u na afronding) komt de gebruiker binnen
  // met ?review={boeking_id} — open direct het formulier, vooringevuld.
  useEffect(() => {
    const boekingId = searchParams.get("review");
    if (boekingId && isLoggedIn && !isOwner && !heeftAlGereviewed) {
      setReviewBoekingId(boekingId);
      setReviewFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
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
          // Ververst de server-gefetchte hero-stats (gem_score/aantal_reviews)
          // zodra de update_vakman_stats-trigger die heeft bijgewerkt.
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

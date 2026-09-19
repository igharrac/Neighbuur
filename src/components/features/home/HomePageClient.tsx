"use client";

import { CaretUp } from "@phosphor-icons/react";
import { CategoryGrid } from "@/components/features/categories/CategoryGrid";
import { Hero } from "@/components/features/home/Hero";
import { HoeHetWerkt } from "@/components/features/home/HoeHetWerkt";
import { WijkActivatie } from "@/components/features/home/WijkActivatie";
import { WhatsappCommunityCta } from "@/components/features/home/WhatsappCommunityCta";
import { VakmanBanner } from "@/components/features/home/VakmanBanner";
import { useLang } from "@/lib/hooks/useLang";
import type { Category } from "@/types";
import type { CommunityOverview } from "@/lib/communities";

const DEMO_REVIEWS = [
  {
    naam: "Marieke V.",
    wijk: "Vathorst Blok C",
    tijd: "3 weken geleden",
    tekst: "TopStuc heeft ons hele huis gespackspoten in 2 dagen. Netjes afgewerkt, stofvrij opgeleverd en precies op tijd. Al 6 buren naar doorverwezen!",
    upvotes: 24,
    tags: [
      { label: "5.0 kwaliteit", kleur: "badge-groen" },
      { label: "stipt op tijd", kleur: "badge-blauw" },
    ],
    kleur: "bg-sage",
  },
  {
    naam: "Jeroen K.",
    wijk: "Vathorst Blok A",
    tijd: "2 weken geleden",
    tekst: "Via Neighbuur glasvezel vergeleken en €14/mnd bespaard t.o.v. wat ik zelf had gevonden. Installatie was binnen 3 dagen geregeld.",
    upvotes: 18,
    tags: [
      { label: "geld bespaard", kleur: "badge-lavendel" },
      { label: "snel geregeld", kleur: "badge-groen" },
    ],
    kleur: "bg-blauw",
  },
  {
    naam: "Sanne R.",
    wijk: "De Hoef Blok 7",
    tijd: "1 week geleden",
    tekst: "Met 8 buren samen een hovenier geboekt via de groepskorting. Mooie tuinen voor een prijs waar je normaal alleen gazon voor krijgt.",
    upvotes: 31,
    tags: [
      { label: "groepskorting", kleur: "badge-sage" },
      { label: "5.0 top", kleur: "badge-groen" },
    ],
    kleur: "bg-groen",
  },
];

interface HomePageClientProps {
  categories: Category[];
  communities: CommunityOverview[];
}

export function HomePageClient({ categories, communities }: HomePageClientProps) {
  const { dict } = useLang();

  return (
    <>
      {/* ── HERO ── */}
      <Hero />

      {/* ── HOE WERKT NEIGHBUUR ── */}
      <HoeHetWerkt />

      {/* ── DIENSTEN (12 categorieën uit database) ── */}
      <section className="px-6 py-20 md:py-28 bg-cream-warm" id="diensten">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-display-lg text-warmzwart mb-3">
              {dict.nav.services}
            </h2>
            <p className="text-body-lg text-warmgrijs max-w-md mx-auto">
              Van stukadoor tot glasvezel, van verhuiswagen tot zonnepanelen.
            </p>
          </div>

          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* ── WIJK-ACTIVATIE & LIVE STATUS ── */}
      <WijkActivatie communities={communities} />

      {/* ── REVIEWS ── */}
      <section className="px-6 py-20 md:py-28 bg-cream-warm" id="reviews">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-display-lg text-warmzwart mb-3">
              {dict.reviews.title}
            </h2>
            <p className="text-body-lg text-warmgrijs max-w-md mx-auto">
              {dict.reviews.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {DEMO_REVIEWS.map((review) => (
              <div key={review.naam} className="card !bg-transparent p-7">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full ${review.kleur} text-white flex items-center justify-center font-bold text-body`}>
                      {review.naam[0]}
                    </span>
                    <div>
                      <div className="font-semibold text-body-sm">{review.naam}</div>
                      <div className="text-body-xs text-warmgrijs">{review.wijk} · {review.tijd}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-body-sm font-semibold text-groen">
                    <CaretUp size={14} weight="bold" />
                    {review.upvotes}
                  </span>
                </div>
                <p className="text-body-sm text-warmgrijs-dark leading-relaxed mb-4">
                  {review.tekst}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {review.tags.map((tag) => (
                    <span key={tag.label} className={`badge ${tag.kleur}`}>{tag.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WARM WHATSAPP COMMUNITY CTA ── */}
      <WhatsappCommunityCta />

      {/* ── BEN JE VAKMAN? HERO BANNER ── */}
      <VakmanBanner />
    </>
  );
}

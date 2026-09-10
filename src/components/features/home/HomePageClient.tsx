/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  WhatsappLogo,
  Copy,
  CaretUp,
} from "@phosphor-icons/react";
import { CategoryGrid } from "@/components/features/categories/CategoryGrid";
import { CommunitySearch } from "@/components/features/community/CommunitySearch";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import type { Categorie } from "@/types";
import type { CommunityOverzicht } from "@/lib/communities";

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
    kleur: "bg-terracotta",
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
      { label: "groepskorting", kleur: "badge-terracotta" },
      { label: "5.0 top", kleur: "badge-groen" },
    ],
    kleur: "bg-groen",
  },
];

interface HomePageClientProps {
  categorieen: Categorie[];
  communities: CommunityOverzicht[];
}

export function HomePageClient({ categorieen, communities }: HomePageClientProps) {
  const { dict } = useLang();
  const { showToast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText("https://neighbuur.nl");
    showToast(dict.cta.copy, "success");
  }

  function handleWhatsappShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(dict.cta.whatsappMessage)}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pt-14 pb-10 md:pt-16 md:pb-10">
        <div className="max-w-[1260px] mx-auto grid md:grid-cols-[1fr_1.15fr] gap-10 items-center relative">
          {/* Slogan — top right, decorative */}
          <p className="hidden lg:block absolute -top-2 right-0 font-display italic text-body text-terracotta/60 text-right leading-snug whitespace-pre-line">
            {dict.hero.slogan}
          </p>

          <div>
            <p className="font-body text-body-sm font-semibold tracking-wider uppercase text-terracotta mb-4">
              {dict.hero.eyebrow}
            </p>
            <h1 className="font-display font-black text-display-xl text-warmzwart mb-5 text-balance">
              {dict.hero.title}{" "}
              <em className="text-terracotta italic">{dict.hero.titleAccent}</em>
            </h1>
            <p className="text-body-lg text-warmgrijs max-w-md mb-7">
              {dict.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                placeholder={dict.login.whichNeighbourhood}
                className="flex-1 px-4 py-2.5 rounded-sm border border-lijn bg-white text-body-sm outline-none transition-colors focus:border-terracotta"
              />
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-sm bg-warmzwart text-white text-body-sm font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                {dict.nav.cta}
                <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
            <p className="text-body-xs text-warmgrijs mt-2.5">
              <span className="font-semibold text-warmzwart">Gratis</span> — geen account nodig
            </p>
          </div>

          <div className="rounded-lg overflow-hidden">
            <img
              src={dict.hero.heroImage}
              alt={dict.hero.heroAlt}
              className="w-full h-auto block"
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {["M", "J", "A", "L"].map((initial, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 rounded-full border-2 border-cream flex items-center justify-center text-white text-body-xs font-bold ${
                    ["bg-terracotta", "bg-groen", "bg-blauw", "bg-lavendel"][i]
                  }`}
                >
                  {initial}
                </span>
              ))}
            </div>
            <span className="text-body-sm text-warmgrijs">
              <span className="font-bold text-warmzwart">2.847</span> {dict.social.households}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 text-oker">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} weight="fill" />)}
            </div>
            <span className="text-body-sm text-warmgrijs">
              <span className="font-bold text-warmzwart">4.8</span> {dict.social.avgScore}
            </span>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ZOEKEN ── */}
      <CommunitySearch communities={communities} />

      {/* ── DIENSTEN (12 categorieën uit database) ── */}
      <section className="px-6 py-20 md:py-28 bg-sand/40" id="diensten">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-display-lg text-warmzwart mb-3">
              {dict.nav.services}
            </h2>
            <p className="text-body-lg text-warmgrijs max-w-md mx-auto">
              Van stukadoor tot glasvezel, van verhuiswagen tot zonnepanelen.
            </p>
          </div>

          <CategoryGrid categorieen={categorieen} />
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="px-6 py-20 md:py-28" id="reviews">
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
              <div key={review.naam} className="card p-7">
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

      {/* ── SHARE CTA ── */}
      <section className="px-6 py-16">
        <div className="max-w-[640px] mx-auto bg-warmzwart text-white rounded p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-terracotta/20 rounded-full blur-3xl" />
          <h2 className="font-display text-display-md text-white mb-3 relative whitespace-pre-line">
            {dict.cta.title}
          </h2>
          <p className="text-white/60 text-body-lg mb-8 relative whitespace-pre-line">
            {dict.cta.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 justify-center relative">
            <button
              onClick={handleWhatsappShare}
              className="btn bg-[#25D366] text-white px-6 py-3.5 text-body font-semibold hover:-translate-y-0.5 hover:shadow-medium"
            >
              <WhatsappLogo size={20} weight="fill" />
              {dict.cta.whatsapp}
            </button>
            <button
              onClick={handleCopyLink}
              className="btn bg-white/10 text-white border border-white/20 px-6 py-3.5 text-body font-semibold hover:-translate-y-0.5"
            >
              <Copy size={18} />
              {dict.cta.copy}
            </button>
          </div>
        </div>
      </section>

      {/* ── VOOR VAKMENSEN ── */}
      <section className="px-6 pb-16 md:pb-20">
        <div className="max-w-[900px] mx-auto bg-sand rounded p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="font-display text-display-md text-warmzwart mb-2 text-balance">
              {dict.proCta.title}
            </h2>
            <p className="text-body-lg text-warmgrijs-dark max-w-md">
              {dict.proCta.subtitle}
            </p>
          </div>
          <Link
            href="/registreer/vakman"
            className="btn-primary shrink-0 whitespace-nowrap"
          >
            {dict.proCta.button}
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  );
}

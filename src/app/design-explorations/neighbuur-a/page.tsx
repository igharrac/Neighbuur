/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { REAL_CATEGORIES, PROTOTYPE_PROJECTS, HERO_IMAGE } from "../_content";

/* Simpele inline SVG's i.p.v. @phosphor-icons/react — dat pakket breekt
   Next.js' statische prerender voor een pure server component zonder
   enige "use client"-grens in de boom (IconContext.createContext-gebruik
   botst met de minimale RSC-buildomgeving tijdens "collect page data").
   Bestaande pagina's die het pakket wél gebruiken zijn allemaal dynamisch
   (cookies()/fetch), dus zij raken dit pad nooit. */
function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function House({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.6 2 11h3v10h6v-6h2v6h6V11h3L12 2.6Z" />
    </svg>
  );
}

/**
 * VARIANT A — EVOLUTION
 * Blijft dicht bij het bestaande Neighbuur-systeem (cream/sage,
 * Fraunces + DM Sans, hard-shadow kaarten) — de vraag die dit
 * beantwoordt: hoe goed kan het huidige ontwerp worden zonder grote
 * redesign? Belangrijkste ingrepen t.o.v. vandaag:
 *  - geen enkel-woord-cursief-accent in de hero meer (was een kliché,
 *    en trok de aandacht weg van de kern-zin);
 *  - categorieën groter en rustiger gepresenteerd (6 i.p.v. 12 per
 *    rij), met meer ruimte tussen tegels;
 *  - "buurtprojecten" nu een rustige lijst van voorbeeldklussen i.p.v.
 *    een kaart vol statistiek-badges — geen cijfers, geen social proof.
 */

const STEPS = [
  { title: "Vertel wat je wil doen", desc: "Kies de klus die je nodig hebt, van stucwerk tot zonnepanelen." },
  { title: "Zie wat buren al deden", desc: "Bekijk welke vakmensen in jouw buurt al goed werk hebben geleverd." },
  { title: "Regel het, alleen of samen", desc: "Boek zelf, of bundel de klus met buren voor een betere prijs." },
];

export default function NeighbuurVariantA() {
  return (
    <div className="bg-cream-warm min-h-screen">
      {/* ── HEADER ── */}
      <header className="border-b border-lijn">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/design-explorations/neighbuur-a" className="flex items-center gap-2 no-underline">
            <span className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white">
              <House size={18} />
            </span>
            <span className="font-display font-black text-[20px] text-warmzwart">
              Neigh<span className="text-sage">buur</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-body-sm font-medium text-warmgrijs">
            <span>Diensten</span>
            <span>Buurtprojecten</span>
            <span>Hoe het werkt</span>
          </nav>
          <button className="btn-dark !py-2.5 !px-5 !text-body-sm">Inloggen</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <h1 className="font-display font-bold text-[42px] leading-[48px] sm:text-[58px] sm:leading-[62px] tracking-[-0.02em] text-warmzwart mb-6">
              Plannen voor jouw woning?
            </h1>
            <p className="font-body text-[18px] leading-[28px] text-warmgrijs-dark max-w-[460px] mb-9">
              Ontdek wat anderen in je buurt hebben laten doen, lees hun ervaringen en zie welke vakmensen er goed
              werk hebben geleverd. Regel het zelf, of samen met je buren.
            </p>
            <div className="flex items-center gap-4">
              <button className="hard inline-flex items-center gap-2 bg-sage px-8 py-4 font-body font-semibold text-[15px] text-white">
                Bekijk diensten
                <ArrowRight size={14} />
              </button>
              <span className="text-body-sm text-warmgrijs">Gratis te gebruiken</span>
            </div>
          </div>
          <div className="lg:col-span-6">
            <img src={HERO_IMAGE} alt="Nieuwbouwkamer met verhuisdozen" className="hard-lg w-full h-[320px] sm:h-[420px] object-cover" />
          </div>
        </div>
      </section>

      {/* ── 3 STAPPEN ── */}
      <section className="px-6 py-20 bg-sand-light">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display text-display-md text-warmzwart mb-12 max-w-[520px]">Hoe werkt Neighbuur</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <div className="w-10 h-10 rounded-full bg-sage-100 text-sage flex items-center justify-center font-display font-bold text-[16px] mb-5">
                  {i + 1}
                </div>
                <h3 className="font-body font-bold text-[18px] text-warmzwart mb-2">{step.title}</h3>
                <p className="font-body text-[15px] leading-[23px] text-warmgrijs-dark">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIENSTEN ── */}
      <section className="px-6 py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12 max-w-[560px]">
            <h2 className="font-display text-display-md text-warmzwart mb-3">Wat wil je aan je woning doen?</h2>
            <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark">
              Ontdek ervaringen, vakmensen en plannen uit jouw buurt.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {REAL_CATEGORIES.map((c) => (
              <div key={c.slug} className="group">
                <div className="hard-lg overflow-hidden mb-3">
                  <img src={c.img} alt={c.naam} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="font-body font-bold text-[14px] text-warmzwart">{c.naam}</div>
                <div className="font-body text-[12.5px] text-warmgrijs leading-snug">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUURTPROJECTEN (prototype-content, geen cijfers) ── */}
      <section className="px-6 py-20 bg-sand-light">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12 max-w-[560px]">
            <h2 className="font-display text-display-md text-warmzwart mb-3">Wat buren laten doen</h2>
            <p className="font-body text-[16px] leading-[25px] text-warmgrijs-dark">
              Een paar voorbeelden van klussen uit de buurt.{" "}
              <span className="text-warmgrijs italic">(voorbeeldcontent voor dit prototype)</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROTOTYPE_PROJECTS.map((p) => (
              <div key={p.categorie + p.buurt} className="hard-lg bg-white overflow-hidden">
                <img src={p.beeld} alt={p.categorie} className="w-full h-[140px] object-cover" />
                <div className="p-5">
                  <div className="font-body font-bold text-[13px] uppercase tracking-wide text-sage mb-1">{p.categorie}</div>
                  <div className="font-body font-semibold text-[14px] text-warmzwart mb-1.5">{p.buurt}</div>
                  <p className="font-body text-[13px] leading-[20px] text-warmgrijs-dark">{p.beschrijving}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center border-t border-lijn">
        <p className="text-body-sm text-warmgrijs">Neighbuur, design exploration A (Evolution)</p>
      </footer>
    </div>
  );
}

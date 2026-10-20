/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { REAL_CATEGORIES, PROTOTYPE_PROJECTS, HERO_IMAGE, WIJK_IMAGE } from "../_content";
import { sourceSerif } from "../neighbuur-b/_font";

/* Zie neighbuur-a/page.tsx voor waarom dit lokale SVG's zijn i.p.v.
   @phosphor-icons/react (breekt statische prerender voor een server
   component zonder "use client"-grens). */
function ArrowRight({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function House({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.6 2 11h3v10h6v-6h2v6h6V11h3L12 2.6Z" />
    </svg>
  );
}
function Search({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m14 14-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * VARIANT C — BEST DIRECTION (herzien na feedback)
 * Feedback op de eerste versie: te breed, voelde als losse blog-blokken
 * zonder samenhang, geen duidelijke trigger om te klikken. Aanpassingen:
 *  - smallere container (1120px i.p.v. 1280px), elke sectie heeft nu een
 *    eigen achtergrondkleur zodat de pagina als duidelijke zones leest
 *    i.p.v. doorlopend wit;
 *  - "Hoe het werkt" is nu een eigen volwaardige sectie (stond eerst
 *    weggestopt náást de hero) — intro → hoe het werkt → waar zoek je;
 *  - diensten-tegels zijn nu echte links (/zoeken?categorie=...) met
 *    hover-state en pijltje — voorheen statische divs, geen enkele
 *    aanleiding om erop te willen klikken;
 *  - header-navigatie springt nu echt naar de sectie (ankerlinks i.p.v.
 *    losse tekst).
 * Kleuren/typografie-principes ongewijzigd t.o.v. de vorige versie.
 */

const STEPS = [
  {
    n: "01",
    title: "Ontdek wat er al is gedaan",
    desc: "Blader door klussen en ervaringen van buren in jouw type woning, vlakbij.",
    beeld: WIJK_IMAGE,
    accent: "sage" as const,
  },
  {
    n: "02",
    title: "Vind vakmensen met bewezen werk",
    desc: "Zie wie er al goed werk heeft geleverd in jouw buurt, beoordeeld door bewoners in plaats van sterren alleen.",
    beeld: "/images/vakman-hero.jpg",
    accent: "oker" as const,
  },
  {
    n: "03",
    title: "Maak je plannen concreet",
    desc: "Neem contact op met vakmensen, vraag offertes aan en regel het zelf, of ontdek waar je samen met buren voordeel kunt behalen.",
    beeld: "/design-explorations/stap3-plannen-concreet.png",
    accent: "sage" as const,
  },
];

const ACCENT = {
  sage: { numeral: "text-sage", border: "border-sage" },
  oker: { numeral: "text-oker", border: "border-oker" },
};

export default function NeighbuurVariantC() {
  const [featured, ...rest] = PROTOTYPE_PROJECTS;

  return (
    <div className={`${sourceSerif.variable} bg-cream-warm min-h-screen text-warmzwart`}>
      {/* ── HEADER ── */}
      <header className="sticky top-[30px] z-40 bg-cream-warm/90 backdrop-blur-sm border-b border-lijn">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 h-[64px] flex items-center justify-between">
          <Link href="/design-explorations/neighbuur-c" className="flex items-center gap-2 no-underline">
            <span className="w-7 h-7 bg-sage rounded-[6px] flex items-center justify-center text-white">
              <House size={15} />
            </span>
            <span className="font-display font-bold text-[18px] text-warmzwart">
              Neigh<span className="text-sage">buur</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[13.5px] font-medium text-warmgrijs-dark">
            <a href="#hoe-het-werkt" className="hover:text-warmzwart transition-colors">Hoe het werkt</a>
            <a href="#diensten" className="hover:text-warmzwart transition-colors">Diensten</a>
            <a href="#buurtprojecten" className="hover:text-warmzwart transition-colors">Buurtprojecten</a>
          </nav>
          <button className="text-[13.5px] font-semibold text-warmzwart">Inloggen</button>
        </div>
      </header>

      {/* ── HERO — beeld als brede laag achter de sectie, tekst erover ── */}
      <section className="relative overflow-hidden px-6 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        {/* Beeld: breder en verder naar links dan voorheen, loopt door
           achter de tekstkolom — zelfde idee als de productie-hero. */}
        <div className="pointer-events-none absolute inset-0 hidden sm:flex justify-center">
          <div className="relative w-full max-w-[1120px]">
            <div className="absolute right-0 top-0 h-full w-[68%]">
              <img
                src={HERO_IMAGE}
                alt="Nieuwbouwkamer met verhuisdozen"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(100deg, #f6f5f2 8%, rgba(246,245,242,0.88) 26%, rgba(246,245,242,0.25) 48%, rgba(246,245,242,0) 68%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream-warm from-0% via-transparent via-65% to-transparent to-100%" />
              <div className="absolute inset-0 bg-gradient-to-b from-cream-warm from-0% via-transparent via-[10%] to-transparent to-100%" />
            </div>
          </div>
        </div>

        <div className="relative max-w-[1120px] mx-auto">
          <div className="sm:max-w-[560px]">
            <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-[1.06] tracking-[-0.02em] mb-5">
              Wat wil je aan je woning doen?
            </h1>
            <p className="font-body text-[17px] leading-[1.6] text-warmgrijs-dark max-w-[46ch] mb-8">
              Ontdek ervaringen, vakmensen en plannen uit jouw buurt. Begin bij je woningplan, niet bij het zoeken
              naar een vakman.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="#diensten"
                className="hard inline-flex items-center gap-2 bg-sage px-7 py-3.5 font-body font-semibold text-[14.5px] text-white no-underline"
              >
                Ontdek je buurt
                <ArrowRight size={13} />
              </a>
              <span className="text-[13.5px] text-warmgrijs">Gratis te gebruiken</span>
            </div>
          </div>
          {/* Mobiel: geen ruimte voor overlap, beeld gewoon eronder in normale flow. */}
          <img
            src={HERO_IMAGE}
            alt="Nieuwbouwkamer met verhuisdozen"
            className="sm:hidden w-full h-[220px] object-cover mt-8"
          />
        </div>
      </section>

      {/* ── HOE HET WERKT — editorial behandeling: grote kop + ghost-cijfers + fotografie per stap ── */}
      <section id="hoe-het-werkt" className="px-6 sm:px-8 py-20 sm:py-28 bg-sand-light border-y border-lijn">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 sm:mb-20">
            <div className="lg:col-span-7">
              <p className="text-[12px] font-semibold tracking-[0.12em] text-warmgrijs mb-4">HOE NEIGHBUUR WERKT</p>
              <h2 className="font-display font-bold text-[40px] sm:text-[52px] leading-[1.1] tracking-[-0.02em]">
                Van wat je buren
                <br />
                deden, naar jouw plan.
              </h2>
            </div>
            <div className="lg:col-span-5 flex items-end">
              <p className="font-body text-[16px] leading-[1.65] text-warmgrijs-dark">
                Ontdek wat er in jouw buurt al gedaan is, lees de ervaringen van je buren en vind vakmensen met
                bewezen werk dichtbij. Zo wordt jouw plan concreet, alleen of samen met de buurt.
              </p>
            </div>
          </div>

          {/* Eén platte grid i.p.v. 3 losse kolom-divs: numerals, titels,
             tekst en beelden staan elk als eigen rij van 3 cellen, zodat
             CSS grid ze gegarandeerd laag-voor-laag uitlijnt — ongeacht
             hoeveel regels een titel/omschrijving toevallig inneemt. Een
             losse flex-kolom per stap (vorige versie) liet het beeld
             meeschuiven met de tekstlengte erboven. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-3">
            {STEPS.map((s) => (
              <div key={`n-${s.n}`} className="flex items-center gap-4">
                <span className={`font-display font-bold text-[56px] sm:text-[64px] leading-none ${ACCENT[s.accent].numeral}`}>
                  {s.n}
                </span>
                <span className="flex-1 h-px bg-lijn" />
              </div>
            ))}
            {STEPS.map((s) => (
              <h3 key={`t-${s.n}`} className="font-display font-semibold text-[20px] leading-snug text-warmzwart">
                {s.title}
              </h3>
            ))}
            {STEPS.map((s) => (
              <p key={`d-${s.n}`} className="font-body text-[14px] leading-[1.55] text-warmgrijs-dark mb-3">
                {s.desc}
              </p>
            ))}
            {STEPS.map((s) => (
              <div key={`i-${s.n}`} className={`border-2 ${ACCENT[s.accent].border} p-2 h-[214px]`}>
                <img src={s.beeld} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIENSTEN — "waar ben ik naar op zoek", de echte navigatiestap ── */}
      <section id="diensten" className="px-6 sm:px-8 py-16 sm:py-20">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <h2 className="font-display font-bold text-[24px] sm:text-[28px]">Waar ben je naar op zoek?</h2>
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-warmgrijs border border-lijn rounded-full px-4 py-2">
              <Search size={14} />
              Zoek op dienst, bijv. "vloeren"
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-lijn">
            {REAL_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/zoeken?categorie=${c.slug}`}
                className="group bg-cream-warm p-4 flex flex-col items-start gap-3 no-underline hover:bg-sage-50 transition-colors"
              >
                <img src={c.img} alt="" className="w-full aspect-square object-cover" />
                <div className="flex items-center justify-between w-full">
                  <span className="font-body font-semibold text-[13px] text-warmzwart">{c.naam}</span>
                  <span className="text-sage opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUURTPROJECTEN — het ene editorial moment, nu als bewijs ná de navigatiestap ── */}
      <section id="buurtprojecten" className="px-6 sm:px-8 py-16 sm:py-20 bg-warmzwart text-cream-warm">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-baseline justify-between mb-10 flex-wrap gap-2">
            <h2 className="font-display font-bold text-[24px] sm:text-[28px]">Wat er in jouw type buurt is gedaan</h2>
            <span className="text-[12px] text-cream-warm/50 italic">voorbeeldcontent voor dit prototype</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            <div className="lg:col-span-7">
              <img src={featured.beeld} alt="" className="w-full h-[280px] sm:h-[380px] object-cover" />
            </div>
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="text-[12.5px] font-semibold tracking-[0.02em] text-sage-200 mb-4">
                {featured.categorie} · {featured.buurt}
              </p>
              <p
                className="text-[20px] sm:text-[23px] leading-[1.5] mb-6"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {featured.beschrijving}
              </p>
              <a href="#diensten" className="text-[14px] font-semibold text-sage-200 border-b border-sage-200/50 pb-0.5 self-start no-underline">
                Bekijk vakmensen voor {featured.categorie.toLowerCase()}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 pt-px">
            {rest.map((p) => (
              <div key={p.categorie + p.buurt} className="bg-warmzwart p-5 flex gap-4">
                <img src={p.beeld} alt="" className="w-14 h-14 object-cover shrink-0" />
                <div>
                  <p className="text-[11.5px] font-semibold tracking-[0.02em] text-sage-200 mb-1">{p.categorie} · {p.buurt}</p>
                  <p className="font-body text-[13px] leading-[1.5] text-cream-warm/80">{p.beschrijving}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-8 py-10 text-center">
        <p className="text-body-sm text-warmgrijs">Neighbuur, design exploration C (Best Direction)</p>
      </footer>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { REAL_CATEGORIES, PROTOTYPE_PROJECTS, HERO_IMAGE } from "../_content";
import { sourceSerif } from "./_font";

/**
 * VARIANT B — EDITORIAL NEIGHBUUR
 * Duidelijke stap richting editorial design voor buurtprojecten,
 * ervaringen en fotografie — de functionele UI (nav, categorie-index)
 * blijft bewust Swiss/minimal. Belangrijkste verschillen met vandaag:
 *  - tweede lettertype (Source Serif 4) exclusief voor verhalende tekst,
 *    naast het bestaande Fraunces/DM Sans-paar — geen cursief-accent-
 *    woord, geen ALL-CAPS-eyebrow-pil, geen "→" op elke knop;
 *  - 3-stappen-logica als lopende Swiss-regel i.p.v. drie kaarten;
 *  - categorieën als dichte tekst-index i.p.v. kaartengrid;
 *  - buurtprojecten als één uitgelicht verhaal + een kort register
 *    eronder, in plaats van vier gelijke kaarten — magazine-hiërarchie.
 * Kleur: bestaande sage (merk) + oker (bestaand token) als tweede accent;
 * geen nieuwe kleuren, geen terracotta.
 */

const STEP_LINE = [
  "Vertel wat je wil doen",
  "Zie wat buren al lieten doen",
  "Regel het, alleen of samen",
];

export default function NeighbuurVariantB() {
  const [featured, ...rest] = PROTOTYPE_PROJECTS;

  return (
    <div className={`${sourceSerif.variable} bg-[#F7F3EC] min-h-screen text-[#211D17]`}>
      {/* ── HEADER ── */}
      <header className="border-b border-[#211D17]/10">
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 h-[72px] flex items-center justify-between">
          <span className="font-display font-bold text-[19px] tracking-[-0.01em]">Neighbuur</span>
          <nav className="hidden sm:flex items-center gap-8 text-[13px] tracking-[0.02em] text-[#211D17]/70">
            <span>Diensten</span>
            <span>Buurtprojecten</span>
            <span>Hoe het werkt</span>
            <span className="text-[#211D17]">Inloggen</span>
          </nav>
        </div>
      </header>

      {/* ── HERO ── editorial asymmetrie: smalle tekstkolom, brede foto ── */}
      <section className="px-6 sm:px-10 pt-14 pb-20">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-5 lg:pb-6">
            <p className="text-[13px] tracking-[0.02em] text-[#8A6A1E] mb-5">Voor woningen in oplevering</p>
            <h1 className="font-display font-bold text-[40px] sm:text-[50px] leading-[1.08] tracking-[-0.02em] mb-6">
              Plannen voor jouw woning.
            </h1>
            <p
              className="text-[19px] leading-[1.6] text-[#211D17]/80 max-w-[42ch] mb-7"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              Ontdek wat anderen in je buurt hebben laten doen, lees hun ervaringen en zie welke vakmensen goed werk
              hebben geleverd.
            </p>
            <a href="#diensten" className="text-[15px] font-semibold border-b-2 border-sage pb-0.5">
              Bekijk diensten
            </a>
          </div>
          <div className="lg:col-span-7">
            <img src={HERO_IMAGE} alt="" className="w-full h-[280px] sm:h-[420px] lg:h-[480px] object-cover" />
            <p className="text-[12.5px] text-[#211D17]/50 mt-2.5">Nieuwbouwwoning, kort voor oplevering.</p>
          </div>
        </div>
      </section>

      {/* ── 3-STAPPEN ALS LOPENDE REGEL ── */}
      <section className="px-6 sm:px-10 py-10 border-y border-[#211D17]/10">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-3 gap-y-3 text-[15px]">
          {STEP_LINE.map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              <span className="font-semibold">{step}</span>
              {i < STEP_LINE.length - 1 && <span className="text-[#211D17]/30">/</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ── DIENSTEN: Swiss tekst-index ── */}
      <section id="diensten" className="px-6 sm:px-10 py-20">
        <div className="max-w-[1320px] mx-auto">
          <h2 className="font-display font-bold text-[26px] mb-10">Wat wil je aan je woning doen?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {REAL_CATEGORIES.map((c) => (
              <div
                key={c.slug}
                className="flex items-center gap-3 py-4 border-t border-[#211D17]/10 pr-4 lg:border-r lg:[&:nth-child(4n)]:border-r-0"
              >
                <img src={c.img} alt="" className="w-10 h-10 object-cover shrink-0" />
                <span className="text-[14.5px] font-medium">{c.naam}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUURTPROJECTEN: één uitgelicht verhaal + register ── */}
      <section className="px-6 sm:px-10 py-20 bg-[#211D17] text-[#F7F3EC]">
        <div className="max-w-[1320px] mx-auto">
          <p className="text-[13px] tracking-[0.02em] text-[#C4871A] mb-10">Uit de buurt (voorbeeldcontent voor dit prototype)</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
            <div className="lg:col-span-6">
              <img src={featured.beeld} alt="" className="w-full h-[320px] sm:h-[400px] object-cover" />
            </div>
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-[13px] tracking-[0.02em] text-[#C4871A] mb-3">{featured.categorie} · {featured.buurt}</p>
              <p
                className="text-[24px] sm:text-[28px] leading-[1.45]"
                style={{ fontFamily: "var(--font-source-serif)", fontStyle: "italic" }}
              >
                {featured.beschrijving}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-white/15">
            {rest.map((p) => (
              <div key={p.categorie + p.buurt} className="flex gap-4">
                <img src={p.beeld} alt="" className="w-16 h-16 object-cover shrink-0" />
                <div>
                  <p className="text-[12px] tracking-[0.02em] text-[#C4871A] mb-1">{p.categorie} · {p.buurt}</p>
                  <p className="text-[14px] leading-[1.5] text-[#F7F3EC]/85" style={{ fontFamily: "var(--font-source-serif)" }}>
                    {p.beschrijving}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-8 text-center">
        <p className="text-[13px] text-[#211D17]/50">Neighbuur, design exploration B (Editorial)</p>
      </footer>
    </div>
  );
}

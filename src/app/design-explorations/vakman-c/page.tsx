/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/* Lokale SVG's i.p.v. @phosphor-icons/react — zie neighbuur-a/page.tsx
   voor de reden (breekt statische prerender van een server component). */
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
/* Abstracte "regio activeert"-illustratie — bewust geen kaart met
   nep-aantallen of plaatsnamen, puur een vorm die het idee overbrengt. */
function RegioIllustratie() {
  return (
    <svg viewBox="0 0 320 220" className="w-full h-auto">
      <rect width="320" height="220" fill="#F6F5F2" />
      {[
        { cx: 90, cy: 70, r: 34, fill: "#C4DAB9" },
        { cx: 200, cy: 50, r: 22, fill: "#E3EEDD" },
        { cx: 230, cy: 130, r: 44, fill: "#A0C28E", opacity: 0.6 },
        { cx: 110, cy: 150, r: 18, fill: "#578042", opacity: 0.25 },
      ].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} opacity={c.opacity ?? 1} />
      ))}
      <circle cx="230" cy="130" r="6" fill="#385729" />
      <circle cx="90" cy="70" r="5" fill="#385729" />
      <path d="M96 72 L224 128" stroke="#385729" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.5" />
    </svg>
  );
}

/**
 * P3 — REGIO-URGENTIE ALS OPENER
 * Hefboom: timing/urgentie. De "we bereiden regio's voor"-boodschap
 * stond in de huidige pagina onderaan, na de 3 stappen — hier is het de
 * opening, samengevoegd met de hero i.p.v. twee losse secties. Nog
 * steeds geen verzonnen cijfers of plaatsnamen, puur een abstracte
 * illustratie die "activatie" overbrengt.
 */
export default function VakmanScenarioC() {
  return (
    <div className="bg-cream-warm min-h-screen">
      <header className="px-6 py-5 lg:px-[72px]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/design-explorations/vakman-c" className="flex items-center gap-2 no-underline">
            <span className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white">
              <House size={18} />
            </span>
            <span className="font-display font-black text-[22px] text-warmzwart tracking-tight">
              Neigh<span className="text-sage">buur</span>
            </span>
          </Link>
          <span className="text-body-sm font-medium text-warmgrijs">Voor bewoners →</span>
        </div>
      </header>

      {/* ── HERO + WHY NOW SAMENGEVOEGD ── */}
      <section className="px-6 pt-4 pb-16 lg:px-[72px] lg:pt-4 lg:pb-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="pb-4 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-[#385729]" />
                <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                  We bereiden regio&apos;s voor
                </span>
              </span>
            </div>
            <h1 className="font-display font-bold text-[38px] leading-[45px] sm:text-[54px] sm:leading-[60px] tracking-[-1px] text-warmzwart pb-5">
              <span className="block">Goed werk in de buurt</span>
              <span className="block font-display italic font-normal text-[#385729]">mag gezien worden.</span>
            </h1>
            <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[500px] pb-5">
              We sluiten nu vakmensen aan in regio&apos;s waar veel nieuw werk aankomt, zodat bewoners straks direct
              kunnen ontdekken wie er al actief is in hun omgeving.
            </p>
            <p className="font-body text-[15px] leading-[23px] text-warmgrijs-dark max-w-[500px] pb-8">
              Laat zien waar je actief bent en vergroot de kans op nieuwe opdrachten dichtbij bestaand werk.
            </p>
            <Link
              href="/registreer/vakman"
              className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
            >
              Meld je aan als vakman
              <ArrowRight size={14} />
            </Link>
            <p className="font-body text-[13px] text-warmgrijs mt-3">Gratis aanmelden · Geen verplichtingen</p>
          </div>

          <div className="lg:col-span-5">
            <div className="hard-lg overflow-hidden">
              <RegioIllustratie />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 STAPPEN — het hoe, na de urgentie ── */}
      <section className="px-6 py-16 bg-sand-light lg:px-10 lg:py-20">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-10">
          <h2 className="font-display font-bold text-[28px] text-warmzwart text-center">Zo werkt Neighbuur</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            {[
              { t: "Je levert goed werk", d: "Je voert een klus uit in de buurt." },
              { t: "Bewoners delen hun ervaring", d: "Andere bewoners zien wat er is gedaan." },
              { t: "Nieuw werk kan ontstaan", d: "Nieuwe plannen ontstaan dichtbij." },
            ].map((s, i) => (
              <div key={s.t} className="hard-lg bg-white p-8">
                <span className="font-body font-bold text-[12px] tracking-[0.6px] uppercase text-sage mb-2 block">STAP 0{i + 1}</span>
                <h3 className="font-body font-bold text-[17px] text-warmzwart mb-2">{s.t}</h3>
                <p className="font-body text-[14.5px] leading-[21px] text-warmgrijs-dark">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SLOT-CTA ── */}
      <section className="px-6 py-16 lg:px-[72px] lg:py-20">
        <div className="max-w-[560px] mx-auto text-center">
          <h2 className="font-display font-bold text-[26px] text-warmzwart mb-3">Sluit je nu aan.</h2>
          <p className="font-body text-[15.5px] leading-[23px] text-warmgrijs-dark mb-8">
            Je profiel staat klaar voor de introductie van Neighbuur in jouw regio.
          </p>
          <Link href="/registreer/vakman" className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline">
            Meld je aan als vakman
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-10 text-center border-t border-lijn">
        <p className="text-body-sm text-warmgrijs">Neighbuur, design exploration P3 (Regio-urgentie als opener)</p>
      </footer>
    </div>
  );
}

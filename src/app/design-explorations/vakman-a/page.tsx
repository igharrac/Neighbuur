/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { REAL_CATEGORIES } from "../_content";

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
function Check({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RadiusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3" opacity="0.35" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * P1 — BEWIJS, NIET BELOFTES
 * Hefboom: tastbaar maken i.p.v. beloven. Geen nieuwe claims, geen
 * verzonnen cijfers — wel de abstracte belofte "dichtbij bestaand werk"
 * concreet maken (werkgebied-radius) en laten zien wat een vakman
 * daadwerkelijk krijgt (een profielvoorbeeld met echte, niet-verzonnen
 * velden — geen nep-rating, geen nep-reviewcount).
 */
export default function VakmanScenarioA() {
  const voorbeeldCategorieen = REAL_CATEGORIES.slice(0, 3);

  return (
    <div className="bg-cream-warm min-h-screen">
      <header className="px-6 py-5 lg:px-[72px]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/design-explorations/vakman-a" className="flex items-center gap-2 no-underline">
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

      {/* ── HERO ── */}
      <section className="px-6 pt-4 pb-16 lg:px-[72px] lg:pt-4 lg:pb-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="pb-4 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-[#385729]" />
                <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
                  Voor vakmensen
                </span>
              </span>
            </div>
            <h1 className="font-display font-bold text-[40px] leading-[48px] sm:text-[60px] sm:leading-[66px] tracking-[-1.12px] text-warmzwart pb-6">
              <span className="block">Goed werk in de buurt</span>
              <span className="block font-display italic font-normal text-[#385729]">mag gezien worden.</span>
            </h1>
            <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[480px] pb-8">
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
            <div className="relative">
              <img
                src="/images/vakman-hero.jpg"
                alt="Vakman met gereedschapsschort in een nieuwbouwwoning"
                className="hard-lg w-full h-[320px] sm:h-[400px] object-cover block"
              />
              {/* Werkgebied tastbaar maken i.p.v. abstract "dichtbij" */}
              <div className="hard absolute -bottom-5 -left-5 bg-white px-4 py-3 flex items-center gap-3">
                <span className="text-sage"><RadiusIcon /></span>
                <div>
                  <p className="font-body font-bold text-[13px] text-warmzwart leading-tight">Jouw werkgebied</p>
                  <p className="font-body text-[12px] text-warmgrijs leading-tight">Zelf in te stellen, bijv. 15 km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFIELVOORBEELD — tastbaar maken wat je krijgt ── */}
      <section className="px-6 pb-16 lg:px-[72px] lg:pb-20">
        <div className="max-w-[1200px] mx-auto hard-lg bg-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5">
            <p className="font-body font-bold text-[12px] tracking-[0.6px] uppercase text-sage mb-2">Dit krijg je</p>
            <h2 className="font-display font-bold text-[24px] text-warmzwart mb-2">Een profiel dat bewoners echt zien</h2>
            <p className="font-body text-[14.5px] leading-[22px] text-warmgrijs-dark">
              Geen lege wachtlijst-inschrijving — je profiel bestaat direct, klaar voor de introductie van Neighbuur
              in jouw regio.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="border-2 border-warmzwart rounded-sm p-5 bg-sand-light">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-sage-200 flex items-center justify-center font-display font-bold text-sage-800">
                  JV
                </div>
                <div>
                  <p className="font-body font-bold text-[15px] text-warmzwart leading-tight">Jouw bedrijfsnaam</p>
                  <p className="font-body text-[12.5px] text-warmgrijs leading-tight">Werkgebied: 15 km rondom jouw vestiging</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {voorbeeldCategorieen.map((c) => (
                  <span key={c.slug} className="badge bg-sage-100 text-sage-800 text-[12px] font-semibold px-2.5 py-1 rounded-full">
                    {c.naam}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-sage-700">
                <Check />
                Profiel actief zodra jouw regio opent
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 STAPPEN ── */}
      <section className="px-6 py-16 lg:px-10 lg:py-20">
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

      {/* ── WHY NOW ── */}
      <section className="px-6 py-16 lg:px-[72px] lg:py-20">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="font-display font-bold text-[28px] text-warmzwart mb-3">
            We bereiden regio&apos;s voor waar veel nieuw werk aankomt.
          </h2>
          <p className="font-body text-[16px] leading-[25px] text-warmgrijs-dark mb-8">
            We sluiten nu vakmensen aan, zodat bewoners straks direct kunnen ontdekken wie er in hun omgeving actief is.
          </p>
          <Link href="/registreer/vakman" className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline">
            Meld je aan als vakman
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-10 text-center border-t border-lijn">
        <p className="text-body-sm text-warmgrijs">Neighbuur, design exploration P1 (Bewijs, niet beloftes)</p>
      </footer>
    </div>
  );
}

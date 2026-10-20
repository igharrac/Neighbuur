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
function Clock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Echte velden uit de huidige /registreer/vakman-flow (KvK is er sinds
   kort bewust uitgehaald, zie RegistratieForm.tsx) — geen verzonnen
   formulier, exact wat een vakman vandaag ook echt invult. */
const STAP1_VELDEN = ["Bedrijfsnaam", "Voornaam", "Achternaam"];
const STAP2_VELDEN = ["Diensten die je aanbiedt", "Waar wil je werken?"];
const STAP3_VELDEN = ["Telefoonnummer", "Contactvoorkeur"];

function StickyCta() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-cream-warm/95 backdrop-blur-sm border-t border-lijn px-4 py-3">
      <Link
        href="/registreer/vakman"
        className="hard flex items-center justify-center gap-2 bg-[#385729] py-3.5 font-body font-semibold text-[15px] text-white no-underline"
      >
        Meld je aan — 2 minuten
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/**
 * P2 — SNELHEID & LAAGDREMPELIGHEID
 * Hefboom: perceptie van moeite verlagen. Laat vóór het klikken al zien
 * hoe kort de aanmelding is (de echte velden, niet verzonnen), en houdt
 * een CTA voortdurend binnen handbereik — inclusief een sticky
 * mobiele balk, relevant omdat vakmensen vaak via WhatsApp/QR
 * binnenkomen op een telefoon.
 */
export default function VakmanScenarioB() {
  return (
    <div className="bg-cream-warm min-h-screen pb-20 sm:pb-0">
      <header className="px-6 py-5 lg:px-[72px]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/design-explorations/vakman-b" className="flex items-center gap-2 no-underline">
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

      {/* ── HERO — compact, CTA meteen zichtbaar ── */}
      <section className="px-6 pt-2 pb-10 lg:px-[72px] lg:pt-2 lg:pb-12">
        <div className="max-w-[760px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C4DAB9]/95 px-4 py-1 mb-5">
            <Clock />
            <span className="font-body font-semibold text-[12px] tracking-[0.4px] text-[#390c00]">Aanmelden duurt 2 minuten</span>
          </div>
          <h1 className="font-display font-bold text-[36px] leading-[42px] sm:text-[52px] sm:leading-[58px] tracking-[-1px] text-warmzwart mb-5">
            Goed werk in de buurt <span className="italic font-normal text-[#385729]">mag gezien worden.</span>
          </h1>
          <p className="font-body text-[17px] leading-[26px] text-warmgrijs-dark max-w-[520px] mx-auto mb-7">
            Laat zien waar je actief bent. Geen gedoe, geen lang formulier — gewoon je bedrijf, je diensten en je
            werkgebied.
          </p>
          <Link
            href="/registreer/vakman"
            className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
          >
            Meld je aan als vakman
            <ArrowRight size={14} />
          </Link>
          <p className="font-body text-[13px] text-warmgrijs mt-3">Gratis · Geen creditcard nodig · Geen verplichtingen</p>
        </div>
      </section>

      {/* ── FORMULIER-PREVIEW — ontmystificeer vóór het klikken ── */}
      <section className="px-6 pb-16 lg:px-[72px] lg:pb-20">
        <div className="max-w-[900px] mx-auto">
          <p className="text-center font-body font-bold text-[12px] tracking-[0.6px] uppercase text-sage mb-6">
            Precies dit vragen we je
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "1", label: "Inloggen", velden: STAP1_VELDEN },
              { n: "2", label: "Je bedrijf", velden: STAP2_VELDEN },
              { n: "3", label: "Contact", velden: STAP3_VELDEN },
            ].map((stap) => (
              <div key={stap.n} className="hard bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-sage text-white flex items-center justify-center font-display font-bold text-[12px]">
                    {stap.n}
                  </span>
                  <span className="font-body font-bold text-[13.5px] text-warmzwart">{stap.label}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {stap.velden.map((v) => (
                    <div key={v} className="font-body text-[13px] text-warmgrijs-dark bg-sand-light rounded-sm px-3 py-2">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/registreer/vakman"
              className="hard inline-flex items-center gap-2 bg-[#385729] px-10 py-4 font-body font-semibold text-[15px] text-white no-underline whitespace-nowrap"
            >
              Begin nu
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 STAPPEN (kort) ── */}
      <section className="px-6 py-16 bg-sand-light lg:px-10 lg:py-16">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-8">
          <h2 className="font-display font-bold text-[24px] text-warmzwart text-center">Hoe het daarna werkt</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-[14.5px] font-body">
            <span className="font-semibold text-warmzwart">Je levert goed werk</span>
            <span className="text-warmgrijs">/</span>
            <span className="font-semibold text-warmzwart">Bewoners delen hun ervaring</span>
            <span className="text-warmgrijs">/</span>
            <span className="font-semibold text-warmzwart">Nieuw werk kan ontstaan</span>
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center border-t border-lijn">
        <p className="text-body-sm text-warmgrijs">Neighbuur, design exploration P2 (Snelheid &amp; laagdrempeligheid)</p>
      </footer>

      <StickyCta />
    </div>
  );
}

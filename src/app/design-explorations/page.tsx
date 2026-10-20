import Link from "next/link";

const HOMEPAGE_VARIANTS = [
  { href: "/design-explorations/neighbuur-a", label: "A: Evolution", desc: "Dicht bij het huidige Neighbuur: scherpere hiërarchie, rust, betere fotografie en categoriepresentatie." },
  { href: "/design-explorations/neighbuur-b", label: "B: Editorial Neighbuur", desc: "Duidelijk richting magazine/editorial voor verhalen en projecten; Swiss/minimal voor de functionele UI." },
  { href: "/design-explorations/neighbuur-c", label: "C: Best Direction", desc: "Eigen voorstel: Swiss-grid als systeem, één editorial moment, volledig herbruikbare merkkleuren." },
];

const VAKMAN_SCENARIOS = [
  { href: "/design-explorations/vakman-a", label: "P1: Bewijs, niet beloftes", desc: "Werkgebied en profiel tastbaar maken in plaats van alleen beloven — geen verzonnen cijfers." },
  { href: "/design-explorations/vakman-b", label: "P2: Snelheid & laagdrempeligheid", desc: "Laat vóór het klikken al zien hoe kort de aanmelding is; CTA voortdurend binnen bereik." },
  { href: "/design-explorations/vakman-c", label: "P3: Regio-urgentie als opener", desc: "De \"we bereiden regio's voor\"-boodschap naar de opening gehaald i.p.v. onderaan." },
  { href: "/design-explorations/vakman-d", label: "D: Samenvoeging voor overname", desc: "Bovenste deel van P3 + de rest exact zoals nu live (echte productiecomponenten) — preview van de daadwerkelijke overname." },
];

function VariantList({ items }: { items: typeof HOMEPAGE_VARIANTS }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((v) => (
        <Link key={v.href} href={v.href} className="block p-6 rounded border border-lijn hover:border-sage transition-colors no-underline">
          <div className="font-display text-display-sm text-warmzwart mb-1">{v.label}</div>
          <div className="text-body-sm text-warmgrijs">{v.desc}</div>
        </Link>
      ))}
    </div>
  );
}

export default function DesignExplorationsIndex() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-20">
      <h1 className="font-display text-display-lg text-warmzwart mb-2">Design explorations</h1>
      <p className="text-body text-warmgrijs mb-12">
        Geen van deze pagina&apos;s is live of gekoppeld aan productiedata.
      </p>

      <h2 className="font-display text-display-sm text-warmzwart mb-4">Resident-homepage richtingen</h2>
      <p className="text-body-sm text-warmgrijs mb-6">Drie richtingen voor de (toekomstige) bewoners-homepage.</p>
      <VariantList items={HOMEPAGE_VARIANTS} />

      <h2 className="font-display text-display-sm text-warmzwart mb-4 mt-14">Vakman-homepage conversiescenario&apos;s</h2>
      <p className="text-body-sm text-warmgrijs mb-6">
        Drie scenario&apos;s om de huidige vakman-landingspagina (nu live op staging) aantrekkelijker te maken voor
        directe inschrijving.
      </p>
      <VariantList items={VAKMAN_SCENARIOS} />
    </div>
  );
}

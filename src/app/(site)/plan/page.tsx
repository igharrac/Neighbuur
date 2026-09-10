"use client";

import Link from "next/link";
import {
  Lightning,
  PaintBrush,
  CheckCircle,
  ArrowRight,
  ChatCircle,
  Users,
  WifiHigh,
  SunDim,
  ShieldCheck,
  Truck,
  Tree,
  Star,
  CaretUp,
} from "@phosphor-icons/react";
import {
  IllusStucwerk,
  IllusSchilderen,
  IllusVloeren,
  IllusKeuken,
  IllusTuin,
} from "@/components/illustrations";

/* Demo data — in productie uit Supabase */
const TIMELINE = [
  {
    groep: "Nu aan de beurt",
    items: [
      {
        titel: "Stucwerk & spackspuiten",
        desc: "Week 2 na oplevering · 4 vakmensen beschikbaar",
        status: "kies" as const,
        Illus: IllusStucwerk,
        actief: true,
      },
    ],
  },
  {
    groep: "Gepland",
    items: [
      {
        titel: "Extra groepen & elektra",
        desc: "Week 1 · di 26 mei 09:00",
        status: "geboekt" as const,
        vakman: { naam: "P. de Vries Elektra", score: 4.9, initiaal: "P", kleur: "bg-groen" },
      },
      {
        titel: "Schilderwerk binnenzijde",
        desc: "Week 3 · Van Dijk Schilders (via buurman Jeroen)",
        status: "geboekt" as const,
        vakman: { naam: "Van Dijk Schilders", score: 5.0, initiaal: "V", kleur: "bg-blauw" },
      },
      {
        titel: "Vloeren leggen",
        desc: "Week 4 · PVC, laminaat of parket — 6 vakmensen beschikbaar",
        status: "kies" as const,
        Illus: IllusVloeren,
      },
      {
        titel: "Keuken plaatsen",
        desc: "Week 5 · IKEA montage + perilex aansluiting",
        status: "geboekt" as const,
        vakman: { naam: "KeukenMontage.nl", score: 4.6, initiaal: "K", kleur: "bg-lavendel" },
      },
    ],
  },
  {
    groep: "Later regelen",
    items: [
      {
        titel: "Tuin & schutting",
        desc: "Groepskorting mogelijk — al 8 buren geïnteresseerd!",
        status: "later" as const,
        Illus: IllusTuin,
      },
      {
        titel: "Glasvezel internet",
        desc: "3 aanbieders actief in je wijk — bespaar tot €14/mnd",
        status: "vergelijk" as const,
      },
      {
        titel: "Zonnepanelen",
        desc: "Buurtactie: samen inkopen met 15+ buren = tot 20% korting",
        status: "later" as const,
      },
    ],
  },
];

const STATUS_STYLES = {
  kies:       "bg-terracotta-100 text-terracotta",
  geboekt:    "bg-blauw-light text-blauw",
  later:      "bg-cream-dark text-warmgrijs",
  vergelijk:  "bg-terracotta-100 text-terracotta",
  afgerond:   "bg-groen-light text-groen",
};

const STATUS_LABELS = {
  kies:       "Kies vakman",
  geboekt:    "Geboekt",
  later:      "Later",
  vergelijk:  "Vergelijk",
  afgerond:   "Afgerond",
};

export default function PlanPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-lijn mb-8">
        <div>
          <h1 className="font-display text-display-md">
            Hey <em className="text-terracotta italic">Marieke</em>
          </h1>
          <p className="text-body text-warmgrijs mt-1">
            Je persoonlijke nieuwbouw-plan voor <span className="font-semibold text-warmzwart">Vathorst Blok C</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="badge badge-groen">
            <CheckCircle size={14} weight="fill" />
            Oplevering: 22 mei
          </span>
          <span className="badge badge-blauw">
            <Users size={14} weight="fill" />
            31 buren actief
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-7 items-start">
        {/* ── Main: Timeline ── */}
        <div className="flex flex-col gap-3">
          {TIMELINE.map((groep) => (
            <div key={groep.groep}>
              <div className="flex items-center gap-3 mb-3 mt-5 first:mt-0">
                <span className="text-body-xs font-bold uppercase tracking-wider text-warmgrijs">
                  {groep.groep}
                </span>
                <span className="flex-1 h-px bg-lijn" />
              </div>

              <div className="flex flex-col gap-3">
                {groep.items.map((item) => (
                  <div
                    key={item.titel}
                    className={`card-flat p-5 flex gap-4 items-start cursor-pointer ${
                      "actief" in item && item.actief ? "!border-terracotta !bg-terracotta-50/30" : ""
                    } ${item.status === "geboekt" ? "!border-l-[3px] !border-l-groen" : ""}`}
                  >
                    {/* Icon / mini illustration */}
                    <div className="w-11 h-11 rounded-xl bg-cream-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.Illus ? (
                        <item.Illus size={44} />
                      ) : (
                        <Lightning size={20} className="text-warmgrijs" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-bold text-body">{item.titel}</span>
                        <span className={`text-body-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <p className="text-body-sm text-warmgrijs mb-2">{item.desc}</p>

                      {/* Vakman badge */}
                      {"vakman" in item && item.vakman && (
                        <div className="inline-flex items-center gap-2 bg-cream rounded-full py-1 pl-1 pr-3">
                          <span className={`w-6 h-6 rounded-full ${item.vakman.kleur} text-white flex items-center justify-center text-body-xs font-bold`}>
                            {item.vakman.initiaal}
                          </span>
                          <span className="font-semibold text-body-sm">{item.vakman.naam}</span>
                          <span className="flex items-center gap-0.5 text-body-xs text-oker">
                            <Star size={11} weight="fill" />
                            {item.vakman.score}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {(item.status === "kies" || item.status === "vergelijk") && (
                        <div className="flex gap-2 mt-2.5">
                          <button className="btn-primary !py-1.5 !px-4 !text-body-xs">
                            {item.status === "vergelijk" ? "Vergelijk deals" : "Bekijk vakmensen"}
                            <ArrowRight size={13} weight="bold" />
                          </button>
                          {item.status === "kies" && (
                            <button className="btn-ghost !py-1.5 !px-3 !text-body-xs">
                              <ChatCircle size={14} />
                              Vraag buren
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-5">
          {/* Progress */}
          <div className="card-flat p-6">
            <h3 className="font-bold text-body-sm mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-terracotta" />
              Voortgang
            </h3>
            <div className="flex items-center gap-5">
              <div className="relative w-[72px] h-[72px]">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E2DA" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#E8572A" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="188.5"
                    strokeDashoffset="113"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">
                  40%
                </span>
              </div>
              <div>
                <span className="font-bold text-body block">3 van 8 geboekt</span>
                <span className="text-body-sm text-warmgrijs">Nog 2 kiezen, 3 optioneel</span>
              </div>
            </div>
          </div>

          {/* Group deal */}
          <div className="bg-groen text-white rounded-lg p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <h3 className="font-bold text-body-sm mb-1 relative flex items-center gap-2">
              <Tree size={16} weight="fill" />
              Groepskorting tuin
            </h3>
            <p className="text-body-xs text-white/80 mb-3 relative">
              8 van 10 buren mee — nog 2 nodig voor €2.450 i.p.v. €3.200
            </p>
            <button className="bg-white text-groen font-bold text-body-xs py-2 px-4 rounded-sm hover:-translate-y-0.5 transition-transform">
              Ik doe mee!
            </button>
          </div>

          {/* Wijk activity */}
          <div className="card-flat p-6">
            <h3 className="font-bold text-body-sm mb-4 flex items-center gap-2">
              <Users size={16} className="text-blauw" />
              Actief in je wijk
            </h3>
            <div className="flex flex-col">
              {[
                { naam: "Jeroen K.", actie: "beoordeelde schilder", kleur: "bg-blauw", initiaal: "J" },
                { naam: "Sanne R.", actie: "boekte hovenier", kleur: "bg-groen", initiaal: "S" },
                { naam: "Ahmed B.", actie: "vergelijkt glasvezel", kleur: "bg-lavendel", initiaal: "A" },
                { naam: "Lisa M.", actie: "schreef review stukadoor", kleur: "bg-terracotta", initiaal: "L" },
              ].map((buur) => (
                <div key={buur.naam} className="flex items-center gap-2.5 py-2 border-b border-lijn-light last:border-b-0">
                  <span className={`w-7 h-7 rounded-full ${buur.kleur} text-white flex items-center justify-center text-body-xs font-bold flex-shrink-0`}>
                    {buur.initiaal}
                  </span>
                  <span className="font-semibold text-body-sm flex-1">{buur.naam}</span>
                  <span className="text-body-xs text-warmgrijs">{buur.actie}</span>
                </div>
              ))}
            </div>
            <Link href="/wijk" className="block text-center mt-3 text-body-xs text-terracotta font-semibold hover:underline">
              Bekijk alle activiteit →
            </Link>
          </div>

          {/* Quick actions */}
          <div className="card-flat p-6">
            <h3 className="font-bold text-body-sm mb-4 flex items-center gap-2">
              <Lightning size={16} className="text-oker" />
              Snel regelen
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: WifiHigh, label: "Glasvezel vergelijken" },
                { icon: Lightning, label: "Energiecontract kiezen" },
                { icon: Truck, label: "Verhuisbedrijf boeken" },
                { icon: ChatCircle, label: "Deel met buurt-WhatsApp" },
              ].map((item) => (
                <button key={item.label} className="flex items-center gap-2.5 p-3 rounded-md border-[1.5px] border-lijn text-left hover:border-terracotta hover:bg-terracotta-50/30 transition-all text-body-sm font-medium">
                  <item.icon size={18} className="text-warmgrijs flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

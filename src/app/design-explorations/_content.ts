/**
 * Gedeelde content voor de 3 design-explorations (neighbuur-a/b/c).
 * Geïsoleerd van de productiecode — niets hiervan wordt elders geïmporteerd.
 *
 * REAL CONTENT: categorieën zijn 1-op-1 overgenomen uit src/lib/i18n.ts
 * (de echte dienstenlijst, incl. de echte afbeeldingen uit public/images).
 *
 * PROTOTYPE CONTENT: PROJECT_EXAMPLES hieronder zijn expliciet gelabelde
 * voorbeelden (geen verzonnen reviews/ratings/aantallen/testimonials —
 * dat is in de opdracht uitgesloten). Ze tonen alleen wát voor soort
 * klus + in welk type buurt, zonder sociale-bewijs-cijfers.
 */

export interface RealCategory {
  slug: string;
  img: string;
  naam: string;
  sub: string;
}

export const REAL_CATEGORIES: RealCategory[] = [
  { slug: "stucwerk", img: "/images/stucken.png", naam: "Stucwerk", sub: "Strakke wanden, mooie basis" },
  { slug: "schilderen", img: "/images/verfen.png", naam: "Schilderen", sub: "Jouw kleur, jouw sfeer" },
  { slug: "vloeren", img: "/images/vloeren.png", naam: "Vloeren", sub: "Van laminaat tot visgraat" },
  { slug: "keuken", img: "/images/keuken.png", naam: "Keuken", sub: "Samen koken, meer genieten" },
  { slug: "badkamer", img: "/images/badkamer.png", naam: "Badkamer", sub: "Een frisse start, elke dag" },
  { slug: "tuin", img: "/images/tuin.png", naam: "Tuin", sub: "Buiten leeft het ook" },
  { slug: "raamdecoratie", img: "/images/raamdecoraties.png", naam: "Raamdecoratie", sub: "Sfeer én privacy" },
  { slug: "elektra", img: "/images/elektra.png", naam: "Elektra", sub: "Extra groepen & aansluitingen" },
  { slug: "zonnepanelen", img: "/images/zonnepanelen.png", naam: "Zonnepanelen", sub: "Bespaar met je buren samen" },
  { slug: "verhuizen", img: "/images/verhuizen.png", naam: "Verhuizen", sub: "Offerte in 1 minuut" },
  { slug: "beveiliging", img: "/images/beveiliging.png", naam: "Beveiliging", sub: "Camera, alarm & slimme deurbel" },
  { slug: "internet", img: "/images/internet.png", naam: "Internet", sub: "Glasvezel vergelijken & installeren" },
];

export interface PrototypeProject {
  categorie: string;
  buurt: string;
  beschrijving: string;
  beeld: string;
}

/** PROTOTYPE/MOCKDATA — geen echte buurtactiviteit, geen cijfers/ratings. */
export const PROTOTYPE_PROJECTS: PrototypeProject[] = [
  {
    categorie: "Stucwerk",
    buurt: "Vathorst, Amersfoort",
    beschrijving: "Wanden en plafonds gespackspoten in de woonkamer, voor de verhuisdozen er stonden.",
    beeld: "/images/stucken.png",
  },
  {
    categorie: "Vloeren",
    buurt: "De Hoef, Amersfoort",
    beschrijving: "Visgraatvloer gelegd in de woonkamer en hal, aansluitend op de trap.",
    beeld: "/images/vloeren.png",
  },
  {
    categorie: "Tuin",
    buurt: "Nieuwveen-Zuid",
    beschrijving: "Achtertuin heringericht na oplevering: bestrating, border en een kleine berging.",
    beeld: "/images/tuin.png",
  },
  {
    categorie: "Keuken",
    buurt: "Vathorst, Amersfoort",
    beschrijving: "Keuken geplaatst en aangesloten, inclusief inbouwapparatuur.",
    beeld: "/images/keuken.png",
  },
];

export const HERO_IMAGE = "/images/hero.png";
export const WIJK_IMAGE = "/images/wijk-actief.png";

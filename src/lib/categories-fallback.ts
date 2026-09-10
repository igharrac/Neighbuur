import type { Categorie } from "@/types";

/**
 * Fallback categorieën — identiek aan de seed-data in
 * supabase/migrations/0001_complete_schema.sql. Gebruikt zolang de
 * migratie nog niet op Supabase is uitgevoerd of de tabel leeg is.
 */
export const fallbackCategorieen: Categorie[] = [
  { id: "fallback-stucwerk", slug: "stucwerk", type: "vakman", naam_nl: "Stucwerk", naam_en: "Plastering", beschrijving_nl: "Strakke wanden, mooie basis", beschrijving_en: "Smooth walls, perfect base", afbeelding_url: "/images/stucken.png", icoon: "Wall", sorteer: 1, actief: true },
  { id: "fallback-schilderen", slug: "schilderen", type: "vakman", naam_nl: "Schilderen", naam_en: "Painting", beschrijving_nl: "Jouw kleur, jouw sfeer", beschrijving_en: "Your colour, your vibe", afbeelding_url: "/images/verfen.png", icoon: "PaintBrush", sorteer: 2, actief: true },
  { id: "fallback-vloeren", slug: "vloeren", type: "vakman", naam_nl: "Vloeren", naam_en: "Flooring", beschrijving_nl: "Van laminaat tot visgraat", beschrijving_en: "From laminate to herringbone", afbeelding_url: "/images/vloeren.png", icoon: "SquaresFour", sorteer: 3, actief: true },
  { id: "fallback-keuken", slug: "keuken", type: "vakman", naam_nl: "Keuken", naam_en: "Kitchen", beschrijving_nl: "Samen koken, meer genieten", beschrijving_en: "Cook together, enjoy more", afbeelding_url: "/images/keuken.png", icoon: "CookingPot", sorteer: 4, actief: true },
  { id: "fallback-badkamer", slug: "badkamer", type: "vakman", naam_nl: "Badkamer", naam_en: "Bathroom", beschrijving_nl: "Een frisse start, elke dag", beschrijving_en: "A fresh start, every day", afbeelding_url: "/images/badkamer.png", icoon: "Bathtub", sorteer: 5, actief: true },
  { id: "fallback-tuin", slug: "tuin", type: "vakman", naam_nl: "Tuin", naam_en: "Garden", beschrijving_nl: "Buiten leeft het ook", beschrijving_en: "Outdoor living matters too", afbeelding_url: "/images/tuin.png", icoon: "Tree", sorteer: 6, actief: true },
  { id: "fallback-raamdecoratie", slug: "raamdecoratie", type: "vakman", naam_nl: "Raamdecoratie", naam_en: "Window coverings", beschrijving_nl: "Sfeer én privacy", beschrijving_en: "Style and privacy", afbeelding_url: "/images/raamdecoraties.png", icoon: "FrameCorners", sorteer: 7, actief: true },
  { id: "fallback-elektra", slug: "elektra", type: "vakman", naam_nl: "Elektra", naam_en: "Electrical", beschrijving_nl: "Extra groepen & aansluitingen", beschrijving_en: "Extra circuits & connections", afbeelding_url: "/images/elektra.png", icoon: "Lightning", sorteer: 8, actief: true },
  { id: "fallback-zonnepanelen", slug: "zonnepanelen", type: "vergelijk", naam_nl: "Zonnepanelen", naam_en: "Solar panels", beschrijving_nl: "Bespaar met je buren samen", beschrijving_en: "Save together with neighbours", afbeelding_url: "/images/zonnepanelen.png", icoon: "SunDim", sorteer: 9, actief: true },
  { id: "fallback-verhuizen", slug: "verhuizen", type: "vakman", naam_nl: "Verhuizen", naam_en: "Moving", beschrijving_nl: "Offerte in 1 minuut", beschrijving_en: "Quote in 1 minute", afbeelding_url: "/images/verhuizen.png", icoon: "Truck", sorteer: 10, actief: true },
  { id: "fallback-beveiliging", slug: "beveiliging", type: "vakman", naam_nl: "Beveiliging", naam_en: "Security", beschrijving_nl: "Camera, alarm & slimme deurbel", beschrijving_en: "Camera, alarm & smart doorbell", afbeelding_url: "/images/beveiliging.png", icoon: "ShieldCheck", sorteer: 11, actief: true },
  { id: "fallback-internet", slug: "internet", type: "vergelijk", naam_nl: "Internet", naam_en: "Internet", beschrijving_nl: "Glasvezel vergelijken & installeren", beschrijving_en: "Compare & install fibre optic", afbeelding_url: "/images/internet.png", icoon: "WifiHigh", sorteer: 12, actief: true },
];

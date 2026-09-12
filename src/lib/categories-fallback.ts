import type { Categorie } from "@/types";

/**
 * Fallback categorieën — identiek aan de seed-data in
 * supabase/migrations/0001_complete_schema.sql. Gebruikt zolang de
 * migratie nog niet op Supabase is uitgevoerd of de tabel leeg is.
 */
export const fallbackCategorieen: Categorie[] = [
  { id: "fallback-stucwerk", slug: "stucwerk", type: "professional", name_nl: "Stucwerk", name_en: "Plastering", description_nl: "Strakke wanden, mooie basis", description_en: "Smooth walls, perfect base", image_url: "/images/stucken.png", icon: "Wall", sort_order: 1, active: true },
  { id: "fallback-schilderen", slug: "schilderen", type: "professional", name_nl: "Schilderen", name_en: "Painting", description_nl: "Jouw kleur, jouw sfeer", description_en: "Your colour, your vibe", image_url: "/images/verfen.png", icon: "PaintBrush", sort_order: 2, active: true },
  { id: "fallback-vloeren", slug: "vloeren", type: "professional", name_nl: "Vloeren", name_en: "Flooring", description_nl: "Van laminaat tot visgraat", description_en: "From laminate to herringbone", image_url: "/images/vloeren.png", icon: "SquaresFour", sort_order: 3, active: true },
  { id: "fallback-keuken", slug: "keuken", type: "professional", name_nl: "Keuken", name_en: "Kitchen", description_nl: "Samen koken, meer genieten", description_en: "Cook together, enjoy more", image_url: "/images/keuken.png", icon: "CookingPot", sort_order: 4, active: true },
  { id: "fallback-badkamer", slug: "badkamer", type: "professional", name_nl: "Badkamer", name_en: "Bathroom", description_nl: "Een frisse start, elke dag", description_en: "A fresh start, every day", image_url: "/images/badkamer.png", icon: "Bathtub", sort_order: 5, active: true },
  { id: "fallback-tuin", slug: "tuin", type: "professional", name_nl: "Tuin", name_en: "Garden", description_nl: "Buiten leeft het ook", description_en: "Outdoor living matters too", image_url: "/images/tuin.png", icon: "Tree", sort_order: 6, active: true },
  { id: "fallback-raamdecoratie", slug: "raamdecoratie", type: "professional", name_nl: "Raamdecoratie", name_en: "Window coverings", description_nl: "Sfeer én privacy", description_en: "Style and privacy", image_url: "/images/raamdecoraties.png", icon: "FrameCorners", sort_order: 7, active: true },
  { id: "fallback-elektra", slug: "elektra", type: "professional", name_nl: "Elektra", name_en: "Electrical", description_nl: "Extra groepen & aansluitingen", description_en: "Extra circuits & connections", image_url: "/images/elektra.png", icon: "Lightning", sort_order: 8, active: true },
  { id: "fallback-zonnepanelen", slug: "zonnepanelen", type: "compare", name_nl: "Zonnepanelen", name_en: "Solar panels", description_nl: "Bespaar met je buren samen", description_en: "Save together with neighbours", image_url: "/images/zonnepanelen.png", icon: "SunDim", sort_order: 9, active: true },
  { id: "fallback-verhuizen", slug: "verhuizen", type: "professional", name_nl: "Verhuizen", name_en: "Moving", description_nl: "Offerte in 1 minuut", description_en: "Quote in 1 minute", image_url: "/images/verhuizen.png", icon: "Truck", sort_order: 10, active: true },
  { id: "fallback-beveiliging", slug: "beveiliging", type: "professional", name_nl: "Beveiliging", name_en: "Security", description_nl: "Camera, alarm & slimme deurbel", description_en: "Camera, alarm & smart doorbell", image_url: "/images/beveiliging.png", icon: "ShieldCheck", sort_order: 11, active: true },
  { id: "fallback-internet", slug: "internet", type: "compare", name_nl: "Internet", name_en: "Internet", description_nl: "Glasvezel vergelijken & installeren", description_en: "Compare & install fibre optic", image_url: "/images/internet.png", icon: "WifiHigh", sort_order: 12, active: true },
];

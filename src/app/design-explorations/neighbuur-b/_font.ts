import { Source_Serif_4 } from "next/font/google";

/**
 * Enige voor dit prototype geïntroduceerde typografie — next/font is
 * route-scoped (geen wijziging aan globals.css of het globale lettertype-
 * systeem). Gebruikt alleen voor de verhalende/editorial tekstblokken in
 * variant B; de functionele UI blijft op het bestaande DM Sans (Swiss/
 * minimal-helft van de opdracht).
 */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

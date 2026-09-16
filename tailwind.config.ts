import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      /*
       * ══════════════════════════════════════════
       * Neighbuur Design Tokens
       * Warm, aards, menselijk — als een ingericht huis
       * ══════════════════════════════════════════
       */
      colors: {
        /* Achtergronden */
        cream:       { DEFAULT: "#FAF7F2", dark: "#F3EDE4", warm: "#FFF8F5" },
        sand:        { DEFAULT: "#F0EAE0", dark: "#E5DDD0", light: "#FAF2EE" },

        /* Merk — bosgroen/salie i.p.v. terracotta: differentieert van de
           oranje-verzadigde home-services-categorie (Werkspot e.d.) en
           past beter bij "buurt/groei/duurzame nieuwbouw". Bewust een
           andere hoek (~100°, olijf/salie) dan het bestaande semantische
           groen (~149°, teal-groen) hierbeneden, zodat merk-accent en
           succes-status niet door elkaar gaan lopen. */
        sage:  {
          DEFAULT: "#578042",
          50:  "#F4F8F1",
          100: "#E3EEDD",
          200: "#C4DAB9",
          300: "#A0C28E",
          400: "#78A960",
          500: "#578042",
          600: "#466A34",
          700: "#385729",
          800: "#2A431E",
          900: "#1D2E15",
        },

        /* Semantisch */
        groen:       {
          DEFAULT: "#2A8C5A",
          light:   "#E8F5EE",
          dark:    "#1D6B42",
        },
        blauw:       {
          DEFAULT: "#2A6BE8",
          light:   "#EBF1FF",
          dark:    "#1D4FA8",
        },
        lavendel:    {
          DEFAULT: "#7B3AE8",
          light:   "#F3EDFF",
        },
        oker:        {
          DEFAULT: "#C4871A",
          light:   "#FFF8EB",
        },

        /* Neutraal */
        warmzwart:   "#1A1A18",
        warmgrijs:   {
          DEFAULT: "#8A877F",
          light:   "#B5B2AB",
          dark:    "#6B6860",
        },
        lijn:        { DEFAULT: "#E5E2DA", light: "#F0EDE6" },
      },

      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body:    ['"DM Sans"', "system-ui", "sans-serif"],
      },

      fontSize: {
        /* Display scale — Fraunces */
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "900" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)",      { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["clamp(1.5rem, 3vw, 2rem)",     { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["clamp(1.125rem, 2vw, 1.5rem)", { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "700" }],

        /* Body scale — DM Sans */
        "body-lg":    ["1.125rem", { lineHeight: "1.6" }],
        "body":       ["0.9375rem", { lineHeight: "1.6" }],
        "body-sm":    ["0.8125rem", { lineHeight: "1.5" }],
        "body-xs":    ["0.6875rem", { lineHeight: "1.4" }],
      },

      borderRadius: {
        "sm":  "8px",
        "DEFAULT": "12px",
        "md":  "14px",
        "lg":  "18px",
        "xl":  "22px",
        "2xl": "28px",
        "full": "9999px",
      },

      boxShadow: {
        "soft":    "0 1px 3px rgba(26,26,24,0.03), 0 6px 16px rgba(26,26,24,0.05)",
        "medium":  "0 2px 6px rgba(26,26,24,0.04), 0 12px 32px rgba(26,26,24,0.08)",
        "strong":  "0 4px 12px rgba(26,26,24,0.06), 0 20px 48px rgba(26,26,24,0.12)",
        "glow":    "0 0 0 3px rgba(232,87,42,0.12)",
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },

      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.3s ease-out both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "confetti-fall": "confettiFall 1.4s ease-in both",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(100%)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        confettiFall: {
          "0%":   { opacity: "1", transform: "translateY(0) rotate(0deg)" },
          "100%": { opacity: "0", transform: "translateY(160px) rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

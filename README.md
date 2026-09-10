# Neighbuur

**Je nieuwbouwhuis, helemaal geregeld.**

Nieuwbouw-concierge platform: vakmensen, diensten, buurt-reviews en groepskortingen voor nieuwbouwwijken.

## Quick start

```bash
# 1. Dependencies installeren
npm install

# 2. Environment variables kopieren en invullen
cp .env.example .env.local

# 3. Dev server starten
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** met custom design tokens
- **Supabase** (Auth, Database, Realtime, Storage)
- **Phosphor Icons** (iconen)
- **Fraunces** + **DM Sans** (typografie)
- **Mollie Connect** (betalingen, later)
- **Resend** (transactionele e-mail, later)

## Projectstructuur

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout (nav, fonts)
│   ├── globals.css           # Tailwind + design tokens
│   ├── login/page.tsx        # Login (telefoon + Google)
│   ├── plan/page.tsx         # Mijn Plan dashboard
│   ├── vakman/[slug]/page.tsx # Vakman profiel
│   ├── wijk/                 # Mijn Wijk (TODO)
│   └── api/                  # API routes (TODO)
├── components/
│   ├── layout/nav.tsx        # Nav, Footer, MobileBar
│   ├── illustrations/        # SVG spot-illustraties
│   └── ui/                   # Buttons, cards, badges (via globals.css)
├── lib/
│   ├── supabase.ts           # Client-side Supabase
│   ├── supabase-server.ts    # Server-side Supabase
│   └── utils.ts              # Helpers
└── styles/

supabase/
└── migrations/
    └── 0001_initial_schema.sql  # Database schema + RLS + seed data
```

## Pagina's

| Route | Status | Beschrijving |
|-------|--------|--------------|
| `/` | ✅ | Landing page met hero, diensten, reviews, WhatsApp share |
| `/login` | ✅ | Telefoon SMS-OTP + Google OAuth + onboarding |
| `/plan` | ✅ | Persoonlijk dashboard met tijdlijn, voortgang, wijk-activiteit |
| `/vakman/[slug]` | ✅ | Vakman profiel: beschikbaarheid, werkfoto's, reviews, info |
| `/wijk` | 📋 | Buurt-feed: reviews, activiteit, groepskortingen |
| `/vergelijk` | 📋 | Energie/glasvezel/zonnepanelen vergelijker |

## Visuele stijl

De stijl is warm, aards en menselijk — als een ingericht huis, niet als een tech-startup.

**Kleuren:**
- Achtergrond: Gebroken wit (#FAF7F2)
- Accent: Terracotta (#E8572A)
- Succes: Bladgroen (#2A8C5A)
- Info: Hemelsblauw (#2A6BE8)

**Typografie:**
- Display/koppen: Fraunces (serif, warm, karaktervol)
- UI/body: DM Sans (geometrisch, leesbaar)

**Iconen:** Phosphor Icons (light variant, 1.5px stroke)

**Illustraties:**
De SVG spot-illustraties in `components/illustrations/` zijn geometrische placeholders.
Vervang ze door AI-gegenereerde illustraties in de warme editorial stijl
(zachte schaduwen, aards palet, aquarel-achtige textuur).
Genereer ze met een AI image tool in één sessie voor stijlconsistentie.

## Supabase setup

1. Maak een project aan op [supabase.com](https://supabase.com)
2. Kopieer je URL en anon key naar `.env.local`
3. Draai de migratie:

```bash
npx supabase db push
```

4. Auth configureren in het Supabase dashboard:
   - Phone: Twilio credentials invullen
   - Google: OAuth client ID + secret invullen

## Deployment

```bash
# Vercel (aanbevolen)
npx vercel

# Of handmatig
npm run build
npm start
```

## Volgende stappen

1. Supabase project aanmaken en migratie draaien
2. Auth configureren (Twilio + Google OAuth)
3. Demo-data vervullen met echte wijken en vakmensen
4. Illustraties genereren in de warme editorial stijl
5. Wijk-pagina en vergelijkingspagina's bouwen
6. Mollie Connect integratie voor betalingen
7. Realtime berichten via Supabase Realtime
8. E-mail notificaties via Resend
9. Vercel deployment + eigen domein

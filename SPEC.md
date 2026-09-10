# Neighbuur — Technische Specificatie

> Versie 1.0 — september 2026
> Single source of truth voor het bouwen van het platform.
> Neem dit bestand mee naar VS Code als referentie voor Claude Code.

---

## 1. Wat het is

Neighbuur is een nieuwbouw-concierge platform dat bewoners van nieuwbouwwijken
verbindt met vakmensen en diensten. Het combineert drie modellen:

1. **Marktplaats** — koppel bewoners aan vakmensen
2. **Community** — digitale buurtgemeenschap per blok/flat/wijk
3. **Affiliate** — doorverwijzingen naar vergelijkingsdiensten (energie, glasvezel, etc.)

Het platform is tweetalig (NL/EN) en positioneert zich als doorgeefluik (bemiddelaar).

---

## 2. Rollen

| Rol | Omschrijving |
|-----|-------------|
| `bewoner` | Nieuwbouwbewoner. Kan boeken, reviewen, community joinen, buren uitnodigen. |
| `vakman` | Aannemer/ZZP'er. Kan opdrachten ontvangen, profiel beheren, op reviews reageren. |
| `community_beheerder` | Bewoner met extra rechten voor één community. Kan community-pagina bewerken. |
| `admin` | Platformbeheerder (Rachid). Volledige toegang. Categorieën, wijken, moderatie. |

---

## 3. Stack

| Laag | Technologie | Waarom |
|------|------------|--------|
| Framework | Next.js 14 (App Router) + TypeScript | SSR, API routes, file-based routing |
| Styling | Tailwind CSS | Design tokens, snel itereren |
| Database | Supabase (PostgreSQL) | Auth, realtime, storage, RLS |
| Auth | Supabase Auth | Telefoon (Twilio), Google OAuth, e-mail |
| Iconen | Phosphor Icons | Consistent, React-native, gratis |
| Betalingen | Mollie Connect (fase 2) | Nederlands, iDEAL, split payments |
| E-mail | Resend (fase 2) | Transactionele e-mail |
| Hosting | Vercel | Auto-deploy vanuit GitHub |
| i18n | Eigen implementatie (geen library) | Simpel, volledig in controle |
| Fonts | Fraunces (display) + DM Sans (body) | Via Google Fonts |

---

## 4. Architectuurprincipes

### 4.1 Generiek waar mogelijk
- Categorieën, communities, content-blokken zijn **data-driven** (uit de database), niet hardcoded.
- Alle UI-tekst komt uit vertaalbestanden (`src/lib/i18n.ts`), nooit inline strings.
- Componenten zijn herbruikbaar: een `<ReviewCard>` werkt op de homepage, op een vakman-profiel, en in een community-feed.

### 4.2 Separation of concerns
```
src/
├── app/                    # Routes en pagina's (thin layer)
├── components/
│   ├── ui/                 # Atomaire componenten (Button, Badge, Input, Card, Avatar)
│   ├── layout/             # Nav, Footer, MobileBar, Sidebar
│   ├── features/           # Feature-specifieke componenten
│   │   ├── auth/           # LoginForm, OtpInput, OnboardingSteps
│   │   ├── community/      # CommunityPage, ContentBlock, MemberList
│   │   ├── reviews/        # ReviewCard, ReviewForm, UpvoteButton, ReplyForm
│   │   ├── booking/        # BookingFlow, DatePicker, StatusBadge
│   │   ├── vakman/         # VakmanCard, AvailabilityCalendar, ProfileEditor
│   │   ├── categories/     # CategoryGrid, CategoryTile
│   │   └── timeline/       # TimelineItem, ProgressRing
│   └── admin/              # AdminCategoryEditor, CommunityEditor, ContentBlockEditor
├── lib/
│   ├── supabase.ts         # Browser client
│   ├── supabase-server.ts  # Server client
│   ├── i18n.ts             # Vertalingen + categorie-data
│   ├── utils.ts            # Formatters, helpers
│   └── hooks/              # useAuth, useLang, useCommunity, useReviews
└── types/
    └── index.ts            # TypeScript types (gegenereerd uit Supabase + handmatig)
```

### 4.3 Data-flow
- **Server Components** voor data-fetching (pagina's laden data server-side).
- **Client Components** voor interactie (forms, modals, upvotes).
- **Supabase Realtime** voor live-updates (berichten, community-feed).
- **React Context** voor globale state: taal (`LangProvider`) en auth (`AuthProvider`).

### 4.4 i18n aanpak
Geen external library. Eén vertaalbestand (`src/lib/i18n.ts`) met geneste objecten per taal.
Taalvoorkeur wordt opgeslagen in localStorage en als cookie (voor SSR).
URL-structuur: **geen** `/nl/` of `/en/` prefix — taal wisselt via een toggle in de nav.
Reden: simpeler routing, geen duplicate pages voor SEO, doelgroep wisselt niet vaak.

### 4.5 KvK-validatie (gratis variant)
- Formaat-check: 8 cijfers, geen letters.
- Bij invoer: toon een tekstveld voor bedrijfsnaam (handmatig invullen).
- Later: handmatige verificatie door admin (checkbox "KvK geverifieerd").
- Geen KvK API-koppeling in de MVP.

---

## 5. Pagina's en routes

### Publiek
| Route | Pagina | Beschrijving |
|-------|--------|-------------|
| `/` | Homepage | Hero, 12 categorie-tegels, 3 stappen, reviews, WhatsApp CTA |
| `/login` | Inloggen | Telefoon/e-mail/Google, OTP, onboarding |
| `/categorie/[slug]` | Categoriepagina | Lijst vakmensen in deze categorie, filters |
| `/vakman/[slug]` | Vakman-profiel | Info, beschikbaarheid, foto's, reviews, reageren, boeken |
| `/wijk/[slug]` | Wijk-overzicht | Alle blokken/communities in een wijk |
| `/community/[slug]` | Community-pagina | Het sociale hart — bewerkbare content, reviews, leden, groepskortingen |
| `/registreer/vakman` | Vakman-aanmelding | QR-landing, 3-staps snelle registratie |

### Ingelogd (bewoner)
| Route | Pagina |
|-------|--------|
| `/plan` | Mijn Plan — persoonlijke tijdlijn |
| `/berichten` | Chat met vakmensen |
| `/profiel` | Eigen profiel bewerken |
| `/profiel/uitnodigen` | Buren uitnodigen (persoonlijke link) |
| `/boekingen` | Boekingsgeschiedenis |

### Ingelogd (vakman)
| Route | Pagina |
|-------|--------|
| `/dashboard` | Vakman-dashboard — aanvragen, agenda, reviews |
| `/dashboard/profiel` | Profiel bewerken (logo, foto's, bio, KvK) |
| `/dashboard/beschikbaarheid` | Agenda beheren |
| `/dashboard/reviews` | Reviews lezen + reageren |
| `/berichten` | Chat met klanten |

### Admin
| Route | Pagina |
|-------|--------|
| `/admin` | Dashboard — stats, recente activiteit |
| `/admin/categorieen` | Categorieën beheren (CRUD + afbeelding + volgorde) |
| `/admin/wijken` | Wijken en communities beheren |
| `/admin/community/[slug]` | Community-pagina bewerken (content-blokken) |
| `/admin/vakmensen` | Vakmensen goedkeuren/afwijzen, KvK verifiëren |
| `/admin/reviews` | Reviews modereren |

---

## 6. Feature-specificaties

### 6.1 Community-pagina (prio 1)

De community-pagina is een **bewerkbare landingspagina per blok/flat/verdieping**.

**Content-blokken** (admin beheert via drag-and-drop editor):

| Type | Inhoud | Bewerkbaar veld |
|------|--------|----------------|
| `hero_banner` | Grote afbeelding bovenaan | `afbeelding_url`, `titel`, `subtitel` |
| `tekst` | Vrij tekstveld | `titel`, `inhoud` (rich text) |
| `afbeelding` | Foto op vaste positie | `afbeelding_url`, `bijschrift` |
| `reviews` | Automatisch: recente reviews uit dit blok | `aantal` (hoeveel tonen) |
| `groepskortingen` | Automatisch: lopende acties | — |
| `bewoners` | Automatisch: wie woont hier | `toon_aantal` (bool) |
| `aankondiging` | Opvallend blok met nieuws | `titel`, `inhoud`, `kleur` |
| `vakman_spotlight` | Uitgelichte vakman | `vakman_id` |

Opgeslagen als JSON-array in `community_content_blokken` tabel, met `positie` voor volgorde.

### 6.2 Vakman-aanmelding via QR (prio 1)

URL-formaat: `neighbuur.nl/registreer/vakman?ref={bron}`
`ref` kan zijn: `flyer`, `bouwplaats`, `website`, `bewoner-{id}`.

**Stap 1 — Identificatie (10 sec)**
Telefoonnummer + SMS-code. Of e-mail + wachtwoord. Of Google.

**Stap 2 — Basisprofiel (20 sec)**
- Bedrijfsnaam (verplicht)
- KvK-nummer (verplicht, 8 cijfers, format-check)
- Hoofdcategorie kiezen (dropdown uit admin-beheerde categorieën)
- Werkgebied: postcode + straal (5/10/15/25 km)

**Stap 3 — Contact (10 sec)**
- Hoe bereikbaar? (telefoon / WhatsApp / via app)
- Akkoord met voorwaarden

→ Profiel is live. Dashboard wordt getoond.

**Profielverrijking (later, gestimuleerd via voortgangsbalk):**
- Logo uploaden → "Vakmensen met logo krijgen 3x meer aanvragen"
- Website toevoegen
- Foto's van werk uploaden (min. 3 voor "Geverifieerd werk" badge)
- Bio schrijven
- Beschikbaarheid instellen
- Verzekeringsbewijs uploaden

Profielsterkte: percentage (0–100%) zichtbaar op dashboard.
Elke stap levert punten op. Bij 100% krijg je een "Compleet profiel" badge.

### 6.3 Reviews + reacties

**Review schrijven (bewoner):**
- Gekoppeld aan een boeking (→ "Geverifieerde klus" badge) óf los (→ geen badge)
- Tekst (verplicht, min. 20 karakters)
- Scores per categorie: kwaliteit, stiptheid, communicatie, prijs (1–5 sterren elk)
- Foto's (optioneel, max 5, via Supabase Storage)

**Review weergave:**
- Reddit-stijl: upvote/downvote, gesorteerd op score
- Auteur + avatar + wijk/blok + tijdstip
- "Geverifieerde klus" badge als gekoppeld aan boeking
- Score-tags (visueel, gekleurde badges)

**Vakman-reactie:**
- Eén reactie per review (geen thread)
- Zichtbaar onder de review met "Reactie van [bedrijfsnaam]" label
- Vakman krijgt notificatie bij nieuwe review

### 6.4 Categorieën (admin-beheerd)

Elke categorie heeft:
- `naam_nl`, `naam_en` (tweetalig)
- `beschrijving_nl`, `beschrijving_en`
- `slug` (URL-veilig, uniek)
- `afbeelding_url` (de tegel-afbeelding)
- `icoon` (Phosphor icon naam, voor compact gebruik)
- `type`: `vakman` (doorlinken naar vakmensen) of `vergelijk` (doorlinken naar vergelijkingspagina)
- `sorteer` (volgorde op homepage)
- `actief` (boolean)

Admin-pagina: lijst, bewerken, afbeelding uploaden, volgorde slepen, aan/uit.

### 6.5 Uitnodigingssysteem

Elke bewoner krijgt een persoonlijke uitnodigingslink:
`neighbuur.nl/uitnodiging/{code}`

Bij registratie via deze link:
- De nieuwe bewoner wordt automatisch aan dezelfde community toegevoegd
- De uitnodiger krijgt een notificatie ("Jeroen heeft zich aangemeld via jouw link!")
- Tracking: wie heeft wie uitgenodigd (voor eventuele beloningen later)

WhatsApp-deelknop genereert een voorgeschreven bericht met de persoonlijke link.

### 6.6 Logo-prompt

Na vakman-registratie, op het dashboard:
- Een opvallende kaart: "Voeg je logo toe"
- Visuele before/after: profiel zonder logo (initiaal-avatar) vs. met logo
- Tekst: "Vakmensen met een logo krijgen 3x meer aanvragen"
- Upload-knop direct in de kaart
- Na upload: kaart verdwijnt, confetti-animatie, "Profiel 20% completer!"

In zoekresultaten: vakmensen met logo krijgen een iets grotere kaart / meer visuele ruimte.

---

## 7. UI-componenten (herbruikbaar)

### Atomair (`components/ui/`)
```
Button          → primary, secondary, dark, ghost, sizes (sm/md/lg)
Badge           → terracotta, groen, blauw, lavendel, oker
Input           → text, tel, email, textarea, met label + hint + error
Card            → elevated (shadow) of flat (border)
Avatar          → initiaal (kleur), foto, logo
Modal           → centered overlay met backdrop
Toast           → bottom-center notificatie
Tabs            → horizontal tab-bar
ProgressBar     → percentage balk
StarRating      → 1-5 sterren, klikbaar of readonly
UpvoteButton    → Reddit-stijl, met teller
LanguageToggle  → NL/EN switch
```

### Feature-componenten (`components/features/`)
```
CategoryTile    → afbeelding + naam + sub + pijl (homepage grid)
CategoryGrid    → responsive 6/4/3/2 kolommen grid
ReviewCard      → auteur, tekst, scores, tags, upvote, vakman-reactie
ReviewForm      → scores + tekst + foto-upload
VakmanCard      → avatar/logo, naam, rating, badges (zoekresultaten)
VakmanProfile   → tabs: beschikbaarheid, werk, reviews, over
AvailCalendar   → 2-weken grid, beschikbaar/bezet/geselecteerd
BookingFlow     → multi-step: datum → omschrijving → bevestiging
TimelineItem    → icoon, titel, status-badge, vakman-badge, acties
ProgressRing    → SVG cirkel met percentage
CommunityPage   → rendert content-blokken dynamisch
ContentBlock    → switch op type, rendert het juiste blok
MemberGrid      → avatars van community-leden
InviteCard      → persoonlijke link + WhatsApp-deelknop
LogoPrompt      → before/after + upload CTA
```

---

## 8. Design tokens (Tailwind)

Vastgelegd in `tailwind.config.ts`:

**Kleuren:**
- `cream` (#FAF7F2) — achtergrond
- `sand` (#F0EAE0) — secties, tegel-achtergrond
- `terracotta` (#E8572A) — accent, CTA's
- `groen` (#2A8C5A) — succes, geverifieerd
- `blauw` (#2A6BE8) — info, links
- `lavendel` (#7B3AE8) — premium
- `oker` (#C4871A) — waarschuwing, secundair
- `warmzwart` (#1A1A18) — tekst
- `warmgrijs` (#8A877F) — muted tekst

**Typografie:**
- Display: Fraunces (koppen, scores, prijzen)
- Body: DM Sans (alles anders)

**Categorie-tegels:**
- Achtergrond: `#F5F0E8` (warm zand)
- Geen border
- Border-radius: 16px
- Hover: translateY(-5px) + shadow
- Afbeelding: aspect-ratio 1:1, object-fit cover

---

## 9. Bouwvolgorde

### Fase 1 — Fundament (week 1)
- [ ] Next.js project + Tailwind + Supabase + Vercel deploy
- [ ] Auth (telefoon + e-mail + Google)
- [ ] Database schema + migraties + RLS
- [ ] i18n systeem + taalwisselaar
- [ ] UI-componenten library (Button, Badge, Input, Card, Avatar, Modal, Toast)
- [ ] Layout (Nav, Footer, MobileBar)
- [ ] Homepage met echte afbeeldingen + 12 tegels uit database

### Fase 2 — Community + aanmelding (week 2–3)
- [ ] Community-pagina met bewerkbare content-blokken
- [ ] Admin: community-editor (content-blokken beheren)
- [ ] Admin: categorieën CRUD
- [ ] Vakman-aanmelding (QR → 60 sec flow)
- [ ] Bewoner-onboarding (community joinen)
- [ ] Uitnodigingssysteem (persoonlijke link + WhatsApp)
- [ ] Profielverrijking + logo-prompt

### Fase 3 — Interactie (week 4–5)
- [ ] Vakman-profiel (beschikbaarheid, foto's, reviews)
- [ ] Reviews schrijven + upvoten
- [ ] Vakman-reactie op reviews
- [ ] Zoeken + filteren op vakmensen
- [ ] Mijn Plan dashboard (bewoner)
- [ ] Vakman-dashboard

### Fase 4 — Transacties (week 6–7)
- [ ] Boekingsflow (aanvraag → bevestiging → afronding)
- [ ] Berichten/chat (Supabase Realtime)
- [ ] Notificaties (in-app + e-mail)
- [ ] Betalingen (Mollie Connect)

---

## 10. Afbeeldingen

Alle categorie-afbeeldingen en hero-images staan in `public/images/`:

```
public/images/
├── hero.png              # NL hero (verhuisdozen, "Hier begint ons thuis")
├── hero-EN.png           # EN hero (verhuisdozen, "This is where our home begins")
├── stucken.png           # Stucwerk
├── verfen.png            # Schilderen
├── vloeren.png           # Vloeren
├── keuken.png            # Keuken
├── badkamer.png          # Badkamer
├── tuin.png              # Tuin
├── raamdecoraties.png    # Raamdecoratie
├── elektra.png           # Elektra
├── zonnepanelen.png      # Zonnepanelen
├── verhuizen.png         # Verhuizen
├── beveiliging.png       # Beveiliging
└── internet.png          # Internet
```

In productie komen categorie-afbeeldingen uit Supabase Storage (admin uploadt ze).
De `public/images/` versies zijn fallbacks en worden gebruikt voor de eerste deploy.

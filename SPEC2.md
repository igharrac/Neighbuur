# Neighbuur — SPEC2: Fase 2 — Community + Aanmelding

> Fase 1 (fundament) is af. Dit document beschrijft alles wat in fase 2 gebouwd moet worden.
> Geef dit bestand aan Claude Code als context.

---

## Overzicht fase 2

| Week | Onderdeel | Routes |
|------|-----------|--------|
| 2A | Community-pagina + admin editor + admin categorieën | `/community/[slug]`, `/admin/community/[slug]`, `/admin/categorieen` |
| 2B | Vakman-aanmelding + dashboard + profielverrijking | `/registreer/vakman`, `/dashboard`, `/dashboard/profiel` |
| 3A | Bewoner-onboarding + uitnodigingssysteem | Onboarding-flow, `/profiel/uitnodigen` |
| 3B | Wijk-overzicht + community-leden | `/wijk/[slug]`, bewoners-blok |

---

## 1. Community-pagina (`/community/[slug]`)

### 1.1 Wat het is
De homepage van een blok/flat/verdieping. Bewoners zien hier het laatste nieuws,
reviews, groepskortingen, en wie er woont. De pagina wordt opgebouwd uit
**content-blokken** die de admin (of community-beheerder) beheert.

### 1.2 Data-flow
```
1. Fetch community uit `communities` tabel via slug
2. Fetch content-blokken uit `community_content_blokken` WHERE community_id, ORDER BY positie
3. Fetch community stats uit `community_overzicht` view
4. Render elk blok via een <ContentBlock> switch-component
```

### 1.3 ContentBlock component

Maak `src/components/features/community/ContentBlock.tsx`:

```tsx
type ContentBlockProps = {
  type: ContentBlokType;
  data: Record<string, any>;
  community_id: string;
  lang: "nl" | "en";
};
```

Switch op `type`, render het juiste sub-component:

| type | Component | data-velden | Wat het rendert |
|------|-----------|-------------|-----------------|
| `hero_banner` | `<HeroBanner>` | `afbeelding_url`, `titel`, `subtitel` | Grote afbeelding met overlay-tekst, border-radius 16px, max-height 300px |
| `tekst` | `<TekstBlok>` | `titel`, `inhoud` | Kop (Fraunces) + body (DM Sans), max-width 640px |
| `afbeelding` | `<AfbeeldingBlok>` | `afbeelding_url`, `bijschrift` | Afbeelding met bijschrift eronder, border-radius 12px |
| `reviews` | `<ReviewsBlok>` | `aantal` (default 5) | Fetch recente reviews uit `review_compleet` view WHERE community_id, toon als ReviewCard-lijst |
| `groepskortingen` | `<GroepskortingenBlok>` | — | Fetch actieve groepskortingen uit `groepskortingen` WHERE community_id, toon als kaarten met voortgangsbalk |
| `bewoners` | `<BewonersBlok>` | `toon_aantal` (bool) | Fetch leden uit `community_leden` JOIN `profielen`, toon avatar-grid |
| `aankondiging` | `<AankondigingBlok>` | `titel`, `inhoud`, `kleur` | Opvallende banner met achtergrondkleur, border-radius 12px |
| `vakman_spotlight` | `<VakmanSpotlight>` | `vakman_id` | Fetch vakman uit `vakman_overzicht`, toon als uitgelichte VakmanCard |

### 1.4 Community page layout

```
┌─────────────────────────────────────┐
│ [Hero banner - grote afbeelding]     │
├─────────────────────────────────────┤
│ Community-header:                    │
│   Naam · Type · Wijk                 │
│   "42 bewoners · 18 reviews · 3 acties" │
│   [Word lid] (als niet-lid)          │
├─────────────────────────────────────┤
│ Content-blokken (dynamisch):         │
│   ┌── Aankondiging ──┐              │
│   ├── Tekst ─────────┤              │
│   ├── Afbeelding ────┤              │
│   ├── Reviews ───────┤              │
│   ├── Groepskortingen┤              │
│   ├── Bewoners ──────┤              │
│   └──────────────────┘              │
└─────────────────────────────────────┘
```

### 1.5 Styling
- Achtergrond: `cream` (#FAF7F2)
- Content-blokken: `white` achtergrond, `border-radius: 16px`, `shadow-soft`, `padding: 24px–32px`
- Spacing tussen blokken: `24px`
- Max-width content: `800px`, gecentreerd
- Hero banner: full-width binnen de content-kolom, `border-radius: 16px`, `aspect-ratio: 21/9`
- Bewoners-grid: avatars in een flex-wrap grid, 40x40px, met naam eronder

---

## 2. Admin: Community Editor (`/admin/community/[slug]`)

### 2.1 Wat het is
Een pagina waar de admin (of community-beheerder) de content-blokken beheert.
Dit is een interne tool — functioneel boven mooi.

### 2.2 Functionaliteit
- **Lijst** van bestaande blokken, gesorteerd op `positie`
- **Toevoegen**: kies type uit dropdown → formulier verschijnt → opslaan
- **Bewerken**: klik op blok → formulier met huidige data → opslaan
- **Verwijderen**: bevestigingsdialoog → soft-delete (actief = false)
- **Herschikken**: drag-and-drop OF pijltjes omhoog/omlaag → update `positie`
- **Afbeelding uploaden**: voor `hero_banner` en `afbeelding` types → upload naar Supabase Storage bucket `community-images`

### 2.3 Formulieren per blok-type

**hero_banner:**
```
Titel:       [text input]
Subtitel:    [text input]
Afbeelding:  [file upload] → preview na upload
```

**tekst:**
```
Titel:       [text input]
Inhoud:      [textarea, 6 rijen]
```

**afbeelding:**
```
Afbeelding:  [file upload] → preview
Bijschrift:  [text input]
```

**aankondiging:**
```
Titel:       [text input]
Inhoud:      [textarea, 3 rijen]
Kleur:       [select: terracotta / groen / blauw / oker]
```

**vakman_spotlight:**
```
Vakman:      [search/select → zoek op bedrijfsnaam]
```

**reviews / groepskortingen / bewoners:**
```
(Geen extra velden — deze trekken automatisch data)
Aantal:      [number input, alleen bij reviews]
```

### 2.4 Supabase Storage
- Bucket: `community-images`
- Pad: `{community_id}/{blok_id}.{ext}`
- Maximale grootte: 5MB
- Toegestane types: image/jpeg, image/png, image/webp
- Public URL na upload opslaan in `data.afbeelding_url`

### 2.5 Auth-check
Alleen toegankelijk voor gebruikers met `rol = 'admin'` OF gebruikers die
`community_leden.rol = 'beheerder'` zijn voor deze specifieke community.
Redirect naar `/` als niet geautoriseerd.

---

## 3. Admin: Categorieën (`/admin/categorieen`)

### 3.1 Wat het is
CRUD-pagina voor de 12 dienst-categorieën op de homepage.

### 3.2 Functionaliteit
- **Lijst**: alle categorieën, gesorteerd op `sorteer`, met thumbnail, naam (NL+EN), type, actief-toggle
- **Bewerken**: klik → formulier:
  ```
  Naam (NL):          [text]
  Naam (EN):          [text]
  Beschrijving (NL):  [text]
  Beschrijving (EN):  [text]
  Slug:               [text, auto-generated from naam_nl, editable]
  Type:               [select: vakman / vergelijk]
  Icoon:              [text — Phosphor icon naam]
  Afbeelding:         [file upload] → Supabase Storage bucket `categorie-images`
  Actief:             [toggle]
  ```
- **Toevoegen**: zelfde formulier, leeg
- **Verwijderen**: alleen als er geen vakmensen aan gekoppeld zijn
- **Herschikken**: drag-and-drop of pijltjes → update `sorteer`

### 3.3 Homepage-koppeling
De homepage (`/`) moet de categorieën nu uit de database laden in plaats van
uit de hardcoded array in `i18n.ts`. Server Component fetch:

```tsx
const { data: categories } = await supabase
  .from('categorieen')
  .select('*')
  .eq('actief', true)
  .order('sorteer');
```

De `categories` array in `i18n.ts` dient als fallback als de database leeg is.

---

## 4. Vakman-aanmelding (`/registreer/vakman`)

### 4.1 URL en tracking
URL: `/registreer/vakman?ref={bron}`
Bron-waarden: `flyer`, `qr`, `website`, `bewoner-{user_id}`
Sla `ref` op in `vakman_profielen.registratie_bron`.

### 4.2 Flow (3 stappen, 60 seconden)

**Stap 1 — Identificatie**
- Telefoonnummer + SMS-code (Supabase Auth phone)
- OF e-mail + wachtwoord
- OF Google OAuth
- Na auth: check of user al bestaat. Zo ja → redirect naar dashboard.

**Stap 2 — Basisprofiel**
```
Bedrijfsnaam:      [text, verplicht]
KvK-nummer:        [text, verplicht, validatie: exact 8 cijfers]
Hoofdcategorie:    [select, geladen uit `categorieen` WHERE type='vakman' AND actief=true]
Werkgebied:        [postcode input] + [select: 5/10/15/25 km]
```

KvK-validatie in de applicatielaag:
```tsx
function isValidKvK(kvk: string): boolean {
  return /^\d{8}$/.test(kvk.replace(/\s/g, ''));
}
```
Geen API-call. Toon groen vinkje bij geldig formaat, rode foutmelding bij ongeldig.

**Stap 3 — Contact & bevestiging**
```
Contactvoorkeur:   [radio: Telefoon / WhatsApp / Via de app]
☑ Ik ga akkoord met de voorwaarden
[Registreren →]
```

### 4.3 Na registratie
1. Maak record in `profielen` met `rol = 'vakman'`
2. Maak record in `vakman_profielen` met basisdgegevens
3. Genereer slug uit bedrijfsnaam (lowercase, dashes, uniek)
4. Bereken initiële profiel_sterkte (bedrijfsnaam + kvk = 20%)
5. Redirect naar `/dashboard`

### 4.4 Styling
- Fullscreen, gecentreerd, geen nav (net als login-pagina)
- Stap-indicator bovenaan (1 — 2 — 3, met voortgangslijn)
- Logo bovenaan
- Grote, duim-vriendelijke inputs (mobiel-first)
- Animaties tussen stappen (slide-left)

---

## 5. Vakman-dashboard (`/dashboard`)

### 5.1 Layout (initieel)

Na fase 2 is het dashboard nog basic — het wordt uitgebreid in fase 3.

```
┌─────────────────────────────────────────┐
│ Nav (met vakman-avatar + bedrijfsnaam)   │
├─────────────────────────────────────────┤
│ Welkom, {bedrijfsnaam}                   │
│ "Je profiel is {x}% compleet"            │
│ [═══════════░░░░░░░░] 35%               │
├─────────────────────────────────────────┤
│ ┌── Logo-prompt kaart ──────────────┐   │
│ │ 📸 Voeg je logo toe               │   │
│ │ Vakmensen met logo krijgen        │   │
│ │ 3x meer aanvragen                 │   │
│ │                                    │   │
│ │ [Zonder logo]  vs  [Met logo]     │   │
│ │         👤           🏢            │   │
│ │                                    │   │
│ │ [Logo uploaden →]                  │   │
│ └────────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ Profiel vervolledigen:                   │
│ ☑ Bedrijfsnaam          ✓               │
│ ☑ KvK-nummer            ✓               │
│ ☐ Logo uploaden         → 20 punten     │
│ ☐ Bio schrijven         → 10 punten     │
│ ☐ Website toevoegen     → 5 punten      │
│ ☐ 3+ werkfoto's         → 15 punten     │
│ ☐ Beschikbaarheid       → 10 punten     │
│ ☐ Verzekeringsbewijs    → 15 punten     │
├─────────────────────────────────────────┤
│ [Bewerk profiel →]  [Bekijk mijn pagina →] │
└─────────────────────────────────────────┘
```

### 5.2 Logo-prompt kaart

Dit is het belangrijkste element op het dashboard. Ontwerp het als een
opvallende, vriendelijke kaart die de vakman triggert om een logo te uploaden.

- Achtergrond: `terracotta-50` (#FFF5F0)
- Visueel: twee profielkaarten naast elkaar — links zonder logo (grijze initiaal-avatar),
  rechts met logo (professioneel, groter, met glow). Rechts heeft een "3x meer aanvragen" label.
- CTA-knop: `btn-primary` "Logo uploaden →"
- Na upload: kaart verdwijnt, kort confetti-effect, profiel-sterkte springt omhoog

Upload gaat naar Supabase Storage bucket `vakman-logos`, pad: `{vakman_id}/logo.{ext}`.
URL wordt opgeslagen in `vakman_profielen.logo_url`.

### 5.3 Profielverrijking-checklist

Elke item is klikbaar en opent het relevante formulierveld inline of navigeert naar
`/dashboard/profiel`. Items die compleet zijn tonen een groen vinkje.
Items die nog open staan tonen de punten die je ermee verdient.

Na elke stap: `bereken_profiel_sterkte()` aanroepen (of client-side berekenen)
en de voortgangsbalk updaten.

---

## 6. Vakman profielpagina (`/dashboard/profiel`)

### 6.1 Formulier-secties

**Basis (al ingevuld bij registratie):**
- Bedrijfsnaam
- KvK-nummer (readonly na verificatie door admin)
- Hoofdcategorie (+ optie om extra categorieën toe te voegen)
- Werkgebied (postcode + straal)
- Contactvoorkeur

**Verrijking:**
- Logo uploaden (drag-and-drop of klik)
- Website URL
- Bio (textarea, max 500 tekens, met teller)
- Werkfoto's uploaden (grid, max 12, drag-and-drop, bijschrift per foto)
- Beschikbaarheid instellen (kalender-grid, 4 weken vooruit, klik om te togglen)
- Verzekeringsbewijs uploaden (PDF of afbeelding)

**Alle uploads** → Supabase Storage, relevante bucket per type.

---

## 7. Bewoner-onboarding verbetering

### 7.1 Huidige flow
Login → naam + rol → wijk → klaar.

### 7.2 Nieuwe flow
Login → naam + rol → **wijk kiezen** (zoek of selecteer) → **community kiezen**
(toon beschikbare blokken/flats in die wijk) → als je community er niet bij staat:
"Mijn blok staat er niet bij → [Stel voor]" → klaar, redirect naar community-pagina.

### 7.3 Community joinen
Bij het kiezen van een community:
1. Maak record in `community_leden` (user_id, community_id, rol='lid')
2. Maak record in `bewoner_profielen` (user_id, community_id, wijk_id)
3. Genereer unieke `uitnodigingscode` en sla op in `bewoner_profielen`
4. Redirect naar `/community/[slug]`

---

## 8. Uitnodigingssysteem

### 8.1 Uitnodigingslink
Formaat: `neighbuur.nl/uitnodiging/{code}`
Code: 8 karakters, alfanumeriek, uniek.

### 8.2 `/profiel/uitnodigen` pagina

```
┌─────────────────────────────────────┐
│ Nodig je buren uit                   │
│                                      │
│ Jouw persoonlijke link:              │
│ ┌──────────────────────────────┐    │
│ │ neighbuur.nl/uitnodiging/abc123 │ │
│ └──────────────────────────────┘    │
│ [📋 Kopieer]  [💬 Deel via WhatsApp] │
│                                      │
│ Via jouw link aangemeld:             │
│ ┌─ Jeroen K. ──── 3 dagen geleden ┐│
│ ├─ Lisa M. ────── 1 week geleden  ┤│
│ └─────────────────────────────────┘│
│                                      │
│ Nog niemand? Deel je link in je      │
│ buurt-WhatsApp!                      │
└─────────────────────────────────────┘
```

### 8.3 Uitnodiging accepteren
Wanneer iemand `/uitnodiging/{code}` bezoekt:
1. Zoek `uitnodigingen` record via code
2. Als niet ingelogd → redirect naar `/login?invite={code}`
3. Na login/registratie:
   - Voeg gebruiker automatisch toe aan dezelfde community
   - Update `uitnodigingen` record: `gebruikt_door`, `gebruikt_op`
   - Stuur notificatie naar uitnodiger
4. Redirect naar community-pagina

### 8.4 WhatsApp-bericht
Voorgeschreven tekst (taal-afhankelijk):

**NL:** "Hey! 👋 Ik gebruik Neighbuur voor ons blok — vakmensen boeken, reviews van buren lezen, en groepskortingen. Join via mijn link: {url}"

**EN:** "Hey! 👋 I'm using Neighbuur for our block — book professionals, read neighbour reviews, and group discounts. Join via my link: {url}"

---

## 9. Wijk-overzicht (`/wijk/[slug]`)

### 9.1 Wat het toont
Alle communities binnen een wijk, als kaartjes:

```
┌─────────────────────────────────────┐
│ Wijk: Vathorst, Amersfoort           │
│ Opleverdatum: 22 mei 2026            │
│ 84 woningen · 3 blokken              │
├─────────────────────────────────────┤
│ ┌── Blok A ──────┐ ┌── Blok B ──┐  │
│ │ 28 woningen     │ │ 32 woningen │  │
│ │ 14 bewoners     │ │ 8 bewoners  │  │
│ │ 12 reviews      │ │ 3 reviews   │  │
│ │ [Bekijk →]      │ │ [Bekijk →]  │  │
│ └────────────────┘ └────────────┘  │
│ ┌── Blok C ──────┐                  │
│ │ 24 woningen     │                  │
│ │ 22 bewoners     │                  │
│ │ 31 reviews      │                  │
│ │ [Bekijk →]      │                  │
│ └────────────────┘                  │
└─────────────────────────────────────┘
```

### 9.2 Data
Fetch uit `community_overzicht` view WHERE `wijk_id`.

---

## 10. Database-wijzigingen

Alle tabellen staan al in het schema uit fase 1 (`0001_complete_schema.sql`).
Geen nieuwe migraties nodig voor fase 2.

**Supabase Storage buckets aanmaken** (via dashboard of CLI):
```
- community-images   (public)
- categorie-images   (public)
- vakman-logos        (public)
- vakman-werkfotos   (public)
- vakman-documenten  (private — verzekeringsbewijs etc.)
```

---

## 11. Nieuwe componenten om te bouwen

### Features (`src/components/features/`)

```
community/
  ContentBlock.tsx          — switch op type, rendert sub-component
  HeroBanner.tsx            — grote afbeelding met overlay
  TekstBlok.tsx             — titel + body tekst
  AfbeeldingBlok.tsx        — foto met bijschrift
  ReviewsBlok.tsx           — recente reviews in community
  GroepskortingenBlok.tsx   — lopende acties met voortgang
  BewonersBlok.tsx          — avatar-grid van leden
  AankondigingBlok.tsx      — gekleurde banner
  VakmanSpotlight.tsx       — uitgelichte vakman
  CommunityHeader.tsx       — naam, stats, join-knop
  CommunityCard.tsx         — kaartje voor wijk-overzicht

vakman/
  RegistratieForm.tsx       — 3-staps aanmelding
  KvkInput.tsx              — input met 8-cijfer validatie + groen/rood feedback
  ProfielSterkte.tsx        — voortgangsbalk + punten-checklist
  LogoPrompt.tsx            — before/after kaart + upload
  WerkFotoGrid.tsx          — upload-grid met bijschriften
  BeschikbaarheidEditor.tsx — kalender met toggle

invite/
  InviteCard.tsx            — persoonlijke link + WhatsApp + lijst genodigden

admin/
  ContentBlockEditor.tsx    — formulier per blok-type + herschikken
  CategorieEditor.tsx       — CRUD formulier voor categorieën
  ImageUploader.tsx         — drag-and-drop upload → Supabase Storage
  SortableList.tsx          — herbruikbare drag-and-drop lijst
```

### Hooks (`src/lib/hooks/`)
```
useCommunity.ts        — fetch community + content-blokken
useCommunityMembers.ts — fetch leden
useVakmanRegistratie.ts — multi-step form state
useProfielSterkte.ts   — bereken sterkte client-side
useImageUpload.ts      — upload naar Supabase Storage + URL teruggeven
useInvite.ts           — uitnodigingslogica
```

---

## 12. Volgorde van bouwen

Geef deze volgorde aan Claude Code — elk punt is een afgeronde commit:

1. Supabase Storage buckets aanmaken
2. `ImageUploader` component (herbruikbaar, drag-and-drop)
3. `ContentBlock` + alle sub-componenten
4. `/community/[slug]` pagina (met test-data uit Supabase)
5. `/admin/community/[slug]` editor
6. `/admin/categorieen` CRUD
7. Homepage aanpassen: categorieën uit database laden
8. `KvkInput` component met validatie
9. `RegistratieForm` (3 stappen)
10. `/registreer/vakman` pagina
11. `ProfielSterkte` + `LogoPrompt` componenten
12. `/dashboard` vakman-dashboard
13. `/dashboard/profiel` profielpagina
14. Bewoner-onboarding uitbreiden (community kiezen)
15. `InviteCard` component
16. `/profiel/uitnodigen` pagina
17. `/uitnodiging/[code]` handler
18. `/wijk/[slug]` overzichtspagina
19. Testen: volledige flow bewoner (registreren → community joinen → uitnodigen)
20. Testen: volledige flow vakman (QR → registreren → dashboard → logo uploaden)

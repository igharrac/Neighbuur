# Neighbuur — SPEC3: Fase 3 — Freemium, PWA & Interactie

> Fase 1 (fundament) en fase 2 (community + aanmelding) zijn af.
> Dit document beschrijft fase 3: het verdienmodel, de mobiele app-ervaring,
> en alle interactie-features die het platform levend maken.

---

## Overzicht fase 3

| Week | Onderdeel |
|------|-----------|
| 4A | PWA: mobiele app-ervaring |
| 4B | Reviews: schrijven, upvoten, vakman-reactie |
| 5A | Zoeken & filteren van vakmensen |
| 5B | Berichten / chat (realtime) |
| 6A | Boekingsflow |
| 6B | Freemium model: gratis vs. premium |
| 6C | Notificaties (in-app + push + e-mail) |

---

## 1. PWA — Mobiele app-ervaring

### 1.1 Waarom
Neighbuur moet op mobiel voelen als een echte app — niet als een website
in een browser. Bewoners openen het vanuit hun buurt-WhatsApp, vakmensen
checken aanvragen onderweg. Beide verwachten een native ervaring.

### 1.2 Wat er nodig is

**`public/manifest.json`:**
```json
{
  "name": "Neighbuur",
  "short_name": "Neighbuur",
  "description": "Je nieuwbouwhuis, helemaal geregeld",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#E8572A",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Service Worker (`public/sw.js`):**
- Cache-first voor statische assets (CSS, JS, fonts, afbeeldingen)
- Network-first voor API-calls en pagina's
- Offline fallback-pagina: "Je bent offline. Zodra je weer verbinding hebt, laden we de laatste gegevens."
- Achtergrond-sync voor berichten die offline verstuurd worden

**`src/app/layout.tsx` aanpassen:**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#E8572A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

**Install-prompt:**
Maak een `<InstallBanner>` component die verschijnt na 2e bezoek:
"Voeg Neighbuur toe aan je startscherm voor de beste ervaring"
Met een [Installeren] knop die de browser install-prompt triggert.
Opslaan in localStorage dat de banner is weggedrukt.

### 1.3 Mobiele optimalisaties

**Bottom navigation (al gebouwd in fase 1):**
Controleer dat deze correct werkt met de juiste actieve states en routes:
```
Plan | Wijk | Zoeken | Berichten | Profiel     (bewoner)
Dashboard | Aanvragen | Berichten | Profiel     (vakman)
```

**Pull-to-refresh:**
Op de community-pagina, berichten en dashboard.

**Haptic feedback:**
`navigator.vibrate(10)` bij upvotes en boekingsbevestiging (waar ondersteund).

**Safe areas:**
Alle fixed-position elementen (bottom bar, book bar, chat input) moeten
`padding-bottom: env(safe-area-inset-bottom)` gebruiken.

**Touch targets:**
Minimum 44x44px voor alle klikbare elementen. Check dit specifiek op:
- Upvote-knoppen
- Sterren in review-formulier
- Kalender-dagen in beschikbaarheid
- Chat-verstuurknop

**Swipe-gestures (nice-to-have):**
- Swipe-left op een bericht om te verwijderen
- Swipe tussen tabs op vakman-profiel

### 1.4 App-iconen genereren

Maak iconen op basis van het Neighbuur-logo:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `icon-maskable.png` (512x512 met safe zone — logo gecentreerd in 80% van het vlak)
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)

Plaats in `public/icons/`.

### 1.5 Splash screen (iOS)

Apple vereist splash screens per schermformaat. Genereer ze via een tool
of gebruik een simpele HTML-gebaseerde splash met het logo gecentreerd op
`cream` achtergrond. Voeg toe als `<link rel="apple-touch-startup-image">`.

---

## 2. Reviews — schrijven, upvoten, reageren

### 2.1 Review schrijven

**Route:** Modal/drawer die opent vanuit vakman-profiel of na afronding boeking.

**Formulier:**
```
┌─────────────────────────────────────┐
│ Review voor {bedrijfsnaam}           │
├─────────────────────────────────────┤
│ Beoordeling:                         │
│                                      │
│ Kwaliteit    ★ ★ ★ ★ ★              │
│ Stiptheid    ★ ★ ★ ★ ☆              │
│ Communicatie ★ ★ ★ ★ ★              │
│ Prijs        ★ ★ ★ ★ ☆              │
├─────────────────────────────────────┤
│ Je ervaring:                         │
│ ┌──────────────────────────────┐    │
│ │ Vertel over je ervaring...   │    │
│ │ (min. 20 tekens)             │    │
│ │                              │    │
│ └──────────────────────────────┘    │
│                          42/500     │
├─────────────────────────────────────┤
│ Foto's (optioneel):                  │
│ [+] [+] [+] [+] [+]   max 5       │
├─────────────────────────────────────┤
│         [Review plaatsen →]          │
└─────────────────────────────────────┘
```

**Validatie:**
- Alle 4 score-categorieën verplicht
- Tekst: minimaal 20 tekens, maximaal 500
- Foto's: max 5, max 5MB per stuk, alleen jpeg/png/webp
- Upload naar Supabase Storage bucket `review-fotos`

**Na plaatsen:**
1. Insert in `reviews` tabel
2. Trigger `update_vakman_stats()` (automatisch via database trigger)
3. Stuur notificatie naar vakman (type: `review`)
4. Toon bevestiging: "Bedankt voor je review! Je buren kunnen deze nu zien."
5. Als gekoppeld aan boeking: voeg `boeking_id` toe → "Geverifieerde klus" badge

**Component:** `src/components/features/reviews/ReviewForm.tsx`

### 2.2 Review weergave

**Sortering (standaard):** `upvote_score` DESC, dan `created_at` DESC
**Alternatief:** "Nieuwste eerst", "Hoogste score"

**ReviewCard layout:**
```
┌─────────────────────────────────────┐
│ [Avatar] Marieke V.     ▲ 24       │
│ Vathorst Blok C · 3 weken geleden   │
│ ☑ Geverifieerde klus                │
├─────────────────────────────────────┤
│ Hele huis gespackspoten in 2 dagen.  │
│ Netjes afgewerkt en stofvrij...      │
├─────────────────────────────────────┤
│ [foto] [foto] [foto]                │
├─────────────────────────────────────┤
│ ★5.0 kwaliteit · ⏱ stipt · 💬 goed │
├─────────────────────────────────────┤
│ ┌─ Reactie van TopStuc ──────────┐ │
│ │ Bedankt Marieke! Fijn dat het  │ │
│ │ naar wens is. Tot de volgende! │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2.3 Upvoten

**Component:** `src/components/features/reviews/UpvoteButton.tsx`

- Klik = upvote (+1), nogmaals klikken = verwijder vote
- Downvote: houd ingedrukt (long-press) of tweede knop (optioneel voor MVP)
- Optimistic UI: score update direct, database-call in achtergrond
- Niet-ingelogde gebruikers: toon login-prompt bij klikken
- Trigger `update_review_score()` via database trigger

### 2.4 Vakman-reactie

**Waar:** onder elke review op het vakman-profiel. Alleen zichtbaar voor de
eigenaar van het vakman-profiel.

**Component:** `src/components/features/reviews/ReplyForm.tsx`

- Knop "Reageer" onder de review (alleen voor de vakman)
- Textarea opent inline, max 300 tekens
- Eén reactie per review (edit mogelijk, geen delete)
- Insert in `review_reacties` tabel
- Weergave: apart blok onder de review met label "Reactie van {bedrijfsnaam}"

---

## 3. Zoeken & filteren

### 3.1 Zoekpagina (`/zoeken`)

Bewoner landt hier vanuit de homepage (categorie-tegel klik) of via
de zoekbalk in de nav/bottom bar.

**Layout:**
```
┌──────────────────────────────────────────────┐
│ [Zoekbalk: "Stukadoor in Amersfoort"]        │
├──────────────────────────────────────────────┤
│ Filters:                                      │
│ [Categorie ▾] [Afstand ▾] [Rating ▾] [Beschikbaar ▾] │
├──────────────────────────────────────────────┤
│ 12 vakmensen gevonden                         │
│                                               │
│ ┌── VakmanCard ──────────────────────────┐   │
│ │ [Logo] TopStuc Afbouw          ★ 4.9  │   │
│ │ Stucwerk · Amersfoort · 48 klussen     │   │
│ │ ☑ Geverifieerd · ⚡ Reageert < 1 uur   │   │
│ │ [Bekijk profiel →]                     │   │
│ └────────────────────────────────────────┘   │
│ ┌── VakmanCard ──────────────────────────┐   │
│ │ [Initiaal] Schildersbedrijf Jansen ★4.6│   │
│ │ ...                                     │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 3.2 Filters

| Filter | Type | Opties |
|--------|------|--------|
| Categorie | Select | Uit `categorieen` tabel WHERE actief AND type='vakman' |
| Afstand | Select | 5 km, 10 km, 15 km, 25 km, 50 km |
| Minimale rating | Select | 4.0+, 4.5+, alleen 5.0 |
| Beschikbaarheid | Toggle | "Beschikbaar deze week" |
| Geverifieerd | Toggle | Alleen geverifieerde vakmensen |

**Query-opbouw (Supabase):**
```tsx
let query = supabase
  .from('vakman_overzicht')
  .select('*')
  .eq('geverifieerd', true);  // altijd alleen geverifieerde tonen? Of ook niet-geverifieerde?

if (categorie) query = query.contains('categorie_slugs', [categorie]);
if (minRating) query = query.gte('gem_score', minRating);
// Afstand: filter op werkgebied_postcode + werkgebied_km (client-side of via PostGIS later)

query = query.order('gem_score', { ascending: false });
```

**URL-state:** filters in de URL query params zodat ze deelbaar zijn:
`/zoeken?categorie=stucwerk&afstand=15&rating=4.5`

### 3.3 VakmanCard component

`src/components/features/vakman/VakmanCard.tsx`

- Logo of initiaal-avatar (grotere kaart als logo aanwezig)
- Bedrijfsnaam
- Categorie(ën)
- Werkgebied
- Gemiddelde score + aantal reviews
- Badges: geverifieerd, reactietijd, profiel compleet
- CTA: "Bekijk profiel →"

---

## 4. Berichten / Chat

### 4.1 Hoe het werkt

Chat is 1-op-1 tussen bewoner en vakman, altijd gekoppeld aan een context
(een boeking of een algemene vraag). Berichten zijn realtime via
Supabase Realtime subscriptions.

### 4.2 Routes

| Route | Beschrijving |
|-------|-------------|
| `/berichten` | Overzicht van alle gesprekken |
| `/berichten/[gesprek_id]` | Individueel gesprek |

### 4.3 Gesprekken-overzicht (`/berichten`)

```
┌─────────────────────────────────────┐
│ Berichten                            │
├─────────────────────────────────────┤
│ ┌── Gesprek ─────────────────────┐  │
│ │ [Avatar] TopStuc Afbouw        │  │
│ │ "Ja, ik kan woensdag om 9u"    │  │
│ │ 2 uur geleden · Stucwerk       │  │
│ │                          ● 1   │  │
│ └────────────────────────────────┘  │
│ ┌── Gesprek ─────────────────────┐  │
│ │ [Avatar] Van Dijk Schilders    │  │
│ │ "De offerte is verstuurd"      │  │
│ │ Gisteren · Schilderwerk        │  │
│ └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Data:**
```tsx
const gesprekken = await supabase
  .from('gesprekken')
  .select(`
    *,
    deelnemers:gesprek_deelnemers(user_id, profielen(*)),
    laatste_bericht:berichten(tekst, created_at, van_id)
  `)
  .order('created_at', { foreignTable: 'berichten', ascending: false })
  .limit(1, { foreignTable: 'berichten' });
```

### 4.4 Gesprek-detail (`/berichten/[gesprek_id]`)

```
┌─────────────────────────────────────┐
│ ← TopStuc Afbouw            ℹ️      │
├─────────────────────────────────────┤
│                                      │
│        Hoi, ik wil graag mijn       │
│        woonkamer laten spackspuiten │
│        Heb je plek volgende week?   │
│                          14:22  ✓✓  │
│                                      │
│ Ja, ik kan woensdag of              │
│ donderdag. Hoeveel m²?              │
│ 14:45                                │
│                                      │
│        Ongeveer 35m². Wat           │
│        zou dat kosten?              │
│                          15:01  ✓✓  │
│                                      │
├─────────────────────────────────────┤
│ [📎] [Typ een bericht...    ] [→]   │
└─────────────────────────────────────┘
```

**Realtime:**
```tsx
useEffect(() => {
  const channel = supabase
    .channel(`gesprek-${gesprekId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'berichten',
      filter: `gesprek_id=eq.${gesprekId}`,
    }, (payload) => {
      setBerichten(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [gesprekId]);
```

**Functies:**
- Tekst versturen
- Foto versturen (upload naar Supabase Storage `chat-fotos`)
- Leesbevestiging (update `gelezen_op` wanneer ontvanger het gesprek opent)
- Ongelezen-teller in nav/bottom bar (badge met getal)
- Scroll-to-bottom bij nieuw bericht
- Datum-scheiders ("Vandaag", "Gisteren", "12 juni")

### 4.5 Gesprek starten

Vanuit vakman-profiel: knop "Stuur bericht" opent `/berichten/nieuw?vakman={vakman_id}`.
1. Check of er al een gesprek bestaat tussen deze 2 users
2. Zo ja → open dat gesprek
3. Zo nee → maak nieuw gesprek + deelnemers, redirect naar gesprek

### 4.6 Supabase Storage bucket
- `chat-fotos` (private — alleen deelnemers kunnen lezen via signed URLs)

---

## 5. Boekingsflow

### 5.1 Flow

```
Vakman-profiel → [Boek nu] →

Stap 1: Datum kiezen
  Beschikbaarheidskalender van de vakman
  Kies een beschikbare dag

Stap 2: Klus beschrijven
  Categorie (vooringevuld als je vanuit categorie-pagina komt)
  Omschrijving (textarea)
  Foto's (optioneel, max 5)

Stap 3: Bevestigen
  Samenvatting: vakman, datum, omschrijving
  [Boekingsaanvraag versturen →]

→ Bevestiging: "Aanvraag verstuurd! {bedrijfsnaam} ontvangt een bericht."
```

### 5.2 Na boeking

1. Insert in `boekingen` (status: `aangevraagd`)
2. Maak automatisch een gesprek aan tussen klant en vakman
3. Stuur notificatie naar vakman (type: `boeking`)
4. Stuur bevestigingsmail naar klant (via Resend)

### 5.3 Vakman beheert boekingen

Op `/dashboard` → sectie "Aanvragen":

```
┌── Nieuwe aanvraag ───────────────────┐
│ [Avatar] Marieke V. · Vathorst Blok C│
│ Stucwerk · wo 28 mei                  │
│ "Woonkamer + hal spackspuiten, ~40m²"│
│                                       │
│ [✓ Accepteren]  [✕ Afwijzen]  [💬]   │
└───────────────────────────────────────┘
```

**Statusflow:**
```
aangevraagd → bevestigd → afgerond
           ↘ geannuleerd
```

- Bij **accepteren**: status → `bevestigd`, notificatie naar klant
- Bij **afwijzen**: status → `geannuleerd`, notificatie naar klant met reden (optioneel)
- Bij **afronden** (door vakman of klant): status → `afgerond`, review-verzoek naar klant

### 5.4 Review-verzoek na afronding

24 uur na afronding: stuur notificatie + e-mail naar klant:
"Hoe was je ervaring met {bedrijfsnaam}? Laat een review achter en help je buren."
Met een directe link naar het review-formulier met `boeking_id` vooringevuld.

---

## 6. Freemium model

### 6.1 Filosofie

De vulling is nu het belangrijkst. Vakmensen moeten zonder drempel kunnen
starten. Betaalde features komen pas wanneer de vakman bewezen waarde
ervaart op het platform. Alles wat gratis is, moet goed genoeg zijn om
mee te werken. Alles wat premium is, moet de moeite waard voelen.

### 6.2 Gratis (voor altijd)

| Feature | Details |
|---------|---------|
| Profiel aanmaken | Bedrijfsnaam, KvK, categorie, werkgebied, bio |
| Tot 3 werkfoto's | Meer foto's = premium |
| Reviews ontvangen | Onbeperkt |
| Op reviews reageren | Onbeperkt |
| Boekingsaanvragen ontvangen | Max 5 per maand |
| Berichten | Onbeperkt (essentieel voor conversie) |
| Beschikbaarheid instellen | Ja |
| Badge "Geverifieerd" | Na admin-check, gratis |

### 6.3 Premium (€29/maand of €249/jaar)

| Feature | Details |
|---------|---------|
| Onbeperkte boekingsaanvragen | Geen limiet van 5/maand |
| Tot 12 werkfoto's | Meer visuele ruimte |
| Topplaatsing in zoekresultaten | Premium vakmensen staan bovenaan |
| Badge "Neighbuur Pro" | Opvallende gouden badge op profiel |
| Profiel-statistieken | Hoeveel mensen bekijken je profiel, klikken, boeken |
| Prioriteit in community-spotlights | Admin kan je uitlichten |
| Maandelijks overzicht per e-mail | Performance-rapport |

### 6.4 Database

```sql
-- Uitbreiding op vakman_profielen
alter table vakman_profielen add column is_premium boolean default false;
alter table vakman_profielen add column premium_tot date;  -- einddatum abonnement
alter table vakman_profielen add column stripe_customer_id text;  -- of Mollie
alter table vakman_profielen add column aanvragen_deze_maand int default 0;
alter table vakman_profielen add column aanvragen_limiet int default 5;
```

### 6.5 Premium-upsell momenten

Toon de upsell op het juiste moment — niet overal, niet pushy:

1. **Bij 5e aanvraag van de maand:** "Je hebt je gratis limiet bereikt. Upgrade naar Pro voor onbeperkte aanvragen → €29/mnd"
2. **Bij 4e foto-upload:** "Gratis profielen tonen 3 foto's. Met Pro toon je er 12 → Upgrade"
3. **Op het dashboard (subtiel):** kleine kaart "Wist je dat Pro-vakmensen 2x meer boekingen krijgen?"
4. **Na eerste positieve review:** "Goed bezig! Met Pro sta je bovenaan bij zoekopdrachten → Probeer 14 dagen gratis"

### 6.6 Betalingen voor premium

**Fase 3 (nu):** handmatig. Vakman vraagt upgrade aan, jij zet `is_premium = true`
en `premium_tot` in de database. Betaling via factuur of Tikkie.

**Fase 4 (later):** Mollie recurring payments. Vakman voert iDEAL in,
automatische maandelijkse afschrijving. Self-service upgrade/downgrade pagina.

### 6.7 Uitbreiding naar commissie-model (toekomst)

Wanneer het platform goed gevuld is en de boekingsflow bewezen werkt:

**Stap 1:** Voeg optionele betalingen via het platform toe. Klant kan de vakman
betalen via Neighbuur (niet verplicht). Voordeel voor klant: betaalbescherming.
Voordeel voor vakman: professioneler.

**Stap 2:** Bij betalingen via het platform: houd 10% commissie in.
Communiceer dit als "service fee" voor de klant of als commissie voor de vakman.

**Stap 3:** Maak betaling via het platform verplicht voor de "Geverifieerde klus"-badge
op reviews. Nu moet de klus via het platform gelopen hebben. Dit stimuleert
het gebruik van de betalingsfunctie.

**Database-voorziening (nu al aanleggen):**
```sql
create table transacties (
  id                uuid primary key default uuid_generate_v4(),
  boeking_id        uuid references boekingen(id),
  vakman_id         uuid references vakman_profielen(id),
  klant_id          uuid references profielen(id),
  bedrag_cents      int not null,
  commissie_cents   int default 0,
  status            text default 'pending',  -- pending, paid, refunded
  mollie_payment_id text,
  created_at        timestamptz default now()
);
```

Maak deze tabel nu aan maar bouw er nog geen UI voor — dat is fase 4.

---

## 7. Notificaties

### 7.1 Drie kanalen

| Kanaal | Wanneer | Technologie |
|--------|---------|-------------|
| In-app | Altijd | Supabase query op `notificaties` tabel |
| Push | Als app geïnstalleerd (PWA) | Web Push API + service worker |
| E-mail | Bij belangrijke events | Resend |

### 7.2 Triggers

| Event | In-app | Push | E-mail |
|-------|--------|------|--------|
| Nieuwe boekingsaanvraag (vakman) | ✓ | ✓ | ✓ |
| Boeking bevestigd (klant) | ✓ | ✓ | ✓ |
| Boeking geannuleerd | ✓ | ✓ | ✓ |
| Nieuw bericht | ✓ | ✓ | Na 10 min ongelezen |
| Nieuwe review (vakman) | ✓ | ✓ | ✓ |
| Review upvote (bij 5, 10, 25) | ✓ | — | — |
| Uitnodiging geaccepteerd | ✓ | ✓ | — |
| Groepskorting bijna vol | ✓ | ✓ | ✓ |
| Review-verzoek (24u na klus) | ✓ | ✓ | ✓ |
| Premium limiet bereikt | ✓ | — | ✓ |

### 7.3 In-app notificatie-centrum

**In de nav:** belletje met ongelezen-teller (rood rondje met getal).
**Klik:** dropdown of volledige pagina (`/notificaties`) met lijst:

```
┌─────────────────────────────────────┐
│ 🔔 Notificaties                     │
│                                      │
│ ● Nieuwe aanvraag van Marieke V.    │
│   Stucwerk · wo 28 mei              │
│   2 uur geleden                      │
│                                      │
│   Sanne R. heeft een review achter- │
│   gelaten over jouw werk             │
│   Gisteren                           │
│                                      │
│   Je buurman Jeroen is lid geworden │
│   van Blok C via jouw uitnodiging    │
│   3 dagen geleden                    │
└─────────────────────────────────────┘
```

**Markeer als gelezen:** bij openen van de notificatie.
**Markeer alles als gelezen:** knop bovenaan.

### 7.4 Web Push implementatie

```tsx
// Service worker registratie (in layout of app-component)
if ('serviceWorker' in navigator && 'PushManager' in window) {
  const registration = await navigator.serviceWorker.register('/sw.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
  });
  // Sla subscription op in database (nieuwe tabel: push_subscriptions)
  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: JSON.stringify(subscription),
  });
}
```

**Server-side push versturen:**
Via een Supabase Edge Function of Next.js API route die de `web-push` library gebruikt.

**Database:**
```sql
create table push_subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profielen(id) on delete cascade,
  subscription  jsonb not null,
  created_at    timestamptz default now(),
  unique(user_id)
);
```

### 7.5 E-mail templates (Resend)

Maak templates voor:
- `boeking-aanvraag` — "Nieuwe aanvraag van {klant} voor {categorie}"
- `boeking-bevestigd` — "{vakman} heeft je boeking bevestigd voor {datum}"
- `review-verzoek` — "Hoe was je ervaring met {vakman}?"
- `review-ontvangen` — "{klant} heeft een review achtergelaten"
- `uitnodiging-geaccepteerd` — "{naam} is lid geworden via jouw link"
- `premium-limiet` — "Je hebt 5/5 aanvragen gebruikt deze maand"

Alle templates tweetalig (NL/EN) op basis van `profielen.taal`.

---

## 8. Nieuwe database-objecten voor fase 3

Voeg toe als migratie `0002_fase3.sql`:

```sql
-- Transacties (voorbereid op commissie-model)
create table transacties (
  id                uuid primary key default uuid_generate_v4(),
  boeking_id        uuid references boekingen(id),
  vakman_id         uuid references vakman_profielen(id),
  klant_id          uuid references profielen(id),
  bedrag_cents      int not null,
  commissie_cents   int default 0,
  status            text default 'pending',
  mollie_payment_id text,
  created_at        timestamptz default now()
);

-- Push subscriptions
create table push_subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profielen(id) on delete cascade,
  subscription  jsonb not null,
  created_at    timestamptz default now(),
  unique(user_id)
);

-- Premium-uitbreiding op vakman_profielen
alter table vakman_profielen add column if not exists is_premium boolean default false;
alter table vakman_profielen add column if not exists premium_tot date;
alter table vakman_profielen add column if not exists aanvragen_deze_maand int default 0;
alter table vakman_profielen add column if not exists aanvragen_limiet int default 5;

-- Supabase Storage buckets
-- (aanmaken via dashboard of CLI):
-- review-fotos     (public)
-- chat-fotos       (private)

-- RLS
alter table transacties enable row level security;
alter table push_subscriptions enable row level security;

create policy "own_read" on transacties for select
  using (klant_id = auth.uid() or vakman_id in (select id from vakman_profielen where user_id = auth.uid()));
create policy "own_read" on push_subscriptions for all using (user_id = auth.uid());

-- Functie: reset maandelijkse aanvragen-teller (draai als cron)
create or replace function reset_maandelijkse_aanvragen()
returns void as $$
begin
  update vakman_profielen set aanvragen_deze_maand = 0;
end;
$$ language plpgsql security definer;
```

---

## 9. Nieuwe componenten

```
features/reviews/
  ReviewForm.tsx           — scores + tekst + foto's + submit
  UpvoteButton.tsx         — optimistic UI, login-check
  ReplyForm.tsx            — vakman-reactie inline

features/search/
  SearchPage.tsx           — zoekbalk + filters + resultaten
  SearchFilters.tsx        — categorie, afstand, rating, beschikbaar
  VakmanCard.tsx           — zoekresultaat-kaart

features/chat/
  GesprekkenLijst.tsx      — overzicht met laatste bericht + ongelezen
  GesprekDetail.tsx        — berichtenlijst + input + realtime
  ChatBubble.tsx           — enkel bericht (eigen vs. ander)
  ChatInput.tsx            — tekst + foto-upload + verstuurknop

features/booking/
  BookingFlow.tsx          — 3-staps wizard
  DatumKiezer.tsx          — beschikbaarheidskalender van vakman
  KlusOmschrijving.tsx     — textarea + foto-upload
  BookingBevestiging.tsx   — samenvatting + verstuurknop
  BookingCard.tsx          — voor vakman-dashboard (aanvraag-kaart)
  BookingStatusBadge.tsx   — aangevraagd/bevestigd/afgerond/geannuleerd

features/notifications/
  NotificatieCentrum.tsx   — dropdown of pagina met lijst
  NotificatieBadge.tsx     — belletje met teller in nav
  NotificatieItem.tsx      — enkel item met icoon + tekst + tijd

features/premium/
  PremiumUpsell.tsx        — kaart die op het juiste moment verschijnt
  PremiumBadge.tsx         — gouden "Neighbuur Pro" badge

pwa/
  InstallBanner.tsx        — "Voeg toe aan startscherm" prompt
```

---

## 10. Volgorde van bouwen

1. PWA manifest + service worker + meta tags + app-iconen
2. `InstallBanner` component
3. Mobiele optimalisaties (safe areas, touch targets, pull-to-refresh)
4. `ReviewForm` + `UpvoteButton` + `ReplyForm` componenten
5. Review-flow testen: schrijven → weergave → upvoten → vakman-reactie
6. `SearchPage` + `SearchFilters` + `VakmanCard` componenten
7. `/zoeken` pagina met URL-state filters
8. `GesprekkenLijst` + `GesprekDetail` + `ChatBubble` + `ChatInput`
9. `/berichten` en `/berichten/[gesprek_id]` met Supabase Realtime
10. Ongelezen-teller in nav
11. `BookingFlow` + `DatumKiezer` + `KlusOmschrijving` + `BookingBevestiging`
12. Boekingsflow integreren op vakman-profiel ("Boek nu" knop)
13. `BookingCard` + vakman-dashboard uitbreiden met aanvragen-sectie
14. Statusflow: accepteren, afwijzen, afronden + notificaties
15. Review-verzoek 24u na afronding
16. Migratie `0002_fase3.sql` draaien
17. Freemium: limieten toepassen (5 aanvragen/maand check)
18. `PremiumUpsell` component op de juiste momenten
19. `NotificatieCentrum` + `NotificatieBadge` + in-app notificaties
20. Web Push setup (VAPID keys, service worker push handler)
21. E-mail notificaties via Resend (templates + triggers)
22. Testen: volledige bewoner-flow (zoeken → boeken → chatten → reviewen)
23. Testen: volledige vakman-flow (aanvraag → accepteren → afronden → reactie)
24. Testen: PWA installeren op telefoon, push-notificatie ontvangen

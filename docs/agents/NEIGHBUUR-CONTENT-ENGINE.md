# Neighbuur Content Engine — technische architectuur

Centrale technische bron van waarheid voor de Content & Social Media Engine. Geldt voor **staging** (`staging`-branch, commit `16c4dc2`). Niets hierin is nog naar productie gepromoot.

Drie partijen, drie verantwoordelijkheden:
- **Claude Code** — bouwt en onderhoudt de technische architectuur hieronder.
- **Hermes Agent** — levert content aan via de beveiligde `/api/hermes/*`-endpoints; raakt verder niets direct aan.
- **ChatGPT** — productstrategie, UX, commerciële prioriteiten; geen technische rol hier.

---

## 1. Wat daadwerkelijk geïmplementeerd is

| Onderdeel | Status |
|---|---|
| `blog_posts`-tabel + RLS | ✅ Geïmplementeerd (migratie `0067_blog_posts.sql`) |
| `blog-images`-storage-bucket | ✅ Aangemaakt, publiek leesbaar, alleen admins kunnen schrijven |
| Publieke blog (`/blog`, `/blog/[slug]`) | ✅ Geïmplementeerd, alleen `status='published'` |
| SEO: `sitemap.ts`, `robots.ts`, JSON-LD | ✅ Geïmplementeerd |
| `/admin/content` goedkeuringskalender | ✅ Geïmplementeerd (maand-grid, geen lijst) |
| `/api/hermes/brief`, `/drafts`, `/analytics` | ✅ Geïmplementeerd, auth-gated |
| `HERMES_API_SECRET` (staging) | ✅ Geconfigureerd + functioneel geverifieerd |
| Vercel Deployment Protection bypass | ✅ Opgelost (`VERCEL_AUTOMATION_BYPASS_SECRET`, officiële Vercel-functie) |
| Afbeeldingen aanleveren door Hermes | ❌ Geen endpoint — zie §7 |
| Social media (Instagram/Facebook/Buffer) | ❌ Niet gebouwd, buiten scope van dit systeem |
| Publicatieplanning/automatisering | ⚠️ Alleen een datumveld (`scheduled_at`) — geen scheduler die er iets mee doet, zie §6 |

---

## 2. Database — tabellen en velden (zoals ze daadwerkelijk bestaan)

### `blog_posts` (migratie `0067_blog_posts.sql`)

| Kolom | Type | Verplicht | Opmerking |
|---|---|---|---|
| `id` | `uuid` | PK, auto | `gen_random_uuid()` |
| `slug` | `text` | ja, uniek | |
| `title` | `text` | ja | |
| `excerpt` | `text` | nee | |
| `body_html` | `text` | ja | server-side gesaniteerd bij binnenkomst via Hermes |
| `cover_image_url` | `text` | nee | geen upload-mechanisme voor Hermes, zie §7 |
| `status` | `text` | ja, default `draft` | check-constraint: `draft \| approved \| published` |
| `seo_title` | `text` | nee | |
| `seo_description` | `text` | nee | |
| `source` | `text` | ja, default `hermes` | check-constraint: `hermes \| manual` |
| `created_at` | `timestamptz` | auto | |
| `approved_at` | `timestamptz` | nee | gezet door `/admin/content` bij goedkeuring |
| `scheduled_at` | `timestamptz` | nee | **puur informatief**, stuurt niets automatisch aan |
| `published_at` | `timestamptz` | nee | gezet door `/admin/content` bij publiceren |

**RLS:**
- `public_read_published` — `select` waar `status='published'`, voor iedereen.
- `admin_manage` — alle operaties, alleen waar `profiles.id = auth.uid()` en `profiles.role = 'admin'`.

### `blog-images` (Supabase Storage bucket)
Publiek leesbaar (`public: true`). Schrijven alleen via `admin_manage_blog_images`-policy: ingelogde gebruiker met `role='admin'`. **Hermes kan hier nu niets naartoe uploaden** — geen API-endpoint ontsluit deze bucket voor Hermes.

### `analytics_events` (migratie `0066_analytics_events.sql`, bestond al vóór de content-engine)
`id, event_name, properties (jsonb), session_id, lang, path, utm_source, utm_medium, utm_campaign, utm_content, created_at`. RLS: publiek insert-only (`anon, authenticated`), niemand mag lezen behalve `service_role`. Wordt gebruikt voor `blog_post_view` (vanaf de blogdetailpagina) en kan voor social-kliks hergebruikt worden (nog niet geïmplementeerd).

Er bestaat **geen** `social_posts`-tabel, **geen** `content_calendar`-tabel los van `blog_posts`, en **geen** block-systeem zoals het bestaande `community_content_blocks` is bewust niet hergebruikt/uitgebreid.

---

## 3. API-endpoints die beschikbaar zijn

Base-URL staging: `https://neighbuur-git-staging-orange1valley-7305s-projects.vercel.app`

| Endpoint | Methode | Auth | Doel |
|---|---|---|---|
| `/api/hermes/brief` | `GET` | bearer | Merkregels (volledige inhoud van `src/content/neighbuur-brand-guide.md`) + 20 meest recente posts (titel/status/data) |
| `/api/hermes/drafts` | `POST` | bearer | Eén nieuw blogpost-concept indienen — komt altijd binnen als `status: "draft"`, `source: "hermes"` |
| `/api/hermes/analytics` | `GET` | bearer, optioneel `?days=N` (max 90, default 7) | Samengevatte cijfers: events per `event_name`, posts per `status` — geen ruwe rijen |

Geen andere methodes (`PUT`/`PATCH`/`DELETE`) bestaan onder `/api/hermes/*` — bewust, zie §5 en §9.

Exacte request/response-schema's, foutcodes en voorbeeldverzoeken staan al uitgewerkt in [`docs/hermes-staging-handoff.md`](../hermes-staging-handoff.md) — dat document wordt hier niet herhaald, alleen aangevuld waar relevant.

---

## 4. Authenticatie en beveiliging

Twee onafhankelijke lagen, allebei vereist op staging:

1. **Vercel Deployment Protection** — elke `*.vercel.app`-preview-URL (dus ook staging) zit achter Vercel's eigen SSO. Automatische clients moeten de header `x-vercel-protection-bypass: <VERCEL_AUTOMATION_BYPASS_SECRET>` meesturen. Dit is een Vercel-platformfunctie, los van onze applicatiecode.
2. **`HERMES_API_SECRET`** — eigen, applicatieniveau bearer-token-check in `src/lib/hermes-auth.ts`, toegepast op alle drie de `/api/hermes/*`-routes. Logica:
   - geen secret server-side geconfigureerd → `500`
   - header ontbreekt / is geen `Bearer ...` / token klopt niet → `401`
   - klopt alles → request gaat door

Beide lagen zijn functioneel geverifieerd (echte `200`-respons met correcte headers; `401` bij correcte Vercel-bypass maar foutieve `HERMES_API_SECRET` — bevestigt dat laag 2 niet wordt omzeild door laag 1).

Hermes krijgt **nooit** de Supabase `service_role`-key. Interne routes gebruiken die key zelf (`createAdminSupabase()`), Hermes ziet 'm nooit.

---

## 5. Hoe Hermes content mag aanleveren

Uitsluitend via `POST /api/hermes/drafts`. Volledig schema staat in `docs/hermes-staging-handoff.md` §4-5. Samengevat:
- Verplicht: `title`, `body_html`.
- Optioneel: `slug` (anders afgeleid), `excerpt`, `cover_image_url` (moet een al bestaande URL zijn — Hermes kan zelf niets uploaden), `seo_title`, `seo_description`, `scheduled_at`.
- `body_html` wordt server-side gesaniteerd tegen een vaste allowlist (`sanitize-html`): tags `p, h2, h3, strong, em, a, ul, ol, li, blockquote, br, img`; attributen `a[href,rel,target]`, `img[src,alt]`.
- `status` en `source` zijn niet door Hermes instelbaar — altijd hardcoded `draft`/`hermes`.

---

## 6. Wat ontbreekt

- **Geen upload-mogelijkheid voor Hermes** — `cover_image_url` moet al een bestaande, publiek bereikbare URL zijn. Hermes kan niet zelf een bestand naar `blog-images` sturen.
- **Geen publicatie-automatisering** — `scheduled_at` is een datumveld dat de kalender gebruikt om een post op een dag te tonen; er is geen cron/worker die op basis daarvan automatisch `status` naar `published` zet. Publiceren is en blijft een handmatige klik in `/admin/content`.
- **Geen social-media-integratie** — geen Buffer-koppeling, geen Instagram/Facebook-API-gebruik, geen `social_posts`-tabel. Dit systeem regelt uitsluitend de Neighbuur-blog.
- **Geen verwijderknop** in `/admin/content` — een post terugdraaien kan alleen naar `draft`, niet verwijderen. Opruimen (bv. testposts) moet nu via de Supabase SQL Editor.
- **Geen gecombineerd content-overzicht** (blog + wat er social gepland staat) — logisch gevolg van het vorige punt.

---

## 7. Welke uitbreidingen noodzakelijk zijn

Alleen als je verdergaat dan "Hermes levert blogconcepten aan die een mens goedkeurt" (het huidige, werkende doel):

- **`POST /api/hermes/upload-image`** (of vergelijkbaar) als Hermes zelf coverbeelden moet kunnen aanleveren in plaats van alleen een al bestaande URL door te geven. Zonder dit endpoint moet elke afbeelding ergens anders (handmatig, of door een ander systeem) al gehost zijn vóórdat Hermes 'm kan refereren.
- Niets anders is noodzakelijk voor de huidige, bewust beperkte scope (blog, menselijke goedkeuring).

## 8. Welke uitbreidingen optioneel zijn

- Verwijderknop in `/admin/content` voor concepten (nu alleen via SQL).
- Weekrapport-mail (Resend) die `blog_post_view`-events en conversies samenvat — bouwstenen (UTM, `analytics_events`) bestaan al.
- Gecombineerd blog+Buffer-kalenderoverzicht — pas zinvol zodra Buffer daadwerkelijk is aangesloten.
- `social_posts`-tabel als Neighbuur zelf wil bijhouden wat naar Buffer is gestuurd (optioneel — Buffer heeft dit zelf ook al).
- Fijnmazige Postgres-rol/eigen JWT voor Hermes in plaats van de huidige bearer-secret (hardening, geen functionele noodzaak).

## 9. Technische beperkingen

- **`body_html` is de enige contentvorm** — geen markdown-ondersteuning, geen blokkensysteem. Hermes moet kant-en-klare, toegestane HTML aanleveren.
- **Sanitisatie is een vaste allowlist** — tabellen, afbeeldingsstyling, inline `style=`, `<script>` worden altijd gestript, ongeacht wat Hermes aanlevert.
- **Geen enkele `/api/hermes/*`-route kan een post laten publiceren of goedkeuren** — structureel, niet alleen een afspraak. Dit is de harde garantie achter "V1 werkt met menselijke goedkeuring vóór publicatie": er bestaat simpelweg geen endpoint dat `status` naar `approved`/`published` kan zetten behalve de admin-UI met een ingelogde menselijke sessie.
- **Vercel Deployment Protection geldt voor de hele staging-omgeving**, niet alleen voor `/api/hermes/*` — iedere aanroep (ook browser) heeft de Vercel-SSO-sessie of de bypass-header nodig.
- **Pre-existing, los van dit systeem:** de 3 bestaande cron-routes (`/api/cron/platform-stats`, `/api/cron/communities-status`, `/api/cron/review-verzoeken`) hebben geen enkele authenticatie. Niet veroorzaakt door de content-engine, maar wel een bestaand gat in dezelfde categorie (niet-menselijke aanroepers) — zie LATER in het oorspronkelijke plan.

## 10. Taakverdeling: Claude Code vs. Hermes

| Taak | Wie |
|---|---|
| Schema, migraties, RLS, endpoints, auth-laag, SEO-infrastructuur | **Claude Code** |
| Vercel/Supabase-configuratie, secrets beheren | **Claude Code** (met jouw akkoord per wijziging) |
| Onderwerpkeuze, research, artikeltekst, SEO-metadata invullen | **Hermes** |
| Beeldmateriaal *kiezen/genereren* | **Hermes** — maar kan het nog niet zelf hosten/uploaden (§7) |
| Concepten indienen | **Hermes**, uitsluitend via `POST /api/hermes/drafts` |
| Goedkeuren en publiceren | **Mens**, via `/admin/content` — nooit Hermes, nooit automatisch |
| Social media (Instagram/Facebook/Buffer) | **Niemand nog** — buiten scope tot accounts + Buffer-koppeling bestaan |

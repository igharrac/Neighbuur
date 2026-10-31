# Content Engine — Claude Code als contentproducent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `blog_posts.source` accepteert een nieuwe waarde `'claude'`, en het eerste artikel geschreven en gecontroleerd door Claude Code staat als `draft` in de staging-database, ter vervanging van de afgekeurde Hermes-keuken-post.

**Architecture:** Geen nieuwe API-laag of code-component. Eén schema-migratie (check-constraint uitbreiden) plus een direct-database-insert-workflow die Claude Code binnen een sessie uitvoert via de bestaande service-role-toegang — hetzelfde patroon dat al is gebruikt om de taalfout-/linkfix op de keuken-post toe te passen.

**Tech Stack:** Supabase Postgres (migratie), REST (`$NEXT_PUBLIC_SUPABASE_URL/rest/v1/...` met `SUPABASE_SERVICE_ROLE_KEY`), geen nieuwe dependencies.

**Spec:** `docs/superpowers/specs/2026-10-31-content-engine-claude-authorship-design.md`

## Global Constraints

- Geen nieuwe API-route, geen nieuw endpoint — rechtstreekse database-toegang, zoals de spec vastlegt.
- `source`-constraint moet na migratie exact `'hermes' | 'manual' | 'claude'` toestaan — niet breder.
- Elke insert via dit pad: `status` altijd expliciet `'draft'`, nooit `'approved'`/`'published'`.
- Geen verzonnen cijfers, testimonials of besparingsclaims (brand guide, harde regel).
- Interne links (`href="/..."`) moeten vóór insert gevalideerd zijn tegen de bekende publieke routes (zelfde allowlist als `ALLOWED_INTERNAL_PREFIXES` in `src/app/api/hermes/drafts/route.ts`).
- Social-media-assets (Instagram/Facebook) expliciet buiten scope van dit plan.
- Geen betaalde beeldgeneratie-API — afbeelding wordt door de mens aangeleverd.
- Alleen staging (`.env.staging`-credentials) — geen productie-wijzigingen.

## Review Focus

- **Bestaande rijen die de nieuwe, strakkere constraint zouden schenden** — al vooraf gecontroleerd (alleen `source: 'hermes'` aanwezig); Task 1 herhaalt deze check vlak vóór de migratie als vangnet tegen tussentijdse wijzigingen.
- **Constraint per ongeluk verbreed in plaats van verscherpt** (bijv. een typo die alles toestaat) — Task 1 test expliciet dat een ongeldige waarde (`'ongeldig'`) nog steeds wordt geweigerd, niet alleen dat `'claude'` wordt geaccepteerd.
- **`status` niet expliciet op `'draft'` gezet** bij de artikel-insert (menselijke/agent-fout, met name omdat `status` een database-default heeft en het dus "per ongeluk goed" kan lijken te gaan) — Task 2 verifieert `status` expliciet via een losse query ná insert, niet alleen via de insert-response.
- **Kapotte interne link die de handmatige check overslaat** — er is op dit pad geen automatische afdwinging (in tegenstelling tot `/api/hermes/drafts`). Task 2 bevat een losse, expliciete verificatiestap die alle `href="/..."`-waarden in de conceptinhoud extraheert en tegen de allowlist toetst vóór de insert wordt uitgevoerd.
- **Door de mens aangeleverde afbeelding die na upload niet publiek bereikbaar blijkt** — Task 2 verifieert de `cover_image_url` met een losse `curl`-statuscode-check (`200`) ná upload, vóór de insert, zoals eerder al gedaan bij het testen van het upload-endpoint.

---

### Task 1: Migratie — `source`-constraint uitbreiden met `'claude'`

**Files:**
- Create: `supabase/migrations/0069_blog_posts_source_claude.sql`
- Create (kopie voor de gebruiker): `~/Desktop/neighbuur_migratie_0069_blog_posts_source_claude.sql`

**Interfaces:**
- Consumes: niets (losstaande migratie).
- Produces: `blog_posts.source` accepteert vanaf nu `'hermes' | 'manual' | 'claude'`. Task 2 gebruikt `source: 'claude'` bij de insert.

- [ ] **Step 1: Vooraf-check — bevestig dat alle bestaande `source`-waarden al binnen de nieuwe constraint vallen**

Run:
```bash
cd /Users/rachidadmin/Documents/neighbuur && set -a && source .env.staging && set +a
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts?select=source" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
Expected: elke teruggegeven `source`-waarde is `"hermes"` of `"manual"`. Bij een onbekende waarde: stop en overleg, migratie niet uitvoeren.

- [ ] **Step 2: Schrijf de migratie**

`supabase/migrations/0069_blog_posts_source_claude.sql`:
```sql
alter table blog_posts drop constraint blog_posts_source_check;
alter table blog_posts add constraint blog_posts_source_check
  check (source in ('hermes', 'manual', 'claude'));
```

- [ ] **Step 3: Kopieer naar Desktop voor de gebruiker en vraag om uitvoering in de staging-SQL-editor**

```bash
cp supabase/migrations/0069_blog_posts_source_claude.sql ~/Desktop/neighbuur_migratie_0069_blog_posts_source_claude.sql
```
Vraag de gebruiker: "Kun je `~/Desktop/neighbuur_migratie_0069_blog_posts_source_claude.sql` in de SQL Editor van je staging-Supabase-project draaien?" — wacht op bevestiging vóór Step 4.

- [ ] **Step 4: Verifieer dat `'claude'` nu wordt geaccepteerd**

Run (test-insert, direct weer opgeruimd):
```bash
set -a && source .env.staging && set +a
curl -s -w "\nstatus: %{http_code}\n" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"title":"__migratie_test__","slug":"__migratie_test__","body_html":"<p>test</p>","status":"draft","source":"claude"}'
```
Expected: `status: 201`.

- [ ] **Step 5: Verifieer dat een ongeldige waarde nog steeds geweigerd wordt (constraint niet per ongeluk verbreed)**

Run:
```bash
curl -s -w "\nstatus: %{http_code}\n" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"__migratie_test_invalid__","slug":"__migratie_test_invalid__","body_html":"<p>test</p>","status":"draft","source":"ongeldig"}'
```
Expected: niet-2xx status (constraint-violation).

- [ ] **Step 6: Ruim de testrij uit Step 4 op**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts?slug=eq.__migratie_test__" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
Expected: `204`.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/0069_blog_posts_source_claude.sql
git commit -m "Migratie: blog_posts.source accepteert 'claude' naast 'hermes'/'manual'"
git push origin staging
```

---

### Task 2: Eerste artikel — onderzoek, schrijven, valideren, indienen

**Files:** geen nieuwe projectbestanden — content wordt rechtstreeks in de database geschreven.

**Interfaces:**
- Consumes: `source: 'claude'` (Task 1), `neighbuur-brand-guide.md` (bestaand), `ALLOWED_INTERNAL_PREFIXES`-lijst uit `src/app/api/hermes/drafts/route.ts` (als referentie voor de handmatige linkcheck, niet als uit te voeren code).
- Produces: één rij in `blog_posts` met `status: 'draft'`, `source: 'claude'`, zichtbaar in `/admin/content`.

- [ ] **Step 1: Lees de brand guide en bestaande titels, stel onderwerp voor**

Run:
```bash
cat src/content/neighbuur-brand-guide.md
set -a && source .env.staging && set +a
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts?select=title" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
Stel 1-3 onderwerpopties voor aan de gebruiker (doelgroep, zoekintentie, aansluiting bij de buren-bundel-propositie). Wacht op keuze vóór Step 2.

- [ ] **Step 2: Schrijf het artikel**

Natuurlijk Nederlands, geen verzonnen cijfers/testimonials/besparingsclaims, tussenkoppen (`<h2>`), expliciete aansluiting bij de propositie. Alleen toegestane HTML-tags gebruiken: `p, h2, h3, strong, em, a, ul, ol, li, blockquote, br, img` (zelfde allowlist als de bestaande sanitisatie — niet omdat dit pad gesaniteerd wordt, maar voor consistentie met wat `/blog/[slug]` daadwerkelijk rendert).

- [ ] **Step 3: Valideer interne links tegen de allowlist**

Extraheer elke `href="/..."` uit de concepttekst. Vergelijk tegen:
```
/bewoners, /diensten, /wijk, /blog, /privacy, /voorwaarden, /vakman, /community, /zoeken, /registreer, /login
```
(exacte lijst uit `ALLOWED_INTERNAL_PREFIXES`, `src/app/api/hermes/drafts/route.ts`). Een link die hier niet onder valt: verwijderen of vervangen vóór verdergaan — niet indienen met een bekende kapotte link.

- [ ] **Step 4: Vraag de gebruiker om een afbeelding, upload 'm, verifieer bereikbaarheid**

Wacht op het bestand van de gebruiker. Upload naar de `blog-images`-bucket (pad: `claude/<uuid>.<ext>`, zelfde patroon als `hermes/<uuid>.<ext>` in `src/app/api/hermes/upload-image/route.ts`):
```bash
curl -s -w "\nstatus: %{http_code}\n" \
  "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/blog-images/claude/<uuid>.<ext>" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: image/<type>" --data-binary @<bestandspad>
```
Verifieer de publieke URL (`.../storage/v1/object/public/blog-images/claude/<uuid>.<ext>`) met een losse `curl -I`-check: expected `200`.

- [ ] **Step 5: Insert als draft**

```bash
curl -s -w "\nstatus: %{http_code}\n" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"title":"...","slug":"...","excerpt":"...","body_html":"...","cover_image_url":"...","seo_title":"...","seo_description":"...","status":"draft","source":"claude"}'
```
Expected: `201`.

- [ ] **Step 6: Verifieer `status` en `source` met een losse query (niet alleen vertrouwen op de insert-response)**

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/blog_posts?select=status,source,quality_flags&slug=eq.<slug>" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
Expected: `status: "draft"`, `source: "claude"`.

- [ ] **Step 7: Meld aan de gebruiker dat het concept klaarstaat in `/admin/content` voor beoordeling**

Geen commit nodig — dit is databasewerk, geen codewijziging.

## Self-Review

1. **Spec coverage:** schema-wijziging (Task 1) + workflowstappen onderzoek/schrijven/linkcheck/afbeelding/insert/verificatie (Task 2) dekken de volledige REQUIRED-NOW-scope uit de spec. USEFUL SOON (geplande run) en LATER-items (social-assets, betaalde beeldgeneratie) zijn bewust niet in dit plan — ze staan in de spec als expliciet later te nemen besluiten.
2. **Step scan:** elke stap levert één concreet, verifieerbaar resultaat (commando + verwachte output, of een expliciete wacht-op-gebruiker-stap). Geen "handle edge cases"-achtige vage stappen.
3. **Type-/naamconsistentie:** `source: 'claude'` consistent in Task 1 (constraint) en Task 2 (insert); padprefix `claude/` in Task 2 consistent met het bestaande `hermes/`-patroon.
4. **Review Focus:** alle vijf punten hebben een eigen verificatiestap gekregen (zie hierboven, elk met een losse check los van de "gelukkige stroom").
5. **Proportie:** plan is korter dan de spec in doorlopende tekst; geen onnodige codeblokken — commando's zijn de daadwerkelijk uit te voeren acties, geen transcript van hypothetische code.

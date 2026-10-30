# Hermes ↔ Neighbuur Content Engine — technisch overdrachtsdocument (staging)

Status: **nog niet bruikbaar — zie Blokkerende bevindingen**. Dit document beschrijft de bestaande implementatie zoals die nu in de code staat (`staging`-branch, commit `16c4dc2`), plus twee infrastructuurgaten die moeten worden gedicht vóór Hermes daadwerkelijk kan verbinden. Er is niets aan code, migraties of deployments veranderd om dit document te maken.

---

## 0. Blokkerende bevindingen (controleer dit eerst)

Ik heb de staging-API daadwerkelijk getest vanaf buiten het project. Resultaat: **niet bereikbaar voor een niet-ingelogde/automatische aanroeper**, om twee onafhankelijke redenen.

### Blokker A — Vercel's eigen SSO-afscherming vóór onze code

Het Vercel-project heeft `ssoProtection: all_except_custom_domains` staan. Dat betekent: élke `*.vercel.app`-preview-URL (dus ook de staging-branch-alias) vereist een ingelogde Vercel-sessie, **vóórdat** onze eigen `/api/hermes/*`-routes ook maar bereikt worden. Test:

```
curl -i https://neighbuur-git-staging-orange1valley-7305s-projects.vercel.app/api/hermes/brief
→ HTTP/2 302, location: https://vercel.com/sso-api?...
```

Dit geldt met én zonder geldige `Authorization`-header — Vercel onderschept het verzoek al op de rand, onze `verifyHermesAuth`-check wordt niet eens uitgevoerd.

**Fix (vereist jouw actie in het Vercel-dashboard, niet iets wat ik automatisch moet/wil aanzetten):**
Vercel → project *neighbuur* → Settings → Deployment Protection → **Protection Bypass for Automation** → genereer een secret. Dat geeft een losse header die automatische clients (zoals Hermes) door de SSO-muur laat, zonder de hele staging-omgeving publiek te maken:

```
x-vercel-protection-bypass: <door Vercel gegenereerde secret>
```

Hermes moet die header op **elk** verzoek naar `/api/hermes/*` meesturen, naast de eigen `Authorization`-header hieronder. Dit is twee onafhankelijke sloten: Vercel's randbeveiliging + onze eigen `HERMES_API_SECRET`-check.

*(Alternatief dat ik niet aanraad voor dit doel: een custom domain aan de staging-deployment hangen — `ssoProtection` geldt namelijk niet voor custom domains. Dat maakt echter de hele staging-site publiek bereikbaar, niet alleen de Hermes-endpoints — grotere blootstelling dan nodig.)*

### Blokker B — `HERMES_API_SECRET` staat nog niet in Vercel

Lokaal (`.env.staging` op jouw machine) staat de secret al klaar, maar die wordt nooit meegenomen in de Vercel-deployment. Ik checkte de daadwerkelijke Vercel-environment-variables van het project (`vercel env ls`): er staat geen `HERMES_API_SECRET` bij, in geen enkele environment.

Gevolg: zelfs ná het oplossen van Blokker A geeft elke `/api/hermes/*`-aanroep `500 {"error":"HERMES_API_SECRET is niet geconfigureerd"}` terug — zie `src/lib/hermes-auth.ts:11-13`.

**Fix:** `HERMES_API_SECRET` toevoegen aan de **Preview**-environment in Vercel (dat is de environment die de `staging`-branch draait), met dezelfde waarde als in `.env.staging`. Ik heb dit niet zelf gedaan, op jouw expliciete verzoek om niets te wijzigen/deployen — maar het is een configuratiewijziging, geen code- of migratiewijziging, dus zeg het als je wilt dat ik dit alsnog voor je doe.

---

## 1. Staging-base-URL

```
https://neighbuur-git-staging-orange1valley-7305s-projects.vercel.app
```

Dit is de stabiele alias die automatisch naar de laatste deployment van de `staging`-branch wijst (git-push naar `staging` → deze URL update automatisch). Gebruik deze, niet een van de losse per-deploy-URL's (die veranderen bij elke push).

Alle endpoints hieronder zijn relatief aan deze base-URL.

## 2. Endpoints, methodes en wat ze doen

| Endpoint | Methode | Doel |
|---|---|---|
| `/api/hermes/brief` | `GET` | Merkregels (volledige `neighbuur-brand-guide.md`) + de 20 meest recente blogposts (titel/status/data), zodat Hermes niet blind nieuwe onderwerpen kiest. |
| `/api/hermes/drafts` | `POST` | Eén nieuw blogpost-concept indienen. Komt **altijd** binnen als `status: "draft"`. |
| `/api/hermes/analytics` | `GET` | Samengevatte cijfers (event-aantallen + post-aantallen per status) voor rapportage. Geen ruwe rijen. |

Geen andere methodes zijn geïmplementeerd (geen `PUT`/`PATCH`/`DELETE` — bewust, zie punt 10). Geen CORS-headers nodig: dit zijn server-naar-server-aanroepen, geen browseraanroepen.

## 3. Authenticatieheaders

Elk verzoek naar `/api/hermes/*` vereist:

```
Authorization: Bearer <HERMES_API_SECRET>
x-vercel-protection-bypass: <Vercel-bypass-secret>   ← zolang Blokker A niet is opgelost
```

Logica (`src/lib/hermes-auth.ts`):
- Geen `HERMES_API_SECRET` server-side geconfigureerd → `500 {"error": "HERMES_API_SECRET is niet geconfigureerd"}`.
- Header ontbreekt, is geen `Bearer ...`, of de token matcht niet → `401 {"error": "Niet geautoriseerd"}`.
- Klopt alles → request gaat door naar de route-logica.

De waarde van `HERMES_API_SECRET` zelf staat hier bewust niet in — haal die uit je eigen secretbeheer (gegenereerd met `openssl rand -hex 32`, zoals in `.env.example` staat aangegeven).

## 4. JSON-schema voor `POST /api/hermes/drafts`

Request body:

```json
{
  "title": "string, verplicht",
  "body_html": "string, verplicht — kant-en-klare HTML",
  "slug": "string, optioneel — anders afgeleid van title, met automatische botsingsafhandeling",
  "excerpt": "string, optioneel",
  "cover_image_url": "string (URL), optioneel",
  "seo_title": "string, optioneel",
  "seo_description": "string, optioneel",
  "scheduled_at": "ISO-8601 datetime string, optioneel — beoogde publicatiedatum, puur informatief voor de kalenderweergave"
}
```

`body_html` wordt server-side gesaniteerd (`sanitize-html`) tegen een vaste allowlist: tags `p, h2, h3, strong, em, a, ul, ol, li, blockquote, br, img`; attributen `a[href,rel,target]`, `img[src,alt]`. Alles daarbuiten wordt gestript — Hermes hoeft hier niets extra voor te doen, maar moet er niet van uitgaan dat bijv. `<script>`, `<style>`, inline `style=`, of `<table>` bewaard blijven.

**Niet instelbaar door Hermes** (server dwingt dit altijd af, body-waarden hiervoor worden genegeerd):
- `status` → altijd `"draft"`.
- `source` → altijd `"hermes"`.
- `id`, `created_at` → door de database gegenereerd.

Succesrespons — `201`:
```json
{ "ok": true, "post": { "id": "uuid", "slug": "gegenereerde-slug", "status": "draft" } }
```

## 5. Verplichte vs. optionele velden

| Veld | Verplicht? |
|---|---|
| `title` | **Ja** — lege/ontbrekende waarde → `400` |
| `body_html` | **Ja** — lege/ontbrekende waarde → `400` |
| `slug`, `excerpt`, `cover_image_url`, `seo_title`, `seo_description`, `scheduled_at` | Optioneel |

## 6. Mogelijke foutmeldingen

| Status | Body | Wanneer |
|---|---|---|
| `302` | (HTML, Vercel SSO-redirect) | Blokker A nog niet opgelost — komt niet eens bij onze code |
| `401` | `{"error": "Niet geautoriseerd"}` | `Authorization`-header ontbreekt of token klopt niet |
| `500` | `{"error": "HERMES_API_SECRET is niet geconfigureerd"}` | Env-var ontbreekt server-side (Blokker B) |
| `400` | `{"error": "title en body_html zijn verplicht"}` | *(alleen `/drafts`)* een van de twee verplichte velden ontbreekt/is leeg |
| `500` | `{"error": "<Postgres-foutmelding>"}` | *(alleen `/drafts`)* database-insert faalde (bv. zeldzame slug-botsing na 5 pogingen) |
| `200` | JSON-body per endpoint | Succes bij `/brief` en `/analytics` |
| `201` | zie punt 4 | Succes bij `/drafts` |

## 7. Veilige verbindingstest

Gebruik **`GET /api/hermes/brief`** als eerste test — die is read-only, muteert niets, en bevestigt in één keer: bereikbaarheid, Vercel-bypass, en `HERMES_API_SECRET`.

```bash
curl -i "https://neighbuur-git-staging-orange1valley-7305s-projects.vercel.app/api/hermes/brief" \
  -H "Authorization: Bearer <HERMES_API_SECRET>" \
  -H "x-vercel-protection-bypass: <Vercel-bypass-secret>"
```

Verwacht bij succes: `200` met `brand_guide_markdown` (de volledige merkgids als tekst) en `recent_posts` (array, leeg zolang er nog geen posts zijn op staging).

## 8. Eén testconcept indienen

Dien een duidelijk als test gemarkeerd concept in — klein, herkenbaar, makkelijk terug te vinden:

```bash
curl -i -X POST "https://neighbuur-git-staging-orange1valley-7305s-projects.vercel.app/api/hermes/drafts" \
  -H "Authorization: Bearer <HERMES_API_SECRET>" \
  -H "x-vercel-protection-bypass: <Vercel-bypass-secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TEST — Hermes-verbindingscheck",
    "excerpt": "Testpost, niet voor publicatie.",
    "body_html": "<p>Dit is een testpost om de Hermes-verbinding met Neighbuur te bevestigen.</p>"
  }'
```

Verwacht bij succes: `201` met `{"ok": true, "post": {"id": "...", "slug": "test-hermes-verbindingscheck", "status": "draft"}}`.

## 9. Controleren dat het concept als draft verschijnt

1. Log in op staging als admin (`orange1valley@gmail.com`, magic link).
2. Open `/admin/content` → de kalenderweergave. De testpost staat op de dag van vandaag (geen `scheduled_at` meegegeven → valt terug op `created_at`), met de grijze "draft"-stijl.
3. Klik 'm aan → detailpaneel toont titel, status `draft`, en de knop "Keur goed" (naar `approved`) — die knop **niet** gebruiken voor een testpost.
4. Bevestig dat de testpost **niet** op de publieke `/blog` staat (RLS laat alleen `status='published'` publiek zien — dat klopt dus al als je 'm niet ziet).
5. Opruimen: er is (nog) geen verwijderknop in de kalender-UI. Verwijder de testrij handmatig via de Supabase SQL Editor op staging:
   ```sql
   delete from blog_posts where slug = 'test-hermes-verbindingscheck';
   ```

## 10. Hoe voorkomen we dat Hermes zelfstandig publiceert?

Dit is structureel afgedwongen, niet alleen een afspraak:

- `/api/hermes/drafts` forceert hardcoded `status: "draft"` — de waarde die Hermes in de requestbody meestuurt voor `status` wordt genegeerd/bestaat niet in het schema.
- Er bestaat **geen** `PATCH`/`PUT`/ander endpoint onder `/api/hermes/*` om een post naar `approved` of `published` te zetten.
- De enige weg van `draft → approved → published` loopt via `ContentCalendar.tsx`, die rechtstreeks de Supabase-browserclient gebruikt met de **ingelogde sessie van een mens met `profiles.role = 'admin'`** — Hermes heeft geen Supabase-inloggegevens en kan deze route dus sowieso niet bereiken, los van de UI.
- Hermes kan dus hoogstens concepten aanleveren; alles daarna is onomkeerbaar een menselijke handeling.

---

## Concreet stappenplan

1. **Jij, in het Vercel-dashboard:** Settings → Deployment Protection → Protection Bypass for Automation → genereer de bypass-secret. Geef Hermes die secret.
2. **Jij (of ik, op jouw akkoord):** `HERMES_API_SECRET` (dezelfde waarde als in `.env.staging`) toevoegen als Vercel-environment-variable voor **Preview**.
3. **Hermes configureren** met: base-URL (punt 1), `HERMES_API_SECRET`, Vercel-bypass-secret — beide als headers op elk verzoek (punt 3).
4. **Verbindingstest:** Hermes (of jij, handmatig) doet de `GET /api/hermes/brief`-aanroep uit punt 7. Pas verder gaan bij een schone `200`.
5. **Testconcept:** dien de testpost uit punt 8 in.
6. **Verifiëren:** check in `/admin/content` dat 'm verschijnt als draft (punt 9), ruim 'm op via SQL.
7. **Pas daarna:** Hermes laten beginnen met echte conceptposts — elk concept blijft op `draft` staan tot jij het in `/admin/content` goedkeurt.

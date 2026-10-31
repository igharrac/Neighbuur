# Content Engine — Claude Code als contentproducent (Hermes gepauzeerd)

**Status:** ontwerp goedgekeurd, implementatieplan volgt.
**Context:** vervolg op de Hermes-integratie (zie `docs/agents/NEIGHBUUR-CONTENT-ENGINE.md`, `docs/hermes-staging-handoff.md`). Een door Hermes gegenereerd artikel (`keuken-maken-aan-de-buurt-...`) bevatte ernstige Nederlandse taalfouten, een kapotte interne link (`/keuken`, bestaat niet) en onvoldoende praktische inhoud. Besluit: Hermes krijgt voorlopig geen nieuwe taken. Claude Code wordt verantwoordelijk voor contentproductie.

## Doel

Een betrouwbare workflow waarmee Claude Code Nederlandstalige blogartikelen onderzoekt, schrijft, zelf controleert en als concept indient — met dezelfde harde grens als altijd: nooit zelf publiceren, uitsluitend een mens keurt goed in `/admin/content`.

## Wat blijft ongewijzigd (hergebruik)

- `blog_posts`-schema (migraties 0067, 0068), RLS, `blog-images`-bucket.
- `/blog` + `/blog/[slug]` publieke routes, `sitemap.ts`/`robots.ts`.
- `/admin/content`-kalender, incl. de `quality_flags`-waarschuwing voor kapotte interne links en de body-preview vóór goedkeuring.
- `src/content/neighbuur-brand-guide.md` — blijft de enige bron van waarheid voor toon en de harde anti-verzinsel-regel. Claude Code leest 'm net als Hermes dat deed.
- De `/api/hermes/*`-routes blijven ongemoeid bestaan (gepauzeerd, niet afgebroken) voor het geval Hermes later terugkomt.

## Wat verandert

**Geen nieuwe API-laag.** De `/api/hermes/*`-routes bestonden specifiek om een extern, semi-vertrouwd systeem (bearer-secret, server-side HTML-sanitisatie) op afstand van de database te houden. Claude Code werkt al met directe, service-role-toegang tot de staging-database binnen een sessie — die omweg heeft geen functie voor dit productiepad. Concepten worden rechtstreeks in `blog_posts` geschreven (zelfde patroon als de taalfout-/linkfix die al is toegepast op de keuken-post).

**Schemawijziging — één migratie:**
```sql
alter table blog_posts drop constraint blog_posts_source_check;
alter table blog_posts add constraint blog_posts_source_check
  check (source in ('hermes', 'manual', 'claude'));
```
`source = 'claude'` maakt in `/admin/content` zichtbaar wie een concept maakte, nu en als Hermes later terugkeert. Geen wijziging aan `ContentCalendar.tsx` nodig — de bestaande "Bron: Hermes / Handmatig"-regel wordt uitgebreid met de `claude`-waarde.

## Workflow

1. **Onderzoek** — Claude Code leest de brand guide + bestaande `blog_posts`-titels (overlapcheck) rechtstreeks uit de database.
2. **Onderwerpkeuze** — Claude Code stelt 1 of enkele opties voor (doelgroep, zoekintentie, aansluiting bij de buren-bundel-propositie); de mens kiest. Geen zelfstandige onderwerpkeuze zonder akkoord.
3. **Schrijven** — artikel in natuurlijk Nederlands, geen verzonnen cijfers/testimonials/besparingsclaims (bestaande harde regel), expliciete aansluiting bij de Neighbuur-propositie.
4. **Linkvalidatie** — interne links (`href="/..."`) worden vóór het insert-statement handmatig gecontroleerd tegen de echte routelijst (dezelfde allowlist-logica als in `src/app/api/hermes/drafts/route.ts`, hier toegepast als controlestap, geen nieuwe code).
5. **Afbeelding** — de mens levert een afbeelding aan (gekozen optie: "Ik lever zelf afbeeldingen aan"); Claude Code uploadt 'm naar de `blog-images`-bucket en vult `cover_image_url`.
6. **Social (Instagram/Facebook)** — **expliciet buiten scope** voor dit moment. Er bestaat geen social-account/Buffer-koppeling (USEFUL SOON in het oorspronkelijke plan, nog niet gerealiseerd) en geen tabel/UI om IG/FB-assets aan een post te koppelen. Bouwen vóórdat er een publicatiekanaal is, is onnodige complexiteit.
7. **Insert** — `status: 'draft'`, `source: 'claude'`, altijd. Geen enkel pad bestaat waarop dit zelfstandig naar `approved`/`published` kan — dat ligt vast in de architectuur (RLS + het ontbreken van elke schrijfroute buiten `/admin/content`'s ingelogde-adminsessie), niet in wie het concept schrijft.
8. **Menselijke goedkeuring** — ongewijzigd, via `/admin/content`.

## Kwaliteitscontrole

Geen apart "tweede model voor eindredactie" nodig (dat was het voorstel toen Hermes nog de schrijver was) — Claude Code is nu zowel schrijver als controleur in dezelfde stap, wat het daadwerkelijke probleem (taalkwaliteit) direct aanpakt. De automatische `quality_flags`-linkcheck in `/api/hermes/drafts` blijft als onafhankelijk vangnet bestaan voor eventuele toekomstige Hermes-concepten, maar is voor dit pad een handmatige controlestap vóór de insert (zie workflowstap 4) — geen reden om de API-route zelf aan te passen.

## Automatisering (Fase 5)

- **Handmatig** — werkt per direct: een verzoek in een sessie resulteert in onderzoek → schrijven → concept indienen binnen die sessie.
- **Gepland** — een geplande cloud-agent-run (Claude Code's `/schedule`-functionaliteit) kan op een cron-ritme (bijv. wekelijks) een vaste opdracht uitvoeren: "onderzoek één nieuw onderwerp conform de brand guide en bestaande titels, schrijf, dien in als `draft`." Publiceert nooit zelf — de goedkeuringsstap blijft het enige pad naar live, ongeacht trigger.
- **Volledig autonoom/onbeheerd** — expliciet niet aangenomen. Geplande runs verbruiken usage binnen het Claude Pro/Code-abonnement (geen onbeperkte achtergrondcapaciteit); er is sowieso geen enkel technisch pad waarlangs een concept zichzelf kan publiceren, ongeacht triggermechanisme.

## Beeldmateriaal (Fase 3)

Geen gratis fotorealistische beeldgeneratietool beschikbaar bij Claude Code in deze omgeving. Gekozen aanpak: de mens levert per artikel een afbeelding aan; Claude Code uploadt 'm via het bestaande, al geteste uploadpatroon (zelfde bucket/aanpak als `POST /api/hermes/upload-image`, hier direct via de Supabase-storage-client i.p.v. de HTTP-route). Een betaalde beeldgeneratie-API blijft een apart, later te nemen besluit met expliciete kosten — niet onderdeel van dit plan.

## Gefaseerd implementatievoorstel

| Fase | Inhoud | Wanneer |
|---|---|---|
| **REQUIRED NOW** | Migratie `source`-constraint (`+'claude'`); eerste artikel door Claude Code geschreven + door de mens aangeleverde afbeelding, ter vervanging van de afgekeurde keuken-post | Direct, na dit ontwerp |
| **USEFUL SOON** | Geplande wekelijkse run via `/schedule` (1 artikel/week, altijd als `draft`) | Zodra een paar handmatige rondes bevallen |
| **LATER** | Instagram/Facebook-assets + opslag/koppeling | Pas zodra social-accounts + Buffer-koppeling bestaan |
| **LATER, apart te beslissen** | Betaalde beeldgeneratie-API | Alleen als het handmatige aanleverpad niet opschaalt, met expliciete kosten vooraf |

## Verificatie

- `npx tsc --noEmit` + volledige build schoon na de migratie-toevoeging.
- Testinsert met `source: 'claude'` slaagt; met een ongeldige waarde faalt op de check-constraint (bevestigt dat de constraint daadwerkelijk aangescherpt is, niet alleen verbreed).
- Het eerste echte artikel wordt vóór insert gecontroleerd op: geen kapotte interne links (handmatig, tegen de bekende routelijst), geen verzonnen claims, correcte aansluiting bij de brand guide.
- Zichtbaar in `/admin/content` met `source: 'claude'` getoond in het detailpaneel, status `draft`, niet zichtbaar op `/blog` vóór goedkeuring.

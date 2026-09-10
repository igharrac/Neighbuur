-- ══════════════════════════════════════════════════════════════
-- Neighbuur — Definitief Database Schema v2
-- ══════════════════════════════════════════════════════════════
-- Alle tabellen, views, RLS policies en seed data.
-- Draai dit als Supabase migratie: supabase db push
-- ══════════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- voor fuzzy search

-- ── Enums ────────────────────────────────────────────────────

create type user_role            as enum ('bewoner', 'vakman', 'community_beheerder', 'admin');
create type boeking_status       as enum ('aangevraagd', 'bevestigd', 'afgerond', 'geannuleerd');
create type beschikbaarheid_type as enum ('beschikbaar', 'bezet');
create type content_blok_type    as enum ('hero_banner', 'tekst', 'afbeelding', 'reviews', 'groepskortingen', 'bewoners', 'aankondiging', 'vakman_spotlight');
create type categorie_type       as enum ('vakman', 'vergelijk');
create type contact_voorkeur     as enum ('telefoon', 'whatsapp', 'app');
create type notificatie_type     as enum ('review', 'boeking', 'bericht', 'uitnodiging', 'groepskorting', 'systeem');

-- ══════════════════════════════════════════════════════════════
-- KERN: Wijken en Communities
-- ══════════════════════════════════════════════════════════════

create table wijken (
  id                uuid primary key default uuid_generate_v4(),
  naam              text not null,
  stad              text not null,
  postcode          text,
  opleverdatum      date,
  aantal_woningen   int,
  slug              text unique not null,
  actief            boolean default true,
  created_at        timestamptz default now()
);

create table communities (
  id                uuid primary key default uuid_generate_v4(),
  wijk_id           uuid not null references wijken(id) on delete cascade,
  naam              text not null,
  slug              text unique not null,
  type              text not null default 'blok',       -- 'blok', 'flat', 'verdieping', 'portiek'
  beschrijving      text,
  banner_url        text,
  actief            boolean default true,
  created_at        timestamptz default now()
);

-- Bewerkbare content-blokken per community
create table community_content_blokken (
  id                uuid primary key default uuid_generate_v4(),
  community_id      uuid not null references communities(id) on delete cascade,
  type              content_blok_type not null,
  positie           int not null default 0,
  data              jsonb not null default '{}',
  -- data bevat type-specifieke velden:
  -- hero_banner:       { afbeelding_url, titel, subtitel }
  -- tekst:             { titel, inhoud }
  -- afbeelding:        { afbeelding_url, bijschrift }
  -- reviews:           { aantal: 5 }
  -- groepskortingen:   {}
  -- bewoners:          { toon_aantal: true }
  -- aankondiging:      { titel, inhoud, kleur }
  -- vakman_spotlight:   { vakman_id }
  actief            boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- GEBRUIKERS
-- ══════════════════════════════════════════════════════════════

create table profielen (
  id                uuid primary key references auth.users(id) on delete cascade,
  naam              text not null,
  email             text,
  telefoon          text,
  rol               user_role not null default 'bewoner',
  avatar_url        text,
  taal              text not null default 'nl',          -- 'nl' of 'en'
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Bewoner-specifieke velden
create table bewoner_profielen (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid unique not null references profielen(id) on delete cascade,
  community_id      uuid references communities(id),
  wijk_id           uuid references wijken(id),
  opleverdatum      date,
  adres             text,
  uitnodigingscode  text unique,                         -- persoonlijke invite code
  created_at        timestamptz default now()
);

-- Community-lidmaatschap (bewoner kan lid zijn van meerdere communities)
create table community_leden (
  id                uuid primary key default uuid_generate_v4(),
  community_id      uuid not null references communities(id) on delete cascade,
  user_id           uuid not null references profielen(id) on delete cascade,
  rol               text not null default 'lid',         -- 'lid' of 'beheerder'
  joined_at         timestamptz default now(),
  unique(community_id, user_id)
);

-- ══════════════════════════════════════════════════════════════
-- VAKMENSEN
-- ══════════════════════════════════════════════════════════════

create table vakman_profielen (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid unique not null references profielen(id) on delete cascade,
  bedrijfsnaam      text not null,
  slug              text unique not null,
  
  -- KvK (gratis variant: format-check + handmatige verificatie)
  kvk_nummer        text,                                -- 8 cijfers, check in applicatielaag
  kvk_geverifieerd  boolean default false,               -- admin zet dit op true
  
  -- Profiel
  bio               text,
  website           text,
  logo_url          text,
  specialismes      uuid[] default '{}',                 -- array van categorie-IDs
  contact_voorkeur  contact_voorkeur default 'app',
  
  -- Werkgebied
  werkgebied_postcode text,
  werkgebied_km     int default 15,
  
  -- Verificatie
  verzekerd         boolean default false,
  verzekering_url   text,                                -- upload bewijs
  geverifieerd      boolean default false,               -- admin overall check
  
  -- Registratie-bron
  registratie_bron  text,                                -- 'flyer', 'qr', 'website', 'bewoner-{id}'
  
  -- Profiel-sterkte (0-100)
  profiel_sterkte   int default 0,
  
  -- Stats (gedenormaliseerd voor performance)
  gem_score         numeric(3,1) default 0,
  aantal_reviews    int default 0,
  reactietijd_min   int,
  
  -- Mollie (fase 2)
  mollie_account_id text,
  
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table beschikbaarheid (
  id                uuid primary key default uuid_generate_v4(),
  vakman_id         uuid not null references vakman_profielen(id) on delete cascade,
  datum             date not null,
  status            beschikbaarheid_type not null default 'beschikbaar',
  unique(vakman_id, datum)
);

create table werk_fotos (
  id                uuid primary key default uuid_generate_v4(),
  vakman_id         uuid not null references vakman_profielen(id) on delete cascade,
  community_id      uuid references communities(id),
  foto_url          text not null,
  bijschrift        text,
  created_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- CATEGORIEËN (admin-beheerd, tweetalig)
-- ══════════════════════════════════════════════════════════════

create table categorieen (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  type              categorie_type not null default 'vakman',
  
  -- Tweetalig
  naam_nl           text not null,
  naam_en           text not null,
  beschrijving_nl   text,
  beschrijving_en   text,
  
  -- Visueel
  afbeelding_url    text,                                -- tegel-afbeelding
  icoon             text,                                -- Phosphor icon naam
  
  -- Beheer
  sorteer           int default 0,
  actief            boolean default true,
  
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- BOEKINGEN
-- ══════════════════════════════════════════════════════════════

create table boekingen (
  id                uuid primary key default uuid_generate_v4(),
  klant_id          uuid not null references profielen(id),
  vakman_id         uuid not null references vakman_profielen(id),
  categorie_id      uuid references categorieen(id),
  community_id      uuid references communities(id),
  
  omschrijving      text,
  foto_urls         text[] default '{}',
  datum             date,
  status            boeking_status not null default 'aangevraagd',
  
  prijs_cents       int,
  mollie_payment_id text,
  
  notities_klant    text,
  notities_vakman   text,
  
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- REVIEWS + UPVOTES + REACTIES
-- ══════════════════════════════════════════════════════════════

create table reviews (
  id                uuid primary key default uuid_generate_v4(),
  auteur_id         uuid not null references profielen(id),
  vakman_id         uuid not null references vakman_profielen(id),
  boeking_id        uuid references boekingen(id),        -- null = niet-geverifieerd
  community_id      uuid references communities(id),
  
  tekst             text not null check (length(tekst) >= 20),
  scores            jsonb not null default '{}',           -- {"kwaliteit":5,"stiptheid":4,...}
  foto_urls         text[] default '{}',
  
  -- Gedenormaliseerde upvote-score
  upvote_score      int default 0,
  
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table review_votes (
  id                uuid primary key default uuid_generate_v4(),
  review_id         uuid not null references reviews(id) on delete cascade,
  user_id           uuid not null references profielen(id),
  waarde            smallint not null default 1 check (waarde in (-1, 1)),
  unique(review_id, user_id)
);

-- Vakman-reactie op review (max 1 per review)
create table review_reacties (
  id                uuid primary key default uuid_generate_v4(),
  review_id         uuid unique not null references reviews(id) on delete cascade,
  vakman_id         uuid not null references vakman_profielen(id),
  tekst             text not null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- BERICHTEN
-- ══════════════════════════════════════════════════════════════

create table gesprekken (
  id                uuid primary key default uuid_generate_v4(),
  boeking_id        uuid references boekingen(id),
  created_at        timestamptz default now()
);

create table gesprek_deelnemers (
  gesprek_id        uuid not null references gesprekken(id) on delete cascade,
  user_id           uuid not null references profielen(id),
  primary key (gesprek_id, user_id)
);

create table berichten (
  id                uuid primary key default uuid_generate_v4(),
  gesprek_id        uuid not null references gesprekken(id) on delete cascade,
  van_id            uuid not null references profielen(id),
  tekst             text not null,
  foto_url          text,
  gelezen_op        timestamptz,
  created_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- UITNODIGINGEN
-- ══════════════════════════════════════════════════════════════

create table uitnodigingen (
  id                uuid primary key default uuid_generate_v4(),
  uitnodiger_id     uuid not null references profielen(id),
  code              text unique not null,
  community_id      uuid references communities(id),
  
  -- Tracking
  gebruikt_door     uuid references profielen(id),
  gebruikt_op       timestamptz,
  
  created_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- GROEPSKORTINGEN
-- ══════════════════════════════════════════════════════════════

create table groepskortingen (
  id                uuid primary key default uuid_generate_v4(),
  community_id      uuid not null references communities(id),
  categorie_id      uuid references categorieen(id),
  
  titel_nl          text not null,
  titel_en          text not null,
  beschrijving_nl   text,
  beschrijving_en   text,
  
  min_deelnemers    int not null default 5,
  prijs_normaal     int,
  prijs_groep       int,
  actief            boolean default true,
  
  created_at        timestamptz default now()
);

create table groepskorting_deelnemers (
  id                  uuid primary key default uuid_generate_v4(),
  groepskorting_id    uuid not null references groepskortingen(id) on delete cascade,
  user_id             uuid not null references profielen(id),
  created_at          timestamptz default now(),
  unique(groepskorting_id, user_id)
);

-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIES
-- ══════════════════════════════════════════════════════════════

create table notificaties (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profielen(id) on delete cascade,
  type              notificatie_type not null,
  titel_nl          text not null,
  titel_en          text not null,
  inhoud_nl         text,
  inhoud_en         text,
  link              text,                                  -- deep link naar relevante pagina
  gelezen           boolean default false,
  created_at        timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- VIEWS
-- ══════════════════════════════════════════════════════════════

-- Vakman-overzicht met scores
create view vakman_overzicht as
select
  vp.*,
  p.naam as eigenaar_naam,
  p.avatar_url as eigenaar_avatar,
  count(distinct r.id) as review_count,
  coalesce(avg((r.scores->>'kwaliteit')::numeric), 0)::numeric(3,1) as score_kwaliteit,
  count(distinct b.id) filter (where b.status = 'afgerond') as afgeronde_klussen,
  array_agg(distinct c.slug) filter (where c.slug is not null) as categorie_slugs
from vakman_profielen vp
join profielen p on p.id = vp.user_id
left join reviews r on r.vakman_id = vp.id
left join boekingen b on b.vakman_id = vp.id
left join categorieen c on c.id = any(vp.specialismes)
group by vp.id, p.naam, p.avatar_url;

-- Review met upvotes en vakman-reactie
create view review_compleet as
select
  r.*,
  p.naam as auteur_naam,
  p.avatar_url as auteur_avatar,
  cm.naam as community_naam,
  rr.tekst as reactie_tekst,
  rr.created_at as reactie_datum,
  vp.bedrijfsnaam as reactie_bedrijf,
  r.boeking_id is not null as geverifieerd
from reviews r
join profielen p on p.id = r.auteur_id
left join communities cm on cm.id = r.community_id
left join review_reacties rr on rr.review_id = r.id
left join vakman_profielen vp on vp.id = rr.vakman_id;

-- Community met stats
create view community_overzicht as
select
  c.*,
  w.naam as wijk_naam,
  w.stad as wijk_stad,
  count(distinct cl.user_id) as aantal_leden,
  count(distinct r.id) as aantal_reviews,
  count(distinct gs.id) filter (where gs.actief) as lopende_acties
from communities c
join wijken w on w.id = c.wijk_id
left join community_leden cl on cl.community_id = c.id
left join reviews r on r.community_id = c.id
left join groepskortingen gs on gs.community_id = c.id
group by c.id, w.naam, w.stad;

-- ══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ══════════════════════════════════════════════════════════════

-- Update upvote_score op review na vote
create or replace function update_review_score()
returns trigger as $$
begin
  update reviews
  set upvote_score = (
    select coalesce(sum(waarde), 0)
    from review_votes
    where review_id = coalesce(NEW.review_id, OLD.review_id)
  )
  where id = coalesce(NEW.review_id, OLD.review_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger trg_update_review_score
after insert or update or delete on review_votes
for each row execute function update_review_score();

-- Update vakman stats na nieuwe review
create or replace function update_vakman_stats()
returns trigger as $$
begin
  update vakman_profielen
  set
    gem_score = (
      select coalesce(avg((scores->>'kwaliteit')::numeric), 0)::numeric(3,1)
      from reviews where vakman_id = coalesce(NEW.vakman_id, OLD.vakman_id)
    ),
    aantal_reviews = (
      select count(*) from reviews
      where vakman_id = coalesce(NEW.vakman_id, OLD.vakman_id)
    ),
    updated_at = now()
  where id = coalesce(NEW.vakman_id, OLD.vakman_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger trg_update_vakman_stats
after insert or update or delete on reviews
for each row execute function update_vakman_stats();

-- Bereken profiel-sterkte
create or replace function bereken_profiel_sterkte(v_id uuid)
returns int as $$
declare
  sterkte int := 0;
  v vakman_profielen;
begin
  select * into v from vakman_profielen where id = v_id;
  if v is null then return 0; end if;
  
  if v.bedrijfsnaam is not null then sterkte := sterkte + 10; end if;
  if v.kvk_nummer is not null   then sterkte := sterkte + 10; end if;
  if v.logo_url is not null     then sterkte := sterkte + 20; end if;
  if v.bio is not null           then sterkte := sterkte + 10; end if;
  if v.website is not null       then sterkte := sterkte + 5;  end if;
  if v.verzekerd                 then sterkte := sterkte + 15; end if;
  if v.kvk_geverifieerd          then sterkte := sterkte + 10; end if;
  if array_length(v.specialismes, 1) > 0 then sterkte := sterkte + 5; end if;
  
  -- Foto's
  if (select count(*) from werk_fotos where vakman_id = v_id) >= 3 then
    sterkte := sterkte + 15;
  end if;
  
  return least(sterkte, 100);
end;
$$ language plpgsql security definer;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

alter table profielen                    enable row level security;
alter table bewoner_profielen            enable row level security;
alter table vakman_profielen             enable row level security;
alter table beschikbaarheid              enable row level security;
alter table communities                  enable row level security;
alter table community_leden              enable row level security;
alter table community_content_blokken    enable row level security;
alter table boekingen                    enable row level security;
alter table reviews                      enable row level security;
alter table review_votes                 enable row level security;
alter table review_reacties              enable row level security;
alter table berichten                    enable row level security;
alter table gesprekken                   enable row level security;
alter table gesprek_deelnemers           enable row level security;
alter table uitnodigingen                enable row level security;
alter table notificaties                 enable row level security;
alter table werk_fotos                   enable row level security;
alter table groepskorting_deelnemers     enable row level security;

-- Iedereen lezen (publieke data)
create policy "public_read" on profielen         for select using (true);
create policy "public_read" on vakman_profielen  for select using (true);
create policy "public_read" on beschikbaarheid   for select using (true);
create policy "public_read" on communities       for select using (true);
create policy "public_read" on community_leden   for select using (true);
create policy "public_read" on community_content_blokken for select using (true);
create policy "public_read" on reviews           for select using (true);
create policy "public_read" on review_votes      for select using (true);
create policy "public_read" on review_reacties   for select using (true);
create policy "public_read" on werk_fotos        for select using (true);
create policy "public_read" on categorieen       for select using (true);
create policy "public_read" on wijken            for select using (true);
create policy "public_read" on groepskortingen   for select using (true);
create policy "public_read" on groepskorting_deelnemers for select using (true);

-- Eigen data bewerken
create policy "own_update"  on profielen         for update using (auth.uid() = id);
create policy "own_insert"  on profielen         for insert with check (auth.uid() = id);
create policy "own_update"  on bewoner_profielen for all using (user_id = auth.uid());
create policy "own_insert"  on bewoner_profielen for insert with check (user_id = auth.uid());
create policy "own_manage"  on vakman_profielen  for all using (user_id = auth.uid());

-- Beschikbaarheid: vakman beheert eigen
create policy "own_manage" on beschikbaarheid for all
  using (vakman_id in (select id from vakman_profielen where user_id = auth.uid()));

-- Werk-foto's: vakman uploadt eigen
create policy "own_insert" on werk_fotos for insert
  with check (vakman_id in (select id from vakman_profielen where user_id = auth.uid()));

-- Community content: admin of community_beheerder
create policy "admin_manage" on community_content_blokken for all
  using (
    exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
    or exists (
      select 1 from community_leden
      where community_id = community_content_blokken.community_id
        and user_id = auth.uid()
        and rol = 'beheerder'
    )
  );

-- Boekingen: betrokken partijen
create policy "own_read" on boekingen for select
  using (
    klant_id = auth.uid()
    or vakman_id in (select id from vakman_profielen where user_id = auth.uid())
  );
create policy "own_insert" on boekingen for insert with check (klant_id = auth.uid());
create policy "own_update" on boekingen for update
  using (
    klant_id = auth.uid()
    or vakman_id in (select id from vakman_profielen where user_id = auth.uid())
  );

-- Reviews: auteur schrijft, vakman reageert
create policy "own_insert"  on reviews for insert with check (auteur_id = auth.uid());
create policy "own_update"  on reviews for update using (auteur_id = auth.uid());
create policy "own_manage"  on review_votes for all using (user_id = auth.uid());
create policy "own_insert"  on review_reacties for insert
  with check (vakman_id in (select id from vakman_profielen where user_id = auth.uid()));
create policy "own_update"  on review_reacties for update
  using (vakman_id in (select id from vakman_profielen where user_id = auth.uid()));

-- Berichten: deelnemers aan gesprek
create policy "own_read" on berichten for select
  using (gesprek_id in (select gesprek_id from gesprek_deelnemers where user_id = auth.uid()));
create policy "own_send" on berichten for insert
  with check (van_id = auth.uid());
create policy "own_read" on gesprekken for select
  using (id in (select gesprek_id from gesprek_deelnemers where user_id = auth.uid()));
create policy "own_read" on gesprek_deelnemers for select
  using (user_id = auth.uid() or gesprek_id in (select gesprek_id from gesprek_deelnemers where user_id = auth.uid()));

-- Notificaties: eigen
create policy "own_read"   on notificaties for select using (user_id = auth.uid());
create policy "own_update" on notificaties for update using (user_id = auth.uid());

-- Uitnodigingen: eigen
create policy "own_manage" on uitnodigingen for all using (uitnodiger_id = auth.uid());
create policy "public_read" on uitnodigingen for select using (true);

-- Community leden: eigen lidmaatschap
create policy "own_join"   on community_leden for insert with check (user_id = auth.uid());

-- Groepskorting: eigen deelname
create policy "own_join"   on groepskorting_deelnemers for insert with check (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════
-- SEED: Categorieën
-- ══════════════════════════════════════════════════════════════

insert into categorieen (slug, type, naam_nl, naam_en, beschrijving_nl, beschrijving_en, afbeelding_url, icoon, sorteer) values
  ('stucwerk',       'vakman',   'Stucwerk',       'Plastering',       'Strakke wanden, mooie basis',        'Smooth walls, perfect base',          '/images/stucken.png',        'Wall',            1),
  ('schilderen',     'vakman',   'Schilderen',     'Painting',         'Jouw kleur, jouw sfeer',             'Your colour, your vibe',              '/images/verfen.png',         'PaintBrush',      2),
  ('vloeren',        'vakman',   'Vloeren',        'Flooring',         'Van laminaat tot visgraat',           'From laminate to herringbone',        '/images/vloeren.png',        'SquaresFour',     3),
  ('keuken',         'vakman',   'Keuken',         'Kitchen',          'Samen koken, meer genieten',         'Cook together, enjoy more',           '/images/keuken.png',         'CookingPot',      4),
  ('badkamer',       'vakman',   'Badkamer',       'Bathroom',         'Een frisse start, elke dag',         'A fresh start, every day',            '/images/badkamer.png',       'Bathtub',         5),
  ('tuin',           'vakman',   'Tuin',           'Garden',           'Buiten leeft het ook',               'Outdoor living matters too',          '/images/tuin.png',           'Tree',            6),
  ('raamdecoratie',  'vakman',   'Raamdecoratie',  'Window coverings', 'Sfeer én privacy',                   'Style and privacy',                   '/images/raamdecoraties.png', 'FrameCorners',    7),
  ('elektra',        'vakman',   'Elektra',        'Electrical',       'Extra groepen & aansluitingen',      'Extra circuits & connections',         '/images/elektra.png',        'Lightning',       8),
  ('zonnepanelen',   'vergelijk','Zonnepanelen',   'Solar panels',     'Bespaar met je buren samen',         'Save together with neighbours',       '/images/zonnepanelen.png',   'SunDim',          9),
  ('verhuizen',      'vakman',   'Verhuizen',      'Moving',           'Offerte in 1 minuut',                'Quote in 1 minute',                   '/images/verhuizen.png',      'Truck',           10),
  ('beveiliging',    'vakman',   'Beveiliging',    'Security',         'Camera, alarm & slimme deurbel',     'Camera, alarm & smart doorbell',      '/images/beveiliging.png',    'ShieldCheck',     11),
  ('internet',       'vergelijk','Internet',       'Internet',         'Glasvezel vergelijken & installeren','Compare & install fibre optic',       '/images/internet.png',       'WifiHigh',        12);

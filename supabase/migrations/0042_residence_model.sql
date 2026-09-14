-- ══════════════════════════════════════════════════════════════
-- Adres-eerst redesign, stap 2: het ontbrekende "woning"-datamodel.
-- Zuiver additief — niets hieronder wordt nog door de huidige applicatie
-- aangeroepen (dat volgt in latere stappen: BAG-integratie en de
-- herziene onboardingflow). start_community/count_residents_in_cluster
-- blijven in deze stap bewust ongewijzigd, zodat de huidige site niet
-- breekt vóórdat de nieuwe flow er daadwerkelijk is.
-- ══════════════════════════════════════════════════════════════

-- BAG-cache: één rij per geresolved adres, gededupliceerd op het
-- officiële BAG-nummeraanduiding-id.
create table addresses (
  id                        uuid primary key default gen_random_uuid(),
  bag_nummeraanduiding_id   text unique,
  bag_verblijfsobject_id    text,
  bag_pand_ids              text[] not null default '{}',
  street                    text,
  postal_code               text not null,
  house_number              int not null,
  house_number_suffix       text,
  city                      text,
  municipality              text,
  latitude                  numeric,
  longitude                 numeric,
  bag_status                text,
  source                    text not null default 'bag' check (source in ('bag', 'manual')),
  needs_review              boolean not null default false,
  raw                       jsonb,
  resolved_at               timestamptz not null default now()
);

create unique index addresses_manual_dedupe
  on addresses (postal_code, house_number, house_number_suffix)
  where bag_nummeraanduiding_id is null;

-- Fase van een nieuwbouwproject — ontbrak tot nu toe volledig;
-- developments had maar één vlakke postcode/opleverdatum voor het
-- hele project.
create table development_phases (
  id                        uuid primary key default gen_random_uuid(),
  development_id            uuid not null references developments(id) on delete cascade,
  name                      text not null,
  slug                      text,
  postal_codes              text[] not null default '{}',
  bag_pand_ids              text[] not null default '{}',
  expected_completion_date  date,
  home_count                int,
  sort_order                int not null default 0,
  created_at                timestamptz not null default now()
);

-- De fysieke/logische wooncontext (gebouw/complex/blok/straatsegment/
-- fase) — moet al kunnen bestaan zodra 1 adres resolved is, ook
-- zonder dat er ooit een community op ontstaat. type is vrije tekst
-- (net als communities.type), bewust geen enum: de lijst is
-- illustratief, geen vaste set.
create table residential_clusters (
  id                     uuid primary key default gen_random_uuid(),
  type                   text not null default 'building',
  cluster_key            text unique,
  bag_pand_ids           text[] not null default '{}',
  name                   text,
  development_id         uuid references developments(id),
  development_phase_id   uuid references development_phases(id),
  community_threshold    int,
  created_from           text not null default 'auto' check (created_from in ('auto', 'manual')),
  created_at             timestamptz not null default now()
);

-- De ontbrekende "deze specifieke woning"-entiteit. status='provisional'
-- ondersteunt nieuwbouw zonder definitief adres (alleen bouwnummer
-- bekend); zodra het adres later bekend wordt, wordt dezelfde rij
-- bijgewerkt (geen dataverlies voor Mijn Plan/community-lidmaatschap).
create table residences (
  id                     uuid primary key default gen_random_uuid(),
  address_id             uuid references addresses(id),
  residential_cluster_id uuid references residential_clusters(id),
  development_id         uuid references developments(id),
  development_phase_id   uuid references development_phases(id),
  construction_number    text,
  status                 text not null default 'confirmed' check (status in ('provisional', 'confirmed')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (
    (status = 'confirmed' and address_id is not null)
    or (status = 'provisional' and address_id is null and construction_number is not null and development_phase_id is not null)
  )
);

create unique index residences_address_uniek on residences (address_id) where address_id is not null;

-- Historie van welke bewoner bij welke woning hoorde — nodig voor
-- "verhuizen zonder historie te verliezen" en voor "meerdere accounts
-- op één woning" (elke account heeft zijn eigen historie-rij, maar
-- kan naar dezelfde residence_id wijzen).
create table resident_residence_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  residence_id  uuid not null references residences(id),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz
);

create unique index resident_residence_history_actief_uniek
  on resident_residence_history (user_id)
  where ended_at is null;

alter table resident_profiles add column current_residence_id uuid references residences(id);

-- ── RLS ──
-- addresses/development_phases/residential_clusters: pure structurele/
-- geografische feiten, geen persoonsgegevens — zelfde public_read-
-- patroon als developments/communities/categories.
alter table addresses enable row level security;
create policy "public_read" on addresses for select using (true);

alter table development_phases enable row level security;
create policy "public_read" on development_phases for select using (true);

alter table residential_clusters enable row level security;
create policy "public_read" on residential_clusters for select using (true);

-- residences: bewust GEEN public_read — een woning is te herleiden tot
-- een specifiek adres, dus alleen de bewoner(s) die er (ooit) aan
-- gekoppeld zijn/waren mogen die rij zien. Aggregaties (bv. "4 woningen
-- actief") lopen via security-definer RPC's, zelfde principe als
-- resident_profiles vandaag al hanteert.
alter table residences enable row level security;
create policy "own_read" on residences for select
  using (
    exists (select 1 from resident_profiles rp where rp.current_residence_id = residences.id and rp.user_id = auth.uid())
    or exists (select 1 from resident_residence_history rrh where rrh.residence_id = residences.id and rrh.user_id = auth.uid())
  );

alter table resident_residence_history enable row level security;
create policy "own_manage" on resident_residence_history for all using (user_id = auth.uid());
create policy "own_insert" on resident_residence_history for insert with check (user_id = auth.uid());

-- ── Nieuwe functies (nog niet aangeroepen door de huidige app) ──

-- Vindt of maakt een residential_cluster op basis van BAG-gebouw-id's
-- (gesorteerd tot een deterministische cluster_key) — de vervanging
-- voor clustering op exacte postcode-string. Advisory lock voorkomt
-- dubbele clusters bij gelijktijdige adres-bevestigingen.
create function find_or_create_residential_cluster(p_bag_pand_ids text[], p_type text default 'building')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sorted text[];
  v_cluster_key text;
  v_cluster_id uuid;
begin
  select array_agg(distinct x order by x) into v_sorted from unnest(p_bag_pand_ids) x;
  if v_sorted is null or array_length(v_sorted, 1) is null then
    raise exception 'p_bag_pand_ids mag niet leeg zijn';
  end if;
  v_cluster_key := 'pand:' || array_to_string(v_sorted, ',');

  perform pg_advisory_xact_lock(hashtext('residential_cluster:' || v_cluster_key));

  select id into v_cluster_id from residential_clusters where cluster_key = v_cluster_key;
  if v_cluster_id is null then
    insert into residential_clusters (type, cluster_key, bag_pand_ids, created_from)
    values (p_type, v_cluster_key, v_sorted, 'auto')
    returning id into v_cluster_id;
  end if;

  return v_cluster_id;
end;
$$;

-- Telt unieke wóningen (niet accounts) in een cluster zonder community —
-- lost het "3 huisgenoten = 3 buren"-probleem van de huidige
-- count_residents_in_cluster op. Wordt pas echt bruikbaar zodra
-- resident_profiles.current_residence_id gevuld wordt (nieuwe
-- onboardingflow, latere stap).
create function count_residences_in_cluster(p_cluster_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct rp.current_residence_id)::int
  from resident_profiles rp
  join residences r on r.id = rp.current_residence_id
  where r.residential_cluster_id = p_cluster_id
    and rp.community_id is null;
$$;

-- Geeft alleen grove context (postcode/plaats) van een uitnodiger terug
-- voor het vooraf invullen van het adresveld — nooit het volledige
-- adres, om privacy te respecteren.
create function get_invite_context(p_code text)
returns table(postal_code text, city text)
language sql
security definer
set search_path = public
stable
as $$
  select a.postal_code, a.city
  from resident_profiles rp
  join residences r on r.id = rp.current_residence_id
  left join addresses a on a.id = r.address_id
  where rp.invite_code = p_code
  limit 1;
$$;

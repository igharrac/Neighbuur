-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, nieuwe batch: 3 tabellen die buiten de
-- oorspronkelijke Fase 1-4-scope vielen en nog volledig Nederlands
-- waren (ontdekt tijdens de Fase 5-inventarisatie): communities
-- (kolommen), groepskortingen → group_discounts,
-- groepskorting_deelnemers → group_discount_participants.
--
-- Deze drie moeten in één migratie samen, omdat community_overzicht
-- zowel communities- als groepskortingen-kolommen in haar SELECT
-- heeft staan — apart uitrollen zou de view tijdelijk breken.
--
-- communities zelf heette al Engels en viel dus buiten de
-- 11-tabellen-lijst van Fase 2, maar haar kolommen (naam,
-- beschrijving, actief) bleven Nederlands. De status-kolom en haar
-- Nederlandse waarden ('actief'/'slapend') blijven bewust
-- ongewijzigd — dat is een apart, hier niet meegenomen vraagstuk
-- (vergelijkbaar met een enum-waarde-batch, niet een kolomnaam).
--
-- start_community() (plpgsql, body is opaque tekst) schrijft naar
-- communities(naam, actief) — moet hier opnieuw gedefinieerd worden.
-- De functie-parameters (p_wijk_id, p_postcode, p_titel_nl) en de
-- teruggegeven aangemaakt-kolom blijven bewust ongewijzigd, zelfde
-- aanpak als eerdere functiebatches.
--
-- community_overzicht en review_compleet referenceren beide
-- communities.naam/.beschrijving/.actief rechtstreeks in hun
-- SELECT-lijst en moeten daarom opnieuw DROP+CREATE'd worden;
-- security_invoker moet na elke DROP+CREATE opnieuw expliciet gezet
-- worden (zelfde Advisor-lek als bij de vorige view-herbouwingen).
-- ══════════════════════════════════════════════════════════════

-- 1. communities: alleen kolommen, tabelnaam blijft
alter table communities rename column naam to name;
alter table communities rename column beschrijving to description;
alter table communities rename column actief to active;

-- 2. groepskortingen → group_discounts
alter table groepskortingen rename to group_discounts;
alter table group_discounts rename column categorie_id to category_id;
alter table group_discounts rename column titel_nl to title_nl;
alter table group_discounts rename column titel_en to title_en;
alter table group_discounts rename column beschrijving_nl to description_nl;
alter table group_discounts rename column beschrijving_en to description_en;
alter table group_discounts rename column min_deelnemers to min_participants;
alter table group_discounts rename column prijs_normaal to price_normal;
alter table group_discounts rename column prijs_groep to price_group;
alter table group_discounts rename column actief to active;

-- 3. groepskorting_deelnemers → group_discount_participants
alter table groepskorting_deelnemers rename to group_discount_participants;
alter table group_discount_participants rename column groepskorting_id to group_discount_id;

-- 4. start_community() opnieuw met communities(name, active)
create or replace function start_community(p_wijk_id uuid, p_postcode text, p_titel_nl text)
returns table(id uuid, slug text, aangemaakt boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_ok boolean;
  v_community_id uuid;
  v_slug text;
  v_base_slug text;
  v_poging int := 0;
  v_aangemaakt boolean := false;
begin
  select exists(
    select 1 from resident_profiles
    where user_id = auth.uid() and district_id = p_wijk_id and postal_code = p_postcode and community_id is null
  ) into v_caller_ok;

  if not v_caller_ok then
    raise exception 'Je hoort niet bij dit cluster of hebt al een community.';
  end if;

  select c.id into v_community_id from communities c
  where c.district_id = p_wijk_id and c.postcode_cluster = p_postcode
  limit 1;

  if v_community_id is null then
    v_base_slug := lower(regexp_replace(coalesce(nullif(trim(p_titel_nl), ''), 'buurtgroep-' || p_postcode), '[^a-z0-9]+', '-', 'gi'));
    v_slug := v_base_slug;
    while exists(select 1 from communities c2 where c2.slug = v_slug) and v_poging < 5 loop
      v_poging := v_poging + 1;
      v_slug := v_base_slug || '-' || v_poging;
    end loop;

    insert into communities (district_id, name, slug, type, postcode_cluster, active, status)
    values (p_wijk_id, coalesce(nullif(trim(p_titel_nl), ''), 'Buurtgroep ' || p_postcode), v_slug, 'blok', p_postcode, true, 'actief')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  update resident_profiles
  set community_id = v_community_id
  where district_id = p_wijk_id and postal_code = p_postcode and community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'beheerder' else 'lid' end
  from resident_profiles bp
  where bp.district_id = p_wijk_id and bp.postal_code = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

-- 5. community_overzicht herbouwen
drop view if exists community_overzicht;

create view community_overzicht as
select
  c.id,
  c.district_id,
  c.name,
  c.slug,
  c.type,
  c.description,
  c.banner_url,
  c.active,
  c.created_at,
  w.name as district_name,
  w.city as district_city,
  count(distinct cm.user_id) as member_count,
  count(distinct r.id) as review_count,
  count(distinct gs.id) filter (where gs.active) as active_deals
from communities c
join districts w on w.id = c.district_id
left join community_members cm on cm.community_id = c.id
left join reviews r on r.community_id = c.id
left join group_discounts gs on gs.community_id = c.id
group by c.id, w.name, w.city;

alter view community_overzicht set (security_invoker = true);

-- 6. review_compleet herbouwen (cm.naam → cm.name)
drop view if exists review_compleet;

create view review_compleet as
select
  r.id,
  r.author_id,
  r.professional_id,
  r.booking_id,
  r.community_id,
  r.text,
  r.scores,
  r.foto_urls,
  r.upvote_score,
  r.created_at,
  r.updated_at,
  p.name as author_name,
  p.avatar_url as author_avatar,
  cm.name as community_name,
  rr.text as reply_text,
  rr.created_at as reply_date,
  vp.company_name as reply_company,
  r.booking_id is not null as verified
from reviews r
join profiles p on p.id = r.author_id
left join communities cm on cm.id = r.community_id
left join review_replies rr on rr.review_id = r.id
left join professional_profiles vp on vp.id = rr.professional_id;

alter view review_compleet set (security_invoker = true);

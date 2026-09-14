-- ══════════════════════════════════════════════════════════════
-- Adres-eerst redesign, stap 1: districts → developments, en
-- communities.district_id (nu development_id) wordt nullable. Een
-- "development" (nieuwbouwproject) is voortaan optionele context,
-- geen verplichte ouder-entiteit — de kern van de gevraagde
-- productcorrectie. Functionaliteit/gedrag blijft in deze stap
-- ongewijzigd; dit is puur de hernoeming + het losmaken van de
-- NOT NULL-constraint, zelfde aanpak als de eerdere naming-migratie.
-- ══════════════════════════════════════════════════════════════

alter table districts rename to developments;

alter table communities rename column district_id to development_id;
alter table communities alter column development_id drop not null;

alter table resident_profiles rename column district_id to development_id;

-- community_overview herbouwen: was een inner join op districts (zou
-- straks communities zonder development onterecht uit deze view
-- laten vallen zodra die bestaan) — wordt een left join.
drop view if exists community_overview;

create view community_overview as
select
  c.id,
  c.development_id,
  c.name,
  c.slug,
  c.type,
  c.description,
  c.banner_url,
  c.active,
  c.created_at,
  d.name as development_name,
  d.city as development_city,
  count(distinct cm.user_id) as member_count,
  count(distinct r.id) as review_count,
  count(distinct gs.id) filter (where gs.active) as active_deals
from communities c
left join developments d on d.id = c.development_id
left join community_members cm on cm.community_id = c.id
left join reviews r on r.community_id = c.id
left join group_discounts gs on gs.community_id = c.id
group by c.id, d.name, d.city;

alter view community_overview set (security_invoker = true);

-- count_residents_in_cluster / start_community verwijzen naar de
-- hernoemde kolommen/tabel — bodies bijgewerkt, business-logica
-- ongewijzigd (die herziening volgt in een latere migratie). Params
-- ook hernoemd (p_wijk_id → p_development_id) volgens de Engelse
-- technische-naming-afspraak; call sites in de applicatiecode zijn
-- in dezelfde release bijgewerkt.
drop function if exists count_residents_in_cluster(uuid, text, text);

create function count_residents_in_cluster(p_development_id uuid, p_postcode text, p_gebouw_label text default null)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from resident_profiles
  where development_id = p_development_id
    and community_id is null
    and postal_code = p_postcode
    and (p_gebouw_label is null or building_label is not distinct from p_gebouw_label);
$$;

drop function if exists start_community(uuid, text, text);

create function start_community(p_development_id uuid, p_postcode text, p_titel_nl text)
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
    where user_id = auth.uid() and development_id = p_development_id and postal_code = p_postcode and community_id is null
  ) into v_caller_ok;

  if not v_caller_ok then
    raise exception 'Je hoort niet bij dit cluster of hebt al een community.';
  end if;

  select c.id into v_community_id from communities c
  where c.development_id = p_development_id and c.postcode_cluster = p_postcode
  limit 1;

  if v_community_id is null then
    v_base_slug := lower(regexp_replace(coalesce(nullif(trim(p_titel_nl), ''), 'buurtgroep-' || p_postcode), '[^a-z0-9]+', '-', 'gi'));
    v_slug := v_base_slug;
    while exists(select 1 from communities c2 where c2.slug = v_slug) and v_poging < 5 loop
      v_poging := v_poging + 1;
      v_slug := v_base_slug || '-' || v_poging;
    end loop;

    insert into communities (development_id, name, slug, type, postcode_cluster, active, status)
    values (p_development_id, coalesce(nullif(trim(p_titel_nl), ''), 'Buurtgroep ' || p_postcode), v_slug, 'blok', p_postcode, true, 'actief')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  update resident_profiles
  set community_id = v_community_id
  where development_id = p_development_id and postal_code = p_postcode and community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'beheerder' else 'lid' end
  from resident_profiles bp
  where bp.development_id = p_development_id and bp.postal_code = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

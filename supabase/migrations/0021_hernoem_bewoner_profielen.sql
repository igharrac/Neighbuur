-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): bewoner_profielen → resident_profiles.
-- opleverdatum/adres zijn ongebruikte kolommen uit het oorspronkelijke
-- 0001-schema (geen code-referenties) — voor volledige consistentie toch
-- meehernoemd, geen functioneel risico.
-- ══════════════════════════════════════════════════════════════

alter table bewoner_profielen rename to resident_profiles;

alter table resident_profiles rename column opleverdatum to completion_date;
alter table resident_profiles rename column adres to address;
alter table resident_profiles rename column uitnodigingscode to invite_code;
alter table resident_profiles rename column postcode to postal_code;
alter table resident_profiles rename column huisnummer to house_number;
alter table resident_profiles rename column huisnummer_toevoeging to house_number_suffix;
alter table resident_profiles rename column gebouw_label to building_label;
alter table resident_profiles rename column toon_community_suggesties to show_community_suggestions;

-- bewoners_cluster_telling (sql) en start_community (plpgsql) lezen/
-- schrijven bewoner_profielen(postcode, gebouw_label) — body is opaque
-- tekst, wordt niet automatisch bijgewerkt. Parameternamen (p_wijk_id,
-- p_postcode, p_gebouw_label, p_titel_nl) blijven bewust ongewijzigd,
-- zelfde aanpak als eerdere batches.
create or replace function bewoners_cluster_telling(p_wijk_id uuid, p_postcode text, p_gebouw_label text default null)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from resident_profiles
  where district_id = p_wijk_id
    and community_id is null
    and postal_code = p_postcode
    and (p_gebouw_label is null or building_label is not distinct from p_gebouw_label);
$$;

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

    insert into communities (district_id, naam, slug, type, postcode_cluster, actief, status)
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

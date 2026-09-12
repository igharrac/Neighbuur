-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): wijken → districts.
-- Inclusief de wijk_id-FK-kolommen op communities/bewoner_profielen
-- (die tabellen zelf blijven ongewijzigd, alleen deze kolom).
-- community_overzicht (view) verwijst naar wijken/wijk_id en leest dit
-- automatisch mee via OID-tracking — de view blijft werken, maar de
-- eigen output-aliassen (wijk_naam/wijk_stad) blijven bewust Nederlands
-- tot Fase 4 (views/functies worden dan als geheel herzien).
-- ══════════════════════════════════════════════════════════════

alter table wijken rename to districts;

alter table districts rename column naam to name;
alter table districts rename column stad to city;
alter table districts rename column postcode to postal_code;
alter table districts rename column opleverdatum to completion_date;
alter table districts rename column aantal_woningen to home_count;
alter table districts rename column actief to active;

alter table communities rename column wijk_id to district_id;
alter table bewoner_profielen rename column wijk_id to district_id;

-- bewoners_cluster_telling is sql (geen plpgsql, maar de body is net zo
-- goed opaque tekst en wordt dus niet automatisch bijgewerkt). Parameternaam
-- p_wijk_id blijft bewust ongewijzigd (cosmetisch), alleen de kolomverwijzing
-- in de body wordt gefixt.
create or replace function bewoners_cluster_telling(p_wijk_id uuid, p_postcode text, p_gebouw_label text default null)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from bewoner_profielen
  where district_id = p_wijk_id
    and community_id is null
    and postcode = p_postcode
    and (p_gebouw_label is null or gebouw_label is not distinct from p_gebouw_label);
$$;

-- start_community is plpgsql en schrijft/leest wijk_id op zowel
-- bewoner_profielen als communities — handmatig fixen. Parameternaam
-- p_wijk_id blijft bewust ongewijzigd (cosmetisch, zelfde reden als bij
-- is_conversation_participant in migratie 0015).
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
    select 1 from bewoner_profielen
    where user_id = auth.uid() and district_id = p_wijk_id and postcode = p_postcode and community_id is null
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

  update bewoner_profielen
  set community_id = v_community_id
  where district_id = p_wijk_id and postcode = p_postcode and community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'beheerder' else 'lid' end
  from bewoner_profielen bp
  where bp.district_id = p_wijk_id and bp.postcode = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

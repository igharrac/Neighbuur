-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): beschikbaarheid, uitnodigingen,
-- community_leden
-- ══════════════════════════════════════════════════════════════

alter table beschikbaarheid rename to availability;
alter table availability rename column vakman_id to professional_id;
alter table availability rename column datum to date;

alter table uitnodigingen rename to invitations;
alter table invitations rename column uitnodiger_id to inviter_id;
alter table invitations rename column gebruikt_door to used_by;
alter table invitations rename column gebruikt_op to used_at;

alter table community_leden rename to community_members;
alter table community_members rename column rol to role;

-- start_community is plpgsql en schrijft naar community_leden(rol) —
-- wordt niet automatisch bijgewerkt, handmatig fixen.
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
    where user_id = auth.uid() and wijk_id = p_wijk_id and postcode = p_postcode and community_id is null
  ) into v_caller_ok;

  if not v_caller_ok then
    raise exception 'Je hoort niet bij dit cluster of hebt al een community.';
  end if;

  select c.id into v_community_id from communities c
  where c.wijk_id = p_wijk_id and c.postcode_cluster = p_postcode
  limit 1;

  if v_community_id is null then
    v_base_slug := lower(regexp_replace(coalesce(nullif(trim(p_titel_nl), ''), 'buurtgroep-' || p_postcode), '[^a-z0-9]+', '-', 'gi'));
    v_slug := v_base_slug;
    while exists(select 1 from communities c2 where c2.slug = v_slug) and v_poging < 5 loop
      v_poging := v_poging + 1;
      v_slug := v_base_slug || '-' || v_poging;
    end loop;

    insert into communities (wijk_id, naam, slug, type, postcode_cluster, actief, status)
    values (p_wijk_id, coalesce(nullif(trim(p_titel_nl), ''), 'Buurtgroep ' || p_postcode), v_slug, 'blok', p_postcode, true, 'actief')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  update bewoner_profielen
  set community_id = v_community_id
  where wijk_id = p_wijk_id and postcode = p_postcode and community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'beheerder' else 'lid' end
  from bewoner_profielen bp
  where bp.wijk_id = p_wijk_id and bp.postcode = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

-- ══════════════════════════════════════════════════════════════
-- Bugfix: start_community faalde met "column reference 'id' is
-- ambiguous" zodra een nieuwe community daadwerkelijk aangemaakt
-- moest worden — de WHERE-clausule "where id = p_cluster_id" was
-- niet gekwalificeerd en botste met de impliciete PL/pgSQL-variabele
-- "id" uit RETURNS TABLE(id uuid, ...). Gevonden tijdens end-to-end
-- testen van de nieuwe adres-eerst flow (3e bewoner in hetzelfde
-- gebouw, drempel bereikt, community starten).
-- ══════════════════════════════════════════════════════════════

create or replace function start_community(p_cluster_id uuid, p_titel_nl text)
returns table(id uuid, slug text, aangemaakt boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_ok boolean;
  v_community_id uuid;
  v_cluster_development_id uuid;
  v_cluster_name text;
  v_slug text;
  v_base_slug text;
  v_poging int := 0;
  v_aangemaakt boolean := false;
begin
  select exists(
    select 1 from resident_profiles rp
    join residences r on r.id = rp.current_residence_id
    where rp.user_id = auth.uid() and r.residential_cluster_id = p_cluster_id and rp.community_id is null
  ) into v_caller_ok;

  if not v_caller_ok then
    raise exception 'Je hoort niet bij dit cluster of hebt al een community.';
  end if;

  perform pg_advisory_xact_lock(hashtext('start_community:' || p_cluster_id::text));

  select c.id into v_community_id from communities c where c.residential_cluster_id = p_cluster_id limit 1;

  if v_community_id is null then
    select rc.development_id, rc.name into v_cluster_development_id, v_cluster_name
    from residential_clusters rc where rc.id = p_cluster_id;

    v_base_slug := lower(regexp_replace(coalesce(nullif(trim(p_titel_nl), ''), v_cluster_name, 'buurtgroep-' || substr(p_cluster_id::text, 1, 8)), '[^a-z0-9]+', '-', 'gi'));
    v_slug := v_base_slug;
    while exists(select 1 from communities c2 where c2.slug = v_slug) and v_poging < 5 loop
      v_poging := v_poging + 1;
      v_slug := v_base_slug || '-' || v_poging;
    end loop;

    insert into communities (residential_cluster_id, development_id, name, slug, type, active, status)
    values (p_cluster_id, v_cluster_development_id, coalesce(nullif(trim(p_titel_nl), ''), v_cluster_name, 'Buurtgroep'), v_slug, 'blok', true, 'active')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  update resident_profiles rp
  set community_id = v_community_id
  from residences r
  where rp.current_residence_id = r.id and r.residential_cluster_id = p_cluster_id and rp.community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, rp.user_id, 'member'
  from resident_profiles rp
  join residences r on r.id = rp.current_residence_id
  where r.residential_cluster_id = p_cluster_id and rp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

-- ══════════════════════════════════════════════════════════════
-- Adres-eerst redesign, stap 3: laatste Nederlandse technische
-- waarden opruimen die dit werk toch al aanraakt (community_members.
-- role, communities.status) — puur intern gebruikt, nooit
-- rechtstreeks als UI-tekst getoond, dus veilig te hernoemen naar
-- Engels volgens de bestaande technische-naming-afspraak.
--
-- communities.type ('blok'/'flat'/'verdieping'/'portiek') wordt hier
-- BEWUST NIET aangepakt: CommunityHeader/CommunityCard renderen die
-- waarde rechtstreeks als UI-tekst zonder vertaling — hernoemen zou
-- Engelse woorden aan bewoners tonen en de "UI blijft Nederlands"-
-- afspraak schenden.
-- ══════════════════════════════════════════════════════════════

-- community_members.role: 'lid'/'beheerder' → 'member'/'admin'
update community_members set role = 'member' where role = 'lid';
update community_members set role = 'admin' where role = 'beheerder';
alter table community_members alter column role set default 'member';

-- communities.status: 'actief'/'slapend' → 'active'/'dormant'
alter table communities drop constraint if exists communities_status_check;
update communities set status = 'active' where status = 'actief';
update communities set status = 'dormant' where status = 'slapend';
alter table communities alter column status set default 'active';
alter table communities add constraint communities_status_check check (status in ('active', 'dormant'));

-- start_community verwijst naar de oude waarden — body bijgewerkt,
-- geen signatuurwijziging dus geen drop nodig.
create or replace function start_community(p_development_id uuid, p_postcode text, p_titel_nl text)
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
    values (p_development_id, coalesce(nullif(trim(p_titel_nl), ''), 'Buurtgroep ' || p_postcode), v_slug, 'blok', p_postcode, true, 'active')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  update resident_profiles
  set community_id = v_community_id
  where development_id = p_development_id and postal_code = p_postcode and community_id is null;

  insert into community_members (community_id, user_id, role)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'admin' else 'member' end
  from resident_profiles bp
  where bp.development_id = p_development_id and bp.postal_code = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

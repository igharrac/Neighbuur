-- ══════════════════════════════════════════════════════════════
-- Fase 1, stap 3: community_overview krijgt ook een publiek-veilige
-- 'city' voor communities zonder development (residential_cluster_id
-- wél, development_id niet — het geval waar development_city leeg
-- blijft). Zelfde reden/patroon als count_residences_in_cluster_public
-- in 0050: residences heeft geen public_read, dus de stad moet via een
-- kleine security-definer-functie komen, niet via een directe join.
-- ══════════════════════════════════════════════════════════════

create function residential_cluster_city_public(p_cluster_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select nullif(initcap(btrim(a.city)), '')
  from residences r
  join addresses a on a.id = r.address_id
  where r.residential_cluster_id = p_cluster_id
  limit 1;
$$;

drop view if exists community_overview;

create view community_overview as
select
  c.id,
  c.development_id,
  c.residential_cluster_id,
  c.name,
  c.slug,
  c.type,
  c.description,
  c.banner_url,
  c.active,
  c.created_at,
  d.name as development_name,
  d.city as development_city,
  coalesce(d.city, residential_cluster_city_public(c.residential_cluster_id)) as city,
  count(distinct cm.user_id) as member_count,
  count(distinct r.id) as review_count,
  count(distinct gs.id) filter (where gs.active) as active_deals,
  coalesce(count_residences_in_cluster_public(c.residential_cluster_id), 0) as residence_count
from communities c
left join developments d on d.id = c.development_id
left join community_members cm on cm.community_id = c.id
left join reviews r on r.community_id = c.id
left join group_discounts gs on gs.community_id = c.id
group by c.id, d.name, d.city;

alter view community_overview set (security_invoker = true);

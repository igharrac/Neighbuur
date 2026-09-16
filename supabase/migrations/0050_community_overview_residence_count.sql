-- ══════════════════════════════════════════════════════════════
-- Fase 1 (lokale groei zichtbaar), stap 1: community_overview krijgt
-- een publiek-veilig aantal UNIEKE woningen (niet accounts) + de
-- residential_cluster_id-koppeling, zodat /wijk communities zonder
-- development ook met een betrouwbaar getal kan tonen — zonder de
-- pre-threshold-gefilterde count_residences_in_cluster te hergebruiken
-- (die telt bewust alleen community-loze bewoners, verkeerd hier).
--
-- residences heeft geen public_read (terecht — een woning is herleidbaar
-- tot een adres), dus een gewone left join in een security_invoker-view
-- zou voor iedereen behalve de bewoner zelf op 0 uitkomen. Vandaar een
-- kleine, losse security-definer-functie die alleen een aantal teruggeeft
-- (geen rijen, geen PII) — zelfde principe als de bestaande
-- count_residences_in_cluster/get_invite_context.
-- ══════════════════════════════════════════════════════════════

create function count_residences_in_cluster_public(p_cluster_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct id)::int from residences where residential_cluster_id = p_cluster_id;
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

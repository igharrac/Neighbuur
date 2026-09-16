-- ══════════════════════════════════════════════════════════════
-- Fase 1 (lokale groei zichtbaar), stap 2: Admin > Gebieden.
--
-- residences en resident_profiles hebben alleen own_read/own_update —
-- terecht voor gewone gebruikers, maar daardoor kan admin er via de
-- normale (RLS-afhankelijke) server-client niets van aggregeren. Zelfde
-- patroon als platform_stats_daily's admin_read (migratie 0039): een
-- losse, additieve select-policy naast de bestaande, niets bestaands
-- gewijzigd.
-- ══════════════════════════════════════════════════════════════

create policy "admin_read" on residences for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_read" on resident_profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Eén rij per stad — top-niveau van Admin > Gebieden. city komt van het
-- adres (bevestigde woning) of anders van het development (bouwnummer-
-- pad zonder definitief adres). security_invoker zodat de admin_read-
-- policies hierboven daadwerkelijk gehandhaafd worden — zelfde reden als
-- professional_overview/community_overview/review_complete.
create view admin_city_overview
with (security_invoker = true) as
with geo as (
  select
    r.id as residence_id,
    r.residential_cluster_id,
    r.created_at,
    nullif(initcap(btrim(coalesce(a.city, d.city))), '') as city
  from residences r
  left join addresses a on a.id = r.address_id
  left join developments d on d.id = r.development_id
)
select
  g.city,
  count(distinct g.residence_id) as residence_count,
  count(distinct rp.user_id) as resident_account_count,
  count(distinct g.residential_cluster_id) as cluster_count,
  count(distinct c.id) as community_count,
  count(distinct g.residence_id) filter (where g.created_at >= now() - interval '7 days') as new_residences_7d,
  count(distinct g.residence_id) filter (where g.created_at >= now() - interval '30 days') as new_residences_30d,
  count(distinct g.residence_id) filter (where g.created_at >= now() - interval '90 days') as new_residences_90d
from geo g
left join resident_profiles rp on rp.current_residence_id = g.residence_id
left join communities c on c.residential_cluster_id = g.residential_cluster_id
where g.city is not null
group by g.city;

-- Eén rij per residential cluster (gebouw/blok/complex) — drill-down ná
-- het kiezen van een stad. Woningen zonder cluster (los adres, geen
-- BAG-pand-relatie) vallen hier bewust buiten; die tellen wel mee in
-- admin_city_overview.residence_count, en worden in de admin-UI apart
-- als "overige woningen" opgeteld.
create view admin_cluster_overview
with (security_invoker = true) as
with geo as (
  select
    r.id as residence_id,
    r.residential_cluster_id,
    r.created_at,
    nullif(initcap(btrim(coalesce(a.city, d.city))), '') as city
  from residences r
  left join addresses a on a.id = r.address_id
  left join developments d on d.id = r.development_id
  where r.residential_cluster_id is not null
)
select
  rc.id as cluster_id,
  rc.name as cluster_name,
  rc.type as cluster_type,
  g.city,
  dev.name as development_name,
  count(distinct g.residence_id) as residence_count,
  count(distinct rp.user_id) as resident_account_count,
  count(distinct c.id) as community_count,
  count(distinct g.residence_id) filter (where g.created_at >= now() - interval '30 days') as new_residences_30d
from residential_clusters rc
join geo g on g.residential_cluster_id = rc.id
left join developments dev on dev.id = rc.development_id
left join resident_profiles rp on rp.current_residence_id = g.residence_id
left join communities c on c.residential_cluster_id = rc.id
group by rc.id, rc.name, rc.type, g.city, dev.name;

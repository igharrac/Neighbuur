-- ══════════════════════════════════════════════════════════════
-- Local trust, stap 1: "bewezen lokale ervaring" — hoeveel afgeronde
-- Neighbuur-opdrachten heeft een provider daadwerkelijk in een stad
-- uitgevoerd (i.t.t. "wil hier werken", wat admin_provider_coverage al
-- toont). Gebaseerd op bookings.residence_id (migratie 0057) → alleen
-- boekingen ván nu af aan tellen mee, dat is een bewuste eigenschap,
-- geen bug: er is geen betrouwbare historische locatie voor oudere
-- boekingen.
--
-- security definer nodig: bookings/residences hebben geen public_read
-- (in tegenstelling tot professional_profiles/categories), dus een
-- security_invoker-view zou voor de admin (die via zijn eigen sessie
-- leest, niet via de service-role) leeg terugkomen. Zelfde patroon als
-- residential_cluster_city_public/count_residences_in_cluster_public in
-- migratie 0050/0052: alleen veilige aggregaten (provider_id, stad,
-- aantal) worden geëxposed, nooit een residence- of klantidentiteit.
-- ══════════════════════════════════════════════════════════════

create function provider_local_experience_by_city_public()
returns table(professional_id uuid, city text, completed_jobs bigint)
language sql
security definer
set search_path = public
stable
as $$
  select b.professional_id, a.city, count(distinct b.id) as completed_jobs
  from bookings b
  join residences r on r.id = b.residence_id
  join addresses a on a.id = r.address_id
  where b.status = 'completed' and a.city is not null
  group by b.professional_id, a.city;
$$;

-- ── admin_provider_coverage + de twee aggregaties erbovenop herbouwen
-- met review- en lokale-ervaringscontext. Dependents eerst droppen
-- (zelfde reden als altijd: CREATE OR REPLACE VIEW staat geen
-- kolomwijzigingen toe, en er hangen twee views van deze view af).
drop view if exists admin_provider_coverage_by_city_category;
drop view if exists admin_provider_coverage_by_city;
drop view if exists admin_provider_coverage;

create view admin_provider_coverage as
select
  pp.id as provider_id,
  pp.company_name,
  pp.verified,
  pp.profile_strength,
  pp.logo_url is not null as has_logo,
  pp.bio is not null as has_description,
  pp.review_count,
  pp.avg_score,
  s.category_id,
  c.name_nl as category_name,
  c.slug as category_slug,
  pcc.city,
  distance_km(pp.service_area_lat, pp.service_area_lng, pcc.lat, pcc.lng) as distance_km,
  coalesce(ple.completed_jobs, 0) as local_completed_jobs
from professional_profiles pp
join profiles prof on prof.id = pp.user_id
cross join lateral unnest(pp.specialties) as s(category_id)
join categories c on c.id = s.category_id::uuid and c.type = 'professional'
join provider_city_centroids pcc
  on distance_km(pp.service_area_lat, pp.service_area_lng, pcc.lat, pcc.lng) <= pp.service_area_km
left join provider_local_experience_by_city_public() ple
  on ple.professional_id = pp.id and ple.city = pcc.city
where prof.deactivated_at is null
  and prof.deleted_at is null
  and pp.service_area_lat is not null
  and pp.service_area_lng is not null;

create view admin_provider_coverage_by_city as
select
  city,
  count(distinct provider_id) as provider_count,
  count(distinct category_id) as category_count,
  count(distinct provider_id) filter (where local_completed_jobs > 0) as providers_with_local_experience,
  count(distinct provider_id) filter (where review_count > 0) as providers_with_reviews
from admin_provider_coverage
group by city;

create view admin_provider_coverage_by_city_category as
select
  city,
  category_id,
  category_name,
  category_slug,
  count(distinct provider_id) as provider_count
from admin_provider_coverage
group by city, category_id, category_name, category_slug;

alter view admin_provider_coverage set (security_invoker = true);
alter view admin_provider_coverage_by_city set (security_invoker = true);
alter view admin_provider_coverage_by_city_category set (security_invoker = true);

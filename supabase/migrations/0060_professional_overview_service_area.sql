-- ══════════════════════════════════════════════════════════════
-- Zoekpagina stap 2: professional_overview mist nog de werkgebied-
-- coördinaten (service_area_lat/lng/city) die in migratie 0055 aan
-- professional_profiles zijn toegevoegd — die migratie dateert van ná
-- de laatste herbouw van deze view (0049). Nodig om op /zoeken
-- daadwerkelijke afstand tot een opgegeven locatie te kunnen berekenen
-- i.p.v. alleen te filteren op de straal die de provider zelf opgeeft.
-- Zelfde drop+create+security_invoker-patroon als altijd.
-- ══════════════════════════════════════════════════════════════

drop view if exists professional_overview;

create view professional_overview as
select
  vp.id,
  vp.user_id,
  vp.company_name,
  vp.slug,
  vp.kvk_number,
  vp.kvk_verified,
  vp.bio,
  vp.website,
  vp.logo_url,
  vp.specialties,
  vp.contact_preference,
  vp.service_area_postcode,
  vp.service_area_km,
  vp.service_area_lat,
  vp.service_area_lng,
  vp.service_area_city,
  vp.insured,
  vp.insurance_url,
  vp.registration_source,
  vp.verified,
  vp.profile_strength,
  vp.avg_score,
  vp.review_count,
  vp.is_premium,
  vp.premium_until,
  vp.requests_this_month,
  vp.requests_limit,
  p.name as owner_name,
  p.avatar_url as owner_avatar,
  p.deactivated_at,
  p.deleted_at,
  count_professional_completed_jobs(vp.id) as completed_jobs,
  array_agg(distinct c.slug) filter (where c.slug is not null) as category_slugs
from professional_profiles vp
join profiles p on p.id = vp.user_id
left join categories c on c.id = any(vp.specialties)
group by vp.id, p.name, p.avatar_url, p.deactivated_at, p.deleted_at;

alter view professional_overview set (security_invoker = true);

-- ══════════════════════════════════════════════════════════════
-- Account-levenscyclus, stap 4: professional_overview krijgt
-- deactivated_at/deleted_at erbij, zodat /zoeken gedeactiveerde of
-- verwijderde vakmensen kan uitfilteren. Zelfde drop+create+
-- security_invoker-patroon als de eerdere view-herbouw-migraties
-- (0031/0032/0033) — security_invoker moet na elke CREATE opnieuw
-- expliciet gezet worden (Advisor-lek uit migratie 0011).
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

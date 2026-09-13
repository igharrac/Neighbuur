-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 4 (deel b, derde en laatste view):
-- vakman_overzicht. Zelfde aanpak als de vorige twee views: DROP +
-- CREATE met expliciete kolommen i.p.v. de bevroren vp.*-wildcard.
--
-- Ontdekte naamconflict tijdens deze batch: de view had van oudsher haar
-- EIGEN losse count(distinct r.id) as review_count / avg(...) as
-- score_kwaliteit-berekeningen, die exact hetzelfde uitrekenen als wat
-- de update_vakman_stats()-trigger al bijhoudt in
-- professional_profiles.review_count/avg_score sinds migratie 0001.
-- Met een expliciete kolomlijst zouden deze onder dezelfde naam
-- (review_count) botsen. Opgelost door de dubbele live-berekening te
-- laten vervallen en overal de al-bijgehouden, getriggerde kolom te
-- gebruiken — één bron van waarheid i.p.v. twee identieke berekeningen
-- onder verschillende namen.
--
-- security_invoker moet na de DROP+CREATE opnieuw expliciet gezet
-- worden (zelfde Advisor-lek als bij de vorige twee views).
-- ══════════════════════════════════════════════════════════════

drop view if exists vakman_overzicht;

create view vakman_overzicht as
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
  count_professional_completed_jobs(vp.id) as completed_jobs,
  array_agg(distinct c.slug) filter (where c.slug is not null) as category_slugs
from professional_profiles vp
join profiles p on p.id = vp.user_id
left join categories c on c.id = any(vp.specialties)
group by vp.id, p.name, p.avatar_url;

alter view vakman_overzicht set (security_invoker = true);

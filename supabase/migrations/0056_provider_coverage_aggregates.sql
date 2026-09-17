-- ══════════════════════════════════════════════════════════════
-- Provider coverage, stap 2: voorgeaggregeerde views bovenop
-- admin_provider_coverage. Zonder dit zou admin honderden/duizenden
-- ruwe (provider × stad × categorie)-rijen moeten downloaden en zelf
-- client-side groeperen — bij 368 providers al ruim boven de
-- standaard PostgREST-rijlimiet (1000), en precies wat de opdracht
-- expliciet wil vermijden. Groepering gebeurt nu in SQL; admin
-- downloadt alleen de kleine, al-samengevatte resultaten (tientallen
-- rijen, nooit duizenden).
-- ══════════════════════════════════════════════════════════════

create view admin_provider_coverage_by_city as
select
  city,
  count(distinct provider_id) as provider_count,
  count(distinct category_id) as category_count
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

alter view admin_provider_coverage_by_city set (security_invoker = true);
alter view admin_provider_coverage_by_city_category set (security_invoker = true);

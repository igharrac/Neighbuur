-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 4 (deel b, tweede view): community_overzicht.
-- Zelfde aanpak als review_compleet (migratie 0031): DROP + CREATE met
-- expliciete kolommen i.p.v. de bevroren c.*-wildcard.
--
-- communities' eigen kolommen (naam, beschrijving, actief) zijn nooit
-- hernoemd in Fase 2 — die tabel heette zelf al Engels ("communities")
-- en viel dus buiten de 11-tabellen-lijst, maar haar kolommen bleven
-- Nederlands. In plaats van daarvoor een aparte Fase-2-achtige
-- tabelbatch te openen, krijgen ze hier gewoon een schone Engelse
-- alias in de view — de tabel zelf blijft ongewijzigd.
--
-- security_invoker moet na de DROP+CREATE opnieuw expliciet gezet
-- worden (zelfde Advisor-lek als bij review_compleet in 0031/0011).
-- ══════════════════════════════════════════════════════════════

drop view if exists community_overzicht;

create view community_overzicht as
select
  c.id,
  c.district_id,
  c.naam as name,
  c.slug,
  c.type,
  c.beschrijving as description,
  c.banner_url,
  c.actief as active,
  c.created_at,
  w.name as district_name,
  w.city as district_city,
  count(distinct cm.user_id) as member_count,
  count(distinct r.id) as review_count,
  count(distinct gs.id) filter (where gs.actief) as active_deals
from communities c
join districts w on w.id = c.district_id
left join community_members cm on cm.community_id = c.id
left join reviews r on r.community_id = c.id
left join groepskortingen gs on gs.community_id = c.id
group by c.id, w.name, w.city;

alter view community_overzicht set (security_invoker = true);

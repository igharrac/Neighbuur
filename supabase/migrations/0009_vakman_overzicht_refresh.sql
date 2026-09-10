-- ══════════════════════════════════════════════════════════════
-- Bugfix: `vakman_overzicht` is een view die `vp.*` selecteert. Postgres
-- expandeert `vp.*` naar de concrete kolomlijst op het moment dat de view
-- wordt aangemaakt — nieuwe kolommen op vakman_profielen (zoals de
-- premium-velden uit 0008) verschijnen dus NIET automatisch in de view.
-- Gevolg: de zoekpagina (die op vakman_overzicht.is_premium sorteert)
-- kreeg een 42703-fout en toonde stilzwijgend 0 resultaten.
-- Fix: view opnieuw aanmaken zodat vp.* opnieuw wordt geëxpandeerd.
-- ══════════════════════════════════════════════════════════════

drop view if exists vakman_overzicht;

create view vakman_overzicht as
select
  vp.*,
  p.naam as eigenaar_naam,
  p.avatar_url as eigenaar_avatar,
  count(distinct r.id) as review_count,
  coalesce(avg((r.scores->>'kwaliteit')::numeric), 0)::numeric(3,1) as score_kwaliteit,
  count(distinct b.id) filter (where b.status = 'afgerond') as afgeronde_klussen,
  array_agg(distinct c.slug) filter (where c.slug is not null) as categorie_slugs
from vakman_profielen vp
join profielen p on p.id = vp.user_id
left join reviews r on r.vakman_id = vp.id
left join boekingen b on b.vakman_id = vp.id
left join categorieen c on c.id = any(vp.specialismes)
group by vp.id, p.naam, p.avatar_url;

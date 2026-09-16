-- ══════════════════════════════════════════════════════════════
-- Fase 2, stap 2: telfunctie voor behoefte-clustering — generalisatie
-- van het bestaande community-drempel-patroon naar dienst-categorieën.
-- Telt UNIEKE woningen met een niet-geannuleerde boeking in dezelfde
-- categorie binnen hetzelfde residential cluster, zelfde principe als
-- count_residences_in_cluster (3 huisgenoten met dezelfde boeking =
-- 1 woning, niet 3).
-- ══════════════════════════════════════════════════════════════

create function count_residences_with_category_booking(p_cluster_id uuid, p_category_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct rp.current_residence_id)::int
  from bookings b
  join resident_profiles rp on rp.user_id = b.customer_id
  join residences r on r.id = rp.current_residence_id
  where r.residential_cluster_id = p_cluster_id
    and b.category_id = p_category_id
    and b.status <> 'cancelled';
$$;

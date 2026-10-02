-- ══════════════════════════════════════════════════════════════
-- Publieke, geaggregeerde "actieve klussen"-telling per community.
-- bookings heeft bewust alleen own_read (klant/vakman zelf) — een
-- gewone select zou voor iedereen anders op 0 uitkomen. Zelfde principe
-- als count_residences_in_cluster_public (0050): een security-definer-
-- functie die alleen een aantal teruggeeft, geen rijen, geen PII.
--
-- Telt zowel boekingen die rechtstreeks aan deze community gekoppeld zijn
-- (community_id, gevuld bij boekingen gestart vanaf een community-pagina)
-- als boekingen van bewoners in hetzelfde wooncluster (via residence_id →
-- residential_cluster_id), zodat ook boekingen die via een vakmanprofiel
-- gestart zijn meetellen — community_id alleen is te smal.
-- ══════════════════════════════════════════════════════════════

create function community_active_bookings_count(p_community_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct b.id)::int
  from bookings b
  left join residences r on r.id = b.residence_id
  where b.status = 'requested'
    and (
      b.community_id = p_community_id
      or r.residential_cluster_id = (select residential_cluster_id from communities where id = p_community_id)
    );
$$;

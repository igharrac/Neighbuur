-- ══════════════════════════════════════════════════════════════
-- Fix: Supabase Advisor markeert review_compleet, community_overzicht
-- en vakman_overzicht als "Security Definer View" (critical) — ze lezen
-- met de rechten van de view-eigenaar i.p.v. de bezoeker, wat RLS
-- stilzwijgend omzeilt.
--
-- review_compleet en community_overzicht zijn ongevaarlijk: alles wat
-- ze joinen (reviews, review_reacties, communities, wijken,
-- community_leden, groepskortingen) heeft toch al een public_read-
-- policy. Die zetten we gewoon op security_invoker.
--
-- vakman_overzicht telt "afgeronde_klussen" via boekingen, en dié
-- tabel is NIET publiek (klant_id/vakman_id-only). Dat getal moet wel
-- publiek zichtbaar blijven (staat op elk vakman-profiel). Oplossing:
-- de telling verhuist naar een smalle, expliciete security-definer
-- functie (zelfde patroon als bewoners_cluster_telling uit 0010) die
-- ALLEEN een getal teruggeeft — de view zelf wordt security_invoker,
-- dus alle andere kolommen in de view volgen weer gewoon RLS.
-- ══════════════════════════════════════════════════════════════

alter view review_compleet set (security_invoker = true);
alter view community_overzicht set (security_invoker = true);

create or replace function vakman_afgeronde_klussen(p_vakman_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from boekingen where vakman_id = p_vakman_id and status = 'afgerond';
$$;

grant execute on function vakman_afgeronde_klussen(uuid) to anon, authenticated;

drop view if exists vakman_overzicht;

create view vakman_overzicht as
select
  vp.*,
  p.naam as eigenaar_naam,
  p.avatar_url as eigenaar_avatar,
  count(distinct r.id) as review_count,
  coalesce(avg((r.scores->>'kwaliteit')::numeric), 0)::numeric(3,1) as score_kwaliteit,
  vakman_afgeronde_klussen(vp.id) as afgeronde_klussen,
  array_agg(distinct c.slug) filter (where c.slug is not null) as categorie_slugs
from vakman_profielen vp
join profielen p on p.id = vp.user_id
left join reviews r on r.vakman_id = vp.id
left join categorieen c on c.id = any(vp.specialismes)
group by vp.id, p.naam, p.avatar_url;

alter view vakman_overzicht set (security_invoker = true);

-- ══════════════════════════════════════════════════════════════
-- Organische communityvorming
-- Bewoners kiezen niet langer verplicht een bestaande community bij
-- onboarding. In plaats daarvan vullen ze hun adres in; zodra er
-- genoeg buren (default 3) op hetzelfde adres-cluster gedetecteerd
-- zijn, mag een van hen een community starten. Zie het voorstel in
-- de conversatie voor de volledige toelichting.
-- ══════════════════════════════════════════════════════════════

-- Gestructureerd adres i.p.v. vrije tekst, nodig om buren te
-- detecteren zonder op losse 4-cijferige postcode te matchen.
alter table bewoner_profielen add column if not exists postcode text;
alter table bewoner_profielen add column if not exists huisnummer text;
alter table bewoner_profielen add column if not exists huisnummer_toevoeging text;
alter table bewoner_profielen add column if not exists gebouw_label text;
alter table bewoner_profielen add column if not exists toon_community_suggesties boolean not null default true;

-- Configureerbare drempel per wijk; NULL = gebruik het platform-default (3).
alter table wijken add column if not exists community_threshold int;

-- Community-status voor de "0 actieve leden"-edge case (§9): niet
-- verwijderen, wel gemarkeerd als niet langer actief voorstellen.
alter table communities add column if not exists status text not null default 'actief' check (status in ('actief', 'slapend'));

-- De adres-cluster-sleutel (volledige postcode) waarop een organisch
-- ontstane community is gebaseerd. NULL voor handmatig aangemaakte
-- communities (zoals de bestaande "Vathorst Blok C").
alter table communities add column if not exists postcode_cluster text;

-- Voorkomt dubbele communities voor hetzelfde cluster (race condition
-- als twee buren tegelijk op "Start community" klikken).
create unique index if not exists communities_wijk_cluster_uniek
  on communities (wijk_id, postcode_cluster)
  where postcode_cluster is not null;

-- ── Privacy: alleen geaggregeerde telling, nooit losse rijen ──
-- bewoner_profielen heeft RLS die alleen de eigen rij toont, dus een
-- bewoner kan sowieso geen andermans adres opvragen. Deze functie
-- geeft alléén een getal terug, expliciet zodat er nooit per ongeluk
-- een query met losse rijen client-side terechtkomt.
create or replace function bewoners_cluster_telling(p_wijk_id uuid, p_postcode text, p_gebouw_label text default null)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from bewoner_profielen
  where wijk_id = p_wijk_id
    and community_id is null
    and postcode = p_postcode
    and (p_gebouw_label is null or gebouw_label is not distinct from p_gebouw_label);
$$;

grant execute on function bewoners_cluster_telling(uuid, text, text) to authenticated;

-- ── Community starten voor een cluster ──
-- Security definer omdat dit ook de bewoner_profielen-rijen van andere
-- bewoners in het cluster moet koppelen (community_id invullen) en
-- community_leden voor hen aanmaakt — dat mag een gewone bewoner niet
-- via de normale RLS (en dat moet ook niet, anders kan iedereen
-- iedereen ergens bij inschrijven). De functie staat dit alleen toe
-- als de aanroeper zelf ook in dat cluster zit.
create or replace function start_community(p_wijk_id uuid, p_postcode text, p_titel_nl text)
returns table(id uuid, slug text, aangemaakt boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_ok boolean;
  v_community_id uuid;
  v_slug text;
  v_base_slug text;
  v_poging int := 0;
  v_aangemaakt boolean := false;
begin
  -- Mag alleen wie zelf (nog community-loos) in dit wijk+postcode-cluster zit.
  select exists(
    select 1 from bewoner_profielen
    where user_id = auth.uid() and wijk_id = p_wijk_id and postcode = p_postcode and community_id is null
  ) into v_caller_ok;

  if not v_caller_ok then
    raise exception 'Je hoort niet bij dit cluster of hebt al een community.';
  end if;

  -- Bestaat er al een community voor dit cluster? (race condition-vangnet)
  select c.id into v_community_id from communities c
  where c.wijk_id = p_wijk_id and c.postcode_cluster = p_postcode
  limit 1;

  if v_community_id is null then
    v_base_slug := lower(regexp_replace(coalesce(nullif(trim(p_titel_nl), ''), 'buurtgroep-' || p_postcode), '[^a-z0-9]+', '-', 'gi'));
    v_slug := v_base_slug;
    while exists(select 1 from communities c2 where c2.slug = v_slug) and v_poging < 5 loop
      v_poging := v_poging + 1;
      v_slug := v_base_slug || '-' || v_poging;
    end loop;

    insert into communities (wijk_id, naam, slug, type, postcode_cluster, actief, status)
    values (p_wijk_id, coalesce(nullif(trim(p_titel_nl), ''), 'Buurtgroep ' || p_postcode), v_slug, 'blok', p_postcode, true, 'actief')
    returning communities.id into v_community_id;
    v_aangemaakt := true;
  end if;

  -- Koppel alle community-loze bewoners in dit cluster aan de community.
  update bewoner_profielen
  set community_id = v_community_id
  where wijk_id = p_wijk_id and postcode = p_postcode and community_id is null;

  -- Maak iedereen lid; de aanroeper wordt beheerder (initiatiefnemer),
  -- de rest gewoon lid. Beheerderschap is aanvullend, geen eigendom —
  -- iedereen kan er later net zo goed een worden.
  insert into community_leden (community_id, user_id, rol)
  select v_community_id, bp.user_id, case when bp.user_id = auth.uid() then 'beheerder' else 'lid' end
  from bewoner_profielen bp
  where bp.wijk_id = p_wijk_id and bp.postcode = p_postcode and bp.community_id = v_community_id
  on conflict (community_id, user_id) do nothing;

  return query select v_community_id, (select c.slug from communities c where c.id = v_community_id), v_aangemaakt;
end;
$$;

grant execute on function start_community(uuid, text, text) to authenticated;

-- ══════════════════════════════════════════════════════════════
-- Provider coverage / launch readiness, stap 1: coördinaten bij het
-- werkgebied van een vakman. Het bestaande model (service_area_postcode
-- + service_area_km) blijft ongewijzigd — dit is puur additief, nodig
-- om vestigingslocatie ≠ werkgebied daadwerkelijk te kunnen berekenen
-- (nu gebeurt dat nergens: /zoeken filtert alleen op "straal ≥ X",
-- nooit op afstand tot een concrete plek).
--
-- city is gedenormaliseerd (uit dezelfde PDOK-postcode-lookup als lat/
-- lng) zodat we niet telkens hoeven te re-geocoden voor weergave.
-- ══════════════════════════════════════════════════════════════

alter table professional_profiles
  add column service_area_lat numeric,
  add column service_area_lng numeric,
  add column service_area_city text;

-- Platte Haversine-afstand in km — geen PostGIS nodig voor dit schaalniveau
-- (enkele honderden providers × een tiental steden = triviale rekenlast).
create function distance_km(lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric)
returns numeric
language sql
immutable
as $$
  select 6371 * acos(
    least(1::numeric, greatest(-1::numeric,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    ))
  )
$$;

-- Kandidaat-steden voor coverage: afgeleid uit waar providers zelf al
-- gevestigd zijn (niet uit de bewoner-kant — dat is bewust een aparte,
-- latere koppeling, zie Fase "supply + demand"). Eén gemiddeld
-- middelpunt per stadsnaam — providers binnen dezelfde stad liggen
-- typisch een paar km uit elkaar, dat middelt prima weg op dit niveau.
create view provider_city_centroids as
select
  service_area_city as city,
  avg(service_area_lat) as lat,
  avg(service_area_lng) as lng,
  count(*) as providers_based_here
from professional_profiles
where service_area_city is not null and service_area_lat is not null and service_area_lng is not null
group by service_area_city;

-- Uitgeklapte (provider × stad × categorie)-rijen: één rij per combinatie
-- waarbij de provider's werkgebied-straal die stad daadwerkelijk bereikt.
-- Dit is de ene herbruikbare bron voor alle coverage-aggregaties (stad-
-- totaal, stad×categorie, categorie×stad) — group-by verschilt per
-- weergave, de brondata niet. security_invoker zodat RLS van de
-- onderliggende tabellen gehandhaafd blijft (professional_profiles/
-- profiles zijn public_read, dus dit is sowieso publiek-veilige
-- aggregatie-data, geen PII).
create view admin_provider_coverage as
select
  pp.id as provider_id,
  pp.company_name,
  pp.verified,
  pp.profile_strength,
  pp.logo_url is not null as has_logo,
  pp.bio is not null as has_description,
  s.category_id,
  c.name_nl as category_name,
  c.slug as category_slug,
  pcc.city,
  distance_km(pp.service_area_lat, pp.service_area_lng, pcc.lat, pcc.lng) as distance_km
from professional_profiles pp
join profiles prof on prof.id = pp.user_id
cross join lateral unnest(pp.specialties) as s(category_id)
join categories c on c.id = s.category_id::uuid and c.type = 'professional'
join provider_city_centroids pcc
  on distance_km(pp.service_area_lat, pp.service_area_lng, pcc.lat, pcc.lng) <= pp.service_area_km
where prof.deactivated_at is null
  and prof.deleted_at is null
  and pp.service_area_lat is not null
  and pp.service_area_lng is not null;

alter view provider_city_centroids set (security_invoker = true);
alter view admin_provider_coverage set (security_invoker = true);

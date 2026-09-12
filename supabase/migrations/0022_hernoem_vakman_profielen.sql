-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch, LAATSTE kerntabel): vakman_profielen
-- → professional_profiles.
-- vakman_overzicht (view) gebruikt vp.* (wildcard) — een kolomrename
-- laat de view gewoon doorwerken (Postgres volgt via OID, net als bij
-- elke eerdere batch), maar de EIGEN output-kolomnamen van de view
-- blijven bevroren op de oude Nederlandse namen (bedrijfsnaam, gem_score,
-- etc.) tot Fase 4 — bewust, zelfde aanpak als review_compleet in 0019.
-- contact_voorkeur blijft als enum-type + waarden (telefoon/whatsapp/app)
-- bewust ongewijzigd tot Fase 3; alleen de kolomnaam zelf wordt hernoemd.
-- ══════════════════════════════════════════════════════════════

alter table vakman_profielen rename to professional_profiles;

alter table professional_profiles rename column bedrijfsnaam to company_name;
alter table professional_profiles rename column kvk_nummer to kvk_number;
alter table professional_profiles rename column kvk_geverifieerd to kvk_verified;
alter table professional_profiles rename column specialismes to specialties;
alter table professional_profiles rename column contact_voorkeur to contact_preference;
alter table professional_profiles rename column werkgebied_postcode to service_area_postcode;
alter table professional_profiles rename column werkgebied_km to service_area_km;
alter table professional_profiles rename column verzekerd to insured;
alter table professional_profiles rename column verzekering_url to insurance_url;
alter table professional_profiles rename column geverifieerd to verified;
alter table professional_profiles rename column registratie_bron to registration_source;
alter table professional_profiles rename column profiel_sterkte to profile_strength;
alter table professional_profiles rename column gem_score to avg_score;
alter table professional_profiles rename column aantal_reviews to review_count;
alter table professional_profiles rename column reactietijd_min to response_time_min;
alter table professional_profiles rename column premium_tot to premium_until;
alter table professional_profiles rename column aanvragen_deze_maand to requests_this_month;
alter table professional_profiles rename column aanvragen_limiet to requests_limit;

-- bereken_profiel_sterkte is plpgsql en leest bijna elke kolom van deze
-- tabel (inclusief een `v professional_profiles`-rowtype-declaratie) —
-- handmatig gefixt.
create or replace function bereken_profiel_sterkte(v_id uuid)
returns int as $$
declare
  sterkte int := 0;
  v professional_profiles;
begin
  select * into v from professional_profiles where id = v_id;
  if v is null then return 0; end if;

  if v.company_name is not null then sterkte := sterkte + 10; end if;
  if v.kvk_number is not null    then sterkte := sterkte + 10; end if;
  if v.logo_url is not null      then sterkte := sterkte + 20; end if;
  if v.bio is not null           then sterkte := sterkte + 10; end if;
  if v.website is not null       then sterkte := sterkte + 5;  end if;
  if v.insured                   then sterkte := sterkte + 15; end if;
  if v.kvk_verified              then sterkte := sterkte + 10; end if;
  if array_length(v.specialties, 1) > 0 then sterkte := sterkte + 5; end if;

  if (select count(*) from work_photos where professional_id = v_id) >= 3 then
    sterkte := sterkte + 15;
  end if;

  return least(sterkte, 100);
end;
$$ language plpgsql security definer;

-- update_vakman_stats is plpgsql (trigger op reviews) en schrijft
-- gem_score/aantal_reviews — handmatig gefixt.
create or replace function update_vakman_stats()
returns trigger as $$
begin
  update professional_profiles
  set
    avg_score = (
      select coalesce(avg((scores->>'kwaliteit')::numeric), 0)::numeric(3,1)
      from reviews where professional_id = coalesce(NEW.professional_id, OLD.professional_id)
    ),
    review_count = (
      select count(*) from reviews
      where professional_id = coalesce(NEW.professional_id, OLD.professional_id)
    ),
    updated_at = now()
  where id = coalesce(NEW.professional_id, OLD.professional_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- kan_boeking_aanvragen (freemium-limiet-check) en
-- reset_maandelijkse_aanvragen (cron) lezen/schrijven de aanvragen_*/
-- premium_tot-kolommen — handmatig gefixt. Parameternaam p_vakman_id
-- blijft bewust ongewijzigd.
create or replace function kan_boeking_aanvragen(p_vakman_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_premium boolean;
  v_premium_tot date;
  v_deze_maand int;
  v_limiet int;
begin
  select is_premium, premium_until, requests_this_month, requests_limit
  into v_is_premium, v_premium_tot, v_deze_maand, v_limiet
  from professional_profiles
  where id = p_vakman_id
  for update;

  if not found then
    return false;
  end if;

  if v_is_premium and (v_premium_tot is null or v_premium_tot >= current_date) then
    return true;
  end if;

  if v_deze_maand >= v_limiet then
    return false;
  end if;

  update professional_profiles set requests_this_month = requests_this_month + 1 where id = p_vakman_id;
  return true;
end;
$$;

create or replace function reset_maandelijkse_aanvragen()
returns void
language plpgsql
security definer
as $$
begin
  update professional_profiles set requests_this_month = 0;
end;
$$;

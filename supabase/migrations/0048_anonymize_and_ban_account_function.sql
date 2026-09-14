-- ══════════════════════════════════════════════════════════════
-- Account-levenscyclus, stap 3: anonimiseren i.p.v. hard verwijderen.
-- Bijna elke tabel die naar profiles.id verwijst staat op RESTRICT
-- (bookings, reviews, messages, invitations, review_votes,
-- transactions) — profiles/professional_profiles kunnen dus letterlijk
-- niet verwijderd worden zodra iemand ooit een boeking/review/bericht
-- heeft gehad. Dit is geen ontwerpkeuze maar een harde
-- database-beperking, en is precies waarom hier geschoond wordt i.p.v.
-- verwijderd. Alles in één transactie (plpgsql-functie), niet losse
-- stappen vanuit de applicatie die halverwege kunnen mislukken.
--
-- Wordt alleen aangeroepen vanuit een server-route met de admin-
-- (service-role) client — geen client-toegang, vandaar geen aparte
-- RLS-overweging nodig; security definer + search_path vastgezet
-- zoals overal elders in dit project.
-- ══════════════════════════════════════════════════════════════

create function anonymize_and_ban_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prof_id uuid;
begin
  -- 1. Puur-persoonlijke rijen zonder RESTRICT erop — gewoon verwijderen.
  delete from resident_residence_history where user_id = p_user_id;
  delete from community_members where user_id = p_user_id;
  delete from resident_profiles where user_id = p_user_id;
  delete from notifications where user_id = p_user_id;

  -- 2. professional_profiles kán niet verwijderd worden (bookings/
  --    reviews/review_replies/transactions staan op RESTRICT) — schonen.
  select id into v_prof_id from professional_profiles where user_id = p_user_id;
  if v_prof_id is not null then
    update professional_profiles set
      company_name = 'Verwijderde vakman',
      bio = null,
      website = null,
      logo_url = null,
      kvk_number = null,
      kvk_verified = false,
      verified = false,
      insured = false,
      insurance_url = null
    where id = v_prof_id;
  end if;

  -- 3. profiles zelf kán ook niet verwijderd worden — schonen. Reviews/
  --    bookings/messages tonen de naam LIVE via een join op profiles,
  --    dus deze schoning propageert direct door naar alle historische
  --    records, zonder verdere code.
  update profiles set
    name = 'Verwijderde gebruiker',
    email = null,
    phone = null,
    avatar_url = null,
    deleted_at = now(),
    deactivated_at = null
  where id = p_user_id;
end;
$$;

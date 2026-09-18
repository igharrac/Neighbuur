-- ══════════════════════════════════════════════════════════════
-- Pilot-audit P0, punt 1: profiles.email/phone zijn sinds migratie 0001
-- leesbaar voor IEDEREEN, ook niet-ingelogd ("public_read" op de hele
-- rij, using (true)). Elke bezoeker kan via de publieke anon-key
-- rechtstreeks e-mailadres + telefoonnummer van elke bewoner/vakman
-- opvragen.
--
-- De rij-brede policy blijft bewust ONGEWIJZIGD — professional_overview
-- en review_complete joinen profiles (INNER JOIN) voor naam/avatar van
-- een willekeurige andere gebruiker; die joins zouden voor iedere
-- niet-eigen rij stuklopen (en dus /zoeken en alle reviews leegtrekken)
-- als rijzichtbaarheid werd beperkt. De fix zit daarom op KOLOMNIVEAU:
-- e-mail/telefoon specifiek afschermen, de rest van de rij blijft zoals
-- het was.
-- ══════════════════════════════════════════════════════════════

revoke select (email, phone) on profiles from anon, authenticated;

-- Veilige, smalle toegang tot je EIGEN e-mail/telefoon (nodig voor
-- /profiel, en voor useAuth's client-side profielstate). security
-- definer omzeilt bewust de revoke hierboven, maar is hard gescoped op
-- auth.uid() — kan nooit iemand anders' contactgegevens teruggeven,
-- zelfde patroon als andere "_public"-functies in dit project.
create function get_my_contact_info()
returns table(email text, phone text)
language sql
security definer
set search_path = public
stable
as $$
  select email, phone from profiles where id = auth.uid();
$$;

-- Admin-only overzicht met contactgegevens, voor /admin/bewoners en
-- /admin/vakmensen (AdminAccountList.tsx). Bewust GEEN security_invoker
-- (enige afwijking van de gebruikelijke view-conventie in dit project,
-- en met opzet: deze view moet de revoke hierboven mogen omzeilen) —
-- de view doet daarom zelf de autorisatiecheck: alleen rijen als de
-- aanroeper zelf role='admin' is, anders nul rijen (geen foutmelding).
create view admin_profiles_contact as
select p.id, p.name, p.email, p.phone, p.role, p.created_at
from profiles p
where exists (
  select 1 from profiles me where me.id = auth.uid() and me.role = 'admin'
);

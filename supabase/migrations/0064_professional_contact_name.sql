-- ══════════════════════════════════════════════════════════════
-- De provider-registratie vraagt straks ook de naam van de persoon
-- achter het bedrijf (naast company_name, dat de bedrijfsnaam is).
-- Nullable, want bestaande rijen hebben dit nog niet ingevuld.
-- ══════════════════════════════════════════════════════════════

alter table professional_profiles
  add column contact_first_name text,
  add column contact_last_name  text;

-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): profielen → profiles.
-- Geen enkele RPC/functie leest of schrijft profielen rechtstreeks
-- (geverifieerd) — geen handmatige functie-fix nodig, in tegenstelling
-- tot eerdere batches. De user_role-enum (type + waarden) blijft bewust
-- ongewijzigd tot Fase 3; alleen de kolomnaam 'rol' zelf wordt hernoemd.
-- ══════════════════════════════════════════════════════════════

alter table profielen rename to profiles;

alter table profiles rename column naam to name;
alter table profiles rename column telefoon to phone;
alter table profiles rename column taal to language;
alter table profiles rename column rol to role;

-- RLS-policies op categorieen/wijken/groepskortingen/community_content_blokken
-- en de storage.objects-policies verwijzen naar "profielen"/"rol" in hun
-- using/with check-expressies — deze volgen automatisch mee via Postgres'
-- OID-tracking bij RENAME TABLE/COLUMN, geen aparte actie nodig.

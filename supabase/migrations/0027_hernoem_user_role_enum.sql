-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum, hoogste risico — auth/toegangscontrole):
-- user_role. Typenaam blijft user_role (al Engels), alleen de waarden.
-- ALTER TYPE ... RENAME VALUE migreert bestaande data automatisch.
-- 'admin' blijft ongewijzigd — geverifieerd dat elke RLS/storage-policy
-- alleen tegen 'admin' checkt, nooit tegen de drie wijzigende waarden.
-- ══════════════════════════════════════════════════════════════

alter type user_role rename value 'bewoner' to 'resident';
alter type user_role rename value 'vakman' to 'professional';
alter type user_role rename value 'community_beheerder' to 'community_admin';

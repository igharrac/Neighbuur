-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum): beschikbaarheid_type → availability_status.
-- ALTER TYPE ... RENAME VALUE migreert bestaande data automatisch.
-- ══════════════════════════════════════════════════════════════

alter type beschikbaarheid_type rename to availability_status;
alter type availability_status rename value 'beschikbaar' to 'available';
alter type availability_status rename value 'bezet' to 'booked';

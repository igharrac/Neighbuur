-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum): categorie_type → category_type.
-- ALTER TYPE ... RENAME VALUE migreert bestaande data automatisch.
-- ══════════════════════════════════════════════════════════════

alter type categorie_type rename to category_type;
alter type category_type rename value 'vakman' to 'professional';
alter type category_type rename value 'vergelijk' to 'compare';

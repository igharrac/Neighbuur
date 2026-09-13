-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (laatste enum): content_blok_type →
-- content_block_type. ALTER TYPE ... RENAME VALUE migreert bestaande
-- data automatisch. hero_banner en reviews blijven ongewijzigd (al
-- Engels). Geen enkele SQL-functie/view/trigger/RLS-policy verwijst naar
-- deze waarden (geverifieerd) — in tegenstelling tot boeking_status is
-- hier geen functie-fix nodig.
-- ══════════════════════════════════════════════════════════════

alter type content_blok_type rename to content_block_type;
alter type content_block_type rename value 'tekst' to 'text';
alter type content_block_type rename value 'afbeelding' to 'image';
alter type content_block_type rename value 'groepskortingen' to 'group_discounts';
alter type content_block_type rename value 'bewoners' to 'residents';
alter type content_block_type rename value 'aankondiging' to 'announcement';
alter type content_block_type rename value 'vakman_spotlight' to 'professional_spotlight';

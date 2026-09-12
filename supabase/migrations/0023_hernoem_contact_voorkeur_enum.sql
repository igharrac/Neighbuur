-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum, laagste risico eerst): contact_voorkeur
-- → contact_preference. ALTER TYPE ... RENAME VALUE migreert bestaande
-- data automatisch (bevestigd door Supabase-versie), dus geen aparte
-- datamigratie nodig — alleen de typenaam en de 'telefoon'-waarde.
-- ══════════════════════════════════════════════════════════════

alter type contact_voorkeur rename to contact_preference;
alter type contact_preference rename value 'telefoon' to 'phone';

-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, nieuwe batch: community_content_blokken →
-- community_content_blocks. Onafhankelijk van 0034/0035 — geen view
-- of functie leest/schrijft deze tabel. RLS-policies (public_read,
-- admin_manage) verwijzen alleen naar community_id/profiles.role,
-- niet naar positie/actief, dus die propageren automatisch mee.
--
-- De JSONB data-kolom zelf (en haar interne Nederlandse keys als
-- titel/bijschrift/afbeelding_url) blijft bewust ongewijzigd — dat
-- is losse opgeslagen content, geen kolomnaam.
-- ══════════════════════════════════════════════════════════════

alter table community_content_blokken rename to community_content_blocks;
alter table community_content_blocks rename column positie to position;
alter table community_content_blocks rename column actief to active;

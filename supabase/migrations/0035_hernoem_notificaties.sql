-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, nieuwe batch: notificaties → notifications.
-- Onafhankelijk van 0034 — geen view of functie leest/schrijft deze
-- tabel (bevestigd via een volledige doorzoeking van alle
-- create-or-replace-function-bodies in supabase/migrations/).
-- RLS-policies (own_read/own_update) verwijzen alleen naar user_id,
-- dus die propageren automatisch mee met de RENAME.
-- ══════════════════════════════════════════════════════════════

alter table notificaties rename to notifications;
alter table notifications rename column titel_nl to title_nl;
alter table notifications rename column titel_en to title_en;
alter table notifications rename column inhoud_nl to content_nl;
alter table notifications rename column inhoud_en to content_en;
alter table notifications rename column gelezen to read;

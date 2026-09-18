-- ══════════════════════════════════════════════════════════════
-- Correctie op 0061: de kolom-revoke daar werkte niet. Verificatie met
-- de publieke anon-key liet email/phone nog gewoon zien.
--
-- Oorzaak: Supabase geeft standaard een TABEL-brede "grant select on
-- profiles to anon, authenticated" (dekt alle kolommen als één ACL-
-- entry). Een losse "revoke select (email, phone) ..." doet daar niets
-- tegen — kolom-privileges tellen alleen mee als er GEEN dekkende
-- tabel-brede grant meer is. De tabel-brede grant moet dus eerst weg,
-- en vervangen worden door een expliciete kolomlijst zonder email/phone.
-- ══════════════════════════════════════════════════════════════

revoke select on profiles from anon, authenticated;

grant select (id, name, role, avatar_url, language, created_at, updated_at, deactivated_at, deleted_at)
  on profiles to anon, authenticated;

-- insert/update blijven ongemoeid (own_insert/own_update-policies regelen
-- dat al op rijniveau) — dit raakt uitsluitend lezen.

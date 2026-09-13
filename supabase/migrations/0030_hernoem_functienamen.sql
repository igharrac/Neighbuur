-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 4 (deel a): resterende Nederlandse
-- RPC-functienamen. ALTER FUNCTION ... RENAME TO cascadeert automatisch
-- naar alle SQL-level aanroepers (views, RLS-policies, grants) via
-- Postgres' OID-tracking — zelfde bewezen aanpak als migratie 0015
-- (is_gesprek_deelnemer → is_conversation_participant). Alleen de
-- TypeScript .rpc("...")-aanroepen moeten handmatig mee.
--
-- reset_maandelijkse_aanvragen heeft geen enkele aanroeper in de repo
-- (geen .rpc()-call, geen vercel.json-cron) — gecontroleerd, geen
-- code-aanpassing nodig voor deze functie.
-- ══════════════════════════════════════════════════════════════

alter function bereken_profiel_sterkte(uuid) rename to calculate_profile_strength;
alter function kan_boeking_aanvragen(uuid) rename to can_request_booking;
alter function reset_maandelijkse_aanvragen() rename to reset_monthly_requests;
alter function bewoners_cluster_telling(uuid, text, text) rename to count_residents_in_cluster;
alter function vakman_afgeronde_klussen(uuid) rename to count_professional_completed_jobs;

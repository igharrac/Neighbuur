-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 1 — oefenronde
-- Twee laagste-risico tabellen: transacties (0 code-referenties, nog
-- niet aangesloten) en review_reacties (1 code-referentie). Puur
-- ALTER TABLE/COLUMN RENAME, geen data-verlies, geen drop+recreate.
--
-- Views (review_compleet) en RLS-policies die deze kolommen gebruiken
-- worden door Postgres automatisch bijgewerkt bij een rename — geen
-- aparte actie nodig. Alleen de auto-gegenereerde constraint-namen
-- (bv. review_reacties_review_id_key) blijven bij hun oude naam staan;
-- dat is puur cosmetisch en raakt de applicatie niet.
-- ══════════════════════════════════════════════════════════════

alter table transacties rename to transactions;
alter table transactions rename column boeking_id to booking_id;
alter table transactions rename column vakman_id to professional_id;
alter table transactions rename column klant_id to customer_id;
alter table transactions rename column bedrag_cents to amount_cents;
alter table transactions rename column commissie_cents to commission_cents;

alter table review_reacties rename to review_replies;
alter table review_replies rename column vakman_id to professional_id;
alter table review_replies rename column tekst to text;

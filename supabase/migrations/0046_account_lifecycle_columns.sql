-- ══════════════════════════════════════════════════════════════
-- Account-levenscyclus, stap 1: de twee kolommen die deactiveren
-- (tijdelijk, zelf-herstelbaar) en verwijderen (permanent, na
-- anonimiseren) van elkaar onderscheiden. Puur additief — niets in de
-- huidige applicatie leest deze kolommen nog.
-- ══════════════════════════════════════════════════════════════

alter table profiles
  add column deactivated_at timestamptz null,
  add column deleted_at    timestamptz null;

-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum, tweede hoogste risico): boeking_status
-- → booking_status. ALTER TYPE ... RENAME VALUE migreert bestaande data
-- automatisch.
-- ══════════════════════════════════════════════════════════════

alter type boeking_status rename to booking_status;
alter type booking_status rename value 'aangevraagd' to 'requested';
alter type booking_status rename value 'bevestigd' to 'confirmed';
alter type booking_status rename value 'afgerond' to 'completed';
alter type booking_status rename value 'geannuleerd' to 'cancelled';

-- vakman_afgeronde_klussen (sql, backt vakman_overzicht) checkt
-- status = 'afgerond' letterlijk in de body — handmatig fixen, zelfde
-- reden als bij elke eerdere functie-fix in dit traject.
create or replace function vakman_afgeronde_klussen(p_vakman_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from bookings where professional_id = p_vakman_id and status = 'completed';
$$;

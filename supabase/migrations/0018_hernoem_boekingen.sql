-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): boekingen → bookings.
-- De boeking_status-enum (type + waarden) blijft bewust ongewijzigd
-- tot Fase 3 — alleen de tabel en haar eigen kolommen.
-- ══════════════════════════════════════════════════════════════

alter table boekingen rename to bookings;

alter table bookings rename column klant_id to customer_id;
alter table bookings rename column vakman_id to professional_id;
alter table bookings rename column categorie_id to category_id;
alter table bookings rename column omschrijving to description;
alter table bookings rename column datum to date;
alter table bookings rename column prijs_cents to price_cents;
alter table bookings rename column notities_klant to customer_notes;
alter table bookings rename column notities_vakman to professional_notes;
alter table bookings rename column review_verzoek_verstuurd_op to review_request_sent_at;

-- vakman_afgeronde_klussen is sql en leest boekingen(vakman_id, status) —
-- body is opaque tekst, wordt niet automatisch bijgewerkt. Backt de
-- vakman_overzicht-view (via de functie-aanroep, niet direct), dus die
-- blijft zelf werken zodra deze functie gefixt is.
create or replace function vakman_afgeronde_klussen(p_vakman_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from bookings where professional_id = p_vakman_id and status = 'afgerond';
$$;

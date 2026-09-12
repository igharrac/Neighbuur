-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): gesprekken, gesprek_deelnemers,
-- berichten — het berichtensysteem, inclusief de RLS-recursion-fix
-- functie uit migratie 0006 (is_gesprek_deelnemer). Extra zorgvuldig
-- getest gezien de eerdere recursion-geschiedenis van dit onderdeel.
-- ══════════════════════════════════════════════════════════════

alter table gesprekken rename to conversations;
alter table conversations rename column boeking_id to booking_id;

alter table gesprek_deelnemers rename to conversation_participants;
alter table conversation_participants rename column gesprek_id to conversation_id;

alter table berichten rename to messages;
alter table messages rename column gesprek_id to conversation_id;
alter table messages rename column van_id to sender_id;
alter table messages rename column tekst to text;
alter table messages rename column foto_url to photo_url;
alter table messages rename column gelezen_op to read_at;

-- Functienaam hernoemen (RLS-policies die 'm aanroepen cascaden hierop
-- automatisch mee, Postgres trackt functieafhankelijkheden via OID).
alter function is_gesprek_deelnemer(uuid) rename to is_conversation_participant;

-- Parameternaam (p_gesprek_id) blijft bewust ongewijzigd: Postgres staat
-- een parameternaam-wijziging alleen toe via DROP + CREATE, niet via
-- CREATE OR REPLACE — en DROP zou de RLS-policies die 'm aanroepen
-- meeslepen. Puur cosmetisch verschil, geen functionele impact.
-- Wel de body bijwerken naar de nieuwe tabel/kolomnamen.
create or replace function is_conversation_participant(p_gesprek_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from conversation_participants
    where conversation_id = p_gesprek_id and user_id = auth.uid()
  );
$$;

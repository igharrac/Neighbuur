-- ══════════════════════════════════════════════════════════════
-- KRITIEKE FIX: de bestaande "own_read"-policy op gesprek_deelnemers
-- (uit 0001) is zelf-refererend:
--
--   using (user_id = auth.uid() or gesprek_id in (
--     select gesprek_id from gesprek_deelnemers where user_id = auth.uid()
--   ))
--
-- De subquery leest gesprek_deelnemers opnieuw, wat weer door diens
-- eigen policy moet, wat de subquery opnieuw uitvoert — Postgres
-- breekt dit af met "infinite recursion detected in policy for
-- relation gesprek_deelnemers". Omdat de policies op gesprekken en
-- berichten zelf ook via een subquery naar gesprek_deelnemers
-- verwijzen, faalt hierdoor élke read op alle drie de tabellen voor
-- gewone (niet-service-role) gebruikers — de hele berichtenfunctie
-- staat hierdoor potdicht totdat dit gefixt is.
--
-- Fix: een SECURITY DEFINER functie die gesprek_deelnemers met
-- verhoogde rechten leest (buiten RLS om, dus zonder de policy
-- opnieuw te triggeren) om lidmaatschap te bepalen.
-- ══════════════════════════════════════════════════════════════

-- CASCADE ruimt ook alle policies op die al (deels) van een eerdere,
-- afgebroken poging over zijn — dit script is zo altijd veilig
-- opnieuw te draaien, ongeacht wat er al bestond.
drop function if exists is_gesprek_deelnemer(uuid) cascade;

create function is_gesprek_deelnemer(p_gesprek_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from gesprek_deelnemers
    where gesprek_id = p_gesprek_id and user_id = auth.uid()
  );
$$;

drop policy if exists "own_read" on gesprek_deelnemers;
create policy "own_read" on gesprek_deelnemers for select
  using (is_gesprek_deelnemer(gesprek_id));

-- ══════════════════════════════════════════════════════════════
-- Chat: leesbevestigingen + chat-fotos bucket policy.
--
-- Gesprekken worden aangemaakt via de server route /berichten/nieuw
-- met de service-role client (zoals ook het uitnodigingssysteem
-- werkt) — dat omzeilt RLS bewust voor deze cross-user operatie,
-- dus gesprekken/gesprek_deelnemers hebben hier geen insert-policy
-- nodig. Berichten versturen kon al (own_send). Alleen het
-- markeren-als-gelezen door de ontvanger ontbrak nog.
-- ══════════════════════════════════════════════════════════════

drop policy if exists "deelnemer_marks_read" on berichten;
create policy "deelnemer_marks_read" on berichten for update
  using (is_gesprek_deelnemer(gesprek_id))
  with check (is_gesprek_deelnemer(gesprek_id));

-- chat-fotos bucket: privaat, alleen deelnemers van het gesprek
-- mogen lezen/schrijven. Pad: {gesprek_id}/{bestand}
drop policy if exists "deelnemer_manage_chat_fotos" on storage.objects;
create policy "deelnemer_manage_chat_fotos" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'chat-fotos'
    and is_gesprek_deelnemer(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'chat-fotos'
    and is_gesprek_deelnemer(((storage.foldername(name))[1])::uuid)
  );

-- ══════════════════════════════════════════════════════════════
-- Realtime: de berichten-tabel stond nog niet in de
-- supabase_realtime-publicatie. Zonder dit komen nieuwe berichten
-- pas binnen na een refresh, niet via de postgres_changes-subscriptie
-- in GesprekDetail.tsx. Dit is los van RLS — een aparte, verplichte
-- Supabase-instelling per tabel.
-- ══════════════════════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'berichten'
  ) then
    alter publication supabase_realtime add table berichten;
  end if;
end $$;

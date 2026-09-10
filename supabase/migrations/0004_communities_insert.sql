-- ══════════════════════════════════════════════════════════════
-- Fix: bewoners konden geen nieuwe community "voorstellen" tijdens
-- onboarding (SPEC2 §7.2) — communities had alleen een public_read
-- policy, geen insert-policy voor gewone ingelogde gebruikers.
-- ══════════════════════════════════════════════════════════════

create policy "authenticated_insert" on communities for insert
  to authenticated
  with check (true);

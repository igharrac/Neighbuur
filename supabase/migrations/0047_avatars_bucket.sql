-- ══════════════════════════════════════════════════════════════
-- Account-levenscyclus / profielpagina, stap 2: publieke storage-
-- bucket voor bewoner-/vakman-avatars (profiles.avatar_url). Zelfde
-- patroon als auth-photos (0038): eigen map per gebruiker, sleutel is
-- hier gewoon auth.uid() zelf i.p.v. een aparte profiel-id, omdat elke
-- ingelogde gebruiker precies één profiles-rij bezit met hetzelfde id.
-- ══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public_read_avatars" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "own_manage_avatar" on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ══════════════════════════════════════════════════════════════
-- Nieuwe login/registratie-flow: tabel + storage-bucket voor de
-- zelf-beheerbare, roterende foto's in het rechterpaneel van de
-- nieuwe AuthSplitScreen. Categorie volgt de UserRole-waarden
-- (resident/professional) zodat bewoner- en vakman-schermen elk uit
-- hun eigen pool putten.
--
-- public_read: het inlogscherm is niet-ingelogd, moet dus anoniem
-- kunnen lezen. admin_manage: alleen admins mogen uploaden/verwijderen
-- — zelfde patroon als categories/community_content_blocks.
-- ══════════════════════════════════════════════════════════════

create table auth_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  category text not null check (category in ('resident', 'professional')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table auth_photos enable row level security;

create policy "public_read" on auth_photos for select using (true);

create policy "admin_manage" on auth_photos for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Storage-bucket voor de geüploade foto's zelf.
insert into storage.buckets (id, name, public)
values ('auth-photos', 'auth-photos', true)
on conflict (id) do nothing;

create policy "admin_manage_auth_photos" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'auth-photos'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'auth-photos'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

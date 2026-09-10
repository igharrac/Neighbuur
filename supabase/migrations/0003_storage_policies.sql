-- ══════════════════════════════════════════════════════════════
-- Fix: de storage buckets (community-images, categorie-images,
-- vakman-logos, vakman-werkfotos, vakman-documenten) hadden geen
-- RLS-policies op storage.objects. "public: true" regelt alleen
-- lezen — zonder policy kan niemand via de browser-client uploaden.
-- ══════════════════════════════════════════════════════════════

-- Vakman-buckets: een vakman mag alleen binnen zijn eigen
-- {vakman_id}/... map lezen/schrijven.
create policy "vakman_manage_own_files" on storage.objects for all
  to authenticated
  using (
    bucket_id in ('vakman-logos', 'vakman-werkfotos', 'vakman-documenten')
    and (storage.foldername(name))[1] in (
      select id::text from vakman_profielen where user_id = auth.uid()
    )
  )
  with check (
    bucket_id in ('vakman-logos', 'vakman-werkfotos', 'vakman-documenten')
    and (storage.foldername(name))[1] in (
      select id::text from vakman_profielen where user_id = auth.uid()
    )
  );

-- Admin mag verzekeringsbewijzen inzien (voor verificatie later).
create policy "admin_read_documenten" on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vakman-documenten'
    and exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
  );

-- Categorie-afbeeldingen: alleen admin.
create policy "admin_manage_categorie_images" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'categorie-images'
    and exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
  )
  with check (
    bucket_id = 'categorie-images'
    and exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
  );

-- Community-afbeeldingen: admin, of beheerder van díe community
-- (map-structuur is {community_id}/...).
create policy "admin_manage_community_images" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'community-images'
    and (
      exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
      or exists (
        select 1 from community_leden
        where community_id::text = (storage.foldername(name))[1]
          and user_id = auth.uid()
          and rol = 'beheerder'
      )
    )
  )
  with check (
    bucket_id = 'community-images'
    and (
      exists (select 1 from profielen where id = auth.uid() and rol = 'admin')
      or exists (
        select 1 from community_leden
        where community_id::text = (storage.foldername(name))[1]
          and user_id = auth.uid()
          and rol = 'beheerder'
      )
    )
  );

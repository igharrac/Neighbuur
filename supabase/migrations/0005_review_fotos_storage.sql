-- ══════════════════════════════════════════════════════════════
-- review-fotos bucket: elke ingelogde gebruiker mag foto's uploaden
-- in zijn eigen {auteur_id}/-map. Bucket is public voor lezen.
-- ══════════════════════════════════════════════════════════════

create policy "auteur_manage_eigen_reviewfotos" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'review-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'review-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

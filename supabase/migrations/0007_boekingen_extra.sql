-- ══════════════════════════════════════════════════════════════
-- Boekingsflow: bijhouden wanneer het review-verzoek (24u na
-- afronding) al verstuurd is, zodat /api/cron/review-verzoeken
-- niet dubbel notificeert.
-- ══════════════════════════════════════════════════════════════

alter table boekingen add column if not exists review_verzoek_verstuurd_op timestamptz;

-- boeking-fotos bucket: klant mag foto's uploaden in zijn eigen
-- {klant_id}/-map bij een klus-omschrijving. Bucket is public voor lezen
-- (zelfde patroon als review-fotos).
drop policy if exists "klant_manage_eigen_boekingfotos" on storage.objects;
create policy "klant_manage_eigen_boekingfotos" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'boeking-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'boeking-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

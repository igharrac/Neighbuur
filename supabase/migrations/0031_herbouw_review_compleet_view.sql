-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 4 (deel b, eerste view): review_compleet.
-- Een view kan niet in-place hernoemd-en-herdefinieerd worden zonder
-- haar kolomnamen te bevriezen (CREATE OR REPLACE VIEW staat geen
-- kolomnaam-wijzigingen toe) — daarom hier een DROP + CREATE, met
-- expliciete kolommen i.p.v. r.* zodat toekomstige ADD COLUMNs niet
-- opnieuw tot bevriezing leiden (zie de 0009-bugfix eerder in dit
-- traject).
--
-- security_invoker moet na een DROP+CREATE opnieuw expliciet gezet
-- worden — dit was precies het lek dat Supabase Advisor meldde en in
-- migratie 0011 werd gefixt. NIET vergeten.
-- ══════════════════════════════════════════════════════════════

drop view if exists review_compleet;

create view review_compleet as
select
  r.id,
  r.author_id,
  r.professional_id,
  r.booking_id,
  r.community_id,
  r.text,
  r.scores,
  r.foto_urls,
  r.upvote_score,
  r.created_at,
  r.updated_at,
  p.name as author_name,
  p.avatar_url as author_avatar,
  cm.naam as community_name,
  rr.text as reply_text,
  rr.created_at as reply_date,
  vp.company_name as reply_company,
  r.booking_id is not null as verified
from reviews r
join profiles p on p.id = r.author_id
left join communities cm on cm.id = r.community_id
left join review_replies rr on rr.review_id = r.id
left join professional_profiles vp on vp.id = rr.professional_id;

alter view review_compleet set (security_invoker = true);

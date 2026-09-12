-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): reviews / review_votes.
-- Tabelnamen zijn al Engels, alleen hun Nederlandse kolommen worden
-- hernoemd. reviews.scores (jsonb-keys kwaliteit/stiptheid/communicatie/
-- prijs) blijft bewust ongewijzigd — apart datamigratie-vraagstuk, geen
-- kolomrename.
-- ══════════════════════════════════════════════════════════════

alter table reviews rename column auteur_id to author_id;
alter table reviews rename column vakman_id to professional_id;
alter table reviews rename column boeking_id to booking_id;
alter table reviews rename column tekst to text;

alter table review_votes rename column waarde to value;

-- update_review_score is plpgsql (trigger op review_votes) en telt
-- waarde op — body is opaque tekst, wordt niet automatisch bijgewerkt.
create or replace function update_review_score()
returns trigger as $$
begin
  update reviews
  set upvote_score = (
    select coalesce(sum(value), 0)
    from review_votes
    where review_id = coalesce(NEW.review_id, OLD.review_id)
  )
  where id = coalesce(NEW.review_id, OLD.review_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- update_vakman_stats is plpgsql (trigger op reviews) en leest/filtert
-- op vakman_id — handmatig fixen. scores->>'kwaliteit' blijft bewust
-- ongewijzigd (zie opmerking hierboven).
create or replace function update_vakman_stats()
returns trigger as $$
begin
  update vakman_profielen
  set
    gem_score = (
      select coalesce(avg((scores->>'kwaliteit')::numeric), 0)::numeric(3,1)
      from reviews where professional_id = coalesce(NEW.professional_id, OLD.professional_id)
    ),
    aantal_reviews = (
      select count(*) from reviews
      where professional_id = coalesce(NEW.professional_id, OLD.professional_id)
    ),
    updated_at = now()
  where id = coalesce(NEW.professional_id, OLD.professional_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

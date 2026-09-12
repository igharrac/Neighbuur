-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (eerste kerntabel): werk_fotos → work_photos
-- 6 code-referenties (dashboard/page.tsx, dashboard/profiel/page.tsx,
-- WerkFotoGrid.tsx). Puur ALTER TABLE/COLUMN RENAME.
-- ══════════════════════════════════════════════════════════════

alter table werk_fotos rename to work_photos;
alter table work_photos rename column vakman_id to professional_id;
alter table work_photos rename column foto_url to photo_url;
alter table work_photos rename column bijschrift to caption;

-- bereken_profiel_sterkte is plpgsql: die parset zijn body niet bij
-- aanmaak, dus de werk_fotos-referentie wordt NIET automatisch
-- bijgewerkt door de rename hierboven — handmatig fixen.
create or replace function bereken_profiel_sterkte(v_id uuid)
returns int as $$
declare
  sterkte int := 0;
  v vakman_profielen;
begin
  select * into v from vakman_profielen where id = v_id;
  if v is null then return 0; end if;

  if v.bedrijfsnaam is not null then sterkte := sterkte + 10; end if;
  if v.kvk_nummer is not null   then sterkte := sterkte + 10; end if;
  if v.logo_url is not null     then sterkte := sterkte + 20; end if;
  if v.bio is not null           then sterkte := sterkte + 10; end if;
  if v.website is not null       then sterkte := sterkte + 5;  end if;
  if v.verzekerd                 then sterkte := sterkte + 15; end if;
  if v.kvk_geverifieerd          then sterkte := sterkte + 10; end if;
  if array_length(v.specialismes, 1) > 0 then sterkte := sterkte + 5; end if;

  -- Foto's
  if (select count(*) from work_photos where professional_id = v_id) >= 3 then
    sterkte := sterkte + 15;
  end if;

  return least(sterkte, 100);
end;
$$ language plpgsql security definer;

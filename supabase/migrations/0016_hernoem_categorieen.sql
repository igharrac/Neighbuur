-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 2 (batch): categorieen → categories.
-- Alleen de tabel zelf en haar eigen kolommen; categorie_id-kolommen
-- op boekingen/groepskortingen en het categorie_type-enum komen in
-- latere batches (resp. de boekingen-batch en Fase 3).
-- ══════════════════════════════════════════════════════════════

alter table categorieen rename to categories;

alter table categories rename column naam_nl to name_nl;
alter table categories rename column naam_en to name_en;
alter table categories rename column beschrijving_nl to description_nl;
alter table categories rename column beschrijving_en to description_en;
alter table categories rename column afbeelding_url to image_url;
alter table categories rename column icoon to icon;
alter table categories rename column sorteer to sort_order;
alter table categories rename column actief to active;

-- vakman_overzicht (view, SQL-language) verwijst naar categorieen —
-- Postgres herschrijft dit automatisch via OID-tracking, geen actie nodig.
-- Geen plpgsql-functies verwijzen naar deze tabel (gecontroleerd).

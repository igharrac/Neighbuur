-- ══════════════════════════════════════════════════════════════
-- Fase 2, stap 1: group_discounts loskoppelen van de verplichte
-- community_id. Een wijkdeal moet ook kunnen bestaan voor een
-- residential cluster dat nog geen community heeft gevormd — precies
-- dezelfde "community optioneel"-gedachte als de rest van het
-- adres-eerst model.
--
-- community_content_blocks (de per-community pagina-opmaak) blijft
-- bewust ongewijzigd: die blijft community-gebonden, dat is een apart
-- concept (marketing-content voor een bestaande communitypagina). Deze
-- migratie raakt alleen de onderliggende group_discounts-tabel en de
-- /plan-weergave, niet de community-contentblokken.
-- ══════════════════════════════════════════════════════════════

alter table group_discounts
  add column residential_cluster_id uuid references residential_clusters(id);

alter table group_discounts
  alter column community_id drop not null;

alter table group_discounts
  add constraint group_discounts_scope_check
  check (community_id is not null or residential_cluster_id is not null);

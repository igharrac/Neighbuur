-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, laatste restje van Fase 5: de 3 view-namen zelf.
-- Fase 4 (migraties 0031-0033) herbouwde alleen de KOLOMMEN van deze
-- views naar het Engels; de view-namen zelf bleven per ongeluk
-- Nederlands. ALTER VIEW ... RENAME TO is triviaal — het raakt geen
-- kolommen, security_invoker, of RLS, dus geen DROP+CREATE nodig
-- (dat was alleen bij kolomnaam-wijzigingen vereist).
-- ══════════════════════════════════════════════════════════════

alter view review_compleet rename to review_complete;
alter view vakman_overzicht rename to professional_overview;
alter view community_overzicht rename to community_overview;

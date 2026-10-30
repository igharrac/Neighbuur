-- ══════════════════════════════════════════════════════════════
-- Automatische kwaliteitssignalen bij Hermes-concepten (bv. interne
-- links die naar niet-bestaande routes wijzen). Blokkeert niets —
-- toont alleen een waarschuwing in /admin/content vóór goedkeuring,
-- zodat een mens het niet kan missen zoals bij de /keuken-link.
-- ══════════════════════════════════════════════════════════════

alter table blog_posts add column quality_flags jsonb not null default '{}';

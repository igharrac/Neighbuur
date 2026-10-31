-- ══════════════════════════════════════════════════════════════
-- Hermes is voorlopig gepauzeerd (kwaliteitsproblemen in gegenereerde
-- artikelen). Claude Code neemt contentproductie over, rechtstreeks
-- op de database, geen nieuwe API-laag. 'source' moet dat kunnen
-- vastleggen — zie docs/superpowers/specs/2026-10-31-content-engine-
-- claude-authorship-design.md.
-- ══════════════════════════════════════════════════════════════

alter table blog_posts drop constraint blog_posts_source_check;
alter table blog_posts add constraint blog_posts_source_check
  check (source in ('hermes', 'manual', 'claude'));

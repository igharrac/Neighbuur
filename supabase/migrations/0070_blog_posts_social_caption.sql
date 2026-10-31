-- ══════════════════════════════════════════════════════════════
-- Korte, kant-en-klare social-post-tekst per blogartikel — puur tekst,
-- geen afbeeldingen/Buffer-koppeling (dat blijft LATER, zie
-- docs/superpowers/specs/2026-10-31-content-engine-claude-authorship-
-- design.md). Opgeslagen bij de post zodat 'm terugvindbaar is zodra
-- er social-accounts zijn.
-- ══════════════════════════════════════════════════════════════

alter table blog_posts add column social_caption text;

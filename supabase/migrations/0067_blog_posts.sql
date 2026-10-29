-- ══════════════════════════════════════════════════════════════
-- Nieuwe blog-tabel voor de content-engine (Hermes-integratie, zie
-- plan). Bewust één platte tabel, geen block-systeem zoals
-- community_content_blocks — dat zou precies de eigen-CMS-complexiteit
-- zijn die vermeden moet worden. body_html is kant-en-klare, al
-- gesaniteerde HTML (geen losse markdown-renderer nodig), zelfde
-- aanpak als de handgeschreven HTML-strings in emailTemplates.ts.
--
-- public_read is bewust beperkt tot status='published' — concepten
-- (draft/approved) mogen nooit publiek leesbaar zijn, ook niet via de
-- anon-key, vóórdat een admin ze expliciet publiceert.
-- ══════════════════════════════════════════════════════════════

create table blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  excerpt          text,
  body_html        text not null,
  cover_image_url  text,
  status           text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  seo_title        text,
  seo_description  text,
  source           text not null default 'hermes' check (source in ('hermes', 'manual')),
  created_at       timestamptz not null default now(),
  approved_at      timestamptz,
  -- Beoogde publicatiedatum, los van published_at (wanneer het ECHT live
  -- ging) — nodig om concepten/goedgekeurde posts vooruit op de
  -- kalender te kunnen tonen vóórdat ze daadwerkelijk gepubliceerd zijn.
  scheduled_at     timestamptz,
  published_at     timestamptz
);

alter table blog_posts enable row level security;

create policy "public_read_published" on blog_posts
  for select
  using (status = 'published');

create policy "admin_manage" on blog_posts for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Storage-bucket voor coverbeelden — zelfde patroon als auth-photos (0038).
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "admin_manage_blog_images" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'blog-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

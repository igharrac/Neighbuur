-- ══════════════════════════════════════════════════════════════
-- Founder-dashboard: dagelijkse platform-samenvatting. Eén rij per
-- dag, geschreven door de platform-stats cron (service role) — geen
-- live aggregaties op elke dashboard-view, dat schaalt niet naar
-- 1M bewoners / 150k vakmensen. Trends (groei) worden afgeleid door
-- twee rijen te vergelijken, geen aparte delta-kolommen nodig.
-- ══════════════════════════════════════════════════════════════

create table platform_stats_daily (
  id                          uuid primary key default gen_random_uuid(),
  snapshot_date               date not null unique,

  resident_count              int not null default 0,
  professional_count          int not null default 0,
  verified_professional_count int not null default 0,

  active_community_count      int not null default 0,
  dormant_community_count     int not null default 0,
  avg_members_per_community   numeric(10, 2) not null default 0,

  bookings_total               int not null default 0,
  bookings_completed           int not null default 0,
  revenue_total_cents          bigint not null default 0,

  created_at                  timestamptz not null default now()
);

alter table platform_stats_daily enable row level security;

create policy "admin_read" on platform_stats_daily for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

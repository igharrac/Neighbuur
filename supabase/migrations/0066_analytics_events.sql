-- ══════════════════════════════════════════════════════════════
-- Lichte first-party event-tracking voor de nieuwe provider/resident
-- marketingpagina's (geen PostHog/GA-vendor, zie plan). Publiek
-- insert-only, zelfde reden/patroon als resident_interest_signups:
-- iedereen mag een event loggen, niemand mag lezen behalve
-- service_role.
-- ══════════════════════════════════════════════════════════════

create table analytics_events (
  id            uuid primary key default gen_random_uuid(),
  event_name    text not null,
  properties    jsonb not null default '{}',
  session_id    text,
  lang          text,
  path          text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  created_at    timestamptz not null default now()
);

alter table analytics_events enable row level security;

create policy "public_insert" on analytics_events
  for insert
  to anon, authenticated
  with check (true);

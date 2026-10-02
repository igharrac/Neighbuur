-- ══════════════════════════════════════════════════════════════
-- Lichte lead-capture voor de nieuwe /bewoners-pagina: een bewoner
-- die "houd mij op de hoogte" invult, zonder account aan te maken
-- (geen magic-link, geen profiles-rij — dat is bewust een drempel
-- lager dan de volledige onboarding-flow). Publiek insert-only:
-- iedereen mag een rij toevoegen, niemand mag lezen behalve
-- service_role (bypassed RLS, gebruikt vanuit /admin later).
-- ══════════════════════════════════════════════════════════════

create table resident_interest_signups (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  email         text not null,
  postcode      text not null,
  home_plans    text,
  lang          text not null default 'nl',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  created_at    timestamptz not null default now()
);

alter table resident_interest_signups enable row level security;

create policy "public_insert" on resident_interest_signups
  for insert
  to anon, authenticated
  with check (true);

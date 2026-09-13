-- ══════════════════════════════════════════════════════════════
-- Indexen voor het founder-dashboard en de doorzoekbare admin-lijsten.
-- Vandaag ~380 demo-rijen, maar geschreven met 1M bewoners / 150k
-- vakmensen in gedachten: zonder deze indexen wordt elke telling en
-- elke zoekopdracht op die schaal een sequential scan.
-- ══════════════════════════════════════════════════════════════

create extension if not exists pg_trgm;

create index if not exists idx_profiles_role on profiles (role);
create index if not exists idx_profiles_created_at on profiles (created_at);
create index if not exists idx_profiles_name_trgm on profiles using gin (name gin_trgm_ops);

create index if not exists idx_professional_profiles_verified on professional_profiles (verified);
create index if not exists idx_professional_profiles_created_at on professional_profiles (created_at);
create index if not exists idx_professional_profiles_company_name_trgm
  on professional_profiles using gin (company_name gin_trgm_ops);

create index if not exists idx_bookings_status on bookings (status);
create index if not exists idx_bookings_created_at on bookings (created_at);

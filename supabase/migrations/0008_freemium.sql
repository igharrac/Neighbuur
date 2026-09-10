-- ══════════════════════════════════════════════════════════════
-- Freemium-model: premium-velden op vakman_profielen, transacties
-- (voorbereid op het toekomstige commissie-model) en push-
-- subscriptions (voor web push, punt 19+).
-- ══════════════════════════════════════════════════════════════

alter type notificatie_type add value if not exists 'premium';

alter table vakman_profielen add column if not exists is_premium boolean default false;
alter table vakman_profielen add column if not exists premium_tot date;
alter table vakman_profielen add column if not exists stripe_customer_id text;
alter table vakman_profielen add column if not exists aanvragen_deze_maand int default 0;
alter table vakman_profielen add column if not exists aanvragen_limiet int default 5;

create table if not exists transacties (
  id                uuid primary key default uuid_generate_v4(),
  boeking_id        uuid references boekingen(id),
  vakman_id         uuid references vakman_profielen(id),
  klant_id          uuid references profielen(id),
  bedrag_cents      int not null,
  commissie_cents   int default 0,
  status            text default 'pending',
  mollie_payment_id text,
  created_at        timestamptz default now()
);

create table if not exists push_subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profielen(id) on delete cascade,
  subscription  jsonb not null,
  created_at    timestamptz default now(),
  unique(user_id)
);

alter table transacties enable row level security;
alter table push_subscriptions enable row level security;

drop policy if exists "own_read" on transacties;
create policy "own_read" on transacties for select
  using (
    klant_id = auth.uid()
    or vakman_id in (select id from vakman_profielen where user_id = auth.uid())
  );

drop policy if exists "own_read" on push_subscriptions;
create policy "own_read" on push_subscriptions for all using (user_id = auth.uid());

-- Maandelijkse teller resetten (draai als cron, 1e van de maand)
create or replace function reset_maandelijkse_aanvragen()
returns void
language plpgsql
security definer
as $$
begin
  update vakman_profielen set aanvragen_deze_maand = 0;
end;
$$;

-- Atomair de teller ophogen + teruggeven of de vakman nog onder de
-- limiet zit. Premium-vakmensen (of vakmensen zonder limiet) slaan de
-- check over. security definer zodat de klant (die dit aanroept bij
-- het boeken) niet zelf schrijfrechten op vakman_profielen nodig heeft.
create or replace function kan_boeking_aanvragen(p_vakman_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_premium boolean;
  v_premium_tot date;
  v_deze_maand int;
  v_limiet int;
begin
  select is_premium, premium_tot, aanvragen_deze_maand, aanvragen_limiet
  into v_is_premium, v_premium_tot, v_deze_maand, v_limiet
  from vakman_profielen
  where id = p_vakman_id
  for update;

  if not found then
    return false;
  end if;

  if v_is_premium and (v_premium_tot is null or v_premium_tot >= current_date) then
    return true;
  end if;

  if v_deze_maand >= v_limiet then
    return false;
  end if;

  update vakman_profielen set aanvragen_deze_maand = aanvragen_deze_maand + 1 where id = p_vakman_id;
  return true;
end;
$$;

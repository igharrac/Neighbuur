-- ══════════════════════════════════════════════════════════════
-- Fix: RLS was nooit ingeschakeld op categorieen, wijken en
-- groepskortingen in 0001. Hun "public_read" policy bestond al,
-- maar werd niet afgedwongen — zonder RLS mag elke rol (incl. anon)
-- gewoon schrijven. Nu de admin categorieën-editor echt schrijft
-- via de client, moet dit gedicht zijn.
-- ══════════════════════════════════════════════════════════════

alter table categorieen      enable row level security;
alter table wijken           enable row level security;
alter table groepskortingen  enable row level security;

create policy "admin_manage" on categorieen for all
  using (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'));

create policy "admin_manage" on wijken for all
  using (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'));

create policy "admin_manage" on groepskortingen for all
  using (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from profielen where id = auth.uid() and rol = 'admin'));

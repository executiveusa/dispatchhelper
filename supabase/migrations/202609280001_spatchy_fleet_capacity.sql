-- Spatchy fleet capacity: one source of truth for seats per vehicle.
-- Fleet capacity stated by the operator: 27–31 seats per vehicle.
-- Vehicle estimates plan on the smallest vehicle (27) so a quote never under-provisions.
--
-- Access model (unchanged from 202609240002):
--   anon           -> no access to any table (the public page writes only through /api/intake)
--   authenticated  -> only profiles.is_admin = true, via public.is_spatchy_admin()
--   service_role   -> Netlify function /api/intake (bypasses RLS, key never reaches the browser)

-- 0. Dependency guard. add_is_admin_column.sql has no timestamp prefix, so the
--    Supabase CLI skips it; is_spatchy_admin() needs this column to exist.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 1. Fleet-wide capacity (single row).
create table if not exists public.fleet_capacity (
  id boolean primary key default true check (id),           -- enforces exactly one row
  min_seats integer not null check (min_seats > 0),
  max_seats integer not null,
  planning_seats integer not null,
  updated_at timestamptz not null default now(),
  check (max_seats >= min_seats),
  check (planning_seats between min_seats and max_seats)
);

insert into public.fleet_capacity (id, min_seats, max_seats, planning_seats)
values (true, 27, 31, 27)
on conflict (id) do nothing;

-- 2. Optional per-vehicle roster. Left empty on purpose: fill with real units.
create table if not exists public.fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  unit_label text not null unique,                           -- e.g. the fleet number painted on the vehicle
  vehicle_type text not null check (vehicle_type in ('trolley', 'coach', 'other')),
  seats integer not null check (seats between 1 and 80),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists fleet_vehicles_touch_updated_at on public.fleet_vehicles;
create trigger fleet_vehicles_touch_updated_at before update on public.fleet_vehicles
for each row execute function public.touch_updated_at();

drop trigger if exists fleet_capacity_touch_updated_at on public.fleet_capacity;
create trigger fleet_capacity_touch_updated_at before update on public.fleet_capacity
for each row execute function public.touch_updated_at();

-- 3. Server-side estimate. /api/intake calls this instead of trusting the browser's number.
create or replace function public.estimate_vehicles(p_riders integer)
returns table (vehicles integer, planning_seats integer)
language sql
stable
security definer
set search_path = public
as $$
  select greatest(1, ceil(p_riders::numeric / fc.planning_seats))::integer,
         fc.planning_seats
  from public.fleet_capacity fc
  where p_riders > 0;
$$;

revoke all on function public.estimate_vehicles(integer) from public, anon, authenticated;
grant execute on function public.estimate_vehicles(integer) to service_role;

-- 4. Record which seat basis each lead was estimated on, so old leads stay explainable
--    if the planning number changes later.
alter table public.leads add column if not exists seat_basis integer;

-- 5. Tighten lead values. NOT VALID = enforced on new rows, existing rows untouched.
alter table public.leads drop constraint if exists leads_lang_check;
alter table public.leads add constraint leads_lang_check check (lang in ('en', 'es')) not valid;

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'reviewed', 'contacted', 'quoted', 'won', 'lost', 'spam')) not valid;

-- 6. RLS: on, admin-only, no anon path. Table grants revoked as a second lock.
alter table public.fleet_capacity enable row level security;
alter table public.fleet_vehicles enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['fleet_capacity', 'fleet_vehicles']
  loop
    execute format('revoke all on public.%I from anon', t);
    execute format('drop policy if exists spatchy_admin_all on public.%I', t);
    execute format(
      'create policy spatchy_admin_all on public.%I for all to authenticated using (public.is_spatchy_admin()) with check (public.is_spatchy_admin())',
      t
    );
  end loop;
end $$;

-- Existing Spatchy tables: remove any default anon grants. RLS already denies anon;
-- this makes the denial explicit if RLS is ever disabled by mistake.
do $$
declare
  t text;
begin
  foreach t in array array[
    'leads','jobsites','accounts','review_queue','account_tasks',
    'outbound_notifications','outreach_drafts','intake_rate_limits'
  ]
  loop
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- 7. Housekeeping: rate-limit rows older than a day are useless.
create or replace function public.prune_intake_rate_limits()
returns integer
language sql
security definer
set search_path = public
as $$
  with gone as (
    delete from public.intake_rate_limits
    where window_started_at < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from gone;
$$;

revoke all on function public.prune_intake_rate_limits() from public, anon, authenticated;
grant execute on function public.prune_intake_rate_limits() to service_role;

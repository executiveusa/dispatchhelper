-- Crew Shuttle hardening: atomic intake limits, reviewed outreach drafts, admin-only desk access.

create table if not exists public.outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  jobsite_id uuid not null references public.jobsites(id) on delete cascade,
  contact_role text not null default 'superintendent',
  language text not null check (language in ('en','es')),
  subject text not null,
  body text not null,
  status text not null default 'draft',
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists outreach_drafts_jobsite_idx on public.outreach_drafts(jobsite_id, created_at desc);
alter table public.outreach_drafts enable row level security;

create or replace function public.consume_intake_rate_limit(
  p_ip_hash text,
  p_window_started_at timestamptz,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into public.intake_rate_limits(ip_hash, window_started_at, request_count)
  values (p_ip_hash, p_window_started_at, 1)
  on conflict (ip_hash, window_started_at)
  do update set request_count = public.intake_rate_limits.request_count + 1
  returning request_count into current_count;

  return current_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_intake_rate_limit(text, timestamptz, integer) from public;
grant execute on function public.consume_intake_rate_limit(text, timestamptz, integer) to service_role;

create or replace function public.is_spatchy_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

revoke all on function public.is_spatchy_admin() from public;
grant execute on function public.is_spatchy_admin() to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'leads','jobsites','accounts','review_queue','account_tasks','outbound_notifications','outreach_drafts'
  ]
  loop
    execute format('drop policy if exists spatchy_admin_all on public.%I', t);
    execute format(
      'create policy spatchy_admin_all on public.%I for all to authenticated using (public.is_spatchy_admin()) with check (public.is_spatchy_admin())',
      t
    );
  end loop;
end $$;

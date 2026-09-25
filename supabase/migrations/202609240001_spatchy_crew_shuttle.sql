-- Crew Shuttle + Spatchy operational schema
-- Self-hosted Postgres/Supabase compatible. No public policies are granted.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  role text,
  phone text not null,
  email text not null,
  site text not null,
  riders integer not null check (riders > 0),
  target_start date,
  staging_lot text,
  notes text,
  days integer,
  round_trips integer,
  vehicles integer,
  lang text not null default 'en',
  source text,
  page text,
  score numeric,
  score_reason text,
  status text not null default 'new',
  drafted_reply_en text,
  drafted_reply_es text,
  reviewed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobsites (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  address text not null,
  jurisdiction text,
  general_contractor text,
  developer text,
  permit_noc_number text,
  phase text,
  start_date date,
  estimated_completion date,
  source_url text,
  strike_cma_flag boolean not null default false,
  status text not null default 'discovered',
  classification_confidence numeric,
  review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  jobsite_id uuid references public.jobsites(id) on delete set null,
  company text not null,
  daily_rate numeric(12,2) not null check (daily_rate >= 0),
  round_trips integer not null check (round_trips > 0),
  start_date date not null,
  renewal_date date,
  increase_notice_days integer not null default 45,
  termination_notice_days integer not null default 60,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reason text not null,
  payload jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.account_tasks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  task_type text not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.intake_rate_limits (
  ip_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  primary key (ip_hash, window_started_at)
);

create table if not exists public.outbound_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null check (channel in ('email','sms')),
  status text not null default 'pending',
  destination text,
  payload jsonb not null,
  provider_response jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_created_idx on public.leads(status, created_at desc);
create index if not exists jobsites_status_created_idx on public.jobsites(status, created_at desc);
create index if not exists jobsites_jurisdiction_idx on public.jobsites(jurisdiction);
create index if not exists accounts_renewal_idx on public.accounts(status, renewal_date);
create index if not exists account_tasks_due_idx on public.account_tasks(completed_at, due_at);

alter table public.leads enable row level security;
alter table public.jobsites enable row level security;
alter table public.accounts enable row level security;
alter table public.review_queue enable row level security;
alter table public.account_tasks enable row level security;
alter table public.intake_rate_limits enable row level security;
alter table public.outbound_notifications enable row level security;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at before update on public.leads
for each row execute function public.touch_updated_at();

drop trigger if exists jobsites_touch_updated_at on public.jobsites;
create trigger jobsites_touch_updated_at before update on public.jobsites
for each row execute function public.touch_updated_at();

drop trigger if exists accounts_touch_updated_at on public.accounts;
create trigger accounts_touch_updated_at before update on public.accounts
for each row execute function public.touch_updated_at();

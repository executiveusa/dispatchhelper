-- Spatchy flywheel: signals -> outreach -> leads -> accounts -> expansion + proof.
-- Depends on 202609240001, 202609240002, 202609280001.
-- Access model unchanged: anon has nothing; authenticated admins via public.is_spatchy_admin();
-- Netlify functions use service_role.

-- ---------------------------------------------------------------------------
-- 1. Company-name normaliser, used to match a permit's contractor to an account.
--    "Acme Builders, Inc." and "ACME BUILDERS INC" both become "acme builders".
-- ---------------------------------------------------------------------------
create or replace function public.norm_company(p text)
returns text
language sql
immutable
as $$
  select nullif(
    btrim(regexp_replace(
      regexp_replace(
        regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', ' ', 'g'),
        '\m(inc|llc|l l c|corp|corporation|co|company|ltd|lp|llp|pa|pllc|the|and)\M', ' ', 'g'
      ),
      '\s+', ' ', 'g'
    )),
  '');
$$;

-- ---------------------------------------------------------------------------
-- 2. Jobsites: what kind of signal, contact details exactly as the record lists them,
--    and a stable per-jobsite attribution code for ?source= links.
-- ---------------------------------------------------------------------------
alter table public.jobsites add column if not exists signal_type text;
alter table public.jobsites add column if not exists contractor_email text;
alter table public.jobsites add column if not exists contractor_phone text;
alter table public.jobsites add column if not exists score integer;
alter table public.jobsites add column if not exists source_code text;

alter table public.jobsites drop constraint if exists jobsites_signal_type_check;
alter table public.jobsites add constraint jobsites_signal_type_check check (
  signal_type is null or signal_type in
  ('dev_review', 'construction_permit', 'row_parking_permit', 'three_strike_affidavit', 'news', 'manual')
) not valid;

alter table public.jobsites drop constraint if exists jobsites_score_check;
alter table public.jobsites add constraint jobsites_score_check check (score is null or score between 0 and 100) not valid;

create unique index if not exists jobsites_source_code_key on public.jobsites (source_code) where source_code is not null;
create index if not exists jobsites_source_url_idx on public.jobsites (source_url);
create index if not exists jobsites_gc_norm_idx on public.jobsites (public.norm_company(general_contractor));

-- ---------------------------------------------------------------------------
-- 3. Outreach drafts: recipient, sequence step, scheduling, delivery result.
-- ---------------------------------------------------------------------------
alter table public.outreach_drafts add column if not exists to_email text;
alter table public.outreach_drafts add column if not exists sequence_step smallint not null default 1;
alter table public.outreach_drafts add column if not exists parent_draft_id uuid references public.outreach_drafts(id) on delete cascade;
alter table public.outreach_drafts add column if not exists send_after timestamptz;
alter table public.outreach_drafts add column if not exists replied_at timestamptz;
alter table public.outreach_drafts add column if not exists delivery_error text;
alter table public.outreach_drafts add column if not exists provider_response jsonb;

alter table public.outreach_drafts drop constraint if exists outreach_drafts_step_check;
alter table public.outreach_drafts add constraint outreach_drafts_step_check check (sequence_step between 1 and 3) not valid;

alter table public.outreach_drafts drop constraint if exists outreach_drafts_status_check;
alter table public.outreach_drafts add constraint outreach_drafts_status_check check (
  status in ('draft', 'approved', 'sent', 'failed', 'replied', 'superseded', 'skipped_suppressed', 'skipped_no_email')
) not valid;

-- Sending is only possible after a human approves: approved/sent rows must carry approved_at.
alter table public.outreach_drafts drop constraint if exists outreach_drafts_approval_check;
alter table public.outreach_drafts add constraint outreach_drafts_approval_check check (
  status not in ('approved', 'sent') or approved_at is not null
) not valid;

create index if not exists outreach_drafts_status_idx on public.outreach_drafts (status, send_after);
create index if not exists outreach_drafts_to_email_idx on public.outreach_drafts (lower(to_email));
create unique index if not exists outreach_drafts_one_followup_per_step
  on public.outreach_drafts (parent_draft_id, sequence_step) where parent_draft_id is not null;

-- ---------------------------------------------------------------------------
-- 4. Suppression list (CAN-SPAM opt-outs) and an outreach event log.
-- ---------------------------------------------------------------------------
create table if not exists public.suppression_list (
  email text primary key check (email = lower(btrim(email)) and position('@' in email) > 1),
  reason text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_events (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.outreach_drafts(id) on delete set null,
  jobsite_id uuid references public.jobsites(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  email text,
  kind text not null check (kind in ('sent', 'reply', 'stop', 'bounce', 'lead', 'failed')),
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists outreach_events_kind_idx on public.outreach_events (kind, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Attribution: a lead whose source matches a jobsite's source_code is linked back,
--    its pending follow-ups are stopped, and the win is logged.
-- ---------------------------------------------------------------------------
create or replace function public.spatchy_attribute_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  j public.jobsites%rowtype;
begin
  if new.source is null then
    return new;
  end if;

  select * into j from public.jobsites where source_code = new.source limit 1;
  if not found then
    return new;
  end if;

  update public.jobsites
     set lead_id = coalesce(lead_id, new.id), status = 'lead'
   where id = j.id;

  update public.outreach_drafts
     set status = 'superseded'
   where jobsite_id = j.id and status in ('draft', 'approved');

  insert into public.outreach_events (jobsite_id, lead_id, email, kind, payload)
  values (j.id, new.id, new.email, 'lead', jsonb_build_object('source', new.source));

  return new;
end;
$$;

drop trigger if exists leads_attribute_source on public.leads;
create trigger leads_attribute_source after insert on public.leads
for each row execute function public.spatchy_attribute_lead();

-- ---------------------------------------------------------------------------
-- 6. Expansion loop: a new project by a contractor we already work with (or used to)
--    raises a task immediately. One task per account per jobsite.
-- ---------------------------------------------------------------------------
create or replace function public.spatchy_account_watch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.norm_company(new.general_contractor) is null then
    return new;
  end if;

  insert into public.account_tasks (account_id, task_type, due_at, payload)
  select a.id,
         'new_project_alert',
         now(),
         jsonb_build_object(
           'jobsite_id', new.id,
           'address', new.address,
           'general_contractor', new.general_contractor,
           'signal_type', new.signal_type,
           'source_url', new.source_url,
           'account_status', a.status,
           'note', 'Existing or past customer has a new project. Call before they shop around.'
         )
  from public.accounts a
  where public.norm_company(a.company) = public.norm_company(new.general_contractor)
    and not exists (
      select 1 from public.account_tasks t
      where t.account_id = a.id
        and t.task_type = 'new_project_alert'
        and t.payload ->> 'jobsite_id' = new.id::text
    );

  return new;
end;
$$;

drop trigger if exists jobsites_account_watch on public.jobsites;
create trigger jobsites_account_watch
after insert or update of general_contractor on public.jobsites
for each row execute function public.spatchy_account_watch();

-- ---------------------------------------------------------------------------
-- 7. Proof loop: when a contract ends, queue a review request and a case note.
--    Humans send the review request; case notes publish only with customer approval.
-- ---------------------------------------------------------------------------
create or replace function public.spatchy_proof_loop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('ended', 'completed') and old.status is distinct from new.status then
    insert into public.account_tasks (account_id, task_type, due_at, payload)
    select new.id, x.task_type, now() + x.delay, jsonb_build_object('note', x.note)
    from (values
      ('review_request', interval '3 days', 'Ask for a Google review. Human sends it.'),
      ('case_note', interval '7 days', 'Write a short case note from customer-approved facts only. Publish only with their OK.')
    ) as x(task_type, delay, note)
    where not exists (
      select 1 from public.account_tasks t where t.account_id = new.id and t.task_type = x.task_type
    );
  end if;
  return new;
end;
$$;

drop trigger if exists accounts_proof_loop on public.accounts;
create trigger accounts_proof_loop after update of status on public.accounts
for each row execute function public.spatchy_proof_loop();

-- ---------------------------------------------------------------------------
-- 8. Metrics. security_invoker = views obey the caller's RLS (admins only).
-- ---------------------------------------------------------------------------
create or replace view public.leads_by_source_week
with (security_invoker = true) as
select date_trunc('week', l.created_at) as week,
       coalesce(l.source, 'unknown') as source,
       j.signal_type,
       count(*) as leads
from public.leads l
left join public.jobsites j on j.source_code = l.source
group by 1, 2, 3
order by 1 desc, 4 desc;

create or replace view public.flywheel_funnel
with (security_invoker = true) as
select coalesce(j.signal_type, 'unknown') as signal_type,
       count(distinct j.id) as jobsites,
       count(distinct d.jobsite_id) filter (where d.status in ('sent', 'replied')) as contacted,
       count(distinct d.jobsite_id) filter (where d.replied_at is not null) as replied,
       count(distinct j.id) filter (where j.lead_id is not null) as leads,
       count(distinct a.id) as accounts
from public.jobsites j
left join public.outreach_drafts d on d.jobsite_id = j.id
left join public.accounts a on a.jobsite_id = j.id
group by 1;

-- ---------------------------------------------------------------------------
-- 9. RLS and grants for the new objects.
-- ---------------------------------------------------------------------------
alter table public.suppression_list enable row level security;
alter table public.outreach_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['suppression_list', 'outreach_events']
  loop
    execute format('revoke all on public.%I from anon', t);
    execute format('drop policy if exists spatchy_admin_all on public.%I', t);
    execute format(
      'create policy spatchy_admin_all on public.%I for all to authenticated using (public.is_spatchy_admin()) with check (public.is_spatchy_admin())',
      t
    );
  end loop;
end $$;

revoke all on public.leads_by_source_week from anon;
revoke all on public.flywheel_funnel from anon;

revoke all on function public.spatchy_attribute_lead() from public, anon, authenticated;
revoke all on function public.spatchy_account_watch() from public, anon, authenticated;
revoke all on function public.spatchy_proof_loop() from public, anon, authenticated;

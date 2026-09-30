# Crew Shuttle Flywheel — how it works

Owner: Bambu · Operator: Molly's Trolleys / PBTT · Database: self-hosted Supabase · Runtime: Netlify

```
 Town records / feeds ──► jobsites (scored, coded) ──► outreach drafts ──► human approves
          ▲                                                                       │
          │                                                                       ▼
 account watch ◄── accounts ◄── leads (attributed) ◄── page (?source=code) ◄── email sent
          │                                                   ▲                  │
          └──► new_project_alert                       reply / STOP ◄───────────┘
                         proof loop: review_request + case_note when a contract completes
```

## The loops

1. **Acquire.** Each signal (permit, Right-of-Way parking permit, Three-Strike affidavit, dev review, feed row) becomes a `jobsites` row. It gets a score from 0 to 100 and a stable code like `o-3f9c2a1b`, and EN and ES step-1 drafts are written with that code in the link. Nothing sends until a human approves.
2. **Follow up.** After a message is sent, step 2 is queued for +4 business days and step 3 for +6 business days after step 2. Each follow-up is a draft that needs approval, and each is held by `send_after`. A reply, a STOP, or a lead cancels everything pending.
3. **Attribute.** A form submission carrying `?source=o-…` links the lead to its jobsite, marks the jobsite `lead`, and cancels its pending drafts. This is a database trigger, so it works whatever path the lead took.
4. **Expand.** When a new jobsite's contractor matches any account, past or present, a `new_project_alert` task is created immediately. Matching ignores case, punctuation, "&"/"and", and suffixes like Inc/LLC/Co.
5. **Proof.** When an account moves to `completed` or `ended`, `review_request` (+3 days) and `case_note` (+7 days) tasks are created. Humans send the review request; case notes are published only with the customer's OK.

## Where things run

| Piece | File | When |
| --- | --- | --- |
| Records import | `scripts/import-town-records.ts` | When a records-request spreadsheet arrives |
| Feed engine | `netlify/functions/jobsite-lead-engine-scheduled.mts` | Daily 10:17 UTC |
| Sender + follow-up queue | `netlify/functions/outreach-sender-scheduled.mts` | Every 30 min, 13:00–22:30 UTC, Mon–Fri |
| Reply/STOP hook | `netlify/functions/outreach-reply.mts` → `POST /api/outreach-reply` | On each inbound reply |
| Form intake | `netlify/functions/intake.mts` → `POST /api/intake` | On each form submission |
| Renewals / check-ins | `netlify/functions/account-guardrails-scheduled.mts` | Daily 10:47 UTC |
| Approvals (until the desk is ported) | `scripts/drafts.ts` | By hand |
| Triggers, views, RLS | `supabase/migrations/202609290001_spatchy_flywheel.sql` | — |

## Environment variables

| Variable | Needed for | Default / note |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTAKE_RATE_LIMIT_SALT` | Everything | Already set in production |
| `PUBLIC_SITE_URL` | Links in outreach | `https://spatchy.netlify.app/`. Change when the page moves domain |
| `DISPATCH_SMS_WEBHOOK_URL`, `DISPATCH_SMS_TO`, `DISPATCH_EMAIL_WEBHOOK_URL`, `DISPATCH_EMAIL_TO` | New-lead and reply alerts | Unset = no alerts |
| `OUTREACH_SEND_ENABLED` | Real sending | Anything but `true` = dry run |
| `OUTREACH_EMAIL_WEBHOOK_URL` | Real sending | Receives `{to, from, reply_to, subject, text, headers, metadata}` |
| `OUTREACH_FROM`, `OUTREACH_REPLY_TO`, `OUTREACH_UNSUBSCRIBE_MAILTO` | Sender identity | Company decision |
| `OUTREACH_BATCH_LIMIT` | Pace | 25 per run |
| `OUTREACH_INBOUND_SECRET` | Reply hook auth | Required; the hook returns 401 without it |
| `AI_GATEWAY_API_KEY`, `AI_GATEWAY_URL`, `JEV_MODEL` | Jev classification | Unset = every signal goes to `review_queue` |
| `TOWN_PALM_BEACH_PERMITS_URL`, `TOWN_PALM_BEACH_DEV_REVIEW_URL`, `PALM_BEACH_COUNTY_NOC_URL`, `WEST_PALM_BEACH_PERMITS_URL`, `FLORIDA_YIMBY_FEED_URL`, `THE_REAL_DEAL_FEED_URL` | Feeds | Unset = skipped. Each must return a JSON array of `{address, sourceUrl, …}` |
| `SIGNAL_FEED_KEY` | Private feeds | Sent as a Bearer token |

## Daily operation

```bash
export SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=…
npx tsx scripts/import-town-records.ts --file permits.csv --ref <request ref> --signal construction_permit --dry-run   # check the mapping
npx tsx scripts/import-town-records.ts --file permits.csv --ref <request ref> --signal construction_permit
npx tsx scripts/drafts.ts list          # best first; "NO EMAIL" rows need a contact from the record
npx tsx scripts/drafts.ts show <id>
npx tsx scripts/drafts.ts approve <id> …
```

The metrics are `select * from flywheel_funnel;` and `select * from leads_by_source_week;`. Both are admin-only through RLS.

## Safety rails (enforced in code or the database)

- Approval is required: the database rejects `approved` or `sent` without `approved_at`.
- The kill switch is `OUTREACH_SEND_ENABLED`. Anything else means a dry run.
- Suppression is checked before every send and every follow-up. STOP/ALTO/unsubscribe replies add the address automatically.
- Only one language per jobsite per step goes out, even if both were approved.
- Every message carries the company's postal address, phone, opt-out line and tracked link (unit-tested).
- There are no invented facts. Contacts come only from the source record. Jev can't clear a parking flag that came from a record, and without Jev everything goes to human review.
- A re-import only fills fields; a thinner file can't erase data.

## Tests

- `tests/flywheel.test.ts`: 13 unit tests with synthetic fixtures. Run with `npx tsx --test tests/flywheel.test.ts`.
- `tests/e2e.local.ts`: the full-loop harness run against Postgres + PostgREST (see its header). It covers import → engine → approval → dry run → provider failure → send → follow-ups → reply → STOP → attributed lead → proof loop → metrics.

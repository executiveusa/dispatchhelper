# Handoff: Crew Shuttle landing page + Spatchy backend

Owner: Bambu · Operator: Molly's Trolleys / Palm Beach Tours & Transportation (PBTT), West Palm Beach FL
Repo: `executiveusa/dispatchhelper` (currently a freight-dispatch UI; this replaces it)

## What exists

1. `index.html` — finished landing page (frontend done, gauntlet-reviewed). Single file, EN / es-MX toggle, route sizer, quote form.
2. Spatchy lead desk (claude.ai artifact) — in-house console: Leads, Dates (11-trolley capacity), Partners, Rebook, Reputation, Signals, Facts. Port its data model, not its storage.

## Goal

Every jobsite request from the landing page lands in Spatchy within seconds, is scored, and gets a drafted reply for a human to send.
Success metric: jobsite contracts signed. Leading indicators: form submits, minutes to first reply, proposals sent.

## Build, in order

### 1. Intake endpoint
- `POST /api/intake` accepting: `name, company, role, phone, email, site, riders, start, lot, notes, days, roundTrips, vehicles, lang, source, page`.
- Validate server-side, rate-limit, honeypot field, store, return 200.
- Notify dispatch by email + SMS.

### 2. Data model
- `leads` + `jobsites`: address, jurisdiction, general contractor, developer, permit/NOC number, phase, start, estimated completion, source URL, strike/CMA flag, status.
- `accounts`: daily rate, round trips, start, renewal date, notice windows.

### 3. Jobsite lead engine
Priority sources: Town of Palm Beach permits, Palm Beach County recorded Notices of Commencement, West Palm Beach permit portal, Florida YIMBY / The Real Deal.
Classify with Jev via Vercel AI Gateway. Low-confidence rows go to review. Draft EN + ES outreach. Never auto-send.

### 4. Contract generator
Use the On Shore template only. Correct weekly rate math, remove leftover Weitz reference, fix renewal year, remove Association language, and correct typos. Owner attorney reviews legal clauses.

### 5. Account guardrails
Alert 50 days before renewal, monthly check-ins, and fuel surcharge bracket monitoring.

### 6. Port Spatchy
Replace freight UI. Keep Spatchy design tokens/screens. Add Jobsites + Accounts. Self-hosted, single-org auth.

## Rules
No invented customer-facing facts. Mobile-first. Secrets never committed. Human approval before outreach.

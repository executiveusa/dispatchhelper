# Spatchy AI - Intelligent Dispatch Platform

**Spatchy AI** is an AI-native dispatch operating system built for small trucking operators, independent dispatchers, and owner-operators. It automates the entire dispatch workflow using AI agents, from load intake to driver assignment, pricing, and communication.

---

## 🚀 Features

### Core Capabilities
- **AI-Powered Dispatch Agent**: Multi-step reasoning LLM that manages dispatch workflows
- **Automated Load Management**: Create, assign, and track loads in real-time
- **Intelligent Driver Assignment**: Smart matching based on availability, location, and workload
- **Real-time Communication**: Automated broker and driver messaging
- **Multi-Tenant Architecture**: Isolated environments for different dispatch companies
- **Role-Based Access**: Admin, dispatcher, and driver dashboards
- **Analytics Dashboard**: Operational insights and performance metrics

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Backend**: Supabase (Auth, Postgres, RLS, Edge Functions, Realtime)
- **AI Layer**: Supabase Edge Functions with Anthropic/OpenAI integration

---

## 📁 Project Structure

```
spatchy-ai-web/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── sections/        # Landing page sections
│   │   ├── dispatch/        # Dispatch-related components
│   │   └── admin/           # Admin dashboard components
│   ├── pages/               # Route pages
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   ├── lib/                 # Utilities and configurations
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # Helper functions
│   ├── services/            # API and business logic (to be created)
│   └── types/               # TypeScript types (to be created)
├── supabase/                # Supabase project files (to be created)
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
└── public/                  # Static assets

```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Anthropic or OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spatchy-ai-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 🗄️ Database Setup

The Supabase backend includes:

### Tables
- `requests` - Load/dispatch requests
- `drivers` - Driver information and status
- `assignments` - Request-to-driver assignments
- `messages` - Chat and communication logs
- `ai_sessions` - AI conversation sessions
- `tenants` - Multi-tenant organizations
- `tenant_users` - User-tenant relationships
- `profiles` - User profile data

### Edge Functions
- `ai-dispatch` - Multi-agent AI dispatch orchestrator
- `create-request` - Create new dispatch requests
- `assign-driver` - Assign drivers to loads
- `update-status` - Update request status

*Database migrations and edge function code will be created in Phase 2*

---

## 🎨 Branding & Theming

Spatchy AI uses a custom theme based on blue and indigo tones:

- **Primary**: Blue (600, 700, 800)
- **Secondary**: Indigo (900)
- **Accent**: Sky blue highlights
- **Typography**: Monospace for brand, sans-serif for body

Theme configuration is in `src/lib/theme.ts` (to be created).

---

## 🚌 Fleet & Intake

### Fleet capacity
- 3 vehicles x 9-11 seats each (27-31 seats total).
- Planning basis: 27 seats (`fleet_capacity.planning_seat_basis`). Intake quotes vehicles off this basis server-side via `estimate_vehicles(riders)`; the browser never computes vehicle counts.
- 24/7 service.

### Environment variables required by `netlify/functions/intake.mts`
- `SUPABASE_URL` - self-hosted Supabase REST URL (leads insert + RPC). Function returns 503 `service_not_configured` without it.
- `SUPABASE_SERVICE_ROLE_KEY` - service role key (leads insert, `estimate_vehicles` RPC, rate-limit table).
- `INTAKE_RATE_LIMIT_SALT` - salt for rate-limit hashing.
- Optional: `DISPATCH_EMAIL_WEBHOOK_URL`, `DISPATCH_EMAIL_TO`, `DISPATCH_SMS_WEBHOOK_URL`, `DISPATCH_SMS_TO` (lead notifications).
- `jobsite-lead-engine-scheduled.mts` also uses `AI_GATEWAY_API_KEY` / `AI_GATEWAY_URL`.

### Database migrations (apply in order)
1. `supabase/migrations/202609240002_spatchy_hardening.sql` - `is_spatchy_admin()` fix (no is_admin dependency), profiles.is_admin, leads table w/ server-side `vehicles`.
2. `supabase/migrations/202609280001_spatchy_fleet_capacity.sql` - `fleet_capacity` (planning basis 27), `fleet_vehicles` roster, `estimate_vehicles(riders)` RPC (service_role only), `leads.seat_basis`, lang/status CHECKs, admin-only RLS, `prune_intake_rate_limits()`.

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Supabase)
```bash
supabase functions deploy ai-dispatch
```

---

## 📋 Development Phases

This project is being built in phases:

- [x] **Phase 1**: Repo initialization & branding
- [ ] **Phase 2**: Supabase schema & server layer
- [ ] **Phase 3**: Dispatch operations engine
- [ ] **Phase 4**: AI layer enhancement
- [ ] **Phase 5**: UI enhancements & dashboard
- [ ] **Phase 6**: Multi-tenancy scaffolding
- [ ] **Phase 7**: Telephony integration (scaffold)
- [ ] **Phase 8**: Production optimization

---

## 🤝 Contributing

This is a production application for Spatchy AI. For feature requests or bug reports, please contact the development team.

---

## 📄 License

Proprietary - All rights reserved.

---

## 🆘 Support

For support, please contact: support@spatchy.ai

---

**Built with ❤️ for dispatchers who deserve better tools.**

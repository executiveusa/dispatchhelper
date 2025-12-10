# Spatchy AI - Deployment Guide

## Overview

This guide covers deploying Spatchy AI to production, including frontend (Vercel) and backend (Supabase).

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account ([supabase.com](https://supabase.com))
- Vercel account ([vercel.com](https://vercel.com))
- Anthropic API key (for AI features)

---

## 1. Supabase Setup

### Create Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization
4. Set project name: `spatchy-ai-production`
5. Set database password (save securely!)
6. Choose region: `us-east-1` (recommended)
7. Wait for project to be ready (~2 minutes)

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Verify tables were created
# Check in Supabase Dashboard -> Table Editor
```

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy ai-dispatch
supabase functions deploy create-request
supabase functions deploy assign-driver
supabase functions deploy update-status

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-key>
supabase secrets set OPENAI_API_KEY=<your-openai-key>
```

### Get Credentials

From Supabase Dashboard -> Settings -> API:
- Copy `Project URL` → this is `VITE_SUPABASE_URL`
- Copy `anon public` key → this is `VITE_SUPABASE_ANON_KEY`
- Copy `service_role` key → keep secure, only for backend

---

## 2. Frontend Deployment (Vercel)

### Prepare Environment Variables

Create `.env.production`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

#### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `app.spatchy.ai`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (~5 minutes)

---

## 3. Production Checklist

### Security

- [ ] Enable RLS on all tables ✓ (already done)
- [ ] Rotate Supabase service role key if exposed
- [ ] Enable 2FA on Supabase account
- [ ] Enable 2FA on Vercel account
- [ ] Review RLS policies for security
- [ ] Set up API rate limiting in Supabase
- [ ] Configure CORS properly

### Performance

- [ ] Enable Supabase connection pooling
- [ ] Configure Vercel edge caching
- [ ] Optimize images (use WebP)
- [ ] Enable Brotli compression
- [ ] Add proper cache headers
- [ ] Monitor bundle size

### Monitoring

- [ ] Set up Supabase monitoring alerts
- [ ] Configure Vercel analytics
- [ ] Set up error tracking (Sentry)
- [ ] Monitor Edge Function logs
- [ ] Track API usage
- [ ] Set up uptime monitoring

### Backups

- [ ] Enable Supabase automated backups (Pro plan)
- [ ] Export database schema
- [ ] Backup environment variables
- [ ] Document deployment process

---

## 4. Environment Variables

### Frontend (Vercel)

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (Supabase Secrets)

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

---

## 5. Post-Deployment

### Verify Deployment

1. **Test Authentication:**
   - Sign up new user
   - Verify email flow
   - Test login
   - Check profile creation

2. **Test Core Features:**
   - Create dispatch request
   - Create driver
   - Assign driver to request
   - Test AI chat
   - Verify real-time updates

3. **Check Performance:**
   - Run Lighthouse audit (target: 90+)
   - Test mobile responsiveness
   - Check API response times
   - Monitor error rates

### Create First Tenant

```sql
-- Connect to Supabase SQL Editor and run:
INSERT INTO tenants (name, slug) VALUES ('Demo Company', 'demo');

-- Get the tenant ID from the result

-- Add yourself as owner:
INSERT INTO tenant_users (tenant_id, user_id, role)
VALUES (
  '<tenant-id-from-above>',
  '<your-user-id>',
  'owner'
);
```

### Seed Data (Optional)

```sql
-- Create sample driver
INSERT INTO drivers (tenant_id, name, phone, status)
VALUES ('<tenant-id>', 'John Smith', '555-1234', 'available');

-- Create sample request
INSERT INTO requests (
  tenant_id,
  pickup_location,
  dropoff_location,
  status
)
VALUES (
  '<tenant-id>',
  'Dallas, TX',
  'Houston, TX',
  'pending'
);
```

---

## 6. Scaling Considerations

### Database

- **< 1,000 users**: Free tier is fine
- **1,000 - 10,000 users**: Pro plan ($25/mo)
- **10,000+ users**: Enterprise plan

### Edge Functions

- **< 500k invocations/month**: Included in free tier
- **500k - 2M**: Pro plan
- **2M+**: Enterprise plan

### Vercel

- **< 100GB bandwidth/month**: Hobby plan (free)
- **100GB - 1TB**: Pro plan ($20/mo)
- **1TB+**: Enterprise

---

## 7. Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase db push
      - run: supabase functions deploy

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Secrets to Add

In GitHub Settings → Secrets:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 8. Troubleshooting

### Edge Functions Not Working

```bash
# Check function logs
supabase functions logs ai-dispatch

# Test locally
supabase functions serve ai-dispatch

# Verify secrets are set
supabase secrets list
```

### Database Connection Issues

- Check connection pooling settings
- Verify RLS policies
- Check firewall rules
- Review database logs in dashboard

### Frontend Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check for TypeScript errors
npm run type-check
```

---

## 9. Rollback Plan

### Rollback Frontend

```bash
# Vercel automatically keeps previous deployments
# Go to Vercel Dashboard → Deployments → Previous deployment → Promote to Production
```

### Rollback Database

```bash
# If you have Pro plan with PITR:
# Supabase Dashboard → Database → Backups → Restore to point in time

# Otherwise, restore from manual backup:
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## 10. Support

For deployment issues:
- Supabase: [support@supabase.io](mailto:support@supabase.io)
- Vercel: [support@vercel.com](mailto:support@vercel.com)
- Spatchy AI: Create an issue in this repository

---

**Production deployment complete! 🎉**

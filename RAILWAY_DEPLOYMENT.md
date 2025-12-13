# Railway Deployment Guide for Spatchy AI

## Project Information
- **Railway Project ID**: `05b30fc6-af4a-4c19-9cc5-f5c580da751d`
- **GitHub Repo**: `executiveusa/dispatchhelper`
- **Branch**: `claude/setup-autonomous-build-01XT4AwaqxGKGKzZuJc7LJU2`

---

## Quick Deploy Steps

### 1. Link GitHub Repository to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Open project ID: `05b30fc6-af4a-4c19-9cc5-f5c580da751d`
3. Click "New Service" → "GitHub Repo"
4. Select repository: `executiveusa/dispatchhelper`
5. Select branch: `claude/setup-autonomous-build-01XT4AwaqxGKGKzZuJc7LJU2`

### 2. Configure Build Settings

Railway will automatically detect the configuration from:
- `railway.json` - Build and deploy commands
- `nixpacks.toml` - Nixpacks build configuration
- `package.json` - Node.js project metadata

**No additional configuration needed!** Railway will:
- Use Node.js 18
- Run `npm ci` to install dependencies
- Run `npm run build` to build the Vite app
- Run `npm run preview` to serve the app on port specified by `$PORT`

### 3. Add Environment Variables

In Railway dashboard, add these variables:

**Required:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional:**
```
NODE_ENV=production
```

### 4. Deploy

Click "Deploy" button or push to the branch - Railway will automatically:
1. Clone the repository
2. Install dependencies with `npm ci`
3. Build with `npm run build`
4. Start server with `npm run preview`

---

## Build Configuration Details

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml
```toml
[nixpacks]
providers = ["node"]

[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run preview"
```

---

## Monitoring the Build

### View Build Logs

1. Go to Railway Dashboard
2. Click on your service
3. Click "Deployments" tab
4. Click on the latest deployment
5. View real-time build logs

### Common Build Errors & Fixes

#### Error: "npm install failed"
**Solution:** Ensure `package-lock.json` is committed to git

#### Error: "Build failed - TypeScript errors"
**Solution:**
```bash
npm run build
# Fix any TypeScript errors shown
git add .
git commit -m "Fix TypeScript errors"
git push
```

#### Error: "Module not found"
**Solution:** Check that all imports use correct paths with `@/` prefix

#### Error: "Port already in use"
**Solution:** Railway automatically sets `$PORT` - ensure preview command uses it:
```json
"preview": "vite preview --host 0.0.0.0 --port ${PORT:-3000}"
```

---

## Post-Deployment

### 1. Get Deployment URL

After successful deployment, Railway will provide a URL like:
```
https://spatchy-ai-production.up.railway.app
```

### 2. Test the Application

Visit the URL and verify:
- ✅ Landing page loads
- ✅ Authentication works (Supabase)
- ✅ Dashboard is accessible
- ✅ AI chat functions

### 3. Configure Custom Domain (Optional)

1. In Railway Dashboard → Settings → Domains
2. Add custom domain (e.g., `app.spatchy.ai`)
3. Update DNS records as shown
4. Wait for SSL certificate (~5 minutes)

---

## Continuous Deployment

Railway automatically deploys when you push to the configured branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin claude/setup-autonomous-build-01XT4AwaqxGKGKzZuJc7LJU2

# Railway automatically:
# 1. Detects push
# 2. Builds new version
# 3. Deploys if build succeeds
# 4. Routes traffic to new version
```

---

## Rollback Procedure

### Rollback via Dashboard

1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Redeploy"

### Rollback via Git

```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

---

## Environment-Specific Configuration

### Development
```bash
# .env.development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-key
```

### Production (Railway)
Set in Railway Dashboard → Variables:
```
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
```

---

## Scaling

Railway automatically scales based on:
- Memory usage
- CPU usage
- Request volume

### Configure Resources

In Railway Dashboard → Settings → Resources:
- **Memory**: 512MB - 8GB
- **CPU**: Shared - Dedicated
- **Replicas**: 1-10 instances

---

## Cost Estimation

Railway pricing (as of 2025):
- **Starter Plan**: $5/month
  - $5 credit included
  - Pay for usage beyond credit
- **Developer Plan**: $20/month
  - $20 credit included
  - Better resources

Estimated monthly cost for Spatchy AI:
- Small traffic (<10k requests/month): ~$5-10
- Medium traffic (<100k requests/month): ~$20-30
- High traffic (>100k requests/month): ~$50+

---

## Troubleshooting

### Build Stuck

1. Check build logs for errors
2. Verify package.json scripts are correct
3. Ensure all dependencies are in package.json
4. Try manual build locally first

### Deploy Fails After Successful Build

1. Check start command is correct
2. Verify PORT environment variable usage
3. Check application logs for runtime errors
4. Ensure CORS is configured for Railway domain

### Can't Access Supabase

1. Verify environment variables are set
2. Check Supabase project is not paused
3. Verify RLS policies allow access
4. Check network/firewall settings

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Spatchy AI Issues**: https://github.com/executiveusa/dispatchhelper/issues

---

## Next Steps After Deployment

1. ✅ Verify deployment is live
2. ✅ Test all features
3. ✅ Set up custom domain
4. ✅ Configure monitoring/alerts
5. ✅ Set up automated backups
6. ✅ Review and optimize performance
7. ✅ Set up error tracking (Sentry)

---

**Your Spatchy AI deployment is ready! 🚀**

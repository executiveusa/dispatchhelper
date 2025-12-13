# Spatchy AI Monorepo Structure

This project has been converted to a monorepo structure using **pnpm** workspaces and **Turborepo**.

## Structure

```
spatchy-ai/
├── apps/
│   └── web/                 # Main Vite + React application
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
├── packages/                # Shared packages (future)
│   ├── ui/                  # Shared UI components
│   ├── config/              # Shared configs
│   └── types/               # Shared TypeScript types
├── supabase/               # Backend (not in workspace)
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # pnpm workspace definition
├── turbo.json              # Turborepo configuration
└── .npmrc                  # pnpm settings
```

## Commands

### Development

```bash
# Install dependencies (root)
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
cd apps/web && pnpm dev
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && pnpm build
```

### Lint

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd apps/web && pnpm lint
```

### Type Check

```bash
# Type check all packages
pnpm type-check
```

## Turborepo Pipeline

Defined in `turbo.json`:

- `build` - Build all apps/packages
- `dev` - Run development servers
- `lint` - Lint code
- `type-check` - TypeScript type checking
- `preview` - Preview production builds

## Benefits

### 1. **Code Sharing**
Share components, utilities, and types across multiple apps:
```typescript
// In apps/web
import { Button } from '@spatchy/ui';
import type { Driver } from '@spatchy/types';
```

### 2. **Faster Builds**
Turbo caches build outputs and only rebuilds what changed:
```bash
# First build: ~30s
pnpm build

# Second build (no changes): ~1s
pnpm build
```

### 3. **Parallel Execution**
Run tasks in parallel across all packages:
```bash
# Runs lint on all packages simultaneously
pnpm lint
```

### 4. **Dependency Management**
Single `pnpm-lock.yaml` for all packages ensures consistency.

## Railway Deployment

Railway configuration updated for monorepo:

- Build command: `cd apps/web && npm ci && npm run build`
- Start command: `cd apps/web && npm run preview`

See `RAILWAY_DEPLOYMENT.md` for details.

## Adding New Packages

### Create Shared UI Package

```bash
mkdir -p packages/ui
cd packages/ui

# Create package.json
cat > package.json << EOF
{
  "name": "@spatchy/ui",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.3.1"
  }
}
EOF

# Create source
mkdir src
echo "export { Button } from './Button';" > src/index.ts
```

### Use in Web App

```bash
cd apps/web

# Add dependency
pnpm add @spatchy/ui
```

```typescript
// In apps/web/src/App.tsx
import { Button } from '@spatchy/ui';
```

## Migration Notes

### What Changed

1. **File Structure**
   - Main app moved to `apps/web/`
   - Root now contains workspace config

2. **Package Names**
   - `spatchy-ai-web` → `@spatchy/web`

3. **Scripts**
   - Root scripts use Turborepo
   - Individual package scripts unchanged

### What Stayed the Same

- All source code (`src/`) unchanged
- Import paths (`@/`) still work
- Build output still goes to `dist/`
- Supabase structure unchanged

## Development Workflow

### Working on Web App

```bash
# Option 1: From root
pnpm dev

# Option 2: From app directory
cd apps/web
pnpm dev
```

### Adding Dependencies

```bash
# Add to specific app
cd apps/web
pnpm add lucide-react

# Add to workspace root (dev tools)
pnpm add -w -D turbo
```

### Creating New App

```bash
# Create new app (e.g., mobile)
mkdir -p apps/mobile
cd apps/mobile
pnpm init

# It will automatically be part of the workspace
```

## Troubleshooting

### Build Fails

```bash
# Clear turbo cache
rm -rf .turbo

# Clear node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstall
pnpm install
```

### Imports Not Working

```bash
# Rebuild all packages
pnpm build

# Check TypeScript paths in tsconfig.json
```

### Turbo Not Found

```bash
# Install turbo globally (optional)
pnpm add -g turbo

# Or use pnpm turbo
pnpm turbo run build
```

## Future Enhancements

### Planned Packages

- `@spatchy/ui` - Shared UI components
- `@spatchy/types` - Shared TypeScript types
- `@spatchy/config` - Shared ESLint/TS configs
- `@spatchy/utils` - Shared utilities
- `@spatchy/supabase-types` - Generated Supabase types

### Planned Apps

- `apps/mobile` - React Native mobile app
- `apps/admin` - Admin dashboard
- `apps/docs` - Documentation site

## Resources

- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Turborepo**: https://turbo.build/repo/docs
- **Monorepo Guide**: https://turbo.build/repo/docs/handbook

---

**The monorepo structure is ready for scale! 🚀**

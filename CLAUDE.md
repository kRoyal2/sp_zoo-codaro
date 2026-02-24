# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start both Next.js frontend and Convex backend in parallel
npm run dev:frontend # Next.js dev server only
npm run dev:backend  # Convex backend dev server only
npm run build        # Build Next.js for production
npm run lint         # ESLint (ignores convex/_generated/**)
```

Note: `predev` automatically runs Convex setup and database seeding before `dev` starts.

## Architecture

**FlowDesk** is a full-stack CRM/sales management SaaS built as a monolith:

- **Frontend**: Next.js 16 (App Router) + React 19 in `/app/` — page-per-feature routing (contacts, deals, tasks, analytics, automations, settings, onboarding, pipeline)
- **Backend**: Convex in `/convex/` — file-based function routing, real-time database, serverless functions
- **Auth**: Convex Auth with password provider, wired in `components/ConvexClientProvider.tsx` and `convex/auth.ts`
- **UI**: Shadcn/UI components in `components/ui/`, TailwindCSS 4
- **Config**: `lib/config.ts` holds workspace-level constants — `WORKSPACE_CONTEXT` defines labels (`contactLabel`, `dealLabel`), pipeline stages, and currency, allowing the app to be rebranded per industry (Sales, HR, Healthcare, etc.)

### Convex backend structure

Each domain is a single file under `convex/`: `contacts.ts`, `deals.ts`, `tasks.ts`, `analytics.ts`, `automations.ts`, `onboarding.ts`, `workspaces.ts`, `settings.ts`. Public functions use `query`/`mutation`/`action`; private server-only functions use `internalQuery`/`internalMutation`/`internalAction`. Never edit `convex/_generated/`.

Database schema is defined in `convex/schema.ts`. The main tables are: `users`, `organizations`, `contacts`, `deals`, `tasks`, `onboarding_clients`, `onboarding_templates`, `analytics_events`, `automations`, `workers`, `managerPasswords`, `settings`.

### Data flow

React components call Convex hooks (`useQuery`, `useMutation`) which hit the Convex cloud over WebSocket. Convex provides optimistic updates and real-time syncing automatically. Server components can use `preloadQuery` for SSR (see `app/server/` for an example).

## Convex function rules

Always use the new function syntax with explicit `args` and `returns` validators:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const f = query({
  args: { id: v.id("contacts") },
  returns: v.null(),
  handler: async (ctx, args) => { return null; },
});
```

Key rules:
- Always include both `args` and `returns` validators on every function
- Use `v.null()` (not `undefined`) when a function returns nothing
- Use `internalQuery`/`internalMutation`/`internalAction` for private functions; never expose sensitive logic as public `query`/`mutation`
- Use `withIndex` instead of `filter` for all queries — never use `.filter()` on db queries
- Use `ctx.db.patch` for partial updates, `ctx.db.replace` for full document replacement
- Actions that use Node.js built-ins must start with `"use node";` and cannot access `ctx.db`
- Crons: only use `crons.interval` or `crons.cron` (not `.hourly`/`.daily`/`.weekly`)
- Index names must include all fields: e.g. `["field1", "field2"]` → `"by_field1_and_field2"`
- HTTP endpoints go in `convex/http.ts` using `httpAction`
- `v.bigint()` is deprecated — use `v.int64()`
- Function references: use `api.filename.functionName` for public, `internal.filename.functionName` for private

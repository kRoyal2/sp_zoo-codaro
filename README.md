# CoreStack

Full-stack CRM/operations platform. Built with **Next.js 16**, **Convex** (backend + DB), and **Convex Auth**.

What's inside:
- **Landing page** — marketing site at `/`
- **Dashboard** — full CRM app (contacts, deals, tasks, analytics, onboarding, automations) behind auth
- **Convex backend** — real-time database, queries, mutations, seeded demo data

---

## Quick commands

```bash
make init   # first-time setup (install + Convex project + auth config)
make dev    # daily development
make seed   # populate DB with demo data
make build  # production build
make help   # full list of commands
```

---

## First-time setup

**Prerequisites:** Node.js 18+, a free [Convex account](https://dashboard.convex.dev)

```bash
make init
make dev
```

On first run, `predev` will:
1. Connect to Convex Cloud and create a project (you'll be prompted to log in if needed)
2. Run `npx @convex-dev/auth` to configure the JWT secret for auth
3. Seed the database with demo contacts, deals, and tasks
4. Open the Convex dashboard in your browser

After that, the app starts at `http://localhost:3000`.

---

## Running

```bash
make dev        # frontend + backend together (recommended)
make dev-front  # Next.js only (port 3000)
make dev-back   # Convex only
```

---

## Where to look

| URL | What's there |
|-----|-------------|
| `http://localhost:3000` | Landing page (CoreStack marketing site) |
| `http://localhost:3000/signin` | Sign up / log in |
| `http://localhost:3000/dashboard` | Main CRM dashboard (requires auth) |
| `http://localhost:3000/contacts` | Contacts & pipeline |
| `http://localhost:3000/deals` | Deals |
| `http://localhost:3000/tasks` | Tasks |
| `http://localhost:3000/analytics` | Analytics |
| `http://localhost:3000/onboarding` | Client onboarding |
| Convex dashboard | `npx convex dashboard` or via the link printed on first `dev` run |

---

## Config

`lib/config.ts` — swap `WORKSPACE_CONTEXT` to rebrand for a different industry:

```ts
industry: "Sales"  // or: HR | Healthcare | RealEstate | Education | Agency
```

This changes labels throughout the app (Contact → Candidate, Deal → Application, etc.).

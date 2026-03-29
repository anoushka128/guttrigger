# GutTrigger

A mobile-first web app that helps you identify which foods are causing digestive discomfort, gut issues, or allergic-type reactions.

## Features

- **Meal logging** — 3 levels: quick title, foods, or full ingredient breakdown
- **Symptom logging** — severity 1–10, categories, onset timing, linked meals
- **Daily check-in** — energy, sleep, stress, bowel movement
- **Trigger analysis engine** — scores foods by exposure count, symptom frequency, severity, and time-lag
- **Insights page** — charts, trend analysis, AI-style plain-English summaries
- **Timeline view** — chronological feed of meals, symptoms, and check-ins
- **Onboarding flow** — goal, tracked symptoms, known allergies, dietary restrictions
- **Medical safety** — severe symptom alerts + persistent disclaimers

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + Prisma 7 |
| DB Adapter | `@prisma/adapter-pg` |
| Charts | Recharts |
| Deployment | Vercel |

---

## Local setup

### 1. Clone and install

```bash
cd guttrigger
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database** and copy the **Connection string (URI)** → `DATABASE_URL`
   - Use the "Transaction" pooler URL if on Vercel (port 6543)
   - Use the direct URL for migrations/seed (port 5432)

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
DATABASE_URL=postgresql://postgres.xxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Generate Prisma client

```bash
npm run db:generate
```

### 6. (Optional) Seed with demo data

First create a user in Supabase Auth with email `demo@guttrigger.com`, then:

```bash
npm run db:seed
```

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema overview

```
User ─────┬─ UserProfile       (onboarding preferences)
          ├─ Meal[]             (logged meals)
          │    └─ MealFood[]
          │         └─ MealIngredient[]
          ├─ Symptom[]          (logged symptoms, linked to meals)
          ├─ CheckIn[]          (daily check-ins)
          ├─ Reminder[]         (notification settings)
          └─ AnalysisResult[]   (computed trigger scores per food)
```

---

## Trigger scoring algorithm

For each food item ever logged, the engine calculates:

| Factor | Weight |
|---|---|
| Exposure count (saturates at 5) | 30% |
| Symptom consistency (occurrences / exposures) | 40% |
| Average symptom severity | 30% |

**Suspicion levels:**

| Level | Criteria |
|---|---|
| `high` | consistency ≥ 70% AND avg severity ≥ 5 |
| `moderate` | consistency ≥ 50% AND avg severity ≥ 3 |
| `low` | consistency ≥ 30% OR avg severity ≥ 2 |
| `probably_safe` | ≥ 3 exposures, 0 symptoms |
| `insufficient_data` | < 2 exposures |

Symptoms are linked to meals both explicitly (user-linked) and via **6-hour time-window correlation**. The engine runs automatically after each new symptom is saved, and can be triggered manually from the Insights page.

---

## Page structure

```
/                   → redirects to /dashboard or /login
/login              → email + password sign in
/signup             → create account → /onboarding
/onboarding         → 6-step setup wizard

/dashboard          → today's summary, quick actions, trigger cards
/log                → quick-log hub (meal / symptom / check-in)
/log-meal           → 3-level meal logging form
/log-symptom        → symptom form with severity, categories, onset
/check-in           → daily check-in (energy, sleep, BM, mood)
/insights           → charts, trigger foods, AI summaries, trend data
/timeline           → chronological feed of all entries
/settings           → profile, tracked symptoms, reminders, sign out
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/guttrigger.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Deploy

### 3. Push schema to production database

```bash
DATABASE_URL="your-production-direct-db-url" npm run db:push
```

---

## Future improvement ideas

1. **Food autocomplete** — connect to Open Food Facts or USDA API
2. **Photo meal logging** — capture a photo; use AI vision to suggest food items
3. **Elimination phase mode** — guided elimination of top suspect foods
4. **Reintroduction experiment mode** — structured 3-day reintroduction protocol
5. **PDF export** — generate a full trigger report to share with a doctor
6. **Ingredient category tagging** — auto-tag dairy, gluten, allium, legumes, etc.
7. **Push notifications** — meal reminders via browser Push API or email (Resend)
8. **AI integration** — send data to Claude API for richer, personalised analysis
9. **Symptom pattern calendar** — monthly heatmap view of symptom severity
10. **Multi-food meal analysis** — detect which ingredient in a complex meal is the trigger

---

## Medical disclaimer

GutTrigger is a personal tracking tool, **not** a medical diagnosis tool. It does not provide medical advice. If you experience severe allergic reactions (throat tightness, difficulty breathing, facial swelling), seek emergency medical attention immediately.

# AI Code Error Solver (React + Bootstrap + Supabase)

Paste code + an error message, get an AI-generated root cause, fix, and best
practices. Fully static frontend — deployable on GitHub Pages — backed by
Supabase for auth/database and a Supabase Edge Function for the AI call.

## Stack
- React 18 + Vite + TypeScript
- Bootstrap 5 + Bootstrap Icons
- Zustand, React Query, React Router, Framer Motion, Monaco Editor
- Supabase (Auth, Postgres, Edge Functions)

## Setup

1. Create a free project at https://supabase.com.
2. In the SQL editor, run `supabase/migrations/001_init.sql`.
3. Deploy the AI edge function (needs the Supabase CLI):
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy solve-error
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
4. Copy `.env.example` to `.env` and fill in your Supabase URL + anon key
   (Project Settings → API).
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploy to GitHub Pages

1. In `vite.config.ts`, set `base` to `/your-repo-name/`.
2. Push to GitHub, then in the repo: **Settings → Pages → Source → GitHub
   Actions**.
3. Add repo secrets **Settings → Secrets and variables → Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys
   automatically.

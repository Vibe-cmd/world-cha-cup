# World Cha Cup

React SPA for FIFA World Cup group predictions with Supabase Google OAuth, neubrutalist theming, prediction boards, highlights, and team-focused views.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   VITE_API_FOOTBALL_KEY=your-api-football-key
   VITE_FOOTBALL_DATA_API_KEY=your-football-data-key
   API_FOOTBALL_KEY=your-api-football-key
   FOOTBALL_DATA_API_KEY=your-football-data-key
   VITE_ADMIN_PIN=2026
   ```
3. In Supabase, enable Google Auth and add your app URL to the redirect allow list.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Start the app:
   ```bash
   npm run dev
   ```

## Google OAuth Notes

- Google authorized JavaScript origin: `http://localhost:5173`
- Google authorized redirect URI: your Supabase callback URL from Auth → Providers → Google.
- Supabase redirect URL for local dev: `http://localhost:5173`

## Assets

- Add country flag/team images to `public/teams/`.
- Add avatar sprites to `public/avatars/`, then register them in `src/data/avatars.js`.

## Match Data

Fixtures, scores, teams, and standings are fetched through `src/hooks/useFootballData.js`.

- Primary provider: API-Football (`src/services/apiFootball.js`)
- Backup provider: football-data.org (`src/services/footballData.js`)
- Cache layers: in-memory, `localStorage`, and Supabase `api_cache`

Run `supabase/schema.sql` after pulling these changes so the long-term API cache table exists.

## Vercel Notes

- Vite variables are embedded at build time, so after editing env vars in Vercel you must redeploy.
- Required client-side Supabase vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Required serverless API vars: `API_FOOTBALL_KEY`, `FOOTBALL_DATA_API_KEY`.
- The app calls `/api/api-football/*` first and `/api/football-data/*` as backup, so sports API keys are not exposed in browser code.

# CuasarX Longevity By Keel

AI-powered longevity and performance marketplace: personalized supplement
commerce, biomarker tracking, telemedicine video visits, a live voice
receptionist ("Quasar Keel"), and a consent-first privacy center.

**Stack:** React 19 + TypeScript + Vite · Tailwind v4 · Supabase (auth, Postgres,
RLS) · Vercel (hosting + serverless functions) · Gemini (coach/research) ·
Daily.co (video) · VoiceLayer (voice layer).

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run lint       # type-check (tsc --noEmit)
```

Environment variables live in `.env.local` (gitignored) — see `.env.example`.
`VITE_`-prefixed variables are public (browser); everything else is server-side
only (Vercel functions, scripts, CI).

## Architecture

- `src/` — React SPA (marketplace, subscriptions, biomarkers, telemedicine,
  consent center, insights, voice receptionist)
- `api/` — Vercel serverless functions (AI coach, research briefs, video rooms,
  error alerts, guest sign-in). All spend endpoints require a Supabase JWT.
- `supabase/migrations/` — ordered, idempotent SQL migrations (apply with
  `SUPABASE_DB_PASSWORD=… npx tsx scripts/sync-db.mjs`)
- `scripts/` — DB sync + Jev route audit
- `.github/workflows/jev-monitor.yml` — scheduled error auditing

## Agent rules

See [AGENTS.md](AGENTS.md) — mandatory review, quality, and verification rules
for any agent working in this repository.

## Status

Closed MVP for invited testers. Payments are simulated (`test_simulated`);
do not collect real patient data until the compliance review is complete.

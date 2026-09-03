/**
 * GET /api/env-check — deployment diagnostics.
 * Reports WHICH environment variable names are present in this deployment.
 * Never returns values — presence booleans only. Safe to expose.
 */
export default async function handler(req, res) {
  const names = [
    'GEMINI_API_KEY',
    'DAILY_API_KEY',
    'SUPABASE_DB_PASSWORD',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
  ];
  const seen = {};
  for (const name of names) {
    // A variable that exists but is empty still counts as a problem, so we
    // report present + non-empty separately.
    seen[name] = { present: name in process.env, nonEmpty: Boolean(process.env[name]) };
  }
  res.status(200).json({
    deployment: 'production',
    checkedAt: new Date().toISOString(),
    variables: seen,
  });
}

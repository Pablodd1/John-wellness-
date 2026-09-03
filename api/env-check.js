/**
 * GET /api/env-check — deployment diagnostics.
 * Reports WHICH environment variable names are present in this deployment.
 * Never returns values — presence booleans only. Safe to expose.
 * Add ?test=gemini to also probe the Gemini API with the server-side key
 * and return the upstream status + error message (no key material).
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

  const payload = {
    deployment: 'production',
    checkedAt: new Date().toISOString(),
    variables: seen,
  };

  if (req.query.test === 'gemini') {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      payload.geminiProbe = { ok: false, reason: 'key missing' };
    } else {
      try {
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
          { method: 'GET' }
        );
        const body = await upstream.json().catch(() => ({}));
        payload.geminiProbe = {
          ok: upstream.ok,
          httpStatus: upstream.status,
          modelsAvailable: Array.isArray(body?.models) ? body.models.map((m) => m.name).filter((n) => n.includes('flash')).slice(0, 8) : undefined,
          error: upstream.ok ? undefined : (body?.error?.message ?? 'unknown upstream error'),
        };
      } catch (e) {
        payload.geminiProbe = { ok: false, reason: String(e).slice(0, 200) };
      }
    }
  }

  res.status(200).json(payload);
}

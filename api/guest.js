/**
 * Vercel serverless function: POST /api/guest
 *
 * 1-click guest sign-in WITHOUT shipping credentials in the client bundle.
 * The shared guest account's email/password live in server-side env vars:
 *   GUEST_LOGIN_EMAIL / GUEST_LOGIN_PASSWORD
 *
 * Returns the Supabase session tokens; the client sets them via
 * supabase.auth.setSession(). 501 when not configured — then the host should
 * enable Supabase anonymous sign-ins instead (per-tester isolation).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const email = process.env.GUEST_LOGIN_EMAIL;
  const password = process.env.GUEST_LOGIN_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!email || !password || !supabaseUrl || !anonKey) {
    res.status(501).json({
      error: 'GUEST_NOT_CONFIGURED',
      message: 'Set GUEST_LOGIN_EMAIL/GUEST_LOGIN_PASSWORD (or enable Supabase anonymous sign-ins) to use guest mode.',
    });
    return;
  }

  try {
    const upstream = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ email, password }),
    });
    if (!upstream.ok) {
      res.status(502).json({ error: 'GUEST_AUTH_FAILED' });
      return;
    }
    const data = await upstream.json();
    if (!data?.access_token || !data?.refresh_token) {
      res.status(502).json({ error: 'GUEST_NO_SESSION' });
      return;
    }
    res.status(200).json({
      session: { access_token: data.access_token, refresh_token: data.refresh_token },
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  } catch {
    res.status(502).json({ error: 'GUEST_UPSTREAM_ERROR' });
  }
}

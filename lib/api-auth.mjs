/**
 * Shared auth gate for API routes that cost money or touch third parties.
 * Verifies the caller's Supabase JWT; anonymous callers are rejected.
 */
export async function requireUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: key },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? { id: u.id, email: u.email ?? null } : null;
  } catch {
    return null;
  }
}

export function unauthorized(res) {
  res.status(401).json({
    error: 'UNAUTHENTICATED',
    message: 'Sign in to use this feature.',
  });
}

/**
 * Vercel serverless function: GET|POST /api/okcapsule
 *
 * Integration with the OK Capsule personalized-pack fulfillment API
 * (docs.okcapsule.app — base https://na1-prod.okcapsule.app, OAuth token flow).
 *
 * OK Capsule manufactures sealed daily pouches keyed by time of administration
 * (Morning / Midday / Evening) — the physical counterpart of the MY AM / MY
 * MID / MY PM KEEL packs shown in the app.
 *
 * Server-side env (all optional until onboarding completes):
 *   OKCAPSULE_API_BASE   (default https://na1-prod.okcapsule.app)
 *   OKCAPSULE_USERNAME   OKCAPSULE_PASSWORD     (token credentials)
 *   OKCAPSULE_TTL_MS     token cache TTL (default 20h; token lasts 24h)
 *
 * GET  ?action=products → { ok, source: 'live'|'demo', products: [...] }
 * GET  ?action=status   → { ok, configured: bool }
 * POST { action: 'order', consumer, shippingAddress, packs: [{ slot, label, duration, contents:[{client_product_id, serving_size}] }] }
 *      → creates one order with one order_line per slot; pouch.custom_label
 *        carries "MY AM KEEL" / "MY MID KEEL" / "MY PM KEEL".
 *
 * Without credentials every action degrades to an honest demo-mode response —
 * the UI composes packs locally and no order leaves the building.
 */

const BASE = process.env.OKCAPSULE_API_BASE || 'https://na1-prod.okcapsule.app';

// Slot → platform-supported time_of_administration values
// (docs: "Common values: Morning, Midday, Evening")
const TOA = { am: 'Morning', mid: 'Midday', pm: 'Evening' };

let tokenCache = { token: null, expiresAt: 0 };

async function accessToken() {
  const { OKCAPSULE_USERNAME: u, OKCAPSULE_PASSWORD: p } = process.env;
  if (!u || !p) return null;
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token;
  const r = await fetch(`${BASE}/v2/authentication/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: u, password: p }),
  });
  if (!r.ok) return null;
  const body = await r.json().catch(() => null);
  const token = body?.access_token;
  if (!token) return null;
  // refresh proactively at 80% of the 24h TTL, per docs best practice
  const ttl = Number(body?.expires_in || 86400) * 1000;
  tokenCache = { token, expiresAt: Date.now() + Math.min(ttl * 0.8, ttl - 60_000) };
  return token;
}

async function okc(path, opts = {}, token) {
  const t = token || (await accessToken());
  if (!t) return { ok: false, status: 501, body: { error: 'OKCAPSULE_NOT_CONFIGURED' } };
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
      ...(opts.headers || {}),
    },
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}

function unauthorized(res) {
  res.status(401).json({ error: 'sign_in_required' });
}

async function requireUser(req) {
  const auth = req.headers?.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    const { data } = await sb.auth.getUser(auth.slice(7));
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const user = await requireUser(req);
  if (!user) { unauthorized(res); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = (req.query?.action || body.action || '').toString();

  // ---- status: is the integration live? ----
  if (req.method === 'GET' && action === 'status') {
    const configured = Boolean(process.env.OKCAPSULE_USERNAME && process.env.OKCAPSULE_PASSWORD);
    res.status(200).json({ ok: true, configured, mode: configured ? 'live' : 'demo' });
    return;
  }

  // ---- products: the brand's client product catalog ----
  if (req.method === 'GET' && action === 'products') {
    const r = await okc('/v2/products');
    if (!r.ok) {
      res.status(200).json({ ok: false, source: 'demo', products: [], error: r.body?.error || 'fetch_failed' });
      return;
    }
    const products = (r.body?.client_products || []).map((p) => ({
      id: p.id,
      name: p.product_name,
      active: p.active,
      servingSize: p.serving_size,
    }));
    res.status(200).json({ ok: true, source: 'live', products });
    return;
  }

  // ---- order: create the physical AM/MID/PM pack shipment ----
  if (req.method === 'POST' && action === 'order') {
    const { consumer = {}, shippingAddress = {}, packs = [] } = body;
    if (!packs.length) { res.status(400).json({ error: 'no_packs' }); return; }

    const order_lines = packs
      .filter((p) => TOA[p.slot] && Array.isArray(p.contents) && p.contents.length)
      .map((p) => ({
        name: p.label || `MY ${p.slot.toUpperCase()} KEEL`,
        duration: Math.min(60, Math.max(1, Number(p.duration) || 30)),
        pouches: [{
          time_of_administration: TOA[p.slot],
          custom_label: (p.label || `MY ${p.slot.toUpperCase()} KEEL`).slice(0, 30),
          contents: p.contents.slice(0, 8).map((c) => ({
            client_product_id: c.client_product_id,
            ...(c.serving_size ? { serving_size: c.serving_size } : {}),
          })),
        }],
      }));

    if (!order_lines.length) { res.status(400).json({ error: 'invalid_packs' }); return; }

    const payload = {
      consumer: {
        first_name: String(consumer.firstName || '').slice(0, 60),
        last_name: String(consumer.lastName || '').slice(0, 60),
        ...(consumer.email ? { email: String(consumer.email).slice(0, 100) } : {}),
      },
      shipping_address: {
        address1: shippingAddress.address1,
        city: shippingAddress.city,
        province_name: shippingAddress.province,
        country_name: shippingAddress.country || 'United States',
        postal_code: shippingAddress.postalCode,
      },
      order_lines,
      source: 'cuasarx-platform',
    };

    if (!payload.consumer.first_name || !payload.consumer.last_name ||
        !payload.shipping_address.address1 || !payload.shipping_address.city) {
      res.status(400).json({ error: 'missing_consumer_or_address' });
      return;
    }

    const r = await okc('/v2/orders', { method: 'POST', body: JSON.stringify(payload) });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: r.body?.error || 'order_failed', detail: r.body });
      return;
    }
    res.status(200).json({ ok: true, order: { id: r.body?.order?.id, status: r.body?.order?.status || 'Pending' } });
    return;
  }

  res.status(404).json({ error: 'unknown_action' });
}

/**
 * Vercel serverless function: GET|POST /api/supliful
 *
 * Admin-gated integration with the Supliful white-label fulfillment API
 * (developers.supliful.com). SUPLIFUL_API_KEY lives server-side only.
 *
 * GET  ?action=catalog            → syncs the Supliful catalog into supplier_products
 * GET  ?action=status&id=<uuid>   → fetches live fulfillment status for a supplier order
 * POST { action: 'forward', orderId } → forwards a stored order's supplier lines to Supliful
 *
 * All actions require a signed-in admin session (any signed-in user during MVP;
 * role-gate before public launch).
 */
import { createClient } from '@supabase/supabase-js';
import { requireUser, unauthorized } from '../lib/api-auth.mjs';

const BASE = process.env.SUPLIFUL_API_BASE || 'https://api.supliful.com';

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function supliful(path, opts = {}) {
  const key = process.env.SUPLIFUL_API_KEY;
  if (!key) return { ok: false, status: 501, body: { error: 'SUPLIFUL_NOT_CONFIGURED' } };
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...(opts.headers || {}) },
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}

export default async function handler(req, res) {
  const user = await requireUser(req);
  if (!user) { unauthorized(res); return; }

  const db = serviceClient();
  if (!db) { res.status(501).json({ error: 'SERVICE_KEY_NOT_CONFIGURED' }); return; }

  try {
    // ── catalog sync ──
    if (req.method === 'GET' && req.query.action === 'catalog') {
      let all = [];
      let cursor = null;
      for (let page = 0; page < 10; page++) {
        const q = cursor ? `?limit=100&nextCursor=${encodeURIComponent(cursor)}` : '?limit=100';
        const r = await supliful(`/v1/products${q}`);
        if (!r.ok) { res.status(502).json({ error: 'SUPLIFUL_ERROR', detail: r.body }); return; }
        const b = r.body;
        const items = b?.products ?? b?.items ?? [];
        all = all.concat(items);
        cursor = b?.nextCursor;
        if (!cursor || items.length === 0) break;
      }
      for (const item of all) {
        await db.from('supplier_products').upsert({
          supliful_id: String(item.id ?? item.productId),
          name: item.name ?? 'Unnamed product',
          sku: item.sku ?? null,
          category: item.category ?? null,
          cost: item.price != null ? Number(item.price) : null,
          retail_price: item.retailPrice != null ? Number(item.retailPrice) : null,
          image_url: item.image ?? item.imageUrl ?? null,
          in_stock: item.inStock !== false,
          offered: false,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'supliful_id' });
      }
      const { count } = await db.from('supplier_products').select('*', { count: 'exact', head: true });
      res.status(200).json({ synced: all.length, totalInTable: count });
      return;
    }

    // ── live fulfillment status ──
    if (req.method === 'GET' && req.query.action === 'status' && req.query.id) {
      const r = await supliful(`/v1/orders/${encodeURIComponent(req.query.id)}`);
      res.status(r.ok ? 200 : 502).json(r.body);
      return;
    }

    // ── forward a stored order's supplier lines to Supliful ──
    if (req.method === 'POST' && req.body?.action === 'forward') {
      const orderId = String(req.body.orderId ?? '');
      if (!/^[0-9a-f-]{36}$/i.test(orderId)) { res.status(400).json({ error: 'INVALID_ORDER_ID' }); return; }

      const { data: order } = await db.from('orders').select('*').eq('id', orderId).single();
      if (!order) { res.status(404).json({ error: 'ORDER_NOT_FOUND' }); return; }
      if (order.payment_status !== 'paid') {
        res.status(409).json({ error: 'PAYMENT_NOT_CONFIRMED', message: 'Only paid orders can be forwarded for fulfillment.' });
        return;
      }

      const lines = (order.items ?? [])
        .map((it) => ({ productId: it.supliful_product_id, quantity: it.quantity }))
        .filter((l) => l.productId);
      if (lines.length === 0) { res.status(422).json({ error: 'NO_SUPPLIER_LINES' }); return; }

      const addr = order.shipping_address ?? {};
      const r = await supliful('/v1/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': `cuasarx-${order.id}` },
        body: JSON.stringify({
          externalOrderId: order.order_number,
          shippingAddress: {
            firstName: (addr.name || 'Customer').split(' ')[0],
            lastName: (addr.name || 'Customer').split(' ').slice(1).join(' ') || '-',
            address1: addr.street || '',
            address2: addr.apt || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || '',
            country: 'US',
            phone: addr.phone || '',
            email: addr.email || '',
          },
          lines,
        }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) { res.status(502).json({ error: 'SUPLIFUL_ORDER_FAILED', detail: body }); return; }

      await db.from('supplier_orders').insert({
        order_id: order.id,
        supliful_order_id: body.id ?? body.name ?? null,
        status: 'placed',
        lines: lines,
      });
      res.status(200).json({ suplifulOrderId: body.id ?? null, status: 'placed' });
      return;
    }

    res.status(400).json({ error: 'UNKNOWN_ACTION' });
  } catch (e) {
    res.status(500).json({ error: 'SUPLIFUL_INTERNAL', message: String(e).slice(0, 200) });
  }
}

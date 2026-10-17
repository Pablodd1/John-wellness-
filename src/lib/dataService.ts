import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_PRODUCTS } from '../data';
import { Product } from '../types';
import type { CartItem } from '../components/CartDrawer';
import { format } from 'date-fns';

/**
 * Data layer: talks to Supabase when configured and falls back to the bundled
 * mock data when the database is unreachable, so the demo never hard-fails.
 * Every fallback is flagged so the UI can label it honestly.
 */

export type OrderResult = {
  ok: boolean;
  persisted: boolean;
  orderNumber: string;
  error?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
};

export async function fetchCatalog(): Promise<{ products: Product[]; source: 'database' | 'demo' }> {
  if (!isSupabaseConfigured || !supabase) return { products: MOCK_PRODUCTS, source: 'demo' };
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, description, dosage, timing, evidence_grade, tailored_reason');
    if (error || !data || data.length === 0) throw new Error(error?.message ?? 'empty catalog');

    const products: Product[] = data.map((row) => {
      const mock = MOCK_PRODUCTS.find((m) => m.id === row.id);
      return {
        ...(mock ?? {} as Product),
        id: row.id,
        name: row.name,
        category: mock?.category ?? (row.category as Product['category']),
        description: row.description ?? mock?.description ?? '',
        status: mock?.status ?? 'recommended',
        riskLevel: mock?.riskLevel ?? 'low',
        price: Number(row.price),
        dailyDosage: row.dosage ?? mock?.dailyDosage,
        timing: row.timing ?? mock?.timing,
        tailoredReason: row.tailored_reason ?? mock?.tailoredReason,
        evidenceData: mock?.evidenceData,
      };
    });
    return { products, source: 'database' };
  } catch {
    return { products: MOCK_PRODUCTS, source: 'demo' };
  }
}

export async function createOrder(
  userId: string,
  email: string | null,
  items: CartItem[],
  totals: { subtotal: number; discount: number; tax: number; shipping: number; total: number; loyaltyDiscount?: number },
  shippingAddress: Record<string, string>
): Promise<OrderResult> {
  // Simulated payment — this MVP runs without Stripe. The order record marks
  // payment as test_simulated so nothing pretends money moved.
  const localNumber = `CX-${Math.floor(100000 + Math.random() * 900000)}`;
  const loyaltyDiscount = totals.loyaltyDiscount ?? 0;
  const pointsRedeemed = Math.round(loyaltyDiscount / 5) * 100; // $5 per 100 pts
  const pointsEarned = Math.floor(totals.total);
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, persisted: false, orderNumber: localNumber, error: 'Database not configured — order kept in this browser only.', pointsEarned, pointsRedeemed };
  }
  try {
    const payload = {
      user_id: userId,
      items: items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        unit_price: item.product.price ?? 0,
        quantity: item.quantity,
        is_subscription: item.isSubscription,
        frequency_days: Number(item.frequency),
      })),
      subtotal: totals.subtotal,
      discount: totals.discount + loyaltyDiscount,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      points_redeemed: pointsRedeemed,
      points_earned: pointsEarned,
      payment_status: 'test_simulated',
      fulfillment_status: 'processing',
      shipping_address: { ...shippingAddress, email },
    };
    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select('order_number, id')
      .single();
    if (error) throw new Error(error.message);

    // Loyalty: earn 1 pt/$1, minus redeemed. Atomic server-side adjustment.
    const delta = pointsEarned - pointsRedeemed;
    if (delta !== 0) {
      await supabase.rpc('add_loyalty_points', { p_user: userId, p_delta: delta });
    }

    // Active subscriptions are created from any subscription line items.
    const subItems = items.filter((i) => i.isSubscription);
    if (subItems.length > 0) {
      const rows = subItems.map((i) => ({
        user_id: userId,
        order_id: data.id,
        product_id: i.product.id,
        product_name: i.product.name,
        dosage: i.product.dailyDosage ?? null,
        cadence_days: Number(i.frequency),
        status: 'active',
        next_delivery: new Date(Date.now() + Number(i.frequency) * 86400000).toISOString().slice(0, 10),
      }));
      await supabase.from('subscriptions').insert(rows).then(undefined, () => undefined);
    }

    return { ok: true, persisted: true, orderNumber: data.order_number, pointsEarned, pointsRedeemed };
  } catch (err) {
    return { ok: true, persisted: false, orderNumber: localNumber, error: `Order could not be saved: ${err instanceof Error ? err.message : 'unknown error'}`, pointsEarned, pointsRedeemed };
  }
}

// ---------------- Subscriptions (retention) ----------------

export type SubscriptionRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  dosage: string | null;
  cadence_days: number;
  status: 'active' | 'paused' | 'cancelled';
  next_delivery: string;
};

export async function fetchSubscriptions(userId: string): Promise<SubscriptionRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'paused'])
      .order('next_delivery', { ascending: true });
    return error ? [] : (data as SubscriptionRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function updateSubscription(
  userId: string,
  id: string,
  patch: Partial<Pick<SubscriptionRow, 'status' | 'next_delivery' | 'cadence_days'>>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchMyOrders(userId: string): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return error ? [] : data ?? [];
  } catch {
    return [];
  }
}

// ---------------- Tester feedback ----------------

export async function submitFeedback(input: {
  name: string;
  email?: string;
  rating?: number;
  message: string;
  page?: string;
  userId?: string | null;
}): Promise<{ ok: boolean; persisted: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, persisted: false, error: 'Database not configured — feedback kept locally only.' };
  }
  try {
    const { error } = await supabase.from('feedback').insert({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      rating: input.rating ?? null,
      message: input.message.trim(),
      page: input.page ?? null,
      user_id: input.userId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true, persisted: true };
  } catch (err) {
    return { ok: false, persisted: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchFeedback(): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    return error ? [] : data ?? [];
  } catch {
    return [];
  }
}

// ---------------- Insights (tester analytics) ----------------

export type InsightEvent = {
  session_id: string;
  user_id: string | null;
  event_name: string;
  page: string | null;
  created_at: string;
};

export async function fetchRecentEvents(): Promise<InsightEvent[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('app_events')
      .select('session_id, user_id, event_name, page, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    return error ? [] : (data as InsightEvent[]) ?? [];
  } catch {
    return [];
  }
}

// ---------------- Error monitoring (Health) ----------------

export type ErrorRow = {
  id: string;
  session_id: string;
  kind: 'client' | 'server' | 'boundary';
  message: string;
  stack: string | null;
  url: string | null;
  component: string | null;
  created_at: string;
};

export async function fetchRecentErrors(): Promise<ErrorRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('app_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    return error ? [] : (data as ErrorRow[]) ?? [];
  } catch {
    return [];
  }
}

/** fetch() with the caller's Supabase JWT attached — for gated /api routes. */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  let token: string | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? null;
    } catch {
      token = null;
    }
  }
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

// ---------------- Daily briefing (voice receptionist + Today panel) ----------------

export type Briefing = {
  name: string | null;
  loyaltyPoints: number;
  weather: { tempC: number; highC: number; lowC: number; rainProb: number; description: string } | null;
  calendar: { time: string; title: string; location: string | null; kind: string }[];
  meds: { name: string; dose: string; time: string; daysLeft: number }[];
  reorderSoon: { name: string; due: string }[];
  generatedAt: string;
};

export async function fetchBriefing(lat?: number, lon?: number): Promise<Briefing | null> {
  try {
    const q = lat != null && lon != null ? `?lat=${lat}&lon=${lon}` : '';
    const res = await authFetch(`/api/briefing${q}`);
    if (!res.ok) return null;
    return (await res.json()) as Briefing;
  } catch {
    return null;
  }
}

/** Composes the spoken/visual daily briefing sentence from the structured data. */
export function composeBriefingText(b: Briefing, firstName: string): string {
  const parts: string[] = [];
  const hour = new Date().getHours();
  parts.push(hour < 12 ? `Good morning, ${firstName}.` : hour < 18 ? `Good afternoon, ${firstName}.` : `Good evening, ${firstName}.`);

  if (b.weather) {
    const rain = b.weather.rainProb >= 40 ? ` Rain chance later is ${b.weather.rainProb}% — take a jacket.` : ' No rain expected.';
    parts.push(`Right now it's ${b.weather.tempC}° with ${b.weather.description} (high ${b.weather.highC}°, low ${b.weather.lowC}°).${rain}`);
  }

  if (b.calendar.length > 0) {
    const list = b.calendar.slice(0, 2).map((e) => {
      const t = new Date(e.time);
      const sameDay = t.toDateString() === new Date().toDateString();
      const when = sameDay ? format(t, 'HH:mm') : `${format(t, 'EEE HH:mm')}`;
      return `${e.title} at ${when}${e.location ? ` (${e.location})` : ''}`;
    }).join('; ');
    parts.push(`You have ${b.calendar.length <= 2 ? `${b.calendar.length}` : b.calendar.length} upcoming ${b.calendar.length === 1 ? 'event' : 'events'} in the next day: ${list}.`);
  } else {
    parts.push('Your calendar is clear for the next 24 hours.');
  }

  // Meds due within the next 90 minutes (or the next one scheduled today)
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const dueNow = b.meds.filter((m) => {
    const [h, min] = m.time.split(':').map(Number);
    const medMin = h * 60 + min;
    return Math.abs(medMin - nowMin) <= 90;
  });
  if (dueNow.length > 0) {
    parts.push(`Time to take: ${dueNow.map((m) => `${m.name} — ${m.dose}`).join('; ')}.`);
  } else if (b.meds.length > 0) {
    const next = [...b.meds].sort((a, c) => a.time.localeCompare(c.time)).find((m) => {
      const [h] = m.time.split(':').map(Number);
      return h >= hour;
    });
    if (next) parts.push(`Next on your schedule: ${next.name} at ${next.time}.`);
  }

  const low = b.meds.filter((m) => m.daysLeft <= 7);
  if (low.length > 0) {
    parts.push(`Running low: ${low.map((m) => `${m.name} (${m.daysLeft} days left)`).join(', ')}.`);
  }

  if (b.reorderSoon.length > 0) {
    parts.push(`${b.reorderSoon[0].name} auto-delivery arrives ${format(new Date(b.reorderSoon[0].due + 'T12:00:00'), 'EEEE')} — say "add ${b.reorderSoon[0].name} to cart" if you want it sooner.`);
  }

  if (b.loyaltyPoints > 0) parts.push(`You have ${b.loyaltyPoints} loyalty points.`);

  return parts.join(' ');
}

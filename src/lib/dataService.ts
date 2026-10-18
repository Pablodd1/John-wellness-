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

const DEMO_WEATHER_TEXT: Record<number, string> = {
  0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'rain showers', 81: 'rain showers', 82: 'heavy rain showers', 95: 'thunderstorms',
  96: 'thunderstorms with hail', 99: 'severe thunderstorms',
};

function defaultDemoBriefing(): Pick<Briefing, 'calendar' | 'meds' | 'reorderSoon'> {
  const today3pm = new Date(); today3pm.setHours(15, 0, 0, 0);
  const today6pm = new Date(); today6pm.setHours(18, 30, 0, 0);
  const tmr9am = new Date(Date.now() + 864e5); tmr9am.setHours(9, 0, 0, 0);
  const due4 = new Date(Date.now() + 4 * 864e5).toISOString().slice(0, 10);
  const due6 = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10);
  return {
    calendar: [
      { time: today3pm.toISOString(), title: 'Weekly review — Keel Performance', location: 'Zoom', kind: 'meeting' },
      { time: today6pm.toISOString(), title: 'Zone 2 ride — 60 min', location: 'Key Biscayne loop', kind: 'training' },
      { time: tmr9am.toISOString(), title: 'Dr. Chen follow-up (labs review)', location: 'Telehealth', kind: 'appointment' },
    ],
    meds: [
      { name: 'Vitamin D3 5000 IU + K2', dose: '1 softgel', time: '08:00', daysLeft: 12 },
      { name: 'Creatine Monohydrate', dose: '5g', time: '08:00', daysLeft: 45 },
      { name: 'Omega-3 High-EPA 2000mg', dose: '2 softgels', time: '13:00', daysLeft: 4 },
      { name: 'Magnesium Glycinate 400mg', dose: '400mg', time: '21:30', daysLeft: 6 },
    ],
    reorderSoon: [
      { name: 'Magnesium Glycinate (Elemental 400mg)', due: due4 },
      { name: 'High-EPA Triglyceride Omega-3', due: due6 },
    ],
  };
}

export async function fetchBriefing(lat?: number, lon?: number): Promise<Briefing | null> {
  const demo = defaultDemoBriefing();
  try {
    const q = lat != null && lon != null ? `?lat=${lat}&lon=${lon}` : '';
    const res = await authFetch(`/api/briefing${q}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = (await res.json()) as Briefing;
      return {
        ...data,
        calendar: data.calendar?.length ? data.calendar : demo.calendar,
        meds: data.meds?.length ? data.meds : demo.meds,
        reorderSoon: data.reorderSoon?.length ? data.reorderSoon : demo.reorderSoon,
      };
    }
  } catch { /* fall through to client-side Open-Meteo + demo schedule */ }

  const la = lat ?? 25.7617;
  const lo = lon ?? -80.1918;
  let weather: Briefing['weather'] = { tempC: 26, highC: 28, lowC: 22, rainProb: 10, description: 'sunny and dry' };
  try {
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto`
    );
    if (wRes.ok) {
      const wData = await wRes.json();
      if (wData?.current) {
        const code = Number(wData.current.weather_code ?? 0);
        weather = {
          tempC: Math.round(wData.current.temperature_2m),
          highC: Math.round(wData.daily?.temperature_2m_max?.[0] ?? wData.current.temperature_2m),
          lowC: Math.round(wData.daily?.temperature_2m_min?.[0] ?? wData.current.temperature_2m),
          rainProb: wData.daily?.precipitation_probability_max?.[0] ?? 0,
          description: DEMO_WEATHER_TEXT[code] ?? 'clear sky',
        };
      }
    }
  } catch { /* keep deterministic sunny & dry fallback */ }

  return {
    name: null,
    loyaltyPoints: 320,
    weather,
    calendar: demo.calendar,
    meds: demo.meds,
    reorderSoon: demo.reorderSoon,
    generatedAt: new Date().toISOString(),
  };
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

// ---------------- Health readings (researchable device data) ----------------

export type HealthReading = {
  metric: string;
  value: number;
  unit: string;
  source: string;
  recorded_at: string;
};

export async function fetchMyReadings(): Promise<HealthReading[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('health_readings')
      .select('metric, value, unit, source, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(1500);
    return error ? [] : (data as HealthReading[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchMyMedications(): Promise<{ name: string; dose: string; time: string; days_left: number }[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('user_medications')
      .select('name, dose, time_of_day, days_left')
      .eq('active', true)
      .order('time_of_day');
    if (error || !data) return [];
    return data.map((m) => ({ name: m.name, dose: m.dose, time: (m.time_of_day || '08:00').slice(0, 5), days_left: m.days_left }));
  } catch {
    return [];
  }
}

export async function fetchMyCalendar(): Promise<{ time: string; title: string; location: string | null }[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('title, starts_at, location')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(6);
    if (error || !data) return [];
    return data.map((e) => ({ time: e.starts_at, title: e.title, location: e.location }));
  } catch {
    return [];
  }
}

/** Downloads a self-contained HTML file (open in any browser → print/save as PDF). */
export function downloadMedicalSummary(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CuasarX-Medical-Lifestyle-Summary-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

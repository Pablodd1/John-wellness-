/**
 * Vercel serverless function: GET /api/briefing
 *
 * The voice receptionist's morning briefing — requires a signed-in user.
 * Composes from: real weather (Open-Meteo, free, no key), today/tomorrow's
 * calendar, the medication schedule, auto-deliveries due soon, and the
 * caller's profile basics.
 *
 * Query: ?lat=25.76&lon=-80.19  (defaults to Miami)
 * Response: structured JSON; the client composes the spoken sentence.
 */
import { requireUser, unauthorized } from '../lib/api-auth.mjs';

const WEATHER_TEXT = {
  0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'rain showers', 81: 'rain showers', 82: 'heavy rain showers', 95: 'thunderstorms',
  96: 'thunderstorms with hail', 99: 'severe thunderstorms',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const user = await requireUser(req);
  if (!user) { unauthorized(res); return; }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    res.status(501).json({ error: 'DATA_NOT_CONFIGURED' });
    return;
  }
  const authHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${req.headers.authorization.replace(/^Bearer /, '')}`,
  };

  const lat = parseFloat(String(req.query.lat ?? '25.7617')) || 25.7617;
  const lon = parseFloat(String(req.query.lon ?? '-80.1918')) || -80.1918;

  try {
    // Weather + calendar + meds + subscriptions in parallel (data DB is reachable;
    // if a query fails we degrade that section instead of failing the briefing).
    const weatherP = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto`
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const eventsP = fetch(
      `${supabaseUrl}/rest/v1/calendar_events?select=title,starts_at,location,kind` +
      `&user_id=eq.${user.id}&starts_at=gte.${new Date().toISOString()}&order=starts_at.asc&limit=5`,
      { headers: authHeaders }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const medsP = fetch(
      `${supabaseUrl}/rest/v1/user_medications?select=name,dose,time_of_day,days_left` +
      `&user_id=eq.${user.id}&active=eq.true&order=time_of_day.asc`,
      { headers: authHeaders }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const subsP = fetch(
      `${supabaseUrl}/rest/v1/subscriptions?select=product_name,next_delivery,cadence_days` +
      `&user_id=eq.${user.id}&status=eq.active&order=next_delivery.asc&limit=5`,
      { headers: authHeaders }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const profileP = fetch(
      `${supabaseUrl}/rest/v1/profiles?select=name,loyalty_points&user_id=eq.${user.id}&limit=1`,
      { headers: authHeaders }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const [weather, events, medsRaw, subs, profileArr] = await Promise.all([weatherP, eventsP, medsP, subsP, profileP]);

    let weatherOut = null;
    if (weather?.current) {
      const code = weather.current.weather_code;
      weatherOut = {
        tempC: Math.round(weather.current.temperature_2m),
        highC: Math.round(weather.daily?.temperature_2m_max?.[0] ?? weather.current.temperature_2m),
        lowC: Math.round(weather.daily?.temperature_2m_min?.[0] ?? weather.current.temperature_2m),
        rainProb: weather.daily?.precipitation_probability_max?.[0] ?? 0,
        description: WEATHER_TEXT[code] ?? 'variable',
      };
    }

    const now = Date.now();
    const in24h = now + 864e5;
    const calendar = (events ?? [])
      .filter((e) => new Date(e.starts_at).getTime() <= in24h)
      .map((e) => ({ time: e.starts_at, title: e.title, location: e.location ?? null, kind: e.kind }));

    const meds = (medsRaw ?? []).map((m) => ({
      name: m.name, dose: m.dose, time: (m.time_of_day || '08:00').slice(0, 5), daysLeft: m.days_left,
    }));

    const reorderSoon = (subs ?? [])
      .filter((s) => new Date(s.next_delivery + 'T12:00:00').getTime() - now < 14 * 864e5)
      .map((s) => ({ name: s.product_name, due: s.next_delivery }));

    res.status(200).json({
      name: profileArr?.[0]?.name ?? null,
      loyaltyPoints: profileArr?.[0]?.loyalty_points ?? 0,
      weather: weatherOut,
      calendar,
      meds,
      reorderSoon,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    res.status(502).json({ error: 'BRIEFING_UPSTREAM_ERROR' });
  }
}

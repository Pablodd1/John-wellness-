import { supabase, isSupabaseConfigured } from './supabase';

/**
 * First-party, consent-aware analytics.
 *
 * Events go straight to the public.app_events table (anonymous session ID +
 * optional user id when signed in). Nothing is recorded unless the user has
 * granted the 'behavioral_analytics' consent — the tracker is fully inert
 * otherwise, and failures are swallowed so tracking can never break the app.
 *
 * This deliberately replaces PostHog for the closed MVP: the data lands in our
 * own database, feeds the Insights dashboard, and stays under the same consent
 * system as everything else.
 */

const SESSION_KEY = 'cx_analytics_session';

export function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s-${crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s-ephemeral-${Date.now()}`;
  }
}

type Tracker = {
  track: (eventName: string, metadata?: Record<string, unknown>, page?: string) => void;
  getSessionId: () => string;
};

let consentGranted = false;
let currentUserId: string | null = null;
let currentPage = 'marketplace';

/** Called from App whenever consent or auth state changes. */
export function configureTracker(opts: { granted: boolean; userId: string | null }) {
  consentGranted = opts.granted;
  currentUserId = opts.userId;
}

export function setPage(page: string) {
  currentPage = page;
}

export function createTracker(): Tracker {
  const track = (eventName: string, metadata: Record<string, unknown> = {}, page?: string) => {
    if (!consentGranted || !isSupabaseConfigured || !supabase) return;
    recordSignal(eventName);
    // Fire-and-forget; never await, never throw into the UI.
    void supabase
      .from('app_events')
      .insert({
        session_id: getSessionId(),
        user_id: currentUserId,
        event_name: eventName,
        page: page ?? currentPage,
        metadata,
      })
      .then(undefined, () => undefined);
  };
  return { track, getSessionId };
}

// ---------------- Intent classification (local, consent-gated) ----------------

const recentSignals: { name: string; ts: number }[] = [];
const SIGNAL_WINDOW_MS = 5 * 60 * 1000;

function recordSignal(name: string) {
  if (!consentGranted) return;
  const now = Date.now();
  while (recentSignals.length && now - recentSignals[0].ts > SIGNAL_WINDOW_MS) recentSignals.shift();
  recentSignals.push({ name, ts: now });
  if (recentSignals.length > 30) recentSignals.shift();
}

export type Intent = 'browsing' | 'comparing' | 'buying';

/**
 * Rule-based intent over the last 5 minutes of consented signals.
 * Deterministic by design — the label is shown to the user, so it must be
 * explainable: checkout/cart activity → buying; search/quick-view → comparing;
 * only page views → browsing.
 */
export function classifyIntent(): Intent | null {
  if (!consentGranted) return null;
  const now = Date.now();
  const live = recentSignals.filter((s) => now - s.ts <= SIGNAL_WINDOW_MS);
  if (live.length === 0) return null;
  if (live.some((s) => ['order_placed', 'checkout_step', 'add_to_cart'].includes(s.name))) return 'buying';
  if (live.some((s) => ['search', 'quick_view', 'compare'].includes(s.name))) return 'comparing';
  return 'browsing';
}

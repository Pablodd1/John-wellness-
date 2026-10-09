import { supabase, isSupabaseConfigured } from './supabase';
import { getSessionId } from './analytics';

/**
 * First-party error monitoring. Capture must never fail and never bother the
 * user: window-level handlers + a reportError() used by the React error
 * boundary and serverless-facing code. Errors go to public.app_errors; an
 * optional alert webhook (via /api/alert) fires for the first occurrence of
 * each distinct message per hour so outages ping without spamming.
 *
 * Unlike analytics events, error reporting is NOT gated behind analytics
 * consent — it is operationally necessary (like a crash log) and contains no
 * health data, only technical context. This is stated in the privacy notice.
 */

const ALERT_DEDUP_KEY = 'cx_alerted_errors';
const DEDUP_WINDOW_MS = 60 * 60 * 1000;

let currentUser: { id: string | null; email: string | null } = { id: null, email: null };

export function configureErrorReporter(user: { id: string | null; email: string | null }) {
  currentUser = user;
}

function wasAlerted(message: string): boolean {
  try {
    const map: Record<string, number> = JSON.parse(sessionStorage.getItem(ALERT_DEDUP_KEY) ?? '{}');
    const last = map[message];
    if (last && Date.now() - last < DEDUP_WINDOW_MS) return true;
    map[message] = Date.now();
    // prune old entries
    for (const k of Object.keys(map)) {
      if (Date.now() - map[k] > DEDUP_WINDOW_MS) delete map[k];
    }
    sessionStorage.setItem(ALERT_DEDUP_KEY, JSON.stringify(map));
    return false;
  } catch {
    return false;
  }
}

function persist(input: {
  kind: 'client' | 'server' | 'boundary';
  message: string;
  stack?: string;
  url?: string;
  component?: string;
  extra?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured || !supabase) return;
  void supabase
    .from('app_errors')
    .insert({
      session_id: getSessionId(),
      user_id: currentUser.id,
      kind: input.kind,
      message: input.message.slice(0, 500),
      stack: input.stack?.slice(0, 4000) ?? null,
      // strip query + hash: URLs can carry auth tokens (e.g. magic-link #access_token)
      url: (input.url ?? (typeof window !== 'undefined' ? window.location.href : null) ?? '').split('#')[0].split('?')[0] || null,
      component: input.component ?? null,
      extra: input.extra ?? {},
    })
    .then(undefined, () => undefined);

  // First occurrence of this message in this session → notify via /api/alert
  // (the serverless function has its own global rate limiting too).
  if (!wasAlerted(input.message)) {
    void fetch('/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: input.kind === 'boundary' ? 'React crash' : 'Client error',
        message: input.message,
        stack: input.stack?.slice(0, 800),
        url: (typeof window !== 'undefined' ? window.location.href : '').split('#')[0].split('?')[0] || undefined,
        sessionId: getSessionId(),
      }),
    }).catch(() => undefined);
  }
}

export function reportError(input: {
  kind?: 'client' | 'server' | 'boundary';
  message: string;
  stack?: string;
  url?: string;
  component?: string;
  extra?: Record<string, unknown>;
}) {
  try {
    persist({ kind: 'client', ...input });
  } catch {
    // never throw from the error reporter
  }
}

/** Installs global handlers. Called once from App. Returns a cleanup fn. */
export function installGlobalErrorHandlers(): () => void {
  const onError = (event: ErrorEvent) => {
    reportError({
      kind: 'client',
      message: event.message || 'Unknown script error',
      stack: event.error?.stack,
      url: event.filename ?? undefined,
      extra: { lineno: event.lineno, colno: event.colno },
    });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    reportError({
      kind: 'client',
      message: `Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason).slice(0, 300)}`,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

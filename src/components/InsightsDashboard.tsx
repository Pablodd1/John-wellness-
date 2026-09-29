import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { fetchRecentEvents, fetchFeedback, fetchMyOrders, fetchRecentErrors, InsightEvent, ErrorRow } from '../lib/dataService';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  BarChart3,
  Users,
  ShoppingBag,
  MessageSquarePlus,
  RefreshCw,
  Activity,
  Star,
  MousePointerClick,
  Database,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '../lib/utils';

/**
 * Insights — the tester-analytics dashboard. All data is first-party: events
 * recorded by our own consent-gated tracker plus orders and feedback, read
 * live from Supabase. Replaces the previous hardcoded "OperatorDashboard".
 */

type FeedbackRow = {
  id: string;
  name: string;
  email: string | null;
  rating: number | null;
  message: string;
  page: string | null;
  created_at: string;
};

const EVENT_COLORS: Record<string, string> = {
  page_view: '#344a37',
  search: '#4a6850',
  add_to_cart: '#785328',
  checkout_step: '#8c6d1f',
  order_placed: '#2b4530',
  visit_started: '#5c5851',
  feedback_submitted: '#8c3232',
};

export function InsightsDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [explainState, setExplainState] = useState<Record<string, { loading: boolean; text?: string; error?: boolean }>>({});

  const load = async () => {
    setLoading(true);
    const [ev, fb, errs] = await Promise.all([fetchRecentEvents(), fetchFeedback(), fetchRecentErrors()]);
    setEvents(ev);
    setFeedback(fb as FeedbackRow[]);
    setErrors(errs);
    if (user) {
      const orders = await fetchMyOrders(user.id);
      setOrderCount(orders.length);
    }
    setRefreshedAt(new Date());
    setLoading(false);
  };

  const explainError = async (row: ErrorRow) => {
    setExplainState((prev) => ({ ...prev, [row.id]: { loading: true } }));
    try {
      const res = await fetch('/api/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: row.message, stack: row.stack, component: row.component, url: row.url }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setExplainState((prev) => ({ ...prev, [row.id]: { loading: false, text: data.explanation ?? 'No explanation returned.' } }));
    } catch {
      setExplainState((prev) => ({ ...prev, [row.id]: { loading: false, error: true } }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const sessions = new Set(events.map((e) => e.session_id));
    const byDay = new Map<string, number>();
    const byName = new Map<string, number>();
    for (const e of events) {
      const day = format(new Date(e.created_at), 'MMM d');
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      byName.set(e.event_name, (byName.get(e.event_name) ?? 0) + 1);
    }
    const ratingsWithValues = feedback.filter((f) => typeof f.rating === 'number');
    const avgRating = ratingsWithValues.length
      ? (ratingsWithValues.reduce((a, f) => a + (f.rating ?? 0), 0) / ratingsWithValues.length).toFixed(1)
      : null;
    return {
      totalEvents: events.length,
      sessions: sessions.size,
      byDay: Array.from(byDay.entries()).map(([day, count]) => ({ day, count })).reverse(),
      topEvents: Array.from(byName.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8),
      sessionsList: Array.from(sessions).slice(0, 12).map((sid) => {
        const sessionEvents = events.filter((e) => e.session_id === sid);
        const last = sessionEvents[0];
        return {
          sessionId: sid,
          count: sessionEvents.length,
          signedIn: sessionEvents.some((e) => e.user_id),
          lastActivity: last ? formatDistanceToNowStrict(new Date(last.created_at)) + ' ago' : '—',
          lastEvent: last?.event_name ?? '—',
          pages: Array.from(new Set(sessionEvents.map((e) => e.page).filter(Boolean))).slice(0, 4),
        };
      }),
      avgRating,
    };
  }, [events, feedback]);

  const dbConnected = events.length > 0 || feedback.length > 0 || orderCount !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe7df] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#f1f5f2] rounded-xl border border-[#dbe5dc]">
            <BarChart3 className="w-6 h-6 text-[#344a37]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#181716]">Insights — Tester Analytics</h1>
            <p className="text-xs text-[#5c5851] mt-1 max-w-2xl leading-relaxed">
              Live first-party data: how testers move through the platform, what they click, what they buy, and what
              they tell us. Recorded only from sessions where analytics consent is on.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <button
            onClick={load}
            disabled={loading}
            className="btn-subtle px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} aria-hidden="true" /> Refresh
          </button>
          {refreshedAt && (
            <span className="text-[10px] text-[#6e6960] font-mono">Updated {format(refreshedAt, 'HH:mm:ss')}</span>
          )}
        </div>
      </div>

      {!dbConnected && !loading && (
        <p className="text-xs text-[#785328] p-4 rounded-xl border border-[#ede1cf] bg-[#faf5ee] flex items-center gap-2">
          <Database className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          No analytics data is reachable. Either the database isn't connected in this build, or no tester sessions with
          analytics consent have been recorded yet.
        </p>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Activity, label: 'Events (last 500)', value: String(stats.totalEvents) },
          { icon: Users, label: 'Sessions seen', value: String(stats.sessions) },
          { icon: ShoppingBag, label: 'Your orders', value: orderCount === null ? '—' : String(orderCount) },
          { icon: MessageSquarePlus, label: 'Feedback items', value: String(feedback.length) },
          { icon: Star, label: 'Avg rating', value: stats.avgRating ?? '—' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-4 rounded-2xl border border-[#ebe7df] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#5c5851] flex items-center gap-1.5">
              <kpi.icon className="w-3.5 h-3.5 text-[#344a37]" aria-hidden="true" /> {kpi.label}
            </span>
            <span className="text-2xl font-bold text-[#181716] mt-1 block">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Events per day */}
      <section aria-labelledby="events-chart-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm">
        <h2 id="events-chart-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Events per day
        </h2>
        {stats.byDay.length === 0 ? (
          <p className="text-xs text-[#6e6960] p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            No events yet. Once testers enable "Product Analytics" in Privacy &amp; Consent and use the app, activity appears here.
          </p>
        ) : (
          <div className="h-56" role="img" aria-label={`Bar chart of events per day, ${stats.totalEvents} events total`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byDay} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe7df" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5c5851' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5c5851' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #ebe7df' }} />
                <Bar dataKey="count" fill="#344a37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top events */}
        <section aria-labelledby="top-events-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm">
          <h2 id="top-events-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2 mb-3">
            <MousePointerClick className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Top events
          </h2>
          {stats.topEvents.length === 0 ? (
            <p className="text-xs text-[#6e6960]">No events recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topEvents.map(([name, count]) => (
                <li key={name} className="flex items-center gap-3 text-xs">
                  <span className="w-40 font-semibold text-[#181716] capitalize truncate">{name.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-2 bg-[#f4f2ec] rounded-full overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((count / stats.topEvents[0][1]) * 100)}%`,
                        background: EVENT_COLORS[name] ?? '#344a37',
                      }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[#181716] w-10 text-right">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Sessions */}
        <section aria-labelledby="sessions-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm">
          <h2 id="sessions-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Recent sessions
          </h2>
          {stats.sessionsList.length === 0 ? (
            <p className="text-xs text-[#6e6960]">No sessions recorded yet.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.sessionsList.map((s) => (
                <li key={s.sessionId} className="p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df] text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-[#6e6960] truncate">{s.sessionId}</span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                      s.signedIn ? 'bg-[#f1f5f2] text-[#2b4530]' : 'bg-[#f5f4ef] text-[#5c5851]'
                    )}>
                      {s.signedIn ? 'Signed in' : 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[#5c5851]">
                    <span className="font-bold text-[#181716]">{s.count} events</span>
                    <span>•</span>
                    <span>last: {s.lastActivity}</span>
                  </div>
                  {s.pages.length > 0 && (
                    <div className="text-[10px] text-[#6e6960] mt-0.5 truncate">visited: {s.pages.join(' → ')}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Health: error monitoring */}
      <section aria-labelledby="health-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
        <h2 id="health-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <ShieldAlert className={cn('w-4 h-4', errors.length > 0 ? 'text-[#8c3232]' : 'text-[#344a37]')} aria-hidden="true" />
          Platform Health — Errors
          <span className={cn('badge-neutral', errors.length > 0 && 'badge-flag')}>{errors.length} recent</span>
        </h2>
        {errors.length === 0 ? (
          <p className="text-xs text-[#6e6960] p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            No errors captured. Client crashes, unhandled rejections, and render failures land here automatically with
            stack traces and the affected session.
          </p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {errors.map((err) => {
              const state = explainState[err.id];
              return (
                <li key={err.id} className="p-3.5 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border',
                      err.kind === 'boundary' ? 'bg-[#fdf2f2] text-[#8c3232] border-[#f5d5d5]'
                        : err.kind === 'server' ? 'bg-[#faf5ee] text-[#785328] border-[#ede1cf]'
                        : 'bg-[#f5f4ef] text-[#5c5851] border-[#e6e4dc]'
                    )}>
                      {err.kind}
                    </span>
                    <span className="text-[10px] text-[#6e6960] font-mono">
                      {format(new Date(err.created_at), 'MMM d HH:mm:ss')} • {formatDistanceToNowStrict(new Date(err.created_at))} ago • {err.session_id.slice(0, 12)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#181716] break-words">{err.message}</p>
                  {err.stack && (
                    <details className="text-[10px] text-[#6e6960]">
                      <summary className="cursor-pointer font-bold hover:text-[#181716] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded">Stack trace</summary>
                      <pre className="mt-1 whitespace-pre-wrap break-words max-h-40 overflow-y-auto bg-white border border-[#ebe7df] rounded-lg p-2">{err.stack}</pre>
                    </details>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => explainError(err)}
                      disabled={state?.loading}
                      className="btn-stone px-2.5 py-1 text-[10px] inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                    >
                      <Sparkles className="w-3 h-3 text-[#785328]" aria-hidden="true" />
                      {state?.loading ? 'Analyzing…' : 'Explain & suggest fix (AI)'}
                    </button>
                  </div>
                  {state?.text && (
                    <div className="p-3 bg-[#f1f5f2] border border-[#dbe5dc] rounded-xl text-[11px] text-[#181716] leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="whitespace-pre-wrap">{state.text}</span>
                    </div>
                  )}
                  {state?.error && (
                    <p role="alert" className="text-[10px] text-[#8c3232] font-bold">
                      AI explanation unavailable (service not configured or upstream error).
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Feedback queue */}
      <section aria-labelledby="feedback-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm">
        <h2 id="feedback-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2 mb-3">
          <MessageSquarePlus className="w-4 h-4 text-[#8c3232]" aria-hidden="true" /> Tester feedback queue
        </h2>
        {feedback.length === 0 ? (
          <p className="text-xs text-[#6e6960]">No feedback submitted yet. The red "Comments / Reviews" button (bottom-left) feeds this queue.</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {feedback.map((f) => (
              <li key={f.id} className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#181716]">{f.name}</span>
                  <span className="text-[10px] text-[#6e6960]">
                    {format(new Date(f.created_at), 'MMM d, HH:mm')} • {formatDistanceToNowStrict(new Date(f.created_at))} ago{f.page ? ` • on ${f.page}` : ''}
                  </span>
                </div>
                {typeof f.rating === 'number' && (
                  <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${f.rating} of 5`}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star key={v} className={cn('w-3.5 h-3.5', v <= f.rating! ? 'fill-[#b8860b] text-[#b8860b]' : 'text-[#dedad0]')} aria-hidden="true" />
                    ))}
                  </span>
                )}
                <p className="text-xs text-[#5c5851] leading-relaxed">{f.message}</p>
                {f.email && <p className="text-[10px] text-[#6e6960] font-mono">reply-to: {f.email}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

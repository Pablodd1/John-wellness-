import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, Product } from '../types';
import { useAuth } from '../lib/auth';
import { fetchMyOrders, fetchMyReadings, fetchMyMedications, fetchMyCalendar, downloadMedicalSummary, HealthReading } from '../lib/dataService';
import { computeHealthSummary, buildMedicalSummaryHtml } from '../lib/healthSummary';
import { GOAL_OPTIONS } from '../lib/matchScore';
import { MOCK_PRODUCTS } from '../data';
import { format } from 'date-fns';
import { ShoppingBag, RefreshCw, Target, PackageOpen, Check, Activity, FileDown } from 'lucide-react';
import { cn } from '../lib/utils';

type OrderRow = {
  id: string;
  order_number: string;
  total: number | string;
  payment_status: string;
  fulfillment_status: string;
  items: { product_id: string; name: string; quantity: number }[];
  shipping_address: { city?: string; state?: string } | null;
  created_at: string;
};

/**
 * User dashboard panel: real order history from the database, one-click
 * reorder, and the goals that feed the match-score engine.
 */
export function OrdersAndGoals({
  user,
  onUpdateUser,
  onAddToCart,
}: {
  user: UserProfile;
  onUpdateUser: (fields: Partial<UserProfile>) => void;
  onAddToCart: (products: Product[]) => void;
}) {
  const { user: authUser, profile: authProfile } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [readings, setReadings] = useState<HealthReading[] | null>(null);
  const [medsList, setMedsList] = useState<{ name: string; dose: string; time: string; days_left: number }[]>([]);
  const [upcoming, setUpcoming] = useState<{ time: string; title: string; location: string | null }[]>([]);
  const [reordered, setReordered] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (authUser) {
      fetchMyOrders(authUser.id).then((rows) => {
        if (!cancelled) setOrders(rows as OrderRow[]);
      });
      fetchMyReadings().then((rows) => {
        if (!cancelled) setReadings(rows as HealthReading[]);
      });
      fetchMyMedications().then(setMedsList);
      fetchMyCalendar().then(setUpcoming);
    } else if (!cancelled) {
      setOrders([]);
      setReadings([]);
    }
    return () => { cancelled = true; };
  }, [authUser]);


  const healthSummary = useMemo(
    () => (readings ? computeHealthSummary(readings as HealthReading[]) : null),
    [readings]
  );
  const medsForExport = medsList.map((m) => ({ name: m.name, dose: m.dose, time: m.time, daysLeft: m.days_left }));
  const downloadSummary = () => {
    if (!healthSummary || healthSummary.length === 0) return;
    const html = buildMedicalSummaryHtml({
      patientName: authProfile?.name ?? authUser?.email ?? 'Patient',
      generatedAt: new Date(),
      summary: healthSummary,
      medications: medsForExport,
      goals: Array.isArray(user.goals) ? user.goals : [],
      calendar: upcoming,
      loyaltyPoints: authProfile?.loyalty_points ?? 0,
    });
    downloadMedicalSummary(html);
  };

  const toggleGoal = (goal: string) => {
    const current = Array.isArray(user.goals) ? user.goals : [];
    const next = current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal];
    onUpdateUser({ goals: next });
  };

  const reorder = (order: OrderRow) => {
    const products = order.items
      .map((item) => MOCK_PRODUCTS.find((p) => p.id === item.product_id))
      .filter((p): p is Product => Boolean(p));
    if (products.length === 0) return;
    onAddToCart(products);
    setReordered(order.order_number);
    window.setTimeout(() => setReordered(null), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Orders & reorder */}
      <section aria-labelledby="orders-heading" className="bg-white/[0.06] p-5 rounded-2xl border border-white/10 shadow-sm space-y-3">
        <h2 id="orders-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-orange-400" aria-hidden="true" /> Order History
        </h2>
        {orders === null ? (
          <p className="text-xs text-stone-400">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-stone-400 p-4 bg-white/[0.05] rounded-xl border border-white/10">
            No orders yet. {authUser ? 'Everything you check out will appear here with one-click reorder.' : 'Sign in to have orders saved to your account.'}
          </p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {orders.map((order) => (
              <li key={order.id} className="p-3.5 bg-white/[0.05] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#f4f2ec]">#{order.order_number}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold border',
                    order.fulfillment_status === 'processing' ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' : 'bg-orange-500/10 text-orange-300 border-orange-500/25'
                  )}>
                    {order.fulfillment_status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                  {order.shipping_address?.city ? ` • ${order.shipping_address.city}, ${order.shipping_address.state}` : ''}
                  {' • '}$&nbsp;{Number(order.total).toFixed(2)}
                  <span className="text-stone-500"> (payment simulated)</span>
                </p>
                <ul className="text-[11px] text-stone-400">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${idx}`} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-orange-400 flex-shrink-0" aria-hidden="true" />
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => reorder(order)}
                  disabled={reordered === order.order_number}
                  className="btn-stone px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  {reordered === order.order_number
                    ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /> Added to cart</>
                    : <><RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Reorder items</>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Health data — researchable + exportable */}
      <section aria-labelledby="healthdata-heading" className="bg-white/[0.06] p-5 rounded-2xl border border-white/10 shadow-sm space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 id="healthdata-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" aria-hidden="true" /> My Health Data
          </h2>
          <button
            onClick={downloadSummary}
            disabled={!healthSummary || healthSummary.length === 0}
            className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-orange-500 bg-white/[0.06] text-orange-400 hover:bg-orange-500/10 transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <FileDown className="w-3.5 h-3.5" aria-hidden="true" /> Download medical lifestyle summary
          </button>
        </div>
        {healthSummary && healthSummary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-sans" aria-label="Health readings summary (last 60 days)">
              <thead>
                <tr className="text-left text-stone-400">
                  <th className="py-1.5 pr-3 font-bold">Metric</th>
                  <th className="py-1.5 pr-3 font-bold">Latest</th>
                  <th className="py-1.5 pr-3 font-bold">7-day avg</th>
                  <th className="py-1.5 pr-3 font-bold">30-day avg</th>
                  <th className="py-1.5 pr-3 font-bold">Trend</th>
                  <th className="py-1.5 font-bold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {healthSummary.map((m) => (
                  <tr key={m.metric} className="border-t border-white/[0.08]">
                    <td className="py-1.5 pr-3 font-bold text-[#f4f2ec]">{m.label}</td>
                    <td className="py-1.5 pr-3">{m.latest} {m.unit}</td>
                    <td className="py-1.5 pr-3">{m.avg7} {m.unit}</td>
                    <td className="py-1.5 pr-3">{m.avg30} {m.unit}</td>
                    <td className={cn('py-1.5 font-semibold', m.improving === true ? 'text-[#166534]' : m.improving === false ? 'text-[#b91c1c]' : 'text-stone-400')}>
                      {m.improving === null ? '—' : m.deltaPct > 0 ? `▲ +${Math.abs(m.deltaPct)}%` : m.deltaPct < 0 ? `▼ ${m.deltaPct}%` : 'stable'}
                    </td>
                    <td className="py-1.5 text-stone-400">{m.target ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-stone-400 mt-2">Research your own connected-device data (last 60 days). Trend compares the last 7 days against the prior 30. This same data powers the voice receptionist and the AI coach — and exports into the medical lifestyle summary.</p>
          </div>
        ) : (
          <p className="text-xs text-stone-400 p-4 bg-white/[0.05] rounded-xl border border-white/10">
            {readings === null ? 'Loading your readings…' : 'No device readings on file yet. Once your wearable syncs (demo data for this account is seeded), the summary table and export appear here.'}
          </p>
        )}
      </section>

      {/* Goals — feeds the match engine */}
      <section aria-labelledby="goals-heading" className="bg-white/[0.06] p-5 rounded-2xl border border-white/10 shadow-sm space-y-3">
        <h2 id="goals-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" aria-hidden="true" /> My Goals
        </h2>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          These directly tune the match scores in the marketplace — pick what you're actually working on.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Your goals">
          {GOAL_OPTIONS.map((goal) => {
            const active = Array.isArray(user.goals) && user.goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  active
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white/[0.06] text-stone-400 border-white/15 hover:bg-white/[0.05]'
                )}
              >
                {goal}
              </button>
            );
          })}
        </div>
        {Array.isArray(user.goals) && user.goals.length > 0 && (
          <p className="text-[10px] text-orange-300 font-semibold flex items-center gap-1.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/25">
            <PackageOpen className="w-3 h-3" aria-hidden="true" />
            {user.goals.length} goal{user.goals.length > 1 ? 's' : ''} active — marketplace sorting is personalized.
          </p>
        )}
        <p className="text-[10px] text-stone-400 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <span className="font-bold text-amber-300">Loyalty balance: {(authProfile?.loyalty_points ?? 0).toLocaleString()} pts</span>
          {' '}— earn 1 pt per $1; redeem 100 pts for $5 off at checkout.
        </p>
      </section>
    </div>
  );
}

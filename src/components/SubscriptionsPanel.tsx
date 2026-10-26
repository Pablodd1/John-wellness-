import React, { useEffect, useState } from 'react';
import { Product, UserProfile } from '../types';
import { useAuth } from '../lib/auth';
import { fetchSubscriptions, updateSubscription, SubscriptionRow } from '../lib/dataService';
import { format, addDays } from 'date-fns';
import {
  RefreshCw,
  Pause,
  Play,
  FastForward,
  CalendarX,
  ShieldCheck,
  Tag,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Retention commerce panel: manage auto-deliveries (pause, resume, skip next,
 * change cadence) with a save-offer flow on cancellation. Due-soon deliveries
 * are highlighted with a one-click reorder.
 */
export function SubscriptionsPanel({
  user,
  onAddToCart,
  products,
}: {
  user: UserProfile;
  onAddToCart: (products: Product[]) => void;
  products: Product[];
}) {
  const { user: authUser } = useAuth();
  const [subs, setSubs] = useState<SubscriptionRow[] | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SubscriptionRow | null>(null);
  const [saveOfferUsed, setSaveOfferUsed] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!authUser) { setSubs([]); return; }
    setSubs(await fetchSubscriptions(authUser.id));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const patch = async (sub: SubscriptionRow, p: Partial<SubscriptionRow>) => {
    setBusyId(sub.id);
    const ok = await updateSubscription(authUser!.id, sub.id, p);
    if (ok) {
      setSubs(prev => prev ? prev.map(s => s.id === sub.id ? { ...s, ...p } as SubscriptionRow : s) : prev);
    }
    setBusyId(null);
  };

  const skipNext = (sub: SubscriptionRow) =>
    patch(sub, { next_delivery: addDays(new Date(sub.next_delivery), sub.cadence_days).toISOString().slice(0, 10) });

  const deliverNow = (sub: SubscriptionRow) => {
    const product = products.find(p => p.id === sub.product_id);
    if (product) onAddToCart([product]);
    patch(sub, { next_delivery: addDays(new Date(sub.next_delivery), sub.cadence_days).toISOString().slice(0, 10) });
  };

  const dueSoon = (sub: SubscriptionRow) =>
    sub.status === 'active' && new Date(sub.next_delivery).getTime() - Date.now() < 7 * 86400000;

  const confirmCancel = async (accept: 'discount' | 'pause' | 'cancel') => {
    if (!cancelTarget) return;
    if (accept === 'discount') {
      // Save offer: 30% off next delivery — paused until the discount window,
      // labeled clearly. In production this issues a coupon code.
      setSaveOfferUsed(cancelTarget.id);
      await patch(cancelTarget, { status: 'active', next_delivery: addDays(new Date(cancelTarget.next_delivery), 14).toISOString().slice(0, 10) });
      setCancelTarget(null);
      return;
    }
    if (accept === 'pause') {
      await patch(cancelTarget, { status: 'paused' });
      setCancelTarget(null);
      return;
    }
    await patch(cancelTarget, { status: 'cancelled' });
    setCancelTarget(null);
  };

  return (
    <section aria-labelledby="subs-heading" className="bg-white/[0.06] p-5 rounded-2xl border border-white/10 shadow-sm space-y-3">
      <h2 id="subs-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-orange-400" aria-hidden="true" /> My Auto-Deliveries
      </h2>

      {subs === null ? (
        <p className="text-xs text-stone-400">Loading subscriptions…</p>
      ) : subs.length === 0 ? (
        <p className="text-xs text-stone-400 p-4 bg-white/[0.05] rounded-xl border border-white/10">
          No auto-deliveries yet. Tick <strong>"Auto-Delivery (Save 15%)"</strong> on any cart item at checkout and it
          appears here — pause, skip, or reschedule anytime. No lock-in, ever.
        </p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {subs.map(sub => {
            const due = dueSoon(sub);
            return (
              <li
                key={sub.id}
                className={cn(
                  'p-3.5 rounded-xl border space-y-2',
                  due ? 'bg-amber-500/10 border-amber-500/25' : 'bg-white/[0.05] border-white/10'
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#f4f2ec]">{sub.product_name}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                    sub.status === 'active' ? 'bg-orange-500/10 text-orange-300 border-orange-500/25' : 'bg-white/[0.05] text-stone-400 border-white/10'
                  )}>
                    {sub.status}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-flex items-center gap-1 font-semibold', due && 'text-amber-300')}>
                    <Truck className="w-3 h-3" aria-hidden="true" />
                    {sub.status === 'paused' ? 'Paused' : `Next delivery: ${format(new Date(sub.next_delivery), 'MMM d')}`}
                    {due && ' — due soon'}
                  </span>
                  <span>• every {sub.cadence_days} days</span>
                </div>

                {due && sub.status === 'active' && (
                  <button
                    onClick={() => deliverNow(sub)}
                    className="px-3 py-1.5 bg-[#785328] hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <FastForward className="w-3 h-3" aria-hidden="true" /> Deliver now — reorder in one click
                  </button>
                )}

                {sub.status !== 'cancelled' && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => patch(sub, { status: 'paused' })}
                        disabled={busyId === sub.id}
                        className="btn-stone px-2.5 py-1 text-[10px] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Pause className="w-3 h-3" aria-hidden="true" /> Pause
                      </button>
                    )}
                    {sub.status === 'paused' && (
                      <button
                        onClick={() => patch(sub, { status: 'active' })}
                        disabled={busyId === sub.id}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-orange-500/25 bg-orange-500/10 text-orange-300 hover:bg-[#e6efe7] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Play className="w-3 h-3" aria-hidden="true" /> Resume
                      </button>
                    )}
                    {sub.status === 'active' && (
                      <button
                        onClick={() => skipNext(sub)}
                        disabled={busyId === sub.id}
                        className="btn-stone px-2.5 py-1 text-[10px] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <FastForward className="w-3 h-3" aria-hidden="true" /> Skip next
                      </button>
                    )}
                    <select
                      value={sub.cadence_days}
                      disabled={busyId === sub.id}
                      onChange={(e) => patch(sub, { cadence_days: Number(e.target.value) })}
                      aria-label={`Delivery cadence for ${sub.product_name}`}
                      className="px-2 py-1 text-[10px] rounded-lg border border-white/15 bg-white/[0.06] text-[#f4f2ec] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      {[14, 30, 45, 60, 90].map(d => <option key={d} value={d}>Every {d} days</option>)}
                    </select>
                    <button
                      onClick={() => setCancelTarget(sub)}
                      className="text-[10px] font-bold text-red-400 hover:underline ml-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[10px] text-stone-400 flex items-start gap-1.5">
        <ShieldCheck className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
        No lock-in: pause, skip, or cancel anytime — deliveries are simulated in this MVP, so nothing ships and no charge recurs.
      </p>

      {/* Cancel save-offer flow */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            className="bg-white/[0.06] rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-300">
              <CalendarX className="w-5 h-5" aria-hidden="true" />
              <h3 id="cancel-title" className="text-sm font-bold text-[#f4f2ec]">
                Before you cancel {cancelTarget.product_name}…
              </h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Most people cancel because of timing, not because the product stopped working. Take one of these instead:
            </p>

            <div className="space-y-2">
              {saveOfferUsed === cancelTarget.id ? (
                <div className="p-3 bg-orange-500/10 border border-orange-500/25 rounded-xl text-xs text-orange-300 font-bold flex items-center gap-2">
                  <Tag className="w-4 h-4" aria-hidden="true" />
                  30% off locked in — next delivery pushed 2 weeks so you can use it.
                </div>
              ) : (
                <button
                  onClick={() => confirmCancel('discount')}
                  className="w-full p-3 text-left rounded-xl border-2 border-orange-500 bg-orange-500/10 hover:bg-[#e6efe7] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" aria-hidden="true" /> Take 30% off your next delivery
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">Plus we'll push the next delivery 2 weeks out.</span>
                </button>
              )}

              {!saveOfferUsed && (
                <button
                  onClick={() => confirmCancel('pause')}
                  className="w-full p-3 text-left rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <span className="text-xs font-bold text-[#f4f2ec] flex items-center gap-1.5">
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Just pause it for now
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">Resume whenever you're ready — nothing is deleted.</span>
                </button>
              )}

              <button
                onClick={() => confirmCancel('cancel')}
                className="w-full p-3 text-left rounded-xl border border-red-500/25 bg-red-500/[0.06] hover:bg-red-500/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Cancel completely
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">Stops all future deliveries. You can re-subscribe anytime.</span>
              </button>
            </div>

            <button
              onClick={() => setCancelTarget(null)}
              className="w-full text-[11px] font-semibold text-stone-400 hover:text-[#f4f2ec] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            >
              Keep my subscription as it is
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

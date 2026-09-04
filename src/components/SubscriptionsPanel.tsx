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
    <section aria-labelledby="subs-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
      <h2 id="subs-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> My Auto-Deliveries
      </h2>

      {subs === null ? (
        <p className="text-xs text-[#6e6960]">Loading subscriptions…</p>
      ) : subs.length === 0 ? (
        <p className="text-xs text-[#5c5851] p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
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
                  due ? 'bg-[#faf5ee] border-[#ede1cf]' : 'bg-[#faf9f6] border-[#ebe7df]'
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#181716]">{sub.product_name}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                    sub.status === 'active' ? 'bg-[#f1f5f2] text-[#2b4530] border-[#dbe5dc]' : 'bg-[#f5f4ef] text-[#5c5851] border-[#e6e4dc]'
                  )}>
                    {sub.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#5c5851] flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-flex items-center gap-1 font-semibold', due && 'text-[#785328]')}>
                    <Truck className="w-3 h-3" aria-hidden="true" />
                    {sub.status === 'paused' ? 'Paused' : `Next delivery: ${format(new Date(sub.next_delivery), 'MMM d')}`}
                    {due && ' — due soon'}
                  </span>
                  <span>• every {sub.cadence_days} days</span>
                </div>

                {due && sub.status === 'active' && (
                  <button
                    onClick={() => deliverNow(sub)}
                    className="px-3 py-1.5 bg-[#785328] hover:bg-[#654621] text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#785328]"
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
                        className="btn-stone px-2.5 py-1 text-[10px] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                      >
                        <Pause className="w-3 h-3" aria-hidden="true" /> Pause
                      </button>
                    )}
                    {sub.status === 'paused' && (
                      <button
                        onClick={() => patch(sub, { status: 'active' })}
                        disabled={busyId === sub.id}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-[#dbe5dc] bg-[#f1f5f2] text-[#2b4530] hover:bg-[#e6efe7] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                      >
                        <Play className="w-3 h-3" aria-hidden="true" /> Resume
                      </button>
                    )}
                    {sub.status === 'active' && (
                      <button
                        onClick={() => skipNext(sub)}
                        disabled={busyId === sub.id}
                        className="btn-stone px-2.5 py-1 text-[10px] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                      >
                        <FastForward className="w-3 h-3" aria-hidden="true" /> Skip next
                      </button>
                    )}
                    <select
                      value={sub.cadence_days}
                      disabled={busyId === sub.id}
                      onChange={(e) => patch(sub, { cadence_days: Number(e.target.value) })}
                      aria-label={`Delivery cadence for ${sub.product_name}`}
                      className="px-2 py-1 text-[10px] rounded-lg border border-[#dedad0] bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#181716] cursor-pointer"
                    >
                      {[14, 30, 45, 60, 90].map(d => <option key={d} value={d}>Every {d} days</option>)}
                    </select>
                    <button
                      onClick={() => setCancelTarget(sub)}
                      className="text-[10px] font-bold text-[#8c3232] hover:underline ml-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] rounded"
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

      <p className="text-[10px] text-[#6e6960] flex items-start gap-1.5">
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
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#ebe7df] space-y-4"
          >
            <div className="flex items-center gap-2 text-[#785328]">
              <CalendarX className="w-5 h-5" aria-hidden="true" />
              <h3 id="cancel-title" className="text-sm font-bold text-[#181716]">
                Before you cancel {cancelTarget.product_name}…
              </h3>
            </div>
            <p className="text-xs text-[#5c5851] leading-relaxed">
              Most people cancel because of timing, not because the product stopped working. Take one of these instead:
            </p>

            <div className="space-y-2">
              {saveOfferUsed === cancelTarget.id ? (
                <div className="p-3 bg-[#f1f5f2] border border-[#dbe5dc] rounded-xl text-xs text-[#2b4530] font-bold flex items-center gap-2">
                  <Tag className="w-4 h-4" aria-hidden="true" />
                  30% off locked in — next delivery pushed 2 weeks so you can use it.
                </div>
              ) : (
                <button
                  onClick={() => confirmCancel('discount')}
                  className="w-full p-3 text-left rounded-xl border-2 border-[#344a37] bg-[#f1f5f2] hover:bg-[#e6efe7] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                >
                  <span className="text-xs font-bold text-[#2b4530] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" aria-hidden="true" /> Take 30% off your next delivery
                  </span>
                  <span className="text-[11px] text-[#5c5851] block mt-0.5">Plus we'll push the next delivery 2 weeks out.</span>
                </button>
              )}

              {!saveOfferUsed && (
                <button
                  onClick={() => confirmCancel('pause')}
                  className="w-full p-3 text-left rounded-xl border border-[#ebe7df] bg-white hover:bg-[#faf9f6] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                >
                  <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Just pause it for now
                  </span>
                  <span className="text-[11px] text-[#5c5851] block mt-0.5">Resume whenever you're ready — nothing is deleted.</span>
                </button>
              )}

              <button
                onClick={() => confirmCancel('cancel')}
                className="w-full p-3 text-left rounded-xl border border-[#f5d5d5] bg-[#fffbfa] hover:bg-[#fdf2f2] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232]"
              >
                <span className="text-xs font-bold text-[#8c3232] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Cancel completely
                </span>
                <span className="text-[11px] text-[#5c5851] block mt-0.5">Stops all future deliveries. You can re-subscribe anytime.</span>
              </button>
            </div>

            <button
              onClick={() => setCancelTarget(null)}
              className="w-full text-[11px] font-semibold text-[#5c5851] hover:text-[#181716] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
            >
              Keep my subscription as it is
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

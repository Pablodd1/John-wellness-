import React, { useEffect, useState } from 'react';
import { UserProfile, Product } from '../types';
import { useAuth } from '../lib/auth';
import { fetchMyOrders } from '../lib/dataService';
import { GOAL_OPTIONS } from '../lib/matchScore';
import { MOCK_PRODUCTS } from '../data';
import { format } from 'date-fns';
import { ShoppingBag, RefreshCw, Target, PackageOpen, Check } from 'lucide-react';
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
  const [reordered, setReordered] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (authUser) {
      fetchMyOrders(authUser.id).then((rows) => {
        if (!cancelled) setOrders(rows as OrderRow[]);
      });
    } else if (!cancelled) {
      setOrders([]);
    }
    return () => { cancelled = true; };
  }, [authUser]);

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
      <section aria-labelledby="orders-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
        <h2 id="orders-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Order History
        </h2>
        {orders === null ? (
          <p className="text-xs text-[#6e6960]">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-[#5c5851] p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            No orders yet. {authUser ? 'Everything you check out will appear here with one-click reorder.' : 'Sign in to have orders saved to your account.'}
          </p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {orders.map((order) => (
              <li key={order.id} className="p-3.5 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#181716]">#{order.order_number}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold border',
                    order.fulfillment_status === 'processing' ? 'bg-[#faf5ee] text-[#785328] border-[#ede1cf]' : 'bg-[#f1f5f2] text-[#2b4530] border-[#dbe5dc]'
                  )}>
                    {order.fulfillment_status}
                  </span>
                </div>
                <p className="text-[11px] text-[#5c5851]">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                  {order.shipping_address?.city ? ` • ${order.shipping_address.city}, ${order.shipping_address.state}` : ''}
                  {' • '}$&nbsp;{Number(order.total).toFixed(2)}
                  <span className="text-[#8a857b]"> (payment simulated)</span>
                </p>
                <ul className="text-[11px] text-[#5c5851]">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${idx}`} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#344a37] flex-shrink-0" aria-hidden="true" />
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => reorder(order)}
                  disabled={reordered === order.order_number}
                  className="btn-stone px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
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

      {/* Goals — feeds the match engine */}
      <section aria-labelledby="goals-heading" className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
        <h2 id="goals-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <Target className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> My Goals
        </h2>
        <p className="text-[11px] text-[#5c5851] leading-relaxed">
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
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]',
                  active
                    ? 'bg-[#344a37] text-white border-[#344a37]'
                    : 'bg-white text-[#5c5851] border-[#dedad0] hover:bg-[#f6f4ee]'
                )}
              >
                {goal}
              </button>
            );
          })}
        </div>
        {Array.isArray(user.goals) && user.goals.length > 0 && (
          <p className="text-[10px] text-[#2b4530] font-semibold flex items-center gap-1.5 p-2 rounded-lg bg-[#f1f5f2] border border-[#dbe5dc]">
            <PackageOpen className="w-3 h-3" aria-hidden="true" />
            {user.goals.length} goal{user.goals.length > 1 ? 's' : ''} active — marketplace sorting is personalized.
          </p>
        )}
        <p className="text-[10px] text-[#5c5851] p-2 rounded-lg bg-[#faf5ee] border border-[#ede1cf]">
          <span className="font-bold text-[#785328]">Loyalty balance: {(authProfile?.loyalty_points ?? 0).toLocaleString()} pts</span>
          {' '}— earn 1 pt per $1; redeem 100 pts for $5 off at checkout.
        </p>
      </section>
    </div>
  );
}

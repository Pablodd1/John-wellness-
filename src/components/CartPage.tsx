import React from 'react';
import { Product, UserProfile } from '../types';
import { CartItem } from './CartDrawer';
import {
  ShoppingCart,
  Pill,
  Clock,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Repeat,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * THE CART — a full page (not a drawer): everything the regimen math says the
 * patient should buy next (pending-to-buy, driven by days left in each bottle
 * at the current daily dose), plus the live cart. Checkout itself reuses the
 * slide-over drawer's 3-step flow via onCheckout().
 */

interface CartPageProps {
  user: UserProfile;
  cartItems: CartItem[];
  onAddToCart: (products: Product[]) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleSubscription: (productId: string, isSub: boolean, freq?: '30' | '45' | '60' | '90') => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onExplore: () => void;
}

type Urgency = 'now' | 'soon' | 'plan';

type PendingItem = {
  product: Product;
  days: number;
  urgency: Urgency;
  suggestedQty: number;
};

const URGENCY_STYLES: Record<Urgency, { label: string; badge: string; reason: string }> = {
  now: {
    label: 'Buy now',
    badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    reason: 'Runs out this week at your current daily dose',
  },
  soon: {
    label: 'Buy soon',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    reason: 'Low supply — order in the next few days to avoid a gap',
  },
  plan: {
    label: 'Plan ahead',
    badge: 'bg-white/[0.08] text-stone-300 border-white/15',
    reason: 'Enough for about two more weeks — time to reorder',
  },
};

export function CartPage({
  user,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onToggleSubscription,
  onRemoveItem,
  onCheckout,
  onExplore,
}: CartPageProps) {
  const pending: PendingItem[] = user.inventory
    .filter((p) => typeof p.daysRemaining === 'number')
    .map((p) => ({ product: p, days: p.daysRemaining as number }))
    .filter(({ days }) => days <= 21)
    .sort((a, b) => a.days - b.days)
    .map(({ product, days }) => ({
      product,
      days,
      urgency: (days <= 7 ? 'now' : days <= 14 ? 'soon' : 'plan') as Urgency,
      // Cold-chain ships fast, but two bottles when the bottle is nearly empty
      // bridges the delivery window without over-stocking.
      suggestedQty: days <= 7 ? 2 : 1,
    }));

  const inCart = (id: string) => cartItems.some((ci) => ci.product.id === id);

  const pendingEstimate = pending.reduce(
    (sum, p) => sum + (p.product.price || 49) * p.suggestedQty,
    0
  );

  const subtotal = cartItems.reduce((sum, item) => {
    const base = item.product.price || 49;
    return sum + (item.isSubscription ? base * 0.85 : base) * item.quantity;
  }, 0);
  const freeShipping = subtotal >= 99 || subtotal === 0;

  const addToCart = (p: PendingItem) => {
    // The add button never shows for items already in the cart, so setting the
    // absolute quantity right after the add lands exactly on the suggestion.
    onAddToCart([p.product]);
    onUpdateQuantity(p.product.id, p.suggestedQty);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#f4f2ec] font-serif-title flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-400" aria-hidden="true" />
          The Cart
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          What to buy next, worked out from your daily dose and how much is left in
          each bottle — then your live cart, ready for checkout.
        </p>
      </div>

      {/* ---- SECTION 1: PENDING TO BUY (from regimen dosage & bottle remaining) ---- */}
      <section aria-labelledby="pending-buy-heading" className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 id="pending-buy-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" aria-hidden="true" />
            Pending to buy
            <span className="text-[11px] font-medium text-stone-400">
              ({pending.length} {pending.length === 1 ? 'item' : 'items'} running low)
            </span>
          </h2>
          {pending.length > 0 && (
            <span className="text-[11px] font-mono text-stone-400">
              Suggested order ≈ ${pendingEstimate.toFixed(0)}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-orange-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-[#f4f2ec]">Nothing is running low</p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto">
              Every bottle in your regimen has more than three weeks of supply at your
              current dose. We'll surface refills here as the count drops.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map(({ product, days, urgency, suggestedQty }) => {
              const style = URGENCY_STYLES[urgency];
              const added = inCart(product.id);
              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-white/10 bg-white/[0.05] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="badge-clinical text-[10px]">{product.category}</span>
                      <h3 className="text-xs font-semibold text-[#f4f2ec] leading-snug mt-1">
                        {product.name}
                      </h3>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0', style.badge)}>
                      {style.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Pill className="w-3 h-3 text-orange-400" aria-hidden="true" />
                      {product.dailyDosage || '1 serving'} daily
                    </span>
                    {product.timing && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" aria-hidden="true" />
                        {product.timing}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-[#f4f2ec]">
                      <AlertTriangle className="w-3 h-3 text-orange-400" aria-hidden="true" />
                      {days} {days === 1 ? 'day' : 'days'} left
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400">{style.reason}</p>

                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <span className="text-xs font-bold text-[#f4f2ec]">
                      ${(product.price || 49).toFixed(2)}
                      <span className="text-[10px] font-medium text-stone-400 ml-1">
                        × {suggestedQty} suggested
                      </span>
                    </span>
                    {added ? (
                      <span className="text-[11px] font-semibold text-orange-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> In cart
                      </span>
                    ) : (
                      <button
                        onClick={() => addToCart({ product, days, urgency, suggestedQty })}
                        className="px-3 py-1.5 bg-orange-600 opacity-85 hover:opacity-100 hover:bg-orange-500 text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        Add {suggestedQty} to cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---- SECTION 2: LIVE CART ---- */}
      <section aria-labelledby="live-cart-heading" className="space-y-3">
        <h2 id="live-cart-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-orange-400" aria-hidden="true" />
          Your cart
          <span className="text-[11px] font-medium text-stone-400">
            ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)
          </span>
        </h2>

        {cartItems.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 text-center">
            <ShoppingBag className="w-6 h-6 text-stone-500 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-[#f4f2ec]">Your cart is empty</p>
            <p className="text-[11px] text-stone-400 mt-1 mb-4">
              Add refills from the pending list above, or browse the full catalog.
            </p>
            <button
              onClick={onExplore}
              className="px-4 py-2 bg-orange-600 opacity-85 hover:opacity-100 text-white rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Browse the marketplace
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.05] divide-y divide-white/[0.06]">
            {cartItems.map((item) => {
              const base = item.product.price || 49;
              const price = item.isSubscription ? base * 0.85 : base;
              return (
                <div key={item.product.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="badge-clinical text-[10px]">{item.product.category}</span>
                      <h3 className="text-xs font-semibold text-[#f4f2ec] leading-snug mt-1">
                        {item.product.name}
                      </h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[#f4f2ec]">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                      {item.isSubscription && (
                        <span className="block text-[10px] text-orange-300 font-semibold">-15% sub</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center border border-white/10 rounded-md bg-white/[0.06] overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="p-1.5 hover:bg-white/[0.04] text-stone-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <span className="px-3 text-xs font-mono text-[#f4f2ec]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className="p-1.5 hover:bg-white/[0.04] text-stone-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.isSubscription}
                        onChange={(e) => onToggleSubscription(item.product.id, e.target.checked, item.frequency)}
                        className="w-3.5 h-3.5 accent-orange-500 rounded"
                      />
                      <span className="text-[11px] font-medium text-[#f4f2ec] flex items-center gap-1">
                        <Repeat className="w-3 h-3 text-stone-400" aria-hidden="true" />
                        Auto-delivery (save 15%)
                      </span>
                    </label>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-500 hover:text-red-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Totals + checkout hand-off to the drawer's 3-step flow */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                  {freeShipping ? 'Cold-chain shipping: free' : 'Free cold-chain shipping at $99'}
                </span>
                <span className="font-semibold text-[#f4f2ec]">Subtotal ${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                <span>Review &amp; checkout (${subtotal.toFixed(2)})</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <p className="text-[10px] text-stone-500 text-center">
                Checkout opens the secure drawer: address, test-mode payment, order saved to your account.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

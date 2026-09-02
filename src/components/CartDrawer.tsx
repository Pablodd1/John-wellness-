import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, UserProfile } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Tag,
  Repeat,
  MapPin,
  CreditCard,
  FlaskConical,
} from 'lucide-react';
import { CuasarLogo } from './CuasarLogo';
import { cn } from '../lib/utils';
import { useDialogBehavior } from '../lib/useDialog';
import { useAuth } from '../lib/auth';
import { createOrder } from '../lib/dataService';

export interface CartItem {
  product: Product;
  quantity: number;
  isSubscription: boolean;
  frequency: '30' | '45' | '60' | '90';
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleSubscription: (productId: string, isSub: boolean, freq?: '30' | '45' | '60' | '90') => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: UserProfile;
}

type CheckoutStep = 'cart' | 'address' | 'payment';

type OrderConfirmation = {
  orderNumber: string;
  persisted: boolean;
  notice: string | null;
  address: string;
  total: string;
  itemsCount: number;
};

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onToggleSubscription,
  onRemoveItem,
  onClearCart,
  user,
}: CartDrawerProps) {
  const { user: authUser } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [freeShipOverride, setFreeShipOverride] = useState(false);

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [placing, setPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderConfirmation | null>(null);

  // Address form
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  useDialogBehavior({
    containerRef: drawerRef,
    active: isOpen && !orderConfirmed,
    onEscape: placing ? undefined : () => {
      if (step !== 'cart') { setStep('cart'); return; }
      onClose();
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const basePrice = item.product.price || 49.00;
    const itemPrice = item.isSubscription ? basePrice * 0.85 : basePrice;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const shippingThreshold = 99;
  const freeShipping = freeShipOverride || subtotal >= shippingThreshold || subtotal === 0;
  const shippingCost = freeShipping ? 0 : 9.99;
  const discountAmount = subtotal * appliedDiscount;
  const estimatedTax = (subtotal - discountAmount) * 0.0825;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);
  const itemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'LONGEVITY20') {
      setAppliedDiscount(0.20);
      setPromoMessage('20% Longevity VIP discount applied.');
    } else if (clean === 'BIOHACK15') {
      setAppliedDiscount(0.15);
      setPromoMessage('15% Biohacker discount applied.');
    } else if (clean === 'FREESHIP') {
      setFreeShipOverride(true);
      setAppliedDiscount(0.05);
      setPromoMessage('5% discount applied and shipping is now free.');
    } else {
      setPromoMessage('Invalid promo code. Try LONGEVITY20, BIOHACK15, or FREESHIP.');
    }
  };

  const validateAddress = (): string | null => {
    if (!fullName.trim()) return 'Enter the full name for delivery.';
    if (!email.trim() || !email.includes('@')) return 'Enter a valid email for order updates.';
    if (!street.trim()) return 'Enter a street address.';
    if (!city.trim()) return 'Enter a city.';
    if (!stateCode.trim()) return 'Enter a state.';
    if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) return 'Enter a valid ZIP code (e.g. 78701).';
    return null;
  };

  const handleAddressContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAddress();
    setAddressError(err);
    if (!err) setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (placing || !authUser) return;
    setPlacing(true);
    const address = {
      name: fullName.trim(),
      street: street.trim(),
      apt: apt.trim(),
      city: city.trim(),
      state: stateCode.trim(),
      zip: zip.trim(),
    };
    const result = await createOrder(
      authUser.id,
      authUser.email ?? null,
      cartItems,
      { subtotal, discount: discountAmount, tax: estimatedTax, shipping: shippingCost, total: grandTotal },
      address
    );
    setOrderConfirmed({
      orderNumber: result.orderNumber,
      persisted: result.persisted,
      notice: result.error ?? null,
      address: `${address.street}${address.apt ? `, ${address.apt}` : ''}, ${address.city}, ${address.state} ${address.zip}`,
      total: grandTotal.toFixed(2),
      itemsCount,
    });
    setPlacing(false);
    onClearCart();
    setStep('cart');
  };

  const stepIndicator = (
    <ol className="flex items-center gap-1.5 text-[10px] font-bold" aria-label="Checkout progress">
      {(['cart', 'address', 'payment'] as CheckoutStep[]).map((s, i) => {
        const labels = { cart: 'Cart', address: 'Address', payment: 'Payment' };
        const active = step === s;
        const done = ['cart', 'address', 'payment'].indexOf(step) > i;
        return (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'px-2 py-0.5 rounded-md border',
                active ? 'bg-[#181716] text-white border-[#181716]'
                  : done ? 'bg-[#f1f5f2] text-[#2b4530] border-[#dbe5dc]'
                  : 'bg-white text-[#6e6960] border-[#ebe7df]'
              )}
            >
              {i + 1}. {labels[s]}
            </span>
            {i < 2 && <span className="text-[#dedad0]" aria-hidden="true">›</span>}
          </li>
        );
      })}
    </ol>
  );

  const input = 'w-full px-3 py-2 rounded-lg text-xs bg-[#fbfaf8] border border-[#e5e1d7] focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white';
  const label = 'block text-[11px] font-bold text-[#181716] mb-1';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={placing ? undefined : onClose}
              className="fixed inset-0 bg-black z-50"
            />

            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart and checkout"
              tabIndex={-1}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col border-l border-[#ebe7df] overflow-hidden focus:outline-none"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#f4f2ec] flex-shrink-0 gap-2">
                <CuasarLogo size="sm" showSubtitle={true} />
                <div className="flex items-center gap-2">
                  {step !== 'cart' && stepIndicator}
                  <button
                    onClick={() => (step !== 'cart' ? setStep('cart') : onClose())}
                    aria-label="Close cart"
                    className="p-1 text-[#8a857b] hover:text-[#181716] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* ---- ADDRESS STEP ---- */}
              {step === 'address' && (
                <form onSubmit={handleAddressContinue} className="flex-1 overflow-y-auto p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[#181716] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Delivery address
                  </h3>

                  <div>
                    <label htmlFor="co-name" className={label}>Full name <span className="text-[#8c3232]">*</span></label>
                    <input id="co-name" className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="co-email" className={label}>Email for order updates <span className="text-[#8c3232]">*</span></label>
                    <input id="co-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <div>
                    <label htmlFor="co-street" className={label}>Street address <span className="text-[#8c3232]">*</span></label>
                    <input id="co-street" className={input} value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line1" placeholder="450 Mission St" />
                  </div>
                  <div>
                    <label htmlFor="co-apt" className={label}>Apt / Suite <span className="font-normal text-[#6e6960]">(optional)</span></label>
                    <input id="co-apt" className={input} value={apt} onChange={(e) => setApt(e.target.value)} autoComplete="address-line2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label htmlFor="co-city" className={label}>City <span className="text-[#8c3232]">*</span></label>
                      <input id="co-city" className={input} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label htmlFor="co-state" className={label}>State <span className="text-[#8c3232]">*</span></label>
                      <input id="co-state" className={input} value={stateCode} onChange={(e) => setStateCode(e.target.value)} autoComplete="address-level1" placeholder="TX" />
                    </div>
                    <div>
                      <label htmlFor="co-zip" className={label}>ZIP <span className="text-[#8c3232]">*</span></label>
                      <input id="co-zip" className={input} value={zip} onChange={(e) => setZip(e.target.value)} autoComplete="postal-code" placeholder="78701" inputMode="numeric" />
                    </div>
                  </div>

                  {addressError && (
                    <p role="alert" className="text-[11px] text-[#8c3232] font-bold p-2.5 rounded-lg border border-[#f5d5d5] bg-[#fdf2f2]">{addressError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
                  >
                    Continue to payment <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-full text-[11px] font-semibold text-[#5c5851] hover:text-[#181716] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
                  >
                    ← Back to cart
                  </button>
                </form>
              )}

              {/* ---- PAYMENT STEP (SIMULATED) ---- */}
              {step === 'payment' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <h3 className="text-sm font-bold text-[#181716] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Payment
                  </h3>

                  <p className="text-[11px] text-[#785328] font-semibold p-3 rounded-xl border border-[#ede1cf] bg-[#faf5ee] flex items-start gap-2">
                    <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Test mode — no real charge.</strong> Stripe isn't connected yet, so this checkout runs a
                      full simulation: your order and address are saved to the database with payment marked
                      "test_simulated". When Stripe is added, this step becomes a real card form and nothing else changes.
                    </span>
                  </p>

                  <div className="p-4 rounded-xl border border-[#ebe7df] bg-[#faf9f6] space-y-2" aria-label="Simulated card details">
                    <span className="text-[11px] font-bold text-[#181716] block">Simulated card on file</span>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#5c5851]">
                      <CreditCard className="w-4 h-4 text-[#8a857b]" aria-hidden="true" />
                      <span>•••• •••• •••• 4242</span>
                      <span className="ml-auto text-[10px] text-[#6e6960]">TEST CARD</span>
                    </div>
                    <div className="flex gap-2 text-[10px] text-[#6e6960]">
                      <span>Exp 12/29</span><span>CVC •••</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#5c5851] border-t border-[#ebe7df] pt-3">
                    <div className="flex justify-between"><span>Items ({itemsCount})</span><span className="font-semibold text-[#181716]">${subtotal.toFixed(2)}</span></div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-[#2b4530] font-medium"><span>Discount ({(appliedDiscount * 100).toFixed(0)}%)</span><span>-${discountAmount.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? <strong className="text-[#2b4530]">Free</strong> : `$${shippingCost.toFixed(2)}`}</span></div>
                    <div className="flex justify-between"><span>Estimated tax</span><span>${estimatedTax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm font-bold text-[#181716] pt-2 border-t border-[#ebe7df]">
                      <span>Total (simulated)</span><span className="text-base">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
                  >
                    {placing ? (
                      <span>Saving your order…</span>
                    ) : (
                      <><Zap className="w-3.5 h-3.5 text-[#dedad0]" aria-hidden="true" /> Place order — simulated payment</>
                    )}
                  </button>
                  <button
                    onClick={() => setStep('address')}
                    disabled={placing}
                    className="w-full text-[11px] font-semibold text-[#5c5851] hover:text-[#181716] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded disabled:opacity-50"
                  >
                    ← Back to address
                  </button>
                </div>
              )}

              {/* ---- CART STEP ---- */}
              {step === 'cart' && (
                <>
                  {/* Free Shipping Line */}
                  <div className="bg-[#faf9f6] border-b border-[#ebe7df] px-4 py-2.5 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#5c5851] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#344a37]" aria-hidden="true" />
                        {freeShipping ? (
                          <span className="text-[#2b4530] font-semibold">Complimentary cold-chain shipping unlocked</span>
                        ) : (
                          <span>Add ${(shippingThreshold - subtotal).toFixed(2)} for <strong>free cold-chain shipping</strong></span>
                        )}
                      </span>
                      <span className="font-mono text-[11px] text-[#8a857b]">
                        ${subtotal.toFixed(0)} / ${shippingThreshold}
                      </span>
                    </div>
                    <div className="w-full bg-[#ebe7df] h-1 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className="bg-[#181716] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#f4f2ec]">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8a857b]">
                        <ShoppingBag className="w-8 h-8 text-[#dedad0] mb-2" aria-hidden="true" />
                        <h3 className="text-sm font-semibold text-[#181716] mb-1">Your cart is empty</h3>
                        <p className="text-xs text-[#6e6960] max-w-xs mb-4">
                          Select protocols, clinical micronutrients, or diagnostic panels to begin.
                        </p>
                        <button
                          onClick={onClose}
                          className="px-4 py-2 bg-[#181716] text-white rounded-lg text-xs font-semibold hover:bg-[#2e2c29] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                        >
                          Explore Formulations
                        </button>
                      </div>
                    ) : (
                      cartItems.map(item => {
                        const basePrice = item.product.price || 49.00;
                        const price = item.isSubscription ? basePrice * 0.85 : basePrice;
                        return (
                          <div key={item.product.id} className="pt-3 first:pt-0 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="badge-clinical text-[10px]">
                                    {item.product.category}
                                  </span>
                                </div>
                                <h4 className="text-xs font-semibold text-[#181716] leading-snug">
                                  {item.product.name}
                                </h4>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-bold text-[#181716]">
                                  ${(price * item.quantity).toFixed(2)}
                                </span>
                                {item.isSubscription && (
                                  <span className="block text-[10px] text-[#2b4530] font-semibold">
                                    -15% Sub
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Subscription Cadence Selector */}
                            <div className="bg-[#faf9f6] p-2 rounded-lg border border-[#ebe7df] flex items-center justify-between text-xs">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={item.isSubscription}
                                  onChange={(e) => onToggleSubscription(item.product.id, e.target.checked, item.frequency)}
                                  className="w-3.5 h-3.5 accent-[#181716] rounded"
                                />
                                <span className="text-[11px] font-medium text-[#181716] flex items-center gap-1">
                                  <Repeat className="w-3 h-3 text-[#6e6960]" aria-hidden="true" />
                                  Auto-Delivery (Save 15%)
                                </span>
                              </label>

                              {item.isSubscription && (
                                <select
                                  value={item.frequency}
                                  onChange={(e) => onToggleSubscription(item.product.id, true, e.target.value as CartItem['frequency'])}
                                  aria-label={`Delivery frequency for ${item.product.name}`}
                                  className="text-[11px] bg-white border border-[#dedad0] rounded px-1.5 py-0.5 text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#181716] cursor-pointer"
                                >
                                  <option value="30">Every 30 Days</option>
                                  <option value="45">Every 45 Days</option>
                                  <option value="60">Every 60 Days</option>
                                </select>
                              )}
                            </div>

                            {/* Quantity & Remove */}
                            <div className="flex items-center justify-between pt-0.5">
                              <div className="flex items-center border border-[#ebe7df] rounded-md bg-white overflow-hidden">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                  aria-label={`Decrease quantity of ${item.product.name}`}
                                  className="p-1 hover:bg-[#f4f2ec] text-[#5c5851] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                                >
                                  <Minus className="w-3 h-3" aria-hidden="true" />
                                </button>
                                <span className="px-2.5 text-xs font-mono text-[#181716]" aria-live="polite">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.product.name}`}
                                  className="p-1 hover:bg-[#f4f2ec] text-[#5c5851] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                                >
                                  <Plus className="w-3 h-3" aria-hidden="true" />
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-[#8a857b] hover:text-[#8c3232] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {cartItems.length > 0 && (
                    <div className="bg-[#faf9f6] border-t border-[#ebe7df] p-4 space-y-3 flex-shrink-0">
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <div className="relative flex-1">
                          <label htmlFor="promo-input" className="sr-only">Promo code</label>
                          <Tag className="w-3.5 h-3.5 text-[#8a857b] absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                          <input
                            id="promo-input"
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Promo: LONGEVITY20"
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-[#dedad0] rounded-lg uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#181716] font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
                        >
                          Apply
                        </button>
                      </form>

                      {promoMessage && (
                        <p className={cn(
                          "text-[11px] font-medium",
                          appliedDiscount > 0 ? "text-[#2b4530]" : "text-[#8c3232]"
                        )} role="status">
                          {promoMessage}
                        </p>
                      )}

                      <div className="space-y-1 text-xs text-[#5c5851]">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-[#181716]">${subtotal.toFixed(2)}</span>
                        </div>
                        {appliedDiscount > 0 && (
                          <div className="flex justify-between text-[#2b4530] font-medium">
                            <span>Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Cold-Chain Courier</span>
                          <span>{shippingCost === 0 ? <strong className="text-[#2b4530]">Complimentary</strong> : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Tax</span>
                          <span>${estimatedTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#181716] pt-2 border-t border-[#ebe7df]">
                          <span>Total Due</span>
                          <span className="text-base">${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {!authUser ? (
                        <p className="text-[11px] text-[#8c3232] font-semibold p-2.5 rounded-lg border border-[#f5d5d5] bg-[#fdf2f2] text-center">
                          Sign in to place an order — your cart needs an account so it's saved and tracked.
                        </p>
                      ) : (
                        <button
                          onClick={() => setStep('address')}
                          className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
                        >
                          <span>Checkout (${grandTotal.toFixed(2)})</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}

                      <div className="flex items-center justify-center gap-4 text-[10px] text-[#8a857b]">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#344a37]" aria-hidden="true" /> Test-mode checkout — no real charge
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {orderConfirmed && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-confirm-title"
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#ebe7df] space-y-4"
            >
              <div className="w-10 h-10 bg-[#f1f5f2] text-[#2b4530] rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>

              <div className="text-center space-y-1">
                <h3 id="order-confirm-title" className="text-base font-bold text-[#181716]">
                  Order placed
                </h3>
                <p className="text-xs text-[#6e6960]">
                  Your order was saved and set to <strong>processing</strong>. Fulfillment is simulated in this MVP —
                  nothing ships and <strong>no charge was made</strong>.
                </p>
                <div className="inline-block bg-[#faf9f6] text-[#181716] text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md mt-1 border border-[#ebe7df]">
                  Order #{orderConfirmed.orderNumber}
                </div>
              </div>

              <div className="bg-[#faf9f6] rounded-xl p-3.5 border border-[#ebe7df] space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6e6960] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-[#5c5851]">{orderConfirmed.address}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#ebe7df]">
                  <span className="text-[#6e6960]">Items:</span>
                  <span className="font-semibold text-[#181716]">{orderConfirmed.itemsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6960]">Payment:</span>
                  <span className="font-semibold text-[#785328]">Simulated (test mode)</span>
                </div>
                <div className="flex justify-between font-bold text-[#181716] pt-1 border-t border-[#ebe7df]">
                  <span>Order total:</span>
                  <span>${orderConfirmed.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6960]">Saved to database:</span>
                  <span className={cn('font-semibold', orderConfirmed.persisted ? 'text-[#2b4530]' : 'text-[#8c3232]')}>
                    {orderConfirmed.persisted ? 'Yes — visible on your account' : 'No — demo mode only'}
                  </span>
                </div>
              </div>

              {orderConfirmed.notice && (
                <p role="status" className="text-[11px] text-[#785328] p-2.5 rounded-lg border border-[#ede1cf] bg-[#faf5ee]">
                  {orderConfirmed.notice}
                </p>
              )}

              <button
                onClick={() => {
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="w-full py-2 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
              >
                Return to Storefront
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

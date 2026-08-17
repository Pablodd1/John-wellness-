import React, { useState } from 'react';
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
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  Repeat,
  Package,
  MapPin,
  Clock
} from 'lucide-react';
import { CuasarLogo } from './CuasarLogo';
import { cn } from '../lib/utils';

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
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  const subtotal = cartItems.reduce((sum, item) => {
    const basePrice = item.product.price || 49.00;
    const itemPrice = item.isSubscription ? basePrice * 0.85 : basePrice;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const shippingThreshold = 99;
  const freeShipping = subtotal >= shippingThreshold || subtotal === 0;
  const shippingCost = freeShipping ? 0 : 9.99;
  const discountAmount = subtotal * appliedDiscount;
  const estimatedTax = (subtotal - discountAmount) * 0.0825;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);

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
      setAppliedDiscount(0.05);
      setPromoMessage('Free Shipping + 5% bonus applied.');
    } else {
      setPromoMessage('Invalid promo code. Try LONGEVITY20.');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      const orderNumber = `CX-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderConfirmed({
        orderNumber,
        itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        total: grandTotal.toFixed(2),
        deliveryDate: 'Tomorrow by 10:30 AM',
        deliveryAddress: user.lifestylePersona === 'High-Stress Executive / Zero-Time' 
          ? '450 Mission St, Suite 2100, San Francisco, CA 94105' 
          : '800 Brazos St, Penthouse B, Austin, TX 78701',
        trackingNumber: `1Z99999999${Math.floor(10000000 + Math.random() * 90000000)}`
      });
      setIsCheckingOut(false);
      onClearCart();
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-50"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col justify-between border-l border-[#ebe7df] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#f4f2ec] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <CuasarLogo size="sm" showSubtitle={true} />
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-[#8a857b] hover:text-[#181716] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Line */}
              <div className="bg-[#faf9f6] border-b border-[#ebe7df] px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#5c5851] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#344a37]" />
                    {freeShipping ? (
                      <span className="text-[#2b4530] font-semibold">Complimentary Next-Day Cold-Chain unlocked</span>
                    ) : (
                      <span>Add ${(shippingThreshold - subtotal).toFixed(2)} for <strong>free next-day shipping</strong></span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-[#8a857b]">
                    ${subtotal.toFixed(0)} / ${shippingThreshold}
                  </span>
                </div>
                <div className="w-full bg-[#ebe7df] h-1 rounded-full overflow-hidden">
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
                    <ShoppingBag className="w-8 h-8 text-[#dedad0] mb-2" />
                    <h3 className="text-sm font-semibold text-[#181716] mb-1">Your cart is empty</h3>
                    <p className="text-xs text-[#6e6960] max-w-xs mb-4">
                      Select protocols, clinical micronutrients, or diagnostic panels to begin.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-[#181716] text-white rounded-lg text-xs font-semibold hover:bg-[#2e2c29] cursor-pointer"
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
                              <Repeat className="w-3 h-3 text-[#6e6960]" />
                              Auto-Delivery (Save 15%)
                            </span>
                          </label>

                          {item.isSubscription && (
                            <select
                              value={item.frequency}
                              onChange={(e) => onToggleSubscription(item.product.id, true, e.target.value as any)}
                              className="text-[11px] bg-white border border-[#dedad0] rounded px-1.5 py-0.5 text-[#181716] focus:outline-none"
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
                              className="p-1 hover:bg-[#f4f2ec] text-[#5c5851] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono text-[#181716]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#f4f2ec] text-[#5c5851] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#8a857b] hover:text-[#8c3232] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
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
                      <Tag className="w-3.5 h-3.5 text-[#8a857b] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo: LONGEVITY20"
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-[#dedad0] rounded-lg uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-[#181716] font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {promoMessage && (
                    <p className={cn(
                      "text-[11px] font-medium",
                      appliedDiscount > 0 ? "text-[#2b4530]" : "text-[#8c3232]"
                    )}>
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
                        <span>VIP Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
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

                  <button
                    onClick={handleProceedToCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isCheckingOut ? (
                      <span>Authorizing Care Order...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-[#dedad0]" />
                        <span>Place 1-Click Order (${grandTotal.toFixed(2)})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-[#8a857b]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#344a37]" /> Encrypted Clinical Checkout
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#344a37]" /> Guaranteed Next-Day AM
                    </span>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {orderConfirmed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#ebe7df] space-y-4"
            >
              <div className="w-10 h-10 bg-[#f1f5f2] text-[#2b4530] rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#181716]">
                  Order Confirmed
                </h3>
                <p className="text-xs text-[#6e6960]">
                  Your cold-chain formulation pack has been routed for next-morning fulfillment.
                </p>
                <div className="inline-block bg-[#faf9f6] text-[#181716] text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md mt-1 border border-[#ebe7df]">
                  Order #{orderConfirmed.orderNumber}
                </div>
              </div>

              <div className="bg-[#faf9f6] rounded-xl p-3.5 border border-[#ebe7df] space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6e6960] flex-shrink-0 mt-0.5" />
                  <span className="text-[#5c5851]">{orderConfirmed.deliveryAddress}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#ebe7df]">
                  <span className="text-[#6e6960]">Delivery:</span>
                  <span className="font-semibold text-[#2b4530]">{orderConfirmed.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6960]">Tracking:</span>
                  <span className="font-mono text-[#181716]">{orderConfirmed.trackingNumber}</span>
                </div>
                <div className="flex justify-between font-bold text-[#181716] pt-1 border-t border-[#ebe7df]">
                  <span>Charged:</span>
                  <span>${orderConfirmed.total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="w-full py-2 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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

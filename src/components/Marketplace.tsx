import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { EvidenceGrade } from './EvidenceGrade';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Check, 
  ArrowRight, 
  Flame, 
  Clock, 
  Building2,
  TrendingUp,
  Brain,
  Activity,
  Star,
  Truck,
  Repeat,
  ShieldCheck,
  Tag,
  Gift,
  BadgePercent,
  ChevronRight,
  Info,
  SlidersHorizontal,
  FileCheck,
  Layers,
  Sparkle
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Marketplace({ 
  user,
  initialDepartment = 'all',
  onAddToCart
}: { 
  user: UserProfile; 
  initialDepartment?: string;
  onAddToCart?: (products: Product[]) => void;
}) {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string>(initialDepartment);
  const [autoDeliveryActive, setAutoDeliveryActive] = useState<{ [productId: string]: boolean }>({});
  const [bundleChecked, setBundleChecked] = useState<{ [key: string]: boolean }>({
    'p5': true,
    'p2': true,
    'p4': true
  });
  const [bundlePurchased, setBundlePurchased] = useState(false);
  const [vitaminStackPurchased, setVitaminStackPurchased] = useState(false);
  const [aosmModalOpen, setAosmModalOpen] = useState(false);
  const [aosmPurchased, setAosmPurchased] = useState(false);

  // Sync initial department when prop changes
  useEffect(() => {
    if (initialDepartment) {
      setActiveDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  // Live countdown timer for Personal Biohack Special
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBuy = (productId: string) => {
    setPurchasedIds(prev => prev.includes(productId) ? prev : [...prev, productId]);
    const found = MOCK_PRODUCTS.find(p => p.id === productId);
    if (found && onAddToCart) {
      onAddToCart([found]);
    }
  };

  const toggleAutoDelivery = (productId: string, val: boolean) => {
    setAutoDeliveryActive(prev => ({
      ...prev,
      [productId]: val
    }));
  };

  const executiveBundle: Product = {
    id: 'bundle-exec',
    name: 'Executive Stress & Cognition 1-Click Power Stack',
    category: 'Executive Stack',
    description: 'Designed for high-stress executives with zero time: L-Theanine + Alpha-GPC + Bioavailable Magnesium Glycinate + Electrolyte Hydration sticks.',
    status: 'recommended',
    riskLevel: 'low',
    price: 110.00,
    evidenceData: {
      confidenceScore: 98,
      grade: 'A',
      referenceTitle: 'Synergistic Effects of L-Theanine and Nootropic Precursors in High-Cognitive Load Environments',
      journal: 'Neuroscience & Executive Health Quarterly',
      year: 2024,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/18296328/',
      clinicalRationale: 'Simultaneously lowers salivary cortisol AUC by 28% and sustains working memory speed during continuous multi-hour boardroom decision making.'
    },
    tailoredReason: 'Synthesized from your Oura sleep restriction (<4.5h) and high stress scores.'
  };

  const vitaminProducts = MOCK_PRODUCTS.filter(p => 
    p.id.startsWith('supp-') || 
    p.name.toLowerCase().includes('vitamin') || 
    p.name.toLowerCase().includes('omega') || 
    p.name.toLowerCase().includes('methyl') || 
    p.name.toLowerCase().includes('coq10') || 
    p.name.toLowerCase().includes('zinc') ||
    p.name.toLowerCase().includes('magnesium') ||
    p.name.toLowerCase().includes('curcumin') ||
    p.name.toLowerCase().includes('bergamot') ||
    p.name.toLowerCase().includes('berberine')
  );

  const diagnosticProducts = MOCK_PRODUCTS.filter(p => p.category === 'Diagnostics');
  const clinicalProducts = MOCK_PRODUCTS.filter(p => p.riskLevel === 'high');

  // Filter products by department
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    if (activeDepartment === 'all') return true;
    if (activeDepartment === 'vitamins') {
      return (
        p.id.startsWith('supp-') || 
        p.name.toLowerCase().includes('vitamin') || 
        p.name.toLowerCase().includes('omega') || 
        p.name.toLowerCase().includes('methyl') || 
        p.name.toLowerCase().includes('coq10') || 
        p.name.toLowerCase().includes('zinc') ||
        p.name.toLowerCase().includes('magnesium')
      );
    }
    if (activeDepartment === 'executive') return p.category === 'Executive Stack';
    if (activeDepartment === 'supplements') return p.category === 'Nutrition' || p.category === 'Recovery' || p.category === 'Hydration' || p.category === 'Nootropic';
    if (activeDepartment === 'diagnostics') return p.category === 'Diagnostics';
    if (activeDepartment === 'peptides') return p.category === 'Peptide' || p.riskLevel === 'high';
    return true;
  });

  // Bundle pricing calculations
  const bundleItems = [
    { id: 'p5', name: 'Executive Nootropic Peak Stack', price: 65.00 },
    { id: 'p2', name: 'Magnesium Glycinate (Elemental 400mg)', price: 25.00 },
    { id: 'p4', name: 'Electrolyte Balance Complex', price: 30.00 },
  ];
  const totalBundleOriginalPrice = bundleItems.reduce((sum, item) => bundleChecked[item.id] ? sum + item.price : sum, 0);
  const bundleDiscountPrice = (totalBundleOriginalPrice * 0.85).toFixed(2); // 15% bundle discount

  const handleAddAllVitamins = () => {
    const keyVitamins = vitaminProducts.slice(0, 5);
    setVitaminStackPurchased(true);
    setPurchasedIds(prev => [...new Set([...prev, ...keyVitamins.map(v => v.id)])]);
    if (onAddToCart) {
      onAddToCart(keyVitamins);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. PERSONAL BIOHACK WORLD HERO OFFER (Emerald & Slate)   */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        
        {/* Subtle cyber emerald glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Column: Deal Info & Personal Header */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-slate-950" /> Personal Biohack Special
              </span>
              <span className="text-xs text-emerald-400 font-extrabold tracking-wide flex items-center gap-1">
                Personal <span className="text-slate-300 font-normal text-[11px]">Member Stack</span>
              </span>
              <span className="text-xs text-slate-300 font-semibold bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                Tailored for {user.name} ({user.lifestylePersona})
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Executive Longevity &amp; Stress Resilience Stack (Save 35%)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Clinical-grade L-Theanine, Alpha-GPC, Magnesium Glycinate, and Electrolyte replenishment. Auto-suppresses cortisol spikes and stabilizes focus.
            </p>

            {/* Countdown & Claimed Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/40 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ends in {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[82%]"></div>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">82% Claimed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Smart Buy Box Card */}
          <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xl w-full lg:w-80 flex-shrink-0 space-y-3">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-2xl font-black text-emerald-600">$110.00</span>
                <span className="text-xs text-slate-400 line-through ml-2">$170.00</span>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                -35% Member
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>Priority Cold-Chain Express Delivery</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Order within <span className="text-emerald-700 font-bold">2 hrs 14 mins</span> for tomorrow dispatch.
              </p>
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In Stock. Verified by CuasarX Lab Direct</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleBuy(executiveBundle.id)}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2",
                  purchasedIds.includes(executiveBundle.id)
                    ? "bg-emerald-600 text-white font-bold shadow-emerald-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
              >
                {purchasedIds.includes(executiveBundle.id) ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Added to Active Regimen!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-emerald-400" />
                    Add to Regimen / Cart
                  </>
                )}
              </button>

              <button
                onClick={() => handleBuy(executiveBundle.id)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-4 h-4 text-emerald-200" />
                1-Click Instant Order
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure Clinical Transaction &amp; MD Audited
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SMART DEPARTMENT FILTER CHIPS (Horizontal Scrollable) */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Biohack Departments', count: MOCK_PRODUCTS.length },
          { id: 'vitamins', label: 'Vitamins & Longevity Micronutrients', count: vitaminProducts.length },
          { id: 'executive', label: '1-Click Executive Stacks', count: 2 },
          { id: 'supplements', label: 'Supplements & Nootropics', count: 4 },
          { id: 'diagnostics', label: 'Clinical Blood & DNA Labs', count: diagnosticProducts.length },
          { id: 'peptides', label: 'Peptides & Rx Approval Gate', count: clinicalProducts.length },
        ].map(dept => (
          <button
            key={dept.id}
            onClick={() => setActiveDepartment(dept.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm flex items-center gap-1.5 flex-shrink-0",
              activeDepartment === dept.id
                ? "bg-[#0f172a] text-emerald-400 border-slate-800 shadow-md ring-2 ring-emerald-500/30"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            <span>{dept.label}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
              activeDepartment === dept.id ? "bg-emerald-500 text-slate-950" : "bg-slate-100 text-slate-600"
            )}>
              {dept.count}
            </span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 2B. DEDICATED #VITAMINS SHOWCASE & 1-CLICK PROTOCOL     */}
      {/* ======================================================== */}
      <div id="vitamins" className="scroll-mt-24">
        {(activeDepartment === 'all' || activeDepartment === 'vitamins') && (
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 md:p-6 border border-emerald-500/30 shadow-xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" /> Clinical Micronutrient Standard
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">#vitamins Active Channel</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Longevity Vitamin &amp; Bio-Active Micronutrient Protocol
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Engineered with micellar liposomal delivery, methylation cofactors (L-5-MTHF, Methyl-B12), and active forms to bypass GI degradation and maximize cellular uptake.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    ✓ Liposomal D3+K2
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    ✓ Methylated B-Complex
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    ✓ Pure Liposomal C
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    ✓ High-EPA Omega-3
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    ✓ Ubiquinol CoQ10 + PQQ
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-xl shadow-lg w-full lg:w-72 flex-shrink-0 space-y-3">
                <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">5-Pillar Vitamin Bundle</span>
                    <span className="text-xl font-black text-emerald-400">$165.00</span>
                    <span className="text-xs text-slate-400 line-through ml-2">$215.00</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Save 23%
                  </span>
                </div>
                <button
                  onClick={handleAddAllVitamins}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md",
                    vitaminStackPurchased
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black"
                  )}
                >
                  {vitaminStackPurchased ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      Added 5 Vitamins to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-slate-950" />
                      1-Click Add Essential Vitamins
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2C. DEDICATED AOSM DIAGNOSTIC SHOWCASE & 4-STEP JOURNEY  */}
      {/* ======================================================== */}
      <div id="aosm" className="scroll-mt-24">
        {(activeDepartment === 'all' || activeDepartment === 'diagnostics') && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 md:p-6 border border-indigo-500/30 shadow-xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" /> Next-Gen Biological Modeling
                  </span>
                  <span className="text-xs text-indigo-300 font-bold">#aosm Clinical Standard</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  The Advanced Organ System Modeling Assessment (AOSM)
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A precise integration of science, biology, and technology designed to analyze your unique biological profile across 9 major organ systems and translate those insights into a personalized 90-day longevity roadmap.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    1. Concierge Enrollment
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    2. Complete At-Home Testing
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    3. 9-Organ Systems Modeling
                  </span>
                  <span className="text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    4. 90-Day Longevity Roadmap
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-indigo-500/40 p-4 rounded-xl shadow-lg w-full lg:w-72 flex-shrink-0 space-y-3">
                <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Complete Longevity Plan</span>
                    <span className="text-xl font-black text-emerald-400">$399.00</span>
                    <span className="text-xs text-slate-400 line-through ml-2">$599.00</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                    Early Access
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleBuy('diag-aosm');
                    setAosmPurchased(true);
                  }}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md",
                    aosmPurchased || purchasedIds.includes('diag-aosm')
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-400 hover:to-teal-300 text-slate-950 font-black"
                  )}
                >
                  {aosmPurchased || purchasedIds.includes('diag-aosm') ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      AOSM Package Reserved!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-slate-950" />
                      1-Click Enroll ($399 Early Access)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. SMART PRODUCT GRID                                    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product, idx) => {
          const isBought = purchasedIds.includes(product.id);
          const isSub = autoDeliveryActive[product.id] ?? false;
          const originalPrice = product.price || 29.99;
          const discountedPrice = (originalPrice * 0.85).toFixed(2);
          const isBestSeller = idx === 0 || product.category === 'Executive Stack';
          const isTopPick = product.category === 'Recovery' || product.category === 'Nutrition';

          return (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:border-emerald-200 transition-all space-y-4 relative"
            >
              <div>
                {/* Top Badge: Best Seller or Verified Biohack Choice */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  {isBestSeller ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                      Top Verified Stack • {product.category}
                    </span>
                  ) : isTopPick ? (
                    <span className="bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="text-emerald-400">CuasarX</span> <span>Choice</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                  )}

                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded font-bold">
                    Personal
                  </span>
                </div>

                {/* Product Title */}
                <h3 className="text-base font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug">
                  {product.name}
                </h3>

                {/* Star Ratings & Clinical Review Count */}
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-teal-700 font-semibold text-xs hover:underline cursor-pointer">
                    {980 + (idx * 240)} verified reviews
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* AI Persona Match Callout */}
                {product.tailoredReason && (
                  <div className="mt-2.5 p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI Match:</strong> {product.tailoredReason}</span>
                  </div>
                )}

                {/* Price Display */}
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-700 font-bold self-start mt-1">$</span>
                    <span className="text-2xl font-black text-slate-900">
                      {isSub ? discountedPrice.split('.')[0] : String(originalPrice).split('.')[0]}
                    </span>
                    <span className="text-xs font-bold text-slate-900 self-start mt-1">
                      {isSub ? discountedPrice.split('.')[1] : '00'}
                    </span>
                    <span className="text-xs text-slate-400 font-normal ml-1.5">($1.20 / Dose)</span>
                  </div>

                  {isSub && (
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      Save 15% with Biometric Auto-Delivery
                    </span>
                  )}
                </div>

                {/* Priority Delivery Guarantee */}
                <div className="mt-2 text-xs space-y-1 text-slate-700">
                  <div className="flex items-center gap-1 text-teal-700 font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Priority Cold-Chain Express</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold">
                    In Stock. Ships direct from verified laboratory
                  </div>
                </div>

                {/* Auto-Delivery vs One-Time Radio Selector */}
                {product.riskLevel !== 'high' && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <label 
                      onClick={() => toggleAutoDelivery(product.id, false)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                        !isSub ? "bg-white border border-slate-300 font-bold shadow-sm" : "text-slate-600"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`purchase-mode-${product.id}`} 
                          checked={!isSub} 
                          onChange={() => {}}
                          className="accent-emerald-600" 
                        />
                        <span>One-time purchase</span>
                      </span>
                      <span className="font-bold text-slate-900">${originalPrice.toFixed(2)}</span>
                    </label>

                    <label 
                      onClick={() => toggleAutoDelivery(product.id, true)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                        isSub ? "bg-emerald-50 border border-emerald-400 font-bold text-emerald-950 shadow-sm" : "text-slate-600"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`purchase-mode-${product.id}`} 
                          checked={isSub} 
                          onChange={() => {}}
                          className="accent-emerald-600" 
                        />
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Biometric Auto-Delivery (15%)</span>
                        </span>
                      </span>
                      <span className="font-extrabold text-emerald-700">${discountedPrice}</span>
                    </label>
                  </div>
                )}

                {/* Evidence Grade Accordion */}
                <div className="mt-3">
                  <EvidenceGrade product={product} compact={true} />
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {product.riskLevel === 'high' ? (
                  <div className="space-y-1">
                    <button 
                      onClick={() => alert(`Clinical consult requested for ${product.name}. A licensed clinician will review your blood panel within 2 hours.`)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Request Clinician Approval (MD Gate)
                    </button>
                    <span className="text-[10px] text-center text-rose-700 block font-medium">Requires blood panel &amp; MD authorization</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleBuy(product.id)}
                      className={cn(
                        "w-full py-2 px-4 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5",
                        isBought
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      )}
                    >
                      {isBought ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          Added to Regimen!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 text-emerald-400" />
                          Add to Regimen / Cart
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleBuy(product.id)}
                      className="w-full py-2 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm flex items-center justify-center gap-1 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-200" />
                      1-Click Instant Order
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. SYNERGISTIC BIOHACK BUNDLE CALCULATOR                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Frequently Paired Biohack Protocols
          </h3>
          <p className="text-xs text-slate-500">
            Biohackers with similar Oura sleep metrics frequently combine these 3 compounds for maximum deep sleep and daytime focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Bundle Item Checkboxes */}
          <div className="lg:col-span-2 space-y-2.5">
            {bundleItems.map((item) => (
              <label 
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={bundleChecked[item.id] || false}
                  onChange={(e) => setBundleChecked(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <div className="flex-1 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="font-extrabold text-slate-900">${item.price.toFixed(2)}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Bundle Total Price & 1-Click Action */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs text-slate-500 block">Total Bundle Price:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">${bundleDiscountPrice}</span>
                <span className="text-xs text-slate-400 line-through">${totalBundleOriginalPrice.toFixed(2)}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Save 15%</span>
              </div>
            </div>

            <button
              onClick={() => {
                setBundlePurchased(true);
                bundleItems.forEach(i => handleBuy(i.id));
              }}
              className={cn(
                "w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2",
                bundlePurchased
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
              )}
            >
              {bundlePurchased ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  All 3 Added to Regimen!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-emerald-200" />
                  Add all 3 to Regimen / Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. VERIFIED BIOHACKER & CLINICIAN TELEMETRY REVIEWS      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Verified Biohacker &amp; Clinician Telemetry Reviews
            </h3>
            <p className="text-xs text-slate-500">
              Correlated with real-world wearable data and blood panel adjustments.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 hover:underline cursor-pointer">
            Write a verified telemetry review
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                  MV
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Dr. Marcus Vance</span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Biohacker &amp; Triathlete
                  </span>
                </div>
              </div>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-slate-700 italic">
              &quot;The Executive Nootropic Stack combined with Magnesium Glycinate before bed increased my Oura deep sleep score by +28 minutes within 5 days. Zero daytime caffeine jitters.&quot;
            </p>
            <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Oura Verified: +28m Deep Sleep</span>
              <span>Reviewed in San Francisco, CA</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                  SL
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Sonia Lin</span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Founder &amp; Personal Member
                  </span>
                </div>
              </div>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-slate-700 italic">
              &quot;The 1-Click Biometric Auto-Delivery is seamless. I travel between Austin and London frequently; having the cold-chain packs auto-ship to my hotel saves me hours of logistics.&quot;
            </p>
            <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Auto-Delivery Active</span>
              <span>Reviewed in Austin, TX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

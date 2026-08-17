import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Product, BiohackingCard } from '../types';
import { MOCK_PRODUCTS, BIOHACKING_PROTOCOLS } from '../data';
import { EvidenceGrade } from './EvidenceGrade';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Check, 
  Clock, 
  Star, 
  Truck, 
  Repeat, 
  ShieldCheck, 
  Tag, 
  Info, 
  SlidersHorizontal, 
  ChevronRight,
  Eye,
  Plus,
  Dna,
  HeartPulse,
  Activity,
  X,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MarketplaceProps {
  user: UserProfile;
  initialDepartment?: string;
  searchQuery?: string;
  onAddToCart?: (products: Product[]) => void;
  onBuyNow?: (product: Product) => void;
  onOpenCart?: () => void;
}

export function Marketplace({
  user,
  initialDepartment = 'all',
  searchQuery = '',
  onAddToCart,
  onBuyNow,
  onOpenCart
}: MarketplaceProps) {
  const [activeDepartment, setActiveDepartment] = useState<string>(initialDepartment);
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'grade' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activeSubCadence, setActiveSubCadence] = useState<{ [productId: string]: boolean }>({});
  
  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Bundle Selector
  const [bundleChecked, setBundleChecked] = useState<{ [key: string]: boolean }>({
    'p5': true,
    'p2': true,
    'p4': true
  });
  const [bundlePurchased, setBundlePurchased] = useState(false);
  const [vitaminBundlePurchased, setVitaminBundlePurchased] = useState(false);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    if (initialDepartment) {
      setActiveDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPurchasedIds(prev => prev.includes(product.id) ? prev : [...prev, product.id]);
    if (onAddToCart) {
      onAddToCart([product]);
    }
  };

  const handleQuickBuy = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleAddToCart(product);
    if (onBuyNow) {
      onBuyNow(product);
    } else if (onOpenCart) {
      onOpenCart();
    }
  };

  const executiveBundle: Product = {
    id: 'bundle-exec',
    name: 'Executive Neuro-Vascular Resilience Stack',
    category: 'Executive Stack',
    description: 'High-purity L-Theanine, Alpha-GPC, Chelation-Grade Magnesium Glycinate, and Micronutrient Hydration. Calibrated to modulate cortisol response and preserve nocturnal deep sleep architecture.',
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
      clinicalRationale: 'Attenuates salivary cortisol AUC by 28% while sustaining executive working memory speed.'
    },
    tailoredReason: `Calibrated for ${user.name} to counterbalance elevated HRV strain and sleep deficit.`
  };

  const allProducts = MOCK_PRODUCTS;

  const filteredProducts = allProducts.filter(p => {
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchReason = p.tailoredReason?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchReason) return false;
    }

    if (riskFilter !== 'all' && p.riskLevel !== riskFilter) return false;

    if (activeDepartment === 'all') return true;
    if (activeDepartment === 'vitamins') {
      return (
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
    }
    if (activeDepartment === 'executive') return p.category === 'Executive Stack';
    if (activeDepartment === 'supplements') return p.category === 'Nutrition' || p.category === 'Recovery' || p.category === 'Hydration' || p.category === 'Nootropic';
    if (activeDepartment === 'diagnostics') return p.category === 'Diagnostics';
    if (activeDepartment === 'peptides') return p.category === 'Peptide' || p.riskLevel === 'high';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'grade') {
      const gradeA = a.evidenceData?.grade || 'C';
      const gradeB = b.evidenceData?.grade || 'C';
      return gradeA.localeCompare(gradeB);
    }
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.evidenceData?.confidenceScore || 80) - (a.evidenceData?.confidenceScore || 80);
    return 0;
  });

  const vitaminProducts = allProducts.filter(p => 
    p.id.startsWith('supp-') || 
    p.name.toLowerCase().includes('vitamin') || 
    p.name.toLowerCase().includes('omega') || 
    p.name.toLowerCase().includes('methyl') || 
    p.name.toLowerCase().includes('coq10') || 
    p.name.toLowerCase().includes('zinc') ||
    p.name.toLowerCase().includes('magnesium')
  );

  const diagnosticProducts = allProducts.filter(p => p.category === 'Diagnostics');

  const bundleItems = [
    { id: 'p5', product: allProducts.find(p => p.id === 'p5') || allProducts[0], name: 'Executive Nootropic Stack', price: 65.00 },
    { id: 'p2', product: allProducts.find(p => p.id === 'p2') || allProducts[1], name: 'Magnesium Glycinate (Elemental 400mg)', price: 25.00 },
    { id: 'p4', product: allProducts.find(p => p.id === 'p4') || allProducts[2], name: 'Electrolyte Balance Complex', price: 30.00 },
  ];
  const totalBundleOriginalPrice = bundleItems.reduce((sum, item) => bundleChecked[item.id] ? sum + item.price : sum, 0);
  const bundleDiscountPrice = (totalBundleOriginalPrice * 0.85).toFixed(2);

  const handleAddAllVitamins = () => {
    const keyVitamins = vitaminProducts.slice(0, 5);
    setVitaminBundlePurchased(true);
    setPurchasedIds(prev => [...new Set([...prev, ...keyVitamins.map(v => v.id)])]);
    if (onAddToCart) {
      onAddToCart(keyVitamins);
    }
  };

  return (
    <div className="space-y-10 pb-16">

      {/* ======================================================== */}
      {/* 1. SOFT EDITORIAL HERO CURATION                          */}
      {/* ======================================================== */}
      <div className="bg-[#f5f3ec] rounded-2xl p-6 sm:p-8 md:p-10 border border-[#e8e4db] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-warm">
              Curated Protocol
            </span>
            <span className="badge-clinical">
              Tailored for {user.name}
            </span>
            <span className="badge-neutral">
              {user.lifestylePersona}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#181716] leading-tight font-serif-title">
            Executive Neuro-Vascular &amp; Cellular Recovery Stack
          </h1>
          
          <p className="text-xs sm:text-sm text-[#5c5851] leading-relaxed font-normal">
            A targeted four-pillar regimen formulated to modulate acute sympathetic tone, support restorative deep sleep architecture, and preserve executive cognitive endurance under sustained load.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#5c5851]">
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-md border border-[#e4e0d4] font-mono text-[11px] font-medium text-[#181716]">
              <Clock className="w-3.5 h-3.5 text-[#785328]" />
              <span>Curated window closes in {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-28 bg-[#e8e4db] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#181716] h-full rounded-full w-[82%]" />
              </div>
              <span className="text-[11px] text-[#6e6960] font-medium">82% Claimed</span>
            </div>
          </div>
        </div>

        {/* Right Buy Box */}
        <div className="bg-white p-5 rounded-xl border border-[#ebe7df] shadow-xs w-full lg:w-76 flex-shrink-0 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#f4f2ec] pb-2.5">
            <div>
              <span className="text-2xl font-bold text-[#181716]">$110.00</span>
              <span className="text-xs text-[#8a857b] line-through ml-2 font-mono">$170.00</span>
            </div>
            <span className="text-[11px] font-semibold text-[#785328] bg-[#faf5ee] px-2 py-0.5 rounded border border-[#ede1cf]">
              Save 35%
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-[#5c5851]">
            <div className="flex items-center gap-1.5 text-[#2b4530] font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>Complimentary cold-chain delivery</span>
            </div>
            <p className="text-[11px] text-[#6e6960]">
              Dispatch tomorrow morning for confirmed members.
            </p>
            <div className="flex items-center gap-1.5 text-[#181716] text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#344a37]" />
              <span>In stock. Verified 3rd-party purity tested.</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleAddToCart(executiveBundle)}
              className={cn(
                "w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer",
                purchasedIds.includes(executiveBundle.id)
                  ? "bg-[#2b4530] text-white"
                  : "btn-ink"
              )}
            >
              {purchasedIds.includes(executiveBundle.id) ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Active Regimen</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add Stack to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleQuickBuy(executiveBundle)}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold btn-stone transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#785328]" />
              <span>1-Click Instant Order</span>
            </button>
          </div>

          <p className="text-[10px] text-[#8a857b] text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#344a37]" /> Physician reviewed &amp; cGMP audited
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FOUR QUIET DISCOVERY CARDS                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="soft-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="badge-flag mb-2">
              Biomarker Focus
            </span>
            <h3 className="text-xs font-bold text-[#181716] leading-snug">
              ApoB &amp; hs-CRP Modulation
            </h3>
            <p className="text-[11px] text-[#5c5851] mt-1 leading-relaxed">
              Arterial inflammatory markers show room for optimization. Bergamot &amp; high-EPA Omega-3 recommended.
            </p>
          </div>
          <button
            onClick={() => setActiveDepartment('vitamins')}
            className="text-xs font-semibold text-[#181716] hover:text-black flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>View Cardiovascular Stacks</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="soft-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="badge-warm mb-2">
              Refill Notice (4 Days)
            </span>
            <h3 className="text-xs font-bold text-[#181716] leading-snug">
              Magnesium Glycinate 400mg
            </h3>
            <p className="text-[11px] text-[#5c5851] mt-1 leading-relaxed">
              Estimated supply depletes in 4 days. Auto-refill with Subscribe &amp; Save (15% off).
            </p>
          </div>
          <button
            onClick={() => {
              const mg = allProducts.find(p => p.id === 'p2');
              if (mg) handleAddToCart(mg);
            }}
            className="text-xs font-semibold text-[#181716] hover:text-black flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>1-Click Refill ($21.25)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="soft-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="badge-clinical mb-2">
              Clinical Protocol
            </span>
            <h3 className="text-xs font-bold text-[#181716] leading-snug">
              5-Pillar Essential Vitamins
            </h3>
            <p className="text-[11px] text-[#5c5851] mt-1 leading-relaxed">
              Liposomal D3+K2, Methyl-B12, High-EPA Omega-3, Liposomal C &amp; Ubiquinol CoQ10.
            </p>
          </div>
          <button
            onClick={handleAddAllVitamins}
            className="text-xs font-semibold text-[#181716] hover:text-black flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>Add 5-Pillar Bundle ($165)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="soft-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="badge-neutral mb-2">
              Diagnostic Panel
            </span>
            <h3 className="text-xs font-bold text-[#181716] leading-snug">
              Epigenetic Biological Age Panel
            </h3>
            <p className="text-[11px] text-[#5c5851] mt-1 leading-relaxed">
              Assesses Horvath DNA methylation clock and 42 cellular senescence markers.
            </p>
          </div>
          <button
            onClick={() => setActiveDepartment('diagnostics')}
            className="text-xs font-semibold text-[#181716] hover:text-black flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>Explore Diagnostic Kits</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SOFT DEPARTMENT FILTER PILLS & CONTROLS TOOLBAR       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-[#ebe7df] p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
            {[
              { id: 'all', label: 'All Protocols', count: allProducts.length },
              { id: 'vitamins', label: 'Micronutrients', count: vitaminProducts.length },
              { id: 'executive', label: 'Executive Stacks', count: 2 },
              { id: 'supplements', label: 'Nootropics', count: 4 },
              { id: 'diagnostics', label: 'Lab Panels & DNA', count: diagnosticProducts.length },
              { id: 'peptides', label: 'Peptides (Rx Gate)', count: 3 },
            ].map(dept => (
              <button
                key={dept.id}
                onClick={() => setActiveDepartment(dept.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 flex-shrink-0 cursor-pointer",
                  activeDepartment === dept.id
                    ? "bg-[#181716] text-white border-[#181716]"
                    : "bg-[#faf9f6] hover:bg-[#f4f2ec] text-[#5c5851] border-[#ebe7df]"
                )}
              >
                <span>{dept.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  activeDepartment === dept.id ? "bg-white/20 text-white" : "bg-[#dedad0] text-[#5c5851]"
                )}>
                  {dept.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort & Filter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 bg-[#faf9f6] border border-[#ebe7df] rounded-lg px-2.5 py-1 text-xs text-[#5c5851]">
              <SlidersHorizontal className="w-3 h-3 text-[#8a857b]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-medium text-[#181716] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="grade">Clinical Grade (A → C)</option>
                <option value="rating">Highest Clinical Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-[#faf9f6] border border-[#ebe7df] rounded-lg px-2.5 py-1 text-xs text-[#5c5851]">
              <ShieldCheck className="w-3 h-3 text-[#344a37]" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="bg-transparent border-none text-xs font-medium text-[#181716] focus:outline-none cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="low">Standard (OTC)</option>
                <option value="medium">Enhanced Support</option>
                <option value="high">Clinical Review (Rx)</option>
              </select>
            </div>
          </div>
        </div>

        {localSearch.trim() && (
          <div className="pt-2 border-t border-[#f4f2ec] flex items-center justify-between text-xs text-[#5c5851]">
            <span>Matching query: <strong>&quot;{localSearch}&quot;</strong> ({filteredProducts.length} items)</span>
            <button
              onClick={() => setLocalSearch('')}
              className="text-[#8c3232] hover:underline font-medium cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. EXPANSIVE PRODUCT CATALOG GRID (Minimalist Cards)      */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#181716] tracking-tight flex items-center gap-2">
            <span>Clinical Formulations &amp; Testing</span>
            <span className="text-xs font-normal text-[#8a857b] font-mono">({filteredProducts.length})</span>
          </h2>
          <span className="text-xs text-[#6e6960] flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#344a37]" /> Cold-chain courier eligible
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const basePrice = product.price || 45.00;
            const isSub = activeSubCadence[product.id] || false;
            const price = isSub ? basePrice * 0.85 : basePrice;
            const isPurchased = purchasedIds.includes(product.id);
            const grade = product.evidenceData?.grade || 'A';
            const ratingScore = 4.8 + ((product.name.length % 3) * 0.05);
            const reviewCount = 450 + (product.name.length * 32);

            return (
              <div
                key={product.id}
                className="soft-card flex flex-col justify-between p-4 relative group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        grade === 'A' ? "badge-clinical" : grade === 'B' ? "badge-warm" : "badge-neutral"
                      )}>
                        Grade {grade}
                      </span>
                      {product.hasHumanStudies && (
                        <span className="badge-clinical text-[10px]">
                          ✓ Human RCT
                        </span>
                      )}
                    </div>

                    {product.riskLevel === 'high' ? (
                      <span className="badge-flag">
                        Rx Gate
                      </span>
                    ) : (
                      <span className="badge-neutral">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <h3 
                    onClick={() => setQuickViewProduct(product)}
                    className="text-sm font-semibold text-[#181716] leading-snug hover:text-black cursor-pointer transition-colors line-clamp-2"
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                    <div className="flex items-center text-[#785328]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#785328] text-[#785328]" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#181716]">{ratingScore.toFixed(1)}</span>
                    <span className="text-[11px] text-[#8a857b]">({reviewCount})</span>
                  </div>

                  <p className="text-xs text-[#5c5851] leading-relaxed mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  {product.tailoredReason && (
                    <div className="mt-2.5 p-2 bg-[#f6f5ef] border border-[#e8e4da] rounded-lg text-[11px] text-[#3e3b35] leading-tight flex items-start gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#785328] flex-shrink-0 mt-0.5" />
                      <span>{product.tailoredReason}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#f4f2ec] space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold text-[#181716]">
                        ${price.toFixed(2)}
                      </span>
                      {isSub && (
                        <span className="text-xs text-[#8a857b] line-through ml-1.5 font-mono">
                          ${basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#5c5851] bg-[#f4f2ec] px-1.5 py-0.2 rounded font-medium">
                      Next-Day AM
                    </span>
                  </div>

                  {/* Subscribe & Save Toggle */}
                  <label className="flex items-center justify-between p-1.5 bg-[#faf9f6] hover:bg-[#f5f3ee] rounded-lg border border-[#ebe7df] text-xs cursor-pointer select-none transition-colors">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSub}
                        onChange={(e) => {
                          setActiveSubCadence(prev => ({
                            ...prev,
                            [product.id]: e.target.checked
                          }));
                        }}
                        className="w-3.5 h-3.5 accent-[#181716] rounded"
                      />
                      <span className="text-[11px] font-medium text-[#181716]">
                        Subscribe &amp; Save 15%
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#2b4530]">
                      -${(basePrice * 0.15).toFixed(2)}
                    </span>
                  </label>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={cn(
                        "py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer",
                        isPurchased
                          ? "bg-[#2b4530] text-white"
                          : "btn-ink"
                      )}
                    >
                      {isPurchased ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>In Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleQuickBuy(product, e)}
                      className="py-2 px-2 rounded-lg text-xs font-semibold btn-stone transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-[#785328]" />
                      <span>1-Click Order</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="w-full text-center text-[11px] font-medium text-[#6e6960] hover:text-[#181716] py-0.5 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Clinical Evidence &amp; Citations</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. FREQUENTLY PAIRED REGIMEN BUNDLE                      */}
      {/* ======================================================== */}
      <div className="soft-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="badge-warm mb-1">
              Paired Synergy Protocol (Save 15%)
            </span>
            <h3 className="text-sm font-bold text-[#181716] mt-1">
              Frequently Paired Together: Executive Anti-Burnout Protocol
            </h3>
          </div>
          <span className="text-xs text-[#2b4530] font-medium hidden sm:inline">
            Complimentary Cold-Chain Shipping
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {bundleItems.map(item => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#faf9f6] hover:bg-[#f4f2ec] rounded-xl border border-[#ebe7df] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={bundleChecked[item.id] || false}
                  onChange={(e) => setBundleChecked(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#181716] rounded"
                />
                <div className="flex-1 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#181716]">{item.name}</span>
                  <span className="font-semibold text-[#181716]">${item.price.toFixed(2)}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#ebe7df] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs text-[#6e6960] block">Bundle Total:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#181716]">${bundleDiscountPrice}</span>
                <span className="text-xs text-[#8a857b] line-through font-mono">${totalBundleOriginalPrice.toFixed(2)}</span>
                <span className="text-[10px] font-semibold text-[#2b4530] bg-[#f1f5f2] px-1.5 py-0.2 rounded">Save 15%</span>
              </div>
            </div>

            <button
              onClick={() => {
                setBundlePurchased(true);
                const selected = bundleItems.filter(i => bundleChecked[i.id]).map(i => i.product);
                if (onAddToCart) onAddToCart(selected);
              }}
              className={cn(
                "w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
                bundlePurchased
                  ? "bg-[#2b4530] text-white"
                  : "btn-ink"
              )}
            >
              {bundlePurchased ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  Added All 3 to Regimen
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  Add All 3 to Cart (${bundleDiscountPrice})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. EVIDENCE-GRADED PROTOCOLS                             */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#181716]">
            Evidence-Graded Lifestyle Protocols (Non-Supplement)
          </h3>
          <p className="text-xs text-[#6e6960]">
            Actionable behavioral interventions calibrated to your daily circadian rhythm and training load.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BIOHACKING_PROTOCOLS.slice(0, 3).map(protocol => (
            <div
              key={protocol.id}
              className="soft-card p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge-clinical">
                    {protocol.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a857b]">
                    {protocol.evidenceGrade}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#181716] leading-snug">
                  {protocol.title}
                </h4>
                <p className="text-xs text-[#5c5851] mt-1 leading-relaxed">
                  {protocol.protocol}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f4f2ec] space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[#5c5851]">
                  <span className="font-semibold text-[#181716]">Timing:</span>
                  <span>{protocol.recommendedTiming}</span>
                </div>
                <div className="p-2 bg-[#faf9f6] rounded-lg text-[#5c5851] text-[11px] leading-tight border border-[#ebe7df]">
                  <strong>Outcome:</strong> {protocol.targetOutcome}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. PRODUCT QUICK-VIEW CLINICAL MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#ebe7df] max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-clinical">
                      {quickViewProduct.category}
                    </span>
                    <span className="badge-neutral font-mono">
                      Grade {quickViewProduct.evidenceData?.grade || 'A'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#181716]">
                    {quickViewProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="p-1 text-[#8a857b] hover:text-[#181716] rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#5c5851] leading-relaxed">
                {quickViewProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df] text-xs">
                <div>
                  <span className="text-[#8a857b] font-medium block text-[10px] uppercase">Recommended Dosage:</span>
                  <span className="font-semibold text-[#181716]">{quickViewProduct.dailyDosage || '1 Serving Daily'}</span>
                </div>
                <div>
                  <span className="text-[#8a857b] font-medium block text-[10px] uppercase">Timing:</span>
                  <span className="font-semibold text-[#181716]">{quickViewProduct.timing || 'Morning with meal'}</span>
                </div>
              </div>

              <EvidenceGrade product={quickViewProduct} />

              <div className="pt-3 border-t border-[#f4f2ec] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xl font-bold text-[#181716]">${(quickViewProduct.price || 49.00).toFixed(2)}</span>
                  <span className="text-xs text-[#8a857b] block">Complimentary cold-chain delivery</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="py-2 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickBuy(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="py-2 px-4 rounded-lg font-semibold text-xs btn-stone flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#785328]" />
                    <span>1-Click Order</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

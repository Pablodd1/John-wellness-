/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYNTHETIC_USERS, MOCK_PRODUCTS } from './data';
import { UserProfile, Product, TelemedicineMode } from './types';
import { Marketplace } from './components/Marketplace';
import { SupplementManager } from './components/SupplementManager';
import { BiomarkerTrends } from './components/BiomarkerTrends';
import { UserProfileTab } from './components/UserProfileTab';
import { CommunityConnect } from './components/CommunityConnect';
import { AdminPatientMonitor } from './components/AdminPatientMonitor';
import { OperatorDashboard } from './components/OperatorDashboard';
import { PhiChat } from './components/PhiChat';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CuasarLogo } from './components/CuasarLogo';
import { ConsentCenter } from './components/ConsentCenter';
import { TelemedicineVisit } from './components/TelemedicineVisit';
import { FirstRunConsent } from './components/FirstRunConsent';
import { PerformanceResearch } from './components/PerformanceResearch';
import { ConsentProvider } from './lib/consent';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Shield, 
  Pill, 
  Sparkles, 
  Users, 
  Menu, 
  X, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  User, 
  Stethoscope, 
  Clock, 
  Search, 
  Mic, 
  ChevronDown, 
  Flame, 
  Zap, 
  Repeat, 
  Dna, 
  CheckCircle2, 
  AlertTriangle,
  Truck,
  PhoneCall,
  Video,
  FlaskConical,
  ArrowRight
} from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  return (
    <ConsentProvider>
      <AppInner />
    </ConsentProvider>
  );
}

function AppInner() {
  const [activeUser, setActiveUser] = useState<UserProfile>(SYNTHETIC_USERS[0]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'supplements' | 'trends' | 'profile' | 'research' | 'community' | 'consent' | 'admin' | 'operator'>('marketplace');
  const [marketplaceDepartment, setMarketplaceDepartment] = useState<string>('all');
  const [incomingEvaluation, setIncomingEvaluation] = useState<{ text: string; senderName: string } | null>(null);
  const [videoVisit, setVideoVisit] = useState<{ mode: TelemedicineMode; patient: UserProfile } | null>(null);

  const openVideoVisit = (mode: TelemedicineMode, patient: UserProfile) => {
    setVideoVisit({ mode, patient });
  };
  
  // Drawers & Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p5') || MOCK_PRODUCTS[0],
      quantity: 1,
      isSubscription: true,
      frequency: '30'
    },
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p2') || MOCK_PRODUCTS[1],
      quantity: 1,
      isSubscription: true,
      frequency: '30'
    },
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p4') || MOCK_PRODUCTS[2],
      quantity: 1,
      isSubscription: false,
      frequency: '30'
    }
  ]);

  // URL Hash Deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#vitamins' || hash.includes('vitamin')) {
        setActiveTab('marketplace');
        setMarketplaceDepartment('vitamins');
        setTimeout(() => {
          const el = document.getElementById('vitamins');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (hash === '#aosm' || hash.includes('organ') || hash.includes('longevity')) {
        setActiveTab('profile');
      } else if (hash === '#deals' || hash === '#marketplace') {
        setActiveTab('marketplace');
        setMarketplaceDepartment('all');
      } else if (hash === '#supplements' || hash === '#regimen') {
        setActiveTab('supplements');
      } else if (hash === '#trends' || hash === '#biomarkers') {
        setActiveTab('trends');
      } else if (hash === '#profile' || hash === '#dna' || hash === '#labs') {
        setActiveTab('profile');
      } else if (hash === '#research' || hash === '#performance') {
        setActiveTab('research');
      } else if (hash === '#community') {
        setActiveTab('community');
      } else if (hash === '#privacy' || hash === '#consent') {
        setActiveTab('consent');
      } else if (hash === '#admin') {
        setActiveTab('admin');
      } else if (hash === '#operator') {
        setActiveTab('operator');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToVitamins = () => {
    window.location.hash = 'vitamins';
    setActiveTab('marketplace');
    setMarketplaceDepartment('vitamins');
    setTimeout(() => {
      const el = document.getElementById('vitamins');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleUpdateUserData = (updatedFields: Partial<UserProfile>) => {
    setActiveUser(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const handleEvaluateGroupMessage = (text: string, senderName: string) => {
    setIncomingEvaluation({ text, senderName });
    setChatOpen(true);
  };

  const handleAddProductsToCart = (products: Product[]) => {
    setCartItems(prev => {
      const next = [...prev];
      products.forEach(p => {
        const existing = next.find(i => i.product.id === p.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          next.push({
            product: p,
            quantity: 1,
            isSubscription: false,
            frequency: '30'
          });
        }
      });
      return next;
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const handleToggleCartSubscription = (productId: string, isSub: boolean, freq: '30' | '45' | '60' | '90' = '30') => {
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, isSubscription: isSub, frequency: freq } : item));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => {
    const base = item.product.price || 49.00;
    const price = item.isSubscription ? base * 0.85 : base;
    return sum + (price * item.quantity);
  }, 0);

  const searchSuggestions = MOCK_PRODUCTS.filter(p => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  }).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfaf8] text-[#181716] font-sans pb-16 md:pb-0">
      
      {/* ======================================================== */}
      {/* 0. SOFT EDITORIAL TOP RIBBON                             */}
      {/* ======================================================== */}
      <div className="bg-[#f4f2ec] text-[#5c5851] text-[11px] px-4 py-1.5 border-b border-[#ebe7df] flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#344a37]" /> Complimentary cold-chain courier on orders $99+
          </span>
          <span className="hidden lg:inline text-[#dedad0]">|</span>
          <span className="hidden lg:flex items-center gap-1 text-[#6e6960]">
            <Clock className="w-3.5 h-3.5 text-[#785328]" /> Order within <strong className="text-[#181716] font-semibold">2h 45m</strong> for next-morning delivery
          </span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-[#5c5851]">
            Active Persona: <strong className="text-[#181716] font-semibold">{activeUser.name}</strong>
          </span>
          <button
            onClick={() => openVideoVisit('patient', activeUser)}
            className="text-[10px] text-[#181716] hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Video className="w-3 h-3" aria-hidden="true" /> Video Visit
          </button>
          <button
            onClick={() => setChatOpen(true)}
            className="text-[10px] text-[#181716] hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Clinical Assistant
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MINIMALIST MAIN HEADER (With CuasarX Logo)            */}
      {/* ======================================================== */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#ebe7df]">
        
        {/* Main Row */}
        <div className="max-w-[1540px] mx-auto px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 md:gap-5">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#181716] hover:bg-[#f5f3ee] rounded-lg flex items-center transition-colors"
            title="Open Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Pro Designed Vector Brand Logo: CuasarX Longevity By Keel */}
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="cursor-pointer p-1 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <CuasarLogo size="sm" showSubtitle={true} />
          </div>

          {/* Soft Minimalist Search Bar */}
          <div className="flex-1 max-w-2xl mx-1 md:mx-4 relative">
            <div className="flex items-center h-9 rounded-lg overflow-hidden bg-[#fbfaf8] hover:bg-[#f6f4ee] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#181716] border border-[#e5e1d7] transition-all">
              
              {/* Category Dropdown */}
              <div className="hidden sm:flex items-center text-xs px-2.5 h-full border-r border-[#e5e1d7] text-[#5c5851] font-medium select-none">
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium text-[#181716] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Categories</option>
                  <option value="Vitamins">Micronutrients</option>
                  <option value="Executive">Executive Stacks</option>
                  <option value="Supplements">Nootropics</option>
                  <option value="Diagnostics">Lab Panels</option>
                  <option value="Peptides">Peptides (Rx)</option>
                </select>
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search compounds, clinical panels, sleep protocols, peptides..."
                className="w-full h-full px-3 text-xs text-[#181716] placeholder-[#9c978d] bg-transparent focus:outline-none"
              />

              {/* Mic for Voice HPI */}
              <button 
                onClick={() => setChatOpen(true)}
                title="Voice Symptom Intake"
                className="px-2.5 h-full text-[#6e6960] hover:text-[#181716] hover:bg-[#eae7dd] flex items-center transition-colors border-l border-[#e5e1d7] cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Search button */}
              <button 
                onClick={() => {
                  setActiveTab('marketplace');
                  if (searchCategory !== 'All') setMarketplaceDepartment(searchCategory.toLowerCase());
                }}
                className="bg-[#181716] hover:bg-[#2e2c29] text-white px-3.5 h-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Autocomplete Dropdown */}
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white text-[#181716] rounded-xl shadow-lg border border-[#ebe7df] p-1.5 z-50 divide-y divide-[#f4f2ec]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a857b] px-2 py-1">
                  Matching Protocols &amp; Compounds
                </div>
                {searchSuggestions.map(item => (
                  <div
                    key={item.id}
                    onMouseDown={() => {
                      setSearchQuery(item.name);
                      setActiveTab('marketplace');
                    }}
                    className="p-2 hover:bg-[#f7f5ef] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-[#181716] block">{item.name}</span>
                      <span className="text-[11px] text-[#6e6960]">{item.category} • Grade {item.evidenceData?.grade || 'A'}</span>
                    </div>
                    <span className="font-semibold text-[#181716]">${(item.price || 45.00).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Persona Switcher */}
          <div className="relative group p-1 hover:bg-[#f6f4ee] rounded-lg cursor-pointer transition-colors flex-shrink-0">
            <div className="text-left leading-tight">
              <span className="text-[10px] text-[#8a857b] block font-medium">Profile</span>
              <span className="text-xs font-semibold text-[#181716] flex items-center gap-1">
                {activeUser.name.split(' ')[0]} <ChevronDown className="w-3 h-3 text-[#8a857b] group-hover:rotate-180 transition-transform" />
              </span>
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white text-[#181716] rounded-xl shadow-xl border border-[#ebe7df] p-2.5 hidden group-hover:block z-50 animate-in fade-in">
              <div className="border-b border-[#f4f2ec] pb-2 mb-2">
                <span className="text-[10px] font-semibold text-[#8a857b] uppercase tracking-wider block">Active Member</span>
                <span className="text-xs font-bold text-[#181716] block">{activeUser.name}</span>
                <span className="text-[11px] text-[#344a37] font-medium">{activeUser.lifestylePersona}</span>
              </div>
              <span className="text-[10px] font-semibold text-[#8a857b] uppercase tracking-wider block mb-1">Switch Persona:</span>
              <div className="space-y-0.5">
                {SYNTHETIC_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={cn(
                      "w-full text-left p-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                      activeUser.id === u.id ? "bg-[#f4f2ec] text-[#181716] font-semibold" : "hover:bg-[#faf9f6] text-[#5c5851]"
                    )}
                  >
                    <span>{u.name}</span>
                    {activeUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#344a37]" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-[#f4f2ec]">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-full py-1.5 bg-[#181716] text-white rounded-lg text-xs font-semibold text-center block hover:bg-[#2e2c29] transition-colors"
                >
                  Manage Biomarker Profile
                </button>
              </div>
            </div>
          </div>

          {/* Subscriptions / Regimen Shortcut */}
          <div 
            onClick={() => setActiveTab('supplements')}
            className="hidden md:flex flex-col p-1 hover:bg-[#f6f4ee] rounded-lg cursor-pointer transition-colors flex-shrink-0 text-left leading-tight"
          >
            <span className="text-[10px] text-[#8a857b] font-medium">Daily</span>
            <span className="text-xs font-semibold text-[#181716] flex items-center gap-1">
              <Repeat className="w-3 h-3 text-[#6e6960]" /> Regimens
            </span>
          </div>

          {/* Cart Button */}
          <button 
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg cursor-pointer transition-all flex-shrink-0"
            title="View Cart"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold">{totalCartCount}</span>
            <span className="hidden sm:inline text-xs font-mono text-[#dedad0]">(${totalCartAmount.toFixed(0)})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. SUB-NAVIGATION DEPARTMENT ROW                         */}
        {/* ======================================================== */}
        <div className="bg-[#faf9f6] border-t border-[#ebe7df] text-xs px-3 md:px-6 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            
            <button 
              onClick={() => { setActiveTab('marketplace'); setMarketplaceDepartment('all'); }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'marketplace' && marketplaceDepartment === 'all' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Featured Curation</span>
            </button>

            <button 
              onClick={navigateToVitamins}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'marketplace' && marketplaceDepartment === 'vitamins' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Micronutrients (#vitamins)</span>
            </button>

            <button 
              onClick={() => setActiveTab('supplements')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'supplements' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Daily Regimens</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'trends'
                  ? "bg-[#181716] text-white font-semibold shadow-xs"
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Lab Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              aria-current={activeTab === 'research' ? 'page' : undefined}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'research'
                  ? "bg-[#181716] text-white font-semibold shadow-xs"
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <FlaskConical className="w-3 h-3" aria-hidden="true" />
              <span>Research Base</span>
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'profile' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Organ Longevity (AOSM)</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'community'
                  ? "bg-[#181716] text-white font-semibold shadow-xs"
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Peer Network</span>
            </button>

            <button
              onClick={() => setActiveTab('consent')}
              aria-current={activeTab === 'consent' ? 'page' : undefined}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'consent'
                  ? "bg-[#181716] text-white font-semibold shadow-xs"
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>Privacy &amp; Consent</span>
            </button>

            <button 
              onClick={() => setActiveTab('admin')}
              className={cn(
                "hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer",
                activeTab === 'admin' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Physician Portal</span>
            </button>

            <button 
              onClick={() => setActiveTab('operator')}
              className={cn(
                "hidden 2xl:flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer",
                activeTab === 'operator' 
                  ? "bg-[#181716] text-white font-semibold shadow-xs" 
                  : "text-[#5c5851] hover:text-[#181716] hover:bg-[#eeebe3]"
              )}
            >
              <span>Telemetry</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="px-2 py-1 text-[#8c3232] hover:bg-[#fdf2f2] rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-[#8c3232]" />
              <span>Safety Guide</span>
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="px-2.5 py-1 bg-white hover:bg-[#f5f3ee] text-[#181716] border border-[#dedad0] rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3 h-3 text-[#5c5851]" />
              <span>CuasarX AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. MOBILE MENU DRAWER                                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl flex flex-col overflow-y-auto border-r border-[#ebe7df]"
            >
              <div className="p-4 flex items-center justify-between border-b border-[#f4f2ec]">
                <CuasarLogo size="sm" showSubtitle={true} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#6e6960] hover:text-[#181716]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 text-xs text-[#181716] flex-1">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#8a857b] mb-2">
                    Departments
                  </h4>
                  <div className="space-y-0.5">
                    {[
                      { tab: 'marketplace', dept: 'all', label: "Featured Curation" },
                      { tab: 'marketplace', dept: 'vitamins', label: 'Micronutrients (#vitamins)' },
                      { tab: 'supplements', dept: undefined, label: 'Daily Regimens & Auto-Refills' },
                      { tab: 'trends', dept: undefined, label: 'Biomarker Telemetry' },
                      { tab: 'research', dept: undefined, label: 'Performance Research Base' },
                      { tab: 'profile', dept: undefined, label: 'Organ Health (AOSM) & DNA' },
                      { tab: 'community', dept: undefined, label: 'Peer Network' },
                      { tab: 'consent', dept: undefined, label: 'Privacy & Consent' },
                      { tab: 'admin', dept: undefined, label: 'Physician Clinical Monitor' },
                      { tab: 'operator', dept: undefined, label: 'Telemetry Health' },
                    ].map(item => {
                      const active = activeTab === item.tab && (item.dept === undefined || marketplaceDepartment === item.dept);
                      return (
                        <button
                          key={`${item.tab}-${item.dept || 'default'}`}
                          onClick={() => { 
                            setActiveTab(item.tab as any); 
                            if (item.dept) setMarketplaceDepartment(item.dept);
                            setMobileMenuOpen(false); 
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors font-medium",
                            active ? "bg-[#f4f2ec] text-[#181716] font-semibold" : "hover:bg-[#faf9f6] text-[#5c5851]"
                          )}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f4f2ec] space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); openVideoVisit('patient', activeUser); }}
                    className="w-full py-2 bg-[#344a37] hover:bg-[#2a3b2d] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" aria-hidden="true" /> Start Video Visit
                  </button>
                </div>

                <div className="pt-3 border-t border-[#f4f2ec]">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#8a857b] mb-2">
                    Switch Persona
                  </h4>
                  <div className="space-y-1">
                    {SYNTHETIC_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setActiveUser(u); setMobileMenuOpen(false); }}
                        className={cn(
                          "w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between",
                          activeUser.id === u.id ? "bg-[#181716] text-white font-semibold" : "hover:bg-[#faf9f6] text-[#5c5851]"
                        )}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] opacity-70">{u.lifestylePersona.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT CONTAINER                                */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-[1540px] w-full mx-auto p-3 sm:p-5 md:p-8">
        {activeTab === 'marketplace' && (
          <Marketplace 
            user={activeUser} 
            initialDepartment={marketplaceDepartment}
            searchQuery={searchQuery}
            onAddToCart={handleAddProductsToCart}
            onOpenCart={() => setCartOpen(true)}
            onBuyNow={(prod) => {
              handleAddProductsToCart([prod]);
              setCartOpen(true);
            }}
          />
        )}
        {activeTab === 'supplements' && <SupplementManager user={activeUser} onAddToCart={handleAddProductsToCart} />}
        {activeTab === 'trends' && (
          <BiomarkerTrends
            user={activeUser}
            onAddToCart={handleAddProductsToCart}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'research' && <PerformanceResearch />}
        {activeTab === 'profile' && (
          <UserProfileTab 
            user={activeUser} 
            onUpdateUser={handleUpdateUserData} 
            onNavigateToMarketplace={() => {
              setActiveTab('marketplace');
              setMarketplaceDepartment('diagnostics');
            }}
          />
        )}
        {activeTab === 'community' && <CommunityConnect user={activeUser} onEvaluateWithAi={handleEvaluateGroupMessage} />}
        {activeTab === 'consent' && (
          <ConsentCenter
            user={activeUser}
            onStartVideoVisit={() => openVideoVisit('patient', activeUser)}
          />
        )}
        {activeTab === 'admin' && (
          <AdminPatientMonitor
            currentUser={activeUser}
            onStartVisit={(patient) => openVideoVisit('clinician', patient)}
            onNavigateToConsent={() => setActiveTab('consent')}
          />
        )}
        {activeTab === 'operator' && <OperatorDashboard activeUser={activeUser} />}
      </main>

      {/* ======================================================== */}
      {/* 5. SLIDE-OVER CART DRAWER                                */}
      {/* ======================================================== */}
      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onToggleSubscription={handleToggleCartSubscription}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        user={activeUser}
      />

      {/* ======================================================== */}
      {/* 6. FLOATING ASSISTANT BUTTON (Desktop)                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={() => setChatOpen(true)}
            className="hidden md:flex fixed right-6 bottom-6 z-40 bg-[#181716] hover:bg-[#2e2c29] text-white px-4 py-2.5 rounded-full shadow-lg items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#dedad0]" />
            <span>CuasarX AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. PHI CHAT ASSISTANT SIDEBAR                           */}
      {/* ======================================================== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[420px] bg-white z-50 shadow-2xl border-l border-[#ebe7df] overflow-hidden"
          >
            <PhiChat 
              user={activeUser} 
              incomingEvaluation={incomingEvaluation}
              onClose={() => setChatOpen(false)} 
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 8. SAFETY / EMERGENCY PROTOCOL MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#ebe7df] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f4f2ec]">
                <div className="flex items-center gap-2 text-[#8c3232]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-[#181716]">
                    Clinical Safety &amp; Emergency Protocol
                  </h3>
                </div>
                <button 
                  onClick={() => setEmergencyModalOpen(false)}
                  className="p-1 text-[#8a857b] hover:text-[#181716] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#fdf2f2] border border-[#f5d5d5] p-3.5 rounded-xl text-xs text-[#8c3232] space-y-1">
                <p className="font-semibold">
                  For acute symptoms including severe chest pain, shortness of breath, sudden numbness, or loss of consciousness:
                </p>
                <p className="text-[11px] opacity-90">
                  Call emergency dispatch (911 in the US) immediately. Digital wellness telemetry is not a substitute for emergency medicine.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#5c5851]">
                <span className="font-semibold text-[#181716] block">Emergency Resources:</span>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-[#faf9f6] rounded-lg border border-[#ebe7df] flex items-center justify-between">
                    <span>Immediate Emergency Dispatch:</span>
                    <a href="tel:911" className="px-3 py-1 bg-[#8c3232] hover:bg-[#732828] text-white rounded font-semibold flex items-center gap-1 text-xs">
                      <PhoneCall className="w-3 h-3" /> Call 911
                    </a>
                  </div>
                  <div className="p-2.5 bg-[#faf9f6] rounded-lg border border-[#ebe7df] flex items-center justify-between">
                    <span>24/7 Clinical Triage Line:</span>
                    <span className="font-mono font-semibold text-[#181716]">1-800-BIO-HACK</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="w-full py-2 bg-[#181716] hover:bg-[#2e2c29] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close Safety Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 10. TELEMEDICINE VIDEO VISIT OVERLAY                      */}
      {/* ======================================================== */}
      {videoVisit && (
        <TelemedicineVisit
          mode={videoVisit.mode}
          patient={videoVisit.patient}
          onClose={() => setVideoVisit(null)}
        />
      )}

      {/* ======================================================== */}
      {/* 11. FIRST-RUN PRIVACY & CONSENT GATE                      */}
      {/* ======================================================== */}
      <FirstRunConsent />

      {/* ======================================================== */}
      {/* 9. MOBILE BOTTOM NAVIGATION DOCK                         */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#ebe7df] z-40 flex items-center justify-around text-[#5c5851] px-2">
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'marketplace' ? "text-[#181716] font-bold" : "hover:text-[#181716]"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Curate</span>
        </button>

        <button 
          onClick={() => setActiveTab('supplements')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'supplements' ? "text-[#181716] font-bold" : "hover:text-[#181716]"
          )}
        >
          <Pill className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Regimens</span>
        </button>

        <button 
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-[#181716] text-white w-10 h-10 rounded-full shadow-md active:scale-95 transition-transform"
          title="Clinical Assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setActiveTab('trends')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'trends' ? "text-[#181716] font-bold" : "hover:text-[#181716]"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Labs</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'profile' ? "text-[#181716] font-bold" : "hover:text-[#181716]"
          )}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}

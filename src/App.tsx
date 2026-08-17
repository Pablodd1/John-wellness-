/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYNTHETIC_USERS } from './data';
import { UserProfile, ThemeMode, Product } from './types';
import { UserSelector } from './components/UserSelector';
import { SupplementManager } from './components/SupplementManager';
import { IntegrationCenter } from './components/IntegrationCenter';
import { IntakeOnboarding } from './components/IntakeOnboarding';
import { Marketplace } from './components/Marketplace';
import { CommunityConnect } from './components/CommunityConnect';
import { OperatorDashboard } from './components/OperatorDashboard';
import { BiomarkerTrends } from './components/BiomarkerTrends';
import { UserProfileTab } from './components/UserProfileTab';
import { AdminPatientMonitor } from './components/AdminPatientMonitor';
import { PhiChat } from './components/PhiChat';
import { ThemeSelector } from './components/ThemeSelector';
import { BrandLogoSelector, LogoOptionId, LOGO_OPTIONS } from './components/BrandLogoSelector';
import { 
  ShoppingBag, 
  ShoppingCart,
  Shield, 
  Pill, 
  Database, 
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
  Folder,
  Settings,
  Box,
  Search,
  MapPin,
  Mic,
  ChevronDown,
  Flame,
  Zap,
  Repeat,
  HeartPulse,
  Dna,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgePercent
} from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeUser, setActiveUser] = useState<UserProfile>(SYNTHETIC_USERS[0]);
  const [activeTab, setActiveTab] = useState<'profile' | 'trends' | 'supplements' | 'marketplace' | 'community' | 'admin' | 'operator'>('marketplace');
  const [marketplaceDepartment, setMarketplaceDepartment] = useState<string>('all');
  const [themeMode, setThemeMode] = useState<ThemeMode>('smart_marketplace');
  const [activeLogoId, setActiveLogoId] = useState<LogoOptionId>('waveform');
  const [incomingEvaluation, setIncomingEvaluation] = useState<{ text: string; senderName: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Handle URL Hash Deep-Linking (e.g. #vitamins, #supplements, #trends, etc.)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#vitamins' || hash.includes('vitamin')) {
        setActiveTab('marketplace');
        setMarketplaceDepartment('vitamins');
        setTimeout(() => {
          const el = document.getElementById('vitamins');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
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
      } else if (hash === '#community') {
        setActiveTab('community');
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
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const selectedLogo = LOGO_OPTIONS.find(l => l.id === activeLogoId) || LOGO_OPTIONS[0];
  const LogoIcon = selectedLogo.svgIcon;

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
    setActiveUser(prev => {
      const existingIds = new Set(prev.inventory.map(p => p.id));
      const newItems = products.filter(p => !existingIds.has(p.id));
      return {
        ...prev,
        inventory: [...prev.inventory, ...newItems]
      };
    });
    setCartCount(prev => prev + products.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] text-slate-900 font-sans pb-16 md:pb-0">
      
      {/* ======================================================== */}
      {/* 1. SMART MARKETPLACE TOP HEADER (Midnight Slate & Teal) */}
      {/* ======================================================== */}
      <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
        
        {/* Top Row: Brand, Deliver To, Search, Account, Regimens, Cart */}
        <div className="max-w-[1540px] mx-auto px-2 md:px-4 py-2.5 flex items-center justify-between gap-2 md:gap-4">
          
          {/* Mobile Menu Hamburger (Mobile Only) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white hover:bg-slate-800 rounded-lg flex items-center"
            title="Open Department Drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* CuasarX Smart Marketplace Brand */}
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="cursor-pointer flex items-center gap-2 p-1.5 hover:bg-slate-800/80 rounded-lg transition-all flex-shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-lg flex items-center justify-center p-1 font-black shadow-md shadow-emerald-500/20">
              <LogoIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white leading-none">Cuasar<span className="text-emerald-400">X</span></span>
                <span className="text-[10px] bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">Personal</span>
              </div>
              <span className="text-[9px] text-teal-300 font-semibold tracking-wider leading-tight">Smart Marketplace &amp; Biohack World</span>
            </div>
          </div>

          {/* Deliver To Widget (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer transition-all flex-shrink-0 border border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 block font-medium">Deliver to {activeUser.name.split(' ')[0]}</span>
              <span className="text-xs font-bold text-white truncate max-w-[130px] block">
                {activeUser.lifestylePersona === 'High-Stress Executive / Zero-Time' ? 'San Francisco 94107' : 'Austin TX 78701'}
              </span>
            </div>
          </div>

          {/* Smart Global Search Bar */}
          <div className="flex-1 max-w-3xl mx-1 md:mx-3">
            <div className="flex items-center h-10 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 shadow-sm border border-slate-200">
              
              {/* Category Selector Dropdown (Desktop) */}
              <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 h-full border-r border-slate-200 cursor-pointer font-medium select-none">
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Biohacks</option>
                  <option value="Vitamins">Vitamins &amp; Micronutrients</option>
                  <option value="Executive">Executive Stacks</option>
                  <option value="Supplements">Supplements &amp; Nootropics</option>
                  <option value="Diagnostics">Lab Panels &amp; Blood</option>
                  <option value="DNA">DNA &amp; Genetics</option>
                  <option value="Peptides">Peptides (Rx Gate)</option>
                </select>
              </div>

              {/* Search Input Field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplements, blood panels, DNA kits, peptides, Oura sleep protocols..."
                className="w-full h-full px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />

              {/* Voice HPI Mic in Search Bar */}
              <button 
                onClick={() => setChatOpen(true)}
                title="Voice HPI &amp; Symptom Intake"
                className="px-2.5 h-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center transition-colors border-l border-slate-200"
              >
                <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              </button>

              {/* Smart Emerald Search Button */}
              <button 
                onClick={() => setActiveTab('marketplace')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 h-full flex items-center justify-center transition-colors flex-shrink-0 font-bold"
                title="Search Marketplace"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Quick Voice HPI Dictation Pill (Desktop) */}
          <button
            onClick={() => setChatOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-black shadow-md transition-all hover:scale-105"
            title="Record Voice History of Present Illness"
          >
            <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Voice HPI</span>
          </button>

          {/* Account & Persona Switcher */}
          <div className="relative group p-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer transition-all flex-shrink-0 border border-transparent hover:border-slate-700">
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 block">Hello, {activeUser.name.split(' ')[0]}</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                Personal Profile <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>

            {/* Persona Quick Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-3 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Biohack Persona</span>
                <span className="text-xs font-extrabold text-slate-950 block">{activeUser.name}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{activeUser.lifestylePersona}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Switch Profile:</span>
              <div className="space-y-1">
                {SYNTHETIC_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors",
                      activeUser.id === u.id ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-200" : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <span>{u.name}</span>
                    {activeUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold text-center block hover:bg-slate-800 shadow-sm"
                >
                  Manage Full Intake &amp; DNA
                </button>
              </div>
            </div>
          </div>

          {/* Active Regimen / Cart Button */}
          <div 
            onClick={() => setActiveTab('supplements')}
            className="flex items-center gap-2 p-2 hover:bg-slate-800/80 rounded-lg cursor-pointer transition-all flex-shrink-0 border border-slate-800"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-sm">
                {cartCount}
              </span>
            </div>
            <span className="hidden md:inline font-bold text-xs text-white">Regimen</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SECONDARY SUB-NAVIGATION RIBBON (Slate #1e293b)       */}
        {/* ======================================================== */}
        <div className="bg-[#1e293b] border-t border-slate-800 text-white text-xs px-2 md:px-4 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            
            {/* All Departments Drawer Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 font-bold hover:bg-slate-800 rounded-md transition-all text-white border border-slate-700/60"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span>All Biohacks</span>
            </button>

            {/* Department Ribbon Links */}
            <button 
              onClick={() => { setActiveTab('marketplace'); setMarketplaceDepartment('all'); }}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'marketplace' && marketplaceDepartment === 'all' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Today&apos;s Biohack Deals</span>
            </button>

            {/* Vitamins & Longevity Micronutrients Direct Deep-link */}
            <button 
              onClick={navigateToVitamins}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'marketplace' && marketplaceDepartment === 'vitamins' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
              title="Browse Clinical Vitamins & Micronutrients (#vitamins)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vitamins &amp; Micronutrients</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">#vitamins</span>
            </button>

            <button 
              onClick={() => setActiveTab('supplements')}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'supplements' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Pill className="w-3.5 h-3.5 text-teal-400" />
              <span>Supplements &amp; Auto-Delivery</span>
            </button>

            <button 
              onClick={() => setActiveTab('trends')}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'trends' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biomarker Telemetry</span>
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'profile' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Dna className="w-3.5 h-3.5 text-purple-400" />
              <span>User Profile, Labs &amp; DNA</span>
            </button>

            <button 
              onClick={() => setActiveTab('community')}
              className={cn(
                "px-2.5 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'community' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Peer &amp; Biohack Community</span>
            </button>

            <button 
              onClick={() => setActiveTab('admin')}
              className={cn(
                "hidden xl:flex items-center gap-1.5 px-2.5 py-1 font-semibold rounded-md transition-all",
                activeTab === 'admin' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
              <span>ADM Patient Monitor</span>
            </button>

            <button 
              onClick={() => setActiveTab('operator')}
              className={cn(
                "hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 font-semibold rounded-md transition-all",
                activeTab === 'operator' ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Operator View</span>
            </button>
          </div>

          {/* Right Ribbon Side Actions: 911 Emergency Protocol & CuasarX Assistant */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all"
              title="911 Emergency & Acute Biomarker Deviation Protocol"
            >
              <Activity className="w-3.5 h-3.5 text-white" />
              <span>911 Protocol</span>
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
              <span>CuasarX AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Mobile Deliver-To Strip (Mobile Only) */}
        <div className="md:hidden bg-[#1e293b] px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-1.5 border-t border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Deliver to {activeUser.name.split(' ')[0]} - San Francisco 94107</span>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. DEPARTMENT DRAWER / SIDEBAR (Desktop & Mobile)        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Drawer User Banner */}
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black">
                    <User className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Hello,</span>
                    <span className="text-sm font-extrabold text-white block">{activeUser.name}</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              <div className="p-4 space-y-4 text-xs text-slate-800 flex-1">
                
                {/* Section: Main Biohack Marketplace */}
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Digital Biohacking Departments
                  </h4>
                  <div className="space-y-1">
                    {[
                      { tab: 'marketplace', dept: 'all', label: "Today's Biohack Deals", icon: Flame, badge: 'Personal' },
                      { tab: 'marketplace', dept: 'vitamins', label: 'Vitamins & Longevity Micronutrients', icon: Sparkles, badge: '#vitamins' },
                      { tab: 'supplements', dept: undefined, label: 'Supplements & Biohacking Stacks', icon: Pill },
                      { tab: 'trends', dept: undefined, label: 'Biomarker Trends & Wearables', icon: TrendingUp },
                      { tab: 'profile', dept: undefined, label: 'User Profile, Labs & DNA Tests', icon: Dna },
                      { tab: 'community', dept: undefined, label: 'Peer Biohackers & AI Validation', icon: Users },
                      { tab: 'admin', dept: undefined, label: 'ADM Clinical Patient Monitor', icon: Stethoscope },
                      { tab: 'operator', dept: undefined, label: 'Operator Dashboard', icon: Shield },
                    ].map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.tab && (item.dept === undefined || marketplaceDepartment === item.dept);
                      return (
                        <button
                          key={`${item.tab}-${item.dept || 'default'}`}
                          onClick={() => { 
                            setActiveTab(item.tab as any); 
                            if (item.dept) {
                              setMarketplaceDepartment(item.dept);
                              if (item.dept === 'vitamins') {
                                window.location.hash = 'vitamins';
                                setTimeout(() => {
                                  const el = document.getElementById('vitamins');
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 150);
                              }
                            }
                            setMobileMenuOpen(false); 
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors font-medium",
                            active ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-200" : "hover:bg-slate-100 text-slate-700"
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-slate-700" />
                            <span>{item.label}</span>
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Voice HPI & Clinical Tools */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Clinical Voice &amp; Diagnostics
                  </h4>
                  <button
                    onClick={() => { setChatOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-bold hover:bg-rose-100 transition-colors mb-2"
                  >
                    <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Launch Voice HPI Symptom Intake</span>
                  </button>

                  <button
                    onClick={() => { setEmergencyModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                  >
                    <Activity className="w-4 h-4 text-white" />
                    <span>911 Emergency Protocol</span>
                  </button>
                </div>

                {/* Section: Persona Selector in Drawer */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Switch Active Persona
                  </h4>
                  <div className="space-y-1">
                    {SYNTHETIC_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setActiveUser(u); setMobileMenuOpen(false); }}
                        className={cn(
                          "w-full text-left p-2 rounded text-xs font-semibold flex items-center justify-between",
                          activeUser.id === u.id ? "bg-slate-900 text-white font-bold" : "hover:bg-slate-100 text-slate-600"
                        )}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.lifestylePersona.split(' ')[0]}</span>
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
      <main className="flex-1 max-w-[1540px] w-full mx-auto p-2 sm:p-4 md:p-6">
        {activeTab === 'marketplace' && (
          <Marketplace 
            user={activeUser} 
            initialDepartment={marketplaceDepartment}
            onAddToCart={handleAddProductsToCart}
          />
        )}
        {activeTab === 'profile' && (
          <UserProfileTab 
            user={activeUser} 
            onUpdateUser={handleUpdateUserData} 
            onNavigateToMarketplace={() => {
              setActiveTab('marketplace');
              setMarketplaceDepartment('diagnostics');
              setTimeout(() => {
                const el = document.getElementById('aosm');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 150);
            }}
          />
        )}
        {activeTab === 'trends' && (
          <BiomarkerTrends 
            user={activeUser} 
            onAddToCart={handleAddProductsToCart}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'supplements' && <SupplementManager user={activeUser} />}
        {activeTab === 'community' && <CommunityConnect user={activeUser} onEvaluateWithAi={handleEvaluateGroupMessage} />}
        {activeTab === 'admin' && <AdminPatientMonitor currentUser={activeUser} />}
        {activeTab === 'operator' && <OperatorDashboard activeUser={activeUser} />}
      </main>

      {/* ======================================================== */}
      {/* 5. MOBILE CELLPHONE BOTTOM APP DOCK (Fixed)              */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a] border-t border-slate-800 z-40 flex items-center justify-around text-white px-2 shadow-2xl">
        
        {/* Tab 1: Shop / Marketplace */}
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'marketplace' ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
          )}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Market</span>
        </button>

        {/* Tab 2: Regimens / Supplements */}
        <button 
          onClick={() => setActiveTab('supplements')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'supplements' ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
          )}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Regimen</span>
        </button>

        {/* Center Floating Action: Voice HPI Dictate */}
        <button 
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 text-slate-950 w-12 h-12 rounded-full shadow-lg border-2 border-[#0f172a] active:scale-95 transition-transform"
          title="Voice HPI Dictation"
        >
          <Mic className="w-6 h-6 text-white animate-pulse" />
        </button>

        {/* Tab 3: Telemetry / Biomarkers */}
        <button 
          onClick={() => setActiveTab('trends')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'trends' ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Telemetry</span>
        </button>

        {/* Tab 4: Account & DNA */}
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'profile' ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Personal</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 6. FLOATING CUASARX ASSISTANT RE-OPEN BUTTON (Desktop)    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={() => setChatOpen(true)}
            className="hidden md:flex fixed right-6 bottom-6 z-50 bg-[#0f172a] hover:bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl items-center gap-2.5 font-extrabold text-xs border border-emerald-500/50 transition-transform hover:scale-105"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
            </div>
            <span>CuasarX Voice Assistant</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black">AI Live</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. PHI CHAT ASSISTANT SIDEBAR WITH VOICE HPI ENGINE      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[420px] bg-white z-50 shadow-2xl border-l border-slate-300 overflow-hidden"
          >
            <PhiChat 
              user={activeUser} 
              incomingEvaluation={incomingEvaluation}
              activeLogoId={activeLogoId} 
              onClose={() => setChatOpen(false)} 
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 8. 911 EMERGENCY PROTOCOL MODAL                           */}
      {/* ======================================================== */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-4 border-rose-600"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-rose-700">911 Emergency Protocol</h3>
                    <p className="text-xs text-slate-500">Acute Biometric &amp; Clinical Anomaly Dispatch</p>
                  </div>
                </div>
                <button onClick={() => setEmergencyModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  If you are experiencing chest pain, severe shortness of breath, or neurological symptoms, call 911 immediately.
                </p>
                <p>
                  CuasarX telemetry can immediately bundle your last 24h Oura HRV data, blood panels, and active peptide/supplement regimens into an emergency clinician dispatch summary.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Patient: {activeUser.name}</span>
                  <span className="text-slate-500">Telemetry: Synced</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Emergency Contact:</span>
                  <span className="text-indigo-600 font-semibold">(555) 019-2834 (Family / Physician)</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setEmergencyModalOpen(false)}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    alert('Emergency clinician telemetry dispatch transmitted successfully.');
                    setEmergencyModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-rose-600/30"
                >
                  Transmit Clinician Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


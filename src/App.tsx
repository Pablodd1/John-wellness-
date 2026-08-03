/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SYNTHETIC_USERS } from './data';
import { UserProfile, ThemeMode } from './types';
import { UserSelector } from './components/UserSelector';
import { MissionControl } from './components/MissionControl';
import { SupplementManager } from './components/SupplementManager';
import { IntegrationCenter } from './components/IntegrationCenter';
import { IntakeOnboarding } from './components/IntakeOnboarding';
import { Marketplace } from './components/Marketplace';
import { CommunityConnect } from './components/CommunityConnect';
import { OperatorDashboard } from './components/OperatorDashboard';
import { PhiChat } from './components/PhiChat';
import { ThemeSelector } from './components/ThemeSelector';
import { BrandLogoSelector, LogoOptionId, LOGO_OPTIONS } from './components/BrandLogoSelector';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Shield, 
  Pill, 
  Database, 
  Sparkles, 
  Users, 
  Menu, 
  X, 
  Activity,
  MessageSquare,
  Palette,
  Layers
} from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeUser, setActiveUser] = useState<UserProfile>(SYNTHETIC_USERS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'onboarding' | 'supplements' | 'integrations' | 'marketplace' | 'community' | 'operator' | 'themes'>('dashboard');
  const [themeMode, setThemeMode] = useState<ThemeMode>('nordic');
  const [activeLogoId, setActiveLogoId] = useState<LogoOptionId>('delta');
  const [incomingEvaluation, setIncomingEvaluation] = useState<{ text: string; senderName: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

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

  const isDarkTheme = themeMode === 'obsidian' || themeMode === 'solar';

  const NavLink = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: any }) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all",
        activeTab === tab 
          ? (themeMode === 'solar' ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20" : themeMode === 'nordic' ? "bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-700/20" : isDarkTheme ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-white shadow-sm")
          : (isDarkTheme ? "text-slate-300 hover:bg-slate-800/80 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  // Theme container classes based on themeMode
  const themeContainerClass = 
    themeMode === 'obsidian' ? 'bg-slate-950 text-slate-100' :
    themeMode === 'nordic' ? 'bg-[#f2f7f4] text-emerald-950' :
    themeMode === 'solar' ? 'bg-[#070b1e] text-amber-50' : 'bg-slate-50 text-slate-900';

  const sidebarClass = 
    themeMode === 'solar' ? 'bg-[#0d1330] border-amber-500/20 text-slate-100' :
    themeMode === 'obsidian' ? 'bg-slate-900 border-slate-800 text-slate-100' :
    themeMode === 'nordic' ? 'bg-white border-emerald-100 text-emerald-950' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-300", themeContainerClass)}>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 text-amber-400 rounded-lg flex items-center justify-center p-1 shadow-sm">
            <LogoIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white">JohnMatrix</span>
            <span className="block text-[9px] text-indigo-300 font-bold uppercase">{selectedLogo.subtitle}</span>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed md:static top-16 left-0 bottom-0 w-64 border-r z-30 transform transition-transform duration-300 flex flex-col shadow-sm",
        sidebarClass,
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 hidden md:flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
            <LogoIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight block leading-tight text-sm">JohnMatrix</span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{selectedLogo.subtitle}</span>
          </div>
        </div>
        
        <div className="px-4 mb-3">
          <UserSelector selectedUser={activeUser} onSelect={setActiveUser} />
        </div>

        {/* 2D Brand Logo Quick Selector */}
        <div className="px-4 mb-3">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-indigo-600" /> 2D Vector Logo</span>
              <button onClick={() => setActiveTab('themes')} className="text-indigo-600 hover:underline text-[10px]">3 Options</button>
            </div>
            <BrandLogoSelector activeLogoId={activeLogoId} onSelectLogo={setActiveLogoId} compact={true} />
          </div>
        </div>

        {/* Global Theme Selector Quick Switcher in Sidebar */}
        <div className="px-4 mb-3">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5 text-indigo-600" /> Theme Palette</span>
              <button onClick={() => setActiveTab('themes')} className="text-indigo-600 hover:underline text-[10px]">Customize</button>
            </div>
            <ThemeSelector currentTheme={themeMode} onSelectTheme={setThemeMode} compact={true} />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavLink icon={LayoutDashboard} label="Daily Mission" tab="dashboard" />
          <NavLink icon={Sparkles} label="Multimodal Intake (CuasarX)" tab="onboarding" />
          <NavLink icon={Pill} label="Supplements & Biohacking" tab="supplements" />
          <NavLink icon={ShoppingBag} label="Marketplace" tab="marketplace" />
          <NavLink icon={Users} label="Peer & Community Group Chat" tab="community" />
          <NavLink icon={Database} label="Integration Center" tab="integrations" />
          <NavLink icon={Shield} label="Operator View" tab="operator" />
          <NavLink icon={Palette} label="Themes & 2D Brand Logos" tab="themes" />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm mb-2">
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-white" /> 911 / Emergency Protocol</span>
          </button>
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-600" /> CuasarX Assistant</span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-full">{chatOpen ? "Open" : "Minimised"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <MissionControl user={activeUser} />}
          {activeTab === 'onboarding' && <IntakeOnboarding user={activeUser} onComplete={handleUpdateUserData} />}
          {activeTab === 'supplements' && <SupplementManager user={activeUser} />}
          {activeTab === 'marketplace' && <Marketplace user={activeUser} />}
          {activeTab === 'community' && <CommunityConnect user={activeUser} onEvaluateWithAi={handleEvaluateGroupMessage} />}
          {activeTab === 'integrations' && <IntegrationCenter user={activeUser} />}
          {activeTab === 'operator' && <OperatorDashboard activeUser={activeUser} />}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <BrandLogoSelector activeLogoId={activeLogoId} onSelectLogo={setActiveLogoId} compact={false} />
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <ThemeSelector currentTheme={themeMode} onSelectTheme={setThemeMode} compact={false} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Phi Chat Sidebar (Desktop / Overlay) */}
      <aside className={cn(
        "fixed right-0 top-16 md:top-0 bottom-0 w-80 md:w-96 bg-white z-40 transform transition-transform duration-300 border-l border-slate-200 shadow-xl",
        chatOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <PhiChat user={activeUser} incomingEvaluation={incomingEvaluation} activeLogoId={activeLogoId} />
      </aside>
    </div>
  );
}

import React from 'react';
import { ThemeMode } from '../types';
import { Palette, Check, Moon, Sun, Sparkles, Shield, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  compact?: boolean;
}

export const THEMES: {
  id: ThemeMode;
  name: string;
  tagline: string;
  previewBg: string;
  previewCard: string;
  accentColor: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'smart_marketplace',
    name: 'Smart Marketplace & Personal Biohack',
    tagline: 'Custom E-Commerce & 1-Click Biometric Subscriptions',
    previewBg: 'bg-[#0f172a] border-emerald-500',
    previewCard: 'bg-white text-slate-900 border-slate-200',
    accentColor: 'bg-emerald-600 text-white',
    badge: 'Personal Biohack',
    description: 'High-performance bespoke e-commerce layout with midnight slate navigation (#0f172a), bio-emerald instant checkout, and responsive mobile bottom dock.'
  },
  {
    id: 'titanium',
    name: 'Titanium Precision',
    tagline: 'Modern Executive Light',
    previewBg: 'bg-slate-100 border-slate-200',
    previewCard: 'bg-white text-slate-900 border-slate-200',
    accentColor: 'bg-indigo-600',
    badge: 'Clean Light',
    description: 'Ultra-crisp light canvas with slate-900 typography, indigo focus rings, and high contrast data tables.'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    tagline: 'Stealth Dark Mode Biohack',
    previewBg: 'bg-slate-950 border-slate-800',
    previewCard: 'bg-slate-900 text-slate-100 border-slate-800',
    accentColor: 'bg-cyan-500',
    badge: 'Stealth Dark',
    description: 'Deep obsidian dark canvas (#090d16) with bioluminescent cyan and violet accents to reduce eye strain.'
  },
  {
    id: 'nordic',
    name: 'Nordic Emerald',
    tagline: 'Organic Biohacking & Circadian Flow',
    previewBg: 'bg-emerald-950/20 border-emerald-200',
    previewCard: 'bg-white text-emerald-950 border-emerald-100',
    accentColor: 'bg-emerald-600',
    badge: 'Calm Wellness',
    description: 'Soothing sage tones (#f2f7f4) with deep forest green accents, optimized for parasympathetic recovery.'
  },
  {
    id: 'solar',
    name: 'Solar Cyberpunk',
    tagline: 'High-Energy Midnight & Amber Gold',
    previewBg: 'bg-indigo-950 border-amber-500/30',
    previewCard: 'bg-slate-900 text-amber-100 border-amber-500/20',
    accentColor: 'bg-amber-500',
    badge: 'Executive Night',
    description: 'Midnight navy canvas with warm solar gold (#f59e0b) and amethyst highlights for executive focus.'
  }
];

export function ThemeSelector({ currentTheme, onSelectTheme, compact = false }: ThemeSelectorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            title={`${t.name} - ${t.tagline}`}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
              currentTheme === t.id 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", t.accentColor)} />
            <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" /> Global Modern Visual Design Themes
          </h3>
          <p className="text-xs text-slate-500">
            Select a custom color palette for JohnMatrix &amp; CuasarX Assistant interfaces
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {THEMES.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={cn(
                "relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group hover:scale-[1.02]",
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-md bg-white"
                  : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white", theme.accentColor)}>
                    {theme.badge}
                  </span>
                  {isSelected && (
                    <span className="p-1 bg-indigo-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {theme.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 mb-2">{theme.tagline}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{theme.description}</p>
              </div>

              {/* Theme Mini Preview Palette Box */}
              <div className={cn("p-2.5 rounded-xl border flex items-center gap-2", theme.previewBg)}>
                <div className={cn("w-4 h-4 rounded-full flex-shrink-0 shadow-sm", theme.accentColor)} />
                <div className={cn("flex-1 p-1.5 rounded-lg text-[10px] font-bold border truncate", theme.previewCard)}>
                  CuasarX Interface
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, Sparkles, Check, Cpu, Activity, Dna, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export type LogoOptionId = 'delta' | 'nexus' | 'waveform';

export interface LogoOption {
  id: LogoOptionId;
  name: string;
  subtitle: string;
  tagline: string;
  svgIcon: (props: { className?: string; color?: string }) => React.ReactNode;
  designConcept: string;
  bestForTheme: string;
}

export const LOGO_OPTIONS: LogoOption[] = [
  {
    id: 'delta',
    name: 'Logo 1: CuasarX Keel Emblem (Diamond Axis)',
    subtitle: 'Longevity by Keel',
    tagline: 'Precision Celestial & Biological Core',
    svgIcon: ({ className = "w-8 h-8", color = "currentColor" }) => (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L34 20L20 36L6 20L20 4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <line x1="20" y1="8" x2="20" y2="32" stroke={color} strokeWidth="2.25" strokeLinecap="round" />
        <line x1="12" y1="20" x2="28" y2="20" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="20" cy="20" r="3.5" fill={color} />
        <circle cx="20" cy="11" r="1.2" fill={color} />
        <circle cx="20" cy="29" r="1.2" fill={color} />
      </svg>
    ),
    designConcept: 'Diamond Keel axis intersecting continuous circadian rhythms, representing precision medical engineering and systemic longevity.',
    bestForTheme: 'Soft Alabaster & Ink'
  },
  {
    id: 'nexus',
    name: 'Logo 2: Biomolecular Nexus (Concentric DNA Ring)',
    subtitle: 'Molecular Longevity Core',
    tagline: '2D Circular Vector Hierarchy',
    svgIcon: ({ className = "w-8 h-8", color = "currentColor" }) => (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer 2D Ring */}
        <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="3" strokeDasharray="6 3" />
        {/* Inner Solid Ring */}
        <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="2.5" fill="none" />
        {/* Central Apex Core */}
        <circle cx="32" cy="32" r="7" fill={color} />
        {/* 4 Radial Connector Nodes */}
        <line x1="32" y1="6" x2="32" y2="14" stroke={color} strokeWidth="2.5" />
        <line x1="32" y1="50" x2="32" y2="58" stroke={color} strokeWidth="2.5" />
        <line x1="6" y1="32" x2="14" y2="32" stroke={color} strokeWidth="2.5" />
        <line x1="50" y1="32" x2="58" y2="32" stroke={color} strokeWidth="2.5" />
      </svg>
    ),
    designConcept: 'Clean 2D radial DNA motif representing holistic cellular synchronization, biomarker analytics, and executive wellness.',
    bestForTheme: 'Nordic Emerald'
  },
  {
    id: 'waveform',
    name: 'Logo 3: Cuasar Waveform (Executive Sine Emblem)',
    subtitle: 'Circadian Waveform Core',
    tagline: '2D High-Contrast Executive Emblem',
    svgIcon: ({ className = "w-8 h-8", color = "currentColor" }) => (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rounded Square 2D Frame */}
        <rect x="6" y="6" width="52" height="52" rx="14" stroke={color} strokeWidth="3.5" fill="none" />
        {/* Double Sine Wave representing Sleep/HRV Cycles */}
        <path d="M12,32 C18,16 26,48 32,32 C38,16 46,48 52,32" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M12,38 C18,22 26,54 32,38 C38,22 46,54 52,38" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" fill="none" />
        {/* Horizontal Baseline */}
        <line x1="10" y1="32" x2="54" y2="32" stroke={color} strokeWidth="1" opacity="0.25" />
      </svg>
    ),
    designConcept: 'Dynamic 2D frequency curve modeling continuous circadian rhythms, sleep architectures, and high-energy performance output.',
    bestForTheme: 'Solar Cyberpunk'
  }
];

interface BrandLogoSelectorProps {
  activeLogoId: LogoOptionId;
  onSelectLogo: (logoId: LogoOptionId) => void;
  compact?: boolean;
}

export function BrandLogoSelector({ activeLogoId, onSelectLogo, compact = false }: BrandLogoSelectorProps) {
  const selectedLogo = LOGO_OPTIONS.find(l => l.id === activeLogoId) || LOGO_OPTIONS[0];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {LOGO_OPTIONS.map((logo) => {
          const IconComp = logo.svgIcon;
          const isSelected = activeLogoId === logo.id;
          return (
            <button
              key={logo.id}
              onClick={() => onSelectLogo(logo.id)}
              title={`${logo.name} - ${logo.subtitle}`}
              className={cn(
                "p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold",
                isSelected 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              )}
            >
              <IconComp className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">{logo.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> 2D Vector Brand Logo Options
          </h3>
          <p className="text-xs text-slate-500">
            Select your preferred 2D logo identity for JohnMatrix &amp; CuasarX Assistant branding
          </p>
        </div>
        <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Active: {selectedLogo.subtitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LOGO_OPTIONS.map((logo) => {
          const isSelected = activeLogoId === logo.id;
          const IconComp = logo.svgIcon;

          return (
            <div
              key={logo.id}
              onClick={() => onSelectLogo(logo.id)}
              className={cn(
                "p-6 rounded-3xl border text-left transition-all flex flex-col justify-between space-y-4 cursor-pointer group hover:shadow-md",
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-white shadow-sm"
                  : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* 2D Logo Container */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                    isSelected ? "bg-slate-900 text-amber-400" : "bg-white text-slate-800 border border-slate-200"
                  )}>
                    <IconComp className="w-9 h-9" />
                  </div>

                  {isSelected ? (
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Active Logo
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600">
                      Click to Select
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors mb-1">
                  {logo.name}
                </h4>
                <p className="text-xs font-semibold text-indigo-600 mb-2">{logo.subtitle}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{logo.designConcept}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Best paired with: <strong className="text-slate-800">{logo.bestForTheme}</strong></span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">2D Vector</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

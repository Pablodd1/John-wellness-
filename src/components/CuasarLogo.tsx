import React from 'react';
import { cn } from '../lib/utils';

interface CuasarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
}

export function CuasarLogo({ 
  className, 
  size = 'md', 
  showSubtitle = true,
  theme = 'dark' 
}: CuasarLogoProps) {
  const isLight = theme === 'light';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Keel & Celestial Axis Geometric Emblem — glass, no solid background */}
      <div className={cn(
        iconSizes[size],
        "rounded-lg flex items-center justify-center relative overflow-hidden transition-transform border",
        isLight
          ? "bg-white/[0.04] border-white/15 backdrop-blur-md"
          : "bg-white/[0.06] border-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
      )}>
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Outer Diamond Keel Orbit */}
          <path 
            d="M20 4L34 20L20 36L6 20L20 4Z" 
            stroke={isLight ? "#f4f2ec" : "#f5f3ec"} 
            strokeWidth="1.75" 
            strokeLinejoin="round"
            opacity="0.85"
          />
          {/* Vertical Precision Keel Axis */}
          <line 
            x1="20" 
            y1="8" 
            x2="20" 
            y2="32" 
            stroke={isLight ? "#f4f2ec" : "#f5f3ec"} 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Horizontal Longevity Horizon */}
          <line 
            x1="12" 
            y1="20" 
            x2="28" 
            y2="20" 
            stroke={isLight ? "#f59e0b" : "#d8c8b0"} 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          {/* Central Pulsar / Bio-Core Node */}
          <circle 
            cx="20" 
            cy="20" 
            r="3" 
            fill={isLight ? "#f4f2ec" : "#ffffff"} 
          />
          {/* Subtle 4-Point Focal Rays */}
          <circle 
            cx="20" 
            cy="11" 
            r="1" 
            fill={isLight ? "#f59e0b" : "#d8c8b0"} 
          />
          <circle 
            cx="20" 
            cy="29" 
            r="1" 
            fill={isLight ? "#f59e0b" : "#d8c8b0"} 
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={cn(
            "font-extrabold tracking-tight font-sans",
            textSizes[size],
            isLight ? "text-white" : "text-[#f4f2ec]"
          )}>
            CUASAR<span className="font-serif italic font-bold">X</span>
          </span>
        </div>
        
        {showSubtitle && (
          <span className={cn(
            "text-[9px] tracking-[0.16em] uppercase font-semibold mt-0.5",
            isLight ? "text-stone-300" : "text-stone-400"
          )}>
            LONGEVITY BY KEEL
          </span>
        )}
      </div>
    </div>
  );
}

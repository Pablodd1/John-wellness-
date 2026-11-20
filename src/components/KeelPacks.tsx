import React, { useEffect, useState } from 'react';
import { Sunrise, Sun, Moon, Plus, CheckCircle2, Luggage, Sparkles } from 'lucide-react';
import { Product, UserProfile } from '../types';
import { cn } from '../lib/utils';

/**
 * MY AM / MY MID / MY PM KEEL — travel-ready daily packs.
 *
 * The platform's smart assistant composes three sealed pouch tracks from the
 * member's own regimen (dose timing first, category as tiebreaker) — the same
 * Morning / Midday / Evening structure OK Capsule manufactures and ships.
 * In demo mode contents come from the local regimen; once OK Capsule
 * credentials are live, each item maps to a client_product_id and the pack
 * orders physically.
 */

type Slot = 'am' | 'mid' | 'pm';

const SLOTS: {
  key: Slot;
  label: string;
  short: string;
  icon: typeof Sunrise;
  tagline: string;
  timing: string;
}[] = [
  { key: 'am', label: 'MY AM KEEL', short: 'AM', icon: Sunrise, tagline: 'Wake · fasted · energy', timing: 'Morning' },
  { key: 'mid', label: 'MY MID KEEL', short: 'MID', icon: Sun, tagline: 'Midday · with meals', timing: 'Midday' },
  { key: 'pm', label: 'MY PM KEEL', short: 'PM', icon: Moon, tagline: 'Evening · recover · sleep', timing: 'Evening' },
];

// Which regimen timing strings route to which slot (checked against data.ts)
const TIMING_RULES: { slot: Slot; re: RegExp }[] = [
  { slot: 'pm', re: /bedtime|before sleep|evening|dinner|night|pm\b/i },
  { slot: 'mid', re: /mid-morning|midday|mid-day|with lunch|with meals|before meals|post-workout|any time/i },
  { slot: 'am', re: /morning|waking|breakfast|fasted|am\b|pre-executive/i },
];

// Category tiebreakers when a product has no parseable timing
const CATEGORY_DEFAULT: Partial<Record<Product['category'], Slot>> = {
  'Executive Stack': 'am',
  Nootropic: 'am',
  Nutrition: 'mid',
  Hydration: 'mid',
  Recovery: 'pm',
  'Hormonal Support': 'pm',
};

function slotFor(p: Product): Slot {
  const t = p.timing || '';
  for (const { slot, re } of TIMING_RULES) if (re.test(t)) return slot;
  return CATEGORY_DEFAULT[p.category] || 'mid';
}

// Honest cost model from OK Capsule's public pricing (Starter tier):
// $21 packaging per 30-day pack + $0.06–0.45 per pill.
function estimateCost(items: Product[]): number {
  const pills = items.reduce((n, p) => {
    const dose = p.dailyDosage || '';
    const m = dose.match(/(\d+)/);
    return n + (m ? Math.min(4, Number(m[1])) : 1);
  }, 0);
  const supplementCost = items.length * 0.18 + Math.max(0, pills - items.length) * 0.12;
  return 21 + supplementCost;
}

export function KeelPacks({ user, onAddToCart }: { user: UserProfile; onAddToCart: (products: Product[]) => void }) {
  const [mode, setMode] = useState<'live' | 'demo' | 'checking'>('checking');
  const [added, setAdded] = useState<Slot[]>([]);

  // Reset pack state when the member changes (persona switch / re-login)
  useEffect(() => { setAdded([]); }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/okcapsule?action=status')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setMode(d.configured ? 'live' : 'demo'); })
      .catch(() => { if (!cancelled) setMode('demo'); });
    return () => { cancelled = true; };
  }, []);

  const packs = SLOTS.map((s) => {
    const items = (user.inventory || []).filter((p) => slotFor(p) === s.key).slice(0, 8);
    return { ...s, items };
  });

  const monthly = packs.reduce((sum, p) => sum + estimateCost(p.items), 0);

  return (
    <section aria-labelledby="keel-packs-heading" className="space-y-3">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h2 id="keel-packs-heading" className="text-lg font-bold text-[#12211d] font-serif-title flex items-center gap-2">
            <Luggage className="w-4 h-4 text-orange-400" aria-hidden="true" />
            My AM · MID · PM KEEL Packs
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Your regimen, pressed into sealed travel pouches — one strip per part of the day.
            <span className="text-stone-300"> Built by your assistant from your blood panel, goals and dose schedule.</span>
          </p>
        </div>
        <span className={cn(
          'text-[10px] font-bold px-2 py-1 rounded-full border',
          mode === 'live' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'
            : 'bg-white text-stone-400 border-[#d7e5e1]'
        )}>
          {mode === 'live' ? 'OK Capsule · live' : mode === 'demo' ? 'Preview · fulfillment on onboarding' : 'Checking…'}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {packs.map((pack) => {
          const Icon = pack.icon;
          const isAdded = added.includes(pack.key);
          return (
            <div key={pack.key} className="soft-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-white border border-[#d7e5e1] grid place-items-center">
                    <Icon className="w-4 h-4 text-orange-300" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#12211d] tracking-wide">{pack.label}</h3>
                    <span className="text-[11px] text-stone-400">{pack.tagline}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-stone-500">{pack.items.length}/8</span>
              </div>

              {pack.items.length === 0 ? (
                <p className="text-[11px] text-stone-500 italic py-2">
                  Nothing scheduled for this window — your assistant will move items here as your plan grows.
                </p>
              ) : (
                <ul className="space-y-1.5" aria-label={`${pack.label} contents`}>
                  {pack.items.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                      <span className="text-stone-200 truncate">{p.name}</span>
                      <span className="text-stone-500 font-mono flex-shrink-0">{p.dailyDosage || '1'}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-stone-500">
                  30 sealed pouches · ${estimateCost(pack.items).toFixed(0)} est.
                </span>
                <button
                  onClick={() => { onAddToCart(pack.items); setAdded((a) => [...a, pack.key]); }}
                  disabled={pack.items.length === 0 || isAdded}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer',
                    isAdded
                      ? 'bg-white text-orange-300 border border-orange-500/25'
                      : 'bg-orange-600 opacity-85 hover:opacity-100 hover:bg-orange-500 text-white'
                  )}
                >
                  {isAdded ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Added</span>
                  ) : (
                    <span className="flex items-center gap-1"><Plus className="w-3 h-3" aria-hidden="true" /> Add pack</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        Full month of all three packs ≈ ${monthly.toFixed(0)} to make (packaging + capsules) — priced per your tier once fulfillment goes live.
        Peptides and prescription items stay on the telemedicine pathway; pouches carry the supplement layer of your plan.
      </p>
    </section>
  );
}

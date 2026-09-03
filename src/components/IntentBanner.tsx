import React, { useEffect, useState } from 'react';
import { classifyIntent, Intent } from '../lib/analytics';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const INTENT_COPY: Record<Intent, { label: string; classes: string }> = {
  browsing: { label: 'Exploring mode — curated picks are being tuned to your profile', classes: 'bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe]' },
  comparing: { label: 'Comparing mode — evidence grades and match reasons can help', classes: 'bg-[#f5f3ff] text-[#5b21b6] border-[#ddd6fe]' },
  buying: { label: 'Buyer mode — your cart is saved and checkouts are one step faster', classes: 'bg-[#f1f5f2] text-[#2b4530] border-[#dbe5dc]' },
};

/**
 * Thin intent banner under the header. Appears only when analytics consent is
 * granted (it is driven by the same consented event stream), fades after a few
 * seconds, and states plainly that it is rule-based on recent activity.
 */
export function IntentBanner() {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = classifyIntent();
      if (next && next !== intent) {
        setIntent(next);
        setVisible(true);
        window.setTimeout(() => setVisible(false), 5000);
      } else if (!next) {
        setVisible(false);
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [intent]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'overflow-hidden transition-all duration-500',
        visible && intent ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      {intent && (
        <div className={cn('px-4 py-1.5 text-[11px] font-semibold flex items-center gap-2 border-b', INTENT_COPY[intent].classes)}>
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{INTENT_COPY[intent].label}</span>
          <span className="ml-auto text-[9px] uppercase tracking-wider opacity-70">Rule-based · from your activity</span>
        </div>
      )}
    </div>
  );
}

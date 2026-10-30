import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UserRound, Watch, FileHeart, ClipboardCheck, PhoneCall } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * First-visit onboarding: runs once after a new user registers. Walks them
 * through identity confirmation, device connections and the health/HPI intake.
 * The only actions are "Next" and a red 911 emergency-call button — no AI chat
 * is offered inside the wizard.
 */

const STEPS = [
  {
    key: 'identity',
    title: 'Welcome — confirm your basics',
    icon: UserRound,
    body: 'Review your name, age and contact details. These tune every recommendation and stay private under your consent settings.',
  },
  {
    key: 'devices',
    title: 'Connect your devices',
    icon: Watch,
    body: 'Pair your wearables — Whoop, Oura ring, CGM, blood-pressure monitor or Apple Health — so readiness, sleep and heart data flow in automatically.',
  },
  {
    key: 'intake',
    title: 'Health history & HPI intake',
    icon: FileHeart,
    body: 'Fill the guided intake: medical history, medications, athletic profile, stress and diagnostics. You can use the form or voice intake and refine it any time.',
  },
  {
    key: 'review',
    title: 'Review & comment',
    icon: ClipboardCheck,
    body: 'Anything to flag before we set up your plan — conditions, injuries, preferences? Leave a note for your wellness review.',
  },
] as const;

export function FirstVisitOnboarding({
  userName,
  onFinish,
  onNavigate,
}: {
  userName: string;
  onFinish: () => void;
  onNavigate: (target: 'devices' | 'intake') => void;
}) {
  const [step, setStep] = useState(0);
  const [comment, setComment] = useState('');
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (current.key === 'devices') onNavigate('devices');
    if (current.key === 'intake') onNavigate('intake');
    if (isLast) { onFinish(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="bg-white/[0.06] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-white/10 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-300 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-base font-bold text-[#f4f2ec]">
                {current.title}
              </h2>
              <p className="text-[11px] text-stone-400">
                Step {step + 1} of {STEPS.length} · {userName}
              </p>
            </div>
          </div>
          <button
            onClick={onFinish}
            aria-label="Skip onboarding"
            className="p-1 text-stone-500 hover:text-[#f4f2ec] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">{current.body}</p>

        {current.key === 'review' && (
          <div>
            <label htmlFor="onboarding-comment" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">
              Your comment (optional)
            </label>
            <textarea
              id="onboarding-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="e.g. knee injury from 2023, prefer plant-based options…"
              className="w-full px-3 py-2 rounded-lg text-xs bg-[#101210] border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/[0.06] text-[#f4f2ec]"
            />
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-6 bg-orange-500' : i < step ? 'w-1.5 bg-orange-500/50' : 'w-1.5 bg-white/15'
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Emergency only — the single non-Next action in this wizard */}
          <a
            href="tel:911"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors"
            title="Emergency — call 911"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            911
          </a>

          <button
            onClick={next}
            className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs btn-ink flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            {isLast ? 'Finish setup' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

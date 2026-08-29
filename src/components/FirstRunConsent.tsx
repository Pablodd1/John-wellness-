import React, { useState } from 'react';
import { PRIVACY_POLICY_VERSION, useConsent, CONSENT_PURPOSES } from '../lib/consent';
import { Check, ShieldCheck, ScrollText, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * First-launch consent gate: nothing in the app runs until the user has
 * acknowledged the privacy notice and terms of engagement with an electronic
 * signature, and made an explicit choice about the optional purposes.
 * Renders nothing once the policy version has been acknowledged.
 */
export function FirstRunConsent() {
  const { state, needsPolicyReview, acknowledgePolicy, grant } = useConsent();

  const [privacyAck, setPrivacyAck] = useState(false);
  const [termsAck, setTermsAck] = useState(false);
  const [signature, setSignature] = useState('');
  const [aiChoice, setAiChoice] = useState<boolean | null>(null);
  const [marketingChoice, setMarketingChoice] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!needsPolicyReview && state.policyAcknowledgedVersion) return null;

  const aiInfo = CONSENT_PURPOSES.find(p => p.id === 'ai_processing')!;
  const marketingInfo = CONSENT_PURPOSES.find(p => p.id === 'marketing')!;

  const canSubmit = privacyAck && termsAck && signature.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAck || !termsAck) {
      setError('Both acknowledgments are required to use the app.');
      return;
    }
    if (signature.trim().length < 2) {
      setError('Type your full name to sign electronically.');
      return;
    }
    acknowledgePolicy(signature.trim());
    if (aiChoice) grant('ai_processing');
    if (marketingChoice) grant('marketing');
  };

  const optionalToggle = (label: string, info: typeof aiInfo, value: boolean | null, setter: (v: boolean) => void) => (
    <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#ebe7df] bg-[#faf9f6]">
      <div className="min-w-0">
        <span className="text-xs font-bold text-[#181716] block">{label} <span className="font-normal text-[#6e6960]">— optional</span></span>
        <span className="text-[11px] text-[#5c5851] block mt-0.5 leading-relaxed">{info.summary}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0" role="group" aria-label={`${label} choose yes or no`}>
        <button
          type="button"
          aria-pressed={value === true}
          aria-label={`${label}: yes`}
          onClick={() => setter(true)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]',
            value === true ? 'bg-[#344a37] text-white border-[#344a37]' : 'bg-white text-[#5c5851] border-[#dedad0] hover:bg-[#f6f4ee]'
          )}
        >
          Yes
        </button>
        <button
          type="button"
          aria-pressed={value === false}
          aria-label={`${label}: no`}
          onClick={() => setter(false)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]',
            value === false ? 'bg-[#181716] text-white border-[#181716]' : 'bg-white text-[#5c5851] border-[#dedad0] hover:bg-[#f6f4ee]'
          )}
        >
          No
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1210]/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="firstrun-title"
          className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f1f5f2] rounded-xl border border-[#dbe5dc]">
              <ShieldCheck className="w-6 h-6 text-[#344a37]" aria-hidden="true" />
            </div>
            <div>
              <h1 id="firstrun-title" className="text-lg font-bold text-[#181716]">Your data, your rules</h1>
              <span className="text-[11px] text-[#6e6960] font-mono">Privacy notice &amp; terms of engagement • v{PRIVACY_POLICY_VERSION}</span>
            </div>
          </div>

          <p className="text-xs text-[#5c5851] leading-relaxed">
            This app handles health information, so before you use it you need to know — and choose — what happens with
            your data. The short version:
          </p>

          <ul className="text-xs text-[#181716] space-y-2" aria-label="Summary of our data practices">
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>Everything is off by default.</strong> Each data use (AI analysis, wearable sync, research, community sharing, marketing) is a separate choice you control in the Privacy &amp; Consent center.</span>
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>You can withdraw any consent at any time,</strong> and video visits ask for their own informed consent before you join.</span>
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>Every consent action is written to an audit log</strong> you can view, and you can export or request deletion of your data at any time.</span>
            </li>
            <li className="flex gap-2.5">
              <Check className="w-4 h-4 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>This demo stores everything locally in your browser</strong> — nothing is sent to a server.</span>
            </li>
          </ul>

          <div className="space-y-2">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#ebe7df] cursor-pointer hover:bg-[#faf9f6]">
              <input type="checkbox" checked={privacyAck} onChange={(e) => setPrivacyAck(e.target.checked)} className="accent-[#344a37] w-4 h-4 mt-0.5" />
              <span className="text-xs text-[#181716]">I have read and understand the <strong>Privacy Notice</strong>, including what data the app collects and my rights to access, export, correct, and delete it.</span>
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#ebe7df] cursor-pointer hover:bg-[#faf9f6]">
              <input type="checkbox" checked={termsAck} onChange={(e) => setTermsAck(e.target.checked)} className="accent-[#344a37] w-4 h-4 mt-0.5" />
              <span className="text-xs text-[#181716]">I accept the <strong>Terms of Engagement</strong>: wellness support, not medical care; not for emergencies (call 911); clinicians may communicate through the app.</span>
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#181716] block">Choose now or later — both are fine:</span>
            {optionalToggle('AI Clinical Analysis', aiInfo, aiChoice, setAiChoice)}
            {optionalToggle('Product & Marketing Communications', marketingInfo, marketingChoice, setMarketingChoice)}
          </div>

          <div>
            <label htmlFor="firstrun-signature" className="block font-bold text-xs text-[#181716] mb-1">
              Electronic signature <span className="text-[#8c3232]">*</span>
            </label>
            <input
              id="firstrun-signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
            />
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-[#8c3232] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-ink w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
          >
            <ScrollText className="w-4 h-4" aria-hidden="true" />
            Acknowledge &amp; continue
          </button>

          <p className="text-[10px] text-[#6e6960] text-center">
            Skipping the optional choices keeps them off. You can change everything later in Privacy &amp; Consent.
          </p>
        </form>
      </div>
    </div>
  );
}

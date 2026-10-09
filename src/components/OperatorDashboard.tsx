import React from 'react';
import { UserProfile } from '../types';
import { SYNTHETIC_USERS } from '../data';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  Shield, 
  AlertOctagon, 
  CheckCircle2, 
  FileText, 
  Database, 
  Activity, 
  Lock, 
  Server, 
  ExternalLink,
  Key,
  Globe,
  Radio,
  Cpu,
  Layers
} from 'lucide-react';

export function OperatorDashboard({ activeUser }: { activeUser: UserProfile }) {
  const isAiConfigured = Boolean(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY);
  const isStripeConfigured = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#181716]" />
            <h2 className="text-xl font-bold text-[#181716]">Operator Governance &amp; Infrastructure Telemetry</h2>
          </div>
          <p className="text-[#6e6960] text-xs">
            Monitor clinical safety rules, database telemetry, API integrations, and synthetic cohort health.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#f4f7f4] text-[#2b4530] rounded-full border border-[#d2e3d5]">
          <CheckCircle2 className="w-4 h-4 text-[#344a37]" />
          <span>System Active &amp; Operational</span>
        </div>
      </div>

      {/* Production Infrastructure & Integrations Status */}
      <div className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#181716] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#785328]" /> Infrastructure &amp; API Integration Telemetry
          </h3>
          <span className="text-[11px] text-[#6e6960] font-medium">Vercel Edge Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Supabase Card */}
          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#785328]" /> Database (Supabase)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSupabaseConfigured ? 'bg-[#e2f0e4] text-[#2b4530]' : 'bg-[#f4f2ec] text-[#785328]'}`}>
                {isSupabaseConfigured ? 'LIVE CONNECTED' : 'MOCK / DEMO MODE'}
              </span>
            </div>
            <p className="text-[11px] text-[#6e6960]">
              {isSupabaseConfigured ? 'PostgreSQL database connected with RLS.' : 'Running with local state fallback. Add VITE_SUPABASE_URL to connect.'}
            </p>
            <div className="pt-2 border-t border-[#ebe7df] flex items-center justify-between text-[10px] font-mono text-[#8a857b]">
              <span>SQL Schema: ready</span>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#181716] font-semibold underline flex items-center gap-0.5">
                Setup <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* AI Clinical Model Card */}
          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#344a37]" /> Wellness Assistant AI
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isAiConfigured ? 'bg-[#e2f0e4] text-[#2b4530]' : 'bg-[#f4f2ec] text-[#785328]'}`}>
                {isAiConfigured ? 'LIVE API KEY' : 'SIMULATED AI'}
              </span>
            </div>
            <p className="text-[11px] text-[#6e6960]">
              {isAiConfigured ? 'Direct LLM connection active for HPI analysis.' : 'Built-in clinical reasoning simulation active for voice HPI.'}
            </p>
            <div className="pt-2 border-t border-[#ebe7df] flex items-center justify-between text-[10px] font-mono text-[#8a857b]">
              <span>Key: GEMINI_API_KEY</span>
              <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[#181716] font-semibold underline flex items-center gap-0.5">
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Wearables Card */}
          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#344a37]" /> Wearable Telemetry
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f4f2ec] text-[#785328]">
                TERRA / VITAL READY
              </span>
            </div>
            <p className="text-[11px] text-[#6e6960]">
              Hooks ready for Whoop, Oura, Garmin &amp; Dexcom CGM streams.
            </p>
            <div className="pt-2 border-t border-[#ebe7df] flex items-center justify-between text-[10px] font-mono text-[#8a857b]">
              <span>Env: TERRA_DEV_ID</span>
              <a href="https://tryterra.co" target="_blank" rel="noreferrer" className="text-[#181716] font-semibold underline flex items-center gap-0.5">
                Terra API <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Stripe Card */}
          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#181716]" /> Refill Checkout &amp; Subscriptions
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isStripeConfigured ? 'bg-[#e2f0e4] text-[#2b4530]' : 'bg-[#f4f2ec] text-[#785328]'}`}>
                {isStripeConfigured ? 'STRIPE LIVE' : '1-CLICK DEMO'}
              </span>
            </div>
            <p className="text-[11px] text-[#6e6960]">
              {isStripeConfigured ? 'Stripe payment gateway active.' : 'Simulated 1-click checkout & coupon engine enabled.'}
            </p>
            <div className="pt-2 border-t border-[#ebe7df] flex items-center justify-between text-[10px] font-mono text-[#8a857b]">
              <span>Env: VITE_STRIPE_KEY</span>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="text-[#181716] font-semibold underline flex items-center gap-0.5">
                Stripe <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Profiles Health Monitor */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#181716]">Synthetic User Cohort Data Integrity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYNTHETIC_USERS.map((user) => (
            <div key={user.id} className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-[#f4f2ec] object-cover" />
                <div>
                  <h4 className="font-bold text-[#181716] text-xs">{user.name}</h4>
                  <p className="text-[11px] text-[#6e6960]">{user.role}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#5c5851]">
                  <span>Data Completeness:</span>
                  <span className="font-bold text-[#181716]">{user.dataCompleteness}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#f4f2ec] rounded-full overflow-hidden">
                  <div className="h-full bg-[#181716] rounded-full" style={{ width: `${user.dataCompleteness}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-[#f4f2ec] flex items-center justify-between text-[11px] text-[#5c5851]">
                <span>Readiness Status:</span>
                <span className="font-bold text-[#181716] uppercase">{user.readiness.status} ({user.readiness.score})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Escalation Queue & Safety Block Log */}
      <div className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-[#8c3232]" /> Clinical Escalation Queue &amp; Safety Audit Log
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-[#fdf2f2] rounded-xl border border-[#f5d5d5] text-xs text-[#8c3232] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#8c3232]" /> Safety Block Triggered: BPC-157 Direct Dosing Request</span>
              <span className="text-[#8c3232]">14:22:05 Today</span>
            </div>
            <p className="text-[#5c5851]">User Alex Rivera inquired about oral BPC-157 dosing schedule. Phi enforced Safety Rule #6: Individualized peptide instructions blocked. Clinical review ticket generated.</p>
          </div>

          <div className="p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df] text-xs text-[#181716] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#344a37]" /> Automated Periodization Adjustment</span>
              <span className="text-[#8a857b]">07:00:00 Today</span>
            </div>
            <p className="text-[#5c5851]">Phi adjusted David Kim's workout from Heavy Resistance to Mobility &amp; Parasympathetic Reset due to sleep deficit (&lt;4.5h) and travel stress.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

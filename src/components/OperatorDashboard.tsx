import React from 'react';
import { UserProfile } from '../types';
import { SYNTHETIC_USERS } from '../data';
import { Shield, AlertOctagon, CheckCircle2, FileText, Database, Activity, Lock } from 'lucide-react';

export function OperatorDashboard({ activeUser }: { activeUser: UserProfile }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Operator Governance & Safety Audit Dashboard</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Monitor clinical safety blocks, AI recommendation trails, and dataset quality across synthetic profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Safety Framework Active
        </div>
      </div>

      {/* Synthetic Profiles Health Monitor */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Synthetic User Cohort Data Integrity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYNTHETIC_USERS.map((user) => (
            <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Data Completeness:</span>
                  <span className="font-bold text-slate-900">{user.dataCompleteness}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${user.dataCompleteness}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Readiness Status:</span>
                <span className="font-bold text-slate-800 uppercase">{user.readiness.status} ({user.readiness.score})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Escalation Queue & Safety Block Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-500" /> Clinical Escalation Queue & Safety Audit Log
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-rose-600" /> Safety Block Triggered: BPC-157 Direct Dosing Request</span>
              <span className="text-rose-600">14:22:05 Today</span>
            </div>
            <p className="text-slate-700">User Alex Rivera inquired about oral BPC-157 dosing schedule. Phi enforced Safety Rule #6: Individualized peptide instructions blocked. Clinical review ticket generated.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated Periodization Adjustment</span>
              <span className="text-slate-400">07:00:00 Today</span>
            </div>
            <p className="text-slate-600">Phi adjusted David Kim's workout from Heavy Resistance to Mobility & Parasympathetic Reset due to sleep deficit (&lt;4.5h) and travel stress.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

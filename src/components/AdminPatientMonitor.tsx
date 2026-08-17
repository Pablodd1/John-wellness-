import React, { useState } from 'react';
import { SYNTHETIC_USERS } from '../data';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  Activity, 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  FileText, 
  Send, 
  Pill, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Stethoscope, 
  Bell, 
  Maximize2,
  Calendar,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminPatientMonitor({ currentUser }: { currentUser: UserProfile }) {
  const [patients, setPatients] = useState<UserProfile[]>(SYNTHETIC_USERS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(SYNTHETIC_USERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'flagged' | 'optimal'>('all');
  const [clinicalNoteInput, setClinicalNoteInput] = useState('');
  const [sentNoteSuccess, setSentNoteSuccess] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Filter patients list
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterRisk === 'flagged') return p.flags && p.flags.length > 0;
    if (filterRisk === 'optimal') return p.readiness.status === 'optimal';
    return true;
  });

  const handleSendClinicalDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNoteInput.trim()) return;

    // Simulate appending a clinical directive flag
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          flags: [
            ...p.flags,
            `Clinician Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): ${clinicalNoteInput}`
          ]
        };
      }
      return p;
    }));

    setClinicalNoteInput('');
    setSentNoteSuccess(true);
    setTimeout(() => setSentNoteSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ADM Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-rose-400" /> Clinical Command Center
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Live Patient Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              ADM Executive Patient Monitoring Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Comprehensive clinical dashboard for managing longitudinal patient panels, triaging biometric risk flags, reviewing EKG/blood panels, and issuing direct care directives.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs font-bold self-start sm:self-auto">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Monitored Panel: <strong className="text-white">{patients.length} Active Patients</strong></span>
          </div>
        </div>

        {/* Quick Triage Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Action Needed / Flags</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">
              {patients.filter(p => p.flags.length > 0).length} Patients
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Optimal Recovery</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">
              {patients.filter(p => p.readiness.status === 'optimal').length} Patients
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Mean Panel HRV</span>
            <span className="text-lg font-black text-indigo-300 mt-0.5 block">
              {Math.round(patients.reduce((acc, p) => acc + p.metrics.hrv.current, 0) / patients.length)} ms
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Data Completeness</span>
            <span className="text-lg font-black text-cyan-300 mt-0.5 block">
              {Math.round(patients.reduce((acc, p) => acc + p.dataCompleteness, 0) / patients.length)}% Avg
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Search and Triage Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search patient name, role, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterRisk('all')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap",
              filterRisk === 'all' ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilterRisk('flagged')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5",
              filterRisk === 'flagged' ? "bg-rose-600 text-white shadow-sm" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Flagged / Clinical Alerts ({patients.filter(p => p.flags.length > 0).length})
          </button>
          <button
            onClick={() => setFilterRisk('optimal')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5",
              filterRisk === 'optimal' ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Recovery ({patients.filter(p => p.readiness.status === 'optimal').length})
          </button>
        </div>
      </div>

      {/* Main Grid: Patient List Cards + Active Patient Clinical Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Patient Panel Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider block px-1">
            Patient Roster ({filteredPatients.length})
          </span>

          <div className="space-y-3">
            {filteredPatients.map(patient => {
              const isSelected = patient.id === selectedPatient.id;
              const hasFlags = patient.flags && patient.flags.length > 0;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    "p-4 rounded-3xl border transition-all cursor-pointer space-y-3",
                    isSelected 
                      ? "bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-emerald-500" 
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={patient.avatar} 
                        alt={patient.name} 
                        className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 p-0.5 object-cover"
                      />
                      <div>
                        <h4 className={cn("font-extrabold text-sm", isSelected ? "text-white" : "text-slate-900")}>
                          {patient.name}
                        </h4>
                        <p className={cn("text-[11px]", isSelected ? "text-slate-300" : "text-slate-500")}>
                          {patient.age}y {patient.gender} • {patient.lifestylePersona}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase inline-block",
                        patient.readiness.status === 'optimal' ? "bg-emerald-500/20 text-emerald-400" :
                        patient.readiness.status === 'warning' ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"
                      )}>
                        Readiness {patient.readiness.score}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Row */}
                  <div className={cn(
                    "grid grid-cols-3 gap-2 p-2.5 rounded-2xl text-[11px] font-bold text-center",
                    isSelected ? "bg-slate-800/80 text-slate-200" : "bg-slate-50 text-slate-700"
                  )}>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-normal">HRV</span>
                      <span className="text-emerald-400 font-extrabold">{patient.metrics.hrv.current} ms</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-normal">RHR</span>
                      <span className="text-indigo-300 font-extrabold">{patient.metrics.rhr.current} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-normal">Sleep</span>
                      <span className="text-cyan-300 font-extrabold">{patient.metrics.sleep.current} hrs</span>
                    </div>
                  </div>

                  {/* Clinical Alert Flags */}
                  {hasFlags && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                      <span className="truncate">{patient.flags[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Patient Detailed Clinical Chart & Directive Tool */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Selected Patient Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedPatient.avatar} 
                  alt={selectedPatient.name} 
                  className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-emerald-500 p-0.5 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded border border-emerald-200">
                      ID: {selectedPatient.id.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded">
                      {selectedPatient.lifestylePersona}
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500">{selectedPatient.role} • {selectedPatient.age} yrs • {selectedPatient.gender}</p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</span>
                <span className="text-2xl font-black text-emerald-600">{selectedPatient.readiness.score} / 100</span>
                <span className="text-[10px] text-slate-500 font-semibold">{selectedPatient.readiness.message}</span>
              </div>
            </div>

            {/* Biometric Telemetry Matrix */}
            <div>
              <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-3">Live Telemetry &amp; Baseline Diagnostics</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">HRV (24h)</span>
                  <span className="text-lg font-black text-slate-900">{selectedPatient.metrics.hrv.current} ms</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Target: &gt;60 ms</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">Resting Heart Rate</span>
                  <span className="text-lg font-black text-slate-900">{selectedPatient.metrics.rhr.current} bpm</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Athletic Norm</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">Blood Pressure</span>
                  <span className="text-lg font-black text-slate-900">118 / 76</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Normotensive</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">Fasting Glucose</span>
                  <span className="text-lg font-black text-slate-900">92 mg/dL</span>
                  <span className="text-[10px] text-cyan-600 font-bold block">CGM In Range</span>
                </div>
              </div>
            </div>

            {/* Active Risk Flags & Clinical Directives List */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Active Clinical Flags &amp; Triage Items</h4>
              
              {selectedPatient.flags.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No elevated clinical risks or flags. Patient is in optimal recovery range.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.flags.map((flag, idx) => (
                    <div key={idx} className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clinician Action Directive Form */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-400" /> Issue Clinician Note / AI Directive
                </span>
                <span className="text-[10px] text-slate-400">Directly syncs to Patient Phi Chat Inbox</span>
              </div>

              <form onSubmit={handleSendClinicalDirective} className="space-y-3">
                <textarea
                  rows={3}
                  value={clinicalNoteInput}
                  onChange={(e) => setClinicalNoteInput(e.target.value)}
                  placeholder={`Write a direct medical note or training modification for ${selectedPatient.name}... (e.g. 'Reduce Zone 5 sprints today by 30%, increase Magnesium Glycinate to 400mg before bedtime')`}
                  className="w-full p-3 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex items-center justify-between">
                  {sentNoteSuccess ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Directive dispatched to {selectedPatient.name}!
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Dispatched via Encrypted Telemetry Pipe</span>
                  )}

                  <button
                    type="submit"
                    disabled={!clinicalNoteInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Directive
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

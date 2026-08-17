import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { IntakeOnboarding } from './IntakeOnboarding';
import { IntegrationCenter } from './IntegrationCenter';
import { OrganSystemModeling } from './OrganSystemModeling';
import { 
  User, 
  Sparkles, 
  Database, 
  Activity, 
  ShieldCheck, 
  Heart, 
  Dna, 
  Award, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Brain,
  Zap,
  Gauge,
  Layers,
  Download,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';

interface UserProfileTabProps {
  user: UserProfile;
  onUpdateUser: (updatedFields: Partial<UserProfile>) => void;
  onNavigateToMarketplace?: () => void;
}

type ProfileSubTab = 'aosm' | 'intake' | 'integrations' | 'diagnostic_summary';

export function UserProfileTab({ user, onUpdateUser, onNavigateToMarketplace }: UserProfileTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('aosm');

  return (
    <div className="space-y-6">
      {/* Executive User Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-emerald-500/50 p-1 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Verified Bio-Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  {user.lifestylePersona}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                {user.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {user.role} • {user.age} yrs • {user.gender}
              </p>
            </div>
          </div>

          {/* Data Completeness Gauge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 min-w-[220px]"
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" /> Intake Completeness
              </span>
              <span className="text-emerald-400 font-extrabold">{user.dataCompleteness}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${user.dataCompleteness}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {user.dataCompleteness >= 90 ? 'Full clinical baseline active' : 'Complete missing DEXA / blood panel facts'}
            </p>
          </motion.div>
        </div>

        {/* Quick Vitals Summary Row with Staggered Entrance Animations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          {[
            { label: 'Readiness Score', value: `${user.readiness.score} / 100`, color: 'text-emerald-400' },
            { label: 'HRV Baseline', value: `${user.metrics.hrv.current} ms`, color: 'text-indigo-300' },
            { label: 'Resting Heart Rate', value: `${user.metrics.rhr.current} bpm`, color: 'text-cyan-300' },
            { label: 'Active Flags', value: `${user.flags.length} items`, color: 'text-amber-300' },
          ].map((vital, idx) => (
            <motion.div 
              key={vital.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + idx * 0.06 }}
              className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{vital.label}</span>
              <span className={cn("text-lg font-black mt-0.5 block", vital.color)}>{vital.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Primary Sub-Tab Selector Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveSubTab('aosm')}
          className={cn(
            "flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2",
            activeSubTab === 'aosm'
              ? "bg-[#0f172a] text-white shadow-md ring-2 ring-emerald-500/30"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <Dna className="w-4 h-4 text-emerald-400" />
          <span>AOSM 9-Organ Modeling &amp; 90-Day Roadmap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('intake')}
          className={cn(
            "flex-1 min-w-[180px] px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2",
            activeSubTab === 'intake'
              ? "bg-emerald-700 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Health &amp; Intake Harvester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={cn(
            "flex-1 min-w-[180px] px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2",
            activeSubTab === 'integrations'
              ? "bg-emerald-700 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <Database className="w-4 h-4 text-cyan-300" />
          <span>Integrations &amp; Wearables</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostic_summary')}
          className={cn(
            "flex-1 min-w-[180px] px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2",
            activeSubTab === 'diagnostic_summary'
              ? "bg-emerald-700 text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <FileText className="w-4 h-4 text-indigo-300" />
          <span>Clinical Baseline Facts</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* SUB-TAB 0: AOSM 9-ORGAN SYSTEM MODELING & 90-DAY LONGEVITY ROADMAP */}
        {activeSubTab === 'aosm' && (
          <motion.div
            key="subtab-aosm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <OrganSystemModeling 
              user={user} 
              onNavigateToMarketplace={onNavigateToMarketplace}
            />
          </motion.div>
        )}

        {/* SUB-TAB 1: COMPREHENSIVE INTAKE ONBOARDING */}
        {activeSubTab === 'intake' && (
          <motion.div
            key="subtab-intake"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-slate-900">Multimodal Intake &amp; Bio-Data Harvester</span>
                <p className="text-slate-600 mt-0.5">
                  Fill out or refine your comprehensive athletic, cardiovascular, metabolic, and psychological diagnostic facts below. You can use voice intake, text, or file uploads to populate missing fields automatically.
                </p>
              </div>
            </div>
            <IntakeOnboarding user={user} onComplete={onUpdateUser} />
          </motion.div>
        )}

        {/* SUB-TAB 2: INTEGRATION CENTER */}
        {activeSubTab === 'integrations' && (
          <motion.div
            key="subtab-integrations"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="bg-indigo-900/10 border border-indigo-500/30 p-4 rounded-2xl text-xs text-indigo-950 flex items-start gap-3">
              <Database className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-slate-900">Real-Time Bio-Telemetry &amp; Device Pairing</span>
                <p className="text-slate-600 mt-0.5">
                  Manage your WHOOP, Oura Ring, Dexcom CGM, Omron Blood Pressure, and Apple Health live data feeds.
                </p>
              </div>
            </div>
            <IntegrationCenter user={user} />
          </motion.div>
        )}

        {/* SUB-TAB 3: CLINICAL & MEDICAL DIAGNOSTIC SUMMARY */}
        {activeSubTab === 'diagnostic_summary' && (
          <motion.div
            key="subtab-diagnostic"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* DEXA & Blood Panel Summary Cards with staggered slide-up metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DEXA Body Comp */}
              <motion.div 
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">DEXA Body Composition Baseline</h3>
                      <p className="text-[11px] text-slate-500">Scan date: July 2026</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-lg border border-emerald-200">
                    Verified Scan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Body Fat %', value: `${user.baselineDiagnostics?.dexa?.bodyFatPercent || 12.4}%`, sub: 'Athletic Target', subColor: 'text-emerald-600' },
                    { label: 'Lean Mass', value: `${user.baselineDiagnostics?.dexa?.leanMassKg || 71.5} kg`, sub: '78.2 kg total mass', subColor: 'text-slate-500' },
                    { label: 'Visceral Fat', value: `${user.baselineDiagnostics?.dexa?.visceralFatGrams || 310} g`, sub: 'Low Inflammatory Risk', subColor: 'text-emerald-600' },
                    { label: 'Bone Density (Z-Score)', value: `+${user.baselineDiagnostics?.dexa?.boneDensityZScore || 1.8}`, sub: 'Above Average', subColor: 'text-emerald-600' },
                  ].map((m, mIdx) => (
                    <motion.div 
                      key={m.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + mIdx * 0.05 }}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-100"
                    >
                      <span className="text-slate-500 text-[10px] font-bold block">{m.label}</span>
                      <span className="text-lg font-black text-slate-900">{m.value}</span>
                      <span className={cn("text-[10px] font-bold block mt-0.5", m.subColor)}>{m.sub}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Bloodwork Biomarkers */}
              <motion.div 
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Bloodwork &amp; Metabolic Panel</h3>
                      <p className="text-[11px] text-slate-500">Quest Diagnostics (18 Biomarkers)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-200">
                    Q2 Panel
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'ApoB (Cardiovascular)', value: `${user.baselineDiagnostics?.bloodwork?.apoB || 62} mg/dL`, sub: 'Optimal (<70)', subColor: 'text-emerald-600' },
                    { label: 'hs-CRP (Inflammation)', value: `${user.baselineDiagnostics?.bloodwork?.hsCRP || 0.4} mg/L`, sub: 'Low Systemic Strain', subColor: 'text-emerald-600' },
                    { label: 'Fasting Glucose / HbA1c', value: `${user.baselineDiagnostics?.bloodwork?.fastingGlucose || 92} / ${user.baselineDiagnostics?.bloodwork?.hba1c || 5.1}%`, sub: 'Normal Insulin Control', subColor: 'text-cyan-600' },
                    { label: 'Free Testosterone', value: `${user.baselineDiagnostics?.bloodwork?.testosteroneFree || 22.4} pg/mL`, sub: 'Upper Quintile', subColor: 'text-emerald-600' },
                  ].map((m, mIdx) => (
                    <motion.div 
                      key={m.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 + mIdx * 0.05 }}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-100"
                    >
                      <span className="text-slate-500 text-[10px] font-bold block">{m.label}</span>
                      <span className="text-lg font-black text-slate-900">{m.value}</span>
                      <span className={cn("text-[10px] font-bold block mt-0.5", m.subColor)}>{m.sub}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Medical History & Active Medications */}
            <motion.div 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Dna className="w-4 h-4 text-emerald-700" />
                Medical History &amp; Active Biohacking Regimen
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <span className="font-extrabold text-slate-800 block mb-2">Medications &amp; Peptides</span>
                  <ul className="space-y-1.5 text-slate-600">
                    {(user.baselineDiagnostics?.medicalHistory?.medicationsPeptides || ['Telmisartan 20mg qAM', 'BPC-157 250mcg (Left Knee)', 'Magnesium Glycinate 400mg']).map((m, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <span className="font-extrabold text-slate-800 block mb-2">Sports &amp; Endurance Focus</span>
                  <p className="text-slate-600 leading-relaxed mb-2">
                    <strong>Discipline:</strong> {user.baselineDiagnostics?.sportsProfile?.primaryDiscipline || 'Road Cycling & Triathlon'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>Weekly Zone 2:</strong> {user.baselineDiagnostics?.sportsProfile?.zone2WeeklyHours || 6.5} hours
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 }}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <span className="font-extrabold text-slate-800 block mb-2">Psychological &amp; Stress Metrics</span>
                  <div className="space-y-1.5 text-slate-600">
                    <p><strong>Stress Score:</strong> {user.baselineDiagnostics?.psychologicalProfile?.perceivedStressScore || 4}/10</p>
                    <p><strong>Burnout Risk:</strong> <span className="text-emerald-700 font-bold">{user.baselineDiagnostics?.psychologicalProfile?.burnoutIndex || 'Low'}</span></p>
                    <p><strong>Cognitive Fatigue:</strong> {user.baselineDiagnostics?.psychologicalProfile?.cognitiveFatigueScore || 3}/10</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

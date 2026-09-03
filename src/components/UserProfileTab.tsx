import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Product } from '../types';
import { IntakeOnboarding } from './IntakeOnboarding';
import { IntegrationCenter } from './IntegrationCenter';
import { OrganSystemModeling } from './OrganSystemModeling';
import { OrdersAndGoals } from './OrdersAndGoals';
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
  onAddToCart?: (products: Product[]) => void;
  onNavigateToMarketplace?: () => void;
}

type ProfileSubTab = 'aosm' | 'intake' | 'integrations' | 'diagnostic_summary';

export function UserProfileTab({ user, onUpdateUser, onAddToCart, onNavigateToMarketplace }: UserProfileTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('aosm');

  return (
    <div className="space-y-6">
      {/* Executive User Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white text-[#181716] p-6 sm:p-7 rounded-2xl border border-[#ebe7df] space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#faf9f6] border border-[#ebe7df] p-1 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#181716] text-white flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-clinical">
                  Verified Member
                </span>
                <span className="badge-neutral">
                  {user.lifestylePersona}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#181716] flex items-center gap-2 font-serif-title">
                {user.name}
              </h2>
              <p className="text-xs text-[#6e6960] mt-0.5">
                {user.role} • {user.age} yrs • {user.gender}
              </p>
            </div>
          </div>

          {/* Data Completeness Gauge */}
          <div className="bg-[#faf9f6] p-3.5 rounded-xl border border-[#ebe7df] min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-[#5c5851] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#344a37]" /> Intake Completeness
              </span>
              <span className="text-[#181716] font-bold">{user.dataCompleteness}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#ebe7df] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#181716] rounded-full transition-all duration-500"
                style={{ width: `${user.dataCompleteness}%` }}
              />
            </div>
            <p className="text-[10px] text-[#8a857b] mt-1.5">
              {user.dataCompleteness >= 90 ? 'Full baseline active' : 'Complete missing DEXA & panels'}
            </p>
          </div>
        </div>

        {/* Quick Vitals Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#f4f2ec] text-xs">
          {[
            { label: 'Readiness Score', value: `${user.readiness.score} / 100`, badge: 'Optimal' },
            { label: 'HRV Baseline', value: `${user.metrics.hrv.current} ms`, badge: 'Resting' },
            { label: 'Resting Heart Rate', value: `${user.metrics.rhr.current} bpm`, badge: 'Circadian' },
            { label: 'Active Flags', value: `${user.flags.length} items`, badge: 'Monitored' },
          ].map((vital) => (
            <div 
              key={vital.label}
              className="bg-[#faf9f6] p-3 rounded-xl border border-[#ebe7df]"
            >
              <span className="text-[#8a857b] text-[10px] uppercase font-semibold block">{vital.label}</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-base font-bold text-[#181716]">{vital.value}</span>
                <span className="text-[10px] text-[#5c5851] bg-white px-1.5 py-0.2 rounded border border-[#ebe7df]">{vital.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Orders, reorder & goals — real data from the signed-in account */}
      <OrdersAndGoals user={user} onUpdateUser={onUpdateUser} onAddToCart={onAddToCart ?? (() => {})} />

      {/* Primary Sub-Tab Selector Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
        <button
          onClick={() => setActiveSubTab('aosm')}
          className={cn(
            "flex-1 min-w-[180px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === 'aosm'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <Dna className="w-3.5 h-3.5" />
          <span>AOSM 9-Organ Longevity &amp; 90-Day Roadmap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('intake')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === 'intake'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Health Intake Harvester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === 'integrations'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Integrations &amp; Wearables</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostic_summary')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeSubTab === 'diagnostic_summary'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Diagnostic Action Plan</span>
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

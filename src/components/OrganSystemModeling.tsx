import React, { useState } from 'react';
import { UserProfile, OrganSystemHealth, LongevityRoadmapPhase, ExecutiveHealthspanReport } from '../types';
import { calculateOrganSystems, generateLongevityRoadmap, generateExecutiveReport } from '../utils/organModeling';
import { 
  Activity, 
  Heart, 
  Dna, 
  Brain, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Zap, 
  Flame, 
  TrendingUp, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight, 
  Sliders, 
  Check, 
  X,
  Stethoscope,
  Target,
  Compass,
  Layers,
  Layers2,
  RefreshCw,
  PhoneCall,
  TestTube,
  FileCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OrganSystemModelingProps {
  user: UserProfile;
  onNavigateToMarketplace?: () => void;
}

export function OrganSystemModeling({ user, onNavigateToMarketplace }: OrganSystemModelingProps) {
  const [activeView, setActiveView] = useState<'map' | 'roadmap' | 'report'>('map');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganSystemHealth | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollStep, setEnrollStep] = useState<number>(1);
  const [roadmap, setRoadmap] = useState<LongevityRoadmapPhase[]>(() => 
    generateLongevityRoadmap(user, calculateOrganSystems(user))
  );

  const organSystems = calculateOrganSystems(user);
  const executiveReport = generateExecutiveReport(user);

  const getOrganIcon = (id: string) => {
    switch (id) {
      case 'cardiovascular': return Heart;
      case 'metabolic': return Zap;
      case 'immune': return ShieldCheck;
      case 'neurocognitive': return Brain;
      case 'hepatic': return Activity;
      case 'renal': return Sliders;
      case 'musculoskeletal': return Layers;
      case 'endocrine': return Flame;
      case 'pulmonary': return TrendingUp;
      default: return Activity;
    }
  };

  const getStatusBadge = (status: string, delta: number) => {
    if (delta <= -3.0) {
      return {
        label: `${Math.abs(delta)} yrs younger`,
        bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
      };
    }
    if (delta <= 0) {
      return {
        label: `${Math.abs(delta)} yrs younger`,
        bg: 'bg-teal-500/10 text-teal-700 border-teal-300'
      };
    }
    return {
      label: `+${delta} yrs strain`,
      bg: 'bg-amber-500/10 text-amber-700 border-amber-300'
    };
  };

  const toggleIntervention = (phaseIdx: number, intId: string) => {
    setRoadmap(prev => prev.map((phase, pIdx) => {
      if (pIdx !== phaseIdx) return phase;
      return {
        ...phase,
        interventions: phase.interventions.map(item => {
          if (item.id !== intId) return item;
          return { ...item, completed: !item.completed };
        })
      };
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER: AOSM SYSTEM & LONGEVITY ADVANTAGE       */}
      {/* ======================================================== */}
      <div className="bg-white text-[#181716] rounded-2xl p-6 sm:p-7 border border-[#ebe7df] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-clinical">
                <Sparkles className="w-3 h-3 text-[#344a37]" /> Biological Longevity Engine
              </span>
              <span className="badge-neutral font-mono">
                AOSM Technology
              </span>
              <span className="badge-neutral">
                9 Organ Systems Calibrated
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#181716] tracking-tight leading-tight font-serif-title">
              Advanced Organ System Modeling (AOSM)
            </h1>
            
            <p className="text-xs text-[#5c5851] leading-relaxed">
              Synthesizes clinical laboratory biomarkers, DNA methylation age, and wearable continuous telemetry to compute the biological age of your 9 core organ systems and map your 90-day longevity roadmap.
            </p>
          </div>

          {/* Biological Age Box */}
          <div className="bg-[#faf9f6] border border-[#ebe7df] rounded-xl p-4 flex-shrink-0 w-full lg:w-76 space-y-3">
            <div className="flex items-center justify-between border-b border-[#f4f2ec] pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#8a857b] block tracking-wider">
                  Biological System Age
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-bold text-[#181716]">
                    {executiveReport.overallBiologicalAge}
                  </span>
                  <span className="text-xs text-[#8a857b] font-mono">
                    yrs (Chron: {user.age || 42})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[#8a857b] block tracking-wider">
                  Advantage
                </span>
                <span className="text-xs font-semibold text-[#2b4530] bg-[#f1f5f2] px-2 py-0.5 rounded border border-[#dbe5dc] inline-block mt-0.5 font-mono">
                  -{executiveReport.longevityAdvantageYears} yrs
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-[#ebe7df]">
                <span className="text-[10px] text-[#8a857b] block font-medium">Pace of Aging</span>
                <span className="text-sm font-bold text-[#181716]">
                  {executiveReport.paceOfAging}x
                </span>
                <span className="text-[9px] text-[#8a857b] block font-mono">yr / calendar yr</span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-[#ebe7df]">
                <span className="text-[10px] text-[#8a857b] block font-medium">System Reserve</span>
                <span className="text-sm font-bold text-[#2b4530]">
                  {executiveReport.overallReserveScore}%
                </span>
                <span className="text-[9px] text-[#2b4530] font-medium block">Optimal Reserve</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex-1 py-1.5 px-2 btn-ink text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>Clinical Report</span>
              </button>

              <button
                onClick={() => setEnrollModalOpen(true)}
                className="py-1.5 px-3 btn-stone text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>AOSM $399</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Step Journey */}
        <div className="pt-4 border-t border-[#f4f2ec]">
          <span className="text-[10px] uppercase font-semibold text-[#8a857b] block tracking-wider mb-2.5">
            The 4-Step AOSM Concierge Journey
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { step: '1', title: 'Enroll & Dispatch', desc: 'Private onboarding & diagnostic kit dispatch', status: 'Completed', icon: PhoneCall },
              { step: '2', title: 'Sample Collection', desc: 'Blood draw, epigenetic swab & health questionnaire', status: 'Completed', icon: TestTube },
              { step: '3', title: 'AOSM Calibration', desc: '9-organ modeling & biomarker computation', status: 'Active', icon: Dna },
              { step: '4', title: '90-Day Execution', desc: 'Active protocol adherence & clinical check-ins', status: 'In Progress', icon: FileCheck },
            ].map(st => (
              <div 
                key={st.step}
                className="bg-[#faf9f6] border border-[#ebe7df] rounded-xl p-3 flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-md bg-[#181716] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {st.step}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-[#181716] block truncate">{st.title}</span>
                  <p className="text-[11px] text-[#6e6960] leading-tight mt-0.5">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-VIEW SELECTOR                                     */}
      {/* ======================================================== */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
        <button
          onClick={() => setActiveView('map')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeView === 'map'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <Dna className="w-3.5 h-3.5" />
          <span>9-Organ Biological Map</span>
        </button>

        <button
          onClick={() => setActiveView('roadmap')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeView === 'roadmap'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>90-Day Longevity Roadmap</span>
        </button>

        <button
          onClick={() => setActiveView('report')}
          className={cn(
            "flex-1 min-w-[150px] px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeView === 'report'
              ? "bg-[#181716] text-white"
              : "text-[#5c5851] hover:text-[#181716] hover:bg-white"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Executive Healthspan Dossier</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. VIEW 1: THE 9-ORGAN SYSTEM BIOLOGICAL AGE MAP        */}
      {/* ======================================================== */}
      {activeView === 'map' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Nine Major Organ Systems Biological Telemetry</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quantified biological ages calculated across key organ subsystems relative to your chronological age of {user.age || 42} years.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Preserved Reserve
              </span>
              <span className="flex items-center gap-1 text-slate-600 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Accelerated / Action Needed
              </span>
            </div>
          </div>

          {/* 9-Card Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {organSystems.map((organ) => {
              const Icon = getOrganIcon(organ.id);
              const delta = organ.chronologicalAgeDelta;
              const badge = getStatusBadge(organ.status, delta);
              const isSelected = selectedOrgan?.id === organ.id;

              return (
                <div
                  key={organ.id}
                  onClick={() => setSelectedOrgan(organ)}
                  className={cn(
                    "bg-white rounded-2xl border p-5 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 hover:shadow-lg",
                    isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          delta <= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {organ.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium block">
                            {organ.category}
                          </span>
                        </div>
                      </div>

                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wide",
                        badge.bg
                      )}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Biological Age & Reserve Metrics */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Biological Age
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          {organ.biologicalAge} <span className="text-xs font-normal text-slate-500">yrs</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Biological Reserve
                        </span>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <span className="text-sm font-black text-slate-800">
                            {organ.biologicalReservePercent}%
                          </span>
                          <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                organ.biologicalReservePercent >= 80 ? "bg-emerald-500" : "bg-amber-500"
                              )}
                              style={{ width: `${organ.biologicalReservePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biomarker Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Key Influencing Biomarkers
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {organ.primaryBiomarkers.map((b, bIdx) => (
                          <span 
                            key={bIdx}
                            className={cn(
                              "text-[11px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1",
                              b.impact === 'positive' 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : b.impact === 'strained'
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            <span>{b.name}:</span>
                            <span className="font-bold">{b.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                      {organ.priorityAction}
                    </span>
                    <button className="text-emerald-700 font-bold text-xs flex items-center gap-0.5 hover:underline flex-shrink-0">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Organ Modal/Drawer */}
          {selectedOrgan && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">
                      AOSM Clinical Analysis
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedOrgan.name}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {selectedOrgan.category} • Biological Age: <strong className="text-emerald-400">{selectedOrgan.biologicalAge} yrs</strong> ({selectedOrgan.chronologicalAgeDelta <= 0 ? `${Math.abs(selectedOrgan.chronologicalAgeDelta)} yrs younger` : `+${selectedOrgan.chronologicalAgeDelta} yrs older`} than chronological)
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOrgan(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Diagnostic Clinical Summary
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedOrgan.clinicalSummary}
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                    Prescribed Longevity Intervention Stack
                  </span>
                  <p className="text-white font-bold">
                    {selectedOrgan.targetIntervention}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Priority Action:</strong> {selectedOrgan.priorityAction}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveView('roadmap')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>View in 90-Day Roadmap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VIEW 2: PERSONALIZED 90-DAY LONGEVITY ROADMAP        */}
      {/* ======================================================== */}
      {activeView === 'roadmap' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span>Personalized 90-Day Longevity Roadmap</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured clinical protocol phases derived from your AOSM 9-organ modeling and baseline bloodwork.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-bold">
                Phase 1 Active (Days 1 - 30)
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {roadmap.map((phase, pIdx) => {
              const completedCount = phase.interventions.filter(i => i.completed).length;
              const totalCount = phase.interventions.length;
              const percent = Math.round((completedCount / totalCount) * 100);

              return (
                <div 
                  key={phase.phaseNumber}
                  className={cn(
                    "bg-white rounded-3xl border p-6 shadow-sm transition-all space-y-5",
                    phase.status === 'in_progress' ? "border-indigo-300 ring-2 ring-indigo-500/10" : "border-slate-200"
                  )}
                >
                  {/* Phase Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm",
                        phase.status === 'in_progress' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                      )}>
                        P{phase.phaseNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                            {phase.daysRange}
                          </span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase",
                            phase.status === 'in_progress' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                          )}>
                            {phase.status === 'in_progress' ? 'Active Regimen' : 'Upcoming Phase'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {phase.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Focus: <strong>{phase.focusArea}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 min-w-[160px] text-right">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-500 text-[10px]">Adherence</span>
                        <span className="text-indigo-600 font-extrabold">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interventions Checklist */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                      Targeted Protocol Interventions
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {phase.interventions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleIntervention(pIdx, item.id)}
                          className={cn(
                            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2",
                            item.completed 
                              ? "bg-emerald-50/70 border-emerald-300 text-slate-900" 
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/80 border text-slate-600">
                                {item.category}
                              </span>
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                                item.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                              )}>
                                {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-tight">
                              {item.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phase Milestone Callout */}
                  <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-2xl flex items-center gap-3 text-xs">
                    <Target className="w-5 h-5 text-indigo-700 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-indigo-950">Phase Milestone Target:</span>
                      <p className="text-indigo-900 mt-0.5">{phase.keyMilestone}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. VIEW 3: EXECUTIVE HEALTHSPAN SUMMARY REPORT          */}
      {/* ======================================================== */}
      {activeView === 'report' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  Verified Executive Summary
                </span>
                <span className="text-xs text-slate-400">
                  Ref: AOSM-2026-Q3
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Executive Healthspan &amp; Biological Reserve Report
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong>{user.name}</strong> • Chronological Age: <strong>{user.age || 42}</strong> • Modeling Date: August 2026
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setReportModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Full Screen View</span>
              </button>
            </div>
          </div>

          {/* Top Opportunities Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Priority Health Opportunities (AOSM High-Impact Focus)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {executiveReport.topOpportunities.map((opp, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{opp.system}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      opp.priority === 'High' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {opp.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {opp.observation}
                  </p>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Protocol:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{opp.actionableProtocol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organ Systems Overview Table */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Comprehensive 9-Organ Systems Scorecard
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Organ System</th>
                    <th className="py-2.5 px-3">Biological Age</th>
                    <th className="py-2.5 px-3">Age Delta</th>
                    <th className="py-2.5 px-3">Biological Reserve</th>
                    <th className="py-2.5 px-3">Velocity</th>
                    <th className="py-2.5 px-3">Primary Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organSystems.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 font-black text-slate-800">{s.biologicalAge} yrs</td>
                      <td className="py-3 px-3 font-bold">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px]",
                          s.chronologicalAgeDelta <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {s.chronologicalAgeDelta <= 0 ? `${Math.abs(s.chronologicalAgeDelta)} yrs younger` : `+${s.chronologicalAgeDelta} yrs strain`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{s.biologicalReservePercent}%</span>
                      </td>
                      <td className="py-3 px-3 font-semibold capitalize text-slate-600">{s.agingVelocity}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-[260px] truncate">{s.priorityAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FULL SCREEN EXECUTIVE HEALTHSPAN REPORT MODAL         */}
      {/* ======================================================== */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] bg-slate-900 text-white font-extrabold px-2.5 py-0.5 rounded uppercase">
                  AOSM Clinical Telemetry Document
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Executive Healthspan &amp; 9-Organ Systems Roadmap
                </h2>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Chronological Age</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">{user.age || 42} years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Biological Age</span>
                <span className="text-lg font-black text-emerald-600 block mt-0.5">{executiveReport.overallBiologicalAge} years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Longevity Advantage</span>
                <span className="text-lg font-black text-emerald-600 block mt-0.5">-{executiveReport.longevityAdvantageYears} years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Biological Reserve</span>
                <span className="text-lg font-black text-indigo-600 block mt-0.5">{executiveReport.overallReserveScore}%</span>
              </div>
            </div>

            {/* 9 Organ Systems Summary */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                9 Organ Systems Biological Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {organSystems.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{s.name}</span>
                      <span className="font-black text-emerald-700">{s.biologicalAge}y</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{s.targetIntervention}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Sign-Off */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <div>
                  <span className="font-bold text-emerald-950">AOSM Protocol Verified &amp; Signed</span>
                  <p className="text-emerald-800 text-[11px]">Next Recommended Biomarker Draw: November 2026</p>
                </div>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. AOSM CONCIERGE ENROLLMENT MODAL ($399 EARLY ACCESS)   */}
      {/* ======================================================== */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  AOSM Early Access Plan • $399
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Complete Longevity Assessment Enrollment
                </h3>
              </div>
              <button 
                onClick={() => { setEnrollModalOpen(false); setEnrollStep(1); }}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrollStep === 1 && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Enroll in the full <strong>Advanced Organ System Modeling (AOSM) Assessment</strong>. Includes comprehensive at-home sample collection, 9-organ biological age profiling, executive healthspan review, and a customized 90-day roadmap.
                </p>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Package Inclusions:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dedicated private concierge intake onboarding call</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Comprehensive biological sample kit &amp; lab requisition</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>9-Major Organ System Biological Age Telemetry Map</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Personalized 90-day phased longevity roadmap &amp; protocol</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-2xl font-black text-slate-900">$399</span>
                    <span className="text-slate-400 text-xs ml-1.5 line-through">$599</span>
                  </div>
                  <button
                    onClick={() => setEnrollStep(2)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Reserve Early Access Spot</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {enrollStep === 2 && (
              <div className="space-y-4 text-xs text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Reservation Confirmed!
                </h4>
                <p className="text-slate-600 max-w-sm mx-auto">
                  Your AOSM sample collection kit has been scheduled for priority dispatch. A clinical concierge coordinator will reach out to confirm your private onboarding consultation.
                </p>
                <button
                  onClick={() => { setEnrollModalOpen(false); setEnrollStep(1); }}
                  className="px-6 py-2.5 bg-slate-900 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { UserProfile, ExtractedFact, BaselineDiagnostics } from '../types';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  FileText,
  Heart,
  Dna,
  Zap,
  Activity as ActivityIcon,
  Smile,
  AlertTriangle,
  Layers,
  ClipboardList,
  Check,
  Brain,
  Scale,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';

type OnboardingStep = {
  id: string;
  question: string;
  category: string;
  whyItMatters: string;
  structuredOptions?: string[];
};

const BASE_QUESTIONS: OnboardingStep[] = [
  {
    id: 'q1',
    question: "Hello! I am CuasarX Assistant, your Health Intelligence engine for JohnMatrix. What are your primary athletic or longevity goals for this quarter?",
    category: 'Primary Goals',
    whyItMatters: "Helps tailor periodization, daily readiness calculations, and recovery protocols.",
    structuredOptions: ['Marathon / Endurance Race', 'Hypertrophy & Strength', 'Fat Loss & Body Composition', 'Executive Stress & Energy']
  },
  {
    id: 'q2',
    question: "How many days per week do you currently train, and do you have any active injuries or joint discomfort?",
    category: 'Training & Injuries',
    whyItMatters: "Prevents acute workload spikes and filters out contraindicated strength movements.",
    structuredOptions: ['3 Days/wk (No Injury)', '4-5 Days/wk (Mild Joint Soreness)', '6+ Days/wk (Active Injury)']
  },
  {
    id: 'q3',
    question: "What is your typical sleep duration and average work stress level on a scale from 1 to 10?",
    category: 'Circadian & Stress',
    whyItMatters: "Directly determines your baseline HRV recovery capacity and daily workout suppression rules.",
    structuredOptions: ['< 6 hrs / High Stress (8-10)', '6-7 hrs / Moderate Stress (5-7)', '8+ hrs / Low Stress (1-4)']
  },
  {
    id: 'q4',
    question: "Do you have recent DEXA body composition, EKG, or comprehensive blood work available for comparative analysis?",
    category: 'Baseline Biomarkers',
    whyItMatters: "Allows high-precision calibration of metabolic, cardiovascular, and hormonal target ranges.",
    structuredOptions: ['Yes, DEXA + Bloodwork Ready', 'Bloodwork Only', 'Wearable Baseline Only', 'Needs Diagnostic Testing']
  }
];

const PRESET_EXECUTIVE: BaselineDiagnostics = {
  dexa: {
    bodyFatPercent: 14.2,
    leanMassKg: 72.5,
    visceralFatGrams: 340,
    boneDensityZScore: 1.4
  },
  bloodwork: {
    apoB: 78,
    hsCRP: 0.45,
    fastingGlucose: 88,
    hba1c: 5.1,
    fastingInsulin: 4.2,
    vitaminD: 62,
    testosteroneFree: 21.5,
    cortisolAM: 14.8,
    altAst: '21 / 23 U/L',
    tsh: 1.85
  },
  diagnostics: {
    ekgFindings: 'Normal Sinus Rhythm, 52 bpm, Normal Axis, No Arrhythmias',
    vo2Max: 51.5,
    rmrKcal: 1840
  },
  anthropometrics: {
    weightKg: 81.5,
    heightCm: 182,
    rhrBpm: 52,
    hrvMs: 68,
    sleepEfficiencyPercent: 88
  },
  medicalHistory: {
    chronicConditions: ['Mild Seasonal Allergies', 'Prior Left Meniscus Arthroscopy (2021)'],
    medicationsPeptides: ['Telmisartan 20mg (Preventative)', 'BPC-157 250mcg (Post-Injury)', 'Omega-3 3g/day'],
    familyHistory: ['Maternal Type 2 Diabetes (Age 68)', 'Paternal Hypertension'],
    allergies: ['Penicillin', 'Lactose (Mild Sensitivity)']
  },
  sportsProfile: {
    primaryDiscipline: 'Executive Fitness & Zone 2 Cycling',
    weeklyHours: 7.5,
    zone2WeeklyHours: 4.0,
    activeInjuries: ['Left Knee Patellar Tendinopathy (Mild)']
  },
  psychologicalProfile: {
    perceivedStressScore: 7,
    burnoutIndex: 'Moderate',
    cognitiveFatigueScore: 6,
    sleepOnsetRumination: true
  }
};

const PRESET_ATHLETE: BaselineDiagnostics = {
  dexa: {
    bodyFatPercent: 9.8,
    leanMassKg: 78.0,
    visceralFatGrams: 180,
    boneDensityZScore: 2.1
  },
  bloodwork: {
    apoB: 65,
    hsCRP: 0.25,
    fastingGlucose: 82,
    hba1c: 4.9,
    fastingInsulin: 3.1,
    vitaminD: 75,
    testosteroneFree: 28.4,
    cortisolAM: 16.2,
    altAst: '25 / 27 U/L',
    tsh: 1.45
  },
  diagnostics: {
    ekgFindings: 'Sinus Bradycardia (Athlete Heart), 44 bpm, Normal EKG',
    vo2Max: 64.2,
    rmrKcal: 2100
  },
  anthropometrics: {
    weightKg: 76.0,
    heightCm: 180,
    rhrBpm: 44,
    hrvMs: 92,
    sleepEfficiencyPercent: 92
  },
  medicalHistory: {
    chronicConditions: ['None'],
    medicationsPeptides: ['Creatine Monohydrate 5g', 'Beta-Alanine 3.2g', 'Electrolyte Complex'],
    familyHistory: ['No Early Cardiovascular Disease'],
    allergies: ['None']
  },
  sportsProfile: {
    primaryDiscipline: 'Triathlon & Endurance Racing',
    weeklyHours: 14.0,
    zone2WeeklyHours: 9.0,
    activeInjuries: ['Right Achillis Tightness']
  },
  psychologicalProfile: {
    perceivedStressScore: 3,
    burnoutIndex: 'Low',
    cognitiveFatigueScore: 3,
    sleepOnsetRumination: false
  }
};

export function IntakeOnboarding({ 
  user, 
  onComplete 
}: { 
  user: UserProfile; 
  onComplete?: (updatedUser: Partial<UserProfile>) => void;
}) {
  const [intakeMode, setIntakeMode] = useState<'form' | 'voice' | 'report'>('form');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
  const [showingConfirmation, setShowingConfirmation] = useState(false);
  const [pendingFacts, setPendingFacts] = useState<ExtractedFact[]>([]);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  // Form State for Baseline Diagnostics
  const [diagForm, setDiagForm] = useState<BaselineDiagnostics>(
    user.baselineDiagnostics || PRESET_EXECUTIVE
  );

  const currentStep = BASE_QUESTIONS[currentStepIndex] || BASE_QUESTIONS[0];

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  };

  const handleStartVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleProcessAnswer("I train 6 days a week with 4 hours of Zone 2 cycling. My recent DEXA showed 14.2% body fat and my blood ApoB was 78 mg/dL.");
    }, 2800);
  };

  const handleProcessAnswer = (answerText: string) => {
    const newFact: ExtractedFact = {
      id: Date.now().toString(),
      key: currentStep.category,
      value: answerText,
      category: currentStep.category,
      confidence: 0.97,
      source: 'voice',
      verified: false
    };

    setPendingFacts([newFact]);
    setShowingConfirmation(true);
  };

  const confirmFact = () => {
    setExtractedFacts(prev => [...prev, ...pendingFacts]);
    setPendingFacts([]);
    setShowingConfirmation(false);
    setTextInput('');

    if (currentStepIndex < BASE_QUESTIONS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      speakQuestion(BASE_QUESTIONS[nextIndex].question);
    } else {
      setSubmittedStatus("Conversational intake complete! Syncing with diagnostic profile.");
      if (onComplete) {
        onComplete({
          dataCompleteness: Math.min(100, user.dataCompleteness + 25)
        });
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedStatus("Comprehensive Baseline Diagnostic Data Saved Successfully!");
    setIntakeMode('report');

    if (onComplete) {
      onComplete({
        baselineDiagnostics: diagForm,
        dataCompleteness: 100
      });
    }

    setTimeout(() => setSubmittedStatus(null), 4000);
  };

  const loadPreset = (preset: BaselineDiagnostics) => {
    setDiagForm(preset);
    setSubmittedStatus("Loaded preset baseline diagnostic profile!");
    setTimeout(() => setSubmittedStatus(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                JohnMatrix &amp; CuasarX AI Intake
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Medical-Grade Baseline Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Comprehensive Health, Athletic &amp; Diagnostic Intake
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Capture granular medical history, athletic performance, stress psychology, and gold-standard diagnostic testing (DEXA, Blood Biomarkers, EKG, VO2 Max, HRV) for AI comparative analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setIntakeMode('form')}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                intakeMode === 'form' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <ClipboardList className="w-4 h-4" /> Comprehensive Form
            </button>
            <button
              type="button"
              onClick={() => setIntakeMode('voice')}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                intakeMode === 'voice' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Mic className="w-4 h-4" /> AI Voice Intake
            </button>
            <button
              type="button"
              onClick={() => setIntakeMode('report')}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                intakeMode === 'report' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <ActivityIcon className="w-4 h-4" /> Baseline Analysis
            </button>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Load Sample Biomarker Preset:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadPreset(PRESET_EXECUTIVE)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-bold border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Executive Biohacker Preset
            </button>
            <button
              type="button"
              onClick={() => loadPreset(PRESET_ATHLETE)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg font-bold border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Peak Endurance Athlete Preset
            </button>
          </div>
        </div>
      </div>

      {submittedStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{submittedStatus}</span>
        </div>
      )}

      {/* MODE 1: COMPREHENSIVE CLINICAL & DIAGNOSTIC FORM */}
      {intakeMode === 'form' && (
        <form onSubmit={handleSaveForm} className="space-y-6">
          
          {/* SECTION 1: MEDICAL HISTORY & PHARMACOLOGY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">1. Medical History &amp; Pharmacology</h3>
                <p className="text-xs text-slate-500">Chronic conditions, surgical history, medications, peptides &amp; family risks</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Active / Past Chronic Conditions</label>
                <input
                  type="text"
                  value={diagForm.medicalHistory?.chronicConditions.join(', ') || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    medicalHistory: {
                      ...diagForm.medicalHistory!,
                      chronicConditions: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="e.g. Mild Hypertension, Meniscus Repair, Asthma..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prescription Medications, HRT/TRT &amp; Peptides</label>
                <input
                  type="text"
                  value={diagForm.medicalHistory?.medicationsPeptides.join(', ') || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    medicalHistory: {
                      ...diagForm.medicalHistory!,
                      medicationsPeptides: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="e.g. Telmisartan 20mg, BPC-157 250mcg, Omega-3..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Family Medical History Flags</label>
                <input
                  type="text"
                  value={diagForm.medicalHistory?.familyHistory.join(', ') || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    medicalHistory: {
                      ...diagForm.medicalHistory!,
                      familyHistory: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="e.g. Maternal Type 2 Diabetes, Paternal CVD..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Allergies &amp; Food Intolerances</label>
                <input
                  type="text"
                  value={diagForm.medicalHistory?.allergies.join(', ') || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    medicalHistory: {
                      ...diagForm.medicalHistory!,
                      allergies: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="e.g. Penicillin, Lactose Sensitivity, Shellfish..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SPORTS PERFORMANCE & ATHLETIC PROFILE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">2. Sport, Athletic Discipline &amp; Movement</h3>
                <p className="text-xs text-slate-500">Training load, primary athletic focus, Zone 2 hours &amp; active injuries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Discipline</label>
                <input
                  type="text"
                  value={diagForm.sportsProfile?.primaryDiscipline || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    sportsProfile: { ...diagForm.sportsProfile!, primaryDiscipline: e.target.value }
                  })}
                  placeholder="e.g. Marathon, Powerlifting, Zone 2 Cycling..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Weekly Training (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={diagForm.sportsProfile?.weeklyHours || 0}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    sportsProfile: { ...diagForm.sportsProfile!, weeklyHours: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Zone 2 Cardio Hours/Week</label>
                <input
                  type="number"
                  step="0.5"
                  value={diagForm.sportsProfile?.zone2WeeklyHours || 0}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    sportsProfile: { ...diagForm.sportsProfile!, zone2WeeklyHours: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Active Injuries / Soreness</label>
                <input
                  type="text"
                  value={diagForm.sportsProfile?.activeInjuries.join(', ') || ''}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    sportsProfile: { ...diagForm.sportsProfile!, activeInjuries: e.target.value.split(',').map(s => s.trim()) }
                  })}
                  placeholder="e.g. Patellar Tendinopathy..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: STRESS LEVELS & PSYCHOLOGY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">3. Stress Levels, Psychology &amp; Mental Performance</h3>
                <p className="text-xs text-slate-500">Perceived stress scale (PSS), burnout score, cognitive fatigue &amp; rumination</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Perceived Stress Rating (1-10)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={diagForm.psychologicalProfile?.perceivedStressScore || 5}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      psychologicalProfile: { ...diagForm.psychologicalProfile!, perceivedStressScore: parseInt(e.target.value) }
                    })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {diagForm.psychologicalProfile?.perceivedStressScore || 5}/10
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Burnout Severity Index</label>
                <select
                  value={diagForm.psychologicalProfile?.burnoutIndex || 'Low'}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    psychologicalProfile: { ...diagForm.psychologicalProfile!, burnoutIndex: e.target.value as any }
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low Burnout (High Energy)</option>
                  <option value="Moderate">Moderate Burnout (Periodic Fatigue)</option>
                  <option value="Severe">Severe / High Executive Burnout</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cognitive Fatigue / Brain Fog (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={diagForm.psychologicalProfile?.cognitiveFatigueScore || 5}
                  onChange={(e) => setDiagForm({
                    ...diagForm,
                    psychologicalProfile: { ...diagForm.psychologicalProfile!, cognitiveFatigueScore: parseInt(e.target.value) || 1 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sleep-Onset Rumination / Anxiety</label>
                <button
                  type="button"
                  onClick={() => setDiagForm({
                    ...diagForm,
                    psychologicalProfile: { ...diagForm.psychologicalProfile!, sleepOnsetRumination: !diagForm.psychologicalProfile?.sleepOnsetRumination }
                  })}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center",
                    diagForm.psychologicalProfile?.sleepOnsetRumination
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  )}
                >
                  {diagForm.psychologicalProfile?.sleepOnsetRumination ? "Active (Night Thoughts Present)" : "No Sleep Rumination"}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: BASELINE DIAGNOSTICS - DEXA, BLOODWORK, EKG & ANTHROPOMETRICS */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">4. Gold-Standard Diagnostic Testing &amp; Biomarkers</h3>
                <p className="text-xs text-slate-500">DEXA scan, comprehensive blood panel, EKG findings, VO2 Max &amp; wearable baselines</p>
              </div>
            </div>

            {/* Sub-block A: DEXA & Body Composition */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-emerald-600" /> DEXA Scan Body Composition
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.dexa?.bodyFatPercent || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      dexa: { ...diagForm.dexa!, bodyFatPercent: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Lean Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.dexa?.leanMassKg || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      dexa: { ...diagForm.dexa!, leanMassKg: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Visceral Fat VAT (g)</label>
                  <input
                    type="number"
                    value={diagForm.dexa?.visceralFatGrams || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      dexa: { ...diagForm.dexa!, visceralFatGrams: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bone Density Z-Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.dexa?.boneDensityZScore || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      dexa: { ...diagForm.dexa!, boneDensityZScore: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Sub-block B: Blood Panel */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Dna className="w-4 h-4 text-indigo-600" /> Comprehensive Longevity Blood Panel
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ApoB (mg/dL)</label>
                  <input
                    type="number"
                    value={diagForm.bloodwork?.apoB || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, apoB: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">hs-CRP (mg/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={diagForm.bloodwork?.hsCRP || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, hsCRP: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fasting Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={diagForm.bloodwork?.fastingGlucose || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, fastingGlucose: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.bloodwork?.hba1c || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, hba1c: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fasting Insulin (uIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.bloodwork?.fastingInsulin || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, fastingInsulin: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Vitamin D (ng/mL)</label>
                  <input
                    type="number"
                    value={diagForm.bloodwork?.vitaminD || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, vitaminD: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Free Testosterone (pg/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.bloodwork?.testosteroneFree || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, testosteroneFree: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Cortisol AM (mcg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.bloodwork?.cortisolAM || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, cortisolAM: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ALT / AST Enzymes</label>
                  <input
                    type="text"
                    value={diagForm.bloodwork?.altAst || ''}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, altAst: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">TSH (uIU/mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={diagForm.bloodwork?.tsh || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      bloodwork: { ...diagForm.bloodwork!, tsh: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Sub-block C: Clinical Diagnostics & Wearables */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-600" /> EKG Findings, VO2 Max &amp; Wearables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">EKG / ECG Clinical Notes</label>
                  <input
                    type="text"
                    value={diagForm.diagnostics?.ekgFindings || ''}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      diagnostics: { ...diagForm.diagnostics!, ekgFindings: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">VO2 Max (mL/kg/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.diagnostics?.vo2Max || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      diagnostics: { ...diagForm.diagnostics!, vo2Max: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Resting Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={diagForm.anthropometrics?.rhrBpm || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      anthropometrics: { ...diagForm.anthropometrics!, rhrBpm: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">HRV (rMSSD ms)</label>
                  <input
                    type="number"
                    value={diagForm.anthropometrics?.hrvMs || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      anthropometrics: { ...diagForm.anthropometrics!, hrvMs: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagForm.anthropometrics?.weightKg || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      anthropometrics: { ...diagForm.anthropometrics!, weightKg: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={diagForm.anthropometrics?.heightCm || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      anthropometrics: { ...diagForm.anthropometrics!, heightCm: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Sleep Efficiency %</label>
                  <input
                    type="number"
                    value={diagForm.anthropometrics?.sleepEfficiencyPercent || 0}
                    onChange={(e) => setDiagForm({
                      ...diagForm,
                      anthropometrics: { ...diagForm.anthropometrics!, sleepEfficiencyPercent: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Save Baseline Diagnostics &amp; Generate Report
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODE 2: CONVERSATIONAL VOICE INTAKE */}
      {intakeMode === 'voice' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Conversational Engine</span>
              <h3 className="text-xl font-bold text-slate-900">Interactive Voice Intake with Phi</h3>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 font-bold">
              Question {currentStepIndex + 1} of {BASE_QUESTIONS.length}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500",
                isSpeaking ? "bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-110" :
                isListening ? "bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse" :
                "bg-indigo-600 shadow-md"
              )}>
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isSpeaking ? "Phi is Speaking..." : isListening ? "Listening to your response..." : "Phi Ready"}
            </div>

            <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed text-slate-100">
              "{currentStep.question}"
            </p>

            <div className="text-xs text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl max-w-lg border border-slate-700/50 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span><strong>Why Phi asks:</strong> {currentStep.whyItMatters}</span>
            </div>
          </div>

          {!showingConfirmation ? (
            <div className="space-y-4">
              {currentStep.structuredOptions && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">Quick Options</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentStep.structuredOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleProcessAnswer(opt)}
                        className="p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 text-left transition-all flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleStartVoice}
                  disabled={isListening}
                  className={cn(
                    "w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-bold text-sm shadow-sm",
                    isListening 
                      ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse" 
                      : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5 text-rose-600" /> : <Mic className="w-5 h-5 text-indigo-600" />}
                  {isListening ? "Listening... Speak clearly into mic" : "Press to Speak Naturally to Phi"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Fact Extraction Confirmation
                </h4>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  97% AI Confidence
                </span>
              </div>

              <div className="space-y-3">
                {pendingFacts.map(fact => (
                  <div key={fact.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">{fact.category}</span>
                    <p className="text-sm font-semibold text-slate-900">"{fact.value}"</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowingConfirmation(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Edit / Re-answer
                </button>
                <button
                  type="button"
                  onClick={confirmFact}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Confirm &amp; Save Fact
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: BASELINE COMPARATIVE REPORT & ANALYTICS */}
      {intakeMode === 'report' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Analytical Synthesis</span>
              <h3 className="text-xl font-bold text-slate-900">Baseline Diagnostic Health &amp; Athletic Report</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Data Completeness: 100%
            </span>
          </div>

          {/* 4 Pillar Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Cardiometabolic Index</span>
              <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                92 <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">ApoB {diagForm.bloodwork?.apoB || 78} mg/dL • Optimal</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Athletic Engine (VO2 Max)</span>
              <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                {diagForm.diagnostics?.vo2Max || 51.5} <span className="text-xs text-slate-400 font-normal">mL/kg/min</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-bold">Top 5% for Age &amp; Gender</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Psychophysiological Stress</span>
              <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                {diagForm.psychologicalProfile?.perceivedStressScore || 7} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
              <p className="text-[11px] text-amber-600 font-bold">Burnout: {diagForm.psychologicalProfile?.burnoutIndex || 'Moderate'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">DEXA Lean Mass Index</span>
              <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                {diagForm.dexa?.bodyFatPercent || 14.2}% <span className="text-xs text-slate-400 font-normal">Fat</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">VAT: {diagForm.dexa?.visceralFatGrams || 340}g (Low Risk)</p>
            </div>
          </div>

          {/* Granular Baseline Comparison Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Medical & Diagnostic Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" /> Medical &amp; Clinical Diagnostics Baseline
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">EKG Status:</span>
                  <strong className="text-slate-900">{diagForm.diagnostics?.ekgFindings}</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Prescription / Peptides:</span>
                  <strong className="text-slate-900">{diagForm.medicalHistory?.medicationsPeptides.join(', ')}</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">hs-CRP Inflammation:</span>
                  <strong className="text-emerald-700 font-bold">{diagForm.bloodwork?.hsCRP} mg/L (Low Risk)</strong>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Free Testosterone:</span>
                  <strong className="text-slate-900">{diagForm.bloodwork?.testosteroneFree} pg/mL</strong>
                </li>
              </ul>
            </div>

            {/* Right: Sports & Psychology Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> Sports &amp; Psychological Performance
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Primary Discipline:</span>
                  <strong className="text-slate-900">{diagForm.sportsProfile?.primaryDiscipline}</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Weekly Training Volume:</span>
                  <strong className="text-slate-900">{diagForm.sportsProfile?.weeklyHours}h ({diagForm.sportsProfile?.zone2WeeklyHours}h Zone 2)</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Cognitive Fatigue Score:</span>
                  <strong className="text-indigo-700 font-bold">{diagForm.psychologicalProfile?.cognitiveFatigueScore}/10</strong>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Active Joint Soreness:</span>
                  <strong className="text-amber-800 font-bold">{diagForm.sportsProfile?.activeInjuries.join(', ')}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

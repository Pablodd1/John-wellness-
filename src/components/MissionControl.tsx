import React, { useState } from 'react';
import { UserProfile, DailyCheckInLog } from '../types';
import { 
  Activity, 
  Heart, 
  Moon, 
  Zap, 
  AlertTriangle, 
  Utensils, 
  Droplets, 
  Sparkles, 
  Pill, 
  CheckCircle2, 
  Gauge,
  ClipboardCheck,
  Smile,
  Frown,
  Plus,
  Calendar,
  X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '../lib/utils';

const EMOJI_OPTIONS = [
  { emoji: '🔥', label: 'Peak Flow', energy: 10, stress: 2 },
  { emoji: '⚡', label: 'High Focus', energy: 9, stress: 3 },
  { emoji: '😊', label: 'Calm & Good', energy: 8, stress: 2 },
  { emoji: '😐', label: 'Steady State', energy: 6, stress: 4 },
  { emoji: '🥱', label: 'Fatigued', energy: 4, stress: 5 },
  { emoji: '🤯', label: 'High Stress', energy: 3, stress: 8 },
];

const QUICK_TAGS = [
  'Deep Work', 
  'Post-Workout', 
  'Coffee Boost', 
  'Fasted State', 
  'Cold Plunge', 
  'Sauna Rest', 
  'Mid-Day Slump'
];

export function MissionControl({ user }: { user: UserProfile }) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [logs, setLogs] = useState<DailyCheckInLog[]>(user.checkInHistory || []);
  
  // Check-in form state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Slight fatigue']);
  const [adherence, setAdherence] = useState<'full' | 'partial' | 'missed'>('full');
  const [energyScore, setEnergyScore] = useState<number>(7);
  const [stressScore, setStressScore] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Quick Emoji Mood state
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string; energy: number; stress: number } | null>(null);
  const [selectedQuickTags, setSelectedQuickTags] = useState<string[]>([]);
  const [quickMoodNote, setQuickMoodNote] = useState<string>('');

  const handleQuickMoodLog = () => {
    if (!selectedMood) return;

    const newLog: DailyCheckInLog = {
      id: `mood-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symptoms: selectedQuickTags.length > 0 ? selectedQuickTags : [selectedMood.label],
      supplementAdherence: 'full',
      energyScore: selectedMood.energy,
      stressScore: selectedMood.stress,
      moodEmoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
      notes: quickMoodNote ? `${selectedMood.emoji} ${selectedMood.label}: ${quickMoodNote}` : `Mood Snapshot: ${selectedMood.emoji} ${selectedMood.label}`
    };

    setLogs([newLog, ...logs]);
    setSelectedMood(null);
    setSelectedQuickTags([]);
    setQuickMoodNote('');
    setSubmittedMessage(`Mood Telemetry Logged: ${selectedMood.emoji} ${selectedMood.label}!`);
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  const symptomOptions = [
    'Brain Fog', 
    'Joint / Knee Tightness', 
    'Sleep Disruption', 
    'Afternoon Energy Crash', 
    'High Stress / Anxiety', 
    'Optimal Peak Flow', 
    'Muscle Soreness (DOMS)'
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSaveCheckIn = () => {
    const newLog: DailyCheckInLog = {
      id: `chk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symptoms: selectedSymptoms,
      supplementAdherence: adherence,
      energyScore,
      stressScore,
      notes: notes || 'Daily wellness check-in logged successfully.'
    };

    setLogs([newLog, ...logs]);
    setShowCheckInModal(false);
    setSubmittedMessage('Check-in logged! Qualitative telemetry synced to CuasarX AI periodization engine.');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  const readinessColor = 
    user.readiness.status === 'optimal' ? 'text-emerald-500' :
    user.readiness.status === 'good' ? 'text-blue-500' :
    user.readiness.status === 'warning' ? 'text-amber-500' : 'text-rose-500';

  const readinessBg = 
    user.readiness.status === 'optimal' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
    user.readiness.status === 'good' ? 'bg-blue-50 text-blue-800 border-blue-200' :
    user.readiness.status === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200';

  const chartData = user.metrics.hrv.trend.map((val, i) => ({
    day: `Day ${i + 1}`,
    hrv: val,
    rhr: user.metrics.rhr.trend[i] || 50,
    sleep: user.metrics.sleep.trend[i] || 7
  }));

  const lowStockItems = user.inventory.filter(p => p.daysRemaining !== undefined && p.daysRemaining <= 5);

  return (
    <div className="space-y-6">
      {/* Header with Daily Check-In Prompt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Morning Mission Control</h2>
          <p className="text-xs text-indigo-600 font-bold">JohnMatrix Daily Health Intelligence &amp; CuasarX Assistant Engine</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
            Log Daily Check-In
          </button>

          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">Completeness: {user.dataCompleteness}%</span>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {submittedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{submittedMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Emoji Mood & Focus Logger Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quick Emoji Mood &amp; Focus Logger</h3>
              <p className="text-[11px] text-slate-500">Tap an emoji to record real-time subjective telemetry</p>
            </div>
          </div>
          {selectedMood && (
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
              Selected: {selectedMood.emoji} {selectedMood.label}
            </span>
          )}
        </div>

        {/* Emoji Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {EMOJI_OPTIONS.map((item) => {
            const isSelected = selectedMood?.label === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedMood(item)}
                className={cn(
                  "p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer group hover:scale-105",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30"
                    : "bg-slate-50 hover:bg-white border-slate-200 text-slate-700"
                )}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                <span className="text-[11px] font-bold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Options when an Emoji is selected */}
        {selectedMood && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Context Tags (Optional)</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map(tag => {
                  const isTagSelected = selectedQuickTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isTagSelected) {
                          setSelectedQuickTags(selectedQuickTags.filter(t => t !== tag));
                        } else {
                          setSelectedQuickTags([...selectedQuickTags, tag]);
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border",
                        isTagSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={quickMoodNote}
                onChange={(e) => setQuickMoodNote(e.target.value)}
                placeholder="Add quick note e.g. 'Feeling laser focused post morning coffee'..."
                className="flex-1 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleQuickMoodLog}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Telemetry
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMood(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety / Action Flags Banner */}
      {user.flags.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">System Guidance Flags</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {user.flags.map((flag, i) => (
                <span key={i} className="text-xs font-medium text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Readiness Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-slate-500" /> Readiness Gauge
              </h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${readinessBg}`}>
                {user.readiness.status}
              </span>
            </div>

            {/* Circular Readiness Meter */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={339}
                    strokeDashoffset={339 - (339 * user.readiness.score) / 100}
                    strokeLinecap="round"
                    className={readinessColor}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-4xl font-extrabold ${readinessColor}`}>{user.readiness.score}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-center mb-4">{user.readiness.message}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep</span>
              <span className="font-extrabold text-slate-900 text-sm">{user.metrics.sleep.current}h</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> HRV</span>
              <span className="font-extrabold text-slate-900 text-sm">{user.metrics.hrv.current} ms</span>
            </div>
          </div>
        </div>

        {/* Multi-Metric Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-500" /> HRV &amp; Sleep Autonomic Trends
            </h3>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> HRV (ms)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> RHR (bpm)</span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRhr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="hrv" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHrv)" />
                  <Area type="monotone" dataKey="rhr" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorRhr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-xs italic">
              Awaiting wearable telemetry sync...
            </div>
          )}
        </div>

        {/* Today's Training Section */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md col-span-1 md:col-span-2 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Adapted Workout</span>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-lg border border-slate-700">
                Intensity: {user.trainingPlan.intensity}
              </span>
            </div>
            <h4 className="text-2xl font-extrabold mb-1">{user.trainingPlan.type}</h4>
            <p className="text-slate-400 text-xs mb-4">Target Duration: {user.trainingPlan.duration} Minutes</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
            <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> CuasarX AI Adaptive Periodization Logic
            </span>
            {user.trainingPlan.reason}
          </div>
        </div>

        {/* Supplement Inventory Low Stock Flag Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Pill className="w-4 h-4 text-indigo-500" /> Regimen Alert
            </h3>
            {lowStockItems.length > 0 && (
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {lowStockItems.length} Low
              </span>
            )}
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-amber-950">{item.name}</h5>
                    <span className="text-amber-700 text-[11px]">~{item.daysRemaining} days left</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200">
                    Reorder
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              All active supplements fully stocked (&gt;5 days remaining).
            </div>
          )}
        </div>

        {/* Qualitative Check-In History Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" /> Daily Qualitative Well-Being &amp; Adherence Log
            </h3>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log Today's Entry
            </button>
          </div>

          {logs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logs.map(log => (
                <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {log.date}
                      {log.moodEmoji && (
                        <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-bold text-[11px] flex items-center gap-1">
                          {log.moodEmoji} {log.moodLabel || 'Mood'}
                        </span>
                      )}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      log.supplementAdherence === 'full' ? 'bg-emerald-100 text-emerald-800' :
                      log.supplementAdherence === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.supplementAdherence} Adherence
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-700">
                    <div>Energy: <strong>{log.energyScore}/10</strong></div>
                    <div>Stress: <strong>{log.stressScore}/10</strong></div>
                  </div>

                  {log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.symptoms.map((sym, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded-md text-[10px] text-slate-600 border border-slate-200">
                          {sym}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-slate-600 italic text-[11px] pt-1 border-t border-slate-200/60">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No qualitative check-ins logged yet today. Click "Log Daily Check-In" above.
            </div>
          )}
        </div>

      </div>

      {/* Daily Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Daily Health &amp; Qualitative Check-In</h3>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form controls */}
            <div className="space-y-4 text-xs">
              {/* Supplement Adherence */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Supplement &amp; Biohack Protocol Adherence</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['full', 'partial', 'missed'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAdherence(mode)}
                      className={`py-2 px-3 rounded-xl border font-bold capitalize transition-all ${
                        adherence === mode 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode} Adherence
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Score */}
              <div>
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>Subjective Energy Score</span>
                  <span className="text-indigo-600">{energyScore} / 10</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={10} 
                  value={energyScore} 
                  onChange={(e) => setEnergyScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Stress Score */}
              <div>
                <div className="flex justify-between font-bold text-slate-800 mb-1">
                  <span>Executive Stress / Overwhelm Level</span>
                  <span className="text-rose-600">{stressScore} / 10</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={10} 
                  value={stressScore} 
                  onChange={(e) => setStressScore(parseInt(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              {/* Symptom Selectors */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Symptom &amp; Sensation Flags</label>
                <div className="flex flex-wrap gap-1.5">
                  {symptomOptions.map(sym => {
                    const active = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-xl font-medium text-[11px] border transition-all ${
                          active 
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Qualitative Notes &amp; Environmental Factors</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Travel fatigue from NYC flight, heavy meeting schedule today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCheckIn}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Save &amp; Sync Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

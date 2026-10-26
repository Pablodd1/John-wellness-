/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYNTHETIC_USERS, MOCK_PRODUCTS, BIOHACKING_PROTOCOLS } from './data';
import { UserProfile, Product, TelemedicineMode } from './types';
import { calculateOrganSystems, generateExecutiveReport } from './utils/organModeling';
import { Marketplace } from './components/Marketplace';
import { SupplementManager } from './components/SupplementManager';
import { BiomarkerTrends } from './components/BiomarkerTrends';
import { UserProfileTab } from './components/UserProfileTab';
import { CommunityConnect } from './components/CommunityConnect';
import { AdminPatientMonitor } from './components/AdminPatientMonitor';
import { InsightsDashboard } from './components/InsightsDashboard';
import { FeedbackButton } from './components/FeedbackButton';
import { IntentBanner } from './components/IntentBanner';
import { PhiChat } from './components/PhiChat';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CuasarLogo } from './components/CuasarLogo';
import { ConsentCenter } from './components/ConsentCenter';
import { TelemedicineVisit } from './components/TelemedicineVisit';
import { FirstRunConsent } from './components/FirstRunConsent';
import { PerformanceResearch } from './components/PerformanceResearch';
import { AuthGate } from './components/AuthGate';
import { AuthProvider, useAuth } from './lib/auth';
import { ConsentProvider, useConsent } from './lib/consent';
import { fetchCatalog, fetchBriefing, composeBriefingText } from './lib/dataService';
import { createTracker, configureTracker, setPage as setTrackerPage } from './lib/analytics';
import { installGlobalErrorHandlers, configureErrorReporter } from './lib/errorMonitor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Shield, 
  Pill, 
  Sparkles, 
  Users, 
  Menu, 
  X, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  User, 
  Stethoscope, 
  Clock, 
  Search, 
  Mic, 
  ChevronDown, 
  Flame, 
  Zap, 
  Repeat, 
  Dna, 
  CheckCircle2, 
  AlertTriangle,
  Truck,
  PhoneCall,
  Video,
  FlaskConical,
  Database,
  ArrowRight
} from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConsentProvider>
          <AppInner />
        </ConsentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppInner() {
  const { user: authUser, profile: authProfile, signOut, dbReady, loading: authLoading, saveProfile } = useAuth();
  const { isGranted } = useConsent();
  const tracker = useRef(createTracker());
  const [coachNudge, setCoachNudge] = useState(false);
  const authEmail = authUser?.email ?? null;
  const [catalogSource, setCatalogSource] = useState<'database' | 'demo' | 'checking'>('checking');
  const [activeUser, setActiveUser] = useState<UserProfile>(SYNTHETIC_USERS[0]);

  // Catalog connectivity check (products are seeded to match the bundled demo
  // data, so this drives the honest "connected" indicator rather than content).
  const [activeTab, setActiveTab] = useState<'marketplace' | 'supplements' | 'trends' | 'profile' | 'research' | 'community' | 'consent' | 'admin' | 'operator'>('marketplace');
  const [marketplaceDepartment, setMarketplaceDepartment] = useState<string>('all');
  const [incomingEvaluation, setIncomingEvaluation] = useState<{ text: string; senderName: string } | null>(null);
  const [videoVisit, setVideoVisit] = useState<{ mode: TelemedicineMode; patient: UserProfile } | null>(null);

  const openVideoVisit = (mode: TelemedicineMode, patient: UserProfile) => {
    setVideoVisit({ mode, patient });
  };
  
  // Drawers & Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Real device readings (health_readings) — override demo metrics for AI layers
  const [realMetrics, setRealMetrics] = useState<Record<string, { value: number; unit: string; deltaPct: number }> | null>(null);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p5') || MOCK_PRODUCTS[0],
      quantity: 1,
      isSubscription: true,
      frequency: '30'
    },
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p2') || MOCK_PRODUCTS[1],
      quantity: 1,
      isSubscription: true,
      frequency: '30'
    },
    {
      product: MOCK_PRODUCTS.find(p => p.id === 'p4') || MOCK_PRODUCTS[2],
      quantity: 1,
      isSubscription: false,
      frequency: '30'
    }
  ]);

  // URL Hash Deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#vitamins' || hash.includes('vitamin')) {
        setActiveTab('marketplace');
        setMarketplaceDepartment('vitamins');
        setTimeout(() => {
          const el = document.getElementById('vitamins');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (hash === '#aosm' || hash.includes('organ') || hash.includes('longevity')) {
        setActiveTab('profile');
      } else if (hash === '#deals' || hash === '#marketplace') {
        setActiveTab('marketplace');
        setMarketplaceDepartment('all');
      } else if (hash === '#supplements' || hash === '#regimen') {
        setActiveTab('supplements');
      } else if (hash === '#trends' || hash === '#biomarkers') {
        setActiveTab('trends');
      } else if (hash === '#profile' || hash === '#dna' || hash === '#labs') {
        setActiveTab('profile');
      } else if (hash === '#research' || hash === '#performance') {
        setActiveTab('research');
      } else if (hash === '#community') {
        setActiveTab('community');
      } else if (hash === '#privacy' || hash === '#consent') {
        setActiveTab('consent');
      } else if (hash === '#admin') {
        setActiveTab('admin');
      } else if (hash === '#operator') {
        setActiveTab('operator');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Catalog connectivity check (products are seeded to match the bundled demo
  // data, so this drives the honest "connected" indicator rather than content).
  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then(({ source }) => {
      if (!cancelled) setCatalogSource(source);
    });
    return () => { cancelled = true; };
  }, []);

  // First-party analytics: only records when behavioral_analytics consent is on.
  useEffect(() => {
    configureTracker({ granted: isGranted('behavioral_analytics'), userId: authUser?.id ?? null });
  }, [isGranted, authUser?.id]);

  // Real device readings → override the demo metrics for the AI layers.
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    import('./lib/dataService').then(({ fetchMyReadings }) =>
      fetchMyReadings().then((rows) => {
        if (cancelled || !rows.length) return;
        const map: Record<string, { value: number; unit: string; deltaPct: number }> = {};
        const byMetric = new Map<string, typeof rows>();
        rows.forEach((r) => {
          if (!byMetric.has(r.metric)) byMetric.set(r.metric, []);
          byMetric.get(r.metric)!.push(r);
        });
        const now = Date.now();
        for (const [metric, rs] of byMetric) {
          const recent = rs.filter((r) => now - new Date(r.recorded_at).getTime() <= 7 * 864e5);
          const prior = rs.filter((r) => {
            const t = new Date(r.recorded_at).getTime();
            return t > now - 37 * 864e5 && t <= now - 30 * 864e5;
          });
          if (!recent.length) continue;
          const avg = (list: typeof rows) => list.reduce((a, r) => a + r.value, 0) / list.length;
          const value = Math.round(avg(recent) * 10) / 10;
          const deltaPct = prior.length ? Math.round(((value - avg(prior)) / avg(prior)) * 1000) / 10 : 0;
          map[metric] = { value, unit: rs[0].unit, deltaPct };
        }
        if (!cancelled) setRealMetrics(map);
      }).catch(() => {})
    );
    return () => { cancelled = true; };
  }, [authUser]);

  // Error monitoring: global crash handlers + identity context. Errors are
  // operationally necessary telemetry (no health data) and are not consent-gated.
  useEffect(() => {
    const remove = installGlobalErrorHandlers();
    return remove;
  }, []);
  useEffect(() => {
    configureErrorReporter({ id: authUser?.id ?? null, email: authUser?.email ?? null });
  }, [authUser?.id, authUser?.email]);

  // Quasar Keel voice receptionist: feed REAL profile data to VoiceLayer, expose
  // the catalog, and log voice intents as behavioral events (consent-gated by
  // the tracker — no transcripts, intents only).
  useEffect(() => {
    const w = window as unknown as {
      __CUASARX_CATALOG?: unknown[];
      __CUASARX_COACH_CTX?: unknown;
      __VOICELAYER_SYMBIOSIS__?: unknown;
      VoiceLayer?: {
        setSignals?: (s: unknown) => void;
        setProfile?: (p: unknown) => void;
        setUser?: (id: string, p: unknown) => void;
        setKnowledge?: (k: unknown[]) => void;
        setCart?: (c: unknown) => void;
        setInventory?: (items: unknown[]) => void;
        setWeather?: (w: unknown) => void;
        setCalendar?: (c: unknown[]) => void;
        setWorkCalendar?: (c: unknown[]) => void;
        setToTake?: (t: unknown[]) => void;
        setToBuy?: (b: unknown[]) => void;
        symbiosis?: { handshake?: (spec: unknown) => unknown };
        briefing?: unknown;
      };
    };
    const catalog = MOCK_PRODUCTS.slice(0, 12).map((p) => ({
      id: p.id,
      name: { en: p.name },
      for: [] as string[],
      approved: p.riskLevel !== 'high',
      rx: p.riskLevel === 'high',
      price: p.price != null ? `$${p.price.toFixed(0)}` : undefined,
      provider: 'your clinician',
    }));
    w.__CUASARX_CATALOG = catalog;

    const organSystems = calculateOrganSystems(activeUser);
    const execReport = generateExecutiveReport(activeUser);
    const blood = activeUser.baselineDiagnostics?.bloodwork;
    const dexa = activeUser.baselineDiagnostics?.dexa;
    const diag = activeUser.baselineDiagnostics?.diagnostics;
    const biomarkerSummary = [
      blood?.apoB != null ? `ApoB ${blood.apoB} mg/dL` : null,
      blood?.hsCRP != null ? `hs-CRP ${blood.hsCRP} mg/L` : null,
      blood?.fastingGlucose != null ? `Fasting Glucose ${blood.fastingGlucose} mg/dL` : null,
      blood?.hba1c != null ? `HbA1c ${blood.hba1c}%` : null,
      blood?.fastingInsulin != null ? `Fasting Insulin ${blood.fastingInsulin} uIU/mL` : null,
      blood?.vitaminD != null ? `Vitamin D ${blood.vitaminD} ng/mL` : null,
      blood?.testosteroneTotal != null ? `Total Testosterone ${blood.testosteroneTotal} ng/dL` : null,
      blood?.cortisolAM != null ? `AM Cortisol ${blood.cortisolAM} ug/dL` : null,
      diag?.vo2Max != null ? `VO2 Max ${diag.vo2Max} mL/kg/min` : null,
      dexa?.bodyFatPercent != null ? `DEXA Body Fat ${dexa.bodyFatPercent}%` : null,
      dexa?.leanMassKg != null ? `Lean Mass ${dexa.leanMassKg} kg` : null,
      dexa?.visceralFatGrams != null ? `Visceral Fat ${dexa.visceralFatGrams}g` : null,
    ].filter(Boolean).join(', ');

    const nut = activeUser.nutrition;
    const tp = activeUser.trainingPlan;
    const profileDetails = {
      id: activeUser.id,
      name: activeUser.name,
      age: activeUser.age,
      gender: activeUser.gender,
      role: activeUser.role,
      lifestylePersona: activeUser.lifestylePersona,
      dataCompleteness: activeUser.dataCompleteness,
      loyaltyPoints: authProfile?.loyalty_points ?? 320,
      readiness: {
        score: activeUser.readiness.score,
        status: activeUser.readiness.status,
        message: activeUser.readiness.message,
        recommendation: activeUser.readiness.message,
      },
      metrics: {
        sleep: { current: activeUser.metrics.sleep.current, baseline: 8.0, trend: activeUser.metrics.sleep.trend },
        hrv: { current: activeUser.metrics.hrv.current, baseline: activeUser.metrics.hrv.trend[0] ?? 65, trend: activeUser.metrics.hrv.trend },
        rhr: { current: activeUser.metrics.rhr.current, trend: activeUser.metrics.rhr.trend },
        trainingLoad: { current: activeUser.metrics.trainingLoad },
      },
      trainingPlan: {
        type: tp?.type || 'Zone 2 Endurance',
        duration: tp?.duration || 45,
        intensity: tp?.intensity || 'Moderate',
        reason: tp?.reason || '',
        todaysWorkout: `${tp?.type || 'Zone 2 Endurance'} (${tp?.duration || 45} min)`,
        recommendedIntensity: tp?.intensity || 'Moderate',
        adjustmentReason: tp?.reason || '',
      },
      nutrition: {
        calories: nut?.calories,
        protein: nut?.protein,
        carbs: nut?.carbs,
        fat: nut?.fat,
        hydration: nut?.hydration,
        dailyCalorieTarget: nut?.calories?.target ?? 2600,
        macros: {
          proteinGrams: nut?.protein?.target ?? 180,
          carbsGrams: nut?.carbs?.target ?? 250,
          fatGrams: nut?.fat?.target ?? 80,
        },
        hydrationLiters: nut?.hydration?.target ?? 3.5,
        electrolyteNeeds: `${nut?.hydration?.current ?? 2.4}L logged today of ${nut?.hydration?.target ?? 3.5}L target`,
      },
      flags: activeUser.flags,
      biologicalAge: execReport.overallBiologicalAge,
      organHealth: organSystems.map((o) => ({
        name: o.name,
        biologicalAge: o.biologicalAge,
        chronologicalAgeDelta: o.chronologicalAgeDelta,
        biologicalReservePercent: o.biologicalReservePercent,
        status: o.status,
        clinicalSummary: o.clinicalSummary,
        priorityAction: o.priorityAction,
      })),
      biomarkers: biomarkerSummary || 'ApoB 62 mg/dL, hs-CRP 0.4 mg/L, Fasting Glucose 86 mg/dL, HbA1c 5.0%, Vitamin D 58 ng/mL, VO2 Max 54.2 mL/kg/min',
      biohackingProtocols: (activeUser.biohackingProtocols?.length ? activeUser.biohackingProtocols : BIOHACKING_PROTOCOLS.slice(0, 5)).map((b) => ({
        title: b.title,
        category: b.category,
        protocol: b.protocol,
        recommendedTiming: b.recommendedTiming,
        targetOutcome: b.targetOutcome,
      })),
      activeRegimen: activeUser.id === 'u1'
        ? [
            { name: 'Whey Protein Isolate (Grass-Fed)', dailyDosage: '30g post-workout', timing: 'Within 45 mins after exercise', daysRemaining: 12 },
            { name: 'Magnesium Glycinate (Elemental 400mg)', dailyDosage: '400mg', timing: '45 mins before bedtime', daysRemaining: 30 },
            { name: 'BPC-157 (Body Protection Compound)', dailyDosage: 'Clinician Consult Required', timing: 'Under Medical Guidance', daysRemaining: 10 },
            { name: 'Electrolyte Balance Complex', dailyDosage: '1 stick pack', timing: 'During endurance sessions', daysRemaining: 3 },
            { name: 'Omega-3 High-EPA 2000mg', dailyDosage: '2000mg', timing: 'Morning with food', daysRemaining: 4 },
          ]
        : activeUser.inventory.map((p) => ({
            name: p.name,
            dosage: p.dailyDosage || '1 serving',
            timing: p.timing || 'Daily',
            daysRemaining: p.daysRemaining,
            category: p.category,
          })),
    };

    w.__CUASARX_COACH_CTX = {
      profileSummary: `${activeUser.name}, age ${activeUser.age}, ${activeUser.role} (${activeUser.lifestylePersona}). Overall biological age ${execReport.overallBiologicalAge} (chronological ${activeUser.age}). Readiness ${activeUser.readiness.score}/100 (${activeUser.readiness.status}): ${activeUser.readiness.message} Sleep ${activeUser.metrics.sleep.current}h, HRV ${activeUser.metrics.hrv.current}ms, RHR ${activeUser.metrics.rhr.current}bpm, Training Load ${activeUser.metrics.trainingLoad}. Today's workout: ${profileDetails.trainingPlan.todaysWorkout} (${profileDetails.trainingPlan.recommendedIntensity}) — ${profileDetails.trainingPlan.adjustmentReason}. Nutrition target: ${profileDetails.nutrition.dailyCalorieTarget} kcal (${profileDetails.nutrition.macros.proteinGrams}g protein, ${profileDetails.nutrition.macros.carbsGrams}g carbs, ${profileDetails.nutrition.macros.fatGrams}g fat, ${profileDetails.nutrition.hydrationLiters}L hydration). Labs: ${profileDetails.biomarkers}.`,
      profileDetails,
      goals: Array.isArray(activeUser.goals) ? activeUser.goals : [],
      topProducts: MOCK_PRODUCTS.map((p) => ({
        name: p.name,
        category: p.category,
        price: p.price || 49,
        dosage: p.dailyDosage,
        reason: p.tailoredReason || p.description,
      })),
    };

    const H = 3600e3;
    const now = Date.now();
    const m = activeUser.metrics;

    // Derive pending to take & pending to buy from user's active inventory + cart
    const invToTake = activeUser.id === 'u1'
      ? [
          { name: 'Whey Protein Isolate (Grass-Fed) 30g post-workout', dose: '', time: 'Within 45 mins after exercise', taken: false },
          { name: 'Magnesium Glycinate (Elemental 400mg)', dose: '', time: '45 mins before bedtime', taken: false },
          { name: 'BPC-157 (Body Protection Compound) Clinician Consult Required', dose: '', time: 'Under Medical Guidance', taken: false },
        ]
      : activeUser.inventory.slice(0, 4).map((p) => ({
          name: p.name,
          dose: p.dailyDosage || '1 serving',
          time: p.timing || 'Today',
          taken: false,
        }));
    const invLow = activeUser.id === 'u1'
      ? [
          { name: 'BPC-157 (Body Protection Compound)', daysRemaining: 10, status: 'low' },
          { name: 'Electrolyte Balance Complex', daysRemaining: 3, status: 'low' },
          { name: 'Omega-3 High-EPA 2000mg', daysRemaining: 4, status: 'low' },
        ]
      : activeUser.inventory
          .filter((p) => p.daysRemaining !== undefined && p.daysRemaining <= 7)
          .map((p) => ({
            name: p.name,
            daysRemaining: p.daysRemaining,
            price: p.price ? `$${p.price.toFixed(0)}` : undefined,
            status: 'low',
          }));

    let latestBriefing: Awaited<ReturnType<typeof fetchBriefing>> = null;

    const applyToVoiceLayer = () => {
      try {
        const allServerCal = latestBriefing?.calendar?.length
          ? latestBriefing.calendar.map((e) => {
              const dt = new Date(e.time);
              const hh = String(dt.getHours()).padStart(2, '0');
              const mm = String(dt.getMinutes()).padStart(2, '0');
              return { title: e.title, time: `${hh}:${mm}`, location: e.location || '', kind: e.kind };
            })
          : [];

        // Calendar 1 (Primary Clinical & Appointments Calendar)
        const calEvents = activeUser.id === 'u1'
          ? [
              { title: 'Dr. Chen follow-up (labs review)', time: '09:00', location: 'Telehealth', kind: 'medical' },
            ]
          : allServerCal.filter((e) => e.kind === 'medical' || e.kind === 'appointment').length
          ? allServerCal.filter((e) => e.kind === 'medical' || e.kind === 'appointment')
          : [
              { title: 'Dr. Chen follow-up (labs & ApoB review)', time: '09:00', location: 'Telehealth', kind: 'medical' },
              { title: 'AOSM Organ Reserve & DEXA Check-in', time: '11:30', location: 'Keel Longevity Clinic', kind: 'medical' },
            ];

        // Calendar 2 (Work Meetings, Training Sessions & Business Trips / Travel Calendar)
        const workCalEvents = activeUser.id === 'u1'
          ? [
              { title: 'Weekly review — Keel Performance Board', time: '15:00', location: 'Zoom', kind: 'work' },
              {
                title: 'Zone 2 Active Recovery Ride — 45 min (Low (115-130 BPM))',
                time: '18:30',
                location: 'Key Biscayne loop',
                kind: 'training',
              },
            ]
          : [
              { title: 'Weekly review — Keel Performance Board', time: '15:00', location: 'Zoom', kind: 'work' },
              {
                title: `${tp?.type || 'Zone 2 Active Recovery Ride'} — ${tp?.duration || 45} min (${tp?.intensity || 'Moderate'})`,
                time: '18:30',
                location: 'Key Biscayne loop',
                kind: 'training',
              },
              {
                title: 'NYC Longevity Summit Flight & Circadian Jet-Lag Protocol',
                time: 'Tomorrow 07:30',
                location: 'MIA → JFK',
                kind: 'trip',
              },
            ];

        const medsToTake = activeUser.id === 'u1' ? invToTake : (latestBriefing?.meds?.length
          ? latestBriefing.meds.map((med) => ({
              name: med.name,
              dose: med.dose,
              time: med.time,
              taken: false,
            }))
          : invToTake);

        const medsLow = activeUser.id === 'u1' ? invLow : (latestBriefing?.meds?.length
          ? latestBriefing.meds
              .filter((med) => med.daysLeft <= 7)
              .map((med) => ({ name: med.name, daysRemaining: med.daysLeft, status: 'low' }))
          : invLow);

        const reorders = (latestBriefing?.reorderSoon ?? []).map((r) => ({
          name: r.name,
          reason: `auto-delivery ${r.due}`,
          status: 'refill',
        }));

        const mergedToBuy = [...medsLow];
        if (activeUser.id !== 'u1') {
          for (const r of reorders) {
            if (!mergedToBuy.some((x) => x.name.toLowerCase().includes(r.name.toLowerCase().split(' ')[0]))) {
              mergedToBuy.push(r as any);
            }
          }
        }

        const weatherPayload = activeUser.id === 'u1'
          ? {
              tempC: 27,
              tempF: 81,
              raining: true,
              dry: false,
              condition: { en: 'overcast', es: 'nublado' },
            }
          : latestBriefing?.weather
          ? {
              tempC: latestBriefing.weather.tempC,
              tempF: Math.round((latestBriefing.weather.tempC * 9) / 5 + 32),
              raining: latestBriefing.weather.rainProb >= 50 || /rain|drizzle|shower|storm/i.test(latestBriefing.weather.description),
              dry: latestBriefing.weather.rainProb < 40 && !/rain|drizzle|shower|storm/i.test(latestBriefing.weather.description),
              condition: { en: latestBriefing.weather.description, es: latestBriefing.weather.description },
            }
          : undefined;

        const profilePayload = {
          id: activeUser.id,
          name: activeUser.name,
          goals: Array.isArray(activeUser.goals) ? activeUser.goals : [],
          summary: (w.__CUASARX_COACH_CTX as any)?.profileSummary,
          ...profileDetails,
        };

        const knowledgePayload = [
          {
            heading: 'CuasarX Longevity By Keel Platform Overview',
            text: 'CuasarX Longevity By Keel is a clinical longevity marketplace, daily supplement regimen manager, organ system biological age modeling (AOSM) platform, longitudinal lab telemetry tracker, and bio-intelligence optimization portal.',
          },
          {
            heading: 'Organ Longevity & Biological Age Modeling (AOSM)',
            text: `Overall biological age for ${activeUser.name} is ${execReport.overallBiologicalAge} years vs chronological age ${activeUser.age}. Organ systems modeled: ${organSystems.map((o) => `${o.name} (bio-age ${o.biologicalAge}, ${o.biologicalReservePercent}% reserve, ${o.status})`).join('; ')}.`,
          },
          {
            heading: 'Lab Telemetry & Longitudinal Blood Biomarkers',
            text: `Recorded biomarkers for ${activeUser.name}: ${profileDetails.biomarkers}. Tracked longitudinally across 6-month blood draws alongside DEXA body composition and VO2 Max diagnostics.`,
          },
          {
            heading: 'Active Supplement Regimen & Refill Status',
            text: `Active daily stack for ${activeUser.name}: ${activeUser.inventory.map((p) => `${p.name} (${p.dailyDosage || '1 serving'}, ${p.timing || 'daily'}, ${p.daysRemaining ?? 14} days remaining)`).join('; ')}.`,
          },
          {
            heading: 'Work Calendar, Training Schedule & Upcoming Trips',
            text: `Primary clinical calendar for ${activeUser.name}: ${calEvents.map((c) => `${c.title} at ${c.time} (${c.location})`).join('; ')}. Work, training & travel calendar: ${workCalEvents.map((c) => `${c.title} at ${c.time} (${c.location}) [${c.kind}]`).join('; ')}.`,
          },
          {
            heading: 'Biohacking & Recovery Protocols',
            text: profileDetails.biohackingProtocols.map((b) => `${b.title} (${b.category}): ${b.protocol} — ${b.targetOutcome}`).join(' | '),
          },
          {
            heading: 'Telemedicine, Cold-Chain Shipping & Privacy Consent',
            text: 'CuasarX offers same-day clinician video consultations (Medical Review, Dietitian, Mental Health), temperature-controlled cold-chain shipping for peptides and NAD+ precursors, and granular HIPAA-aligned Privacy & Consent controls.',
          },
        ];

        const inventoryPayload = MOCK_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price ? `$${p.price.toFixed(2)}` : '$49.00',
          value: p.price || 49,
          category: p.category,
          description: p.description,
          inStock: true,
        }));

        const signalsPayload = {
          name: activeUser.name.split(' ')[0],
          metrics: {
            readiness: { value: activeUser.readiness.score, unit: '', label: { en: 'Readiness' }, at: now, source: 'CuasarX' },
            sleep_hours: { value: realMetrics?.sleep_hours?.value ?? m.sleep.current, prev: m.sleep.trend[m.sleep.trend.length - 2] ?? m.sleep.current, unit: 'h', label: { en: 'sleep' }, at: now - H, source: realMetrics?.sleep_hours ? 'health_readings (your device)' : 'CuasarX (demo data)' },
            hrv: { value: realMetrics?.hrv_ms?.value ?? m.hrv.current, prev: m.hrv.trend[m.hrv.trend.length - 2] ?? m.hrv.current, unit: 'ms', label: { en: 'HRV' }, at: now - H, source: realMetrics?.hrv_ms ? 'health_readings (your device)' : 'CuasarX (demo data)' },
            resting_hr: { value: realMetrics?.resting_hr?.value ?? m.rhr.current, unit: 'bpm', label: { en: 'resting HR' }, at: now - H, source: realMetrics?.resting_hr ? 'health_readings (your device)' : 'CuasarX (demo data)' },
            ...(realMetrics?.systolic && realMetrics?.diastolic ? {
              systolic: { value: realMetrics.systolic.value, unit: 'mmHg', label: { en: 'systolic BP' }, at: now - H, source: 'health_readings (your device)' },
              diastolic: { value: realMetrics.diastolic.value, unit: 'mmHg', label: { en: 'diastolic BP' }, at: now - H, source: 'health_readings (your device)' },
            } : {}),
          },
          calendar: calEvents,
          workCalendar: workCalEvents,
          toTake: medsToTake,
          toBuy: mergedToBuy,
          ...(weatherPayload ? { weather: weatherPayload } : {}),
          tasks: [],
          goals: Array.isArray(activeUser.goals) ? activeUser.goals.join(', ') : '',
          loyalty_points: authProfile?.loyalty_points ?? 320,
        };

        const customActions = [
          {
            id: 'open_organ_longevity',
            name: 'open_organ_longevity',
            label: 'Open Organ Longevity (AOSM)',
            phrases: ['open organ longevity', 'show organ longevity', 'go to organ longevity', 'show biological age model'],
            handler: () => {
              setActiveTab('profile');
              return `Opened Organ Longevity (AOSM) for ${activeUser.name} — overall biological age ${execReport.overallBiologicalAge} years.`;
            },
          },
          {
            id: 'open_lab_telemetry',
            name: 'open_lab_telemetry',
            label: 'Open Lab Telemetry & Biomarkers',
            phrases: ['open lab telemetry', 'show lab telemetry', 'show my bloodwork', 'open biomarkers'],
            handler: () => {
              setActiveTab('trends');
              return `Opened Lab Telemetry for ${activeUser.name}: ${profileDetails.biomarkers}.`;
            },
          },
          {
            id: 'open_biohacking',
            name: 'open_biohacking',
            label: 'Open Biohacking & Recovery Protocols',
            phrases: ['open biohacking', 'show biohacking protocols', 'open recovery protocols'],
            handler: () => {
              setActiveTab('profile');
              return `Opened Biohacking & Recovery Protocols for ${activeUser.name}.`;
            },
          },
          {
            id: 'open_regimen',
            name: 'open_regimen',
            label: 'Open Daily Supplement Regimen',
            phrases: ['open regimen', 'show my daily regimen', 'open my stack'],
            handler: () => {
              setActiveTab('supplements');
              return `Opened Daily Regimen for ${activeUser.name}.`;
            },
          },
          {
            id: 'open_marketplace',
            name: 'open_marketplace',
            label: 'Open Longevity Marketplace',
            phrases: ['open marketplace', 'go to marketplace', 'browse supplements'],
            handler: () => {
              setActiveTab('marketplace');
              return 'Opened the CuasarX Longevity Marketplace.';
            },
          },
          {
            id: 'open_ai_coach',
            name: 'open_ai_coach',
            label: 'Open CuasarX AI Longevity Coach Drawer',
            phrases: ['open coach drawer', 'open clinical coach', 'open chat panel'],
            handler: () => {
              setChatOpen(true);
              return 'Opened the CuasarX Clinical AI Coach panel.';
            },
          },
          {
            id: 'switch_athlete_persona',
            name: 'switch_athlete_persona',
            label: 'Switch Active Athlete / Client Persona',
            phrases: ['switch athlete', 'switch user', 'switch persona', 'next athlete'],
            handler: () => {
              const idx = SYNTHETIC_USERS.findIndex((u) => u.id === activeUser.id);
              const next = SYNTHETIC_USERS[(idx + 1) % SYNTHETIC_USERS.length];
              setActiveUser(next);
              return `Switched active profile to ${next.name} (${next.role}) with isolated VoiceLayer memory.`;
            },
          },
        ];

        // Universal Symbiotic Manifest (discoverable by VoiceLayer & any AI agent / developer)
        const symbiosisSpec = {
          appName: 'CuasarX Longevity By Keel',
          repo: 'John-wellness-',
          userId: activeUser.id,
          profile: profilePayload,
          calendar: calEvents,
          workCalendar: workCalEvents,
          toTake: medsToTake,
          toBuy: mergedToBuy,
          ...(weatherPayload ? { weather: weatherPayload } : {}),
          inventory: inventoryPayload,
          knowledge: knowledgePayload,
          signals: signalsPayload,
          actions: customActions,
        };

        w.__VOICELAYER_SYMBIOSIS__ = symbiosisSpec;

        if (w.VoiceLayer?.symbiosis?.handshake) {
          w.VoiceLayer.symbiosis.handshake(symbiosisSpec);
        } else {
          if (w.VoiceLayer?.setUser) w.VoiceLayer.setUser(activeUser.id, profilePayload);
          else w.VoiceLayer?.setProfile?.(profilePayload);
          w.VoiceLayer?.setKnowledge?.(knowledgePayload);
          w.VoiceLayer?.setSignals?.(signalsPayload);
          w.VoiceLayer?.setWorkCalendar?.(workCalEvents);
          w.VoiceLayer?.setInventory?.(inventoryPayload);
        }
      } catch { /* VoiceLayer not loaded yet */ }
    };

    applyToVoiceLayer();
    // Whenever a user signs in (e.g., Guest Mode demo@quasarkeel.com) or switches tabs, ensure the VoiceLayer assistant is visible and rescans the authenticated dashboard
    if (authUser) {
      try {
        (w.VoiceLayer as any)?.show?.();
        (w.VoiceLayer as any)?.rescan?.();
      } catch { /* ignore */ }
    }
    fetchBriefing().then((b) => {
      if (b) {
        latestBriefing = b;
        applyToVoiceLayer();
      }
    });
    const t = window.setTimeout(() => {
      applyToVoiceLayer();
      if (authUser) {
        try {
          (w.VoiceLayer as any)?.rescan?.();
        } catch { /* ignore */ }
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [activeUser, authProfile, authUser, activeTab, realMetrics]);

  // Keep VoiceLayer cart state synchronized with React cartItems
  useEffect(() => {
    const w = window as unknown as { VoiceLayer?: { setCart?: (c: unknown) => void } };
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalVal = cartItems.reduce((sum, item) => {
      const base = item.product.price || 49.0;
      const price = item.isSubscription ? base * 0.85 : base;
      return sum + price * item.quantity;
    }, 0);
    const syncCart = () => {
      try {
        w.VoiceLayer?.setCart?.({
          count,
          total: `$${totalVal.toFixed(0)}`,
          items: cartItems.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            qty: i.quantity,
            price: `$${(i.product.price || 49).toFixed(0)}`,
          })),
        });
      } catch { /* ignore */ }
    };
    syncCart();
    const t = window.setTimeout(syncCart, 1600);
    return () => window.clearTimeout(t);
  }, [cartItems]);

  // Voice intent analytics: 'voicelayer:command' events → behavioral log.
  useEffect(() => {
    const onCmd = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      tracker.current.track('voice_intent', { intent: detail.intent, language: detail.language }, activeTab);
    };
    const onComp = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      tracker.current.track('voice_companion', { type: detail.type }, activeTab);
    };
    window.addEventListener('voicelayer:command', onCmd);
    window.addEventListener('voicelayer:companion', onComp);
    return () => {
      window.removeEventListener('voicelayer:command', onCmd);
      window.removeEventListener('voicelayer:companion', onComp);
    };
  }, [activeTab]);

  // Page-view tracking on tab change.
  useEffect(() => {
    setTrackerPage(activeTab);
    tracker.current.track('page_view', { tab: activeTab }, activeTab);
  }, [activeTab]);

  // Daily briefing: when the voice receptionist wakes, refresh live briefing signals.
  // If VoiceLayer has the built-in Briefing engine (vl.briefing), Companion.begin()
  // speaks the full briefing natively without interruption.
  const speakBriefing = useRef(0);
  useEffect(() => {
    const onAwake = async (e: Event) => {
      const state = (e as CustomEvent).detail?.state;
      if (state && state !== 'awake') return;
      if (speakBriefing.current && Date.now() - speakBriefing.current < 120000) return;
      speakBriefing.current = Date.now();
      const vl = (window as unknown as { VoiceLayer?: { say?: (t: string) => void; briefing?: unknown } }).VoiceLayer;
      if (!vl?.say) return;
      let coords: { lat?: number; lon?: number } = {};
      try {
        const perm = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
        if (perm?.state === 'granted') {
          const pos = await new Promise<GeolocationPosition>((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 });
          });
          coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        }
      } catch { /* fall back to Miami */ }
      const b = await fetchBriefing(coords.lat, coords.lon);
      if (!b || vl.briefing) return;
      const first = activeUser.name.split(' ')[0];
      const text = composeBriefingText(b, first);
      setTimeout(() => { try { vl.say?.(text); } catch { /* panel closed mid-say */ } }, 4500);
    };
    window.addEventListener('voicelayer:glass', onAwake);
    return () => window.removeEventListener('voicelayer:glass', onAwake);
  }, [activeUser.name]);

  // Proactive coach nudge: exit intent toward the browser chrome, once per
  // session, only while the assistant is closed.
  useEffect(() => {
    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY > 8 || chatOpen) return;
      if (sessionStorage.getItem('cx_coach_nudged')) return;
      sessionStorage.setItem('cx_coach_nudged', '1');
      setCoachNudge(true);
      window.setTimeout(() => setCoachNudge(false), 12000);
    };
    document.addEventListener('mouseout', onExitIntent);
    return () => document.removeEventListener('mouseout', onExitIntent);
  }, [chatOpen]);

  const navigateToVitamins = () => {
    window.location.hash = 'vitamins';
    setActiveTab('marketplace');
    setMarketplaceDepartment('vitamins');
    setTimeout(() => {
      const el = document.getElementById('vitamins');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleUpdateUserData = (updatedFields: Partial<UserProfile>) => {
    setActiveUser(prev => ({
      ...prev,
      ...updatedFields
    }));
    // Persist the clinical intake / goals to the signed-in user's profile row.
    if (authUser && (updatedFields.baselineDiagnostics || updatedFields.goals)) {
      saveProfile({
        ...(updatedFields.baselineDiagnostics ? { baseline_diagnostics: updatedFields.baselineDiagnostics as unknown as Record<string, unknown> } : {}),
        ...(updatedFields.goals ? { goals: updatedFields.goals } : {}),
        ...(updatedFields.name ? { name: updatedFields.name } : {}),
      });
    }
  };

  const handleEvaluateGroupMessage = (text: string, senderName: string) => {
    setIncomingEvaluation({ text, senderName });
    setChatOpen(true);
  };

  const handleAddProductsToCart = (products: Product[], opts?: { isSubscription?: boolean }) => {
    tracker.current.track('add_to_cart', { products: products.map(p => p.id), subscription: opts?.isSubscription ?? false });
    setCartItems(prev => {
      const next = [...prev];
      products.forEach(p => {
        const existing = next.find(i => i.product.id === p.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          next.push({
            product: p,
            quantity: 1,
            isSubscription: opts?.isSubscription ?? false,
            frequency: '30'
          });
        }
      });
      return next;
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const handleToggleCartSubscription = (productId: string, isSub: boolean, freq: '30' | '45' | '60' | '90' = '30') => {
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, isSubscription: isSub, frequency: freq } : item));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => {
    const base = item.product.price || 49.00;
    const price = item.isSubscription ? base * 0.85 : base;
    return sum + (price * item.quantity);
  }, 0);

  // Auth gate: when the database is configured, a signed-in identity is required.
  if (dbReady && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101210] text-xs text-stone-400">
        Checking your session…
      </div>
    );
  }
  if (dbReady && !authUser) {
    return <AuthGate />;
  }

  const searchSuggestions = MOCK_PRODUCTS.filter(p => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  }).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-[#101210] text-[#f4f2ec] font-sans pb-16 md:pb-0">
      
      {/* ======================================================== */}
      {/* 0. SOFT EDITORIAL TOP RIBBON                             */}
      {/* ======================================================== */}
      <div className="bg-white/[0.04] text-stone-400 text-[11px] px-4 py-1.5 border-b border-white/10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-orange-400" /> Complimentary cold-chain courier on orders $99+
          </span>
          <span className="hidden lg:inline text-[#dedad0]">|</span>
          <span className="hidden lg:flex items-center gap-1 text-stone-400">
            <Clock className="w-3.5 h-3.5 text-amber-300" /> Order within <strong className="text-[#f4f2ec] font-semibold">2h 45m</strong> for next-morning delivery
          </span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span
            className={cn(
              'hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold',
              catalogSource === 'database' && 'bg-orange-500/10 text-orange-300 border-orange-500/25',
              catalogSource === 'demo' && 'bg-amber-500/10 text-amber-300 border-amber-500/25',
              catalogSource === 'checking' && 'bg-white/[0.05] text-stone-400 border-white/10'
            )}
            role="status"
          >
            <Database className="w-3 h-3" aria-hidden="true" />
            {catalogSource === 'database' ? 'Database connected' : catalogSource === 'demo' ? 'Demo data' : 'Checking…'}
          </span>
          {authUser ? (
            <span className="text-stone-400 flex items-center gap-2">
              <span className="hidden sm:inline" title={authEmail ?? undefined}>
                <strong className="text-[#f4f2ec] font-semibold">{activeUser.name}</strong>
                <span className="text-[10px] text-stone-500"> · {authEmail}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="text-[10px] text-[#f4f2ec] hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </span>
          ) : (
            <span className="text-stone-400">
              Active Persona: <strong className="text-[#f4f2ec] font-semibold">{activeUser.name}</strong>
            </span>
          )}
          <button
            onClick={() => openVideoVisit('patient', activeUser)}
            className="text-[10px] text-[#f4f2ec] hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Video className="w-3 h-3" aria-hidden="true" /> Video Visit
          </button>
          <button
            data-voicelayer-open="1"
            onClick={() => (window as unknown as { VoiceLayer?: { show?: () => void } }).VoiceLayer?.show?.()}
            className="text-[10px] text-orange-300 hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Voice Assistant
          </button>
          <button
            onClick={() => setChatOpen(true)}
            className="text-[10px] text-[#f4f2ec] hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Wellness Assistant
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MINIMALIST MAIN HEADER (With CuasarX Logo)            */}
      {/* ======================================================== */}
      <header className="bg-white/[0.06] sticky top-0 z-50 border-b border-white/10">
        
        {/* Main Row */}
        <div className="max-w-[1540px] mx-auto px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 md:gap-5">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#f4f2ec] hover:bg-white/[0.05] rounded-lg flex items-center transition-colors"
            title="Open Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Pro Designed Vector Brand Logo: CuasarX Longevity By Keel */}
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="cursor-pointer p-1 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <CuasarLogo size="sm" showSubtitle={true} />
          </div>

          {/* Soft Minimalist Search Bar */}
          <div className="flex-1 max-w-2xl mx-1 md:mx-4 relative">
            <div className="flex items-center h-9 rounded-lg overflow-hidden bg-[#101210] hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-orange-500 border border-white/10 transition-all">
              
              {/* Category Dropdown */}
              <div className="hidden sm:flex items-center text-xs px-2.5 h-full border-r border-white/10 text-stone-400 font-medium select-none">
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none text-xs font-medium text-[#f4f2ec] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Categories</option>
                  <option value="Vitamins">Micronutrients</option>
                  <option value="Executive">Executive Stacks</option>
                  <option value="Supplements">Nootropics</option>
                  <option value="Diagnostics">Lab Panels</option>
                  <option value="Peptides">Peptides (Rx)</option>
                </select>
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search compounds, clinical panels, sleep protocols, peptides..."
                className="w-full h-full px-3 text-xs text-[#f4f2ec] placeholder-[#9c978d] bg-transparent focus:outline-none"
              />

              {/* Mic for Voice HPI */}
              <button 
                onClick={() => setChatOpen(true)}
                title="Voice Symptom Intake"
                className="px-2.5 h-full text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.06] flex items-center transition-colors border-l border-white/10 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Search button */}
              <button 
                onClick={() => {
                  setActiveTab('marketplace');
                  if (searchCategory !== 'All') setMarketplaceDepartment(searchCategory.toLowerCase());
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white px-3.5 h-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Autocomplete Dropdown */}
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white/[0.06] text-[#f4f2ec] rounded-xl shadow-lg border border-white/10 p-1.5 z-50 divide-y divide-[#f4f2ec]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 px-2 py-1">
                  Matching Protocols &amp; Compounds
                </div>
                {searchSuggestions.map(item => (
                  <div
                    key={item.id}
                    onMouseDown={() => {
                      setSearchQuery(item.name);
                      setActiveTab('marketplace');
                    }}
                    className="p-2 hover:bg-white/[0.05] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-[#f4f2ec] block">{item.name}</span>
                      <span className="text-[11px] text-stone-400">{item.category} • Grade {item.evidenceData?.grade || 'A'}</span>
                    </div>
                    <span className="font-semibold text-[#f4f2ec]">${(item.price || 45.00).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Persona Switcher */}
          <div className="relative group p-1 hover:bg-white/[0.05] rounded-lg cursor-pointer transition-colors flex-shrink-0">
            <div className="text-left leading-tight">
              <span className="text-[10px] text-stone-500 block font-medium">Profile</span>
              <span className="text-xs font-semibold text-[#f4f2ec] flex items-center gap-1">
                {activeUser.name.split(' ')[0]} <ChevronDown className="w-3 h-3 text-stone-500 group-hover:rotate-180 transition-transform" />
              </span>
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white/[0.06] text-[#f4f2ec] rounded-xl shadow-xl border border-white/10 p-2.5 hidden group-hover:block z-50 animate-in fade-in">
              <div className="border-b border-white/[0.08] pb-2 mb-2">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Active Member</span>
                <span className="text-xs font-bold text-[#f4f2ec] block">{activeUser.name}</span>
                <span className="text-[11px] text-orange-400 font-medium">{activeUser.lifestylePersona}</span>
              </div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Switch Persona:</span>
              <div className="space-y-0.5">
                {SYNTHETIC_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={cn(
                      "w-full text-left p-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                      activeUser.id === u.id ? "bg-white/[0.04] text-[#f4f2ec] font-semibold" : "hover:bg-white/[0.05] text-stone-400"
                    )}
                  >
                    <span>{u.name}</span>
                    {activeUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-white/[0.08]">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-full py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold text-center block hover:bg-orange-500 transition-colors"
                >
                  Manage Biomarker Profile
                </button>
              </div>
            </div>
          </div>

          {/* Subscriptions / Regimen Shortcut */}
          <div 
            onClick={() => setActiveTab('supplements')}
            className="hidden md:flex flex-col p-1 hover:bg-white/[0.05] rounded-lg cursor-pointer transition-colors flex-shrink-0 text-left leading-tight"
          >
            <span className="text-[10px] text-stone-500 font-medium">Daily</span>
            <span className="text-xs font-semibold text-[#f4f2ec] flex items-center gap-1">
              <Repeat className="w-3 h-3 text-stone-400" /> Regimens
            </span>
          </div>

          {/* Cart Button */}
          <button 
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg cursor-pointer transition-all flex-shrink-0"
            title="View Cart"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold">{totalCartCount}</span>
            <span className="hidden sm:inline text-xs font-mono text-[#dedad0]">(${totalCartAmount.toFixed(0)})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. SUB-NAVIGATION DEPARTMENT ROW                         */}
        {/* ======================================================== */}
        <div className="bg-white/[0.05] border-t border-white/10 text-xs px-3 md:px-6 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            
            <button 
              onClick={() => { setActiveTab('marketplace'); setMarketplaceDepartment('all'); }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'marketplace' && marketplaceDepartment === 'all' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Featured Curation</span>
            </button>

            <button 
              onClick={navigateToVitamins}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'marketplace' && marketplaceDepartment === 'vitamins' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Micronutrients (#vitamins)</span>
            </button>

            <button 
              onClick={() => setActiveTab('supplements')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'supplements' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Daily Regimens</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'trends'
                  ? "bg-orange-600 text-white font-semibold shadow-xs"
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Lab Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              aria-current={activeTab === 'research' ? 'page' : undefined}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'research'
                  ? "bg-orange-600 text-white font-semibold shadow-xs"
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <FlaskConical className="w-3 h-3" aria-hidden="true" />
              <span>Research Base</span>
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'profile' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Organ Longevity (AOSM)</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'community'
                  ? "bg-orange-600 text-white font-semibold shadow-xs"
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Peer Network</span>
            </button>

            <button
              onClick={() => setActiveTab('consent')}
              aria-current={activeTab === 'consent' ? 'page' : undefined}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer",
                activeTab === 'consent'
                  ? "bg-orange-600 text-white font-semibold shadow-xs"
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>Privacy &amp; Consent</span>
            </button>

            <button 
              onClick={() => setActiveTab('admin')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer",
                activeTab === 'admin' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Physician Portal</span>
            </button>

            <button 
              onClick={() => setActiveTab('operator')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer",
                activeTab === 'operator' 
                  ? "bg-orange-600 text-white font-semibold shadow-xs" 
                  : "text-stone-400 hover:text-[#f4f2ec] hover:bg-white/[0.04]"
              )}
            >
              <span>Insights</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="px-2 py-1 text-red-400 hover:bg-red-500/10 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Safety Guide</span>
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.05] text-[#f4f2ec] border border-white/15 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3 h-3 text-stone-400" />
              <span>CuasarX AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Intent banner — rule-based, consent-gated personalization signal */}
      <IntentBanner />

      {/* ======================================================== */}
      {/* 3. MOBILE MENU DRAWER                                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white/[0.06] z-50 shadow-xl flex flex-col overflow-y-auto border-r border-white/10"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/[0.08]">
                <CuasarLogo size="sm" showSubtitle={true} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-stone-400 hover:text-[#f4f2ec]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 text-xs text-[#f4f2ec] flex-1">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-stone-500 mb-2">
                    Departments
                  </h4>
                  <div className="space-y-0.5">
                    {[
                      { tab: 'marketplace', dept: 'all', label: "Featured Curation" },
                      { tab: 'marketplace', dept: 'vitamins', label: 'Micronutrients (#vitamins)' },
                      { tab: 'supplements', dept: undefined, label: 'Daily Regimens & Auto-Refills' },
                      { tab: 'trends', dept: undefined, label: 'Biomarker Telemetry' },
                      { tab: 'research', dept: undefined, label: 'Performance Research Base' },
                      { tab: 'profile', dept: undefined, label: 'Organ Health (AOSM) & DNA' },
                      { tab: 'community', dept: undefined, label: 'Peer Network' },
                      { tab: 'consent', dept: undefined, label: 'Privacy & Consent' },
                      { tab: 'admin', dept: undefined, label: 'Physician Clinical Monitor' },
                      { tab: 'operator', dept: undefined, label: 'Telemetry Health' },
                    ].map(item => {
                      const active = activeTab === item.tab && (item.dept === undefined || marketplaceDepartment === item.dept);
                      return (
                        <button
                          key={`${item.tab}-${item.dept || 'default'}`}
                          onClick={() => { 
                            setActiveTab(item.tab as any); 
                            if (item.dept) setMarketplaceDepartment(item.dept);
                            setMobileMenuOpen(false); 
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors font-medium",
                            active ? "bg-white/[0.04] text-[#f4f2ec] font-semibold" : "hover:bg-white/[0.05] text-stone-400"
                          )}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); openVideoVisit('patient', activeUser); }}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" aria-hidden="true" /> Start Video Visit
                  </button>
                </div>

                <div className="pt-3 border-t border-white/[0.08]">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-stone-500 mb-2">
                    Switch Persona
                  </h4>
                  <div className="space-y-1">
                    {SYNTHETIC_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setActiveUser(u); setMobileMenuOpen(false); }}
                        className={cn(
                          "w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between",
                          activeUser.id === u.id ? "bg-orange-600 text-white font-semibold" : "hover:bg-white/[0.05] text-stone-400"
                        )}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] opacity-70">{u.lifestylePersona.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT CONTAINER                                */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-[1540px] w-full mx-auto p-3 sm:p-5 md:p-8">
        {activeTab === 'marketplace' && (
          <Marketplace 
            user={activeUser} 
            initialDepartment={marketplaceDepartment}
            searchQuery={searchQuery}
            onAddToCart={handleAddProductsToCart}
            onOpenCart={() => setCartOpen(true)}
            onBuyNow={(prod) => {
              handleAddProductsToCart([prod]);
              setCartOpen(true);
            }}
          />
        )}
        {activeTab === 'supplements' && <SupplementManager user={activeUser} onAddToCart={handleAddProductsToCart} />}
        {activeTab === 'trends' && (
          <BiomarkerTrends
            user={activeUser}
            onAddToCart={handleAddProductsToCart}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'research' && <PerformanceResearch />}
        {activeTab === 'profile' && (
          <UserProfileTab
            user={activeUser}
            onUpdateUser={handleUpdateUserData}
            onAddToCart={handleAddProductsToCart}
            onNavigateToMarketplace={() => {
              setActiveTab('marketplace');
              setMarketplaceDepartment('diagnostics');
            }}
          />
        )}
        {activeTab === 'community' && <CommunityConnect user={activeUser} onEvaluateWithAi={handleEvaluateGroupMessage} />}
        {activeTab === 'consent' && (
          <ConsentCenter
            user={activeUser}
            onStartVideoVisit={() => openVideoVisit('patient', activeUser)}
          />
        )}
        {activeTab === 'admin' && (
          <AdminPatientMonitor
            currentUser={activeUser}
            onStartVisit={(patient) => openVideoVisit('clinician', patient)}
            onNavigateToConsent={() => setActiveTab('consent')}
          />
        )}
        {activeTab === 'operator' && <InsightsDashboard />}
      </main>

      {/* ======================================================== */}
      {/* 5. SLIDE-OVER CART DRAWER                                */}
      {/* ======================================================== */}
      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onToggleSubscription={handleToggleCartSubscription}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        user={activeUser}
      />

      {/* ======================================================== */}
      {/* 6. FLOATING ASSISTANT BUTTON (Desktop)                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={() => setChatOpen(true)}
            className={cn(
              'hidden md:flex fixed right-6 bottom-6 z-40 text-white px-4 py-2.5 rounded-full shadow-lg items-center gap-2 text-xs font-semibold transition-all cursor-pointer',
              coachNudge
                ? 'bg-orange-500 hover:bg-orange-600 ring-2 ring-orange-500 ring-offset-2 animate-pulse'
                : 'bg-orange-600 hover:bg-orange-500'
            )}
          >
            <Mic className={cn('w-3.5 h-3.5', coachNudge ? 'text-white' : 'text-[#dedad0]')} aria-hidden="true" />
            <span>{coachNudge ? 'Quasar Keel has a suggestion — chat now' : 'CuasarX AI'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. PHI CHAT ASSISTANT SIDEBAR                           */}
      {/* ======================================================== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[420px] bg-white/[0.06] z-50 shadow-2xl border-l border-white/10 overflow-hidden"
          >
            <PhiChat 
              user={activeUser} 
              incomingEvaluation={incomingEvaluation}
              onClose={() => setChatOpen(false)} 
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 8. SAFETY / EMERGENCY PROTOCOL MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/[0.06] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-[#f4f2ec]">
                    Clinical Safety &amp; Emergency Protocol
                  </h3>
                </div>
                <button 
                  onClick={() => setEmergencyModalOpen(false)}
                  className="p-1 text-stone-500 hover:text-[#f4f2ec] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl text-xs text-red-400 space-y-1">
                <p className="font-semibold">
                  For acute symptoms including severe chest pain, shortness of breath, sudden numbness, or loss of consciousness:
                </p>
                <p className="text-[11px] opacity-90">
                  Call emergency dispatch (911 in the US) immediately. Digital wellness telemetry is not a substitute for emergency medicine.
                </p>
              </div>

              <div className="space-y-2 text-xs text-stone-400">
                <span className="font-semibold text-[#f4f2ec] block">Emergency Resources:</span>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-white/[0.05] rounded-lg border border-white/10 flex items-center justify-between">
                    <span>Immediate Emergency Dispatch:</span>
                    <a href="tel:911" className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center gap-1 text-xs">
                      <PhoneCall className="w-3 h-3" /> Call 911
                    </a>
                  </div>
                  <div className="p-2.5 bg-white/[0.05] rounded-lg border border-white/10 flex items-center justify-between">
                    <span>24/7 Clinical Triage Line:</span>
                    <span className="font-mono font-semibold text-[#f4f2ec]">1-800-BIO-HACK</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close Safety Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 10. TELEMEDICINE VIDEO VISIT OVERLAY                      */}
      {/* ======================================================== */}
      {videoVisit && (
        <TelemedicineVisit
          mode={videoVisit.mode}
          patient={videoVisit.patient}
          onClose={() => setVideoVisit(null)}
        />
      )}

      {/* ======================================================== */}
      {/* 11. FIRST-RUN PRIVACY & CONSENT GATE                      */}
      {/* ======================================================== */}
      <FirstRunConsent />

      {/* ======================================================== */}
      {/* 12. TESTER FEEDBACK BUTTON (bottom-left, never overlaps   */}
      {/*     the AI orb in the bottom-right)                       */}
      {/* ======================================================== */}
      <FeedbackButton page={activeTab} />

      {/* ======================================================== */}
      {/* 9. MOBILE BOTTOM NAVIGATION DOCK                         */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/[0.06] border-t border-white/10 z-40 flex items-center justify-around text-stone-400 px-2">
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'marketplace' ? "text-[#f4f2ec] font-bold" : "hover:text-[#f4f2ec]"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Curate</span>
        </button>

        <button 
          onClick={() => setActiveTab('supplements')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'supplements' ? "text-[#f4f2ec] font-bold" : "hover:text-[#f4f2ec]"
          )}
        >
          <Pill className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Regimens</span>
        </button>

        <button 
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-orange-600 text-white w-10 h-10 rounded-full shadow-md active:scale-95 transition-transform"
          title="Wellness Assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setActiveTab('trends')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'trends' ? "text-[#f4f2ec] font-bold" : "hover:text-[#f4f2ec]"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Labs</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
            activeTab === 'profile' ? "text-[#f4f2ec] font-bold" : "hover:text-[#f4f2ec]"
          )}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}

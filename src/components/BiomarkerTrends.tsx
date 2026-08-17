import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Product } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine
} from 'recharts';
import { 
  Activity, 
  Heart, 
  HeartPulse, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Award, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Gauge,
  Moon,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  TestTubes,
  Dna,
  FileSpreadsheet,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Droplets,
  Layers,
  ShoppingCart,
  Check,
  PackagePlus,
  ArrowRight,
  Pill,
  Sparkle
} from 'lucide-react';
import { cn } from '../lib/utils';

// 6-Month Longitudinal Blood Panel Dataset (Monthly Draw Telemetry)
interface BloodMarkerDataPoint {
  month: string; // e.g. "Mar '26"
  timestamp: string;
  drawDate: string;
  // Markers
  vitaminD: number; // 25-OH Vitamin D (ng/mL) - Target: 50-80 ng/mL
  hsCRP: number; // High-Sensitivity C-Reactive Protein (mg/L) - Target: <0.5 mg/L
  apoB: number; // Apolipoprotein B (mg/dL) - Target: <70 mg/dL
  fastingInsulin: number; // uIU/mL - Target: <5.0 uIU/mL
  fastingGlucose: number; // mg/dL - Target: 75-90 mg/dL
  cortisolAM: number; // mcg/dL - Target: 10-18 mcg/dL
  freeTestosterone: number; // pg/mL - Target: 15-25 pg/mL
  omega3Index: number; // % - Target: >8.0%
  // Clinical protocol tag implemented in that cycle
  protocolMilestone?: string;
  milestoneDetail?: string;
}

const SIX_MONTH_BLOOD_PANELS: Record<string, BloodMarkerDataPoint[]> = {
  default: [
    {
      month: "Mar '26",
      timestamp: "2026-03-15",
      drawDate: "Mar 15, 2026",
      vitaminD: 34.2,
      hsCRP: 2.45,
      apoB: 104,
      fastingInsulin: 7.8,
      fastingGlucose: 101,
      cortisolAM: 22.4,
      freeTestosterone: 13.1,
      omega3Index: 5.2,
      protocolMilestone: "Baseline Diagnostics",
      milestoneDetail: "Initial comprehensive blood panel identified elevated hs-CRP (2.45 mg/L) and sub-optimal Vitamin D (34 ng/mL)."
    },
    {
      month: "Apr '26",
      timestamp: "2026-04-14",
      drawDate: "Apr 14, 2026",
      vitaminD: 42.8,
      hsCRP: 1.85,
      apoB: 96,
      fastingInsulin: 6.9,
      fastingGlucose: 96,
      cortisolAM: 19.8,
      freeTestosterone: 14.5,
      omega3Index: 6.1,
      protocolMilestone: "D3 + K2 & EPA Protocol",
      milestoneDetail: "Started 5,000 IU Liposomal Vitamin D3 + 100mcg K2 and 2g High-EPA Triglyceride Fish Oil."
    },
    {
      month: "May '26",
      timestamp: "2026-05-16",
      drawDate: "May 16, 2026",
      vitaminD: 53.5,
      hsCRP: 1.20,
      apoB: 88,
      fastingInsulin: 5.8,
      fastingGlucose: 93,
      cortisolAM: 17.2,
      freeTestosterone: 16.2,
      omega3Index: 7.0,
      protocolMilestone: "Zone 2 & Finnish Sauna",
      milestoneDetail: "Added 150min/wk Zone 2 endurance and 3x/wk 85°C heat shock protocol."
    },
    {
      month: "Jun '26",
      timestamp: "2026-06-18",
      drawDate: "Jun 18, 2026",
      vitaminD: 64.1,
      hsCRP: 0.78,
      apoB: 81,
      fastingInsulin: 5.1,
      fastingGlucose: 89,
      cortisolAM: 15.6,
      freeTestosterone: 18.0,
      omega3Index: 8.1,
      protocolMilestone: "Curcumin & Sulforaphane",
      milestoneDetail: "Introduced standardized bio-optimized curcuminoids to suppress inflammatory cascade."
    },
    {
      month: "Jul '26",
      timestamp: "2026-07-15",
      drawDate: "Jul 15, 2026",
      vitaminD: 69.4,
      hsCRP: 0.42,
      apoB: 74,
      fastingInsulin: 4.4,
      fastingGlucose: 86,
      cortisolAM: 14.1,
      freeTestosterone: 19.4,
      omega3Index: 8.9,
      protocolMilestone: "Magnesium & Circadian Anchor",
      milestoneDetail: "Elemental Magnesium Glycinate 400mg + 10k Lux sunrise anchoring."
    },
    {
      month: "Aug '26",
      timestamp: "2026-08-12",
      drawDate: "Aug 12, 2026",
      vitaminD: 72.8,
      hsCRP: 0.28,
      apoB: 68,
      fastingInsulin: 3.9,
      fastingGlucose: 84,
      cortisolAM: 13.0,
      freeTestosterone: 20.8,
      omega3Index: 9.4,
      protocolMilestone: "Current Golden Zone",
      milestoneDetail: "All primary longevity markers inside optimal biohacker target tier."
    }
  ]
};

type MarkerKey = 'vitaminD' | 'hsCRP' | 'apoB' | 'fastingInsulin' | 'fastingGlucose' | 'cortisolAM' | 'omega3Index';

interface TargetedSupplement {
  id: string;
  name: string;
  category: 'Nutrition' | 'Recovery' | 'Hydration' | 'Nootropic' | 'Hormonal Support' | 'Executive Stack';
  dosage: string;
  price: number;
  clinicalPurpose: string;
  targetedDeficiency: string;
  evidenceGrade: 'A' | 'B';
}

interface MarkerMetadata {
  key: MarkerKey;
  name: string;
  category: 'Inflammation & Immunity' | 'Cardiometabolic' | 'Hormones & Stress' | 'Nutritional Longevity';
  unit: string;
  optimalRange: string;
  minOptimal: number;
  maxOptimal: number;
  color: string;
  gradientId: string;
  direction: 'higher_is_better' | 'lower_is_better' | 'range_bound';
  description: string;
  clinicalImpact: string;
  targetedSupplements: TargetedSupplement[];
}

const MARKER_DEFINITIONS: Record<MarkerKey, MarkerMetadata> = {
  vitaminD: {
    key: 'vitaminD',
    name: '25-OH Vitamin D',
    category: 'Nutritional Longevity',
    unit: 'ng/mL',
    optimalRange: '50 - 80 ng/mL',
    minOptimal: 50,
    maxOptimal: 80,
    color: '#10b981', // Emerald
    gradientId: 'vitDGrad',
    direction: 'higher_is_better',
    description: 'Secosteroid hormone regulating >1,000 genomic pathways, immune cytokine modulation, bone mineral density, and testosterone synthesis.',
    clinicalImpact: '+113% improvement over 6 months from 34.2 to 72.8 ng/mL (Optimal Longevity Tier).',
    targetedSupplements: [
      {
        id: 'supp-vit-d3-k2',
        name: 'Liposomal Vitamin D3 (5000 IU) + K2 (MK-7 100mcg)',
        category: 'Nutrition',
        dosage: '1 softgel daily with breakfast',
        price: 32.00,
        clinicalPurpose: 'Restores serum 25-OH D3 and channels calcium directly into bone matrix rather than arterial walls.',
        targetedDeficiency: 'Sub-optimal serum Vitamin D level',
        evidenceGrade: 'A'
      }
    ]
  },
  hsCRP: {
    key: 'hsCRP',
    name: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
    category: 'Inflammation & Immunity',
    unit: 'mg/L',
    optimalRange: '< 0.50 mg/L',
    minOptimal: 0,
    maxOptimal: 0.50,
    color: '#f43f5e', // Rose
    gradientId: 'hsCrpGrad',
    direction: 'lower_is_better',
    description: 'Acute-phase hepatic reactant and gold-standard systemic arterial and vascular inflammatory marker.',
    clinicalImpact: '88.5% reduction in systemic vascular inflammation (2.45 down to 0.28 mg/L).',
    targetedSupplements: [
      {
        id: 'supp-curcumin-phytosome',
        name: 'Bio-Optimized Curcumin Phytosome (Longvida® 500mg)',
        category: 'Recovery',
        dosage: '1 capsule twice daily with meals',
        price: 38.00,
        clinicalPurpose: 'Crosses blood-brain barrier and suppresses NF-kB / COX-2 inflammatory signaling cascades.',
        targetedDeficiency: 'Systemic inflammatory & arterial burden',
        evidenceGrade: 'A'
      }
    ]
  },
  apoB: {
    key: 'apoB',
    name: 'Apolipoprotein B (ApoB)',
    category: 'Cardiometabolic',
    unit: 'mg/dL',
    optimalRange: '< 70 mg/dL',
    minOptimal: 40,
    maxOptimal: 70,
    color: '#6366f1', // Indigo
    gradientId: 'apoBGrad',
    direction: 'lower_is_better',
    description: 'Direct measurement of all atherogenic lipoprotein particles (LDL, VLDL, IDL, Lp(a)). Far superior to standard LDL-C.',
    clinicalImpact: '34.6% reduction in atherogenic particle count (104 down to 68 mg/dL).',
    targetedSupplements: [
      {
        id: 'supp-citrus-bergamot',
        name: 'Clinical Citrus Bergamot BPF (500mg)',
        category: 'Recovery',
        dosage: '1 capsule morning and night before meals',
        price: 39.00,
        clinicalPurpose: 'Activates AMPK and HMGR inhibition to clear atherogenic ApoB and small dense LDL particles.',
        targetedDeficiency: 'Atherogenic lipoprotein burden',
        evidenceGrade: 'A'
      }
    ]
  },
  fastingInsulin: {
    key: 'fastingInsulin',
    name: 'Fasting Insulin (HOMA-IR Sensitivity)',
    category: 'Cardiometabolic',
    unit: 'uIU/mL',
    optimalRange: '2.0 - 5.0 uIU/mL',
    minOptimal: 2.0,
    maxOptimal: 5.0,
    color: '#06b6d4', // Cyan
    gradientId: 'insulinGrad',
    direction: 'lower_is_better',
    description: 'Key biomarker of peripheral metabolic flexibility, glycogen storage kinetics, and visceral fat accumulation.',
    clinicalImpact: '50% reduction in basal insulin drive (7.8 down to 3.9 uIU/mL).',
    targetedSupplements: [
      {
        id: 'supp-berberine-phytosome',
        name: 'Dihydroberberine (Glucovantage® 100mg) + Chromium',
        category: 'Nutrition',
        dosage: '1 capsule 15 mins before highest-carb meal',
        price: 44.00,
        clinicalPurpose: '5x higher bioavailability than standard berberine to accelerate GLUT-4 glucose receptor translocation.',
        targetedDeficiency: 'Basal insulin resistance & glucose spikes',
        evidenceGrade: 'A'
      }
    ]
  },
  fastingGlucose: {
    key: 'fastingGlucose',
    name: 'Fasting Blood Glucose',
    category: 'Cardiometabolic',
    unit: 'mg/dL',
    optimalRange: '75 - 90 mg/dL',
    minOptimal: 75,
    maxOptimal: 90,
    color: '#3b82f6', // Blue
    gradientId: 'glucoseGrad',
    direction: 'lower_is_better',
    description: 'Morning serum glucose level indicating baseline hepatic gluconeogenesis and insulin-mediated glucose clearance.',
    clinicalImpact: 'Stabilized in optimal non-diabetic longevity tier (101 down to 84 mg/dL).',
    targetedSupplements: [
      {
        id: 'supp-r-ala',
        name: 'R-Alpha Lipoic Acid (Stabilized Na-RALA 300mg)',
        category: 'Recovery',
        dosage: '1 capsule upon waking on empty stomach',
        price: 36.00,
        clinicalPurpose: 'Potent mitochondrial antioxidant that stimulates insulin signaling and limits hepatic glucose output.',
        targetedDeficiency: 'Fasting morning glycemic elevation',
        evidenceGrade: 'A'
      }
    ]
  },
  cortisolAM: {
    key: 'cortisolAM',
    name: 'Morning Serum Cortisol (8:00 AM)',
    category: 'Hormones & Stress',
    unit: 'mcg/dL',
    optimalRange: '10.0 - 16.0 mcg/dL',
    minOptimal: 10.0,
    maxOptimal: 16.0,
    color: '#f59e0b', // Amber
    gradientId: 'cortisolGrad',
    direction: 'lower_is_better',
    description: 'Adrenal glucocorticoid hormone reflecting hypothalamic-pituitary-adrenal (HPA) axis tone and chronic stress burden.',
    clinicalImpact: '42% decrease in morning HPA hyperactivity (22.4 down to 13.0 mcg/dL).',
    targetedSupplements: [
      {
        id: 'p2',
        name: 'Magnesium Glycinate (Elemental 400mg)',
        category: 'Recovery',
        dosage: '400mg 45 mins before bedtime',
        price: 25.00,
        clinicalPurpose: 'NMDA receptor blocker & GABA enhancer to dampen nocturnal sympathetic drive and lower morning cortisol.',
        targetedDeficiency: 'HPA axis hyperactivity & high cortisol',
        evidenceGrade: 'A'
      },
      {
        id: 'p5',
        name: 'Executive Nootropic Peak Stack (L-Theanine + Alpha-GPC)',
        category: 'Executive Stack',
        dosage: '2 capsules with morning espresso',
        price: 65.00,
        clinicalPurpose: 'Attenuates acute cortisol spikes under executive decision-making stress without sedation.',
        targetedDeficiency: 'High stress & cognitive fatigue',
        evidenceGrade: 'A'
      }
    ]
  },
  omega3Index: {
    key: 'omega3Index',
    name: 'Omega-3 Red Blood Cell Index',
    category: 'Nutritional Longevity',
    unit: '%',
    optimalRange: '> 8.0%',
    minOptimal: 8.0,
    maxOptimal: 14.0,
    color: '#14b8a6', // Teal
    gradientId: 'omegaGrad',
    direction: 'higher_is_better',
    description: 'Erythrocyte membrane EPA+DHA content correlated with cellular resilience, heart rhythm stability, and cognitive aging velocity.',
    clinicalImpact: '+80.7% membrane saturation increase from 5.2% to 9.4%.',
    targetedSupplements: [
      {
        id: 'supp-omega3-triglyceride',
        name: 'High-EPA Triglyceride Omega-3 (2000mg EPA / 800mg DHA)',
        category: 'Nutrition',
        dosage: '2 softgels with evening meal',
        price: 48.00,
        clinicalPurpose: 'Reconfigures cell phospholipid membranes to accelerate cytokine clearance and boost membrane fluidity.',
        targetedDeficiency: 'Low Omega-3 RBC membrane index (<8%)',
        evidenceGrade: 'A'
      }
    ]
  }
};

// Historical Trend Data Generators for wearable daily view
const GENERATE_DAILY_TRENDS = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Cyclical & organic variation
    const baseHrv = 68 + Math.sin(i * 0.4) * 12 + (Math.random() * 8 - 4);
    const baseRhr = 52 - Math.sin(i * 0.3) * 4 + (Math.random() * 4 - 2);
    const sys = 118 + Math.cos(i * 0.5) * 6 + (Math.random() * 4 - 2);
    const dia = 76 + Math.cos(i * 0.5) * 4 + (Math.random() * 3 - 1.5);
    const glucose = 92 + Math.sin(i * 0.8) * 10 + (Math.random() * 6 - 3);
    const sleepQuality = Math.min(100, Math.max(60, Math.round(82 + Math.sin(i * 0.6) * 12 + (Math.random() * 6 - 3))));
    const deepSleepMins = Math.round(75 + Math.sin(i * 0.5) * 18 + (Math.random() * 10 - 5));
    const readiness = Math.min(100, Math.max(50, Math.round(78 + Math.sin(i * 0.35) * 15 + (Math.random() * 6 - 3))));

    data.push({
      date: dateStr,
      fullDate: d.toISOString().split('T')[0],
      hrv: Math.round(baseHrv),
      rhr: Math.round(baseRhr),
      systolic: Math.round(sys),
      diastolic: Math.round(dia),
      glucose: Math.round(glucose),
      sleepQuality,
      deepSleepMins,
      readiness
    });
  }
  return data;
};

type MetricView = 'blood_panel_progress' | 'hrv_rhr' | 'blood_pressure' | 'glucose' | 'sleep' | 'readiness';

interface BiomarkerTrendsProps {
  user: UserProfile;
  onAddToCart?: (products: Product[]) => void;
  onNavigateToTab?: (tab: 'marketplace' | 'supplements') => void;
}

export function BiomarkerTrends({ user, onAddToCart, onNavigateToTab }: BiomarkerTrendsProps) {
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);
  const [activeMetricView, setActiveMetricView] = useState<MetricView>('blood_panel_progress');
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<MarkerKey>('vitaminD');
  const [compareSecondaryKey, setCompareSecondaryKey] = useState<MarkerKey | 'none'>('hsCRP');
  const [addedSuppIds, setAddedSuppIds] = useState<string[]>([]);
  const [batchAddedSuccess, setBatchAddedSuccess] = useState(false);

  const trendData = useMemo(() => GENERATE_DAILY_TRENDS(timeframe), [timeframe]);
  const bloodData = SIX_MONTH_BLOOD_PANELS.default;

  // Selected marker metadata
  const primaryMarker = MARKER_DEFINITIONS[selectedMarkerKey];
  const secondaryMarker = compareSecondaryKey !== 'none' ? MARKER_DEFINITIONS[compareSecondaryKey] : null;

  // Calculate 6-month deltas for primary marker
  const firstPoint = bloodData[0];
  const latestPoint = bloodData[bloodData.length - 1];
  const startVal = firstPoint[selectedMarkerKey];
  const endVal = latestPoint[selectedMarkerKey];
  const delta = +(endVal - startVal).toFixed(2);
  const deltaPercent = +(((endVal - startVal) / startVal) * 100).toFixed(1);

  const isImproved = primaryMarker.direction === 'higher_is_better' 
    ? delta > 0 
    : primaryMarker.direction === 'lower_is_better' 
      ? delta < 0 
      : Math.abs(endVal - (primaryMarker.minOptimal + primaryMarker.maxOptimal) / 2) < Math.abs(startVal - (primaryMarker.minOptimal + primaryMarker.maxOptimal) / 2);

  // Compute dynamic deficiency list based on baseline/latest trends
  // Identifies markers that require targeted supplementation
  const deficiencyList = useMemo(() => {
    const deficiencies: {
      marker: MarkerMetadata;
      currentValue: number;
      baselineValue: number;
      status: 'deficiency_resolved_maintenance' | 'active_optimizing' | 'suboptimal_baseline';
      supplements: TargetedSupplement[];
    }[] = [];

    // Evaluate all clinical markers
    Object.values(MARKER_DEFINITIONS).forEach(m => {
      const cur = latestPoint[m.key];
      const base = firstPoint[m.key];
      
      let status: 'deficiency_resolved_maintenance' | 'active_optimizing' | 'suboptimal_baseline' = 'active_optimizing';
      if (m.direction === 'higher_is_better' && cur >= m.minOptimal) {
        status = 'deficiency_resolved_maintenance';
      } else if (m.direction === 'lower_is_better' && cur <= m.maxOptimal) {
        status = 'deficiency_resolved_maintenance';
      }

      deficiencies.push({
        marker: m,
        currentValue: cur,
        baselineValue: base,
        status,
        supplements: m.targetedSupplements
      });
    });

    return deficiencies;
  }, [latestPoint, firstPoint]);

  // Aggregate all unique targeted supplements for the deficiency markers shown in the trend chart
  const allTargetedSupplements = useMemo(() => {
    const suppMap = new Map<string, TargetedSupplement>();
    deficiencyList.forEach(d => {
      d.supplements.forEach(s => {
        if (!suppMap.has(s.id)) {
          suppMap.set(s.id, s);
        }
      });
    });
    return Array.from(suppMap.values());
  }, [deficiencyList]);

  const totalBundlePrice = allTargetedSupplements.reduce((sum, s) => sum + s.price, 0);
  const bundleDiscountedPrice = (totalBundlePrice * 0.85).toFixed(2); // 15% Smart Regimen discount

  // "One-Click Add All" handler
  const handleOneClickAddAll = () => {
    const productsToAdd: Product[] = allTargetedSupplements.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.clinicalPurpose,
      status: 'recommended',
      riskLevel: 'low',
      price: s.price,
      dailyDosage: s.dosage,
      tailoredReason: `Auto-recommended for ${s.targetedDeficiency} identified in 6-month blood panel.`,
      evidenceData: {
        confidenceScore: 95,
        grade: s.evidenceGrade,
        referenceTitle: `Clinical efficacy of ${s.name.split('(')[0]} on biomarker optimization`,
        journal: 'Journal of Longevity & Clinical Nutrition',
        year: 2024,
        clinicalRationale: s.clinicalPurpose
      }
    }));

    if (onAddToCart) {
      onAddToCart(productsToAdd);
    }
    
    setAddedSuppIds(allTargetedSupplements.map(s => s.id));
    setBatchAddedSuccess(true);
    setTimeout(() => setBatchAddedSuccess(false), 4000);
  };

  const handleAddSingleSupplement = (supp: TargetedSupplement) => {
    const product: Product = {
      id: supp.id,
      name: supp.name,
      category: supp.category,
      description: supp.clinicalPurpose,
      status: 'recommended',
      riskLevel: 'low',
      price: supp.price,
      dailyDosage: supp.dosage,
      tailoredReason: `Targeted protocol for ${supp.targetedDeficiency}`,
      evidenceData: {
        confidenceScore: 95,
        grade: supp.evidenceGrade,
        referenceTitle: `Clinical targeted intervention: ${supp.name}`,
        journal: 'Nutritional Endocrinology & Metabolism',
        year: 2024,
        clinicalRationale: supp.clinicalPurpose
      }
    };

    if (onAddToCart) {
      onAddToCart([product]);
    }
    setAddedSuppIds(prev => prev.includes(supp.id) ? prev : [...prev, supp.id]);
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. HEADER & OVERVIEW BAR                                 */}
      {/* ======================================================== */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white text-[#181716] p-6 sm:p-7 rounded-2xl border border-[#ebe7df] space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="badge-clinical">
                <TestTubes className="w-3 h-3 text-[#344a37]" /> Longitudinal Clinical Lab Telemetry
              </span>
              <span className="badge-neutral font-mono">
                6-Month Serial Blood Panels
              </span>
              <span className="badge-neutral">
                Member: {user.name}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#181716] tracking-tight flex items-center gap-2 font-serif-title">
              Biomarker Progress &amp; Serial Lab Tracking
            </h2>
            <p className="text-xs text-[#5c5851] max-w-3xl leading-relaxed">
              Longitudinal tracking of clinical blood biomarkers (Vitamin D, hs-CRP inflammatory burden, ApoB atherogenic particles, Fasting Insulin) paired with continuous wearable telemetry.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="bg-[#faf9f6] px-3.5 py-2.5 rounded-xl border border-[#ebe7df] flex items-center gap-2.5 self-start lg:self-auto">
            <div className="w-7 h-7 rounded-lg bg-[#f1f5f2] text-[#2b4530] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8a857b] uppercase font-semibold block">Biomarker Health Score</span>
              <span className="text-xs font-bold text-[#181716]">96 / 100 (Optimal Tier)</span>
            </div>
          </div>
        </div>

        {/* Highlight Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f4f2ec]">
          <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-semibold text-[#8a857b] tracking-wider flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#344a37]" /> 25-OH Vitamin D
            </span>
            <div className="text-lg font-bold text-[#181716] mt-0.5 flex items-baseline gap-1">
              72.8 <span className="text-[11px] text-[#8a857b] font-normal">ng/mL</span>
              <span className="badge-clinical text-[10px] ml-1">
                +113%
              </span>
            </div>
            <p className="text-[10px] text-[#8a857b] mt-0.5">Target: 50-80 ng/mL • Optimal</p>
          </div>

          <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-semibold text-[#8a857b] tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#785328]" /> hs-CRP Inflammation
            </span>
            <div className="text-lg font-bold text-[#181716] mt-0.5 flex items-baseline gap-1">
              0.28 <span className="text-[11px] text-[#8a857b] font-normal">mg/L</span>
              <span className="badge-clinical text-[10px] ml-1">
                -88%
              </span>
            </div>
            <p className="text-[10px] text-[#8a857b] mt-0.5">Target: &lt;0.5 mg/L • Ultra-Low</p>
          </div>

          <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-semibold text-[#8a857b] tracking-wider flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#344a37]" /> Atherogenic ApoB
            </span>
            <div className="text-lg font-bold text-[#181716] mt-0.5 flex items-baseline gap-1">
              68 <span className="text-[11px] text-[#8a857b] font-normal">mg/dL</span>
              <span className="badge-clinical text-[10px] ml-1">
                -35%
              </span>
            </div>
            <p className="text-[10px] text-[#8a857b] mt-0.5">Target: &lt;70 mg/dL • Optimal</p>
          </div>

          <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-semibold text-[#8a857b] tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#5c5851]" /> Fasting Insulin
            </span>
            <div className="text-lg font-bold text-[#181716] mt-0.5 flex items-baseline gap-1">
              3.9 <span className="text-[11px] text-[#8a857b] font-normal">uIU/mL</span>
              <span className="badge-clinical text-[10px] ml-1">
                -50%
              </span>
            </div>
            <p className="text-[10px] text-[#8a857b] mt-0.5">Target: 2.0-5.0 uIU/mL</p>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 2. PRIMARY VIEW SELECTOR TABS                            */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveMetricView('blood_panel_progress')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'blood_panel_progress'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <TestTubes className="w-3.5 h-3.5" /> 
            <span>Serial Blood Panels (6-Month)</span>
          </button>

          <button
            onClick={() => setActiveMetricView('hrv_rhr')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'hrv_rhr'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <Activity className="w-3.5 h-3.5" /> HRV &amp; Resting HR
          </button>

          <button
            onClick={() => setActiveMetricView('blood_pressure')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'blood_pressure'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <HeartPulse className="w-3.5 h-3.5" /> Blood Pressure
          </button>

          <button
            onClick={() => setActiveMetricView('glucose')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'glucose'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <Zap className="w-3.5 h-3.5" /> Fasting CGM
          </button>

          <button
            onClick={() => setActiveMetricView('sleep')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'sleep'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <Moon className="w-3.5 h-3.5" /> Sleep Architecture
          </button>

          <button
            onClick={() => setActiveMetricView('readiness')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetricView === 'readiness'
                ? "bg-[#181716] text-white"
                : "bg-white text-[#5c5851] border border-[#ebe7df] hover:bg-[#faf9f6]"
            )}
          >
            <Gauge className="w-3.5 h-3.5" /> Daily Readiness
          </button>
        </div>

        {/* Timeframe selector for daily wearable views */}
        {activeMetricView !== 'blood_panel_progress' && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2" />
            <button
              onClick={() => setTimeframe(7)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-bold transition-all",
                timeframe === 7 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              7d
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-bold transition-all",
                timeframe === 30 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              30d
            </button>
            <button
              onClick={() => setTimeframe(90)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-bold transition-all",
                timeframe === 90 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              90d
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN DYNAMIC METRIC VIEW WITH TRANSITIONS             */}
      {/* ======================================================== */}
      <AnimatePresence mode="wait">
        {/* 3. MAIN BIOMARKER PROGRESS CARD (6-MONTH BLOOD PANELS) */}
        {activeMetricView === 'blood_panel_progress' && (
          <motion.div 
            key="blood_panel_progress"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* DYNAMIC BIOMARKER DEFICIENCY & ONE-CLICK ADD ALL ACTION BANNER */}
            <div className="bg-[#f5f3ec] text-[#181716] p-5 sm:p-6 rounded-2xl border border-[#e8e4db] space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-clinical">
                      <Sparkles className="w-3 h-3 text-[#344a37]" /> Targeted Clinical Protocol
                    </span>
                    <span className="badge-neutral font-mono">
                      {allTargetedSupplements.length} Targeted Bio-Compounds Identified
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#181716] tracking-tight">
                    Targeted Regimen Stack Based on Your 6-Month Bloodwork
                  </h3>
                  <p className="text-xs text-[#5c5851] leading-relaxed">
                    Synthesized from your historical Vitamin D, hs-CRP inflammation, ApoB, and morning cortisol curves. Loads optimal dosages into your regimen cart in one click.
                  </p>
                </div>

                {/* One-Click Add All Action Box */}
                <div className="bg-white p-4 rounded-xl border border-[#ebe7df] flex flex-col justify-between gap-2.5 w-full lg:w-76 flex-shrink-0">
                  <div className="flex items-baseline justify-between border-b border-[#f4f2ec] pb-2">
                    <div>
                      <span className="text-xs text-[#6e6960] block">Complete Protocol ({allTargetedSupplements.length} items):</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[#181716]">${bundleDiscountedPrice}</span>
                        <span className="text-xs text-[#8a857b] line-through font-mono">${totalBundlePrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#2b4530] bg-[#f1f5f2] px-2 py-0.5 rounded">
                      Save 15%
                    </span>
                  </div>

                  <button
                    onClick={handleOneClickAddAll}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
                      batchAddedSuccess
                        ? "bg-[#2b4530] text-white"
                        : "btn-ink"
                    )}
                  >
                    {batchAddedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        All {allTargetedSupplements.length} Formulations Added!
                      </>
                    ) : (
                      <>
                        <PackagePlus className="w-3.5 h-3.5" />
                        Add All to Regimen Cart
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-[#8a857b]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#344a37]" /> Cold-Chain Direct
                    </span>
                    {onNavigateToTab && (
                      <button 
                        onClick={() => onNavigateToTab('supplements')}
                        className="text-[#181716] hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                      >
                        View Regimen <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Targeted Supplement Quick Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3 border-t border-[#e8e4db]">
                {allTargetedSupplements.slice(0, 4).map(s => {
                  const isItemAdded = addedSuppIds.includes(s.id);
                  return (
                    <div 
                      key={s.id}
                      className="p-2.5 rounded-lg bg-white border border-[#ebe7df] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="overflow-hidden">
                        <span className="font-semibold text-[#181716] block truncate text-[11px]">{s.name}</span>
                        <span className="text-[10px] text-[#6e6960] truncate block">{s.targetedDeficiency}</span>
                      </div>
                      <button
                        onClick={() => handleAddSingleSupplement(s)}
                        className={cn(
                          "p-1.5 rounded-md flex-shrink-0 transition-colors text-[10px] font-semibold flex items-center gap-1 cursor-pointer",
                          isItemAdded ? "bg-[#2b4530] text-white" : "btn-stone"
                        )}
                        title={`Add ${s.name}`}
                      >
                        {isItemAdded ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Interactive Biomarker Selector Ribbon */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <TestTubes className="w-4 h-4 text-emerald-600" />
                    Select Blood Panel Biomarker for Longitudinal Trajectory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select any clinical biomarker to visualize serial monthly draws, reference ranges, and protocol intervention milestones.
                  </p>
                </div>

                {/* Secondary Comparison Dropdown */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 font-bold">Compare vs:</span>
                  <select
                    value={compareSecondaryKey}
                    onChange={(e) => setCompareSecondaryKey(e.target.value as MarkerKey | 'none')}
                    aria-label="Compare with secondary biomarker"
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="none">No Secondary Marker</option>
                    {Object.values(MARKER_DEFINITIONS).filter(m => m.key !== selectedMarkerKey).map(m => (
                      <option key={m.key} value={m.key}>{m.name} ({m.unit})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marker Chips with Staggered Entrance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                {Object.values(MARKER_DEFINITIONS).map((marker, idx) => {
                  const isSelected = selectedMarkerKey === marker.key;
                  const mStart = bloodData[0][marker.key];
                  const mEnd = bloodData[bloodData.length - 1][marker.key];
                  const mDeltaPct = +(((mEnd - mStart) / mStart) * 100).toFixed(0);
                  const mIsGood = marker.direction === 'higher_is_better' ? mEnd > mStart : mEnd < mStart;

                  return (
                    <motion.button
                      key={marker.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.12 + idx * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMarkerKey(marker.key)}
                      className={cn(
                        "p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between",
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                      )}
                    >
                      <div>
                        <span className={cn(
                          "text-[9px] uppercase font-extrabold tracking-wider block line-clamp-1",
                          isSelected ? "text-slate-300" : "text-slate-500"
                        )}>
                          {marker.category.split(' ')[0]}
                        </span>
                        <span className="text-xs font-black block line-clamp-1 mt-0.5">
                          {marker.name.split('(')[0]}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className={cn(
                          "text-sm font-black",
                          isSelected ? "text-emerald-400" : "text-slate-900"
                        )}>
                          {mEnd} <span className="text-[10px] font-normal opacity-80">{marker.unit}</span>
                        </span>
                        <span className={cn(
                          "text-[10px] font-extrabold px-1 rounded",
                          mIsGood 
                            ? (isSelected ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-100 text-emerald-800")
                            : (isSelected ? "bg-rose-500/30 text-rose-300" : "bg-rose-100 text-rose-800")
                        )}>
                          {mDeltaPct > 0 ? `+${mDeltaPct}%` : `${mDeltaPct}%`}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

          {/* Core Recharts Visualization Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Chart Header Info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-white text-[10px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: primaryMarker.color }}>
                    Primary Target
                  </span>
                  <h3 className="font-black text-lg text-slate-900">
                    {primaryMarker.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    ({primaryMarker.unit})
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {primaryMarker.description}
                </p>
              </div>

              {/* 6-Month Delta Summary Badge */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 self-start lg:self-auto">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Baseline (Mar '26)</span>
                  <span className="text-sm font-black text-slate-700">{startVal} {primaryMarker.unit}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Current (Aug '26)</span>
                  <span className="text-base font-black text-slate-950">{endVal} {primaryMarker.unit}</span>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1",
                  isImproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                )}>
                  {delta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{delta > 0 ? `+${delta}` : delta} ({deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`})</span>
                </div>
              </div>
            </div>

            {/* Recharts Area + Line Chart */}
            <div className="h-88 sm:h-96 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bloodData} margin={{ top: 15, right: secondaryMarker ? 35 : 15, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryMarker.color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={primaryMarker.color} stopOpacity={0.0}/>
                    </linearGradient>
                    {secondaryMarker && (
                      <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={secondaryMarker.color} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={secondaryMarker.color} stopOpacity={0.0}/>
                      </linearGradient>
                    )}
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    tick={{ fontWeight: 600 }}
                  />

                  {/* Primary Y-Axis */}
                  <YAxis 
                    yAxisId="primary" 
                    stroke={primaryMarker.color} 
                    fontSize={12} 
                    tickLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontWeight: 700 }}
                    unit={` ${primaryMarker.unit}`}
                  />

                  {/* Secondary Y-Axis (Conditional) */}
                  {secondaryMarker && (
                    <YAxis 
                      yAxisId="secondary" 
                      orientation="right" 
                      stroke={secondaryMarker.color} 
                      fontSize={12} 
                      tickLine={false}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tick={{ fontWeight: 700 }}
                      unit={` ${secondaryMarker.unit}`}
                    />
                  )}

                  {/* Optimal Zone Shading */}
                  <ReferenceLine 
                    yAxisId="primary" 
                    y={primaryMarker.maxOptimal} 
                    stroke={primaryMarker.color} 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: `Optimal Threshold (${primaryMarker.maxOptimal} ${primaryMarker.unit})`, 
                      fill: primaryMarker.color, 
                      fontSize: 10,
                      fontWeight: 'bold',
                      position: 'top' 
                    }} 
                  />

                  {primaryMarker.minOptimal > 0 && (
                    <ReferenceLine 
                      yAxisId="primary" 
                      y={primaryMarker.minOptimal} 
                      stroke={primaryMarker.color} 
                      strokeDasharray="4 4" 
                      label={{ 
                        value: `Target Floor (${primaryMarker.minOptimal} ${primaryMarker.unit})`, 
                        fill: primaryMarker.color, 
                        fontSize: 10,
                        fontWeight: 'bold',
                        position: 'bottom' 
                      }} 
                    />
                  )}

                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '16px', 
                      color: '#fff', 
                      fontSize: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ fontWeight: 'black', color: '#38bdf8', marginBottom: '4px' }}
                    formatter={(value: any, name: any) => {
                      return [`${value} ${primaryMarker.unit}`, name];
                    }}
                  />

                  <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px', fontSize: '12px', fontWeight: 'bold' }} />

                  {/* Primary Area & Curve */}
                  <Area 
                    yAxisId="primary"
                    type="monotone" 
                    dataKey={selectedMarkerKey} 
                    name={`${primaryMarker.name} (${primaryMarker.unit})`} 
                    stroke={primaryMarker.color} 
                    strokeWidth={3.5} 
                    fillOpacity={1} 
                    fill="url(#primaryGradient)" 
                    dot={{ r: 5, fill: primaryMarker.color, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8, stroke: primaryMarker.color, strokeWidth: 3, fill: '#ffffff' }}
                  />

                  {/* Secondary Line (if selected) */}
                  {secondaryMarker && (
                    <Line 
                      yAxisId="secondary"
                      type="monotone" 
                      dataKey={compareSecondaryKey} 
                      name={`${secondaryMarker.name} (${secondaryMarker.unit})`} 
                      stroke={secondaryMarker.color} 
                      strokeWidth={2.5} 
                      dot={{ r: 4, fill: secondaryMarker.color, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Targeted Supplement Protocol for the Selected Marker */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Targeted Compound Protocol for {primaryMarker.name}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Evidence Grade {primaryMarker.targetedSupplements[0]?.evidenceGrade || 'A'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {primaryMarker.targetedSupplements.map(supp => {
                  const isItemAdded = addedSuppIds.includes(supp.id);
                  return (
                    <div 
                      key={supp.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-xs text-slate-900 leading-snug">{supp.name}</span>
                          <span className="font-black text-xs text-emerald-600">${supp.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{supp.clinicalPurpose}</p>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">Dosage: {supp.dosage}</span>
                      </div>

                      <button
                        onClick={() => handleAddSingleSupplement(supp)}
                        className={cn(
                          "w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm",
                          isItemAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        )}
                      >
                        {isItemAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                            Add Supplement to Regimen (${supp.price.toFixed(2)})
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Protocol Milestones Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Intervention Milestones &amp; Protocol Correlation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bloodData.map((d) => (
                  <div key={d.month} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 space-y-1.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {d.month} • {d.protocolMilestone}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{d.drawDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {d.milestoneDetail}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-bold border-t border-slate-200/60">
                      <span className="text-slate-500">{primaryMarker.name.split(' ')[0]}:</span>
                      <span className="text-slate-950 font-black">{d[selectedMarkerKey]} {primaryMarker.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical MD Insights Box */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-[#1e293b] text-white rounded-2xl border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                    CuasarX Laboratory Telemetry Rationale
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded border border-slate-700">
                    Verified Bio-Algorithm
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong>Clinical Impact:</strong> {primaryMarker.clinicalImpact} Target reference bracket is <strong>{primaryMarker.optimalRange}</strong>. The combination of daily liposomal nutrient delivery with cold-chain verified purity has sustained positive longitudinal velocity across 6 consecutive monthly draws.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 4. CHART CONTAINER: HRV & RESTING HR                     */}
      {/* ======================================================== */}
      {activeMetricView === 'hrv_rhr' && (
        <motion.div 
          key="hrv_rhr"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Autonomic Nervous System: HRV vs Resting Heart Rate</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                rMSSD Heart Rate Variability (green area) inversely correlated with Resting Heart Rate (purple line).
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> HRV (ms)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> RHR (bpm)
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={[40, 100]} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} domain={[35, 75]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                />
                <ReferenceLine yAxisId="left" y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target Baseline (60ms)', fill: '#d97706', fontSize: 10 }} />
                <Area yAxisId="left" type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#hrvGradient)" />
                <Line yAxisId="right" type="monotone" dataKey="rhr" name="Resting HR (bpm)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">CuasarX AI Medical Correlation Analysis:</span>
              <p className="leading-relaxed">
                Your HRV spikes (+14ms) directly follow days with Finnish Sauna contrast protocols and Magnesium Glycinate compliance. A drop in RHR to 48 bpm indicates supercompensation from your Zone 2 training block.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 5. CHART CONTAINER: BLOOD PRESSURE                       */}
      {/* ======================================================== */}
      {activeMetricView === 'blood_pressure' && (
        <motion.div 
          key="blood_pressure"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Systolic &amp; Diastolic Blood Pressure Dynamics</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Omron Connect paired telemetry tracking arterial pressure trends over {timeframe} days.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Systolic (mmHg)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span> Diastolic (mmHg)
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 140]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Systolic Limit (120)', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Diastolic Limit (80)', fill: '#f59e0b', fontSize: 10 }} />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 6. CHART CONTAINER: CONTINUOUS GLUCOSE                   */}
      {/* ======================================================== */}
      {activeMetricView === 'glucose' && (
        <motion.div 
          key="glucose"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">CGM Continuous Fasting Glucose Stability</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dexcom G7 telemetry showing glycemic variability and time in target range (70-110 mg/dL).
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#06b6d4" fontSize={11} domain={[60, 140]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fasting Threshold (100 mg/dL)', fill: '#d97706', fontSize: 10 }} />
                <Area type="monotone" dataKey="glucose" name="Glucose (mg/dL)" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#glucoseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 7. CHART CONTAINER: SLEEP & DEEP RECOVERY                */}
      {/* ======================================================== */}
      {activeMetricView === 'sleep' && (
        <motion.div 
          key="sleep"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Moon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Sleep Quality &amp; Deep Stage Duration</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Oura Ring Gen 3 bedtime stage telemetry tracking sleep score vs deep sleep minutes.
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#a855f7" fontSize={11} domain={[0, 120]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="deepSleepMins" name="Deep Sleep (mins)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 8. CHART CONTAINER: DAILY READINESS                      */}
      {/* ======================================================== */}
      {activeMetricView === 'readiness' && (
        <motion.div 
          key="readiness"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Gauge className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Daily Readiness Score Correlation</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calculated multi-variable readiness engine combining WHOOP Strain, Oura Sleep, and HRV.
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#f59e0b" fontSize={11} domain={[40, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="readiness" name="Readiness Score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#readinessGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

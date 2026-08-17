export type ReadinessStatus = 'optimal' | 'good' | 'warning' | 'low';

export type ThemeMode = 'smart_marketplace' | 'titanium' | 'obsidian' | 'nordic' | 'solar';

export type EvidenceData = {
  confidenceScore: number; // e.g. 94%
  grade: 'A' | 'B' | 'C';
  referenceTitle: string;
  journal: string;
  year: number;
  doiOrUrl?: string;
  clinicalRationale: string;
};

export type Product = {
  id: string;
  name: string;
  category: 'Nutrition' | 'Recovery' | 'Peptide' | 'Hydration' | 'Nootropic' | 'Hormonal Support' | 'Executive Stack' | 'Diagnostics' | 'Knowledge Card' | 'Training Program';
  description: string;
  status: 'recommended' | 'owned' | 'running_low' | 'consider_later' | 'not_recommended' | 'clinical_review';
  riskLevel: 'low' | 'medium' | 'high';
  daysRemaining?: number;
  unitsInStock?: number;
  dailyUsageRate?: number; // e.g. 1 per day
  price?: number;
  evidence?: string;
  evidenceData?: EvidenceData;
  dailyDosage?: string;
  timing?: string;
  tailoredReason?: string; // Why this specific product matches ChatGPT/Gemini history or bio-persona
  hasHumanStudies?: boolean;
  humanStudiesNote?: string;
  potentialSideBenefits?: string[];
  potentialSideEffects?: string[];
  medicalDisclaimer?: string;
};

export type BiohackingCard = {
  id: string;
  title: string;
  category: 'Circadian' | 'Thermal' | 'Cognitive' | 'Cellular' | 'Respiratory' | 'Brain Training' | 'Physical Optimization';
  protocol: string;
  evidenceGrade: 'A (Strong Clinical)' | 'B (Moderate Evidence)' | 'C (Emerging/Experimental)';
  recommendedTiming: string;
  targetOutcome: string;
  integratedWithTraining: string;
};

export type DailyCheckInLog = {
  id: string;
  date: string;
  symptoms: string[];
  supplementAdherence: 'full' | 'partial' | 'missed';
  energyScore: number; // 1-10
  stressScore: number; // 1-10
  moodEmoji?: string;
  moodLabel?: string;
  notes?: string;
};

export type PeerMatch = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  compatibilityScore: number; // e.g. 96%
  biohackingStyle: string;
  preferredWorkout: string;
  coWorkingAvailable: boolean;
  sharedSupplements: string[];
  onlineStatus: 'active' | 'away' | 'in_session';
};

export type BaselineDiagnostics = {
  dexa?: {
    bodyFatPercent: number;
    leanMassKg: number;
    visceralFatGrams: number;
    boneDensityZScore: number;
  };
  bloodwork?: {
    apoB: number; // mg/dL
    hsCRP: number; // mg/L
    fastingGlucose: number; // mg/dL
    hba1c: number; // %
    fastingInsulin: number; // uIU/mL
    vitaminD: number; // ng/mL
    testosteroneFree: number; // pg/mL
    cortisolAM: number; // mcg/dL
    altAst: string; // e.g. "22 / 24 U/L"
    tsh: number; // uIU/mL
  };
  diagnostics?: {
    ekgFindings: string;
    vo2Max: number; // mL/kg/min
    rmrKcal: number; // kcal/day
  };
  anthropometrics?: {
    weightKg: number;
    heightCm: number;
    rhrBpm: number;
    hrvMs: number;
    sleepEfficiencyPercent: number;
  };
  medicalHistory?: {
    chronicConditions: string[];
    medicationsPeptides: string[];
    familyHistory: string[];
    allergies: string[];
  };
  sportsProfile?: {
    primaryDiscipline: string;
    weeklyHours: number;
    zone2WeeklyHours: number;
    activeInjuries: string[];
  };
  psychologicalProfile?: {
    perceivedStressScore: number; // 1-10
    burnoutIndex: 'Low' | 'Moderate' | 'Severe';
    cognitiveFatigueScore: number; // 1-10
    sleepOnsetRumination: boolean;
  };
};

export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  age: number;
  gender: string;
  lifestylePersona: 'High-Stress Executive / Zero-Time' | 'Peak Endurance Athlete' | 'Biohacking Enthusiast' | 'Recreational Maintenance';
  dataCompleteness: number;
  baselineDiagnostics?: BaselineDiagnostics;
  readiness: {
    score: number;
    status: ReadinessStatus;
    message: string;
  };
  metrics: {
    sleep: { current: number; trend: number[] };
    hrv: { current: number; trend: number[] };
    rhr: { current: number; trend: number[] };
    trainingLoad: number;
  };
  trainingPlan: {
    type: string;
    duration: number;
    intensity: string;
    reason: string;
  };
  nutrition: {
    calories: { target: number; current: number };
    protein: { target: number; current: number };
    carbs: { target: number; current: number };
    fat: { target: number; current: number };
    hydration: { target: number; current: number };
  };
  inventory: Product[];
  biohackingProtocols?: BiohackingCard[];
  checkInHistory?: DailyCheckInLog[];
  flags: string[];
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'phi';
  text: string;
  timestamp: string;
  evidence?: string;
  action?: {
    type: 'recommendation' | 'safety_block' | 'clinical_routing';
    payload: any;
  };
};

export type WearableIntegration = {
  id: string;
  name: string;
  iconName: string;
  connected: boolean;
  lastSynced: string;
  recordsCount: string;
  dataQualityScore: number;
  metricsProvided: string[];
};

export type UploadedDocument = {
  id: string;
  name: string;
  type: 'bloodwork' | 'medical_record' | 'ai_chat_export' | 'meal_photo' | 'genetics';
  uploadDate: string;
  status: 'processed' | 'analyzing' | 'flagged';
  factsExtracted: number;
};

export type ExtractedFact = {
  id: string;
  key: string;
  value: string;
  category: string;
  confidence: number;
  source: 'voice' | 'text' | 'form' | 'wearable' | 'document';
  verified: boolean;
};

export type OrganSystemId = 
  | 'cardiovascular'
  | 'metabolic'
  | 'immune'
  | 'neurocognitive'
  | 'hepatic'
  | 'renal'
  | 'musculoskeletal'
  | 'endocrine'
  | 'pulmonary';

export type OrganSystemHealth = {
  id: OrganSystemId;
  name: string;
  category: string;
  biologicalAge: number;
  chronologicalAgeDelta: number; // e.g. -5.8 means 5.8 years younger
  biologicalReservePercent: number; // 0-100%
  status: 'optimal' | 'resilient' | 'accelerated_aging' | 'high_strain';
  primaryBiomarkers: {
    name: string;
    value: string;
    reference: string;
    impact: 'positive' | 'neutral' | 'strained';
  }[];
  agingVelocity: 'slowing' | 'stable' | 'accelerated';
  clinicalSummary: string;
  priorityAction: string;
  targetIntervention: string;
};

export type LongevityRoadmapPhase = {
  phaseNumber: 1 | 2 | 3;
  daysRange: string; // e.g. 'Days 1-30'
  title: string;
  focusArea: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  interventions: {
    id: string;
    category: 'Biochemical' | 'Circadian' | 'Training' | 'Diagnostic' | 'Lifestyle';
    title: string;
    description: string;
    completed: boolean;
    frequency: string;
  }[];
  keyMilestone: string;
};

export type ExecutiveHealthspanReport = {
  overallBiologicalAge: number;
  chronologicalAge: number;
  longevityAdvantageYears: number;
  paceOfAging: number; // e.g. 0.82 biological years per chronological year
  overallReserveScore: number;
  topOpportunities: {
    system: string;
    priority: 'High' | 'Medium' | 'Routine';
    observation: string;
    actionableProtocol: string;
  }[];
  systemBreakdown: OrganSystemHealth[];
  generatedAt: string;
  physicianReviewStatus: 'Reviewed & Signed' | 'Pending Verification';
};

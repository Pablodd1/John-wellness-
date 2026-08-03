export type ReadinessStatus = 'optimal' | 'good' | 'warning' | 'low';

export type ThemeMode = 'titanium' | 'obsidian' | 'nordic' | 'solar';

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

export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  age: number;
  gender: string;
  lifestylePersona: 'High-Stress Executive / Zero-Time' | 'Peak Endurance Athlete' | 'Biohacking Enthusiast' | 'Recreational Maintenance';
  dataCompleteness: number;
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

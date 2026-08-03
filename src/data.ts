import { UserProfile, Product, BiohackingCard, WearableIntegration, UploadedDocument, PeerMatch, DailyCheckInLog } from './types';

export const MOCK_PEER_MATCHES: PeerMatch[] = [
  {
    id: 'peer-1',
    name: 'Dr. Marcus Vance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusV',
    role: 'Managing Partner & Triathlete',
    location: 'San Francisco, CA (1.2 miles away)',
    compatibilityScore: 98,
    biohackingStyle: 'Contrast Therapy + Zone 2 Endurance',
    preferredWorkout: 'Early Morning Zone 2 Bike / Sauna',
    coWorkingAvailable: true,
    sharedSupplements: ['Electrolyte Complex', 'Magnesium Glycinate', 'Creatine'],
    onlineStatus: 'active'
  },
  {
    id: 'peer-2',
    name: 'Sonia Lin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SoniaL',
    role: 'Tech Founder & Biohacking Advocate',
    location: 'Austin, TX (Co-working Lounge Sync)',
    compatibilityScore: 94,
    biohackingStyle: 'Circadian Light Anchoring + Fasted HIIT',
    preferredWorkout: 'Sprint Intervals & Cold Plunge',
    coWorkingAvailable: true,
    sharedSupplements: ['Whey Protein Isolate', 'NMN Cellular Buffer'],
    onlineStatus: 'active'
  },
  {
    id: 'peer-3',
    name: 'David Thorne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidT',
    role: 'Venture Partner (Heavy Stress / High Output)',
    location: 'New York, NY (Financial District Hub)',
    compatibilityScore: 91,
    biohackingStyle: 'Executive Parasympathetic Reset & Mobility',
    preferredWorkout: '20-min High-Efficiency Mobility & Breathwork',
    coWorkingAvailable: true,
    sharedSupplements: ['Executive Nootropic Stack', 'Magnesium Glycinate'],
    onlineStatus: 'in_session'
  }
];

export const BIOHACKING_PROTOCOLS: BiohackingCard[] = [
  {
    id: 'b1',
    title: 'Finnish Sauna & Cold Plunge Contrast',
    category: 'Thermal',
    protocol: '15-20 min sauna @ 80-90°C followed by 2-3 min cold plunge @ 10-12°C (3 cycles)',
    evidenceGrade: 'A (Strong Clinical)',
    recommendedTiming: 'Post-workout or 2 hours before sleep',
    targetOutcome: 'Growth hormone pulse, HRV rebound, reduced delayed onset muscle soreness (DOMS)',
    integratedWithTraining: 'Scheduled post Zone 2 Recovery Ride to enhance peripheral vasodilation.'
  },
  {
    id: 'b2',
    title: 'Morning Circadian Light Anchoring',
    category: 'Circadian',
    protocol: '10,000 Lux full spectrum exposure or direct natural sunlight for 15-20 mins within 30 mins of waking',
    evidenceGrade: 'A (Strong Clinical)',
    recommendedTiming: '06:30 - 07:30 AM',
    targetOutcome: 'Suppresses daytime melatonin, aligns core body temperature clock, improves nocturnal deep sleep by 22%',
    integratedWithTraining: 'Combine with light morning hydration and warm-up mobility.'
  },
  {
    id: 'b3',
    title: 'Physiological Sigh & Resonant Breathwork',
    category: 'Respiratory',
    protocol: 'Double inhale through nose + long slow exhale through mouth (5 mins @ 5.5 breaths/min)',
    evidenceGrade: 'A (Strong Clinical)',
    recommendedTiming: 'Immediately post high-intensity training or acute mental stress',
    targetOutcome: 'Rapid down-regulation of sympathetic nervous system, restores vagal tone',
    integratedWithTraining: 'Cool-down protocol directly following Sprint Interval training.'
  },
  {
    id: 'b4',
    title: 'Photobiomodulation (Red / Near-IR Light)',
    category: 'Cellular',
    protocol: '660nm & 850nm dual wavelength for 10 mins over large muscle groups',
    evidenceGrade: 'B (Moderate Evidence)',
    recommendedTiming: 'Pre-workout or post-injury recovery session',
    targetOutcome: 'Stimulates mitochondrial Cytochrome c Oxidase, boosting localized ATP production',
    integratedWithTraining: 'Use on knee connective tissue prior to strength sessions.'
  },
  {
    id: 'b5',
    title: 'Matrix Brain Training (Neurofeedback)',
    category: 'Brain Training',
    protocol: '20 mins of real-time EEG biofeedback targeting Alpha/Theta ratio optimization',
    evidenceGrade: 'B (Moderate Evidence)',
    recommendedTiming: 'Mid-day cognitive slump or pre-deep work',
    targetOutcome: 'Enhanced executive function, focus endurance, and stress resilience',
    integratedWithTraining: 'Use as a cognitive warm-up before intense problem-solving sessions.'
  },
  {
    id: 'b6',
    title: 'Advanced Hyperthermic Conditioning',
    category: 'Thermal',
    protocol: '30-40 min sauna @ 85°C followed by 10 min rest. Do NOT cold plunge immediately to maximize HSPs',
    evidenceGrade: 'A (Strong Clinical)',
    recommendedTiming: 'Evening, 3x per week',
    targetOutcome: 'Massive upregulation of Heat Shock Proteins (HSPs) for longevity and neurogenesis',
    integratedWithTraining: 'Perform on non-training days or after light mobility.'
  },
  {
    id: 'b7',
    title: 'High-Intensity VO2 Max Interval Protocol (Norwegian 4x4)',
    category: 'Physical Optimization',
    protocol: '4x 4-minute intervals at 90-95% max HR, separated by 3 mins active recovery',
    evidenceGrade: 'A (Strong Clinical)',
    recommendedTiming: 'Morning, fully fueled',
    targetOutcome: 'Highest measurable increase in stroke volume and maximal oxygen uptake (VO2 max)',
    integratedWithTraining: 'Core pillar for longevity and peak endurance.'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Whey Protein Isolate (Grass-Fed)',
    category: 'Nutrition',
    description: 'Ultra-pure grass-fed whey isolate with cross-flow microfiltration for rapid amino acid kinetics.',
    status: 'owned',
    riskLevel: 'low',
    daysRemaining: 12,
    unitsInStock: 24,
    dailyUsageRate: 2,
    price: 45.00,
    dailyDosage: '30g post-workout',
    timing: 'Within 45 mins after exercise',
    evidence: 'Extensive RCT data confirming muscle protein synthesis acceleration.',
    evidenceData: {
      confidenceScore: 97,
      grade: 'A',
      referenceTitle: 'Ingestion of Whey Hydrolysate Stimulates Muscle Protein Synthesis Compared to Casein',
      journal: 'American Journal of Clinical Nutrition',
      year: 2023,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/19589961/',
      clinicalRationale: 'Direct leucine stimulation of mTORC1 pathway accelerates post-exercise skeletal muscle rebuilding within a 2-hour window.'
    },
    tailoredReason: 'Matches your Zone 2 and Interval training load for muscle recovery.'
  },
  {
    id: 'p2',
    name: 'Magnesium Glycinate (Elemental 400mg)',
    category: 'Recovery',
    description: 'Highly bioavailable chelated magnesium bound to glycine for deep sleep phase extension.',
    status: 'recommended',
    riskLevel: 'low',
    price: 25.00,
    unitsInStock: 30,
    dailyUsageRate: 1,
    daysRemaining: 30,
    dailyDosage: '400mg',
    timing: '45 mins before bedtime',
    evidence: 'Strong clinical consensus for sleep latency reduction and autonomic relaxation.',
    evidenceData: {
      confidenceScore: 94,
      grade: 'A',
      referenceTitle: 'Oral Magnesium Supplementation Improves Glycinate Absorption and HRV Metrics',
      journal: 'Journal of Research in Medical Sciences',
      year: 2024,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/23301163/',
      clinicalRationale: 'Acts as an NMDA receptor antagonist and GABA agonist, lowering nocturnal sympathetic tone and boosting deep slow-wave sleep.'
    },
    tailoredReason: 'Recommended based on 3-day sleep debt flag detected in your wearable telemetry.'
  },
  {
    id: 'p3',
    name: 'BPC-157 (Body Protection Compound)',
    category: 'Peptide',
    description: 'Pentadecapeptide studied for tendon-to-bone healing and gastric mucosal integrity.',
    status: 'clinical_review',
    riskLevel: 'high',
    price: 120.00,
    unitsInStock: 10,
    dailyUsageRate: 1,
    daysRemaining: 10,
    evidence: 'Experimental peptide with animal tissue regeneration studies. Requires licensed physician oversight, contraindication screening, and prescription.',
    evidenceData: {
      confidenceScore: 78,
      grade: 'C',
      referenceTitle: 'Gastric Pentadecapeptide BPC 157 in Tendon Healing and Angiogenesis',
      journal: 'Molecules & Experimental Therapeutics',
      year: 2022,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/21030672/',
      clinicalRationale: 'Upregulates VEGFR2 expression and nitric oxide pathways, accelerating collagen deposition in compromised ligament tissue.'
    },
    dailyDosage: 'Clinician Consult Required',
    timing: 'Under Medical Guidance',
    tailoredReason: 'Extracted from your ChatGPT import notes mentioning left knee soreness.'
  },
  {
    id: 'p4',
    name: 'Electrolyte Balance Complex',
    category: 'Hydration',
    description: '1000mg Sodium, 200mg Potassium, 60mg Magnesium without artificial fillers.',
    status: 'running_low',
    riskLevel: 'low',
    daysRemaining: 3,
    unitsInStock: 3,
    dailyUsageRate: 1,
    price: 30.00,
    dailyDosage: '1 stick pack in 750ml water',
    timing: 'During endurance sessions or upon waking',
    evidence: 'Proven electrolyte replacement kinetics during prolonged sweating.',
    evidenceData: {
      confidenceScore: 96,
      grade: 'A',
      referenceTitle: 'Sodium Replenishment during Prolonged Exercise Prevents Exercise-Associated Hyponatremia',
      journal: 'Medicine & Science in Sports & Exercise',
      year: 2023,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/20120301/',
      clinicalRationale: 'Sustains extracellular osmolarity and plasma volume, preventing cardiovascular drift during endurance efforts.'
    },
    tailoredReason: 'Running low (~3 days remaining based on daily morning intake).'
  },
  {
    id: 'p5',
    name: 'Executive Nootropic Peak Stack',
    category: 'Executive Stack',
    description: 'L-Theanine 200mg + Alpha-GPC 300mg + Lion\'s Mane 1000mg. Zero caffeine crash.',
    status: 'recommended',
    riskLevel: 'low',
    price: 65.00,
    unitsInStock: 30,
    dailyUsageRate: 1,
    daysRemaining: 30,
    dailyDosage: '2 capsules with morning espresso',
    timing: '08:00 AM (Pre-executive meetings)',
    evidence: 'Meta-analysis confirms sustained alpha brainwave activity without vasoconstriction.',
    evidenceData: {
      confidenceScore: 92,
      grade: 'A',
      referenceTitle: 'Combination of L-Theanine and Alpha-GPC Enhances Executive Function and Cognitive Speed',
      journal: 'Nutritional Neuroscience',
      year: 2024,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/18296328/',
      clinicalRationale: 'Alpha-GPC increases acetylcholine synthesis while L-Theanine smooths cortical arousal, optimizing working memory under time pressure.'
    },
    tailoredReason: 'Designed for High-Stress Executives requiring zero-time cognitive flow state.'
  },
  {
    id: 'p6',
    name: 'Creatine Monohydrate (Creapure®)',
    category: 'Nutrition',
    description: 'Micronized 100% pure creatine for intracellular phosphocreatine resynthesis and cognitive support.',
    status: 'owned',
    riskLevel: 'low',
    daysRemaining: 24,
    unitsInStock: 24,
    dailyUsageRate: 1,
    price: 28.00,
    dailyDosage: '5g daily',
    timing: 'Any time with meals or post-workout',
    evidence: 'Level 1A evidence for power output, muscular endurance, and neuroprotective buffering.',
    evidenceData: {
      confidenceScore: 99,
      grade: 'A',
      referenceTitle: 'International Society of Sports Nutrition Position Stand: Safety and Efficacy of Creatine',
      journal: 'Journal of the International Society of Sports Nutrition',
      year: 2023,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/28615996/',
      clinicalRationale: 'Increases intramuscular phosphocreatine stores by 20-40%, enhancing rapid ATP regeneration during maximal efforts.'
    },
    tailoredReason: 'Owned protocol item logged in your daily morning smoothie stack.'
  },
  {
    id: 'p7',
    name: 'Whole Genome Sequencing & Methylation',
    category: 'Diagnostics',
    description: '100x coverage DNA sequencing with epigenetic methylation age clock.',
    status: 'recommended',
    riskLevel: 'low',
    price: 399.00,
    dailyDosage: 'One-time test',
    timing: 'Ship kit back immediately',
    evidence: 'Clinical grade genetic screening for hyper-personalized nutrition and longevity protocols.',
    evidenceData: {
      confidenceScore: 95,
      grade: 'A',
      referenceTitle: 'Clinical Utility of Whole Genome Sequencing',
      journal: 'Nature Genetics',
      year: 2023,
      clinicalRationale: 'Identifies SNPs for methylation (MTHFR), APOE4, and caffeine metabolism to customize your biohacking baseline.'
    }
  },
  {
    id: 'p8',
    name: 'DEXA Body Composition Scan',
    category: 'Diagnostics',
    description: 'Gold-standard bone density, visceral fat, and lean mass quantification.',
    status: 'recommended',
    riskLevel: 'low',
    price: 150.00,
    dailyDosage: 'Local partner clinic appointment',
    timing: 'Quarterly',
    evidence: 'The most accurate clinical measure of body composition changes.',
    evidenceData: {
      confidenceScore: 99,
      grade: 'A',
      referenceTitle: 'Dual-energy X-ray absorptiometry for body composition assessment',
      journal: 'Clinical Nutrition',
      year: 2022,
      clinicalRationale: 'Tracks exact lean tissue accrual vs fat loss to validate your macro and training periodization.'
    }
  },
  {
    id: 'p9',
    name: 'Comprehensive Blood & Heavy Metals Panel',
    category: 'Diagnostics',
    description: 'Advanced biomarker testing including testosterone, cortisol, hs-CRP, and heavy metals toxicity.',
    status: 'recommended',
    riskLevel: 'low',
    price: 249.00,
    dailyDosage: 'At-home phlebotomist visit',
    timing: 'Morning fasted',
    evidence: 'Essential for tracking physiological baseline and inflammatory markers.'
  },
  {
    id: 'p10',
    name: 'Gut Microbiome & Metabolite Analysis',
    category: 'Diagnostics',
    description: 'Shotgun metagenomic sequencing of your gut bacteria and short-chain fatty acid production.',
    status: 'recommended',
    riskLevel: 'low',
    price: 199.00,
    dailyDosage: 'At-home stool collection',
    timing: 'Ship within 24h',
    evidence: 'Links gut health to systemic inflammation, mood, and nutrient absorption.'
  },
  {
    id: 'p11',
    name: 'TB-500 (Thymosin Beta-4)',
    category: 'Peptide',
    description: 'Potent systemic healing peptide, upregulates actin, increases angiogenesis, and repairs soft tissue.',
    status: 'clinical_review',
    riskLevel: 'high',
    price: 180.00,
    dailyDosage: 'Clinician Consult Required',
    timing: 'Under Medical Guidance',
    evidence: 'Demonstrated to accelerate wound healing and reduce inflammation in muscular and connective tissues.',
    evidenceData: {
      confidenceScore: 82,
      grade: 'B',
      referenceTitle: 'Thymosin beta4 and tissue repair',
      journal: 'Annals of the New York Academy of Sciences',
      year: 2022,
      clinicalRationale: 'Promotes endothelial cell migration and actin sequestration for rapid musculoskeletal recovery.'
    }
  },
  {
    id: 'p12',
    name: 'MOTS-c (Mitochondrial Derived Peptide)',
    category: 'Peptide',
    description: 'Exercise-mimetic peptide that regulates metabolic homeostasis and enhances mitochondrial function.',
    status: 'clinical_review',
    riskLevel: 'high',
    price: 210.00,
    dailyDosage: 'Clinician Consult Required',
    timing: 'Under Medical Guidance',
    evidence: 'Significantly improves insulin sensitivity and exercise capacity in preclinical models.',
    evidenceData: {
      confidenceScore: 75,
      grade: 'C',
      referenceTitle: 'The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis',
      journal: 'Cell Metabolism',
      year: 2021,
      clinicalRationale: 'Targets skeletal muscle to enhance glucose uptake via AMPK pathway activation.'
    }
  }
];

export const INITIAL_WEARABLES: WearableIntegration[] = [
  {
    id: 'w1',
    name: 'WHOOP 4.0',
    iconName: 'Activity',
    connected: true,
    lastSynced: '3 mins ago',
    recordsCount: '2,840 HRV & strain samples',
    dataQualityScore: 98,
    metricsProvided: ['HRV', 'Resting Heart Rate', 'Sleep Performance', 'Day Strain', 'Skin Temp']
  },
  {
    id: 'w2',
    name: 'Oura Ring Gen 3',
    iconName: 'Disc',
    connected: true,
    lastSynced: '14 mins ago',
    recordsCount: '1,120 bedtime stage entries',
    dataQualityScore: 95,
    metricsProvided: ['Deep / REM Sleep', 'Readiness Score', 'Temperature Deviation', 'Cardiovascular Age']
  },
  {
    id: 'w3',
    name: 'Garmin Connect',
    iconName: 'Watch',
    connected: false,
    lastSynced: 'Never',
    recordsCount: '0 workouts',
    dataQualityScore: 0,
    metricsProvided: ['VO2 Max', 'Training Effect', 'GPS Route Dynamics', 'Power Meter Output']
  },
  {
    id: 'w4',
    name: 'Apple Health',
    iconName: 'HeartPulse',
    connected: true,
    lastSynced: '1 hour ago',
    recordsCount: '14,200 step & active energy logs',
    dataQualityScore: 88,
    metricsProvided: ['Steps', 'Active Calories', 'Walking Asymmetry', 'Blood Oxygen SpO2']
  },
  {
    id: 'w5',
    name: 'Withings Body Scan Scale',
    iconName: 'Activity',
    connected: false,
    lastSynced: 'Never',
    recordsCount: '0 records',
    dataQualityScore: 0,
    metricsProvided: ['Segmental Body Comp', 'Vascular Age', 'Visceral Fat', 'Nerve Activity']
  },
  {
    id: 'w6',
    name: 'Omron Connect (Blood Pressure)',
    iconName: 'HeartPulse',
    connected: true,
    lastSynced: 'Morning check-in',
    recordsCount: '45 readings',
    dataQualityScore: 99,
    metricsProvided: ['Systolic', 'Diastolic', 'Pulse']
  },
  {
    id: 'w7',
    name: 'Dexcom G7 CGM',
    iconName: 'Activity',
    connected: true,
    lastSynced: '5 mins ago',
    recordsCount: 'Continuous 24/7 logging',
    dataQualityScore: 96,
    metricsProvided: ['Real-time Glucose', 'Time in Range', 'Glycemic Variability']
  }
];

export const INITIAL_DOCUMENTS: UploadedDocument[] = [
  {
    id: 'd1',
    name: 'Comprehensive_Blood_Panel_Q2_2026.pdf',
    type: 'bloodwork',
    uploadDate: '2026-07-15',
    status: 'processed',
    factsExtracted: 18
  },
  {
    id: 'd2',
    name: 'ChatGPT_Intake_History_Import.json',
    type: 'ai_chat_export',
    uploadDate: '2026-07-28',
    status: 'processed',
    factsExtracted: 12
  }
];

export const MOCK_CHECKIN_LOGS: DailyCheckInLog[] = [
  {
    id: 'chk-1',
    date: '2026-08-01',
    symptoms: ['Mild left knee tightness', 'Slight afternoon fatigue'],
    supplementAdherence: 'full',
    energyScore: 7,
    stressScore: 6,
    notes: 'Zone 2 ride felt comfortable. Took Electrolytes during ride.'
  },
  {
    id: 'chk-2',
    date: '2026-07-31',
    symptoms: ['Sleep disruption'],
    supplementAdherence: 'partial',
    energyScore: 6,
    stressScore: 8,
    notes: 'Traveled late, forgot Magnesium before bed.'
  }
];

export const SYNTHETIC_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'Full-Data Male Endurance Athlete',
    lifestylePersona: 'Peak Endurance Athlete',
    age: 32,
    gender: 'Male',
    dataCompleteness: 98,
    readiness: {
      score: 72,
      status: 'warning',
      message: 'HRV is down 15% over 3 days while training load remains high. System adapted today\'s session to a recovery ride.'
    },
    metrics: {
      sleep: { current: 6.2, trend: [7.5, 7.2, 6.8, 6.5, 6.1, 5.9, 6.2] },
      hrv: { current: 45, trend: [55, 54, 52, 48, 46, 44, 45] },
      rhr: { current: 52, trend: [48, 48, 49, 50, 51, 53, 52] },
      trainingLoad: 850
    },
    trainingPlan: {
      type: 'Zone 2 Active Recovery Ride',
      duration: 45,
      intensity: 'Low (115-130 BPM)',
      reason: 'Downregulated from Threshold Intervals due to 3 consecutive nights of cumulative sleep debt and autonomic fatigue.'
    },
    nutrition: {
      calories: { target: 3200, current: 1850 },
      protein: { target: 180, current: 110 },
      carbs: { target: 400, current: 240 },
      fat: { target: 90, current: 55 },
      hydration: { target: 4000, current: 2200 }
    },
    inventory: MOCK_PRODUCTS,
    biohackingProtocols: BIOHACKING_PROTOCOLS,
    checkInHistory: MOCK_CHECKIN_LOGS,
    flags: ['Sleep debt accumulating (-1.8h vs baseline)', 'Electrolyte complex running low (3 days left)', 'Left knee soreness noted on Tuesday']
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Female Athlete (Active Cycle Tracking)',
    lifestylePersona: 'Biohacking Enthusiast',
    age: 28,
    gender: 'Female',
    dataCompleteness: 92,
    readiness: {
      score: 95,
      status: 'optimal',
      message: 'Mid-Follicular phase peak. Estrogen rise matches high HRV and optimal neuromuscular recovery.'
    },
    metrics: {
      sleep: { current: 8.1, trend: [7.2, 7.5, 7.8, 8.0, 7.9, 8.2, 8.1] },
      hrv: { current: 68, trend: [60, 62, 65, 66, 67, 69, 68] },
      rhr: { current: 45, trend: [48, 47, 46, 46, 45, 44, 45] },
      trainingLoad: 450
    },
    trainingPlan: {
      type: 'High-Intensity Sprint Intervals (VO2 Peak)',
      duration: 50,
      intensity: 'Maximum Effort (Zone 5)',
      reason: 'Optimal hormonal window for high rate of force development and lactate clearance.'
    },
    nutrition: {
      calories: { target: 2400, current: 1400 },
      protein: { target: 140, current: 85 },
      carbs: { target: 250, current: 160 },
      fat: { target: 70, current: 40 },
      hydration: { target: 3000, current: 2100 }
    },
    inventory: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[3]],
    biohackingProtocols: [BIOHACKING_PROTOCOLS[1], BIOHACKING_PROTOCOLS[2]],
    checkInHistory: [],
    flags: []
  },
  {
    id: 'u4',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'Busy CEO (High Stress / Zero Time)',
    lifestylePersona: 'High-Stress Executive / Zero-Time',
    age: 50,
    gender: 'Male',
    dataCompleteness: 85,
    readiness: {
      score: 55,
      status: 'low',
      message: 'Acute sleep deficit (<4.5h) and elevated baseline stress. 1-Click Executive Stacks auto-recommended.'
    },
    metrics: {
      sleep: { current: 4.5, trend: [6.0, 5.5, 6.2, 4.8, 5.0, 4.2, 4.5] },
      hrv: { current: 32, trend: [40, 38, 39, 35, 34, 30, 32] },
      rhr: { current: 65, trend: [58, 59, 60, 62, 64, 66, 65] },
      trainingLoad: 120
    },
    trainingPlan: {
      type: 'Parasympathetic Reset & Mobility',
      duration: 20,
      intensity: 'Very Low',
      reason: 'High cortisol and circadian disruption due to cross-country travel. Heavy workouts omitted.'
    },
    nutrition: {
      calories: { target: 2200, current: 950 },
      protein: { target: 150, current: 50 },
      carbs: { target: 200, current: 90 },
      fat: { target: 80, current: 40 },
      hydration: { target: 3000, current: 1100 }
    },
    inventory: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[4]],
    biohackingProtocols: [BIOHACKING_PROTOCOLS[2]],
    checkInHistory: [],
    flags: ['Travel mode active (3 hour timezone shift)', 'Severe sleep restriction (<5h)', 'High stress score (9/10)']
  }
];

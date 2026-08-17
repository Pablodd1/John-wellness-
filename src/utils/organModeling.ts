import { UserProfile, OrganSystemHealth, LongevityRoadmapPhase, ExecutiveHealthspanReport } from '../types';

export function calculateOrganSystems(user: UserProfile): OrganSystemHealth[] {
  const chronAge = user.age || 42;
  const blood = user.baselineDiagnostics?.bloodwork;
  const dexa = user.baselineDiagnostics?.dexa;
  const sports = user.baselineDiagnostics?.sportsProfile;
  const psych = user.baselineDiagnostics?.psychologicalProfile;
  const metrics = user.metrics;

  // 1. Cardiovascular System
  const apoB = blood?.apoB ?? 62;
  const hsCRP = blood?.hsCRP ?? 0.4;
  const rhr = metrics?.rhr?.current ?? 52;
  const cardioStrain = (apoB > 80 ? 1.5 : -2) + (hsCRP > 1.0 ? 2 : -1.5) + (rhr > 65 ? 1 : -1.5);
  const cardioBioAge = Math.round((chronAge + cardioStrain - 3.8) * 10) / 10;
  const cardioReserve = Math.min(96, Math.max(55, Math.round(92 - (cardioStrain * 4))));

  // 2. Metabolic & Glycemic System
  const glucose = blood?.fastingGlucose ?? 92;
  const insulin = blood?.fastingInsulin ?? 5.2;
  const hba1c = blood?.hba1c ?? 5.1;
  const viscFat = dexa?.visceralFatGrams ?? 310;
  const metabolicStrain = (glucose > 100 ? 2.5 : -1) + (insulin > 8 ? 2 : -1.5) + (viscFat > 500 ? 2.5 : -1.5);
  const metabolicBioAge = Math.round((chronAge + metabolicStrain - 1.2) * 10) / 10;
  const metabolicReserve = Math.min(95, Math.max(50, Math.round(86 - (metabolicStrain * 5))));

  // 3. Immune & Inflammatory System
  const immuneStrain = (hsCRP > 1.5 ? 3 : hsCRP > 0.5 ? 0.5 : -3.5);
  const immuneBioAge = Math.round((chronAge + immuneStrain - 4.5) * 10) / 10;
  const immuneReserve = Math.min(98, Math.max(52, Math.round(94 - (immuneStrain * 6))));

  // 4. Neurocognitive & Brain System
  const sleepEff = user.baselineDiagnostics?.anthropometrics?.sleepEfficiencyPercent ?? 88;
  const hrv = metrics?.hrv?.current ?? 74;
  const stress = psych?.perceivedStressScore ?? 4;
  const neuroStrain = (sleepEff < 80 ? 2 : -1.5) + (hrv < 45 ? 2 : -2) + (stress > 6 ? 2 : -1);
  const neuroBioAge = Math.round((chronAge + neuroStrain - 2.6) * 10) / 10;
  const neuroReserve = Math.min(95, Math.max(55, Math.round(88 - (neuroStrain * 4))));

  // 5. Hepatic (Liver) System
  const hepaticStrain = (viscFat > 600 ? 2 : -1.8);
  const hepaticBioAge = Math.round((chronAge + hepaticStrain - 2.8) * 10) / 10;
  const hepaticReserve = Math.min(96, Math.max(60, Math.round(90 - (hepaticStrain * 4))));

  // 6. Renal (Kidneys) System
  const renalBioAge = Math.round((chronAge - 2.2) * 10) / 10;
  const renalReserve = 88;

  // 7. Musculoskeletal System
  const boneZ = dexa?.boneDensityZScore ?? 1.8;
  const leanMass = dexa?.leanMassKg ?? 71.5;
  const musculoStrain = (boneZ < 0 ? 3 : -2.5) + (leanMass < 60 ? 2 : -2);
  const musculoBioAge = Math.round((chronAge + musculoStrain - 4.2) * 10) / 10;
  const musculoReserve = Math.min(98, Math.max(60, Math.round(92 - (musculoStrain * 3))));

  // 8. Endocrine & HPA Axis
  const cortisol = blood?.cortisolAM ?? 14.5;
  const endocrineStrain = (stress > 6 ? 2.5 : -1) + (cortisol > 20 ? 3 : -1.5);
  const endocrineBioAge = Math.round((chronAge + endocrineStrain + 0.5) * 10) / 10;
  const endocrineReserve = Math.min(92, Math.max(48, Math.round(80 - (endocrineStrain * 6))));

  // 9. Pulmonary (Respiratory) System
  const vo2Max = user.baselineDiagnostics?.diagnostics?.vo2Max ?? 54.2;
  const zone2 = sports?.zone2WeeklyHours ?? 6.5;
  const pulmonaryStrain = (vo2Max < 40 ? 3 : vo2Max > 50 ? -3.5 : -1) + (zone2 < 3 ? 2 : -2);
  const pulmonaryBioAge = Math.round((chronAge + pulmonaryStrain - 3.4) * 10) / 10;
  const pulmonaryReserve = Math.min(98, Math.max(55, Math.round(92 - (pulmonaryStrain * 4))));

  return [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular System',
      category: 'Heart & Vascular Dynamics',
      biologicalAge: cardioBioAge,
      chronologicalAgeDelta: Math.round((cardioBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: cardioReserve,
      status: cardioBioAge < chronAge ? 'optimal' : 'resilient',
      primaryBiomarkers: [
        { name: 'ApoB', value: `${apoB} mg/dL`, reference: '< 70 mg/dL', impact: apoB <= 70 ? 'positive' : 'strained' },
        { name: 'hs-CRP', value: `${hsCRP} mg/L`, reference: '< 0.5 mg/L', impact: hsCRP <= 0.5 ? 'positive' : 'strained' },
        { name: 'Resting HR', value: `${rhr} bpm`, reference: '48-58 bpm', impact: rhr <= 58 ? 'positive' : 'neutral' },
      ],
      agingVelocity: cardioBioAge < chronAge ? 'slowing' : 'stable',
      clinicalSummary: 'Superior endothelial compliance with low atherogenic particle exposure and resilient vagal tone.',
      priorityAction: 'Maintain current high-EPA triglyceride omega-3 and zone 2 aerobic sessions.',
      targetIntervention: 'High-EPA Omega-3 + Ubiquinol CoQ10 + Aerobic Zone 2'
    },
    {
      id: 'metabolic',
      name: 'Metabolic & Glycemic System',
      category: 'Insulin Sensitivity & Energy Kinetics',
      biologicalAge: metabolicBioAge,
      chronologicalAgeDelta: Math.round((metabolicBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: metabolicReserve,
      status: metabolicBioAge < chronAge ? 'optimal' : 'resilient',
      primaryBiomarkers: [
        { name: 'Fasting Glucose', value: `${glucose} mg/dL`, reference: '75-90 mg/dL', impact: glucose <= 92 ? 'positive' : 'strained' },
        { name: 'Fasting Insulin', value: `${insulin} uIU/mL`, reference: '< 6.0 uIU/mL', impact: insulin <= 6.0 ? 'positive' : 'neutral' },
        { name: 'HbA1c', value: `${hba1c}%`, reference: '< 5.3%', impact: hba1c <= 5.2 ? 'positive' : 'neutral' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Robust cellular glucose uptake kinetics with balanced postprandial insulin clearance.',
      priorityAction: 'Deploy dihydroberberine timing prior to high glycemic carbohydrate exposures.',
      targetIntervention: 'Dihydroberberine + Chromium + Post-meal 15-min Zone 1 walks'
    },
    {
      id: 'immune',
      name: 'Immune & Inflammatory System',
      category: 'Immunosenescence & Cytokine Homeostasis',
      biologicalAge: immuneBioAge,
      chronologicalAgeDelta: Math.round((immuneBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: immuneReserve,
      status: immuneBioAge < chronAge ? 'optimal' : 'resilient',
      primaryBiomarkers: [
        { name: 'hs-CRP', value: `${hsCRP} mg/L`, reference: '< 0.5 mg/L', impact: 'positive' },
        { name: 'Vitamin D3 (25-OH)', value: `${blood?.vitaminD ?? 64} ng/mL`, reference: '60-80 ng/mL', impact: (blood?.vitaminD ?? 64) >= 50 ? 'positive' : 'strained' },
        { name: 'Visceral Fat', value: `${viscFat} g`, reference: '< 400 g', impact: viscFat <= 400 ? 'positive' : 'neutral' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Exceptional systemic anti-inflammatory suppression with quiescent macrophage and NF-kB signaling.',
      priorityAction: 'Maintain liposomal D3/K2 and micronutrient antioxidant defense.',
      targetIntervention: 'Liposomal Vitamin D3+K2 + Longvida Curcumin Phytosome'
    },
    {
      id: 'neurocognitive',
      name: 'Neurocognitive & Brain System',
      category: 'Synaptic Plasticity & Circadian Rest',
      biologicalAge: neuroBioAge,
      chronologicalAgeDelta: Math.round((neuroBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: neuroReserve,
      status: neuroBioAge < chronAge ? 'optimal' : 'resilient',
      primaryBiomarkers: [
        { name: 'HRV (Parasympathetic)', value: `${hrv} ms`, reference: '> 65 ms', impact: hrv >= 60 ? 'positive' : 'strained' },
        { name: 'Sleep Efficiency', value: `${sleepEff}%`, reference: '> 85%', impact: sleepEff >= 85 ? 'positive' : 'strained' },
        { name: 'Perceived Stress', value: `${stress}/10`, reference: '< 5/10', impact: stress <= 5 ? 'positive' : 'strained' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Strong executive processing resilience, supported by high deep/REM restorative sleep architecture.',
      priorityAction: 'Protect morning sunlight circadian anchoring and evening magnesium threonate protocol.',
      targetIntervention: 'BioActive Methyl-B Complex + Magnesium L-Threonate'
    },
    {
      id: 'hepatic',
      name: 'Hepatic (Liver) System',
      category: 'Detoxification & Lipid Clearance',
      biologicalAge: hepaticBioAge,
      chronologicalAgeDelta: Math.round((hepaticBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: hepaticReserve,
      status: 'optimal',
      primaryBiomarkers: [
        { name: 'ALT / AST', value: blood?.altAst ?? '22 / 24 U/L', reference: '< 30 U/L', impact: 'positive' },
        { name: 'Visceral Fat Storage', value: `${viscFat} g`, reference: '< 400 g', impact: 'positive' },
        { name: 'Phase II Clearance', value: 'High', reference: 'Optimal', impact: 'positive' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Pristine hepatic transaminases with low intrahepatic fat accumulation and efficient bile acid conjugation.',
      priorityAction: 'Maintain clean cruciferous indole-3-carbinol nutrition and hydration balance.',
      targetIntervention: 'NAC (N-Acetyl Cysteine) + Milk Thistle Phytosome'
    },
    {
      id: 'renal',
      name: 'Renal (Kidneys) System',
      category: 'Glomerular Filtration & Electrolyte Balance',
      biologicalAge: renalBioAge,
      chronologicalAgeDelta: Math.round((renalBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: renalReserve,
      status: 'optimal',
      primaryBiomarkers: [
        { name: 'eGFR Est.', value: '> 105 mL/min', reference: '> 90 mL/min', impact: 'positive' },
        { name: 'Electrolyte Balance', value: '141/4.2 mEq/L', reference: 'Normal', impact: 'positive' },
        { name: 'Hydration Kinetics', value: `${user.nutrition?.hydration?.current ?? 2.8}L/day`, reference: '2.5 - 3.5 L', impact: 'positive' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Optimal microvascular glomerular perfusion and intact electrolyte reabsorption curves.',
      priorityAction: 'Ensure baseline mineral electrolyte supplementation during heavy endurance training.',
      targetIntervention: 'Bio-Chelated Magnesium + Balanced Electrolyte Hydration'
    },
    {
      id: 'musculoskeletal',
      name: 'Musculoskeletal System',
      category: 'Bone Mineral Density & Sarcopenia Defense',
      biologicalAge: musculoBioAge,
      chronologicalAgeDelta: Math.round((musculoBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: musculoReserve,
      status: 'optimal',
      primaryBiomarkers: [
        { name: 'Bone Z-Score', value: `+${boneZ}`, reference: '> 0.0', impact: 'positive' },
        { name: 'Lean Muscle Mass', value: `${leanMass} kg`, reference: '> 65 kg', impact: 'positive' },
        { name: 'Body Fat %', value: `${dexa?.bodyFatPercent ?? 12.4}%`, reference: '10-16%', impact: 'positive' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'High lean skeletal mass index with robust trabecular bone density and low sarcopenic biomarkers.',
      priorityAction: 'Progressive mechanical resistance loading 3x weekly paired with 1.8g/kg leucine-rich protein.',
      targetIntervention: 'Creatine Monohydrate + Leucine-Rich Whey Isolate'
    },
    {
      id: 'endocrine',
      name: 'Endocrine & HPA Axis',
      category: 'Hormonal Equilibrium & Cortisol Curve',
      biologicalAge: endocrineBioAge,
      chronologicalAgeDelta: Math.round((endocrineBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: endocrineReserve,
      status: endocrineBioAge > chronAge ? 'high_strain' : 'resilient',
      primaryBiomarkers: [
        { name: 'Morning Cortisol', value: `${cortisol} mcg/dL`, reference: '10-18 mcg/dL', impact: cortisol <= 18 ? 'positive' : 'strained' },
        { name: 'Free Testosterone', value: `${blood?.testosteroneFree ?? 22.4} pg/mL`, reference: '> 15 pg/mL', impact: 'positive' },
        { name: 'Perceived Stress', value: `${stress}/10`, reference: '< 5/10', impact: stress <= 5 ? 'positive' : 'strained' }
      ],
      agingVelocity: endocrineBioAge > chronAge ? 'accelerated' : 'stable',
      clinicalSummary: 'Occasional HPA-axis stress spikes during high travel and executive workload bursts.',
      priorityAction: 'Incorporate evening Ashwagandha KSM-66 and 5-minute parasympathetic box breathing post-market close.',
      targetIntervention: 'Ashwagandha Sensoril® + Phosphatidylserine 300mg'
    },
    {
      id: 'pulmonary',
      name: 'Pulmonary (Respiratory) System',
      category: 'Ventilatory Threshold & VO2 Max Kinetics',
      biologicalAge: pulmonaryBioAge,
      chronologicalAgeDelta: Math.round((pulmonaryBioAge - chronAge) * 10) / 10,
      biologicalReservePercent: pulmonaryReserve,
      status: 'optimal',
      primaryBiomarkers: [
        { name: 'VO2 Max', value: `${vo2Max} mL/kg/min`, reference: '> 45 (Elite)', impact: 'positive' },
        { name: 'Weekly Zone 2', value: `${zone2} hrs`, reference: '> 3.5 hrs', impact: 'positive' },
        { name: 'SpO2 Overnight', value: '98.5%', reference: '> 95%', impact: 'positive' }
      ],
      agingVelocity: 'slowing',
      clinicalSummary: 'Elite aerobic ventilatory reserve with rapid lactate clearance and high capillary mitochondrial density.',
      priorityAction: 'Sustain weekly polarized training balance (80% Zone 2, 20% VO2 Max interval repeats).',
      targetIntervention: 'Cordyceps Militaris Extract + Beetroot Nitrate'
    }
  ];
}

export function generateLongevityRoadmap(user: UserProfile, systems: OrganSystemHealth[]): LongevityRoadmapPhase[] {
  const isHighStress = (user.baselineDiagnostics?.psychologicalProfile?.perceivedStressScore ?? 4) > 5;
  const needsLipids = (user.baselineDiagnostics?.bloodwork?.apoB ?? 60) > 70;

  return [
    {
      phaseNumber: 1,
      daysRange: 'Days 1 - 30',
      title: 'Cellular Cleanup & Systemic Calming',
      focusArea: 'Anti-Inflammatory Suppression & Circadian Stabilization',
      status: 'in_progress',
      interventions: [
        {
          id: 'int-1',
          category: 'Biochemical',
          title: 'Deploy Liposomal Vitamin D3+K2 & Curcumin Phytosome',
          description: 'Lower circulating hs-CRP cytokine cascade and normalize bone/vascular calcium flux.',
          completed: true,
          frequency: 'Daily with breakfast'
        },
        {
          id: 'int-2',
          category: 'Circadian',
          title: '15-Minute Morning Sunlight & 10:30 PM Sleep Lock',
          description: 'Anchor suprachiasmatic nucleus, elevating nighttime melatonin release and deep REM recovery.',
          completed: true,
          frequency: 'Daily upon waking'
        },
        {
          id: 'int-3',
          category: 'Lifestyle',
          title: 'Post-Meal 12-Minute Zone 1 Stride',
          description: 'Blunts postprandial glucose excursions by 32% via GLUT-4 contraction translocation.',
          completed: false,
          frequency: 'After dinner'
        }
      ],
      keyMilestone: 'Achieve hs-CRP < 0.40 mg/L and average sleep efficiency > 88%.'
    },
    {
      phaseNumber: 2,
      daysRange: 'Days 31 - 60',
      title: 'Mitochondrial Biogenesis & Metabolic Reset',
      focusArea: 'AMPK Phosphorylation & Aerobic Base Expansion',
      status: 'upcoming',
      interventions: [
        {
          id: 'int-4',
          category: 'Training',
          title: '6.0+ Hours Structured Polarized Zone 2 Aerobic Base',
          description: 'Stimulate PGC-1alpha mitochondrial replication and increase fatty acid substrate oxidation.',
          completed: false,
          frequency: '3x weekly (45-90 min)'
        },
        {
          id: 'int-5',
          category: 'Biochemical',
          title: 'Ubiquinol CoQ10 (200mg) + PQQ (20mg) Cellular Stack',
          description: 'Enhance electron transport chain Complex I/III efficiency and scavenge mitochondrial ROS.',
          completed: false,
          frequency: 'Daily at 08:00 AM'
        },
        {
          id: 'int-6',
          category: isHighStress ? 'Circadian' : 'Biochemical',
          title: isHighStress ? 'Evening Cortisol Blunting with Ashwagandha KSM-66' : 'Dihydroberberine Pre-Carb Ingestion',
          description: isHighStress ? 'Mitigates nighttime waking and sympathetic arousal.' : 'Maintains tight glycemic envelope during higher-carb refeeds.',
          completed: false,
          frequency: 'Daily'
        }
      ],
      keyMilestone: 'Elevate VO2 Max baseline by +1.5 mL/kg/min and maintain fasting insulin < 5.0 uIU/mL.'
    },
    {
      phaseNumber: 3,
      daysRange: 'Days 61 - 90',
      title: 'Biological Reserve Amplification & Re-Assessment',
      focusArea: 'AOSM Panel Re-Testing & Longevity Lock-In',
      status: 'upcoming',
      interventions: [
        {
          id: 'int-7',
          category: 'Training',
          title: 'Heavy Compound Mechanical Loading (3x Weekly)',
          description: 'Upregulates osteocalcin signaling, preserves lean myofibrillar protein density, and boosts resting metabolic rate.',
          completed: false,
          frequency: '3x per week'
        },
        {
          id: 'int-8',
          category: 'Diagnostic',
          title: 'Repeat 9-Organ AOSM Comprehensive Diagnostic Draw',
          description: 'Quantify 90-day biological age reversal across all 9 organ systems vs baseline.',
          completed: false,
          frequency: 'Day 85'
        },
        {
          id: 'int-9',
          category: 'Biochemical',
          title: 'Precision Micro-Dosing Regimen Adjustment',
          description: 'Calibrate long-term supplement and peptide dosages based on objective biomarker shifts.',
          completed: false,
          frequency: 'Day 90 Clinic Review'
        }
      ],
      keyMilestone: 'Target -3.5 years biological age delta reduction across all 9 major organ systems.'
    }
  ];
}

export function generateExecutiveReport(user: UserProfile): ExecutiveHealthspanReport {
  const systems = calculateOrganSystems(user);
  const chronAge = user.age || 42;
  const avgBioAge = Math.round((systems.reduce((acc, s) => acc + s.biologicalAge, 0) / systems.length) * 10) / 10;
  const longevityAdvantage = Math.round((chronAge - avgBioAge) * 10) / 10;
  const avgReserve = Math.round(systems.reduce((acc, s) => acc + s.biologicalReservePercent, 0) / systems.length);

  // Top 3 opportunities
  const opportunities = [
    {
      system: 'Endocrine & HPA Axis',
      priority: 'High' as const,
      observation: 'Occasional diurnal cortisol elevation triggered by executive workload and travel schedule.',
      actionableProtocol: 'Ashwagandha Sensoril® 250mg + 10-minute evening parasympathetic decompression.'
    },
    {
      system: 'Metabolic & Glycemic System',
      priority: 'Medium' as const,
      observation: 'Fasting glucose fluctuates around 92 mg/dL during high-carb dining events.',
      actionableProtocol: 'Glucovantage® Dihydroberberine (100mg) 15 minutes before high glycemic meals.'
    },
    {
      system: 'Cardiovascular & Vascular Dynamics',
      priority: 'Routine' as const,
      observation: 'ApoB is well-controlled at 62 mg/dL with low hs-CRP (0.4 mg/L); continue high-EPA omega-3.',
      actionableProtocol: 'High-EPA Triglyceride Omega-3 (2000mg EPA) daily with evening meal.'
    }
  ];

  return {
    overallBiologicalAge: avgBioAge,
    chronologicalAge: chronAge,
    longevityAdvantageYears: longevityAdvantage,
    paceOfAging: 0.82, // 0.82 bio years per calendar year
    overallReserveScore: avgReserve,
    topOpportunities: opportunities,
    systemBreakdown: systems,
    generatedAt: 'August 2026',
    physicianReviewStatus: 'Reviewed & Signed'
  };
}

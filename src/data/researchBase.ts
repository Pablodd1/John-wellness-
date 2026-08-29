/**
 * Performance Research Base — human-trial evidence for training methods and
 * ergogenic aids in recreational and professional athletes.
 *
 * Every entry below was compiled from published meta-analyses, position stands
 * (ISSN, IOC), and landmark RCTs, with a citation link. Grades follow this rubric:
 *   A — consistent human-trial evidence: meta-analyses and/or position stands
 *   B — promising: single landmark RCTs or meta-analyses with mixed results
 *   C — emerging: limited or inconsistent human-trial support
 *
 * This is educational content, not medical advice. Competitive athletes must
 * verify every product against the WADA Prohibited List and prefer batch-tested
 * certification (Informed Sport / NSF Certified for Sport).
 */

export type AthleteLevel = 'recreational' | 'professional' | 'both';

export type ResearchGrade = 'A' | 'B' | 'C';

export type ResearchCategory = 'Ergogenic Aid' | 'Training Method' | 'Recovery' | 'Medical';

export type ResearchFinding = {
  id: string;
  name: string;
  category: ResearchCategory;
  level: AthleteLevel;
  grade: ResearchGrade;
  effectSize: string;
  summary: string;
  dose: string;
  caveats: string[];
  citation: { title: string; source: string; year: number; url: string };
};

export const RESEARCH_GRADE_LEGEND: Record<ResearchGrade, string> = {
  A: 'Consistent human-trial evidence — meta-analyses and/or position stands',
  B: 'Promising — landmark RCTs, or meta-analyses with mixed results',
  C: 'Emerging — limited or inconsistent human-trial support',
};

export const RESEARCH_FINDINGS: ResearchFinding[] = [
  // ---------------- Ergogenic aids ----------------
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'A',
    effectSize: '+5–15% max strength/power vs placebo',
    summary:
      'The most effective legal ergogenic supplement available. Human trials consistently show 5–15% gains in maximal strength/power and repeated-sprint work, and roughly 8% greater 1RM gains when added to resistance training. Benefits are largest in untrained athletes but persist in trained ones.',
    dose: '3–5 g/day every day (optional load: 20 g/day split × 5–7 days). Timing does not matter — daily consistency does. Use plain monohydrate; fancier forms add cost, not evidence.',
    caveats: [
      'Typical 1–2 kg water-weight gain inside the muscle (lean mass, not bloat under the skin)',
      'Mild GI upset in a minority — split the dose',
      'Drink normally; creatine does not damage healthy kidneys (verified across long-term trials) but disclose use in medical check-ups',
    ],
    citation: {
      title: 'ISSN position stand: safety and efficacy of creatine supplementation (Kreider et al.)',
      source: 'Journal of the International Society of Sports Nutrition',
      year: 2017,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5469049/',
    },
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'A',
    effectSize: '≈2–4% faster endurance time trials',
    summary:
      'An umbrella review of 21 meta-analyses confirms caffeine is ergogenic for endurance, muscular strength, and power. Meta-analysis of 56 time-trial studies shows a small but significant endurance effect (~3% mean improvement) at moderate doses.',
    dose: '3–6 mg/kg bodyweight, 30–60 min before exercise (recent meta-analyses favor 4–6 mg/kg). Trial in training first — coffee, gum, and tablets all work.',
    caveats: [
      'Large responder variability (CYP1A2 genotype, habitual intake)',
      'Late-day use can degrade sleep — which costs more performance than caffeine buys',
      'Removed from the WADA Prohibited List since 2004 but still monitored; check your sport',
    ],
    citation: {
      title: 'ISSN position stand: caffeine and exercise performance (Guest et al.)',
      source: 'Journal of the International Society of Sports Nutrition',
      year: 2021,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7777221/',
    },
  },
  {
    id: 'beta-alanine',
    name: 'Beta-Alanine',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'A',
    effectSize: 'Median +2.85% in high-intensity exercise capacity',
    summary:
      'Raises muscle carnosine (~40–60%) and intracellular pH buffering. Meta-analysis shows a median 2.85% improvement, with the biggest benefit in 1–4 minute high-intensity efforts (updated meta-analyses extend this to 4–10 min maximal exercise). Best fit: rowing, swimming, track, CrossFit-style and combat sports.',
    dose: '4–6.4 g/day, split into 0.8–1.6 g doses, for ≥4 weeks. It is a chronic loading supplement — acute dosing on race day does nothing.',
    caveats: [
      'Harmless skin tingling (paresthesia) at single doses >800–1600 mg — split doses to avoid',
      'No meaningful benefit for very short (<60 s) or long (>25 min) events',
    ],
    citation: {
      title: 'Effects of β-alanine supplementation on exercise performance (Hobson et al., meta-analysis)',
      source: 'Amino Acids',
      year: 2012,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3374095/',
    },
  },
  {
    id: 'nitrate',
    name: 'Dietary Nitrate (Beetroot Juice)',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'B',
    effectSize: '≈1–3% faster time trials (inconsistent)',
    summary:
      'Reduces the oxygen cost of submaximal exercise. Meta-analyses show ~1–3% time-trial gains, but responses are inconsistent — only ~38% of high-intensity endurance studies found significant TT improvement. Effects are strongest in recreational and sub-elite athletes and shrink in elites.',
    dose: '6–16 mmol nitrate (~500 mL beetroot juice or 2 concentrated shots) 2–3 h before exercise; daily dosing for multi-day benefit.',
    caveats: [
      'Avoid antibacterial mouthwash around dosing — it kills the oral bacteria that convert nitrate',
      'Response varies a lot between individuals; test in training',
      'Elite athletes show attenuated responses vs recreational',
    ],
    citation: {
      title: 'Effects of beetroot juice supplementation on cardiorespiratory endurance in athletes (Domínguez et al., systematic review)',
      source: 'Nutrients',
      year: 2017,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5295087/',
    },
  },
  {
    id: 'bicarbonate',
    name: 'Sodium Bicarbonate',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'B',
    effectSize: 'Small but meaningful gains in 30 s–12 min events',
    summary:
      'Boosts extracellular buffering for high-intensity exercise lasting ~30 seconds to 12 minutes (track, rowing, combat sports, intermittent sprinting). The ISSN position stand deems 0.3 g/kg sufficient — higher single doses add GI risk, not performance.',
    dose: '0.3 g/kg bodyweight, 60–180 min before exercise, with fluid and food. Multi-day serial loading protocols can reduce GI issues.',
    caveats: [
      'GI distress is common and performance-ruining if untested — rehearse in training, never on race day first',
      'Large sodium load — check with a physician if blood pressure is a concern',
    ],
    citation: {
      title: 'Sodium bicarbonate supplementation and exercise performance (Grgic et al., ISSN position stand)',
      source: 'Journal of the International Society of Sports Nutrition',
      year: 2021,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8427947/',
    },
  },
  {
    id: 'protein',
    name: 'Protein Intake (Foundational)',
    category: 'Recovery',
    level: 'both',
    grade: 'A',
    effectSize: 'Plateau at ~1.6 g/kg/day (upper CI 2.2)',
    summary:
      'Not a magic aid — the base everything else sits on. Meta-regression of 49 RCTs shows resistance-training gains in fat-free mass and strength rise with protein intake up to ~1.6 g/kg/day, beyond which more adds nothing meaningful. Adequate protein also protects lean mass in endurance blocks and weight cuts.',
    dose: '1.6–2.2 g/kg/day, spread over 3–5 meals of 0.3–0.4 g/kg. Whole food is fine; supplements are a convenience, not a requirement.',
    caveats: [
      'Total daily intake matters far more than the "anabolic window"',
      'Kidney-healthy athletes show no harm in trials; those with kidney disease need medical guidance',
    ],
    citation: {
      title: 'Protein supplementation and resistance-training gains in muscle mass and strength (Morton et al., meta-analysis)',
      source: 'British Journal of Sports Medicine',
      year: 2018,
      url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/',
    },
  },
  {
    id: 'vitamin-d-iron',
    name: 'Vitamin D & Iron (Deficiency Correction)',
    category: 'Medical',
    level: 'both',
    grade: 'A',
    effectSize: 'Restores performance when deficient; no effect when replete',
    summary:
      'Medical supplements in the AIS Group A framework. Iron deficiency is common in endurance and female athletes and directly limits performance; vitamin D insufficiency affects muscle function and bone. The evidence for benefit exists for correcting deficiency — megadosing when already replete shows no ergogenic effect.',
    dose: 'Test, don\'t guess: ferritin + hemoglobin and 25(OH)D bloodwork before supplementing; correct under medical supervision.',
    caveats: [
      'Iron overload is toxic — never supplement blind',
      'Fat-soluble vitamin D accumulates; keep doses guided by bloodwork',
    ],
    citation: {
      title: 'IOC consensus statement: dietary supplements and the high-performance athlete (Maughan et al.)',
      source: 'British Journal of Sports Medicine',
      year: 2018,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5867441/',
    },
  },
  {
    id: 'citrulline',
    name: 'Citrulline Malate',
    category: 'Ergogenic Aid',
    level: 'both',
    grade: 'C',
    effectSize: 'Mixed — some RCTs show more reps / less soreness',
    summary:
      'Classified "Group B — emerging support" in the AIS framework. Some trials show improved repetition volume in resistance training and reduced soreness, but meta-analytic support is not yet consistent enough for a firm recommendation. Worth trialing only after the Group A basics are in place.',
    dose: '6–8 g, ~60 min pre-training (if trialing).',
    caveats: [
      'Evidence base is smaller and less consistent than the aids above',
      'Marketing usually overstates the current science',
    ],
    citation: {
      title: 'AIS Sports Supplement Framework — Group B (emerging support)',
      source: 'Australian Institute of Sport',
      year: 2024,
      url: 'https://www.ausport.gov.au/ais/nutrition/supplements',
    },
  },

  // ---------------- Training methods ----------------
  {
    id: 'hiit-4x4',
    name: 'High-Intensity Intervals (Norwegian 4×4)',
    category: 'Training Method',
    level: 'both',
    grade: 'A',
    effectSize: '≈7% VO2max gain in 8 weeks',
    summary:
      'The most-studied HIIT protocol for raising VO2max: 4 × 4 min at 90–95% HRmax with 3 min active recovery. The original trial beat moderate continuous training and other interval formats; meta-analyses confirm HIIT outperforms other modalities for VO2max gains (SMD ≈ 0.56).',
    dose: '2–3 sessions/week, never on consecutive days, layered on top of — not instead of — easy base volume.',
    caveats: [
      'High physiological stress: scale to 3–4 × 4 min when starting',
      'Recovery days matter more as interval density rises',
    ],
    citation: {
      title: 'Aerobic high-intensity intervals improve VO2max more than moderate training (Helgerud et al.)',
      source: 'Medicine & Science in Sports & Exercise',
      year: 2007,
      url: 'https://pubmed.ncbi.nlm.nih.gov/17504771/',
    },
  },
  {
    id: 'strength-endurance',
    name: 'Strength Training for Endurance Athletes',
    category: 'Training Method',
    level: 'both',
    grade: 'A',
    effectSize: '≈2–4% better running economy + TT gains',
    summary:
      'Meta-analyses in middle- and long-distance athletes consistently show heavy (~90% 1RM) and explosive/plyometric strength work improves economy and time-trial performance. The effect is more consistent in the literature than any single supplement.',
    dose: '2 sessions/week of heavy or explosive work for 8–12+ weeks; keep it away from key key sessions (same-day pairing: lift after hard runs/rides, not before).',
    caveats: [
      'Expect soreness early — start in a base block, not a peak week',
      'Interference with endurance adaptations is small when volume is managed',
    ],
    citation: {
      title: 'Effect of strength training programs in middle- and long-distance runners (Llanos-Lagos et al., systematic review)',
      source: 'Sports Medicine',
      year: 2024,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/',
    },
  },
  {
    id: 'polarized',
    name: 'Polarized / 80-20 Intensity Distribution',
    category: 'Training Method',
    level: 'both',
    grade: 'B',
    effectSize: 'Modest edge in early RCTs; evidence mixed',
    summary:
      'Mostly-easy / some-very-hard training. Early randomized trials favored polarized over threshold models for VO2max and time-to-exhaustion in well-trained athletes, and a 2022 meta-analysis found a modest edge — but recent reviews emphasize the evidence is conflicting, and observational data show elites predominantly train pyramidal/threshold. Treat 80/20 as a descriptive pattern, not a magic ratio.',
    dose: 'If experimenting: ~80% of weekly volume below ventilatory threshold 1, ~20% distributed above threshold, rather than the common "moderately hard everything" pattern.',
    caveats: [
      'Athletes at different tiers respond differently — juniors and recreational athletes may need more threshold work',
      'The popular "80/20" marketing overstates what the trials showed',
    ],
    citation: {
      title: 'Comparison of polarized versus other types of endurance training (Oliveira et al., systematic review)',
      source: 'Springer',
      year: 2024,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11329428/',
    },
  },
  {
    id: 'tapering',
    name: 'Competition Taper',
    category: 'Training Method',
    level: 'both',
    grade: 'A',
    effectSize: '≈2–3% performance gain at peak',
    summary:
      'Meta-analytic evidence shows a progressive taper — cutting training volume ~40–60% over ~8–14 days while maintaining intensity and frequency — produces peak performance gains of roughly 2–3% at the right moment. One of the most reliable "free" gains in sport.',
    dose: '8–14 days before a key event; reduce volume progressively, keep touch of race intensity, do not add new work.',
    caveats: [
      'Athletes often fear losing fitness — the data say the opposite',
      'Practice the taper at a minor race before using it at a major one',
    ],
    citation: {
      title: 'Effects of tapering on performance (Mujika & Padilla, review of meta-analytic evidence)',
      source: 'Sports Medicine',
      year: 2003,
      url: 'https://pubmed.ncbi.nlm.nih.gov/12908818/',
    },
  },
  {
    id: 'sleep-extension',
    name: 'Sleep Extension',
    category: 'Recovery',
    level: 'both',
    grade: 'B',
    effectSize: '−0.7 s sprint time, +9% shooting accuracy',
    summary:
      'The landmark trial extended collegiate basketball players\' sleep toward 10 h/night for several weeks: faster sprints, ~9% better free-throw and three-point accuracy, and quicker reaction times. Sleep is the highest-leverage recovery intervention with the fewest side effects.',
    dose: 'Target 8–10 h/night; add a 20–30 min nap post-training. Prioritize extension across the 1–2 weeks before competition.',
    caveats: [
      'Chronic sleep debt can\'t be fixed in one night — extension works over weeks',
      'Caffeine late in the day undermines the whole strategy',
    ],
    citation: {
      title: 'The effects of sleep extension on the athletic performance of collegiate basketball players (Mah et al.)',
      source: 'Sleep',
      year: 2011,
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3119836/',
    },
  },
];

export const RESEARCH_FRAMEWORK_NOTES = {
  ais: {
    title: 'AIS ABCD Classification',
    body:
      'The Australian Institute of Sport ranks supplements: Group A (evidence-based — creatine, caffeine, beta-alanine, bicarbonate, nitrate, plus medical iron/vitamin D), Group B (emerging — citrulline, collagen, tart cherry), Group C (little meaningful proof — most "new" products start here), Group D (banned or high contamination risk — never use).',
    url: 'https://www.ausport.gov.au/ais/nutrition/supplements',
  },
  ioc: {
    title: 'IOC Consensus (2018)',
    body:
      '"Food first" — a quality diet pays far bigger dividends than any supplement. Assess nutrition comprehensively before adding supplements, trial everything in training before competition, and treat supplement use as carrying inherent contamination risk.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5867441/',
  },
  wada: {
    title: 'WADA & Batch-Testing',
    body:
      'WADA\'s position: supplements are taken entirely at the athlete\'s own risk — no product can be guaranteed free of prohibited substances. Competitive athletes should use batch-tested programs: Informed Sport (every batch screened for 250+ banned substances) or NSF Certified for Sport, and check anything unusual against the current Prohibited List.',
    url: 'https://www.wada-ama.org/en/prohibited-list',
  },
};

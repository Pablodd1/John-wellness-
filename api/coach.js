/**
 * Vercel serverless function: POST /api/coach
 *
 * The conversational AI coach ("Quasar Keel" role) backed by Gemini, with the
 * product catalog and the caller's profile/consent context injected as system
 * context — a lightweight, dependency-free RAG substitute that is honest about
 * being rule-free but source-grounded.
 *
 * Request:  { message: string, context?: { profileSummary?: string, goals?: string[], topProducts?: {name, category, price, dosage, reason}[] } }
 * Response: { reply: string } or 501 when GEMINI_API_KEY is absent.
 *
 * The key is server-side only. Safety: the model is instructed to be a
 * wellness/education assistant, never to prescribe, and to escalate emergencies.
 */

const MODEL = 'gemini-flash-latest';

import { requireUser } from '../lib/api-auth.mjs';

function synthesizeCoachFallback(message, ctx) {
  const q = String(message || '').toLowerCase();
  const details = ctx?.profileDetails || ctx?.voiceLayerContext?.profile?.details || {};
  const vlCtx = ctx?.voiceLayerContext || {};
  const passages = Array.isArray(vlCtx?.pagePassages) ? vlCtx.pagePassages : [];
  const catalog = Array.isArray(ctx?.topProducts) ? ctx.topProducts : [];

  if (/(readiness|recovery|score)/i.test(q) && details.readiness) {
    return `Your readiness score is ${details.readiness.score}/100 (${details.readiness.status}). ${details.readiness.recommendation}`;
  }
  if (/(sleep|hrv|rhr|heart rate|resting|training load)/i.test(q) && details.metrics) {
    const m = details.metrics;
    return `Your live biometrics: Sleep ${m.sleep?.current}h (baseline ${m.sleep?.baseline}h), HRV ${m.hrv?.current}ms (baseline ${m.hrv?.baseline}ms), resting heart rate ${m.rhr?.current} bpm, and training load ${m.trainingLoad?.current}.`;
  }
  if (/(workout|training|exercise|zone 2|plan)/i.test(q) && details.trainingPlan) {
    const t = details.trainingPlan;
    return `Today's training plan is ${t.todaysWorkout} (${t.recommendedIntensity}). ${t.adjustmentReason}`;
  }
  if (/(calorie|macro|protein|carb|fat|hydrat|water|nutrition)/i.test(q) && details.nutrition) {
    const n = details.nutrition;
    return `Your daily nutrition target is ${n.dailyCalorieTarget} kcal: ${n.macros?.proteinGrams}g protein, ${n.macros?.carbsGrams}g carbs, ${n.macros?.fatGrams}g fat, and ${n.hydrationLiters}L hydration (${n.electrolyteNeeds}).`;
  }
  if (/(organ|biological age|bio age|aosm|cardio|metabolic|neuro)/i.test(q) && (details.organHealth || details.biologicalAge)) {
    const orgs = Array.isArray(details.organHealth)
      ? details.organHealth.slice(0, 4).map((o) => `${o.name}: bio-age ${o.biologicalAge} (${o.status}, ${o.biologicalReservePercent}% reserve)`).join('; ')
      : '';
    return `Your overall biological age is ${details.biologicalAge} vs chronological age ${details.age}. ${orgs}.`;
  }
  if (/(biomarker|blood|lab|apob|crp|glucose|hba1c|testosterone|vitamin d|cortisol|vo2|dexa)/i.test(q) && details.biomarkers) {
    return `Your recorded lab biomarkers and diagnostics: ${details.biomarkers}.`;
  }
  if (/(protocol|sauna|cold plunge|breathwork|light|biohack)/i.test(q) && Array.isArray(details.biohackingProtocols)) {
    return `Active biohacking protocols: ${details.biohackingProtocols.slice(0, 3).map((b) => `${b.title} (${b.protocol})`).join('; ')}.`;
  }
  if (/(stack|regimen|supplement|taking|inventory)/i.test(q) && Array.isArray(details.activeRegimen)) {
    return `Your active supplement regimen: ${details.activeRegimen.map((p) => `${p.name} (${p.dosage}, ${p.timing}, ${p.daysRemaining ?? 14}d left)`).join('; ')}.`;
  }

  const qWords = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3 && !/^(what|which|where|when|how|who|why|the|this|that|for|are|can|you|your|tell|about)$/.test(w));
  if (passages.length && qWords.length) {
    let bestP = null;
    let bestScore = 0;
    for (const p of passages) {
      const h = String(p.heading || '').toLowerCase();
      const b = `${h} ${String(p.text || '').toLowerCase()}`;
      let hits = 0;
      for (const w of qWords) if (b.includes(w)) hits += h.includes(w) ? 2.2 : 1;
      if (hits > bestScore) { bestScore = hits; bestP = p; }
    }
    if (bestP && bestScore >= 1) {
      return bestP.heading ? `${bestP.heading}: ${String(bestP.text || '').slice(0, 280)}` : String(bestP.text || '').slice(0, 280);
    }
  }

  if (catalog.length && qWords.length) {
    const match = catalog.find((c) => qWords.some((w) => String(c.name || '').toLowerCase().includes(w) || String(c.category || '').toLowerCase().includes(w)));
    if (match) {
      return `${match.name} (${match.category}, $${match.price})${match.dosage ? ` — typical serving: ${match.dosage}` : ''}${match.reason ? `. ${match.reason}` : ''}.`;
    }
  }

  if (ctx?.profileSummary) {
    return `Based on your CuasarX profile: ${ctx.profileSummary}`;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  // Verify user if token provided, but allow guest/demo mode voice queries to proceed with supplied context
  await requireUser(req).catch(() => null);

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 2000) {
    res.status(400).json({ error: 'INVALID_MESSAGE' });
    return;
  }

  const ctx = req.body?.context ?? {};
  const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
  const geminiKey = process.env.GEMINI_API_KEY || '';

  if (!deepseekKey && !xaiKey && !geminiKey) {
    const synthesized = synthesizeCoachFallback(message, ctx);
    if (synthesized) {
      res.status(200).json({ reply: synthesized, provider: 'context-synthesis' });
      return;
    }
    res.status(501).json({
      error: 'LIVE_AI_NOT_CONFIGURED',
      message: 'Set DEEPSEEK_API_KEY, XAI_API_KEY, or GEMINI_API_KEY as a server-side environment variable to enable the live coach.',
    });
    return;
  }

  const catalog = Array.isArray(ctx.topProducts) ? ctx.topProducts.slice(0, 12) : [];
  const vlCtx = ctx.voiceLayerContext || {};
  const passages = Array.isArray(vlCtx.pagePassages) ? vlCtx.pagePassages.slice(0, 12) : [];

  const systemParts = [
    'You are "Quasar Keel", the AI wellness and site assistant inside the CuasarX Longevity By Keel platform. You are educational-wellness software, NOT a doctor or licensed clinician of any kind: never prescribe, diagnose, or claim (or imply) medical authority — if asked, state plainly that you are an AI assistant, not a doctor, and that a real physician must make all medical decisions.',
    'Rules: base supplement statements on human-trial evidence; give doses only where well-established (e.g., creatine 3-5 g/day); recommend the user consult a physician or registered dietitian for personal decisions; if the user describes a medical emergency or severe symptoms, tell them to stop and call 911; never invent products that are not in the catalog below; never invent clinical lab values for the user.',
    'You have complete visibility into the caller’s CuasarX profile, biometrics, organ longevity (AOSM), lab biomarkers, training plan, nutrition macros, active supplement regimen, and the current website section/passages. Answer questions about the website or the user’s profile directly and accurately using the numbers below.',
    'Be concise (under 90 words for voice), warm, and practical.',
  ];

  if (ctx.profileSummary) {
    systemParts.push(`Caller profile summary: ${ctx.profileSummary}`);
  }
  if (ctx.profileDetails) {
    systemParts.push(`Detailed profile & organ/lab telemetry: ${JSON.stringify(ctx.profileDetails).slice(0, 2800)}`);
  }
  if (Array.isArray(ctx.goals) && ctx.goals.length) {
    systemParts.push(`Stated goals: ${ctx.goals.join(', ')}.`);
  }
  if (passages.length) {
    systemParts.push(
      'Absorbed website sections & platform facts:\n' +
        passages.map((p) => `- ${p.heading ? p.heading + ': ' : ''}${p.text}`).join('\n')
    );
  }
  if (catalog.length) {
    systemParts.push(
      'Available product catalog (recommend only from this list when suggesting products):\n' +
        catalog.map((p) => `- ${p.name} (${p.category}, $${p.price})${p.dosage ? ` — typical: ${p.dosage}` : ''}${p.reason ? ` — fits: ${p.reason}` : ''}`).join('\n')
    );
  }

  const systemPrompt = systemParts.join('\n');

  try {
    // Priority 1: DeepSeek V3.2 Fast ($0.07-$0.14/1M) or xAI Grok-3-Mini-Fast
    if (deepseekKey || xaiKey) {
      const useDeepSeek = Boolean(deepseekKey);
      const url = useDeepSeek ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
      const key = useDeepSeek ? deepseekKey : xaiKey;
      const modelName = useDeepSeek ? 'deepseek-chat' : 'grok-4-fast';

      const fastRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.4,
          max_tokens: 320,
        }),
      });

      if (fastRes.ok) {
        const fastData = await fastRes.json();
        const fastReply = (fastData?.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        if (fastReply) {
          res.status(200).json({ reply: fastReply, provider: modelName });
          return;
        }
      }
    }

    // Priority 2: Gemini Flash Fallback
    if (!geminiKey) {
      const synthesized = synthesizeCoachFallback(message, ctx);
      if (synthesized) {
        res.status(200).json({ reply: synthesized, provider: 'context-synthesis' });
        return;
      }
      res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
      return;
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!upstream.ok) {
      const synthesized = synthesizeCoachFallback(message, ctx);
      if (synthesized) {
        res.status(200).json({ reply: synthesized, provider: 'context-synthesis' });
        return;
      }
      res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
      return;
    }

    const data = await upstream.json();
    const reply = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p) => (typeof p.text === 'string' ? p.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!reply) {
      res.status(502).json({ error: 'AI_EMPTY_RESPONSE' });
      return;
    }
    res.status(200).json({ reply, provider: MODEL });
  } catch {
    const synthesized = synthesizeCoachFallback(message, ctx);
    if (synthesized) {
      res.status(200).json({ reply: synthesized, provider: 'context-synthesis' });
      return;
    }
    res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
  }
}

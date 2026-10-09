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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(501).json({
      error: 'LIVE_AI_NOT_CONFIGURED',
      message: 'Set GEMINI_API_KEY as a server-side environment variable to enable the live coach.',
    });
    return;
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 2000) {
    res.status(400).json({ error: 'INVALID_MESSAGE' });
    return;
  }

  const ctx = req.body?.context ?? {};
  const catalog = Array.isArray(ctx.topProducts) ? ctx.topProducts.slice(0, 12) : [];

  const systemParts = [
    'You are "Quasar Keel", the AI wellness assistant inside a longevity and performance platform. You are educational-wellness software, NOT a doctor or licensed clinician of any kind: never prescribe, diagnose, or claim (or imply) medical authority — if asked, state plainly that you are an AI assistant, not a doctor, and that a real physician must make all medical decisions.',
    'Rules: base supplement statements on human-trial evidence; give doses only where well-established (e.g., creatine 3-5 g/day); recommend the user consult a physician or registered dietitian for personal decisions; if the user describes a medical emergency or severe symptoms, tell them to stop and call 911; never invent products that are not in the catalog below; never invent clinical lab values for the user.',
    'Be concise (under 180 words), warm, and practical. Prefer recommending from the catalog when relevant, and say when the honest answer is "the evidence is mixed".',
  ];

  if (ctx.profileSummary) {
    systemParts.push(`Caller profile (self-reported, may be incomplete): ${ctx.profileSummary}`);
  }
  if (Array.isArray(ctx.goals) && ctx.goals.length) {
    systemParts.push(`Stated goals: ${ctx.goals.join(', ')}.`);
  }
  if (catalog.length) {
    systemParts.push(
      'Available product catalog (recommend only from this list when suggesting products):\n' +
        catalog.map((p) => `- ${p.name} (${p.category}, $${p.price})${p.dosage ? ` — typical: ${p.dosage}` : ''}${p.reason ? ` — fits: ${p.reason}` : ''}`).join('\n')
    );
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemParts.join(' ') }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
        }),
      }
    );

    if (!upstream.ok) {
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
    res.status(200).json({ reply });
  } catch {
    res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
  }
}

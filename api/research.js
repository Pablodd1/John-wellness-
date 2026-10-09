/**
 * Vercel serverless function: POST /api/research
 *
 * Generates a live research brief with Google Gemini + Google Search grounding.
 * The GEMINI_API_KEY is read from SERVER-side environment variables only — it is
 * never shipped to the browser (the client bundle cannot reach this secret).
 * Set it in Vercel → Project → Settings → Environment Variables.
 *
 * Falls back with HTTP 501 when the key is absent so the client can show an
 * honest "live AI not configured" state instead of pretending.
 */

const MODEL = 'gemini-flash-latest';

const SYSTEM_PROMPT = [
  'You are a sports-science research assistant for a wellness platform.',
  'Using Google Search grounding, answer with HUMAN-TRIAL evidence only (randomized controlled trials, meta-analyses, systematic reviews, and position stands such as ISSN, IOC, ACSM, AIS).',
  'Cover recreational and professional athletes where the evidence differs, and include concrete effect sizes, doses, and timings where trials support them.',
  'Cite the specific studies or position stands you relied on.',
  'Be honest about mixed or inconsistent evidence. Do not invent studies, statistics, or citations.',
  'End with a one-line reminder that this is educational, not medical advice, and that competitive athletes must check the WADA Prohibited List.',
].join(' ');

import { requireUser, unauthorized } from './_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const user = await requireUser(req);
  if (!user) { unauthorized(res); return; }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(501).json({
      error: 'LIVE_AI_NOT_CONFIGURED',
      message: 'Set GEMINI_API_KEY as a server-side environment variable to enable live research briefs.',
    });
    return;
  }

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 2000) {
    res.status(400).json({ error: 'INVALID_QUESTION' });
    return;
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: question }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );

    if (!upstream.ok) {
      res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
      return;
    }

    const data = await upstream.json();
    const candidate = data?.candidates?.[0];
    const brief = (candidate?.content?.parts ?? [])
      .map((part) => (typeof part.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('\n\n');

    if (!brief) {
      res.status(502).json({ error: 'AI_EMPTY_RESPONSE' });
      return;
    }

    const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
      .map((chunk) => ({ title: chunk?.web?.title ?? 'Source', uri: chunk?.web?.uri }))
      .filter((source) => Boolean(source.uri));

    res.status(200).json({ brief, sources, generatedAt: new Date().toISOString() });
  } catch {
    res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
  }
}

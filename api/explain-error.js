/**
 * Vercel serverless function: POST /api/explain-error
 *
 * Uses the server-side Gemini key to explain a runtime error and suggest a
 * fix. Input: { message, stack?, component?, url? } → { explanation, fix }.
 * Falls back with 501 when GEMINI_API_KEY is not configured.
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
    res.status(501).json({ error: 'LIVE_AI_NOT_CONFIGURED' });
    return;
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.slice(0, 500) : '';
  if (!message) {
    res.status(400).json({ error: 'INVALID_MESSAGE' });
    return;
  }
  const stack = typeof req.body?.stack === 'string' ? req.body.stack.slice(0, 3000) : '';
  const component = typeof req.body?.component === 'string' ? req.body.component.slice(0, 500) : '';

  const prompt = [
    'You are a senior debugging assistant for a React 19 + Vite + Supabase web app (TypeScript, Tailwind, deployed on Vercel serverless functions).',
    'Explain the following runtime error and suggest the most likely fix. Be concrete: name the likely file/cause pattern, the mechanism, and a one-paragraph fix. If the stack is minified, say what the error class usually means in this stack. Max 150 words.',
    '',
    `Error: ${message}`,
    stack ? `\nStack (possibly minified):\n${stack}` : '',
    component ? `\nReact component stack:\n${component}` : '',
  ].join('\n');

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
        }),
      }
    );
    if (!upstream.ok) {
      res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
      return;
    }
    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p) => (typeof p.text === 'string' ? p.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!text) {
      res.status(502).json({ error: 'AI_EMPTY_RESPONSE' });
      return;
    }
    res.status(200).json({ explanation: text });
  } catch {
    res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
  }
}

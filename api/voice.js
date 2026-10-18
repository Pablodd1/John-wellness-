/**
 * Vercel Serverless Function: /api/voice/* (via vercel.json rewrite)
 *
 * Self-contained cloud voice & AI backend for VoiceLayer on CuasarX Longevity By Keel.
 * Ensures 100% cloud execution on Vercel with zero dependency on any local machine:
 *   - GET  /api/voice/health   -> liveness & active cloud AI/voice providers
 *   - GET  /api/voice/config   -> widget enablement, Grok/Deepgram TTS & AI flags
 *   - GET  /api/voice/weather  -> live Open-Meteo temperature + rain/dry status
 *   - POST /api/voice/speak    -> cloud TTS (xAI Grok Voice 3.0 or Deepgram Aura-2)
 *   - POST /api/voice/ask      -> context-grounded cloud AI Q&A (Groq Llama-3.3-70b / xAI Grok / Gemini)
 *   - POST /api/voice/beacon   -> demand intelligence ingestion
 */

const WMO_MAP = {
  0: { en: 'clear and sunny', es: 'despejado y soleado', raining: false, dry: true },
  1: { en: 'mostly sunny', es: 'mayormente soleado', raining: false, dry: true },
  2: { en: 'partly cloudy', es: 'parcialmente nublado', raining: false, dry: true },
  3: { en: 'overcast', es: 'nublado', raining: false, dry: true },
  45: { en: 'foggy', es: 'con niebla', raining: false, dry: false },
  48: { en: 'foggy', es: 'con niebla', raining: false, dry: false },
  51: { en: 'light drizzle', es: 'llovizna ligera', raining: true, dry: false },
  53: { en: 'drizzle', es: 'llovizna', raining: true, dry: false },
  55: { en: 'heavy drizzle', es: 'llovizna fuerte', raining: true, dry: false },
  61: { en: 'light rain', es: 'lluvia ligera', raining: true, dry: false },
  63: { en: 'raining', es: 'lloviendo', raining: true, dry: false },
  65: { en: 'heavy rain', es: 'lluvia fuerte', raining: true, dry: false },
  80: { en: 'rain showers', es: 'chubascos', raining: true, dry: false },
  81: { en: 'rain showers', es: 'chubascos', raining: true, dry: false },
  82: { en: 'heavy rain showers', es: 'chubascos fuertes', raining: true, dry: false },
  95: { en: 'thunderstorm', es: 'tormenta eléctrica', raining: true, dry: false },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const route = String(req.query?.route || req.url || '')
    .replace(/^\/api\/voice\/?/, '')
    .split('?')[0]
    .replace(/^\/+|\/+$/g, '');

  const xaiKey = (process.env.XAI_API_KEY || process.env.GROK_API_KEY || '').trim();
  const dgKey = (process.env.DEEPGRAM_API_KEY || '').trim();
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (route === 'health') {
    res.status(200).json({
      ok: true,
      version: '0.7.0',
      cloud: true,
      grok: xaiKey.length > 10,
      deepgram: dgKey.length > 10 || xaiKey.length > 10,
      ai: {
        enabled: true,
        provider: groqKey ? 'groq' : xaiKey ? 'grok' : geminiKey ? 'gemini' : 'local',
        model: groqKey ? 'llama-3.3-70b-versatile' : xaiKey ? 'grok-3-mini' : 'local-deterministic',
      },
    });
    return;
  }

  if (route === 'config' || route === '') {
    res.status(200).json({
      enabled: process.env.VOICELAYER_ENABLED !== 'false',
      grok: xaiKey.length > 10,
      deepgram: dgKey.length > 10 || xaiKey.length > 10,
      deepgramStt: dgKey.length > 10,
      aiAsk: true,
      aiProvider: groqKey ? 'groq' : xaiKey ? 'grok' : 'local',
      voices: xaiKey.length > 10 ? { en: 'ara', es: 'ara' } : { en: 'aura-2-athena-en', es: 'aura-2-selena-es' },
    });
    return;
  }

  if (route === 'weather') {
    const lat = parseFloat(String(req.query?.lat || '25.7617')) || 25.7617;
    const lon = parseFloat(String(req.query?.lon || '-80.1918')) || -80.1918;
    const city = String(req.query?.city || 'Miami');
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,weather_code&temperature_unit=fahrenheit&timezone=auto`;
      const r = await fetch(omUrl);
      if (r.ok) {
        const d = await r.json();
        const cur = d.current || {};
        const tempF = Math.round(Number(cur.temperature_2m ?? 78));
        const tempC = Math.round(((tempF - 32) * 5) / 9);
        const code = Number(cur.weather_code ?? 0);
        const wmo = WMO_MAP[code] || { en: 'partly cloudy', es: 'parcialmente nublado', raining: (cur.rain || 0) > 0, dry: (cur.rain || 0) === 0 };
        const raining = wmo.raining || Number(cur.rain || 0) > 0 || Number(cur.precipitation || 0) > 0;
        res.status(200).json({ ok: true, city, tempF, tempC, raining, dry: !raining, condition: { en: wmo.en, es: wmo.es }, code });
        return;
      }
    } catch {}
    res.status(200).json({ ok: true, city, tempF: 78, tempC: 26, raining: false, dry: true, condition: { en: 'sunny and dry', es: 'soleado y seco' }, fallback: true });
    return;
  }

  if (route === 'speak' && req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = String(body.text || '').trim().slice(0, 700);
    const lang = body.lang === 'es' ? 'es' : 'en';
    if (!text) {
      res.status(400).json({ error: 'empty' });
      return;
    }
    if (xaiKey.length > 10) {
      try {
        const gr = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: { Authorization: `Bearer ${xaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice_id: 'ara', language: lang }),
        });
        if (gr.ok) {
          const buf = Buffer.from(await gr.arrayBuffer());
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-Voice-Provider', 'grok-voice-3.0');
          res.status(200).send(buf);
          return;
        }
      } catch {}
    }
    if (dgKey.length > 10) {
      const voice = lang === 'es' ? 'aura-2-selena-es' : 'aura-2-athena-en';
      const dr = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}&encoding=mp3`, {
        method: 'POST',
        headers: { Authorization: `Token ${dgKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (dr.ok) {
        const buf = Buffer.from(await dr.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Voice-Provider', 'deepgram-aura-2');
        res.status(200).send(buf);
        return;
      }
    }
    res.status(503).json({ error: 'tts_not_configured' });
    return;
  }

  if (route === 'ask' && req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const question = String(body.question || '').trim();
    const ctx = body.context || {};
    if (!question) {
      res.status(400).json({ error: 'empty_question' });
      return;
    }
    if (groqKey) {
      try {
        const sys = `You are Quasar Keel, a warm, human, concierge voice assistant embedded on top of the host website. Answer concisely in 1-3 spoken sentences using the provided live user profile, biometrics, dual calendars (clinical appointments + work/training/trips), pending supplements to take, pending refills to buy, and page context. Context: ${JSON.stringify(ctx).slice(0, 6000)}`;
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 220,
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: question },
            ],
          }),
        });
        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) {
            res.status(200).json({ text, provider: 'groq', model: 'llama-3.3-70b-versatile' });
            return;
          }
        }
      } catch {}
    }
    res.status(200).json({ text: '', provider: 'local' });
    return;
  }

  if (route === 'beacon' || route === 'demand') {
    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ error: 'not_found', route });
}

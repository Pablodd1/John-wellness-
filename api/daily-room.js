/**
 * Vercel serverless function: POST /api/daily-room
 *
 * Creates a short-lived Daily.co video room for a telemedicine visit using the
 * server-side DAILY_API_KEY. The key never reaches the browser. On the free
 * tier rooms expire after the default; we set a 2-hour expiry, no recording.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    res.status(501).json({
      error: 'DAILY_NOT_CONFIGURED',
      message: 'Set DAILY_API_KEY as a server-side environment variable to enable live video visits.',
    });
    return;
  }

  try {
    const upstream = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // room dies after 2 hours
          enable_recording: false,
          enable_chat: true,
          eject_at_room_exp: true,
        },
      }),
    });

    if (upstream.status === 429) {
      res.status(429).json({ error: 'DAILY_RATE_LIMITED' });
      return;
    }
    if (!upstream.ok) {
      res.status(502).json({ error: 'DAILY_UPSTREAM_ERROR' });
      return;
    }

    const data = await upstream.json();
    if (!data?.url) {
      res.status(502).json({ error: 'DAILY_NO_ROOM_URL' });
      return;
    }
    res.status(200).json({ roomUrl: data.url, name: data.name });
  } catch {
    res.status(502).json({ error: 'DAILY_UPSTREAM_ERROR' });
  }
}

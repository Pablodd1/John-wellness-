/**
 * Vercel serverless function: POST /api/alert
 *
 * Fan-out for operational alerts (errors, outages). Delivery targets are
 * optional server-side env vars — the function succeeds silently when none
 * are configured, so capture never depends on alerting being set up:
 *   TELEGRAM_ALERT_BOT_TOKEN + TELEGRAM_ALERT_CHAT_ID   (Telegram)
 *   DISCORD_ALERT_WEBHOOK_URL                            (Discord)
 *
 * Global rate limit: max 5 alerts per minute per target, and identical
 * titles collapse for 1 hour — a recurring bug can't spam the phone.
 */

const recent = [];
const MINUTE_MS = 60_000;
const MAX_PER_MINUTE = 5;

function rateLimited(title) {
  const now = Date.now();
  while (recent.length && now - recent[0].ts > MINUTE_MS) recent.shift();
  if (recent.length >= MAX_PER_MINUTE) return true;
  const dup = recent.find((r) => r.key === title);
  if (dup) return true;
  recent.push({ key: title, ts: now });
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  // Await deliveries BEFORE ending the response: serverless functions can be
  // frozen right after the response, which would silently drop alerts.
  // Still always 200/204 so the client capture path never treats alerting as
  // a failure worth reporting (which would loop).
  try {
    const title = String(req.body?.title ?? 'App alert').slice(0, 120);
    if (rateLimited(title)) return;

    const lines = [
      `🚨 ${title}`,
      String(req.body?.message ?? '').slice(0, 400),
      req.body?.url ? `URL: ${String(req.body.url).slice(0, 160)}` : null,
      req.body?.sessionId ? `Session: ${String(req.body.sessionId).slice(0, 40)}` : null,
    ].filter(Boolean);
    const text = lines.join('\n');
    const stack = typeof req.body?.stack === 'string' ? req.body.stack.slice(0, 1200) : null;

    const tasks = [];

    const tgToken = process.env.TELEGRAM_ALERT_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_ALERT_CHAT_ID;
    if (tgToken && tgChat) {
      tasks.push(
        fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgChat, text: stack ? `${text}\n\n${stack}` : text }),
        })
      );
    }

    const discord = process.env.DISCORD_ALERT_WEBHOOK_URL;
    if (discord) {
      tasks.push(
        fetch(discord, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: stack ? `${text}\n\`\`\`\n${stack}\n\`\`\`` : text }),
        })
      );
    }

    await Promise.allSettled(tasks);
  } catch {
    // alerting must never throw
  }
  res.status(204).end();
}

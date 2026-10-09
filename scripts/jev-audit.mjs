/**
 * Jev Error Audit — scripts/jev-audit.mjs
 *
 * Audits key platform routes and classifies each response with Jev
 * (TypeSafe AI's System-One model, 'jev-1'): fast typed decisions
 * (is_operational, severity, should_alert) instead of generated text.
 *
 * Modes:
 *  - JEV:     TYPESAFE_API_KEY set → every finding is classified by the
 *             jev-1 model with calibrated confidence (~70-500ms per call).
 *  - HEURISTIC: no key → deterministic HTTP status/body rules. Same output
 *             shape, so CI behaves identically in both modes.
 *
 * Notification: when RESEND_API_KEY + NOTIFICATION_EMAIL are set, findings
 * with should_alert=true are emailed via Resend. When ALERT_WEBHOOK_URL is
 * set, they are POSTed as JSON. Neither configured → results stay in stdout
 * and the process exit code (0 = clean, 1 = alertable findings), which is
 * what the GitHub workflow gates on.
 *
 * Usage: BASE_URL=https://john-wellness.vercel.app node scripts/jev-audit.mjs
 */

const MODEL = 'jev-1';

const ROUTES = [
  { name: 'homepage', path: '/', expect: [200] },
  { name: 'env-diagnostics', path: '/api/env-check', expect: [200] },
  { name: 'coach-endpoint', path: '/api/coach', method: 'GET', expect: [405] }, // 405 = alive & method-guarded
  { name: 'research-endpoint', path: '/api/research', method: 'GET', expect: [405] },
  { name: 'sitemap', path: '/sitemap.xml', expect: [200] },
  { name: 'robots', path: '/robots.txt', expect: [200] },
];

const SEVERITY_ORDER = { critical: 3, high: 2, medium: 1, low: 0 };

function heuristicClassify(route, result) {
  if (!result.reachable) {
    return { is_operational: false, severity: 'critical', should_alert: true, reason: 'unreachable/timeout' };
  }
  if (!route.expect.includes(result.status)) {
    return { is_operational: false, severity: result.status >= 500 ? 'critical' : 'high', should_alert: true, reason: `unexpected status ${result.status}` };
  }  if (result.latencyMs > 8000) {
    return { is_operational: true, severity: 'medium', should_alert: true, reason: `degraded latency ${result.latencyMs}ms` };
  }
  return { is_operational: true, severity: 'low', should_alert: false, reason: 'operational' };
}

async function jevClassify(route, result, client, sdk) {
  const verdict = await client.systemOne({
    model: MODEL,
    questions: [
      sdk.choice(
        `You are an SRE monitoring a health e-commerce platform. Classify this route check. Route: ${route.name} (${route.path}). Observed: HTTP ${result.status}, reachable=${result.reachable}, latency=${result.latencyMs}ms, expected=${JSON.stringify(route.expect)}.`,
        {
          operational: 'Route serves its expected response within normal latency; no action needed.',
          degraded: 'Route responds but slowly or with an unexpected (non-5xx) status; investigate soon.',
          broken: 'Route is unreachable, erroring, or returning 5xx; alert immediately.',
        }
      ),
      sdk.score(
        'Rate how urgently a human must be notified about this route check right now.',
        [
          'No urgency — route is operating normally, no action needed.',
          'Investigate soon — degraded but not user-facing.',
          'Alert now — users are affected or the route is broken.',
        ]
      ),
    ],
  });

  // Response shape: answers mirror the questions order.
  const answers = Array.isArray(verdict?.answers) ? verdict.answers : [];
  const choiceAnswer = answers.find((a) => a?.type === 'choice') ?? answers[0];
  const scoreAnswer = answers.find((a) => a?.type === 'score') ?? answers[1];
  const label = choiceAnswer?.label ?? choiceAnswer?.value ?? 'operational';
  const urgency = typeof scoreAnswer?.score === 'number' ? scoreAnswer.score : Number(scoreAnswer?.value ?? 0);
  const isOperational = label === 'operational';
  const severity = label === 'broken' ? 'critical' : label === 'degraded' ? 'medium' : 'low';
  return {
    is_operational: isOperational,
    severity,
    should_alert: !isOperational || urgency >= 0.7,
    reason: `jev-1: ${label}, urgency ${urgency.toFixed(2)}`,
  };
}

async function notify(findings) {
  const alertable = findings.filter((f) => f.classification.should_alert);
  if (alertable.length === 0) return;
  const summary = alertable
    .map((f) => `• [${f.classification.severity}] ${f.route.name} (${f.route.path}): ${f.classification.reason}`)
    .join('\n');

  const resendKey = process.env.RESEND_API_KEY;
  const email = process.env.NOTIFICATION_EMAIL;
  if (resendKey && email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Jev Monitor <onboarding@resend.dev>',
          to: email,
          subject: `🚨 Jev audit: ${alertable.length} alertable finding(s)`,
          text: `Base URL: ${process.env.BASE_URL}\n\n${summary}`,
        }),
      });
      console.log(`📧 Alert emailed to ${email}`);
    } catch (e) {
      console.error('Resend notification failed:', e.message);
    }
  }

  const hook = process.env.ALERT_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🚨 Jev audit (${process.env.BASE_URL})\n${summary}` }),
      });
      console.log('📢 Webhook alert dispatched');
    } catch (e) {
      console.error('Webhook notification failed:', e.message);
    }
  }
}

async function main() {
  const baseUrl = (process.env.BASE_URL ?? 'https://john-wellness.vercel.app').replace(/\/$/, '');
  const apiKey = process.env.TYPESAFE_API_KEY;
  const mode = apiKey ? 'JEV (jev-1)' : 'HEURISTIC (no TYPESAFE_API_KEY)';

  console.log(`🔍 Jev Error Audit — ${new Date().toISOString()}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Mode: ${mode}\n`);

  let client = null;
  let sdk = null;
  if (apiKey) {
    try {
      sdk = await import('@typesafe-ai/sdk');
      client = new sdk.TypeSafeClient({ apiKey });
    } catch (e) {
      console.warn(`⚠ SDK unavailable (${e.message}) — falling back to heuristics`);
    }
  }

  const findings = [];
  for (const route of ROUTES) {
    const started = Date.now();
    let result;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${baseUrl}${route.path}`, {
        method: route.method ?? 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timer);
      result = { reachable: true, status: res.status, latencyMs: Date.now() - started };
    } catch (e) {
      result = { reachable: false, status: 0, latencyMs: Date.now() - started };
    }

    const classification = client
      ? await jevClassify(route, result, client, sdk).catch((e) => {
          console.warn(`⚠ Jev classify failed for ${route.name} (${e.message}) — heuristic used`);
          return heuristicClassify(route, result);
        })
      : heuristicClassify(route, result);

    findings.push({ route, result, classification });

    const icon = classification.is_operational ? (classification.should_alert ? '🟡' : '✅') : '🔴';
    console.log(
      `${icon} ${route.name.padEnd(18)} ${String(result.status).padEnd(4)} ${String(result.latencyMs).padStart(5)}ms  ` +
      `${classification.is_operational ? 'operational' : 'NOT operational'} · ${classification.severity} · alert=${classification.should_alert} · ${classification.reason}`
    );
  }

  console.log('');
  await notify(findings);

  const alertable = findings.filter((f) => f.classification.should_alert);
  const worst = findings.reduce((m, f) => Math.max(m, SEVERITY_ORDER[f.classification.severity] ?? 0), 0);
  console.log(`Summary: ${findings.length} routes · ${findings.filter(f => f.classification.is_operational).length} operational · ${alertable.length} alertable · worst severity: ${['low','medium','high','critical'][worst]}`);

  process.exit(alertable.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Audit crashed:', e);
  process.exit(1);
});

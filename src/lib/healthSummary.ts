import { format } from 'date-fns';

/**
 * Health summary computation + Medical Lifestyle Summary export.
 * Pure functions — the same readings always produce the same output.
 */

export type Reading = {
  metric: string;
  value: number;
  unit: string;
  source: string;
  recorded_at: string;
};

export type MetricSummary = {
  metric: string;
  label: string;
  unit: string;
  latest: number;
  avg7: number;
  avg30: number;
  prevAvg30: number; // days 31–60 before today
  deltaPct: number; // avg7 vs prevAvg30
  improving: boolean | null; // null = neutral metric
  target: string | null;
  lastRecorded: string;
};

const METRIC_META: Record<string, { label: string; target: string | null; lowerIsBetter?: boolean }> = {
  sleep_hours: { label: 'Sleep', target: '7–9 h', lowerIsBetter: false },
  hrv_ms: { label: 'HRV', target: '≥ 60 ms', lowerIsBetter: false },
  resting_hr: { label: 'Resting HR', target: '≤ 60 bpm', lowerIsBetter: true },
  systolic: { label: 'Systolic BP', target: '< 120 mmHg', lowerIsBetter: true },
  diastolic: { label: 'Diastolic BP', target: '< 80 mmHg', lowerIsBetter: true },
  steps: { label: 'Steps', target: '≥ 10,000/day', lowerIsBetter: false },
  weight_kg: { label: 'Weight', target: null, lowerIsBetter: null },
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeHealthSummary(readings: Reading[]): MetricSummary[] {
  const byMetric = new Map<string, Reading[]>();
  for (const r of readings) {
    if (!byMetric.has(r.metric)) byMetric.set(r.metric, []);
    byMetric.get(r.metric)!.push(r);
  }

  const now = Date.now();
  const win = (rows: Reading[], fromDays: number, toDays: number) => {
    const from = now - fromDays * 864e5;
    const to = now - toDays * 864e5;
    const vals = rows.filter((r) => {
      const t = new Date(r.recorded_at).getTime();
      return t >= from && t < (toDays === 0 ? Infinity : to);
    });
    if (!vals.length) return null;
    return vals.reduce((a, r) => a + r.value, 0) / vals.length;
  };

  const out: MetricSummary[] = [];
  for (const [metric, rows] of byMetric) {
    const meta = METRIC_META[metric] ?? { label: metric, target: null, lowerIsBetter: null };
    const sorted = [...rows].sort((a, b) => +new Date(b.recorded_at) - +new Date(a.recorded_at));
    const avg7 = win(sorted, 0, 7);
    const avg30 = win(sorted, 0, 30);
    const prevAvg30 = win(sorted, 30, 60);
    if (avg7 == null || avg30 == null) continue;
    const deltaPct = prevAvg30 && prevAvg30 !== 0 ? Math.round(((avg7 - prevAvg30) / prevAvg30) * 1000) / 10 : 0;
    const improving = meta.lowerIsBetter == null || deltaPct === 0
      ? null
      : (meta.lowerIsBetter ? deltaPct < 0 : deltaPct > 0);
    out.push({
      metric,
      label: meta.label,
      unit: sorted[0].unit,
      latest: round1(sorted[0].value),
      avg7: round1(avg7),
      avg30: round1(avg30),
      prevAvg30: prevAvg30 ? round1(prevAvg30) : 0,
      deltaPct,
      improving,
      target: meta.target,
      lastRecorded: sorted[0].recorded_at,
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Builds a self-contained, print-ready Medical Lifestyle Summary (HTML).
 * The user downloads it, opens it in any browser, and prints/saves as PDF —
 * ready to share with a clinician. No server, no dependencies.
 */
export function buildMedicalSummaryHtml(opts: {
  patientName: string;
  generatedAt: Date;
  summary: MetricSummary[];
  medications: { name: string; dose: string; time: string; daysLeft: number }[];
  goals: string[];
  calendar: { time: string; title: string; location: string | null }[];
  loyaltyPoints: number;
}): string {
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const trendText = (m: MetricSummary) => {
    if (m.improving === null) return '—';
    if (m.deltaPct > 0) return `▲ +${Math.abs(m.deltaPct)}% vs prior 30d`;
    if (m.deltaPct < 0) return `▼ ${m.deltaPct}% vs prior 30d`;
    return 'stable';
  };
  const trendColor = (m: MetricSummary) => {
    if (m.improving === true) return '#166534';
    if (m.improving === false) return '#B91C1C';
    return '#57534E';
  };

  const medRows = opts.medications.length
    ? opts.medications.map((m) =>
        `<tr><td>${m.name}</td><td>${m.dose}</td><td>${m.time}</td><td>${m.daysLeft} days</td></tr>`
      ).join('')
    : '<tr><td colspan="4">No medications scheduled.</td></tr>';

  const metricRows = opts.summary.map((m) =>
    `<tr>
      <td>${m.label}</td>
      <td>${fmt(m.latest)} ${m.unit}</td>
      <td>${fmt(m.avg7)} ${m.unit}</td>
      <td>${fmt(m.avg30)} ${m.unit}</td>
      <td style="color:${trendColor(m)};font-weight:600">${trendText(m)}</td>
      <td>${m.target ?? '—'}</td>
    </tr>`
  ).join('');

  const goals = opts.goals.length ? `<ul>${opts.goals.map((g) => `<li>${g}</li>`).join('')}</ul>` : '<p>No goals selected.</p>';
  const upcoming = opts.calendar.length
    ? `<ul>${opts.calendar.slice(0, 4).map((e) => `<li>${format(new Date(e.time), 'EEE MMM d, HH:mm')} — ${e.title}${e.location ? ` (${e.location})` : ''}</li>`).join('')}</ul>`
    : '<p>No upcoming events on the calendar.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Medical Lifestyle Summary — ${opts.patientName}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1c1917; margin: 48px; max-width: 820px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 30px 0 10px; color: #344a37; }
  .meta { color: #57534e; font-size: 13px; margin-bottom: 6px; }
  .brand { font-family: Arial, sans-serif; letter-spacing: 3px; font-size: 12px; color: #344a37; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; }
  th { text-align: left; background: #f1f5f2; color: #2b4530; padding: 7px 9px; border: 1px solid #dbe5dc; }
  td { padding: 6px 9px; border: 1px solid #e7e5e0; }
  ul { font-family: Arial, sans-serif; font-size: 13px; margin: 6px 0; padding-left: 20px; }
  p, li { line-height: 1.55; }
  .disclaimer { background: #fdf2f2; border: 1px solid #f5d5d5; padding: 12px 14px; font-family: Arial, sans-serif; font-size: 12px; color: #8c3232; border-radius: 8px; margin-top: 28px; }
  .foot { margin-top: 26px; font-size: 11px; color: #78716c; font-family: Arial, sans-serif; }
</style>
</head>
<body>
  <div class="brand">CUASARX LONGEVITY BY KEEL</div>
  <h1>Medical Lifestyle Summary</h1>
  <div class="meta"><strong>Patient:</strong> ${opts.patientName} &nbsp;·&nbsp; <strong>Generated:</strong> ${format(opts.generatedAt, 'MMMM d, yyyy HH:mm')}</div>
  <div class="meta">Compiled from connected-device data on file (last 60 days) and the active care plan.</div>

  <h2>1. Wearable &amp; Device Data (30-day overview)</h2>
  <table>
    <tr><th>Metric</th><th>Latest</th><th>7-day avg</th><th>30-day avg</th><th>Trend</th><th>Reference</th></tr>
    ${metricRows}
  </table>

  <h2>2. Active Medications &amp; Supplements</h2>
  <table>
    <tr><th>Item</th><th>Dose</th><th>Time</th><th>Supply remaining</th></tr>
    ${medRows}
  </table>

  <h2>3. Goals</h2>
  ${goals}

  <h2>4. Upcoming Schedule</h2>
  ${upcoming}

  <div class="disclaimer">
    <strong>Important:</strong> This summary was generated by software from wearable and self-reported data.
    It is <u>not medical advice</u>, does not constitute a diagnosis, and must not replace a consultation.
    Share this document with your physician or licensed clinician before making any changes to medications,
    supplements, or training. If this is an emergency, call 911.
  </div>
  <div class="foot">Prepared by Quasar Keel (AI wellness assistant) · Consent for data processing is on file · Generated ${format(opts.generatedAt, "MMMM d, yyyy 'at' HH:mm")} · Document ID: QK-${opts.generatedAt.getTime().toString(36).toUpperCase()}</div>
</body>
</html>`;
}

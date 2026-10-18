import pg from 'pg';
const c = new pg.Client({ host: `db.${process.env.SUPABASE_PROJECT_REF || 'aklpnzhpetinlmkteifp'}.supabase.co`, port: 5432, user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD!, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows } = await c.query("select id from auth.users where email = 'demo@quasarkeel.com'");
if (!rows.length) { console.error('demo user missing'); process.exit(1); }
const uid = rows[0].id;
await c.query('delete from public.health_readings where user_id = $1', [uid]);

// 45 days of realistic readings with gentle trends + weekly noise
const metrics: [string, number, number, string, number][] = [
  // metric, base, trendPerDay, unit, dailyNoise
  ['sleep_hours', 6.6, 0.015, 'h', 0.7],
  ['hrv_ms', 48, 0.14, 'ms', 4],
  ['resting_hr', 58, -0.05, 'bpm', 1.6],
  ['systolic', 122, -0.06, 'mmHg', 3],
  ['diastolic', 78, -0.03, 'mmHg', 2],
  ['steps', 9200, 25, 'steps', 1800],
  ['weight_kg', 78.4, -0.012, 'kg', 0.3],
];
let inserted = 0;
for (let day = 44; day >= 0; day--) {
  const at = new Date(Date.now() - day * 864e5); at.setHours(7, 0, 0, 0);
  for (const [metric, base, trend, unit, noise] of metrics) {
    const drift = base + trend * (44 - day);
    const value = Math.round((drift + (Math.random() * 2 - 1) * noise) * 10) / 10;
    await c.query('insert into public.health_readings (user_id, metric, value, unit, source, recorded_at) values ($1,$2,$3,$4,$5,$6)',
      [uid, metric, value, unit, 'QuasarX band', at.toISOString()]);
    inserted++;
  }
}
console.log('readings inserted:', inserted);
await c.end();

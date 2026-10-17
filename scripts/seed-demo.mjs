/**
 * Seeds the shared DEMO account (demo@quasarkeel.com) with a rich fake life:
 * profile with full baseline, medications schedule, calendar events, and
 * auto-deliveries due soon — so the voice receptionist briefing has real
 * data to read out.
 *
 * Create the auth user first (anon signup works while autoconfirm is on):
 *   curl -X POST $SUPABASE_URL/auth/v1/signup -H "apikey: $ANON" ... -d '{"email":"demo@quasarkeel.com","password":"DemoMVP-2026!","data":{"name":"Alex Rivera"}}'
 * Then run this with the DB password.
 */
import pg from 'pg';

const REF = process.env.SUPABASE_PROJECT_REF || 'aklpnzhpetinlmkteifp';
const DEMO_EMAIL = 'demo@quasarkeel.com';

const c = new pg.Client({
  host: `db.${REF}.supabase.co`, port: 5432, user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD, database: 'postgres',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000,
});
await c.connect();

const { rows: users } = await c.query('select id from auth.users where email = $1', [DEMO_EMAIL]);
if (!users.length) { console.error(`No auth user ${DEMO_EMAIL} — create it via signup first.`); process.exit(1); }
const uid = users[0].id;
console.log('demo user:', uid);

// ── profile: rich baseline + metrics + goals + loyalty ──
const H = 3600e3, now = Date.now();
await c.query(
  `insert into public.profiles (user_id, name, email, lifestyle_persona, goals, loyalty_points, baseline_diagnostics)
   values ($1,'Alex Rivera',$2,'Peak Endurance Athlete','["Sleep Optimization","Joint & Tendon Recovery","Muscle Growth & Strength"]'::jsonb, 320,
   '{"bloodwork":{"apoB":78,"hsCRP":0.9,"fastingGlucose":88,"vitaminD":31},"diagnostics":{"vo2Max":52.4}}'::jsonb)
   on conflict (user_id) do update set
     goals = excluded.goals, loyalty_points = 320, baseline_diagnostics = excluded.baseline_diagnostics`,
  [uid, DEMO_EMAIL]
);

// ── medications: what to take, and when ──
await c.query('delete from public.user_medications where user_id = $1', [uid]);
const meds = [
  ['Magnesium Glycinate 400mg', '400mg', '21:30', 6],
  ['Vitamin D3 5000 IU + K2', '1 softgel', '08:00', 12],
  ['Omega-3 High-EPA 2000mg', '2 softgels', '13:00', 4],
  ['Creatine Monohydrate', '5g', '08:00', 45],
];
for (const [name, dose, tod, left] of meds) {
  await c.query('insert into public.user_medications (user_id, name, dose, time_of_day, days_left) values ($1,$2,$3,$4,$5)', [uid, name, dose, tod, left]);
}

// ── calendar: two meetings today/tomorrow + a training session ──
await c.query('delete from public.calendar_events where user_id = $1', [uid]);
const today3pm = new Date(); today3pm.setHours(15, 0, 0, 0);
const today6pm = new Date(); today6pm.setHours(18, 30, 0, 0);
const tmr9am = new Date(Date.now() + 864e5); tmr9am.setHours(9, 0, 0, 0);
await c.query(
  `insert into public.calendar_events (user_id, title, starts_at, location, kind) values
   ($1,'Weekly review — Keel Performance', $2, 'Zoom', 'meeting'),
   ($1,'Zone 2 ride — 60 min', $3, 'Key Biscayne loop', 'training'),
   ($1,'Dr. Chen follow-up (labs review)', $4, 'Telehealth', 'appointment')`,
  [uid, today3pm.toISOString(), today6pm.toISOString(), tmr9am.toISOString()]
);

// ── auto-deliveries due soon (the reorder nudge) ──
await c.query('delete from public.subscriptions where user_id = $1', [uid]);
const due4 = new Date(Date.now() + 4 * 864e5).toISOString().slice(0, 10);
const due6 = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10);
const due20 = new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10);
const subs = [
  [uid, 'p2', 'Magnesium Glycinate (Elemental 400mg)', '400mg evening', 30, due4],
  [uid, 'supp-omega3-triglyceride', 'High-EPA Triglyceride Omega-3', '2 softgels with dinner', 30, due6],
  [uid, 'p1', 'Whey Protein Isolate (Grass-Fed)', '1 scoop post-training', 45, due20],
];
for (const row of subs) {
  await c.query(
    `insert into public.subscriptions (user_id, product_id, product_name, dosage, cadence_days, status, next_delivery) values ($1,$2,$3,$4,$5,'active',$6)`,
    row
  );
}

// ── demo inventory (low stock = the "about to finish" items) ──

const { rows: check } = await c.query(
  "select (select count(*) from public.user_medications where user_id=$1) meds, (select count(*) from public.calendar_events where user_id=$1) events, (select count(*) from public.subscriptions where user_id=$1) subs, (select loyalty_points from public.profiles where user_id=$1) pts",
  [uid]
);
console.log('SEEDED:', JSON.stringify(check[0]));
await c.end();

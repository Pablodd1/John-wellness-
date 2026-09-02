/**
 * Applies supabase/migrations/*.sql and seeds the product catalog from
 * src/data.ts into the Supabase Postgres database.
 *
 * Usage (from the repo root):
 *   SUPABASE_DB_PASSWORD=<password> npx tsx scripts/sync-db.mjs
 *
 * The password is read from the environment only — never hardcoded here.
 * Tries the direct database host first, then the session pooler regions,
 * because newer Supabase projects are IPv6-only on the direct host.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { MOCK_PRODUCTS } from '../src/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REF = 'brqqyxpnqwuktyqmoycp';
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!PASSWORD) {
  console.error('Set SUPABASE_DB_PASSWORD in the environment first.');
  process.exit(1);
}

const CANDIDATES = [
  { label: 'direct', host: `db.${REF}.supabase.co`, user: 'postgres' },
  ...[
    'us-east-1', 'us-west-1', 'us-east-2', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-south-1', 'sa-east-1',
  ].map((region) => ({
    label: `pooler-${region}`,
    host: `aws-0-${region}.pooler.supabase.com`,
    user: `postgres.${REF}`,
  })),
];

async function tryConnect() {
  for (const candidate of CANDIDATES) {
    const client = new pg.Client({
      host: candidate.host,
      port: 5432,
      user: candidate.user,
      password: PASSWORD,
      database: 'postgres',
      connectionTimeoutMillis: 8000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log(`Connected via ${candidate.label} (${candidate.host})`);
      return client;
    } catch (err) {
      console.log(`  ${candidate.label}: ${err.message.split('\n')[0]}`);
    }
  }
  return null;
}

function productRows() {
  return MOCK_PRODUCTS.map((p) => [
    p.id,
    p.name,
    p.category,
    p.price ?? 0,
    p.description ?? '',
    p.dailyDosage ?? null,
    p.timing ?? null,
    p.evidenceData?.grade ?? null,
    p.tailoredReason ?? null,
  ]);
}

async function main() {
  const client = await tryConnect();
  if (!client) {
    console.error('\nCould not reach the database. Run the SQL manually instead:');
    console.error('  Supabase Dashboard → SQL Editor → paste supabase/migrations/0001_init.sql → Run');
    process.exit(2);
  }

  try {
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of migrations) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file}…`);
      await client.query(sql);
    }

    console.log(`Seeding ${productRows().length} products…`);
    for (const row of productRows()) {
      await client.query(
        `insert into public.products
           (id, name, category, price, description, dosage, timing, evidence_grade, tailored_reason)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (id) do update set
           name = excluded.name, category = excluded.category, price = excluded.price,
           description = excluded.description, dosage = excluded.dosage, timing = excluded.timing,
           evidence_grade = excluded.evidence_grade, tailored_reason = excluded.tailored_reason`,
        row
      );
    }

    const { rows } = await client.query('select count(*)::int as n from public.products');
    console.log(`Done. products table now has ${rows[0].n} rows.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

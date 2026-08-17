-- ========================================================
-- CUASARX LONGEVITY BY KEEL — PRODUCTION POSTGRESQL SCHEMA
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  lifestyle_persona TEXT,
  chronological_age INT,
  biological_age NUMERIC(4,1),
  biometrics JSONB DEFAULT '{}'::jsonb,
  organ_health JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. PRODUCTS & FORMULATIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  dosage TEXT,
  timing TEXT,
  evidence_grade CHAR(1) DEFAULT 'A',
  evidence_details JSONB DEFAULT '{}'::jsonb,
  stock_units INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. USER DAILY REGIMENS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_regimens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  custom_name TEXT,
  dosage TEXT NOT NULL,
  timing TEXT NOT NULL,
  is_completed_today BOOLEAN DEFAULT FALSE,
  stock_remaining INT DEFAULT 30,
  daily_burn_rate INT DEFAULT 1,
  frequency_days INT DEFAULT 30,
  is_subscription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. BIOMARKER TELEMETRY LOGS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biomarker_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  biomarker_name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_value NUMERIC(10,2) NOT NULL,
  optimal_min NUMERIC(10,2),
  optimal_max NUMERIC(10,2),
  unit TEXT NOT NULL,
  status TEXT DEFAULT 'optimal', -- optimal, sub-optimal, critical
  history JSONB DEFAULT '[]'::jsonb,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. ORDERS & REFILL FULFILLMENT
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'paid',
  fulfillment_status TEXT DEFAULT 'cold_chain_processing',
  tracking_number TEXT,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_regimens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomarker_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products public read
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

-- User data isolation (when auth is connected)
CREATE POLICY "Allow users to manage their profile" ON public.profiles FOR ALL USING (auth.uid() = user_id OR auth.role() = 'anon');
CREATE POLICY "Allow users to manage regimens" ON public.user_regimens FOR ALL USING (true);
CREATE POLICY "Allow users to view biomarker logs" ON public.biomarker_logs FOR ALL USING (true);
CREATE POLICY "Allow users to view orders" ON public.orders FOR ALL USING (true);

-- --------------------------------------------------------
-- SEED PRODUCTS DATA
-- --------------------------------------------------------
INSERT INTO public.products (id, name, category, price, description, dosage, timing, evidence_grade, stock_units)
VALUES 
  ('p1', 'NMN & NAD+ Cell Restorative', 'Longevity Core', 89.00, 'Pharmaceutical-grade Niacinamide Mononucleotide for mitochondrial ATP generation.', '500mg', 'Morning Fasted', 'A', 60),
  ('p2', 'Liposomal Glutathione + NAC', 'Cellular Defense', 64.00, 'Master antioxidant payload engineered for hepatic detox and oxidative stress mitigation.', '250mg', 'Morning Fasted', 'A', 90),
  ('p3', 'Akkermansia Muciniphila Gut Barrier', 'Microbiome', 79.00, 'Next-generation pasteurized strain for mucosal lining integrity and GLP-1 stimulation.', '1 Capsule', 'With Lunch', 'A', 30),
  ('p4', 'Magnesium L-Threonate Deep Delta', 'Neuro & Sleep', 48.00, 'Blood-brain barrier penetrating magnesium for synaptic density and slow-wave sleep.', '2000mg', '30m Before Sleep', 'A', 120),
  ('p5', 'Omega-3 High-EPA/DHA Cold-Chain', 'Cardiovascular', 52.00, 'Refrigerated molecularly distilled marine lipids reducing vascular inflammation (hs-CRP).', '2000mg EPA / 1000mg DHA', 'With Dinner', 'A', 60),
  ('p6', 'CoQ10 Ubiquinol + PQQ Energy Core', 'Mitochondrial', 72.00, 'Bioavailable Ubiquinol paired with Pyrroloquinoline Quinone for bioenergetics.', '200mg / 20mg', 'Morning Fasted', 'A', 45)
ON CONFLICT (id) DO NOTHING;

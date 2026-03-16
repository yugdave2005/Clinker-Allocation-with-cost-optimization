-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Locations ─────────────────────────────────────────────
CREATE TABLE locations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT CHECK (type IN ('IU','GU')) NOT NULL,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  state        TEXT NOT NULL,
  prod_capacity_mt   NUMERIC,
  prod_cost_per_mt   NUMERIC,
  initial_inventory  NUMERIC NOT NULL,
  safety_stock       NUMERIC NOT NULL,
  max_inventory      NUMERIC NOT NULL,
  demand_period1     NUMERIC NOT NULL,
  demand_period2     NUMERIC NOT NULL,
  demand_period3     NUMERIC NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transport Modes ────────────────────────────────────────
CREATE TABLE transport_modes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  cost_per_mt_km   NUMERIC NOT NULL,
  capacity_mt_trip NUMERIC NOT NULL,
  sbq_trips    INTEGER NOT NULL,
  description  TEXT
);

-- ── Distance Matrix ────────────────────────────────────────
CREATE TABLE distances (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_loc     UUID REFERENCES locations(id),
  to_loc       UUID REFERENCES locations(id),
  distance_km  NUMERIC NOT NULL,
  UNIQUE(from_loc, to_loc)
);

-- ── Allocation Runs ────────────────────────────────────────
CREATE TABLE allocation_runs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode           TEXT CHECK (mode IN ('AUTO','MANUAL')) NOT NULL,
  pso_params     JSONB NOT NULL,
  demand_input   JSONB NOT NULL,
  total_cost     NUMERIC,
  prod_cost      NUMERIC,
  transport_cost NUMERIC,
  inventory_cost NUMERIC,
  iterations_run INTEGER,
  converged      BOOLEAN DEFAULT FALSE,
  convergence_data JSONB,
  status         TEXT DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Allocation Results ─────────────────────────────────────
CREATE TABLE allocation_results (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id         UUID REFERENCES allocation_runs(id) ON DELETE CASCADE,
  period         INTEGER NOT NULL,
  from_loc       UUID REFERENCES locations(id),
  to_loc         UUID REFERENCES locations(id),
  mode_id        UUID REFERENCES transport_modes(id),
  quantity_mt    NUMERIC NOT NULL,
  trips          INTEGER NOT NULL,
  transport_cost NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inventory Snapshots ────────────────────────────────────
CREATE TABLE inventory_snapshots (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id         UUID REFERENCES allocation_runs(id) ON DELETE CASCADE,
  location_id    UUID REFERENCES locations(id),
  period         INTEGER NOT NULL,
  opening_inv    NUMERIC NOT NULL,
  production     NUMERIC,
  received_mt    NUMERIC NOT NULL,
  dispatched_mt  NUMERIC NOT NULL,
  self_consumed  NUMERIC NOT NULL,
  closing_inv    NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS Policies ───────────────────────────────────────────
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "public read runs" ON allocation_runs FOR SELECT USING (true);
CREATE POLICY "insert runs" ON allocation_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "insert results" ON allocation_results FOR INSERT WITH CHECK (true);
CREATE POLICY "public read results" ON allocation_results FOR SELECT USING (true);
CREATE POLICY "insert snapshots" ON inventory_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "public read snapshots" ON inventory_snapshots FOR SELECT USING (true);

-- ── Seed: Transport Modes ──────────────────────────────────
INSERT INTO transport_modes (code, name, cost_per_mt_km, capacity_mt_trip, sbq_trips, description) VALUES
  ('ROAD', 'Road Truck',    1.5, 30,  1, 'Standard road transport via trucks'),
  ('RAIL', 'Railway Rake',  0.8, 700, 1, 'Bulk rail transport via railway rakes'),
  ('BULK', 'Bulk Carrier',  1.1, 350, 1, 'Intermediate bulk carrier transport');

-- ── Seed: Integrated Units ─────────────────────────────────
INSERT INTO locations (code, name, type, latitude, longitude, state, prod_capacity_mt, prod_cost_per_mt, initial_inventory, safety_stock, max_inventory, demand_period1, demand_period2, demand_period3) VALUES
  ('IU01', 'Rajasthan IU – Beawar',          'IU', 26.1007, 74.3234, 'Rajasthan',         85000, 295, 12000, 3000, 30000, 12000, 13500, 11000),
  ('IU02', 'Gujarat IU – Surat',             'IU', 21.1702, 72.8311, 'Gujarat',            75000, 280,  9000, 2500, 25000, 10000, 11000,  9500),
  ('IU03', 'Madhya Pradesh IU – Satna',      'IU', 24.5900, 80.8322, 'Madhya Pradesh',     90000, 270, 15000, 4000, 35000, 14000, 16000, 13000),
  ('IU04', 'Andhra Pradesh IU – Kurnool',    'IU', 15.8281, 78.0373, 'Andhra Pradesh',     70000, 305,  8000, 2000, 22000,  9000, 10000,  8500),
  ('IU05', 'Telangana IU – Nalgonda',        'IU', 17.0575, 79.2690, 'Telangana',          65000, 310,  7500, 2000, 20000,  8500,  9500,  8000),
  ('IU06', 'Tamil Nadu IU – Ariyalur',       'IU', 11.1400, 79.0762, 'Tamil Nadu',         80000, 315, 11000, 3000, 28000, 11000, 12500, 10500),
  ('IU07', 'Karnataka IU – Gulbarga',        'IU', 17.3297, 76.8200, 'Karnataka',          60000, 300,  7000, 1800, 18000,  8000,  9000,  7500),
  ('IU08', 'Himachal Pradesh IU – Bilaspur', 'IU', 31.3400, 76.7600, 'Himachal Pradesh',   55000, 330,  6000, 1500, 16000,  6500,  7500,  6000),
  ('IU09', 'Uttarakhand IU – Roorkee',       'IU', 29.8543, 77.8880, 'Uttarakhand',        50000, 325,  5500, 1500, 15000,  6000,  7000,  5500),
  ('IU10', 'Chhattisgarh IU – Raipur',       'IU', 21.2514, 81.6296, 'Chhattisgarh',       95000, 265, 16000, 4500, 38000, 15000, 17000, 14000),
  ('IU11', 'Odisha IU – Jharsuguda',         'IU', 21.8553, 84.0075, 'Odisha',             72000, 290,  9500, 2500, 24000, 10500, 12000, 10000),
  ('IU12', 'West Bengal IU – Durgapur',      'IU', 23.4800, 87.3200, 'West Bengal',        68000, 285,  8500, 2200, 21000,  9500, 10500,  9000),
  ('IU13', 'Punjab IU – Ropar',              'IU', 30.9700, 76.5300, 'Punjab',             58000, 320,  7000, 1800, 17000,  7500,  8500,  7000),
  ('IU14', 'Jharkhand IU – Bokaro',          'IU', 23.6693, 86.1511, 'Jharkhand',          62000, 295,  8000, 2000, 20000,  8500,  9500,  8000),
  ('IU15', 'Maharashtra IU – Chandrapur',    'IU', 19.9615, 79.2961, 'Maharashtra',        78000, 285, 10000, 2800, 26000, 10500, 12000, 10000);

-- ── Seed: Grinding Units ───────────────────────────────────
INSERT INTO locations (code, name, type, latitude, longitude, state, prod_capacity_mt, prod_cost_per_mt, initial_inventory, safety_stock, max_inventory, demand_period1, demand_period2, demand_period3) VALUES
  ('GU01', 'Delhi NCR GU – Ballabhgarh',    'GU', 28.3411, 77.3212, 'Haryana',        NULL, NULL, 4000, 1500, 14000, 18000, 20000, 17000),
  ('GU02', 'Mumbai GU – Navi Mumbai',       'GU', 19.0330, 73.0297, 'Maharashtra',    NULL, NULL, 3500, 1200, 12000, 16000, 18000, 15500),
  ('GU03', 'Bengaluru GU – Hoskote',        'GU', 13.0700, 77.7900, 'Karnataka',      NULL, NULL, 3000, 1000, 11000, 15000, 17000, 14500),
  ('GU04', 'Hyderabad GU – Sangareddy',     'GU', 17.6200, 78.0900, 'Telangana',      NULL, NULL, 3200, 1100, 12000, 14000, 16000, 13500),
  ('GU05', 'Chennai GU – Kancheepuram',     'GU', 12.8300, 79.7000, 'Tamil Nadu',     NULL, NULL, 2800, 1000, 10000, 13000, 15000, 12500),
  ('GU06', 'Kolkata GU – Howrah',           'GU', 22.5958, 88.2636, 'West Bengal',    NULL, NULL, 2500,  900,  9000, 12000, 14000, 11500),
  ('GU07', 'Ahmedabad GU – Sanand',         'GU', 22.9900, 72.3800, 'Gujarat',        NULL, NULL, 3000, 1000, 11000, 14000, 16000, 13000),
  ('GU08', 'Pune GU – Talegaon',            'GU', 18.7400, 73.6800, 'Maharashtra',    NULL, NULL, 2800,  950, 10000, 13000, 15000, 12500),
  ('GU09', 'Lucknow GU – Unnao',            'GU', 26.5500, 80.4900, 'Uttar Pradesh',  NULL, NULL, 2200,  800,  8500, 11000, 12500, 10500),
  ('GU10', 'Jaipur GU – Kotputli',          'GU', 27.7000, 76.2000, 'Rajasthan',      NULL, NULL, 2000,  750,  8000, 10000, 11500,  9500),
  ('GU11', 'Bhopal GU – Mandideep',         'GU', 23.0900, 77.5300, 'Madhya Pradesh', NULL, NULL, 2400,  850,  9000, 11500, 13000, 11000),
  ('GU12', 'Visakhapatnam GU',              'GU', 17.6868, 83.2185, 'Andhra Pradesh', NULL, NULL, 2600,  900,  9500, 12000, 13500, 11500),
  ('GU13', 'Patna GU – Hajipur',            'GU', 25.6900, 85.2300, 'Bihar',          NULL, NULL, 1800,  650,  7500,  9000, 10500,  8500),
  ('GU14', 'Nagpur GU – Butibori',           'GU', 20.8600, 79.1500, 'Maharashtra',    NULL, NULL, 2300,  800,  9000, 11000, 12500, 10500),
  ('GU15', 'Indore GU – Pithampur',          'GU', 22.6200, 75.6900, 'Madhya Pradesh', NULL, NULL, 2100,  750,  8500, 10500, 12000, 10000);

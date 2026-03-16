# ClinkerPSO — Cement Supply Chain Optimizer

> Visualize and optimize Clinker Allocation & Transportation across India's cement supply chain using **Particle Swarm Optimization (PSO)**.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd clinker-pso

# 2. Install dependencies
npm install

# 3. Set up environment variables (optional - app works without Supabase)
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
```

## 📋 Supabase Setup (Optional)

The app works fully offline with embedded data. For persistence:

1. Create a [Supabase](https://supabase.com) project
2. Go to SQL Editor and run `src/supabase/migrations/001_init.sql`
3. Copy your project URL and anon key to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🎮 Usage

### AUTO Mode
1. Open the **Map & Allocation** tab
2. Select **AUTO** mode in the sidebar
3. Review the demand table (loaded from database)
4. Adjust PSO parameters (swarm size, iterations, etc.)
5. Click **Run Optimization** and watch the convergence chart
6. View results on the map (flow lines) and Dashboard tab

### MANUAL Mode
1. Switch to **MANUAL** mode
2. Search for specific locations and override their demand values
3. Unchanged locations keep default demand
4. Run optimization and compare with AUTO results

## ⚙️ PSO Parameter Tuning

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| Swarm Size | 60 | 20–200 | More particles = better exploration, slower |
| Max Iterations | 200 | 50–500 | More iterations = finer convergence |
| Inertia (w) | 0.9→0.4 | Linear decay | High w = exploration, low w = exploitation |
| c1 (Cognitive) | 2.0 | 1.0–3.0 | Personal best attraction |
| c2 (Social) | 2.0 | 1.0–3.0 | Global best attraction |
| Penalty λ | 10⁶ | 10⁴–10⁶ | Higher = stricter constraint enforcement |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     TabBar (Navigation)                  │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │        Main Content Area                      │
│          │                                               │
│ ┌──────┐ │  MAP Tab:    Leaflet Map with markers/lines   │
│ │ Mode │ │  DASHBOARD:  KPIs, Charts, Tables             │
│ │ AUTO │ │  HOW IT WORKS: 6-section explainer            │
│ │MANUAL│ │                                               │
│ ├──────┤ │                                               │
│ │ PSO  │ │                                               │
│ │Params│ │                                               │
│ └──────┘ │                                               │
├──────────┴───────────────────────────────────────────────┤
│      Zustand Store  ←→  PSO Engine  ←→  Supabase        │
└──────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `locations` | 15 IUs + 15 GUs with coordinates, capacity, demand |
| `transport_modes` | Road, Rail, Bulk with costs and capacities |
| `distances` | Haversine distance matrix (30×30) |
| `allocation_runs` | PSO run metadata and results |
| `allocation_results` | Per-route allocation details |
| `inventory_snapshots` | Per-location per-period inventory |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + custom components
- **Map**: Leaflet.js + React-Leaflet
- **Charts**: Recharts
- **State**: Zustand
- **Backend**: Supabase (optional)
- **PSO**: Pure TypeScript (no external solvers)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── layout/          # AppShell, Sidebar, TabBar
│   ├── map/             # ClinkerMap, markers, lines
│   ├── modes/           # AUTO/MANUAL mode panels
│   ├── pso/             # PSO controls, charts, tables
│   ├── explanation/     # How It Works page
│   └── ui/              # Button, Card, Badge, Spinner
├── data/                # Seed data (30 locations)
├── hooks/               # React hooks
├── lib/                 # Utils, Supabase client
├── pso/                 # PSO engine (types, fitness, swarm)
├── store/               # Zustand state management
└── supabase/            # Database migration SQL
```

## 📜 License

MIT

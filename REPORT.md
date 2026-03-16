# Clinker PSO — Complete Application Report

> A detailed explanation of every element, parameter, calculation, and feature in the Clinker Allocation & Transportation Optimizer.

---

## Table of Contents

1. [The Problem We're Solving](#1-the-problem-were-solving)
2. [What Are IUs and GUs?](#2-what-are-ius-and-gus)
3. [Periods (P1, P2, P3)](#3-periods-p1-p2-p3)
4. [Transport Modes](#4-transport-modes)
5. [PSO Parameters Explained](#5-pso-parameters-explained)
6. [How the PSO Algorithm Works](#6-how-the-pso-algorithm-works)
7. [How Costs Are Calculated](#7-how-costs-are-calculated)
8. [Constraints & Penalties](#8-constraints--penalties)
9. [AUTO Mode vs MANUAL Mode](#9-auto-mode-vs-manual-mode)
10. [Dashboard Explained](#10-dashboard-explained)
11. [Map Visualization Explained](#11-map-visualization-explained)
12. [How It Works Tab](#12-how-it-works-tab)

---

## 1. The Problem We're Solving

In the **cement industry**, raw limestone is heated in kilns to produce an intermediate material called **clinker**. This clinker is then ground into cement at grinding facilities.

**The challenge:** India has 15 clinker-producing factories (IUs) and 15 grinding-only facilities (GUs) spread across the country. We need to decide:

- **How much clinker** to ship from each factory to each grinding unit
- **Which transport mode** to use (Road, Rail, or Bulk Carrier)
- **Across 3 time periods**, while keeping costs minimal

This is a **multi-period, multi-source, multi-destination optimization problem** with thousands of possible combinations, making it impossible to solve by hand.

---

## 2. What Are IUs and GUs?

### IU — Integrated Unit (🏭 Orange markers on map)

An IU **produces and consumes** clinker. It has:

| Field | Meaning | Example (IU01 Beawar) |
|-------|---------|----------------------|
| **Production Capacity** | Maximum clinker it can produce per period (in MT) | 85,000 MT |
| **Production Cost** | Cost to produce 1 MT of clinker (in ₹/MT) | ₹295/MT |
| **Initial Inventory** | Clinker already in stock at the start | 12,000 MT |
| **Safety Stock** | Minimum inventory that must always be maintained (buffer) | 3,000 MT |
| **Max Inventory** | Maximum storage capacity | 30,000 MT |
| **Demand (P1/P2/P3)** | How much clinker the IU itself needs (self-consumption) | 12,000 / 13,500 / 11,000 MT |

An IU must produce enough clinker to:
- Meet its own demand (self-consumption)
- Ship surplus to GUs that need it
- Keep inventory above safety stock

### GU — Grinding Unit (🏗️ Blue markers on map)

A GU **only consumes** clinker (does not produce). It has:

| Field | Meaning | Example (GU01 Ballabhgarh) |
|-------|---------|---------------------------|
| **Initial Inventory** | Clinker already in stock at the start | 4,000 MT |
| **Safety Stock** | Minimum inventory that must always be maintained | 1,500 MT |
| **Max Inventory** | Maximum storage capacity | 14,000 MT |
| **Demand (P1/P2/P3)** | How much clinker the GU needs to grind into cement | 18,000 / 20,000 / 17,000 MT |

A GU has **no production** — it relies entirely on shipments from IUs to meet its demand.

---

## 3. Periods (P1, P2, P3)

The optimization runs across **3 time periods** (e.g., 3 months or 3 quarters):

| Period | Button | What It Represents |
|--------|--------|-------------------|
| **P1** | Period 1 | First planning horizon (e.g., Jan–Mar) |
| **P2** | Period 2 | Second planning horizon (e.g., Apr–Jun) |
| **P3** | Period 3 | Third planning horizon (e.g., Jul–Sep) |
| **ALL** | All Periods | View combined results across all 3 periods |

**How periods connect:**
- Each period's **closing inventory** becomes the next period's **opening inventory**
- Period 1 opening inventory = the "Initial Inventory" from the database
- Decisions in P1 affect what's available in P2 and P3

**Example flow for GU01 (Delhi):**
```
P1: Opens with 4,000 MT → Receives 16,000 MT from IUs → Consumes 18,000 MT → Closes with 2,000 MT
P2: Opens with 2,000 MT → Receives 20,000 MT from IUs → Consumes 20,000 MT → Closes with 2,000 MT
P3: Opens with 2,000 MT → Receives 17,000 MT from IUs → Consumes 17,000 MT → Closes with 2,000 MT
```

---

## 4. Transport Modes

Three ways to ship clinker from IUs to GUs:

| Mode | Icon Color | Cost per MT per km | Capacity per Trip | Best For |
|------|-----------|-------------------|------------------|----------|
| 🚛 **ROAD** | Orange | ₹1.50/MT/km | 30 MT/trip | Short distances, small quantities |
| 🚂 **RAIL** | Blue | ₹0.80/MT/km | 700 MT/trip | Long distances, large quantities (cheapest per km) |
| 🚢 **BULK** | Green | ₹1.10/MT/km | 350 MT/trip | Medium distances, moderate quantities |

**SBQ (Shipment Batch Quantity):** Minimum number of trips that must be sent. Currently SBQ = 1 for all modes (at least 1 full trip if any shipment is made).

**Key insight:** Rail is cheapest per km but requires full 700 MT rakes. Road is most flexible (only 30 MT per truck) but most expensive per km.

---

## 5. PSO Parameters Explained

### Swarm Size (20–200, default: 60)

**What it is:** The number of "particles" (candidate solutions) in the swarm.

- Each particle represents a **complete allocation plan** — which IU sends how much to which GU, via which mode, in each period
- **More particles** = more diverse search = better chance of finding the global optimum, but **slower**
- **Fewer particles** = faster but may get stuck in a local optimum
- **Recommendation:** Start with 60. Increase to 100–150 for better results if you have time.

### Max Iterations (50–500, default: 200)

**What it is:** Maximum number of optimization cycles the swarm will run.

- Each iteration, every particle updates its position based on its experience and the swarm's best
- **More iterations** = more refinement = better convergence
- The algorithm may **stop early** if it detects convergence (cost not changing)
- **Recommendation:** 200 is a good balance. Use 300–500 for complex scenarios.

### Inertia Weight (w): 0.9 → 0.4 (linear decay)

**What it is:** Controls how much a particle's previous movement direction matters.

| Phase | w Value | Behavior |
|-------|---------|----------|
| Early iterations | **w = 0.9** (high) | Particles move fast, **exploring** the search space widely |
| Late iterations | **w = 0.4** (low) | Particles slow down, **exploiting** the best regions found |

The linear decay formula: `w = wStart - (wStart - wEnd) × (iteration / maxIterations)`

**Why it decays:** Early on, you want broad exploration to find promising regions. Later, you want focused refinement around the best solutions found.

### c1 — Cognitive Component (1.0–3.0, default: 2.0)

**What it is:** How strongly a particle is attracted to its **own personal best** position (pBest).

- **High c1 (2.5–3.0):** Particles are more "stubborn" — they trust their own experience more
- **Low c1 (1.0–1.5):** Particles are less influenced by their personal history
- Think of it as: **"How much do I trust my own past experience?"**

### c2 — Social Component (1.0–3.0, default: 2.0)

**What it is:** How strongly a particle is attracted to the **swarm's global best** position (gBest).

- **High c2 (2.5–3.0):** Particles converge faster toward the best solution found by anyone — risk of premature convergence
- **Low c2 (1.0–1.5):** Particles are more independent — slower convergence but more exploration
- Think of it as: **"How much do I follow the crowd?"**

**Balance between c1 and c2:**
- c1 > c2: More exploration (individualistic swarm)
- c2 > c1: Faster convergence (herd mentality)
- c1 ≈ c2 ≈ 2.0: Balanced (recommended)

### Penalty Lambda (λ): 10⁴ / 10⁵ / 10⁶

**What it is:** How heavily constraint violations are penalized in the fitness function.

| Value | Effect |
|-------|--------|
| **λ = 10⁴** | Soft constraints — allows some violations for lower cost |
| **λ = 10⁵** | Moderate — balanced between cost and feasibility |
| **λ = 10⁶** | Strict — almost always produces feasible solutions |

**Example:** If demand is unmet by 100 MT:
- λ = 10⁴: Penalty = 100 × 10,000 = ₹10 lakh added to cost
- λ = 10⁶: Penalty = 100 × 10,00,000 = ₹10 crore added to cost

Higher λ makes the PSO strongly prefer feasible solutions over cheap-but-infeasible ones.

---

## 6. How the PSO Algorithm Works

### The Velocity Update Formula

For each dimension of each particle:

```
velocity_new = w × velocity_old
             + c1 × rand() × (personal_best - current_position)
             + c2 × rand() × (global_best - current_position)
```

**Three forces acting on each particle:**

| Force | Formula Part | Meaning |
|-------|-------------|---------|
| **Inertia** | `w × velocity_old` | Keep moving in the same direction (momentum) |
| **Cognitive** | `c1 × r1 × (pBest - x)` | Pull toward my personal best |
| **Social** | `c2 × r2 × (gBest - x)` | Pull toward the swarm's best |

### What a "Particle Position" Means

Each particle is a **4D array**: `position[i][j][t][m]` = number of trips

| Dimension | Index | Represents |
|-----------|-------|-----------|
| i | 0–14 | Which IU (source) |
| j | 0–14 | Which GU (destination) |
| t | 0–2 | Which period (P1, P2, P3) |
| m | 0–2 | Which transport mode (Road, Rail, Bulk) |

**Total decision variables:** 15 × 15 × 3 × 3 = **2,025 integers** per particle

**Example:** `position[2][5][0][1] = 3` means:
> "IU03 sends 3 Railway trips to GU06 in Period 1"
> = 3 trips × 700 MT/trip = 2,100 MT shipped

### Repair Operator

After each position update, a **repair step** ensures feasibility:
1. **Round** all values to nearest integer (can't do 2.7 trips)
2. **Clip** to range [0, 20] (max 20 trips per route per period)
3. **SBQ check:** If trips > 0 but < minimum batch quantity, set to minimum

### Convergence Detection

The algorithm stops early if the best cost hasn't improved by more than **0.01%** over the last **20 iterations**. This saves computation when further iterations won't improve the result.

---

## 7. How Costs Are Calculated

### Total Cost = Production Cost + Transport Cost + Inventory Cost + Penalty

### 7.1 Production Cost (🟠 Orange)

```
Production Cost = Σ (production_at_IU × cost_per_MT_at_IU)
```

For each IU in each period:
1. Calculate how much production is needed:
   - `needed = self_consumption + dispatched_to_GUs - existing_inventory`
2. Production = max(0, needed)
3. Cost = production × IU's cost per MT

**Example (IU01 Beawar, Period 1):**
- Self-consumption: 12,000 MT
- Dispatched to GUs: 5,000 MT
- Opening inventory: 12,000 MT
- Production needed: max(0, 12,000 + 5,000 - 12,000) = 5,000 MT
- Cost: 5,000 × ₹295 = ₹14,75,000

### 7.2 Transport Cost (🔵 Blue)

```
Transport Cost = Σ (quantity_shipped × distance_km × rate_per_MT_km)
```

For each route (IU→GU) in each period via each mode:
1. Quantity = number_of_trips × capacity_per_trip
2. Distance = Haversine distance between the two locations (straight-line, in km)
3. Rate = transport mode's cost per MT per km

**Example (IU03 → GU06, Rail, Period 1):**
- Trips: 3
- Quantity: 3 × 700 = 2,100 MT
- Distance: Satna to Howrah ≈ 750 km (Haversine)
- Rate: ₹0.80/MT/km
- Cost: 2,100 × 750 × 0.80 = ₹12,60,000

### 7.3 Inventory Holding Cost (🟢 Green)

```
Inventory Cost = Σ (closing_inventory × ₹50/MT/period)
```

For each location (IU and GU) in each period:
- Closing inventory = Opening + Production + Received - Self-consumed - Dispatched
- Holding cost: ₹50 per MT per period for all positive inventory

**Why it matters:** Holding excess inventory is expensive (warehousing, insurance, tied-up capital). The PSO tries to keep inventory lean but above safety stock.

### 7.4 Penalty Cost (🔴 Violation penalty)

```
Penalty = λ × Σ (violation magnitudes)
```

This is **not a real cost** — it's an artificial penalty added to guide the PSO away from infeasible solutions. See [Constraints & Penalties](#8-constraints--penalties) below.

---

## 8. Constraints & Penalties

The PSO enforces these constraints. Any violation adds a penalty = λ × violation amount:

| Constraint | Formula | What Happens If Violated |
|-----------|---------|------------------------|
| **Production ≤ Capacity** | production ≤ IU's max capacity | Penalty for excess production amount |
| **No Negative Inventory** | closing_inv ≥ 0 | Penalty for deficit amount (unmet demand) |
| **Safety Stock** | closing_inv ≥ safety_stock | Penalty for shortfall below safety level |
| **Max Inventory** | closing_inv ≤ max_inventory | Penalty for excess above storage capacity |
| **Integer Trips** | All trip values must be whole numbers | Enforced by repair operator (rounding) |
| **SBQ Compliance** | If trips > 0, then trips ≥ SBQ | Enforced by repair operator |

---

## 9. AUTO Mode vs MANUAL Mode

### AUTO Mode (🤖)

- **Demand values come from the database** (the seed data)
- You **cannot edit** demand — the table is read-only
- Used for: Running optimization with standard/historical demand
- Simply adjust PSO parameters and click Run

### MANUAL Mode (✏️)

- You can **override demand** for any location
- Each location shows 3 input fields: P1, P2, P3 demand in MT
- **Unchanged locations** keep their default (database) demand
- **Use cases:**
  - "What if Delhi's demand increases by 20%?"
  - "What if we shut down GU06 (set demand to 0)?"
  - "What if a new factory opens (increase an IU's capacity)?"
- The **search bar** lets you filter locations by name, code, or state
- The **override counter** shows how many locations you've modified
- Click "Clear all" to reset all overrides back to defaults

### How to run a what-if scenario:

1. Switch to MANUAL mode
2. Search for "GU01" (Delhi)
3. Change P1 demand from 18,000 to 25,000
4. Click Run Optimization
5. Compare results with an AUTO run to see the impact

---

## 10. Dashboard Explained

### Row 1 — KPI Cards (4 cards at the top)

| Card | What It Shows | How It's Calculated |
|------|--------------|-------------------|
| **Total Cost** | Overall cost of the optimal plan | Production + Transport + Inventory costs |
| **Production Cost** | Total manufacturing cost | Σ (clinker produced × cost per MT) across all IUs and periods |
| **Transport Cost** | Total shipping cost | Σ (quantity × distance × rate) across all routes and periods |
| **Inventory Cost** | Total holding cost | Σ (closing inventory × ₹50/MT) across all locations and periods |

Each card also shows: **% of total** (e.g., "Transport: 65% of total").

### Row 2 — Charts

#### Convergence Chart (left, 60% width)

**X-axis:** Iteration number (1, 10, 20, ... up to max iterations)
**Y-axis:** Best fitness (total cost in ₹)

- Shows how the **best cost discovered** decreases over iterations
- **Steep drop** at start = PSO quickly finding good regions
- **Flat line** toward end = convergence (optimal region found)
- Updated **every 10 iterations** during a live run

**How to read it:**
- A curve that drops quickly and flattens = good convergence
- A curve still dropping at the end = try more iterations
- Multiple plateaus with sudden drops = PSO escaping local optima

#### Cost Breakdown Pie Chart (right, 40% width)

- **Orange slice:** Production cost (what % of total goes to manufacturing)
- **Blue slice:** Transport cost (what % goes to shipping)
- **Green slice:** Inventory cost (what % goes to holding stock)

Hover over any slice to see the exact ₹ amount.

### Row 3 — Allocation Results Table

| Column | What It Means |
|--------|--------------|
| **Period** | P1, P2, or P3 |
| **From** | Source IU code (e.g., IU03) |
| **To** | Destination GU code (e.g., GU07) |
| **Mode** | Transport mode — ROAD / RAIL / BULK |
| **Quantity MT** | Total clinker shipped (trips × capacity per trip) |
| **Trips** | Number of vehicle/rake/carrier trips |
| **Dist km** | Haversine distance between source and destination |
| **Cost ₹** | Transport cost for this specific route |

**Features:**
- Click any column header to **sort** ascending/descending
- Use the **ALL / ROAD / RAIL / BULK** buttons to filter by transport mode
- The period filter (P1/P2/P3/ALL) from the sidebar also applies

### Row 4 — Bottom Charts

#### Inventory Profile Chart (left)

- **X-axis:** Period (1, 2, 3)
- **Y-axis:** Closing inventory (MT)
- **Each line** = one location's inventory across periods
- **Orange shaded lines** = IUs, **Blue shaded lines** = GUs
- Shows the top 10 locations for readability

**How to read it:**
- Lines dropping to 0 or below = demand not fully met → increase supply
- Lines climbing high = excess inventory → reduce shipments
- Steady horizontal lines at safety stock level = optimal balance

#### Run History Table (right)

- Shows the **last 10 PSO runs** you've performed
- Each row shows: mode (AUTO/MANUAL), time, and total cost
- Lets you **compare** different runs to see which parameters work best

---

## 11. Map Visualization Explained

### Markers

- **🏭 Orange labels (IU01–IU15):** Integrated Units — produce clinker
- **🏗️ Blue labels (GU01–GU15):** Grinding Units — consume clinker

### Click on any marker to see:

- Node code, name, state, and type
- Production capacity and cost (IU only)
- Current inventory, safety stock, max inventory
- Demand for all 3 periods
- Allocation list (who it's shipping to/receiving from)
- Inventory profile (opening → closing per period)

### Flow Lines (appear after running PSO)

| Property | What It Means |
|----------|--------------|
| **Line Color** | Transport mode: Orange=Road, Blue=Rail, Green=Bulk |
| **Line Thickness** | Proportional to quantity (thicker = more clinker) |
| **Dashed animation** | Shows direction of flow (IU → GU) |

**Hover on any line** to see: Source → Destination, Quantity MT, Trips, Mode, Distance, Cost, Period.

### Map Legend (bottom-right corner)

Shows the color coding for IUs, GUs, and each transport mode.

### Period Filter

Use the P1/P2/P3/ALL buttons in the sidebar to filter which period's flow lines are shown on the map. This helps visualize how the supply chain changes across periods.

---

## 12. How It Works Tab

The "How It Works" tab provides a **non-technical explanation** of the entire system, divided into 6 sections:

| Section | Content |
|---------|---------|
| **1. The Problem** | Visual diagram of IU → GU supply chain and why it's hard |
| **2. What PSO Is** | 6-step explanation of the algorithm (Initialize → Evaluate → Update → Move → Repeat) |
| **3. Particle Encoding** | Technical details of how a solution is represented as a 4D array |
| **4. Fitness Function** | The cost formula with all components and constraint list |
| **5. Execution Trace** | Interactive stepper showing actual values from the last PSO run (use Next/Previous buttons) |
| **6. Reading Results** | Guide to interpreting the map lines, tables, and dashboard |

---

## Quick Reference: Key Formulas

```
Haversine Distance (km):
  a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
  distance = 2 × R × atan2(√a, √(1−a))    where R = 6371 km

Inventory Balance:
  closing[t] = opening[t] + production[t] + received[t] − consumed[t] − dispatched[t]
  opening[t] = closing[t−1]    (opening[1] = initial_inventory)

PSO Velocity Update:
  v_new = w × v_old + c1 × r1 × (pBest − x) + c2 × r2 × (gBest − x)

Inertia Decay:
  w = wStart − (wStart − wEnd) × (iteration / maxIterations)

Fitness:
  F = ΣProdCost + ΣTransportCost + ΣInventoryCost + λ × ΣViolations
```

---

*Generated for ClinkerPSO — Cement Supply Chain Optimizer*

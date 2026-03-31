/**
 * ClinkerPSO — Project Report PDF Generator
 * -----------------------------------------
 * Usage:  node generate-report.js
 * Output: PROJECT_REPORT.pdf in the project root
 *
 * Embeds all screenshots from the Photos/ directory into a professional,
 * multi-page PDF report using jsPDF.
 */

const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

// ────────────────────────────────────────────────
// CONFIGURATION
// ────────────────────────────────────────────────
const PHOTOS_DIR = path.join(__dirname, "Photos");
const OUTPUT_PDF = path.join(__dirname, "PROJECT_REPORT.pdf");

// A4 landscape dimensions in mm
const PW = 297; // page width
const PH = 210; // page height

// Margins
const ML = 20;  // left
const MR = 20;  // right
const MT = 25;  // top
const MB = 20;  // bottom
const CW = PW - ML - MR; // content width

// Colors (hex)
const COL_DARK  = "#0f172a";
const COL_MID   = "#1e293b";
const COL_LIGHT = "#f1f5f9";
const COL_ACC   = "#7c3aed"; // violet
const COL_ORANGE = "#f97316";
const COL_BLUE  = "#3b82f6";
const COL_GREEN = "#22c55e";
const COL_TEXT  = "#334155";

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
function hex(c) {
  const r = parseInt(c.slice(1,3),16);
  const g = parseInt(c.slice(3,5),16);
  const b = parseInt(c.slice(5,7),16);
  return [r,g,b];
}

function loadImageBase64(filename) {
  const fpath = path.join(PHOTOS_DIR, filename);
  const buf = fs.readFileSync(fpath);
  return "data:image/png;base64," + buf.toString("base64");
}

let doc;
let y; // current Y cursor

function setColor(hexC) { doc.setTextColor(...hex(hexC)); }
function setFill(hexC) { doc.setFillColor(...hex(hexC)); }
function setDraw(hexC) { doc.setDrawColor(...hex(hexC)); }

function newPage() {
  doc.addPage();
  y = MT;
  drawPageBg();
}

function drawPageBg() {
  setFill(COL_DARK);
  doc.rect(0, 0, PW, PH, "F");
  // accent strip at top
  setFill(COL_ACC);
  doc.rect(0, 0, PW, 4, "F");
}

function heading(text, fontSize = 16) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  setColor(COL_LIGHT);
  doc.text(text, ML, y);
  y += fontSize * 0.5 + 2;
  // underline
  setFill(COL_ACC);
  doc.rect(ML, y, 40, 1.2, "F");
  y += 6;
}

function subheading(text, fontSize = 12) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  setColor("#a5b4fc"); // indigo-300
  doc.text(text, ML, y);
  y += fontSize * 0.5 + 3;
}

function bodyText(text, fontSize = 9.5) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  setColor("#cbd5e1"); // slate-300
  const lines = doc.splitTextToSize(text, CW);
  if (y + lines.length * 4.5 > PH - MB) newPage();
  doc.text(lines, ML, y);
  y += lines.length * 4.5 + 2;
}

function addImage(filename, maxW, maxH, centered = true) {
  const imgData = loadImageBase64(filename);
  // Get natural dimensions by temp adding
  const props = doc.getImageProperties(imgData);
  let w = maxW || CW;
  let h = (props.height / props.width) * w;
  if (maxH && h > maxH) {
    h = maxH;
    w = (props.width / props.height) * h;
  }
  if (y + h > PH - MB) newPage();
  const x = centered ? ML + (CW - w) / 2 : ML;
  // subtle border
  setDraw("#334155");
  doc.setLineWidth(0.5);
  doc.roundedRect(x - 1, y - 1, w + 2, h + 2, 2, 2, "S");
  doc.addImage(imgData, "PNG", x, y, w, h);
  y += h + 6;
}

function spacer(px = 4) { y += px; }

function bullet(text, fontSize = 9.5) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  setColor("#cbd5e1");
  const lines = doc.splitTextToSize(text, CW - 8);
  if (y + lines.length * 4.5 > PH - MB) newPage();
  setFill(COL_ACC);
  doc.circle(ML + 2, y - 1.5, 1, "F");
  doc.text(lines, ML + 6, y);
  y += lines.length * 4.5 + 1;
}

function pageNumber(num) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setColor("#64748b");
  doc.text(`Page ${num}`, PW / 2, PH - 8, { align: "center" });
  doc.text("ClinkerPSO — Supply Chain Optimizer", PW - MR, PH - 8, { align: "right" });
}

// ────────────────────────────────────────────────
// BUILD THE PDF
// ────────────────────────────────────────────────
doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
let pageNum = 1;

// ═══════════════════════════════════════════════
// PAGE 1 — TITLE PAGE
// ═══════════════════════════════════════════════
drawPageBg();
y = 50;

// Big gradient-like accent block
setFill(COL_ACC);
doc.roundedRect(ML, 35, CW, 70, 4, 4, "F");
setFill("#6d28d9"); // darker violet
doc.roundedRect(ML + 2, 37, CW - 4, 66, 3, 3, "F");

doc.setFont("helvetica", "bold");
doc.setFontSize(36);
setColor("#ffffff");
doc.text("ClinkerPSO", PW / 2, 62, { align: "center" });

doc.setFontSize(14);
setColor("#e0e7ff");
doc.text("Supply Chain Optimization using Particle Swarm Optimization", PW / 2, 74, { align: "center" });

doc.setFontSize(10);
setColor("#c7d2fe");
doc.text("Clinker Allocation  •  Multi-Modal Transport  •  Cost Minimization", PW / 2, 86, { align: "center" });

y = 120;
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
setColor("#94a3b8");
doc.text("Project Report", PW / 2, y, { align: "center" });
y += 8;
doc.text("Innovative Assignment — Cement Supply Chain", PW / 2, y, { align: "center" });
y += 14;
doc.setFontSize(9);
setColor("#64748b");
doc.text("Generated on: " + new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }), PW / 2, y, { align: "center" });

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 2 — TABLE OF CONTENTS
// ═══════════════════════════════════════════════
newPage();
heading("Table of Contents", 18);
spacer(4);

const toc = [
  ["1.", "Problem Statement — The Clinker Allocation Challenge"],
  ["2.", "Application Overview — Map & Allocation Interface"],
  ["3.", "PSO Algorithm — How It Works"],
  ["4.", "Particle Encoding & Fitness Function"],
  ["5.", "Dashboard — KPI Cards & Analytics"],
  ["6.", "Convergence Chart & Cost Breakdown"],
  ["7.", "Allocation Results — Filters & Data Table"],
  ["8.", "Volume by Transport Mode — Bar Chart"],
  ["9.", "Interactive Map — OSRM Real Routes"],
  ["10.", "Node Selection & Route Highlighting"],
  ["11.", "Node Details & Route Tooltips"],
  ["12.", "Technology Stack & Architecture"],
];

toc.forEach(([num, title]) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(COL_ACC);
  doc.text(num, ML + 5, y);
  setColor(COL_LIGHT);
  doc.text(title, ML + 18, y);
  // dotted line
  setDraw("#334155");
  doc.setLineDashPattern([1, 1.5], 0);
  doc.line(ML + 18 + doc.getTextWidth(title) + 3, y - 0.5, PW - MR - 15, y - 0.5);
  doc.setLineDashPattern([], 0);
  y += 8;
});

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 3 — PROBLEM STATEMENT
// ═══════════════════════════════════════════════
newPage();
heading("1. Problem Statement", 16);
spacer(2);
bodyText("In the cement industry, Integrated Units (IUs) produce clinker — a key intermediate material. This clinker must be transported to Grinding Units (GUs) across India, where it's ground into cement. The challenge: determine how much clinker to ship from each IU to each GU, via which transport mode (Road, Rail, Bulk), across 3 time periods, while minimizing total cost and satisfying all constraints.");
spacer(2);

subheading("Problem Scale");
bullet("15 Integrated Units (IUs) — Clinker production plants");
bullet("15 Grinding Units (GUs) — Cement grinding destinations");
bullet("3 Transport Modes — Road, Rail, Bulk (each with different cost/capacity)");
bullet("3 Time Periods — Multi-period planning horizon");
bullet("2,025 Decision Variables — 15 × 15 × 3 × 3 integer values per particle");
spacer(4);

subheading("Constraints Enforced");
bullet("Production ≤ Capacity — Each IU respects its maximum production capacity");
bullet("Demand fully met per period — Every GU must receive exactly its required clinker");
bullet("Inventory ≥ Safety Stock — Closing inventory must not drop below safety levels");
bullet("Inventory ≤ Max Inventory — Storage must not exceed silo capacity");
bullet("Integer number of trips — Only whole trips allowed");
bullet("SBQ (Standard Bag Quantity) compliance per mode — Respects minimum batch sizes");
spacer(4);

addImage("Screenshot 2026-03-30 141146.png", CW * 0.65, 55);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 4 — APPLICATION OVERVIEW
// ═══════════════════════════════════════════════
newPage();
heading("2. Application Overview", 16);
spacer(2);
bodyText("ClinkerPSO is a full-stack web application built with React, TypeScript, and Vite. It provides an interactive Map & Allocation interface where users can configure PSO parameters, set demand values, run the optimization, and visualize results in real time across a map, dashboard, and detailed data tables.");
spacer(2);

subheading("Map & Allocation Interface (Before Optimization)");
addImage("Screenshot 2026-03-30 141026.png", CW, 90);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 5 — APPLICATION OVERVIEW (continued)
// ═══════════════════════════════════════════════
newPage();
heading("2. Application Overview (cont.)", 16);
spacer(2);

subheading("Map with Optimized Routes Drawn");
addImage("Screenshot 2026-03-30 141316.png", CW, 90);

spacer(4);
subheading("Sidebar Controls");
bodyText("The sidebar provides: Mode selector (AUTO from database / MANUAL custom demand), Period filter (All, P1, P2, P3), Demand Overview table showing demand per node per period, and PSO Parameters with tunable sliders for Swarm Size, Max Iterations, Inertia Weight, Cognitive & Social coefficients, and Penalty Lambda.");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 6 — PSO ALGORITHM
// ═══════════════════════════════════════════════
newPage();
heading("3. PSO Algorithm — How It Works", 16);
spacer(2);
bodyText("Particle Swarm Optimization (PSO) is a nature-inspired metaheuristic that simulates a swarm of birds searching for food. Each 'particle' is a candidate solution that moves through the search space, guided by its own experience and the swarm's collective knowledge.");
spacer(4);

addImage("Screenshot 2026-03-30 141140.png", CW * 0.7, 85);
spacer(2);

subheading("PSO Parameters (Configurable)");
addImage("Screenshot 2026-03-30 141036.png", CW * 0.3, 55);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 7 — PARTICLE ENCODING & FITNESS
// ═══════════════════════════════════════════════
newPage();
heading("4. Particle Encoding & Fitness Function", 16);
spacer(2);

subheading("How a Particle Encodes the Solution");
bodyText("Each particle is a 4-dimensional array of integers: particle[i][j][t][m] = number of trips from source i → destination j in period t via mode m. With 15 IUs × 15 GUs × 3 periods × 3 modes = 2,025 integer decision variables per particle.");
spacer(2);
addImage("Screenshot 2026-03-30 141152.png", CW * 0.65, 50);
spacer(4);

subheading("The Fitness Function");
bodyText("F(x) = Σ Production Cost (production × cost_per_MT) + Σ Transport Cost (trips × capacity × distance × rate) + Σ Inventory Holding Cost (closing_inv × ₹50/MT/period) + λ × Σ Constraint Violations. The penalty lambda (λ) is a large multiplier (e.g. 1×10⁶) that penalizes constraint violations, forcing the swarm to converge toward feasible solutions.");
spacer(2);
addImage("Screenshot 2026-03-30 141158.png", CW * 0.65, 55);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 8 — EXECUTION TRACE + READING RESULTS
// ═══════════════════════════════════════════════
newPage();
heading("4. Particle Encoding & Fitness (cont.)", 16);
spacer(2);

subheading("Step-by-Step Execution Trace");
bodyText("The application provides an interactive, step-by-step walkthrough of the PSO algorithm's execution. Users can navigate through 6 key stages and observe how the best cost evolves from the initial random evaluation to the final converged solution.");
addImage("Screenshot 2026-03-30 141204.png", CW * 0.6, 40);
spacer(4);

subheading("Reading the Results");
addImage("Screenshot 2026-03-30 141208.png", CW * 0.65, 40);
spacer(2);
bodyText("Map Flow Lines: Line thickness = quantity transported. Orange = Road, Blue = Rail, Green = Bulk. The Allocation Table supports sorting by any column and filtering by period or transport mode. If closing inventory drops below safety stock, it indicates the PSO couldn't find a fully feasible solution — try increasing penalty λ or swarm size.");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 9 — DASHBOARD KPI
// ═══════════════════════════════════════════════
newPage();
heading("5. Dashboard — KPI Cards & Analytics", 16);
spacer(2);
bodyText("The Dashboard tab provides a comprehensive overview of the optimization results through four Key Performance Indicator (KPI) cards that display the Total Operating Cost and its breakdown into Production, Transport, and Inventory components. The Total Operating Cost excludes penalty costs to show only real-world expenditures.");
spacer(2);

subheading("KPI Cards");
addImage("Screenshot 2026-03-30 141101.png", CW, 25);
spacer(2);
bullet("Total Operating Cost: ₹84.46 Cr — Sum of all real operational costs (no penalties)");
bullet("Production Cost: ₹27.87 Cr (33.0%) — Cost of clinker production at IUs");
bullet("Transport Cost: ₹55.38 Cr (65.6%) — Cost of moving clinker via Road/Rail/Bulk");
bullet("Inventory Cost: ₹1.21 Cr (1.4%) — Holding cost at ₹50/MT/period");
spacer(4);

subheading("Full Dashboard View");
addImage("Screenshot 2026-03-30 141107.png", CW, 85);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 10 — CONVERGENCE & COST BREAKDOWN
// ═══════════════════════════════════════════════
newPage();
heading("6. Convergence Chart & Cost Breakdown", 16);
spacer(2);

subheading("Convergence — Best Fitness vs Iteration");
bodyText("The convergence chart shows how the PSO algorithm's best fitness (total cost including penalties) decreases over 166 iterations. The sharp initial drop indicates the swarm quickly finds better solutions, then converges to a near-optimal state. Early stopping is triggered if improvement drops below 0.01% over 20 consecutive iterations.");
addImage("Screenshot 2026-03-30 141127.png", CW * 0.65, 55);
spacer(4);

subheading("Cost Breakdown Donut Chart");
bodyText("The donut chart provides a visual decomposition of the total operating cost across three categories. Transport dominates at 65.6%, followed by Production at 33.0%, with Inventory being minimal at 1.4%. The center displays the aggregate total of ₹84.5 Cr.");
addImage("Screenshot 2026-03-30 141132.png", CW * 0.4, 55);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 11 — ALLOCATION RESULTS
// ═══════════════════════════════════════════════
newPage();
heading("7. Allocation Results — Filters & Data Table", 16);
spacer(2);
bodyText("The Allocation Results table displays all 126 allocation entries with comprehensive filtering capabilities. Users can filter by Transport Mode (ALL/ROAD/RAIL/BULK), Period (ALL/P1/P2/P3), Volume range, Distance range, and Cost range. All columns are sortable by clicking the header.");
spacer(2);
addImage("Screenshot 2026-03-30 141115.png", CW, 55);
spacer(4);

subheading("Filter Options");
bullet("MODE: ALL | ROAD | RAIL | BULK — Filter by transport type");
bullet("PERIOD: ALL | P1 | P2 | P3 — View specific time periods");
bullet("VOLUME: All | < 1,000 MT | 1k–5k MT | 5k–20k MT | > 20,000 MT");
bullet("DISTANCE: All | < 200 km | 200–500 km | 500–1000 km | > 1000 km");
bullet("COST: All | < ₹1 Lakh | ₹1L–₹10L | ₹10L–₹1Cr | > ₹1 Crore");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 12 — VOLUME CHART
// ═══════════════════════════════════════════════
newPage();
heading("8. Volume by Transport Mode", 16);
spacer(2);
bodyText("The Volume by Transport Mode bar chart visualizes the total quantity of clinker (in MT) transported through each mode. In this optimization run, Rail and Bulk dominate as the primary transport modes, each handling approximately 280,000–300,000 MT. Road transport handles significantly less volume (~6,000 MT), reflecting its higher per-MT cost.");
spacer(4);

addImage("Screenshot 2026-03-30 141122.png", CW * 0.6, 55);
spacer(6);

subheading("Key Insights");
bullet("Rail and Bulk are favored over Road due to lower per-MT transport costs");
bullet("Road is used primarily for short-distance, low-volume shipments where Rail/Bulk are unavailable");
bullet("The PSO algorithm naturally gravitates toward cheaper transport modes to minimize total cost");
bullet("The orange/blue/green color coding matches the map's route visualization for easy cross-referencing");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 13 — INTERACTIVE MAP + OSRM
// ═══════════════════════════════════════════════
newPage();
heading("9. Interactive Map — OSRM Real Routes", 16);
spacer(2);
bodyText("The map displays real driving routes fetched from OSRM (Open Source Routing Machine) instead of straight lines between source and destination. Routes are color-coded: Orange = Road, Blue = Rail, Green = Bulk. Line thickness represents the quantity of clinker being transported.");
spacer(2);
addImage("Screenshot 2026-03-30 141310.png", CW * 0.45, 80);

spacer(2);
subheading("OSRM Route Features");
bullet("Real road paths fetched from the OSRM public API — not straight-line approximations");
bullet("Routes are cached in memory to avoid redundant API calls");
bullet("Rate-limited request queue (60ms delay) to respect OSRM API limits");
bullet("Graceful fallback to straight lines if API is unavailable");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 14 — NODE SELECTION & HIGHLIGHTING
// ═══════════════════════════════════════════════
newPage();
heading("10. Node Selection & Route Highlighting", 16);
spacer(2);
bodyText("Clicking any IU or GU marker on the map highlights all routes connected to that node. Unrelated routes fade to 8% opacity in neutral gray, while selected routes are drawn thicker with full opacity and a glow effect. The selected node itself gets a white ring and shadow glow. Clicking the map background resets the view.");
spacer(4);

addImage("Screenshot 2026-03-30 141339.png", CW * 0.42, 85);
spacer(2);

subheading("Visual Cues");
bullet("Selected node: White border ring with glow shadow effect");
bullet("Connected routes: Increased weight, full opacity, underlying glow layer");
bullet("Unrelated routes: Reduced to thin gray (#475569) at 8% opacity");
bullet("Unrelated nodes: Faded to 35% opacity");
bullet("Map click: Deselects the node and restores all routes");

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 15 — NODE DETAILS & TOOLTIPS
// ═══════════════════════════════════════════════
newPage();
heading("11. Node Details & Route Tooltips", 16);
spacer(2);

subheading("Node Popup");
bodyText("Clicking a marker displays a detailed popup showing: the node's name and type, production capacity, production cost, initial/max inventory, safety stock, demand per period, current allocations (destination, quantity, mode, period), and inventory profile across all periods.");
spacer(2);
addImage("Screenshot 2026-03-30 141325.png", CW * 0.25, 65);
spacer(4);

subheading("Route Tooltips");
bodyText("Hovering over any route line shows a tooltip with: source → destination, quantity in MT, number of trips, transport mode, distance in km, cost in ₹, time period, and whether the route uses real OSRM pathing.");
spacer(2);
addImage("Screenshot 2026-03-30 141352.png", CW * 0.18, 16);
spacer(2);
addImage("Screenshot 2026-03-30 141417.png", CW * 0.38, 70);

pageNumber(pageNum++);

// ═══════════════════════════════════════════════
// PAGE 16 — TECHNOLOGY STACK
// ═══════════════════════════════════════════════
newPage();
heading("12. Technology Stack & Architecture", 16);
spacer(4);

subheading("Frontend");
bullet("React 18 with TypeScript — Component-based, type-safe UI");
bullet("Vite — Lightning-fast build tool and dev server");
bullet("Tailwind CSS — Utility-first styling framework");
bullet("Zustand — Lightweight state management");
bullet("React Leaflet — Interactive map with OpenStreetMap tiles");
bullet("Recharts — Responsive charting (LineChart, PieChart, BarChart)");
bullet("Lucide React — Icon library");
bullet("shadcn/ui-inspired — Custom Card, Badge, and UI components");
spacer(6);

subheading("Backend / Optimization Engine");
bullet("PSO Algorithm (swarm.ts) — Custom TypeScript implementation");
bullet("4D particle encoding (IU × GU × period × mode) with integer constraints");
bullet("Configurable hyperparameters: Swarm Size, Iterations, Inertia, c1, c2, Penalty λ");
bullet("Early stopping with convergence detection (0.01% threshold over 20 iterations)");
spacer(6);

subheading("External APIs");
bullet("OSRM (Open Source Routing Machine) — Real driving distance and geometry");
bullet("OpenStreetMap — Map tiles for visualization");
spacer(6);

subheading("Deployment & Version Control");
bullet("GitHub — https://github.com/yugdave2005/Clinker-Allocation-with-cost-optimization");
bullet("Node.js + npm — Package management and build pipeline");

// Thank you footer
y = PH - 35;
setFill(COL_ACC);
doc.roundedRect(ML, y, CW, 18, 3, 3, "F");
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
setColor("#ffffff");
doc.text("Thank You", PW / 2, y + 11, { align: "center" });

pageNumber(pageNum++);

// ────────────────────────────────────────────────
// SAVE
// ────────────────────────────────────────────────
const pdfBuffer = doc.output("arraybuffer");
fs.writeFileSync(OUTPUT_PDF, Buffer.from(pdfBuffer));
console.log(`\n✅  Report saved to: ${OUTPUT_PDF}`);
console.log(`    Pages: ${pageNum - 1}`);
console.log(`    Size:  ${(fs.statSync(OUTPUT_PDF).size / 1024 / 1024).toFixed(2)} MB\n`);

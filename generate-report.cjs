/**
 * ClinkerPSO — Project Report PDF Generator
 * -----------------------------------------
 * Matches formal academic/corporate report style (Light theme, Portrait)
 */

const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const PHOTOS_DIR = path.join(__dirname, "Photos");
const OUTPUT_PDF = path.join(__dirname, "PROJECT_REPORT.pdf");

// A4 Portrait dimensions in mm
const PW = 210;
const PH = 297;

// Margins
const ML = 25;  // left
const MR = 25;  // right
const MT = 25;  // top
const MB = 25;  // bottom
const CW = PW - ML - MR; 

// Colors
const COL_DARK = "#1e293b";
const COL_TEXT = "#334155";
const COL_GRAY = "#64748b";
const COL_LIGHT_GRAY = "#f1f5f9";
const COL_ACCENT = "#2563eb"; // Blue accent

// Helpers
function hex(c) {
  const r = parseInt(c.slice(1,3),16);
  const g = parseInt(c.slice(3,5),16);
  const b = parseInt(c.slice(5,7),16);
  return [r,g,b];
}

function loadImageBase64(filename) {
  const fpath = path.join(PHOTOS_DIR, filename);
  if (!fs.existsSync(fpath)) return null;
  const buf = fs.readFileSync(fpath);
  return "data:image/png;base64," + buf.toString("base64");
}

let doc;
let y; 

function setColor(hexC) { doc.setTextColor(...hex(hexC)); }
function setFill(hexC) { doc.setFillColor(...hex(hexC)); }
function setDraw(hexC) { doc.setDrawColor(...hex(hexC)); }

function newPage() {
  doc.addPage();
  y = MT;
  // Page Header
  if (pageNum > 1) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(COL_GRAY);
    doc.text("ClinkerPSO — Innovative Assignment Report · 2026", ML, MT - 10);
    doc.text(`Page ${pageNum}`, PW - MR, MT - 10, { align: "right" });
    
    setDraw("#e2e8f0");
    doc.setLineWidth(0.2);
    doc.line(ML, MT - 6, PW - MR, MT - 6);
  }
}

function sectionHeader(number, title) {
  spacer(6);
  if (y > PH - MB - 30) newPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(COL_GRAY);
  doc.text(`S E C T I O N  0 ${number}`, ML, y);
  y += 6;
  
  doc.setFontSize(18);
  setColor(COL_DARK);
  doc.text(title, ML, y);
  y += 6;
  
  setFill(COL_ACCENT);
  doc.rect(ML, y, 15, 1, "F");
  y += 10;
}

function subheading(text, fontSize = 12) {
  if (y > PH - MB - 20) newPage();
  spacer(2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  setColor(COL_DARK);
  doc.text(text, ML, y);
  y += fontSize * 0.5 + 4;
}

function bodyText(text, fontSize = 10) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  setColor(COL_TEXT);
  const lines = doc.splitTextToSize(text, CW);
  if (y + lines.length * 4.5 > PH - MB) newPage();
  doc.text(lines, ML, y);
  y += lines.length * 4.5 + 2;
}

function addImage(filename, maxW, maxH, centered = true) {
  const imgData = loadImageBase64(filename);
  if (!imgData) return;
  const props = doc.getImageProperties(imgData);
  let w = maxW || CW;
  let h = (props.height / props.width) * w;
  if (maxH && h > maxH) {
    h = maxH;
    w = (props.width / props.height) * h;
  }
  if (y + h > PH - MB) newPage();
  const x = centered ? ML + (CW - w) / 2 : ML;
  
  // Shadow/Border effect
  setFill(COL_LIGHT_GRAY);
  doc.rect(x + 2, y + 2, w, h, "F");
  setDraw("#cbd5e1");
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h, "S");
  
  doc.addImage(imgData, "PNG", x, y, w, h);
  y += h + 8;
}

function spacer(px = 6) { y += px; }

function bullet(text, fontSize = 10) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  setColor(COL_TEXT);
  const lines = doc.splitTextToSize(text, CW - 6);
  if (y + lines.length * 4.5 > PH - MB) newPage();
  setFill(COL_ACCENT);
  doc.circle(ML + 2, y - 1.2, 0.8, "F");
  doc.text(lines, ML + 6, y);
  y += lines.length * 4.5 + 2;
}

doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
let pageNum = 1;

// ═══════════════════════════════════════════════
// PAGE 1 — TITLE PAGE
// ═══════════════════════════════════════════════
y = 60;

doc.setFont("helvetica", "bold");
doc.setFontSize(14);
setColor(COL_GRAY);
doc.text("INNOVATIVE ASSIGNMENT", ML, y);
y += 15;

doc.setFontSize(28);
setColor(COL_DARK);
const titleLines = doc.splitTextToSize("TOPIC: ClinkerPSO", CW);
doc.text(titleLines, ML, y);
y += titleLines.length * 10 + 5;

setFill(COL_ACCENT);
doc.rect(ML, y, 40, 2, "F");
y += 30;

doc.setFontSize(16);
setColor(COL_DARK);
doc.text("Submitted by:", ML, y);
y += 10;

doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text("Yug Dave", ML, y);
doc.setFont("helvetica", "normal");
doc.text("23BCE383", ML, y + 6);

y += 20;
doc.setFont("helvetica", "bold");
doc.text("Parth Z", ML, y);
doc.setFont("helvetica", "normal");
doc.text("23BTM064", ML, y + 6);

pageNum++;

// ═══════════════════════════════════════════════
// PAGE 2 — OVERVIEW & TECH
// ═══════════════════════════════════════════════
newPage();
doc.setFont("helvetica", "bold");
doc.setFontSize(20);
setColor(COL_DARK);
doc.text("ClinkerPSO", ML, y);
y += 8;
doc.setFont("helvetica", "normal");
doc.setFontSize(12);
setColor(COL_GRAY);
doc.text("Supply Chain Optimization using Particle Swarm Optimization", ML, y);
y += 15;

bodyText("PROJECT TYPE", 9);
doc.setFont("helvetica", "bold");
doc.text("Web Application & Optimization Engine", ML, y - 4);
y += 6;

bodyText("TECH STACK", 9);
doc.setFont("helvetica", "bold");
doc.text("React, TypeScript, Vite, Tailwind CSS, Zustand, Recharts", ML, y - 4);
y += 10;

setDraw("#e2e8f0");
doc.line(ML, y, PW - MR, y);
y += 10;

sectionHeader("1", "Problem Statement & Methodology");
bodyText("In the cement industry, Integrated Units (IUs) produce clinker — a key intermediate material. This clinker must be transported to Grinding Units (GUs) across India, where it's ground into cement. The challenge is to determine how much clinker to ship from each IU to each GU, via which transport mode (Road, Rail, Bulk), across 3 time periods, while minimizing total cost and satisfying all constraints.");
spacer();
subheading("Constraints & Parameters");
bullet("15 Integrated Units and 15 Grinding Units");
bullet("3 Transport Modes (Road, Rail, Bulk) across 3 Time Periods");
bullet("Production ≤ Capacity limits enforced");
bullet("Demand fully met per period");
bullet("Inventory bounded by Safety Stock and Max Capacity ceilings");
spacer();
subheading("The Optimization Engine (PSO)");
bodyText("Particle Swarm Optimization (PSO) simulates a swarm searching for optimal allocation. Each particle represents a full supply chain routing array (15×15×3×3 variables). The fitness function evaluates the Total Cost (Production + Transport + Inventory) plus steep penalties for any constraint violations.");

pageNum++;

// ═══════════════════════════════════════════════
// PAGE 3 — INTERACTIVE DASHBOARD
// ═══════════════════════════════════════════════
newPage();
sectionHeader("2", "Interactive Dashboard & KPI Analysis");
bodyText("The application features a comprehensive dashboard enabling real-time monitoring of optimization results, cost breakdowns, and swarm convergence metrics.");
spacer();

subheading("KPI Metrics");
addImage("Screenshot 2026-03-30 141101.png", CW, 45);

subheading("Cost Breakdown Analysis");
bodyText("Transport cost constitutes the majority (65.6%) of total operating expenditures, followed by Production (33.0%). Inventory holding costs remain minimal (1.4%).");
addImage("Screenshot 2026-03-30 141132.png", CW * 0.6, 80);

pageNum++;

// ═══════════════════════════════════════════════
// PAGE 4 — CONVERGENCE & VOLUME
// ═══════════════════════════════════════════════
newPage();
sectionHeader("3", "Algorithm Convergence & Volume Data");

subheading("PSO Convergence Curve");
bodyText("The algorithm rapidly improves fitness in the initial iterations, aggressively punishing constraint violations before converging on a feasible, optimal cost allocation.");
addImage("Screenshot 2026-03-30 141127.png", CW, 80);

subheading("Volume by Transport Mode");
bodyText("Rail and Bulk transport modes are heavily favored by the optimizer due to lower per-MT transport rates compared to Road freight.");
addImage("Screenshot 2026-03-30 141122.png", CW, 80);

pageNum++;

// ═══════════════════════════════════════════════
// PAGE 5 — MAP VISUALIZATION
// ═══════════════════════════════════════════════
newPage();
sectionHeader("4", "Geospatial Route Visualization");
bodyText("The interactive map plots all 15 IUs and 15 GUs across India. Real driving distances and route geometries are fetched dynamically via the Open Source Routing Machine (OSRM) API.");
spacer();

subheading("Optimized Network Mapping");
bodyText("Line thickness denotes clinker volume. Colors represent transport modes: Orange (Road), Blue (Rail), and Green (Bulk).");
addImage("Screenshot 2026-03-30 141310.png", CW * 0.8, 110);

pageNum++;

// ═══════════════════════════════════════════════
// PAGE 6 — INTERACTIVITY & FILTERING
// ═══════════════════════════════════════════════
newPage();
sectionHeader("5", "User Interaction & Data Filtering");

subheading("Node Selection & Isolation");
bodyText("Clicking any node isolates its connected active routes, instantly fading unrelated network activity to highlight specific supply chain dependencies.");
addImage("Screenshot 2026-03-30 141339.png", CW * 0.8, 85);

subheading("Allocation Data Table");
bodyText("A comprehensive, sortable data table provides granular access to the 126 generated allocation instructions, complete with multi-parameter filtering.");
addImage("Screenshot 2026-03-30 141115.png", CW, 50);

pageNum++;

// ═══════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════
const pdfBuffer = doc.output("arraybuffer");
fs.writeFileSync(OUTPUT_PDF, Buffer.from(pdfBuffer));
console.log(`\n✅  Formal Report saved to: ${OUTPUT_PDF}`);

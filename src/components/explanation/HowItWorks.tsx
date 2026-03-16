import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { StepCard } from './StepCard';
import { PSOStepper } from './PSOStepper';
import { ArrowRight, Brain, Target, TrendingDown, BookOpen, BarChart3, Map } from 'lucide-react';

const PSO_STEPS = [
  { icon: '🐦', title: '1. Initialize Swarm', description: 'Create N particles with random positions in the solution space. Each particle represents a complete allocation plan (which IU sends how much clinker to which GU, via which mode, in each period).' },
  { icon: '📊', title: '2. Evaluate Fitness', description: 'For each particle, compute the total cost = Production Cost + Transport Cost + Inventory Holding Cost + Penalty for constraint violations. Lower fitness = better solution.' },
  { icon: '🎯', title: '3. Update Personal Best', description: 'Each particle remembers its best-ever position (pBest). If the current position has a better fitness than pBest, update pBest to the current position.' },
  { icon: '👑', title: '4. Update Global Best', description: 'The swarm tracks the best position found by ANY particle (gBest). This is the collective intelligence — the best solution discovered so far.' },
  { icon: '🚀', title: '5. Move Particles', description: 'Update each particle\'s velocity using: v = w·v + c1·r1·(pBest - x) + c2·r2·(gBest - x). Then update position: x = x + v. The inertia w decreases linearly from 0.9 to 0.4 over iterations.' },
  { icon: '🔁', title: '6. Repeat Until Convergence', description: 'Repeat steps 2-5 for up to maxIterations. Stop early if the best cost hasn\'t improved by more than 0.01% over the last 20 iterations. The gBest position is the optimal allocation plan.' },
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">How It Works</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Understanding the Particle Swarm Optimization approach to clinker allocation and transportation in the cement supply chain.
        </p>
      </div>

      {/* Section 1: The Problem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-violet-400" />
            Section 1 — The Problem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            In the cement industry, <strong className="text-orange-400">Integrated Units (IUs)</strong> produce clinker — a key intermediate material. This clinker must be transported to <strong className="text-blue-400">Grinding Units (GUs)</strong> across India, where it's ground into cement.
          </p>
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl mb-1">🏭</div>
              <div className="text-xs font-semibold text-orange-400">15 IUs</div>
              <div className="text-[10px] text-slate-500">Produce clinker</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="w-6 h-6 text-slate-500" />
              <span className="text-[10px] text-slate-600">Road / Rail / Bulk</span>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl mb-1">🏗️</div>
              <div className="text-xs font-semibold text-blue-400">15 GUs</div>
              <div className="text-[10px] text-slate-500">Grind to cement</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The challenge: determine <strong className="text-slate-200">how much clinker</strong> to ship from each IU to each GU, <strong className="text-slate-200">via which transport mode</strong> (road, rail, bulk), across <strong className="text-slate-200">3 time periods</strong>, while minimizing total cost and satisfying all constraints (production capacity, inventory limits, safety stock, demand fulfillment).
          </p>
        </CardContent>
      </Card>

      {/* Section 2: What PSO Is */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-violet-400" />
            Section 2 — What PSO Is
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Particle Swarm Optimization (PSO) is a nature-inspired metaheuristic that simulates a swarm of birds searching for food. Each "particle" is a candidate solution that moves through the search space, guided by its own experience and the swarm's collective knowledge.
          </p>
          <div className="space-y-0">
            {PSO_STEPS.map((step, idx) => (
              <StepCard key={idx} icon={step.icon} title={step.title} description={step.description} index={idx} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Particle Encoding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Section 3 — How a Particle Encodes the Solution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Each particle is a <strong className="text-slate-200">4-dimensional array</strong> of integers:
          </p>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-xs text-violet-300 text-center">
            particle[i][j][t][m] = number of trips from source i → destination j in period t via mode m
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2 px-2">Dimension</th>
                  <th className="text-left py-2 px-2">Represents</th>
                  <th className="text-left py-2 px-2">Range</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700/50">
                  <td className="py-1.5 px-2 font-mono text-orange-400">i</td>
                  <td className="py-1.5 px-2">Source IU index</td>
                  <td className="py-1.5 px-2 font-mono">0–14 (15 IUs)</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-1.5 px-2 font-mono text-blue-400">j</td>
                  <td className="py-1.5 px-2">Destination GU index</td>
                  <td className="py-1.5 px-2 font-mono">0–14 (15 GUs)</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-1.5 px-2 font-mono text-emerald-400">t</td>
                  <td className="py-1.5 px-2">Time period</td>
                  <td className="py-1.5 px-2 font-mono">0–2 (3 periods)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">m</td>
                  <td className="py-1.5 px-2">Transport mode</td>
                  <td className="py-1.5 px-2 font-mono">0–2 (Road, Rail, Bulk)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            Total decision variables: 15 × 15 × 3 × 3 = <strong className="text-slate-300">2,025</strong> integer values per particle
          </p>
        </CardContent>
      </Card>

      {/* Section 4: Fitness Function */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="w-5 h-5 text-violet-400" />
            Section 4 — The Fitness Function
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-xs leading-loose text-slate-200">
            <div className="text-violet-400 font-semibold mb-1">F(x) =</div>
            <div className="pl-4 text-orange-300">Σ Production Cost (production × cost_per_MT)</div>
            <div className="pl-4 text-blue-300">+ Σ Transport Cost (trips × capacity × distance × rate)</div>
            <div className="pl-4 text-emerald-300">+ Σ Inventory Holding Cost (closing_inv × ₹50/MT/period)</div>
            <div className="pl-4 text-red-300">+ λ × Σ Constraint Violations</div>
          </div>

          <h4 className="text-xs font-semibold text-slate-300 mt-4">Constraints Enforced:</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              '✅ Production ≤ Capacity',
              '✅ Demand fully met per period',
              '✅ Inventory ≥ Safety Stock',
              '✅ Inventory ≤ Max Inventory',
              '✅ Integer number of trips',
              '✅ SBQ compliance per mode',
            ].map((c, i) => (
              <div key={i} className="text-xs text-slate-400 bg-slate-700/30 rounded px-2 py-1.5">{c}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Execution Trace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5 text-violet-400" />
            Section 5 — Step-by-Step Execution Trace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PSOStepper />
        </CardContent>
      </Card>

      {/* Section 6: Reading the Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="w-5 h-5 text-violet-400" />
            Section 6 — Reading the Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-400">
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-1">Map Flow Lines</h4>
            <p className="text-xs">Line <strong className="text-slate-200">thickness</strong> = quantity transported. <strong className="text-orange-400">Orange</strong> = Road, <strong className="text-blue-400">Blue</strong> = Rail, <strong className="text-green-400">Green</strong> = Bulk. Hover for details.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-1">Allocation Table</h4>
            <p className="text-xs">Sort by any column. Filter by period or transport mode. Shows trips, quantity, distance, and cost for each route.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-1">Inventory Safety</h4>
            <p className="text-xs">If closing inventory drops below safety stock, it indicates the PSO couldn't find a feasible solution for that constraint — try increasing penalty λ or swarm size.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-1">AUTO vs MANUAL Mode</h4>
            <p className="text-xs">AUTO uses demand from the database. MANUAL lets you override demand for specific locations to run what-if scenarios and compare outcomes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

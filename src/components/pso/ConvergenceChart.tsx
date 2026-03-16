import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppStore } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

export const ConvergenceChart: React.FC = () => {
  const { liveConvergence, currentResult } = useAppStore();
  const data = currentResult?.convergenceData ?? liveConvergence.map(p => ({ iter: p.iter, bestCost: p.cost }));

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Convergence Chart</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            Run PSO to see convergence data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Convergence — Best Fitness vs Iteration</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="iter" stroke="#94a3b8" fontSize={11} label={{ value: 'Iteration', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8', fontSize: 11 } }} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number) => [formatCurrency(value), 'Best Cost']}
            />
            <Line type="monotone" dataKey="bestCost" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

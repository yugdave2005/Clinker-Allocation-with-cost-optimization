import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppStore } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#f97316', '#3b82f6', '#22c55e'];

export const CostBreakdown: React.FC = () => {
  const { currentResult } = useAppStore();

  if (!currentResult) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            No data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Production', value: currentResult.costBreakdown.production },
    { name: 'Transport', value: currentResult.costBreakdown.transport },
    { name: 'Inventory', value: currentResult.costBreakdown.inventory },
  ];

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const COLORS: Record<string, string> = {
  Production: '#f97316',
  Transport: '#3b82f6',
  Inventory: '#22c55e',
};

// Custom label rendered OUTSIDE the donut slices
const renderCustomLabel = ({
  cx, cy, midAngle, outerRadius, percent,
}: any) => {
  if (percent < 0.02) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#f1f5f9"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontFamily="Inter, sans-serif"
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const crore = (value / 1e7).toFixed(2);
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '8px 14px',
    }}>
      <p style={{ color: COLORS[name] || '#f1f5f9', fontWeight: 600, margin: 0, fontSize: 13 }}>
        {name}
      </p>
      <p style={{ color: '#f1f5f9', margin: '2px 0 0', fontSize: 14 }}>
        ₹{crore} Cr
      </p>
    </div>
  );
};

// Custom legend below chart
const CustomLegend: React.FC<{ items: { name: string; value: number; color: string }[]; total: number }> = ({ items, total }) => (
  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
    {items.map((item) => (
      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
        <span style={{ color: '#94a3b8', fontSize: 11 }}>{item.name}</span>
        <span style={{ color: '#f1f5f9', fontSize: 11, fontWeight: 600 }}>
          ₹{(item.value / 1e7).toFixed(2)} Cr
        </span>
        <span style={{ color: '#64748b', fontSize: 10 }}>
          ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
        </span>
      </div>
    ))}
  </div>
);

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

  const { production, transport, inventory } = currentResult.costBreakdown;
  const total = production + transport + inventory;

  const data = [
    { name: 'Production', value: production },
    { name: 'Transport', value: transport },
    { name: 'Inventory', value: inventory },
  ].filter((d) => d.value > 0);

  const legendItems = data.map((d) => ({
    name: d.name,
    value: d.value,
    color: COLORS[d.name],
  }));

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
      <CardContent>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Total label in donut center */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Total</div>
            <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>
              ₹{(total / 1e7).toFixed(1)} Cr
            </div>
          </div>
        </div>
        <CustomLegend items={legendItems} total={total} />
      </CardContent>
    </Card>
  );
};

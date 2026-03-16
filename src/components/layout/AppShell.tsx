import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';
import { ClinkerMap } from '../map/ClinkerMap';
import { ConvergenceChart } from '../pso/ConvergenceChart';
import { AllocationTable } from '../pso/AllocationTable';
import { CostBreakdown } from '../pso/CostBreakdown';
import { HowItWorks } from '../explanation/HowItWorks';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { DollarSign, Factory, Truck, Package, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Dashboard KPI Card subcomponent
const KPICard: React.FC<{ title: string; value: number | null; total: number | null; icon: React.ReactNode; color: string }> = ({
  title, value, total, icon, color,
}) => {
  const pct = value && total && total > 0 ? ((value / total) * 100).toFixed(1) : '—';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-slate-400">{title}</span>
          <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
        </div>
        <div className="font-mono text-xl font-bold text-slate-100">
          {value !== null ? formatCurrency(value) : '—'}
        </div>
        <div className="text-xs text-slate-500 mt-1">{pct}% of total</div>
      </CardContent>
    </Card>
  );
};

export const AppShell: React.FC = () => {
  const { activeTab, currentResult, runHistory } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <TabBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar shows only on MAP tab */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'MAP' && (
            <div className="h-full">
              <ClinkerMap />
            </div>
          )}

          {activeTab === 'DASHBOARD' && (
            <div className="p-6 space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-4 gap-4">
                <KPICard
                  title="Total Cost"
                  value={currentResult?.bestCost ?? null}
                  total={currentResult?.bestCost ?? null}
                  icon={<DollarSign className="w-4 h-4 text-violet-400" />}
                  color="bg-violet-500/10"
                />
                <KPICard
                  title="Production Cost"
                  value={currentResult?.costBreakdown.production ?? null}
                  total={currentResult?.bestCost ?? null}
                  icon={<Factory className="w-4 h-4 text-orange-400" />}
                  color="bg-orange-500/10"
                />
                <KPICard
                  title="Transport Cost"
                  value={currentResult?.costBreakdown.transport ?? null}
                  total={currentResult?.bestCost ?? null}
                  icon={<Truck className="w-4 h-4 text-blue-400" />}
                  color="bg-blue-500/10"
                />
                <KPICard
                  title="Inventory Cost"
                  value={currentResult?.costBreakdown.inventory ?? null}
                  total={currentResult?.bestCost ?? null}
                  icon={<Package className="w-4 h-4 text-emerald-400" />}
                  color="bg-emerald-500/10"
                />
              </div>

              {/* Convergence + Cost Breakdown */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <ConvergenceChart />
                </div>
                <div className="col-span-2">
                  <CostBreakdown />
                </div>
              </div>

              {/* Allocation Table */}
              <AllocationTable />

              {/* Inventory Profile + Run History */}
              <div className="grid grid-cols-5 gap-4">
                {/* Inventory Profile Chart */}
                <div className="col-span-3">
                  <Card>
                    <CardHeader><CardTitle>Inventory Profile</CardTitle></CardHeader>
                    <CardContent>
                      {currentResult ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={(() => {
                            const byPeriod: Record<number, Record<string, number>> = {};
                            currentResult.inventoryPlan.forEach(s => {
                              if (!byPeriod[s.period]) byPeriod[s.period] = { period: s.period } as any;
                              byPeriod[s.period][s.locationCode] = s.closingInv;
                            });
                            return Object.values(byPeriod);
                          })()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                            {currentResult.inventoryPlan
                              .reduce((acc, s) => acc.includes(s.locationCode) ? acc : [...acc, s.locationCode], [] as string[])
                              .slice(0, 10)
                              .map((code, i) => (
                                <Line
                                  key={code}
                                  type="monotone"
                                  dataKey={code}
                                  stroke={code.startsWith('IU') ? `hsl(${25 + i * 8}, 80%, 55%)` : `hsl(${210 + i * 8}, 80%, 55%)`}
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Run History */}
                <div className="col-span-2">
                  <Card>
                    <CardHeader><CardTitle>Run History</CardTitle></CardHeader>
                    <CardContent>
                      {runHistory.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-8">No runs yet</div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {runHistory.map((run) => (
                            <div key={run.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2 text-xs">
                              <div>
                                <Badge variant={run.mode === 'AUTO' ? 'success' : 'warning'}>{run.mode}</Badge>
                                <span className="text-slate-400 ml-2">{new Date(run.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <div className="font-mono text-slate-200">{run.totalCost ? formatCurrency(run.totalCost) : '—'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HOW_IT_WORKS' && (
            <div className="overflow-auto h-full">
              <HowItWorks />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

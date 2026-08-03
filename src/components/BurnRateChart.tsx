import React from 'react';
import { Product } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { TrendingDown, Calendar, AlertCircle } from 'lucide-react';

interface BurnRateChartProps {
  inventory: Product[];
}

export function BurnRateChart({ inventory }: BurnRateChartProps) {
  // Generate 30-day projection data for products with active stock tracking
  const trackableProducts = inventory.filter(p => p.daysRemaining !== undefined);

  const projectionDays = Array.from({ length: 30 }, (_, i) => i);

  const chartData = projectionDays.map(dayOffset => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = dayOffset === 0 ? 'Today' : `+${dayOffset}d`;

    const point: Record<string, any> = { day: dateStr, dayNumber: dayOffset };

    trackableProducts.forEach(prod => {
      const dailyUsage = prod.dailyUsageRate || 1;
      const initialStock = prod.unitsInStock || (prod.daysRemaining ? prod.daysRemaining * dailyUsage : 30);
      const remainingStock = Math.max(0, initialStock - dayOffset * dailyUsage);
      point[prod.name] = remainingStock;
    });

    return point;
  });

  const colors = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">30-Day Inventory Burn-Rate & Depletion Trajectory</h3>
          </div>
          <p className="text-xs text-slate-500">
            Automated stock degradation projection based on daily dosage intake rates.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reorder Trigger (≤ 5 Days)
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {trackableProducts.map((prod, idx) => (
                <linearGradient key={prod.id} id={`grad-${prod.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Units Remaining', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', fontSize: '12px' }}
            />
            <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Reorder Line (5 units)', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            
            {trackableProducts.map((prod, idx) => (
              <Area
                key={prod.id}
                type="monotone"
                dataKey={prod.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#grad-${prod.id})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Depletion milestones list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        {trackableProducts.map((prod) => {
          const daysLeft = prod.daysRemaining || 0;
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + daysLeft);
          const dateFormatted = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isCritical = daysLeft <= 5;

          return (
            <div 
              key={prod.id} 
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                isCritical ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div>
                <span className="font-bold block truncate max-w-[140px]">{prod.name}</span>
                <span className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> Depletes: {dateFormatted}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-extrabold text-sm block ${isCritical ? 'text-amber-700' : 'text-slate-900'}`}>
                  {daysLeft}d left
                </span>
                <span className="text-[10px] opacity-75">{prod.dailyUsageRate || 1}/day</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

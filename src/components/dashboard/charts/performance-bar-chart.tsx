'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FellowPerformance {
  name: string;
  totalSessions: number;
  avgContentCoverage: number;
  avgFacilitationQuality: number;
  avgProtocolSafety: number;
  riskCount: number;
}

interface PerformanceBarChartProps {
  data: FellowPerformance[];
}

const CHART_COLORS = {
  contentCoverage: 'hsl(var(--chart-1))',
  facilitationQuality: 'hsl(var(--chart-2))',
  protocolSafety: 'hsl(var(--chart-3))'
};

export function PerformanceBarChart({ data }: PerformanceBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No performance data available
      </div>
    );
  }

  const chartData = data.map(f => ({
    name: f.name.length > 12 ? f.name.slice(0, 12) + '...' : f.name,
    'Content Coverage': Number(f.avgContentCoverage.toFixed(1)),
    'Facilitation Quality': Number(f.avgFacilitationQuality.toFixed(1)),
    'Protocol Safety': Number(f.avgProtocolSafety.toFixed(1))
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          domain={[0, 3]}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar
          dataKey="Content Coverage"
          fill={CHART_COLORS.contentCoverage}
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="Facilitation Quality"
          fill={CHART_COLORS.facilitationQuality}
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="Protocol Safety"
          fill={CHART_COLORS.protocolSafety}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

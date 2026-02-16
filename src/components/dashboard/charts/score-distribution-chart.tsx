'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ScoreDistribution {
  contentCoverage: { low: number; medium: number; high: number };
  facilitationQuality: { low: number; medium: number; high: number };
  protocolSafety: { low: number; medium: number; high: number };
}

interface ScoreDistributionChartProps {
  data: ScoreDistribution | null;
}

const COLORS = {
  low: '#ef4444', // red
  medium: '#f59e0b', // amber
  high: '#22c55e' // green
};

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No score distribution data available
      </div>
    );
  }

  const chartData = [
    {
      name: 'Content Coverage',
      Low: data.contentCoverage.low,
      Medium: data.contentCoverage.medium,
      High: data.contentCoverage.high
    },
    {
      name: 'Facilitation Quality',
      Low: data.facilitationQuality.low,
      Medium: data.facilitationQuality.medium,
      High: data.facilitationQuality.high
    },
    {
      name: 'Protocol Safety',
      Low: data.protocolSafety.low,
      Medium: data.protocolSafety.medium,
      High: data.protocolSafety.high
    }
  ];

  return (
    <ChartContainer config={{}} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="Low"
            stackId="a"
            fill={COLORS.low}
            name="Low"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Medium"
            stackId="a"
            fill={COLORS.medium}
            name="Medium"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="High"
            stackId="a"
            fill={COLORS.high}
            name="High"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WeeklyVolumeData {
  week: string;
  sessions: number;
  analyzed: number;
}

interface WeeklyVolumeChartProps {
  data: WeeklyVolumeData[];
}

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No weekly data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar
          dataKey="sessions"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          name="Total Sessions"
        />
        <Bar
          dataKey="analyzed"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          name="Analyzed"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

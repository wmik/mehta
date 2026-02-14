'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SessionStatusData {
  name: string;
  value: number;
  color: string;
}

interface SessionStatusPieProps {
  data: {
    PENDING: number;
    PROCESSED: number;
    SAFE: number;
    FLAGGED_FOR_REVIEW: number;
  };
}

const STATUS_COLORS = {
  PENDING: 'hsl(var(--chart-5))',
  PROCESSED: 'hsl(var(--chart-2))',
  SAFE: 'hsl(var(--chart-1))',
  FLAGGED_FOR_REVIEW: 'hsl(var(--chart-4))'
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSED: 'Processed',
  SAFE: 'Safe',
  FLAGGED_FOR_REVIEW: 'Flagged'
};

export function SessionStatusPie({ data }: SessionStatusPieProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No session data available
      </div>
    );
  }

  const chartData: SessionStatusData[] = [
    { name: 'Pending', value: data.PENDING || 0, color: STATUS_COLORS.PENDING },
    {
      name: 'Processed',
      value: data.PROCESSED || 0,
      color: STATUS_COLORS.PROCESSED
    },
    { name: 'Safe', value: data.SAFE || 0, color: STATUS_COLORS.SAFE },
    {
      name: 'Flagged',
      value: data.FLAGGED_FOR_REVIEW || 0,
      color: STATUS_COLORS.FLAGGED_FOR_REVIEW
    }
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No sessions found
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={value => [`${value} sessions`, '']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={value => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

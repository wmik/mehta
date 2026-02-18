'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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
  PENDING: '#6b7280', // gray
  PROCESSED: '#0093ff', // green
  SAFE: '#10b981', // emerald
  FLAGGED_FOR_REVIEW: '#f59e0b' // amber
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
    <ChartContainer config={{}} style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            cornerRadius={20}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={value => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

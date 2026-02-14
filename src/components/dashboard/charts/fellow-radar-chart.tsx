'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface FellowMetrics {
  fellowName: string;
  contentCoverage: number;
  facilitationQuality: number;
  protocolSafety: number;
  sessionCount: number;
  riskRate: number; // percentage
  validationRate: number; // percentage
}

interface FellowRadarChartProps {
  data: FellowMetrics;
  teamAverages?: FellowMetrics;
}

const COLORS = {
  fellow: '#3b82f6', // blue
  average: '#ff0280' // gray
};

export function FellowRadarChart({
  data,
  teamAverages
}: FellowRadarChartProps) {
  const chartData = [
    {
      metric: 'Content Coverage',
      Fellow: data.contentCoverage,
      Average: teamAverages?.contentCoverage || 0
    },
    {
      metric: 'Facilitation',
      Fellow: data.facilitationQuality,
      Average: teamAverages?.facilitationQuality || 0
    },
    {
      metric: 'Protocol Safety',
      Fellow: data.protocolSafety,
      Average: teamAverages?.protocolSafety || 0
    },
    {
      metric: 'Sessions',
      Fellow: Math.min(data.sessionCount / 10, 3), // normalize to 0-3 scale
      Average: teamAverages ? Math.min(teamAverages.sessionCount / 10, 3) : 0
    },
    {
      metric: 'Risk Rate',
      Fellow: 3 - (data.riskRate / 100) * 3, // invert: lower is better
      Average: teamAverages ? 3 - (teamAverages.riskRate / 100) * 3 : 0
    },
    {
      metric: 'Validation',
      Fellow: (data.validationRate / 100) * 3,
      Average: teamAverages ? (teamAverages.validationRate / 100) * 3 : 0
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid gridType="circle" stroke="#e5e7eb" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fontSize: 11 }}
          // className="fill-muted-foreground"
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 3]}
          tick={{ fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name={data.fellowName}
          dataKey="Fellow"
          stroke={COLORS.fellow}
          fill={COLORS.fellow}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {teamAverages && (
          <Radar
            name="Team Average"
            dataKey="Average"
            stroke={COLORS.average}
            fill={COLORS.average}
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

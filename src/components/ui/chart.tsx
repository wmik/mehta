'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartConfig>({});

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function useChart() {
  return React.useContext(ChartContext);
}

export function ChartTooltip({
  active,
  payload,
  label,
  config
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
  config: ChartConfig;
}) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      {label && <p className="font-medium mb-2">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {config[entry.name]?.label || entry.name}:
            </span>
            <span className="text-sm font-medium">
              {typeof entry.value === 'number'
                ? entry.value.toFixed(1)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({
  payload,
  config
}: {
  payload?: Array<{ value: string; color: string }>;
  config: ChartConfig;
}) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {config[entry.value]?.label || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

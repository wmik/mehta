'use client';

import * as React from 'react';
import Joyride from 'react-joyride';
import { STATUS, type JoyrideStep } from 'react-joyride';
import { cn } from '@/lib/utils';

export type { JoyrideStep, STATUS };

export function Tour({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Joyride>) {
  return (
    <Joyride
      {...props}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: 'hsl(var(--primary))',
          ...props.styles?.options
        },
        ...props.styles
      }}
    />
  );
}

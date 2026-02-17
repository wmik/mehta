'use client';

import { useState, useCallback, useMemo } from 'react';
import { Tour } from '@/components/ui/tour';
import { STATUS } from 'react-joyride';
import { track } from '@/lib/analytics';
import { ANALYTICS_EVENTS } from '@/lib/analytics';

const DASHBOARD_TOUR_KEY = 'dashboard_onboarding_tour_completed';
const SESSION_TOUR_KEY = 'session_onboarding_tour_completed';

interface TourProviderProps {
  children: React.ReactNode;
  steps: Array<{
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
  }>;
  tourKey?: string;
  onTourEnd?: () => void;
}

export function TourProvider({
  children,
  steps,
  tourKey = DASHBOARD_TOUR_KEY,
  onTourEnd
}: TourProviderProps) {
  const [run, setRun] = useState(() => {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem(tourKey);
    return !completed;
  });

  const handleTourEnd = useCallback(() => {
    localStorage.setItem(tourKey, 'true');
    setRun(false);
    onTourEnd?.();
  }, [tourKey, onTourEnd]);

  const handleJoyrideCallback = useCallback(
    (data: { status: string }) => {
      const { status } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        handleTourEnd();
        track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          tourKey,
          stepCount: steps.length
        });
      }
    },
    [handleTourEnd, tourKey, steps.length]
  );

  const translatedSteps = useMemo(
    () =>
      steps.map(step => ({
        target: step.target,
        title: step.title,
        content: (
          <div className="p-2">
            <h3 className="font-semibold mb-1 text-sm">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.content}</p>
          </div>
        ),
        placement: step.placement || 'bottom'
      })),
    [steps]
  );

  return (
    <>
      {children}
      <Tour
        steps={translatedSteps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        floaterProps={{
          disableAnimation: true
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: 'hsl(222.2 47.4% 11.2%)',
            backgroundColor: 'hsl(var(--background))',
            arrowColor: 'hsl(var(--background))',
            textColor: 'hsl(var(--foreground))'
          }
        }}
      />
    </>
  );
}

export function useTour() {
  const startDashboardTour = useCallback(() => {
    localStorage.removeItem(DASHBOARD_TOUR_KEY);
    window.location.reload();
  }, []);

  const startSessionTour = useCallback(() => {
    localStorage.removeItem(SESSION_TOUR_KEY);
    window.location.reload();
  }, []);

  const resetAllTours = useCallback(() => {
    localStorage.removeItem(DASHBOARD_TOUR_KEY);
    localStorage.removeItem(SESSION_TOUR_KEY);
  }, []);

  return {
    startDashboardTour,
    startSessionTour,
    resetAllTours
  };
}

export function TourProvider({
  children,
  steps,
  tourKey = DASHBOARD_TOUR_KEY,
  onTourEnd
}: TourProviderProps) {
  const [run, setRun] = useState(() => {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem(tourKey);
    return !completed;
  });

  const handleTourEnd = useCallback(() => {
    localStorage.setItem(tourKey, 'true');
    setRun(false);
    onTourEnd?.();
  }, [tourKey, onTourEnd]);

  const handleJoyrideCallback = useCallback(
    (data: { status: string; index: number }) => {
      const { status } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        handleTourEnd();
        track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          tourKey,
          stepCount: steps.length
        });
      }
    },
    [handleTourEnd, tourKey, steps.length]
  );

  const translatedSteps = useMemo(
    () =>
      steps.map(step => ({
        ...step,
        content: (
          <div className="p-2">
            <h3 className="font-semibold mb-1 text-sm">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.content}</p>
          </div>
        )
      })),
    [steps]
  );

  return (
    <>
      {children}
      <Tour
        steps={translatedSteps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        floaterProps={{
          disableAnimation: true
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: 'hsl(222.2 47.4% 11.2%)',
            backgroundColor: 'hsl(var(--background))',
            arrowColor: 'hsl(var(--background))',
            textColor: 'hsl(var(--foreground))'
          }
        }}
      />
    </>
  );
}

export function useTour() {
  const startDashboardTour = useCallback(() => {
    localStorage.removeItem(DASHBOARD_TOUR_KEY);
    window.location.reload();
  }, []);

  const startSessionTour = useCallback(() => {
    localStorage.removeItem(SESSION_TOUR_KEY);
    window.location.reload();
  }, []);

  const resetAllTours = useCallback(() => {
    localStorage.removeItem(DASHBOARD_TOUR_KEY);
    localStorage.removeItem(SESSION_TOUR_KEY);
  }, []);

  return {
    startDashboardTour,
    startSessionTour,
    resetAllTours
  };
}

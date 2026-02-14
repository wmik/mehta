'use client';

import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export function ShimmerSkeleton({
  className,
  delay = 0,
  style
}: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-shimmer',
        className
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
    />
  );
}

export function StatsCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="border rounded-lg p-6">
      <ShimmerSkeleton className="h-5 w-32 mb-2" delay={delay} />
      <ShimmerSkeleton className="h-4 w-24 mb-4" delay={delay + 100} />
      <ShimmerSkeleton className="h-10 w-20" delay={delay + 200} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b">
        <ShimmerSkeleton className="h-4 w-24" />
        <ShimmerSkeleton className="h-4 w-20" />
        <ShimmerSkeleton className="h-4 w-24" />
        <ShimmerSkeleton className="h-4 w-16" />
        <ShimmerSkeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3">
          <ShimmerSkeleton className="h-4 w-32" delay={i * 50} />
          <ShimmerSkeleton className="h-4 w-20" delay={i * 50 + 50} />
          <ShimmerSkeleton className="h-4 w-28" delay={i * 50 + 100} />
          <ShimmerSkeleton
            className="h-5 w-16 rounded-full"
            delay={i * 50 + 150}
          />
          <ShimmerSkeleton className="h-8 w-24" delay={i * 50 + 200} />
        </div>
      ))}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ShimmerSkeleton className="h-10 w-64" />
      <ShimmerSkeleton className="h-10 w-40" />
      <ShimmerSkeleton className="h-10 w-32" />
      <ShimmerSkeleton className="h-10 w-36" />
      <ShimmerSkeleton className="h-10 w-32" />
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border rounded-lg p-6">
        <ShimmerSkeleton className="h-5 w-40 mb-2" />
        <ShimmerSkeleton className="h-4 w-56 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <ShimmerSkeleton className="h-4 w-24" delay={i * 100} />
                <ShimmerSkeleton className="h-3 w-32" delay={i * 100 + 50} />
              </div>
              <div className="flex gap-2">
                <ShimmerSkeleton
                  className="h-5 w-12 rounded"
                  delay={i * 100 + 100}
                />
                <ShimmerSkeleton
                  className="h-5 w-12 rounded"
                  delay={i * 100 + 120}
                />
                <ShimmerSkeleton
                  className="h-5 w-12 rounded"
                  delay={i * 100 + 140}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border rounded-lg p-6">
        <ShimmerSkeleton className="h-5 w-44 mb-2" />
        <ShimmerSkeleton className="h-4 w-52 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <ShimmerSkeleton className="h-4 w-28" delay={i * 80} />
              <ShimmerSkeleton
                className="h-5 w-16 rounded-full"
                delay={i * 80 + 50}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalysisCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <ShimmerSkeleton className="h-6 w-40" delay={delay} />
        <ShimmerSkeleton className="h-8 w-8 rounded-full" delay={delay + 100} />
      </div>
      <ShimmerSkeleton className="h-5 w-16 mb-2" delay={delay + 150} />
      <ShimmerSkeleton className="h-4 w-full mb-2" delay={delay + 200} />
      <ShimmerSkeleton className="h-4 w-3/4" delay={delay + 250} />
    </div>
  );
}

export function SessionInfoSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <ShimmerSkeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <ShimmerSkeleton className="h-4 w-16 mb-1" />
          <ShimmerSkeleton className="h-5 w-24" />
        </div>
        <div>
          <ShimmerSkeleton className="h-4 w-16 mb-1" />
          <ShimmerSkeleton className="h-5 w-20" />
        </div>
        <div>
          <ShimmerSkeleton className="h-4 w-16 mb-1" />
          <ShimmerSkeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function TranscriptSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <ShimmerSkeleton className="h-6 w-44 mb-2" />
      <ShimmerSkeleton className="h-4 w-64 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className="h-4"
            // eslint-disable-next-line react-hooks/purity
            style={{ width: `${Math.random() * 40 + 60}%` }}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

export function AIAnalysisLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-blue-500 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
      </div>
      <p className="text-blue-600 font-medium text-lg">
        AI is analyzing the session...
      </p>
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}

export function LoadingDots({ text = 'Loading' }: { text?: string }) {
  return (
    <span className="inline-flex items-center">
      {text}
      <span className="flex gap-1 ml-1">
        <span
          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </span>
    </span>
  );
}

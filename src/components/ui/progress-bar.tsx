'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset and start progress on route change
    setProgress(0);

    const timeout1 = setTimeout(() => setProgress(20), 50);
    const timeout2 = setTimeout(() => setProgress(50), 200);
    const timeout3 = setTimeout(() => setProgress(80), 400);
    const timeout4 = setTimeout(() => setProgress(100), 700);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 transition-all duration-300"
      style={{
        backgroundColor: progress > 0 ? '#3b82f6' : 'transparent',
        width: `${progress}%`,
        opacity: progress > 0 && progress < 100 ? 1 : 0
      }}
    />
  );
}

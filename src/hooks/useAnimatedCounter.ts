import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to the target value using requestAnimationFrame.
 * Used for count-up effects on KPI cards.
 */
export function useAnimatedCounter(target: number, duration = 1200, decimals = 0): string {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  if (decimals > 0) {
    return current.toFixed(decimals);
  }
  return Math.round(current).toLocaleString();
}

import { useState, useEffect } from 'react';

export function useCountUp(endValue, duration = 900) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const numericEnd = typeof endValue === 'number' ? endValue : parseFloat(endValue) || 0;

    if (numericEnd === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Exponential ease-out for smooth terminal feel
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      let current = numericEnd * easeProgress;

      // Tick in 100 multiples during the animation sequence
      if (progress < 1 && Math.abs(numericEnd) > 500) {
        current = Math.round(current / 100) * 100;
      }

      setCount(progress === 1 ? numericEnd : current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [endValue, duration]);

  return count;
}

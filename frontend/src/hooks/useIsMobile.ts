import { useState, useEffect } from 'react';

/**
 * Detects whether the current device is a mobile or touch device.
 * Used to conditionally present mobile-optimized games and control labels.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isSmallScreen = window.innerWidth < breakpoint;
    const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    return isSmallScreen || (isTouch && window.innerWidth < 1024);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const check = () => {
      const isSmallScreen = window.innerWidth < breakpoint;
      const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
      setIsMobile(isSmallScreen || (isTouch && window.innerWidth < 1024));
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;

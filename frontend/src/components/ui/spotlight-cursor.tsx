'use client';

import { useRef, useEffect, useState, type HTMLAttributes } from 'react';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  smoothing?: number;
}

const useSpotlightEffect = (config: SpotlightConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseX !== -1000 && mouseY !== -1000) {
        const gradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, config.radius || 200,
        );
        const rgbColor = hexToRgb(config.color || '#ffffff');
        gradient.addColorStop(0, `rgba(${rgbColor}, ${config.brightness || 0.15})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.radius, config.brightness, config.color]);

  return canvasRef;
};

interface ComponentProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

/**
 * Theme-aware helper: returns a warm, cozy spotlight color based on the
 * current data-theme ("day" or "dream"). Falls back to amber in SSR.
 */
function getThemeSpotlightColor(): string {
  if (typeof window === 'undefined') {
    return '#fbbf24'; // warm amber fallback
  }
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dream') {
    // Dream mode: soft amber glow that harmonises with the midnight nursery palette
    return '#fbbf24';
  }
  // Day mode: warm cream that blends with the parchment surface
  return '#fff8f1';
}

export const Component = ({
  config,
  className,
  ...rest
}: ComponentProps) => {
  const prefersReduced = useReducedMotionPreference();

  // Detect touch-only device — skip the spotlight on mobile/tablet
  const [isTouchOnly] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  });

  // Build a slightly cozier default config when none is supplied.
  // We derive the colour from the current theme so the spotlight
  // always feels warm and integrated rather than a harsh white blob.
  const spotlightConfig: SpotlightConfig = {
    radius: 220,
    brightness: 0.10,
    smoothing: 0.1,
    color: getThemeSpotlightColor(),
    ...config,
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);

  // Respect reduced-motion and touch-only devices
  if (prefersReduced || isTouchOnly) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] w-full h-full ${className}`}
      {...rest}
    />
  );
};

export const SpotlightCursor = Component;
// =============================================================
// PIP.EXE — SparkleTrailCanvas
// Canvas-based cursor sparkle trail using requestAnimationFrame
// =============================================================

import { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import type { ParticleData } from '../lib/types';

const COLORS = ['#f59e0b', '#fbbf24', '#a34063', '#fff8f1', '#f0c8d8'];
const MAX_PARTICLES = 45;
const PARTICLE_TYPES: ParticleData['type'][] = ['star', 'cross', 'dot'];
const THROTTLE_MS = 30;

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const arms = 4;
  const outerR = size;
  const innerR = size * 0.4;
  ctx.beginPath();
  for (let i = 0; i < arms * 2; i++) {
    const angle = (i * Math.PI) / arms - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const w = size * 0.3;
  ctx.fillRect(x - size, y - w, size * 2, w * 2);
  ctx.fillRect(x - w, y - size, w * 2, size * 2);
}

export function SparkleTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<ParticleData[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const prefersReduced = useReducedMotionPreference();

  // Detect touch-only device
  const isTouchOnly = useRef(false);

  useEffect(() => {
    isTouchOnly.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    if (prefersReduced || isTouchOnly.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PR = Math.min(window.devicePixelRatio, 2);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * PR;
      canvas.height = window.innerHeight * PR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx?.scale(PR, PR);
    }

    resize();
    window.addEventListener('resize', resize);

    function spawnParticles(x: number, y: number) {
      const now = performance.now();
      if (now - lastSpawnRef.current < THROTTLE_MS) return;
      lastSpawnRef.current = now;

      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        if (particles.current.length >= MAX_PARTICLES) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const life = Math.random() * 40 + 30;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          life,
          maxLife: life,
          size: Math.random() * 5 + 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
        });
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === 'touch') return;
      spawnParticles(e.clientX, e.clientY);
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width / PR, canvas.height / PR);

      const alive: ParticleData[] = [];
      for (const p of particles.current) {
        p.life--;
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gentle gravity
        p.rotation += p.rotationSpeed;

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'star') {
          drawStar(ctx, 0, 0, p.size);
        } else if (p.type === 'cross') {
          drawCross(ctx, 0, 0, p.size * 0.8);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        alive.push(p);
      }

      particles.current = alive;

      if (alive.length > 0 || document.hidden === false) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('visibilitychange', onVisibilityChange);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

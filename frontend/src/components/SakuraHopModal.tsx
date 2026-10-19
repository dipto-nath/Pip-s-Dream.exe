// =============================================================
// PIP.EXE — Sakura Cloud Hop Mini-Game Modal (Mobile Edition)
// Interactive cloud jumping mini-game designed for touch & mobile.
// Guide Pip across cozy sakura clouds, collect blossom stars,
// and reach dream heights with synchronized Web Audio chimes.
// Optimized for smooth, lag-free 60+ FPS mobile performance.
// =============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { useVisitorMemory } from '../hooks/useVisitorMemory';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { submitDriftScore } from '../lib/scoreService';
import styles from '../styles/SakuraHopModal.module.css';

interface SakuraHopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CloudPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'normal' | 'boost' | 'moving' | 'fragile';
  vx: number;
  broken: boolean;
  bounce: number;
}

interface CollectibleItem {
  x: number;
  y: number;
  type: 'blossom' | 'star';
  collected: boolean;
  bob: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  r: number;
  t: number;
}

interface DriftingPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  size: number;
}

interface FloatyText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

const PENTATONIC_HZ = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

// Standard smooth performance-optimized canvas coordinates (9:15 ratio)
const MW = 420;
const MH = 700;

export function SakuraHopModal({ isOpen, onClose }: SakuraHopModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { profile, saveDriftScore } = useVisitorMemory();
  const prefersReduced = useReducedMotionPreference();

  // HUD State
  const [hudHeight, setHudHeight] = useState(0);
  const [hudScore, setHudScore] = useState(0);
  const [hudBest, setHudBest] = useState(() => {
    const local = parseInt(localStorage.getItem('pip_cloud_hop_best_v1') || '0', 10);
    return Math.max(local, profile?.driftHighScore ?? 0);
  });
  const [soundOn, setSoundOn] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [isNewBest, setIsNewBest] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game Engine Internal State
  const gameRef = useRef({
    state: 'playing' as 'playing' | 'gameover',
    pip: {
      x: MW / 2,
      y: MH - 120,
      vx: 0,
      vy: -12.0,
      targetX: MW / 2,
      usingPointer: false,
      facing: 1,
      boostTimer: 0,
      radius: 16,
    },
    heightScore: 0,
    dreamScore: 0,
    combo: 1,
    clouds: [] as CloudPlatform[],
    collectibles: [] as CollectibleItem[],
    bgStars: [] as BackgroundStar[],
    petals: [] as DriftingPetal[],
    floatingTexts: [] as FloatyText[],
    lastTime: 0,
    lastHudSync: 0,
    rafId: 0,
  });

  // --- Web Audio Synthesizer ---
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AC();
    } catch {
      /* ignore */
    }
  }, []);

  const playNote = useCallback((idx = 0) => {
    if (!soundOn) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const freq = PENTATONIC_HZ[idx % PENTATONIC_HZ.length];
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.68);
    } catch {
      /* ignore */
    }
  }, [soundOn, initAudio]);

  const commitScore = useCallback((score: number, height: number) => {
    const finalScore = Math.floor(score);
    if (finalScore <= 0) return;
    const prevBest = parseInt(localStorage.getItem('pip_cloud_hop_best_v1') || '0', 10);
    const currentBest = Math.max(finalScore, prevBest, profile?.driftHighScore ?? 0);
    if (finalScore > prevBest) {
      setIsNewBest(true);
    }
    localStorage.setItem('pip_cloud_hop_best_v1', currentBest.toString());
    setHudBest(currentBest);
    saveDriftScore(finalScore);
    submitDriftScore(finalScore, profile?.name, Math.floor(height / 100) + 1);
  }, [saveDriftScore, profile?.name, profile?.driftHighScore]);

  // --- Platform Spawning ---
  const spawnPlatform = useCallback((y: number, forceNormal = false) => {
    const w = 76 + Math.random() * 26;
    const x = 20 + Math.random() * (MW - w - 40);
    let type: CloudPlatform['type'] = 'normal';

    if (!forceNormal) {
      const roll = Math.random();
      if (roll < 0.16) type = 'boost';
      else if (roll < 0.36) type = 'moving';
      else if (roll < 0.50) type = 'fragile';
    }

    gameRef.current.clouds.push({
      x,
      y,
      w,
      h: 20,
      type,
      vx: type === 'moving' ? (Math.random() < 0.5 ? -1.2 : 1.2) : 0,
      broken: false,
      bounce: 0,
    });

    if (Math.random() < 0.38 && type !== 'fragile') {
      gameRef.current.collectibles.push({
        x: x + w / 2,
        y: y - 24,
        type: Math.random() < 0.3 ? 'blossom' : 'star',
        collected: false,
        bob: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;

    g.state = 'playing';
    setGameState('playing');
    setIsNewBest(false);
    g.heightScore = 0;
    g.dreamScore = 0;
    g.combo = 1;
    g.clouds = [];
    g.collectibles = [];
    g.floatingTexts = [];
    g.pip.x = MW / 2;
    g.pip.y = MH - 120;
    g.pip.targetX = MW / 2;
    g.pip.vx = 0;
    g.pip.vy = -12.0;
    g.pip.boostTimer = 0;
    g.lastHudSync = 0;

    setHudHeight(0);
    setHudScore(0);

    // Initial starter platform
    g.clouds.push({
      x: MW / 2 - 55,
      y: MH - 70,
      w: 110,
      h: 22,
      type: 'normal',
      vx: 0,
      broken: false,
      bounce: 0,
    });

    // Spawn initial ascending staircase of platforms
    for (let i = 1; i < 9; i++) {
      spawnPlatform(MH - 70 - i * 78, i < 3);
    }
  }, [spawnPlatform]);

  // Handle touch / pointer input mapped directly to logical coordinates
  const handlePointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = ((clientX - rect.left) / rect.width) * MW;
    const clamped = Math.max(20, Math.min(MW - 20, relX));
    gameRef.current.pip.targetX = clamped;
    gameRef.current.pip.usingPointer = true;
  }, []);

  // --- Main Animation & Physics Loop ---
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;

    // Standard fast resolution for buttery smooth 60+ FPS on all devices
    canvas.width = MW;
    canvas.height = MH;

    // Init background stars and drifting petals once
    if (g.bgStars.length === 0) {
      for (let i = 0; i < 35; i++) {
        g.bgStars.push({
          x: Math.random() * MW,
          y: Math.random() * MH,
          r: 1 + Math.random() * 2,
          t: Math.random() * Math.PI * 2,
        });
      }
    }
    if (g.petals.length === 0) {
      for (let i = 0; i < 16; i++) {
        g.petals.push({
          x: Math.random() * MW,
          y: Math.random() * MH,
          vx: 0.25 + Math.random() * 0.4,
          vy: 0.35 + Math.random() * 0.4,
          rot: Math.random() * Math.PI * 2,
          size: 3 + Math.random() * 2.5,
        });
      }
    }

    resetGame();
    playNote(2);
    g.lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - g.lastTime) / 16.667;
      g.lastTime = now;
      const dt = Math.min(2.5, Math.max(0.4, rawDt));

      // ── Physics Update ──
      if (g.state === 'playing') {
        const p = g.pip;

        // Pointer steering
        if (p.usingPointer) {
          const diff = p.targetX - p.x;
          p.vx = diff * 0.24;
          p.x += p.vx * dt;
          if (Math.abs(diff) > 2) p.facing = diff > 0 ? 1 : -1;
        }

        // Screen wrap
        if (p.x < -10) p.x = MW + 10;
        if (p.x > MW + 10) p.x = -10;

        // Gravity & Boost
        if (p.boostTimer > 0) {
          p.boostTimer -= dt;
          p.vy = -14.6;
        } else {
          p.vy += 0.36 * dt;
        }
        p.y += p.vy * dt;

        // Moving platforms
        g.clouds.forEach((c) => {
          if (c.type === 'moving') {
            c.x += c.vx * dt;
            if (c.x < 12 || c.x + c.w > MW - 12) c.vx *= -1;
          }
          if (c.bounce > 0) c.bounce = Math.max(0, c.bounce - 0.08 * dt);
        });

        // Cloud landing collision
        if (p.vy > 0) {
          g.clouds.forEach((c) => {
            if (c.broken) return;
            const inX = p.x + 14 > c.x && p.x - 14 < c.x + c.w;
            const inY = p.y + p.radius >= c.y && p.y + p.radius <= c.y + c.h + 8;

            if (inX && inY) {
              c.bounce = 1;
              if (c.type === 'boost') {
                p.vy = -17.2;
                g.combo = Math.min(8, g.combo + 1);
                const pts = 120 * g.combo;
                g.dreamScore += pts;
                g.floatingTexts.push({ x: c.x + c.w / 2, y: c.y - 14, text: `★ BOOST +${pts}!`, color: '#F3C66F', alpha: 1, vy: -0.9 });
                playNote(4);
              } else if (c.type === 'fragile') {
                p.vy = -11.6;
                c.broken = true;
                const pts = 35 * g.combo;
                g.dreamScore += pts;
                g.floatingTexts.push({ x: c.x + c.w / 2, y: c.y - 14, text: `CRUMBLE +${pts}`, color: '#E8839B', alpha: 1, vy: -0.9 });
                playNote(1);
              } else {
                p.vy = -12.0;
                const pts = 25 * g.combo;
                g.dreamScore += pts;
                playNote(Math.floor(Math.random() * 6));
              }
            }
          });
        }

        // Collectibles
        g.collectibles.forEach((item) => {
          if (item.collected) return;
          item.bob += 0.08 * dt;
          const dist = Math.hypot(p.x - item.x, p.y - (item.y + Math.sin(item.bob) * 4));
          if (dist < 26) {
            item.collected = true;
            if (item.type === 'blossom') {
              p.boostTimer = 45;
              const pts = 200 * g.combo;
              g.dreamScore += pts;
              g.floatingTexts.push({ x: item.x, y: item.y - 16, text: `🌸 BLOSSOM SURGE +${pts}!`, color: '#FFB7C5', alpha: 1, vy: -1.0 });
              playNote(5);
            } else {
              const pts = 75 * g.combo;
              g.dreamScore += pts;
              g.floatingTexts.push({ x: item.x, y: item.y - 16, text: `★ +${pts}`, color: '#F3C66F', alpha: 1, vy: -0.9 });
              playNote(3);
            }
          }
        });

        // Vertical Camera Scroll
        const scrollThreshold = MH * 0.44;
        if (p.y < scrollThreshold) {
          const shift = scrollThreshold - p.y;
          p.y = scrollThreshold;
          g.heightScore += Math.round(shift * 0.4);
          g.dreamScore += Math.round(shift * 0.25);

          g.clouds.forEach((c) => (c.y += shift));
          g.collectibles.forEach((col) => (col.y += shift));
          g.floatingTexts.forEach((t) => (t.y += shift));
          g.bgStars.forEach((st) => {
            st.y += shift * 0.25;
            if (st.y > MH) st.y -= MH;
          });

          // Cull off-screen items
          g.clouds = g.clouds.filter((c) => c.y < MH + 40);
          g.collectibles = g.collectibles.filter((c) => c.y < MH + 40 && !c.collected);

          // Spawn new platforms above
          let highestY = MH;
          g.clouds.forEach((c) => {
            if (c.y < highestY) highestY = c.y;
          });
          while (highestY > 60) {
            highestY -= 70 + Math.random() * 22;
            spawnPlatform(highestY);
          }
        }

        // Update floating score texts
        g.floatingTexts.forEach((t) => {
          t.y += t.vy * dt;
          t.alpha -= 0.02 * dt;
        });
        g.floatingTexts = g.floatingTexts.filter((t) => t.alpha > 0);

        // Petal drift animation
        g.petals.forEach((pt) => {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.rot += 0.02 * dt;
          if (pt.y > MH + 10) { pt.y = -10; pt.x = Math.random() * MW; }
          if (pt.x > MW + 10) { pt.x = -10; }
        });

        // Game Over Detection
        if (p.y > MH + 40) {
          g.state = 'gameover';
          setGameState('gameover');
          setHudHeight(g.heightScore);
          setHudScore(g.dreamScore);
          commitScore(g.dreamScore, g.heightScore);
          playNote(0);
        }

        // Throttled HUD update to prevent 60fps React re-rendering stutter
        if (now - g.lastHudSync > 120) {
          g.lastHudSync = now;
          setHudHeight(g.heightScore);
          setHudScore(g.dreamScore);
        }
      }

      // ── Ultra-Fast Single Pass Canvas Rendering ──
      // Deep Midnight Nursery Background
      ctx.fillStyle = '#221422';
      ctx.fillRect(0, 0, MW, MH);

      // Twinkling Stars
      g.bgStars.forEach((st) => {
        st.t += 0.035;
        const alpha = 0.25 + Math.sin(st.t) * 0.35;
        ctx.fillStyle = `rgba(255, 240, 210, ${alpha})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Drifting Sakura Petals
      ctx.fillStyle = '#F7AFC0';
      g.petals.forEach((pt) => {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size * 1.3, pt.size * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Clouds
      g.clouds.forEach((c) => {
        if (c.broken) return;
        ctx.save();
        const bounceOffset = Math.sin(c.bounce * Math.PI) * 4;
        ctx.translate(c.x, c.y + bounceOffset);

        if (c.type === 'boost') {
          // Golden Boost Cloud
          ctx.fillStyle = '#F3C66F';
          ctx.strokeStyle = '#D49E37';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(0, 0, c.w, c.h, 10);
          ctx.fill();
          ctx.stroke();

          // Star sparkle emblem
          ctx.fillStyle = '#FFF8E7';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', c.w / 2, 14);
        } else if (c.type === 'fragile') {
          // Fragile Cumulus Cloud
          ctx.fillStyle = '#E8D7CA';
          ctx.strokeStyle = '#B8A494';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(0, 0, c.w, c.h, 10);
          ctx.fill();
          ctx.stroke();

          // Crack detail
          ctx.strokeStyle = '#8E7768';
          ctx.beginPath();
          ctx.moveTo(c.w / 2 - 8, 4);
          ctx.lineTo(c.w / 2, 14);
          ctx.lineTo(c.w / 2 + 8, 8);
          ctx.stroke();
        } else if (c.type === 'moving') {
          // Drifting Moving Cloud
          ctx.fillStyle = '#FFB7C5';
          ctx.strokeStyle = '#E8839B';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(0, 0, c.w, c.h, 10);
          ctx.fill();
          ctx.stroke();

          // Wind gust trails
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(8, 10);
          ctx.lineTo(c.w - 8, 10);
          ctx.stroke();
        } else {
          // Normal Sakura Cloud
          ctx.fillStyle = '#FFC2CE';
          ctx.strokeStyle = '#E88B9E';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(0, 0, c.w, c.h, 10);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });

      // Collectibles
      g.collectibles.forEach((item) => {
        if (item.collected) return;
        const cy = item.y + Math.sin(item.bob) * 4;
        ctx.font = '17px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.type === 'blossom' ? '🌸' : '★', item.x, cy);
      });

      // Render Pip Character
      const p = g.pip;
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.facing < 0) ctx.scale(-1, 1);

      // Starry nightcap
      ctx.fillStyle = '#6E4555';
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.quadraticCurveTo(-14, -28, 8, -30);
      ctx.quadraticCurveTo(12, -18, 12, -10);
      ctx.closePath();
      ctx.fill();

      // Pom-pom on nightcap
      ctx.fillStyle = '#F3C66F';
      ctx.beginPath();
      ctx.arc(9, -30, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Skull Face
      ctx.fillStyle = '#FFF8F1';
      ctx.strokeStyle = '#3B281E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -2, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Amber Eyes
      ctx.fillStyle = '#2B1D16';
      ctx.beginPath();
      ctx.ellipse(-5, -3, 3, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -3, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm Amber Glow in eyes
      ctx.fillStyle = '#F3C66F';
      ctx.beginPath();
      ctx.arc(-4, -4, 1.2, 0, Math.PI * 2);
      ctx.arc(6, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks (blush)
      ctx.fillStyle = 'rgba(246, 169, 190, 0.7)';
      ctx.beginPath();
      ctx.arc(-8, 3, 2.5, 0, Math.PI * 2);
      ctx.arc(8, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#3B281E';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 4, 3, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      ctx.restore();

      // Floating Score Popups
      g.floatingTexts.forEach((t) => {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.font = 'bold 13px "Fraunces", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      g.rafId = requestAnimationFrame(loop);
    };

    g.rafId = requestAnimationFrame(loop);

    // Keyboard Fallback for testing / desktop
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        g.pip.targetX = Math.max(20, g.pip.x - 50);
        g.pip.usingPointer = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        g.pip.targetX = Math.min(MW - 20, g.pip.x + 50);
        g.pip.usingPointer = true;
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(g.rafId);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, resetGame, playNote, spawnPlatform, commitScore, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: 'rgba(58, 29, 38, 0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
        paddingLeft: 'max(10px, env(safe-area-inset-left, 10px))',
        paddingRight: 'max(10px, env(safe-area-inset-right, 10px))',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-[420px] h-[95dvh] max-h-[760px] flex flex-col justify-between select-none overflow-hidden ${styles.shWindow} ${prefersReduced ? '' : styles.shPopIn}`}
        role="dialog"
        aria-labelledby="sh-title"
      >
        {/* Retro Title Bar */}
        <div className={styles.shTitlebar}>
          <div className={styles.shTitle} id="sh-title">
            <span>🌸</span>
            <span>SAKURA HOP</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className={styles.shLcd}>H: <b>{hudHeight}m</b></span>
            <span className={styles.shLcd}>PTS: <b>{hudScore.toLocaleString()}</b></span>
          </div>

          <button
            type="button"
            className={styles.shClose}
            onClick={onClose}
            title="Close game (Esc)"
            aria-label="Close game"
          >
            ✕
          </button>
        </div>

        {/* Sunken Body Frame holding the 9:15 Canvas Viewport */}
        <div className={styles.shBody}>
          <div className={styles.shCanvasFrame}>
            <canvas
              ref={canvasRef}
              width={MW}
              height={MH}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* ignore */
                }
                initAudio();
                if (gameState === 'gameover') return;
                handlePointer(e.clientX);
              }}
              onPointerMove={(e) => {
                if (e.pressure > 0 || e.pointerType === 'touch' || e.buttons === 1) {
                  handlePointer(e.clientX);
                }
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {
                  /* ignore */
                }
              }}
            />

            {/* In-game Personal Best badge */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <div className={styles.shBestBadge}>
                <Sparkles size={11} className="text-[#ffd88a]" />
                <span className="font-semibold text-[11px] text-[#f4a6bd]">BEST:</span>
                <b>{hudBest.toLocaleString()}</b>
              </div>
            </div>

            {/* Interactive Game Over Overlay with Exit & Restart Buttons */}
            {gameState === 'gameover' && (
              <div
                className="absolute inset-0 bg-[#160B13]/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-20 select-none animate-fadeIn"
              >
                <div className={styles.shGameOverBox}>
                  <div className="text-2xl mb-1">🌙</div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: 'var(--text-dark)',
                      marginBottom: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    Sweet Dreams, Pip!
                  </h3>
                  <p style={{ fontFamily: 'var(--font-cozy)', fontSize: '12px', color: '#5a2d3a', marginBottom: '8px' }}>
                    Pip hopped through the cozy clouds
                  </p>

                  <div
                    className="flex justify-around items-center w-full mb-3 px-3 py-1.5"
                    style={{
                      background: 'var(--win-face-dark)',
                      border: '1px solid var(--win-darkest)',
                      boxShadow: 'inset 1px 1px 0 var(--win-darkest), inset -1px -1px 0 var(--win-hilite)',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#5a2d3a' }}>HEIGHT</div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{hudHeight}m</div>
                    </div>
                    <div className="w-px h-6 bg-[#b38f86]" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#5a2d3a' }}>SCORE</div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{hudScore.toLocaleString()}</div>
                    </div>
                  </div>

                  {isNewBest && (
                    <div className="mb-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-[#5a2d3a] bg-[#ffd88a] border border-[#3a1d26]">
                      <Sparkles size={11} /> NEW PERSONAL BEST!
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        initAudio();
                        resetGame();
                        playNote(2);
                      }}
                      className={`${styles.shBtn} ${styles.shBtnPrimary} w-full`}
                    >
                      <span>🌸</span>
                      <span>Hop Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className={`${styles.shBtn} w-full`}
                    >
                      <X size={12} />
                      <span>Exit to Nursery</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Retro Bottom Status Bar */}
        <div className={styles.shStatusbar}>
          <span className={styles.shHint}>
            <span>👆</span> Drag left/right to steer Pip
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                initAudio();
                setSoundOn((s) => !s);
              }}
              title={soundOn ? 'Turn sound off' : 'Turn sound on'}
              className={styles.shBtn}
            >
              {soundOn ? <Volume2 size={12} className="text-[#ffd88a]" /> : <VolumeX size={12} className="text-[#f4a6bd]" />}
              <span>{soundOn ? 'SOUND: ON' : 'SOUND: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                initAudio();
                resetGame();
                playNote(1);
              }}
              title="Restart Hop"
              className={`${styles.shBtn} ${styles.shBtnPrimary}`}
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SakuraHopModal;

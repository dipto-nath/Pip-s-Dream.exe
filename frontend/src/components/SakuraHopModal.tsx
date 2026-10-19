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
import { submitDriftScore } from '../lib/scoreService';

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
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center backdrop-blur-md overflow-hidden"
      style={{
        backgroundColor: 'rgba(16, 9, 14, 0.90)',
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
        className="relative w-full max-w-[420px] h-[95dvh] max-h-[760px] rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 flex flex-col justify-between select-none overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #2A1723 0%, #1A0E17 100%)',
          border: '2px solid rgba(246, 169, 190, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 28px rgba(246, 169, 190, 0.15)',
        }}
      >
        {/* Cabinet Header */}
        <div className="flex items-center justify-between pb-2 px-1 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] leading-none" role="img" aria-label="Sakura blossom">🌸</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#F6A9BE',
                    letterSpacing: '0.04em',
                    lineHeight: 1.1,
                  }}
                >
                  SAKURA
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#FFF8F1',
                    letterSpacing: '0.04em',
                    lineHeight: 1.1,
                  }}
                >
                  HOP
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-[#DEC3A7]/70">
                Cozy Nursery Cloud Hop
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Height Capsule */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(58, 32, 45, 0.9)',
                border: '1px solid rgba(222, 195, 167, 0.35)',
              }}
            >
              <span className="text-[9px] font-bold text-[#DEC3A7]/80">H:</span>
              <span className="font-mono font-bold text-[#FFF8F1] text-[11px]">{hudHeight}m</span>
            </div>

            {/* Live Score Capsule */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(58, 32, 45, 0.9)',
                border: '1px solid rgba(246, 169, 190, 0.45)',
              }}
            >
              <span className="text-[9px] font-bold text-[#F6A9BE]">PTS:</span>
              <span className="font-mono font-extrabold text-[#F3C66F] text-[12px]">{hudScore.toLocaleString()}</span>
            </div>

            {/* Prominent High-Contrast Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close game (Esc)"
              aria-label="Close game"
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white cursor-pointer active:scale-90 transition-transform shadow-md flex-shrink-0 ml-0.5"
              style={{
                background: 'linear-gradient(135deg, #E85D75 0%, #C83E5B 100%)',
                border: '1.5px solid #FFAAB8',
                boxShadow: '0 3px 10px rgba(200, 62, 91, 0.45)',
              }}
            >
              <X size={18} strokeWidth={2.8} />
            </button>
          </div>
        </div>

        {/* Canvas Viewport Frame — Reshaped Sleek 9:15 Arcade Aspect Ratio */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center my-1">
          <div
            className="relative h-full max-h-full aspect-[9/15] max-w-full rounded-[16px] overflow-hidden bg-[#221422] flex items-center justify-center shadow-inner"
            style={{
              border: '2px solid rgba(222, 195, 167, 0.4)',
              boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.75), 0 6px 20px rgba(0, 0, 0, 0.4)',
            }}
          >
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

            {/* In-game Personal Best pill */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <div className="bg-[#1C1019]/85 backdrop-blur-xs border border-[#DEC3A7]/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] text-white shadow-md">
                <Sparkles size={11} className="text-[#F3C66F]" />
                <span className="text-[#F6A9BE] font-semibold text-[9px]">BEST:</span>
                <span className="font-mono font-bold text-[#FCE3A1]">{hudBest.toLocaleString()}</span>
              </div>
            </div>

            {/* Interactive Game Over Overlay with Exit & Restart Buttons */}
            {gameState === 'gameover' && (
              <div
                className="absolute inset-0 bg-[#160B13]/92 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20 select-none animate-fadeIn"
              >
                <div className="w-14 h-14 mb-2.5 rounded-full bg-[#341C29] border border-[#F6A9BE]/50 flex items-center justify-center text-2xl shadow-lg">
                  🌙
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    color: '#FAF0E1',
                    marginBottom: '4px',
                  }}
                >
                  Sweet Dreams, Pip!
                </h3>

                <p className="text-[12px] text-[#DEC3A7]/90 mb-3.5">
                  Pip hopped through the cozy clouds
                </p>

                <div className="bg-[#24131E]/95 border border-[#DEC3A7]/30 rounded-xl px-4 py-2.5 mb-3 w-full max-w-[240px] flex justify-around items-center shadow-md">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#DEC3A7]/70">Height</div>
                    <div className="text-[15px] font-mono font-bold text-[#FFF8F1]">{hudHeight}m</div>
                  </div>
                  <div className="w-px h-7 bg-[#DEC3A7]/25" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#F6A9BE]">Score</div>
                    <div className="text-[16px] font-mono font-extrabold text-[#F3C66F]">{hudScore.toLocaleString()}</div>
                  </div>
                </div>

                {isNewBest && (
                  <div className="mb-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3C66F]/20 border border-[#F3C66F]/60 text-[#F3C66F] text-[11px] font-bold">
                    <Sparkles size={12} /> NEW PERSONAL BEST!
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full max-w-[220px]">
                  <button
                    type="button"
                    onClick={() => {
                      initAudio();
                      resetGame();
                      playNote(2);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #E85D75 0%, #C83E5B 100%)',
                      border: '1.5px solid #FFAAB8',
                      boxShadow: '0 4px 14px rgba(200, 62, 91, 0.45)',
                    }}
                  >
                    <span>🌸</span>
                    <span>Hop Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 px-4 rounded-xl font-semibold text-[12px] text-[#DEC3A7] hover:text-white bg-[#341C29] hover:bg-[#462637] border border-[#DEC3A7]/35 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <X size={14} />
                    <span>Exit to Nursery</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cabinet Footer */}
        <div className="pt-1.5 px-1 flex items-center justify-between text-xs text-[#DEC3A7] flex-shrink-0">
          <span className="text-[10px] sm:text-[11px] text-[#DEC3A7]/85 font-medium flex items-center gap-1">
            <span>👆</span> Drag left/right to steer Pip
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                initAudio();
                setSoundOn((s) => !s);
              }}
              title={soundOn ? 'Turn sound off' : 'Turn sound on'}
              className="px-2.5 py-1 rounded-lg bg-[#341C29] hover:bg-[#462637] border border-[#DEC3A7]/30 text-white text-[10px] sm:text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              {soundOn ? <Volume2 size={11} className="text-[#F3C66F]" /> : <VolumeX size={11} className="text-[#F6A9BE]" />}
              <span>{soundOn ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                initAudio();
                resetGame();
                playNote(1);
              }}
              title="Restart Hop"
              className="px-2.5 py-1 rounded-lg bg-[#341C29] hover:bg-[#462637] border border-[#DEC3A7]/30 text-white text-[10px] sm:text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw size={11} className="text-[#F3C66F]" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SakuraHopModal;

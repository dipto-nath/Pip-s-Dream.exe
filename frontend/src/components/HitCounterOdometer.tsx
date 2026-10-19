// =============================================================
// PIP.EXE — HitCounterOdometer
// Luxury vintage mechanical rolling dream odometer.
// Authoritative global visitor registry synced with backend,
// 3D cylindrical mechanical tumbling digits, live satellite beacon,
// and interactive Web Audio dream pulse feedback.
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { RotateCw, Sparkles, Moon, Radio } from 'lucide-react';
import { recordVisit, fetchVisitorStats, getSessionId, formatCount } from '../lib/visitService';

// 20-digit rolling strip for continuous analog tumble
const DIGIT_REEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface DreamParticle {
  id: number;
  icon: string;
  dx: number;
  dy: number;
  dyEnd: number;
}

/** Slotted vintage brass rivet for authentic hardware aesthetics */
function BrassRivet() {
  return (
    <div
      className="w-3 h-3 rounded-full flex items-center justify-center select-none shadow-sm"
      style={{
        background: 'radial-gradient(circle at 35% 35%, #FFEBAA 0%, #D4AF37 55%, #8C6D1F 100%)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.65), 0 1px 3px rgba(0,0,0,0.7)',
      }}
      aria-hidden="true"
    >
      <div
        className="w-1.5 h-[1.5px]"
        style={{
          background: 'rgba(58, 36, 24, 0.85)',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
}

/** 3D Mechanical Rolling Odometer Drum Wheel */
function OdometerDrum({
  digit,
  delayIndex,
  hasAnimated,
}: {
  digit: string;
  delayIndex: number;
  hasAnimated: boolean;
}) {
  const val = parseInt(digit, 10);
  const targetIndex = isNaN(val) ? 0 : 10 + val;
  const translateY = hasAnimated ? -(targetIndex * 5) : 0;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: 'clamp(24px, 3.8vw, 34px)',
        height: 'clamp(40px, 5.5vw, 50px)',
        borderRadius: '6px',
        background: 'linear-gradient(180deg, #090406 0%, #201017 35%, #2B1520 50%, #201017 65%, #090406 100%)',
        border: '1.5px solid rgba(243, 198, 111, 0.4)',
        boxShadow: 'inset 0 8px 12px rgba(0,0,0,0.95), inset 0 -8px 12px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.6)',
      }}
    >
      {/* 3D Cylindrical Reflection Line across center seam */}
      <div
        className="absolute inset-x-0 top-1/2 pointer-events-none z-10"
        style={{
          height: '1px',
          background: 'rgba(255, 245, 215, 0.22)',
          boxShadow: '0 0 6px rgba(243, 198, 111, 0.5)',
        }}
      />

      {/* Top & Bottom 3D Cylinder Curvature Shadows */}
      <div
        className="absolute inset-x-0 top-0 h-3.5 pointer-events-none z-10"
        style={{ background: 'linear-gradient(180deg, rgba(9,4,6,0.95) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3.5 pointer-events-none z-10"
        style={{ background: 'linear-gradient(0deg, rgba(9,4,6,0.95) 0%, transparent 100%)' }}
      />

      {/* Rolling Numbers Strip */}
      <div
        style={{
          transform: `translateY(${translateY}%)`,
          transition: 'transform 1.9s cubic-bezier(0.12, 0.8, 0.25, 1)',
          transitionDelay: `${(6 - delayIndex) * 90}ms`,
          willChange: 'transform',
        }}
      >
        {DIGIT_REEL.map((num, i) => (
          <div
            key={i}
            className="flex items-center justify-center font-bold"
            style={{
              height: 'clamp(40px, 5.5vw, 50px)',
              fontFamily: '"JetBrains Mono", var(--font-mono, monospace)',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.65rem)',
              color: '#FFEBB0',
              textShadow: '0 0 10px rgba(243, 198, 111, 0.8), 0 1px 3px rgba(0,0,0,0.95)',
              letterSpacing: '-0.02em',
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Vintage copper comma separator between thousands */
function CommaSeparator() {
  return (
    <div
      className="flex items-end justify-center pb-1.5 select-none font-bold"
      style={{
        width: 'clamp(8px, 1.2vw, 12px)',
        height: 'clamp(40px, 5.5vw, 50px)',
        fontFamily: '"JetBrains Mono", var(--font-mono, monospace)',
        fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
        color: '#D4AF37',
        textShadow: '0 0 8px rgba(243, 198, 111, 0.7)',
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      ,
    </div>
  );
}

/** Synthesize soothing 4-bell lullaby chime for dream pulse */
function playPulseChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (crystal bell)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.7);
    });
  } catch {
    /* ignore */
  }
}

export function HitCounterOdometer() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseToast, setPulseToast] = useState<string | null>(null);
  const [particles, setParticles] = useState<DreamParticle[]>([]);
  const [pulseActive, setPulseActive] = useState(false);

  // Initialize and record visit on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      const sessionId = getSessionId();
      const result = await recordVisit(sessionId);
      if (mounted) {
        setCount(result.total);
        setIsOnline(result.isOnline);
        setLoading(false);
        // Kick off mechanical roll after initial render
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (mounted) setHasAnimated(true);
          }, 80);
        });
      }
    }
    init();

    // Auto-sync stats in the background every 45s
    const timer = setInterval(async () => {
      if (!mounted) return;
      const stats = await fetchVisitorStats();
      if (mounted && stats.isOnline && stats.stats.total_visits > 0) {
        setCount(stats.stats.total_visits);
        setIsOnline(true);
      }
    }, 45000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const stats = await fetchVisitorStats();
      if (stats.stats.total_visits > 0) {
        setCount(stats.stats.total_visits);
      }
      setIsOnline(stats.isOnline);
    } catch {
      /* ignore */
    } finally {
      setTimeout(() => setIsRefreshing(false), 650);
    }
  }, [isRefreshing]);

  // Interactive Dream Pulse
  const handleSendPulse = () => {
    playPulseChime();
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 900);

    // Launch floating dream sparkle particles
    const icons = ['🌸', '✨', '⭐', '🌙', '💫', '✦'];
    const newParticles: DreamParticle[] = icons.map((icon, i) => ({
      id: Date.now() + i,
      icon,
      dx: (Math.random() - 0.5) * 140,
      dy: -(Math.random() * 40 + 20),
      dyEnd: -(Math.random() * 60 + 55),
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles([]);
    }, 1800);

    // Refresh latest count from registry
    handleRefresh();

    setPulseToast(`✨ Dream pulse sent! You are Dreamer #${count || 17} 🌙`);
    setTimeout(() => {
      setPulseToast(null);
    }, 3600);
  };

  const digits = formatCount(count, 7).split('');

  return (
    <div
      className="relative flex flex-col items-center select-none w-full max-w-[490px] mx-auto p-4 sm:p-5 rounded-[22px]"
      style={{
        background: 'linear-gradient(180deg, #2D1A14 0%, #1A0D0A 100%)',
        border: '2.5px solid #DEC3A7',
        boxShadow: pulseActive
          ? '0 0 35px rgba(243, 198, 111, 0.6), 0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255, 245, 220, 0.3)'
          : '0 16px 45px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255, 245, 220, 0.25), 0 0 22px rgba(243, 198, 111, 0.12)',
        transition: 'box-shadow 0.35s ease',
      }}
      aria-label={`Global Dream Visits: ${count.toLocaleString()}`}
    >
      {/* 4 Corner Brass Rivets */}
      <div className="absolute top-2.5 left-2.5"><BrassRivet /></div>
      <div className="absolute top-2.5 right-2.5"><BrassRivet /></div>
      <div className="absolute bottom-2.5 left-2.5"><BrassRivet /></div>
      <div className="absolute bottom-2.5 right-2.5"><BrassRivet /></div>

      {/* Top Header Plate */}
      <div className="w-full flex items-center justify-between pb-2.5 px-2 border-b border-[#DEC3A7]/25 mb-3">
        {/* Live Satellite Beacon */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui, system-ui)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#A8E6CF',
                  textTransform: 'uppercase',
                }}
              >
                LIVE DREAM SYNC
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block shadow-sm"></span>
              <span
                style={{
                  fontFamily: 'var(--font-ui, system-ui)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#F3C66F',
                  textTransform: 'uppercase',
                }}
              >
                LOCAL DESK SYNC
              </span>
            </div>
          )}
        </div>

        {/* Sync / Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh dream visitor registry"
          className="flex items-center gap-1 text-[10px] text-[#DEC3A7]/80 hover:text-white bg-[#3B2219] hover:bg-[#4E2E22] border border-[#DEC3A7]/30 px-2 py-0.5 rounded-md transition cursor-pointer active:scale-95"
        >
          <RotateCw size={10} className={isRefreshing ? 'animate-spin text-[#F3C66F]' : 'text-[#F3C66F]'} />
          <span className="font-mono text-[9px] uppercase tracking-wider">Sync</span>
        </button>
      </div>

      {/* Title Header Plate */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <Sparkles size={13} className="text-[#F3C66F]" />
          <h4
            style={{
              fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#FFF8F1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              margin: 0,
            }}
          >
            Global Dream Visits
          </h4>
          <Sparkles size={13} className="text-[#F3C66F]" />
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#DEC3A7]/75 font-medium tracking-wide">
          The Midnight Nursery · Official Night Watch Registry
        </p>
      </div>

      {/* Odometer Drum Display Window */}
      <div
        className="relative p-2 sm:p-2.5 rounded-[14px] flex items-center justify-center shadow-inner overflow-hidden mb-3"
        style={{
          background: '#0E0709',
          border: '2px solid rgba(222, 195, 167, 0.45)',
          boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Glass specular glare overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
          }}
        />

        {/* 7 Digit Drums with Comma Separators: X,XXX,XXX */}
        <div className="flex items-center gap-1 sm:gap-1.5 z-10">
          {loading ? (
            <div className="flex items-center gap-1 sm:gap-1.5 py-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-md bg-[#2B1520]/80 border border-[#F3C66F]/20"
                  style={{
                    width: 'clamp(24px, 3.8vw, 34px)',
                    height: 'clamp(40px, 5.5vw, 50px)',
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Millions */}
              <OdometerDrum digit={digits[0]} delayIndex={0} hasAnimated={hasAnimated} />

              <CommaSeparator />

              {/* Thousands: hundred-thousands, ten-thousands, thousands */}
              <OdometerDrum digit={digits[1]} delayIndex={1} hasAnimated={hasAnimated} />
              <OdometerDrum digit={digits[2]} delayIndex={2} hasAnimated={hasAnimated} />
              <OdometerDrum digit={digits[3]} delayIndex={3} hasAnimated={hasAnimated} />

              <CommaSeparator />

              {/* Units: hundreds, tens, units */}
              <OdometerDrum digit={digits[4]} delayIndex={4} hasAnimated={hasAnimated} />
              <OdometerDrum digit={digits[5]} delayIndex={5} hasAnimated={hasAnimated} />
              <OdometerDrum digit={digits[6]} delayIndex={6} hasAnimated={hasAnimated} />
            </>
          )}
        </div>
      </div>

      {/* Dreamer Record Milestone Badge */}
      <div className="mb-3.5 text-center px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B2219]/90 border border-[#DEC3A7]/35 text-[11px] text-[#FFEBB0] shadow-sm">
          <Moon size={12} className="text-[#F3C66F]" />
          <span>
            You are Dreamer <strong className="text-[#F3C66F] font-mono font-bold">#{count.toLocaleString() || '17'}</strong> registered tonight
          </span>
        </div>
      </div>

      {/* Interactive Action Bar: Send Dream Pulse */}
      <div className="relative flex flex-col items-center w-full">
        {/* Floating Particles on Pulse */}
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute text-[16px] pointer-events-none"
              style={{
                '--p-dx': `${p.dx}px`,
                '--p-dy': `${p.dy}px`,
                '--p-dy-end': `${p.dyEnd}px`,
                animation: 'dream-sparkle-float 1.7s cubic-bezier(0.2, 0.8, 0.25, 1) forwards',
              } as React.CSSProperties}
            >
              {p.icon}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSendPulse}
          className="relative px-5 py-2 rounded-xl text-white font-bold text-[12px] sm:text-[13px] flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #E85D75 0%, #C83E5B 100%)',
            border: '1.5px solid #FFAAB8',
            boxShadow: '0 4px 14px rgba(200, 62, 91, 0.45), 0 0 10px rgba(243, 198, 111, 0.2)',
          }}
        >
          <Sparkles size={14} className="text-amber-200" />
          <span>Send Dream Pulse</span>
          <Radio size={13} className="text-pink-200" />
        </button>

        {/* Pulse Toast Feedback */}
        {pulseToast && (
          <div
            className="mt-2.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-[#FFF8F1] animate-fade-in text-center"
            style={{
              background: 'rgba(58, 34, 25, 0.95)',
              border: '1px solid rgba(243, 198, 111, 0.5)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {pulseToast}
          </div>
        )}
      </div>
    </div>
  );
}

export default HitCounterOdometer;

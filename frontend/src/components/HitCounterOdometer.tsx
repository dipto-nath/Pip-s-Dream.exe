// =============================================================
// PIP.EXE — HitCounterOdometer
// Cozy storybook global visitor registry.
// Synced with backend, smooth mechanical rolling digits,
// live status indicator, and interactive dream pulse feedback.
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { RotateCw, Sparkles, Moon } from 'lucide-react';
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

/** Single rolling digit column within the unified display window */
function OdometerDigit({
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
      style={{
        width: 'clamp(22px, 3.2vw, 28px)',
        height: 'clamp(38px, 5.2vw, 46px)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Rolling Numbers Strip */}
      <div
        style={{
          transform: `translateY(${translateY}%)`,
          transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${(6 - delayIndex) * 75}ms`,
          willChange: 'transform',
        }}
      >
        {DIGIT_REEL.map((num, i) => (
          <div
            key={i}
            style={{
              height: 'clamp(38px, 5.2vw, 46px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"JetBrains Mono", var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
              color: '#FFEAB2',
              textShadow: '0 0 10px rgba(243, 198, 111, 0.6)',
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

/** Clean natural comma separator */
function CommaSeparator() {
  return (
    <div
      style={{
        width: 'clamp(8px, 1.2vw, 12px)',
        height: 'clamp(38px, 5.2vw, 46px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"JetBrains Mono", var(--font-mono, monospace)',
        fontWeight: 700,
        fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
        color: 'rgba(243, 198, 111, 0.75)',
        textShadow: '0 0 8px rgba(243, 198, 111, 0.5)',
        lineHeight: 1,
        paddingBottom: '2px',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      ,
    </div>
  );
}

/** Synthesize soothing lullaby chime for dream pulse */
function playPulseChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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

    // Launch gentle floating dream sparkle particles
    const icons = ['🌸', '✨', '⭐', '🌙', '💫'];
    const newParticles: DreamParticle[] = icons.map((icon, i) => ({
      id: Date.now() + i,
      icon,
      dx: (Math.random() - 0.5) * 120,
      dy: -(Math.random() * 35 + 15),
      dyEnd: -(Math.random() * 50 + 45),
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles([]);
    }, 1800);

    handleRefresh();

    setPulseToast(`✨ Dream pulse sent! You are Dreamer #${count || 17} 🌙`);
    setTimeout(() => {
      setPulseToast(null);
    }, 3600);
  };

  const digits = formatCount(count, 7).split('');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        padding: '24px 28px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #2A1722 0%, #1A0D15 100%)',
        border: '1.5px solid rgba(243, 198, 111, 0.32)',
        boxShadow: pulseActive
          ? '0 0 32px rgba(243, 198, 111, 0.5), 0 16px 40px rgba(0,0,0,0.65)'
          : '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        transition: 'box-shadow 0.35s ease',
      }}
      aria-label={`Global Dream Visits: ${count.toLocaleString()}`}
    >
      {/* Top Status & Sync Row */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-flex',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
                opacity: 0.75,
                background: isOnline ? '#34D399' : '#FBBF24',
                animation: isOnline ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
              }}
            />
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '50%',
                height: '8px',
                width: '8px',
                background: isOnline ? '#10B981' : '#F59E0B',
              }}
            />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui, system-ui)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: isOnline ? '#A8E6CF' : '#F3C66F',
              textTransform: 'uppercase',
            }}
          >
            {isOnline ? 'Live Dream Sync' : 'Local Desk Sync'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh dream visitor registry"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'rgba(222, 195, 167, 0.9)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(222, 195, 167, 0.25)',
            padding: '4px 10px',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <RotateCw size={11} style={{ color: '#F3C66F' }} className={isRefreshing ? 'animate-spin' : ''} />
          <span style={{ fontFamily: 'var(--font-ui, system-ui)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Sync</span>
        </button>
      </div>

      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={15} style={{ color: '#F3C66F' }} />
          <h4
            style={{
              fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#FFF8F1',
              letterSpacing: '0.03em',
              margin: 0,
            }}
          >
            Global Dream Visits
          </h4>
          <Sparkles size={15} style={{ color: '#F3C66F' }} />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-story, Georgia, serif)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: 'rgba(255, 248, 241, 0.7)',
            margin: 0,
          }}
        >
          The Midnight Nursery · Official Night Watch Registry
        </p>
      </div>

      {/* Unified Odometer Display Window */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 22px',
          borderRadius: '16px',
          background: '#0F060C',
          border: '1.5px solid rgba(243, 198, 111, 0.35)',
          boxShadow: 'inset 0 3px 12px rgba(0, 0, 0, 0.85), 0 2px 8px rgba(0, 0, 0, 0.3)',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft specular sheen across the window */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          }}
        />

        {/* 7 Digits with clean commas in a unified ticker window */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 'clamp(22px, 3.2vw, 28px)',
                    height: 'clamp(38px, 5.2vw, 46px)',
                    borderRadius: '6px',
                    background: '#23111D',
                    border: '1px solid rgba(243, 198, 111, 0.2)',
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Millions */}
              <OdometerDigit digit={digits[0]} delayIndex={0} hasAnimated={hasAnimated} />

              <CommaSeparator />

              {/* Thousands: hundred-thousands, ten-thousands, thousands */}
              <OdometerDigit digit={digits[1]} delayIndex={1} hasAnimated={hasAnimated} />
              <OdometerDigit digit={digits[2]} delayIndex={2} hasAnimated={hasAnimated} />
              <OdometerDigit digit={digits[3]} delayIndex={3} hasAnimated={hasAnimated} />

              <CommaSeparator />

              {/* Units: hundreds, tens, units */}
              <OdometerDigit digit={digits[4]} delayIndex={4} hasAnimated={hasAnimated} />
              <OdometerDigit digit={digits[5]} delayIndex={5} hasAnimated={hasAnimated} />
              <OdometerDigit digit={digits[6]} delayIndex={6} hasAnimated={hasAnimated} />
            </>
          )}
        </div>
      </div>

      {/* Dreamer Record Milestone Badge */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(255, 248, 241, 0.06)',
            border: '1px solid rgba(243, 198, 111, 0.22)',
            fontSize: '0.8rem',
            color: '#FFEBB0',
            fontFamily: 'var(--font-ui, system-ui)',
          }}
        >
          <Moon size={13} style={{ color: '#F3C66F' }} />
          <span>
            You are Dreamer <strong style={{ color: '#F3C66F', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>#{count.toLocaleString() || '17'}</strong> registered tonight
          </span>
        </div>
      </div>

      {/* Interactive Action Bar: Send Dream Pulse */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Floating Particles on Pulse */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                fontSize: '16px',
                pointerEvents: 'none',
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
          style={{
            background: 'var(--vintage-berry)',
            color: '#FFF8F1',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '9px 24px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-ui, system-ui)',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.filter = 'none';
            (e.currentTarget as HTMLButtonElement).style.transform = 'none';
          }}
        >
          <Sparkles size={14} style={{ color: '#FFEAA7' }} />
          <span>Send Dream Pulse</span>
        </button>

        {/* Pulse Toast Feedback */}
        {pulseToast && (
          <div
            style={{
              marginTop: '10px',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#FFF8F1',
              textAlign: 'center',
              background: 'rgba(38, 20, 30, 0.95)',
              border: '1px solid rgba(243, 198, 111, 0.4)',
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

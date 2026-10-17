// =============================================================
// PIP.EXE — HitCounterOdometer
// Vintage rolling digit display with global counter (backend)
// + local fallback when the server is unreachable.
// =============================================================

import { useState, useEffect } from 'react';
import { recordVisit, getSessionId, formatCount } from '../lib/visitService';

interface DigitProps {
  char: string;
}

function Digit({ char }: DigitProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1.2ch',
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        fontSize: 'inherit',
        textAlign: 'center',
        background: 'var(--midnight-nursery)',
        color: 'var(--glow-amber-bright)',
        border: '1px solid var(--border-warm)',
        borderRadius: 2,
        padding: '1px 2px',
        lineHeight: 1.3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        transition: 'color 0.3s',
      }}
    >
      {char}
    </span>
  );
}

export function HitCounterOdometer() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const sessionId = getSessionId();
      const result = await recordVisit(sessionId);
      if (mounted) {
        setCount(result.total);
        setIsOnline(result.isOnline);
        setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const formatted = formatCount(count, 7);
  const label = isOnline
    ? 'Global Dream Visits'
    : isOnline === false
      ? 'Dream Visits — Local Only'
      : 'Counting Dreams…';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div
        style={{
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: isOnline ? 'var(--accent)' : 'var(--text-faint)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        {label}
      </div>
      {loading ? (
        <div
          aria-label="Loading visitor count"
          style={{ display: 'flex', gap: 2, letterSpacing: 0 }}
        >
          {'───────'.split('').map((char, i) => (
            <Digit key={i} char={char} />
          ))}
        </div>
      ) : (
        <div
          aria-label={`${count.toLocaleString()} dream visits`}
          style={{ display: 'flex', gap: 2, letterSpacing: 0 }}
        >
          {formatted.split('').map((char, i) => (
            <Digit key={i} char={char === ',' ? ',' : char} />
          ))}
        </div>
      )}
      {!isOnline && !loading && (
        <small
          style={{
            color: 'var(--text-faint)',
            fontSize: '0.58rem',
            fontStyle: 'italic',
          }}
        >
          Server unreachable — showing local session count only
        </small>
      )}
    </div>
  );
}

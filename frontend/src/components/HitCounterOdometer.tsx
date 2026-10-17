// =============================================================
// PIP.EXE — HitCounterOdometer
// Vintage rolling digit display with browser-local counter
// =============================================================

import { useState } from 'react';
import { recordVisit, formatCount } from '../lib/visitCounter';

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
  // recordVisit is session-guarded, so calling it in the lazy initializer
  // is safe and avoids setState-in-effect lint warnings.
  const [count] = useState<number>(() => recordVisit());

  const formatted = formatCount(count, 7);

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
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        Dream Visits · This Device
      </div>
      <div
        aria-label={`${count.toLocaleString()} dream visits on this device`}
        style={{ display: 'flex', gap: 2, letterSpacing: 0 }}
      >
        {formatted.split('').map((char, i) => (
          <Digit key={i} char={char === ',' ? ',' : char} />
        ))}
      </div>
    </div>
  );
}

// =============================================================
// PIP.EXE — DraggableDreamWindow (Chaos Mode overlay)
// =============================================================

import { useState, useRef, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';

interface DraggableDreamWindowProps {
  chaosMode: boolean;
}

export function DraggableDreamWindow({ chaosMode }: DraggableDreamWindowProps) {
  const [pos, setPos] = useState({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [closed, setClosed] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const winRef = useRef<HTMLDivElement>(null);

  const STATUS_LINES = [
    '> LULLABY QUEUE: 4,209 songs',
    '> NIGHTLIGHT STATUS: NOMINAL',
    '> DREAM DELIVERY: ON ROUTE',
    '> SYSTEM TIME: Late, but fine',
    '> PIP STATUS: Sleepy but dedicated',
  ];

  const clamp = useCallback((val: number, min: number, max: number) => Math.max(min, Math.min(max, val)), []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    setIsDragging(true);
    const rect = winRef.current?.getBoundingClientRect();
    if (!rect) return;
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !winRef.current) return;
    const el = winRef.current;
    const maxX = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - el.offsetHeight);
    const newX = clamp(e.clientX - offsetRef.current.x, 0, maxX);
    const newY = clamp(e.clientY - offsetRef.current.y, 0, maxY);
    setPos({ x: newX, y: newY });
  }, [isDragging, clamp]);

  const onPointerUp = useCallback(() => setIsDragging(false), []);

  // Keyboard repositioning
  function handleKeydown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 20 : 8;
    const el = winRef.current;
    const width = el?.offsetWidth ?? 240;
    const height = el?.offsetHeight ?? 0;
    const maxX = Math.max(0, window.innerWidth - width);
    const maxY = Math.max(0, window.innerHeight - height);
    switch (e.key) {
      case 'ArrowLeft':  setPos((p) => ({ ...p, x: Math.max(0, p.x - step) })); break;
      case 'ArrowRight': setPos((p) => ({ ...p, x: Math.min(maxX, p.x + step) })); break;
      case 'ArrowUp':    setPos((p) => ({ ...p, y: Math.max(0, p.y - step) })); break;
      case 'ArrowDown':  setPos((p) => ({ ...p, y: Math.min(maxY, p.y + step) })); break;
      default: return;
    }
    e.preventDefault();
  }

  if (!chaosMode || closed) return null;

  return (
    <div
      ref={winRef}
      role="dialog"
      aria-label="Dream Console — Pip's status window"
      aria-modal={false}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 240,
        zIndex: 200,
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
      }}
      className="retro-window"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Draggable titlebar */}
      <div
        className="retro-window__titlebar"
        onPointerDown={onPointerDown}
        onKeyDown={handleKeydown}
        tabIndex={0}
        aria-label="Dream Console window — drag to reposition, or use arrow keys"
        role="group"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GripVertical size={12} style={{ opacity: 0.5 }} />
          <span>DREAM CONSOLE</span>
        </div>
        <button
          onClick={() => setClosed(true)}
          aria-label="Close Dream Console"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--dream-cream)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            opacity: 0.7,
          }}
        >
          <X size={12} />
        </button>
      </div>

      <div
        style={{
          padding: 'var(--sp-4)',
          background: '#0f0a0d',
          borderTop: '1px solid #2a1018',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: '#68d391',
            lineHeight: 1.8,
          }}
        >
          {STATUS_LINES.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div
          style={{
            marginTop: 'var(--sp-3)',
            paddingTop: 'var(--sp-3)',
            borderTop: '1px solid #1a1014',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.68rem',
            color: 'rgba(255,248,241,0.4)',
          }}
        >
          Use ↑↓←→ to reposition
        </div>
      </div>
    </div>
  );
}

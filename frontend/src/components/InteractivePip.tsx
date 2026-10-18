// =============================================================
// PIP.EXE — Interactive Pip Character
// Full cursor-tracking pupils + body shift parallax towards cursor
// =============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

interface InteractivePipProps {
  soundEnabled?: boolean;
  onChime?: (freq: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function InteractivePip({
  soundEnabled = false,
  onChime,
  className = '',
  style = {},
}: InteractivePipProps) {
  const prefersReduced = useReducedMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pupilLeftRef = useRef<HTMLDivElement>(null);
  const pupilRightRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  });

  const [isBlinking, setIsBlinking] = useState(false);
  const [isLanternGlow, setIsLanternGlow] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const bounceTimerRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<number | null>(null);

  const triggerBlink = useCallback((duration = 150) => {
    setIsBlinking(true);
    if (blinkTimeoutRef.current) {
      window.clearTimeout(blinkTimeoutRef.current);
    }
    blinkTimeoutRef.current = window.setTimeout(() => {
      setIsBlinking(false);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) {
        window.clearTimeout(bounceTimerRef.current);
      }
      if (blinkTimeoutRef.current) {
        window.clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    let nextBlinkTimer: number;

    const scheduleNextBlink = () => {
      const delay = Math.random() * 3200 + 2600; // 2.6 to 5.8s
      nextBlinkTimer = window.setTimeout(() => {
        triggerBlink(150);
        scheduleNextBlink();
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      window.clearTimeout(nextBlinkTimer);
    };
  }, [triggerBlink]);

  // Cursor tracking loop (body parallax + pupil following)
  useEffect(() => {
    if (prefersReduced) return;

    let rafId: number;
    let currentBodyX = 0;
    let currentBodyY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentRotateZ = 0;

    let currentPupilLX = 0;
    let currentPupilLY = 0;
    let currentPupilRX = 0;
    let currentPupilRY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const loop = () => {
      const container = containerRef.current;
      const body = bodyRef.current;
      const pupilL = pupilLeftRef.current;
      const pupilR = pupilRightRef.current;

      if (container && body && pupilL && pupilR) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const halfW = window.innerWidth / 2 || 1;
        const halfH = window.innerHeight / 2 || 1;

        // Normalized cursor delta from character center (-1 to 1)
        const normX = Math.max(-1, Math.min(1, (mouseRef.current.x - centerX) / halfW));
        const normY = Math.max(-1, Math.min(1, (mouseRef.current.y - centerY) / halfH));

        // 1. Body shift and 3D tilt towards cursor
        const targetBodyX = normX * 26;
        const targetBodyY = normY * 18;
        const targetRotateZ = normX * 3.2;
        const targetRotateY = normX * 7.5;
        const targetRotateX = -normY * 5.5;

        currentBodyX += (targetBodyX - currentBodyX) * 0.08;
        currentBodyY += (targetBodyY - currentBodyY) * 0.08;
        currentRotateX += (targetRotateX - currentRotateX) * 0.08;
        currentRotateY += (targetRotateY - currentRotateY) * 0.08;
        currentRotateZ += (targetRotateZ - currentRotateZ) * 0.08;

        body.style.transform = `translate3d(${currentBodyX.toFixed(2)}px, ${currentBodyY.toFixed(2)}px, 0) perspective(900px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) rotateZ(${currentRotateZ.toFixed(2)}deg)`;

        // 2. Pupil tracking for Viewer's Left Eye (39.62% X, 37.88% Y)
        const eyeLX = rect.left + rect.width * 0.3962;
        const eyeLY = rect.top + rect.height * 0.3788;
        const dxL = mouseRef.current.x - eyeLX;
        const dyL = mouseRef.current.y - eyeLY;
        const distL = Math.hypot(dxL, dyL);
        const angleL = Math.atan2(dyL, dxL);
        // Max travel radius strictly bounded within socket
        const maxTravel = rect.width * 0.026;
        const travelL = Math.min(maxTravel, (distL / (halfW * 0.85)) * maxTravel);
        const targetPupilLX = Math.cos(angleL) * travelL;
        const targetPupilLY = Math.sin(angleL) * travelL;

        // 3. Pupil tracking for Viewer's Right Eye (66.75% X, 32.35% Y)
        const eyeRX = rect.left + rect.width * 0.6675;
        const eyeRY = rect.top + rect.height * 0.3235;
        const dxR = mouseRef.current.x - eyeRX;
        const dyR = mouseRef.current.y - eyeRY;
        const distR = Math.hypot(dxR, dyR);
        const angleR = Math.atan2(dyR, dxR);
        const travelR = Math.min(maxTravel, (distR / (halfW * 0.85)) * maxTravel);
        const targetPupilRX = Math.cos(angleR) * travelR;
        const targetPupilRY = Math.sin(angleR) * travelR;

        currentPupilLX += (targetPupilLX - currentPupilLX) * 0.15;
        currentPupilLY += (targetPupilLY - currentPupilLY) * 0.15;
        currentPupilRX += (targetPupilRX - currentPupilRX) * 0.15;
        currentPupilRY += (targetPupilRY - currentPupilRY) * 0.15;

        pupilL.style.transform = `translate3d(${currentPupilLX.toFixed(2)}px, ${currentPupilLY.toFixed(2)}px, 0)`;
        pupilR.style.transform = `translate3d(${currentPupilRX.toFixed(2)}px, ${currentPupilRY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  const handleClick = useCallback(() => {
    // Clear any text/image selection ranges if accidentally initiated by rapid clicks
    if (typeof window !== 'undefined' && window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    triggerBlink(180);
    setIsLanternGlow(true);
    setIsBouncing(true);
    if (bounceTimerRef.current) {
      window.clearTimeout(bounceTimerRef.current);
    }
    bounceTimerRef.current = window.setTimeout(() => {
      setIsBouncing(false);
    }, 500);

    if (soundEnabled && onChime) {
      onChime(1046); // High C chime
    }
    window.setTimeout(() => setIsLanternGlow(false), 900);
  }, [soundEnabled, onChime, triggerBlink]);

  return (
    <div
      ref={containerRef}
      className={`interactive-pip-container ${className}`}
      onClick={handleClick}
      onMouseDown={(e) => {
        // Prevent default mousedown to prevent Safari/WebKit from selecting image on rapid/double click
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        // Prevent default double click selection
        e.preventDefault();
      }}
      role="img"
      aria-label="Pip, the Junior Dream Engineer, sitting on a soft cloud with a glowing lantern and unicorn music box. Pip follows your cursor with their warm amber eyes."
      style={{
        position: 'relative',
        width: 'clamp(280px, 36vw, 440px)',
        aspectRatio: '400 / 524',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'pan-y',
        cursor: 'pointer',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {/* Dynamic warm ambient lantern glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '32%',
          width: '50%',
          height: '45%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 75%)',
          filter: isLanternGlow ? 'blur(16px) brightness(1.6)' : 'blur(20px)',
          transition: 'filter 0.4s ease-out, transform 0.4s ease-out',
          transform: isLanternGlow ? 'scale(1.2)' : 'scale(1)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Outer float & bounce wrapper (handles idle floating & click bounce) */}
      <div
        className="interactive-pip-float-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          animation: prefersReduced
            ? 'none'
            : isBouncing
            ? 'pip-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'pip-gentle-float 6s ease-in-out infinite',
          zIndex: 1,
        }}
      >
        {/* Main body that shifts & tilts towards cursor (never overridden by CSS keyframes) */}
        <div
          ref={bodyRef}
          className="interactive-pip-body"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Pip character image (clean transparent background) */}
          <img
            src="/assets/pip_interactive_character.png"
            alt=""
            loading="eager"
            fetchPriority="high"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 14px 28px rgba(163, 64, 99, 0.12)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))',
            }}
          />

          {/* Left Eye Socket (Viewer's Left) */}
          <div
            className="pip-eye-socket pip-eye-socket--left"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '39.62%',
              top: '37.88%',
              width: '15%',
              height: '11.5%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            {/* Tracking Pupil Container (follows cursor) */}
            <div
              ref={pupilLeftRef}
              className="pip-pupil-tracker"
              style={{
                width: '46%',
                height: '58%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                pointerEvents: 'none',
              }}
            >
              {/* Blinking Pupil Disc (animates on blink without transform collision) */}
              <div
                className="pip-pupil-disc"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 35%, #ffffff 0%, #fffbf2 40%, #fed7aa 100%)',
                  boxShadow: isBlinking
                    ? 'none'
                    : '0 0 6px rgba(255, 255, 255, 0.95), 0 0 12px rgba(251, 191, 36, 0.65)',
                  transform: isBlinking ? 'scaleY(0.05)' : 'scaleY(1)',
                  opacity: isBlinking ? 0 : 1,
                  transformOrigin: 'center center',
                  transition: isBlinking
                    ? 'transform 0.07s ease-in, opacity 0.05s ease-in'
                    : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.09s ease-out',
                  position: 'relative',
                }}
              >
                {/* Catchlight sparkle */}
                <span
                  style={{
                    position: 'absolute',
                    top: '18%',
                    right: '22%',
                    width: '30%',
                    height: '30%',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 2px #ffffff',
                  }}
                />
              </div>
            </div>

            {/* Sleepy closed-eye curved line during blink */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isBlinking ? 1 : 0,
                transform: isBlinking ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 0.06s ease, transform 0.06s ease',
                pointerEvents: 'none',
              }}
            >
              <svg width="55%" height="30%" viewBox="0 0 24 10" fill="none">
                <path
                  d="M2 3 Q12 9 22 3"
                  stroke="rgba(255, 248, 235, 0.85)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Right Eye Socket (Viewer's Right) */}
          <div
            className="pip-eye-socket pip-eye-socket--right"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '66.75%',
              top: '32.35%',
              width: '15%',
              height: '11.8%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            {/* Tracking Pupil Container (follows cursor) */}
            <div
              ref={pupilRightRef}
              className="pip-pupil-tracker"
              style={{
                width: '46%',
                height: '58%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                pointerEvents: 'none',
              }}
            >
              {/* Blinking Pupil Disc (animates on blink without transform collision) */}
              <div
                className="pip-pupil-disc"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 35% 35%, #ffffff 0%, #fffbf2 40%, #fed7aa 100%)',
                  boxShadow: isBlinking
                    ? 'none'
                    : '0 0 6px rgba(255, 255, 255, 0.95), 0 0 12px rgba(251, 191, 36, 0.65)',
                  transform: isBlinking ? 'scaleY(0.05)' : 'scaleY(1)',
                  opacity: isBlinking ? 0 : 1,
                  transformOrigin: 'center center',
                  transition: isBlinking
                    ? 'transform 0.07s ease-in, opacity 0.05s ease-in'
                    : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.09s ease-out',
                  position: 'relative',
                }}
              >
                {/* Catchlight sparkle */}
                <span
                  style={{
                    position: 'absolute',
                    top: '18%',
                    right: '22%',
                    width: '30%',
                    height: '30%',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 2px #ffffff',
                  }}
                />
              </div>
            </div>

            {/* Sleepy closed-eye curved line during blink */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isBlinking ? 1 : 0,
                transform: isBlinking ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 0.06s ease, transform 0.06s ease',
                pointerEvents: 'none',
              }}
            >
              <svg width="55%" height="30%" viewBox="0 0 24 10" fill="none">
                <path
                  d="M2 3 Q12 9 22 3"
                  stroke="rgba(255, 248, 235, 0.85)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pip-gentle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pip-bounce {
          0% { transform: scale(1); }
          40% { transform: scale(0.94) translateY(6px); }
          75% { transform: scale(1.05) translateY(-8px); }
          100% { transform: scale(1); }
        }

        .interactive-pip-container,
        .interactive-pip-container * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .interactive-pip-container ::selection,
        .interactive-pip-container *::selection {
          background: transparent !important;
          color: inherit !important;
        }

        .interactive-pip-container ::-moz-selection,
        .interactive-pip-container *::-moz-selection {
          background: transparent !important;
          color: inherit !important;
        }

        .interactive-pip-container img {
          -webkit-user-drag: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
          -webkit-touch-callout: none !important;
        }
      `}</style>
    </div>
  );
}

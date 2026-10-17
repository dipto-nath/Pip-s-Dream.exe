// =============================================================
// PIP.EXE — DreamDeliveryMap
// Project 03: SVG rooftop map with scroll-driven route animation
// =============================================================

import { useRef, useEffect, useCallback } from 'react';
import { DELIVERY_DESTINATIONS } from '../lib/dreamContent';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

const ROUTE_PATH = 'M 80 300 C 120 260, 200 240, 310 220 C 390 200, 470 230, 560 290';
const ROUTE_LENGTH = 570; // approximate

export function DreamDeliveryMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);
  const prefersReduced = useReducedMotionPreference();

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!section || !path || !marker) return;

    const rect = section.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    // progress 0→1 as section scrolls into view
    const raw = 1 - (rect.bottom - viewHeight * 0.5) / (rect.height + viewHeight * 0.5);
    const progress = Math.max(0, Math.min(1, raw));

    // Stroke-dashoffset animation for the route
    const offset = ROUTE_LENGTH * (1 - progress);
    path.style.strokeDashoffset = String(offset);

    // Move marker along path
    const totalLen = path.getTotalLength();
    const pt = path.getPointAtLength(totalLen * progress);
    marker.setAttribute('cx', String(pt.x));
    marker.setAttribute('cy', String(pt.y));
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      // Show full path immediately
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = '0';
      }
      return;
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress(); // init

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, updateProgress]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="map-heading"
      style={{ position: 'relative' }}
    >
      <figure
        role="img"
        aria-labelledby="map-title"
        aria-describedby="map-desc"
        style={{
          margin: 0,
          background: 'var(--surface-panel)',
          border: '2px solid var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--shadow-warm)',
        }}
      >
        <svg
          viewBox="0 0 660 380"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: '400px',
          }}
          aria-labelledby="map-title map-desc"
        >
          <title id="map-title">Pip's Dream Delivery Route</title>
          <desc id="map-desc">
            A hand-drawn rooftop map showing Pip's nightly dream delivery route
            from the Nursery Tower, through Hedgehog Den, to Crescent Lane.
          </desc>

          {/* Night sky background */}
          <defs>
            <radialGradient id="sky-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#2a1b20" />
              <stop offset="100%" stopColor="#1a1014" />
            </radialGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="660" height="380" fill="url(#sky-grad)" />

          {/* Stars in sky */}
          {[
            [60, 40], [120, 25], [200, 55], [300, 20], [380, 45],
            [460, 30], [530, 60], [610, 35], [640, 70], [30, 70],
            [150, 80], [420, 80], [570, 75], [90, 100], [340, 95],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 2 : 1}
              fill="#fbbf24"
              opacity={0.5 + (i % 3) * 0.2}
            />
          ))}

          {/* Moon */}
          <circle cx={600} cy={55} r={28} fill="#fef3c7" opacity={0.9} />
          <circle cx={610} cy={48} r={22} fill="#2a1b20" opacity={0.7} />

          {/* Cloud clusters */}
          <g opacity={0.3} fill="#fff8f1">
            <ellipse cx={170} cy={110} rx={35} ry={14} />
            <ellipse cx={185} cy={100} rx={25} ry={12} />
            <ellipse cx={155} cy={105} rx={22} ry={10} />
          </g>
          <g opacity={0.2} fill="#fff8f1">
            <ellipse cx={470} cy={130} rx={30} ry={12} />
            <ellipse cx={482} cy={120} rx={22} ry={10} />
          </g>

          {/* ── Rooftops ── */}
          {/* House 1 — Nursery Tower */}
          <g aria-label="The Nursery Tower">
            {/* Tower body */}
            <rect x={55} y={200} width={50} height={110} fill="#5c4033" />
            {/* Tower roof */}
            <polygon points="30,200 80,155 130,200" fill="#a34063" />
            {/* Tower top */}
            <polygon points="72,155 80,130 88,155" fill="#fbbf24" />
            {/* Windows */}
            <rect x={65} y={215} width={14} height={14} rx={2} fill="#fbbf24" opacity={0.8} />
            <rect x={85} y={215} width={14} height={14} rx={2} fill="#fbbf24" opacity={0.6} />
            <rect x={65} y={250} width={14} height={14} rx={2} fill="#fbbf24" opacity={0.7} />
            <rect x={85} y={250} width={14} height={14} rx={2} fill="#fbbf24" opacity={0.9} />
            {/* Chimney */}
            <rect x={110} y={170} width={12} height={30} fill="#7a5845" />
            <rect x={108} y={165} width={16} height={8} rx={1} fill="#5c4033" />
            {/* Smoke */}
            <ellipse cx={116} cy={155} rx={8} ry={4} fill="#c4a882" opacity={0.3} />
            <ellipse cx={118} cy={143} rx={6} ry={3} fill="#c4a882" opacity={0.2} />
          </g>

          {/* House 2 — Hedgehog Den */}
          <g aria-label="Hedgehog Den">
            <rect x={280} y={225} width={60} height={95} fill="#7a5845" />
            <polygon points="260,225 310,175 360,225" fill="#8b3254" />
            <rect x={295} y={240} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.7} />
            <rect x={319} y={240} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.8} />
            <rect x={300} y={270} width={20} height={24} rx={2} fill="#5c4033" />
            {/* Chimney */}
            <rect x={330} y={190} width={10} height={35} fill="#5c4033" />
            <rect x={328} y={185} width={14} height={7} rx={1} fill="#3a2418" />
            <ellipse cx={335} cy={175} rx={7} ry={3.5} fill="#c4a882" opacity={0.35} />
          </g>

          {/* House 3 — Crescent Lane */}
          <g aria-label="Crescent Lane">
            <rect x={530} y={210} width={70} height={110} fill="#6b4a38" />
            <polygon points="510,210 565,155 630,210" fill="#7a2a4a" />
            <rect x={543} y={225} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.75} />
            <rect x={567} y={225} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.9} />
            <rect x={543} y={260} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.6} />
            <rect x={567} y={260} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.8} />
            <rect x={553} y={285} width={22} height={30} rx={2} fill="#3a2418" />
            {/* Chimney */}
            <rect x={600} y={175} width={12} height={35} fill="#5c4033" />
            <rect x={598} y={170} width={16} height={8} rx={1} fill="#3a2418" />
            <ellipse cx={606} cy={160} rx={8} ry={4} fill="#c4a882" opacity={0.3} />
          </g>

          {/* Ground / street */}
          <rect x={0} y={310} width={660} height={70} fill="#2a1b20" opacity={0.6} />
          {/* Cobblestones hint */}
          {[20, 80, 150, 230, 310, 400, 470, 550, 620].map((x, i) => (
            <ellipse key={i} cx={x} cy={320} rx={18} ry={5} fill="#3a2418" opacity={0.4} />
          ))}

          {/* ── Dream Route ── */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(245,158,11,0.25)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d={ROUTE_PATH}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LENGTH}
            strokeDashoffset={prefersReduced ? 0 : ROUTE_LENGTH}
            filter="url(#glow-filter)"
            style={{ transition: prefersReduced ? 'none' : undefined }}
          />

          {/* Delivery marker (dream capsule) */}
          <circle
            ref={markerRef}
            cx={80}
            cy={300}
            r={8}
            fill="#fbbf24"
            stroke="#fff8f1"
            strokeWidth={2}
            filter="url(#glow-filter)"
            aria-label="Dream capsule delivery marker"
          />
          <circle cx={80} cy={300} r={4} fill="#fff8f1" opacity={0.8} />

          {/* Destination labels */}
          {DELIVERY_DESTINATIONS.map((dest) => (
            <g key={dest.id}>
              {/* Pin */}
              <circle cx={dest.x} cy={dest.y} r={6} fill="#a34063" stroke="#fff8f1" strokeWidth={1.5} />
              {/* Label background */}
              <rect
                x={dest.x - 52}
                y={dest.y - 36}
                width={104}
                height={22}
                rx={4}
                fill="#1a1014"
                fillOpacity={0.85}
              />
              <text
                x={dest.x}
                y={dest.y - 20}
                textAnchor="middle"
                fill="#fff8f1"
                fontSize="10"
                fontFamily="Fredoka, system-ui, sans-serif"
                fontWeight="600"
              >
                {dest.name}
              </text>
            </g>
          ))}
        </svg>
        <figcaption
          style={{
            padding: 'var(--sp-4)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.78rem',
            color: 'var(--text-faint)',
            textAlign: 'center',
            borderTop: '1px solid var(--border-warm)',
          }}
        >
          ✦ Nightly Dream Route — Nursery Tower → Hedgehog Den → Crescent Lane ✦
        </figcaption>
      </figure>

      {/* Route summary in HTML text */}
      <div
        style={{
          marginTop: 'var(--sp-5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {DELIVERY_DESTINATIONS.map((dest, i) => (
          <div
            key={dest.id}
            style={{
              background: 'var(--surface-panel)',
              border: '1px solid var(--border-warm)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--sp-4)',
              borderLeft: '3px solid var(--accent)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                color: 'var(--text-faint)',
                marginBottom: 4,
              }}
            >
              Stop {String(i + 1).padStart(2, '0')}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                color: 'var(--body-text)',
                marginBottom: 4,
              }}
            >
              {dest.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-story)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              {dest.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

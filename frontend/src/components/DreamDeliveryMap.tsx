// =============================================================
// PIP.EXE — DreamDeliveryMap
// Project 03: Follow the Lanterns — Interactive Dream Delivery Routes
// =============================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Play, Pause, ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';

export interface DreamRouteStop {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  fullStory: string;
  image: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  svgX: number; // SVG viewBox coord
  svgY: number; // SVG viewBox coord
  chimeFreq: number; // Hz
}

const DREAM_STOPS: DreamRouteStop[] = [
  {
    id: 'bakers-dream',
    name: "The Little Baker's Dream",
    title: "The Little Baker's Dream",
    tagline: 'A sleepy bakery on the western cliff',
    description:
      'A tired baker, a warm kitchen, and a dream of a peaceful night. Pip left a lantern, and everything felt a little lighter.',
    fullStory:
      'Every dusk, the little baker kneads dough while the clouds turn lilac. Pip glided down the chimney with a thimble full of lavender starlight and placed it by the oven. By morning, the brioche had risen into shapes of crescent moons, smelling of cinnamon and sweet restful sleep.',
    image: '/assets/dream_baker.jpg',
    x: 20.5,
    y: 56.5,
    svgX: 205,
    svgY: 318,
    chimeFreq: 523.25, // C5
  },
  {
    id: 'hedgehog-den',
    name: 'Hedgehog Den',
    title: "The Hedgehog's Cloud Castle",
    tagline: 'Three hedgehogs tucked beneath moss',
    description:
      'Three hedgehogs who always request the exact same cloud-castle dream. Pip tucks a tiny amber prism under their doorstep.',
    fullStory:
      'Hedgehogs sleep tightly curled into spiky round balls. When Pip delivers this dream, their prickles soften like rabbit down. In their shared dream, they wander through towering castles built of warm marshmallow clouds and drink dew from buttercup chalices.',
    image: '/assets/dream_baker.jpg',
    x: 33.2,
    y: 72.8,
    svgX: 332,
    svgY: 410,
    chimeFreq: 659.25, // E5
  },
  {
    id: 'stargazer-tower',
    name: "The Stargazer's Tower",
    title: "The Stargazer's Tower",
    tagline: 'The celestial clockmaker on the middle tier',
    description:
      'An astronomer who stayed awake counting shooting stars. Pip replaced their telescope lens with a sleepy kaleidoscope.',
    fullStory:
      'High above the quiet clouds, the astronomer counted 1,402 falling stars before their heavy eyelids drooped. Pip whispered a lullaby into the brass telescope, turning every distant galaxy into a warm glowing nightlight that hummed them to sleep.',
    image: '/assets/dream_stargazer.jpg',
    x: 42.5,
    y: 54.0,
    svgX: 425,
    svgY: 304,
    chimeFreq: 783.99, // G5
  },
  {
    id: 'whisper-lake',
    name: 'Whisper Lake Haven',
    title: 'The Whisper Lake Haven',
    tagline: 'The quiet rowboat between water lilies',
    description:
      'A lonely wooden boat adrift on cloud-mist. Pip anchored it to a glowing water lily so it wouldn’t wander into storms.',
    fullStory:
      'Whisper Lake doesn’t have fish — it reflects captured constellations. Pip left a tiny floating lantern upon the lily pads, and the ripples began chiming the exact same five soothing notes as an antique music box.',
    image: '/assets/dream_stargazer.jpg',
    x: 67.5,
    y: 64.0,
    svgX: 675,
    svgY: 360,
    chimeFreq: 880.0, // A5
  },
  {
    id: 'cloud-citadel',
    name: 'The High Cloud Citadel',
    title: 'The High Cloud Citadel',
    tagline: 'The Great Nursery Citadel atop the sky',
    description:
      'Where all the dreams of the sleeping world return to be recharged and polished before morning breaks.',
    fullStory:
      'Inside the grand spires of the cloud castle, giant hourglasses drip liquid moonlight instead of sand. Pip delivers the master lantern here every night at 3:00 AM sharp to calibrate the next evening’s dream deliveries across all sleeping rooftops.',
    image: '/assets/dream_stargazer.jpg',
    x: 70.8,
    y: 31.0,
    svgX: 708,
    svgY: 174,
    chimeFreq: 1046.5, // C6
  },
];

// SVG route path connecting all 5 stops smoothly across the islands
const SVG_ROUTE =
  'M 205 318 C 240 370, 280 410, 332 410 C 375 410, 395 340, 425 304 C 475 250, 570 380, 675 360 C 720 350, 725 240, 708 174';

export function DreamDeliveryMap() {
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [manualSide, setManualSide] = useState<'auto' | 'left' | 'right'>('auto');
  const tourTimerRef = useRef<number | null>(null);

  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { playChime } = useSound(soundEnabled);

  const currentStop = DREAM_STOPS[selectedStopIndex];
  // Dynamically dock card on the left when stop is on the right (like Stop 5 castle) so no lantern is hidden
  const isCardOnLeft = manualSide === 'auto' ? currentStop.x > 50 : manualSide === 'left';

  // Handle selecting a lantern
  const handleSelectStop = (index: number) => {
    setSelectedStopIndex(index);
    setIsCardVisible(true);
    setManualSide('auto'); // auto-dodge to opposite side of selected lantern
    const stop = DREAM_STOPS[index];
    if (soundEnabled) {
      playChime(stop.chimeFreq);
    }
  };

  // Auto-tour through the lanterns
  useEffect(() => {
    if (!isTouring) {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
      return;
    }

    tourTimerRef.current = window.setInterval(() => {
      setSelectedStopIndex((prev) => {
        const next = (prev + 1) % DREAM_STOPS.length;
        if (soundEnabled) {
          playChime(DREAM_STOPS[next].chimeFreq);
        }
        return next;
      });
    }, 4200);

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [isTouring, soundEnabled, playChime]);

  const toggleTour = () => {
    setIsTouring((prev) => !prev);
    if (!isTouring && soundEnabled) {
      playChime(880);
    }
  };

  return (
    <div
      className="follow-the-lanterns-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'var(--font-story)',
        color: 'var(--body-text)',
      }}
    >
      {/* Header section matching reference layout */}
      <div style={{ marginBottom: 'clamp(1rem, 2vw, 1.5rem)' }}>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--accent)' }} />
          <span>DREAM DELIVERY ROUTES</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)',
            fontWeight: 700,
            color: 'var(--body-text)',
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Follow the Lanterns <span style={{ color: 'var(--accent)' }}>✦</span>
        </h2>

        <p
          style={{
            fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Click a lantern to follow a dream...
        </p>
      </div>

      {/* Main Map Canvas Area */}
      <div
        className="dream-map-viewport"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'clamp(1rem, 2vw, 1.5rem)',
          overflow: 'hidden',
          border: '2px solid var(--border-warm)',
          boxShadow: '0 16px 40px rgba(184, 115, 51, 0.12), 0 4px 12px rgba(0,0,0,0.06)',
          background: '#ebd5cb',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Background Artwork */}
        <img
          src="/assets/dream_delivery_map.jpg"
          alt="Magical floating islands in the clouds with dream cottages and fairy tale castle"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            filter: 'saturate(1.08) brightness(1.02)',
          }}
        />

        {/* Ambient Twilight Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(68, 38, 54, 0.28) 100%)',
          }}
        />

        {/* SVG Animated Glowing Dotted Trajectory */}
        <svg
          viewBox="0 0 1000 562.5"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <defs>
            <filter id="golden-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Golden glow backing line */}
          <path
            d={SVG_ROUTE}
            fill="none"
            stroke="rgba(251, 191, 36, 0.55)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#golden-glow)"
          />

          {/* Animated dashed trajectory */}
          <path
            d={SVG_ROUTE}
            className="animated-dream-route"
            fill="none"
            stroke="#fffbe8"
            strokeWidth="3.2"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Interactive Lantern Nodes on Map */}
        {DREAM_STOPS.map((stop, index) => {
          const isSelected = selectedStopIndex === index;
          return (
            <button
              key={stop.id}
              onClick={() => handleSelectStop(index)}
              title={`${stop.name} (Click to inspect)`}
              aria-label={`Lantern ${index + 1}: ${stop.name}`}
              className={`map-lantern-pin ${isSelected ? 'map-lantern-pin--active' : ''}`}
              style={{
                position: 'absolute',
                left: `${stop.x}%`,
                top: `${stop.y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: isSelected ? 8 : 4,
                outline: 'none',
              }}
            >
              {/* Outer warm glow bloom */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isSelected ? '54px' : '36px',
                  height: isSelected ? '54px' : '36px',
                  borderRadius: '50%',
                  background: isSelected
                    ? 'radial-gradient(circle, rgba(251, 191, 36, 0.85) 0%, rgba(245, 158, 11, 0.35) 50%, transparent 75%)'
                    : 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, transparent 70%)',
                  transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease',
                  pointerEvents: 'none',
                  filter: isSelected ? 'blur(3px)' : 'blur(2px)',
                  animation: 'lantern-pulse 2.4s ease-in-out infinite',
                }}
              />

              {/* Lantern Icon Box */}
              <div
                style={{
                  position: 'relative',
                  width: 'clamp(28px, 3.2vw, 36px)',
                  height: 'clamp(36px, 4.2vw, 46px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: isSelected
                    ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.95)) drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                }}
              >
                {/* SVG Lantern */}
                <svg
                  viewBox="0 0 32 42"
                  width="100%"
                  height="100%"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Cap & Hook */}
                  <path
                    d="M16 2 C12 2, 12 7, 16 7 C20 7, 20 2, 16 2 Z"
                    stroke="#5c3b28"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M8 8 L24 8 L22 13 L10 13 Z"
                    fill="#784729"
                    stroke="#422514"
                    strokeWidth="1.2"
                  />
                  {/* Glass pane with warm flame */}
                  <rect
                    x="9"
                    y="13"
                    width="14"
                    height="18"
                    rx="2"
                    fill={
                      isSelected
                        ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #fef08a 40%, #f59e0b 90%)'
                        : '#fed7aa'
                    }
                    stroke="#5c3b28"
                    strokeWidth="1.2"
                  />
                  {/* Amber flame core */}
                  <circle
                    cx="16"
                    cy="22"
                    r={isSelected ? 4.5 : 3.5}
                    fill="#fff"
                    filter="drop-shadow(0 0 4px #fbbf24)"
                  />
                  {/* Metal Base */}
                  <path
                    d="M7 31 L25 31 L23 37 L9 37 Z"
                    fill="#784729"
                    stroke="#422514"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Lantern number pill badge */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isSelected ? 'var(--vintage-berry)' : 'rgba(40, 24, 30, 0.85)',
                  color: '#fff',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  border: isSelected
                    ? '1px solid rgba(251, 191, 36, 0.8)'
                    : '1px solid rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                0{index + 1}
              </span>
            </button>
          );
        })}

        {/* Animated Flying Pip Miniature gliding to active stop */}
        <motion.div
          animate={
            prefersReduced
              ? { left: `${currentStop.x}%`, top: `${currentStop.y}%` }
              : {
                  left: `${currentStop.x - 3.8}%`,
                  top: `${currentStop.y - 7.5}%`,
                }
          }
          transition={{
            type: 'spring',
            stiffness: 65,
            damping: 13,
            mass: 0.9,
          }}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 9,
            width: 'clamp(44px, 5.2vw, 68px)',
            height: 'clamp(44px, 5.2vw, 68px)',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Gentle float bob */}
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: prefersReduced ? 'none' : 'pip-gentle-bob 3.2s ease-in-out infinite',
              position: 'relative',
            }}
          >
            {/* Pip glowing lantern aura */}
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 75%)',
                filter: 'blur(8px)',
              }}
            />

            <img
              src="/assets/pip_interactive_character.png"
              alt="Pip delivering dream"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  'drop-shadow(0 6px 12px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
              }}
            />
          </div>
        </motion.div>

        {/* Floating Story Card with Adaptive Docking (prevents covering Stop 5 and the castle) */}
        <AnimatePresence mode="wait">
          {isCardVisible && (
            <motion.div
              key={`${currentStop.id}-${isCardOnLeft ? 'left' : 'right'}`}
              initial={{ opacity: 0, x: isCardOnLeft ? -25 : 25, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isCardOnLeft ? -25 : 25, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="dream-floating-card"
              style={{
                position: 'absolute',
                top: 'clamp(12px, 3%, 22px)',
                left: isCardOnLeft ? 'clamp(12px, 3%, 24px)' : 'auto',
                right: isCardOnLeft ? 'auto' : 'clamp(12px, 3%, 24px)',
                width: 'clamp(240px, 28vw, 320px)',
                background: 'rgba(255, 252, 246, 0.94)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                borderRadius: 'clamp(1rem, 1.8vw, 1.35rem)',
                boxShadow:
                  '0 20px 40px rgba(50, 28, 38, 0.22), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 1px #fff',
                padding: 'clamp(12px, 1.4vw, 16px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 1vw, 12px)',
              }}
            >
              {/* Card Header Thumbnail with Close & Dock Flip Buttons */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 'clamp(0.6rem, 1.2vw, 0.85rem)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                }}
              >
                <img
                  src={currentStop.image}
                  alt={currentStop.title}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Flip Dock Side Button */}
                <button
                  onClick={() => setManualSide(isCardOnLeft ? 'right' : 'left')}
                  title={`Move card to ${isCardOnLeft ? 'right' : 'left'} side`}
                  aria-label="Dock card on other side"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '38px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(20, 14, 24, 0.65)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    transition: 'transform 0.18s, background 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = 'rgba(20, 14, 24, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(20, 14, 24, 0.65)';
                  }}
                >
                  ⇄
                </button>

                {/* Close Button in top right */}
                <button
                  onClick={() => setIsCardVisible(false)}
                  title="Close card"
                  aria-label="Close dream card"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(20, 14, 24, 0.65)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, background 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = 'rgba(20, 14, 24, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(20, 14, 24, 0.65)';
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Title & Lore */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                    fontWeight: 700,
                    color: 'var(--body-text)',
                    margin: '0 0 4px',
                    lineHeight: 1.2,
                  }}
                >
                  {currentStop.title}
                </h3>
                <p
                  style={{
                    fontSize: 'clamp(0.78rem, 1vw, 0.86rem)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {currentStop.description}
                </p>
              </div>

              {/* View Dream Button */}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  if (soundEnabled) playChime(currentStop.chimeFreq);
                }}
                className="view-dream-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'var(--vintage-berry)',
                  color: '#fff',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(0.78rem, 0.95vw, 0.86rem)',
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(163, 64, 99, 0.28)',
                  transition: 'transform 0.18s, background 0.18s, box-shadow 0.18s',
                  width: 'fit-content',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(163, 64, 99, 0.38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 64, 99, 0.28)';
                }}
              >
                <span>View Dream</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Re-open card pill button if card was closed */}
        {!isCardVisible && (
          <button
            onClick={() => setIsCardVisible(true)}
            style={{
              position: 'absolute',
              top: '16px',
              left: isCardOnLeft ? '16px' : 'auto',
              right: isCardOnLeft ? 'auto' : '16px',
              background: 'rgba(255, 252, 246, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.8)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: 'var(--body-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            <BookOpen size={13} style={{ color: 'var(--accent)' }} />
            <span>Open Dream Card</span>
          </button>
        )}

        {/* Bottom Bar: Back to Projects & Auto Tour Toggle */}
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(10px, 2.5%, 18px)',
            left: isCardOnLeft ? 'auto' : 'clamp(10px, 2.5%, 18px)',
            right: isCardOnLeft ? 'clamp(10px, 2.5%, 18px)' : 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            transition: 'left 0.35s ease, right 0.35s ease',
          }}
        >
          {/* Back to Projects button matching reference */}
          <a
            href="#work"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 252, 246, 0.88)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.74rem, 0.9vw, 0.82rem)',
              fontWeight: 600,
              color: 'var(--body-text)',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.18s, background 0.18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 252, 246, 0.88)';
            }}
          >
            <ArrowLeft size={13} />
            <span>Back to Projects</span>
          </a>

          {/* Auto Tour Toggle */}
          <button
            onClick={toggleTour}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isTouring ? 'var(--vintage-berry)' : 'rgba(255, 252, 246, 0.88)',
              color: isTouring ? '#ffffff' : 'var(--body-text)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.74rem, 0.9vw, 0.82rem)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.18s ease',
            }}
          >
            {isTouring ? <Pause size={12} /> : <Play size={12} />}
            <span>{isTouring ? 'Pause Tour' : 'Auto Tour Route ✦'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Dream Reader Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dream-modal-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-4)',
              background: 'rgba(20, 14, 24, 0.72)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '560px',
                background: 'var(--surface-panel)',
                border: '2px solid var(--border-warm)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Modal Banner Image */}
              <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                <img
                  src={currentStop.image}
                  alt={currentStop.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(20, 14, 24, 0.75)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 'var(--sp-6)' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.78rem',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {currentStop.tagline}
                </div>

                <h3
                  id="dream-modal-title"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    color: 'var(--body-text)',
                    marginBottom: 'var(--sp-3)',
                  }}
                >
                  {currentStop.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.96rem',
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                    marginBottom: 'var(--sp-5)',
                  }}
                >
                  {currentStop.fullStory}
                </p>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: 'var(--sp-4)',
                    borderTop: '1px solid var(--border-warm)',
                  }}
                >
                  <button
                    onClick={() => {
                      if (soundEnabled) playChime(currentStop.chimeFreq);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-pill)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={15} />
                    <span>Play Destination Chime</span>
                  </button>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: 'var(--vintage-berry)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-pill)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Close Dream Log
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scoped CSS Keyframes */}
      <style>{`
        @keyframes lantern-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50% { transform: translate(-50%, -50%) scale(1.22); opacity: 1; }
        }

        @keyframes pip-gentle-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-1.5deg); }
        }

        .animated-dream-route {
          stroke-dashoffset: 0;
          animation: route-travel 30s linear infinite;
        }

        @keyframes route-travel {
          to {
            stroke-dashoffset: -280;
          }
        }

        .map-lantern-pin:hover > div:nth-child(2) {
          transform: scale(1.28) !important;
        }

        [data-theme='dream'] .dream-floating-card {
          background: rgba(28, 18, 38, 0.88) !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
          color: #fff8f1 !important;
          box-shadow: 0 20px 45px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.15) !important;
        }

        [data-theme='dream'] .dream-floating-card h3 {
          color: #fff8f1 !important;
        }

        [data-theme='dream'] .dream-floating-card p {
          color: rgba(255, 248, 241, 0.8) !important;
        }
      `}</style>
    </div>
  );
}

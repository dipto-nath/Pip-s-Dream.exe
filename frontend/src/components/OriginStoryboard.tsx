// =============================================================
// PIP.EXE — OriginStoryboard
// Interactive vertically-unfolding story with scene progress
// =============================================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { STORY_SCENES } from '../lib/dreamContent';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function OriginStoryboard() {
  const [activeScene, setActiveScene] = useState(0);
  const prefersReduced = useReducedMotionPreference();
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sceneRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveScene(i);
          }
        },
        { threshold: 0.5 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      style={{
        padding: 'clamp(3rem, 5vw, 5rem) 0',
        background: 'var(--surface-muted)',
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
          <span className="section-eyebrow">Origin Story · Five Chapters</span>
          <h2 id="story-heading" style={{ fontStyle: 'italic' }}>
            How Pip Began
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '0 var(--sp-8)',
          }}
          className="story-grid"
        >
          {/* Progress column */}
          <div
            aria-hidden="true"
            style={{
              position: 'relative',
              paddingTop: 'var(--sp-3)',
            }}
          >
            {/* Vertical line */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 2,
                background: `linear-gradient(to bottom, var(--accent), var(--amber))`,
                transform: 'translateX(-50%)',
                opacity: 0.3,
              }}
            />
            {STORY_SCENES.map((scene, i) => (
              <div
                key={scene.id}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 'clamp(3rem, 6vw, 6rem)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: i === activeScene
                      ? 'var(--accent)'
                      : i < activeScene
                        ? 'var(--amber)'
                        : 'var(--surface-inset)',
                    border: `2px solid ${i <= activeScene ? 'var(--accent)' : 'var(--border-warm)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'background 0.4s, border-color 0.4s',
                    boxShadow: i === activeScene
                      ? '0 0 12px rgba(163,64,99,0.4)'
                      : 'none',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {scene.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Scenes column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 6rem)' }}>
            {STORY_SCENES.map((scene, i) => (
              <motion.div
                key={scene.id}
                ref={(el) => { sceneRefs.current[i] = el; }}
                initial={prefersReduced ? false : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.05 }}
                style={{
                  background: i === activeScene
                    ? 'var(--surface-panel)'
                    : 'var(--surface)',
                  border: `2px solid ${i === activeScene ? 'var(--accent)' : 'var(--border-warm)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--sp-6)',
                  transition: 'border-color 0.4s, background 0.4s, box-shadow 0.4s',
                  boxShadow: i === activeScene
                    ? '0 4px 24px rgba(163,64,99,0.12), 3px 3px 0 var(--shadow-warm)'
                    : '2px 2px 0 var(--shadow-warm)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 'var(--sp-2)',
                  }}
                >
                  Chapter {String(scene.chapter).padStart(2, '0')}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                    marginBottom: 'var(--sp-4)',
                    color: i === activeScene ? 'var(--accent)' : 'var(--body-text)',
                    transition: 'color 0.4s',
                    fontStyle: 'italic',
                  }}
                >
                  {scene.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-story)',
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--body-text)',
                    lineHeight: 1.8,
                    maxWidth: '68ch',
                  }}
                >
                  {scene.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .story-grid { grid-template-columns: 44px 1fr !important; gap: 0 1rem !important; }
        }
      `}</style>
    </section>
  );
}

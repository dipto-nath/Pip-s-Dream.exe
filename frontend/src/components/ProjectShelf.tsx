// =============================================================
// PIP.EXE — ProjectShelf
// Layout for all three portfolio projects
// =============================================================

import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { PROJECTS } from '../lib/dreamContent';
import { LullabyLab } from './LullabyLab';
import { NightlightCollection } from './NightlightCollection';
import { DreamDeliveryMap } from './DreamDeliveryMap';

interface ProjectShelfProps {
  chaosMode: boolean;
}

const PROJECT_COLORS = ['var(--vintage-berry)', 'var(--glow-amber)', '#7a6a3a'];

export function ProjectShelf({ chaosMode }: ProjectShelfProps) {
  const prefersReduced = useReducedMotionPreference();

  const projectComponents: Record<string, React.ReactElement> = {
    'project-lullaby': <LullabyLab />,
    'project-nightlight': <NightlightCollection />,
    'project-map': <DreamDeliveryMap />,
  };

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      style={{
        padding: 'clamp(3rem, 5vw, 5rem) 0',
        background: 'var(--surface)',
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 4rem)', maxWidth: '60ch' }}>
          <span className="section-eyebrow">Portfolio · Three Projects</span>
          <h2
            id="work-heading"
            className={chaosMode ? 'section-title-chaos' : ''}
            style={{ marginBottom: 'var(--sp-4)' }}
          >
            Pip's Dream Inventions
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-story)',
              color: 'var(--text-muted)',
              fontSize: '1rem',
            }}
          >
            Three real, working instruments built in the Midnight Nursery.
            Each one is a small machine for making the world a little quieter.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
          }}
        >
          {PROJECTS.map((project, i) => {
            const isMapProject = project.id === 'project-map';

            const cardBody = (
              <>
                {/* Project header bar */}
                <div
                  style={{
                    background: PROJECT_COLORS[i],
                    padding: 'var(--sp-3) var(--sp-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--sp-3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.3)',
                        lineHeight: 1,
                      }}
                    >
                      {project.number}
                    </span>
                    <div>
                      <h3
                        id={`project-title-${project.id}`}
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: '#fff8f1',
                          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                          marginBottom: 0,
                        }}
                      >
                        {project.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'var(--font-story)',
                          fontStyle: 'italic',
                          fontSize: '0.82rem',
                          color: 'rgba(255,248,241,0.75)',
                          margin: 0,
                        }}
                      >
                        {project.tagline}
                      </p>
                    </div>
                  </div>

                  {chaosMode && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 600,
                      }}
                    >
                      ✦ LIVE DEMO ✦
                    </span>
                  )}
                </div>

                {/* Project body */}
                <div
                  className="project-card-body"
                  style={{
                    padding: 'var(--sp-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-5)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-story)',
                      color: 'var(--text-muted)',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      maxWidth: '70ch',
                    }}
                  >
                    {project.description}
                  </p>
                  {/* Interactive component */}
                  <div
                    className="project-card-component-box"
                    style={{
                      background: 'var(--surface)',
                      border: '1px dashed var(--border-warm)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--sp-5)',
                    }}
                  >
                    {projectComponents[project.id]}
                  </div>
                </div>
              </>
            );

            if (isMapProject) {
              return (
                <article
                  key={project.id}
                  className={`project-card ${chaosMode ? '' : ''}`}
                  aria-labelledby={`project-title-${project.id}`}
                  style={{
                    background: 'var(--surface-panel)',
                    border: '2px solid var(--border-warm)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'visible',
                    boxShadow: chaosMode
                      ? '5px 5px 0 var(--shadow-warm), 8px 8px 0 var(--border-warm)'
                      : '3px 3px 0 var(--shadow-warm)',
                    transition: 'box-shadow 0.25s, transform 0.25s',
                    position: 'relative',
                  }}
                >
                  {/* Project header bar */}
                  <div
                    style={{
                      background: PROJECT_COLORS[i],
                      padding: 'var(--sp-3) var(--sp-6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--sp-3)',
                      borderTopLeftRadius: 'calc(var(--radius-lg) - 2px)',
                      borderTopRightRadius: 'calc(var(--radius-lg) - 2px)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.3)',
                          lineHeight: 1,
                        }}
                      >
                        {project.number}
                      </span>
                      <div>
                        <h3
                          id={`project-title-${project.id}`}
                          style={{
                            fontFamily: 'var(--font-display)',
                            color: '#fff8f1',
                            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                            marginBottom: 0,
                          }}
                        >
                          {project.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: 'var(--font-story)',
                            fontStyle: 'italic',
                            fontSize: '0.82rem',
                            color: 'rgba(255,248,241,0.75)',
                            margin: 0,
                          }}
                        >
                          {project.tagline}
                        </p>
                      </div>
                    </div>

                    {chaosMode && (
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.7rem',
                          background: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontWeight: 600,
                        }}
                      >
                        ✦ LIVE DEMO ✦
                      </span>
                    )}
                  </div>

                  {/* Project body */}
                  <div
                    className="project-card-body"
                    style={{
                      padding: 'clamp(1rem, 2vw, var(--sp-6))',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-5)',
                      overflow: 'visible',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-story)',
                        color: 'var(--text-muted)',
                        fontSize: '0.92rem',
                        lineHeight: 1.7,
                        maxWidth: '70ch',
                      }}
                    >
                      {project.description}
                    </p>

                    {/* Interactive component sticky track */}
                    <div
                      className="project-map-sticky-track"
                      style={{
                        height: 'clamp(2600px, 320vh, 3400px)',
                        position: 'relative',
                        width: '100%',
                      }}
                    >
                      <div
                        className="project-card-component-box project-map-sticky-box"
                        style={{
                          position: 'sticky',
                          top: 'clamp(58px, 8vh, 74px)',
                          background: 'var(--surface)',
                          border: '1px dashed var(--border-warm)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'clamp(0.6rem, 1.6vw, var(--sp-5))',
                          boxShadow: '0 8px 24px var(--control-shadow)',
                          zIndex: 20,
                        }}
                      >
                        {projectComponents[project.id]}
                      </div>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <motion.article
                key={project.id}
                className={`project-card ${chaosMode ? '' : ''}`}
                initial={prefersReduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                aria-labelledby={`project-title-${project.id}`}
                style={{
                  background: 'var(--surface-panel)',
                  border: '2px solid var(--border-warm)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: chaosMode
                    ? '5px 5px 0 var(--shadow-warm), 8px 8px 0 var(--border-warm)'
                    : '3px 3px 0 var(--shadow-warm)',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {cardBody}
              </motion.article>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .project-card-body {
            padding: clamp(0.75rem, 3.5vw, 1.25rem) !important;
            gap: var(--sp-3) !important;
          }
          .project-card-component-box {
            padding: clamp(0.5rem, 2.5vw, 0.85rem) !important;
          }
        }
      `}</style>
    </section>
  );
}

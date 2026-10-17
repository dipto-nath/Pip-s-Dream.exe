// =============================================================
// PIP.EXE — DreamGuestbook
// Retro guestbook wall with backend persistence + local fallback
// =============================================================

import { useState, useRef, useId, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Send } from 'lucide-react';
import { fetchGuestbookEntries, submitGuestbookEntry, GUESTBOOK_LIMITS } from '../lib/guestbookService';
import type { GuestbookEntry } from '../lib/guestbookService';
import { loadEntries } from '../lib/guestbookStorage';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';

const NOTE_ROTATIONS = ['-1deg', '1.5deg', '-0.5deg', '2deg', '-1.8deg', '0.8deg'];
const NOTE_BG = [
  'var(--guestbook-paper)',
  'var(--surface-panel)',
  'var(--surface-muted)',
];

export function DreamGuestbook() {
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { playChime } = useSound(soundEnabled);
  const statusRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    // Hydrate from localStorage immediately for offline-first UX
    try { return loadEntries(); }
    catch { return []; }
  });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [msgError, setMsgError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch entries from the backend on mount
  useEffect(() => {
    let mounted = true;
    fetchGuestbookEntries().then((result) => {
      if (!mounted) return;
      setEntries(result.entries);
      setBackendOnline(result.isOnline);
      setEntriesLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  function validate(): boolean {
    let valid = true;
    const trimName = name.trim();
    const trimMsg = message.trim();

    if (!trimName) {
      setNameError('Please enter your name.');
      valid = false;
    } else if (trimName.length > GUESTBOOK_LIMITS.maxNameLength) {
      setNameError(`Name must be ${GUESTBOOK_LIMITS.maxNameLength} characters or fewer.`);
      valid = false;
    } else {
      setNameError('');
    }

    if (!trimMsg) {
      setMsgError('Please write a dream message.');
      valid = false;
    } else if (trimMsg.length > GUESTBOOK_LIMITS.maxMessageLength) {
      setMsgError(`Message must be ${GUESTBOOK_LIMITS.maxMessageLength} characters or fewer.`);
      valid = false;
    } else {
      setMsgError('');
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const result = await submitGuestbookEntry(name, message);

    if (result.success && result.entry) {
      // Prepend the new entry optimistically
      setEntries((prev) => [result.entry!, ...prev]);
      setName('');
      setMessage('');
      setNameError('');
      setMsgError('');

      if (result.isLocalFallback) {
        setBackendOnline(false);
        setSuccessMsg('Your message is saved locally (offline mode) ⚠️');
      } else {
        setBackendOnline(true);
        setSuccessMsg('Your dream message has been pinned to the nursery wall! ⭐');
      }

      playChime(1046);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else if (result.error) {
      if (result.error.type === 'validation') {
        // Map backend validation errors to inline field errors
        if (result.error.message.toLowerCase().includes('name')) {
          setNameError(result.error.message);
        } else if (result.error.message.toLowerCase().includes('mess')) {
          setMsgError(result.error.message);
        } else {
          setSubmitError(result.error.message);
        }
      } else if (result.error.type === 'rate_limit') {
        setSubmitError(result.error.message);
      } else {
        setSubmitError(result.error.message);
        setBackendOnline(false);
      }
    }

    setIsSubmitting(false);
  }

  return (
    <section
      id="guestbook"
      aria-labelledby="guestbook-heading"
      style={{
        padding: 'clamp(3rem, 5vw, 5rem) 0',
        background: 'var(--surface)',
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <span className="section-eyebrow">Nursery Noticeboard</span>
          <h2 id="guestbook-heading" style={{ fontStyle: 'italic' }}>
            Dream Guestbook
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-story)',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              marginTop: 'var(--sp-3)',
              maxWidth: '55ch',
            }}
          >
            Leave a dream message for Pip. It will be pinned to the nursery noticeboard
            until you visit again.{' '}
            {backendOnline === true ? (
              <em style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                ✦ Connected to the nursery server — messages are shared with other visitors.
              </em>
            ) : backendOnline === false ? (
              <em style={{ color: 'var(--vintage-berry)', fontSize: '0.85rem' }}>
                ⚠ Offline mode — messages are saved in your browser only, not synced with the server.
              </em>
            ) : null}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 380px) 1fr',
            gap: 'clamp(2rem, 4vw, 4rem)',
            alignItems: 'start',
          }}
          className="guestbook-grid"
        >
          {/* ── Form ── */}
          <div className="retro-window" style={{ flexShrink: 0 }}>
            <div className="retro-window__titlebar">
              <div className="retro-window__dots">
                <span className="retro-window__dot retro-window__dot--red" />
                <span className="retro-window__dot retro-window__dot--amber" />
                <span className="retro-window__dot retro-window__dot--green" />
              </div>
              <span>
                <PenLine size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Sign the Guestbook
              </span>
            </div>
            <div className="retro-window__body">
              <form onSubmit={handleSubmit} noValidate aria-label="Dream guestbook sign form">
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label
                    htmlFor={`${formId}-name`}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--sp-2)',
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(''); }}
                    maxLength={GUESTBOOK_LIMITS.maxNameLength}
                    placeholder="e.g. Pip's neighbor"
                    autoComplete="off"
                    aria-describedby={nameError ? `${formId}-name-err` : undefined}
                    aria-invalid={!!nameError}
                    style={{
                      width: '100%',
                      padding: 'var(--sp-3)',
                      background: 'var(--surface)',
                      border: `2px solid ${nameError ? 'var(--vintage-berry)' : 'var(--border-warm)'}`,
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-story)',
                      fontSize: '0.92rem',
                      color: 'var(--body-text)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => {
                      if (!nameError) (e.target as HTMLInputElement).style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      if (!nameError) (e.target as HTMLInputElement).style.borderColor = 'var(--border-warm)';
                    }}
                  />
                  {nameError && (
                    <p
                      id={`${formId}-name-err`}
                      role="alert"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.78rem',
                        color: 'var(--vintage-berry)',
                        marginTop: 4,
                      }}
                    >
                      {nameError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--sp-5)' }}>
                  <label
                    htmlFor={`${formId}-message`}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--sp-2)',
                    }}
                  >
                    Dream Message
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setMsgError(''); }}
                    maxLength={GUESTBOOK_LIMITS.maxMessageLength}
                    rows={4}
                    placeholder="What dream would you like Pip to deliver tonight?"
                    aria-describedby={msgError ? `${formId}-msg-err` : `${formId}-msg-hint`}
                    aria-invalid={!!msgError}
                    style={{
                      width: '100%',
                      padding: 'var(--sp-3)',
                      background: 'var(--surface)',
                      border: `2px solid ${msgError ? 'var(--vintage-berry)' : 'var(--border-warm)'}`,
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-story)',
                      fontSize: '0.92rem',
                      color: 'var(--body-text)',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      minHeight: '90px',
                    }}
                    onFocus={(e) => {
                      if (!msgError) (e.target as HTMLTextAreaElement).style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      if (!msgError) (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-warm)';
                    }}
                  />
                  <div
                    id={`${formId}-msg-hint`}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.72rem',
                      color: message.length > GUESTBOOK_LIMITS.maxMessageLength * 0.85
                        ? 'var(--vintage-berry)'
                        : 'var(--text-faint)',
                      textAlign: 'right',
                      marginTop: 2,
                    }}
                  >
                    {message.length}/{GUESTBOOK_LIMITS.maxMessageLength}
                  </div>
                  {msgError && (
                    <p
                      id={`${formId}-msg-err`}
                      role="alert"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.78rem',
                        color: 'var(--vintage-berry)',
                        marginTop: 4,
                      }}
                    >
                      {msgError}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  <Send size={14} />
                  {isSubmitting ? 'Pinning…' : 'Pin to the Board'}
                </button>
              </form>

              {/* Live status region */}
              <div
                ref={statusRef}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{
                  marginTop: successMsg ? 'var(--sp-4)' : 0,
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  color: 'var(--accent)',
                  minHeight: successMsg ? '1.4em' : 0,
                  transition: 'min-height 0.3s',
                }}
              >
                {successMsg}
              </div>
              {submitError && (
                <div
                  role="alert"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.82rem',
                    color: 'var(--vintage-berry)',
                    marginTop: 'var(--sp-2)',
                  }}
                >
                  {submitError}
                </div>
              )}
            </div>
          </div>

          {/* ── Message wall ── */}
          <div>
            {entriesLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--sp-12) var(--sp-8)',
                  fontFamily: 'var(--font-story)',
                  fontSize: '1rem',
                  color: 'var(--text-faint)',
                }}
              >
                Fetching dream messages from the nursery…
              </div>
            ) : entries.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--sp-12) var(--sp-8)',
                  background: 'var(--surface-panel)',
                  border: '2px dashed var(--border-warm)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-faint)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>📌</div>
                <p
                  style={{
                    fontFamily: 'var(--font-story)',
                    fontStyle: 'italic',
                    fontSize: '1rem',
                  }}
                >
                  The noticeboard is empty.
                  <br />
                  Be the first to leave a dream message for Pip.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 'var(--sp-4)',
                  padding: 'var(--sp-2)',
                }}
                aria-label={`${entries.length} guestbook ${entries.length === 1 ? 'entry' : 'entries'}`}
              >
                <AnimatePresence initial={false}>
                  {entries.map((entry, i) => {
                    const rotation = NOTE_ROTATIONS[i % NOTE_ROTATIONS.length];
                    const bg = NOTE_BG[i % NOTE_BG.length];
                    return (
                      <motion.article
                        key={entry.id}
                        initial={prefersReduced ? false : { opacity: 0, scale: 0.85, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        aria-label={`Message from ${entry.name}`}
                        style={{
                          background: bg,
                          border: '2px solid var(--border-warm)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--sp-4)',
                          transform: `rotate(${rotation})`,
                          boxShadow: '2px 3px 8px var(--shadow-warm)',
                          position: 'relative',
                        }}
                      >
                        {/* Pin decoration */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            top: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            border: '2px solid var(--border-strong)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          }}
                        />

                        <p
                          style={{
                            fontFamily: 'var(--font-story)',
                            fontStyle: 'italic',
                            fontSize: '0.88rem',
                            color: 'var(--body-text)',
                            lineHeight: 1.65,
                            marginBottom: 'var(--sp-3)',
                            wordBreak: 'break-word',
                          }}
                        >
                          "{entry.message}"
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--accent)',
                            }}
                          >
                            — {entry.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.68rem',
                              color: 'var(--text-faint)',
                            }}
                          >
                            {entry.dateDisplay}
                          </span>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .guestbook-grid { grid-template-columns: 1fr !important; }
          .guestbook-grid > div:first-child { min-width: 0; }
        }
      `}</style>
    </section>
  );
}

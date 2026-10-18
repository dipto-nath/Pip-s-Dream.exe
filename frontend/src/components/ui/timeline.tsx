// Built using Hyperiux Vault & Adapted for Pip's Dream
"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Stand-in for @gsap/react's useGSAP. Safely creates and reverts gsap.context */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const monthOrder = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
} as const;

export type Month = keyof typeof monthOrder;

export type JourneyItem = {
  id: string;
  year: string;
  month: Month;
  content: string;
  chapterTitle?: string;
  badge?: string;
};

export type TimelineProps = {
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  topData?: JourneyItem[];
  bottomData?: JourneyItem[];
  /** Reveal animation duration, in seconds. */
  duration?: number;
  /** Fallback reveal duration when `duration` is omitted, in seconds. */
  scrollDuration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);

  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;

  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

// Pip's Origin Story chapters
const defaultTopJourneyData: JourneyItem[] = [
  {
    id: "pip-ch1",
    year: "Chapter 01",
    month: "March",
    chapterTitle: "The Little Star",
    badge: "⭐",
    content:
      "One sleepy evening, a small fallen star drifted through an open window and landed in a porcelain teacup. By morning, its soft warmth became the quiet starlight living in Pip's eyes.",
  },
  {
    id: "pip-ch3",
    year: "Chapter 03",
    month: "July",
    chapterTitle: "The First Invention",
    badge: "🎵",
    content:
      "With a borrowed music box, bits of moonlight, a dented thimble, and extraordinary trial and error, Pip tuned the very first dream instrument. The neighborhood grew peacefully quiet.",
  },
  {
    id: "pip-ch5",
    year: "Chapter 05",
    month: "December",
    chapterTitle: "The Next Little Dream",
    badge: "💻",
    content:
      "The old nursery computer remains awake long after midnight. Every visitor brings a new bedtime possibility, with hidden notes waiting for curious dreamers who explore.",
  },
];

const defaultBottomJourneyData: JourneyItem[] = [
  {
    id: "pip-ch2",
    year: "Chapter 02",
    month: "November",
    chapterTitle: "The Quiet Little Problem",
    badge: "🌙",
    content:
      "The neighborhood creatures were having restless nights. Their dreams came out repetitive and grey — the same three clouds, the same fence. Pip decided something had to be done.",
  },
  {
    id: "pip-ch4",
    year: "Chapter 04",
    month: "September",
    chapterTitle: "Rooftop Delivery School",
    badge: "🏠",
    content:
      "Pip drew chimney routes on nursery paper, delivering custom bedtime adventures: cloud castles for the restless, quiet seas for the anxious, and talking teacups for the lonely.",
  },
];

export default function Timeline({
  title = "How Pip Began",
  periodLabel = "Origin Story · Five Chapters",
  textColor = "var(--body-text, #261b23)",
  activeColor = "var(--accent, #e25555)",
  backgroundColor = "var(--surface-muted, #f7f1e8)",
  imageUrl = "/assets/pip_portrait.png",
  imageAlt = "Pip looking out from the nursery",
  topData = defaultTopJourneyData,
  bottomData = defaultBottomJourneyData,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const sectionStyle: CSSProperties = {
    color: textColor,
    backgroundColor,
  };
  const activeStyle: CSSProperties = {
    backgroundColor: activeColor,
  };

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = wholeSliderRef.current;
    if (!section || !slider) return;

    if (reducedMotion) {
      // In reduced motion, ensure all stems, dots, and lines are 100% visible
      gsap.set(".journey-line-progress", { width: "100%" });
      gsap.set(".stem-line", { scaleY: 1 });
      gsap.set(".stem-dot", { scale: 1 });
      gsap.set(".chapter-card", { opacity: 1 });
      return;
    }

    // Measure total horizontal scroll distance
    const getScrollDistance = () => {
      const scrollWidth = slider.scrollWidth;
      const clientWidth = window.innerWidth;
      return Math.max(400, scrollWidth - clientWidth + 120);
    };

    // Pin the section with GSAP ScrollTrigger and scrub the horizontal slider
    const scrollDistance = getScrollDistance();

    const horizontalTween = gsap.to(slider, {
      x: () => -getScrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: "top top",
        end: () => `+=${scrollDistance * 1.3}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.min(100, Math.max(12, self.progress * 100))}%`;
          }
        },
      },
    });

    // Animate stems and cards as they enter into the active reading zone
    const allCards = section.querySelectorAll<HTMLElement>(".chapter-card");
    allCards.forEach((card) => {
      const stemLine = card.querySelector<HTMLElement>(".stem-line");
      const stemDot = card.querySelector<HTMLElement>(".stem-dot");

      gsap.fromTo(
        card,
        { opacity: 0.5, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontalTween,
            start: "left 85%",
            end: "left 40%",
            scrub: true,
          },
        }
      );

      if (stemLine) {
        gsap.fromTo(
          stemLine,
          { scaleY: 0.2 },
          {
            scaleY: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 90%",
              end: "left 50%",
              scrub: true,
            },
          }
        );
      }

      if (stemDot) {
        gsap.fromTo(
          stemDot,
          { scale: 0.5 },
          {
            scale: 1.2,
            duration: 0.4,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 90%",
              end: "left 50%",
              scrub: true,
            },
          }
        );
      }
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, { dependencies: [reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative w-full h-screen overflow-hidden flex flex-col justify-center"
      style={sectionStyle}
    >
      {/* Top ambient track indicator */}
      <div className="absolute top-4 left-8 right-8 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 rounded-full animate-ping" style={activeStyle} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
            Chronicle Rail · Scroll Down to Travel
          </span>
        </div>
        <div className="font-mono text-xs text-[var(--text-muted)] bg-[var(--surface-panel)] px-3 py-1 rounded-full border border-[var(--border-warm)] shadow-xs">
          {periodLabel}
        </div>
      </div>

      <div className="relative w-full h-[85vh] max-h-[760px] flex items-center overflow-visible">
        <div
          ref={wholeSliderRef}
          className="flex h-full items-center gap-[4vw] px-[4vw] flex-nowrap will-change-transform"
        >
          {/* ========================================================= */}
          {/* LEAD STORY CARD                                           */}
          {/* ========================================================= */}
          <div className="w-[380px] max-w-[85vw] h-[82%] flex-shrink-0 rounded-[var(--radius-xl)] bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] shadow-[var(--shadow-warm)] p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Top Eyebrow & Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⭐</span>
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Origin Chronicle
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold italic tracking-tight text-[var(--body-text)] mb-3 leading-tight">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-story">
                Follow Pip&apos;s journey from a fallen star in a teacup to cloud castles across sleeping rooftops.
              </p>
            </div>

            {/* Pip Portrait Visual */}
            <div className="relative w-full h-[48%] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-warm)] shadow-inner my-3">
              <img
                src={imageUrl}
                alt={imageAlt}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,17,25,0.7)] via-transparent to-transparent flex items-end p-3">
                <span className="font-mono text-[11px] text-[#ffdd55] uppercase tracking-wider font-semibold">
                  Midnight Nursery Archive
                </span>
              </div>
            </div>

            {/* Bottom Scroll Cue */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-warm)] text-xs font-mono text-[var(--text-muted)]">
              <span>5 Chapters</span>
              <span className="text-[var(--accent)] flex items-center gap-1 font-semibold animate-pulse">
                Scroll &rarr;
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TIMELINE BRANCHES & TRACK RAIL                            */}
          {/* ========================================================= */}
          <div className="relative h-full flex flex-col justify-between py-2 min-w-[1600px] lg:min-w-[2100px]">
            {/* Continuous Center Track Rail */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] bg-[var(--border-warm)] z-10 pointer-events-none rounded-full"
              aria-hidden="true"
            >
              {/* Active Glowing Progress Rail */}
              <div
                ref={progressBarRef}
                className="journey-line-progress h-full w-[16%] rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(226,85,85,0.6)]"
                style={activeStyle}
              />
            </div>

            {/* ======================================================= */}
            {/* TOP BRANCH (Chapters 1, 3, 5)                           */}
            {/* ======================================================= */}
            <div className="flex items-end justify-start gap-[10vw] pb-10 h-[46%]">
              {topData.map((item, idx) => (
                <div
                  key={`top-${item.id}`}
                  className="chapter-card relative w-[340px] sm:w-[380px] flex-shrink-0 flex flex-col justify-end"
                  style={{ marginLeft: idx === 0 ? "2vw" : "0" }}
                >
                  {/* Chapter Content Card */}
                  <div className="bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] rounded-[var(--radius-lg)] p-5 shadow-[2px_2px_0_var(--shadow-warm)] hover:border-[var(--accent)] transition-colors">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-warm)]">
                      <div className="flex items-center gap-2">
                        {item.badge && <span className="text-xl">{item.badge}</span>}
                        <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--accent)]">
                          {item.year}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.month}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold italic text-[var(--body-text)] mb-2">
                      {item.chapterTitle}
                    </h3>

                    <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text-muted)] font-story">
                      {item.content}
                    </p>
                  </div>

                  {/* Stem & Dot connecting to central track */}
                  <div
                    className="relative w-full flex flex-col items-center pt-2 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div
                      className="stem-line w-[2px] h-[36px] bg-[var(--accent)] origin-top rounded-full"
                      style={activeStyle}
                    />
                    <div
                      className="stem-dot size-3.5 rounded-full border-2 border-[var(--surface-panel)] shadow-sm -mt-1.5 z-20"
                      style={activeStyle}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ======================================================= */}
            {/* BOTTOM BRANCH (Chapters 2, 4)                           */}
            {/* ======================================================= */}
            <div className="flex items-start justify-start gap-[14vw] pt-10 h-[46%] ml-[16vw]">
              {bottomData.map((item) => (
                <div
                  key={`bottom-${item.id}`}
                  className="chapter-card relative w-[340px] sm:w-[380px] flex-shrink-0 flex flex-col justify-start"
                >
                  {/* Stem & Dot connecting from central track */}
                  <div
                    className="relative w-full flex flex-col items-center pb-2 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div
                      className="stem-dot size-3.5 rounded-full border-2 border-[var(--surface-panel)] shadow-sm -mb-1.5 z-20"
                      style={activeStyle}
                    />
                    <div
                      className="stem-line w-[2px] h-[36px] bg-[var(--accent)] origin-bottom rounded-full"
                      style={activeStyle}
                    />
                  </div>

                  {/* Chapter Content Card */}
                  <div className="bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] rounded-[var(--radius-lg)] p-5 shadow-[2px_2px_0_var(--shadow-warm)] hover:border-[var(--accent)] transition-colors">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-warm)]">
                      <div className="flex items-center gap-2">
                        {item.badge && <span className="text-xl">{item.badge}</span>}
                        <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--accent)]">
                          {item.year}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.month}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold italic text-[var(--body-text)] mb-2">
                      {item.chapterTitle}
                    </h3>

                    <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text-muted)] font-story">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

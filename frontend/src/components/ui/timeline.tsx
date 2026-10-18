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
  position?: "top" | "bottom";
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
  items?: JourneyItem[];
  duration?: number;
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

// All 5 Pip Origin Story Chapters in alternating top/bottom order
const defaultStoryItems: JourneyItem[] = [
  {
    id: "pip-ch1",
    year: "Chapter 01",
    month: "March",
    chapterTitle: "The Little Star",
    badge: "⭐",
    position: "top",
    content:
      "One sleepy evening, a small fallen star drifted through an open window and landed inside a porcelain teacup. By morning, its soft warmth became the quiet starlight living in Pip's eyes.",
  },
  {
    id: "pip-ch2",
    year: "Chapter 02",
    month: "November",
    chapterTitle: "The Quiet Little Problem",
    badge: "🌙",
    position: "bottom",
    content:
      "The neighborhood creatures were having restless nights. Their dreams came out repetitive and grey — the same three clouds, the same fence. Pip decided something had to be done.",
  },
  {
    id: "pip-ch3",
    year: "Chapter 03",
    month: "July",
    chapterTitle: "The First Invention",
    badge: "🎵",
    position: "top",
    content:
      "With a borrowed music box, bits of moonlight, a dented thimble, and extraordinary trial and error, Pip tuned the very first dream instrument. The neighborhood grew peacefully quiet.",
  },
  {
    id: "pip-ch4",
    year: "Chapter 04",
    month: "September",
    chapterTitle: "Rooftop Delivery School",
    badge: "🏠",
    position: "bottom",
    content:
      "Pip drew chimney routes on nursery paper, delivering custom bedtime adventures: cloud castles for the restless, quiet seas for the anxious, and talking teacups for the lonely.",
  },
  {
    id: "pip-ch5",
    year: "Chapter 05",
    month: "December",
    chapterTitle: "The Next Little Dream",
    badge: "💻",
    position: "top",
    content:
      "The old nursery computer remains awake long after midnight. Every visitor brings a new bedtime possibility, with hidden notes waiting for curious dreamers who explore.",
  },
];

export default function Timeline({
  title = "How Pip Began",
  periodLabel = "Origin Story · Five Chapters",
  textColor = "var(--body-text, #261b23)",
  activeColor = "var(--accent, #e25555)",
  backgroundColor = "var(--surface-muted, #f7f1e8)",
  imageUrl = "/assets/pip_cloud_star.jpg",
  imageAlt = "Pip riding a cloud in the starlight sky with a unicorn plushie",
  items = defaultStoryItems,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
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
    const slider = sliderRef.current;
    if (!section || !slider) return;

    if (reducedMotion) {
      // Accessible static state
      gsap.set(".journey-line-progress", { width: "100%" });
      gsap.set(".stem-line", { scaleY: 1 });
      gsap.set(".stem-dot", { scale: 1 });
      gsap.set(".chapter-card-inner", { opacity: 1 });
      return;
    }

    // Calculate total horizontal travel
    const getTravelDistance = () => {
      return Math.max(600, slider.scrollWidth - window.innerWidth + 200);
    };

    const travelDistance = getTravelDistance();

    // Horizontal track pinning tween
    const horizontalTween = gsap.to(slider, {
      x: () => -getTravelDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: "top top",
        end: () => `+=${travelDistance * 1.2}`,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.min(100, Math.max(10, self.progress * 100))}%`;
          }
        },
      },
    });

    // Animate each milestone 1-by-1 as it enters the reading focus zone
    const milestoneElements = section.querySelectorAll<HTMLElement>(".timeline-milestone");

    milestoneElements.forEach((milestone, idx) => {
      const card = milestone.querySelector<HTMLElement>(".chapter-card-inner");
      const stem = milestone.querySelector<HTMLElement>(".stem-line");
      const dot = milestone.querySelector<HTMLElement>(".stem-dot");

      // Chapter 1 starts near the center, so it is active immediately
      const isFirst = idx === 0;

      if (isFirst) {
        if (card) gsap.set(card, { opacity: 1, scale: 1 });
        if (stem) gsap.set(stem, { scaleY: 1 });
        if (dot) gsap.set(dot, { scale: 1.25 });
      } else {
        if (card) gsap.set(card, { opacity: 0.28, scale: 0.94 });
        if (stem) gsap.set(stem, { scaleY: 0.2 });
        if (dot) gsap.set(dot, { scale: 0.5 });
      }

      // 1-by-1 reflection trigger as this milestone scrolls into center
      if (card) {
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          boxShadow: "0 10px 32px rgba(226, 85, 85, 0.25), 3px 3px 0 var(--shadow-warm)",
          borderColor: "var(--accent)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: milestone,
            containerAnimation: horizontalTween,
            start: "left 80%",
            end: "left 48%",
            scrub: true,
          },
        });
      }

      if (stem) {
        gsap.to(stem, {
          scaleY: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: milestone,
            containerAnimation: horizontalTween,
            start: "left 85%",
            end: "left 52%",
            scrub: true,
          },
        });
      }

      if (dot) {
        gsap.to(dot, {
          scale: 1.3,
          backgroundColor: "var(--accent)",
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: milestone,
            containerAnimation: horizontalTween,
            start: "left 85%",
            end: "left 52%",
            scrub: true,
          },
        });
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
      className="relative w-full h-screen overflow-hidden flex flex-col justify-center pt-16 md:pt-20"
      style={sectionStyle}
    >
      {/* Ambient Top Chronicle Header */}
      <div className="absolute top-5 left-6 right-6 md:left-12 md:right-12 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full animate-ping" style={activeStyle} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-[var(--accent)]">
            Chronicle Rail · Scroll Down to Travel
          </span>
        </div>
        <div className="font-mono text-xs text-[var(--text-muted)] bg-[var(--surface-panel)] px-3 py-1 rounded-full border border-[var(--border-warm)] shadow-xs">
          {periodLabel}
        </div>
      </div>

      {/* Horizontal Viewport Window */}
      <div className="relative w-full h-[82vh] max-h-[740px] flex items-center overflow-visible">
        <div
          ref={sliderRef}
          className="flex h-full items-center pl-6 md:pl-16 pr-24 flex-nowrap will-change-transform"
        >
          {/* ========================================================= */}
          {/* LEAD STORY CARD (FEATURING USER'S PIP ON CLOUD IMAGE)     */}
          {/* ========================================================= */}
          <div className="w-[340px] md:w-[380px] max-w-[85vw] h-[86%] flex-shrink-0 rounded-[var(--radius-xl)] bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] shadow-[var(--shadow-warm)] p-5 md:p-6 flex flex-col justify-between mr-[8vw] relative overflow-hidden group">
            {/* Card Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">⭐</span>
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] font-bold">
                  Origin Chronicle
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold italic tracking-tight text-[var(--body-text)] leading-tight">
                {title}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-story mt-1">
                Follow Pip&apos;s journey from a fallen star in a porcelain teacup to cloud castles across sleeping rooftops.
              </p>
            </div>

            {/* Pip on Cloud Portrait (Uncropped Aspect Ratio) */}
            <div className="relative w-full h-[58%] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-warm)] shadow-inner my-2.5 bg-gradient-to-b from-[#f3e9e2] to-[#e8d8d0]">
              <img
                src={imageUrl}
                alt={imageAlt}
                draggable={false}
                className="w-full h-full object-cover object-[50%_15%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,17,25,0.72)] via-transparent to-transparent flex items-end p-3">
                <span className="font-mono text-[11px] text-[#ffdd55] uppercase tracking-wider font-semibold">
                  Pip &amp; The Sleepy Universe
                </span>
              </div>
            </div>

            {/* Card Footer Scroll Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-warm)] text-xs font-mono text-[var(--text-muted)]">
              <span>Five Chapters</span>
              <span className="text-[var(--accent)] flex items-center gap-1 font-semibold animate-pulse">
                Scroll to Begin &rarr;
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TIMELINE MILESTONES (1-BY-1 ALTERNATING TOP/BOTTOM)        */}
          {/* ========================================================= */}
          <div className="relative h-full flex items-center flex-nowrap">
            {/* Central Rail Track */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[var(--border-warm)] z-10 pointer-events-none rounded-full"
              aria-hidden="true"
            >
              {/* Active Glowing Starlight Progress Beam */}
              <div
                ref={progressBarRef}
                className="journey-line-progress h-full w-[12%] rounded-full shadow-[0_0_14px_rgba(226,85,85,0.7)]"
                style={activeStyle}
              />
            </div>

            {/* Alternating Chapter Columns */}
            <div className="flex items-center gap-[18vw] flex-nowrap pr-[16vw]">
              {items.map((item) => {
                const isTop = item.position === "top";

                return (
                  <div
                    key={item.id}
                    className="timeline-milestone relative w-[340px] md:w-[400px] h-full flex flex-col justify-between flex-shrink-0"
                  >
                    {isTop ? (
                      /* TOP CARD CONTAINER */
                      <>
                        <div className="h-[46%] flex flex-col justify-end">
                          <div className="chapter-card-inner bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] rounded-[var(--radius-lg)] p-5 shadow-[2px_2px_0_var(--shadow-warm)] transition-all duration-300">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-warm)]">
                              <div className="flex items-center gap-2">
                                {item.badge && <span className="text-xl">{item.badge}</span>}
                                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--accent)]">
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

                            <p className="text-xs md:text-[13px] leading-relaxed text-[var(--text-muted)] font-story">
                              {item.content}
                            </p>
                          </div>
                        </div>

                        {/* Top Stem & Central Rail Dot */}
                        <div
                          className="relative h-[8%] flex flex-col items-center justify-center pointer-events-none z-20"
                          aria-hidden="true"
                        >
                          <div
                            className="stem-line w-[2px] h-[34px] bg-[var(--accent)] origin-top rounded-full"
                            style={activeStyle}
                          />
                          <div
                            className="stem-dot size-4 rounded-full border-2 border-[var(--surface-panel)] shadow-sm -mt-2 z-30"
                            style={activeStyle}
                          />
                        </div>

                        {/* Bottom Spacer */}
                        <div className="h-[46%]" />
                      </>
                    ) : (
                      /* BOTTOM CARD CONTAINER */
                      <>
                        {/* Top Spacer */}
                        <div className="h-[46%]" />

                        {/* Central Rail Dot & Bottom Stem */}
                        <div
                          className="relative h-[8%] flex flex-col items-center justify-center pointer-events-none z-20"
                          aria-hidden="true"
                        >
                          <div
                            className="stem-dot size-4 rounded-full border-2 border-[var(--surface-panel)] shadow-sm -mb-2 z-30"
                            style={activeStyle}
                          />
                          <div
                            className="stem-line w-[2px] h-[34px] bg-[var(--accent)] origin-bottom rounded-full"
                            style={activeStyle}
                          />
                        </div>

                        <div className="h-[46%] flex flex-col justify-start">
                          <div className="chapter-card-inner bg-[var(--surface-panel)] border-2 border-[var(--border-warm)] rounded-[var(--radius-lg)] p-5 shadow-[2px_2px_0_var(--shadow-warm)] transition-all duration-300">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-warm)]">
                              <div className="flex items-center gap-2">
                                {item.badge && <span className="text-xl">{item.badge}</span>}
                                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--accent)]">
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

                            <p className="text-xs md:text-[13px] leading-relaxed text-[var(--text-muted)] font-story">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Finishing Chronicle Outro Tile */}
              <div className="w-[280px] h-[46%] flex flex-col justify-center items-center text-center p-6 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-warm)] bg-[var(--surface-panel)] flex-shrink-0 opacity-80">
                <span className="text-3xl mb-2">✨</span>
                <h4 className="font-serif font-bold italic text-lg text-[var(--body-text)] mb-1">
                  The Journey Continues
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-story leading-relaxed">
                  Pip is awake on the midnight shift, keeping the nursery glowing for every traveler.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Built using Hyperiux Vault: https://vault.hyperiux.com & Refined for Pip's Dream
"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Clock } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
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

type Month = keyof typeof monthOrder;

export type JourneyItem = {
  id: string;
  year: string;
  month: Month;
  content: string;
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
    getServerReducedMotionSnapshot
  );
}

const allJourneyItems: JourneyItem[] = [
  {
    id: "2020-march",
    year: "2020",
    month: "March",
    content:
      "A small fallen star drifts into a porcelain teacup at the Midnight Nursery. Soft starlight wakes in Pip's eyes.",
  },
  {
    id: "2020-november",
    year: "2020",
    month: "November",
    content:
      "The neighborhood creatures have restless nights with grey, repetitive dreams. Pip decides something must be done.",
  },
  {
    id: "2021-july",
    year: "2021",
    month: "July",
    content:
      "With a borrowed music box and moonlight, Pip tunes the very first lullaby instrument for quiet nights.",
  },
  {
    id: "2022-october",
    year: "2022",
    month: "October",
    content:
      "One note wobbles off-key in the middle, yet the neighborhood grows beautifully, deeply, peacefully quiet.",
  },
  {
    id: "2023-april",
    year: "2023",
    month: "April",
    content:
      "Pip maps rooftop routes from chimney to chimney, delivering cloud castles and talking teacups into sleeping homes.",
  },
  {
    id: "2025-september",
    year: "2025",
    month: "September",
    content:
      "Hand-tuned lanterns and star-path compasses make Pip's dream delivery routes ready for every roof.",
  },
  {
    id: "2026-may",
    year: "2026",
    month: "May",
    content:
      "The nursery computer stays awake past midnight, leaving bedtime notes for curious visitors who explore.",
  },
];

function DesktopScrubTimeline({
  title = "How Pip Began",
  periodLabel = "Origin Story · Five Chapters",
  textColor = "var(--body-text, #3a2418)",
  mutedTextColor = "var(--text-muted, #7a5845)",
  activeColor = "var(--accent, #a34063)",
  backgroundColor = "var(--surface-muted, #fdf0e4)",
  imageUrl = "/assets/pip_cloud_star.jpg",
  imageAlt = "Pip riding a cloud in the starlight sky with a unicorn plushie",
  duration,
  scrollDuration = 1.2,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animationDuration = duration ?? scrollDuration;
  const normalizedDuration = Math.max(0.2, animationDuration);

  const sectionStyle: CSSProperties = {
    color: textColor,
    backgroundColor,
  };
  const activeStyle: CSSProperties = {
    backgroundColor: activeColor,
  };
  const mutedTextStyle: CSSProperties = {
    color: mutedTextColor,
  };

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = wholeSliderRef.current;
    if (!section || !slider) return;

    const maxScroll = () => {
      const isMobile = window.innerWidth < 768;
      const rightPadding = isMobile ? 80 : 180;
      return -(slider.scrollWidth - window.innerWidth + rightPadding);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "88% bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
      defaults: {
        ease: "none",
      },
    });

    tl.to(slider, {
      x: maxScroll,
      ease: "none",
    });

    if (reducedMotion) {
      gsap.set(".journey-line", { width: "100%" });
      allJourneyItems.forEach((item) => {
        gsap.set(`.jl-${item.id}`, { scaleY: 1 });
        gsap.set(`.jd-${item.id}`, { scale: 1 });
        gsap.set(`.title-${item.id}`, { opacity: 1, y: 0 });
        gsap.set(`.desc-${item.id}`, { opacity: 1, y: 0 });
      });
      return;
    }

    gsap.to(".journey-line", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "88% bottom",
        scrub: true,
      },
    });

    // Set initial GSAP states
    allJourneyItems.forEach((item, index) => {
      const isTop = index % 2 === 0;
      gsap.set(`.jl-${item.id}`, {
        scaleY: 0,
        transformOrigin: isTop ? "bottom center" : "top center",
      });
      gsap.set(`.jd-${item.id}`, {
        scale: 0,
        transformOrigin: "center center",
      });
      gsap.set(`.title-${item.id}`, {
        opacity: 0,
        y: isTop ? 14 : -14,
      });
      gsap.set(`.desc-${item.id}`, {
        opacity: 0,
        y: isTop ? 14 : -14,
      });
    });

    // Staggered reveal for milestones 1 by 1
    // Timed so 2026 May completes revealing at ~83%,
    // the entire timeline rests completely finished from 88% to 100% (~12% buffer)
    // allowing the user to comfortably view the whole timeline before it transitions downward.
    const positions: ReadonlyArray<readonly [number, number]> = [
      [5, 16],
      [16, 27],
      [27, 38],
      [38, 49],
      [49, 60],
      [60, 71],
      [71, 83],
    ];

    allJourneyItems.forEach((item, index) => {
      const [startPercent, endPercent] = positions[index];
      const itemTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: `${startPercent}% top`,
          end: `${endPercent}% top`,
          scrub: true,
        },
      });

      itemTl
        .to(`.jl-${item.id}`, {
          scaleY: 1,
          duration: normalizedDuration * 0.4,
          ease: "power2.out",
        })
        .to(
          `.jd-${item.id}`,
          {
            scale: 1,
            duration: normalizedDuration * 0.4,
            ease: "back.out(2)",
          },
          "<"
        )
        .to(
          `.title-${item.id}`,
          {
            opacity: 1,
            y: 0,
            duration: normalizedDuration * 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .to(
          `.desc-${item.id}`,
          {
            opacity: 1,
            y: 0,
            duration: normalizedDuration * 0.5,
            ease: "power2.out",
          },
          "<"
        );
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, { dependencies: [normalizedDuration, reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="h-[280vw] max-[768px]:h-[460vh] w-full relative"
      style={sectionStyle}
    >
      {/* Sticky Viewport Container */}
      <div className="h-screen w-screen sticky top-0 flex flex-col justify-center overflow-hidden pt-[80px] md:pt-[100px] pb-6">
        <div
          ref={wholeSliderRef}
          className="flex items-center h-[380px] md:h-[440px] w-max select-none"
          style={{
            paddingLeft: "clamp(140px, 18vw, 320px)",
            paddingRight: "clamp(100px, 12vw, 240px)",
          }}
        >
          {/* ========================================================= */}
          {/* 1. HERO IMAGE CARD (Shifted right with clean space after)  */}
          {/* ========================================================= */}
          <div
            className="rounded-[1.6rem] overflow-hidden border-2 border-[var(--border-warm)] shadow-lg bg-[var(--surface-panel)]"
            style={{
              width: "clamp(270px, 22vw, 340px)",
              height: "clamp(270px, 22vw, 340px)",
              marginRight: "clamp(70px, 8vw, 130px)",
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              className="h-full w-full object-cover object-[50%_15%]"
            />
          </div>

          {/* ========================================================= */}
          {/* 2. UNIFIED TIMELINE TRACK (Continuous Center Rail Behind)  */}
          {/* Starts at the text block, maintaining space from picture  */}
          {/* ========================================================= */}
          <div className="relative flex items-center h-full">
            {/* Continuous Center Rail running behind Title and Milestones */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
              <div
                className="size-2.5 rounded-full flex-shrink-0 shadow-sm"
                style={activeStyle}
              />
              {/* Permanent neutral track rail */}
              <div className="w-full h-[2px] bg-[var(--border-warm)] absolute left-0 top-1/2 -translate-y-1/2" />
              {/* Active animated scrub line */}
              <div
                className="h-[2px] w-[0%] journey-line rounded-full relative z-10 shadow-[0_0_8px_rgba(163,64,99,0.5)]"
                style={activeStyle}
              />
              <div
                className="size-2.5 rounded-full flex-shrink-0 ml-auto shadow-sm"
                style={activeStyle}
              />
            </div>

            {/* ------------------------------------------------------- */}
            {/* Title Block: Top = Title, Bottom = Period Label         */}
            {/* Matches 'Product Storyline' position in reference image */}
            {/* ------------------------------------------------------- */}
            <div
              className="relative z-20 flex flex-col justify-between h-full"
              style={{
                width: "clamp(240px, 18vw, 300px)",
                marginRight: "clamp(70px, 8vw, 140px)",
                flexShrink: 0,
              }}
            >
              {/* Top half: Lifted into upper third with generous clearance above the line */}
              <div
                className="h-1/2 flex flex-col justify-end pr-4"
                style={{ paddingBottom: "52px" }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-[var(--body-text)] leading-[1.08] font-display">
                  {title === "How Pip Began" ? (
                    <>
                      <span className="block">How Pip</span>
                      <span className="block">Began</span>
                    </>
                  ) : (
                    title
                  )}
                </h2>
              </div>
              {/* Bottom half: Period Label comfortably below center line */}
              <div
                className="h-1/2 flex flex-col justify-start pr-4"
                style={{ paddingTop: "28px" }}
              >
                <p
                  className="text-sm md:text-base font-semibold tracking-wide"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* Sequential Milestones (Alternating Top / Bottom)        */}
            {/* Guaranteed ZERO collisions & ZERO horizontal overlap     */}
            {/* ------------------------------------------------------- */}
            {allJourneyItems.map((item, index) => {
              const isTop = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col h-full z-20"
                  style={{
                    width: "clamp(250px, 20vw, 300px)",
                    marginRight: "clamp(60px, 7vw, 120px)",
                    flexShrink: 0,
                  }}
                >
                  {isTop ? (
                    <>
                      {/* Top Milestone: Text and Dot at the TOP of the pointed line */}
                      <div
                        className="h-1/2 relative flex items-start"
                        style={{ paddingTop: "20px" }}
                      >
                        {/* Column 1: Vertical Stem & Dot */}
                        <div
                          className="relative flex flex-col items-center flex-shrink-0"
                          style={{ width: "14px", alignSelf: "stretch" }}
                        >
                          {/* Dot at the very top of the line */}
                          <div
                            className={`size-3 rounded-full jd-${item.id} shadow-sm z-30 flex-shrink-0 mt-1`}
                            style={activeStyle}
                          />
                          {/* Vertical Stem connecting from dot down to the center rail */}
                          <div
                            className={`w-[2px] flex-1 origin-bottom rounded-full jl-${item.id}`}
                            style={activeStyle}
                          />
                        </div>

                        {/* Column 2: Text strictly to the right with guaranteed margin */}
                        <div
                          className="flex-1 min-w-0 space-y-1.5"
                          style={{ marginLeft: "20px", maxWidth: "260px" }}
                        >
                          <h4
                            className={`title-${item.id} text-xl md:text-2xl font-bold tracking-tight text-[var(--body-text)] font-sans leading-tight`}
                          >
                            {item.year} {item.month}
                          </h4>
                          <p
                            className={`desc-${item.id} text-sm md:text-[15px] leading-relaxed font-story`}
                            style={mutedTextStyle}
                          >
                            {item.content}
                          </p>
                        </div>
                      </div>
                      {/* Empty bottom half maintains the alternating rhythm */}
                      <div className="h-1/2 pointer-events-none" />
                    </>
                  ) : (
                    <>
                      {/* Empty top half maintains the alternating rhythm */}
                      <div className="h-1/2 pointer-events-none" />
                      {/* Bottom Milestone: Text and Dot at the BOTTOM of the pointed line */}
                      <div
                        className="h-1/2 relative flex items-end"
                        style={{ paddingBottom: "20px" }}
                      >
                        {/* Column 1: Vertical Stem & Dot */}
                        <div
                          className="relative flex flex-col items-center flex-shrink-0"
                          style={{ width: "14px", alignSelf: "stretch" }}
                        >
                          {/* Vertical Stem connecting from center rail down to dot */}
                          <div
                            className={`w-[2px] flex-1 origin-top rounded-full jl-${item.id}`}
                            style={activeStyle}
                          />
                          {/* Dot at the bottom of the line */}
                          <div
                            className={`size-3 rounded-full jd-${item.id} shadow-sm z-30 flex-shrink-0 mb-1`}
                            style={activeStyle}
                          />
                        </div>

                        {/* Column 2: Text strictly to the right with guaranteed margin */}
                        <div
                          className="flex-1 min-w-0 space-y-1.5"
                          style={{ marginLeft: "20px", maxWidth: "260px", paddingBottom: "4px" }}
                        >
                          <h4
                            className={`title-${item.id} text-xl md:text-2xl font-bold tracking-tight text-[var(--body-text)] font-sans leading-tight`}
                          >
                            {item.year} {item.month}
                          </h4>
                          <p
                            className={`desc-${item.id} text-sm md:text-[15px] leading-relaxed font-story`}
                            style={mutedTextStyle}
                          >
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const CHAPTER_TITLES: Record<string, string> = {
  "2020-march": "A Fallen Star in a Teacup",
  "2020-november": "The Grey Dreams of the Neighborhood",
  "2021-july": "The First Lullaby Instrument",
  "2022-october": "A Wobbling Note, A Peaceful Night",
  "2023-april": "Mapping Rooftop Routes",
  "2025-september": "Lanterns & Star-Path Compasses",
  "2026-may": "The Midnight Nursery Online",
};

function MobileVerticalTimeline({
  title = "How Pip Began",
  periodLabel = "Origin Story · Seven Chapters",
  textColor = "var(--body-text, #3a2418)",
  activeColor = "var(--accent, #a34063)",
  backgroundColor = "var(--surface-muted, #fdf0e4)",
  imageUrl = "/assets/pip_cloud_star.jpg",
  imageAlt = "Pip riding a cloud in the starlight sky with a unicorn plushie",
}: TimelineProps) {
  return (
    <section
      id="journey"
      className="w-full relative py-12 px-5 sm:px-8"
      style={{
        color: textColor,
        backgroundColor,
      }}
    >
      <div className="max-w-[500px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: activeColor,
              marginBottom: "8px",
            }}
          >
            <span>✦</span>
            <span>{periodLabel}</span>
            <span>✦</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight font-display"
            style={{ color: textColor, margin: "0 0 10px 0" }}
          >
            {title}
          </h2>

          <p
            style={{
              fontFamily: "var(--font-story, Georgia, serif)",
              fontSize: "0.92rem",
              color: "var(--text-muted, #7a5845)",
              maxWidth: "420px",
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            A cozy five-year journey from a starry teacup to rooftop dream delivery.
          </p>

          {/* Centered Hero Story Image */}
          <div className="flex justify-center items-center w-full my-6">
            <div
              className="rounded-[22px] overflow-hidden border-2 border-[var(--border-warm)] shadow-lg bg-[var(--surface-panel)]"
              style={{
                width: "220px",
                height: "220px",
                boxShadow: "0 10px 28px var(--shadow-warm), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover object-[50%_15%] block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Minimalist Stepper Timeline (matching user reference image) */}
        <div className="relative mt-8">
          {allJourneyItems.map((item, index) => {
            const isLast = index === allJourneyItems.length - 1;
            const isCompleted = index < allJourneyItems.length - 1;
            const chapterTitle = CHAPTER_TITLES[item.id] || `Chapter 0${index + 1}`;

            return (
              <div key={item.id} className="relative flex gap-4 sm:gap-5 items-start">
                {/* Left Column: Circular Node + Vertical Connector Line */}
                <div className="flex flex-col items-center flex-shrink-0 relative self-stretch">
                  {/* Node Circle */}
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={{
                      backgroundColor: isCompleted ? activeColor : "var(--surface-panel, #fffdf8)",
                      border: `2px solid ${activeColor}`,
                      boxShadow: isCompleted ? "0 2px 8px rgba(163, 64, 99, 0.3)" : "0 2px 6px var(--shadow-warm)",
                    }}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={2.8} className="text-white" />
                    ) : (
                      <Clock size={16} strokeWidth={2.2} style={{ color: activeColor }} />
                    )}
                  </div>

                  {/* Vertical connecting rail running cleanly to the next node */}
                  {!isLast && (
                    <div
                      className="w-[2px] flex-1 my-1 rounded-full"
                      style={{
                        backgroundColor: isCompleted ? activeColor : "var(--border-warm, #decbb4)",
                        opacity: isCompleted ? 0.75 : 0.4,
                      }}
                    />
                  )}
                </div>

                {/* Right Column: Date, Title, and Description */}
                <div className={`flex-1 min-w-0 ${isLast ? "pb-2" : "pb-7 sm:pb-8"}`}>
                  {/* Date on top */}
                  <div
                    style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-muted, #7a5845)",
                      letterSpacing: "0.02em",
                      marginBottom: "3px",
                    }}
                  >
                    {item.month} {item.year}
                  </div>

                  {/* Bold Milestone Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display, Georgia, serif)",
                      fontSize: "1.08rem",
                      fontWeight: 700,
                      color: "var(--body-text, #3a2418)",
                      lineHeight: 1.3,
                      margin: "0 0 6px 0",
                    }}
                  >
                    {chapterTitle}
                  </h3>

                  {/* Description with comfortable line-height */}
                  <p
                    style={{
                      fontFamily: "var(--font-story, Georgia, serif)",
                      fontSize: "0.92rem",
                      lineHeight: 1.6,
                      color: "var(--text-muted, #7a5845)",
                      margin: 0,
                    }}
                  >
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Timeline(props: TimelineProps) {
  const isMobileOrTablet = useIsMobile(1024);

  if (isMobileOrTablet) {
    return <MobileVerticalTimeline {...props} />;
  }

  return <DesktopScrubTimeline {...props} />;
}


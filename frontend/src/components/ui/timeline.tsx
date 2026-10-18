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
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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

export type Month = keyof typeof monthOrder;

export type JourneyItem = {
  id: string;
  year: string;
  month: Month;
  content: string;
  chapterTitle?: string;
  badge?: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

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

// Default Pip's Origin Story chapters mapped onto the timeline
const defaultTopJourneyData: JourneyItem[] = [
  {
    id: "pip-ch1",
    year: "Chapter 01",
    month: "March",
    chapterTitle: "The Little Star",
    badge: "⭐",
    content: "A fallen star drifted into a teacup at the Midnight Nursery. Pip woke up with starlight in his eyes.",
  },
  {
    id: "pip-ch3",
    year: "Chapter 03",
    month: "July",
    chapterTitle: "The First Invention",
    badge: "🎵",
    content: "With a borrowed music box and moonlight, Pip tuned the very first dream instrument for quiet nights.",
  },
  {
    id: "pip-ch5",
    year: "Chapter 05",
    month: "December",
    chapterTitle: "The Next Little Dream",
    badge: "💻",
    content: "The nursery terminal stays lit past midnight, waiting for curious dreamers to find the hidden notes.",
  },
];

const defaultBottomJourneyData: JourneyItem[] = [
  {
    id: "pip-ch2",
    year: "Chapter 02",
    month: "November",
    chapterTitle: "The Quiet Little Problem",
    badge: "🌙",
    content: "Restless creatures wandered with grey, repetitive dreams. Pip decided something had to be done.",
  },
  {
    id: "pip-ch4",
    year: "Chapter 04",
    month: "September",
    chapterTitle: "Rooftop Delivery School",
    badge: "🏠",
    content: "Pip drew chimney paths on nursery paper, sending cloud castles and talking teacups into sleeping homes.",
  },
];

export default function Timeline({
  title = "How Pip Began",
  periodLabel = "Origin Story · Five Chapters",
  textColor = "var(--body-text, #261b23)",
  mutedTextColor = "var(--text-muted, #7c6876)",
  activeColor = "var(--accent, #e25555)",
  backgroundColor = "var(--surface-muted, #f7f1e8)",
  imageUrl = "/assets/pip_portrait.png",
  imageAlt = "Pip looking out from the nursery",
  topData = defaultTopJourneyData,
  bottomData = defaultBottomJourneyData,
  duration,
  scrollDuration = 1.2,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animationDuration = duration ?? scrollDuration;
  const normalizedDuration = Math.max(0.2, animationDuration);

  const allJourneyItems: JourneyItem[] = [
    ...topData,
    ...bottomData,
  ].sort((a, b) => {
    const yearDiff = a.year.localeCompare(b.year);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder[a.month] - monthOrder[b.month];
  });

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
    if (!section || !wholeSliderRef.current) return;

    const isMobile = window.innerWidth < 600;
    const slidePercent = isMobile ? -58 : -64;
    const lineWidth = isMobile ? "70%" : "98%";
    const lineStart = isMobile ? "top 30%" : "top 25%";
    const slideEnd = isMobile ? "82% 50%" : "92% bottom";
    const lineEnd = isMobile ? "80% 50%" : "92% bottom";

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: slideEnd,
        scrub: true,
      },
      defaults: {
        ease: "none",
      },
    });

    tl.fromTo(
      wholeSliderRef.current,
      { xPercent: 0 },
      { xPercent: slidePercent },
    );

    if (reducedMotion) {
      gsap.set(".journey-line", { width: lineWidth });
      return;
    }

    gsap.to(".journey-line", {
      width: lineWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: lineStart,
        end: lineEnd,
        scrub: true,
      },
    });
  }, { dependencies: [reducedMotion], scope: sectionRef });

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = allJourneyItems;

    if (reducedMotion) {
      items.forEach((item) => {
        gsap.set(`.jl-${item.id}`, { scaleY: 1 });
        gsap.set(`.jd-${item.id}`, { scale: 1 });
        gsap.set(`.title-${item.id}`, { opacity: 1, clearProps: "transform" });
        gsap.set(`.description-${item.id}`, {
          opacity: 1,
          clearProps: "transform",
        });
      });
      return;
    }

    items.forEach((item) => {
      gsap.set(`.jl-${item.id}`, {
        scaleY: 0,
        transformOrigin: "bottom bottom",
      });
      gsap.set(`.jd-${item.id}`, { scale: 0 });
      gsap.set(`.title-${item.id}`, { opacity: 1 });
      gsap.set(`.description-${item.id}`, { opacity: 1 });
    });

    const titleSplits: Partial<Record<string, SplitTextInstance>> = {};
    const descriptionSplits: Partial<Record<string, SplitTextInstance>> = {};

    try {
      items.forEach((item) => {
        titleSplits[item.id] = new SplitText(`.title-${item.id}`, {
          type: "lines, words",
          mask: "lines",
        });

        descriptionSplits[item.id] = new SplitText(`.description-${item.id}`, {
          type: "lines, words",
          mask: "lines",
        });
      });
    } catch {
      // SplitText graceful fallback if DOM structure is unavailable
    }

    const createItemTimeline = (
      item: JourneyItem,
      startPos: number,
      endPos: number,
    ) => {
      const lineSelector = `.jl-${item.id}`;
      const dotSelector = `.jd-${item.id}`;
      const titleLines = titleSplits[item.id]?.lines || `.title-${item.id}`;
      const descriptionLines = descriptionSplits[item.id]?.lines || `.description-${item.id}`;

      const isTop = topData.some((topItem) => topItem.id === item.id);

      if (!isTop) {
        gsap.set(lineSelector, { transformOrigin: "top top" });
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: `${startPos}% 30%`,
          end: `${endPos}% 50%`,
          scrub: true,
        },
      });

      timeline
        .to(lineSelector, {
          scaleY: 1,
          duration: normalizedDuration * 0.4,
        })
        .to(
          dotSelector,
          {
            scale: 1,
            duration: normalizedDuration * 0.4,
          },
          "<",
        )
        .fromTo(
          titleLines,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            delay: -0.6 * normalizedDuration,
            duration: normalizedDuration,
            stagger: 0.03,
            ease: "power2.out",
          },
        )
        .fromTo(
          descriptionLines,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: normalizedDuration,
            stagger: 0.03,
            ease: "power2.out",
          },
          "<",
        );

      return timeline;
    };

    const positionsDesktop: ReadonlyArray<readonly [number, number]> = [
      [6, 26],
      [22, 42],
      [38, 58],
      [54, 74],
      [70, 90],
    ];

    const positionsMobile: ReadonlyArray<readonly [number, number]> = [
      [18, 30],
      [30, 42],
      [42, 54],
      [54, 66],
      [66, 78],
    ];

    const isMobile = window.innerWidth < 600;
    const positions = isMobile ? positionsMobile : positionsDesktop;

    items.forEach((item, index) => {
      const [startPos, endPos] = positions[index] || [
        Math.min(80, 10 + index * 15),
        Math.min(95, 25 + index * 15),
      ];
      createItemTimeline(item, startPos, endPos);
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      Object.values(titleSplits).forEach((split) => split?.revert?.());
      Object.values(descriptionSplits).forEach((split) => split?.revert?.());
      window.removeEventListener("resize", handleResize);
    };
  }, { dependencies: [normalizedDuration, reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="story"
      className="h-[200vw] max-[600px]:h-[380vh] w-full relative"
      style={sectionStyle}
    >
      <div className="h-screen w-screen sticky top-[0%] pt-[8%] overflow-hidden max-[600px]:top-[4%]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[34vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          {/* Lead Visual Card */}
          <div className="h-full w-[28vw] overflow-hidden rounded-[1.2vw] border border-[var(--border)] bg-[var(--surface)] shadow-lg max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[4vw] flex-shrink-0 relative group">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,17,25,0.75)] via-transparent to-transparent flex flex-col justify-end p-[1.8vw] max-[600px]:p-[4vw]">
              <span className="font-mono text-[0.9vw] max-[600px]:text-[3vw] text-[#ffbf00] uppercase tracking-widest">
                Midnight Archive
              </span>
              <p className="text-[1.2vw] max-[600px]:text-[3.8vw] font-serif font-bold text-white leading-tight">
                Pip &amp; The Sleepy Universe
              </p>
            </div>
          </div>

          <div className="relative h-full w-full">
            {/* Horizontal Timeline Track */}
            <div className="w-full absolute left-0 top-[49%] -translate-y-1/2 flex items-center h-fit z-10 pointer-events-none">
              <div
                className="h-[.9vw] max-[600px]:h-[2.4vw] max-[600px]:w-[2.4vw] w-[.9vw] rounded-full shadow-sm"
                style={activeStyle}
              ></div>
              <div
                className="h-[2px] w-[0%] rounded-full journey-line"
                style={activeStyle}
              ></div>
              <div
                className="h-[.9vw] max-[600px]:h-[2.4vw] max-[600px]:w-[2.4vw] w-[.9vw] rounded-full shadow-sm"
                style={activeStyle}
              ></div>
            </div>

            {/* Top Branch */}
            <div className="flex h-1/2 w-full items-center justify-start gap-[1vw]">
              <div className="h-full w-[22%] pt-[1.5vw] max-[600px]:h-fit max-[600px]:pt-[4vw] flex-shrink-0">
                <span className="text-[0.9vw] max-[600px]:text-[3vw] font-mono uppercase tracking-[0.2em] text-[var(--accent)] block mb-1">
                  Chronicle
                </span>
                <h2 className="w-[90%] text-[2.8vw] leading-[1.02] font-serif font-bold max-[600px]:text-[8vw]">
                  {title}
                </h2>
              </div>

              <div className="w-full flex h-full gap-x-[16vw] max-[600px]:gap-x-[42vw]">
                {topData.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[30vw] px-[2vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[6vw] flex-shrink-0"
                  >
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full pointer-events-none">
                      <div
                        className={`size-[1.1vw] max-[600px]:size-[2.8vw] -translate-x-1/2 relative aspect-square rounded-full jd-${item.id} shadow-sm`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`h-[92%] w-[2px] origin-bottom rounded-full jl-${item.id}`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="mt-[-1vw] space-y-[0.8vw] max-[600px]:mt-[-2vw]">
                      <div className="flex items-center gap-2">
                        {item.badge && <span className="text-[1.2vw] max-[600px]:text-[3.5vw]">{item.badge}</span>}
                        <h4
                          className={`title-${item.id} text-[2.1vw] font-serif font-bold leading-tight max-[600px]:text-[6vw]`}
                        >
                          {item.chapterTitle || `${item.year} · ${item.month}`}
                        </h4>
                      </div>
                      <p
                        className="text-[1vw] max-[600px]:text-[3.2vw] font-mono tracking-wider text-[var(--accent)]"
                      >
                        {item.year} · {item.month}
                      </p>
                      <p
                        className={`description-${item.id} w-[92%] text-[1.25vw] leading-[1.3] max-[600px]:w-[92%] max-[600px]:text-[4.2vw] font-sans`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Branch */}
            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[28%] pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[28%] h-full flex-shrink-0">
                <p
                  className="text-[1.3vw] leading-normal max-[600px]:text-[3.8vw] font-serif italic"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
                <p className="text-[0.85vw] max-[600px]:text-[2.8vw] font-mono text-[var(--text-faint)] mt-1">
                  Scroll horizontally to travel through chapters
                </p>
              </div>

              <div className="w-full flex h-full gap-x-[20vw] ml-[5vw] max-[600px]:gap-x-[42vw] max-[600px]:ml-[6vw]">
                {bottomData.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[28vw] px-[2vw] max-[600px]:w-[70vw] max-[600px]:px-[6vw] flex-shrink-0"
                  >
                    <div className="w-full absolute left-0 bottom-[-1%] h-full pointer-events-none">
                      <div
                        className={`h-[92%] origin-top w-[2px] rounded-full max-[600px]:h-full jl-${item.id}`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`size-[1.1vw] max-[600px]:size-[2.8vw] -translate-x-1/2 relative w-auto aspect-square rounded-full jd-${item.id} shadow-sm`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[0.8vw] pb-[1vw]">
                      <div className="flex items-center gap-2">
                        {item.badge && <span className="text-[1.2vw] max-[600px]:text-[3.5vw]">{item.badge}</span>}
                        <h4
                          className={`title-${item.id} text-[2.1vw] font-serif font-bold leading-tight max-[600px]:text-[6vw]`}
                        >
                          {item.chapterTitle || `${item.year} · ${item.month}`}
                        </h4>
                      </div>
                      <p
                        className="text-[1vw] max-[600px]:text-[3.2vw] font-mono tracking-wider text-[var(--accent)]"
                      >
                        {item.year} · {item.month}
                      </p>
                      <p
                        className={`description-${item.id} w-[92%] text-[1.25vw] leading-[1.3] max-[600px]:w-[92%] max-[600px]:text-[4.2vw] font-sans`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

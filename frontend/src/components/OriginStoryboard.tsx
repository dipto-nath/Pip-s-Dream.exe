// =============================================================
// PIP.EXE — OriginStoryboard
// How Pip Began: Horizontal scrub timeline powered by GSAP & SplitText
// =============================================================

import Timeline from '@/components/ui/timeline';

export function OriginStoryboard() {
  return (
    <div id="story" className="relative w-full overflow-hidden bg-[var(--surface-muted)]">
      {/* Lead-in banner so the timeline pin has comfortable entry scroll space */}
      <div className="pt-16 pb-8 px-6 text-center max-w-4xl mx-auto flex flex-col items-center gap-3">
        <span className="section-eyebrow">
          Origin Story · Five Chapters
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold italic tracking-tight text-[var(--body-text)]">
          How Pip Began
        </h2>
        <p className="max-w-xl text-sm md:text-base text-[var(--text-muted)] font-story leading-relaxed">
          From a fallen star in a porcelain teacup to chimney delivery routes over quiet towns.
          Scroll down — the nursery pins and slides through Pip&apos;s story.
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs font-mono uppercase tracking-widest text-[var(--accent)] animate-bounce">
          <span>↓ Scroll to explore chronicle</span>
        </div>
      </div>

      {/* GSAP Horizontal Scroll Pin Timeline */}
      <Timeline
        title="How Pip Began"
        periodLabel="Origin Story · Five Chapters"
        imageUrl="/assets/pip_portrait.png"
        imageAlt="Pip peering from the Midnight Nursery window"
        textColor="var(--body-text)"
        mutedTextColor="var(--text-muted)"
        activeColor="var(--accent)"
        backgroundColor="var(--surface-muted)"
        duration={1.2}
      />
    </div>
  );
}

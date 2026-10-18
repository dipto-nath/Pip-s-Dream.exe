"use client";

import Timeline from "@/components/ui/timeline";

const settings = {
  textColor: "var(--body-text, #261b23)",
  mutedTextColor: "var(--text-muted, #7c6876)",
  activeColor: "var(--accent, #e25555)",
  backgroundColor: "var(--surface-muted, #f7f1e8)",
  duration: 1.2,
};

export default function TimelineDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <main className="bg-[var(--surface)] text-[var(--body-text)]">
      {/* Lead-in so the pinned timeline has somewhere to scroll in from. */}
      <section className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Origin Story · Five Chapters
        </p>
        <h1 className="max-w-[18ch] text-4xl font-serif font-bold italic leading-tight tracking-tight sm:text-6xl text-[var(--body-text)]">
          How Pip Began
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
          Keep scrolling — the section pins, the track slides sideways, and each
          milestone draws its stem and reveals its story as it reaches centre.
        </p>
        <span className="mt-2 animate-bounce text-[var(--accent)] text-lg">&darr;</span>
      </section>

      {/* Realistic usage: Pip story copy, branded accents, tuned reveal speed. */}
      <Timeline
        title="How Pip Began"
        periodLabel="Origin Story · Five Chapters"
        backgroundColor={s.backgroundColor}
        textColor={s.textColor}
        mutedTextColor={s.mutedTextColor}
        activeColor={s.activeColor}
        imageUrl="/assets/pip_portrait.png"
        imageAlt="Pip peering from the Midnight Nursery window"
        duration={s.duration}
      />

      <section className="flex h-screen items-center justify-center px-6 text-center text-sm text-[var(--text-muted)] font-story">
        From a fallen star in a teacup to cloud castles across sleeping rooftops.
      </section>
    </main>
  );
}

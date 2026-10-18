// =============================================================
// PIP.EXE — OriginStoryboard
// How Pip Began: Horizontal scrub timeline powered by GSAP
// =============================================================

import Timeline from '@/components/ui/timeline';

export function OriginStoryboard() {
  return (
    <Timeline
      title="How Pip Began"
      periodLabel="Origin Story · Five Chapters"
      imageUrl="/assets/pip_portrait.png"
      imageAlt="Pip peering from the Midnight Nursery window"
      textColor="var(--body-text)"
      mutedTextColor="var(--text-muted)"
      activeColor="var(--accent)"
      backgroundColor="var(--surface-muted)"
    />
  );
}

// =============================================================
// PIP.EXE — OriginStoryboard
// How Pip Began: Horizontal scrub timeline powered by GSAP
// =============================================================

import Timeline from '@/components/ui/timeline';

export function OriginStoryboard() {
  return (
    <Timeline
      title="How Pip Began"
      periodLabel="Origin Story · Seven Chapters"
      imageUrl="/assets/pip_cloud_star.jpg"
      imageAlt="Pip riding a cozy cloud in the starlight sky with a unicorn plushie"
      textColor="var(--body-text)"
      mutedTextColor="var(--text-muted)"
      activeColor="var(--accent)"
      backgroundColor="var(--surface-muted)"
    />
  );
}

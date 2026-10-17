# PIP.EXE — The Midnight Nursery Dream Desk

*A handcrafted interactive portfolio built for [haX.baby's Baby's First Website](https://hax.baby/first-website) hackathon — Track 1: Pip, the Skull Baby.*

---

## The Concept

You have found a forgotten computer in a cozy nursery, still running at midnight.

Pip — a baby with a smooth, cute skull face, warm amber eyes, and a star-decorated nightcap — is the Junior Dream Engineer on night shift at the **Midnight Nursery**. This is their digital desk.

Here you can:

- **Meet Pip** — the tiny skull-baby who builds dreams for the whole neighborhood
- **Play a lullaby** — Pip's hand-tuned music box, synthesized live in your browser
- **Adjust nightlights** — three cozy lantern presets with variable warm amber glow
- **Follow a dream route** — an SVG map tracing Pip's nightly rooftop deliveries
- **Read Pip's origin story** — an interactive 5-chapter storyboard
- **Sign the guestbook** — leave a dream message pinned to the nursery noticeboard
- **Find a secret** — there's a hidden bedtime note somewhere in the hero...

---

## Technology Stack

| Layer        | Choice                                      |
|--------------|---------------------------------------------|
| Build        | Vite 8                                       |
| Framework    | React 19 (Strict Mode)                       |
| Language     | TypeScript (strict)                          |
| Styling      | Native CSS (no Tailwind)                     |
| Audio        | Web Audio API (oscillators, gain nodes)      |
| Animation    | Framer Motion + CSS transitions              |
| Canvas       | HTML Canvas 2D (sparkle trail)               |
| Map          | Inline SVG with scroll-driven animation       |
| Confetti     | canvas-confetti                              |
| Icons        | Lucide React                                 |
| Testing      | Vitest + React Testing Library               |
| Lint         | Oxlint                                       |

**Fonts:** Fraunces (display), Fredoka (UI), Lora (story) — loaded via Google Fonts with `display=swap`.

---

## Prerequisites

- **Node.js** >= 20
- **npm** (or any compatible package manager)

---

## Installation

```bash
git clone <repository-url>
cd pip-exe
npm install
```

---

## Development Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build (tsc + vite build)
npm run preview   # Preview production build locally
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
npm run lint      # Run oxlint
```

---

## Key Interactions

### Day / Dream Mode
Click the sun/moon toggle in the header to switch between warm day mode and midnight dream mode. Preference is saved in `localStorage`.

### Sound On / Off
Click the speaker icon. All audio (lullaby, chimes, easter egg) routes through a single shared `AudioEngine`. Sound preference persists. Defaults to **off** (no autoplay).

### The Lullaby Lab (Project 01)
Play and Stop controls. The melody is a 23-note pentatonic sequence (C5-D5-E5-G5-A5-C6) synthesized with the Web Audio API — sine oscillators with soft attack/release envelopes, scheduled on a real audio timeline.

### The Nightlight Collection (Project 02)
Three presets: Whisper (20%), Moonbeam (55%), Stardust (85%). Toggle on/off, switch presets, or drag the intensity slider. The glow updates in real-time via a CSS radial-gradient variable.

### Dream Delivery Route (Project 03)
An inline SVG rooftop map. As you scroll, a luminous dream capsule travels along a bezier path from the Nursery Tower -> Hedgehog Den -> Crescent Lane. Reduced-motion users see the full path immediately.

### The Guestbook
Sign with your name and a dream message. Entries are validated (1-24 chars name, 1-120 chars message), persisted to `localStorage`, and displayed as pinned paper notes. Up to 50 entries are retained.

### The Hit Counter
A vintage-style odometer showing "DREAM VISITS ON THIS DEVICE." Increments once per browser session. Fully local -- not a global analytics system.

### Chaos Mode
The zap toggle in the header adds controlled early-web chaos: rotated project cards, a faster marquee, extra sticker labels, and the draggable Dream Console window. Layout changes are stable and deterministic (no random re-renders).

### The Draggable Dream Console
Visible only in Chaos Mode. Drag from the title bar, use arrow keys to nudge, or close it. On mobile, it stays fixed in normal flow.

### The Hidden Easter Egg
Look closely at the hero -- there's a star that shouldn't be there. Click it to reveal a secret bedtime note and a soft confetti celebration in Pip's palette (cream, berry, amber).

---

## Audio Design

- **No external audio files.** All sounds are synthesized with `OscillatorNode` and `GainNode`.
- The `AudioEngine` is a lazy-initialized singleton. An `AudioContext` is only created on the first user gesture.
- Master gain controls volume globally. Muting fades the master gain to zero and stops the lullaby scheduler.
- The lullaby scheduler uses `setTimeout` for loop timing and schedules all notes for one phrase atomically, avoiding timeout accumulation.
- All oscillators and timers are cleaned up on component unmount or mute.
- If Web Audio is unavailable, the sound feature degrades gracefully (UI shows "Enable sound" prompts).

---

## Storage Behavior

All persistent state is browser-local (`localStorage`/`sessionStorage`):

| Key                | Purpose                              |
|--------------------|--------------------------------------|
| `pip-theme`        | Day ('day') or Dream ('dream')       |
| `pip-sound`        | Sound enabled (boolean)              |
| `pip-chaos`        | Chaos Mode (boolean)                 |
| `pip-exe-guestbook`| Guestbook entries (array)             |
| `pip-exe-visits`   | Total visit count (number)           |
| `pip-exe-session`  | Session marker (prevents dupes)      |

**The guestbook and hit counter are browser-local only.** They are not shared between visitors or devices. A small disclosure in the guestbook section explains this.

---

## Deployment

```bash
npm run build
```

Produces a static `dist/` directory. Deploy to any static host:

- **Vercel:** `npx vercel`
- **Netlify:** drag `dist/` to the dashboard, or run `netlify deploy`
- **GitHub Pages:** push `dist/` via the `gh-pages` branch

The only build requirement is Node.js >= 20.

---

## Project Structure

```
pip-exe/
├── public/
│   └── assets/              # Official character artwork (PNG)
│       ├── pip_avatar_cloud.png
│       ├── pip_lullaby_box.png
│       ├── pip_dream_lantern.png
│       └── pip_portrait.png
├── src/
│   ├── App.tsx              # Root -- theme/chaos state, component composition
│   ├── main.tsx             # React entry point (Strict Mode)
│   ├── components/          # All UI components
│   ├── context/             # SoundProvider + useSoundContext hook
│   ├── hooks/               # usePersistentState, useReducedMotionPreference, useSound
│   ├── lib/                 # Pure logic: audioEngine, guestbookStorage, visitCounter, dreamContent, types
│   ├── styles/              # tokens.css, global.css, animations.css
│   └── test/                # Vitest setup + unit tests
├── index.html               # Theme flash-prevention script + font loading
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Official Asset Attribution

Pip and all character assets are provided by [haX.baby's Baby's First Website](https://hax.baby/baby-problem) hackathon. See [ASSETS.md](ASSETS.md) for the full credit and source URLs.

---

## Known Limitations

- The guestbook is stored in `localStorage` -- entries persist only in the current browser.
- The hit counter is browser-local only.
- The sparkle cursor trail is disabled on touch-only devices and when `prefers-reduced-motion` is set.
- All audio is synthesized client-side -- no network requests for audio.

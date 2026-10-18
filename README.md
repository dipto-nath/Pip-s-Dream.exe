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
| Frontend     | Vite 8 · React 19 (Strict Mode)             |
| Backend      | TypeScript (Node.js 20+ or Supabase Edge)     |
| Language     | TypeScript (strict)                          |
| Styling      | Native CSS (no Tailwind)                     |
| Audio        | Web Audio API (oscillators, gain nodes)      |
| Animation    | Framer Motion + CSS transitions              |
| Canvas       | HTML Canvas 2D (sparkle trail)               |
| Map          | Inline SVG with scroll-driven animation       |
| Confetti     | canvas-confetti                              |
| Icons        | Lucide React                                 |
| Backend Tests| Vitest (unit + HTTP integration)             |
| Frontend Tests| Vitest + React Testing Library              |
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
cd "Pip's Dream.exe"

# Frontend
cd frontend && npm install

# Backend (local development)
cd ../backend && npm install
```

> **Note:** This project uses a monorepo structure:
> - `frontend/` — React + Vite app (Pip's Nursery)
> - `backend/` — TypeScript API server (JSON storage or Supabase Edge Functions)

---

## Development Commands

### Frontend

```bash
cd frontend
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run lint       # Run oxlint
```

### Backend

```bash
cd backend
npm run dev        # Start local server at http://localhost:3001
npm run dev:once   # Start server once
npm run build      # Type-check (tsc)
npm run test:run   # Run all backend tests (unit + HTTP)
npm run lint       # Run oxlint
```

### Quick Backend Test

```bash
cd backend
npm run dev:once &
sleep 2
npx tsx src/testHttp.ts
kill %1
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
Sign with your name and a dream message. Entries are validated (1-24 chars name, 1-120 chars message) and persisted to backend storage when available so they are shared across visitors. If the backend is unreachable, entries fall back to `localStorage` with a clear offline notice. Up to 50 entries are retained locally.

### The Hit Counter
A vintage-style odometer tracking global visits through the backend API, incrementing once per browser session. When the backend is unavailable, it gracefully shows a "Local Only" status with the device count rather than presenting a false global total.

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

The website uses a two-tier persistence model:

### Visitor Counter

The hit counter now tracks **global** visits via the backend API. Each browser session records one visit (idempotent — revisit in the same session doesn't double-count). The counter is shared across all visitors.

When the backend is unavailable:
- The counter shows a "Local Only" state with the last known session count
- It clearly labels the data as local — it does **not** silently present a local number as the global total

### Guestbook

Guestbook entries are stored on the backend (JSON file locally, PostgreSQL in production). When the backend is reachable, entries are shared across all visitors. When the backend is unavailable, the guestbook falls back to `localStorage` and displays a clear "Offline mode" notice.

### Browser-Local State

These remain browser-local only (not shared):

| Key                | Purpose                              |
|--------------------|--------------------------------------|
| `pip-theme`        | Day ('day') or Dream ('dream')       |
| `pip-sound`        | Sound enabled (boolean)              |
| `pip-chaos`        | Chaos Mode (boolean)                 |
| `pip-exe-guestbook`| Offline guestbook fallback (array)   |
| `pip-exe-visits`   | Offline visit fallback (number)      |
| `pip-exe-session`  | Session marker (prevents dupes)      |

---

## Deployment

### Frontend

```bash
cd frontend
npm run build
```

Produces a static `dist/` directory. Deploy to any static host:

- **Vercel:** `npx vercel`
- **Netlify:** drag `dist/` to the dashboard, or run `netlify deploy`
- **GitHub Pages:** push `dist/` via the `gh-pages` branch

### Backend (Supabase Edge Functions)

See [`backend/README.md`](backend/README.md#deployment-to-supabase-edge-functions) for full instructions.

```bash
cd backend
npx supabase link --project-ref <your-ref>
npx supabase db push
npx supabase functions deploy guestbook
npx supabase functions deploy visits
npx supabase functions deploy stats
npx supabase functions deploy health
```

In development, leaving `VITE_API_BASE_URL` unset uses the default relative `/api` route proxied to the local backend. In production environments without a local proxy, set `VITE_API_BASE_URL` to your deployed backend URL (e.g. Supabase functions URL); if unset or unreachable in production, the frontend gracefully falls back to local-only mode.

The only build requirement is Node.js >= 20.

---

## Project Structure

```
Pip's Dream.exe/
├── README.md                    # Project documentation
├── ASSETS.md                    # Asset credits
├── .env.example                 # Environment variable template
├── frontend/                    # React + Vite app (Pip's Nursery)
│   ├── public/
│   │   └── assets/              # Official character artwork (PNG)
│   ├── src/
│   │   ├── App.tsx              # Root — theme/chaos state, component composition
│   │   ├── main.tsx             # React entry point (Strict Mode)
│   │   ├── components/          # All UI components
│   │   ├── context/             # SoundProvider + useSoundContext hook
│   │   ├── hooks/               # usePersistentState, useReducedMotionPreference, useSound
│   │   ├── lib/                 # Logic: audioEngine, api, guestbookService,
│   │   │                        #   visitService, guestbookStorage, visitCounter,
│   │   │                        #   dreamContent, types
│   │   ├── styles/              # tokens.css, global.css, animations.css
│   │   └── test/                # Vitest setup + unit tests
│   ├── index.html               # Theme flash-prevention script + font loading
│   ├── vite.config.ts           # Vite + proxy to backend (port 3001)
│   ├── tsconfig.json
│   ├── .env.example             # Frontend env vars
│   └── package.json
└── backend/                     # TypeScript API server
    ├── src/
    │   ├── types.ts             # Shared API types
    │   ├── storage.ts           # Abstract storage interfaces
    │   ├── jsonStorage.ts       # Local JSON file storage
    │   ├── validation.ts        # Input validation + sanitisation
    │   ├── handlers.ts          # Business logic (pure functions)
    │   ├── server.ts            # HTTP server
    │   ├── testSmoke.ts         # Direct handler smoke test
    │   ├── testHttp.ts          # HTTP integration test
    │   └── test/                # Vitest unit tests
    ├── functions/               # Supabase Edge Functions
    │   ├── guestbook/index.ts
    │   ├── visits/index.ts
    │   ├── stats/index.ts
    │   └── health/index.ts
    ├── migrations/              # SQL migrations
    │   └── 001_initial_schema.sql
    ├── supabase/                # Supabase CLI configuration
    │   └── config.toml
    ├── data/                    # Local JSON data (gitignored)
    ├── tsconfig.json
    ├── .env.example             # Backend env vars
    └── package.json
```

---

## Official Asset Attribution

Pip and all character assets are provided by [haX.baby's Baby's First Website](https://hax.baby/baby-problem) hackathon. See [ASSETS.md](ASSETS.md) for the full credit and source URLs.

---

## Known Limitations

- When the backend is unavailable, the guestbook falls back to `localStorage` — entries are local-only and will sync to the server on next online submission.
- When the backend is unavailable, the visitor counter shows a "Local Only" state with the session count — it does **not** display a misleading global number.
- The sparkle cursor trail is disabled on touch-only devices and when `prefers-reduced-motion` is set.
- All audio is synthesized client-side — no network requests for audio.
- The local backend (JSON storage) is single-process; for multi-process scenarios, use Supabase.

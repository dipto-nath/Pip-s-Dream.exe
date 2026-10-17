// =============================================================
// PIP.EXE — Dream Content (static data)
// =============================================================

import type { StoryScene, ProjectMeta, NightlightPreset, DeliveryDestination } from './types';

export const STORY_SCENES: StoryScene[] = [
  {
    id: 'scene-01',
    chapter: 1,
    title: 'The Little Star',
    icon: '⭐',
    body: `One sleepy evening, a small fallen star drifted through an open window and landed inside a porcelain teacup at the Midnight Nursery. Nobody noticed. By morning, its warmth had become the soft amber glow now living quietly in Pip's eye sockets. Pip yawned, smiled a tiny crooked smile, and discovered the whole wide world waiting just outside the nursery window.`,
  },
  {
    id: 'scene-02',
    chapter: 2,
    title: 'The Quiet Little Problem',
    icon: '🌙',
    body: `The neighborhood's tiny creatures were having restless nights. Their dreams came out repetitive and grey — the same three clouds, the same fence, the same Tuesday afternoon. Their lanterns burned too dim. Their bedtime stories kept ending two chapters too early. Something, Pip decided with great seriousness, simply had to be done about this.`,
  },
  {
    id: 'scene-03',
    chapter: 3,
    title: 'The First Invention',
    icon: '🎵',
    body: `With a borrowed music box, some carefully collected bits of moonlight, a dented thimble, and a truly extraordinary amount of trial and error, Pip built the very first dream instrument. The first lullaby it played was slightly off-key — one note wobbled terribly in the middle. But it worked. The neighborhood grew beautifully, deeply, peacefully quiet.`,
  },
  {
    id: 'scene-04',
    chapter: 4,
    title: 'Rooftop Delivery School',
    icon: '🏠',
    body: `Pip drew a careful route from chimney to chimney on a piece of nursery paper, tested a small lantern in each direction, and began delivering dreams. Every house received a different adventure: cloud castles for the restless, quiet seas for the anxious, talking teacups for the lonely, and a long golden day spent wandering among the stars for those who simply needed more room.`,
  },
  {
    id: 'scene-05',
    chapter: 5,
    title: 'The Next Little Dream',
    icon: '💻',
    body: `The old computer remains awake in the nursery long after midnight. Every visitor brings a new possibility. There are still dreams to repair, lamps to build, melodies to refine, and stories that need a proper ending. Somewhere between the last lullaby and the first light, Pip left one final small dream — a bedtime note, tucked away for a curious visitor who looks closely enough.`,
  },
];

export const PROJECTS: ProjectMeta[] = [
  {
    id: 'project-lullaby',
    number: '01',
    title: 'The Lullaby Lab',
    tagline: "Pip's tiny music box for restless stars.",
    description:
      'A hand-tuned music-box synthesizer that generates gentle pentatonic melodies from pure browser audio. Each note is shaped by hand — a soft attack, a long warm decay — the way a real music box unwinds.',
    asset: '/assets/pip_lullaby_box.png',
  },
  {
    id: 'project-nightlight',
    number: '02',
    title: 'The Nightlight Collection',
    tagline: 'Tiny pockets of moonlight for little rooms.',
    description:
      'Three carefully tuned lantern presets — Whisper, Moonbeam, and Stardust — each casting exactly the right amount of amber warmth for a small creature trying to sleep. Adjust the brightness to your liking.',
    asset: '/assets/pip_dream_lantern.png',
  },
  {
    id: 'project-map',
    number: '03',
    title: 'Dream Delivery Routes',
    tagline: 'A tiny map of rooftops where dreams arrive one constellation at a time.',
    description:
      'A hand-drawn rooftop map plotting the nightly dream-delivery circuit. Follow the route as it lights up from chimney to chimney, tracing every stop from the Nursery Tower to the last sleeping house on Crescent Lane.',
    asset: undefined,
  },
];

export const NIGHTLIGHT_PRESETS: NightlightPreset[] = [
  {
    id: 'whisper',
    label: 'Whisper',
    description: 'Barely-there amber warmth. For creatures who just need a hint of glow.',
    intensity: 0.2,
    color: '#f59e0b',
  },
  {
    id: 'moonbeam',
    label: 'Moonbeam',
    description: 'Cozy and steady. The standard bedtime glow. Tested on seventeen hedgehogs.',
    intensity: 0.55,
    color: '#fbbf24',
  },
  {
    id: 'stardust',
    label: 'Stardust',
    description: 'Bright enough for reading, warm enough for dreaming. Our most popular setting.',
    intensity: 0.85,
    color: '#ffe88a',
  },
];

export const DELIVERY_DESTINATIONS: DeliveryDestination[] = [
  {
    id: 'nursery-tower',
    name: 'The Nursery Tower',
    description: 'Where Pip lives and works. Every dream begins here.',
    x: 80,
    y: 300,
  },
  {
    id: 'hedgehog-den',
    name: "Hedgehog Den",
    description: 'Three hedgehogs who always want the same cloud-castle dream.',
    x: 310,
    y: 220,
  },
  {
    id: 'crescent-lane',
    name: 'Crescent Lane',
    description: 'The last house on the route. A talking teacup dream, every time.',
    x: 560,
    y: 290,
  },
];

export const PIP_QUOTES = [
  '"I built the dreams you fall asleep inside."',
  '"Every good night begins with good light."',
  '"The off-key note was an artistic decision. Mostly."',
  '"Sleep is serious work. I take it very seriously."',
  '"There is always one more dream to deliver."',
];

export const LULLABY_NOTES: { freq: number; duration: number; delay: number }[] = [
  { freq: 523.25, duration: 0.4, delay: 0.0   },  // C5
  { freq: 659.25, duration: 0.4, delay: 0.45  },  // E5
  { freq: 783.99, duration: 0.5, delay: 0.9   },  // G5
  { freq: 659.25, duration: 0.3, delay: 1.45  },  // E5
  { freq: 587.33, duration: 0.4, delay: 1.8   },  // D5
  { freq: 523.25, duration: 0.6, delay: 2.25  },  // C5
  { freq: 880.00, duration: 0.3, delay: 2.9   },  // A5
  { freq: 783.99, duration: 0.4, delay: 3.25  },  // G5
  { freq: 659.25, duration: 0.5, delay: 3.7   },  // E5
  { freq: 523.25, duration: 0.3, delay: 4.25  },  // C5
  { freq: 587.33, duration: 0.4, delay: 4.6   },  // D5
  { freq: 659.25, duration: 0.3, delay: 5.05  },  // E5
  { freq: 523.25, duration: 0.8, delay: 5.4   },  // C5
  { freq: 440.00, duration: 0.4, delay: 6.25  },  // A4
  { freq: 523.25, duration: 0.4, delay: 6.7   },  // C5
  { freq: 587.33, duration: 0.5, delay: 7.15  },  // D5
  { freq: 659.25, duration: 0.4, delay: 7.7   },  // E5
  { freq: 783.99, duration: 0.6, delay: 8.15  },  // G5
  { freq: 1046.50, duration: 0.3, delay: 8.8  },  // C6
  { freq: 880.00, duration: 0.4, delay: 9.15  },  // A5
  { freq: 783.99, duration: 0.5, delay: 9.6   },  // G5
  { freq: 659.25, duration: 0.8, delay: 10.15 },  // E5
  { freq: 523.25, duration: 1.2, delay: 11.05 },  // C5
];

export const LULLABY_DURATION = 12.5; // seconds before looping

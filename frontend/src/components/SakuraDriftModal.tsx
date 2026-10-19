// =============================================================
// PIP.EXE — Sakura Drift Mini-Game Modal
// Interactive cherry-blossom touge drift simulator built with HTML5 Canvas,
// Web Audio API pentatonic sound, and backend database score persistence.
// =============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Palette, 
  Trophy, 
  Flame, 
  ChevronLeft,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { useVisitorMemory } from '../hooks/useVisitorMemory';
import { submitDriftScore } from '../lib/scoreService';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import styles from '../styles/SakuraDriftModal.module.css';

interface SakuraDriftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 5 Cozy JDM AE86 Colorways
const CAR_PAINTS = [
  { name: 'Sakura Rose', body: '#C83E5B', roof: '#E8839B', hood: '#A62B45', trim: '#2B1D16' },
  { name: 'Panda Trueno', body: '#FAF0E4', roof: '#FFFDF9', hood: '#2B1D16', trim: '#2B1D16' },
  { name: 'Matcha Cream', body: '#6D9468', roof: '#98B894', hood: '#52734E', trim: '#2B1D16' },
  { name: 'Honey Gold', body: '#DF9A44', roof: '#F3C66F', hood: '#B87729', trim: '#2B1D16' },
  { name: 'Midnight Berry', body: '#732540', roof: '#9E4262', hood: '#4D1528', trim: '#F3C66F' },
];

const PRESETS = {
  gentle: { label: 'Gentle', sens: 0.78, ramp: 0.10, driftGrip: 0.925 },
  cozy:   { label: 'Cozy',   sens: 1.00, ramp: 0.13, driftGrip: 0.942 },
  sport:  { label: 'Sporty', sens: 1.24, ramp: 0.18, driftGrip: 0.952 },
};

// 10 Japanese Touge Waypoints
const rawWaypoints = [
  { x: 115, y: 315 },
  { x: 235, y: 270 },
  { x: 330, y: 170 },
  { x: 485, y: 145 },
  { x: 625, y: 205 },
  { x: 645, y: 340 },
  { x: 545, y: 415 },
  { x: 430, y: 315 },
  { x: 300, y: 385 },
  { x: 145, y: 405 },
];

const SAKURA_TREES = [
  { x: 65, y: 80, r: 46 }, { x: 145, y: 65, r: 52 }, { x: 240, y: 72, r: 48 },
  { x: 60, y: 175, r: 44 }, { x: 135, y: 165, r: 40 }, { x: 52, y: 245, r: 38 },
  { x: 560, y: 55, r: 44 }, { x: 660, y: 60, r: 50 }, { x: 745, y: 95, r: 46 },
  { x: 755, y: 195, r: 44 }, { x: 755, y: 310, r: 45 }, { x: 735, y: 425, r: 54 },
  { x: 655, y: 465, r: 48 }, { x: 355, y: 465, r: 52 }, { x: 435, y: 455, r: 56 },
  { x: 275, y: 475, r: 44 }, { x: 60, y: 465, r: 50 }, { x: 155, y: 480, r: 45 },
];

const LANTERNS = [
  { x: 215, y: 185 }, { x: 242, y: 162 }, { x: 390, y: 78 }, { x: 495, y: 78 },
];

const PENTATONIC_HZ = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

export function SakuraDriftModal({ isOpen, onClose }: SakuraDriftModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { profile, saveDriftScore } = useVisitorMemory();
  const prefersReduced = useReducedMotionPreference();

  // State
  const [paintIdx, setPaintIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showHandling, setShowHandling] = useState(false);
  const [handlingPreset, setHandlingPreset] = useState<'gentle' | 'cozy' | 'sport'>('cozy');
  const [steerSens, setSteerSens] = useState(100);
  
  // HUD State
  const [hudTime, setHudTime] = useState('0:00.0');
  const [hudScore, setHudScore] = useState(0);
  const [hudMult, setHudMult] = useState(1);
  const [hudBest, setHudBest] = useState(() => profile?.driftHighScore ?? 0);
  const [hudLap, setHudLap] = useState(1);
  const [hudSpeed, setHudSpeed] = useState(0);
  const [activeDriftPts, setActiveDriftPts] = useState(0);
  const [driftLabel, setDriftLabel] = useState('SAKURA SLIDE!');
  const [toastText, setToastText] = useState<string | null>(null);

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const slideGainRef = useRef<GainNode | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineSubOscRef = useRef<OscillatorNode | null>(null);
  const engineFilterRef = useRef<BiquadFilterNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);

  // Keys ref
  const keysRef = useRef({ up: false, down: false, left: false, right: false, space: false });

  // Game Engine State
  const gameRef = useRef({
    isRunning: false,
    rafId: 0,
    lastTime: 0,
    elapsed: 0,
    car: {
      x: 345,
      y: 165,
      vx: 0,
      vy: 0,
      angle: -0.18,
      angularVel: 0,
      steerInput: 0,
      accel: 0.165,
      maxSpeed: 4.85,
      reverseSpeed: 2.1,
      baseSteer: 0.014,
      steerSens: 1.0,
      steerRamp: 0.13,
      steerReturn: 0.24,
      gripLateral: 0.84,
      driftLateral: 0.942,
      forwardDrag: 0.986,
      isDrifting: false,
      slipAngle: 0,
      onGrass: false,
      prevRL: null as { x: number; y: number } | null,
      prevRR: null as { x: number; y: number } | null,
    },
    score: {
      total: 0,
      best: profile?.driftHighScore ?? 0,
      activeDriftPts: 0,
      multiplier: 1,
      comboHoldTimer: 0,
      driftFrames: 0,
      lap: 1,
      checkpointPassed: false,
    },
    particles: {
      smoke: [] as Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number }>,
      tirePetals: [] as Array<{ x: number; y: number; vx: number; vy: number; rot: number; alpha: number }>,
      ambientPetals: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number; rot: number; rotSpeed: number; color: string }>,
      popups: [] as Array<{ x: number; y: number; text: string; color: string; alpha: number; vy: number }>,
    },
    trackCanvas: null as HTMLCanvasElement | null,
    maskCanvas: null as HTMLCanvasElement | null,
    denseSpline: [] as Array<{ x: number; y: number }>,
  });

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText((curr) => (curr === msg ? null : curr));
    }, 1800);
  }, []);

  // --- Web Audio Synthesizer ---
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      // Tire drift slide audio (bandpassed noise)
      const bufSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const slideFilter = ctx.createBiquadFilter();
      slideFilter.type = 'bandpass';
      slideFilter.frequency.value = 780;
      slideFilter.Q.value = 2.8;

      const slideGain = ctx.createGain();
      slideGain.gain.value = 0;

      noise.connect(slideFilter);
      slideFilter.connect(slideGain);
      slideGain.connect(ctx.destination);
      noise.start();
      slideGainRef.current = slideGain;

      // Car Engine Sound Synthesizer (vintage cozy JDM rumble)
      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 240;
      engineFilter.Q.value = 1.8;

      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;

      // Main sawtooth engine oscillator
      const engineOsc = ctx.createOscillator();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.value = 52;

      // Sub-harmonic triangle oscillator for deep exhaust rumble
      const engineSubOsc = ctx.createOscillator();
      engineSubOsc.type = 'triangle';
      engineSubOsc.frequency.value = 26;

      engineOsc.connect(engineFilter);
      engineSubOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(ctx.destination);

      engineOsc.start();
      engineSubOsc.start();

      engineOscRef.current = engineOsc;
      engineSubOscRef.current = engineSubOsc;
      engineFilterRef.current = engineFilter;
      engineGainRef.current = engineGain;
    } catch {
      /* ignore */
    }
  }, []);

  const ensureAudio = useCallback(async () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* ignore */
      }
    }
  }, [initAudio]);

  const playNote = useCallback((idx = 0) => {
    if (muted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const freq = PENTATONIC_HZ[idx % PENTATONIC_HZ.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.68);
    } catch {
      /* ignore */
    }
  }, [muted, initAudio]);

  const playChord = useCallback(() => {
    [0, 2, 4, 5].forEach((n, i) => {
      setTimeout(() => playNote(n), i * 75);
    });
  }, [playNote]);

  const updateSlideAudio = useCallback((sliding: boolean, intensity: number) => {
    if (!slideGainRef.current || !audioCtxRef.current) return;
    const gain = slideGainRef.current;
    const ctx = audioCtxRef.current;
    if (muted || !gameRef.current.isRunning || !sliding) {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    } else {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const target = Math.min(0.052, intensity * 0.03);
      gain.gain.setTargetAtTime(target, ctx.currentTime, 0.04);
    }
  }, [muted]);

  const updateEngineAudio = useCallback((speed: number, accelerating: boolean, reversing: boolean) => {
    if (!engineOscRef.current || !engineSubOscRef.current || !engineFilterRef.current || !engineGainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = engineOscRef.current;
    const subOsc = engineSubOscRef.current;
    const filter = engineFilterRef.current;
    const gain = engineGainRef.current;

    if (muted || !gameRef.current.isRunning) {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Normalized speed ratio (0 to 1.3)
    const speedRatio = Math.min(1.3, speed / 3.4);
    const throttleBoost = accelerating ? 26 : (reversing ? 14 : 0);
    const targetFreq = 52 + speedRatio * 130 + throttleBoost;

    // Filter opens up when accelerating to let the higher harmonics growl
    const targetFilterCutoff = 220 + speedRatio * 380 + (accelerating ? 220 : 0);
    
    // Smooth, cozy volume that never pierces
    const targetGain = Math.min(0.045, 0.018 + speedRatio * 0.016 + (accelerating ? 0.012 : 0));

    osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
    subOsc.frequency.setTargetAtTime(targetFreq * 0.5, ctx.currentTime, 0.05);
    filter.frequency.setTargetAtTime(targetFilterCutoff, ctx.currentTime, 0.06);
    gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
  }, [muted]);

  // --- Track Building ---
  const buildDenseSpline = useCallback(() => {
    const dense: Array<{ x: number; y: number }> = [];
    const len = rawWaypoints.length;
    const steps = 30;

    for (let i = 0; i < len; i++) {
      const pPrev = rawWaypoints[(i - 1 + len) % len];
      const pCurr = rawWaypoints[i];
      const pNext = rawWaypoints[(i + 1) % len];

      const startX = (pPrev.x + pCurr.x) / 2;
      const startY = (pPrev.y + pCurr.y) / 2;
      const endX = (pCurr.x + pNext.x) / 2;
      const endY = (pCurr.y + pNext.y) / 2;

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const invT = 1 - t;
        const x = invT * invT * startX + 2 * invT * t * pCurr.x + t * t * endX;
        const y = invT * invT * startY + 2 * invT * t * pCurr.y + t * t * endY;
        dense.push({ x, y });
      }
    }
    gameRef.current.denseSpline = dense;
  }, []);

  const traceRoad = useCallback((ctx: CanvasRenderingContext2D) => {
    const dense = gameRef.current.denseSpline;
    if (!dense.length) return;
    ctx.beginPath();
    ctx.moveTo(dense[0].x, dense[0].y);
    for (let i = 1; i < dense.length; i++) {
      ctx.lineTo(dense[i].x, dense[i].y);
    }
    ctx.closePath();
  }, []);

  const initTrackCanvases = useCallback(() => {
    buildDenseSpline();

    const tCanvas = document.createElement('canvas');
    tCanvas.width = 800;
    tCanvas.height = 500;
    const tCtx = tCanvas.getContext('2d')!;

    const mCanvas = document.createElement('canvas');
    mCanvas.width = 800;
    mCanvas.height = 500;
    const mCtx = mCanvas.getContext('2d', { willReadFrequently: true })!;

    // Matcha Lawn
    tCtx.fillStyle = '#9AB37E';
    tCtx.fillRect(0, 0, 800, 500);

    tCtx.fillStyle = '#8FA973';
    for (let y = 15; y < 500; y += 36) {
      for (let x = 15; x < 800; x += 42) {
        if ((x + y) % 3 === 0) {
          tCtx.beginPath();
          tCtx.arc(x, y, 12, 0, Math.PI * 2);
          tCtx.fill();
        }
      }
    }

    // Grass Petals
    for (let i = 0; i < 90; i++) {
      const px = (i * 73 + 31) % 780 + 10;
      const py = (i * 59 + 19) % 480 + 10;
      tCtx.fillStyle = i % 2 === 0 ? '#FFAEC0' : '#FFD4DF';
      tCtx.beginPath();
      tCtx.ellipse(px, py, 3, 1.8, i * 0.7, 0, Math.PI * 2);
      tCtx.fill();
    }

    // Curbs & Road
    traceRoad(tCtx);
    tCtx.lineWidth = 108;
    tCtx.lineCap = 'round';
    tCtx.lineJoin = 'round';
    tCtx.strokeStyle = '#3B2820';
    tCtx.stroke();

    traceRoad(tCtx);
    tCtx.lineWidth = 102;
    tCtx.strokeStyle = '#B84A4A';
    tCtx.stroke();

    traceRoad(tCtx);
    tCtx.lineWidth = 102;
    tCtx.setLineDash([16, 16]);
    tCtx.strokeStyle = '#F5E6CE';
    tCtx.stroke();
    tCtx.setLineDash([]);

    traceRoad(tCtx);
    tCtx.lineWidth = 86;
    tCtx.strokeStyle = '#3B2820';
    tCtx.stroke();

    traceRoad(tCtx);
    tCtx.lineWidth = 82;
    tCtx.strokeStyle = '#5D504E';
    tCtx.stroke();

    traceRoad(tCtx);
    tCtx.lineWidth = 68;
    tCtx.strokeStyle = '#534745';
    tCtx.stroke();

    traceRoad(tCtx);
    tCtx.lineWidth = 2;
    tCtx.setLineDash([14, 18]);
    tCtx.strokeStyle = 'rgba(250, 240, 225, 0.25)';
    tCtx.stroke();
    tCtx.setLineDash([]);

    // Start / Finish Line
    tCtx.save();
    tCtx.translate(415, 152);
    tCtx.rotate(-0.14);
    const sq = 9.5;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 8; c++) {
        tCtx.fillStyle = (r + c) % 2 === 0 ? '#FAF0E1' : '#3B2820';
        tCtx.fillRect((r - 1) * sq, (c - 4) * sq, sq, sq);
      }
    }
    tCtx.restore();

    // Lanterns
    LANTERNS.forEach(({ x, y }) => {
      tCtx.save();
      tCtx.translate(x, y);
      const grad = tCtx.createRadialGradient(0, 0, 2, 0, 0, 22);
      grad.addColorStop(0, 'rgba(243, 198, 111, 0.45)');
      grad.addColorStop(1, 'rgba(243, 198, 111, 0)');
      tCtx.fillStyle = grad;
      tCtx.beginPath();
      tCtx.arc(0, 0, 22, 0, Math.PI * 2);
      tCtx.fill();

      tCtx.fillStyle = '#5C3A28';
      tCtx.fillRect(-3, 2, 6, 12);
      tCtx.fillStyle = '#FFE599';
      tCtx.strokeStyle = '#3B2820';
      tCtx.lineWidth = 1.5;
      tCtx.fillRect(-6, -8, 12, 10);
      tCtx.strokeRect(-6, -8, 12, 10);
      tCtx.fillStyle = '#6E4230';
      tCtx.beginPath();
      tCtx.moveTo(-10, -8);
      tCtx.lineTo(0, -15);
      tCtx.lineTo(10, -8);
      tCtx.closePath();
      tCtx.fill();
      tCtx.stroke();
      tCtx.restore();
    });

    // Trunks
    SAKURA_TREES.forEach(({ x, y, r }) => {
      tCtx.save();
      tCtx.fillStyle = 'rgba(43, 29, 22, 0.22)';
      tCtx.beginPath();
      tCtx.ellipse(x + 6, y + 14, r * 0.85, r * 0.65, 0, 0, Math.PI * 2);
      tCtx.fill();

      tCtx.fillStyle = '#6E4736';
      tCtx.strokeStyle = '#3B2820';
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.moveTo(x - 7, y + r * 0.55);
      tCtx.lineTo(x - 4, y);
      tCtx.lineTo(x + 4, y);
      tCtx.lineTo(x + 8, y + r * 0.55);
      tCtx.closePath();
      tCtx.fill();
      tCtx.stroke();
      tCtx.restore();
    });

    // Mask Canvas for Road Collision
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, 800, 500);
    traceRoad(mCtx);
    mCtx.lineWidth = 98;
    mCtx.lineCap = 'round';
    mCtx.lineJoin = 'round';
    mCtx.strokeStyle = '#FFFFFF';
    mCtx.stroke();

    gameRef.current.trackCanvas = tCanvas;
    gameRef.current.maskCanvas = mCanvas;

    // Ambient Petals
    const ambient: typeof gameRef.current.particles.ambientPetals = [];
    for (let i = 0; i < 38; i++) {
      ambient.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: 0.35 + Math.random() * 0.55,
        vy: 0.25 + Math.random() * 0.45,
        size: 3 + Math.random() * 3.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        color: Math.random() > 0.4 ? '#FFB7C5' : '#FFD6E0',
      });
    }
    gameRef.current.particles.ambientPetals = ambient;
  }, [buildDenseSpline, traceRoad]);

  // --- Reset Game ---
  const resetRun = useCallback((full = true) => {
    const g = gameRef.current;
    g.car.x = 345;
    g.car.y = 165;
    g.car.vx = 0;
    g.car.vy = 0;
    g.car.angle = -0.18;
    g.car.angularVel = 0;
    g.car.steerInput = 0;
    g.car.prevRL = null;
    g.car.prevRR = null;

    g.score.activeDriftPts = 0;
    g.score.multiplier = 1;
    g.score.comboHoldTimer = 0;
    g.score.driftFrames = 0;
    g.score.checkpointPassed = false;

    if (full) {
      g.elapsed = 0;
      g.score.total = 0;
      g.score.lap = 1;
      initTrackCanvases();
    }
  }, [initTrackCanvases]);

  // Persist Score to localStorage and Backend Database
  const commitBestScore = useCallback((score: number) => {
    const finalScore = Math.floor(score);
    if (finalScore <= 0) return;
    saveDriftScore(finalScore);
    setHudBest((prev) => Math.max(prev, finalScore));
    submitDriftScore(finalScore, profile?.name, gameRef.current.score.lap);
  }, [saveDriftScore, profile?.name]);

  // --- Game Loop ---
  useEffect(() => {
    if (!isOpen) return;

    ensureAudio();
    initTrackCanvases();
    resetRun(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    const keys = keysRef.current;
    g.isRunning = true;
    g.lastTime = performance.now();

    playNote(0);
    setTimeout(() => playNote(2), 90);

    const loop = (now: number) => {
      if (!g.isRunning) return;

      const rawDt = (now - g.lastTime) / 1000;
      g.lastTime = now;
      const dtSeconds = Math.min(0.05, Math.max(0.001, rawDt));
      const dtScale = dtSeconds * 60;
      g.elapsed += dtSeconds;

      const keys = keysRef.current;
      const car = g.car;
      const score = g.score;

      // ── Physics ──
      const fx = Math.cos(car.angle);
      const fy = Math.sin(car.angle);
      const rx = -Math.sin(car.angle);
      const ry = Math.cos(car.angle);

      let forwardVel = car.vx * fx + car.vy * fy;
      let lateralVel = car.vx * rx + car.vy * ry;
      const speed = Math.hypot(car.vx, car.vy);

      // Grass detection
      if (g.maskCanvas) {
        const mx = Math.floor(car.x);
        const my = Math.floor(car.y);
        if (mx >= 0 && mx < 800 && my >= 0 && my < 500) {
          const mData = g.maskCanvas.getContext('2d')!.getImageData(mx, my, 1, 1).data;
          car.onGrass = mData[0] < 128;
        } else {
          car.onGrass = true;
        }
      }

      // Throttle & Reverse
      if (keys.up) forwardVel += car.accel * (car.onGrass ? 0.65 : 1.0) * dtScale;
      if (keys.down) forwardVel -= car.accel * 0.85 * dtScale;

      const maxSpd = car.onGrass ? car.maxSpeed * 0.65 : car.maxSpeed;
      if (forwardVel > maxSpd) forwardVel = maxSpd;
      if (forwardVel < -car.reverseSpeed) forwardVel = -car.reverseSpeed;

      // Steering
      const rawSteer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      if (rawSteer !== 0) {
        car.steerInput += (rawSteer - car.steerInput) * Math.min(1, car.steerRamp * dtScale);
      } else {
        car.steerInput += (0 - car.steerInput) * Math.min(1, car.steerReturn * dtScale);
        if (Math.abs(car.steerInput) < 0.01) car.steerInput = 0;
      }

      if (speed > 0.22) {
        const dir = forwardVel >= -0.1 ? 1 : -1;
        const speedCurve = Math.min(1, speed / 2.1) * (1 - speed / (car.maxSpeed * 3.4));
        const driftBoost = keys.space ? 1.12 : 1.0;
        const turnRate = car.baseSteer * car.steerSens * speedCurve * driftBoost * dir;
        car.angularVel += car.steerInput * turnRate * dtScale;
      }

      if (Math.abs(lateralVel) > 0.55 && forwardVel > 1.0 && rawSteer === 0) {
        car.angularVel -= lateralVel * 0.0016 * dtScale;
      }

      const maxAng = 0.046 * car.steerSens;
      if (car.angularVel > maxAng) car.angularVel = maxAng;
      if (car.angularVel < -maxAng) car.angularVel = -maxAng;

      car.angle += car.angularVel * dtScale;
      car.angularVel *= Math.pow(0.64, dtScale);

      const isSliding = Math.abs(lateralVel) > 0.62 || (keys.space && speed > 1.4);
      const latDecay = keys.space ? car.driftLateral : (isSliding ? 0.915 : car.gripLateral);
      lateralVel *= Math.pow(latDecay, dtScale);

      const maxLat = 2.55;
      if (lateralVel > maxLat) lateralVel = maxLat;
      if (lateralVel < -maxLat) lateralVel = -maxLat;

      const drag = keys.space ? 0.976 : (car.onGrass ? 0.955 : car.forwardDrag);
      forwardVel *= Math.pow(drag, dtScale);

      car.vx = fx * forwardVel + rx * lateralVel;
      car.vy = fy * forwardVel + ry * lateralVel;

      car.x += car.vx * dtScale;
      car.y += car.vy * dtScale;

      // Boundaries
      const pad = 22;
      if (car.x < pad) { car.x = pad; car.vx = Math.abs(car.vx) * 0.6; }
      if (car.x > 800 - pad) { car.x = 800 - pad; car.vx = -Math.abs(car.vx) * 0.6; }
      if (car.y < pad) { car.y = pad; car.vy = Math.abs(car.vy) * 0.6; }
      if (car.y > 500 - pad) { car.y = 500 - pad; car.vy = -Math.abs(car.vy) * 0.6; }

      // Checkpoint & Lap Bonus
      if (car.y > 330 && car.x > 350 && car.x < 600) {
        score.checkpointPassed = true;
      }
      if (score.checkpointPassed && car.y < 195 && car.x > 395 && car.x < 445 && forwardVel > 0) {
        score.checkpointPassed = false;
        score.lap++;
        const lapBonus = 500 * score.multiplier;
        score.total += lapBonus;
        commitBestScore(score.total);
        g.particles.popups.push({ x: car.x, y: car.y - 24, text: `🌸 LAP BONUS +${lapBonus}!`, color: '#F3C66F', alpha: 1, vy: -0.9 });
        showToast(`🌸 LAP ${score.lap - 1} COMPLETE! +${lapBonus} PTS`);
        playChord();
      }

      // Drift Score
      car.slipAngle = Math.abs(lateralVel);
      car.isDrifting = speed > 1.55 && (car.slipAngle > 0.55 || (keys.space && car.slipAngle > 0.30));

      const rearX = car.x - fx * 12;
      const rearY = car.y - fy * 12;
      const rl = { x: rearX - rx * 7, y: rearY - ry * 7 };
      const rr = { x: rearX + rx * 7, y: rearY + ry * 7 };

      if (car.isDrifting && car.prevRL && car.prevRR && g.trackCanvas) {
        const tCtx = g.trackCanvas.getContext('2d')!;
        tCtx.save();
        tCtx.strokeStyle = car.onGrass ? 'rgba(92, 64, 40, 0.30)' : 'rgba(43, 29, 22, 0.42)';
        tCtx.lineWidth = 3.2;
        tCtx.lineCap = 'round';
        tCtx.beginPath();
        tCtx.moveTo(car.prevRL.x, car.prevRL.y);
        tCtx.lineTo(rl.x, rl.y);
        tCtx.moveTo(car.prevRR.x, car.prevRR.y);
        tCtx.lineTo(rr.x, rr.y);
        tCtx.stroke();
        tCtx.restore();

        if (Math.random() < 0.75) {
          const tire = Math.random() < 0.5 ? rl : rr;
          g.particles.smoke.push({
            x: tire.x + (Math.random() - 0.5) * 4,
            y: tire.y + (Math.random() - 0.5) * 4,
            vx: -car.vx * 0.14 + (Math.random() - 0.5) * 0.4,
            vy: -car.vy * 0.14 + (Math.random() - 0.5) * 0.4,
            r: 4 + Math.random() * 4.5,
            alpha: 0.85,
          });
        }
        if (Math.random() < 0.45) {
          const tire = Math.random() < 0.5 ? rl : rr;
          g.particles.tirePetals.push({
            x: tire.x,
            y: tire.y,
            vx: -car.vx * 0.2 + (Math.random() - 0.5) * 1.1,
            vy: -car.vy * 0.2 + (Math.random() - 0.5) * 1.1,
            rot: Math.random() * Math.PI * 2,
            alpha: 1.0,
          });
        }
      }

      car.prevRL = rl;
      car.prevRR = rr;

      if (car.isDrifting && !car.onGrass) {
        const framePts = (car.slipAngle * speed) * 0.85 * score.multiplier * dtScale;
        score.total += framePts;
        score.activeDriftPts += framePts;
        score.comboHoldTimer = 75;
        score.driftFrames += dtScale;

        const nextMult = Math.min(8, 1 + Math.floor(score.driftFrames / 55));
        if (nextMult > score.multiplier) {
          score.multiplier = nextMult;
          g.particles.popups.push({ x: car.x, y: car.y - 20, text: `🌸 x${score.multiplier} BLOSSOM COMBO!`, color: '#F6A9BE', alpha: 1, vy: -0.9 });
          playNote(score.multiplier);
        }

        if (score.multiplier >= 4) {
          setDriftLabel('TOUGE MASTER! 🌸');
        } else if (car.slipAngle > 1.45) {
          setDriftLabel('DEEP SAKURA SLIDE!');
        } else {
          setDriftLabel('SAKURA DRIFT!');
        }

        commitBestScore(score.total);
      } else if (score.comboHoldTimer > 0) {
        score.comboHoldTimer -= dtScale;
        if (score.comboHoldTimer <= 0) {
          if (score.activeDriftPts >= 60) {
            g.particles.popups.push({ x: car.x, y: car.y - 18, text: `+${Math.floor(score.activeDriftPts).toLocaleString()} PTS ✨`, color: '#F3C66F', alpha: 1, vy: -0.9 });
            playNote(5);
          }
          score.activeDriftPts = 0;
          score.multiplier = 1;
          score.driftFrames = 0;
        }
      }

      updateSlideAudio(car.isDrifting, car.slipAngle);
      updateEngineAudio(speed, keys.up, keys.down);

      // Update HUD
      const mins = Math.floor(g.elapsed / 60);
      const rem = (g.elapsed % 60).toFixed(1);
      setHudTime(`${mins}:${Number(rem) < 10 ? '0' : ''}${rem}`);
      setHudScore(Math.floor(score.total));
      setHudMult(score.multiplier);
      setHudLap(score.lap);
      setHudSpeed(Math.round(speed * 25));
      setActiveDriftPts(score.activeDriftPts);

      // ── Rendering ──
      ctx.clearRect(0, 0, 800, 500);

      // Base Track
      if (g.trackCanvas) {
        ctx.drawImage(g.trackCanvas, 0, 0);
      }

      // Draw JDM Car
      const paint = CAR_PAINTS[paintIdx];
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Headlight Cones
      const beamGrad = ctx.createLinearGradient(14, 0, 68, 0);
      beamGrad.addColorStop(0, 'rgba(255, 243, 196, 0.32)');
      beamGrad.addColorStop(1, 'rgba(255, 243, 196, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(14, -8);
      ctx.lineTo(68, -24);
      ctx.lineTo(68, 24);
      ctx.lineTo(14, 8);
      ctx.closePath();
      ctx.fill();

      // Drop Shadow
      ctx.fillStyle = 'rgba(28, 17, 12, 0.42)';
      ctx.beginPath();
      ctx.roundRect(-16, -8, 34, 20, 5);
      ctx.fill();

      // Wheels
      const wheelAngle = car.steerInput * 0.36;
      ctx.fillStyle = '#241814';
      ctx.fillRect(-13, -11, 8, 4);
      ctx.fillRect(-13, 7, 8, 4);

      ctx.save();
      ctx.translate(9, -9);
      ctx.rotate(wheelAngle);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();

      ctx.save();
      ctx.translate(9, 9);
      ctx.rotate(wheelAngle);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();

      // Body Chassis
      ctx.fillStyle = paint.body;
      ctx.strokeStyle = '#2B1D16';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-16, -9, 32, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Front Hood
      ctx.fillStyle = paint.hood;
      ctx.beginPath();
      ctx.roundRect(4, -7.5, 10, 15, 2);
      ctx.fill();

      // Windows
      ctx.fillStyle = '#382E3C';
      ctx.beginPath();
      ctx.roundRect(-11, -7, 16, 14, 2.5);
      ctx.fill();

      // Roof
      ctx.fillStyle = paint.roof;
      ctx.beginPath();
      ctx.roundRect(-7, -5.5, 9, 11, 2);
      ctx.fill();

      // Pop-ups
      ctx.fillStyle = '#FFF3B0';
      ctx.fillRect(14, -7.5, 2.5, 4);
      ctx.fillRect(14, 3.5, 2.5, 4);

      // Brake / Drift Lights
      ctx.fillStyle = (keys.down || keys.space) ? '#FF4D6D' : '#8E2C48';
      ctx.fillRect(-16.5, -7.5, 2.5, 4.5);
      ctx.fillRect(-16.5, 3, 2.5, 4.5);
      ctx.restore();

      // Torii Gate
      ctx.save();
      ctx.translate(605, 138);
      ctx.rotate(0.42);
      ctx.fillStyle = '#9E3B3B';
      ctx.strokeStyle = '#3B2820';
      ctx.lineWidth = 2;
      ctx.fillRect(-34, -18, 8, 36);
      ctx.strokeRect(-34, -18, 8, 36);
      ctx.fillRect(26, -18, 8, 36);
      ctx.strokeRect(26, -18, 8, 36);
      ctx.fillRect(-40, -10, 80, 6);
      ctx.strokeRect(-40, -10, 80, 6);
      ctx.fillStyle = '#4A2C2A';
      ctx.beginPath();
      ctx.moveTo(-48, -20);
      ctx.quadraticCurveTo(0, -15, 48, -20);
      ctx.lineTo(44, -12);
      ctx.quadraticCurveTo(0, -8, -44, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Sakura Trees
      SAKURA_TREES.forEach((t) => {
        ctx.save();
        ctx.translate(t.x, t.y);
        const puffs = [
          { dx: 0, dy: 0, pr: t.r * 0.68 },
          { dx: -t.r * 0.42, dy: t.r * 0.12, pr: t.r * 0.52 },
          { dx: t.r * 0.42, dy: t.r * 0.14, pr: t.r * 0.52 },
          { dx: -t.r * 0.25, dy: -t.r * 0.32, pr: t.r * 0.48 },
          { dx: t.r * 0.28, dy: -t.r * 0.28, pr: t.r * 0.48 },
        ];
        ctx.fillStyle = '#EDA2B8';
        ctx.strokeStyle = '#59333E';
        ctx.lineWidth = 2;
        puffs.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.dx, p.dy + 3, p.pr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.fillStyle = '#FFC2D4';
        puffs.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.dx, p.dy, p.pr * 0.92, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#FFE0E9';
        puffs.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.dx - 3, p.dy - 4, p.pr * 0.62, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // Drift Smoke Puffs
      for (let i = g.particles.smoke.length - 1; i >= 0; i--) {
        const p = g.particles.smoke[i];
        p.x += p.vx * dtScale;
        p.y += p.vy * dtScale;
        p.r += 0.14 * dtScale;
        p.alpha -= 0.026 * dtScale;
        if (p.alpha <= 0) {
          g.particles.smoke.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#FFF5F8';
        ctx.strokeStyle = '#E5C5D0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Tire Petals
      for (let i = g.particles.tirePetals.length - 1; i >= 0; i--) {
        const pt = g.particles.tirePetals[i];
        pt.x += pt.vx * dtScale;
        pt.y += pt.vy * dtScale;
        pt.rot += 0.08 * dtScale;
        pt.alpha -= 0.022 * dtScale;
        if (pt.alpha <= 0) {
          g.particles.tirePetals.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = '#FF9EBB';
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ambient Falling Petals
      g.particles.ambientPetals.forEach((ap) => {
        ap.x += ap.vx * dtScale;
        ap.y += ap.vy * dtScale + Math.sin(ap.x * 0.03) * 0.2;
        ap.rot += ap.rotSpeed * dtScale;
        if (ap.x > 810) ap.x = -10;
        if (ap.y > 510) ap.y = -10;

        ctx.save();
        ctx.translate(ap.x, ap.y);
        ctx.rotate(ap.rot);
        ctx.fillStyle = ap.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, ap.size, ap.size * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Popups
      for (let i = g.particles.popups.length - 1; i >= 0; i--) {
        const fp = g.particles.popups[i];
        fp.y += fp.vy * dtScale;
        fp.alpha -= 0.02 * dtScale;
        if (fp.alpha <= 0) {
          g.particles.popups.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = fp.alpha;
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#2B1D16';
        ctx.fillText(fp.text, fp.x - 36 + 1.5, fp.y + 1.5);
        ctx.fillStyle = fp.color;
        ctx.fillText(fp.text, fp.x - 36, fp.y);
        ctx.restore();
      }

      g.rafId = requestAnimationFrame(loop);
    };

    g.rafId = requestAnimationFrame(loop);

    // Keyboard Handlers
    const onKeyDown = (e: KeyboardEvent) => {
      ensureAudio();
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = true;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = true;
          e.preventDefault();
          break;
        case 'Space':
          keysRef.current.space = true;
          e.preventDefault();
          break;
        case 'KeyR':
          resetRun(false);
          showToast('🚗 CAR REPOSITIONED');
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = false;
          break;
        case 'Space':
          keysRef.current.space = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      g.isRunning = false;
      cancelAnimationFrame(g.rafId);
      updateSlideAudio(false, 0);
      updateEngineAudio(0, false, false);
      keys.up = keys.down = keys.left = keys.right = keys.space = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen, ensureAudio, initTrackCanvases, resetRun, onClose, commitBestScore, playChord, playNote, showToast, updateSlideAudio, updateEngineAudio, paintIdx]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(29, 18, 13, 0.78)' }}
      onPointerDown={() => ensureAudio()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`relative w-full max-w-[880px] flex flex-col ${styles.sdWindow} ${prefersReduced ? '' : styles.sdPopIn}`}
      >
        {/* Retro Popup Title Bar */}
        <div className={styles.sdTitlebar}>
          <span className={styles.sdTitle}>SAKURA DRIFT 🌸</span>

          {/* Pilot chip — hidden on narrow screens first */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 ${styles.sdReadout}`}>
            <span style={{ color: '#F6A9BE', fontSize: '10px' }}>✦</span>
            <span style={{ fontFamily: 'var(--font-cozy)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em' }}>PILOT</span>
            <b className="max-w-[110px] truncate" style={{ fontFamily: 'var(--font-cozy)', fontSize: '0.68rem' }} title={profile?.name || 'Nursery Friend'}>
              {profile?.name || 'Nursery Friend'}
            </b>
          </span>

          {/* Right Status Readouts & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            {/* Time Badge - Racing Timer */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(58, 40, 32, 0.95) 0%, rgba(38, 26, 20, 0.98) 100%)',
                border: '1px solid rgba(212, 195, 167, 0.4)',
                borderRadius: '10px',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                minWidth: '60px',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontFamily: 'var(--font-ui, system-ui)', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(212, 195, 167, 0.85)', letterSpacing: '0.06em' }}>LAP TIME</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#FFF8F1', fontSize: '0.8rem' }}>
                {hudTime}
              </span>
            </div>

            {/* Drift Score Badge */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(163, 64, 99, 0.85) 0%, rgba(126, 40, 76, 0.9) 100%)',
                border: '1px solid rgba(246, 169, 190, 0.45)',
                borderRadius: '10px',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 4px rgba(246,169,190,0.2)',
                whiteSpace: 'nowrap',
                minWidth: '70px',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontFamily: 'var(--font-ui, system-ui)', fontSize: '0.6rem', fontWeight: 800, color: '#FFF8F1', letterSpacing: '0.05em' }}>DRIFT</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#F3C66F', fontSize: '0.74rem' }}>
                x{hudMult}
              </span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: '#FFF8F1', fontSize: '0.84rem' }}>
                {hudScore.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Close (ESC)"
              aria-label="Close Sakura Drift game"
              className="group"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(67, 48, 39, 0.9) 0%, rgba(43, 29, 22, 0.95) 100%)',
                border: '1px solid rgba(212, 195, 167, 0.45)',
                color: '#FCEBD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #F6A9BE 0%, #a34063 100%)';
                e.currentTarget.style.borderColor = '#F6A9BE';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(246,169,190,0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(67, 48, 39, 0.9) 0%, rgba(43, 29, 22, 0.95) 100%)';
                e.currentTarget.style.borderColor = 'rgba(212, 195, 167, 0.45)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-150" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close (ESC)"
              aria-label="Close Sakura Drift game"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(67, 48, 39, 0.9)',
                border: '1px solid rgba(222, 195, 167, 0.45)',
                color: '#FCEBD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#a34063';
                e.currentTarget.style.borderColor = '#F6A9BE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(67, 48, 39, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(222, 195, 167, 0.45)';
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Inner Canvas Frame */}
        <div 
          className="rounded-[18px] p-2 sm:p-2.5 relative overflow-hidden"
          style={{ backgroundColor: '#FAF0E1', border: '2px solid #D9BC9C' }}
        >
          <div className="relative w-full aspect-[16/10] rounded-[12px] overflow-hidden bg-[#9AB37E] shadow-inner">
            <canvas ref={canvasRef} width={800} height={500} className="w-full h-full block" />

            {/* Top-Left HUD */}
            <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5">
              <div className="bg-[#2B1D16]/85 backdrop-blur-xs border border-[#DEC3A7]/50 px-3 py-1.5 rounded-xl flex items-center gap-3 text-xs shadow-md text-white max-w-[155px] overflow-hidden">
                <span className="text-[#F6A9BE] font-semibold flex items-center gap-1">
                  <Trophy size={12} /> BEST:
                </span>
                <span className="font-mono font-bold text-amber-200">{hudBest.toLocaleString()}</span>
                <span className="text-white/30">|</span>
                <span className="text-amber-300 font-semibold">LAP:</span>
                <span className="font-mono font-bold text-white">{hudLap}</span>
              </div>

              {/* Active Drift Badge */}
              <div 
                className={`bg-[#a34063]/90 border border-[#F6A9BE]/60 px-3.5 py-1.5 rounded-xl shadow-lg transition-all duration-150 flex items-center gap-2 max-w-[165px] overflow-hidden ${
                  activeDriftPts > 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                }`}
              >
                <Flame size={14} className="text-amber-300 animate-pulse" />
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-white uppercase truncate">{driftLabel}</div>
                  <div className="font-mono text-xs font-bold text-amber-300 truncate">
                    +{Math.floor(activeDriftPts).toLocaleString()} pts
                  </div>
                </div>
              </div>
            </div>

            {/* Top-Right Speedometer & Toast */}
            <div className="absolute top-3 right-3 pointer-events-none flex flex-col items-end gap-1.5">
              <div className="bg-[#2B1D16]/85 backdrop-blur-xs border border-[#DEC3A7]/50 px-3 py-1.5 rounded-xl text-right shadow-md text-white min-w-[56px] overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F6A9BE] shadow-[0_0_6px_rgba(246,169,190,0.6)] flex-shrink-0"></span>
                  <span className="font-mono font-bold text-sm text-white">{hudSpeed}</span>
                  <span className="text-[10px] text-amber-200/70">KM/H</span>
                </div>
              </div>
              {toastText && (
                <div className="bg-[#2B1D16]/95 border border-[#F3C66F] text-[#F3C66F] px-3 py-1.5 rounded-lg text-[11px] font-semibold shadow-md animate-fade-in max-w-[170px] overflow-hidden text-ellipsis whitespace-normal">
                  {toastText}
                </div>
              )}
            </div>

            {/* Touch Controls Overlay for Mobile */}
            <div className="sm:hidden absolute bottom-2.5 inset-x-2.5 flex justify-between items-end pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <button
                  type="button"
                  onTouchStart={(e) => { e.preventDefault(); ensureAudio(); keysRef.current.left = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.left = false; }}
                  className="w-12 h-12 rounded-xl bg-[#2B1D16]/90 border border-[#DEC3A7] active:bg-[#a34063] text-white flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onTouchStart={(e) => { e.preventDefault(); ensureAudio(); keysRef.current.right = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.right = false; }}
                  className="w-12 h-12 rounded-xl bg-[#2B1D16]/90 border border-[#DEC3A7] active:bg-[#a34063] text-white flex items-center justify-center shadow-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex gap-2 pointer-events-auto">
                <button
                  type="button"
                  onTouchStart={(e) => { e.preventDefault(); ensureAudio(); keysRef.current.space = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.space = false; }}
                  className="px-3 h-12 rounded-xl bg-[#a34063]/90 border border-[#F6A9BE]/60 text-white font-bold text-[10px] flex items-center justify-center shadow-lg"
                >
                  🌸 DRIFT
                </button>
                <button
                  type="button"
                  onTouchStart={(e) => { e.preventDefault(); ensureAudio(); keysRef.current.down = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.down = false; }}
                  className="w-11 h-12 rounded-xl bg-[#2B1D16]/90 border border-[#DEC3A7] text-white flex items-center justify-center shadow-lg"
                >
                  <ArrowDown size={18} />
                </button>
                <button
                  type="button"
                  onTouchStart={(e) => { e.preventDefault(); ensureAudio(); keysRef.current.up = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current.up = false; }}
                  className="w-14 h-12 rounded-xl bg-[#4E7A47]/95 border border-[#C5E0B4] text-white font-bold text-xs flex items-center justify-center shadow-lg"
                >
                  GAS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="pt-2.5 pb-2 sm:pb-2.5 px-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#DEC3A7] border-t border-[#DEC3A7]/25"
          style={{ background: 'linear-gradient(180deg, rgba(58, 40, 32, 0.90) 0%, rgba(43, 29, 22, 0.93) 100%)' }}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-gradient-to-b from-[#3B281E] to-[#4E372B] border border-[#6E5243]/70 rounded text-[10px] text-[#FFF8F1] font-mono font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3)]">WASD</kbd>
              <span className="text-[#A89082]">/</span>
              <kbd className="px-2 py-0.5 bg-gradient-to-b from-[#3B281E] to-[#4E372B] border border-[#6E5243]/70 rounded text-[10px] text-[#FFF8F1] font-mono font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3)]">ARROWS</kbd>
              <span className="text-[11px] text-[#C9B3A3] font-medium ml-0.5">Drive</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2.5 py-0.5 bg-gradient-to-b from-[#a34063] to-[#8b3254] border border-[#F6A9BE]/60 rounded text-[10px] text-white font-mono font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_4px_rgba(246,169,190,0.2)]">SPACE</kbd>
              <span className="text-[11px] text-[#F6A9BE] font-semibold">Sakura Drift</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 relative shrink-0">
            <span className="hidden sm:inline-block text-[#DEC3A7]/50">•</span>
            {/* Steering Sensitivity Preset */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  ensureAudio();
                  setShowHandling((v) => !v);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#3B281E] to-[#4E372B] hover:from-[#4E372B] hover:to-[#624233] border border-[#6E5243] text-white text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow-sm shrink-0"
              >
                <Sliders size={13} className="text-[#F3C66F]" />
                <span>Steer: <strong className="text-[#F3C66F] capitalize">{handlingPreset}</strong></span>
              </button>

              {showHandling && (
                <div 
                  className="absolute bottom-10 left-0 w-56 bg-gradient-to-b from-[#2B1D16] to-[#241711] border-2 border-[#DEC3A7] rounded-xl p-3 shadow-2xl z-50 text-left max-w-[calc(100vw-2rem)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#F6A9BE] uppercase">STEERING FEEL</span>
                    <span className="font-mono text-[11px] text-amber-300 font-bold">{steerSens}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {(['gentle', 'cozy', 'sport'] as const).map((key) => {
                      const p = PRESETS[key];
                      const active = handlingPreset === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            ensureAudio();
                            setHandlingPreset(key);
                            setSteerSens(Math.round(p.sens * 100));
                            gameRef.current.car.steerSens = p.sens;
                            gameRef.current.car.steerRamp = p.ramp;
                            gameRef.current.car.driftLateral = p.driftGrip;
                            showToast(`🌸 ${p.label.toUpperCase()} STEERING`);
                            playNote(3);
                          }}
                          className={`text-[10px] font-semibold py-1 rounded border transition ${
                            active 
                              ? 'bg-[#a34063] text-white border-[#F6A9BE]' 
                              : 'bg-[#433027] text-[#DEC3A7] border-[#6E5243]'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={steerSens}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSteerSens(v);
                      gameRef.current.car.steerSens = v / 100;
                    }}
                    className="w-full h-2 accent-[#F6A9BE] cursor-pointer slider-thumb"
                  />
                </div>
              )}
            </div>

            {/* Paint Selector */}
            <button
              type="button"
              onClick={() => {
                ensureAudio();
                const next = (paintIdx + 1) % CAR_PAINTS.length;
                setPaintIdx(next);
                showToast(`🎨 ${CAR_PAINTS[next].name.toUpperCase()}`);
                playNote(4);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#3B281E] to-[#4E372B] hover:from-[#4E372B] hover:to-[#624233] border border-[#6E5243] text-white text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow-sm shrink-0"
            >
              <Palette size={13} className="text-[#F6A9BE]" />
              <span>{CAR_PAINTS[paintIdx].name}</span>
            </button>

            {/* Audio Mute */}
            <button
              type="button"
              onClick={() => {
                ensureAudio();
                setMuted((m) => {
                  const next = !m;
                  if (next) {
                    updateSlideAudio(false, 0);
                    updateEngineAudio(0, false, false);
                  }
                  return next;
                });
              }}
              title={muted ? 'Unmute cozy game audio' : 'Mute game audio'}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#3B281E] to-[#4E372B] hover:from-[#4E372B] hover:to-[#624233] border border-[#6E5243] text-white text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow-sm shrink-0"
            >
              {muted ? <VolumeX size={13} className="text-[#F6A9BE]" /> : <Volume2 size={13} className="text-[#F3C66F]" />}
            </button>

            {/* Reset Run */}
            <button
              type="button"
              onClick={() => {
                ensureAudio();
                resetRun(true);
                showToast('🌸 TRACK & TIMER RESET');
                playNote(1);
              }}
              title="Reset Run (R)"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#3B281E] to-[#4E372B] hover:from-[#4E372B] hover:to-[#624233] border border-[#6E5243] text-white text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow-sm shrink-0"
            >
              <RotateCcw size={13} className="text-[#F3C66F]" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SakuraDriftModal;

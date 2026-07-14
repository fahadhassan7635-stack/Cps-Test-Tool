'use client';

import {
  useState, useRef, useCallback, useEffect, useReducer
} from 'react';
import { Link } from 'react-router-dom';
import { Maximize, Minimize } from 'lucide-react';

// ── Target image ──────────────────────────────────────────────────────────────
const SKULL_IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAt8AAAJvCAIAAAAsoirmAAAQAElEQVR4Aey9B7xdV3Xnv/dpt7fX+3t66s2yZVvuDRdwb4AxCRiYkEn+afP/J5NkhiQTPkMKzGSSAJkEUggtQCAkQEiAAAaDwQb3bkuWbUlWL6+/W565//lHM3NUxvGFTIY8H5Y+65299r7rrLXPvvvWtd5/pB8xIAbEgBgQA2JADIgBMSAGxIAYEANiQAyIATEgBsSAGBADYuA/lYFa9YM+YkAM/D8mMDs7+8pXvvJz9zpKKf6mVCr9wA/8gGVZzGKzWZZlbDRNa5oGa9v2n8XY5uK8Vqs1TZOfxWKRj5xO0zSTyfBHxWKRz2xB4A/RQ0LFYpH12WwWA2NxTKfTuVwOMxaxUlqrRUJb9GkYRj6f5w9x4TDkhlmxWJyfn+ecvVKplC6XeR38ZG42myV/nAZaG3Q6nWzE1jRNRA4Gg2fPnu3v7z958uSJEyeazSbRQMhKpVJZWVlZWFhARwzHYzGGkxAO0YbYWtVjMpngkPUpAcTvL3zhC7yLLmSAn/gnPWynZvzk1PjEwZ3d3T0oCiIRVjTNbrfDpiiKUUcOoY6BgSGqRhVoGw6BQIDlYHFMJFOwLBaLxRIeeoM0jkYlk8kU3sJ6EInVoQozKgh97OMfNzc39/f3T09Pi0QCXYAI7GaMNI3iNJvNwWCwXC7DPmyoDLFCxpVUKgXjcxlLzhRmYWEBZFEmigTGe9pTVXXFihW7d+9WKBRQGyC0LCsMAkzTZG4wGAADg8FgIBAA6iiXy7VaLZ1O53I50Ky2trbcbjc2PB6PTqcbHR2NRqM6nS4YDDIhOa+trQ0ODra1tYVCoU6nA+RUKhV0DAaDdrsdd8OZTGZmZmZgYCAej+PxeJfLpVKpsAyHwzabDflEo1FIY7VaZbFYIpEIiIhEIslkEgWEQiFwHwqFuru7wRQPD16v9+jRo5gN0DRNU9M0uVwOBoOAGaFQCC6BQOD09PSpU6cwwHK5PDo6mkgkAIL29nZQC4/HkYCUVCoVjcaLxWJ7ezueh8Ph0dHRXC63t7cnFov9fj9wsFqtxsbGYCwWi9lsNi6XKxAI2Gy2ubk5FBWNRuvr69PptFqtxmKxYDBIJpMoisFgUKvVGo3G6/UGAgGz2VwqlXK5nEQiiUQiJpMJj8dLpVJer3d1dfXChQtCoRDbaKgURVEcx6nVamgeCoUwGAwIBGQyGZTgjcVi8Xq9ZrOZzWaTyeQyMzPPPfccPHzp0qXY7XanU0kJhcJIJILP58/Ozo6MjNjt9lgshsvlSqUSTQMLbW1t7Xa7DA0NNRoNsVjc09MTiUQymczU1BS5uTk5eXt7e2VlZWNjIx6P29ravF6vWq3G09PT27dvY7NZLBbYy6q1WrVaTaVSDMPYbLZUKhWLxWSyOQvbP7z//e/nZWZmSCQSFhcXQ1Kj0Yjjcb1e73a7GY1GkiTZbLZWq0UikXQ63ev1SqXSw+GwWCw2NDS0trbGlNPpNJfLxWKxeXl53d3dOTk5x8fHnZ2dCoWCwWCoVCqNRoM3z8/Pj4+P7+/vk5OTkUgkFAqJRCJisdhkMuG9BwcHW1tbFxYWksmk1WrFYrHpdIrH461Wm5+f393dTqfT29qaiEQiKpUKw5CWlobBYNhstlgsFovFEomEUqm0Wq04HG6z2ex2u1arRSKR6HR6WCzGYDA6nY7NZjMYDBAEBoNBIBAgLzQaDbFYzGKxaLXaWCyGpNvb2yORSNjt9m63g9lqtaZQKAqFAmVFo9EIhUJgYCARCIRer5fL5VQq5XA4WKw2FoslkskkkolEIoFAAAAgEAgEAgFEIhGZTKZUKtVqNZ1OB5ubm4uKikwmU0dHR0dHR2trK41GA4vFsFgsr9frwYMHfX19s7Ozzc3NBwcHzs7OJicnFYvFRqOxVCplsVh0Op1yuVwqlSKRSAAAgEQioVQqBQIBk8kEDsvlcqlUCiSAgYFAIBaLwWKxlEqlSCTicrmqqir9/f0EAgEej4dCoTQ0NPD5fLPZzGQyBQIBnU4H0oNCoRAKhWQyGYVCUalUEAqFcDgcm81mMBhIJBKZTKZUKvV6PYlEwmAwOI4jkUgkEgmDwUAgEDAYDAAAIABKoRBIJBIREDgiQAAc0EEBghkAACJCQIIAAlQAAAACABSAAAAAA/wPvB1t/E9K5MgAAAABJRU5ErkJggg==';

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'countdown' | 'running' | 'paused' | 'done';
type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
type DifficultyKey = 'easy' | 'medium' | 'hard' | 'pro' | 'impossible';
type DurationKey = '1' | '3' | '5' | '10' | '30' | 'custom' | 'unlimited';

interface DifficultyConfig {
  label: string;
  tag: string;
  color: string;
  glow: string;
  accentRgb: string;
  multiplier: number;
  minSize: number;
  maxSize: number;
  lifetime: number;
  spawnInterval: number;
  maxConcurrent: number;
  moveChance: number;
  minSpeed: number;
  maxSpeed: number;
}

interface TargetT {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  spawnTime: number;
  lifetime: number;
  vx: number;
  vy: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface FloatingText { id: number; x: number; y: number; text: string; color: string; }
interface Ripple { id: number; x: number; y: number; color: string; }

interface SessionResult {
  id: string;
  date: string;
  difficulty: DifficultyKey;
  durationLabel: string;
  score: number;
  accuracy: number;
  hits: number;
  misclicks: number;
  targetsMissed: number;
  peakCombo: number;
  reactionTime: number;
  grade: Grade;
  stars: number;
  totalClicks: number;
  avgPoints: number;
  peakHitsPerSec: number;
  bestStreak: number;
  duration: number;
}

interface GameState {
  score: number;
  hits: number;
  misclicks: number;
  targetsMissed: number;
  combo: number;
  peakCombo: number;
  streak: number;
  bestStreak: number;
  totalClicks: number;
  reactionTimes: number[];
  hitsPerSecBuffer: number[];
  peakHitsPerSec: number;
}

type GameAction =
  | { type: 'RESET' }
  | { type: 'HIT'; points: number; reactionTime: number; timestamp: number }
  | { type: 'MISCLICK' }
  | { type: 'EXPIRE' };

// ── Config ────────────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    label: 'Easy', tag: 'EZ', color: '#34d399', glow: 'rgba(52,211,153,0.4)', accentRgb: '52,211,153',
    multiplier: 1, minSize: 64, maxSize: 86, lifetime: 2000, spawnInterval: 80,
    maxConcurrent: 1, moveChance: 0, minSpeed: 0, maxSpeed: 0,
  },
  medium: {
    label: 'Normal', tag: 'NRM', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', accentRgb: '96,165,250',
    multiplier: 1.6, minSize: 64, maxSize: 86, lifetime: 1300, spawnInterval: 65,
    maxConcurrent: 2, moveChance: 0.25, minSpeed: 40, maxSpeed: 85,
  },
  hard: {
    label: 'Hard', tag: 'HRD', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', accentRgb: '245,158,11',
    multiplier: 2.4, minSize: 64, maxSize: 86, lifetime: 900, spawnInterval: 45,
    maxConcurrent: 3, moveChance: 0.55, minSpeed: 75, maxSpeed: 135,
  },
  pro: {
    label: 'Pro', tag: 'PRO', color: '#f97316', glow: 'rgba(249,115,22,0.4)', accentRgb: '249,115,22',
    multiplier: 3.4, minSize: 64, maxSize: 86, lifetime: 620, spawnInterval: 30,
    maxConcurrent: 3, moveChance: 0.8, minSpeed: 115, maxSpeed: 195,
  },
  impossible: {
    label: 'Impossible', tag: 'IMP', color: '#e879f9', glow: 'rgba(232,121,249,0.4)', accentRgb: '232,121,249',
    multiplier: 4.6, minSize: 64, maxSize: 86, lifetime: 420, spawnInterval: 18,
    maxConcurrent: 4, moveChance: 0.95, minSpeed: 165, maxSpeed: 265,
  },
};

const DIFFICULTY_ORDER: DifficultyKey[] = ['easy', 'medium', 'hard', 'pro', 'impossible'];

const DURATION_OPTIONS: { key: DurationKey; label: string; seconds: number | null }[] = [
  { key: '1', label: '1s', seconds: 1 },
  { key: '3', label: '3s', seconds: 3 },
  { key: '5', label: '5s', seconds: 5 },
  { key: '10', label: '10s', seconds: 10 },
  { key: '30', label: '30s', seconds: 30 },
  { key: 'custom', label: 'Custom', seconds: null },
  { key: 'unlimited', label: '∞', seconds: null },
];

const COMBO_THRESHOLDS = [5, 10, 20, 35] as const;
const COMBO_MULTIPLIERS: Record<number, number> = { 0: 1, 5: 1.5, 10: 2, 20: 2.5, 35: 3 };
const STORAGE_KEY = 'aim-trainer-v2-history';
const SETTINGS_KEY = 'aim-trainer-v2-settings';
const DIFF_GRADE_BONUS: Record<DifficultyKey, number> = { easy: 0, medium: 5, hard: 10, pro: 16, impossible: 24 };

// ── Safe localStorage helpers ─────────────────────────────────────────────────
function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}
function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

function getComboMultiplier(combo: number): number {
  const thresholds = Object.keys(COMBO_MULTIPLIERS).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) if (combo >= t) return COMBO_MULTIPLIERS[t];
  return 1;
}

function calcPoints(size: number, multiplier: number, combo: number): number {
  const base = 90 * (36 / (size + 8));
  return Math.max(1, Math.round(base * multiplier * getComboMultiplier(combo)));
}

function calcGrade(accuracy: number, avgReaction: number, diff: DifficultyKey): Grade {
  const adj = accuracy + DIFF_GRADE_BONUS[diff];
  if (adj >= 100 && avgReaction > 0 && avgReaction <= 380) return 'S';
  if (adj >= 92) return 'A';
  if (adj >= 80) return 'B';
  if (adj >= 65) return 'C';
  if (adj >= 45) return 'D';
  return 'F';
}

function calcStars(grade: Grade): number {
  return { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[grade];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function durationLabelFor(key: DurationKey, customSeconds: number): string {
  if (key === 'unlimited') return '∞';
  if (key === 'custom') return `${customSeconds}s`;
  return `${key}s`;
}

const initialGameState: GameState = {
  score: 0, hits: 0, misclicks: 0, targetsMissed: 0, combo: 0, peakCombo: 0,
  streak: 0, bestStreak: 0, totalClicks: 0, reactionTimes: [], hitsPerSecBuffer: [], peakHitsPerSec: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET': return { ...initialGameState };
    case 'HIT': {
      const newCombo = state.combo + 1;
      const newStreak = state.streak + 1;
      const newTimes = [...state.reactionTimes, action.reactionTime].slice(-80);
      const newBuf = [...state.hitsPerSecBuffer, action.timestamp].filter(t => action.timestamp - t < 1000);
      return {
        ...state,
        score: state.score + action.points,
        hits: state.hits + 1,
        combo: newCombo,
        peakCombo: Math.max(state.peakCombo, newCombo),
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
        totalClicks: state.totalClicks + 1,
        reactionTimes: newTimes,
        hitsPerSecBuffer: newBuf,
        peakHitsPerSec: Math.max(state.peakHitsPerSec, newBuf.length),
      };
    }
    case 'MISCLICK':
      return { ...state, misclicks: state.misclicks + 1, combo: 0, streak: 0, totalClicks: state.totalClicks + 1 };
    case 'EXPIRE':
      return { ...state, targetsMissed: state.targetsMissed + 1, combo: 0, streak: 0 };
    default:
      return state;
  }
}

// ── Sound engine ──────────────────────────────────────────────────────────────
function useSoundEngine(enabled: boolean, volume: number) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        ctxRef.current = new AudioCtx();
      }
      return ctxRef.current;
    } catch { return null; }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, dur: number, gain: number, startFreq?: number) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      const now = ctx.currentTime;
      if (startFreq !== undefined) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(0.001, freq), now + dur * 0.5);
      } else {
        osc.frequency.setValueAtTime(freq, now);
      }
      g.gain.setValueAtTime(Math.max(0.0001, gain * volume), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now); osc.stop(now + dur);
    } catch {}
  }, [enabled, volume, getCtx]);

  return {
    hit: useCallback(() => playTone(720, 'sine', 0.06, 0.28, 340), [playTone]),
    miss: useCallback(() => playTone(130, 'sawtooth', 0.1, 0.18), [playTone]),
    expire: useCallback(() => playTone(100, 'triangle', 0.12, 0.14), [playTone]),
    combo: useCallback((n: number) => playTone(440 + n * 18, 'square', 0.07, 0.18), [playTone]),
    countdown: useCallback((n: number) => playTone(n === 0 ? 960 : 480, 'sine', 0.14, 0.32), [playTone]),
    finish: useCallback(() => {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.28, 0.28), i * 110));
    }, [playTone]),
  };
}

// ── Canvas particle system ────────────────────────────────────────────────────
function useParticleCanvas(areaRef: React.RefObject<HTMLDivElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const pidRef = useRef(0);

  useEffect(() => {
    if (!areaRef.current) return;
    let canvas = canvasRef.current;
    let mounted = true;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:20;border-radius:inherit;';
      areaRef.current.appendChild(canvas);
      canvasRef.current = canvas;
    }
    const resize = () => {
      if (!mounted || !canvas || !areaRef.current) return;
      canvas.width = areaRef.current.offsetWidth;
      canvas.height = areaRef.current.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(areaRef.current);

    let running = true;
    const draw = () => {
      if (!running || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.life -= 0.025;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas?.remove();
      canvasRef.current = null;
    };
  }, [areaRef]);

  const burst = useCallback((x: number, y: number, color: string, count = 10) => {
    const newP: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      return {
        id: ++pidRef.current,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        size: 2 + Math.random() * 3.5,
        life: 0.7 + Math.random() * 0.5,
      };
    });
    particlesRef.current.push(...newP);
  }, []);

  return { burst };
}

// ── More Tools data ──────────────────────────────────────────────── FIXED LINKS ──
interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  // FIX: '/spacebar-counter' → '/spacebar' (matches App.tsx route)
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: 'Sniper Mode', href: '/sniper-mode', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
];

// ── SEO content ───────────────────────────────────────────────────────────────
const SUPPORTED_GAMES = [
  'Valorant', 'Counter-Strike 2', 'Call of Duty: Warzone', 'Apex Legends',
  'Overwatch 2', 'Fortnite', 'PUBG: Battlegrounds', 'Rainbow Six Siege',
  'Destiny 2', 'League of Legends',
] as const;

interface FaqEntry { id: string; question: string; answer: React.ReactNode; }

const FAQ_ENTRIES: FaqEntry[] = [
  { id: 'faq-free', question: 'Is this online aim trainer free to use?', answer: 'Yes. The full game — every difficulty tier, every duration mode, sound, and session history — runs free in your browser. No account, download, or subscription is required.' },
  { id: 'faq-difficulty', question: 'What exactly changes between Easy, Normal, Hard, Pro, and Impossible?', answer: 'Five variables shift together: target size, how long a target stays alive, how often new targets spawn, whether targets move (and how fast), and the score multiplier. Easy spawns large, stationary, slow-expiring targets at a ×1 multiplier. Impossible spawns tiny, fast, short-lived targets — up to four on screen at once — at a ×4.6 multiplier.' },
  { id: 'faq-duration', question: 'What match durations can I choose from?', answer: 'Quick sprints of 1, 3, 5, 10, or 30 seconds, a custom length up to 600 seconds, or Unlimited mode, which counts time up instead of down and only ends when you press Stop.' },
  { id: 'faq-scoring', question: 'How is my score calculated on each hit?', answer: "Smaller targets are worth more base points than larger ones. That base value is then multiplied by the selected difficulty's score multiplier and by your current combo multiplier, then rounded to the nearest whole point." },
  { id: 'faq-combo', question: 'How does the combo multiplier system work?', answer: 'Consecutive hits build a combo counter. Reaching 5, 10, 20, or 35 hits in a row raises your multiplier to ×1.5, ×2, ×2.5, and ×3 respectively. A misclick or an expired target resets the combo to zero immediately.' },
  { id: 'faq-grade', question: 'How are the S through F grades determined?', answer: 'Your grade blends accuracy with a difficulty bonus. An S grade additionally requires a sub-380ms average reaction time on top of a perfect adjusted score.' },
  { id: 'faq-reaction-time', question: 'How is reaction time measured?', answer: 'For every target you hit, the trainer records the gap between the moment it spawned and the moment you clicked it, then averages that figure across the whole session.' },
  { id: 'faq-moving-targets', question: 'Why do some targets move and others stay still?', answer: 'Each difficulty tier has its own move chance. Easy targets never move, Normal targets move about a quarter of the time, and Pro and Impossible targets are moving almost every spawn.' },
  { id: 'faq-sound', question: 'Can I turn the sound off or adjust the volume?', answer: 'Yes. The speaker icon toggles all sound instantly, and a volume slider appears whenever sound is enabled. Both preferences are remembered the next time you open the trainer.' },
  { id: 'faq-keyboard', question: 'What keyboard shortcuts does the trainer support?', answer: 'Space starts a match from the idle or results screen. P or Escape pauses and resumes a running match. R restarts the current session instantly.' },
  { id: 'faq-mobile', question: 'Does the aim trainer work on mobile and touchscreens?', answer: 'Yes. Targets respond to touch as well as click, and the arena blocks touch-scrolling during play.' },
  { id: 'faq-history', question: 'Where is my session history stored?', answer: 'Your last 30 sessions are saved locally in your browser. Nothing is uploaded anywhere.' },
  { id: 'faq-privacy', question: 'Is any of my data sent to a server?', answer: 'No. Every setting, every session result, and your entire history live only in your browser\'s local storage.' },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const h2Style: React.CSSProperties = {
  fontWeight: 800, fontSize: '1.55rem', color: '#ffffff', marginBottom: '0.85rem',
  letterSpacing: '-0.01em', lineHeight: 1.3,
};
const h3Style: React.CSSProperties = {
  fontWeight: 700, fontSize: '1rem', color: '#e0e0ec', marginBottom: '0.4rem',
};
const pStyle: React.CSSProperties = {
  color: '#9797a8', fontSize: '0.92rem', lineHeight: 1.75, margin: 0,
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AimTrainerPage() {
  // Settings — safe localStorage reads
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const s = JSON.parse(safeGetItem(SETTINGS_KEY) || '{}');
      return typeof s?.soundEnabled === 'boolean' ? s.soundEnabled : true;
    } catch { return true; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try {
      const s = JSON.parse(safeGetItem(SETTINGS_KEY) || '{}');
      const v = Number(s?.volume);
      return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.5;
    } catch { return 0.5; }
  });

  useEffect(() => {
    safeSetItem(SETTINGS_KEY, JSON.stringify({ soundEnabled, volume }));
  }, [soundEnabled, volume]);

  // Config
  const [difficulty, setDifficulty] = useState<DifficultyKey>('medium');
  const [durationKey, setDurationKey] = useState<DurationKey>('10');
  const [customSeconds, setCustomSeconds] = useState<number>(15);
  const [customInput, setCustomInput] = useState('15');

  // Game state
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [targets, setTargets] = useState<TargetT[]>([]);
  const [clock, setClock] = useState(10);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [floatTexts, setFloatTexts] = useState<FloatingText[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<SessionResult[]>(() => {
    try {
      const parsed = JSON.parse(safeGetItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [comboFlash, setComboFlash] = useState<{ text: string; key: number } | null>(null);
  const [hoveredDiff, setHoveredDiff] = useState<DifficultyKey | null>(null);
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [showHistory, setShowHistory] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const clockRef = useRef(10);
  const gameStateRef = useRef(gameState);
  const targetTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const pauseDataRef = useRef<{ clock: number } | null>(null);
  const gameStartTime = useRef(0);
  const configRef = useRef<DifficultyConfig>(DIFFICULTY_CONFIG.medium);
  const sessionDurationRef = useRef<number | null>(10);
  // Synchronous live target count — avoids stale closure bug
  const liveTargetCountRef = useRef(0);
  const difficultyAtStartRef = useRef<DifficultyKey>('medium');
  const durationLabelRef = useRef('10s');
  const decayTimeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  // Track if component is still mounted to prevent setState after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Sync refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { clockRef.current = clock; }, [clock]);

  const sfx = useSoundEngine(soundEnabled, volume);
  const { burst } = useParticleCanvas(areaRef);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      areaRef.current?.requestFullscreen?.().then(() => {
        if (mountedRef.current) setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => {
        if (mountedRef.current) setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => { if (mountedRef.current) setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Cleanup helpers
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
  }, []);

  // Tracked timeout — auto-cleaned on unmount
  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      decayTimeouts.current.delete(id);
      if (mountedRef.current) fn();
    }, ms);
    decayTimeouts.current.add(id);
    return id;
  }, []);

  useEffect(() => () => {
    decayTimeouts.current.forEach(t => clearTimeout(t));
    decayTimeouts.current.clear();
  }, []);

  // Float text & ripple helpers
  const spawnFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    if (prefersReducedMotion || !mountedRef.current) return;
    const id = ++floatIdRef.current;
    setFloatTexts(prev => [...prev, { id, x, y, text, color }]);
    trackedTimeout(() => setFloatTexts(prev => prev.filter(f => f.id !== id)), 900);
  }, [prefersReducedMotion, trackedTimeout]);

  const spawnRipple = useCallback((x: number, y: number, color: string) => {
    if (prefersReducedMotion || !mountedRef.current) return;
    const id = ++rippleIdRef.current;
    setRipples(prev => [...prev, { id, x, y, color }]);
    trackedTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, [prefersReducedMotion, trackedTimeout]);

  // Finalise result
  const finaliseResult = useCallback(() => {
    const gs = gameStateRef.current;
    const acc = gs.totalClicks > 0 ? Math.round((gs.hits / gs.totalClicks) * 100) : 100;
    const avgR = gs.reactionTimes.length > 0
      ? gs.reactionTimes.reduce((a, b) => a + b, 0) / gs.reactionTimes.length : 0;
    const grade = calcGrade(acc, avgR, difficultyAtStartRef.current);
    const dur = Math.round((Date.now() - gameStartTime.current) / 1000);
    const result: SessionResult = {
      id: String(Date.now()), date: new Date().toISOString(),
      difficulty: difficultyAtStartRef.current, durationLabel: durationLabelRef.current,
      score: gs.score, accuracy: acc, hits: gs.hits, misclicks: gs.misclicks,
      targetsMissed: gs.targetsMissed, peakCombo: gs.peakCombo, reactionTime: avgR,
      grade, stars: calcStars(grade), totalClicks: gs.totalClicks,
      avgPoints: gs.hits > 0 ? gs.score / gs.hits : 0,
      peakHitsPerSec: gs.peakHitsPerSec, bestStreak: gs.bestStreak, duration: dur,
    };
    if (mountedRef.current) {
      setLastResult(result);
      setHistory(prev => {
        const updated = [result, ...prev].slice(0, 30);
        safeSetItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Spawn target
  const spawnTarget = useCallback(() => {
    if (!areaRef.current || phaseRef.current !== 'running') return;
    const cfg = configRef.current;
    if (liveTargetCountRef.current >= cfg.maxConcurrent) return;
    liveTargetCountRef.current += 1;
    const rect = areaRef.current.getBoundingClientRect();
    const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const padding = size / 2 + 8;
    const x = padding + Math.random() * Math.max(0, rect.width - padding * 2);
    const y = padding + Math.random() * Math.max(0, rect.height - padding * 2);
    let vx = 0, vy = 0;
    if (Math.random() < cfg.moveChance) {
      const angle = Math.random() * Math.PI * 2;
      const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
      vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
    }
    const id = ++targetIdRef.current;
    const points = calcPoints(size, cfg.multiplier, gameStateRef.current.combo);
    const target: TargetT = { id, x, y, size, points, spawnTime: Date.now(), lifetime: cfg.lifetime, vx, vy };
    if (mountedRef.current) setTargets(prev => [...prev, target]);
  }, []);

  // Movement RAF
  useEffect(() => {
    if (phase !== 'running') return;
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mountedRef.current) {
        setTargets(prev => {
          if (prev.length === 0) return prev;
          const rect = areaRef.current?.getBoundingClientRect();
          return prev.map(t => {
            if (t.vx === 0 && t.vy === 0) return t;
            let nx = t.x + t.vx * dt, ny = t.y + t.vy * dt;
            let nvx = t.vx, nvy = t.vy;
            if (rect) {
              const r = t.size / 2 + 4;
              if (nx - r < 0) { nx = r; nvx = Math.abs(nvx); }
              if (nx + r > rect.width) { nx = rect.width - r; nvx = -Math.abs(nvx); }
              if (ny - r < 0) { ny = r; nvy = Math.abs(nvy); }
              if (ny + r > rect.height) { ny = rect.height - r; nvy = -Math.abs(nvy); }
            }
            return { ...t, x: nx, y: ny, vx: nvx, vy: nvy };
          });
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // End game
  const endGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    liveTargetCountRef.current = 0;
    if (mountedRef.current) {
      setPhase('done'); phaseRef.current = 'done';
      setTargets([]);
    }
    sfx.finish();
    finaliseResult();
  }, [sfx, finaliseResult]);

  // Timer loop
  const startTimerLoop = useCallback((initialElapsed: number, durationSeconds: number | null) => {
    let elapsed = initialElapsed;
    const tick = () => {
      if (!mountedRef.current) return;
      elapsed += 0.1;
      if (durationSeconds === null) {
        clockRef.current = elapsed; setClock(elapsed); return;
      }
      const left = Math.max(0, durationSeconds - elapsed);
      clockRef.current = left; setClock(left);
      if (left <= 0) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        endGame();
      }
    };
    timerRef.current = setInterval(tick, 100);
  }, [endGame]);

  // Start game engine
  const startGameEngine = useCallback(() => {
    gameStartTime.current = Date.now();
    const cfg = configRef.current;
    for (let i = 0; i < cfg.maxConcurrent; i++) spawnTarget();
    spawnRef.current = setInterval(spawnTarget, cfg.spawnInterval);
    startTimerLoop(0, sessionDurationRef.current);
  }, [spawnTarget, startTimerLoop]);

  // Begin countdown
  const beginCountdown = useCallback(() => {
    clearAllTimers();
    liveTargetCountRef.current = 0;
    dispatch({ type: 'RESET' });
    if (mountedRef.current) {
      setTargets([]); setFloatTexts([]); setRipples([]);
      setLastResult(null);
    }
    const cfg = DIFFICULTY_CONFIG[difficulty];
    configRef.current = cfg;
    difficultyAtStartRef.current = difficulty;
    const durationSeconds = durationKey === 'unlimited' ? null
      : durationKey === 'custom' ? customSeconds : Number(durationKey);
    sessionDurationRef.current = durationSeconds;
    durationLabelRef.current = durationLabelFor(durationKey, customSeconds);
    if (mountedRef.current) {
      setClock(durationSeconds ?? 0); clockRef.current = durationSeconds ?? 0;
      setCountdown(3);
      setPhase('countdown'); phaseRef.current = 'countdown';
    }
    let count = 3;
    sfx.countdown(count);
    let localCountdownId: ReturnType<typeof setInterval>;
    localCountdownId = setInterval(() => {
      if (countdownRef.current !== localCountdownId) return;
      count--;
      if (mountedRef.current) setCountdown(count);
      sfx.countdown(count);
      if (count <= 0) {
        clearInterval(localCountdownId); countdownRef.current = null;
        if (mountedRef.current) { setPhase('running'); phaseRef.current = 'running'; }
        startGameEngine();
      }
    }, 1000);
    countdownRef.current = localCountdownId;
  }, [clearAllTimers, sfx, startGameEngine, difficulty, durationKey, customSeconds]);

  const resetSession = useCallback(() => beginCountdown(), [beginCountdown]);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    pauseDataRef.current = { clock: clockRef.current };
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    liveTargetCountRef.current = 0;
    if (mountedRef.current) {
      setTargets([]);
      setPhase('paused'); phaseRef.current = 'paused';
    }
  }, []);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    const savedClock = pauseDataRef.current?.clock ?? clockRef.current;
    const durationSeconds = sessionDurationRef.current;
    const elapsedSoFar = durationSeconds === null ? savedClock : durationSeconds - savedClock;
    if (mountedRef.current) { setPhase('running'); phaseRef.current = 'running'; }
    const cfg = configRef.current;
    for (let i = 0; i < cfg.maxConcurrent; i++) spawnTarget();
    spawnRef.current = setInterval(spawnTarget, cfg.spawnInterval);
    startTimerLoop(elapsedSoFar, durationSeconds);
  }, [spawnTarget, startTimerLoop]);

  const exitToIdle = useCallback(() => {
    clearAllTimers();
    liveTargetCountRef.current = 0;
    if (mountedRef.current) {
      setPhase('idle'); phaseRef.current = 'idle';
      setTargets([]); setLastResult(null);
    }
  }, [clearAllTimers]);

  // Hit target
  const hitTarget = useCallback((target: TargetT, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;
    const to = targetTimeouts.current.get(target.id);
    if (to) { clearTimeout(to); targetTimeouts.current.delete(target.id); }
    if (mountedRef.current) setTargets(prev => prev.filter(t => t.id !== target.id));
    liveTargetCountRef.current = Math.max(0, liveTargetCountRef.current - 1);
    const rt = Date.now() - target.spawnTime;
    const now = Date.now();
    dispatch({ type: 'HIT', points: target.points, reactionTime: rt, timestamp: now });
    sfx.hit();
    spawnTarget();
    const newCombo = gameStateRef.current.combo + 1;
    if ((COMBO_THRESHOLDS as readonly number[]).includes(newCombo)) {
      sfx.combo(newCombo);
      if (mountedRef.current) setComboFlash({ text: `${newCombo}× COMBO`, key: Date.now() });
      trackedTimeout(() => { if (mountedRef.current) setComboFlash(null); }, 1400);
    }
    if (areaRef.current) {
      burst(target.x, target.y, configRef.current.color, 12);
      spawnRipple(target.x, target.y, configRef.current.glow);
      spawnFloatText(target.x, target.y - target.size / 2 - 8, `+${target.points}`, '#ffffff');
    }
  }, [sfx, burst, spawnRipple, spawnFloatText, trackedTimeout, spawnTarget]);

  const missClick = useCallback((e: React.MouseEvent) => {
    if (phaseRef.current !== 'running') return;
    dispatch({ type: 'MISCLICK' });
    sfx.miss();
  }, [sfx]);

  const handleAreaClick = useCallback((e: React.MouseEvent) => {
    if (phase === 'idle' || phase === 'done') { beginCountdown(); return; }
    if (phase === 'paused') { resume(); return; }
    missClick(e);
  }, [phase, beginCountdown, resume, missClick]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
          if (phaseRef.current === 'idle' || phaseRef.current === 'done') { e.preventDefault(); beginCountdown(); }
          break;
        case 'Escape': case 'p': case 'P':
          if (phaseRef.current === 'running') pause();
          else if (phaseRef.current === 'paused') resume();
          break;
        case 'r': case 'R':
          if (phaseRef.current !== 'idle') resetSession();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beginCountdown, pause, resume, resetSession]);

  // Prevent touch scroll during game
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (phaseRef.current === 'running') e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqId(prev => prev === id ? null : id);
  }, []);

  // Derived values
  const acc = gameState.totalClicks > 0 ? Math.round((gameState.hits / gameState.totalClicks) * 100) : 100;
  const isUnlimited = sessionDurationRef.current === null && (phase === 'running' || phase === 'paused');
  const progress = (phase === 'running' || phase === 'paused') && sessionDurationRef.current
    ? ((sessionDurationRef.current - clock) / sessionDurationRef.current) * 100 : 0;
  const multiplier = getComboMultiplier(gameState.combo);
  const avgRT = gameState.reactionTimes.length > 0
    ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length) : 0;
  const activeCfg = (phase === 'running' || phase === 'paused' || phase === 'countdown')
    ? configRef.current : DIFFICULTY_CONFIG[difficulty];
  const isActive = phase === 'running' || phase === 'paused' || phase === 'countdown';
  const gradeColors: Record<Grade, string> = { S: '#fbbf24', A: '#34d399', B: '#60a5fa', C: '#a78bfa', D: '#f97316', F: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', color: '#e8e8f0', fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif', overflowX: 'hidden' }}>
      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%',
          background: `radial-gradient(ellipse, rgba(${activeCfg.accentRgb},0.06) 0%, transparent 70%)`,
          transition: 'background 1.2s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* Combo flash */}
      {comboFlash && (
        <div key={comboFlash.key} style={{
          position: 'fixed', top: '12%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 300, pointerEvents: 'none', fontFamily: 'inherit', fontWeight: 800,
          fontSize: '1.5rem', color: '#ffffff', letterSpacing: '0.08em',
          textShadow: `0 0 30px ${activeCfg.color}, 0 0 60px ${activeCfg.color}`,
          animation: 'cf-pop 1.4s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>{comboFlash.text}</div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem', position: 'relative', zIndex: 1 }}>

        {/* Page header */}
        <header style={{ textAlign: 'center', padding: '1.5rem 0 2.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.35)',
            borderRadius: '20px', padding: '0.32rem 0.95rem', marginBottom: '1.1rem',
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em',
            color: '#2dd4bf', textTransform: 'uppercase',
          }}>Aim Tool</div>
          <h1 style={{
            fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.1,
            margin: '0 0 0.85rem', letterSpacing: '-0.02em',
            color: '#2dd4bf', textShadow: '0 0 40px rgba(45,212,191,0.25)',
          }}>Aim Trainer</h1>
          <p style={{ margin: 0, fontSize: '1.02rem', color: '#9ca3af', fontWeight: 400 }}>
            Track and hit the small moving target — precision matters!
          </p>
        </header>

        {/* Top control bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '0.75rem 1rem', backdropFilter: 'blur(20px)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.25rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke={activeCfg.color} strokeWidth="1.5" style={{ transition: 'stroke 0.6s ease' }} />
              <circle cx="12" cy="12" r="2.5" fill={activeCfg.color} style={{ transition: 'fill 0.6s ease' }} />
              <line x1="12" y1="1" x2="12" y2="5.5" stroke={activeCfg.color} strokeWidth="1.5" />
              <line x1="12" y1="18.5" x2="12" y2="23" stroke={activeCfg.color} strokeWidth="1.5" />
              <line x1="1" y1="12" x2="5.5" y2="12" stroke={activeCfg.color} strokeWidth="1.5" />
              <line x1="18.5" y1="12" x2="23" y2="12" stroke={activeCfg.color} strokeWidth="1.5" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', color: '#fff' }}>AIM</span>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

          {/* Difficulty buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {DIFFICULTY_ORDER.map(key => {
              const d = DIFFICULTY_CONFIG[key];
              const active = difficulty === key;
              const locked = isActive;
              return (
                <button key={key}
                  onClick={() => { if (!locked) setDifficulty(key); }}
                  onMouseEnter={() => setHoveredDiff(key)}
                  onMouseLeave={() => setHoveredDiff(null)}
                  disabled={locked}
                  style={{
                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em',
                    padding: '0.35rem 0.7rem', borderRadius: '8px', cursor: locked ? 'default' : 'pointer',
                    border: `1px solid ${active ? d.color : 'rgba(255,255,255,0.08)'}`,
                    background: active ? `rgba(${d.accentRgb},0.15)` : hoveredDiff === key && !locked ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: active ? d.color : '#8888a0',
                    boxShadow: active ? `0 0 12px rgba(${d.accentRgb},0.25)` : 'none',
                    transition: 'all 0.15s ease', opacity: locked && !active ? 0.4 : 1,
                  }}
                >{d.label}</button>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

          {/* Duration buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {DURATION_OPTIONS.map(opt => {
              const active = durationKey === opt.key;
              const locked = isActive;
              return (
                <button key={opt.key}
                  onClick={() => { if (!locked) setDurationKey(opt.key); }}
                  disabled={locked}
                  style={{
                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: locked ? 'default' : 'pointer',
                    border: `1px solid ${active ? '#ffffff30' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? '#fff' : '#8888a0', transition: 'all 0.15s ease',
                    opacity: locked && !active ? 0.4 : 1,
                  }}
                >{opt.label}</button>
              );
            })}
            {durationKey === 'custom' && !isActive && (
              <input type="number" min={1} max={600} value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value);
                  const n = Math.min(600, Math.max(1, Number(e.target.value) || 1));
                  setCustomSeconds(n);
                }}
                style={{
                  width: '60px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '0.3rem 0.5rem', color: '#fff', fontFamily: 'inherit',
                  fontSize: '0.75rem', outline: 'none',
                }}
              />
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Sound controls */}
          <button
            onClick={() => setSoundEnabled((v: boolean) => !v)}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '0.35rem 0.6rem',
              color: soundEnabled ? '#fff' : '#8888a0', cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s ease',
            }}
          >{soundEnabled ? '🔊' : '🔇'}</button>

          {soundEnabled && (
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              aria-label="Volume" style={{ width: '64px', accentColor: activeCfg.color, cursor: 'pointer' }}
            />
          )}

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '0.35rem 0.6rem', color: '#8888a0',
              cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s ease',
            }}
          >{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}</button>

          {/* Reset */}
          {(isActive || phase === 'done') && (
            <button onClick={resetSession} style={{
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.03em',
              padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
              border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)',
              color: '#f87171', transition: 'all 0.15s ease',
            }}>↺ Reset</button>
          )}
        </div>

        {/* Live stats bar */}
        {isActive && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
            {[
              { label: 'Score', value: gameState.score.toLocaleString(), color: '#ffffff' },
              { label: 'Accuracy', value: `${acc}%`, color: acc > 75 ? '#34d399' : acc > 50 ? '#f59e0b' : '#ef4444' },
              { label: 'Hits', value: gameState.hits, color: activeCfg.color },
              { label: 'Misses', value: gameState.misclicks + gameState.targetsMissed, color: '#ef4444' },
              { label: 'Combo', value: `×${gameState.combo}`, color: gameState.combo >= 5 ? '#f59e0b' : '#8888a0' },
              { label: 'Best', value: `×${gameState.peakCombo}`, color: '#8888a0' },
              { label: 'React', value: avgRT ? `${avgRT}ms` : '—', color: '#a78bfa' },
              {
                label: isUnlimited ? 'Elapsed' : 'Time',
                value: isUnlimited ? `${clock.toFixed(1)}s` : `${clock.toFixed(1)}`,
                color: clock < ((sessionDurationRef.current ?? 100) * 0.2) && !isUnlimited ? '#ef4444' : '#60a5fa',
              },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '0.65rem 0.75rem', textAlign: 'center', backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, lineHeight: 1, transition: 'color 0.3s ease' }}>{s.value}</div>
                <div style={{ fontSize: '0.6rem', color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {isActive && !isUnlimited && (
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '1px',
              background: clock < ((sessionDurationRef.current ?? 100) * 0.2)
                ? 'linear-gradient(90deg,#ef4444,#f97316)'
                : `linear-gradient(90deg,${activeCfg.color},rgba(${activeCfg.accentRgb},0.5))`,
              width: `${progress}%`, transition: 'width 0.1s linear, background 0.5s ease',
              boxShadow: `0 0 8px rgba(${activeCfg.accentRgb},0.5)`,
            }} />
          </div>
        )}

        {/* Multiplier badge */}
        {isActive && multiplier > 1 && (
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '20px', padding: '0.28rem 0.85rem',
              fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.05em',
              boxShadow: '0 0 16px rgba(245,158,11,0.2)',
              animation: 'pulse-soft 1.5s ease infinite alternate',
            }}>⚡ ×{multiplier} MULTIPLIER</span>
          </div>
        )}

        {/* Game arena */}
        <div
          ref={areaRef}
          onClick={handleAreaClick}
          role="application"
          aria-label={phase === 'idle' ? 'Click to start aim training' : 'Aim training arena'}
          style={{
            position: 'relative', width: '100%',
            height: isFullscreen ? '100vh' : 'clamp(380px, 65vh, 680px)',
            background: isFullscreen ? '#02040a' : 'rgba(255,255,255,0.015)',
            border: `1px solid ${
              phase === 'running' ? `rgba(${activeCfg.accentRgb},0.35)` :
              phase === 'paused' ? 'rgba(245,158,11,0.3)' :
              phase === 'countdown' ? `rgba(${activeCfg.accentRgb},0.25)` : 'rgba(255,255,255,0.06)'
            }`,
            borderRadius: '20px', overflow: 'hidden',
            cursor: phase === 'idle' || phase === 'done' ? 'pointer' : 'crosshair',
            marginBottom: '1rem', backdropFilter: 'blur(20px)',
            boxShadow: phase === 'running'
              ? `0 0 60px rgba(${activeCfg.accentRgb},0.08), inset 0 0 60px rgba(${activeCfg.accentRgb},0.02)`
              : '0 0 0 transparent',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
            WebkitUserSelect: 'none', userSelect: 'none',
          }}
        >
          {/* Subtle grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }} aria-hidden="true">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Fullscreen exit button */}
          {isFullscreen && (
            <button onClick={e => { e.stopPropagation(); toggleFullscreen(); }}
              aria-label="Exit fullscreen"
              style={{
                position: 'absolute', top: '1rem', right: '1rem', zIndex: 50,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', padding: '0.5rem', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)',
              }}
            ><Minimize size={18} /></button>
          )}

          {/* Idle / Done overlay */}
          {(phase === 'idle' || phase === 'done') && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              animation: 'fade-in 0.4s ease',
            }}>
              {phase === 'done' ? (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', color: '#55556a', textTransform: 'uppercase' }}>Session Complete</div>
                  <div style={{ fontWeight: 800, fontSize: '3rem', lineHeight: 1, color: lastResult ? gradeColors[lastResult.grade] : '#fff' }}>
                    {lastResult?.grade}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#8888a0', fontWeight: 500 }}>
                    {lastResult?.score.toLocaleString()} pts · {lastResult?.accuracy}% accuracy
                  </div>
                  <button onClick={e => { e.stopPropagation(); beginCountdown(); }} style={{
                    fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em',
                    padding: '0.65rem 2rem', borderRadius: '12px', cursor: 'pointer',
                    background: `rgba(${activeCfg.accentRgb},0.15)`, border: `1px solid rgba(${activeCfg.accentRgb},0.4)`,
                    color: activeCfg.color, transition: 'all 0.2s ease',
                  }}>▶ RUN IT BACK</button>
                  <div style={{ fontSize: '0.72rem', color: '#33334a' }}>or press Space</div>
                </>
              ) : (
                <>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    border: `1.5px solid rgba(${activeCfg.accentRgb},0.4)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 30px rgba(${activeCfg.accentRgb},0.15)`,
                    animation: 'ring-pulse 2s ease infinite',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" fill="none" stroke={activeCfg.color} strokeWidth="1.2" opacity="0.7" />
                      <circle cx="12" cy="12" r="2.2" fill={activeCfg.color} />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#aaaabc', letterSpacing: '0.04em' }}>Click anywhere to start</div>
                  <div style={{ fontSize: '0.72rem', color: '#33334a', letterSpacing: '0.06em' }}>or press Space</div>
                </>
              )}
            </div>
          )}

          {/* Countdown overlay */}
          {phase === 'countdown' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(10,15,24,0.6)', backdropFilter: 'blur(4px)', borderRadius: 'inherit',
            }}>
              <div key={countdown} style={{
                fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em',
                fontSize: countdown === 0 ? '5rem' : '9rem',
                color: countdown === 0 ? activeCfg.color : '#ffffff',
                textShadow: `0 0 60px ${countdown === 0 ? activeCfg.glow : 'rgba(255,255,255,0.3)'}`,
                animation: prefersReducedMotion ? 'none' : 'cd-pop 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
              }}>
                {countdown === 0 ? 'GO' : countdown}
              </div>
            </div>
          )}

          {/* Paused overlay */}
          {phase === 'paused' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              background: 'rgba(10,15,24,0.75)', backdropFilter: 'blur(12px)', borderRadius: 'inherit',
            }}>
              <div style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '0.06em', color: '#fff' }}>PAUSED</div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PremiumButton onClick={resume} variant="primary" color={activeCfg.color} rgb={activeCfg.accentRgb}>▶ Resume</PremiumButton>
                <PremiumButton onClick={resetSession} variant="ghost">↺ Restart</PremiumButton>
                <PremiumButton onClick={exitToIdle} variant="danger">✕ Exit</PremiumButton>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#33334a' }}>P or Esc to resume</div>
            </div>
          )}

          {/* Ripples */}
          {ripples.map(r => (
            <div key={r.id} aria-hidden="true" style={{
              position: 'absolute', left: r.x, top: r.y, width: 50, height: 50,
              borderRadius: '50%', border: `1.5px solid ${r.color}`,
              transform: 'translate(-50%,-50%)', pointerEvents: 'none',
              animation: 'ripple-out 0.7s ease forwards',
            }} />
          ))}

          {/* Floating texts */}
          {floatTexts.map(f => (
            <div key={f.id} aria-hidden="true" style={{
              position: 'absolute', left: f.x, top: f.y,
              color: f.color, fontWeight: 800, fontSize: '0.85rem',
              pointerEvents: 'none', whiteSpace: 'nowrap',
              transform: 'translate(-50%,-50%)',
              animation: 'float-rise 0.9s ease forwards',
              textShadow: `0 0 12px ${f.color}`, letterSpacing: '0.04em',
            }}>{f.text}</div>
          ))}

          {/* Targets */}
          {targets.map(t => (
            <TargetButton key={t.id} target={t} cfg={activeCfg} onHit={hitTarget} />
          ))}

          {/* Pause button */}
          {phase === 'running' && (
            <button onClick={e => { e.stopPropagation(); pause(); }} aria-label="Pause" style={{
              position: 'absolute', bottom: '12px', right: '12px', zIndex: 25,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '0.4rem 0.65rem', cursor: 'pointer',
              color: '#8888a0', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600,
              letterSpacing: '0.04em', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>⏸ <span style={{ fontSize: '0.65rem' }}>P</span></button>
          )}

          {/* Stop (unlimited) */}
          {phase === 'running' && isUnlimited && (
            <button onClick={e => { e.stopPropagation(); endGame(); }} style={{
              position: 'absolute', bottom: '12px', left: '12px', zIndex: 25,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', padding: '0.4rem 0.75rem', cursor: 'pointer',
              color: '#f87171', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600,
              letterSpacing: '0.04em', transition: 'all 0.15s ease',
            }}>■ Stop</button>
          )}

          {/* Difficulty badge */}
          {isActive && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px', zIndex: 25,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(10,15,24,0.6)', border: `1px solid rgba(${activeCfg.accentRgb},0.25)`,
              borderRadius: '8px', padding: '0.3rem 0.65rem', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeCfg.color, boxShadow: `0 0 6px ${activeCfg.color}` }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: activeCfg.color, letterSpacing: '0.06em' }}>{activeCfg.label.toUpperCase()}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>·</span>
              <span style={{ fontSize: '0.68rem', color: '#55556a', letterSpacing: '0.04em' }}>{durationLabelRef.current}</span>
            </div>
          )}
        </div>

        {/* Result card */}
        {phase === 'done' && lastResult && (
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: `1px solid ${gradeColors[lastResult.grade]}25`,
            borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem',
            boxShadow: `0 0 40px ${gradeColors[lastResult.grade]}0d`, animation: 'fade-in 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{
                fontWeight: 900, fontSize: '3.5rem', lineHeight: 1,
                color: gradeColors[lastResult.grade],
                textShadow: `0 0 30px ${gradeColors[lastResult.grade]}`,
              }}>{lastResult.grade}</div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ fontSize: '1rem', color: i < lastResult.stars ? '#f59e0b' : 'rgba(255,255,255,0.1)', transition: 'color 0.3s ease' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#55556a' }}>
                  {DIFFICULTY_CONFIG[lastResult.difficulty].label} · {lastResult.durationLabel}
                </div>
              </div>
              <button onClick={beginCountdown} style={{
                marginLeft: 'auto', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                letterSpacing: '0.04em', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer',
                background: `rgba(${DIFFICULTY_CONFIG[lastResult.difficulty].accentRgb},0.12)`,
                border: `1px solid rgba(${DIFFICULTY_CONFIG[lastResult.difficulty].accentRgb},0.35)`,
                color: DIFFICULTY_CONFIG[lastResult.difficulty].color, transition: 'all 0.15s ease',
              }}>▶ Run It Back</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: '0.55rem' }}>
              {[
                { l: 'Score', v: lastResult.score.toLocaleString(), c: '#ffffff' },
                { l: 'Accuracy', v: `${lastResult.accuracy}%`, c: lastResult.accuracy > 75 ? '#34d399' : '#f59e0b' },
                { l: 'Hits', v: lastResult.hits, c: activeCfg.color },
                { l: 'Misclicks', v: lastResult.misclicks, c: '#ef4444' },
                { l: 'Missed', v: lastResult.targetsMissed, c: '#f87171' },
                { l: 'Total Clicks', v: lastResult.totalClicks, c: '#8888a0' },
                { l: 'Avg Pts', v: Math.round(lastResult.avgPoints), c: '#60a5fa' },
                { l: 'Peak Combo', v: `×${lastResult.peakCombo}`, c: '#f59e0b' },
                { l: 'Hits/sec', v: lastResult.peakHitsPerSec.toFixed(1), c: '#a78bfa' },
                { l: 'Avg React', v: lastResult.reactionTime ? `${Math.round(lastResult.reactionTime)}ms` : '—', c: '#a78bfa' },
                { l: 'Best Streak', v: lastResult.bestStreak, c: '#34d399' },
                { l: 'Duration', v: lastResult.durationLabel, c: '#8888a0' },
              ].map(s => (
                <div key={s.l} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '0.65rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: '0.6rem', color: '#33334a', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session history */}
        {history.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => setShowHistory(v => !v)} style={{
              fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              padding: '0.4rem 0.9rem', color: '#8888a0', cursor: 'pointer', transition: 'all 0.15s ease',
              marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {showHistory ? '▾' : '▸'} Session History
              <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px', padding: '0 0.45rem', fontSize: '0.7rem' }}>{history.length}</span>
            </button>
            {showHistory && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', overflow: 'hidden', animation: 'fade-in 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem 0' }}>
                  <button onClick={() => {
                    setHistory([]);
                    safeRemoveItem(STORAGE_KEY);
                  }} style={{
                    fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 600,
                    background: 'transparent', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '6px', padding: '0.25rem 0.65rem', color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                  }}>Clear</button>
                </div>
                <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '0.5rem 0.75rem 0.75rem' }}>
                  {history.slice(0, 20).map(s => (
                    <div key={s.id} style={{
                      display: 'grid', gridTemplateColumns: 'auto 60px 40px 80px 55px 40px',
                      gap: '0.75rem', alignItems: 'center', padding: '0.55rem 0.5rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem',
                    }}>
                      <span style={{ color: '#33334a', fontSize: '0.7rem' }}>{formatDate(s.date)}</span>
                      <span style={{ color: DIFFICULTY_CONFIG[s.difficulty].color, fontWeight: 700, fontSize: '0.68rem' }}>
                        {DIFFICULTY_CONFIG[s.difficulty]?.label ?? s.difficulty}
                      </span>
                      <span style={{ color: '#55556a', fontSize: '0.68rem' }}>{s.durationLabel}</span>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{s.score.toLocaleString()}</span>
                      <span style={{ color: '#8888a0' }}>{s.accuracy}%</span>
                      <span style={{ color: gradeColors[s.grade] ?? '#8888a0', fontWeight: 800 }}>{s.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard hints */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '2rem' }}>
          {(phase === 'idle' || phase === 'done') && <Hint k="Space" label="Start" />}
          {phase === 'running' && <><Hint k="P / Esc" label="Pause" /><Hint k="R" label="Restart" /></>}
          {phase === 'paused' && <><Hint k="P / Esc" label="Resume" /><Hint k="R" label="Restart" /></>}
        </div>

        {/* More Tools — FIXED: uses React Router <Link> instead of <a> */}
        <section aria-label="More Tools" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px' }}>
            More Tools
          </h2>
          <div className="more-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
            {MORE_TOOLS.map(({ label, href, icon }) => (
              <Link key={href} to={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '1.2rem 0.5rem', cursor: 'pointer', textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `rgba(${activeCfg.accentRgb},0.08)`;
                  (e.currentTarget as HTMLElement).style.borderColor = `rgba(${activeCfg.accentRgb},0.35)`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: activeCfg.color, transition: 'color 0.3s ease',
                }}>{icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Article */}
        <article aria-label="Aim trainer guide and FAQ" style={{ paddingBottom: '3rem' }}>
          <header style={{ padding: '2.5rem 0 2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
              background: `rgba(${activeCfg.accentRgb},0.1)`, border: `1px solid rgba(${activeCfg.accentRgb},0.3)`,
              borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', color: activeCfg.color, textTransform: 'uppercase',
            }}>Free Online Aim Trainer</div>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Train Faster, More Accurate Aim
            </h2>
            <p style={{ color: '#8888a0', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
              A browser-based aim trainer with five difficulty tiers, combo multipliers, S–F grading, and full session history — built to sharpen the click accuracy and reaction speed that competitive shooters demand.
            </p>
          </header>

          {[
            {
              title: 'How This Aim Trainer Works',
              body: 'Every match runs on a lightweight engine built for one job: spawn a target, measure how fast and how precisely you click it, then repeat. A short countdown primes your reflexes, targets appear one at a time or several at once depending on difficulty, and a live stats bar tracks score, accuracy, combo, and reaction time as you play.',
            },
            {
              title: 'The Combo Multiplier System Explained',
              body: 'Landing 5 hits in a row raises your multiplier to ×1.5. Ten in a row reaches ×2, twenty reaches ×2.5, and a 35-hit streak caps it at ×3. A single misclick or expired target snaps the combo straight back to zero.',
            },
            {
              title: 'What the S–F Grade Actually Measures',
              body: 'Grades combine accuracy with a per-difficulty bonus. Reaching an S grade additionally requires an average reaction time under 380 milliseconds — rewarding players who are fast and precise together.',
            },
            {
              title: 'Choosing a Match Duration',
              body: 'Short 1–5 second sprints are built for pure reaction-time testing. The 10 and 30 second presets suit a standard training rep. Custom length up to 600 seconds fits longer endurance sessions, and Unlimited mode removes the clock entirely.',
            },
          ].map(s => (
            <section key={s.title} style={{ borderLeft: `2px solid ${activeCfg.color}40`, padding: '0 0 0 1.5rem', marginBottom: '2.25rem' }}>
              <h2 style={h2Style}>{s.title}</h2>
              <p style={pStyle}>{s.body}</p>
            </section>
          ))}

          {/* Difficulty grid */}
          <section style={{ borderLeft: `2px solid ${activeCfg.color}40`, padding: '0 0 0 1.5rem', marginBottom: '2.25rem' }}>
            <h2 style={h2Style}>Difficulty Tiers, From Easy to Impossible</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '0.6rem', marginTop: '1rem' }}>
              {DIFFICULTY_ORDER.map(k => {
                const d = DIFFICULTY_CONFIG[k];
                return (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${d.accentRgb},0.25)`, borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ color: d.color, fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>{d.label}</div>
                    <div style={{ color: '#8888a0', fontSize: '0.72rem', lineHeight: 1.6 }}>
                      ×{d.multiplier} score · {d.maxConcurrent} on screen · {d.moveChance > 0 ? 'moving' : 'stationary'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Games list */}
          <section style={{ borderLeft: `2px solid ${activeCfg.color}40`, padding: '0 0 0 1.5rem', marginBottom: '2.25rem' }}>
            <h2 style={h2Style}>Games Where This Training Transfers</h2>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', padding: 0, listStyle: 'none', margin: '1rem 0 0' }}>
              {SUPPORTED_GAMES.map(game => (
                <li key={game} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#d1d1de', fontWeight: 600, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <span style={{ color: activeCfg.color }} aria-hidden="true">◎</span>{game}
                </li>
              ))}
            </ul>
          </section>

          {/* Tips */}
          <section style={{ borderLeft: `2px solid ${activeCfg.color}40`, padding: '0 0 0 1.5rem', marginBottom: '2.25rem' }}>
            <h2 style={h2Style}>Best Aim Training Tips for FPS Players</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
              {[
                { title: 'Warm up before you grind Impossible', body: 'Start each session on Easy or Normal for a minute before pushing into harder tiers — cold reflexes make small, fast targets feel far worse than they are.' },
                { title: 'React to what you see, not what you predict', body: 'Fast-moving targets tempt you to click where you think they\'re heading. Track the target itself; prediction is what causes consistent overshoot.' },
                { title: 'Protect your combo over chasing risky clicks', body: 'Since the multiplier resets on any miss, a controlled 20-hit streak at ×2.5 often out-scores several short bursts interrupted by misclicks.' },
                { title: 'Match your real in-game sensitivity', body: 'Training at a sensitivity you don\'t actually play with builds muscle memory that won\'t transfer. Set it once, and keep it identical across both.' },
              ].map(tip => (
                <div key={tip.title}>
                  <h3 style={h3Style}>{tip.title}</h3>
                  <p style={pStyle}>{tip.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading-main" style={{ marginTop: '1rem' }}>
            <h2 id="faq-heading-main" style={{ ...h2Style, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {FAQ_ENTRIES.map(entry => (
                <FaqAccordionRow key={entry.id} entry={entry} isOpen={openFaqId === entry.id} onToggle={() => toggleFaq(entry.id)} accentColor={activeCfg.color} />
              ))}
            </div>
          </section>
        </article>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:focus-visible { outline: 2px solid rgba(255,255,255,0.4); outline-offset: 2px; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 1; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes ripple-out {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
        }
        @keyframes float-rise {
          0% { transform: translate(-50%,-50%) translateY(0); opacity: 1; }
          100% { transform: translate(-50%,-50%) translateY(-52px); opacity: 0; }
        }
        @keyframes cd-pop {
          0% { transform: scale(0.5); opacity: 0; }
          65% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cf-pop {
          0% { transform: translateX(-50%) scale(0.7) translateY(10px); opacity: 0; }
          20% { transform: translateX(-50%) scale(1.05) translateY(0); opacity: 1; }
          75% { transform: translateX(-50%) scale(1) translateY(-4px); opacity: 1; }
          100% { transform: translateX(-50%) scale(0.95) translateY(-8px); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ring-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(96,165,250,0.1); }
          50% { box-shadow: 0 0 40px rgba(96,165,250,0.25); }
        }
        @keyframes pulse-soft {
          from { box-shadow: 0 0 10px rgba(245,158,11,0.2); }
          to { box-shadow: 0 0 22px rgba(245,158,11,0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        @media (max-width: 700px) {
          .more-tools-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .more-tools-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function TargetButton({ target, cfg, onHit }: {
  target: TargetT;
  cfg: DifficultyConfig;
  onHit: (t: TargetT, e: React.MouseEvent | React.TouchEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); onHit(target, e); }}
      onTouchEnd={e => { e.stopPropagation(); onHit(target, e); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Target — ${target.points} pts`}
      style={{
        position: 'absolute', left: `${target.x}px`, top: `${target.y}px`,
        width: `${target.size}px`, height: `${target.size}px`, borderRadius: '50%',
        transform: `translate(-50%,-50%) scale(${hovered ? 1.06 : 1})`,
        backgroundImage: `url(${SKULL_IMAGE_SRC})`,
        backgroundSize: '155%', backgroundPosition: 'center 42%', backgroundRepeat: 'no-repeat',
        backgroundColor: '#050505',
        border: `1.5px solid rgba(${cfg.accentRgb},${hovered ? 0.95 : 0.55})`,
        cursor: 'crosshair',
        boxShadow: hovered
          ? `0 0 34px ${cfg.glow}, 0 0 14px ${cfg.glow}, inset 0 0 14px rgba(0,0,0,0.6)`
          : `0 0 20px ${cfg.glow}, 0 0 8px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.5)`,
        transition: 'box-shadow 0.12s ease, border-color 0.12s ease, transform 0.12s ease',
        zIndex: 5, padding: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        userSelect: 'none', willChange: 'transform, box-shadow',
      }}
    >
      {target.size > 36 && (
        <span style={{
          fontFamily: 'inherit', fontWeight: 800,
          fontSize: `${Math.max(9, target.size * 0.18)}px`, color: '#fff',
          background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '0 5px',
          marginBottom: '2px', textShadow: '0 0 6px rgba(0,0,0,0.8)',
        }}>{target.points}</span>
      )}
    </button>
  );
}

function PremiumButton({ children, onClick, variant = 'ghost', color = '#60a5fa', rgb = '96,165,250' }: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  color?: string;
  rgb?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.4)`, color, boxShadow: `0 0 16px rgba(${rgb},0.15)` },
    ghost: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#aaaabc' },
    danger: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
  };
  return (
    <button onClick={onClick} style={{
      fontFamily: 'inherit', fontWeight: 700, fontSize: '0.83rem', letterSpacing: '0.04em',
      padding: '0.55rem 1.3rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s ease',
      ...styles[variant],
    }}>{children}</button>
  );
}

function FaqAccordionRow({ entry, isOpen, onToggle, accentColor }: {
  entry: FaqEntry; isOpen: boolean; onToggle: () => void; accentColor: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: isOpen ? `1px solid ${accentColor}55` : '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease',
    }}>
      <h3 style={{ margin: 0 }}>
        <button type="button" onClick={onToggle}
          aria-expanded={isOpen} aria-controls={`${entry.id}-panel`} id={`${entry.id}-button`}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', padding: '0.9rem 1.1rem', background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'inherit',
          }}
        >
          <span>{entry.question}</span>
          <span aria-hidden="true" style={{
            flexShrink: 0, color: isOpen ? accentColor : '#55556a',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', fontSize: '0.8rem',
          }}>▾</span>
        </button>
      </h3>
      <div id={`${entry.id}-panel`} role="region" aria-labelledby={`${entry.id}-button`}
        style={{ maxHeight: isOpen ? '400px' : '0px', transition: 'max-height 0.25s ease', overflow: 'hidden' }}
      >
        <div style={{ padding: '0 1.1rem 1rem', color: '#9797a8', fontSize: '0.86rem', lineHeight: 1.7 }}>
          {entry.answer}
        </div>
      </div>
    </div>
  );
}

function Hint({ k, label }: { k: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#33334a' }}>
      <kbd style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '5px', padding: '0.15rem 0.45rem', fontFamily: 'inherit', fontSize: '0.7rem', color: '#8888a0',
      }}>{k}</kbd>
      {label}
    </span>
  );
}
'use client';

/**
 * SniperModePage – Production Sniper Aim Trainer
 *
 * Architecture overview:
 *  - rAF loop writes ONLY to targetElRef (DOM mutation, zero React renders per frame)
 *  - targetRef holds the authoritative physics state (position + velocity)
 *  - Hit detection is done against targetRef (physics coords), NOT React state
 *  - React state updates happen only on: hit, miss, timer tick, phase change
 *  - All game logic lives in refs; React is pure presentation layer
 *
 * Upgrades over v1:
 *  - Touch support: touchstart on arena (miss) and target (hit) for mobile play
 *  - Combo label auto-clears after COMBO_LABEL_TTL_MS so it doesn't linger
 *  - averageAccuracy tracked and displayed in all-time records panel
 *  - aria-live regions on score + timer for screen-reader updates
 *  - touch-action: none on target button prevents scroll hijack on mobile
 *  - Custom CSS crosshair cursor during play for premium feel
 *  - Defensive NaN/Infinity guards on every numeric write
 *  - Zero-dependency Web Audio API sound engine (no libraries, no network):
 *      hit · crit · miss · combo-unlock · countdown-beep · go-fanfare · game-over
 *  - Mute toggle button persisted to localStorage
 *  - AudioContext lazily created on first user gesture (browser autoplay policy)
 *
 * v4 fixes & additions:
 *  - FIX: combo-unlock sound tier mapping was inverted (small combos played the
 *    most excited sound, big combos played the dullest). Now mapped explicitly
 *    by multiplier value instead of relying on array order.
 *  - FIX: pausing no longer distorts the progressive difficulty ramp. Elapsed
 *    time used for speed-multiplier calculation now excludes time spent paused.
 *  - NEW: selectable match duration – 1s / 2s / 5s / 10s / 30s / custom / unlimited.
 *    Unlimited mode counts time up instead of down and ends only when the
 *    player presses "Finish", at which point the score is saved to records
 *    exactly like a normal timed match.
 *
 * v5 additions:
 *  - NEW: "More Tools" navigation grid (matches the shared cross-tool nav used
 *    on other pages such as the Spacebar Counter) so players can jump directly
 *    to related keyboard/mouse benchmarking tools from the Sniper Mode page.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type Phase = 'idle' | 'countdown' | 'running' | 'paused' | 'done';
type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

/** Duration selector option. Numeric presets are seconds; 'custom' reads
 *  from customDurationInput; 'unlimited' disables the countdown entirely. */
type DurationOption = '1' | '2' | '5' | '10' | '30' | 'custom' | 'unlimited';

interface TargetPhysics {
  x: number;   // centre x
  y: number;   // centre y
  vx: number;  // velocity x (px/frame @60fps)
  vy: number;  // velocity y
  size: number; // radius
}

interface HitFeedback {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface GameState {
  score: number;
  hits: number;
  misses: number;
  criticalHits: number;
  combo: number;
  bestCombo: number;
  streak: number;
  bestStreak: number;
  timeLeft: number;
}

interface StoredRecords {
  bestScore: number;
  bestStreak: number;
  bestCombo: number;
  gamesPlayed: number;
  totalHits: number;
  totalMisses: number;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIG
═══════════════════════════════════════════════════════════════ */
const DEFAULT_GAME_DURATION = 30;    // seconds – fallback / initial preset
const MIN_CUSTOM_DURATION   = 1;     // seconds – lower bound for custom input
const MAX_CUSTOM_DURATION   = 600;   // seconds – upper bound for custom input (10 min)
const AREA_HEIGHT        = 380;      // px – arena height
const TIMER_INTERVAL_MS  = 100;      // ms between timer ticks
const COUNTDOWN_FROM     = 3;        // countdown start number
const COUNTDOWN_STEP_MS  = 850;      // ms per countdown beat
const GO_DISPLAY_MS      = 580;      // ms "GO!" is shown before game starts
const HIT_SCORE          = 100;      // base points for a normal hit
const CRIT_SCORE         = 150;      // base points for a critical hit
const CRIT_RADIUS_RATIO  = 0.38;     // fraction of target radius that counts as crit
const MISS_PENALTY       = 0;        // points deducted on miss (0 = no penalty)
const FEEDBACK_TTL_MS    = 750;      // ms hit-label floats before removal
const COMBO_LABEL_TTL_MS = 1400;     // ms combo toast stays visible then auto-clears
const PROGRESSIVE_ACCEL  = 0.000065; // speed multiplier increase per ms elapsed
const MAX_SPEED_MULT     = 2.6;      // hard cap on progressive speed multiplier
const LS_KEY             = 'sniper_aim_trainer_v3';
const FRAME_REF_HZ       = 60;       // physics tuned for 60fps; dt scaling handles others
const IMPOSSIBLE_NUDGE_P = 0.035;    // probability of random nudge per frame (impossible only)

/** Combo thresholds – descending order (first match wins) */
const COMBO_THRESHOLDS: ReadonlyArray<{ hits: number; mult: number; label: string }> = [
  { hits: 20, mult: 5, label: '×5 COMBO' },
  { hits: 10, mult: 3, label: '×3 COMBO' },
  { hits:  5, mult: 2, label: '×2 COMBO' },
];

/** Maps a combo multiplier to its arpeggio "excitement" tier (1 = calmest, 3 = biggest).
 *  Kept as an explicit lookup rather than deriving from COMBO_THRESHOLDS array order,
 *  since that array is sorted descending by hit count and index-based derivation
 *  silently inverts the mapping. */
const COMBO_SOUND_TIER: Readonly<Record<number, number>> = {
  2: 1,
  3: 2,
  5: 3,
};

interface DifficultyDef {
  label: string;
  emoji: string;
  /** Target radius in px */
  radius: number;
  /** Base speed in px/frame @60fps */
  baseSpeed: number;
  /** Score multiplier applied on top of base/crit score */
  scoreMultiplier: number;
  /** Randomness added to spawn velocity (0 = perfectly normalised) */
  accelVariance: number;
  /** Accent colour for UI */
  color: string;
}

const DIFFICULTY_CONFIG: Readonly<Record<Difficulty, DifficultyDef>> = {
  easy: {
    label: 'Easy', emoji: '🟢',
    radius: 32, baseSpeed: 2.0, scoreMultiplier: 1,
    accelVariance: 0, color: '#22c55e',
  },
  medium: {
    label: 'Medium', emoji: '🟡',
    radius: 22, baseSpeed: 3.4, scoreMultiplier: 1.5,
    accelVariance: 0.28, color: '#eab308',
  },
  hard: {
    label: 'Hard', emoji: '🔴',
    radius: 14, baseSpeed: 5.0, scoreMultiplier: 2,
    accelVariance: 0.65, color: '#ef4444',
  },
  impossible: {
    label: 'Impossible', emoji: '💀',
    radius: 9, baseSpeed: 7.8, scoreMultiplier: 3,
    accelVariance: 1.3, color: '#a855f7',
  },
};

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'impossible'];

/** Duration presets shown as buttons, in order. 'custom' and 'unlimited' are
 *  handled specially (see DurationSelector). */
const DURATION_PRESETS: DurationOption[] = ['1', '2', '5', '10', '30', 'custom', 'unlimited'];

function durationLabel(opt: DurationOption): string {
  switch (opt) {
    case 'custom':    return 'Custom';
    case 'unlimited': return 'Unlimited';
    default:          return `${opt}s`;
  }
}

const SUPPORTED_GAMES = [
  'Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V',
  'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2',
  'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us',
] as const;

const DEFAULT_GAME_STATE: Readonly<GameState> = {
  score: 0, hits: 0, misses: 0, criticalHits: 0,
  combo: 0, bestCombo: 0, streak: 0, bestStreak: 0,
  timeLeft: DEFAULT_GAME_DURATION,
};

const DEFAULT_RECORDS: Readonly<StoredRecords> = {
  bestScore: 0, bestStreak: 0, bestCombo: 0,
  gamesPlayed: 0, totalHits: 0, totalMisses: 0,
};

const LS_MUTE_KEY = 'sniper_aim_trainer_muted';

/** Cross-tool navigation grid shown near the bottom of the page, matching the
 *  shared "More Tools" section used on other pages (e.g. Spacebar Counter).
 *  Each entry links to a related keyboard/mouse benchmarking tool. */
const MORE_TOOLS: ReadonlyArray<{ label: string; href: string; icon: React.ReactNode }> = [
  { label: 'CPS Test',        href: '/cps-test',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="6" y="15" width="12" height="3" rx="1"/></svg> },
  { label: 'Typing Test',     href: '/typing-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time',   href: '/reaction-time',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Aim Trainer',     href: '/aim-trainer',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg> },
  { label: 'Scroll Test',     href: '/scroll-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click',    href: '/double-click',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: 'Mouse Accuracy',  href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer',  href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction',     href: '/f1-reaction',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense',   href: '/space-defense',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test',   href: '/accuracy',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush',        href: '/cps-rush',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game',    href: '/voyager-game',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
];

/* ═══════════════════════════════════════════════════════════════
   SOUND ENGINE  (Web Audio API – zero dependencies, zero network)
   All sounds are synthesized from oscillators + noise buffers.
   The AudioContext is created lazily on the first user gesture
   to satisfy browser autoplay policies.
═══════════════════════════════════════════════════════════════ */

/** Shared lazy AudioContext – one per page lifetime */
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (Chrome requires a gesture before audio)
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

/** Master gain node – mute routes through here */
let _masterGain: GainNode | null = null;
function getMasterGain(): GainNode | null {
  const ctx = getAudioCtx();
  if (!ctx) return null;
  if (!_masterGain) {
    _masterGain = ctx.createGain();
    _masterGain.gain.value = 1;
    _masterGain.connect(ctx.destination);
  }
  return _masterGain;
}

/** Set master volume (0 = mute, 1 = full) – smooth ramp to avoid click */
function setMasterVolume(vol: number): void {
  const g = getMasterGain();
  if (!g) return;
  const ctx = getAudioCtx()!;
  g.gain.setTargetAtTime(vol, ctx.currentTime, 0.02);
}

/* ── Low-level helpers ── */

/** One-shot oscillator burst */
function playTone(
  freq: number,
  type: OscillatorType,
  gainPeak: number,
  startDelay: number,
  duration: number,
  freqEnd?: number,
): void {
  const ctx = getAudioCtx();
  const master = getMasterGain();
  if (!ctx || !master) return;

  const now = ctx.currentTime + startDelay;
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
  }

  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gainPeak, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(g);
  g.connect(master);

  osc.start(now);
  osc.stop(now + duration + 0.01);
}

/** White-noise burst via AudioBufferSourceNode */
function playNoise(gainPeak: number, startDelay: number, duration: number): void {
  const ctx = getAudioCtx();
  const master = getMasterGain();
  if (!ctx || !master) return;

  const now        = ctx.currentTime + startDelay;
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const g = ctx.createGain();
  g.gain.setValueAtTime(gainPeak, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // High-pass filter so noise doesn't feel muddy
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 800;

  src.connect(hp);
  hp.connect(g);
  g.connect(master);

  src.start(now);
  src.stop(now + duration + 0.01);
}

/* ── Named sound events ── */

/** Normal hit – crisp click + short sine blip */
function soundHit(): void {
  playNoise(0.18, 0, 0.04);
  playTone(520, 'sine', 0.22, 0, 0.08, 680);
}

/** Critical hit – metallic ping + shimmer */
function soundCrit(): void {
  playNoise(0.12, 0, 0.03);
  playTone(880, 'sine',   0.28, 0,     0.12, 1200);
  playTone(1320, 'sine',  0.16, 0.03,  0.10, 1760);
  playTone(1760, 'triangle', 0.10, 0.06, 0.14);
}

/** Miss – low thud */
function soundMiss(): void {
  playTone(120, 'sine', 0.30, 0, 0.12, 60);
  playNoise(0.08, 0, 0.06);
}

/** Sniper Shoot - clicky mechanical sound with deep bass */
function soundShoot(): void {
  playNoise(0.3, 0, 0.06);
  playTone(400, 'square', 0.15, 0, 0.05, 150);
  playTone(90, 'sine', 0.5, 0.01, 0.3, 30);
}

/** Combo unlock – ascending 3-note arpeggio, pitch scales with combo tier */
function soundCombo(tier: number): void {
  // tier 1 = ×2 (5 hits), tier 2 = ×3 (10 hits), tier 3 = ×5 (20 hits)
  const baseFreqs: [number, number, number][] = [
    [440, 554, 659],   // A4 C#5 E5  – major triad
    [523, 659, 784],   // C5 E5  G5  – higher
    [659, 880, 1047],  // E5 A5  C6  – exciting
  ];
  const freqs = baseFreqs[Math.min(tier - 1, 2)];
  freqs.forEach((f, i) => playTone(f, 'triangle', 0.22 - i * 0.04, i * 0.07, 0.14));
}

/** Countdown beep (numbers 3–1) */
function soundCountdownBeep(): void {
  playTone(660, 'square', 0.14, 0, 0.09);
}

/** GO! – bright two-tone fanfare */
function soundGo(): void {
  playTone(880,  'triangle', 0.26, 0,    0.15);
  playTone(1320, 'triangle', 0.20, 0.08, 0.18);
}

/** Game over – descending minor stinger */
function soundGameOver(): void {
  playTone(440, 'sawtooth', 0.18, 0,    0.18, 330);
  playTone(330, 'sawtooth', 0.14, 0.15, 0.18, 220);
  playTone(220, 'sine',     0.22, 0.30, 0.30, 110);
}

/* ═══════════════════════════════════════════════════════════════
   PURE HELPERS
═══════════════════════════════════════════════════════════════ */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Guard: replace NaN / Infinity with a safe fallback */
function safeNum(v: number, fallback = 0): number {
  return Number.isFinite(v) ? v : fallback;
}

/** Normalise a velocity vector to the given speed, guarding against zero-length */
function normalizeVelocity(vx: number, vy: number, speed: number): [number, number] {
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  return [(vx / len) * speed, (vy / len) * speed];
}

function getComboInfo(combo: number): { mult: number; label: string } {
  for (const t of COMBO_THRESHOLDS) {
    if (combo >= t.hits) return { mult: t.mult, label: t.label };
  }
  return { mult: 1, label: '' };
}

/** Derive lifetime average accuracy from stored records */
function calcAvgAccuracy(r: StoredRecords): number {
  const total = r.totalHits + r.totalMisses;
  if (total === 0) return 100;
  return Math.round((r.totalHits / total) * 100);
}

/** Resolve a DurationOption + custom input into an actual seconds value,
 *  or null for unlimited (no countdown target). */
function resolveDurationSeconds(opt: DurationOption, customValue: number): number | null {
  if (opt === 'unlimited') return null;
  if (opt === 'custom') return clamp(safeNum(customValue, DEFAULT_GAME_DURATION), MIN_CUSTOM_DURATION, MAX_CUSTOM_DURATION);
  const n = parseInt(opt, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_GAME_DURATION;
}

/* ── localStorage helpers ── */
function loadRecords(): StoredRecords {
  if (typeof window === 'undefined') return { ...DEFAULT_RECORDS };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_RECORDS };
    return { ...DEFAULT_RECORDS, ...(JSON.parse(raw) as Partial<StoredRecords>) };
  } catch {
    return { ...DEFAULT_RECORDS };
  }
}

function saveRecords(r: StoredRecords): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(r)); } catch { /* storage quota */ }
}

/* ── Physics ── */
function spawnTarget(
  areaWidth: number,
  areaHeight: number,
  cfg: DifficultyDef,
  existingT?: TargetPhysics | null,
): TargetPhysics {
  const { radius, baseSpeed, accelVariance } = cfg;
  const pad = radius + 2;

  let x: number, y: number;
  let attempts = 0;
  do {
    x = clamp(pad + Math.random() * (areaWidth - pad * 2), pad, areaWidth - pad);
    y = clamp(pad + Math.random() * (areaHeight - pad * 2), pad, areaHeight - pad);
    attempts++;
  } while (
    existingT &&
    Math.hypot(x - existingT.x, y - existingT.y) < radius * 3 &&
    attempts < 8
  );

  const angle = Math.random() * Math.PI * 2;
  const rawVx = Math.cos(angle);
  const rawVy = Math.sin(angle);

  const variance = accelVariance > 0 ? 1 + (Math.random() - 0.5) * accelVariance : 1;
  const speed = baseSpeed * Math.max(0.5, variance);

  const [vx, vy] = normalizeVelocity(rawVx, rawVy, speed);
  return { x, y, vx, vy, size: radius };
}

function stepPhysics(
  t: TargetPhysics,
  areaWidth: number,
  areaHeight: number,
  speedMult: number,
  dtFactor: number,
  isImpossible: boolean,
  cfg: DifficultyDef,
): TargetPhysics {
  let { x, y, vx, vy, size } = t;

  const effectiveVx = vx * speedMult * dtFactor;
  const effectiveVy = vy * speedMult * dtFactor;

  x += effectiveVx;
  y += effectiveVy;

  let newVx = vx;
  let newVy = vy;

  if (x - size < 0)             { x = size;             newVx =  Math.abs(vx); }
  else if (x + size > areaWidth){ x = areaWidth - size; newVx = -Math.abs(vx); }

  if (y - size < 0)              { y = size;             newVy =  Math.abs(vy); }
  else if (y + size > areaHeight){ y = areaHeight - size; newVy = -Math.abs(vy); }

  if (isImpossible && Math.random() < IMPOSSIBLE_NUDGE_P) {
    const nudge = cfg.accelVariance * 0.35;
    newVx += (Math.random() - 0.5) * nudge;
    newVy += (Math.random() - 0.5) * nudge;
    [newVx, newVy] = normalizeVelocity(newVx, newVy, cfg.baseSpeed);
  }

  return { x, y, vx: newVx, vy: newVy, size };
}

/* ═══════════════════════════════════════════════════════════════
   MEMOISED SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

interface StatCardProps { value: string | number; label: string; color: string; live?: boolean; }
const StatCard = memo(function StatCard({ value, label, color, live }: StatCardProps) {
  return (
    <div
      role="status"
      aria-label={`${label}: ${value}`}
      aria-live={live ? 'polite' : undefined}
      aria-atomic={live ? 'true' : undefined}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '0.55rem 0.4rem', textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.15rem', fontWeight: 900, color }} aria-hidden="true">
        {value}
      </div>
      <div style={{
        fontSize: '0.58rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', marginTop: '0.1rem', letterSpacing: '0.04em',
      }}>
        {label}
      </div>
    </div>
  );
});

interface DifficultyButtonProps {
  diff: Difficulty; selected: boolean;
  onSelect: (d: Difficulty) => void; disabled: boolean;
}
const DifficultyButton = memo(function DifficultyButton({
  diff, selected, onSelect, disabled,
}: DifficultyButtonProps) {
  const cfg = DIFFICULTY_CONFIG[diff];
  return (
    <button
      onClick={() => !disabled && onSelect(diff)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Select ${cfg.label} difficulty`}
      style={{
        flex: 1, padding: '0.4rem 0.3rem', borderRadius: '8px',
        border: selected ? `2px solid ${cfg.color}` : '1px solid var(--border)',
        background: selected ? `${cfg.color}1f` : 'var(--bg-card)',
        color: selected ? cfg.color : 'var(--text-muted)',
        fontWeight: 700, fontSize: '0.68rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
        opacity: disabled ? 0.45 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}
    >
      <span style={{ fontSize: '0.85rem' }} aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </button>
  );
});

interface DurationButtonProps {
  opt: DurationOption; selected: boolean;
  onSelect: (o: DurationOption) => void; disabled: boolean;
}
const DurationButton = memo(function DurationButton({
  opt, selected, onSelect, disabled,
}: DurationButtonProps) {
  const accent = 'var(--neon-cyan)';
  return (
    <button
      onClick={() => !disabled && onSelect(opt)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={
        opt === 'custom'    ? 'Select custom duration' :
        opt === 'unlimited' ? 'Select unlimited duration' :
        `Select ${opt} second duration`
      }
      style={{
        flex: 1, padding: '0.35rem 0.3rem', borderRadius: '8px',
        border: selected ? `2px solid ${accent}` : '1px solid var(--border)',
        background: selected ? `${accent}1f` : 'var(--bg-card)',
        color: selected ? accent : 'var(--text-muted)',
        fontWeight: 700, fontSize: '0.68rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {durationLabel(opt)}
    </button>
  );
});

interface InfoBoxProps {
  accent: string; bg: string; icon: string; title: string;
  children: React.ReactNode; borderStyle?: 'left' | 'full';
}
const InfoBox = memo(function InfoBox({
  accent, bg, icon, title, children, borderStyle = 'full',
}: InfoBoxProps) {
  const isLeft = borderStyle === 'left';
  return (
    <aside style={{
      background: bg,
      ...(isLeft
        ? { borderLeft: `4px solid ${accent}`, borderRadius: '0 12px 12px 0' }
        : { border: `1px solid ${accent}`, borderRadius: '12px' }),
      padding: '1.5rem',
      marginBottom: isLeft ? '2.5rem' : 0,
      marginTop: isLeft ? 0 : '1rem',
    }}>
      <h3 style={{
        color: isLeft ? '#fff' : 'var(--neon-orange)',
        fontSize: isLeft ? '1.3rem' : '1.1rem',
        fontWeight: 700, margin: '0 0 0.5rem 0',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span aria-hidden="true">{icon}</span> {title}
      </h3>
      <p style={{ margin: 0, color: '#9ca3af', fontSize: isLeft ? undefined : '0.9rem' }}>
        {children}
      </p>
    </aside>
  );
});

const GameCard = memo(function GameCard({ name }: { name: string }) {
  return (
    <li style={{
      background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1rem', borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: 600,
      fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', listStyle: 'none',
    }}>
      <span style={{ color: 'var(--neon-red)' }} aria-hidden="true">🔭</span>
      {name}
    </li>
  );
});

const FaqItem = memo(function FaqItem({
  question, children,
}: { question: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        {question}
      </h3>
      <div style={{ color: '#9ca3af' }}>{children}</div>
    </div>
  );
});

/** Small inline chevron – rotates 180° when its accordion panel is open.
 *  Drawn as raw SVG rather than pulled from an icon library so this file
 *  has no new external dependency. */
const ChevronIcon = memo(function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
});

interface AccordionItemProps {
  id: string; question: string; children: React.ReactNode;
  isOpen: boolean; onToggle: () => void;
}
/** Collapsible FAQ row: header button + chevron, animated panel beneath.
 *  Only one item is open at a time (controlled by the parent's openFaqId). */
const AccordionItem = memo(function AccordionItem({
  id, question, children, isOpen, onToggle,
}: AccordionItemProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: isOpen ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', padding: '1rem 1.25rem', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: '1rem',
        }}
      >
        <span>{question}</span>
        <span style={{ color: isOpen ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
          <ChevronIcon open={isOpen} />
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        style={{
          maxHeight: isOpen ? '700px' : '0px',
          transition: 'max-height 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '0 1.25rem 1.15rem', color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
});

const PauseOverlay = memo(function PauseOverlay({
  onResume, onRestart,
}: { onResume: () => void; onRestart: () => void }) {
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Game paused"
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.2rem',
        background: 'rgba(10,15,24,0.9)', zIndex: 30, backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '0.15em' }}>
        PAUSED
      </div>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button className="btn btn-primary" onClick={onResume} aria-label="Resume game" autoFocus>
          ▶ Resume
        </button>
        <button className="btn btn-secondary" onClick={onRestart} aria-label="Restart game">
          🔄 Restart
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
        Press <kbd style={kbdStyle}>ESC</kbd> to resume
      </p>
    </div>
  );
});

const CountdownOverlay = memo(function CountdownOverlay({ value }: { value: number | 'GO!' }) {
  const isGo = value === 'GO!';
  return (
    <div
      aria-live="assertive"
      aria-label={`Countdown: ${value}`}
      style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 30, background: 'rgba(10,15,24,0.78)', backdropFilter: 'blur(3px)',
      }}
    >
      <div key={String(value)} style={{
        fontSize: isGo ? '4.5rem' : '6.5rem',
        fontWeight: 900,
        color: isGo ? 'var(--neon-green)' : '#fff',
        textShadow: isGo ? '0 0 50px rgba(52,211,153,0.9)' : '0 0 30px rgba(255,255,255,0.6)',
        animation: 'countdownPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
});

const ComboToast = memo(function ComboToast({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div
      key={label}
      aria-live="polite"
      style={{
        position: 'absolute', top: '12px', left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,107,0,0.92)', borderRadius: '20px',
        padding: '4px 16px', fontSize: '0.85rem', fontWeight: 800,
        color: '#fff', zIndex: 20, whiteSpace: 'nowrap',
        boxShadow: '0 0 20px rgba(255,107,0,0.55)',
        animation: 'fadeInDown 0.22s ease forwards',
        pointerEvents: 'none',
      }}
    >
      {label}
    </div>
  );
});

const HitFeedbackLayer = memo(function HitFeedbackLayer({ feedbacks }: { feedbacks: HitFeedback[] }) {
  return (
    <>
      {feedbacks.map(f => (
        <div
          key={f.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: f.x, top: f.y,
            transform: 'translate(-50%, -50%)',
            color: f.color,
            fontWeight: 900, fontSize: '0.88rem',
            pointerEvents: 'none', zIndex: 15,
            textShadow: `0 0 10px ${f.color}`,
            animation: `floatUp ${FEEDBACK_TTL_MS}ms ease forwards`,
            whiteSpace: 'nowrap',
          }}
        >
          {f.text}
        </div>
      ))}
    </>
  );
});

/** Cross-tool navigation grid – links out to related keyboard/mouse
 *  benchmarking tools. Purely presentational; card data lives in MORE_TOOLS. */
const MoreToolsSection = memo(function MoreToolsSection() {
  return (
    <section aria-label="More Tools" style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
      <h2 style={{
        fontWeight: 800, fontSize: '1.5rem', color: '#fff',
        marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px',
      }}>More Tools</h2>
      <div
        className="more-tools-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '1rem',
        }}
      >
        {MORE_TOOLS.map(({ label, href, icon }) => (
          <a
            key={href}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '0.6rem',
              background: '#141a2a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '1.2rem 0.5rem',
              cursor: 'pointer', textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,85,0.07)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,85,0.3)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#141a2a';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--neon-red, #ff2d55)',
            }}>
              {icon}
            </div>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: '#cbd5e1', textAlign: 'center', lineHeight: 1.3,
            }}>{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
});

const kbdStyle: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem',
};

/** Inline citation link used throughout the SEO article – cyan text,
 *  underline, and a small external-link glyph. Mirrors the SourceLink
 *  pattern used on other tool pages so citation styling stays consistent
 *  site-wide. Always opens in a new tab with noopener/noreferrer/nofollow. */
const SourceLink = memo(function SourceLink({
  href, children,
}: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{
        color: 'var(--neon-cyan, #00f5ff)',
        textDecoration: 'none',
        borderBottom: '1px solid rgba(0,245,255,0.35)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
        style={{ display: 'inline-block', marginLeft: '3px', verticalAlign: 'middle', position: 'relative', top: '-2px' }}
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function SniperModePage() {

  const [phase,       setPhase]       = useState<Phase>('idle');
  const [gameState,   setGameState]   = useState<GameState>({ ...DEFAULT_GAME_STATE });
  const [difficulty,  setDifficulty]  = useState<Difficulty>('medium');
  const [durationOpt, setDurationOpt] = useState<DurationOption>('30');
  const [customDurationInput, setCustomDurationInput] = useState<string>('60');
  const [countdown,   setCountdown]   = useState<number | 'GO!'>(COUNTDOWN_FROM);
  const [feedbacks,   setFeedbacks]   = useState<HitFeedback[]>([]);
  const [records,     setRecords]     = useState<StoredRecords>({ ...DEFAULT_RECORDS });
  const [comboLabel,  setComboLabel]  = useState('');
  const [muted,       setMuted]       = useState(false);
  const [openFaqId,   setOpenFaqId]   = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = areaRef.current;
      if (!el) return;
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const areaRef          = useRef<HTMLDivElement>(null);
  const scopeRef         = useRef<HTMLDivElement>(null);
  const scopeInnerRef    = useRef<HTMLDivElement>(null);
  const targetElRef      = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (scopeRef.current && areaRef.current) {
        const rect = areaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        scopeRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  const animRafRef       = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTORef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboLabelTORef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef         = useRef(false); // mirror for closures that can't read state

  const targetRef        = useRef<TargetPhysics | null>(null);
  const gameStateRef     = useRef<GameState>({ ...DEFAULT_GAME_STATE });
  const phaseRef         = useRef<Phase>('idle');
  const difficultyRef    = useRef<Difficulty>('medium');

  /** Effective match length in seconds, or null for unlimited. Resolved once
   *  per launch from durationOpt + customDurationInput so a mid-match edit
   *  to the custom field can't destabilise an active game. */
  const durationSecondsRef = useRef<number | null>(DEFAULT_GAME_DURATION);
  const isUnlimitedRef     = useRef(false);

  const startTimestampRef = useRef<number>(0);
  const lastRafRef        = useRef<number>(0);
  /** Timestamp when the game was paused – used to shift startTimestampRef on
   *  resume so the progressive-difficulty ramp ignores paused time. */
  const pauseStartRef     = useRef<number>(0);

  const hitGuardRef      = useRef(false);
  const gameInitRef      = useRef(false);
  const feedbackIdRef    = useRef(0);

  // Load records and persisted mute preference on client mount
  useEffect(() => {
    setRecords(loadRecords());
    try {
      const saved = localStorage.getItem(LS_MUTE_KEY);
      if (saved === 'true') {
        mutedRef.current = true;
        setMuted(true);
        setMasterVolume(0);
      }
    } catch { /* ignore */ }
  }, []);

  const accuracy = useMemo(() => {
    const total = gameState.hits + gameState.misses;
    return total > 0 ? Math.round((gameState.hits / total) * 100) : 100;
  }, [gameState.hits, gameState.misses]);

  const isUnlimited = durationOpt === 'unlimited';
  const effectiveDurationPreview = resolveDurationSeconds(durationOpt, parseFloat(customDurationInput));
  const progressPct = isUnlimited || !effectiveDurationPreview
    ? 0
    : ((effectiveDurationPreview - gameState.timeLeft) / effectiveDurationPreview) * 100;
  const isPlaying   = phase === 'running';
  const canSetDiff  = phase === 'idle' || phase === 'done';
  const diffCfg     = DIFFICULTY_CONFIG[difficulty];

  /* ─────────────────────────────────────────────────────────────
     SYNC helpers
  ───────────────────────────────────────────────────────────── */
  const commitPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const commitGameState = useCallback((gs: GameState) => {
    // Defensive: replace any NaN/Infinity that could sneak in
    const safe: GameState = {
      score:        safeNum(gs.score),
      hits:         safeNum(gs.hits),
      misses:       safeNum(gs.misses),
      criticalHits: safeNum(gs.criticalHits),
      combo:        safeNum(gs.combo),
      bestCombo:    safeNum(gs.bestCombo),
      streak:       safeNum(gs.streak),
      bestStreak:   safeNum(gs.bestStreak),
      timeLeft:     safeNum(gs.timeLeft, DEFAULT_GAME_DURATION),
    };
    gameStateRef.current = safe;
    setGameState({ ...safe });
  }, []);

  const selectDifficulty = useCallback((d: Difficulty) => {
    if (!canSetDiff) return;
    difficultyRef.current = d;
    setDifficulty(d);
  }, [canSetDiff]);

  const selectDuration = useCallback((o: DurationOption) => {
    if (!canSetDiff) return;
    setDurationOpt(o);
  }, [canSetDiff]);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  }, []);

  const handleCustomDurationChange = useCallback((raw: string) => {
    // Allow free typing (including empty string mid-edit); clamp only on use
    if (!/^\d{0,4}$/.test(raw)) return;
    setCustomDurationInput(raw);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     MUTE TOGGLE
  ───────────────────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    setMasterVolume(next ? 0 : 1);
    try { localStorage.setItem(LS_MUTE_KEY, String(next)); } catch { /* quota */ }
  }, []);

  /* ─────────────────────────────────────────────────────────────
     COMBO LABEL – auto-clears after TTL so it never lingers
  ───────────────────────────────────────────────────────────── */
  const showComboLabel = useCallback((label: string) => {
    if (!label) return;
    setComboLabel(label);
    if (comboLabelTORef.current) clearTimeout(comboLabelTORef.current);
    comboLabelTORef.current = setTimeout(() => {
      setComboLabel('');
      comboLabelTORef.current = null;
    }, COMBO_LABEL_TTL_MS);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     STOP ALL
  ───────────────────────────────────────────────────────────── */
  const stopAll = useCallback(() => {
    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = 0;
    if (timerIntervalRef.current)  { clearInterval(timerIntervalRef.current);  timerIntervalRef.current = null; }
    if (countdownTORef.current)    { clearTimeout(countdownTORef.current);     countdownTORef.current = null; }
    if (comboLabelTORef.current)   { clearTimeout(comboLabelTORef.current);    comboLabelTORef.current = null; }
    lastRafRef.current = 0;
    pauseStartRef.current = 0;
    hitGuardRef.current = false;
    gameInitRef.current = false;
  }, []);

  /* ─────────────────────────────────────────────────────────────
     UPDATE TARGET ELEMENT (direct DOM, zero React involvement)
  ───────────────────────────────────────────────────────────── */
  const applyTargetTransform = useCallback((t: TargetPhysics) => {
    const el = targetElRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${t.x - t.size}px,${t.y - t.size}px,0)`;
  }, []);

  /* ─────────────────────────────────────────────────────────────
     END GAME – shared by "time's up" and manual Finish (unlimited mode)
  ───────────────────────────────────────────────────────────── */
  const endGame = useCallback((finalState: GameState) => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = 0;

    const rec = loadRecords();
    const newRec: StoredRecords = {
      bestScore:   Math.max(rec.bestScore, finalState.score),
      bestStreak:  Math.max(rec.bestStreak, finalState.bestStreak),
      bestCombo:   Math.max(rec.bestCombo, finalState.bestCombo),
      gamesPlayed: rec.gamesPlayed + 1,
      totalHits:   rec.totalHits + finalState.hits,
      totalMisses: rec.totalMisses + finalState.misses,
    };
    saveRecords(newRec);
    setRecords(newRec);

    targetRef.current = null;
    if (targetElRef.current) targetElRef.current.style.display = 'none';
    soundGameOver();
    commitPhase('done');
  }, [commitPhase]);

  /* ─────────────────────────────────────────────────────────────
     ANIMATION LOOP
  ───────────────────────────────────────────────────────────── */
  const animate = useCallback((timestamp: number) => {
    if (phaseRef.current !== 'running') return;

    const area = areaRef.current;
    const t    = targetRef.current;
    if (!area || !t) return;

    const prev   = lastRafRef.current || timestamp;
    const rawDt  = timestamp - prev;
    const dt     = Math.min(rawDt, 50);
    lastRafRef.current = timestamp;
    const dtFactor = dt / (1000 / FRAME_REF_HZ);

    // elapsed excludes any time spent paused, since pause() -> resume()
    // shifts startTimestampRef forward by the paused duration.
    const elapsed   = timestamp - startTimestampRef.current;
    const speedMult = clamp(1 + elapsed * PROGRESSIVE_ACCEL, 1, MAX_SPEED_MULT);

    const cfg = DIFFICULTY_CONFIG[difficultyRef.current];
    const { width: areaWidth, height: areaHeight } = area.getBoundingClientRect();

    const next = stepPhysics(t, areaWidth, areaHeight, speedMult, dtFactor, difficultyRef.current === 'impossible', cfg);
    targetRef.current = next;

    applyTargetTransform(next);

    animRafRef.current = requestAnimationFrame(animate);
  }, [applyTargetTransform]);

  /* ─────────────────────────────────────────────────────────────
     TIMER
  ───────────────────────────────────────────────────────────── */
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'running') return;

      const gs = gameStateRef.current;

      if (isUnlimitedRef.current) {
        // Count UP with no auto-end; player ends the match manually.
        const next = parseFloat((gs.timeLeft + TIMER_INTERVAL_MS / 1000).toFixed(1));
        commitGameState({ ...gs, timeLeft: next });
        return;
      }

      const next = parseFloat((Math.max(0, gs.timeLeft - TIMER_INTERVAL_MS / 1000)).toFixed(1));
      const updated: GameState = { ...gs, timeLeft: next };
      commitGameState(updated);

      if (next <= 0) {
        endGame(updated);
      }
    }, TIMER_INTERVAL_MS);
  }, [commitGameState, endGame]);

  /* ─────────────────────────────────────────────────────────────
     LAUNCH GAME
  ───────────────────────────────────────────────────────────── */
  const launchGame = useCallback(() => {
    if (gameInitRef.current) return;
    gameInitRef.current = true;

    const area = areaRef.current;
    if (!area) { gameInitRef.current = false; return; }

    // Resolve duration once at launch time so it can't drift mid-match.
    const resolved = resolveDurationSeconds(durationOpt, parseFloat(customDurationInput));
    durationSecondsRef.current = resolved;
    isUnlimitedRef.current = resolved === null;

    const { width: areaWidth, height: areaHeight } = area.getBoundingClientRect();
    const cfg = DIFFICULTY_CONFIG[difficultyRef.current];

    const gs: GameState = {
      ...DEFAULT_GAME_STATE,
      timeLeft: isUnlimitedRef.current ? 0 : (resolved as number),
    };
    commitGameState(gs);
    setFeedbacks([]);
    setComboLabel('');
    hitGuardRef.current = false;

    const t = spawnTarget(areaWidth, areaHeight, cfg, null);
    targetRef.current = t;

    const el = targetElRef.current;
    if (el) {
      const diameter = t.size * 2;
      el.style.display = 'block';
      el.style.width   = `${diameter}px`;
      el.style.height  = `${diameter}px`;
      el.style.borderRadius = '50%';
      applyTargetTransform(t);
    }

    startTimestampRef.current = performance.now();
    lastRafRef.current = 0;
    animRafRef.current = requestAnimationFrame(animate);

    startTimer();
    commitPhase('running');
  }, [commitGameState, commitPhase, animate, startTimer, applyTargetTransform, durationOpt, customDurationInput]);

  /* ─────────────────────────────────────────────────────────────
     COUNTDOWN SEQUENCE
  ───────────────────────────────────────────────────────────── */
  const beginCountdown = useCallback(() => {
    if (phaseRef.current === 'countdown' || phaseRef.current === 'running') return;
    stopAll();
    commitPhase('countdown');

    if (targetElRef.current) targetElRef.current.style.display = 'none';
    targetRef.current = null;

    let count: number | 'GO!' = COUNTDOWN_FROM;
    setCountdown(count);

    const tick = () => {
      if (phaseRef.current !== 'countdown') return;
      const next = typeof count === 'number' ? count - 1 : 0;
      if (next > 0) {
        count = next;
        setCountdown(count);
        soundCountdownBeep();
        countdownTORef.current = setTimeout(tick, COUNTDOWN_STEP_MS);
      } else {
        count = 'GO!';
        setCountdown('GO!');
        soundGo();
        countdownTORef.current = setTimeout(() => {
          setCountdown(COUNTDOWN_FROM);
          launchGame();
        }, GO_DISPLAY_MS);
      }
    };
    soundCountdownBeep(); // first beep for the initial "3"
    countdownTORef.current = setTimeout(tick, COUNTDOWN_STEP_MS);
  }, [stopAll, commitPhase, launchGame]);

  /* ─────────────────────────────────────────────────────────────
     PAUSE / RESUME
  ───────────────────────────────────────────────────────────── */
  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = 0;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    lastRafRef.current = 0;
    pauseStartRef.current = performance.now();
    commitPhase('paused');
  }, [commitPhase]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    // Shift the ramp's reference point forward by however long we were
    // paused, so the progressive speed multiplier ignores paused time.
    if (pauseStartRef.current) {
      startTimestampRef.current += performance.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
    }
    commitPhase('running');
    animRafRef.current = requestAnimationFrame(animate);
    startTimer();
  }, [commitPhase, animate, startTimer]);

  const handleReset = useCallback(() => {
    stopAll();
    targetRef.current = null;
    if (targetElRef.current) targetElRef.current.style.display = 'none';
    const gs = { ...DEFAULT_GAME_STATE };
    commitGameState(gs);
    setFeedbacks([]);
    setComboLabel('');
    commitPhase('idle');
  }, [stopAll, commitGameState, commitPhase]);

  /** Manually end an unlimited-duration match, saving the score like a normal finish. */
  const handleFinish = useCallback(() => {
    if (phaseRef.current !== 'running' && phaseRef.current !== 'paused') return;
    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = 0;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    endGame(gameStateRef.current);
  }, [endGame]);

  /* ─────────────────────────────────────────────────────────────
     ESC KEY
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (phaseRef.current === 'running') pause();
      else if (phaseRef.current === 'paused') resume();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pause, resume]);

  useEffect(() => () => stopAll(), [stopAll]);

  /* ─────────────────────────────────────────────────────────────
     HIT LOGIC – shared by mouse and touch
  ───────────────────────────────────────────────────────────── */
  const processHit = useCallback((clientX: number, clientY: number) => {
    if (phaseRef.current !== 'running') return;
    if (hitGuardRef.current) return;
    hitGuardRef.current = true;
    requestAnimationFrame(() => { hitGuardRef.current = false; });

    const t    = targetRef.current;
    const area = areaRef.current;
    if (!t || !area) return;

    const rect   = area.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const dist   = Math.sqrt((clickX - t.x) ** 2 + (clickY - t.y) ** 2);
    const isCrit = dist < t.size * CRIT_RADIUS_RATIO;

    const gs        = gameStateRef.current;
    const newCombo  = gs.combo + 1;
    const { mult, label: comboLbl } = getComboInfo(newCombo);
    const cfg       = DIFFICULTY_CONFIG[difficultyRef.current];
    const base      = isCrit ? CRIT_SCORE : HIT_SCORE;
    const earned    = safeNum(Math.max(0, Math.round(base * mult * cfg.scoreMultiplier)));

    const newStreak    = gs.streak + 1;
    const newBestStreak = Math.max(gs.bestStreak, newStreak);
    const newBestCombo  = Math.max(gs.bestCombo, newCombo);

    const updated: GameState = {
      ...gs,
      score:        safeNum(Math.max(0, gs.score + earned)),
      hits:         gs.hits + 1,
      criticalHits: gs.criticalHits + (isCrit ? 1 : 0),
      combo:        newCombo,
      bestCombo:    newBestCombo,
      streak:       newStreak,
      bestStreak:   newBestStreak,
    };
    commitGameState(updated);

    // Sound: crit or normal hit, then combo unlock if threshold crossed
    if (isCrit) soundCrit(); else soundHit();
    // Fire combo sound when a new threshold is first reached (exact boundary).
    // Tier is looked up explicitly by multiplier value (see COMBO_SOUND_TIER)
    // rather than derived from array index, which is inverted since
    // COMBO_THRESHOLDS is sorted descending by hit count.
    const prevComboInfo = getComboInfo(gs.combo);
    const nextComboInfo = getComboInfo(newCombo);
    if (nextComboInfo.mult > prevComboInfo.mult) {
      const tier = COMBO_SOUND_TIER[nextComboInfo.mult] ?? 1;
      setTimeout(() => soundCombo(tier), 60); // slight delay so it layers after hit
    }

    if (comboLbl) showComboLabel(comboLbl);

    const fid = ++feedbackIdRef.current;
    setFeedbacks(prev => [
      ...prev.slice(-7),
      {
        id: fid, x: t.x, y: t.y,
        text:  isCrit ? `⚡ CRIT +${earned}` : `+${earned}`,
        color: isCrit ? '#facc15' : '#34d399',
      },
    ]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== fid)), FEEDBACK_TTL_MS);

    const { width: areaWidth, height: areaHeight } = area.getBoundingClientRect();
    const next = spawnTarget(areaWidth, areaHeight, cfg, t);
    targetRef.current = next;

    const el = targetElRef.current;
    if (el) {
      const diameter = next.size * 2;
      el.style.width  = `${diameter}px`;
      el.style.height = `${diameter}px`;
      applyTargetTransform(next);
    }
  }, [commitGameState, applyTargetTransform, showComboLabel]);

  /* ─────────────────────────────────────────────────────────────
     HIT HANDLER – mouse
  ───────────────────────────────────────────────────────────── */
  const handleHit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    processHit(e.clientX, e.clientY);
  }, [processHit]);

  /* ─────────────────────────────────────────────────────────────
     HIT HANDLER – touch (for mobile)
  ───────────────────────────────────────────────────────────── */
  const handleHitTouch = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault(); // prevent ghost mouse event
    const touch = e.changedTouches[0];
    if (touch) processHit(touch.clientX, touch.clientY);
  }, [processHit]);

  /* ─────────────────────────────────────────────────────────────
     MISS HANDLER – mouse
  ───────────────────────────────────────────────────────────── */
  const handleMiss = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    soundMiss();
    const gs = gameStateRef.current;
    const updated: GameState = {
      ...gs,
      misses: gs.misses + 1,
      combo:  0,
      score:  safeNum(Math.max(0, gs.score + MISS_PENALTY)),
    };
    commitGameState(updated);
    setComboLabel('');
    if (comboLabelTORef.current) { clearTimeout(comboLabelTORef.current); comboLabelTORef.current = null; }
  }, [commitGameState]);

  /* ─────────────────────────────────────────────────────────────
     MISS HANDLER – touch (tap on arena background, not target)
  ───────────────────────────────────────────────────────────── */
  const handleMissTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (phaseRef.current !== 'running') return;
    // Only count as miss if the touch originated directly on the arena (not the target button)
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();
    handleMiss();
  }, [handleMiss]);

  /* ─────────────────────────────────────────────────────────────
     DERIVED RECORDS
  ───────────────────────────────────────────────────────────── */
  const avgAccuracy = useMemo(() => calcAvgAccuracy(records), [records]);

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes countdownPop {
          0%   { transform: scale(1.7) translateY(10px); opacity: 0; }
          60%  { transform: scale(0.96) translateY(0);   opacity: 1; }
          100% { transform: scale(1)   translateY(0);   opacity: 1; }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, -170%); }
        }
        @keyframes fadeInDown {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes targetPulse {
          0%   { box-shadow: 0 0 0 0   rgba(255,45,85,0.65), 0 0 14px rgba(255,45,85,0.8); }
          70%  { box-shadow: 0 0 0 9px rgba(255,45,85,0),    0 0 14px rgba(255,45,85,0.8); }
          100% { box-shadow: 0 0 0 0   rgba(255,45,85,0),    0 0 14px rgba(255,45,85,0.8); }
        }
        @keyframes indeterminateSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }

        /* Hide native cursor during play */
        .arena-playing, .arena-playing * {
          cursor: none !important;
        }

        @keyframes sniperRecoil {
          0% { transform: translate(-50%, -50%); }
          20% { transform: translate(-50%, calc(-50% - 30px)) rotate(-1deg); }
          50% { transform: translate(-50%, calc(-50% + 5px)) rotate(0.5deg); }
          100% { transform: translate(-50%, -50%) rotate(0); }
        }
        .recoil-active {
          animation: sniperRecoil 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @media (max-width: 520px) {
          .more-tools-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <main
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
        aria-label="Sniper Aim Trainer game and guide"
      >

        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Aim Tool</div>
          <h1 className="tool-title">
            Sniper Mode
          </h1>
          <p className="tool-subtitle">Track and hit the small moving target — precision matters!</p>
        </header>

        <section aria-label="Game arena">

          {/* Difficulty selector */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontSize: '0.62rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem',
            }}>
              Difficulty
            </div>
            <div role="group" aria-label="Select difficulty" style={{ display: 'flex', gap: '0.35rem' }}>
              {DIFFICULTY_ORDER.map(d => (
                <DifficultyButton
                  key={d} diff={d}
                  selected={difficulty === d}
                  onSelect={selectDifficulty}
                  disabled={!canSetDiff}
                />
              ))}
            </div>
          </div>

          {/* Duration selector */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              fontSize: '0.62rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem',
            }}>
              Duration
            </div>
            <div
              role="group" aria-label="Select match duration"
              style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}
            >
              {DURATION_PRESETS.map(opt => (
                <DurationButton
                  key={opt} opt={opt}
                  selected={durationOpt === opt}
                  onSelect={selectDuration}
                  disabled={!canSetDiff}
                />
              ))}
            </div>
            {durationOpt === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                <label htmlFor="custom-duration-input" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Seconds:
                </label>
                <input
                  id="custom-duration-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customDurationInput}
                  disabled={!canSetDiff}
                  onChange={e => handleCustomDurationChange(e.target.value)}
                  onBlur={() => {
                    const clamped = clamp(
                      safeNum(parseFloat(customDurationInput), DEFAULT_GAME_DURATION),
                      MIN_CUSTOM_DURATION, MAX_CUSTOM_DURATION,
                    );
                    setCustomDurationInput(String(clamped));
                  }}
                  aria-label="Custom duration in seconds"
                  style={{
                    width: '5.5rem', padding: '0.4rem 0.6rem', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: 'var(--neon-cyan)', fontWeight: 700, fontSize: '0.9rem',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({MIN_CUSTOM_DURATION}–{MAX_CUSTOM_DURATION}s)
                </span>
              </div>
            )}
            {durationOpt === 'unlimited' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                Time counts up with no limit. Press <strong>Finish</strong> during play to end the match and save your score.
              </p>
            )}
          </div>

          {/* Primary stat row – score and timer are aria-live for screen readers */}
          <div
            role="group" aria-label="Game statistics"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}
          >
            <StatCard value={gameState.score}                label="Score"    color="var(--neon-cyan)"   live={isPlaying} />
            <StatCard value={`${accuracy}%`}                label="Accuracy" color="var(--neon-green)"  />
            <StatCard value={gameState.misses}              label="Misses"   color="var(--neon-red)"    />
            <StatCard
              value={gameState.timeLeft.toFixed(1)}
              label={isUnlimited ? 'Elapsed' : 'Time'}
              color="var(--neon-orange)"
              live={isPlaying}
            />
          </div>

          {/* Secondary stat row */}
          <div
            role="group" aria-label="Combo and streak statistics"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}
          >
            <StatCard value={gameState.combo}      label="Combo"       color="var(--neon-orange)" />
            <StatCard value={gameState.bestCombo}  label="Best Combo"  color="#a855f7"            />
            <StatCard value={gameState.streak}     label="Streak"      color="var(--neon-cyan)"   />
            <StatCard value={gameState.bestStreak} label="Best Streak" color="var(--neon-green)"  />
          </div>

          {/* Progress bar – indeterminate sweep for unlimited mode */}
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={isUnlimited ? undefined : Math.round(progressPct)}
            aria-valuemin={isUnlimited ? undefined : 0}
            aria-valuemax={isUnlimited ? undefined : 100}
            aria-label={isUnlimited ? 'Time elapsed (unlimited match)' : 'Time elapsed'}
            style={{ marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}
          >
            {isUnlimited ? (
              isPlaying && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: 0, bottom: 0, width: '30%',
                    background: 'var(--neon-orange)',
                    animation: 'indeterminateSlide 1.1s linear infinite',
                    borderRadius: 'inherit',
                  }}
                />
              )
            ) : (
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            )}
          </div>

          {/* ── Arena ── */}
          <div
            ref={areaRef}
            onMouseDownCapture={() => {
              if (isPlaying) {
                soundShoot();
                if (scopeInnerRef.current) {
                  scopeInnerRef.current.classList.remove('recoil-active');
                  void scopeInnerRef.current.offsetWidth;
                  scopeInnerRef.current.classList.add('recoil-active');
                }
              }
            }}
            onTouchStartCapture={() => {
              if (isPlaying) {
                soundShoot();
                if (scopeInnerRef.current) {
                  scopeInnerRef.current.classList.remove('recoil-active');
                  void scopeInnerRef.current.offsetWidth;
                  scopeInnerRef.current.classList.add('recoil-active');
                }
              }
            }}
            onClick={() => {
              if (isPlaying) handleMiss();
              else if (phase === 'idle' || phase === 'done') beginCountdown();
            }}
            onTouchStart={(e) => {
              if (isPlaying) handleMissTouch(e);
              else if (phase === 'idle' || phase === 'done') beginCountdown();
            }}
            role="application"
            aria-label={
              phase === 'running'   ? 'Click the moving red target. Clicking elsewhere counts as a miss.' :
              phase === 'paused'    ? 'Game paused.' :
              phase === 'done'      ? `Game over. Final score: ${gameState.score}. Accuracy: ${accuracy}%.` :
              phase === 'countdown' ? 'Get ready…' :
              'Game arena. Press Start to begin.'
            }
            className={isPlaying ? 'arena-playing' : undefined}
            style={{
              position: 'relative', width: '100%', height: isFullscreen ? '100vh' : `${AREA_HEIGHT}px`,
              background: isFullscreen ? '#02040a' : '#0a0f18',
              border: `2px solid ${isPlaying ? 'rgba(255,45,85,0.5)' : 'var(--border)'}`,
              borderRadius: '16px', overflow: 'hidden',
              cursor: isPlaying ? undefined : 'default', // cursor set by class above when playing
              marginBottom: '1.5rem',
              contain: 'layout style paint',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none', // prevent scroll interference on mobile
            }}
          >
            {/* Global Hide Cursor Style */}
            {typeof document !== 'undefined' && isPlaying && createPortal(
              <style>{`* { cursor: none !important; }`}</style>,
              document.head
            )}
            
            {/* Custom Scope Cursor */}
            <div ref={scopeRef} style={{
              position: 'absolute',
              top: 0, left: 0,
              pointerEvents: 'none',
              zIndex: 999999,
              display: isPlaying ? 'block' : 'none'
            }}>
              <div ref={scopeInnerRef} style={{
                width: '128px', height: '128px',
                transform: 'translate(-50%, -50%)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' stroke='%2300ff00' stroke-width='4' fill='none' opacity='0.8'/%3E%3Ccircle cx='64' cy='64' r='50' stroke='%2300ff00' stroke-width='1.5' fill='none' opacity='0.5'/%3E%3Cline x1='0' y1='64' x2='128' y2='64' stroke='%2300ff00' stroke-width='2' opacity='0.8'/%3E%3Cline x1='64' y1='0' x2='64' y2='128' stroke='%2300ff00' stroke-width='2' opacity='0.8'/%3E%3Ccircle cx='64' cy='64' r='3' fill='%2300ff00'/%3E%3Cline x1='60' y1='84' x2='68' y2='84' stroke='%2300ff00' stroke-width='1.5'/%3E%3Cline x1='56' y1='104' x2='72' y2='104' stroke='%2300ff00' stroke-width='1.5'/%3E%3Ctext x='74' y='88' fill='%2300ff00' font-family='sans-serif' font-size='10' font-weight='bold'%3E300%3C/text%3E%3Ctext x='74' y='108' fill='%2300ff00' font-family='sans-serif' font-size='10' font-weight='bold'%3E400%3C/text%3E%3C/svg%3E")`,
                backgroundSize: 'contain'
              }} />
            </div>

            {/* Decorative crosshair guides */}
            {isPlaying && (
              <>
                <div aria-hidden="true" style={{
                  position: 'absolute', top: '50%', left: 0, right: 0,
                  height: '1px', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                }} />
                <div aria-hidden="true" style={{
                  position: 'absolute', left: '50%', top: 0, bottom: 0,
                  width: '1px', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                }} />
              </>
            )}

            {/* Fullscreen Exit Floating Button */}
            {isFullscreen && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                aria-label="Exit fullscreen"
                style={{
                  position: 'absolute', top: '1rem', right: '1rem', zIndex: 50,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                  padding: '0.5rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)',
                }}
              >
                <Minimize size={18} />
              </button>
            )}

            {isPlaying && <ComboToast label={comboLabel} />}

            {phase === 'countdown' && <CountdownOverlay value={countdown} />}

            {phase === 'paused' && <PauseOverlay onResume={resume} onRestart={handleReset} />}

            {(phase === 'idle' || phase === 'done') && (
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              }}>
                <span style={{ fontSize: '4rem' }}>🔭</span>
                <span style={{
                  fontSize: '1.5rem', fontWeight: 800,
                  color: phase === 'done' ? 'var(--neon-orange)' : 'var(--neon-red)',
                }}>
                  {phase === 'done' ? `Final Score: ${gameState.score}` : 'Click anywhere to start — Hit the Moving Target'}
                </span>
                {phase === 'done' && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click anywhere to play again</div>
                )}
                {phase === 'done' && (
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--neon-green)' }}>{accuracy}% Accuracy</span>
                    <span style={{ color: '#a855f7' }}>Best Combo ×{gameState.bestCombo}</span>
                    <span style={{ color: 'var(--neon-cyan)' }}>Best Streak {gameState.bestStreak}</span>
                    <span style={{ color: gameState.criticalHits > 0 ? '#facc15' : 'var(--text-muted)' }}>
                      {gameState.criticalHits} Crits
                    </span>
                  </div>
                )}
                {phase === 'done' && records.gamesPlayed > 0 && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    All-time best: {records.bestScore} pts &middot; {records.gamesPlayed} games played
                  </div>
                )}
              </div>
            )}

            <HitFeedbackLayer feedbacks={feedbacks} />

            {/*
              Moving target button – permanently mounted, shown/hidden via style.display.
              touch-action: none prevents scroll-while-aiming on mobile.
            */}
            <button
              ref={targetElRef}
              onClick={handleHit}
              onTouchStart={handleHitTouch}
              aria-label="Hit this target"
              style={{
                display: 'none',
                position: 'absolute',
                left: 0, top: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,45,85,1) 20%, rgba(255,107,0,0.8) 60%, transparent 100%)',
                border: `2px solid ${diffCfg.color}`,
                cursor: 'crosshair',
                animation: 'targetPulse 1.15s infinite',
                zIndex: 10, padding: 0,
                willChange: 'transform',
                touchAction: 'none', // prevent scroll hijack on mobile
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>

          {/* Controls */}
          <div
            role="group" aria-label="Game controls"
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}
          >
            {(phase === 'idle' || phase === 'done') && (
              <button
                className="btn btn-primary"
                onClick={beginCountdown}
                aria-label={phase === 'done' ? 'Play again' : 'Start Sniper Mode'}
              >
                {phase === 'done' ? '▶ Play Again' : '🔭 Start Sniper Mode'}
              </button>
            )}
            {phase === 'running' && (
              <button className="btn btn-secondary" onClick={pause} aria-label="Pause game (ESC)">
                ⏸ Pause
              </button>
            )}
            {isUnlimited && (phase === 'running' || phase === 'paused') && (
              <button className="btn btn-primary" onClick={handleFinish} aria-label="Finish match and save score">
                🏁 Finish
              </button>
            )}
            {(phase === 'running' || phase === 'paused' || phase === 'done') && (
              <button className="btn btn-secondary" onClick={handleReset} aria-label="Reset game">
                🔄 Reset
              </button>
            )}
            {/* Mute toggle – always visible so players can silence before starting */}
            <button
              className="btn btn-secondary"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              aria-pressed={muted}
              style={{ minWidth: '2.8rem', fontSize: '1.1rem', padding: '0.5rem 0.85rem' }}
            >
              {muted ? '🔇' : '🔊'}
            </button>

            {/* Fullscreen */}
            <button
              className="btn btn-secondary"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{ minWidth: '2.8rem', fontSize: '1.1rem', padding: '0.5rem 0.85rem' }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>

          {phase === 'running' && (
            <p
              style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}
              aria-hidden="true"
            >
              Press <kbd style={kbdStyle}>ESC</kbd> to pause
            </p>
          )}

          {/* All-time records panel – now includes avg accuracy */}
          {records.gamesPlayed > 0 && (phase === 'idle' || phase === 'done') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2.5rem' }}>
              <StatCard value={records.bestScore}  label="Best Score"  color="var(--neon-cyan)"  />
              <StatCard value={records.bestStreak} label="Best Streak" color="var(--neon-green)" />
              <StatCard value={records.bestCombo}  label="Best Combo"  color="#a855f7"           />
              <StatCard value={`${avgAccuracy}%`}  label="Avg Accuracy" color="var(--neon-orange)" />
            </div>
          )}

        </section>

        {/* ── MORE TOOLS GRID ── */}
        <MoreToolsSection />

        {/* ══════════════════════════════════════
            SEO ARTICLE
        ══════════════════════════════════════ */}
        <article
          aria-label="Sniper aim trainer guide and tips"
          style={{
            padding: '0', marginTop: '3rem',
          }}
        >
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>

            <header>
              <h2 style={{
                fontWeight: 800, fontSize: '2rem', marginBottom: '1.5rem',
                color: 'var(--neon-red)', marginTop: 0, letterSpacing: '-0.5px',
              }}>
                What Is a Sniper Aim Trainer?
              </h2>
              <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
                This <strong>sniper aim trainer</strong> is a free online tracking aim test designed to sharpen
                your <strong>tracking aim</strong> — the ability to keep your crosshair locked onto a continuously
                moving target. Unlike static click tests, this <strong>online aim trainer</strong> challenges your
                hand-eye coordination with an unpredictable, bouncing dot that replicates real enemy movement in
                FPS games. Whether you want to boost your <strong>mouse accuracy</strong>, build consistent{' '}
                <strong>aim practice</strong> habits, or dominate sniper duels in competitive shooters, this tool
                provides targeted, measurable training — with four difficulty modes, a progressive speed system,
                a combo multiplier, critical hits, selectable match lengths from 1 second to unlimited, and
                persistent records that track your improvement over time.
              </p>
            </header>

            <InfoBox
              accent="var(--neon-red)" bg="rgba(255, 45, 85, 0.05)"
              icon="🖱️" title='The "New Mouse" Tracking Calibration Test'
              borderStyle="left"
            >
              Just got a new gaming mouse? Use this sniper aim trainer to verify your sensor&apos;s polling
              rate stability, test your PTFE skates for smooth glide, and dial in your DPI before stepping into
              ranked matches. Overshooting the dot consistently means your sensitivity is too high — trailing
              it means you need more speed or a larger mousepad.
            </InfoBox>

            <section aria-labelledby="tracking-section-heading">
              <h2
                id="tracking-section-heading"
                style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}
              >
                How to Improve Tracking Aim for FPS Games
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Consistent tracking aim is one of the most feared skills in competitive gaming. A player who
                keeps their crosshair glued to a moving enemy applies constant pressure and converts more shots
                into eliminations. This aim trainer sharpens that skill through repeated, focused repetitions
                — the only reliable path to durable muscle memory. Research on{' '}
                <SourceLink href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7908336/">hand-eye coordination</SourceLink>{' '}
                shows that short, focused tracking drills produce measurable reaction-time and coordination
                gains within days of consistent practice.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                Daily sessions with a <strong>tracking aim trainer</strong> like this one measurably improve
                performance across popular titles:
              </p>
              <ul
                aria-label="Supported games"
                style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '1rem', marginBottom: '3rem', padding: 0,
                }}
              >
                {SUPPORTED_GAMES.map(game => <GameCard key={game} name={game} />)}
              </ul>
            </section>

            <section aria-labelledby="tips-heading">
              <h2
                id="tips-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                Best Aim Training Tips for FPS Games
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <FaqItem question="How do I improve sniper tracking in PUBG and Warzone?">
                  In large-scale battle royales like <strong>PUBG: Battlegrounds</strong> and{' '}
                  <strong>Call of Duty: Warzone</strong>, enemies are rarely stationary. To land shots with a
                  Kar98k or HDR on a moving target, you must learn to &quot;lead&quot; your crosshair — placing
                  it slightly ahead of your target&apos;s travel direction. This trainer&apos;s bouncing dot
                  forces you to maintain smooth, continuous cursor movement and builds the muscle memory needed
                  to track lateral strafes and diagonal rushes without jerking your wrist.
                </FaqItem>

                <FaqItem question="How can I improve AWP and sniper precision in CS2 and Valorant?">
                  The AWP in <strong>Counter-Strike 2</strong> and the Operator in Valorant punish every miss
                  severely — a missed shot often means death. Alongside disciplined crosshair placement, you
                  need the ability to micro-track an enemy who jiggle-peeks or swings wide. Regular sessions
                  with this <strong>mouse aim trainer</strong> train you to click precisely when your reticle
                  aligns with a small, moving hitbox, sharpening the single-shot discipline these rifles demand.
                </FaqItem>

                <FaqItem question="How does tracking aim training help with Minecraft PvP bow fights?">
                  Bow aiming in <strong>Minecraft</strong> PvP requires your cursor to stay locked on an
                  opponent while both players strafe simultaneously. If your crosshair drifts even slightly,
                  your arrows miss entirely. Sniper mode forces tight, sustained cursor control and translates
                  directly to improved ranged accuracy on servers like Hypixel and competitive UHC play.
                </FaqItem>

                <FaqItem question="How do I react faster to sudden direction changes in FPS games?">
                  When the target bounces off a wall in this trainer, it instantly reverses direction —
                  mimicking the unpredictable strafes of real players in <strong>Fortnite</strong>,{' '}
                  <strong>Apex Legends</strong>, and similar games. Three principles accelerate your reaction:
                  <br /><br />
                  <strong>1. React, don&apos;t predict.</strong> Keep your eyes on the dot itself, not where
                  you think it&apos;s going — prediction causes overshooting.<br />
                  <strong>2. Relax your grip.</strong> Grip tension reduces fine motor control. A relaxed hold
                  enables faster micro-adjustments.<br />
                  <strong>3. Upgrade your refresh rate.</strong> On a 144 Hz or 240 Hz monitor the dot&apos;s
                  movement appears significantly smoother, reducing perceived visual lag.
                </FaqItem>
              </div>

              <InfoBox
                accent="rgba(255,107,0,0.2)" bg="rgba(255, 107, 0, 0.05)"
                icon="💡" title="Professional Aim Training Tips: Optimise Your eDPI"
                borderStyle="full"
              >
                Your effective DPI (eDPI = hardware DPI × in-game sensitivity) is the single biggest variable
                in tracking consistency. If you constantly overshoot the red target, your eDPI is too high; if
                you trail behind it, increase sensitivity or use a larger mousepad. Most top-level FPS players
                use 400–800 DPI and move primarily from the elbow and forearm rather than the wrist for long
                tracking sweeps, a pattern documented in general <SourceLink href="https://en.wikipedia.org/wiki/Computer_mouse">computer input device</SourceLink>{' '}
                ergonomics literature. Reduce your DPI, reclaim control, and let this aim trainer confirm the
                improvement session by session.
              </InfoBox>
            </section>

            <section aria-labelledby="science-heading" style={{ marginTop: '3rem' }}>
              <h2
                id="science-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                The Science and History Behind Aim Trainers
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <p style={{ margin: 0 }}>
                  Dedicated aim practice is nowhere near a new idea — it just used to look very different.
                  In the late 1990s, competitive players of early arena shooters like <strong>Quake</strong> and{' '}
                  <strong>Unreal Tournament</strong> built custom maps filled with bots that spawned in rapid,
                  predictable sequences purely so they could grind flick shots and tracking between matches.
                  There was no scoring system, no difficulty curve, and no way to compare a session today
                  against a session from last week — just a private map, a keyboard, and thousands of repeated
                  clicks. That grassroots culture of self-directed practice is the direct ancestor of every
                  modern <strong>online aim trainer</strong>, including this one.
                </p>
                <p style={{ margin: 0 }}>
                  Standalone aim-training software started appearing in the 2010s as esports scenes around{' '}
                  <strong>Counter-Strike</strong> and later <strong>Valorant</strong> and <strong>Overwatch</strong>{' '}
                  matured into full-time careers. These tools introduced the ideas players now take for
                  granted: adjustable target size, configurable movement speed, session-by-session score
                  tracking, and leaderboard comparisons. What they were chasing was a way to isolate a single
                  mechanical skill — tracking, flicking, target switching — away from the noise of an actual
                  match, where a missed shot could just as easily be blamed on positioning, game sense, or
                  bad luck instead of the hand itself.
                </p>
                <p style={{ margin: 0 }}>
                  Underneath the game-like presentation, aim training rests on decades of{' '}
                  <SourceLink href="https://en.wikipedia.org/wiki/Motor_learning">motor-learning research</SourceLink>.
                  Skill acquisition scientists distinguish between <strong>open-loop</strong> movements
                  planned in advance and fired off without feedback, and <strong>closed-loop</strong> movements
                  that are continuously corrected using visual feedback while they happen. Tracking a moving
                  target is almost entirely closed-loop: your eyes feed position information to your hand in a
                  tight, repeating cycle, dozens of times per second. The more often that loop runs under
                  realistic conditions, the faster and more accurate each correction becomes — which is exactly
                  why short, frequent, focused sessions consistently outperform occasional marathon ones for
                  building this specific skill.
                </p>
                <p style={{ margin: 0 }}>
                  Psychologist Anders Ericsson&apos;s research on{' '}
                  <SourceLink href="https://en.wikipedia.org/wiki/Practice_(learning_method)#Deliberate_practice">deliberate practice</SourceLink>{' '}
                  adds an important refinement to that picture: raw repetition isn&apos;t enough on its own. Practice
                  only compounds into real improvement when it includes a clear target to hit, immediate
                  feedback on whether you hit it, and enough difficulty to sit right at the edge of your current
                  ability. This trainer is built around exactly that loop — a visible score, an accuracy
                  percentage updated in real time, and four difficulty tiers so you can always be practicing
                  at a level that stretches you without being so far beyond your current skill that every
                  attempt ends in a miss.
                </p>
              </div>

              <InfoBox
                accent="var(--neon-cyan)" bg="rgba(52, 211, 153, 0.05)"
                icon="🧠" title="Why Repetition Beats Raw Talent"
                borderStyle="full"
              >
                Fine motor skills like tracking aim live largely in <SourceLink href="https://en.wikipedia.org/wiki/Procedural_memory">procedural memory</SourceLink> —
                the same system that stores how to ride a bicycle or type without looking at the keyboard.
                Procedural memory is built almost exclusively through repetition under feedback, not through reading, watching, or
                thinking about the skill. This is good news for anyone who feels &quot;naturally&quot; behind
                more mechanically gifted players: consistent short sessions on a tracking trainer reliably
                narrow that gap over a few weeks, because the underlying skill is trained, not fixed.
              </InfoBox>
            </section>

            <section aria-labelledby="mistakes-heading" style={{ marginTop: '3rem' }}>
              <h2
                id="mistakes-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                Common Aim Training Mistakes That Quietly Sabotage Progress
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <FaqItem question="1. Training at a sensitivity that doesn't match your main game">
                  It&apos;s tempting to lower your sensitivity for aim training because slower, more careful
                  movements feel easier to control. The problem is that the muscle memory you build only
                  transfers back to your actual games if the underlying arm-to-cursor mapping stays the same.
                  Always train at the exact sensitivity, DPI, and (where relevant) polling rate you use when
                  you queue up — otherwise you&apos;re quietly building two separate, non-transferable skills.
                </FaqItem>

                <FaqItem question="2. Grinding long sessions instead of short, focused ones">
                  Tracking accuracy is a fine motor skill, and <SourceLink href="https://en.wikipedia.org/wiki/Muscle_fatigue">fine motor skills degrade under fatigue</SourceLink> faster
                  than most players notice. A 45-minute uninterrupted session often produces worse practice
                  data than three separate 10-minute sessions spread across the day, because the last third of
                  a long grind is frequently spent reinforcing tired, sloppy habits rather than clean ones.
                  Watch your accuracy stat — if it's trending downward within a session, that's the signal to
                  stop, not to push through.
                </FaqItem>

                <FaqItem question="3. Jumping straight to the hardest difficulty">
                  Impossible difficulty's tiny, erratic target is satisfying to attempt but teaches the wrong
                  lessons if your fundamentals aren't solid yet. Players who train exclusively on Hard or
                  Impossible before their tracking is consistent on Easy or Medium tend to develop jerky,
                  overcorrecting movement patterns, because the target is moving faster than their current
                  skill can smoothly follow. Difficulty should scale with your accuracy, not your ego.
                </FaqItem>

                <FaqItem question="4. Skipping a warm-up before ranked or competitive play">
                  Cold, un-warmed-up tracking is measurably less accurate for the first several minutes of any
                  session, in the same way a cold muscle underperforms before stretching. Queueing directly
                  into a ranked match without five to ten minutes on a trainer like this one means your first
                  few engagements are effectively still part of your warm-up — except now they count.
                </FaqItem>

                <FaqItem question="5. Comparing your score to strangers instead of your own history">
                  Public leaderboards and clip culture make it easy to fixate on how your score stacks up
                  against other players, but difficulty settings, monitor refresh rates, and even mouse
                  hardware all shift raw scores in ways that make cross-player comparison mostly meaningless.
                  The number that actually matters is whether this week's average score and accuracy beat last
                  week's, on the same difficulty and duration settings.
                </FaqItem>

                <FaqItem question="6. Training with poor posture or an unstable mouse surface">
                  A cursor that jitters because your desk wobbles, your mousepad slides, or your wrist is
                  bent at an awkward angle introduces noise that no amount of practice can train around. Before
                  blaming your aim, check that your chair height, desk stability, and mousepad are actually
                  letting your arm move the way you intend it to — many &quot;aim problems&quot; are really
                  equipment or ergonomics problems in disguise.
                </FaqItem>
              </div>
            </section>

            <section aria-labelledby="routine-heading" style={{ marginTop: '3rem' }}>
              <h2
                id="routine-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                Building a Sustainable Weekly Aim Training Routine
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <p style={{ margin: 0 }}>
                  A routine beats a single heroic session every time. Below is a simple structure that fits
                  around most schedules and scales naturally as your accuracy improves — treat it as a
                  starting template rather than a strict rulebook.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Warm-up (2–3 minutes):</strong> Start every session on Easy or Medium difficulty with
                  a short duration preset, regardless of how advanced you are. The goal isn&apos;t score, it&apos;s
                  waking up the tracking loop between your eyes and your hand before you ask it to do anything
                  demanding.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Core session (10–15 minutes):</strong> Move to whichever difficulty currently sits at
                  the edge of your comfort zone — the one where your accuracy hovers around 70–85%. Run several
                  rounds back to back on the same duration setting so your scores are directly comparable, and
                  jot down (mentally or otherwise) your best score and accuracy for the day.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Stress test (3–5 minutes, optional):</strong> Finish with one or two rounds a
                  difficulty tier above your core session, or switch to Unlimited mode and see how long you can
                  sustain your accuracy before it drops. This is where the progressive speed ramp becomes
                  useful — it's specifically designed to find the point where your tracking starts to break
                  down, which tells you exactly what to target in tomorrow's session.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Frequency:</strong> Three to five sessions per week produces steadier long-term gains
                  than daily marathon grinding, largely because <SourceLink href="https://en.wikipedia.org/wiki/Memory_consolidation">motor memory consolidates</SourceLink> during
                  rest, not just during practice. If you only have time for one thing before a ranked queue,
                  the warm-up step alone still meaningfully reduces your early-game miss rate.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Tracking progress:</strong> Because this trainer saves your best score, best streak,
                  best combo, and lifetime average accuracy locally after every match, you don&apos;t need a
                  separate spreadsheet to see whether the routine is working — just glance at the all-time
                  records panel every few sessions and look for the trend, not any single result.
                </p>
              </div>
            </section>

            <section aria-labelledby="gear-heading" style={{ marginTop: '3rem' }}>
              <h2
                id="gear-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                Gear and Setup: Getting the Most Out of Your Tracking Practice
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <p style={{ margin: 0 }}>
                  Technique and repetition do most of the heavy lifting in aim training, but hardware still sets
                  the ceiling on how cleanly your intended movements translate into what actually happens on
                  screen. A player with excellent tracking fundamentals can still look inconsistent on a mouse
                  with an unreliable sensor, a pad that drags unevenly, or a desk that isn&apos;t stable enough
                  to support fast lateral sweeps. None of this means you need premium equipment to improve —
                  it means it&apos;s worth ruling out hardware as the source of a plateau before assuming the
                  problem is purely mechanical skill.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Mouse Sensors: What Actually Matters
                </h3>
                <p style={{ margin: 0 }}>
                  Modern optical sensors from the major manufacturers are, for practical purposes, all accurate
                  enough for tracking-style aim training — sensor-level accuracy stopped being the bottleneck
                  for the vast majority of players years ago. What still varies meaningfully between mice is{' '}
                  <SourceLink href="https://en.wikipedia.org/wiki/Computer_mouse#Polling_rate">polling rate</SourceLink>,
                  click latency, and physical shape. A 1000Hz polling rate reports your position to the computer
                  every millisecond instead of every 8ms at the older 125Hz standard, which measurably smooths
                  out fast tracking sweeps even though it rarely changes raw click-timing tests like a CPS or
                  reaction benchmark. If your mouse supports multiple polling rates, 1000Hz is the safe default
                  for tracking-heavy training.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  DPI, In-Game Sensitivity, and Why the Split Matters
                </h3>
                <p style={{ margin: 0 }}>
                  DPI (dots per inch) and in-game sensitivity multiply together to produce your effective
                  sensitivity, or eDPI — and confusing the two is one of the most common setup mistakes among
                  players who are otherwise training correctly. Running very high DPI with very low in-game
                  sensitivity can introduce a small amount of positional error on cheaper sensors, while running
                  very low DPI with very high in-game sensitivity can make fine tracking corrections feel coarse
                  and imprecise. A practical middle ground most competitive players land on is 400–1600 DPI at
                  the sensor level, with in-game sensitivity adjusted from there to hit your preferred eDPI.
                  Whatever combination you land on, the important part for aim training specifically is
                  consistency: change your DPI or sensitivity as rarely as possible once you start tracking
                  your scores over time, since a sensitivity change resets your muscle memory almost as
                  thoroughly as switching to a new mouse entirely.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Mousepad Size, Material, and Glide
                </h3>
                <p style={{ margin: 0 }}>
                  Tracking a fast, erratic target on Hard or Impossible difficulty often calls for larger,
                  sweeping arm movements rather than small wrist flicks, which is precisely where mousepad size
                  starts to matter. A pad too small to accommodate your full sensitivity range forces awkward
                  mid-movement lifts and re-positions, both of which interrupt the smooth closed-loop tracking
                  motion this trainer is built to develop. Extended (XXL) cloth pads are the most common choice
                  among players who train tracking specifically, since they combine a large surface area with
                  predictable, consistent glide. Hard pads offer faster, lower-friction glide but can feel
                  twitchy for slow, controlled tracking corrections — a worthwhile trade-off to test for
                  yourself rather than assume based on price or popularity.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Grip Style and How It Changes Tracking Feel
                </h3>
                <p style={{ margin: 0 }}>
                  The three common mouse grips — palm, claw, and fingertip — each distribute control across
                  different muscle groups, and each has a slightly different relationship with tracking-style
                  aim. Palm grip, where the whole hand rests on the mouse, tends to favor larger, arm-driven
                  sweeps and is common among players who prioritize smooth tracking over rapid micro-flicks.
                  Fingertip grip, where only the fingertips contact the mouse, allows for very fast small
                  adjustments but can fatigue faster during long tracking-heavy sessions since more of the
                  motion comes from smaller muscles. Claw grip sits between the two. None of the three is
                  objectively correct for tracking specifically — what matters far more is picking one grip and
                  staying consistent with it long enough for your nervous system to build reliable muscle
                  memory around it, rather than switching grips every few sessions while trying to chase a
                  slightly higher score.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Desk and Chair Stability
                </h3>
                <p style={{ margin: 0 }}>
                  It is easy to overlook furniture as a variable in aim training, but a desk that flexes under
                  fast arm movement or a chair that lets your torso drift mid-sweep both introduce noise your
                  hand then has to unconsciously compensate for. Before investing in new peripherals to solve a
                  tracking plateau, it is worth the five minutes it takes to check that your desk doesn&apos;t
                  wobble under a firm push, that your chair height lets your forearm rest roughly parallel to
                  the desk surface, and that your mousepad itself isn&apos;t sliding during aggressive sweeps.
                  Many players who feel like their aim has hit a wall are, in reality, fighting an unstable
                  physical setup rather than a skill ceiling.
                </p>

                <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Reading Your Own Data Instead of Chasing a Single Score
                </h3>
                <p style={{ margin: 0 }}>
                  This trainer already logs the numbers that matter most — score, accuracy, combo, and
                  streak — but the real value comes from reading them as a trend rather than a single result.
                  A single unusually high score, achieved once on a lucky run, tells you far less than a
                  gradually rising accuracy percentage across ten sessions on the same difficulty and duration
                  settings. If your accuracy is climbing but your score isn&apos;t, that usually means your
                  combo consistency is improving faster than your raw hit rate — a genuinely good sign, since
                  combo-driven score growth reflects the kind of sustained precision that transfers most
                  directly to real matches. Conversely, if your raw score keeps climbing purely because you are
                  playing longer, more forgiving durations, it is worth deliberately testing yourself on a
                  shorter, higher-pressure duration occasionally to make sure your fundamentals are actually
                  improving and not just your endurance.
                </p>

                <p style={{ margin: 0 }}>
                  None of this hardware or setup advice is a substitute for repetition — it simply removes the
                  friction that can quietly cap how much a given amount of practice actually improves your
                  aim. Get the fundamentals of your setup right once, then let consistent, structured sessions
                  on this trainer do the rest of the work.
                </p>
              </div>

              <InfoBox
                accent="var(--neon-green)" bg="rgba(34, 197, 94, 0.05)"
                icon="⚙️" title="Quick Setup Checklist Before Your Next Session"
                borderStyle="full"
              >
                Confirm your polling rate is set to 1000Hz if supported, verify your DPI and in-game
                sensitivity haven&apos;t drifted since your last session, check that your mousepad has enough
                room for a full sweep at your current sensitivity, and make sure your desk and chair are
                stable under a firm push. Five minutes of setup verification can save weeks of confusing,
                inconsistent practice data.
              </InfoBox>
            </section>

            <section aria-labelledby="faq-heading" style={{ marginTop: '3rem' }}>
              <h2
                id="faq-heading"
                style={{
                  fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem',
                  color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
                }}
              >
                Frequently Asked Questions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AccordionItem id="faq-free" question="Is this sniper aim trainer free to use?"
                  isOpen={openFaqId === 'faq-free'} onToggle={() => toggleFaq('faq-free')}>
                  Yes. This is a completely free, browser-based <strong>online aim trainer</strong>. No
                  downloads, accounts, or subscriptions are required. Open the page and start training
                  immediately on any device with a mouse or touchscreen.
                </AccordionItem>

                <AccordionItem id="faq-difficulty" question="What do the difficulty modes change?"
                  isOpen={openFaqId === 'faq-difficulty'} onToggle={() => toggleFaq('faq-difficulty')}>
                  Each difficulty adjusts four variables simultaneously: target radius, movement speed,
                  movement unpredictability, and score multiplier. Easy gives you a large, slow target at ×1
                  score. Impossible gives you a tiny, erratic, fast target at ×3 score — designed to push
                  elite players to their absolute limit.
                </AccordionItem>

                <AccordionItem id="faq-duration" question="What duration options are available?"
                  isOpen={openFaqId === 'faq-duration'} onToggle={() => toggleFaq('faq-duration')}>
                  You can play 1, 2, 5, 10, or 30-second sprints, enter a custom length up to 10 minutes, or
                  select Unlimited to play with no timer at all. In Unlimited mode, time counts up instead of
                  down and the match ends only when you press Finish — your score is saved to your all-time
                  records exactly like a timed match.
                </AccordionItem>

                <AccordionItem id="faq-combo" question="How does the combo system work?"
                  isOpen={openFaqId === 'faq-combo'} onToggle={() => toggleFaq('faq-combo')}>
                  Landing 5 consecutive hits without missing activates a ×2 combo multiplier. 10 hits unlocks
                  ×3. 20 hits unlocks ×5. A miss resets your combo to zero. Combine Impossible difficulty
                  with a long combo for maximum score output.
                </AccordionItem>

                <AccordionItem id="faq-crit" question="What is a critical hit?"
                  isOpen={openFaqId === 'faq-crit'} onToggle={() => toggleFaq('faq-crit')}>
                  Clicking within the central 38% of the target&apos;s radius registers as a Critical Hit,
                  worth 150 base points instead of 100 — before combo and difficulty multipliers are applied.
                  Aim precisely for the centre of the dot to maximise your score.
                </AccordionItem>

                <AccordionItem id="faq-daily" question="How long should I train each day?"
                  isOpen={openFaqId === 'faq-daily'} onToggle={() => toggleFaq('faq-daily')}>
                  Focused sessions of 15–30 minutes produce better results than long, fatigued marathons. Aim
                  for three to five short sessions per week, track your accuracy score each time, and look for
                  a consistent upward trend over two to four weeks.
                </AccordionItem>

                <AccordionItem id="faq-transfer" question="Does aim training transfer to real games?"
                  isOpen={openFaqId === 'faq-transfer'} onToggle={() => toggleFaq('faq-transfer')}>
                  Studies on <SourceLink href="https://en.wikipedia.org/wiki/Perceptual-motor_learning">perceptual-motor learning</SourceLink> confirm that deliberate, repetitive practice on isolated
                  skills — like cursor tracking — transfers to related real-world tasks. The bouncing movement
                  in this trainer closely approximates enemy strafing patterns in FPS titles, making it a
                  high-fidelity training stimulus. Pair it with in-game practice for the fastest improvement.
                </AccordionItem>

                <AccordionItem id="faq-mobile" question="Can I use this aim trainer on my phone or tablet?"
                  isOpen={openFaqId === 'faq-mobile'} onToggle={() => toggleFaq('faq-mobile')}>
                  Yes. The arena responds to touch as well as mouse input — tap the target for a hit and tap
                  anywhere else on the arena for a miss. Touch scrolling is disabled inside the play area so
                  your finger won&apos;t accidentally scroll the page mid-session.
                </AccordionItem>

                <AccordionItem id="faq-browser" question="Which browsers and devices are supported?"
                  isOpen={openFaqId === 'faq-browser'} onToggle={() => toggleFaq('faq-browser')}>
                  Any modern browser with JavaScript enabled works — Chrome, Firefox, Edge, and Safari on both
                  desktop and mobile. Sound uses the standard Web Audio API, so no plugins or extensions are
                  required. Older browsers without Web Audio support will still let you play; they&apos;ll
                  simply run silently.
                </AccordionItem>

                <AccordionItem id="faq-keyboard" question="Are there any keyboard shortcuts?"
                  isOpen={openFaqId === 'faq-keyboard'} onToggle={() => toggleFaq('faq-keyboard')}>
                  Press <kbd style={kbdStyle}>ESC</kbd> at any point during a match to pause, and press it
                  again to resume. There is currently no keyboard-only way to start a match or hit the
                  target, since the trainer is built specifically around mouse and touch precision.
                </AccordionItem>

                <AccordionItem id="faq-scoring" question="How exactly is my score calculated?"
                  isOpen={openFaqId === 'faq-scoring'} onToggle={() => toggleFaq('faq-scoring')}>
                  Each hit starts at a base value — 100 points for a normal hit, 150 for a critical hit — then
                  gets multiplied by your current combo multiplier (×1 to ×5) and by the selected difficulty&apos;s
                  score multiplier (×1 on Easy up to ×3 on Impossible). The result is rounded to the nearest
                  whole point and added to your total; misses never subtract points.
                </AccordionItem>

                <AccordionItem id="faq-which-difficulty" question="Which difficulty should I start with?"
                  isOpen={openFaqId === 'faq-which-difficulty'} onToggle={() => toggleFaq('faq-which-difficulty')}>
                  Start on Easy or Medium until your accuracy consistently sits above 85–90%, then move up.
                  Jumping straight to Hard or Impossible before your tracking is solid tends to build sloppy
                  habits — like overshooting or slapping the mouse — rather than clean, controlled aim.
                </AccordionItem>

                <AccordionItem id="faq-sensitivity" question="What mouse sensitivity should I use for training?"
                  isOpen={openFaqId === 'faq-sensitivity'} onToggle={() => toggleFaq('faq-sensitivity')}>
                  Use whatever sensitivity you play your main game at. Aim training only builds useful muscle
                  memory when it mirrors your real setup — practicing at a different sensitivity than the one
                  you queue up with largely wastes the repetition.
                </AccordionItem>

                <AccordionItem id="faq-refresh-rate" question="Does my monitor's refresh rate affect training quality?"
                  isOpen={openFaqId === 'faq-refresh-rate'} onToggle={() => toggleFaq('faq-refresh-rate')}>
                  Yes. A higher <SourceLink href="https://en.wikipedia.org/wiki/Refresh_rate">refresh rate</SourceLink> (120Hz, 144Hz, 240Hz) shows more intermediate frames of the
                  target&apos;s movement, which makes tracking feel smoother and lets you react a few
                  milliseconds sooner. A 60Hz display still works fine for building fundamentals, just with
                  slightly choppier visual feedback.
                </AccordionItem>

                <AccordionItem id="faq-warmup" question="Should I use this as a warm-up before ranked matches?"
                  isOpen={openFaqId === 'faq-warmup'} onToggle={() => toggleFaq('faq-warmup')}>
                  A short 5–10 minute session on Medium or Hard difficulty is a solid pre-game warm-up — long
                  enough to activate tracking muscle memory without causing fatigue. Save Impossible-difficulty
                  grinding for dedicated practice sessions rather than right before you queue.
                </AccordionItem>

                <AccordionItem id="faq-streak-vs-combo" question="What's the difference between streak and combo?"
                  isOpen={openFaqId === 'faq-streak-vs-combo'} onToggle={() => toggleFaq('faq-streak-vs-combo')}>
                  They track the same underlying run of consecutive hits, but combo drives your score
                  multiplier and resets to zero on a miss, while streak is simply a running counter of hits in
                  a row for your own reference — both reset together when you miss.
                </AccordionItem>

                <AccordionItem id="faq-data-privacy" question="Is my score data private, and where is it stored?"
                  isOpen={openFaqId === 'faq-data-privacy'} onToggle={() => toggleFaq('faq-data-privacy')}>
                  All records — best score, best streak, best combo, and games played — are saved locally in
                  your browser&apos;s storage. Nothing is sent to a server, no account is required, and no one
                  else can see your stats. Clearing your browser data will also clear your saved records.
                </AccordionItem>

                <AccordionItem id="faq-reset-records" question="How do I reset my all-time records?"
                  isOpen={openFaqId === 'faq-reset-records'} onToggle={() => toggleFaq('faq-reset-records')}>
                  Since records are stored in your browser, clearing this site&apos;s local storage (through
                  your browser&apos;s privacy or site-data settings) wipes them back to zero. There is no
                  in-game reset button, since records are meant to represent your genuine lifetime best.
                </AccordionItem>

                <AccordionItem id="faq-audio" question="Why can't I hear any sound when I start playing?"
                  isOpen={openFaqId === 'faq-audio'} onToggle={() => toggleFaq('faq-audio')}>
                  Browsers block audio from starting automatically until you interact with the page. The very
                  first click or tap you make (such as pressing Start) unlocks sound for the rest of the
                  session. Also double-check the speaker icon in the controls row hasn&apos;t been muted.
                </AccordionItem>

                <AccordionItem id="faq-progressive-speed" question="Why does the target get faster the longer I play?"
                  isOpen={openFaqId === 'faq-progressive-speed'} onToggle={() => toggleFaq('faq-progressive-speed')}>
                  Every difficulty includes a progressive speed ramp: the target gradually accelerates the
                  longer a single match runs, up to a capped maximum multiplier. This rewards players who can
                  sustain tracking accuracy under mounting pressure, rather than just reacting well early on.
                </AccordionItem>

                <AccordionItem id="faq-impossible-tips" question="Any tips specifically for Impossible difficulty?"
                  isOpen={openFaqId === 'faq-impossible-tips'} onToggle={() => toggleFaq('faq-impossible-tips')}>
                  The target occasionally makes small random direction nudges on Impossible, so avoid
                  predicting its path too far ahead — stay reactive instead. Because the hitbox is tiny,
                  prioritise steady, controlled cursor movement over fast, jerky corrections.
                </AccordionItem>

                <AccordionItem id="faq-repeat-sessions" question="How many rounds should I play per session?"
                  isOpen={openFaqId === 'faq-repeat-sessions'} onToggle={() => toggleFaq('faq-repeat-sessions')}>
                  Five to ten short rounds with brief breaks between them tends to beat one long unbroken
                  grind — fatigue quietly erodes precision even when it doesn&apos;t feel like it. Watch your
                  accuracy stat: if it starts trending down round over round, that&apos;s your cue to stop.
                </AccordionItem>

                <AccordionItem id="faq-baseline-accuracy" question="What's a good baseline accuracy for a beginner?"
                  isOpen={openFaqId === 'faq-baseline-accuracy'} onToggle={() => toggleFaq('faq-baseline-accuracy')}>
                  Most new players land somewhere between 40% and 60% accuracy on Medium difficulty in their
                  first few sessions, which is completely normal. Treat 75–85% on Medium as a reasonable
                  milestone before moving up to Hard, rather than comparing yourself to advanced players who
                  may have months of dedicated practice behind their numbers.
                </AccordionItem>

                <AccordionItem id="faq-wrist-strain" question="Can aim training cause wrist strain, and how do I avoid it?"
                  isOpen={openFaqId === 'faq-wrist-strain'} onToggle={() => toggleFaq('faq-wrist-strain')}>
                  Like any repetitive fine-motor activity, extended aim training can aggravate <SourceLink href="https://www.ncbi.nlm.nih.gov/books/NBK441882/">repetitive strain
                  conditions</SourceLink> in the wrist or forearm if your grip is tense or your wrist is bent at an angle
                  for long periods. Keep sessions short, take breaks between rounds, favour arm and elbow
                  movement over wrist-only flicking, and stop immediately if you feel any tingling, numbness,
                  or sharp discomfort.
                </AccordionItem>

                <AccordionItem id="faq-controller-vs-mouse" question="Does this trainer work for controller aim as well as mouse?"
                  isOpen={openFaqId === 'faq-controller-vs-mouse'} onToggle={() => toggleFaq('faq-controller-vs-mouse')}>
                  The arena responds to any pointer input your browser recognises, including a controller
                  configured to move an on-screen cursor, though it was primarily designed and tuned around
                  mouse and touch input. Console players using stick-to-cursor accessibility tools can still
                  use it for general tracking practice, but expect the feel to differ from in-game aiming.
                </AccordionItem>

                <AccordionItem id="faq-vs-paid-software" question="How does this compare to paid aim trainer software?"
                  isOpen={openFaqId === 'faq-vs-paid-software'} onToggle={() => toggleFaq('faq-vs-paid-software')}>
                  Dedicated desktop aim trainers often add extras like 3D environments, weapon-specific
                  recoil simulation, and detailed analytics dashboards. This browser-based trainer focuses
                  specifically on 2D tracking — the core skill of following a moving target — with zero
                  installs, zero cost, and instant access from any device, making it a solid daily-driver for
                  the tracking fundamental even if you also use heavier software for weapon-specific practice.
                </AccordionItem>
              </div>
            </section>

          </div>
        </article>
      </main>
    </>
  );
}

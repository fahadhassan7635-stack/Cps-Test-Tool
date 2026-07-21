import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

// ─── More Tools ───────────────────────────────────────────────────────────────
interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: '3D Aim Trainer', href: '/3d-aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
];
import {
  Rocket, Play, RefreshCcw, Activity, Zap, Shield, Timer, TrendingUp,
  Home, Volume2, VolumeX, Gauge, Pause, Play as PlayIcon,
  Maximize, Minimize, Trophy, Cpu, BarChart2, ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Point { x: number; y: number; }
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  color: string;
  size: number;
}
interface ObstaclePoint { x: number; y: number; }
interface Obstacle {
  x: number; y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'comet' | 'boss';
  points: ObstaclePoint[];
  hasNearMissed: boolean;
  isBoss: boolean;
  glowPhase: number;
}
interface PowerUp {
  x: number; y: number;
  type: 'shield' | 'slowmo' | 'doubleboost' | 'multiplier' | 'invincibility';
  radius: number;
  speed: number;
  collected: boolean;
  glowPhase: number;
}
interface FloatingText {
  x: number; y: number;
  text: string;
  life: number;
  color: string;
  vy: number;
  size: number;
}
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}
interface HighScores {
  bestDistance: number;
  bestTime: number;
  highestCps: number;
  mostAvoided: number;
}
interface LifetimeStats {
  gamesPlayed: number;
  totalDistance: number;
  totalTime: number;
  totalAvoided: number;
  highestCps: number;
  highestDistance: number;
  averageCpsSum: number;
  averageCpsCount: number;
}
type GameStatus = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';
type Difficulty = 'easy' | 'normal' | 'hard';
type UiView = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';

const GA = {
  event: (name: string, params?: Record<string, unknown>) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', name, params ?? {});
      }
    } catch { /* silent */ }
  },
  gameStart:         (d: string)                            => GA.event('game_start',         { difficulty: d }),
  gameOver:          (dist: number, t: number, cps: number) => GA.event('game_over',          { distance: dist, survival_time: t, peak_cps: cps }),
  retry:             ()                                     => GA.event('retry'),
  pause:             ()                                     => GA.event('pause'),
  resume:            ()                                     => GA.event('resume'),
  achievementUnlock: (id: string)                           => GA.event('achievement_unlock', { achievement_id: id }),
  powerUpCollected:  (type: string)                         => GA.event('power_up_collected', { type }),
  bossSpawn:         ()                                     => GA.event('boss_spawn'),
  peakCps:           (cps: number)                          => GA.event('peak_cps',           { value: cps }),
};

class AudioManager {
  private ctx: AudioContext | null = null;
  muted = false;

  init() {
    if (this.ctx || this.muted || typeof window === 'undefined') return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch { /* Web Audio not available */ }
  }

  private safe(fn: (ctx: AudioContext) => void) {
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => { try { fn(ctx); } catch { /* ignore */ } }).catch(() => {});
      return;
    }
    try { fn(ctx); } catch { /* ignore */ }
  }

  playBoost() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    });
  }

  playCollision() {
    this.init();
    this.safe(ctx => {
      const bufSize = Math.floor(ctx.sampleRate * 0.5);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      src.start();
    });
  }

  playGameOver() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 1.2);
    });
  }

  playNearMiss() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    });
  }

  playPowerUp() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    });
  }

  playBossSpawn() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    });
  }

  playAchievement() {
    this.init();
    this.safe(ctx => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.2);
      });
    });
  }

  playCountdown() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    });
  }

  playGo() {
    this.init();
    this.safe(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    });
  }
}

const audio = new AudioManager();

// ── CONSTANTS ────────────────────────────────────────────────
const GRAVITY             = 0.35;
const BOOST_STRENGTH      = -0.75;
const MAX_VELOCITY        = 7;
const INITIAL_SPEED       = 5;
const SPEED_INCREMENT     = 0.4;
const VOYAGER_X           = 120;
const CANVAS_W            = 900;
const CANVAS_H            = 500;
const MAX_PARTICLES       = 150;
const MAX_FLOAT_TEXTS     = 20;
const BOSS_INTERVAL_MS    = 90_000;
const POWERUP_INTERVAL_MS = 18_000;
const SPEED_RAMP_MS       = 15_000;

const DIFFICULTY_CONFIG = {
  easy:   { speedMult: 0.7,  spawnMult: 1.6, gravityMult: 0.8  },
  normal: { speedMult: 1.0,  spawnMult: 1.0, gravityMult: 1.0  },
  hard:   { speedMult: 1.35, spawnMult: 0.6, gravityMult: 1.15 },
} as const;

const POWERUP_COLORS: Record<string, string> = {
  shield:        '#22c55e',
  slowmo:        '#3b82f6',
  doubleboost:   '#f59e0b',
  multiplier:    '#a855f7',
  invincibility: '#ec4899',
};
const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡️', slowmo: '⏱️', doubleboost: '⚡', multiplier: '✖️', invincibility: '💫',
};
const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e', normal: '#eab308', hard: '#ef4444',
};
const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_flight',  title: 'First Flight',   description: 'Complete your first mission',    icon: '🚀' },
  { id: 'dist_500',      title: 'Explorer',        description: 'Travel 500 distance',            icon: '🌠' },
  { id: 'dist_1000',     title: 'Deep Space',      description: 'Travel 1,000 distance',          icon: '🌌' },
  { id: 'dist_5000',     title: 'Voyager Elite',   description: 'Travel 5,000 distance',          icon: '🏆' },
  { id: 'cps_10',        title: 'Speed Fingers',   description: 'Reach 10 CPS',                   icon: '⚡' },
  { id: 'cps_15',        title: 'Lightning Hands', description: 'Reach 15 CPS',                   icon: '🌩️' },
  { id: 'avoid_20',      title: 'Dodger',          description: 'Avoid 20 obstacles in one run',  icon: '🎯' },
  { id: 'avoid_50',      title: 'Matrix',          description: 'Avoid 50 obstacles in one run',  icon: '🕶️' },
  { id: 'survivor_60',   title: 'Survivor',        description: 'Survive for 60 seconds',         icon: '⏱️' },
  { id: 'space_master',  title: 'Space Master',    description: 'Survive for 120 seconds',        icon: '👑' },
  { id: 'near_miss_5',   title: 'Daredevil',       description: 'Get 5 near misses in one run',   icon: '😎' },
  { id: 'boss_survived', title: 'Boss Slayer',     description: 'Survive a boss asteroid',        icon: '💀' },
];

const LS = {
  get: <T,>(key: string, fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? (JSON.parse(v) as T) : fallback;
    } catch { return fallback; }
  },
  set: <T,>(key: string, val: T): void => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
  },
};

const updateHUD = (id: string, value: string | number) => {
  const el = document.getElementById(id) as HTMLElement | null;
  if (el) el.innerText = String(value);
};

interface GameState {
  status: GameStatus;
  y: number; vel: number; speed: number; isBoosting: boolean;
  distance: number; avoided: number; time: number;
  cps: number; peakCps: number;
  startTime: number;
  lastSpawn: number; lastSpeedUp: number;
  lastPowerUpSpawn: number; lastBossSpawn: number;
  lastAchievementCheck: number;
  pausedAt: number;
  clickTimes: number[];
  obstacles: Obstacle[]; powerUps: PowerUp[];
  particles: Particle[]; floatingTexts: FloatingText[];
  stars: { x: number; y: number; z: number; size: number }[];
  screenShake: number;
  difficulty: Difficulty;
  combo: number; nearMissCount: number; scoreMultiplier: number;
  hasShield: boolean;        shieldEnd: number;
  hasSlowmo: boolean;        slowmoEnd: number;
  hasDoubleBoost: boolean;   doubleBoostEnd: number;
  hasMultiplier: boolean;    multiplierEnd: number; multiplierBonus: number;
  hasInvincibility: boolean; invincibilityEnd: number;
  bossSpawned: boolean; bossCleared: boolean;
  fps: number; fpsFrameCount: number; fpsLastTime: number;
}

const makeInitialState = (): GameState => ({
  status: 'start',
  y: CANVAS_H / 2, vel: 0, speed: INITIAL_SPEED, isBoosting: false,
  distance: 0, avoided: 0, time: 0, cps: 0, peakCps: 0,
  startTime: 0,
  lastSpawn: 0, lastSpeedUp: 0,
  lastPowerUpSpawn: 0, lastBossSpawn: 0,
  lastAchievementCheck: 0,
  pausedAt: 0,
  clickTimes: [],
  obstacles: [], powerUps: [], particles: [], floatingTexts: [],
  stars: [],
  screenShake: 0,
  difficulty: 'normal',
  combo: 0, nearMissCount: 0, scoreMultiplier: 1,
  hasShield: false,        shieldEnd: 0,
  hasSlowmo: false,        slowmoEnd: 0,
  hasDoubleBoost: false,   doubleBoostEnd: 0,
  hasMultiplier: false,    multiplierEnd: 0, multiplierBonus: 1,
  hasInvincibility: false, invincibilityEnd: 0,
  bossSpawned: false,      bossCleared: false,
  fps: 0, fpsFrameCount: 0, fpsLastTime: 0,
});

// ── COMPONENT ────────────────────────────────────────────────
export default function VoyagerGame() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gs           = useRef<GameState>(makeInitialState());

  const rafIdRef        = useRef<number>(0);
  const countdownTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loopRunning     = useRef(false);

  // Scale factor ref: tracks current dpr scale so game logic coords stay at CANVAS_W × CANVAS_H
  const scaleRef = useRef({ x: 1, y: 1 });

  const [uiView, setUiView]             = useState<UiView>('start');
  const [difficulty, setDifficulty]     = useState<Difficulty>('normal');
  const [isMuted, setIsMuted]           = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFps, setShowFps]           = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | 'GO!' | null>(null);
  const [combo, setCombo]               = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [activePowerUps, setActivePowerUps]   = useState<
    { type: string; remaining: number; total: number }[]
  >([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [highScores, setHighScores]     = useState<HighScores>(() =>
    LS.get('voyager_highscores', { bestDistance: 0, bestTime: 0, highestCps: 0, mostAvoided: 0 })
  );
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(() =>
    LS.get('voyager_lifetime', {
      gamesPlayed: 0, totalDistance: 0, totalTime: 0, totalAvoided: 0,
      highestCps: 0, highestDistance: 0, averageCpsSum: 0, averageCpsCount: 0,
    })
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = LS.get<Record<string, boolean>>('voyager_achievements', {});
    return ACHIEVEMENT_DEFS.map(d => ({ ...d, unlocked: !!saved[d.id] }));
  });
  const [showStats, setShowStats]               = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const difficultyRef = useRef(difficulty);
  const highScoresRef = useRef(highScores);
  const showFpsRef    = useRef(showFps);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { highScoresRef.current = highScores; }, [highScores]);
  useEffect(() => { showFpsRef.current    = showFps;    }, [showFps]);

  // ── Fullscreen ──────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else                             await document.exitFullscreen();
    } catch { /* denied */ }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Sound ───────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    const next = !audio.muted;
    audio.muted = next;
    setIsMuted(next);
    if (!next) audio.init();
  }, []);

  // ── Achievement check ───────────────────────────────────
  const checkAchievements = useCallback((state: GameState) => {
    setAchievements(prev => {
      const unlocked: Achievement[] = [];
      const next = prev.map(a => {
        if (a.unlocked) return a;
        let should = false;
        switch (a.id) {
          case 'first_flight':  should = true;                         break;
          case 'dist_500':      should = state.distance   >= 500;      break;
          case 'dist_1000':     should = state.distance   >= 1000;     break;
          case 'dist_5000':     should = state.distance   >= 5000;     break;
          case 'cps_10':        should = state.peakCps    >= 10;       break;
          case 'cps_15':        should = state.peakCps    >= 15;       break;
          case 'avoid_20':      should = state.avoided    >= 20;       break;
          case 'avoid_50':      should = state.avoided    >= 50;       break;
          case 'survivor_60':   should = state.time       >= 60;       break;
          case 'space_master':  should = state.time       >= 120;      break;
          case 'near_miss_5':   should = state.nearMissCount >= 5;     break;
          case 'boss_survived': should = state.bossCleared;            break;
        }
        if (!should) return a;
        const updated: Achievement = { ...a, unlocked: true, unlockedAt: Date.now() };
        unlocked.push(updated);
        return updated;
      });
      if (unlocked.length > 0) {
        audio.playAchievement();
        unlocked.forEach(a => GA.achievementUnlock(a.id));
        const map: Record<string, boolean> = {};
        next.forEach(a => { if (a.unlocked) map[a.id] = true; });
        LS.set('voyager_achievements', map);
        setNewAchievements(u => [...u, ...unlocked]);
        setTimeout(() => setNewAchievements(u => u.slice(unlocked.length)), 4000);
      }
      return next;
    });
  }, []);

  const updateHighScores = useCallback((state: GameState) => {
    setHighScores(prev => {
      const next: HighScores = {
        bestDistance: Math.max(prev.bestDistance, Math.floor(state.distance)),
        bestTime:     Math.max(prev.bestTime,     state.time),
        highestCps:   Math.max(prev.highestCps,   state.peakCps),
        mostAvoided:  Math.max(prev.mostAvoided,  state.avoided),
      };
      LS.set('voyager_highscores', next);
      return next;
    });
  }, []);

  const updateLifetimeStats = useCallback((state: GameState) => {
    setLifetimeStats(prev => {
      const next: LifetimeStats = {
        gamesPlayed:     prev.gamesPlayed + 1,
        totalDistance:   prev.totalDistance + Math.floor(state.distance),
        totalTime:       prev.totalTime + state.time,
        totalAvoided:    prev.totalAvoided + state.avoided,
        highestCps:      Math.max(prev.highestCps,      state.peakCps),
        highestDistance: Math.max(prev.highestDistance, Math.floor(state.distance)),
        averageCpsSum:   prev.averageCpsSum + state.peakCps,
        averageCpsCount: prev.averageCpsCount + 1,
      };
      LS.set('voyager_lifetime', next);
      return next;
    });
  }, []);

  const syncActivePowerUps = useCallback(() => {
    const s   = gs.current;
    const now = Date.now();
    const active: { type: string; remaining: number; total: number }[] = [];
    if (s.hasShield)        active.push({ type: 'shield',        remaining: Math.max(0, s.shieldEnd        - now), total: 5000 });
    if (s.hasSlowmo)        active.push({ type: 'slowmo',        remaining: Math.max(0, s.slowmoEnd        - now), total: 5000 });
    if (s.hasDoubleBoost)   active.push({ type: 'doubleboost',   remaining: Math.max(0, s.doubleBoostEnd   - now), total: 5000 });
    if (s.hasMultiplier)    active.push({ type: 'multiplier',    remaining: Math.max(0, s.multiplierEnd    - now), total: 8000 });
    if (s.hasInvincibility) active.push({ type: 'invincibility', remaining: Math.max(0, s.invincibilityEnd - now), total: 4000 });
    setActivePowerUps(active);
    setCombo(s.combo);
    setScoreMultiplier(s.scoreMultiplier);
  }, []);

  const clearCountdown = useCallback(() => {
    countdownTimers.current.forEach(clearTimeout);
    countdownTimers.current = [];
  }, []);

  const startCountdown = useCallback((onDone: () => void) => {
    clearCountdown();
    setUiView('countdown');
    gs.current.status = 'countdown';

    const steps: (number | 'GO!')[] = [3, 2, 1, 'GO!'];
    let i = 0;

    const tick = () => {
      setCountdownNum(steps[i]);
      if (typeof steps[i] === 'number') audio.playCountdown();
      else                              audio.playGo();
      i++;
      if (i < steps.length) {
        const delay = i === steps.length - 1 ? 600 : 800;
        countdownTimers.current.push(setTimeout(tick, delay));
      } else {
        countdownTimers.current.push(setTimeout(() => {
          setCountdownNum(null);
          onDone();
        }, 600));
      }
    };
    tick();
  }, [clearCountdown]);

  // ── MAIN GAME LOOP ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Canvas setup: always render at CANVAS_W × CANVAS_H logical pixels
    // but scale the backing store for the device pixel ratio.
    // The CSS keeps width/height = 100% so the browser handles CSS scaling.
    const setupCanvas = () => {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× to avoid blowout
      canvas.width  = CANVAS_W * dpr;
      canvas.height = CANVAS_H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Track the ratio so pointer events can be transformed if needed
      scaleRef.current = { x: dpr, y: dpr };
    };
    setupCanvas();

    const onResize = () => { try { setupCanvas(); } catch { /* ignore */ } };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', onResize, { passive: true });

    // ── Stars ──────────────────────────────────────────────
    const state = gs.current;
    if (state.stars.length === 0) {
      state.stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        z: Math.random() * 8 + 1,
        size: Math.random() * 2 + 0.5,
      }));
    }

    // ── Particle helpers ───────────────────────────────────
    const addParticle = (p: Particle) => {
      const s = gs.current;
      if (s.particles.length >= MAX_PARTICLES) {
        let minLife = Infinity, minIdx = 0;
        for (let i = 0; i < s.particles.length; i++) {
          if (s.particles[i].life < minLife) { minLife = s.particles[i].life; minIdx = i; }
        }
        s.particles[minIdx] = p;
      } else {
        s.particles.push(p);
      }
    };

    const addFloat = (x: number, y: number, text: string, color: string, size = 18) => {
      const s = gs.current;
      if (s.floatingTexts.length >= MAX_FLOAT_TEXTS) s.floatingTexts.shift();
      s.floatingTexts.push({ x, y, text, life: 1, color, vy: -2, size });
    };

    // ── Entity factories ───────────────────────────────────
    const createObstacle = (speed: number, forceBoss = false): Obstacle => {
      if (forceBoss) {
        const sz = 80 + Math.random() * 40;
        const pts: Point[] = [];
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const r = sz * (0.75 + Math.random() * 0.35);
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        return {
          x: CANVAS_W + sz * 2, y: CANVAS_H / 2,
          radius: sz, speed: speed * 0.7,
          rotation: 0, rotationSpeed: 0.012,
          type: 'boss', isBoss: true, glowPhase: 0,
          points: pts, hasNearMissed: false,
        };
      }
      const sz   = 20 + Math.random() * 45;
      const type: Obstacle['type'] = Math.random() > 0.85 ? 'comet' : 'asteroid';
      const seg  = 9 + Math.floor(Math.random() * 6);
      const pts: Point[] = [];
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const r = sz * (0.7 + Math.random() * 0.4);
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      return {
        x: CANVAS_W + sz * 2, y: Math.random() * CANVAS_H,
        radius: sz, speed: speed + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        type, isBoss: false, glowPhase: 0,
        points: pts, hasNearMissed: false,
      };
    };

    const createPowerUp = (speed: number): PowerUp => {
      const types: PowerUp['type'][] = ['shield', 'slowmo', 'doubleboost', 'multiplier', 'invincibility'];
      return {
        x: CANVAS_W + 30,
        y: 60 + Math.random() * (CANVAS_H - 120),
        type: types[Math.floor(Math.random() * types.length)],
        radius: 18, speed: speed * 0.8,
        collected: false, glowPhase: 0,
      };
    };

    // ── Game over ──────────────────────────────────────────
    const triggerGameOver = () => {
      const s = gs.current;
      if (s.status === 'gameover') return;
      s.status     = 'gameover';
      s.isBoosting = false;
      audio.playCollision();
      audio.playGameOver();
      for (let i = 0; i < 60; i++) {
        addParticle({
          x: VOYAGER_X, y: s.y,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 16,
          life: 1,
          color: Math.random() > 0.4 ? '#ff6b35' : '#ef4444',
          size: Math.random() * 4 + 2,
        });
      }
      s.screenShake = 25;
      GA.gameOver(Math.floor(s.distance), s.time, s.peakCps);
      if (s.peakCps > 0) GA.peakCps(s.peakCps);
      updateHighScores(s);
      updateLifetimeStats(s);
      checkAchievements(s);
      setUiView('gameover');
    };

    // ── Update ─────────────────────────────────────────────
    const update = (now: number) => {
      const s   = gs.current;
      if (s.status !== 'playing') return;
      const cfg = DIFFICULTY_CONFIG[s.difficulty];

      // FPS
      s.fpsFrameCount++;
      if (now - s.fpsLastTime >= 1000) {
        s.fps           = s.fpsFrameCount;
        s.fpsFrameCount = 0;
        s.fpsLastTime   = now;
        if (showFpsRef.current) updateHUD('stat-fps', s.fps);
      }

      // CPS
      const oneSecAgo = now - 1000;
      let start = 0;
      while (start < s.clickTimes.length && s.clickTimes[start] <= oneSecAgo) start++;
      if (start > 0) s.clickTimes.splice(0, start);
      const newCps = s.clickTimes.length;
      if (newCps !== s.cps) {
        s.cps = newCps;
        if (s.cps > s.peakCps) s.peakCps = s.cps;
        updateHUD('stat-cps', s.cps);
      }

      // Boost
      const boostStr = s.hasDoubleBoost ? BOOST_STRENGTH * 1.6 : BOOST_STRENGTH;
      if (s.isBoosting) {
        s.vel += boostStr;
        const count = s.hasDoubleBoost ? 3 : 1;
        for (let n = 0; n < count; n++) {
          addParticle({
            x: VOYAGER_X - 15,
            y: s.y + (Math.random() - 0.5) * 8,
            vx: -3 - Math.random() * 5,
            vy: (Math.random() - 0.5) * 2.5,
            life: 0.8,
            color: s.hasDoubleBoost ? 'rgba(245,158,11,0.8)' : 'rgba(0,245,255,0.7)',
            size: Math.random() * 3 + 1,
          });
        }
      }

      // Gravity
      s.vel += GRAVITY * cfg.gravityMult;
      s.vel  = Math.min(Math.max(s.vel, -MAX_VELOCITY), MAX_VELOCITY);
      s.y   += s.vel;

      if (s.y < 0 || s.y > CANVAS_H) { triggerGameOver(); return; }

      // Distance
      const distInc = (s.speed * cfg.speedMult / 10) * s.scoreMultiplier;
      s.distance += distInc;
      updateHUD('stat-distance', Math.floor(s.distance).toLocaleString());

      // Time
      const survivalSecs = Math.floor((now - s.startTime) / 1000);
      if (survivalSecs !== s.time) {
        s.time = survivalSecs;
        updateHUD('stat-time', `${survivalSecs}s`);
      }

      // Speed ramp
      if (now - s.lastSpeedUp > SPEED_RAMP_MS) {
        s.speed      += SPEED_INCREMENT;
        s.lastSpeedUp = now;
        updateHUD('stat-speed', `${(s.speed * cfg.speedMult).toFixed(1)}u`);
      }

      // Obstacle spawn
      const spawnBase     = Math.max(1800 - survivalSecs * 60, 500);
      const spawnInterval = spawnBase * cfg.spawnMult;
      if (now - s.lastSpawn > spawnInterval) {
        s.obstacles.push(createObstacle(s.speed * cfg.speedMult));
        s.lastSpawn = now;
      }

      // Boss spawn
      if (!s.bossSpawned && survivalSecs >= 30 && now - s.lastBossSpawn > BOSS_INTERVAL_MS) {
        s.obstacles.push(createObstacle(s.speed * cfg.speedMult, true));
        s.bossSpawned   = true;
        s.lastBossSpawn = now;
        audio.playBossSpawn();
        GA.bossSpawn();
        addFloat(CANVAS_W / 2, 80, '⚠️ BOSS ASTEROID!', '#ef4444', 22);
      }

      const slowFactor = s.hasSlowmo ? 0.4 : 1;

      // Update obstacles
      let writeIdx = 0;
      for (let i = 0; i < s.obstacles.length; i++) {
        const obs = s.obstacles[i];
        obs.glowPhase += 0.05;
        obs.x         -= obs.speed * slowFactor;
        obs.rotation  += obs.rotationSpeed * slowFactor;

        const dx   = obs.x - VOYAGER_X;
        const dy   = obs.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hit  = obs.radius * 0.85 + 14;

        if (dist < hit) {
          if (s.hasShield || s.hasInvincibility) {
            s.hasShield        = false;
            s.hasInvincibility = false;
            s.screenShake      = 10;
            for (let p = 0; p < 20; p++) {
              addParticle({
                x: VOYAGER_X, y: s.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.8, color: '#22c55e',
                size: Math.random() * 3 + 1,
              });
            }
            addFloat(VOYAGER_X, s.y - 40, '🛡️ SHIELD!', '#22c55e', 16);
            continue;
          } else {
            triggerGameOver();
            return;
          }
        }

        // Near miss
        if (!obs.hasNearMissed && dist < obs.radius + 55 &&
            obs.x < VOYAGER_X + 25 && obs.x > VOYAGER_X - 25) {
          audio.playNearMiss();
          obs.hasNearMissed = true;
          s.nearMissCount++;
          s.combo = Math.min(s.combo + 1, 10);
          const comboMult = 1 + s.combo * 0.1;
          const mult      = comboMult * (s.hasMultiplier ? s.multiplierBonus : 1);
          s.scoreMultiplier = mult;
          addFloat(VOYAGER_X + 20, s.y - 35, `NEAR MISS! ×${mult.toFixed(1)}`, '#00f5ff', 15);
        }

        if (obs.x < -obs.radius * 2) {
          s.avoided++;
          if (obs.isBoss) {
            s.bossSpawned = false;
            s.bossCleared = true;
            addFloat(CANVAS_W / 2, CANVAS_H / 2 - 60, '👑 BOSS CLEARED!', '#eab308', 24);
          }
          updateHUD('stat-avoided', s.avoided);
          continue;
        }

        s.obstacles[writeIdx++] = obs;
      }
      s.obstacles.length = writeIdx;

      // Power-up spawn
      if (now - s.lastPowerUpSpawn > POWERUP_INTERVAL_MS) {
        s.powerUps.push(createPowerUp(s.speed * cfg.speedMult));
        s.lastPowerUpSpawn = now;
      }

      // Update power-ups
      writeIdx = 0;
      for (let i = 0; i < s.powerUps.length; i++) {
        const pu = s.powerUps[i];
        pu.x         -= pu.speed * slowFactor;
        pu.glowPhase += 0.06;
        if (pu.x < -80) continue;

        if (!pu.collected) {
          const dx   = pu.x - VOYAGER_X;
          const dy   = pu.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pu.radius + 22) {
            pu.collected = true;
            audio.playPowerUp();
            GA.powerUpCollected(pu.type);
            switch (pu.type) {
              case 'shield':
                s.hasShield = true; s.shieldEnd = now + 5000;
                break;
              case 'slowmo':
                s.hasSlowmo = true; s.slowmoEnd = now + 5000;
                break;
              case 'doubleboost':
                s.hasDoubleBoost = true; s.doubleBoostEnd = now + 5000;
                break;
              case 'multiplier': {
                s.hasMultiplier   = true;
                s.multiplierEnd   = now + 8000;
                s.multiplierBonus = Math.min(s.multiplierBonus * 2, 8);
                const cm          = 1 + s.combo * 0.1;
                s.scoreMultiplier = cm * s.multiplierBonus;
                break;
              }
              case 'invincibility':
                s.hasInvincibility = true; s.invincibilityEnd = now + 4000;
                break;
            }
            for (let p = 0; p < 15; p++) {
              addParticle({
                x: pu.x, y: pu.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.9,
                color: POWERUP_COLORS[pu.type],
                size: Math.random() * 3 + 1,
              });
            }
            addFloat(pu.x, pu.y - 30,
              `${POWERUP_ICONS[pu.type]} ${pu.type.toUpperCase()}!`,
              POWERUP_COLORS[pu.type], 16);
            continue;
          }
        }
        s.powerUps[writeIdx++] = pu;
      }
      s.powerUps.length = writeIdx;

      // Expire power-ups
      if (s.hasShield        && now > s.shieldEnd)        s.hasShield        = false;
      if (s.hasSlowmo        && now > s.slowmoEnd)        s.hasSlowmo        = false;
      if (s.hasDoubleBoost   && now > s.doubleBoostEnd)   s.hasDoubleBoost   = false;
      if (s.hasMultiplier    && now > s.multiplierEnd) {
        s.hasMultiplier   = false;
        s.multiplierBonus = 1;
        s.scoreMultiplier = 1 + s.combo * 0.1;
      }
      if (s.hasInvincibility && now > s.invincibilityEnd) s.hasInvincibility = false;

      // Particles
      writeIdx = 0;
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        if (p.life > 0) s.particles[writeIdx++] = p;
      }
      s.particles.length = writeIdx;

      // Floating texts
      writeIdx = 0;
      for (let i = 0; i < s.floatingTexts.length; i++) {
        const ft = s.floatingTexts[i];
        ft.y += ft.vy; ft.life -= 0.018;
        if (ft.life > 0) s.floatingTexts[writeIdx++] = ft;
      }
      s.floatingTexts.length = writeIdx;

      // Achievement check throttled
      if (now - s.lastAchievementCheck > 500) {
        s.lastAchievementCheck = now;
        checkAchievements(s);
      }
    };

    const postGameDecay = () => {
      const s = gs.current;
      if (s.status !== 'gameover') return;
      if (s.screenShake > 0) s.screenShake--;
      let w = 0;
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        p.x  += p.vx; p.y  += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= 0.02;
        if (p.life > 0) s.particles[w++] = p;
      }
      s.particles.length = w;
    };

    // ── Draw ───────────────────────────────────────────────
    const draw = (timestamp: number) => {
      if (!loopRunning.current) return;

      const s   = gs.current;
      const now = Date.now();
      const cfg = DIFFICULTY_CONFIG[s.difficulty];

      ctx.save();

      // Screen shake
      if (s.screenShake > 0 && s.status !== 'paused') {
        ctx.translate(
          (Math.random() - 0.5) * s.screenShake,
          (Math.random() - 0.5) * s.screenShake,
        );
        if (s.status === 'gameover') s.screenShake = Math.max(0, s.screenShake - 0.5);
      }

      // Clear the full logical area
      ctx.clearRect(-50, -50, CANVAS_W + 100, CANVAS_H + 100);

      // Background fill so there's no transparency bleed
      ctx.fillStyle = '#08090c';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Stars
      const activeSpeed = s.status === 'playing' ? s.speed * cfg.speedMult : 0;
      const slowF       = s.hasSlowmo ? 0.4 : 1;

      for (let i = 0; i < s.stars.length; i++) {
        const star = s.stars[i];
        if (s.status === 'playing') {
          star.x -= (1 / star.z) * activeSpeed * slowF;
          if (star.x < 0) star.x = CANVAS_W;
        }
        const alpha = 0.1 + (1 / star.z) * 0.9;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / star.z, 0, Math.PI * 2);
        ctx.fill();
      }

      // Logic update
      update(now);
      postGameDecay();

      // Particles
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Ship & entities
      if (s.status !== 'start' && s.status !== 'countdown') {
        // Shield bubble
        if (s.hasShield || s.hasInvincibility) {
          ctx.save();
          ctx.translate(VOYAGER_X, s.y);
          const sg = ctx.createRadialGradient(0, 0, 20, 0, 0, 45);
          sg.addColorStop(0, 'rgba(34,197,94,0)');
          sg.addColorStop(0.7, s.hasInvincibility ? 'rgba(236,72,153,0.15)' : 'rgba(34,197,94,0.12)');
          sg.addColorStop(1,   s.hasInvincibility ? 'rgba(236,72,153,0.4)'  : 'rgba(34,197,94,0.35)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(0, 0, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = s.hasInvincibility ? '#ec4899' : '#22c55e';
          ctx.lineWidth   = 2;
          ctx.globalAlpha = 0.6 + Math.sin(timestamp * 0.008) * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, 45, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Ship
        ctx.save();
        ctx.translate(VOYAGER_X, s.y);
        ctx.rotate(s.vel * 0.06);

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.arc(-18, 0, 22, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(2, 0);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-10, -10, 28, 20);

        ctx.fillStyle = s.hasDoubleBoost ? '#f59e0b' : '#ff6b35';
        ctx.fillRect(0, -8, 18, 16);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.moveTo(18, 6);
        ctx.lineTo(50, 16);
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(45, 12, 12, 10);

        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(20, -45);
        ctx.stroke();

        ctx.restore();

        // Power-ups
        for (let i = 0; i < s.powerUps.length; i++) {
          const pu = s.powerUps[i];
          ctx.save();
          ctx.translate(pu.x, pu.y);

          const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, pu.radius * 1.5);
          glow.addColorStop(0, POWERUP_COLORS[pu.type] + 'ff');
          glow.addColorStop(0.5, POWERUP_COLORS[pu.type] + '88');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, pu.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font         = `${pu.radius}px serif`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle    = '#fff';
          ctx.fillText(POWERUP_ICONS[pu.type], 0, 0);

          const pulse      = Math.sin(pu.glowPhase) * 0.3 + 0.7;
          ctx.strokeStyle  = POWERUP_COLORS[pu.type];
          ctx.lineWidth    = 2;
          ctx.globalAlpha  = pulse;
          ctx.beginPath();
          ctx.arc(0, 0, pu.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Obstacles
        for (let i = 0; i < s.obstacles.length; i++) {
          const obs = s.obstacles[i];
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(obs.rotation);

          if (obs.type === 'boss') {
            const pulse = Math.sin(obs.glowPhase) * 0.4 + 0.6;
            const bg    = ctx.createRadialGradient(0, 0, obs.radius * 0.3, 0, 0, obs.radius * 1.4);
            bg.addColorStop(0, `rgba(239,68,68,${pulse.toFixed(2)})`);
            bg.addColorStop(0.5, 'rgba(220,38,38,0.3)');
            bg.addColorStop(1, 'transparent');
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius * 1.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.points[0].x, obs.points[0].y);
            for (let p = 1; p < obs.points.length; p++) ctx.lineTo(obs.points[p].x, obs.points[p].y);
            ctx.closePath();
            const bodyG = ctx.createRadialGradient(-obs.radius / 4, -obs.radius / 4, 0, 0, 0, obs.radius);
            bodyG.addColorStop(0, '#7f1d1d');
            bodyG.addColorStop(1, '#1c0202');
            ctx.fillStyle   = bodyG;
            ctx.fill();
            ctx.strokeStyle = `rgba(239,68,68,${pulse.toFixed(2)})`;
            ctx.lineWidth   = 3;
            ctx.stroke();

            ctx.rotate(-obs.rotation);
            ctx.fillStyle    = '#ef4444';
            ctx.font         = 'bold 14px sans-serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BOSS', 0, 0);

          } else if (obs.type === 'asteroid') {
            ctx.beginPath();
            ctx.moveTo(obs.points[0].x, obs.points[0].y);
            for (let p = 1; p < obs.points.length; p++) ctx.lineTo(obs.points[p].x, obs.points[p].y);
            ctx.closePath();
            const g = ctx.createRadialGradient(-obs.radius / 4, -obs.radius / 4, 0, 0, 0, obs.radius);
            g.addColorStop(0, '#64748b');
            g.addColorStop(1, '#080d14');
            ctx.fillStyle   = g;
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth   = 1.5;
            ctx.stroke();
            ctx.fillStyle   = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(obs.radius / 3, -obs.radius / 5, obs.radius / 4, 0, Math.PI * 2);
            ctx.fill();

          } else {
            // Comet
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.radius);
            cg.addColorStop(0, '#fff');
            cg.addColorStop(0.2, '#00f5ff');
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.rotate(-obs.rotation);
            const tailG = ctx.createLinearGradient(0, 0, obs.radius * 5, 0);
            tailG.addColorStop(0, 'rgba(0,245,255,0.3)');
            tailG.addColorStop(1, 'transparent');
            ctx.fillStyle = tailG;
            ctx.beginPath();
            ctx.moveTo(0, -obs.radius / 1.5);
            ctx.lineTo(obs.radius * 5, -obs.radius * 1.5);
            ctx.lineTo(obs.radius * 5,  obs.radius * 1.5);
            ctx.lineTo(0,  obs.radius / 1.5);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Floating texts
        for (let i = 0; i < s.floatingTexts.length; i++) {
          const ft      = s.floatingTexts[i];
          ctx.globalAlpha  = Math.max(0, ft.life);
          ctx.fillStyle    = ft.color;
          ctx.font         = `bold ${ft.size}px sans-serif`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1;
      }

      // Boss progress bar
      if (s.status === 'playing') {
        const elapsed     = (now - s.startTime) / 1000;
        const bossRefSec  = s.lastBossSpawn > 0 ? (s.lastBossSpawn - s.startTime) / 1000 : 0;
        const sinceRef    = elapsed - bossRefSec;
        const intervalSec = BOSS_INTERVAL_MS / 1000;
        const progress    = Math.min((sinceRef % intervalSec) / intervalSec, 1);
        const nextIn      = Math.ceil(intervalSec - (sinceRef % intervalSec));

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(10, CANVAS_H - 14, CANVAS_W - 20, 6);
        ctx.fillStyle = progress > 0.85 ? '#ef4444' : '#00f5ff';
        ctx.fillRect(10, CANVAS_H - 14, (CANVAS_W - 20) * progress, 6);
        ctx.fillStyle    = 'rgba(255,255,255,0.4)';
        ctx.font         = '9px sans-serif';
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Boss in ${nextIn}s`, 12, CANVAS_H - 16);
      }

      ctx.restore();

      rafIdRef.current = requestAnimationFrame(draw);
    };

    // ── Input ──────────────────────────────────────────────
    const stopBoost = () => { gs.current.isBoosting = false; };

    const handleKeyDown = (e: KeyboardEvent) => {
      const s = gs.current.status;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return;
        if      (s === 'playing')                    actionsRef.current?.boostUp();
        else if (s === 'start' || s === 'gameover')  actionsRef.current?.start();
        else if (s === 'paused')                     actionsRef.current?.resume();
      }
      if (e.code === 'Escape' || e.key === 'Escape') {
        if      (s === 'playing') actionsRef.current?.pause();
        else if (s === 'paused')  actionsRef.current?.resume();
      }
      if ((e.key === 'p' || e.key === 'P') && (s === 'playing' || s === 'paused')) {
        if (s === 'playing') actionsRef.current?.pause();
        else                 actionsRef.current?.resume();
      }
    };
    const handleKeyUp      = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === ' ') stopBoost(); };
    const handleBlur       = ()                  => stopBoost();
    const handleVisibility = ()                  => { if (document.hidden) stopBoost(); };

    window.addEventListener('keydown',           handleKeyDown);
    window.addEventListener('keyup',             handleKeyUp);
    window.addEventListener('blur',              handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    const hudInterval = setInterval(() => {
      if (gs.current.status === 'playing') syncActivePowerUps();
    }, 200);

    loopRunning.current  = true;
    rafIdRef.current     = requestAnimationFrame(draw);

    return () => {
      loopRunning.current = false;
      cancelAnimationFrame(rafIdRef.current);
      clearInterval(hudInterval);
      clearCountdown();
      window.removeEventListener('keydown',           handleKeyDown);
      window.removeEventListener('keyup',             handleKeyUp);
      window.removeEventListener('blur',              handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────
  const actionsRef = useRef({
    start: () => {
      const now        = Date.now();
      const difficulty = difficultyRef.current;
      const cfg        = DIFFICULTY_CONFIG[difficulty];

      clearCountdown();

      const s     = gs.current;
      const stars = s.stars.length > 0 ? s.stars : [];

      Object.assign(s, makeInitialState(), {
        stars,
        speed:                INITIAL_SPEED * cfg.speedMult,
        difficulty,
        lastSpawn:            now,
        lastSpeedUp:          now,
        lastPowerUpSpawn:     now,
        lastAchievementCheck: now,
        fpsLastTime:          now,
      } satisfies Partial<GameState>);

      setActivePowerUps([]);
      setCombo(0);
      setScoreMultiplier(1);

      startCountdown(() => {
        const t               = Date.now();
        s.status              = 'playing';
        s.startTime           = t;
        s.lastSpawn           = t;
        s.lastSpeedUp         = t;
        s.fpsLastTime         = t;
        setUiView('playing');
        GA.gameStart(difficulty);
        if (!audio.muted) audio.init();
      });
    },

    boostUp: () => {
      const s = gs.current;
      if (s.status !== 'playing') return;
      s.isBoosting = true;
      if (s.clickTimes.length < 200) s.clickTimes.push(Date.now());
      audio.playBoost();
    },

    boostDown: () => { gs.current.isBoosting = false; },

    pause: () => {
      const s = gs.current;
      if (s.status !== 'playing') return;
      s.status     = 'paused';
      s.isBoosting = false;
      s.pausedAt   = Date.now();
      setUiView('paused');
      GA.pause();
    },

    resume: () => {
      const s = gs.current;
      if (s.status !== 'paused') return;
      const now    = Date.now();
      const paused = s.pausedAt > 0 ? now - s.pausedAt : 0;

      s.startTime            += paused;
      s.lastSpawn            += paused;
      s.lastSpeedUp          += paused;
      s.lastPowerUpSpawn     += paused;
      s.lastAchievementCheck += paused;
      if (s.lastBossSpawn > 0)    s.lastBossSpawn    += paused;
      if (s.hasShield)            s.shieldEnd        += paused;
      if (s.hasSlowmo)            s.slowmoEnd        += paused;
      if (s.hasDoubleBoost)       s.doubleBoostEnd   += paused;
      if (s.hasMultiplier)        s.multiplierEnd    += paused;
      if (s.hasInvincibility)     s.invincibilityEnd += paused;

      s.clickTimes  = [];
      s.fpsLastTime = now;
      s.pausedAt    = 0;
      s.status      = 'playing';
      setUiView('playing');
      GA.resume();
    },
  });

  // ── Canvas pointer handlers ─────────────────────────────
  const handleCanvasMouseDown = useCallback(() => {
    const s = gs.current.status;
    if      (s === 'playing')                    actionsRef.current.boostUp();
    else if (s === 'start' || s === 'gameover')  actionsRef.current.start();
    else if (s === 'paused')                     actionsRef.current.resume();
  }, []);

  const handleCanvasMouseUp    = useCallback(() => actionsRef.current.boostDown(), []);
  const handleCanvasMouseLeave = useCallback(() => actionsRef.current.boostDown(), []);

  const handleCanvasTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const s = gs.current.status;
    if      (s === 'playing')                    actionsRef.current.boostUp();
    else if (s === 'start' || s === 'gameover')  actionsRef.current.start();
    else if (s === 'paused')                     actionsRef.current.resume();
  }, []);

  const handleCanvasTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    actionsRef.current.boostDown();
  }, []);

  const handleCanvasTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    actionsRef.current.boostDown();
  }, []);

  // ── RENDER ─────────────────────────────────────────────
  return (
    <>
      <SeoHead />

      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif',
      }}>

        {/* GAME CONTAINER */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '900px',
            // Fix: use paddingBottom trick for true 16:9 aspect ratio
            // instead of aspectRatio which can misbehave with canvas DPI scaling
            aspectRatio: '900 / 500',
            background: '#08090c',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.05)',
            userSelect: 'none',
            marginBottom: '4rem',
          }}
        >
          {/*
            The canvas is absolutely positioned to fill the container exactly.
            Its internal pixel dimensions are set by setupCanvas() and are always
            CANVAS_W × CANVAS_H logical pixels (scaled by dpr for sharpness).
            CSS width/height 100% means the browser scales the canvas to fit
            the container without any overflow or clipping.
          */}
          <canvas
            ref={canvasRef}
            aria-label="Voyager Space Game — click or press Space to boost"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              cursor: 'pointer',
              touchAction: 'none',
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onTouchStart={handleCanvasTouchStart}
            onTouchEnd={handleCanvasTouchEnd}
            onTouchCancel={handleCanvasTouchCancel}
          />

          {/* HUD */}
          {uiView === 'playing' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between',
              pointerEvents: 'none',
              // Ensure HUD never overflows the container
              boxSizing: 'border-box',
              width: '100%',
            }}>
              {/* Left */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', pointerEvents: 'auto' }}>
                <StatBox id="stat-distance" icon={<TrendingUp size={14} color="#22c55e" />} label="Distance" />
                <StatBox id="stat-avoided"  icon={<Shield     size={14} color="#ff6b35" />} label="Avoided"  />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <IconBtn onClick={toggleSound}                      aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} color="#00f5ff" />}
                  </IconBtn>
                  <IconBtn onClick={() => actionsRef.current.pause()} aria-label="Pause game">
                    <Pause size={14} color="#fff" />
                  </IconBtn>
                  <IconBtn onClick={toggleFullscreen}                 aria-label="Toggle fullscreen">
                    {isFullscreen ? <Minimize size={14} color="#fff" /> : <Maximize size={14} color="#fff" />}
                  </IconBtn>
                  <IconBtn onClick={() => setShowFps(f => !f)}        aria-label="Toggle FPS">
                    <Cpu size={14} color={showFps ? '#a855f7' : '#64748b'} />
                  </IconBtn>
                </div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                <StatBox id="stat-cps"   icon={<Zap      size={14} color="#eab308" />} label="CPS"   />
                <StatBox id="stat-speed" icon={<Activity size={14} color="#00f5ff" />} label="Speed" initialValue={`${INITIAL_SPEED.toFixed(1)}u`} />
                <StatBox id="stat-time"  icon={<Timer    size={14} color="#a855f7" />} label="Time"  initialValue="0s" />
                {showFps && <StatBox id="stat-fps" icon={<Cpu size={14} color="#a855f7" />} label="FPS" initialValue="--" />}
              </div>

              {/* Active power-ups */}
              {activePowerUps.length > 0 && (
                <div style={{
                  position: 'absolute', bottom: '2rem', left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', gap: '0.5rem',
                  pointerEvents: 'none',
                }}>
                  {activePowerUps.map((pu, i) => (
                    <PowerUpHudItem key={`${pu.type}-${i}`} pu={pu} />
                  ))}
                </div>
              )}

              {/* Combo */}
              {combo > 1 && (
                <div style={{
                  position: 'absolute', top: '50%', right: '1rem',
                  transform: 'translateY(-50%)', textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#eab308', fontWeight: '800', letterSpacing: '0.1em' }}>COMBO</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#eab308', lineHeight: 1 }}>
                    ×{scoreMultiplier.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Countdown */}
          {uiView === 'countdown' && countdownNum !== null && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(3,7,18,0.5)', flexDirection: 'column',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#00f5ff', letterSpacing: '0.2em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Mission Ready
              </div>
              <div
                key={String(countdownNum)}
                style={{
                  fontSize: countdownNum === 'GO!' ? '4rem' : '7rem',
                  fontWeight: '900',
                  color: countdownNum === 'GO!' ? '#22c55e' : '#fff',
                  textShadow: countdownNum === 'GO!'
                    ? '0 0 40px rgba(34,197,94,0.8)'
                    : '0 0 40px rgba(255,255,255,0.4)',
                  animation: 'countdownPop 0.4s ease-out',
                  lineHeight: 1,
                }}
              >
                {countdownNum}
              </div>
            </div>
          )}

          {/* Start menu */}
          {uiView === 'start' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(8,13,20,0.88)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
              boxSizing: 'border-box',
            }}>
              <div style={{
                maxWidth: '480px', width: '100%', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '24px', padding: '2rem',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  width: '72px', height: '72px',
                  background: 'rgba(0,245,255,0.1)', borderRadius: '18px',
                  border: '1px solid rgba(0,245,255,0.3)',
                  margin: '0 auto 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'rotate(15deg)',
                }}>
                  <Rocket size={36} color="#00f5ff" style={{ transform: 'rotate(-45deg)' }} />
                </div>

                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Guide The <span style={{ color: '#00f5ff' }}>Voyager</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Navigate through the asteroid field. Hold SPACE or tap to boost.
                </p>

                {highScores.bestDistance > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <HiScoreChip label="Best Dist"    value={highScores.bestDistance.toLocaleString()} color="#00f5ff" />
                    <HiScoreChip label="Best Time"    value={`${highScores.bestTime}s`}                color="#a855f7" />
                    <HiScoreChip label="Peak CPS"     value={highScores.highestCps}                    color="#eab308" />
                    <HiScoreChip label="Most Avoided" value={highScores.mostAvoided}                   color="#ff6b35" />
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Difficulty</div>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                    {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        aria-label={`Set difficulty to ${d}`}
                        onClick={() => setDifficulty(d)}
                        style={{
                          flex: 1, padding: '0.4rem 0.15rem', minWidth: 0,
                          background: difficulty === d ? DIFF_COLORS[d] + '22' : 'transparent',
                          border: `1px solid ${difficulty === d ? DIFF_COLORS[d] : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: difficulty === d ? DIFF_COLORS[d] : '#64748b',
                          fontWeight: '700', fontSize: '0.65rem',
                          cursor: 'pointer', textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {d === 'easy' ? '🟢' : d === 'normal' ? '🟡' : '🔴'} {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  aria-label="Start mission"
                  onClick={(e) => { e.currentTarget.blur(); actionsRef.current.start(); }}
                  style={{
                    width: '100%', padding: '1.1rem',
                    background: 'linear-gradient(135deg,#00f5ff,#22c55e)',
                    color: '#000', fontSize: '1rem', fontWeight: '900',
                    borderRadius: '14px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 8px 24px rgba(0,245,255,0.3)', marginBottom: '0.75rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <Play fill="currentColor" size={18} /> START MISSION
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button aria-label="View stats"        onClick={() => setShowStats(true)}        style={outlineBtn}><BarChart2 size={14} /> Stats</button>
                  <button aria-label="View achievements" onClick={() => setShowAchievements(true)} style={outlineBtn}><Trophy    size={14} /> Achievements</button>
                  <button aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleSound}          style={outlineBtn}>{isMuted ? <VolumeX size={14} /> : <Volume2 size={14} color="#00f5ff" />}</button>
                  <button aria-label="Toggle fullscreen" onClick={toggleFullscreen}                style={outlineBtn}>{isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</button>
                </div>
              </div>
            </div>
          )}

          {/* Pause */}
          {uiView === 'paused' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '2rem', minWidth: '260px',
              }}>
                <Pause size={36} color="#00f5ff" style={{ marginBottom: '0.75rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0 0 0.5rem' }}>Paused</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Press P or ESC to resume</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button aria-label="Resume" onClick={() => actionsRef.current.resume()} style={{ ...solidBtn, background: 'linear-gradient(135deg,#00f5ff,#22c55e)', color: '#000' }}>
                    <PlayIcon fill="currentColor" size={16} /> RESUME
                  </button>
                  <button aria-label="Restart" onClick={() => actionsRef.current.start()} style={{ ...solidBtn, background: 'rgba(255,255,255,0.08)' }}>
                    <RefreshCcw size={16} /> RESTART
                  </button>
                  <Link to="/games" style={{ ...solidBtn, textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' } as React.CSSProperties}>
                    <Home size={16} /> QUIT
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Game over */}
          {uiView === 'gameover' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(8,13,20,0.93)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
              boxSizing: 'border-box',
            }}>
              <div style={{
                maxWidth: '400px', width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '1.5rem', textAlign: 'center',
                boxSizing: 'border-box',
              }}>
                <div style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.2rem' }}>Signal Lost</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>MISSION FAILED</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                  <GameOverStat label="Distance" value={Math.floor(gs.current.distance).toLocaleString()} highlight="#00f5ff" isNew={Math.floor(gs.current.distance) >= highScores.bestDistance && gs.current.distance > 0} />
                  <GameOverStat label="Avoided"  value={gs.current.avoided}   highlight="#ff6b35" isNew={gs.current.avoided  >= highScores.mostAvoided && gs.current.avoided  > 0} />
                  <GameOverStat label="Peak CPS" value={gs.current.peakCps}   highlight="#eab308" isNew={gs.current.peakCps  >= highScores.highestCps  && gs.current.peakCps  > 0} />
                  <GameOverStat label="Time"     value={`${gs.current.time}s`} highlight="#a855f7" isNew={gs.current.time    >= highScores.bestTime    && gs.current.time     > 0} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button aria-label="Retry" onClick={() => { GA.retry(); actionsRef.current.start(); }} style={{ ...solidBtn, background: '#fff', color: '#000' }}>
                    <RefreshCcw size={16} /> RETRY MISSION
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button aria-label="Achievements" onClick={() => setShowAchievements(true)} style={{ ...solidBtn, flex: 1, background: 'rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                      <Trophy size={14} /> Achievements
                    </button>
                    <button aria-label="Stats" onClick={() => setShowStats(true)} style={{ ...solidBtn, flex: 1, background: 'rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                      <BarChart2 size={14} /> Stats
                    </button>
                  </div>
                  <Link to="/games" style={{ ...solidBtn, textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' } as React.CSSProperties}>
                    <Home size={16} /> ALL GAMES
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Achievement toasts */}
          <div style={{
            position: 'absolute', top: '1rem', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            pointerEvents: 'none', zIndex: 50,
            width: 'max-content', maxWidth: '90%',
          }}>
            {newAchievements.map((a, i) => (
              <div key={`${a.id}-${i}`} style={{
                background: 'rgba(234,179,8,0.15)',
                border: '1px solid rgba(234,179,8,0.4)',
                borderRadius: '12px', padding: '0.6rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backdropFilter: 'blur(8px)', animation: 'slideDown 0.4s ease-out',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#eab308', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievement Unlocked!</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700' }}>{a.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats modal */}
        {showStats && (
          <Modal title="Lifetime Statistics" icon={<BarChart2 size={20} color="#00f5ff" />} onClose={() => setShowStats(false)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <StatModal label="Games Played"     value={lifetimeStats.gamesPlayed} />
              <StatModal label="Total Distance"   value={lifetimeStats.totalDistance.toLocaleString()} />
              <StatModal label="Total Time"       value={`${lifetimeStats.totalTime}s`} />
              <StatModal label="Total Avoided"    value={lifetimeStats.totalAvoided} />
              <StatModal label="Highest CPS"      value={lifetimeStats.highestCps} />
              <StatModal label="Highest Distance" value={lifetimeStats.highestDistance.toLocaleString()} />
              <StatModal label="Avg Peak CPS"     value={lifetimeStats.averageCpsCount > 0 ? (lifetimeStats.averageCpsSum / lifetimeStats.averageCpsCount).toFixed(1) : '0'} />
            </div>
          </Modal>
        )}

        {/* Achievements modal */}
        {showAchievements && (
          <Modal title="Achievements" icon={<Trophy size={20} color="#eab308" />} onClose={() => setShowAchievements(false)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {achievements.map(a => (
                <div key={a.id} style={{
                  background: a.unlocked ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${a.unlocked ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px', padding: '0.75rem',
                  opacity: a.unlocked ? 1 : 0.45,
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{a.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: a.unlocked ? '#eab308' : '#94a3b8' }}>{a.title}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{a.description}</div>
                  {a.unlocked && <div style={{ fontSize: '0.6rem', color: '#22c55e', marginTop: '0.25rem', fontWeight: '700' }}>✓ Unlocked</div>}
                </div>
              ))}
            </div>
          </Modal>
        )}

        {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" style={{ width: '100%', maxWidth: '850px', marginBottom: '3.5rem', marginTop: '1rem' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
            marginBottom: '1.5rem', textAlign: 'center',
            letterSpacing: '-0.3px',
          }}>More Tools</h2>
          <div
            className="cps-games-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
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
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '1.2rem 0.5rem',
                  cursor: 'pointer', textDecoration: 'none',
                  color: 'var(--neon-cyan)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3,
                }}>{label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* SEO article */}
        <article style={{ width: '100%', maxWidth: '850px', padding: '2rem 0', lineHeight: '1.7', color: '#d1d5db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <Gauge size={24} color="#00f5ff" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Spacebar CPS Test: Boost Your Clicking Speed with Voyager Game
            </h2>
          </div>
          <p style={{ marginBottom: '1.25rem' }}>
            Are you ready to calculate your exact clicking speed? Welcome to the ultimate <strong>Spacebar CPS Test</strong> (Clicks Per Second) packed inside an immersive interstellar arcade trainer.
          </p>
          <h3 style={seoH3}>What is a CPS Test and Why Does it Matter?</h3>
          <p style={seoP}><strong>CPS</strong> stands for <em>Clicks Per Second</em>. It is a core metric used by competitive pro-gamers to measure raw reflex velocity and finger stamina.</p>
          <h3 style={seoH3}>How to Test and Improve Your Clicks Per Second Score</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem', color: '#9ca3af' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Real-time Tracking:</strong> Monitor your live CPS directly inside the upper HUD panel.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Stamina Training:</strong> Rhythmic click patterns regulate engine propulsion.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Peak Score Analytics:</strong> The post-game screen displays your maximum Peak CPS.</li>
          </ul>
          <div style={{ background: 'rgba(0,245,255,0.03)', borderLeft: '4px solid #00f5ff', padding: '1rem', margin: '1.5rem 0', borderRadius: '0 12px 12px 0' }}>
            <span style={{ display: 'block', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>💡 Did You Know?</span>
            The average global CPS sits between 4–6.5. Professional esports veterans frequently breach sustained ranges of 12–15 clicks per second!
          </div>
          <SeoExtraSections />
          <h3 style={seoH3}>Frequently Asked Questions</h3>
          <FaqAccordion items={FAQ_ITEMS} />
          <h3 style={seoH3}>Take the Challenge Now</h3>
          <p style={{ margin: 0 }}>Launch the simulation above and see if you possess the elite micro-skills needed to guide the Voyager ship through deep space!</p>
        </article>
      </div>

      <style>{`
        @keyframes countdownPop {
          0%   { transform: scale(1.6); opacity: 0; }
          60%  { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ── SEO HEAD ─────────────────────────────────────────────────
function SeoHead() {
  useEffect(() => {
    document.title = 'Voyager Space Game — Spacebar CPS Test & Asteroid Navigator';
    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };
    setMeta('description', 'Play Voyager — the ultimate browser spacebar CPS test game.');
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#00f5ff');
    setMeta('keywords', 'CPS test, spacebar clicker, clicks per second, asteroid game');
    setMeta('og:title', 'Voyager Space Game — Spacebar CPS Test', true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setLink('canonical', 'https://yourdomain.com/games/voyager');

    const existing = document.getElementById('voyager-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id   = 'voyager-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: 'Voyager Space Game',
      applicationCategory: 'GameApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
    document.head.appendChild(script);
    return () => { document.getElementById('voyager-jsonld')?.remove(); };
  }, []);
  return null;
}

// ── SEO EXTRAS ───────────────────────────────────────────────
const seoH3: React.CSSProperties = { fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' };
const seoP:  React.CSSProperties = { marginBottom: '1.25rem' };

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'Is my score saved if I close the tab?',  a: 'Yes. Best distance, survival time, peak CPS and achievements are stored locally in your browser.' },
  { q: 'Does difficulty affect my CPS score?',   a: 'Difficulty changes obstacle speed and gravity — not the CPS calculation itself.' },
  { q: 'Can I play Voyager on mobile?',          a: 'Yes — tapping the canvas works the same as holding Spacebar on desktop.' },
  { q: 'Why does the ship suddenly drop?',       a: 'Releasing boost lets gravity take over. Short rhythmic taps give more precise altitude control.' },
];

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${open ? 'rgba(0,245,255,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              style={{ width: '100%', padding: '0.9rem 1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', textAlign: 'left' }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{item.q}</span>
              <ChevronDown size={16} color={open ? '#00f5ff' : '#64748b'} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {open && (
              <div style={{ padding: '0 1.1rem 1rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.6 }}>{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeoExtraSections() {
  return (
    <>
      <h3 style={seoH3}>Boss Asteroids and Long-Run Endurance</h3>
      <p style={seoP}>Every 90 seconds a Boss Asteroid fills most of the vertical play field. Clearing one unlocks the "Boss Slayer" achievement.</p>
      <h3 style={seoH3}>Understanding Your Power-Up Loadout</h3>
      <p style={seoP}>Five collectible power-ups: <strong>Shield</strong>, <strong>Invincibility</strong>, <strong>Slow-Mo</strong>, <strong>Double Boost</strong>, and <strong>Multiplier</strong>.</p>
      <h3 style={seoH3}>Reading the Near-Miss Window</h3>
      <p style={seoP}>A near miss registers when an asteroid passes close without collision, building your combo multiplier.</p>
    </>
  );
}

// ── STYLE CONSTANTS ───────────────────────────────────────────
const outlineBtn: React.CSSProperties = {
  flex: 1, padding: '0.5rem 0.25rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#94a3b8',
  fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
};

const solidBtn: React.CSSProperties = {
  width: '100%', padding: '0.8rem',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '0.9rem', fontWeight: '800',
  borderRadius: '12px', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
};

// ── SUB-COMPONENTS ────────────────────────────────────────────
const StatBox = React.memo(({ icon, label, id, initialValue }: {
  icon: React.ReactNode; label: string; id: string; initialValue?: string | number;
}) => (
  <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.35rem 0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '800' }}>{label}</span>
      <span id={id} style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: '700', color: '#fff', lineHeight: 1 }}>{initialValue ?? 0}</span>
    </div>
  </div>
));
StatBox.displayName = 'StatBox';

const GameOverStat = React.memo(({ label, value, highlight = '#fff', isNew }: {
  label: string; value: string | number; highlight?: string; isNew?: boolean;
}) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isNew ? highlight + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', padding: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>
    {isNew && <div style={{ position: 'absolute', top: '-6px', right: '6px', fontSize: '0.55rem', background: highlight, color: '#000', fontWeight: '900', padding: '1px 5px', borderRadius: '4px' }}>NEW BEST</div>}
    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'monospace', color: highlight }}>{value}</div>
  </div>
));
GameOverStat.displayName = 'GameOverStat';

const HiScoreChip = React.memo(({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '800', color }}>{value}</span>
  </div>
));
HiScoreChip.displayName = 'HiScoreChip';

const IconBtn = React.memo(({ children, onClick, 'aria-label': ariaLabel }: {
  children: React.ReactNode; onClick?: () => void; 'aria-label'?: string;
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
  >
    {children}
  </button>
));
IconBtn.displayName = 'IconBtn';

const PowerUpHudItem = React.memo(({ pu }: { pu: { type: string; remaining: number; total: number } }) => {
  const pct = pu.remaining / pu.total;
  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${POWERUP_COLORS[pu.type]}44`, borderRadius: '10px', padding: '0.35rem 0.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '54px' }}>
      <span style={{ fontSize: '1rem' }}>{POWERUP_ICONS[pu.type]}</span>
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: POWERUP_COLORS[pu.type], transition: 'width 0.2s linear' }} />
      </div>
    </div>
  );
});
PowerUpHudItem.displayName = 'PowerUpHudItem';

const Modal = React.memo(({ title, icon, onClose, children }: {
  title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode;
}) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}
    onClick={onClose}
  >
    <div
      style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{title}</h2>
        </div>
        <button aria-label="Close modal" onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.3rem 0.6rem', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
));
Modal.displayName = 'Modal';

const StatModal = React.memo(({ label, value }: { label: string; value: string | number }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: '800', color: '#00f5ff' }}>{value}</div>
  </div>
));
StatModal.displayName = 'StatModal';

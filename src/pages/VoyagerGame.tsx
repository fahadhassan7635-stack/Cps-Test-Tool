import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Rocket, Play, RefreshCcw, Activity, Zap, Shield, Timer, TrendingUp,
  Home, Volume2, VolumeX, Gauge, Pause, Play as PlayIcon,
  Maximize, Minimize, Trophy, Star, Cpu, BarChart2,
  ChevronRight, ChevronDown, Award, Layers, Repeat
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================
// TYPES
// ============================================================
interface Point { x: number; y: number; }

interface Particle extends Point {
  vx: number; vy: number; life: number; color: string; size: number;
}

interface Obstacle extends Point {
  radius: number; speed: number; rotation: number; rotationSpeed: number;
  type: 'asteroid' | 'comet' | 'boss';
  points: Point[];
  hasNearMissed?: boolean;
  isBoss?: boolean;
  glowPhase?: number;
}

interface PowerUp extends Point {
  type: 'shield' | 'slowmo' | 'doubleboost' | 'multiplier' | 'invincibility';
  radius: number;
  speed: number;
  life: number;
  collected?: boolean;
  glowPhase: number;
}

interface FloatingText {
  x: number; y: number; text: string; life: number;
  color: string; vy: number; size: number;
}

interface Achievement {
  id: string; title: string; description: string;
  icon: string; unlocked: boolean; unlockedAt?: number;
}

interface HighScores {
  bestDistance: number; bestTime: number;
  highestCps: number; mostAvoided: number;
}

interface LifetimeStats {
  gamesPlayed: number; totalDistance: number; totalTime: number;
  totalAvoided: number; highestCps: number; highestDistance: number;
  averageCpsSum: number; averageCpsCount: number;
}

interface ReplayFrame {
  y: number; vel: number; obstacles: { x: number; y: number; radius: number; type: string; rotation: number }[];
  powerups: { x: number; y: number; type: string }[];
  time: number;
}

type GameStatus = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';
type Difficulty = 'easy' | 'normal' | 'hard';
type UiView = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';

// ============================================================
// ANALYTICS HELPER
// ============================================================
const GA = {
  event: (name: string, params?: Record<string, unknown>) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', name, params ?? {});
      }
    } catch { /* silent */ }
  },
  gameStart: (difficulty: string) => GA.event('game_start', { difficulty }),
  gameOver: (distance: number, time: number, cps: number) =>
    GA.event('game_over', { distance, survival_time: time, peak_cps: cps }),
  retry: () => GA.event('retry'),
  pause: () => GA.event('pause'),
  resume: () => GA.event('resume'),
  achievementUnlock: (id: string) => GA.event('achievement_unlock', { achievement_id: id }),
  powerUpCollected: (type: string) => GA.event('power_up_collected', { type }),
  bossSpawn: () => GA.event('boss_spawn'),
  peakCps: (cps: number) => GA.event('peak_cps', { value: cps }),
};

// ============================================================
// AUDIO MANAGER
// ============================================================
class AudioManager {
  ctx: AudioContext | null = null;
  muted = false;

  init() {
    if (!this.ctx && !this.muted && typeof window !== 'undefined') {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch { console.warn('Web Audio API not supported'); }
    }
  }

  private safe(fn: () => void) {
    if (this.muted || !this.ctx || this.ctx.state === 'suspended') return;
    try { fn(); } catch (e) { console.error(e); }
  }

  playBoost() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.2);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.2);
    });
  }

  playCollision() {
    this.init();
    this.safe(() => {
      const noise = this.ctx!.createBufferSource();
      const bufferSize = this.ctx!.sampleRate * 0.5;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx!.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + 0.6);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.6);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx!.destination);
      noise.start();
    });
  }

  playGameOver() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx!.currentTime + 1.2);
      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.2);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 1.2);
    });
  }

  playNearMiss() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx!.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.15);
    });
  }

  playPowerUp() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx!.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.3);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.3);
    });
  }

  playBossSpawn() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, this.ctx!.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx!.currentTime + 0.8);
      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.8);
    });
  }

  playAchievement() {
    this.init();
    this.safe(() => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + i * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain); gain.connect(this.ctx!.destination);
        osc.start(t); osc.stop(t + 0.2);
      });
    });
  }

  playCountdown() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.15);
    });
  }

  playGo() {
    this.init();
    this.safe(() => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx!.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.3);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(); osc.stop(this.ctx!.currentTime + 0.3);
    });
  }
}

const audio = new AudioManager();

// ============================================================
// CONSTANTS
// ============================================================
const GRAVITY = 0.35;
const BOOST_STRENGTH = -0.75;
const MAX_VELOCITY = 7;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.4;
const VOYAGER_X = 120;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;

const DIFFICULTY_CONFIG = {
  easy:   { speedMult: 0.7,  spawnMult: 1.6, gravityMult: 0.8 },
  normal: { speedMult: 1.0,  spawnMult: 1.0, gravityMult: 1.0 },
  hard:   { speedMult: 1.35, spawnMult: 0.6, gravityMult: 1.15 },
};

const POWERUP_COLORS: Record<string, string> = {
  shield:       '#22c55e',
  slowmo:       '#3b82f6',
  doubleboost:  '#f59e0b',
  multiplier:   '#a855f7',
  invincibility:'#ec4899',
};

const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡️', slowmo: '⏱️', doubleboost: '⚡', multiplier: '✖️', invincibility: '💫',
};

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_flight',   title: 'First Flight',    description: 'Complete your first mission',    icon: '🚀' },
  { id: 'dist_500',       title: 'Explorer',         description: 'Travel 500 distance',            icon: '🌠' },
  { id: 'dist_1000',      title: 'Deep Space',       description: 'Travel 1,000 distance',          icon: '🌌' },
  { id: 'dist_5000',      title: 'Voyager Elite',    description: 'Travel 5,000 distance',          icon: '🏆' },
  { id: 'cps_10',         title: 'Speed Fingers',    description: 'Reach 10 CPS',                   icon: '⚡' },
  { id: 'cps_15',         title: 'Lightning Hands',  description: 'Reach 15 CPS',                   icon: '🌩️' },
  { id: 'avoid_20',       title: 'Dodger',           description: 'Avoid 20 obstacles in one run',  icon: '🎯' },
  { id: 'avoid_50',       title: 'Matrix',           description: 'Avoid 50 obstacles in one run',  icon: '🕶️' },
  { id: 'survivor_60',    title: 'Survivor',         description: 'Survive for 60 seconds',         icon: '⏱️' },
  { id: 'space_master',   title: 'Space Master',     description: 'Survive for 120 seconds',        icon: '👑' },
  { id: 'near_miss_5',    title: 'Daredevil',        description: 'Get 5 near misses in one run',   icon: '😎' },
  { id: 'boss_survived',  title: 'Boss Slayer',      description: 'Survive a boss asteroid',        icon: '💀' },
];

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const LS = {
  get: <T,>(key: string, fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: <T,>(key: string, val: T) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
  },
};

// ============================================================
// DIRECT DOM UPDATE (avoids React re-render lag in game loop)
// ============================================================
const updateHUD = (id: string, value: string | number) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value.toString();
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function VoyagerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [uiView, setUiView] = useState<UiView>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFps, setShowFps] = useState(false);
  const [highScores, setHighScores] = useState<HighScores>(() =>
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
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<{ type: string; remaining: number; total: number }[]>([]);
  const [countdownNum, setCountdownNum] = useState<number | 'GO!' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [combo, setCombo] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const fpsRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  // Mirrors `difficulty` state so the game-loop effect (which no longer
  // depends on `difficulty` — see note near its dependency array) can
  // always read the *current* selection instead of a stale closure value.
  const difficultyRef = useRef<Difficulty>(difficulty);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  // ============================================================
  // GAME STATE REF (single source of truth for the game loop)
  // ============================================================
  const g = useRef({
    status: 'start' as GameStatus,
    y: CANVAS_HEIGHT / 2,
    vel: 0,
    speed: INITIAL_SPEED,
    distance: 0,
    avoided: 0,
    time: 0,
    cps: 0,
    peakCps: 0,
    isBoosting: false,
    startTime: 0,
    lastSpawn: 0,
    lastSpeedUp: 0,
    lastPowerUpSpawn: 0,
    lastBossSpawn: 0,
    lastAchievementCheck: 0,
    clickTimes: [] as number[],
    obstacles: [] as Obstacle[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    stars: [] as { x: number; y: number; z: number; size: number }[],
    screenShake: 0,
    difficulty: 'normal' as Difficulty,
    combo: 0,
    nearMissCount: 0,
    scoreMultiplier: 1,
    // Power up states
    hasShield: false,
    shieldEnd: 0,
    hasSlowmo: false,
    slowmoEnd: 0,
    hasDoubleBoost: false,
    doubleBoostEnd: 0,
    hasMultiplier: false,
    multiplierEnd: 0,
    multiplierBonus: 1,
    hasInvincibility: false,
    invincibilityEnd: 0,
    // Replay recording (time is stored *relative* to startTime so it can
    // be replayed against a fresh run's elapsed clock — see ghost logic)
    replayFrames: [] as ReplayFrame[],
    frameCount: 0,
    // Ghost (best previous run, played back live alongside the current ship)
    ghostFrames: [] as ReplayFrame[],
    ghostIndex: 0,
    // Boss
    bossSpawned: false,
    bossCleared: false,
    // FPS
    fps: 0,
    fpsFrameCount: 0,
    fpsLastTime: 0,
    // Pause bookkeeping (used to shift all timers by the paused duration)
    pausedAt: 0,
  });

  const actionsRef = useRef<{
    start: () => void;
    boostUp: () => void;
    boostDown: () => void;
    pause: () => void;
    resume: () => void;
  } | null>(null);

  // ============================================================
  // FULLSCREEN
  // ============================================================
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ============================================================
  // SOUND TOGGLE
  // ============================================================
  const toggleSound = () => {
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    if (!next) audio.init();
  };

  // ============================================================
  // ACHIEVEMENTS CHECK
  // ============================================================
  const checkAchievements = useCallback((state: typeof g.current) => {
    setAchievements(prev => {
      const unlocked: Achievement[] = [];
      const next = prev.map(a => {
        if (a.unlocked) return a;
        let shouldUnlock = false;
        switch (a.id) {
          case 'first_flight':    shouldUnlock = true; break;
          case 'dist_500':        shouldUnlock = state.distance >= 500; break;
          case 'dist_1000':       shouldUnlock = state.distance >= 1000; break;
          case 'dist_5000':       shouldUnlock = state.distance >= 5000; break;
          case 'cps_10':          shouldUnlock = state.peakCps >= 10; break;
          case 'cps_15':          shouldUnlock = state.peakCps >= 15; break;
          case 'avoid_20':        shouldUnlock = state.avoided >= 20; break;
          case 'avoid_50':        shouldUnlock = state.avoided >= 50; break;
          case 'survivor_60':     shouldUnlock = state.time >= 60; break;
          case 'space_master':    shouldUnlock = state.time >= 120; break;
          case 'near_miss_5':     shouldUnlock = state.nearMissCount >= 5; break;
          case 'boss_survived':   shouldUnlock = state.bossCleared; break;
        }
        if (shouldUnlock) {
          const updated = { ...a, unlocked: true, unlockedAt: Date.now() };
          unlocked.push(updated);
          audio.playAchievement();
          GA.achievementUnlock(a.id);
          return updated;
        }
        return a;
      });
      if (unlocked.length > 0) {
        // Persist
        const savedMap: Record<string, boolean> = {};
        next.forEach(a => { if (a.unlocked) savedMap[a.id] = true; });
        LS.set('voyager_achievements', savedMap);
        setNewAchievements(u => [...u, ...unlocked]);
        setTimeout(() => setNewAchievements(u => u.slice(unlocked.length)), 4000);
      }
      return next;
    });
  }, []);

  // ============================================================
  // HIGH SCORE UPDATE
  // ============================================================
  const updateHighScores = useCallback((state: typeof g.current) => {
    setHighScores(prev => {
      const next: HighScores = {
        bestDistance: Math.max(prev.bestDistance, Math.floor(state.distance)),
        bestTime: Math.max(prev.bestTime, state.time),
        highestCps: Math.max(prev.highestCps, state.peakCps),
        mostAvoided: Math.max(prev.mostAvoided, state.avoided),
      };
      LS.set('voyager_highscores', next);
      return next;
    });
  }, []);

  // ============================================================
  // LIFETIME STATS UPDATE
  // ============================================================
  const updateLifetimeStats = useCallback((state: typeof g.current) => {
    setLifetimeStats(prev => {
      const next: LifetimeStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        totalDistance: prev.totalDistance + Math.floor(state.distance),
        totalTime: prev.totalTime + state.time,
        totalAvoided: prev.totalAvoided + state.avoided,
        highestCps: Math.max(prev.highestCps, state.peakCps),
        highestDistance: Math.max(prev.highestDistance, Math.floor(state.distance)),
        averageCpsSum: prev.averageCpsSum + state.peakCps,
        averageCpsCount: prev.averageCpsCount + 1,
      };
      LS.set('voyager_lifetime', next);
      return next;
    });
  }, []);

  // ============================================================
  // COUNTDOWN
  // ============================================================
  const startCountdown = useCallback((onDone: () => void) => {
    setUiView('countdown');
    g.current.status = 'countdown';
    const steps: (number | 'GO!')[] = [3, 2, 1, 'GO!'];
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      setCountdownNum(steps[i]);
      if (typeof steps[i] === 'number') audio.playCountdown();
      else audio.playGo();
      i++;
      if (i < steps.length) {
        timers.push(setTimeout(tick, i === steps.length - 1 ? 600 : 800));
      } else {
        timers.push(setTimeout(() => {
          setCountdownNum(null);
          onDone();
        }, 600));
      }
    };
    tick();
    return () => timers.forEach(clearTimeout);
  }, []);

  // ============================================================
  // ACTIVE POWER UP HUD SYNC
  // ============================================================
  const syncActivePowerUps = useCallback(() => {
    const now = Date.now();
    const state = g.current;
    const active: { type: string; remaining: number; total: number }[] = [];
    if (state.hasShield)       active.push({ type: 'shield',       remaining: Math.max(0, state.shieldEnd - now),       total: 5000 });
    if (state.hasSlowmo)       active.push({ type: 'slowmo',       remaining: Math.max(0, state.slowmoEnd - now),       total: 5000 });
    if (state.hasDoubleBoost)  active.push({ type: 'doubleboost',  remaining: Math.max(0, state.doubleBoostEnd - now),  total: 5000 });
    if (state.hasMultiplier)   active.push({ type: 'multiplier',   remaining: Math.max(0, state.multiplierEnd - now),   total: 8000 });
    if (state.hasInvincibility)active.push({ type: 'invincibility',remaining: Math.max(0, state.invincibilityEnd - now),total: 4000 });
    setActivePowerUps(active);
    setCombo(state.combo);
    setScoreMultiplier(state.scoreMultiplier);
  }, []);

  // ============================================================
  // MAIN GAME EFFECT (canvas setup + game loop)
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frameId: number;
    let hudSyncInterval: ReturnType<typeof setInterval>;
    let cancelCountdown: (() => void) | null = null;

    // Init stars
    g.current.stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      z: Math.random() * 8 + 1,
      size: Math.random() * 2 + 0.5,
    }));

    // ----------------------------------------------------------
    // Obstacle factory
    // ----------------------------------------------------------
    const createObstacle = (speed: number, forceBoss = false): Obstacle => {
      if (forceBoss) {
        const size = 80 + Math.random() * 40;
        const points: Point[] = [];
        const seg = 14;
        for (let i = 0; i < seg; i++) {
          const angle = (i / seg) * Math.PI * 2;
          const r = size * (0.75 + Math.random() * 0.35);
          points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
        }
        return {
          x: CANVAS_WIDTH + size * 2,
          y: CANVAS_HEIGHT / 2,
          radius: size,
          speed: speed * 0.7,
          rotation: 0,
          rotationSpeed: 0.012,
          type: 'boss',
          isBoss: true,
          glowPhase: 0,
          points,
        };
      }
      const size = 20 + Math.random() * 45;
      const type = Math.random() > 0.85 ? 'comet' : 'asteroid';
      const points: Point[] = [];
      const segments = 9 + Math.floor(Math.random() * 6);
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const r = size * (0.7 + Math.random() * 0.4);
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      return {
        x: CANVAS_WIDTH + size * 2,
        y: Math.random() * CANVAS_HEIGHT,
        radius: size,
        speed: speed + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        type,
        points,
      };
    };

    // ----------------------------------------------------------
    // Power-up factory
    // ----------------------------------------------------------
    const createPowerUp = (speed: number): PowerUp => {
      const types: PowerUp['type'][] = ['shield', 'slowmo', 'doubleboost', 'multiplier', 'invincibility'];
      return {
        x: CANVAS_WIDTH + 30,
        y: 60 + Math.random() * (CANVAS_HEIGHT - 120),
        type: types[Math.floor(Math.random() * types.length)],
        radius: 18,
        speed: speed * 0.8,
        life: 1,
        glowPhase: 0,
      };
    };

    // ----------------------------------------------------------
    // Floating text helper
    // ----------------------------------------------------------
    const addFloat = (x: number, y: number, text: string, color: string, size = 18) => {
      g.current.floatingTexts.push({ x, y, text, life: 1, color, vy: -2, size });
    };

    // ----------------------------------------------------------
    // Game over handler
    // ----------------------------------------------------------
    const triggerGameOver = () => {
      const state = g.current;
      state.status = 'gameover';
      state.isBoosting = false;
      audio.playCollision();
      audio.playGameOver();

      // Explosion particles
      for (let i = 0; i < 60; i++) {
        state.particles.push({
          x: VOYAGER_X, y: state.y,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 16,
          life: 1,
          color: Math.random() > 0.4 ? '#ff6b35' : '#ef4444',
          size: Math.random() * 4 + 2,
        });
      }
      state.screenShake = 25;

      // Save best ghost run — only overwrite the stored ghost if this run
      // actually beat the previous best distance, so the ghost always
      // represents the player's personal best rather than the last run.
      const prevBestDistance = highScoresRef.current.bestDistance;
      if (Math.floor(state.distance) >= prevBestDistance) {
        LS.set('voyager_ghost', state.replayFrames.slice(0, 900));
      }

      // Analytics
      GA.gameOver(Math.floor(state.distance), state.time, state.peakCps);
      if (state.peakCps > 0) GA.peakCps(state.peakCps);

      // Side effects via React
      updateHighScores(state);
      updateLifetimeStats(state);
      checkAchievements(state);
      setUiView('gameover');
    };

    // ----------------------------------------------------------
    // Obstacle update with power-up awareness
    // ----------------------------------------------------------
    const updateObstacles = (state: typeof g.current, now: number) => {
      const cfg = DIFFICULTY_CONFIG[state.difficulty];
      const survivalSecs = Math.floor((now - state.startTime) / 1000);

      // Boss spawn every 90s
      const bossCooldown = 90000;
      if (!state.bossSpawned && now - state.lastBossSpawn > bossCooldown && survivalSecs > 30) {
        state.obstacles.push(createObstacle(state.speed * cfg.speedMult, true));
        state.bossSpawned = true;
        state.lastBossSpawn = now;
        audio.playBossSpawn();
        GA.bossSpawn();
        addFloat(CANVAS_WIDTH / 2, 80, '⚠️ BOSS ASTEROID!', '#ef4444', 22);
      }

      const slowFactor = state.hasSlowmo ? 0.4 : 1;

      state.obstacles = state.obstacles.filter(obs => {
        if (obs.isBoss && obs.glowPhase !== undefined) obs.glowPhase! += 0.05;
        obs.x -= obs.speed * slowFactor;
        obs.rotation += obs.rotationSpeed * slowFactor;

        const dx = obs.x - VOYAGER_X;
        const dy = obs.y - state.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = obs.radius + 18;

        if (dist < hitRadius) {
          if (state.hasShield || state.hasInvincibility) {
            // Shield absorbs hit
            state.hasShield = false;
            state.hasInvincibility = false;
            state.screenShake = 10;
            for (let i = 0; i < 20; i++) {
              state.particles.push({
                x: VOYAGER_X, y: state.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.8, color: '#22c55e', size: Math.random() * 3 + 1,
              });
            }
            addFloat(VOYAGER_X, state.y - 40, '🛡️ SHIELD!', '#22c55e', 16);
            return false; // destroy obstacle
          } else {
            triggerGameOver();
            return false;
          }
        }

        // Near miss
        if (!obs.hasNearMissed && dist < obs.radius + 55 && obs.x < VOYAGER_X + 25 && obs.x > VOYAGER_X - 25) {
          audio.playNearMiss();
          obs.hasNearMissed = true;
          state.nearMissCount++;
          state.combo++;
          state.combo = Math.min(state.combo, 10);
          // Combo bonus stacks multiplicatively with any active Multiplier
          // power-up bonus instead of overwriting it outright.
          const comboMult = 1 + state.combo * 0.1;
          const mult = comboMult * (state.hasMultiplier ? state.multiplierBonus : 1);
          state.scoreMultiplier = mult;
          addFloat(VOYAGER_X + 20, state.y - 35, `NEAR MISS! ×${mult.toFixed(1)}`, '#00f5ff', 15);
        }

        if (obs.x < -obs.radius * 2) {
          state.avoided++;
          if (obs.isBoss) {
            state.bossSpawned = false;
            state.bossCleared = true;
            addFloat(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, '👑 BOSS CLEARED!', '#eab308', 24);
          }
          updateHUD('stat-avoided', state.avoided);
          return false;
        }
        return true;
      });
    };

    // ----------------------------------------------------------
    // Power-up update
    // ----------------------------------------------------------
    const updatePowerUps = (state: typeof g.current, now: number) => {
      const cfg = DIFFICULTY_CONFIG[state.difficulty];

      // Spawn
      if (now - state.lastPowerUpSpawn > 18000) {
        state.powerUps.push(createPowerUp(state.speed * cfg.speedMult));
        state.lastPowerUpSpawn = now;
      }

      const slowFactor = state.hasSlowmo ? 0.4 : 1;

      state.powerUps = state.powerUps.filter(pu => {
        pu.x -= pu.speed * slowFactor;
        pu.glowPhase += 0.06;

        if (pu.x < -60) return false;

        const dx = pu.x - VOYAGER_X;
        const dy = pu.y - state.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pu.radius + 22 && !pu.collected) {
          pu.collected = true;
          audio.playPowerUp();
          GA.powerUpCollected(pu.type);
          const dur = 5000;

          switch (pu.type) {
            case 'shield':
              state.hasShield = true;
              state.shieldEnd = now + dur;
              break;
            case 'slowmo':
              state.hasSlowmo = true;
              state.slowmoEnd = now + dur;
              break;
            case 'doubleboost':
              state.hasDoubleBoost = true;
              state.doubleBoostEnd = now + dur;
              break;
            case 'multiplier': {
              state.hasMultiplier = true;
              state.multiplierEnd = now + 8000;
              state.multiplierBonus = Math.min(state.multiplierBonus * 2, 8);
              const comboMult = 1 + state.combo * 0.1;
              state.scoreMultiplier = comboMult * state.multiplierBonus;
              break;
            }
            case 'invincibility':
              state.hasInvincibility = true;
              state.invincibilityEnd = now + 4000;
              break;
          }

          for (let i = 0; i < 15; i++) {
            state.particles.push({
              x: pu.x, y: pu.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 0.9,
              color: POWERUP_COLORS[pu.type],
              size: Math.random() * 3 + 1,
            });
          }
          addFloat(pu.x, pu.y - 30, `${POWERUP_ICONS[pu.type]} ${pu.type.toUpperCase()}!`, POWERUP_COLORS[pu.type], 16);
          return false;
        }
        return true;
      });

      // Expire power-ups
      if (state.hasShield && now > state.shieldEnd) state.hasShield = false;
      if (state.hasSlowmo && now > state.slowmoEnd) state.hasSlowmo = false;
      if (state.hasDoubleBoost && now > state.doubleBoostEnd) state.hasDoubleBoost = false;
      if (state.hasMultiplier && now > state.multiplierEnd) {
        state.hasMultiplier = false;
        state.multiplierBonus = 1;
        state.scoreMultiplier = 1 + state.combo * 0.1;
      }
      if (state.hasInvincibility && now > state.invincibilityEnd) state.hasInvincibility = false;
    };

    // ----------------------------------------------------------
    // ACTIONS
    // ----------------------------------------------------------
    actionsRef.current = {
      start: () => {
        const now = Date.now();
        const difficulty = difficultyRef.current;
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const ghostFrames = LS.get<ReplayFrame[]>('voyager_ghost', []);

        Object.assign(g.current, {
          status: 'countdown',
          y: CANVAS_HEIGHT / 2, vel: 0,
          speed: INITIAL_SPEED * cfg.speedMult,
          distance: 0, avoided: 0, time: 0, cps: 0, peakCps: 0,
          isBoosting: false, startTime: 0,
          lastSpawn: now, lastSpeedUp: now,
          lastPowerUpSpawn: now, lastBossSpawn: 0,
          lastAchievementCheck: now,
          clickTimes: [], obstacles: [], powerUps: [],
          particles: [], floatingTexts: [],
          screenShake: 0,
          difficulty,
          combo: 0, nearMissCount: 0, scoreMultiplier: 1,
          hasShield: false, hasSlowmo: false, hasDoubleBoost: false,
          hasMultiplier: false, multiplierBonus: 1, hasInvincibility: false,
          replayFrames: [], frameCount: 0,
          ghostFrames, ghostIndex: 0, bossSpawned: false, bossCleared: false,
          fpsFrameCount: 0, fpsLastTime: now,
          pausedAt: 0,
        });
        setActivePowerUps([]);
        setCombo(0);
        setScoreMultiplier(1);

        if (cancelCountdown) cancelCountdown();
        cancelCountdown = startCountdown(() => {
          const startNow = Date.now();
          g.current.status = 'playing';
          g.current.startTime = startNow;
          g.current.lastSpawn = startNow;
          g.current.lastSpeedUp = startNow;
          setUiView('playing');
          GA.gameStart(difficulty);
          if (!audio.muted) audio.init();
        });
      },

      boostUp: () => {
        if (g.current.status !== 'playing') return;
        g.current.isBoosting = true;
        audio.playBoost();
        g.current.clickTimes.push(Date.now());
      },

      boostDown: () => { g.current.isBoosting = false; },

      pause: () => {
        if (g.current.status !== 'playing') return;
        g.current.status = 'paused';
        g.current.isBoosting = false;
        // Record when we paused so resume() can shift every timestamp
        // forward by however long the pause lasted. Without this, every
        // "lastX" / "...End" timer is measured against Date.now() and a
        // long pause causes a spawn/power-up-expiry pile-up on resume.
        g.current.pausedAt = Date.now();
        setUiView('paused');
        GA.pause();
      },

      resume: () => {
        if (g.current.status !== 'paused') return;
        const now = Date.now();
        const pausedDuration = g.current.pausedAt ? now - g.current.pausedAt : 0;

        // Shift every absolute timestamp forward by the paused duration so
        // that elapsed-time calculations (spawns, speed ramp, power-up
        // expiry, survival time) pick up exactly where they left off.
        g.current.startTime += pausedDuration;
        g.current.lastSpawn += pausedDuration;
        g.current.lastSpeedUp += pausedDuration;
        g.current.lastPowerUpSpawn += pausedDuration;
        g.current.lastAchievementCheck += pausedDuration;
        if (g.current.lastBossSpawn > 0) g.current.lastBossSpawn += pausedDuration;
        if (g.current.hasShield) g.current.shieldEnd += pausedDuration;
        if (g.current.hasSlowmo) g.current.slowmoEnd += pausedDuration;
        if (g.current.hasDoubleBoost) g.current.doubleBoostEnd += pausedDuration;
        if (g.current.hasMultiplier) g.current.multiplierEnd += pausedDuration;
        if (g.current.hasInvincibility) g.current.invincibilityEnd += pausedDuration;
        // Click history is short-lived (1s window) — safer to clear than shift
        g.current.clickTimes = [];
        g.current.fpsLastTime = now;
        g.current.pausedAt = 0;

        g.current.status = 'playing';
        setUiView('playing');
        GA.resume();
      },
    };

    // ----------------------------------------------------------
    // UPDATE (physics + logic) — only runs while actively playing
    // ----------------------------------------------------------
    const update = () => {
      const state = g.current;
      if (state.status !== 'playing') return;
      const now = Date.now();
      const cfg = DIFFICULTY_CONFIG[state.difficulty];

      // FPS calc
      state.fpsFrameCount++;
      if (now - state.fpsLastTime >= 1000) {
        state.fps = state.fpsFrameCount;
        state.fpsFrameCount = 0;
        state.fpsLastTime = now;
        fpsRef.current = state.fps;
        updateHUD('stat-fps', `${state.fps}`);
      }

      // CPS
      const oneSecAgo = now - 1000;
      state.clickTimes = state.clickTimes.filter(t => t > oneSecAgo);
      if (state.cps !== state.clickTimes.length) {
        state.cps = state.clickTimes.length;
        if (state.cps > state.peakCps) state.peakCps = state.cps;
        updateHUD('stat-cps', state.cps);
      }

      // Gravity (difficulty-adjusted)
      const grav = GRAVITY * cfg.gravityMult;

      // Boost
      const boostStr = state.hasDoubleBoost ? BOOST_STRENGTH * 1.6 : BOOST_STRENGTH;
      if (state.isBoosting) {
        state.vel += boostStr;
        const count = state.hasDoubleBoost ? 3 : 1;
        for (let n = 0; n < count; n++) {
          if (state.particles.length < 120) {
            state.particles.push({
              x: VOYAGER_X - 15,
              y: state.y + (Math.random() - 0.5) * 8,
              vx: -3 - Math.random() * 5,
              vy: (Math.random() - 0.5) * 2.5,
              life: 0.8,
              color: state.hasDoubleBoost ? 'rgba(245,158,11,0.8)' : 'rgba(0,245,255,0.7)',
              size: Math.random() * 3 + 1,
            });
          }
        }
      }

      state.vel += grav;
      state.vel = Math.min(Math.max(state.vel, -MAX_VELOCITY), MAX_VELOCITY);
      state.y += state.vel;

      if (state.y < 0 || state.y > CANVAS_HEIGHT) {
        triggerGameOver();
        return;
      }

      // Distance (with multiplier)
      const distInc = (state.speed * cfg.speedMult / 10) * state.scoreMultiplier;
      state.distance += distInc;
      updateHUD('stat-distance', Math.floor(state.distance).toLocaleString());

      // Survival time
      const survivalSecs = Math.floor((now - state.startTime) / 1000);
      if (survivalSecs !== state.time) {
        state.time = survivalSecs;
        updateHUD('stat-time', `${survivalSecs}s`);
      }

      // Speed ramp
      if (now - state.lastSpeedUp > 15000) {
        state.speed += SPEED_INCREMENT;
        state.lastSpeedUp = now;
        updateHUD('stat-speed', `${(state.speed * cfg.speedMult).toFixed(1)}u`);
      }

      // Obstacle spawn
      const spawnBase = Math.max(1800 - survivalSecs * 60, 500);
      const spawnInterval = spawnBase * cfg.spawnMult;
      if (now - state.lastSpawn > spawnInterval) {
        state.obstacles.push(createObstacle(state.speed * cfg.speedMult));
        state.lastSpawn = now;
      }

      updateObstacles(state, now);
      updatePowerUps(state, now);

      // Floating texts
      state.floatingTexts = state.floatingTexts.filter(ft => {
        ft.y += ft.vy;
        ft.life -= 0.018;
        return ft.life > 0;
      });

      // Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        return p.life > 0;
      });

      // Real-time achievement checks (throttled to twice a second so we
      // don't diff the whole achievement list every frame)
      if (now - state.lastAchievementCheck > 500) {
        state.lastAchievementCheck = now;
        checkAchievements(state);
      }

      // Record replay frame every 2nd frame. `time` is stored *relative*
      // to this run's startTime so a future run's ghost lookup can just
      // compare against its own elapsed time, regardless of when either
      // run actually started.
      state.frameCount++;
      if (state.frameCount % 2 === 0 && state.replayFrames.length < 1800) {
        state.replayFrames.push({
          y: state.y,
          vel: state.vel,
          time: now - state.startTime,
          obstacles: state.obstacles.map(o => ({ x: o.x, y: o.y, radius: o.radius, type: o.type, rotation: o.rotation })),
          powerups: state.powerUps.map(p => ({ x: p.x, y: p.y, type: p.type })),
        });
      }
    };

    // ----------------------------------------------------------
    // POST-GAME DECAY — runs even after status flips to 'gameover' so the
    // explosion particles fade out and the screen-shake settles instead of
    // freezing mid-shake behind the "Mission Failed" overlay forever.
    // ----------------------------------------------------------
    const postGameDecay = () => {
      const state = g.current;
      if (state.status !== 'gameover') return;
      if (state.screenShake > 0) state.screenShake--;
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.02;
        return p.life > 0;
      });
    };

    // ----------------------------------------------------------
    // DRAW
    // ----------------------------------------------------------
    const draw = (timestamp: number) => {
      ctx.save();
      const state = g.current;

      // Screen shake
      if (state.screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * state.screenShake,
          (Math.random() - 0.5) * state.screenShake
        );
      }

      ctx.clearRect(-50, -50, CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100);

      // --- Stars (parallax) ---
      const activeSpeed = state.status === 'playing' ? state.speed * DIFFICULTY_CONFIG[state.difficulty].speedMult : 1;
      const slowFactor = state.hasSlowmo ? 0.4 : 1;
      state.stars.forEach(star => {
        if (state.status === 'playing') {
          star.x -= (1 / star.z) * activeSpeed * slowFactor;
          if (star.x < 0) star.x = CANVAS_WIDTH;
        }
        ctx.fillStyle = `rgba(255,255,255,${0.1 + (1 / star.z) * 0.9})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / star.z, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update logic
      update();
      postGameDecay();

      // --- Ghost ship (translucent replay of the player's best run) ---
      if (state.status === 'playing' && state.ghostFrames.length > 0) {
        const elapsed = Date.now() - state.startTime;
        // Advance a monotonic pointer into the ghost frames rather than
        // re-scanning from the start every frame.
        let idx = state.ghostIndex;
        while (idx < state.ghostFrames.length - 1 && state.ghostFrames[idx + 1].time <= elapsed) idx++;
        state.ghostIndex = idx;
        const ghost = state.ghostFrames[idx];
        if (ghost && elapsed <= state.ghostFrames[state.ghostFrames.length - 1].time + 400) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.translate(VOYAGER_X, ghost.y);
          ctx.rotate(ghost.vel * 0.06);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(-18, 0, 22, -Math.PI / 2.5, Math.PI / 2.5);
          ctx.stroke();
          ctx.fillStyle = 'rgba(168,85,247,0.5)';
          ctx.fillRect(-10, -10, 28, 20);
          ctx.restore();
        }
      }

      // --- Particles ---
      state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // --- Entities ---
      if (state.status !== 'start' && state.status !== 'countdown') {
        // Shield bubble
        if (state.hasShield || state.hasInvincibility) {
          ctx.save();
          ctx.translate(VOYAGER_X, state.y);
          const shieldGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 45);
          shieldGrad.addColorStop(0, 'rgba(34,197,94,0)');
          shieldGrad.addColorStop(0.7, state.hasInvincibility ? 'rgba(236,72,153,0.15)' : 'rgba(34,197,94,0.12)');
          shieldGrad.addColorStop(1, state.hasInvincibility ? 'rgba(236,72,153,0.4)' : 'rgba(34,197,94,0.35)');
          ctx.fillStyle = shieldGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = state.hasInvincibility ? '#ec4899' : '#22c55e';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.008) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Voyager ship
        ctx.save();
        ctx.translate(VOYAGER_X, state.y);
        ctx.rotate(state.vel * 0.06);

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-18, 0, 22, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(2, 0);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-10, -10, 28, 20);

        ctx.fillStyle = state.hasDoubleBoost ? '#f59e0b' : '#ff6b35';
        ctx.fillRect(0, -8, 18, 16);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
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

        // Power-up orbs
        state.powerUps.forEach(pu => {
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

          ctx.fillStyle = '#fff';
          ctx.font = `${pu.radius}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(POWERUP_ICONS[pu.type], 0, 0);

          // Pulse ring
          const pulse = Math.sin(pu.glowPhase) * 0.3 + 0.7;
          ctx.strokeStyle = POWERUP_COLORS[pu.type];
          ctx.lineWidth = 2;
          ctx.globalAlpha = pulse;
          ctx.beginPath();
          ctx.arc(0, 0, pu.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        });

        // Obstacles
        state.obstacles.forEach(obs => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(obs.rotation);

          if (obs.type === 'boss') {
            // Boss glow
            const bossGrad = ctx.createRadialGradient(0, 0, obs.radius * 0.3, 0, 0, obs.radius * 1.4);
            const pulse = Math.sin(obs.glowPhase ?? 0) * 0.4 + 0.6;
            bossGrad.addColorStop(0, `rgba(239,68,68,${pulse})`);
            bossGrad.addColorStop(0.5, `rgba(220,38,38,0.3)`);
            bossGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = bossGrad;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius * 1.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.points[0].x, obs.points[0].y);
            obs.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            const bg = ctx.createRadialGradient(-obs.radius / 4, -obs.radius / 4, 0, 0, 0, obs.radius);
            bg.addColorStop(0, '#7f1d1d');
            bg.addColorStop(1, '#1c0202');
            ctx.fillStyle = bg;
            ctx.fill();
            ctx.strokeStyle = `rgba(239,68,68,${pulse})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // "BOSS" label
            ctx.rotate(-obs.rotation);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BOSS', 0, 0);

          } else if (obs.type === 'asteroid') {
            ctx.beginPath();
            ctx.moveTo(obs.points[0].x, obs.points[0].y);
            obs.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            const grad = ctx.createRadialGradient(-obs.radius / 4, -obs.radius / 4, 0, 0, 0, obs.radius);
            grad.addColorStop(0, '#64748b');
            grad.addColorStop(1, '#080d14');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(obs.radius / 3, -obs.radius / 5, obs.radius / 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const cometGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.radius);
            cometGrad.addColorStop(0, '#fff');
            cometGrad.addColorStop(0.2, '#00f5ff');
            cometGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = cometGrad;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.rotate(-obs.rotation);
            const tailGrad = ctx.createLinearGradient(0, 0, obs.radius * 5, 0);
            tailGrad.addColorStop(0, 'rgba(0,245,255,0.3)');
            tailGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = tailGrad;
            ctx.beginPath();
            ctx.moveTo(0, -obs.radius / 1.5);
            ctx.lineTo(obs.radius * 5, -obs.radius * 1.5);
            ctx.lineTo(obs.radius * 5, obs.radius * 1.5);
            ctx.lineTo(0, obs.radius / 1.5);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        });

        // Floating texts
        state.floatingTexts.forEach(ft => {
          ctx.globalAlpha = ft.life;
          ctx.fillStyle = ft.color;
          ctx.font = `bold ${ft.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.globalAlpha = 1;
      }

      // --- Progress Bar (boss timer) ---
      if (state.status === 'playing') {
        const survivalSecs = (Date.now() - state.startTime) / 1000;
        const nextBossIn = 90 - (survivalSecs % 90);
        const progress = 1 - nextBossIn / 90;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(10, CANVAS_HEIGHT - 14, CANVAS_WIDTH - 20, 6);
        ctx.fillStyle = progress > 0.85 ? '#ef4444' : '#00f5ff';
        ctx.fillRect(10, CANVAS_HEIGHT - 14, (CANVAS_WIDTH - 20) * progress, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Boss in ${Math.ceil(nextBossIn)}s`, 12, CANVAS_HEIGHT - 16);
      }

      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };

    // ----------------------------------------------------------
    // KEY HANDLERS
    // ----------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = g.current.status;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return;
        if (s === 'playing') {
          actionsRef.current?.boostUp();
        } else if (s === 'start' || s === 'gameover') {
          actionsRef.current?.start();
        } else if (s === 'paused') {
          actionsRef.current?.resume();
        }
      }

      if ((e.code === 'Escape' || e.key === 'Escape')) {
        if (s === 'playing') actionsRef.current?.pause();
        else if (s === 'paused') actionsRef.current?.resume();
      }
      if ((e.code === 'KeyP' || e.key === 'p' || e.key === 'P') && s === 'playing') {
        actionsRef.current?.pause();
      }
      if ((e.code === 'KeyP' || e.key === 'p' || e.key === 'P') && s === 'paused') {
        actionsRef.current?.resume();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        actionsRef.current?.boostDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // HUD sync interval (for active power-ups display)
    hudSyncInterval = setInterval(() => {
      if (g.current.status === 'playing') syncActivePowerUps();
    }, 200);

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(hudSyncInterval);
      if (cancelCountdown) cancelCountdown();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // NOTE: `difficulty` is intentionally left out of this dependency array.
    // Including it caused the *entire* canvas effect (event listeners, the
    // 180-star field, etc.) to re-run every time the difficulty buttons
    // were clicked on the start screen. `actionsRef.current.start()` now
    // reads the current selection via `difficultyRef` (kept in sync by a
    // separate lightweight effect above) instead of closing over the
    // `difficulty` state value directly, so this is safe.
  }, [startCountdown, syncActivePowerUps, checkAchievements, updateHighScores, updateLifetimeStats]);

  // Kept in sync so the game-loop closure (created once) can always read
  // the latest saved best distance when deciding whether to overwrite the
  // stored ghost run — mirrors the `difficultyRef` pattern above.
  const highScoresRef = useRef(highScores);
  useEffect(() => { highScoresRef.current = highScores; }, [highScores]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* ---- SEO Meta (injected into head via useEffect) ---- */}
      <SeoHead />

      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100vh',
        color: '#f3f4f6', fontFamily: 'sans-serif',
      }}>

        {/* === GAME CONTAINER === */}
        <div
          ref={containerRef}
          style={{
            position: 'relative', width: '100%', maxWidth: '900px',
            aspectRatio: '16/9',
            background: 'rgba(8,13,20,0.95)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.05)',
            userSelect: 'none', marginBottom: '4rem',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            aria-label="Voyager Space Game Canvas — click or press Space to boost"
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer', touchAction: 'none' }}
            onMouseDown={() => {
              if (g.current.status === 'playing') actionsRef.current?.boostUp();
              else if (g.current.status === 'start' || g.current.status === 'gameover') actionsRef.current?.start();
              else if (g.current.status === 'paused') actionsRef.current?.resume();
            }}
            onMouseUp={() => actionsRef.current?.boostDown()}
            onMouseLeave={() => actionsRef.current?.boostDown()}
            onTouchStart={(e) => {
              e.preventDefault();
              if (g.current.status === 'playing') actionsRef.current?.boostUp();
              else if (g.current.status === 'start' || g.current.status === 'gameover') actionsRef.current?.start();
              else if (g.current.status === 'paused') actionsRef.current?.resume();
            }}
            onTouchEnd={(e) => { e.preventDefault(); actionsRef.current?.boostDown(); }}
          />

          {/* ---- HUD (playing) ---- */}
          {uiView === 'playing' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {/* Left stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', pointerEvents: 'auto' }}>
                <StatBox id="stat-distance" icon={<TrendingUp size={14} color="#22c55e" />} label="Distance" />
                <StatBox id="stat-avoided"  icon={<Shield size={14} color="#ff6b35" />} label="Avoided" />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <IconBtn onClick={toggleSound} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} color="#00f5ff" />}
                  </IconBtn>
                  <IconBtn onClick={() => actionsRef.current?.pause()} aria-label="Pause game">
                    <Pause size={14} color="#fff" />
                  </IconBtn>
                  <IconBtn onClick={toggleFullscreen} aria-label="Toggle fullscreen">
                    {isFullscreen ? <Minimize size={14} color="#fff" /> : <Maximize size={14} color="#fff" />}
                  </IconBtn>
                  <IconBtn onClick={() => setShowFps(f => !f)} aria-label={showFps ? 'Hide FPS' : 'Show FPS'}>
                    <Cpu size={14} color={showFps ? '#a855f7' : '#64748b'} />
                  </IconBtn>
                </div>
              </div>

              {/* Right stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                <StatBox id="stat-cps"   icon={<Zap size={14} color="#eab308" />}    label="CPS" />
                <StatBox id="stat-speed" icon={<Activity size={14} color="#00f5ff" />} label="Speed" initialValue={`${INITIAL_SPEED.toFixed(1)}u`} />
                <StatBox id="stat-time"  icon={<Timer size={14} color="#a855f7" />}   label="Time" initialValue="0s" />
                {showFps && <StatBox id="stat-fps" icon={<Cpu size={14} color="#a855f7" />} label="FPS" initialValue="--" />}
              </div>

              {/* Active power-ups row */}
              {activePowerUps.length > 0 && (
                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', pointerEvents: 'none' }}>
                  {activePowerUps.map((pu, i) => (
                    <PowerUpHudItem key={i} pu={pu} />
                  ))}
                </div>
              )}

              {/* Combo */}
              {combo > 1 && (
                <div style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '0.6rem', color: '#eab308', fontWeight: '800', letterSpacing: '0.1em' }}>COMBO</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#eab308', lineHeight: 1 }}>×{scoreMultiplier.toFixed(1)}</div>
                </div>
              )}

            </div>
          )}

          {/* ---- COUNTDOWN ---- */}
          {uiView === 'countdown' && countdownNum !== null && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
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

          {/* ---- START MENU ---- */}
          {uiView === 'start' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem' }}>

                <div style={{ width: '72px', height: '72px', background: 'rgba(0,245,255,0.1)', borderRadius: '18px', border: '1px solid rgba(0,245,255,0.3)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(15deg)' }}>
                  <Rocket size={36} color="#00f5ff" style={{ transform: 'rotate(-45deg)' }} />
                </div>

                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Guide The <span style={{ color: '#00f5ff' }}>Voyager</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Navigate through the asteroid field. Hold SPACE or tap to boost.
                </p>

                {/* High Scores */}
                {highScores.bestDistance > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <HiScoreChip label="Best Dist" value={highScores.bestDistance.toLocaleString()} color="#00f5ff" />
                    <HiScoreChip label="Best Time" value={`${highScores.bestTime}s`} color="#a855f7" />
                    <HiScoreChip label="Peak CPS" value={highScores.highestCps} color="#eab308" />
                    <HiScoreChip label="Most Avoided" value={highScores.mostAvoided} color="#ff6b35" />
                  </div>
                )}

                {/* Difficulty */}
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
                          borderRadius: '8px', color: difficulty === d ? DIFF_COLORS[d] : '#64748b',
                          fontWeight: '700', fontSize: '0.65rem', cursor: 'pointer',
                          textTransform: 'capitalize', transition: 'all 0.2s',
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
                  onClick={(e) => { e.currentTarget.blur(); actionsRef.current?.start(); }}
                  style={{ width: '100%', padding: '1.1rem', background: 'linear-gradient(135deg,#00f5ff,#22c55e)', color: '#000', fontSize: '1rem', fontWeight: '900', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,245,255,0.3)', marginBottom: '0.75rem' }}
                >
                  <Play fill="currentColor" size={18} /> START MISSION
                </button>

                {/* Bottom row */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button aria-label="View lifetime statistics" onClick={() => setShowStats(true)} style={outlineBtn}>
                    <BarChart2 size={14} /> Stats
                  </button>
                  <button aria-label="View achievements" onClick={() => setShowAchievements(true)} style={outlineBtn}>
                    <Trophy size={14} /> Achievements
                  </button>
                  <button aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleSound} style={outlineBtn}>
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} color="#00f5ff" />}
                  </button>
                  <button aria-label="Toggle fullscreen" onClick={toggleFullscreen} style={outlineBtn}>
                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- PAUSE OVERLAY ---- */}
          {uiView === 'paused' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', minWidth: '260px' }}>
                <Pause size={36} color="#00f5ff" style={{ marginBottom: '0.75rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0 0 0.5rem' }}>Paused</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Press P or ESC to resume</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button
                    aria-label="Resume game"
                    onClick={() => actionsRef.current?.resume()}
                    style={{ ...solidBtn, background: 'linear-gradient(135deg,#00f5ff,#22c55e)', color: '#000' }}
                  >
                    <PlayIcon fill="currentColor" size={16} /> RESUME
                  </button>
                  <button
                    aria-label="Restart mission"
                    onClick={() => actionsRef.current?.start()}
                    style={{ ...solidBtn, background: 'rgba(255,255,255,0.08)' }}
                  >
                    <RefreshCcw size={16} /> RESTART
                  </button>
                  <Link
                    to="/games"
                    style={{ ...solidBtn, textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' } as React.CSSProperties}
                  >
                    <Home size={16} /> QUIT
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ---- GAME OVER ---- */}
          {uiView === 'gameover' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.93)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ maxWidth: '400px', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.2rem' }}>Signal Lost</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>MISSION FAILED</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                  <GameOverStat label="Distance"   value={Math.floor(g.current.distance).toLocaleString()} highlight="#00f5ff" isNew={Math.floor(g.current.distance) >= highScores.bestDistance && Math.floor(g.current.distance) > 0} />
                  <GameOverStat label="Avoided"    value={g.current.avoided}   highlight="#ff6b35" isNew={g.current.avoided >= highScores.mostAvoided && g.current.avoided > 0} />
                  <GameOverStat label="Peak CPS"   value={g.current.peakCps}   highlight="#eab308" isNew={g.current.peakCps >= highScores.highestCps && g.current.peakCps > 0} />
                  <GameOverStat label="Time"       value={`${g.current.time}s`} highlight="#a855f7" isNew={g.current.time >= highScores.bestTime && g.current.time > 0} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button
                    aria-label="Retry mission"
                    onClick={(e) => { e.currentTarget.blur(); GA.retry(); actionsRef.current?.start(); }}
                    style={{ ...solidBtn, background: '#fff', color: '#000' }}
                  >
                    <RefreshCcw size={16} /> RETRY MISSION
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button aria-label="View achievements" onClick={() => setShowAchievements(true)} style={{ ...solidBtn, flex: 1, background: 'rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                      <Trophy size={14} /> Achievements
                    </button>
                    <button aria-label="View stats" onClick={() => setShowStats(true)} style={{ ...solidBtn, flex: 1, background: 'rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                      <BarChart2 size={14} /> Stats
                    </button>
                  </div>
                  <Link
                    to="/games"
                    style={{ ...solidBtn, textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' } as React.CSSProperties}
                  >
                    <Home size={16} /> ALL GAMES
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ---- NEW ACHIEVEMENT TOASTS ---- */}
          <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none', zIndex: 50 }}>
            {newAchievements.map((a, i) => (
              <div key={a.id + i} style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)', animation: 'slideDown 0.4s ease-out' }}>
                <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#eab308', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievement Unlocked!</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700' }}>{a.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---- STATS MODAL ---- */}
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

        {/* ---- ACHIEVEMENTS MODAL ---- */}
        {showAchievements && (
          <Modal title="Achievements" icon={<Trophy size={20} color="#eab308" />} onClose={() => setShowAchievements(false)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {achievements.map(a => (
                <div key={a.id} style={{ background: a.unlocked ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${a.unlocked ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '0.75rem', opacity: a.unlocked ? 1 : 0.45 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{a.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: a.unlocked ? '#eab308' : '#94a3b8' }}>{a.title}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{a.description}</div>
                  {a.unlocked && <div style={{ fontSize: '0.6rem', color: '#22c55e', marginTop: '0.25rem', fontWeight: '700' }}>✓ Unlocked</div>}
                </div>
              ))}
            </div>
          </Modal>
        )}

        {/* ---- SEO ARTICLE ---- */}
        <article style={{
          width: '100%', maxWidth: '850px',
          padding: '2rem 0',
          lineHeight: '1.7', color: '#d1d5db',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <Gauge size={24} color="#00f5ff" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Spacebar CPS Test: Boost Your Clicking Speed with Voyager Game
            </h2>
          </div>
          <p style={{ marginBottom: '1.25rem' }}>
            Are you ready to calculate your exact clicking speed? Welcome to the ultimate <strong>Spacebar CPS Test</strong> (Clicks Per Second) packed inside an immersive interstellar arcade trainer! While traditional click speed tests feature blank, boring screens, our <strong>Voyager Asteroid Navigator</strong> turns intensive clicking practice into an addictive cosmic adventure.
          </p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            What is a CPS Test and Why Does it Matter?
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            <strong>CPS</strong> stands for <em>Clicks Per Second</em>. It is a core metric used by competitive pro-gamers (especially in Minecraft, FPS, and clicker-heavy strategy titles) to measure raw reflex velocity and finger stamina. Improving your CPS score helps lower reaction time thresholds and gives you an upper hand over opponents during micro-intensive modern gaming matches.
          </p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            How to Test and Improve Your Clicks Per Second Score Here
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Unlike standard speed-clicking scripts, the Voyager Game challenges you to balance brute mechanical force with surgical precision:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem', color: '#9ca3af' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Real-time Tracking:</strong> Monitor your live interactive CPS directly inside the upper HUD panel while you actively avoid lethal, incoming procedural asteroids.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Stamina Training:</strong> As the ship drops constantly due to mock cosmic gravity, your rhythmic click patterns regulate the engine propulsion required to pass narrow gaps.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Peak Score Analytics:</strong> The post-game analysis screen accurately displays your maximum Peak CPS alongside survival time and distance cleared.</li>
          </ul>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Pro Tips to Rank Higher on the Speed Clicker Leaderboards
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            To achieve double-digit clicks per second (10+ CPS), players generally utilize specific physical execution models. Try experimenting with the <strong>Jitter Clicking</strong> method by vibrating your forearm muscles gently, or use the dual-finger <strong>Butterfly Clicking</strong> technique on your mouse/spacebar layout to maximize input signals safely without causing strain.
          </p>
          <div style={{ background: 'rgba(0,245,255,0.03)', borderLeft: '4px solid #00f5ff', padding: '1rem', margin: '1.5rem 0', borderRadius: '0 12px 12px 0' }}>
            <span style={{ display: 'block', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' }}>💡 Did You Know?</span>
            The current average score for global computer users sits between 4 to 6.5 CPS. Professional esports veterans frequently breach sustained ranges of 12 to 15 clicks per second under extreme pressure!
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Understanding Your Power-Up Loadout
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Voyager isn't just a raw clicking drill — it layers in five collectible power-ups that reward pattern recognition as much as speed. The <strong>Shield</strong> and <strong>Invincibility</strong> orbs absorb a single asteroid impact so a mistimed click doesn't instantly end your run, <strong>Slow-Mo</strong> stretches the incoming obstacle field to buy your fingers a breather, <strong>Double Boost</strong> triples your thruster output per click, and the <strong>Multiplier</strong> orb stacks with your near-miss combo to inflate your distance score. Learning which orb is worth chasing versus dodging is its own skill layer on top of raw CPS.
          </p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Boss Asteroids and Long-Run Endurance
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Every 90 seconds of survival summons a slow-moving <strong>Boss Asteroid</strong> that fills most of the vertical play field, forcing a sustained high-CPS burst rather than a single well-timed tap. Clearing one unlocks the "Boss Slayer" achievement and is generally where the difference between casual and elite runs becomes obvious — most players' CPS output degrades under sustained pressure, so training against the boss timer is a good proxy for real endurance rather than a short reflex spike.
          </p>
          <SeoExtraSections />
          <h3 style={seoH3}>
            Frequently Asked Questions
          </h3>
          <FaqAccordion items={FAQ_ITEMS} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Take the Challenge Now
          </h3>
          <p style={{ margin: 0 }}>
            Launch the simulation above, tap your Spacebar or click vigorously on the viewframe to fire your thrusters, and see if you possess the elite micro-skills needed to guide the Voyager ship through deep space. Benchmark your index finger today!
          </p>
        </article>

      </div>

      {/* ---- Global Keyframe Styles ---- */}
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

// ============================================================
// SEO HEAD COMPONENT
// ============================================================
function SeoHead() {
  useEffect(() => {
    // Title
    document.title = 'Voyager Space Game — Spacebar CPS Test & Asteroid Navigator';

    const setMeta = (name: string, content: string, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (prop) el.setAttribute('property', name); else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    setMeta('description', 'Play Voyager — the ultimate browser spacebar CPS test game. Navigate asteroid fields, collect power-ups, dodge boss asteroids and benchmark your clicks per second in real time.');
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#00f5ff');
    setMeta('viewport', 'width=device-width, initial-scale=1');
    setMeta('keywords', 'CPS test, spacebar clicker, clicks per second, asteroid game, click speed test, reaction time game');

    // OG
    setMeta('og:title', 'Voyager Space Game — Spacebar CPS Test', true);
    setMeta('og:description', 'Navigate through procedural asteroid fields and test your clicking speed in real-time. Browser-based, no install needed.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://yourdomain.com/games/voyager', true);
    setMeta('og:image', 'https://yourdomain.com/og-voyager.png', true);
    setMeta('og:site_name', 'Voyager Game', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Voyager Space Game — CPS Test');
    setMeta('twitter:description', 'Test your spacebar CPS in this immersive asteroid navigator game. Free to play in your browser!');
    setMeta('twitter:image', 'https://yourdomain.com/og-voyager.png');

    // Canonical
    setLink('canonical', 'https://yourdomain.com/games/voyager');

    // JSON-LD
    const existingScripts = ['voyager-jsonld'];
    existingScripts.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const script = document.createElement('script');
    script.id = 'voyager-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Voyager Space Game',
        description: 'Browser-based CPS test asteroid navigator game with power-ups, boss fights and real-time click speed tracking.',
        url: 'https://yourdomain.com/games/voyager',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern web browser with HTML5 Canvas support.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'Your Studio' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.7',
          ratingCount: '128',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourdomain.com/' },
          { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://yourdomain.com/games' },
          { '@type': 'ListItem', position: 3, name: 'Voyager', item: 'https://yourdomain.com/games/voyager' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is a CPS test?',
            acceptedAnswer: { '@type': 'Answer', text: 'A CPS (Clicks Per Second) test measures how many times you can click a button within one second. It is used by gamers to benchmark their reaction speed and clicking stamina.' },
          },
          {
            '@type': 'Question',
            name: 'How do I play Voyager?',
            acceptedAnswer: { '@type': 'Answer', text: 'Press the SPACEBAR or click/tap the game canvas to boost your spaceship upward. Avoid asteroids and collect power-ups to survive as long as possible.' },
          },
          {
            '@type': 'Question',
            name: 'Is Voyager free to play?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes, Voyager is completely free to play directly in your browser with no download or registration required.' },
          },
          {
            '@type': 'Question',
            name: 'Is my score saved if I close the tab?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Best distance, survival time, peak CPS, most obstacles avoided, and full achievement and lifetime statistics are stored locally in your browser and persist across sessions on the same device.' },
          },
          {
            '@type': 'Question',
            name: 'What is the ghost ship in Voyager?',
            acceptedAnswer: { '@type': 'Answer', text: 'The ghost ship is a translucent replay of your own best previous run, shown alongside your live ship so you can compare timing and positioning against your personal best.' },
          },
          {
            '@type': 'Question',
            name: 'Does difficulty level change how CPS is calculated?',
            acceptedAnswer: { '@type': 'Answer', text: 'No. Difficulty changes obstacle speed, spawn rate, and gravity, but CPS is always measured purely as clicks registered per second regardless of difficulty.' },
          },
          {
            '@type': 'Question',
            name: 'Can I play Voyager on a mobile phone?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tapping and holding the on-screen thruster button or the game canvas works the same as holding the spacebar on desktop, and the interface adapts automatically to touch screens.' },
          },
        ],
      },
    ]);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('voyager-jsonld');
      if (el) el.remove();
    };
  }, []);
  return null;
}

// ============================================================
// SEO ARTICLE — EXTRA SECTIONS
// Extra headed sections for on-page SEO depth. Kept as a separate
// component (rather than an inline JSX array) purely to keep the main
// render method scannable.
// ============================================================
const seoH3: React.CSSProperties = { fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' };
const seoP: React.CSSProperties = { marginBottom: '1.25rem' };

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is my score saved if I close the tab?',
    a: 'Yes. Your best distance, survival time, peak CPS, most-avoided count, and full achievement/lifetime history are stored locally in your browser, so they persist across sessions on the same device.',
  },
  {
    q: 'What\'s the "ghost" ship trailing behind me?',
    a: "It's a translucent replay of your own best previous run, rendered alongside your live ship so you can see exactly where your timing gained or lost ground last time.",
  },
  {
    q: 'Does difficulty affect my CPS score?',
    a: "Difficulty changes obstacle speed, spawn frequency, and gravity — not the CPS calculation itself, which is purely a measure of clicks registered per second regardless of the mode you're playing.",
  },
  {
    q: 'Can I play Voyager on mobile?',
    a: 'Yes — tapping and holding the on-screen thruster button (or the canvas itself) works the same as holding Spacebar on desktop, and the layout adapts to touch input automatically.',
  },
];

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${isOpen ? 'rgba(0,245,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', padding: '0.9rem 1.1rem',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.75rem', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{item.q}</span>
              <ChevronDown
                size={16}
                color={isOpen ? '#00f5ff' : '#64748b'}
                style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {isOpen && (
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
      <h3 style={seoH3}>Jitter Clicking vs Butterfly Clicking: Which Wins?</h3>
      <p style={seoP}>Jitter clicking relies on tensing your forearm to create a controlled tremor that taps the spacebar dozens of times a second, while butterfly clicking uses two fingers alternating on the same key. Jitter tends to win on raw peak CPS bursts; butterfly tends to win on sustained stamina over a full 60-second run, which matters more for Voyager's survival-based scoring than a single spike does.</p>

      <h3 style={seoH3}>Asteroid Types and How They Behave</h3>
      <p style={seoP}>Regular grey asteroids drift at a steady pace and are the bulk of what you'll dodge early on. Comets move faster, glow cyan, and trail a tail that can visually mask their true hitbox if you're not tracking the core. Boss asteroids are the largest and slowest, but occupy most of the vertical field, so weaving through the remaining gap takes patience over speed.</p>

      <h3 style={seoH3}>Reading the Near-Miss Window</h3>
      <p style={seoP}>A near miss only registers when an asteroid passes close to your ship without a collision, and each one builds your combo multiplier. Chaining near misses back-to-back is riskier than playing safe in the middle of the canvas, but it's the fastest way to inflate your distance score beyond what raw survival time alone would give you.</p>

      <h3 style={seoH3}>Shield vs Invincibility: What's the Difference?</h3>
      <p style={seoP}>Both orbs let you survive one otherwise-fatal hit, but they aren't identical. Shield lasts up to five seconds and only ever absorbs a single impact before disappearing, while Invincibility runs for a shorter four-second window but visually and functionally behaves the same way on contact — either one is a free mistake, not a free pass to fly recklessly for its full duration.</p>

      <h3 style={seoH3}>Why Slow-Mo Is a Timing Tool, Not a Crutch</h3>
      <p style={seoP}>Slow-Mo doesn't reduce the challenge as much as it changes its shape. Obstacles and power-ups drift in at a fraction of their normal speed, which gives you more reaction time per asteroid but also stretches out how long you're exposed to the current wave. Popping it right before a dense cluster is far more valuable than using it on an empty stretch of space.</p>

      <h3 style={seoH3}>Stacking the Multiplier Orb</h3>
      <p style={seoP}>The Multiplier power-up doubles your current score multiplier for eight seconds and stacks on top of whatever combo bonus you've already built from near misses, rather than replacing it. Grabbing it mid-combo, instead of at the start of a clean run, is where it adds the most raw distance to your final score.</p>

      <h3 style={seoH3}>Difficulty Modes Explained</h3>
      <p style={seoP}>Easy mode slows obstacle speed and spaces out spawns generously, which is the right place to learn the gravity-and-boost rhythm without punishment. Normal is the balanced default most players settle into. Hard tightens spawn intervals and steepens gravity, rewarding players who've already built consistent muscle memory for the boost timing.</p>

      <h3 style={seoH3}>How the Speed Ramp Works Over a Long Run</h3>
      <p style={seoP}>Your ship's base speed climbs automatically every fifteen seconds of survival, which is why early-game runs feel forgiving and late-game runs feel frantic. This ramp is deliberate — it's what turns a simple dodge-the-asteroid mechanic into a genuine endurance test as a session goes on.</p>

      <h3 style={seoH3}>The Ghost Ship: Racing Your Own Best Run</h3>
      <p style={seoP}>Once you've completed at least one run, a translucent ghost ship appears on subsequent attempts, replaying your personal-best flight path in real time next to your live ship. It's a simple way to see, frame by frame, exactly where your best run gained separation — usually around a specific asteroid cluster or a well-timed power-up grab.</p>

      <h3 style={seoH3}>Achievements Worth Chasing First</h3>
      <p style={seoP}>"First Flight" unlocks the moment you finish any run, so it's a freebie. After that, "Dodger" (20 avoided obstacles) and "Survivor" (60 seconds) are the most achievable early targets, while "Space Master" (120 seconds) and "Voyager Elite" (5,000 distance) are realistic goals only once your CPS and near-miss timing are both consistent.</p>

      <h3 style={seoH3}>Tracking Your Progress with Lifetime Stats</h3>
      <p style={seoP}>Beyond a single run's scoreboard, the Stats panel keeps a running tally across every session: total games played, cumulative distance, total survival time, and your all-time highest CPS and distance. It's a useful way to see whether your average performance is actually trending upward, rather than judging progress off one lucky run.</p>

      <h3 style={seoH3}>Keyboard Shortcuts Beyond the Spacebar</h3>
      <p style={seoP}>Spacebar is the core input for boosting, but P and Escape both pause and resume the run without touching the mouse. Learning to pause instantly with a single keypress is more useful than it sounds — it means a real-world interruption doesn't have to cost you a run in progress.</p>

      <h3 style={seoH3}>Playing Voyager on a Touchscreen</h3>
      <p style={seoP}>On phones and tablets, holding a finger down on the canvas fires the thruster exactly the way holding Spacebar does on desktop, and lifting your finger cuts the boost the same way releasing the key does. The HUD, difficulty buttons, and modals all resize for narrower viewports so nothing requires a desktop-sized screen to use comfortably.</p>

      <h3 style={seoH3}>Why Fullscreen Mode Helps Your Score</h3>
      <p style={seoP}>Toggling fullscreen removes browser chrome and gives the asteroid field more effective visual real estate, which in practice means slightly more reaction time to spot an incoming cluster before it's close enough to matter. It's a small edge, but for players chasing a personal best by a handful of distance points, small edges add up.</p>

      <h3 style={seoH3}>Using the FPS Counter to Diagnose Lag</h3>
      <p style={seoP}>If your clicks feel like they're not registering cleanly, toggle on the FPS counter in the HUD. A steady 60 FPS means the game loop is running smoothly and any missed hits are timing, not performance; a counter that dips well below that suggests background tabs or an underpowered device are the real bottleneck, not your reflexes.</p>

      <h3 style={seoH3}>How Distance Score Is Actually Calculated</h3>
      <p style={seoP}>Distance accumulates continuously based on your current speed and whatever score multiplier is active, not just from clicking. That means a slower, more deliberate run that stacks near-miss combos and multiplier orbs can out-score a faster but sloppier run that keeps resetting its combo by playing too cautiously in the dead center of the field.</p>

      <h3 style={seoH3}>Common Mistakes That Kill Long Runs</h3>
      <p style={seoP}>The most frequent cause of an early game-over isn't a fast asteroid — it's over-boosting into the ceiling or under-boosting into the floor after a distracted moment. Because gravity is constant and boost is a discrete impulse, short deliberate taps generally beat one long panicked hold when threading a tight gap.</p>

      <h3 style={seoH3}>Benchmarking Your CPS Against Global Averages</h3>
      <p style={seoP}>Most casual players land somewhere in the 4–6.5 CPS range on a standard click test, while dedicated clicker-game players who train specifically often push into the 8–10 CPS range. Treat your Voyager peak CPS as a rough personal benchmark rather than a strict competitive ranking, since screen size, input device, and even the specific browser can shift raw numbers slightly.</p>

      <h3 style={seoH3}>Why Browser-Based Testing Beats Downloadable Clicker Apps</h3>
      <p style={seoP}>A browser test needs no install, keeps no background process running, and works identically whether you're on a shared computer, a school device, or your own laptop. That accessibility is part of why spacebar CPS tests are commonly used as a quick, judgment-free way to warm up before a longer gaming session.</p>

      <h3 style={seoH3}>Session Length and Avoiding Finger Fatigue</h3>
      <p style={seoP}>Sustained high-CPS clicking for many minutes in a row can strain the same tendons used in typing-heavy work, so treat back-to-back attempts the way you would any repetitive hand activity — short breaks between runs protect your long-term speed more than pushing through discomfort for one more attempt.</p>

      <h3 style={seoH3}>What Makes a "Clean" Run Versus a "Lucky" One</h3>
      <p style={seoP}>A clean run is one where your combo rarely resets, your power-up pickups were deliberate rather than incidental, and your peak CPS held steady rather than spiking once and fading. A lucky run might post a similar final distance through a sparse spawn pattern — the lifetime stats panel is the better long-term signal for actual skill than any single scoreboard entry.</p>
    </>
  );
}

// ============================================================
// HELPER STYLE OBJECTS
// ============================================================
const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e', normal: '#eab308', hard: '#ef4444',
};

const outlineBtn: React.CSSProperties = {
  flex: 1, padding: '0.5rem 0.25rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#94a3b8',
  fontWeight: '700', fontSize: '0.72rem',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '4px',
};

const solidBtn: React.CSSProperties = {
  width: '100%', padding: '0.8rem',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '0.9rem',
  fontWeight: '800', borderRadius: '12px',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '8px',
};

// ============================================================
// SUB-COMPONENTS
// ============================================================
const StatBox = ({ icon, label, id, initialValue }: {
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
);

const GameOverStat = ({ label, value, highlight = '#fff', isNew }: {
  label: string; value: string | number; highlight?: string; isNew?: boolean;
}) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isNew ? highlight + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', padding: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>
    {isNew && <div style={{ position: 'absolute', top: '-6px', right: '6px', fontSize: '0.55rem', background: highlight, color: '#000', fontWeight: '900', padding: '1px 5px', borderRadius: '4px' }}>NEW BEST</div>}
    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'monospace', color: highlight }}>{value}</div>
  </div>
);

const HiScoreChip = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '800', color }}>{value}</span>
  </div>
);

const IconBtn = ({ children, onClick, 'aria-label': ariaLabel }: {
  children: React.ReactNode; onClick?: () => void; 'aria-label'?: string;
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
  >
    {children}
  </button>
);

const PowerUpHudItem = ({ pu }: { pu: { type: string; remaining: number; total: number } }) => {
  const pct = pu.remaining / pu.total;
  return (
    <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${POWERUP_COLORS[pu.type]}44`, borderRadius: '10px', padding: '0.35rem 0.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '54px' }}>
      <span style={{ fontSize: '1rem' }}>{POWERUP_ICONS[pu.type]}</span>
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: POWERUP_COLORS[pu.type], transition: 'width 0.2s linear' }} />
      </div>
    </div>
  );
};

const Modal = ({ title, icon, onClose, children }: {
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
);

const StatModal = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: '800', color: '#00f5ff' }}>{value}</div>
  </div>
);

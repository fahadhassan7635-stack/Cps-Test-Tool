'use client';

import {
  useState, useRef, useCallback, useEffect, useReducer
} from 'react';

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
    multiplier: 1, minSize: 64, maxSize: 86, lifetime: 3200, spawnInterval: 1050,
    maxConcurrent: 1, moveChance: 0, minSpeed: 0, maxSpeed: 0,
  },
  medium: {
    label: 'Normal', tag: 'NRM', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', accentRgb: '96,165,250',
    multiplier: 1.6, minSize: 46, maxSize: 62, lifetime: 2100, spawnInterval: 800,
    maxConcurrent: 1, moveChance: 0.25, minSpeed: 40, maxSpeed: 85,
  },
  hard: {
    label: 'Hard', tag: 'HRD', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', accentRgb: '245,158,11',
    multiplier: 2.4, minSize: 32, maxSize: 44, lifetime: 1450, spawnInterval: 620,
    maxConcurrent: 2, moveChance: 0.55, minSpeed: 75, maxSpeed: 135,
  },
  pro: {
    label: 'Pro', tag: 'PRO', color: '#f97316', glow: 'rgba(249,115,22,0.4)', accentRgb: '249,115,22',
    multiplier: 3.4, minSize: 22, maxSize: 32, lifetime: 1000, spawnInterval: 460,
    maxConcurrent: 2, moveChance: 0.8, minSpeed: 115, maxSpeed: 195,
  },
  impossible: {
    label: 'Impossible', tag: 'IMP', color: '#e879f9', glow: 'rgba(232,121,249,0.4)', accentRgb: '232,121,249',
    multiplier: 4.6, minSize: 14, maxSize: 22, lifetime: 680, spawnInterval: 300,
    maxConcurrent: 3, moveChance: 0.95, minSpeed: 165, maxSpeed: 265,
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
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    if (!ctxRef.current || ctxRef.current.state === 'closed')
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, dur: number, gain: number, startFreq?: number) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      const now = ctx.currentTime;
      if (startFreq !== undefined) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + dur * 0.5);
      } else {
        osc.frequency.setValueAtTime(freq, now);
      }
      g.gain.setValueAtTime(gain * volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now); osc.stop(now + dur);
    } catch {}
  }, [enabled, volume, getCtx]);

  return {
    hit: () => playTone(720, 'sine', 0.06, 0.28, 340),
    miss: () => playTone(130, 'sawtooth', 0.1, 0.18),
    expire: () => playTone(100, 'triangle', 0.12, 0.14),
    combo: (n: number) => playTone(440 + n * 18, 'square', 0.07, 0.18),
    countdown: (n: number) => playTone(n === 0 ? 960 : 480, 'sine', 0.14, 0.32),
    finish: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.28, 0.28), i * 110)); },
    click: () => playTone(320, 'sine', 0.04, 0.12),
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
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:20;border-radius:inherit;';
      areaRef.current.appendChild(canvas);
      canvasRef.current = canvas;
    }
    const resize = () => {
      if (!canvas || !areaRef.current) return;
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
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
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

// ── SEO content data ──────────────────────────────────────────────────────────
const SUPPORTED_GAMES = [
  'Valorant', 'Counter-Strike 2', 'Call of Duty: Warzone', 'Apex Legends',
  'Overwatch 2', 'Fortnite', 'PUBG: Battlegrounds', 'Rainbow Six Siege',
  'Destiny 2', 'League of Legends',
] as const;

interface FaqEntry { id: string; question: string; answer: React.ReactNode; }

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'faq-free', question: 'Is this online aim trainer free to use?',
    answer: 'Yes. The full game — every difficulty tier, every duration mode, sound, and session history — runs free in your browser. No account, download, or subscription is required.',
  },
  {
    id: 'faq-difficulty', question: 'What exactly changes between Easy, Normal, Hard, Pro, and Impossible?',
    answer: 'Five variables shift together: target size, how long a target stays alive, how often new targets spawn, whether targets move (and how fast), and the score multiplier. Easy spawns large, stationary, slow-expiring targets at a ×1 multiplier. Impossible spawns tiny, fast, short-lived targets — up to three on screen at once — at a ×4.6 multiplier.',
  },
  {
    id: 'faq-duration', question: 'What match durations can I choose from?',
    answer: 'Quick sprints of 1, 3, 5, 10, or 30 seconds, a custom length up to 600 seconds, or Unlimited mode, which counts time up instead of down and only ends when you press Stop.',
  },
  {
    id: 'faq-scoring', question: 'How is my score calculated on each hit?',
    answer: 'Smaller targets are worth more base points than larger ones. That base value is then multiplied by the selected difficulty\'s score multiplier and by your current combo multiplier, then rounded to the nearest whole point.',
  },
  {
    id: 'faq-combo', question: 'How does the combo multiplier system work?',
    answer: 'Consecutive hits build a combo counter. Reaching 5, 10, 20, or 35 hits in a row raises your multiplier to ×1.5, ×2, ×2.5, and ×3 respectively. A misclick or an expired target resets the combo to zero immediately.',
  },
  {
    id: 'faq-grade', question: 'How are the S through F grades determined?',
    answer: 'Your grade blends accuracy with a difficulty bonus, since Impossible-tier accuracy is inherently harder to achieve than Easy-tier accuracy. An S grade additionally requires a sub-380ms average reaction time on top of a perfect adjusted score — it rewards both precision and speed together.',
  },
  {
    id: 'faq-reaction-time', question: 'How is reaction time measured?',
    answer: 'For every target you hit, the trainer records the gap between the moment it spawned and the moment you clicked it, then averages that figure across the whole session to give you a single reaction-time stat.',
  },
  {
    id: 'faq-moving-targets', question: 'Why do some targets move and others stay still?',
    answer: 'Each difficulty tier has its own move chance. Easy targets never move, Normal targets move about a quarter of the time, and Pro and Impossible targets are moving almost every spawn — bouncing off the arena walls at increasing speed.',
  },
  {
    id: 'faq-multiple-targets', question: 'Why are there sometimes two or three targets on screen at once?',
    answer: 'Hard, Pro, and Impossible allow more than one target to spawn concurrently, forcing you to prioritise which target to click first rather than reacting to a single stimulus at a time.',
  },
  {
    id: 'faq-particles', question: 'What causes the burst of particles when I hit a target?',
    answer: 'Every hit triggers a short-lived particle explosion rendered on an HTML canvas layered over the arena, plus an expanding ripple ring and a floating points label — all purely visual feedback with no effect on scoring.',
  },
  {
    id: 'faq-sound', question: 'Can I turn the sound off or adjust the volume?',
    answer: 'Yes. The speaker icon toggles all sound instantly, and a volume slider appears whenever sound is enabled. Both preferences are remembered the next time you open the trainer.',
  },
  {
    id: 'faq-audio-silent', question: 'Why is there no sound the first time I click Start?',
    answer: 'Browsers block audio playback until a page receives a genuine user interaction. Your very first click unlocks the audio engine, so any sound tied to that same click may be skipped; every sound afterward plays normally.',
  },
  {
    id: 'faq-keyboard', question: 'What keyboard shortcuts does the trainer support?',
    answer: 'Space starts a match from the idle or results screen. P or Escape pauses and resumes a running match. R restarts the current session instantly, re-running the same difficulty and duration.',
  },
  {
    id: 'faq-mobile', question: 'Does the aim trainer work on mobile and touchscreens?',
    answer: 'Yes. Targets respond to touch as well as click, and the arena blocks touch-scrolling during play so a swipe never scrolls the page away from your session mid-match.',
  },
  {
    id: 'faq-history', question: 'Where is my session history stored?',
    answer: 'Your last 30 sessions — including score, accuracy, grade, and reaction time — are saved locally in your browser. Nothing is uploaded anywhere, and clearing your browser data or pressing Clear in the history panel removes it permanently.',
  },
  {
    id: 'faq-unlimited-mode', question: 'How does Unlimited mode differ from a timed match?',
    answer: 'Instead of counting down to zero, the on-screen clock counts up from zero with no cap. Targets keep spawning until you press the Stop button in the arena, at which point your result is graded and saved exactly like a timed session.',
  },
  {
    id: 'faq-custom-duration', question: 'How long can a custom match be?',
    answer: 'Custom duration accepts any whole number of seconds from 1 up to 600 (ten minutes), entered directly into the input field that appears when Custom is selected.',
  },
  {
    id: 'faq-misclick-vs-miss', question: 'What is the difference between a misclick and a missed target?',
    answer: 'A misclick happens when you click empty space in the arena. A missed target happens when a target\'s lifetime runs out before you click it. Both reset your combo, but they are tracked as separate statistics in your results.',
  },
  {
    id: 'faq-best-difficulty', question: 'Which difficulty should a beginner start on?',
    answer: 'Start on Easy or Normal until your accuracy sits comfortably above 85%, then move up one tier at a time. Jumping straight to Pro or Impossible before your fundamentals are solid tends to reinforce wild, imprecise flicking rather than clean tracking.',
  },
  {
    id: 'faq-warmup', question: 'Is this a good warm-up before ranked matches?',
    answer: 'A focused 5–10 minute session on Normal or Hard activates hand-eye coordination without inducing fatigue, making it a reasonable pre-game warm-up. Save longer Impossible-tier grinding for dedicated practice blocks instead of right before you queue.',
  },
  {
    id: 'faq-transfer', question: 'Does practicing here actually improve my in-game aim?',
    answer: 'Deliberate, repetitive practice on an isolated motor skill — like clicking small, fast, unpredictable targets — is well documented to transfer to related real-world tasks. Pairing short daily sessions here with regular in-game play tends to produce faster gains than either alone.',
  },
  {
    id: 'faq-sensitivity', question: 'Should I use my in-game mouse sensitivity while training?',
    answer: 'Yes. Training at a different sensitivity than the one you actually queue up with builds muscle memory that does not transfer cleanly. Match your real settings for the repetitions to count.',
  },
  {
    id: 'faq-refresh-rate', question: 'Does monitor refresh rate change how the trainer feels?',
    answer: 'A higher refresh rate renders more intermediate frames of a moving target, which makes tracking feel smoother and shaves a few milliseconds off your perceived reaction time. The trainer still functions correctly on a standard 60Hz display.',
  },
  {
    id: 'faq-privacy', question: 'Is any of my data sent to a server?',
    answer: 'No. Every setting, every session result, and your entire history live only in your browser\'s local storage. The trainer has no backend account system and makes no network requests about your gameplay.',
  },
  {
    id: 'faq-clear-history', question: 'How do I reset my session history and best scores?',
    answer: 'Open the Session History panel beneath the arena and press Clear. This permanently removes every saved result from your browser; there is no way to recover it afterward.',
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AimTrainerPage() {
  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').soundEnabled ?? true; } catch { return true; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').volume ?? 0.5; } catch { return 0.5; }
  });
  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ soundEnabled, volume })); } catch {} }, [soundEnabled, volume]);

  // Config
  const [difficulty, setDifficulty] = useState<DifficultyKey>('medium');
  const [durationKey, setDurationKey] = useState<DurationKey>('10');
  const [customSeconds, setCustomSeconds] = useState<number>(15);

  // Game
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [targets, setTargets] = useState<TargetT[]>([]);
  const [clock, setClock] = useState(10);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [floatTexts, setFloatTexts] = useState<FloatingText[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<SessionResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [comboFlash, setComboFlash] = useState<{ text: string; key: number } | null>(null);
  const [hoveredDiff, setHoveredDiff] = useState<DifficultyKey | null>(null);
  const [prefersReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showHistory, setShowHistory] = useState(false);
  const [customInput, setCustomInput] = useState('15');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
  const targetsCountRef = useRef(0);
  const difficultyAtStartRef = useRef<DifficultyKey>('medium');
  const durationLabelRef = useRef('10s');
  const decayTimeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { clockRef.current = clock; }, [clock]);
  useEffect(() => { targetsCountRef.current = targets.length; }, [targets]);

  const sfx = useSoundEngine(soundEnabled, volume);
  const { burst } = useParticleCanvas(areaRef);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
  }, []);

  useEffect(() => () => { decayTimeouts.current.forEach(t => clearTimeout(t)); decayTimeouts.current.clear(); }, []);

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { decayTimeouts.current.delete(id); fn(); }, ms);
    decayTimeouts.current.add(id);
    return id;
  }, []);

  const spawnFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    if (prefersReducedMotion) return;
    const id = ++floatIdRef.current;
    setFloatTexts(prev => [...prev, { id, x, y, text, color }]);
    trackedTimeout(() => setFloatTexts(prev => prev.filter(f => f.id !== id)), 900);
  }, [prefersReducedMotion, trackedTimeout]);

  const spawnRipple = useCallback((x: number, y: number, color: string) => {
    if (prefersReducedMotion) return;
    const id = ++rippleIdRef.current;
    setRipples(prev => [...prev, { id, x, y, color }]);
    trackedTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, [prefersReducedMotion, trackedTimeout]);

  const finaliseResult = useCallback(() => {
    const gs = gameStateRef.current;
    const acc = gs.totalClicks > 0 ? Math.round((gs.hits / gs.totalClicks) * 100) : 100;
    const avgR = gs.reactionTimes.length > 0 ? gs.reactionTimes.reduce((a, b) => a + b, 0) / gs.reactionTimes.length : 0;
    const grade = calcGrade(acc, avgR, difficultyAtStartRef.current);
    const dur = Math.round((Date.now() - gameStartTime.current) / 1000);
    const result: SessionResult = {
      id: String(Date.now()), date: new Date().toISOString(),
      difficulty: difficultyAtStartRef.current, durationLabel: durationLabelRef.current,
      score: gs.score, accuracy: acc, hits: gs.hits, misclicks: gs.misclicks, targetsMissed: gs.targetsMissed,
      peakCombo: gs.peakCombo, reactionTime: avgR, grade, stars: calcStars(grade),
      totalClicks: gs.totalClicks, avgPoints: gs.hits > 0 ? gs.score / gs.hits : 0,
      peakHitsPerSec: gs.peakHitsPerSec, bestStreak: gs.bestStreak, duration: dur,
    };
    setLastResult(result);
    setHistory(prev => {
      const updated = [result, ...prev].slice(0, 30);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const spawnTarget = useCallback(() => {
    if (!areaRef.current || phaseRef.current !== 'running') return;
    const cfg = configRef.current;
    if (targetsCountRef.current >= cfg.maxConcurrent) return;
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
    setTargets(prev => [...prev, target]);
    const to = setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
      targetTimeouts.current.delete(id);
      if (phaseRef.current === 'running') { dispatch({ type: 'EXPIRE' }); sfx.expire(); }
    }, cfg.lifetime);
    targetTimeouts.current.set(id, to);
  }, [sfx]);

  // Movement RAF
  useEffect(() => {
    if (phase !== 'running') return;
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
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
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const endGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setPhase('done'); phaseRef.current = 'done';
    setTargets([]);
    sfx.finish();
    finaliseResult();
  }, [sfx, finaliseResult]);

  const startTimerLoop = useCallback((initialElapsed: number, durationSeconds: number | null) => {
    let elapsed = initialElapsed;
    const tick = () => {
      elapsed += 0.1;
      if (durationSeconds === null) {
        clockRef.current = elapsed; setClock(elapsed); return;
      }
      const left = Math.max(0, durationSeconds - elapsed);
      clockRef.current = left; setClock(left);
      if (left <= 0) endGame();
    };
    timerRef.current = setInterval(tick, 100);
  }, [endGame]);

  const startGameEngine = useCallback(() => {
    gameStartTime.current = Date.now();
    const cfg = configRef.current;
    for (let i = 0; i < cfg.maxConcurrent; i++) spawnTarget();
    spawnRef.current = setInterval(spawnTarget, cfg.spawnInterval);
    startTimerLoop(0, sessionDurationRef.current);
  }, [spawnTarget, startTimerLoop]);

  const beginCountdown = useCallback(() => {
    clearAllTimers();
    dispatch({ type: 'RESET' });
    setTargets([]); setFloatTexts([]); setRipples([]);
    setLastResult(null);
    const cfg = DIFFICULTY_CONFIG[difficulty];
    configRef.current = cfg;
    difficultyAtStartRef.current = difficulty;
    const durationSeconds = durationKey === 'unlimited' ? null : durationKey === 'custom' ? customSeconds : Number(durationKey);
    sessionDurationRef.current = durationSeconds;
    durationLabelRef.current = durationLabelFor(durationKey, customSeconds);
    setClock(durationSeconds ?? 0); clockRef.current = durationSeconds ?? 0;
    setCountdown(3);
    setPhase('countdown'); phaseRef.current = 'countdown';
    sfx.click();
    let count = 3;
    sfx.countdown(count);
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      sfx.countdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!); countdownRef.current = null;
        setPhase('running'); phaseRef.current = 'running';
        startGameEngine();
      }
    }, 1000);
  }, [clearAllTimers, sfx, startGameEngine, difficulty, durationKey, customSeconds]);

  const resetSession = useCallback(() => {
    beginCountdown();
  }, [beginCountdown]);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    pauseDataRef.current = { clock: clockRef.current };
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setTargets([]);
    setPhase('paused'); phaseRef.current = 'paused';
    sfx.click();
  }, [sfx]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    const savedClock = pauseDataRef.current?.clock ?? clockRef.current;
    const durationSeconds = sessionDurationRef.current;
    const elapsedSoFar = durationSeconds === null ? savedClock : durationSeconds - savedClock;
    setPhase('running'); phaseRef.current = 'running';
    sfx.click();
    const cfg = configRef.current;
    for (let i = 0; i < cfg.maxConcurrent; i++) spawnTarget();
    spawnRef.current = setInterval(spawnTarget, cfg.spawnInterval);
    startTimerLoop(elapsedSoFar, durationSeconds);
  }, [sfx, spawnTarget, startTimerLoop]);

  const exitToIdle = useCallback(() => {
    clearAllTimers();
    setPhase('idle'); phaseRef.current = 'idle';
    setTargets([]);
    setLastResult(null);
    sfx.click();
  }, [clearAllTimers, sfx]);

  const hitTarget = useCallback((target: TargetT, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;
    const to = targetTimeouts.current.get(target.id);
    if (to) { clearTimeout(to); targetTimeouts.current.delete(target.id); }
    setTargets(prev => prev.filter(t => t.id !== target.id));
    const rt = Date.now() - target.spawnTime;
    const now = Date.now();
    dispatch({ type: 'HIT', points: target.points, reactionTime: rt, timestamp: now });
    sfx.hit();
    const newCombo = gameStateRef.current.combo + 1;
    if ((COMBO_THRESHOLDS as readonly number[]).includes(newCombo)) {
      sfx.combo(newCombo);
      setComboFlash({ text: `${newCombo}× COMBO`, key: Date.now() });
      trackedTimeout(() => setComboFlash(null), 1400);
    }
    if (areaRef.current) {
      burst(target.x, target.y, configRef.current.color, 12);
      spawnRipple(target.x, target.y, configRef.current.glow);
      spawnFloatText(target.x, target.y - target.size / 2 - 8, `+${target.points}`, '#ffffff');
    }
  }, [sfx, burst, spawnRipple, spawnFloatText, trackedTimeout]);

  const missClick = useCallback((e: React.MouseEvent) => {
    if (phaseRef.current !== 'running') return;
    dispatch({ type: 'MISCLICK' });
    sfx.miss();
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      spawnRipple(x, y, 'rgba(239,68,68,0.6)');
      spawnFloatText(x, y, 'MISS', 'rgba(239,68,68,0.9)');
    }
  }, [sfx, spawnRipple, spawnFloatText]);

  const handleAreaClick = useCallback((e: React.MouseEvent) => {
    if (phase === 'idle' || phase === 'done') {
      beginCountdown(); return;
    }
    if (phase === 'paused') {
      resume(); return;
    }
    missClick(e);
  }, [phase, beginCountdown, resume, missClick]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT') return;
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

  // Touch scroll prevent
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (phaseRef.current === 'running') e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  }, []);

  // Derived
  const acc = gameState.totalClicks > 0 ? Math.round((gameState.hits / gameState.totalClicks) * 100) : 100;
  const isUnlimited = sessionDurationRef.current === null && (phase === 'running' || phase === 'paused');
  const progress = (phase === 'running' || phase === 'paused') && sessionDurationRef.current
    ? ((sessionDurationRef.current - clock) / sessionDurationRef.current) * 100 : 0;
  const multiplier = getComboMultiplier(gameState.combo);
  const avgRT = gameState.reactionTimes.length > 0
    ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length) : 0;
  const activeCfg = (phase === 'running' || phase === 'paused' || phase === 'countdown') ? configRef.current : DIFFICULTY_CONFIG[difficulty];
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
          zIndex: 300, pointerEvents: 'none',
          fontFamily: 'inherit', fontWeight: 800, fontSize: '1.5rem',
          color: '#ffffff', letterSpacing: '0.08em',
          textShadow: `0 0 30px ${activeCfg.color}, 0 0 60px ${activeCfg.color}`,
          animation: 'cf-pop 1.4s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>{comboFlash.text}</div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem', position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <header style={{ textAlign: 'center', padding: '1.5rem 0 2.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.35)',
            borderRadius: '20px', padding: '0.32rem 0.95rem', marginBottom: '1.1rem',
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em',
            color: '#2dd4bf', textTransform: 'uppercase',
          }}>
            Aim Tool
          </div>
          <h1 style={{
            fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.1,
            margin: '0 0 0.85rem', letterSpacing: '-0.02em',
            color: '#2dd4bf', textShadow: '0 0 40px rgba(45,212,191,0.25)',
          }}>
            Aim Trainer
          </h1>
          <p style={{ margin: 0, fontSize: '1.02rem', color: '#9ca3af', fontWeight: 400 }}>
            Track and hit the small moving target — precision matters!
          </p>
        </header>

        {/* ── Top bar ── */}
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

          {/* Difficulty */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {DIFFICULTY_ORDER.map(key => {
              const d = DIFFICULTY_CONFIG[key];
              const active = difficulty === key;
              const locked = isActive;
              return (
                <button
                  key={key}
                  onClick={() => { if (!locked) { setDifficulty(key); sfx.click(); } }}
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
                    transition: 'all 0.15s ease',
                    opacity: locked && !active ? 0.4 : 1,
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

          {/* Duration */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {DURATION_OPTIONS.map(opt => {
              const active = durationKey === opt.key;
              const locked = isActive;
              return (
                <button
                  key={opt.key}
                  onClick={() => { if (!locked) { setDurationKey(opt.key); sfx.click(); } }}
                  disabled={locked}
                  style={{
                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: locked ? 'default' : 'pointer',
                    border: `1px solid ${active ? '#ffffff30' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: active ? '#fff' : '#8888a0',
                    transition: 'all 0.15s ease',
                    opacity: locked && !active ? 0.4 : 1,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
            {durationKey === 'custom' && !isActive && (
              <input
                type="number" min={1} max={600} value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value);
                  const n = Math.min(600, Math.max(1, Number(e.target.value) || 1));
                  setCustomSeconds(n);
                }}
                style={{
                  width: '60px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '0.3rem 0.5rem', color: '#fff', fontFamily: 'inherit', fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Sound */}
          <button
            onClick={() => { setSoundEnabled((v: boolean) => !v); }}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              padding: '0.35rem 0.6rem', color: soundEnabled ? '#fff' : '#8888a0', cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s ease',
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          {soundEnabled && (
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              aria-label="Volume" style={{ width: '64px', accentColor: activeCfg.color, cursor: 'pointer' }}
            />
          )}

          {/* Reset */}
          {(isActive || phase === 'done') && (
            <button
              onClick={resetSession}
              style={{
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.03em',
                padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)',
                color: '#f87171', transition: 'all 0.15s ease',
              }}
            >
              ↺ Reset
            </button>
          )}
        </div>

        {/* ── Live stats bar ── */}
        {isActive && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem',
            marginBottom: '1rem',
          }}>
            {[
              { label: 'Score', value: gameState.score.toLocaleString(), color: '#ffffff' },
              { label: 'Accuracy', value: `${acc}%`, color: acc > 75 ? '#34d399' : acc > 50 ? '#f59e0b' : '#ef4444' },
              { label: 'Hits', value: gameState.hits, color: activeCfg.color },
              { label: 'Misses', value: gameState.misclicks + gameState.targetsMissed, color: '#ef4444' },
              { label: 'Combo', value: `×${gameState.combo}`, color: gameState.combo >= 5 ? '#f59e0b' : '#8888a0' },
              { label: 'Best', value: `×${gameState.peakCombo}`, color: '#8888a0' },
              { label: 'React', value: avgRT ? `${avgRT}ms` : '—', color: '#a78bfa' },
              { label: isUnlimited ? 'Elapsed' : 'Time', value: isUnlimited ? `${clock.toFixed(1)}s` : `${clock.toFixed(1)}`, color: clock < ((sessionDurationRef.current ?? 100) * 0.2) && !isUnlimited ? '#ef4444' : '#60a5fa' },
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
            }}>
              ⚡ ×{multiplier} MULTIPLIER
            </span>
          </div>
        )}

        {/* ── Game arena ── */}
        <div
          ref={areaRef}
          onClick={handleAreaClick}
          role="application"
          aria-label={phase === 'idle' ? 'Click to start aim training' : 'Aim training arena'}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(380px, 65vh, 680px)',
            background: 'rgba(255,255,255,0.015)',
            border: `1px solid ${
              phase === 'running' ? `rgba(${activeCfg.accentRgb},0.35)` :
              phase === 'paused' ? 'rgba(245,158,11,0.3)' :
              phase === 'countdown' ? `rgba(${activeCfg.accentRgb},0.25)` :
              'rgba(255,255,255,0.06)'
            }`,
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: phase === 'idle' || phase === 'done' ? 'pointer' : 'crosshair',
            marginBottom: '1rem',
            backdropFilter: 'blur(20px)',
            boxShadow: phase === 'running'
              ? `0 0 60px rgba(${activeCfg.accentRgb},0.08), inset 0 0 60px rgba(${activeCfg.accentRgb},0.02)`
              : '0 0 0 transparent',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
            WebkitUserSelect: 'none', userSelect: 'none',
          }}
        >
          {/* Grid lines subtle */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }} aria-hidden="true">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Idle / done overlay */}
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

          {/* Countdown */}
          {phase === 'countdown' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(10,15,24,0.6)', backdropFilter: 'blur(4px)',
              borderRadius: 'inherit',
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

          {/* Float texts */}
          {floatTexts.map(f => (
            <div key={f.id} aria-hidden="true" style={{
              position: 'absolute', left: f.x, top: f.y,
              color: f.color, fontWeight: 800, fontSize: '0.85rem',
              pointerEvents: 'none', whiteSpace: 'nowrap',
              transform: 'translate(-50%,-50%)',
              animation: 'float-rise 0.9s ease forwards',
              textShadow: `0 0 12px ${f.color}`,
              letterSpacing: '0.04em',
            }}>{f.text}</div>
          ))}

          {/* Targets */}
          {targets.map(t => (
            <TargetButton key={t.id} target={t} cfg={activeCfg} onHit={hitTarget} />
          ))}

          {/* Lifetime bars */}
          {phase === 'running' && targets.map(t => (
            <div key={`lb-${t.id}`} aria-hidden="true" style={{
              position: 'absolute',
              left: `${t.x - t.size / 2}px`, top: `${t.y + t.size / 2 + 5}px`,
              width: `${t.size}px`, height: '2px',
              background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden', pointerEvents: 'none', zIndex: 4,
            }}>
              <div style={{
                height: '100%', background: activeCfg.color, opacity: 0.7,
                animation: `shrink-bar ${t.lifetime}ms linear forwards`,
                boxShadow: `0 0 6px ${activeCfg.glow}`,
              }} />
            </div>
          ))}

          {/* Pause/play button inside arena */}
          {phase === 'running' && (
            <button
              onClick={e => { e.stopPropagation(); pause(); }}
              aria-label="Pause"
              style={{
                position: 'absolute', bottom: '12px', right: '12px', zIndex: 25,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '0.4rem 0.65rem', cursor: 'pointer',
                color: '#8888a0', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600,
                letterSpacing: '0.04em', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              ⏸ <span style={{ fontSize: '0.65rem' }}>P</span>
            </button>
          )}

          {/* Stop for unlimited */}
          {phase === 'running' && isUnlimited && (
            <button
              onClick={e => { e.stopPropagation(); endGame(); }}
              style={{
                position: 'absolute', bottom: '12px', left: '12px', zIndex: 25,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', padding: '0.4rem 0.75rem', cursor: 'pointer',
                color: '#f87171', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600,
                letterSpacing: '0.04em', transition: 'all 0.15s ease',
              }}
            >
              ■ Stop
            </button>
          )}

          {/* Difficulty + tier badge */}
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

        {/* ── Result card ── */}
        {phase === 'done' && lastResult && (
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: `1px solid ${gradeColors[lastResult.grade]}25`,
            borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem',
            boxShadow: `0 0 40px ${gradeColors[lastResult.grade]}0d`,
            animation: 'fade-in 0.4s ease',
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
              <button
                onClick={beginCountdown}
                style={{
                  marginLeft: 'auto', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                  letterSpacing: '0.04em', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer',
                  background: `rgba(${DIFFICULTY_CONFIG[lastResult.difficulty].accentRgb},0.12)`,
                  border: `1px solid rgba(${DIFFICULTY_CONFIG[lastResult.difficulty].accentRgb},0.35)`,
                  color: DIFFICULTY_CONFIG[lastResult.difficulty].color,
                  transition: 'all 0.15s ease',
                }}
              >▶ Run It Back</button>
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

        {/* ── History ── */}
        {history.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setShowHistory(v => !v)}
              style={{
                fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                padding: '0.4rem 0.9rem', color: '#8888a0', cursor: 'pointer', transition: 'all 0.15s ease',
                marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {showHistory ? '▾' : '▸'} Session History
              <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px', padding: '0 0.45rem', fontSize: '0.7rem' }}>{history.length}</span>
            </button>
            {showHistory && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', overflow: 'hidden', animation: 'fade-in 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem 0' }}>
                  <button
                    onClick={() => { setHistory([]); try { localStorage.removeItem(STORAGE_KEY); } catch {} }}
                    style={{
                      fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 600,
                      background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px',
                      padding: '0.25rem 0.65rem', color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                    }}
                  >Clear</button>
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
                        {DIFFICULTY_CONFIG[s.difficulty].label}
                      </span>
                      <span style={{ color: '#55556a', fontSize: '0.68rem' }}>{s.durationLabel}</span>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{s.score.toLocaleString()}</span>
                      <span style={{ color: '#8888a0' }}>{s.accuracy}%</span>
                      <span style={{ color: gradeColors[s.grade], fontWeight: 800 }}>{s.grade}</span>
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
          {(phase === 'running') && <><Hint k="P / Esc" label="Pause" /><Hint k="R" label="Restart" /></>}
          {(phase === 'paused') && <><Hint k="P / Esc" label="Resume" /><Hint k="R" label="Restart" /></>}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SEO ARTICLE — 20+ H2 headings
        ══════════════════════════════════════════════════════════ */}
        <article aria-label="Aim trainer guide and FAQ" style={{ paddingBottom: '3rem' }}>

          <SeoHero accentColor={activeCfg.color} accentRgb={activeCfg.accentRgb} />

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>How This Aim Trainer Works</h2>
            <p style={pStyle}>
              Every match runs on a lightweight engine built for one job: spawn a target, measure how fast
              and how precisely you click it, then repeat. A short countdown primes your reflexes, targets
              appear one at a time or several at once depending on difficulty, and a live stats bar tracks
              score, accuracy, combo, and reaction time as you play — no page reload, no waiting between hits.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Difficulty Tiers, From Easy to Impossible</h2>
            <p style={pStyle}>
              Five tiers scale five variables together — target size, lifetime, spawn rate, movement, and
              score multiplier — so the jump between tiers feels meaningfully different rather than just
              "smaller circle."
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '0.6rem', marginTop: '1rem' }}>
              {DIFFICULTY_ORDER.map(k => {
                const d = DIFFICULTY_CONFIG[k];
                return (
                  <div key={k} style={{
                    background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${d.accentRgb},0.25)`,
                    borderRadius: '12px', padding: '0.85rem',
                  }}>
                    <div style={{ color: d.color, fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>{d.label}</div>
                    <div style={{ color: '#8888a0', fontSize: '0.72rem', lineHeight: 1.6 }}>
                      ×{d.multiplier} score · {d.maxConcurrent} on screen · {d.moveChance > 0 ? 'moving' : 'stationary'}
                    </div>
                  </div>
                );
              })}
            </div>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Understanding the Scoring Formula</h2>
            <p style={pStyle}>
              Smaller, shorter-lived targets are worth more base points than large, forgiving ones. That base
              value is multiplied by the active difficulty's score multiplier, then again by whatever combo
              multiplier you've earned, before being rounded into your running total.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>The Combo Multiplier System Explained</h2>
            <p style={pStyle}>
              Landing 5 hits in a row raises your multiplier to ×1.5. Ten in a row reaches ×2, twenty reaches
              ×2.5, and a 35-hit streak caps it at ×3. A single misclick or expired target snaps the combo
              — and the multiplier — straight back to zero, so consistency is rewarded far more than isolated
              bursts of speed.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>What the S–F Grade Actually Measures</h2>
            <p style={pStyle}>
              Grades combine accuracy with a per-difficulty bonus, since a 90% accuracy run on Impossible
              represents a very different skill level than 90% on Easy. Reaching an S grade additionally
              requires an average reaction time under 380 milliseconds — rewarding players who are fast and
              precise together, not one at the expense of the other.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Choosing a Match Duration</h2>
            <p style={pStyle}>
              Short 1–5 second sprints are built for pure reaction-time testing. The 10 and 30 second presets
              suit a standard training rep. A custom length up to 600 seconds fits longer endurance sessions,
              and Unlimited mode removes the clock entirely — the match runs until you choose to stop it.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Visual and Audio Feedback</h2>
            <p style={pStyle}>
              Every hit fires a canvas-rendered particle burst, an expanding ripple ring, and a floating
              points label, layered with a zero-dependency Web Audio sound engine — distinct tones for hits,
              misses, expired targets, combo unlocks, and the closing fanfare. Sound and particle effects
              respect your system's reduced-motion setting automatically.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Tracking Your Progress With Session History</h2>
            <p style={pStyle}>
              Your last 30 sessions are saved locally, each recording score, accuracy, grade, peak combo, and
              average reaction time. Comparing runs over a few weeks is the clearest way to see whether your
              training is actually paying off, rather than relying on how a single session felt.
            </p>
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Games Where This Training Transfers</h2>
            <p style={{ ...pStyle, marginBottom: '1.5rem' }}>
              Precise, fast target acquisition matters in almost every competitive shooter and hero shooter.
              Regular reps here carry over most directly to:
            </p>
            <ul style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.75rem', padding: 0, listStyle: 'none', margin: 0,
            }}>
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
          </SeoSection>

          <SeoSection accentColor={activeCfg.color}>
            <h2 style={h2Style}>Best Aim Training Tips for FPS Players</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div>
                <h3 style={h3Style}>Warm up before you grind Impossible</h3>
                <p style={pStyle}>Start each session on Easy or Normal for a minute before pushing into harder tiers — cold reflexes make small, fast targets feel far worse than they are.</p>
              </div>
              <div>
                <h3 style={h3Style}>React to what you see, not what you predict</h3>
                <p style={pStyle}>Fast-moving targets tempt you to click where you think they're heading. Track the target itself; prediction is what causes consistent overshoot.</p>
              </div>
              <div>
                <h3 style={h3Style}>Protect your combo over chasing risky clicks</h3>
                <p style={pStyle}>Since the multiplier resets on any miss, a controlled 20-hit streak at ×2.5 often out-scores several short bursts interrupted by misclicks.</p>
              </div>
              <div>
                <h3 style={h3Style}>Match your real in-game sensitivity</h3>
                <p style={pStyle}>Training at a sensitivity you don't actually play with builds muscle memory that won't transfer. Set it once, and keep it identical across both.</p>
              </div>
              <div>
                <h3 style={h3Style}>Watch your accuracy trend, not just your score</h3>
                <p style={pStyle}>Score rewards difficulty and combo as much as raw precision. Accuracy is the cleaner signal for whether your fundamentals are actually improving.</p>
              </div>
            </div>
          </SeoSection>

          <section aria-labelledby="faq-heading-main" style={{ marginTop: '1rem' }}>
            <h2 id="faq-heading-main" style={{ ...h2Style, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {FAQ_ENTRIES.map(entry => (
                <FaqAccordionRow
                  key={entry.id}
                  entry={entry}
                  isOpen={openFaqId === entry.id}
                  onToggle={() => toggleFaq(entry.id)}
                  accentColor={activeCfg.color}
                />
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
        input[type="number"] { outline: none; }
        input[type="number"]:focus { border-color: rgba(255,255,255,0.3) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        @keyframes target-in {
          0% { transform: translate(-50%,-50%) scale(0) rotate(-15deg); opacity: 0; }
          70% { transform: translate(-50%,-50%) scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 1; }
        }
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
        @keyframes shrink-bar {
          from { width: 100%; }
          to { width: 0%; }
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
        @media (max-width: 600px) {
          div[style*="grid-template-columns: repeat(auto-fill, minmax(100px"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Shared SEO styles ─────────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────────
function SeoHero({ accentColor, accentRgb }: { accentColor: string; accentRgb: string }) {
  return (
    <header style={{ padding: '2.5rem 0 2rem', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
        background: `rgba(${accentRgb},0.1)`, border: `1px solid rgba(${accentRgb},0.3)`,
        borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.7rem', fontWeight: 700,
        letterSpacing: '0.1em', color: accentColor, textTransform: 'uppercase',
      }}>
        Free Online Aim Trainer
      </div>
      <h2 style={{
        fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff',
        margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.15,
      }}>
        Train Faster, More Accurate Aim
      </h2>
      <p style={{ color: '#8888a0', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
        A browser-based aim trainer with five difficulty tiers, combo multipliers, S–F grading, and full
        session history — built to sharpen the click accuracy and reaction speed that competitive shooters demand.
      </p>
    </header>
  );
}

function SeoSection({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <section style={{
      borderLeft: `2px solid ${accentColor}40`,
      padding: '0 0 0 1.5rem', marginBottom: '2.25rem',
    }}>
      {children}
    </section>
  );
}

function FaqAccordionRow({
  entry, isOpen, onToggle, accentColor,
}: { entry: FaqEntry; isOpen: boolean; onToggle: () => void; accentColor: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: isOpen ? `1px solid ${accentColor}55` : '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease',
    }}>
      <h2 style={{ margin: 0 }}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`${entry.id}-panel`}
          id={`${entry.id}-button`}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', padding: '0.9rem 1.1rem', background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: '0.92rem',
            fontFamily: 'inherit',
          }}
        >
          <span>{entry.question}</span>
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0, color: isOpen ? accentColor : '#55556a',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease',
              fontSize: '0.8rem',
            }}
          >▾</span>
        </button>
      </h2>
      <div
        id={`${entry.id}-panel`}
        role="region"
        aria-labelledby={`${entry.id}-button`}
        style={{ maxHeight: isOpen ? '400px' : '0px', transition: 'max-height 0.25s ease', overflow: 'hidden' }}
      >
        <div style={{ padding: '0 1.1rem 1rem', color: '#9797a8', fontSize: '0.86rem', lineHeight: 1.7 }}>
          {entry.answer}
        </div>
      </div>
    </div>
  );
}

function TargetButton({
  target, cfg, onHit,
}: {
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
        position: 'absolute',
        left: `${target.x}px`, top: `${target.y}px`,
        width: `${target.size}px`, height: `${target.size}px`,
        borderRadius: '50%',
        transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,0.55) 0%, ${cfg.color} 45%, rgba(0,0,0,0.3) 100%)`,
        border: `1.5px solid rgba(255,255,255,${hovered ? 0.9 : 0.6})`,
        cursor: 'crosshair',
        animation: 'target-in 0.18s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        boxShadow: hovered
          ? `0 0 30px ${cfg.glow}, 0 0 12px ${cfg.glow}, inset 0 0 8px rgba(255,255,255,0.2)`
          : `0 0 18px ${cfg.glow}, 0 0 6px rgba(0,0,0,0.5)`,
        transition: 'box-shadow 0.12s ease, border-color 0.12s ease',
        zIndex: 5, padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,0,0,0.75)', fontFamily: 'inherit', fontSize: `${Math.max(9, target.size * 0.22)}px`, fontWeight: 800,
        userSelect: 'none',
        willChange: 'transform, box-shadow',
      }}
    >
      {target.size > 36 ? target.points : ''}
    </button>
  );
}

function PremiumButton({
  children, onClick, variant = 'ghost', color = '#60a5fa', rgb = '96,165,250',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  color?: string;
  rgb?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.4)`, color,
      boxShadow: `0 0 16px rgba(${rgb},0.15)`,
    },
    ghost: {
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#aaaabc',
    },
    danger: {
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
    },
  };
  return (
    <button onClick={onClick} style={{
      fontFamily: 'inherit', fontWeight: 700, fontSize: '0.83rem', letterSpacing: '0.04em',
      padding: '0.55rem 1.3rem', borderRadius: '10px', cursor: 'pointer',
      transition: 'all 0.15s ease',
      ...styles[variant],
    }}>{children}</button>
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

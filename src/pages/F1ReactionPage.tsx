import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 900;
const LIGHTS_COMPLETE_MS = LIGHT_COUNT * LIGHT_INTERVAL_MS;
const CONFETTI_DURATION_MS = 3000;
const COPIED_RESET_MS = 2500;
const MAX_HISTORY_DISPLAY = 20;
const MAX_HISTORY_CHART = 10;
const MIN_BUTTON_SIZE = 44;

const MODE_DELAYS: Record<Mode, [number, number]> = {
  Rookie: [800, 2500],
  Pro: [1500, 4000],
  'F1 Elite': [2500, 6000],
};

const RATING_THRESHOLDS = [
  { max: 150, text: 'F1 Driver Level', color: '#e040fb' },
  { max: 200, text: 'Alien Reflexes', color: '#00e5ff' },
  { max: 250, text: 'Excellent', color: '#00f5b4' },
  { max: 300, text: 'Great', color: '#ff7a00' },
  { max: 400, text: 'Average', color: '#94a3b8' },
] as const;

const THEME = {
  bg: '#070b12',
  cardBg: '#111823',
  border: '#1b2636',
  cyan: '#00e5ff',
  green: '#00f5b4',
  orange: '#ff7a00',
  textMuted: '#64748b',
  textLight: '#f8fafc',
  f1Red: '#ff2a4b',
} as const;

const CONFETTI_COLORS = [THEME.cyan, THEME.green, THEME.orange, '#fff'];
const CONFETTI_COUNT = 60;

const STORAGE_KEYS = {
  history: 'f1rt_hist',
  fouls: 'f1rt_fouls',
  muted: 'f1rt_muted',
} as const;

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', icon: '🏁', label: 'First Race', check: (h) => h.length >= 1 },
  { id: 'a2', icon: '⚡', label: 'Sub 300ms', check: (h) => h.some((x) => x.time < 300) },
  { id: 'a3', icon: '🔥', label: 'Sub 250ms', check: (h) => h.some((x) => x.time < 250) },
  { id: 'a4', icon: '🚀', label: 'Sub 200ms', check: (h) => h.some((x) => x.time < 200) },
  { id: 'a5', icon: '👽', label: 'Sub 150ms', check: (h) => h.some((x) => x.time < 150) },
  { id: 'a6', icon: '🥈', label: '10 Races', check: (h) => h.length >= 10 },
  { id: 'a7', icon: '🥇', label: '50 Races', check: (h) => h.length >= 50 },
  { id: 'a8', icon: '🏆', label: '100 Races', check: (h) => h.length >= 100 },
];

const FAQ_ITEMS = [
  {
    q: 'What makes the F1 Reaction Test different from standard reaction tests?',
    a: 'A regular reaction utility usually relies on a simple, unpredictable full-screen color shift. The F1 variant builds anticipation with five sequential warning lamps followed by a highly randomized suspension phase before turning off, mirroring the high-stress conditions found in competitive gaming and real motorsport.',
  },
  {
    q: 'Can this tool directly help increase my maximum CPS click capacity?',
    a: 'Yes. By diminishing the inherent visual processing lag, it directly compresses your execution latency when you click down to trigger standard counting tools, yielding cleaner initial bursts and higher overall CPS scores.',
  },
  {
    q: 'How can I shave milliseconds off my personal best score?',
    a: 'Minimize hardware processing latency by leveraging high polling-rate gaming gear, ensure you are fully hydrated, eliminate background distractions, and consistently practice short intervals daily. Warming up your fingers before testing also helps.',
  },
  {
    q: 'What is the average human reaction time?',
    a: 'The average human simple visual reaction time is approximately 250ms. Trained athletes and esports professionals often achieve 150–200ms through consistent practice and optimized setups.',
  },
  {
    q: 'Does screen size or device type affect my score?',
    a: 'Display latency can marginally affect results. Using a monitor with low response time and a high refresh rate (144Hz+) provides the most accurate baseline. On mobile, ensure your screen brightness is high and tap response is enabled.',
  },
];

const SCORE_CHART_ROWS = [
  { range: '< 150 ms', rating: 'F1 Driver Level', equivalent: 'God-Tier Speed (Verstappen / Hamilton Level)', color: '#e040fb' },
  { range: '150 – 200 ms', rating: 'Alien Reflexes', equivalent: 'Tier-1 Esports Professional Athlete', color: '#00e5ff' },
  { range: '200 – 250 ms', rating: 'Excellent', equivalent: 'Hardcore High-Tier Competitive Gamer', color: '#00f5b4' },
  { range: '250 – 300 ms', rating: 'Great', equivalent: 'Standard Average Human Response Baseline', color: '#ff7a00' },
  { range: '300 – 400 ms', rating: 'Average', equivalent: 'Casual Gamer / Occasional Player', color: '#94a3b8' },
  { range: '> 400 ms', rating: 'Rookie', equivalent: 'Needs Dedicated Warm-Ups and Focus Training', color: '#64748b' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'lighting' | 'ready' | 'foul' | 'result';
type Mode = 'Rookie' | 'Pro' | 'F1 Elite';

interface HistoryItem {
  id: string;
  time: number;
  mode: Mode;
  date: number;
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  check: (hist: HistoryItem[]) => boolean;
}

interface ConfettiPiece {
  id: number;
  color: string;
  left: string;
  size: string;
  delay: string;
  radius: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeParseInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail (e.g. private browsing quota exceeded)
  }
}

function isValidHistoryItem(item: unknown): item is HistoryItem {
  if (!item || typeof item !== 'object') return false;
  const h = item as Record<string, unknown>;
  return (
    typeof h.id === 'string' &&
    typeof h.time === 'number' &&
    Number.isFinite(h.time) &&
    h.time > 0 &&
    typeof h.mode === 'string' &&
    ['Rookie', 'Pro', 'F1 Elite'].includes(h.mode as string) &&
    typeof h.date === 'number'
  );
}

function sanitizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidHistoryItem).slice(0, 1000);
}

function getRating(ms: number): { text: string; color: string } {
  for (const tier of RATING_THRESHOLDS) {
    if (ms < tier.max) return { text: tier.text, color: tier.color };
  }
  return { text: 'Rookie', color: THEME.textMuted };
}

function getBarColor(ms: number): string {
  if (ms < 150) return '#e040fb';
  if (ms < 200) return THEME.cyan;
  if (ms < 250) return THEME.green;
  if (ms < 300) return THEME.orange;
  return '#334155';
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    size: `${4 + Math.random() * 8}px`,
    delay: `${Math.random() * 0.5}s`,
    radius: Math.random() > 0.5 ? '50%' : '2px',
  }));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function vibrateDevice(pattern: number | number[]): void {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Not supported
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function F1ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('Pro');
  const [lights, setLights] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const startTime = useRef<number>(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persist muted state without stale closure ──────────────────────────────
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ── Load persisted state ───────────────────────────────────────────────────
  useEffect(() => {
    const rawHistory = safeParseJSON(safeLocalStorageGet(STORAGE_KEYS.history), []);
    setHistory(sanitizeHistory(rawHistory));
    setFalseStarts(safeParseInt(safeLocalStorageGet(STORAGE_KEYS.fouls), 0));
    setIsMuted(safeLocalStorageGet(STORAGE_KEYS.muted) === 'true');
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      try {
        audioCtx.current?.close();
      } catch {
        // Ignore
      }
    };
  }, []);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const initAudio = useCallback(() => {
    if (!audioCtx.current && !isMutedRef.current) {
      try {
        const AudioContextCtor =
          window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextCtor) {
          audioCtx.current = new AudioContextCtor();
        }
      } catch {
        // Audio not available
      }
    }
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, dur: number, freqEnd?: number) => {
      if (isMutedRef.current || !audioCtx.current) return;
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (freqEnd) {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + dur);
        }
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch {
        // Audio error
      }
    },
    [],
  );

  const playLight = useCallback(() => playTone(440, 'sine', 0.08), [playTone]);
  const playFoul = useCallback(() => playTone(150, 'sawtooth', 0.35, 50), [playTone]);

  const playRecord = useCallback(() => {
    if (isMutedRef.current || !audioCtx.current) return;
    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const notes: [number, number][] = [
      [523, 0],
      [659, 0.1],
      [784, 0.2],
      [1047, 0.35],
    ];
    notes.forEach(([f, t]) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);
        gain.gain.setValueAtTime(0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.15);
      } catch {
        // Audio error
      }
    });
  }, []);

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
    return t;
  };

  // ── Confetti ───────────────────────────────────────────────────────────────
  const spawnConfetti = useCallback(() => {
    setConfetti(generateConfetti());
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => setConfetti([]), CONFETTI_DURATION_MS);
  }, []);

  // ── Start sequence ─────────────────────────────────────────────────────────
  const startSequence = useCallback(() => {
    initAudio();
    clearTimers();
    setReactionTime(null);
    setIsNewRecord(false);
    setPhase('lighting');
    setLights(0);

    for (let i = 1; i <= LIGHT_COUNT; i++) {
      addTimer(() => {
        setLights(i);
        playLight();
        vibrateDevice(20);
      }, i * LIGHT_INTERVAL_MS);
    }

    const [min, max] = MODE_DELAYS[mode];
    const rand = Math.random() * (max - min) + min;

    addTimer(() => {
      setPhase('ready');
      setLights(0);
      startTime.current = performance.now();
    }, LIGHTS_COMPLETE_MS + rand);
  }, [mode, initAudio, playLight]);

  // ── Interaction handler ────────────────────────────────────────────────────
  const handleInteraction = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        if (e.type === 'touchstart') e.preventDefault();
        e.stopPropagation();
      }
      vibrateDevice(30);

      if (phase === 'idle' || phase === 'result' || phase === 'foul') {
        startSequence();
      } else if (phase === 'lighting') {
        clearTimers();
        setPhase('foul');
        setLights(0);
        setFalseStarts((prev) => {
          const next = prev + 1;
          safeLocalStorageSet(STORAGE_KEYS.fouls, String(next));
          return next;
        });
        playFoul();
        vibrateDevice([100, 50, 100]);
      } else if (phase === 'ready') {
        const time = Math.round(performance.now() - startTime.current);
        setReactionTime(time);
        setPhase('result');

        setHistory((prevHistory) => {
          const pb = prevHistory.length ? Math.min(...prevHistory.map((h) => h.time)) : Infinity;
          const record = time < pb;
          setIsNewRecord(record);

          if (record) {
            playRecord();
            spawnConfetti();
            vibrateDevice([50, 30, 50, 30, 100]);
          }

          const newHistory: HistoryItem[] = [
            { id: generateId(), time, mode, date: Date.now() },
            ...prevHistory,
          ];
          safeLocalStorageSet(STORAGE_KEYS.history, JSON.stringify(newHistory));
          return newHistory;
        });
      }
    },
    [phase, mode, startSequence, playFoul, playRecord, spawnConfetti],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleInteraction();
      }
      if (e.key.toLowerCase() === 'r' && phase !== 'lighting') {
        startSequence();
      }
      if (e.key.toLowerCase() === 's') {
        setIsMuted((prev) => {
          const next = !prev;
          safeLocalStorageSet(STORAGE_KEYS.muted, String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleInteraction, startSequence]);

  // ── Derived analytics ──────────────────────────────────────────────────────
  const { pbValue, avgValue, recentReverse, maxTime, minTime, timeRange } = useMemo(() => {
    const pb = history.length ? Math.min(...history.map((h) => h.time)) : null;
    const recentTimes = history.slice(0, MAX_HISTORY_CHART).map((h) => h.time);
    const avg = recentTimes.length
      ? Math.round(recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length)
      : null;
    const reversed = history.slice(0, MAX_HISTORY_CHART).reverse();
    const max = reversed.length ? Math.max(...reversed.map((h) => h.time)) : 1;
    const min = reversed.length ? Math.min(...reversed.map((h) => h.time)) : 0;
    const range = max - min || 1;
    return { pbValue: pb, avgValue: avg, recentReverse: reversed, maxTime: max, minTime: min, timeRange: range };
  }, [history]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(history) })),
    [history],
  );

  // ── Share ──────────────────────────────────────────────────────────────────
  const shareScore = useCallback(async () => {
    if (!reactionTime) return;
    const r = getRating(reactionTime);
    const text = `🏎️ F1 Lights Out Reaction Test\n⏱️ My time: ${reactionTime}ms\n🏆 Rating: ${r.text}\nCan you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'F1 Reaction Test', text });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setCopied(true);
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      }
    } catch {
      // User cancelled or clipboard not available
    }
  }, [reactionTime]);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      safeLocalStorageSet(STORAGE_KEYS.muted, String(next));
      return next;
    });
  }, []);

  // ── Arena border color ─────────────────────────────────────────────────────
  const arenaBorderColor =
    phase === 'foul'
      ? 'rgba(255,42,75,0.3)'
      : phase === 'ready'
        ? 'rgba(0,245,180,0.2)'
        : THEME.border;

  const arenaBgColor =
    phase === 'foul'
      ? 'rgba(255,42,75,0.03)'
      : phase === 'ready'
        ? 'rgba(0,245,180,0.02)'
        : THEME.cardBg;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: THEME.bg,
        backgroundImage: `
          linear-gradient(rgba(27, 38, 54, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(27, 38, 54, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        color: THEME.textLight,
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)',
        overflowX: 'hidden',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box',
      }}
    >
      {/* Global styles */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-text-size-adjust: 100%; }
        @keyframes fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        /* Scrollable table on narrow screens */
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        /* History scroll */
        .history-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        /* Prevent iOS double-tap zoom on buttons */
        button { touch-action: manipulation; }
        /* Focus ring for keyboard nav */
        :focus-visible { outline: 2px solid #00e5ff; outline-offset: 2px; }
      `}</style>

      {/* Confetti layer */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 999,
          overflow: 'hidden',
        }}
      >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              top: '-10px',
              left: piece.left,
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              borderRadius: piece.radius,
              animation: `fall ${1.5 + Math.random() * 2}s ${piece.delay} linear forwards`,
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                color: THEME.cyan,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                padding: '5px 14px',
                borderRadius: '100px',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: THEME.cyan }} />
              F1 LIGHTS OUT
            </div>

            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(2rem, 6vw, 4.2rem)',
                fontWeight: 900,
                letterSpacing: '-1px',
                lineHeight: 0.95,
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: '12px',
                margin: '0 0 12px 0',
              }}
            >
              F1 REACTION<br />
              <span style={{ color: THEME.green }}>TIME TEST</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                color: '#64748b',
                fontWeight: 400,
                maxWidth: '500px',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              Wait for all 5 red lights — when they go out, react instantly.
            </p>
          </div>

          {/* Mode selector + mute */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '10px',
            }}
          >
            <div
              role="group"
              aria-label="Difficulty mode"
              style={{
                display: 'flex',
                backgroundColor: THEME.cardBg,
                border: `1px solid ${THEME.border}`,
                borderRadius: '10px',
                padding: '4px',
                gap: '2px',
              }}
            >
              {(['Rookie', 'Pro', 'F1 Elite'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => phase !== 'lighting' && setMode(m)}
                  disabled={phase === 'lighting'}
                  aria-pressed={mode === m}
                  aria-label={`Set difficulty to ${m}`}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(11px, 2vw, 13px)',
                    fontWeight: 700,
                    letterSpacing: '.5px',
                    padding: `${Math.max(6, (MIN_BUTTON_SIZE - 18) / 2)}px clamp(10px, 2vw, 14px)`,
                    minHeight: `${MIN_BUTTON_SIZE}px`,
                    border: 'none',
                    borderRadius: '7px',
                    cursor: phase === 'lighting' ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                    backgroundColor: mode === m ? THEME.green : 'transparent',
                    color: mode === m ? '#000' : THEME.textMuted,
                    boxShadow: mode === m ? '0 2px 12px rgba(0, 245, 180, 0.4)' : 'none',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              aria-pressed={isMuted}
              style={{
                width: `${MIN_BUTTON_SIZE}px`,
                height: `${MIN_BUTTON_SIZE}px`,
                border: `1px solid ${THEME.border}`,
                borderRadius: '10px',
                backgroundColor: THEME.cardBg,
                color: THEME.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </header>

        {/* ── Arena ── */}
        <main
          role="button"
          tabIndex={0}
          aria-label={
            phase === 'idle'
              ? 'Press to start the reaction test'
              : phase === 'lighting'
              ? 'Wait for lights to go out — press now to trigger false start'
              : phase === 'ready'
              ? 'Lights out! Tap or press now!'
              : phase === 'foul'
              ? 'False start! Tap to try again'
              : reactionTime !== null
              ? `Your reaction time was ${reactionTime} milliseconds. Tap to retry.`
              : 'Reaction test arena'
          }
          onMouseDown={(e) => { if (e.button === 0) handleInteraction(e); }}
          onTouchStart={handleInteraction}
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.key === 'Enter') {
              e.preventDefault();
              handleInteraction();
            }
          }}
          style={{
            position: 'relative',
            borderRadius: '16px',
            border: `1px solid ${arenaBorderColor}`,
            backgroundColor: arenaBgColor,
            cursor: 'pointer',
            userSelect: 'none',
            touchAction: 'manipulation',
            minHeight: 'clamp(280px, 45vw, 340px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(1.25rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1rem)',
            backdropFilter: 'blur(4px)',
            outline: 'none',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${THEME.cyan}, transparent)`,
              opacity: 0.3,
            }}
          />

          {/* Gantry */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '.75rem',
              zIndex: 2,
              width: '100%',
            }}
          >
            <div
              role="img"
              aria-label={`Starting lights: ${lights} of 5 lit`}
              style={{
                background: '#090d14',
                border: `1px solid ${THEME.border}`,
                borderRadius: '14px',
                padding: 'clamp(10px, 3vw, 20px) clamp(12px, 4vw, 28px)',
                display: 'flex',
                gap: 'clamp(8px, 2.5vw, 20px)',
                boxShadow: 'inset 0 8px 24px rgba(0,0,0,.5)',
                flexWrap: 'nowrap',
              }}
            >
              {Array.from({ length: LIGHT_COUNT }).map((_, i) => {
                const isOn = lights > i;
                const lightStyle: React.CSSProperties = {
                  width: 'clamp(30px, 7vw, 60px)',
                  height: 'clamp(30px, 7vw, 60px)',
                  borderRadius: '50%',
                  border: '3px solid #1a2332',
                  backgroundColor: isOn ? THEME.f1Red : '#070a0f',
                  boxShadow: isOn
                    ? `0 0 20px ${THEME.f1Red}, 0 0 40px rgba(255,42,75,0.4)`
                    : 'none',
                  transition: 'all 60ms linear',
                  flexShrink: 0,
                };
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 2vw, 14px)' }}>
                    <div style={lightStyle} />
                    <div style={lightStyle} />
                  </div>
                );
              })}
            </div>
            <div
              aria-hidden="true"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                letterSpacing: '3px',
                color: THEME.textMuted,
                textTransform: 'uppercase',
              }}
            >
              Starting Lights Gantry
            </div>
          </div>

          {/* State machine display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '.75rem',
              zIndex: 2,
              minHeight: '140px',
              justifyContent: 'center',
              width: '100%',
              padding: '0 0.5rem',
            }}
          >
            {phase === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Ready to Test?
                </p>
                <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', color: THEME.textMuted, margin: 0 }}>
                  Tap the screen or press SPACE when the lights go out.
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
                  aria-label="Start the reaction test"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: THEME.green,
                    color: '#000',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    padding: 'clamp(12px, 2vw, 14px) clamp(24px, 5vw, 32px)',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 245, 180, 0.3)',
                    minHeight: `${MIN_BUTTON_SIZE}px`,
                  }}
                >
                  🏁 Start Engine
                </button>
              </div>
            )}

            {phase === 'lighting' && (
              <p
                aria-live="assertive"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  color: THEME.f1Red,
                  margin: 0,
                }}
              >
                Wait For Lights...
              </p>
            )}

            {phase === 'ready' && (
              <p
                aria-live="assertive"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  color: THEME.cyan,
                  textShadow: 'rgba(0,229,255,.4) 0 0 30px',
                  margin: 0,
                }}
              >
                TAP NOW!
              </p>
            )}

            {phase === 'foul' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                <p
                  aria-live="assertive"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(1.6rem, 5vw, 3rem)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: THEME.f1Red,
                    letterSpacing: '2px',
                    margin: 0,
                  }}
                >
                  ⛔ Jump Start!
                </p>
                <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', color: '#f87171', margin: 0 }}>
                  You reacted before the lights went out.
                </p>
                <p style={{ fontSize: 'clamp(0.7rem, 2vw, 0.75rem)', color: THEME.textMuted, marginTop: '8px' }}>
                  Tap anywhere to try again
                </p>
              </div>
            )}

            {phase === 'result' && reactionTime !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                {isNewRecord && (
                  <p
                    aria-live="polite"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                      fontWeight: 700,
                      letterSpacing: '3px',
                      color: THEME.orange,
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    ★ New Personal Best ★
                  </p>
                )}
                <div
                  aria-live="polite"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 'clamp(3rem, 12vw, 7rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    color: getRating(reactionTime).color,
                  }}
                >
                  {reactionTime}
                  <span
                    style={{
                      fontSize: 'clamp(1rem, 3vw, 2rem)',
                      fontWeight: 400,
                      color: THEME.textMuted,
                      marginLeft: '4px',
                    }}
                  >
                    ms
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: '#fff',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Rating: {getRating(reactionTime).text}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); startSequence(); }}
                    aria-label="Retry the reaction test"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#1e293b',
                      border: `1px solid ${THEME.border}`,
                      color: '#f0f0f0',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '10px 20px',
                      minHeight: `${MIN_BUTTON_SIZE}px`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    ↺ Retry
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); shareScore(); }}
                    aria-label={copied ? 'Score copied to clipboard' : 'Share your score'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: THEME.cyan,
                      border: 'none',
                      color: '#000',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '10px 20px',
                      minHeight: `${MIN_BUTTON_SIZE}px`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,229,255,0.3)',
                    }}
                  >
                    {copied ? '✓ Copied!' : '↗ Share'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Keyboard hints */}
        <p
          aria-hidden="true"
          style={{
            textAlign: 'center',
            fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
            color: THEME.textMuted,
            letterSpacing: '.5px',
            marginTop: '.5rem',
          }}
        >
          [SPACE / ENTER] React &nbsp;•&nbsp; [R] Restart &nbsp;•&nbsp; [S] Toggle Sound
        </p>

        {/* ── Stats dashboard ── */}
        <section aria-label="Performance statistics">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '.75rem',
              marginTop: '1rem',
            }}
          >
            {[
              { icon: '🏆', label: 'Personal Best', value: pbValue ? `${pbValue}ms` : '—', color: THEME.cyan },
              { icon: '📊', label: 'Avg (Last 10)', value: avgValue ? `${avgValue}ms` : '—', color: THEME.green },
              { icon: '🏎️', label: 'Total Races', value: String(history.length), color: THEME.textLight },
              { icon: '⚡', label: 'False Starts', value: String(falseStarts), color: THEME.orange },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '12px',
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.9rem, 2.5vw, 1.2rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.75rem',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: `1px solid ${THEME.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '.65rem',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: THEME.textMuted,
                      marginBottom: '2px',
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    aria-label={`${stat.label}: ${stat.value}`}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                      fontWeight: 700,
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Panels: Achievements + History ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '.75rem',
            marginTop: '.75rem',
          }}
        >
          {/* Achievements */}
          <section
            aria-label="Achievements"
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.border}`,
              borderRadius: '12px',
              padding: 'clamp(1rem, 3vw, 1.25rem)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '.85rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: THEME.cyan,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 1rem 0',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '16px' }}>🏅</span>
              Achievements
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {unlockedAchievements.map((achv) => {
                const isGold = achv.unlocked && (achv.id === 'a5' || achv.id === 'a8');
                return (
                  <div
                    key={achv.id}
                    role="status"
                    aria-label={`${achv.label} — ${achv.unlocked ? 'unlocked' : 'locked'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      minHeight: '32px',
                      borderRadius: '8px',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      letterSpacing: '.5px',
                      textTransform: 'uppercase',
                      transition: 'all .2s',
                      border: `1px solid ${isGold ? 'rgba(255,122,0,.3)' : achv.unlocked ? THEME.border : '#1e293b'}`,
                      backgroundColor: isGold ? 'rgba(255,122,0,.1)' : achv.unlocked ? '#1e293b' : 'transparent',
                      color: isGold ? THEME.orange : achv.unlocked ? '#fff' : '#334155',
                      opacity: achv.unlocked ? 1 : 0.3,
                    }}
                  >
                    <span aria-hidden="true">{achv.icon}</span>
                    {achv.label}
                  </div>
                );
              })}
            </div>
          </section>

          {/* History */}
          <section
            aria-label="Recent race history"
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.border}`,
              borderRadius: '12px',
              padding: 'clamp(1rem, 3vw, 1.25rem)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '.85rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: THEME.green,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 1rem 0',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '16px' }}>📈</span>
              Recent History
            </h2>

            {history.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: THEME.textMuted, fontSize: '.85rem', margin: 0 }}>
                Complete a race to see history.
              </p>
            ) : (
              <>
                {/* Mini bar chart */}
                <div
                  aria-hidden="true"
                  style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    marginBottom: '.75rem',
                    padding: '0 2px',
                  }}
                >
                  {recentReverse.map((h) => {
                    const heightPct = 20 + ((h.time - minTime) / timeRange) * 80;
                    return (
                      <div
                        key={h.id}
                        style={{
                          flex: 1,
                          borderRadius: '3px 3px 0 0',
                          minHeight: '4px',
                          height: `${heightPct}%`,
                          backgroundColor: getBarColor(h.time),
                          opacity: 0.85,
                        }}
                        title={`${h.time}ms`}
                      />
                    );
                  })}
                </div>

                <div
                  className="history-scroll"
                  style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', maxHeight: '170px' }}
                >
                  {history.slice(0, MAX_HISTORY_DISPLAY).map((h, i) => {
                    const rating = getRating(h.time);
                    const isPB = h.time === Math.min(...history.map((x) => x.time));
                    return (
                      <div
                        key={h.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#0c111a',
                          border: `1px solid ${THEME.border}`,
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '.7rem',
                            color: THEME.textMuted,
                            fontFamily: "'JetBrains Mono', monospace",
                            width: '28px',
                            flexShrink: 0,
                          }}
                        >
                          #{history.length - i}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: rating.color,
                            flexShrink: 0,
                          }}
                        >
                          {h.time}ms{isPB ? ' ★' : ''}
                        </span>
                        <span
                          style={{
                            fontSize: '.6rem',
                            fontWeight: 700,
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            color: THEME.textMuted,
                            backgroundColor: THEME.cardBg,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${THEME.border}`,
                            flexShrink: 0,
                          }}
                        >
                          {h.mode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── SEO Article ── */}
        <article
          style={{
            marginTop: '4rem',
            borderTop: `1px solid ${THEME.border}`,
            paddingTop: '2.5rem',
            lineHeight: '1.7',
          }}
        >
          {/* Main article intro — H1 is above, this is the first H2 */}
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: '#94a3b8', marginBottom: '1.5rem' }}>
            In high-stakes competitive esports and real-life motorsports, victory is decided in fractions of a
            millisecond. Whether you are aiming to land a precision headshot in an FPS title or execute the
            perfect grid launch in Formula 1, your <strong>reaction time</strong> is the ultimate baseline. Our
            professional <strong>F1 Reaction Time Test</strong> — popularly known as the{' '}
            <em>F1 Lights Out Test</em> — faithfully replicates the official FIA Grand Prix starting-light
            sequence to help casual gamers, pro esports players and enthusiasts measure, optimize, and
            dominate their split-second cognitive response.
          </p>

          {/* H2 — How to Use */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            How to Use the F1 Reaction Time Test
          </h2>
          <ol style={{ color: '#94a3b8', paddingLeft: '1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Choose your difficulty</strong> — Rookie gives more reaction time; F1 Elite pushes you to the limit with longer, more unpredictable delays.</li>
            <li><strong>Press Start Engine</strong> (or tap the arena / press SPACE).</li>
            <li><strong>Watch the five red lights</strong> illuminate one by one.</li>
            <li><strong>React the instant all lights go out</strong> — tap, click, or press SPACE.</li>
            <li><strong>Read your result</strong>, compare with your personal best, and share with friends.</li>
          </ol>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Tapping before the lights go out registers a <em>Jump Start</em> (false start), just like in real
            Formula 1. The randomized delay after the fifth light prevents pattern learning, keeping every run
            genuinely challenging.
          </p>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 700,
              color: THEME.cyan,
              textTransform: 'uppercase',
              margin: '1.75rem 0 0.75rem 0',
            }}
          >
            Keyboard Shortcuts
          </h3>
          <ul style={{ color: '#94a3b8', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
            <li><kbd style={{ backgroundColor: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${THEME.border}`, fontSize: '0.85em' }}>SPACE</kbd> or <kbd style={{ backgroundColor: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${THEME.border}`, fontSize: '0.85em' }}>ENTER</kbd> — React / Start</li>
            <li><kbd style={{ backgroundColor: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${THEME.border}`, fontSize: '0.85em' }}>R</kbd> — Restart immediately</li>
            <li><kbd style={{ backgroundColor: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${THEME.border}`, fontSize: '0.85em' }}>S</kbd> — Toggle sound on / off</li>
          </ul>

          {/* H2 — What Is a Good Reaction Time? */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            What Is a Good Reaction Time?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            The average human simple visual reaction time is approximately <strong>250 ms</strong>. Trained
            esports athletes and motorsport professionals consistently achieve <strong>150–200 ms</strong>
            through deliberate practice and optimized hardware setups. Sub-150 ms results are exceptionally
            rare and place you in genuine F1-driver territory.
          </p>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Many players believe that scaling up scores on a <strong>CPS Test (Clicks Per Second)</strong> is
            purely about finger-muscle speed. In reality, clicking velocity is tethered to neuromuscular
            response latency — the precise window between your brain registering a visual trigger and your
            finger completing the motion. Reducing that window directly improves CPS scores.
          </p>

          {/* H2 — Score Chart */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            Reaction Time Score Chart
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Use this table to benchmark your result against competitive tiers:
          </p>

          <div className="table-scroll" style={{ marginBottom: '1.5rem', border: `1px solid ${THEME.border}`, borderRadius: '10px' }}>
            <table
              style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', minWidth: '480px' }}
              aria-label="Reaction time score benchmarks"
            >
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>Reaction Time</th>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>Rating</th>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>Real-World Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_CHART_ROWS.map((row, i) => (
                  <tr key={row.rating} style={{ backgroundColor: i % 2 !== 0 ? 'rgba(25, 30, 45, 0.4)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none', color: row.color, fontWeight: 'bold' }}>
                      {row.range}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none' }}>
                      {row.rating}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none' }}>
                      {row.equivalent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* H2 — How to Improve */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            How to Improve Your Reaction Time
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Consistent, targeted training is the most reliable path to shaving milliseconds off your score.
            Consider these evidence-backed strategies:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            <li>
              <strong>Daily short sessions:</strong> Ten focused runs per day builds neural pathways more
              effectively than occasional marathon sessions.
            </li>
            <li>
              <strong>Optimize hardware:</strong> A monitor with 1 ms response time and 144 Hz+ refresh rate,
              paired with a high-polling-rate mouse (1000 Hz+), minimizes system-introduced latency.
            </li>
            <li>
              <strong>Physical readiness:</strong> Stay hydrated, warm your fingers before testing, and avoid
              testing when fatigued — reaction time degrades measurably with fatigue and dehydration.
            </li>
            <li>
              <strong>Eliminate distractions:</strong> Background noise, notifications, and divided attention
              all increase processing delay by tens of milliseconds.
            </li>
            <li>
              <strong>Escalate difficulty gradually:</strong> Start on Rookie mode to build confidence, then
              progress through Pro and F1 Elite as your baseline improves.
            </li>
          </ul>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 700,
              color: THEME.green,
              textTransform: 'uppercase',
              margin: '1.75rem 0 0.75rem 0',
            }}
          >
            Avoiding False Starts
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Advanced clicking techniques such as Jitter Clicking or Butterfly Clicking require precise rhythm
            control. The strict Jump Start penalty system in this simulator conditions you to wait for the
            correct visual stimulus rather than anticipating it — a skill directly transferable to competitive
            gameplay where premature inputs result in cooldown or action cancellation.
          </p>

          {/* H2 — Why This Helps Gamers */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            Why This Test Helps Gamers
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            Integrating consistent F1 reaction training accelerates performance across multiple competitive disciplines:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            <li>
              <strong>FPS titles (CS2, Valorant, Apex):</strong> Lower reaction time translates directly to
              faster first-shot execution and reduced time-to-kill.
            </li>
            <li>
              <strong>Fighting games:</strong> Frame-precise punish windows demand sub-200 ms response to
              capitalize on opponent recovery gaps.
            </li>
            <li>
              <strong>Battle Royale:</strong> Faster looting, quicker weapon swaps and earlier aiming
              decisions all compound reaction speed advantages.
            </li>
            <li>
              <strong>CPS benchmarks:</strong> Optimizing click latency compresses starting delay on
              high-speed click counters, producing cleaner initial bursts and higher measured CPS scores.
            </li>
            <li>
              <strong>Real motorsport simulators:</strong> iRacing and F1 24 both reward consistent,
              well-timed throttle and brake inputs — skills this test directly trains.
            </li>
          </ul>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 700,
              color: THEME.cyan,
              textTransform: 'uppercase',
              margin: '1.75rem 0 0.75rem 0',
            }}
          >
            Shifting Into Elite Pro Tiers
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: 'clamp(0.9rem, 2vw, 0.98rem)' }}>
            While the global median reaction time sits around 250 ms, elite esports professionals and actual
            F1 grid drivers operate closer to the sub-150 ms mark. Regular structured training actively
            conditions your neural pathways to narrow that window — not through luck, but through measurable,
            progressive improvement tracked in your personal history panel above.
          </p>

          {/* H2 — FAQ */}
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '2.5rem 0 1rem 0',
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 3vw, 14px) clamp(14px, 4vw, 20px)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 'clamp(0.88rem, 2vw, 1rem)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    minHeight: `${MIN_BUTTON_SIZE}px`,
                    lineHeight: 1.4,
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: THEME.cyan,
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      transition: 'transform 0.2s',
                      transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    style={{
                      padding: '10px clamp(14px, 4vw, 20px) clamp(12px, 3vw, 14px)',
                      color: '#94a3b8',
                      fontSize: 'clamp(0.85rem, 2vw, 0.92rem)',
                      borderTop: `1px solid ${THEME.border}`,
                      lineHeight: 1.65,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

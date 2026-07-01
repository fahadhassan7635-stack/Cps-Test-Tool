import {
  useState, useRef, useCallback, useEffect, useReducer, useMemo
} from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'countdown' | 'running' | 'paused' | 'done';
type TargetType = 'normal' | 'fast' | 'tiny' | 'bonus' | 'penalty';
type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  type: TargetType;
  spawnTime: number;
  lifetime: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface SessionResult {
  id: string;
  date: string;
  score: number;
  accuracy: number;
  hits: number;
  misses: number;
  combo: number;
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
  misses: number;
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
  | { type: 'MISS' }
  | { type: 'UPDATE_HPS'; hps: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const GAME_DURATION = 30;
const SPAWN_INTERVAL = 700;
const TARGET_LIFETIME: Record<TargetType, number> = {
  normal: 1800,
  fast: 900,
  tiny: 1400,
  bonus: 2200,
  penalty: 2000,
};
const TARGET_COLORS: Record<TargetType, string> = {
  normal: 'radial-gradient(circle, #00f5ff 0%, #a855f7 100%)',
  fast:   'radial-gradient(circle, #f97316 0%, #ef4444 100%)',
  tiny:   'radial-gradient(circle, #a855f7 0%, #6366f1 100%)',
  bonus:  'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)',
  penalty:'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
};
const TARGET_GLOW: Record<TargetType, string> = {
  normal:  'rgba(0,245,255,0.5)',
  fast:    'rgba(249,115,22,0.5)',
  tiny:    'rgba(168,85,247,0.5)',
  bonus:   'rgba(251,191,36,0.6)',
  penalty: 'rgba(239,68,68,0.5)',
};
const TARGET_PROBS: [TargetType, number][] = [
  ['normal', 0.45],
  ['fast', 0.20],
  ['tiny', 0.15],
  ['bonus', 0.12],
  ['penalty', 0.08],
];
const COMBO_THRESHOLDS = [5, 10, 20, 30] as const;
const COMBO_MULTIPLIERS: Record<number, number> = { 0: 1, 5: 1.5, 10: 2, 20: 2.5, 30: 3 };
const STORAGE_KEY = 'mouse-accuracy-history';
const SETTINGS_KEY = 'mouse-accuracy-settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickTargetType(): TargetType {
  const r = Math.random();
  let acc = 0;
  for (const [type, prob] of TARGET_PROBS) {
    acc += prob;
    if (r < acc) return type;
  }
  return 'normal';
}

function getTargetSize(type: TargetType): number {
  switch (type) {
    case 'tiny':   return 14 + Math.random() * 12;
    case 'bonus':  return 28 + Math.random() * 18;
    case 'penalty':return 30 + Math.random() * 20;
    case 'fast':   return 22 + Math.random() * 20;
    default:       return 25 + Math.random() * 35;
  }
}

function calcPoints(type: TargetType, size: number, combo: number): number {
  const base = Math.round(100 * (50 / (size + 1)));
  const multiplier = getComboMultiplier(combo);
  switch (type) {
    case 'bonus':   return Math.round(base * 3 * multiplier);
    case 'penalty': return -Math.abs(Math.round(base * 0.5));
    case 'tiny':    return Math.round(base * 1.5 * multiplier);
    case 'fast':    return Math.round(base * 1.2 * multiplier);
    default:        return Math.round(base * multiplier);
  }
}

function getComboMultiplier(combo: number): number {
  const thresholds = Object.keys(COMBO_MULTIPLIERS).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (combo >= t) return COMBO_MULTIPLIERS[t];
  }
  return 1;
}

function calcGrade(accuracy: number, score: number): Grade {
  if (accuracy >= 95 && score >= 8000) return 'S';
  if (accuracy >= 85 && score >= 5000) return 'A';
  if (accuracy >= 75 && score >= 3000) return 'B';
  if (accuracy >= 60 && score >= 1500) return 'C';
  if (accuracy >= 45)                   return 'D';
  return 'F';
}

function calcStars(grade: Grade): number {
  return { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[grade];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialGameState: GameState = {
  score: 0, hits: 0, misses: 0, combo: 0, peakCombo: 0,
  streak: 0, bestStreak: 0, totalClicks: 0,
  reactionTimes: [], hitsPerSecBuffer: [], peakHitsPerSec: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET': return { ...initialGameState };
    case 'HIT': {
      const newCombo   = state.combo + 1;
      const newPeak    = Math.max(state.peakCombo, newCombo);
      const newStreak  = state.streak + 1;
      const newBest    = Math.max(state.bestStreak, newStreak);
      const newTimes   = [...state.reactionTimes, action.reactionTime].slice(-50);
      const newBuf     = [...state.hitsPerSecBuffer, action.timestamp].filter(t => action.timestamp - t < 1000);
      const newHPS     = Math.max(state.peakHitsPerSec, newBuf.length);
      return {
        ...state,
        score: Math.max(0, state.score + action.points),
        hits: state.hits + 1,
        combo: newCombo,
        peakCombo: newPeak,
        streak: newStreak,
        bestStreak: newBest,
        totalClicks: state.totalClicks + 1,
        reactionTimes: newTimes,
        hitsPerSecBuffer: newBuf,
        peakHitsPerSec: newHPS,
      };
    }
    case 'MISS':
      return { ...state, misses: state.misses + 1, combo: 0, streak: 0, totalClicks: state.totalClicks + 1 };
    case 'UPDATE_HPS': {
      return { ...state, peakHitsPerSec: Math.max(state.peakHitsPerSec, action.hps) };
    }
    default: return state;
  }
}

// ─── Sound Engine ─────────────────────────────────────────────────────────────

function useSoundEngine(enabled: boolean, volume: number) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number, type: OscillatorType, duration: number,
    gainVal: number, startFreq?: number
  ) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      const now = ctx.currentTime;
      if (startFreq !== undefined) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(frequency, now + duration * 0.5);
      } else {
        osc.frequency.setValueAtTime(frequency, now);
      }
      gain.gain.setValueAtTime(gainVal * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }, [enabled, volume, getCtx]);

  return {
    hit:        () => playTone(600, 'sine', 0.08, 0.3, 300),
    perfectHit: () => { playTone(880, 'sine', 0.1, 0.4); playTone(1320, 'sine', 0.1, 0.25); },
    miss:       () => playTone(150, 'sawtooth', 0.12, 0.2),
    combo:      (n: number) => playTone(400 + n * 20, 'square', 0.08, 0.2),
    countdown:  (n: number) => playTone(n === 0 ? 880 : 440, 'sine', 0.15, 0.35),
    finish:     () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.3), i * 120)); },
    click:      () => playTone(300, 'sine', 0.05, 0.15),
  };
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const pieces    = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; r: number; rot: number; rotV: number }>>([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors  = ['#00f5ff','#a855f7','#fbbf24','#10b981','#f97316','#ef4444'];
    pieces.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: 4 + Math.random() * 6,
      rot: 0,
      rotV: (Math.random() - 0.5) * 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });
      pieces.current = pieces.current.filter(p => p.y < canvas.height + 20);
      if (pieces.current.length > 0) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
      aria-hidden="true"
    />
  );
}

// ─── Crosshair Cursor ─────────────────────────────────────────────────────────

function CrosshairCursor({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (!active) return;
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [active]);

  if (!active) return null;
  const s = clicking ? 0.8 : 1;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', left: pos.x, top: pos.y, pointerEvents: 'none',
        zIndex: 9998, transform: `translate(-50%, -50%) scale(${s})`,
        transition: 'transform 0.05s ease',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="2"  fill="rgba(255,255,255,0.9)"/>
        <line x1="16" y1="2"  x2="16" y2="10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
        <line x1="16" y1="22" x2="16" y2="30" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
        <line x1="2"  y1="16" x2="10" y2="16" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
        <line x1="22" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

// ─── Accuracy Mini Graph ──────────────────────────────────────────────────────

function AccuracyGraph({ hits, total }: { hits: number; total: number }) {
  const acc = total > 0 ? Math.round((hits / total) * 100) : 100;
  const r   = 20, circ = 2 * Math.PI * r;
  const offset = circ - (acc / 100) * circ;
  const color  = acc >= 80 ? '#10b981' : acc >= 60 ? '#f97316' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`Accuracy: ${acc}%`}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
        <circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px', transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontWeight="700">{acc}%</text>
      </svg>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #666)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy</span>
    </div>
  );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────

interface ResultModalProps {
  result: SessionResult;
  onPlayAgain: () => void;
  onClose: () => void;
  onShare: () => void;
  prefersReducedMotion: boolean;
}

function ResultModal({ result, onPlayAgain, onClose, onShare, prefersReducedMotion }: ResultModalProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const gradeColors: Record<Grade, string> = {
    S: '#fbbf24', A: '#10b981', B: '#00f5ff', C: '#a855f7', D: '#f97316', F: '#ef4444'
  };
  const color = gradeColors[result.grade];

  const stats = [
    { label: 'Final Score',       value: result.score.toLocaleString(), color: '#00f5ff' },
    { label: 'Accuracy',          value: `${result.accuracy}%`,          color: '#10b981' },
    { label: 'Targets Hit',       value: result.hits,                    color: '#a855f7' },
    { label: 'Misses',            value: result.misses,                  color: '#ef4444' },
    { label: 'Total Clicks',      value: result.totalClicks,             color: '#f97316' },
    { label: 'Avg Points/Hit',    value: Math.round(result.avgPoints),   color: '#fbbf24' },
    { label: 'Peak Combo',        value: `×${result.combo}`,             color: '#00f5ff' },
    { label: 'Peak Hits/sec',     value: result.peakHitsPerSec.toFixed(1), color: '#10b981' },
    { label: 'Avg Reaction',      value: `${Math.round(result.reactionTime)}ms`, color: '#a855f7' },
    { label: 'Best Streak',       value: result.bestStreak,              color: '#f97316' },
    { label: 'Duration',          value: `${result.duration}s`,          color: '#fbbf24' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        opacity: visible ? 1 : 0,
        transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-card, #1a1a2e)',
        border: '1px solid var(--border, #333)',
        borderRadius: '20px', padding: '2rem',
        maxWidth: '560px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
        transition: prefersReducedMotion ? 'none' : 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
        boxShadow: `0 0 60px ${color}40, 0 20px 60px rgba(0,0,0,0.5)`,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: prefersReducedMotion ? 'none' : 'bounce 0.5s ease 0.3s both' }}>🎯</div>
          <h2 id="result-title" style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.5rem', color: '#fff' }}>Game Over!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: '900', color, textShadow: `0 0 20px ${color}` }}>{result.grade}</span>
            <div>
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{
                    fontSize: '1.5rem', color: i < result.stars ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                    transition: prefersReducedMotion ? 'none' : `color 0.2s ease ${0.5 + i * 0.1}s`,
                  }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #888)', marginTop: '0.25rem' }}>Performance Grade</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))',
          gap: '0.75rem', marginBottom: '1.5rem',
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '0.75rem',
              textAlign: 'center',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              transition: prefersReducedMotion ? 'none' : `opacity 0.3s ease ${0.2 + i * 0.04}s, transform 0.3s ease ${0.2 + i * 0.04}s`,
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={onPlayAgain}
            autoFocus
            style={{ flex: 1, minWidth: '120px' }}
          >▶ Play Again</button>
          <button
            className="btn btn-secondary"
            onClick={onShare}
            style={{ flex: 1, minWidth: '120px' }}
          >📤 Share</button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1, minWidth: '120px' }}
          >✕ Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pause Overlay ─────────────────────────────────────────────────────────────

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

function PauseOverlay({ onResume, onRestart, onExit }: PauseOverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '1rem', borderRadius: '14px',
      }}
    >
      <span style={{ fontSize: '2rem' }}>⏸</span>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', margin: 0 }}>Paused</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #888)', margin: 0 }}>Press P or Esc to resume</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '180px' }}>
        <button className="btn btn-primary"    onClick={onResume}  autoFocus>▶ Resume</button>
        <button className="btn btn-secondary"  onClick={onRestart}>↺ Restart</button>
        <button className="btn btn-secondary"  onClick={onExit}   style={{ color: '#ef4444' }}>✕ Exit</button>
      </div>
    </div>
  );
}

// ─── Countdown Overlay ─────────────────────────────────────────────────────────

function CountdownOverlay({ count, prefersReducedMotion }: { count: number; prefersReducedMotion: boolean }) {
  const label = count === 0 ? 'GO!' : String(count);
  const color = count === 0 ? '#10b981' : count === 1 ? '#ef4444' : '#fbbf24';
  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '14px',
      }}
    >
      <div style={{
        fontSize: count === 0 ? '4rem' : '7rem',
        fontWeight: '900', color,
        textShadow: `0 0 40px ${color}`,
        animation: prefersReducedMotion ? 'none' : 'countdown-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        lineHeight: 1,
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── History Panel ─────────────────────────────────────────────────────────────

function HistoryPanel({ history, onClear }: { history: SessionResult[]; onClear: () => void }) {
  if (history.length === 0) return null;
  const gradeColors: Record<Grade, string> = {
    S: '#fbbf24', A: '#10b981', B: '#00f5ff', C: '#a855f7', D: '#f97316', F: '#ef4444'
  };
  return (
    <div style={{
      background: 'var(--bg-card, #1a1a2e)', border: '1px solid var(--border, #333)',
      borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>📊 Session History</h3>
        <button
          className="btn btn-secondary"
          onClick={onClear}
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          aria-label="Clear session history"
        >Clear All</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
        {history.slice(0, 10).map(s => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
            gap: '0.75rem', alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px', padding: '0.6rem 0.85rem',
            fontSize: '0.82rem',
          }}>
            <span style={{ color: 'var(--text-muted, #888)', fontSize: '0.75rem' }}>{formatDate(s.date)}</span>
            <span style={{ color: '#00f5ff', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{s.score.toLocaleString()}</span>
            <span style={{ color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{s.accuracy}%</span>
            <span style={{ color: 'var(--text-muted, #888)', fontVariantNumeric: 'tabular-nums' }}>{s.hits} hits</span>
            <span style={{ color: gradeColors[s.grade], fontWeight: '800' }}>{s.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shortcut Hints ───────────────────────────────────────────────────────────

function ShortcutHints({ phase }: { phase: Phase }) {
  const hints = phase === 'running' || phase === 'paused'
    ? [['P / Esc', 'Pause'], ['R', 'Restart'], ['F', 'Fullscreen']]
    : [['Space', 'Start'], ['F', 'Fullscreen']];
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
      {hints.map(([key, action]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted, #888)' }}>
          <kbd style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px', padding: '0.15rem 0.45rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#fff',
          }}>{key}</kbd>
          <span>{action}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted, #888)' }}>
        {[['Home', '/'], ['Tools', '/tools'], ['Mouse Accuracy Test', null]].map(([label, href], i, arr) => (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {href ? (
              <a href={href} style={{ color: 'var(--neon-cyan, #00f5ff)', textDecoration: 'none' }}>{label}</a>
            ) : (
              <span aria-current="page" style={{ color: '#fff' }}>{label}</span>
            )}
            {i < arr.length - 1 && <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── SEO Head ─────────────────────────────────────────────────────────────────

function SEOHead() {
  useEffect(() => {
    // Title
    document.title = 'Mouse Accuracy Test — Free Online Aim Trainer & Accuracy Checker';

    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };

    const ogDesc = 'Test and improve your mouse accuracy with our free online aim trainer. Track score, accuracy %, reaction time, combo streaks, and more. Perfect for gamers and professionals.';

    setMeta('meta[name="description"]',       'content', ogDesc);
    setMeta('meta[name="robots"]',            'content', 'index, follow, max-image-preview:large');
    setMeta('meta[name="theme-color"]',       'content', '#0d0d1a');
    setMeta('meta[property="og:type"]',       'content', 'website');
    setMeta('meta[property="og:title"]',      'content', 'Mouse Accuracy Test — Free Aim Trainer');
    setMeta('meta[property="og:description"]','content', ogDesc);
    setMeta('meta[property="og:url"]',        'content', window.location.href);
    setMeta('meta[name="twitter:card"]',      'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]',     'content', 'Mouse Accuracy Test — Free Aim Trainer');
    setMeta('meta[name="twitter:description"]','content', ogDesc);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;

    // Hreflang
    const hreflangs = [
      { lang: 'en', href: window.location.href },
      { lang: 'x-default', href: window.location.href },
    ];
    hreflangs.forEach(({ lang, href }) => {
      const existing = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.setAttribute('hreflang', lang);
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // JSON-LD
    const schemaId = 'jsonld-schema';
    let schemaEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = schemaId; schemaEl.type = 'application/ld+json'; document.head.appendChild(schemaEl); }
    schemaEl.textContent = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Mouse Accuracy Test',
        url: window.location.origin,
        description: ogDesc,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Mouse Accuracy Test',
        url: window.location.href,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web Browser',
        description: ogDesc,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: 'Aim Training, Mouse Accuracy, Reaction Time, Combo System, Statistics History',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: `${window.location.origin}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Mouse Accuracy Test', item: window.location.href },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is a mouse accuracy test?', acceptedAnswer: { '@type': 'Answer', text: 'A mouse accuracy test is an interactive tool that measures how precisely and quickly you can click on on-screen targets, helping evaluate and improve hand-eye coordination.' } },
          { '@type': 'Question', name: 'How is accuracy calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Accuracy is calculated as (Hits / Total Clicks) × 100. Every successful target hit increases hits while any empty-area click increases misses.' } },
          { '@type': 'Question', name: 'What DPI should I use for FPS games?', acceptedAnswer: { '@type': 'Answer', text: 'Most competitive FPS players use between 400–1600 DPI. Lower DPI provides finer control while higher DPI suits faster movements.' } },
          { '@type': 'Question', name: 'Does mouse acceleration hurt accuracy?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Mouse acceleration changes cursor distance based on movement speed, which is inconsistent with muscle memory training. Disabling it leads to more consistent aim.' } },
          { '@type': 'Question', name: 'What is polling rate?', acceptedAnswer: { '@type': 'Answer', text: 'Polling rate is how often your mouse reports its position to your computer per second. Higher polling rates (1000Hz+) provide smoother, more responsive cursor movement.' } },
        ],
      },
    ]);
  }, []);

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MouseAccuracyPage() {
  // ── Settings ────────────────────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').soundEnabled ?? true; } catch { return true; }
  });
  const [volume, setVolume] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').volume ?? 0.5; } catch { return 0.5; }
  });

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ soundEnabled, volume })); } catch {}
  }, [soundEnabled, volume]);

  // ── State ───────────────────────────────────────────────────────
  const [phase,       setPhase]       = useState<Phase>('idle');
  const [countdown,   setCountdown]   = useState(3);
  const [targets,     setTargets]     = useState<Target[]>([]);
  const [timeLeft,    setTimeLeft]    = useState(GAME_DURATION);
  const [gameState,   dispatch]       = useReducer(gameReducer, initialGameState);
  const [particles,   setParticles]   = useState<Particle[]>([]);
  const [floatTexts,  setFloatTexts]  = useState<FloatingText[]>([]);
  const [ripples,     setRipples]     = useState<Ripple[]>([]);
  const [showModal,   setShowModal]   = useState(false);
  const [lastResult,  setLastResult]  = useState<SessionResult | null>(null);
  const [confetti,    setConfetti]    = useState(false);
  const [history,     setHistory]     = useState<SessionResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [comboFlash,  setComboFlash]  = useState<string | null>(null);
  const [prefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────
  const areaRef         = useRef<HTMLDivElement>(null);
  const wrapRef         = useRef<HTMLDivElement>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef     = useRef(0);
  const particleIdRef   = useRef(0);
  const floatIdRef      = useRef(0);
  const rippleIdRef     = useRef(0);
  const phaseRef        = useRef<Phase>('idle');
  const timeLeftRef     = useRef(GAME_DURATION);
  const gameStateRef    = useRef(gameState);
  const targetTimeouts  = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const pauseDataRef    = useRef<{ timeLeft: number; targets: Target[] } | null>(null);
  const gameStartTime   = useRef(0);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // ── Sound ───────────────────────────────────────────────────────
  const sfx = useSoundEngine(soundEnabled, volume);

  // ── Cleanup helpers ─────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (timerRef.current)     { clearInterval(timerRef.current);     timerRef.current = null; }
    if (spawnRef.current)     { clearInterval(spawnRef.current);     spawnRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
  }, []);

  // ── Particle spawn ──────────────────────────────────────────────
  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    if (prefersReducedMotion) return;
    const newParticles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      return {
        id: ++particleIdRef.current,
        x, y,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, maxLife: 1,
        size: 3 + Math.random() * 4,
      };
    });
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 700);
  }, [prefersReducedMotion]);

  const spawnFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    if (prefersReducedMotion) return;
    const id = ++floatIdRef.current;
    setFloatTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => setFloatTexts(prev => prev.filter(f => f.id !== id)), 900);
  }, [prefersReducedMotion]);

  const spawnRipple = useCallback((x: number, y: number, color: string) => {
    if (prefersReducedMotion) return;
    const id = ++rippleIdRef.current;
    setRipples(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  }, [prefersReducedMotion]);

  // ── Target spawning ─────────────────────────────────────────────
  const spawnTarget = useCallback(() => {
    if (!areaRef.current || phaseRef.current !== 'running') return;
    const rect     = areaRef.current.getBoundingClientRect();
    const type     = pickTargetType();
    const size     = getTargetSize(type);
    const padding  = size + 4;
    const x        = padding + Math.random() * Math.max(0, rect.width  - padding * 2);
    const y        = padding + Math.random() * Math.max(0, rect.height - padding * 2);
    const id       = ++targetIdRef.current;
    const points   = calcPoints(type, size, gameStateRef.current.combo);
    const lifetime = TARGET_LIFETIME[type];
    const target: Target = { id, x, y, size, points, type, spawnTime: Date.now(), lifetime };

    setTargets(prev => [...prev, target]);

    const to = setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
      targetTimeouts.current.delete(id);
    }, lifetime);
    targetTimeouts.current.set(id, to);
  }, []);

  // ── Game engine ─────────────────────────────────────────────────
  const startGameEngine = useCallback(() => {
    gameStartTime.current = Date.now();
    spawnTarget();
    spawnRef.current  = setInterval(spawnTarget, SPAWN_INTERVAL);

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, GAME_DURATION - elapsed);
      timeLeftRef.current = left;
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!); timerRef.current = null;
        clearInterval(spawnRef.current!);  spawnRef.current = null;
        // End game
        setPhase('done');
        phaseRef.current = 'done';
        setTargets([]);
        targetTimeouts.current.forEach(t => clearTimeout(t));
        targetTimeouts.current.clear();
        sfx.finish();

        const gs   = gameStateRef.current;
        const acc  = gs.totalClicks > 0 ? Math.round((gs.hits / gs.totalClicks) * 100) : 100;
        const avgR = gs.reactionTimes.length > 0
          ? gs.reactionTimes.reduce((a, b) => a + b, 0) / gs.reactionTimes.length
          : 0;
        const grade = calcGrade(acc, gs.score);
        const stars = calcStars(grade);
        const dur   = Math.round((Date.now() - gameStartTime.current) / 1000);
        const result: SessionResult = {
          id: String(Date.now()),
          date: new Date().toISOString(),
          score: gs.score, accuracy: acc, hits: gs.hits, misses: gs.misses,
          combo: gs.peakCombo, reactionTime: avgR,
          grade, stars, totalClicks: gs.totalClicks,
          avgPoints: gs.hits > 0 ? gs.score / gs.hits : 0,
          peakHitsPerSec: gs.peakHitsPerSec,
          bestStreak: gs.bestStreak, duration: dur,
        };
        setLastResult(result);
        setShowModal(true);
        if (grade === 'S' || grade === 'A') { setConfetti(true); setTimeout(() => setConfetti(false), 5000); }
        setHistory(prev => {
          const updated = [result, ...prev].slice(0, 20);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    }, 100);
  }, [sfx, spawnTarget]);

  const beginCountdown = useCallback(() => {
    clearAllTimers();
    dispatch({ type: 'RESET' });
    setTargets([]);
    setParticles([]);
    setFloatTexts([]);
    setRipples([]);
    setTimeLeft(GAME_DURATION);
    setCountdown(3);
    setPhase('countdown');
    phaseRef.current = 'countdown';
    sfx.click();

    let count = 3;
    sfx.countdown(count);
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      sfx.countdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setPhase('running');
        phaseRef.current = 'running';
        startGameEngine();
      }
    }, 1000);
  }, [clearAllTimers, sfx, startGameEngine]);

  // ── Pause / Resume ───────────────────────────────────────────────
  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    clearInterval(timerRef.current!); timerRef.current = null;
    clearInterval(spawnRef.current!);  spawnRef.current = null;
    pauseDataRef.current = { timeLeft: timeLeftRef.current, targets: [] };
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setPhase('paused');
    phaseRef.current = 'paused';
    sfx.click();
  }, [sfx]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    const left = pauseDataRef.current?.timeLeft ?? timeLeftRef.current;
    setPhase('running');
    phaseRef.current = 'running';
    sfx.click();

    spawnTarget();
    spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);

    let elapsed = GAME_DURATION - left;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const newLeft = Math.max(0, GAME_DURATION - elapsed);
      timeLeftRef.current = newLeft;
      setTimeLeft(newLeft);
      if (newLeft <= 0) {
        clearInterval(timerRef.current!); timerRef.current = null;
        clearInterval(spawnRef.current!);  spawnRef.current = null;
        setPhase('done'); phaseRef.current = 'done';
        setTargets([]);
        sfx.finish();

        const gs  = gameStateRef.current;
        const acc = gs.totalClicks > 0 ? Math.round((gs.hits / gs.totalClicks) * 100) : 100;
        const avgR = gs.reactionTimes.length > 0
          ? gs.reactionTimes.reduce((a, b) => a + b, 0) / gs.reactionTimes.length : 0;
        const grade = calcGrade(acc, gs.score);
        const dur   = Math.round((Date.now() - gameStartTime.current) / 1000);
        const result: SessionResult = {
          id: String(Date.now()), date: new Date().toISOString(),
          score: gs.score, accuracy: acc, hits: gs.hits, misses: gs.misses,
          combo: gs.peakCombo, reactionTime: avgR, grade, stars: calcStars(grade),
          totalClicks: gs.totalClicks, avgPoints: gs.hits > 0 ? gs.score / gs.hits : 0,
          peakHitsPerSec: gs.peakHitsPerSec, bestStreak: gs.bestStreak, duration: dur,
        };
        setLastResult(result);
        setShowModal(true);
        if (grade === 'S' || grade === 'A') { setConfetti(true); setTimeout(() => setConfetti(false), 5000); }
        setHistory(prev => { const u = [result, ...prev].slice(0,20); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {} return u; });
      }
    }, 100);
  }, [sfx, spawnTarget]);

  const exitToIdle = useCallback(() => {
    clearAllTimers();
    setPhase('idle');
    phaseRef.current = 'idle';
    setTargets([]);
    sfx.click();
  }, [clearAllTimers, sfx]);

  // ── Hit / Miss ───────────────────────────────────────────────────
  const hitTarget = useCallback((target: Target, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;
    const to = targetTimeouts.current.get(target.id);
    if (to) { clearTimeout(to); targetTimeouts.current.delete(target.id); }
    setTargets(prev => prev.filter(t => t.id !== target.id));

    const rt = Date.now() - target.spawnTime;
    const gs = gameStateRef.current;
    const pts = target.type === 'penalty'
      ? calcPoints(target.type, target.size, gs.combo)
      : calcPoints(target.type, target.size, gs.combo);
    const now = Date.now();

    if (target.type !== 'penalty') {
      dispatch({ type: 'HIT', points: pts, reactionTime: rt, timestamp: now });
      sfx.hit();
      const newCombo = gs.combo + 1;
      if (COMBO_THRESHOLDS.includes(newCombo as any)) {
        sfx.combo(newCombo);
        setComboFlash(`${newCombo}x COMBO!`);
        setTimeout(() => setComboFlash(null), 1200);
      }
    } else {
      dispatch({ type: 'MISS' });
      sfx.miss();
    }

    // Visual FX
    let clickX = 0, clickY = 0;
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      if ('clientX' in e) { clickX = e.clientX - rect.left; clickY = e.clientY - rect.top; }
      else if (e.touches[0]) { clickX = e.touches[0].clientX - rect.left; clickY = e.touches[0].clientY - rect.top; }
    }
    const pColor = TARGET_GLOW[target.type].replace('0.5)', '0.9)');
    spawnParticles(target.x, target.y, pColor, target.type === 'bonus' ? 14 : 8);
    spawnRipple(target.x, target.y, pColor);
    spawnFloatText(target.x, target.y - target.size, target.type === 'penalty' ? `${pts}` : `+${pts}`, target.type === 'penalty' ? '#ef4444' : pts > 200 ? '#fbbf24' : '#10b981');
  }, [sfx, spawnParticles, spawnRipple, spawnFloatText]);

  const missClick = useCallback((e: React.MouseEvent) => {
    if (phaseRef.current !== 'running') return;
    dispatch({ type: 'MISS' });
    sfx.miss();
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      spawnRipple(e.clientX - rect.left, e.clientY - rect.top, 'rgba(239,68,68,0.7)');
    }
  }, [sfx, spawnRipple]);

  // ── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          if (phaseRef.current === 'idle' || phaseRef.current === 'done') { e.preventDefault(); beginCountdown(); }
          break;
        case 'Escape':
        case 'p':
        case 'P':
          if (phaseRef.current === 'running') pause();
          else if (phaseRef.current === 'paused') resume();
          break;
        case 'r':
        case 'R':
          if (phaseRef.current !== 'idle' && phaseRef.current !== 'countdown') beginCountdown();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            wrapRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
          } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
          }
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beginCountdown, pause, resume]);

  // ── Fullscreen listener ──────────────────────────────────────────
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // ── Prevent scroll on touch during game ─────────────────────────
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (phaseRef.current === 'running') e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // ── Derived values ───────────────────────────────────────────────
  const acc        = gameState.totalClicks > 0 ? Math.round((gameState.hits / gameState.totalClicks) * 100) : 100;
  const progress   = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;
  const multiplier = getComboMultiplier(gameState.combo);
  const avgRT      = gameState.reactionTimes.length > 0
    ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length)
    : 0;

  const statCards = useMemo(() => [
    { value: gameState.score.toLocaleString(), label: 'Score',    color: 'var(--neon-cyan, #00f5ff)' },
    { value: `${acc}%`,                        label: 'Accuracy', color: 'var(--neon-green, #10b981)', node: <AccuracyGraph hits={gameState.hits} total={gameState.totalClicks} /> },
    { value: gameState.hits,                   label: 'Hits',     color: 'var(--neon-purple, #a855f7)' },
    { value: gameState.misses,                 label: 'Misses',   color: 'var(--neon-red, #ef4444)' },
    { value: `${gameState.combo}×`,            label: 'Combo',    color: '#fbbf24' },
    { value: `${gameState.peakCombo}×`,        label: 'Peak Combo',color: '#f97316' },
    { value: avgRT ? `${avgRT}ms` : '—',       label: 'Avg React',color: '#a855f7' },
    { value: timeLeft.toFixed(1),              label: 'Time',     color: 'var(--neon-orange, #f97316)' },
  ], [gameState, acc, avgRT, timeLeft]);

  const shareResult = () => {
    if (!lastResult) return;
    const text = `🎯 Mouse Accuracy Test Results\nScore: ${lastResult.score}\nAccuracy: ${lastResult.accuracy}%\nGrade: ${lastResult.grade} ${'★'.repeat(lastResult.stars)}\nTest yours: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Mouse Accuracy Test', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => alert('Result copied to clipboard!')).catch(() => {});
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <SEOHead />
      <CrosshairCursor active={phase === 'running'} />
      <Confetti active={confetti} />

      {/* Combo flash */}
      {comboFlash && (
        <div aria-live="polite" style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, fontSize: '2rem', fontWeight: '900',
          color: '#fbbf24', textShadow: '0 0 30px #fbbf24',
          animation: 'combo-flash 1.2s ease forwards',
          pointerEvents: 'none',
        }}>{comboFlash}</div>
      )}

      <div ref={wrapRef} style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Breadcrumb />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="section-label">Mouse Tool</div>
          <h1 className="tool-title">Mouse Accuracy Test</h1>
          <p className="tool-subtitle">Click targets precisely — smaller targets = more points! Build your combo for score multipliers.</p>
        </div>

        {/* Sound controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setSoundEnabled((v: boolean) => !v); }}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '0.35rem 0.65rem', color: '#fff', cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >{soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'On' : 'Off'}</button>
          {soundEnabled && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted, #888)' }}>
              Vol
              <input
                type="range" min="0" max="1" step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                aria-label="Volume"
                style={{ width: '72px', accentColor: '#a855f7' }}
              />
            </label>
          )}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                wrapRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
              } else {
                document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
              }
            }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '0.35rem 0.65rem', color: '#fff', cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >{isFullscreen ? '⊡' : '⛶'} {isFullscreen ? 'Exit FS' : 'Fullscreen'}</button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}
          role="region" aria-label="Live game statistics"
        >
          {statCards.map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '0.75rem', textAlign: 'center',
              transition: 'border-color 0.3s ease',
              borderColor: s.label === 'Combo' && gameState.combo >= 5 ? '#fbbf24' : undefined,
            }}>
              {s.node ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>{s.node}</div>
              ) : (
                <>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums',
                    transition: prefersReducedMotion ? 'none' : 'color 0.3s ease'
                  }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem', letterSpacing: '0.05em' }}>{s.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Multiplier badge */}
        {multiplier > 1 && (
          <div aria-live="polite" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #f97316)',
              borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', fontWeight: '800', color: '#000',
              boxShadow: '0 0 16px rgba(251,191,36,0.5)',
              animation: prefersReducedMotion ? 'none' : 'pulse-glow 1s ease infinite alternate',
            }}>
              ×{multiplier} MULTIPLIER
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div
          className="progress-bar"
          style={{ marginBottom: '0.75rem' }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${timeLeft.toFixed(1)} seconds remaining`}
        >
          <div className="progress-fill" style={{
            width: `${progress}%`,
            background: timeLeft < 5 ? 'linear-gradient(90deg, #ef4444, #f97316)' : undefined,
            transition: 'width 0.1s linear, background 0.5s ease',
          }} />
        </div>

        {/* Shortcut hints */}
        <ShortcutHints phase={phase} />

        {/* Game Arena */}
        <div
          ref={areaRef}
          onClick={missClick}
          onTouchEnd={e => {
            if (phase !== 'running') return;
            const touch = e.changedTouches[0];
            const el    = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!el || el === areaRef.current) {
              dispatch({ type: 'MISS' });
              if (areaRef.current) {
                const rect = areaRef.current.getBoundingClientRect();
                spawnRipple(touch.clientX - rect.left, touch.clientY - rect.top, 'rgba(239,68,68,0.7)');
              }
            }
          }}
          role="application"
          aria-label="Game area. Click targets to score points."
          style={{
            position: 'relative', width: '100%', height: '400px',
            background: 'var(--bg-card)',
            border: `2px solid ${phase === 'running' ? 'rgba(191,90,242,0.5)' : phase === 'paused' ? 'rgba(251,191,36,0.4)' : 'var(--border)'}`,
            borderRadius: '16px', overflow: 'hidden',
            cursor: phase === 'running' ? 'none' : 'default',
            marginBottom: '1rem',
            boxShadow: phase === 'running' ? '0 0 40px rgba(191,90,242,0.1)' : 'none',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            WebkitUserSelect: 'none', userSelect: 'none',
          }}
        >
          {/* Idle / Done overlay */}
          {(phase === 'idle' || phase === 'done') && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.75rem', zIndex: 10,
            }}>
              <span style={{ fontSize: '4rem' }} role="img" aria-label="target">🎯</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: phase === 'done' ? 'var(--neon-orange, #f97316)' : 'var(--neon-purple, #a855f7)' }}>
                {phase === 'done' ? `Score: ${gameState.score.toLocaleString()}` : 'Click Start to Play'}
              </span>
              {phase === 'idle' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px', margin: 0 }}>
                  Hit targets to score. Combos multiply your points. Avoid penalty targets!
                </p>
              )}
            </div>
          )}

          {/* Countdown */}
          {phase === 'countdown' && <CountdownOverlay count={countdown} prefersReducedMotion={prefersReducedMotion} />}

          {/* Pause overlay */}
          {phase === 'paused' && <PauseOverlay onResume={resume} onRestart={beginCountdown} onExit={exitToIdle} />}

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} aria-hidden="true" style={{
              position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size,
              borderRadius: '50%', background: p.color, pointerEvents: 'none',
              transform: 'translate(-50%,-50%)',
              animation: 'particle-fade 0.7s ease forwards',
            }} />
          ))}

          {/* Ripples */}
          {ripples.map(r => (
            <div key={r.id} aria-hidden="true" style={{
              position: 'absolute', left: r.x, top: r.y,
              width: 60, height: 60, borderRadius: '50%',
              border: `2px solid ${r.color}`,
              transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
              animation: 'ripple-expand 0.6s ease forwards',
            }} />
          ))}

          {/* Floating texts */}
          {floatTexts.map(f => (
            <div key={f.id} aria-hidden="true" style={{
              position: 'absolute', left: f.x, top: f.y,
              color: f.color, fontWeight: '900', fontSize: '0.9rem',
              pointerEvents: 'none', whiteSpace: 'nowrap',
              transform: 'translate(-50%,-50%)',
              animation: 'float-up 0.9s ease forwards',
              textShadow: `0 0 10px ${f.color}`,
            }}>{f.text}</div>
          ))}

          {/* Targets */}
          {targets.map(t => (
            <button
              key={t.id}
              onClick={e => { e.stopPropagation(); hitTarget(t, e); }}
              onTouchEnd={e => { e.stopPropagation(); hitTarget(t, e); }}
              aria-label={`${t.type} target worth ${t.points} points`}
              style={{
                position: 'absolute',
                left: `${t.x}px`, top: `${t.y}px`,
                width: `${t.size}px`, height: `${t.size}px`,
                borderRadius: '50%',
                transform: 'translate(-50%,-50%)',
                background: TARGET_COLORS[t.type],
                border: t.type === 'penalty' ? '2px solid rgba(239,68,68,0.9)' : t.type === 'bonus' ? '2px solid rgba(251,191,36,0.9)' : '2px solid rgba(255,255,255,0.85)',
                cursor: 'none',
                animation: `target-appear 0.15s cubic-bezier(0.175,0.885,0.32,1.275) forwards${t.type === 'fast' ? ', target-pulse 0.5s ease infinite alternate' : ''}`,
                boxShadow: `0 0 18px ${TARGET_GLOW[t.type]}, 0 0 6px rgba(0,0,0,0.4)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: `${Math.max(0.55, t.size * 0.018)}rem`, fontWeight: '800',
                userSelect: 'none', padding: 0,
                zIndex: 5,
                transition: 'transform 0.05s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%,-50%) scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%,-50%) scale(1)'; }}
            >
              {t.type === 'penalty' ? '✕' : t.type === 'bonus' ? '★' : t.size > 32 ? t.points : ''}
            </button>
          ))}

          {/* Lifetime bars for targets */}
          {phase === 'running' && targets.map(t => (
            <div key={`lb-${t.id}`} aria-hidden="true" style={{
              position: 'absolute',
              left: `${t.x - t.size / 2}px`,
              top: `${t.y + t.size / 2 + 4}px`,
              width: `${t.size}px`, height: '2px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '1px',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}>
              <div style={{
                height: '100%',
                background: TARGET_GLOW[t.type],
                animation: `shrink-bar ${t.lifetime}ms linear forwards`,
              }} />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(phase === 'idle' || phase === 'done') && (
            <button className="btn btn-primary" onClick={beginCountdown} aria-label="Start game">
              {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
            </button>
          )}
          {phase === 'running' && (
            <button className="btn btn-secondary" onClick={pause} aria-label="Pause game">⏸ Pause</button>
          )}
          {phase === 'paused' && (
            <button className="btn btn-primary" onClick={resume} aria-label="Resume game">▶ Resume</button>
          )}
          {(phase === 'running' || phase === 'paused') && (
            <button className="btn btn-secondary" onClick={beginCountdown} aria-label="Restart game">↺ Restart</button>
          )}
          {phase !== 'idle' && (
            <button className="btn btn-secondary" onClick={exitToIdle} aria-label="Exit to menu">✕ Exit</button>
          )}
        </div>

        {/* Target legend */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Types</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {(Object.keys(TARGET_COLORS) as TargetType[]).map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: TARGET_COLORS[type],
                  boxShadow: `0 0 6px ${TARGET_GLOW[type]}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #aaa)', textTransform: 'capitalize' }}>
                  {type}
                  {type === 'bonus'   ? ' (+3× pts)' : ''}
                  {type === 'penalty' ? ' (−pts)'    : ''}
                  {type === 'tiny'    ? ' (+1.5×)'   : ''}
                  {type === 'fast'    ? ' (faster)'  : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <HistoryPanel history={history} onClear={() => { setHistory([]); try { localStorage.removeItem(STORAGE_KEY); } catch {} }} />

        {/* ═══════════════════ LONG-FORM SEO ARTICLE ═══════════════════ */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '2rem', marginTop: '2rem',
          color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.8',
        }}>
          {/* ── Article ── */}
          <article>
            <h2 style={{ fontWeight: '800', fontSize: '1.6rem', color: 'var(--neon-cyan, #00f5ff)', marginTop: 0, marginBottom: '0.75rem' }}>
              What is a Mouse Accuracy Test?
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              A <strong>Mouse Accuracy Test</strong> is an interactive browser-based tool designed to precisely evaluate how well your hand translates intention into cursor movement. Unlike a simple speed test, accuracy tests challenge you to click discrete, dynamically-sized targets that appear at random positions across a defined play area. Each successful click is logged alongside your total input count, enabling the system to compute a real-time accuracy percentage that reflects genuine pointing precision rather than raw speed alone.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Modern accuracy trainers go far beyond a simple hit-or-miss score. They track <strong>combo streaks</strong>, <strong>reaction time</strong>, <strong>hits per second</strong>, and performance grades — giving you a comprehensive, multi-dimensional picture of your cursor control. Whether you are a competitive FPS player grinding aim mechanics or a UX designer who wants crisper mouse movements when working in Figma or Photoshop, a structured accuracy test provides the baseline metrics you need to identify weaknesses and track improvement over time.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Benefits of Mouse Accuracy Training
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Consistent mouse accuracy training delivers measurable improvements across every task that involves a pointing device. Key benefits include:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Improved hand-eye coordination</strong> — repeated precision targeting builds reliable neural pathways connecting visual stimuli to physical motor output.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Reduced overshoot and undershoot</strong> — consistent practice eliminates the tendency to overcompensate when acquiring a new target, a common issue for both beginners and intermediate players.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Faster reaction time</strong> — when your aim becomes automatic, cognitive resources shift from "how do I move the cursor?" to "where is the target?" — shaving precious milliseconds off your response.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Higher productivity</strong> — designers, video editors, and developers who use precision tools daily will notice measurably fewer wasted clicks and smoother navigation across complex UI environments.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Sustained focus and flow</strong> — regular accuracy drills train your concentration span, helping you stay locked in during extended gaming sessions or long creative work blocks.</li>
            </ul>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              How Mouse Accuracy Works
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Your operating system polls your physical mouse at a fixed rate (the <strong>polling rate</strong>), translating raw sensor data — optical or laser movement across a physical surface — into delta X and delta Y values that are applied to the system cursor position. This cursor coordinate is then passed through an optional acceleration curve before appearing on screen.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              The accuracy test intercepts that final on-screen coordinate and checks it against the bounding geometry of every active target. When your cursor's click event falls within a target circle's radius, the hit registers instantly and the target disappears. If the event falls outside all targets, it counts as a miss, incrementing your error total and reducing your overall accuracy percentage.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Smaller targets require finer motor control because your maximum allowable error — in absolute pixels — decreases proportionally with target radius. A 15px-radius target has roughly 1/9th the surface area of a 45px-radius target, demanding three times the positional accuracy from your hand.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              How Accuracy is Calculated
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              The accuracy formula is straightforward:
            </p>
            <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.88rem', marginBottom: '1.25rem', overflow: 'auto' }}>
              Accuracy (%) = (Total Hits / Total Clicks) × 100
            </pre>
            <p style={{ marginBottom: '1.25rem' }}>
              Every time you click inside the game area — whether you hit a target or not — your <em>Total Clicks</em> counter increments. Successful target hits increment <em>Total Hits</em>. The ratio between these two values, expressed as a percentage, is your accuracy score. A perfect 100% means every single click connected with a target.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Points are calculated separately from accuracy. Each target's base point value is derived from <code>100 × (50 / (size + 1))</code>, meaning smaller targets award exponentially more points. Your active combo multiplier — built by hitting consecutive targets without missing — is then applied to amplify your score further.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              How to Improve Mouse Accuracy
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Improving mouse accuracy is a deliberate, systematic process. Here are the most impactful strategies:
            </p>
            <ol style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li style={{ marginBottom: '0.6rem' }}><strong>Lower your sensitivity</strong> — using a lower DPI/in-game sensitivity combination forces larger physical movements for the same cursor travel, engaging your larger arm muscles and providing much finer micro-correction capability.</li>
              <li style={{ marginBottom: '0.6rem' }}><strong>Disable mouse acceleration</strong> — this is the single most important hardware setting change for accuracy training. Acceleration makes your cursor travel a variable distance based on how quickly you move your hand, making consistent muscle-memory learning impossible.</li>
              <li style={{ marginBottom: '0.6rem' }}><strong>Use a large mouse pad</strong> — extended glide space allows full arm-aiming at lower sensitivities, dramatically improving long-distance flick accuracy.</li>
              <li style={{ marginBottom: '0.6rem' }}><strong>Maintain proper posture</strong> — keep your wrist straight and your elbow on the desk. Wrist-aiming is suitable for micro-adjustments, while arm-aiming covers larger cursor distances more accurately.</li>
              <li style={{ marginBottom: '0.6rem' }}><strong>Practice in short focused sessions</strong> — aim training is a motor-skill activity. Fifteen to twenty minutes of deliberate practice followed by a break produces better results than grinding for hours in a fatigued state.</li>
              <li style={{ marginBottom: '0.6rem' }}><strong>Target specific weaknesses</strong> — if your accuracy drops on tiny targets, focus drills specifically around small-target clicking. If reaction time is your weakness, focus on fast-disappearing targets.</li>
            </ol>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Best DPI for FPS Games
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              DPI (Dots Per Inch) determines how many pixels your cursor travels for every inch of physical mouse movement. Higher DPI values move your cursor farther and faster, while lower DPI values require more physical movement to cover the same screen distance.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Professional FPS players have historically clustered around <strong>400–800 DPI</strong>, combined with a relatively low in-game sensitivity multiplier (e.g., 0.5–2.0 in games like CS2 or Valorant). This combination produces a total "effective DPI" (eDPI = DPI × in-game sensitivity) typically between 400 and 1200 for most elite competitors.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              That said, there is no universally "best" DPI. The ideal setting is the one that lets you execute both large flick movements and small micro-adjustments with equal consistency. If you find yourself regularly overshooting targets during this accuracy test, try reducing your DPI by 200–400 increments until the overshoots disappear.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Best Mouse Sensitivity
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Sensitivity is arguably the most personal setting in PC gaming. What feels natural to one player feels impossibly slow or uncontrollably fast to another, depending on desk space, preferred grip style, and hand size. As a general guideline:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Low sensitivity (eDPI 400–800):</strong> Favors precision, long-range engagements, and arm-aiming. Requires a large mouse pad and more physical effort for 180° turns.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Medium sensitivity (eDPI 800–1600):</strong> The sweet spot for most players. Balances tracking and flicking, works with mid-sized pads, and allows both wrist and arm aiming.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>High sensitivity (eDPI 1600+):</strong> Enables fast 180° turns and suits close-range action games, but demands exceptional finger and wrist precision for micro-adjustments.</li>
            </ul>
            <p style={{ marginBottom: '1.25rem' }}>
              Use this accuracy test to empirically find your sensitivity sweet spot: if your accuracy consistently drops below 70%, your sensitivity may be too high. If you feel like you are constantly "chasing" targets without catching up, it may be too low.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Mouse Acceleration Explained
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Mouse acceleration is a software-based modification that multiplies your cursor's travel distance by a factor proportional to your physical movement speed. Move slowly and the cursor barely moves; move quickly and the cursor travels much farther than your DPI alone would suggest.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              While this sounds helpful — and was originally designed to help users navigate large monitors with limited desk space — it fundamentally undermines muscle memory development. Muscle memory requires a <em>deterministic, repeatable mapping</em> between hand movement and cursor travel. If that mapping changes based on movement velocity, your brain cannot encode a reliable motion pattern, forcing you to consciously recalibrate every aim.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              In Windows: Settings → Bluetooth &amp; Devices → Mouse → Additional Mouse Settings → Pointer Options → Uncheck "Enhance pointer precision." In macOS, most gaming mice drivers include a dedicated toggle. On Linux, use <code>xinput</code> to set <code>libinput Accel Profile Flat</code>.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Polling Rate Explained
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Polling rate is the frequency at which your mouse reports its position to your computer, measured in Hz. A 125Hz mouse reports position data 125 times per second (every 8ms). A 1000Hz (1kHz) mouse reports 1000 times per second (every 1ms). Modern high-end gaming mice now offer 4000Hz and even 8000Hz polling.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Higher polling rates reduce input latency and smooth out cursor movement by providing more frequent position updates. At 125Hz, the worst-case delay between your physical movement and the cursor update is 8ms. At 1000Hz, that worst-case drops to 1ms — a meaningful improvement for competitive gaming where every millisecond counts.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              For casual use or productivity work, 125–500Hz is perfectly adequate. For competitive FPS gaming, 1000Hz is the standard baseline. Higher polling rates (4000Hz+) provide diminishing returns for most users, but may feel noticeably smoother to those with highly trained aim.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Gaming Mouse vs Office Mouse
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              The differences between a dedicated gaming mouse and a standard office peripheral extend far beyond RGB lighting:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { title: '🎮 Gaming Mouse', points: ['High-precision optical/laser sensor (400–25,600+ DPI)', 'Zero hardware acceleration (1:1 tracking)', '1000Hz+ polling rate', 'Lightweight shell (40–80g)', 'Programmable buttons', 'Optimized for low-friction gliding'] },
                { title: '💼 Office Mouse', points: ['Lower precision sensor (800–2400 DPI)', 'Software acceleration often built-in', '125–250Hz polling rate', 'Ergonomic focus over precision', 'Basic button layout', 'Optimized for comfort over long sessions'] },
              ].map(col => (
                <div key={col.title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{col.title}</div>
                  <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem' }}>
                    {col.points.map(p => <li key={p} style={{ marginBottom: '0.35rem' }}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{ marginBottom: '1.25rem' }}>
              For aim training specifically, sensor quality matters most. A mouse with hardware acceleration baked into the sensor will produce inconsistent tracking curves regardless of software settings, making improvement much harder to measure and sustain.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Mouse Accuracy vs Reaction Time
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Accuracy and reaction time are related but distinct skills. <strong>Reaction time</strong> measures how quickly you respond to a stimulus — how many milliseconds pass between a target appearing and your click registering. <strong>Accuracy</strong> measures whether that click landed on the intended target.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              A common training error is optimizing purely for speed, sacrificing accuracy in the process. In competitive contexts, a click that misses costs you far more than the brief delay of a precise click. The ideal training goal is to develop a "floor" reaction time — the fastest you can respond while maintaining near-perfect accuracy — and push that floor lower over months of deliberate practice.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              This test tracks both metrics independently: your average reaction time is shown in the live stats panel, while your accuracy percentage reflects pure click quality independent of speed. Use both numbers together to gauge your overall aim health.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Mouse Accuracy for FPS Games
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              In first-person shooters, aim accuracy directly determines your kill-death ratio, round win rate, and overall competitive ranking. Games like <em>Valorant</em>, <em>CS2</em>, <em>Apex Legends</em>, and <em>Overwatch</em> all reward players who can quickly acquire and precisely click on moving, partially-obscured enemy hitboxes under the pressure of return fire.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              The target types in this trainer directly mirror FPS aim archetypes: <strong>Normal</strong> targets simulate standard body-shot acquisition; <strong>Tiny</strong> targets simulate headshots and small hitboxes; <strong>Fast</strong> targets simulate tracking a moving enemy; <strong>Bonus</strong> targets reward high-value precision; and <strong>Penalty</strong> targets simulate the cost of shooting teammates or missing into a dangerous area.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Professional FPS coaches recommend combining web-based accuracy trainers with in-game practice maps (like Valorant's The Range or CS2's aim_botz) for a balanced training regimen that covers both isolated mechanics and real-game scenarios.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Mouse Accuracy for Designers
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              UI/UX designers, illustrators, and video editors spend hours each day performing precision cursor operations — aligning objects to pixel-perfect positions in Figma, painting fine details in Photoshop, or making precise cuts in a video timeline. Shaky or inaccurate cursor control results in misaligned elements, unintended selections, and excessive undo operations that slow down creative workflow.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              For designers, medium-sensitivity training with an emphasis on micro-targeting (tiny target mode) is particularly valuable. A weekly 15-minute accuracy session can noticeably reduce the number of "close-but-not-quite" clicks during intricate design work, especially when navigating dense component trees or selecting overlapping vector nodes.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Mouse Accuracy for Productivity
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Even in standard office workflows, precise mouse control saves meaningful time across a workday. Research into computer interaction efficiency suggests that cursor accuracy directly correlates with task completion speed for operations like file management, spreadsheet editing, code navigation, and form completion.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              A productivity user who improves their accuracy from 70% to 90% on this test will likely find that they reach their intended UI elements on the first attempt far more consistently, reducing the cognitive overhead of correcting missed clicks and maintaining better mental flow throughout their workday.
            </p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Common Mistakes in Aim Training
            </h2>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Training at too high a sensitivity</strong> — this builds habits around imprecise, jerky movements. If you are regularly scoring below 60% accuracy, lower your sensitivity.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ignoring mouse acceleration</strong> — training with acceleration active is like practicing free throws on a hoop that randomly changes height. Disable it before your first session.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Over-training</strong> — motor-skill learning happens during rest. Grinding for 3–4 hours daily produces diminishing returns and can introduce tension-related injuries.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Only doing accuracy training</strong> — tracking moving targets, flicking drills, and speed training all develop different motor skills. A balanced routine covers multiple aim archetypes.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ignoring reaction time</strong> — pure accuracy without speed is insufficient for competitive play. Monitor your average reaction time and work to reduce it while maintaining accuracy above 80%.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Inconsistent sessions</strong> — sporadic training provides minimal benefit. Short daily sessions (15–20 minutes) produce far better results than occasional marathon sessions.</li>
            </ul>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Training Routine & Practice Schedule
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Here is a structured weekly routine suitable for most players:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { day: 'Monday', focus: 'Accuracy Focus', detail: '3×5 min accuracy sessions. Aim for 85%+ accuracy. Avoid rushing.' },
                { day: 'Tuesday', focus: 'Speed + Accuracy', detail: '3×5 min sessions pushing reaction time lower while keeping accuracy above 75%.' },
                { day: 'Wednesday', focus: 'Tiny Targets', detail: 'Focus on small target mode exclusively. Build precision micro-control.' },
                { day: 'Thursday', focus: 'Rest or Light Play', detail: 'Casual gaming only. Let motor memory consolidate.' },
                { day: 'Friday', focus: 'Full Session', detail: '3×5 min mixed mode. Benchmark your weekly improvement.' },
                { day: 'Weekend', focus: 'Free Practice', detail: 'Optional sessions. Play games. Apply trained skills in real scenarios.' },
              ].map(d => (
                <div key={d.day} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: '700', color: '#00f5ff', fontSize: '0.85rem' }}>{d.day}</div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.82rem', marginBottom: '0.25rem' }}>{d.focus}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.detail}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Best Hardware Setup for Mouse Accuracy
            </h2>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Mouse:</strong> Optical sensor, zero hardware acceleration, 1000Hz polling. Popular options: Logitech G Pro X Superlight 2, Razer DeathAdder V3, Zowie EC series.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Mouse pad:</strong> Large (450×400mm+), consistent texture, low-friction surface. Cloth pads offer better micro-correction control; hard pads suit faster movements.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Monitor:</strong> 144Hz or higher refresh rate significantly reduces motion blur and makes target acquisition easier. 240Hz+ is ideal for competitive play.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Chair and desk:</strong> Stable desk surface, elbows at desk height or slightly below. Eliminate desk wobble, which introduces micro-vibrations into your aim.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Cable:</strong> Wireless mice eliminate cable drag, which can subtly affect aim consistency. If using wired, a paracord-style cable minimizes friction.</li>
            </ul>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Tips to Improve Faster
            </h2>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Track your scores in the <strong>Session History</strong> panel and review your trends weekly. Consistent improvement, even by 2–3% accuracy points, is significant progress.</li>
              <li style={{ marginBottom: '0.5rem' }}>Set micro-goals: "I will maintain 80% accuracy for three consecutive sessions before raising the target to 85%."</li>
              <li style={{ marginBottom: '0.5rem' }}>Warm up with 2–3 minutes of easy clicking before your timed session. Cold muscles produce less accurate aim.</li>
              <li style={{ marginBottom: '0.5rem' }}>Study your miss patterns. Do you consistently miss to the left? Right? Short? This reveals whether your mouse pad angle, grip style, or DPI setting needs adjustment.</li>
              <li style={{ marginBottom: '0.5rem' }}>Hydrate. Your fine motor control is measurably affected by dehydration. Drink water before and during training sessions.</li>
              <li style={{ marginBottom: '0.5rem' }}>Sleep. The majority of motor-skill consolidation happens during sleep. Six to eight hours of quality sleep between sessions accelerates improvement faster than any technique change.</li>
            </ul>

            {/* ── FAQ ── */}
            <section aria-label="Frequently Asked Questions">
              <h2 style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--neon-green, #10b981)', marginTop: '2rem', marginBottom: '1.25rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { q: 'What is a good accuracy score in this test?', a: 'For beginners, 60–70% accuracy is a healthy starting point. Intermediate players typically reach 75–85%. Achieving 90%+ accuracy consistently places you in the top tier of aim trainers. Grade S requires 95%+ accuracy with a high score.' },
                  { q: 'How is accuracy calculated in this test?', a: 'Accuracy = (Hits ÷ Total Clicks) × 100. Every click inside the play area counts — whether it lands on a target or empty space. Hitting a target counts as one hit and one total click. Missing adds only to total clicks.' },
                  { q: 'Why do smaller targets give more points?', a: 'Smaller targets require higher precision. The points formula is 100 × (50 / (size + 1)), so a 15px-diameter target is worth roughly three times more than a 45px target. Your combo multiplier further amplifies these rewards.' },
                  { q: 'What does the combo multiplier do?', a: 'Hitting 5 consecutive targets without missing activates a ×1.5 multiplier. 10 hits gives ×2, 20 hits gives ×2.5, and 30+ hits maxes out at ×3. One miss resets your combo to zero. Combos are the primary way to achieve top-tier scores.' },
                  { q: 'What are penalty targets and how do they work?', a: 'Red penalty targets deduct points from your score when clicked. They appear with approximately 8% spawn probability and are designed to punish reckless clicking. Avoid them to maintain your score and combo streak.' },
                  { q: 'Can I use this test on mobile or tablet?', a: 'Yes! Touch input is fully supported. Tap targets as they appear. The layout adapts responsively for smaller screens. Accidental scroll prevention is active during gameplay so you do not navigate away mid-session.' },
                  { q: 'Does the combo reset when I miss a penalty target?', a: 'Yes. Clicking a penalty target counts as a miss for combo purposes — it resets your streak to zero and deducts score points. The safest strategy is to skip penalty targets entirely if your combo is high.' },
                  { q: 'What DPI should I set my mouse to for this test?', a: 'Most players find 400–1600 DPI provides a good balance. Start with your current DPI and evaluate your accuracy. If you are consistently overshooting targets, reduce DPI by 200 increments until your accuracy stabilizes above 75%.' },
                  { q: 'Should I disable mouse acceleration before training?', a: 'Absolutely. Mouse acceleration changes how far your cursor travels based on movement speed, which prevents consistent muscle memory from forming. In Windows, uncheck "Enhance pointer precision" in Mouse Settings → Pointer Options.' },
                  { q: 'How often should I practice mouse accuracy?', a: 'Research on motor skill learning suggests 15–20 minute daily sessions produce optimal improvement. Practicing more than 45 minutes per day yields diminishing returns and increases injury risk from repetitive strain.' },
                  { q: 'How does reaction time affect my score?', a: 'Reaction time is tracked per target (time between spawn and your click). It does not directly affect points, but faster reactions allow you to hit more targets before they expire, enabling higher combos and total scores.' },
                  { q: 'What is the highest possible score?', a: 'The theoretical maximum depends on how many targets you hit with a ×3 combo multiplier, prioritizing tiny targets. Under ideal conditions with 95%+ accuracy and sustained ×3 combo, scores above 15,000 are achievable.' },
                  { q: 'What do the performance grades (S, A, B, C, D, F) mean?', a: 'Grade S requires 95%+ accuracy and 8000+ score. A requires 85%+ accuracy and 5000+ score. B requires 75%+ and 3000+. C requires 60%+ and 1500+. D requires 45%+ accuracy. F is awarded for below-threshold performance.' },
                  { q: 'Are my session results saved?', a: 'Yes. The last 20 sessions are stored in your browser\'s localStorage. They persist between visits on the same device. You can clear the history at any time from the Session History panel.' },
                  { q: 'Can I pause the game?', a: 'Yes! Press P or Esc to pause at any time. The timer freezes, targets stop spawning, and existing target lifetimes pause. Press P or Esc again (or click Resume) to continue from exactly where you left off.' },
                  { q: 'What keyboard shortcuts are available?', a: 'Space: Start game. P or Esc: Pause/Resume. R: Restart. F: Toggle fullscreen. Shortcuts are displayed below the stats panel during gameplay.' },
                  { q: 'Does this trainer help with games other than FPS?', a: 'Yes. MOBA players benefit from faster unit selection accuracy. RTS players improve build order clicking speed. ARPG players reduce skill misclicks. Even casual gamers who click on menus, inventory items, or dialogue options will notice improvements.' },
                  { q: 'What is the difference between normal and fast targets?', a: 'Normal targets persist for 1800ms before disappearing. Fast targets have only 900ms of lifetime, requiring quicker reactions. Fast targets award 1.2× the base points to compensate for the additional difficulty.' },
                  { q: 'How does the crosshair cursor work?', a: 'When the game is running, your OS cursor is hidden and replaced with a custom SVG crosshair that follows your mouse position in real time. It scales slightly smaller when you click to provide visual click feedback.' },
                  { q: 'Is this mouse accuracy test free?', a: 'Completely free. No account required, no advertisements, no premium tier. All features including history tracking, combo system, multiple target types, and performance grading are available to everyone.' },
                ].map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.35rem' }}>{item.q}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2.5rem', marginBottom: '0.75rem' }}>
              Conclusion
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Mouse accuracy is a trainable skill — not a fixed trait. Whether you are starting from 50% accuracy or looking to push past 90%, the path forward is the same: deliberate practice, optimal hardware settings, consistent sessions, and data-driven improvement tracking.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              This Mouse Accuracy Test provides everything you need to build that path. The combo system rewards sustained precision. The multiple target types simulate real-world clicking scenarios. The session history keeps you accountable. The performance grade tells you honestly where you stand.
            </p>
            <p style={{ marginBottom: 0 }}>
              Start your first session, benchmark your baseline score, and commit to the training schedule above. Most players see meaningful accuracy improvements within two to three weeks of consistent practice. Your hands already know how to move — this trainer helps your brain learn to direct them with precision.
            </p>
          </article>
        </div>
        {/* ═══════════════════ END SEO ARTICLE ═══════════════════ */}
      </div>

      {/* Result Modal */}
      {showModal && lastResult && (
        <ResultModal
          result={lastResult}
          onPlayAgain={() => { setShowModal(false); beginCountdown(); }}
          onClose={() => setShowModal(false)}
          onShare={shareResult}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Global styles */}
      <style>{`
        @keyframes target-appear {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
        @keyframes target-pulse {
          0%   { box-shadow: 0 0 18px rgba(249,115,22,0.5); }
          100% { box-shadow: 0 0 30px rgba(249,115,22,0.9), 0 0 50px rgba(249,115,22,0.4); }
        }
        @keyframes particle-fade {
          0%   { opacity: 1;  transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0;  transform: translate(calc(-50% + var(--vx, 20px)), calc(-50% + var(--vy, -30px))) scale(0.2); }
        }
        @keyframes ripple-expand {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(3);  opacity: 0; }
        }
        @keyframes float-up {
          0%   { transform: translate(-50%,-50%) translateY(0);   opacity: 1; }
          100% { transform: translate(-50%,-50%) translateY(-50px); opacity: 0; }
        }
        @keyframes countdown-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes combo-flash {
          0%   { transform: translateX(-50%) scale(0.8); opacity: 0; }
          20%  { transform: translateX(-50%) scale(1.1); opacity: 1; }
          80%  { transform: translateX(-50%) scale(1);   opacity: 1; }
          100% { transform: translateX(-50%) scale(0.9); opacity: 0; }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%   { box-shadow: 0 0 10px rgba(251,191,36,0.4); }
          100% { box-shadow: 0 0 24px rgba(251,191,36,0.8); }
        }
        @keyframes shrink-bar {
          0%   { width: 100%; }
          100% { width: 0%; }
        }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 'repeat(4, 1fr)'"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        button:focus-visible {
          outline: 2px solid #00f5ff;
          outline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}

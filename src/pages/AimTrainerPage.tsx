import {
  useState, useRef, useCallback, useEffect, useReducer, useMemo
} from 'react';

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
  | { type: 'MISS' };

const GAME_DURATION = 30;
const SPAWN_INTERVAL = 700;

const TARGET_LIFETIME: Record<TargetType, number> = {
  normal: 1800, fast: 900, tiny: 1400, bonus: 2200, penalty: 2000,
};

const TARGET_COLORS: Record<TargetType, string> = {
  normal:  'radial-gradient(circle, #00f5ff 0%, #a855f7 100%)',
  fast:    'radial-gradient(circle, #f97316 0%, #ef4444 100%)',
  tiny:    'radial-gradient(circle, #a855f7 0%, #6366f1 100%)',
  bonus:   'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)',
  penalty: 'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
};

const TARGET_GLOW: Record<TargetType, string> = {
  normal:  'rgba(0,245,255,0.5)',
  fast:    'rgba(249,115,22,0.5)',
  tiny:    'rgba(168,85,247,0.5)',
  bonus:   'rgba(251,191,36,0.6)',
  penalty: 'rgba(239,68,68,0.5)',
};

const TARGET_PROBS: [TargetType, number][] = [
  ['normal', 0.45], ['fast', 0.20], ['tiny', 0.15], ['bonus', 0.12], ['penalty', 0.08],
];

const COMBO_THRESHOLDS = [5, 10, 20, 30] as const;
const COMBO_MULTIPLIERS: Record<number, number> = { 0: 1, 5: 1.5, 10: 2, 20: 2.5, 30: 3 };
const STORAGE_KEY  = 'mouse-accuracy-history';
const SETTINGS_KEY = 'mouse-accuracy-settings';

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
    case 'tiny':    return 14 + Math.random() * 12;
    case 'bonus':   return 28 + Math.random() * 18;
    case 'penalty': return 30 + Math.random() * 20;
    case 'fast':    return 22 + Math.random() * 20;
    default:        return 25 + Math.random() * 35;
  }
}

function getComboMultiplier(combo: number): number {
  const thresholds = Object.keys(COMBO_MULTIPLIERS).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (combo >= t) return COMBO_MULTIPLIERS[t];
  }
  return 1;
}

function calcPoints(type: TargetType, size: number, combo: number): number {
  const base = Math.round(100 * (50 / (size + 1)));
  const mult = getComboMultiplier(combo);
  switch (type) {
    case 'bonus':   return Math.round(base * 3 * mult);
    case 'penalty': return -Math.abs(Math.round(base * 0.5));
    case 'tiny':    return Math.round(base * 1.5 * mult);
    case 'fast':    return Math.round(base * 1.2 * mult);
    default:        return Math.round(base * mult);
  }
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
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const initialGameState: GameState = {
  score: 0, hits: 0, misses: 0, combo: 0, peakCombo: 0,
  streak: 0, bestStreak: 0, totalClicks: 0,
  reactionTimes: [], hitsPerSecBuffer: [], peakHitsPerSec: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET': return { ...initialGameState };
    case 'HIT': {
      const newCombo  = state.combo + 1;
      const newPeak   = Math.max(state.peakCombo, newCombo);
      const newStreak = state.streak + 1;
      const newBest   = Math.max(state.bestStreak, newStreak);
      const newTimes  = [...state.reactionTimes, action.reactionTime].slice(-50);
      const newBuf    = [...state.hitsPerSecBuffer, action.timestamp].filter(t => action.timestamp - t < 1000);
      return {
        ...state,
        score: Math.max(0, state.score + action.points),
        hits: state.hits + 1, combo: newCombo, peakCombo: newPeak,
        streak: newStreak, bestStreak: newBest, totalClicks: state.totalClicks + 1,
        reactionTimes: newTimes, hitsPerSecBuffer: newBuf,
        peakHitsPerSec: Math.max(state.peakHitsPerSec, newBuf.length),
      };
    }
    case 'MISS':
      return { ...state, misses: state.misses + 1, combo: 0, streak: 0, totalClicks: state.totalClicks + 1 };
    default:
      return state;
  }
}

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
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
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
    hit:       () => playTone(600, 'sine', 0.08, 0.3, 300),
    miss:      () => playTone(150, 'sawtooth', 0.12, 0.2),
    combo:     (n: number) => playTone(400 + n * 20, 'square', 0.08, 0.2),
    countdown: (n: number) => playTone(n === 0 ? 880 : 440, 'sine', 0.15, 0.35),
    finish:    () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.3), i * 120)); },
    click:     () => playTone(300, 'sine', 0.05, 0.15),
  };
}

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const pieces    = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; r: number; rot: number; rotV: number }>>([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ['#00f5ff','#a855f7','#fbbf24','#10b981','#f97316','#ef4444'];
    pieces.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width, y: -10,
      vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: 4 + Math.random() * 6, rot: 0, rotV: (Math.random() - 0.5) * 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
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
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} aria-hidden="true" />;
}

function AccuracyGraph({ hits, total }: { hits: number; total: number }) {
  const acc    = total > 0 ? Math.round((hits / total) * 100) : 100;
  const r      = 20;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (acc / 100) * circ;
  const color  = acc >= 80 ? '#10b981' : acc >= 60 ? '#f97316' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`Accuracy: ${acc}%`}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px', transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontWeight="700">{acc}%</text>
      </svg>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted,#666)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy</span>
    </div>
  );
}

// ── Result Card (inline, no popup) ───────────────────────────────────────────
function ResultCard({ result, onPlayAgain }: { result: SessionResult; onPlayAgain: () => void }) {
  const gradeColors: Record<Grade, string> = {
    S: '#fbbf24', A: '#10b981', B: '#00f5ff', C: '#a855f7', D: '#f97316', F: '#ef4444',
  };
  const color = gradeColors[result.grade];

  const stats = [
    { label: 'Score',         value: result.score.toLocaleString(),          color: '#00f5ff' },
    { label: 'Accuracy',      value: `${result.accuracy}%`,                  color: '#10b981' },
    { label: 'Hits',          value: result.hits,                            color: '#a855f7' },
    { label: 'Misses',        value: result.misses,                          color: '#ef4444' },
    { label: 'Total Clicks',  value: result.totalClicks,                     color: '#f97316' },
    { label: 'Avg Pts/Hit',   value: Math.round(result.avgPoints),           color: '#fbbf24' },
    { label: 'Peak Combo',    value: `×${result.combo}`,                     color: '#00f5ff' },
    { label: 'Peak Hits/sec', value: result.peakHitsPerSec.toFixed(1),       color: '#10b981' },
    { label: 'Avg Reaction',  value: `${Math.round(result.reactionTime)}ms`, color: '#a855f7' },
    { label: 'Best Streak',   value: result.bestStreak,                      color: '#f97316' },
    { label: 'Duration',      value: `${result.duration}s`,                  color: '#fbbf24' },
  ];

  return (
    <div style={{
      background: 'var(--bg-card,#1a1a2e)', border: `1px solid ${color}40`,
      borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem',
      boxShadow: `0 0 30px ${color}20`,
    }}>
      {/* Grade row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '900', color, textShadow: `0 0 20px ${color}`, lineHeight: 1 }}>
          {result.grade}
        </span>
        <div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ fontSize: '1.2rem', color: i < result.stars ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted,#888)', marginTop: '0.15rem' }}>Performance Grade</div>
        </div>
        <button className="btn btn-primary" onClick={onPlayAgain} style={{ marginLeft: 'auto' }}>
          ▶ Play Again
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.6rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', padding: '0.65rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted,#888)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.15rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PauseOverlay({ onResume, onRestart, onExit }: { onResume: () => void; onRestart: () => void; onExit: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Game Paused" style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '1rem', borderRadius: '14px',
    }}>
      <span style={{ fontSize: '2rem' }}>⏸</span>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', margin: 0 }}>Paused</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted,#888)', margin: 0 }}>Press P or Esc to resume</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '180px' }}>
        <button className="btn btn-primary"   onClick={onResume}  autoFocus>▶ Resume</button>
        <button className="btn btn-secondary" onClick={onRestart}>↺ Restart</button>
        <button className="btn btn-secondary" onClick={onExit} style={{ color: '#ef4444' }}>✕ Exit</button>
      </div>
    </div>
  );
}

function CountdownOverlay({ count, prefersReducedMotion }: { count: number; prefersReducedMotion: boolean }) {
  const label = count === 0 ? 'GO!' : String(count);
  const color = count === 0 ? '#10b981' : count === 1 ? '#ef4444' : '#fbbf24';
  return (
    <div aria-live="assertive" aria-atomic="true" style={{
      position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px',
    }}>
      <div style={{
        fontSize: count === 0 ? '4rem' : '7rem', fontWeight: '900', color,
        textShadow: `0 0 40px ${color}`, lineHeight: 1,
        animation: prefersReducedMotion ? 'none' : 'countdown-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
      }}>{label}</div>
    </div>
  );
}

function HistoryPanel({ history, onClear }: { history: SessionResult[]; onClear: () => void }) {
  if (history.length === 0) return null;
  const gradeColors: Record<Grade, string> = {
    S: '#fbbf24', A: '#10b981', B: '#00f5ff', C: '#a855f7', D: '#f97316', F: '#ef4444',
  };
  return (
    <div style={{ background: 'var(--bg-card,#1a1a2e)', border: '1px solid var(--border,#333)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>📊 Session History</h3>
        <button className="btn btn-secondary" onClick={onClear} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} aria-label="Clear history">Clear All</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
        {history.slice(0, 10).map(s => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '0.75rem', alignItems: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.82rem',
          }}>
            <span style={{ color: 'var(--text-muted,#888)', fontSize: '0.75rem' }}>{formatDate(s.date)}</span>
            <span style={{ color: '#00f5ff', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{s.score.toLocaleString()}</span>
            <span style={{ color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{s.accuracy}%</span>
            <span style={{ color: 'var(--text-muted,#888)', fontVariantNumeric: 'tabular-nums' }}>{s.hits} hits</span>
            <span style={{ color: gradeColors[s.grade], fontWeight: '800' }}>{s.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortcutHints({ phase }: { phase: Phase }) {
  const hints = (phase === 'running' || phase === 'paused')
    ? [['P / Esc', 'Pause'], ['R', 'Restart']]
    : [['Space', 'Start']];
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
      {hints.map(([key, action]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted,#888)' }}>
          <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '0.15rem 0.45rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#fff' }}>{key}</kbd>
          <span>{action}</span>
        </span>
      ))}
    </div>
  );
}

function Breadcrumb() {
  const items: [string, string | null][] = [
    ['Home', '/'], ['Tools', '/tools'], ['Mouse Accuracy Test', null],
  ];
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted,#888)' }}>
        {items.map(([label, href], i) => (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {href
              ? <a href={href} style={{ color: 'var(--neon-cyan,#00f5ff)', textDecoration: 'none' }}>{label}</a>
              : <span aria-current="page" style={{ color: '#fff' }}>{label}</span>
            }
            {i < items.length - 1 && <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SEOHead() {
  useEffect(() => {
    document.title = 'Mouse Accuracy Test — Free Online Aim Trainer & Accuracy Checker';
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const desc = 'Test and improve your mouse accuracy with our free online aim trainer. Track score, accuracy %, reaction time, combo streaks, and more.';
    setMeta('meta[name="description"]',         'content', desc);
    setMeta('meta[name="robots"]',              'content', 'index, follow');
    setMeta('meta[property="og:title"]',        'content', 'Mouse Accuracy Test — Free Aim Trainer');
    setMeta('meta[property="og:description"]',  'content', desc);
    setMeta('meta[property="og:url"]',          'content', window.location.href);
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'content', 'Mouse Accuracy Test — Free Aim Trainer');
    setMeta('meta[name="twitter:description"]', 'content', desc);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
    const schemaId = 'jsonld-schema';
    let schemaEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = schemaId; schemaEl.type = 'application/ld+json'; document.head.appendChild(schemaEl); }
    schemaEl.textContent = JSON.stringify([
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Mouse Accuracy Test', url: window.location.href, applicationCategory: 'GameApplication', operatingSystem: 'Web Browser', description: desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',               item: window.location.origin },
        { '@type': 'ListItem', position: 2, name: 'Tools',              item: `${window.location.origin}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Mouse Accuracy Test',item: window.location.href },
      ]},
    ]);
  }, []);
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MouseAccuracyPage() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').soundEnabled ?? true; } catch { return true; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').volume ?? 0.5; } catch { return 0.5; }
  });
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ soundEnabled, volume })); } catch {}
  }, [soundEnabled, volume]);

  const [phase,      setPhase]      = useState<Phase>('idle');
  const [countdown,  setCountdown]  = useState(3);
  const [targets,    setTargets]    = useState<Target[]>([]);
  const [timeLeft,   setTimeLeft]   = useState(GAME_DURATION);
  const [gameState,  dispatch]      = useReducer(gameReducer, initialGameState);
  const [particles,  setParticles]  = useState<Particle[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatingText[]>([]);
  const [ripples,    setRipples]    = useState<Ripple[]>([]);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [confetti,   setConfetti]   = useState(false);
  const [history,    setHistory]    = useState<SessionResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [comboFlash, setComboFlash] = useState<string | null>(null);
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const areaRef        = useRef<HTMLDivElement>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef    = useRef(0);
  const particleIdRef  = useRef(0);
  const floatIdRef     = useRef(0);
  const rippleIdRef    = useRef(0);
  const phaseRef       = useRef<Phase>('idle');
  const timeLeftRef    = useRef(GAME_DURATION);
  const gameStateRef   = useRef(gameState);
  const targetTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const pauseDataRef   = useRef<{ timeLeft: number } | null>(null);
  const gameStartTime  = useRef(0);

  useEffect(() => { phaseRef.current    = phase;     }, [phase]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { timeLeftRef.current  = timeLeft;  }, [timeLeft]);

  const sfx = useSoundEngine(soundEnabled, volume);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current)     { clearInterval(timerRef.current);     timerRef.current = null; }
    if (spawnRef.current)     { clearInterval(spawnRef.current);     spawnRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    if (prefersReducedMotion) return;
    const newP: Particle[] = Array.from({ length: count }, () => ({
      id: ++particleIdRef.current, x, y, color, size: 3 + Math.random() * 4,
    }));
    setParticles(prev => [...prev, ...newP]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newP.find(n => n.id === p.id))), 700);
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

  const finaliseResult = useCallback(() => {
    const gs    = gameStateRef.current;
    const acc   = gs.totalClicks > 0 ? Math.round((gs.hits / gs.totalClicks) * 100) : 100;
    const avgR  = gs.reactionTimes.length > 0 ? gs.reactionTimes.reduce((a, b) => a + b, 0) / gs.reactionTimes.length : 0;
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
    if (grade === 'S' || grade === 'A') { setConfetti(true); setTimeout(() => setConfetti(false), 5000); }
    setHistory(prev => {
      const updated = [result, ...prev].slice(0, 20);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

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
    const to = setTimeout(() => { setTargets(prev => prev.filter(t => t.id !== id)); targetTimeouts.current.delete(id); }, lifetime);
    targetTimeouts.current.set(id, to);
  }, []);

  const startTimerLoop = useCallback((initialElapsed: number) => {
    let elapsed = initialElapsed;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, GAME_DURATION - elapsed);
      timeLeftRef.current = left;
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!); timerRef.current = null;
        clearInterval(spawnRef.current!); spawnRef.current = null;
        setPhase('done'); phaseRef.current = 'done';
        setTargets([]);
        targetTimeouts.current.forEach(t => clearTimeout(t));
        targetTimeouts.current.clear();
        sfx.finish();
        finaliseResult();
      }
    }, 100);
  }, [sfx, finaliseResult]);

  const startGameEngine = useCallback(() => {
    gameStartTime.current = Date.now();
    spawnTarget();
    spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);
    startTimerLoop(0);
  }, [spawnTarget, startTimerLoop]);

  const beginCountdown = useCallback(() => {
    clearAllTimers();
    dispatch({ type: 'RESET' });
    setTargets([]); setParticles([]); setFloatTexts([]); setRipples([]);
    setLastResult(null);
    setTimeLeft(GAME_DURATION); setCountdown(3);
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
  }, [clearAllTimers, sfx, startGameEngine]);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    clearInterval(timerRef.current!); timerRef.current = null;
    clearInterval(spawnRef.current!); spawnRef.current = null;
    pauseDataRef.current = { timeLeft: timeLeftRef.current };
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setTargets([]);
    setPhase('paused'); phaseRef.current = 'paused';
    sfx.click();
  }, [sfx]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    const left = pauseDataRef.current?.timeLeft ?? timeLeftRef.current;
    setPhase('running'); phaseRef.current = 'running';
    sfx.click();
    spawnTarget();
    spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);
    startTimerLoop(GAME_DURATION - left);
  }, [sfx, spawnTarget, startTimerLoop]);

  const exitToIdle = useCallback(() => {
    clearAllTimers();
    setPhase('idle'); phaseRef.current = 'idle';
    setTargets([]);
    sfx.click();
  }, [clearAllTimers, sfx]);

  const hitTarget = useCallback((target: Target, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;
    const to = targetTimeouts.current.get(target.id);
    if (to) { clearTimeout(to); targetTimeouts.current.delete(target.id); }
    setTargets(prev => prev.filter(t => t.id !== target.id));
    const rt  = Date.now() - target.spawnTime;
    const pts = calcPoints(target.type, target.size, gameStateRef.current.combo);
    const now = Date.now();
    if (target.type !== 'penalty') {
      dispatch({ type: 'HIT', points: pts, reactionTime: rt, timestamp: now });
      sfx.hit();
      const newCombo = gameStateRef.current.combo + 1;
      if (COMBO_THRESHOLDS.includes(newCombo as any)) {
        sfx.combo(newCombo);
        setComboFlash(`${newCombo}x COMBO!`);
        setTimeout(() => setComboFlash(null), 1200);
      }
    } else {
      dispatch({ type: 'MISS' });
      sfx.miss();
    }
    spawnParticles(target.x, target.y, TARGET_GLOW[target.type], target.type === 'bonus' ? 14 : 8);
    spawnRipple(target.x, target.y, TARGET_GLOW[target.type]);
    spawnFloatText(target.x, target.y - target.size,
      target.type === 'penalty' ? `${pts}` : `+${pts}`,
      target.type === 'penalty' ? '#ef4444' : pts > 200 ? '#fbbf24' : '#10b981',
    );
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          if (phaseRef.current === 'idle' || phaseRef.current === 'done') { e.preventDefault(); beginCountdown(); }
          break;
        case 'Escape': case 'p': case 'P':
          if (phaseRef.current === 'running') pause();
          else if (phaseRef.current === 'paused') resume();
          break;
        case 'r': case 'R':
          if (phaseRef.current !== 'idle' && phaseRef.current !== 'countdown') beginCountdown();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beginCountdown, pause, resume]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (phaseRef.current === 'running') e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const acc        = gameState.totalClicks > 0 ? Math.round((gameState.hits / gameState.totalClicks) * 100) : 100;
  const progress   = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;
  const multiplier = getComboMultiplier(gameState.combo);
  const avgRT      = gameState.reactionTimes.length > 0
    ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length) : 0;

  const statCards = useMemo(() => [
    { value: gameState.score.toLocaleString(), label: 'Score',      color: 'var(--neon-cyan,#00f5ff)' },
    { value: `${acc}%`,                        label: 'Accuracy',   color: 'var(--neon-green,#10b981)', node: <AccuracyGraph hits={gameState.hits} total={gameState.totalClicks} /> },
    { value: gameState.hits,                   label: 'Hits',       color: 'var(--neon-purple,#a855f7)' },
    { value: gameState.misses,                 label: 'Misses',     color: 'var(--neon-red,#ef4444)' },
    { value: `${gameState.combo}×`,            label: 'Combo',      color: '#fbbf24' },
    { value: `${gameState.peakCombo}×`,        label: 'Peak Combo', color: '#f97316' },
    { value: avgRT ? `${avgRT}ms` : '—',       label: 'Avg React',  color: '#a855f7' },
    { value: timeLeft.toFixed(1),              label: 'Time',       color: 'var(--neon-orange,#f97316)' },
  ], [gameState, acc, avgRT, timeLeft]);

  return (
    <>
      <SEOHead />
      <Confetti active={confetti} />

      {comboFlash && (
        <div aria-live="polite" style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, fontSize: '2rem', fontWeight: '900',
          color: '#fbbf24', textShadow: '0 0 30px #fbbf24',
          animation: 'combo-flash 1.2s ease forwards', pointerEvents: 'none',
        }}>{comboFlash}</div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Breadcrumb />

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="section-label">Mouse Tool</div>
          <h1 className="tool-title">Mouse Accuracy Test</h1>
          <p className="tool-subtitle">Click targets precisely — smaller targets = more points! Build combos for score multipliers.</p>
        </div>

        {/* Sound controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSoundEnabled((v: boolean) => !v)}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.35rem 0.65rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'On' : 'Off'}
          </button>
          {soundEnabled && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted,#888)' }}>
              Vol
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} aria-label="Volume" style={{ width: '72px', accentColor: '#a855f7' }} />
            </label>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }} role="region" aria-label="Live game statistics">
          {statCards.map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '0.75rem', textAlign: 'center',
              borderColor: s.label === 'Combo' && gameState.combo >= 5 ? '#fbbf24' : undefined,
              transition: 'border-color 0.3s ease',
            }}>
              {s.node
                ? <div style={{ display: 'flex', justifyContent: 'center' }}>{s.node}</div>
                : <>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem', letterSpacing: '0.05em' }}>{s.label}</div>
                  </>
              }
            </div>
          ))}
        </div>

        {/* Multiplier badge */}
        {multiplier > 1 && (
          <div aria-live="polite" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block', background: 'linear-gradient(135deg,#fbbf24,#f97316)',
              borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', fontWeight: '800', color: '#000',
              boxShadow: '0 0 16px rgba(251,191,36,0.5)',
              animation: prefersReducedMotion ? 'none' : 'pulse-glow 1s ease infinite alternate',
            }}>×{multiplier} MULTIPLIER</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="progress-bar" style={{ marginBottom: '0.75rem' }}
          role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`${timeLeft.toFixed(1)} seconds remaining`}
        >
          <div className="progress-fill" style={{
            width: `${progress}%`,
            background: timeLeft < 5 ? 'linear-gradient(90deg,#ef4444,#f97316)' : undefined,
            transition: 'width 0.1s linear, background 0.5s ease',
          }} />
        </div>

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
            cursor: 'default',
            marginBottom: '1rem',
            boxShadow: phase === 'running' ? '0 0 40px rgba(191,90,242,0.1)' : 'none',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            WebkitUserSelect: 'none', userSelect: 'none',
          }}
        >
          {/* Idle / Done */}
          {(phase === 'idle' || phase === 'done') && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '4rem' }} role="img" aria-label="target">🎯</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: phase === 'done' ? 'var(--neon-orange,#f97316)' : 'var(--neon-purple,#a855f7)' }}>
                {phase === 'done' ? 'Game Over! See results below.' : 'Click Start to Play'}
              </span>
              {phase === 'idle' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px', margin: 0 }}>
                  Hit targets to score. Combos multiply your points. Avoid penalty targets!
                </p>
              )}
            </div>
          )}

          {phase === 'countdown' && <CountdownOverlay count={countdown} prefersReducedMotion={prefersReducedMotion} />}
          {phase === 'paused'    && <PauseOverlay onResume={resume} onRestart={beginCountdown} onExit={exitToIdle} />}

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} aria-hidden="true" style={{
              position: 'absolute', left: p.x, top: p.y,
              width: p.size, height: p.size, borderRadius: '50%', background: p.color,
              pointerEvents: 'none', transform: 'translate(-50%,-50%)',
              animation: 'particle-fade 0.7s ease forwards',
            }} />
          ))}

          {/* Ripples */}
          {ripples.map(r => (
            <div key={r.id} aria-hidden="true" style={{
              position: 'absolute', left: r.x, top: r.y, width: 60, height: 60,
              borderRadius: '50%', border: `2px solid ${r.color}`,
              transform: 'translate(-50%,-50%)', pointerEvents: 'none',
              animation: 'ripple-expand 0.6s ease forwards',
            }} />
          ))}

          {/* Float texts */}
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
                position: 'absolute', left: `${t.x}px`, top: `${t.y}px`,
                width: `${t.size}px`, height: `${t.size}px`, borderRadius: '50%',
                transform: 'translate(-50%,-50%)',
                background: TARGET_COLORS[t.type],
                border: t.type === 'penalty' ? '2px solid rgba(239,68,68,0.9)' : t.type === 'bonus' ? '2px solid rgba(251,191,36,0.9)' : '2px solid rgba(255,255,255,0.85)',
                cursor: 'crosshair',
                animation: ['target-appear 0.15s cubic-bezier(0.175,0.885,0.32,1.275) forwards', t.type === 'fast' ? 'target-pulse 0.5s ease infinite alternate' : ''].filter(Boolean).join(', '),
                boxShadow: `0 0 18px ${TARGET_GLOW[t.type]}, 0 0 6px rgba(0,0,0,0.4)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: `${Math.max(0.55, t.size * 0.018)}rem`,
                fontWeight: '800', userSelect: 'none', padding: 0, zIndex: 5,
                transition: 'transform 0.05s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%,-50%) scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-50%,-50%) scale(1)'; }}
            >
              {t.type === 'penalty' ? '✕' : t.type === 'bonus' ? '★' : t.size > 32 ? t.points : ''}
            </button>
          ))}

          {/* Lifetime bars */}
          {phase === 'running' && targets.map(t => (
            <div key={`lb-${t.id}`} aria-hidden="true" style={{
              position: 'absolute', left: `${t.x - t.size / 2}px`, top: `${t.y + t.size / 2 + 4}px`,
              width: `${t.size}px`, height: '2px',
              background: 'rgba(255,255,255,0.15)', borderRadius: '1px', overflow: 'hidden', pointerEvents: 'none',
            }}>
              <div style={{ height: '100%', background: TARGET_GLOW[t.type], animation: `shrink-bar ${t.lifetime}ms linear forwards` }} />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(phase === 'idle' || phase === 'done') && (
            <button className="btn btn-primary" onClick={beginCountdown}>{phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}</button>
          )}
          {phase === 'running' && (
            <button className="btn btn-secondary" onClick={pause}>⏸ Pause</button>
          )}
          {phase === 'paused' && (
            <button className="btn btn-primary" onClick={resume}>▶ Resume</button>
          )}
          {(phase === 'running' || phase === 'paused') && (
            <button className="btn btn-secondary" onClick={beginCountdown}>↺ Restart</button>
          )}
          {phase !== 'idle' && (
            <button className="btn btn-secondary" onClick={exitToIdle}>✕ Exit</button>
          )}
        </div>

        {/* Inline Result Card */}
        {phase === 'done' && lastResult && (
          <ResultCard result={lastResult} onPlayAgain={beginCountdown} />
        )}

        {/* Target legend */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Types</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {(Object.keys(TARGET_COLORS) as TargetType[]).map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: TARGET_COLORS[type], boxShadow: `0 0 6px ${TARGET_GLOW[type]}`, flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#aaa)', textTransform: 'capitalize' }}>
                  {type}{type === 'bonus' ? ' (+3× pts)' : type === 'penalty' ? ' (−pts)' : type === 'tiny' ? ' (+1.5×)' : type === 'fast' ? ' (faster)' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <HistoryPanel history={history} onClear={() => { setHistory([]); try { localStorage.removeItem(STORAGE_KEY); } catch {} }} />

        {/* SEO Article */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.8' }}>
          <article>
            <h2 style={{ fontWeight: '800', fontSize: '1.6rem', color: 'var(--neon-cyan,#00f5ff)', marginTop: 0, marginBottom: '0.75rem' }}>What is a Mouse Accuracy Test?</h2>
            <p style={{ marginBottom: '1.25rem' }}>A <strong>Mouse Accuracy Test</strong> is an interactive browser-based tool that evaluates how precisely your hand translates intention into cursor movement. Each click is logged against your total inputs, computing a real-time accuracy percentage that reflects genuine pointing precision rather than raw speed alone.</p>
            <p style={{ marginBottom: '1.25rem' }}>Modern accuracy trainers track <strong>combo streaks</strong>, <strong>reaction time</strong>, <strong>hits per second</strong>, and performance grades — giving you a comprehensive picture of your cursor control useful for both competitive gamers and creative professionals.</p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>How Accuracy is Calculated</h2>
            <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.88rem', marginBottom: '1.25rem', overflow: 'auto' }}>Accuracy (%) = (Total Hits / Total Clicks) × 100</pre>
            <p style={{ marginBottom: '1.25rem' }}>Every click in the game area increments Total Clicks. Successful target hits increment Total Hits. A perfect 100% means every click connected with a target.</p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>How to Improve Mouse Accuracy</h2>
            <ol style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              {[
                ['Lower your sensitivity', 'Lower DPI forces larger physical movements, engaging arm muscles for finer micro-correction.'],
                ['Disable mouse acceleration', 'The most important change — acceleration prevents consistent muscle-memory from forming.'],
                ['Use a large mouse pad', 'Extended glide space allows full arm-aiming at lower sensitivities.'],
                ['Maintain proper posture', 'Keep wrist straight, elbow on desk. Arm-aiming covers larger distances more accurately.'],
                ['Practice in short sessions', '15–20 minutes of deliberate daily practice beats grinding for hours while fatigued.'],
              ].map(([t, d]) => <li key={t as string} style={{ marginBottom: '0.6rem' }}><strong>{t}</strong> — {d}</li>)}
            </ol>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Best DPI for FPS Games</h2>
            <p style={{ marginBottom: '1.25rem' }}>Professional FPS players cluster around <strong>400–800 DPI</strong> with low in-game sensitivity, producing an eDPI of 400–1200. If you consistently overshoot targets here, reduce DPI by 200 increments until accuracy stabilises above 75%.</p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Mouse Acceleration Explained</h2>
            <p style={{ marginBottom: '1.25rem' }}>Mouse acceleration multiplies cursor travel proportionally to movement speed, breaking the deterministic mapping that muscle memory requires. In Windows, uncheck <em>"Enhance pointer precision"</em> under Settings → Mouse → Pointer Options.</p>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Common Mistakes in Aim Training</h2>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              {[
                'Training at too high a sensitivity — builds habits around jerky, imprecise movements.',
                'Ignoring mouse acceleration — prevents consistent muscle memory from forming.',
                'Over-training — motor-skill learning happens during rest; keep sessions under 45 minutes.',
                'Only doing accuracy training — tracking and flicking drills develop different skills.',
                'Inconsistent sessions — short daily sessions vastly outperform occasional marathons.',
              ].map(m => <li key={m} style={{ marginBottom: '0.5rem' }}>{m}</li>)}
            </ul>

            <section aria-label="Frequently Asked Questions">
              <h2 style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--neon-green,#10b981)', marginTop: '2rem', marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { q: 'What is a good accuracy score?',          a: 'Beginners: 60–70%. Intermediate: 75–85%. Top tier: 90%+. Grade S requires 95%+ with a high score.' },
                  { q: 'Why do smaller targets give more points?', a: 'Formula: 100 × (50 / (size + 1)) — smaller targets demand higher precision and reward proportionally more.' },
                  { q: 'What does the combo multiplier do?',       a: '5 hits = ×1.5, 10 = ×2, 20 = ×2.5, 30+ = ×3. One miss resets your combo to zero.' },
                  { q: 'What are penalty targets?',                a: 'Red targets that deduct points and reset your combo (~8% spawn rate). Skip them when your combo is high.' },
                  { q: 'Can I use this on mobile?',                a: 'Yes — touch input is fully supported with scroll prevention during gameplay.' },
                  { q: 'Should I disable mouse acceleration?',     a: 'Absolutely. In Windows uncheck "Enhance pointer precision" under Mouse Settings → Pointer Options.' },
                  { q: 'How often should I practice?',             a: '15–20 minute daily sessions produce optimal improvement. More than 45 minutes yields diminishing returns.' },
                  { q: 'Are session results saved?',               a: 'Yes — the last 20 sessions are stored in your browser\'s localStorage and persist between visits.' },
                  { q: 'What keyboard shortcuts are available?',   a: 'Space: Start. P or Esc: Pause/Resume. R: Restart.' },
                  { q: 'Is this test free?',                       a: 'Completely free. No account required, no ads, no premium tier.' },
                ].map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.35rem' }}>{item.q}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <h2 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#fff', marginTop: '2.5rem', marginBottom: '0.75rem' }}>Conclusion</h2>
            <p style={{ marginBottom: 0 }}>Mouse accuracy is a trainable skill. Deliberate practice, optimal hardware settings, and consistent sessions are the path forward. Most players see meaningful gains within two to three weeks of daily practice.</p>
          </article>
        </div>
      </div>

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
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(0.2); }
        }
        @keyframes ripple-expand {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(3); opacity: 0; }
        }
        @keyframes float-up {
          0%   { transform: translate(-50%,-50%) translateY(0);     opacity: 1; }
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
          50%     { transform: translateY(-12px); }
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
          div[role="region"] { grid-template-columns: repeat(2,1fr) !important; }
        }
        button:focus-visible { outline: 2px solid #00f5ff; outline-offset: 2px; }
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

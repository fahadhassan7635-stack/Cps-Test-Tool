import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  memo,
} from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const WORD_BANK =
  'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump sphinx of black quartz judge my vow two driven jocks help fax my big quiz waltz nymph for quick jigs vex bawds';

const DEFAULT_TEXT = WORD_BANK.split(' ').slice(0, 40).join(' ');

const TIMER_OPTIONS = [
  { label: '15s',  value: 15  },
  { label: '30s',  value: 30  },
  { label: '60s',  value: 60  },
  { label: '120s', value: 120 },
  { label: '∞',    value: 0   },
] as const;

type TimerOption = typeof TIMER_OPTIONS[number]['value'];
type Phase = 'idle' | 'running' | 'done';

// Keyboard layout for heatmap
const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccuracyPoint { time: number; accuracy: number }
interface Rating        { label: string; color: string }

interface TestState {
  typed:        string;
  phase:        Phase;
  errors:       number;
  timeLeft:     number;
  elapsed:      number;
  keyErrors:    Record<string, number>;
  keyPresses:   Record<string, number>;
  accuracyLog:  AccuracyPoint[];
  muted:        boolean;
  timerMode:    TimerOption;
  customText:   string;
  useCustom:    boolean;
}

type Action =
  | { type: 'SET_TYPED';    payload: { val: string; errs: number; newErrors: Record<string,number>; newPresses: Record<string,number>; accPoint: AccuracyPoint } }
  | { type: 'TICK' }
  | { type: 'SET_PHASE';    payload: Phase }
  | { type: 'RESET';        payload: { timerMode: TimerOption } }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_TIMER';    payload: TimerOption }
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'TOGGLE_CUSTOM' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function initState(timerMode: TimerOption = 60): TestState {
  return {
    typed:       '',
    phase:       'idle',
    errors:      0,
    timeLeft:    timerMode,
    elapsed:     0,
    keyErrors:   {},
    keyPresses:  {},
    accuracyLog: [],
    muted:       false,
    timerMode,
    customText:  '',
    useCustom:   false,
  };
}

function reducer(state: TestState, action: Action): TestState {
  switch (action.type) {
    case 'SET_TYPED': {
      const { val, errs, newErrors, newPresses, accPoint } = action.payload;
      return {
        ...state,
        typed:       val,
        errors:      errs,
        keyErrors:   newErrors,
        keyPresses:  newPresses,
        accuracyLog: [...state.accuracyLog, accPoint],
      };
    }
    case 'TICK':
      if (state.timerMode === 0) return { ...state, elapsed: state.elapsed + 1 };
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1),
        elapsed:  state.elapsed + 1,
      };
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'RESET':
      return {
        ...initState(action.payload.timerMode),
        muted:     state.muted,
        timerMode: action.payload.timerMode,
        customText: state.customText,
        useCustom:  state.useCustom,
      };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    case 'SET_TIMER':
      return { ...state, timerMode: action.payload, timeLeft: action.payload };
    case 'SET_CUSTOM_TEXT':
      return { ...state, customText: action.payload };
    case 'TOGGLE_CUSTOM':
      return { ...state, useCustom: !state.useCustom };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRating(acc: number): Rating {
  if (acc >= 99) return { label: '🏆 Perfect',       color: 'var(--neon-yellow)' };
  if (acc >= 95) return { label: '✅ Excellent',      color: 'var(--neon-green)'  };
  if (acc >= 90) return { label: '👍 Good',           color: 'var(--neon-cyan)'   };
  if (acc >= 80) return { label: '📝 Average',        color: 'var(--neon-orange)' };
  return           { label: '❌ Needs Practice', color: 'var(--neon-red)'    };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

function calcWPM(correctChars: number, seconds: number): number {
  if (seconds === 0) return 0;
  return Math.round((correctChars / 5) / (seconds / 60));
}

function calcCPM(correctChars: number, seconds: number): number {
  if (seconds === 0) return 0;
  return Math.round(correctChars / (seconds / 60));
}

// ─── Web Audio Sound Engine ───────────────────────────────────────────────────

function createAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try { return new AudioContext(); } catch { return null; }
}

function playClick(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

function playError(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function playFinish(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.25);
  });
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const ConfettiCanvas = memo(function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: Array<{
      x: number; y: number; r: number;
      d: number; color: string; tilt: number; tiltAngle: number;
    }> = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 8 + 4,
      d: Math.random() * 80 + 20,
      color: ['#00f5ff','#00ff88','#ffd700','#ff6b35','#c084fc'][Math.floor(Math.random() * 5)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
    }));

    let angle = 0;
    let rafId: number;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      angle += 0.01;
      pieces.forEach(p => {
        p.tiltAngle += 0.1;
        p.y += (Math.cos(angle + p.d) + 2) * 1.5;
        p.x += Math.sin(angle) * 1.5;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        if (p.y > canvas!.height) { p.y = -10; p.x = Math.random() * canvas!.width; }
        ctx!.beginPath();
        ctx!.fillStyle = p.color;
        ctx!.ellipse(p.x, p.y, p.r / 2, p.r, (p.tilt * Math.PI) / 180, 0, 2 * Math.PI);
        ctx!.fill();
      });
      rafId = requestAnimationFrame(draw);
    }
    draw();

    const timeout = setTimeout(() => cancelAnimationFrame(rafId), 5000);
    return () => { cancelAnimationFrame(rafId); clearTimeout(timeout); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps { value: string | number; label: string; color: string }

const StatCard = memo(function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{value}</div>
      <div style={{
        fontSize: '0.7rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em',
      }}>{label}</div>
    </div>
  );
});

// ─── Keyboard Heatmap ─────────────────────────────────────────────────────────

interface HeatmapProps {
  keyErrors:  Record<string, number>;
  keyPresses: Record<string, number>;
}

const KeyboardHeatmap = memo(function KeyboardHeatmap({ keyErrors, keyPresses }: HeatmapProps) {
  const maxErr = Math.max(1, ...Object.values(keyErrors));

  function getKeyColor(k: string): string {
    const errs = keyErrors[k] || 0;
    if (errs === 0) return keyPresses[k] ? 'rgba(0,255,136,0.25)' : 'var(--bg-card)';
    const ratio = errs / maxErr;
    if (ratio < 0.25) return 'rgba(0,255,136,0.35)';
    if (ratio < 0.5)  return 'rgba(255,210,0,0.45)';
    if (ratio < 0.75) return 'rgba(255,107,53,0.55)';
    return 'rgba(255,45,85,0.65)';
  }

  // Top mistyped keys
  const topMistyped = Object.entries(keyErrors)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 5);

  const rowOffsets = ['0px', '12px', '24px'];

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
        ⌨️ Keyboard Heatmap
      </h3>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '1.25rem', overflowX: 'auto',
      }}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex', gap: '4px', marginBottom: '4px',
            marginLeft: rowOffsets[ri],
          }}>
            {row.map(k => (
              <div key={k} title={`${k}: ${keyErrors[k] || 0} errors`} style={{
                width: '36px', height: '36px', borderRadius: '6px',
                background: getKeyColor(k),
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                transition: 'background 0.3s',
                flexShrink: 0,
              }}>{k}</div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(0,255,136,0.35)',  label: 'Good'    },
            { color: 'rgba(255,210,0,0.45)',  label: 'Few'     },
            { color: 'rgba(255,107,53,0.55)', label: 'Some'    },
            { color: 'rgba(255,45,85,0.65)',  label: 'Many'    },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '3px', background: color,
              }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Top mistyped */}
        {topMistyped.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem',
            }}>
              Most mistyped keys:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {topMistyped.map(([key, count]) => (
                <span key={key} style={{
                  background: 'rgba(255,45,85,0.15)',
                  border: '1px solid rgba(255,45,85,0.35)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  color: 'var(--neon-red)',
                  fontWeight: 700,
                }}>
                  {key.toUpperCase()} ×{count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Accuracy Graph ───────────────────────────────────────────────────────────

interface AccuracyGraphProps { data: AccuracyPoint[] }

const AccuracyGraph = memo(function AccuracyGraph({ data }: AccuracyGraphProps) {
  if (data.length < 2) return null;

  const W = 600, H = 160, PAD = 32;
  const maxT = data[data.length - 1].time || 1;

  const pts = data.map(({ time, accuracy }) => ({
    x: PAD + ((time / maxT) * (W - PAD * 2)),
    y: PAD + ((1 - accuracy / 100) * (H - PAD * 2)),
  }));

  const d = pts
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Fill path
  const fill = `${d} L ${pts[pts.length-1].x} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const yLines = [100, 75, 50, 25, 0];

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
        📈 Accuracy Over Time
      </h3>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '1rem', overflowX: 'auto',
      }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', maxWidth: W, display: 'block' }}
          aria-label="Accuracy over time graph"
          role="img"
        >
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#00f5ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity="0"   />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLines.map(pct => {
            const y = PAD + ((1 - pct / 100) * (H - PAD * 2));
            return (
              <g key={pct}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <text x={PAD - 4} y={y + 4}
                  fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Fill */}
          <path d={fill} fill="url(#accGrad)" />

          {/* Line */}
          <path d={d} fill="none" stroke="#00f5ff" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots at key points */}
          {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 10)) === 0).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00f5ff" />
          ))}
        </svg>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.65rem', color: 'var(--text-muted)', paddingLeft: PAD, paddingRight: PAD,
        }}>
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );
});

// ─── Result Modal ─────────────────────────────────────────────────────────────

interface ResultModalProps {
  accuracy:     number;
  wpm:          number;
  rawWpm:       number;
  netWpm:       number;
  cpm:          number;
  correctChars: number;
  errors:       number;
  elapsed:      number;
  targetLen:    number;
  typedLen:     number;
  onRestart:    () => void;
  onClose:      () => void;
  keyErrors:    Record<string, number>;
  keyPresses:   Record<string, number>;
  accuracyLog:  AccuracyPoint[];
}

const ResultModal = memo(function ResultModal({
  accuracy, wpm, rawWpm, netWpm, cpm,
  correctChars, errors, elapsed, targetLen, typedLen,
  onRestart, onClose,
  keyErrors, keyPresses, accuracyLog,
}: ResultModalProps) {
  const rating     = getRating(accuracy);
  const isPerfect  = accuracy === 100;
  const completion = Math.round((typedLen / targetLen) * 100);

  // Copy results
  const copyResults = useCallback(() => {
    const txt = [
      '⌨️ Keyboard Accuracy Test Results',
      `Accuracy:      ${accuracy}%`,
      `WPM:           ${wpm}`,
      `Raw WPM:       ${rawWpm}`,
      `Net WPM:       ${netWpm}`,
      `CPM:           ${cpm}`,
      `Correct:       ${correctChars}`,
      `Errors:        ${errors}`,
      `Elapsed:       ${formatTime(elapsed)}`,
      `Rating:        ${rating.label}`,
      `Completion:    ${completion}%`,
    ].join('\n');
    navigator.clipboard.writeText(txt).catch(() => {});
  }, [accuracy, wpm, rawWpm, netWpm, cpm, correctChars, errors, elapsed, rating.label, completion]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const stats = [
    { v: `${accuracy}%`,      l: 'Accuracy',      c: 'var(--neon-green)'  },
    { v: wpm,                  l: 'WPM',           c: 'var(--neon-cyan)'   },
    { v: rawWpm,               l: 'Raw WPM',       c: 'var(--neon-cyan)'   },
    { v: netWpm,               l: 'Net WPM',       c: 'var(--neon-yellow)' },
    { v: cpm,                  l: 'CPM',           c: 'var(--neon-orange)' },
    { v: correctChars,         l: 'Correct',       c: 'var(--neon-green)'  },
    { v: errors,               l: 'Errors',        c: 'var(--neon-red)'    },
    { v: formatTime(elapsed),  l: 'Elapsed',       c: 'var(--neon-cyan)'   },
    { v: `${completion}%`,     l: 'Completion',    c: 'var(--neon-yellow)' },
  ];

  return (
    <>
      {isPerfect && <ConfettiCanvas />}

      {/* Backdrop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Test results"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.25s ease',
        }}
      >
        {/* Panel */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {isPerfect && (
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'popIn 0.4s ease' }}>
                🏆
              </div>
            )}
            <div style={{
              fontSize: '3.5rem', fontWeight: 900,
              color: isPerfect ? 'var(--neon-yellow)' : 'var(--neon-green)',
            }}>
              {accuracy}%
            </div>

            {/* Rating badge */}
            <div style={{
              display: 'inline-flex', padding: '0.4rem 1.2rem',
              borderRadius: '50px',
              background: `${rating.color}20`,
              border: `1px solid ${rating.color}40`,
              color: rating.color, fontWeight: 700, marginTop: '0.5rem',
            }}>
              {rating.label}
            </div>

            {isPerfect && (
              <div style={{
                marginTop: '0.75rem',
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: '8px', padding: '0.5rem 1rem',
                color: 'var(--neon-yellow)', fontSize: '0.875rem', fontWeight: 600,
              }}>
                ✨ Flawless! Zero errors — perfect score!
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            {stats.map(({ v, l, c }) => (
              <div key={l} style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '0.85rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c }}>{v}</div>
                <div style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <KeyboardHeatmap keyErrors={keyErrors} keyPresses={keyPresses} />

          {/* Graph */}
          <AccuracyGraph data={accuracyLog} />

          {/* Actions */}
          <div style={{
            display: 'flex', gap: '0.75rem', justifyContent: 'center',
            marginTop: '1.75rem', flexWrap: 'wrap',
          }}>
            <button className="btn btn-primary" onClick={onRestart}>
              🔄 Restart
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              ✏️ Try Again
            </button>
            <button className="btn btn-secondary" onClick={copyResults}>
              📋 Copy Results
            </button>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '1rem',
            fontSize: '0.75rem', color: 'var(--text-muted)',
          }}>
            Press <kbd style={{
              background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem',
              borderRadius: '4px', fontSize: '0.7rem',
            }}>Esc</kbd> to close
          </div>
        </div>
      </div>
    </>
  );
});

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

const Breadcrumb = memo(function Breadcrumb() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Keyboard Tools', href: '/keyboard-tools' },
    { label: 'Keyboard Accuracy Test', href: '/keyboard-accuracy-test' },
  ];
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
      <ol style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        listStyle: 'none', margin: 0, padding: 0,
        fontSize: '0.8rem', color: 'var(--text-muted)',
        flexWrap: 'wrap',
      }}>
        {crumbs.map((c, i) => (
          <li key={c.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {i < crumbs.length - 1 ? (
              <>
                <a href={c.href} style={{
                  color: 'var(--neon-cyan)', textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {c.label}
                </a>
                <span aria-hidden="true">›</span>
              </>
            ) : (
              <span aria-current="page" style={{ color: '#fff', fontWeight: 600 }}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

// ─── SEO Meta (injected into <head> via portal-like effect) ──────────────────

function SEOHead() {
  useEffect(() => {
    // Title
    document.title = 'Free Keyboard Accuracy Test — Improve Typing Precision Online | TypingPro';

    const setMeta = (name: string, content: string, prop = false) => {
      const sel = prop
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    const BASE = 'https://typingpro.app';
    const URL  = `${BASE}/keyboard-accuracy-test`;
    const IMG  = `${BASE}/og-accuracy-test.png`;

    setMeta('description', 'Take our free Keyboard Accuracy Test and measure your typing precision instantly. Get live WPM, CPM, error stats, heatmap, and detailed results. No signup required.');
    setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    setMeta('theme-color', '#0a0a0f');
    setLink('canonical', URL);

    // OG
    setMeta('og:title',       'Free Keyboard Accuracy Test — TypingPro', true);
    setMeta('og:description', 'Measure typing precision with WPM, CPM, heatmap, and accuracy graph.', true);
    setMeta('og:image', IMG, true);
    setMeta('og:url', URL, true);
    setMeta('og:type', 'website', true);

    // Twitter
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       'Free Keyboard Accuracy Test — TypingPro');
    setMeta('twitter:description', 'Live WPM, CPM, heatmap, and accuracy graph. Test your typing precision now!');
    setMeta('twitter:image', IMG);

    // JSON-LD
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'TypingPro',
        url: BASE,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Keyboard Accuracy Test',
        url: URL,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        description: 'Free online keyboard accuracy test with WPM, CPM, error heatmap, and live accuracy graph.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Live WPM & CPM tracking',
          'Typing accuracy measurement',
          'Keyboard error heatmap',
          'Accuracy over time graph',
          'Multiple timer modes',
          'Custom text support',
          'Sound effects',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',                  item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Keyboard Tools',        item: `${BASE}/keyboard-tools` },
          { '@type': 'ListItem', position: 3, name: 'Keyboard Accuracy Test',item: URL  },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: typeof a === 'string' ? a : q },
        })),
      },
    ];

    schemas.forEach((schema, i) => {
      const id = `ld-json-${i}`;
      let s = document.getElementById(id) as HTMLScriptElement | null;
      if (!s) {
        s = document.createElement('script');
        s.id   = id;
        s.type = 'application/ld+json';
        document.head.appendChild(s);
      }
      s.textContent = JSON.stringify(schema);
    });
  }, []);

  return null;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What is a keyboard accuracy test?',
    a: 'A keyboard accuracy test measures how precisely you type a given passage. It tracks correct keystrokes, errors, and calculates an accuracy percentage to help you identify weaknesses.',
  },
  {
    q: 'What is a good accuracy score for typing?',
    a: '95% or higher is considered good for general use. Professional typists, transcriptionists, and data-entry specialists typically target 98%–100% accuracy.',
  },
  {
    q: 'How is typing accuracy calculated?',
    a: 'Accuracy = ((Total Characters − Errors) / Total Characters) × 100. Our test counts every incorrect keystroke in real time.',
  },
  {
    q: 'What is WPM?',
    a: 'WPM stands for Words Per Minute. One "word" is standardised as five characters (including spaces). Net WPM subtracts error penalty; Raw WPM counts all typed characters regardless of correctness.',
  },
  {
    q: 'What is the difference between Raw WPM and Net WPM?',
    a: 'Raw WPM counts everything you type. Net WPM subtracts a penalty for uncorrected errors, giving a more accurate picture of real-world typing output.',
  },
  {
    q: 'What is CPM in typing?',
    a: 'CPM is Characters Per Minute — the total number of correct characters typed in one minute. It provides a more granular measure than WPM.',
  },
  {
    q: 'Does making mistakes slow down my WPM?',
    a: 'Yes. Each correction requires at least two extra keystrokes (Backspace + the correct key), breaking your rhythm and reducing your measured Net WPM significantly.',
  },
  {
    q: 'How often should I practice typing accuracy?',
    a: 'Just 5–10 minutes of daily focused practice typically produces measurable improvements within two to three weeks, as muscle memory solidifies.',
  },
  {
    q: 'What is the keyboard heatmap?',
    a: 'The heatmap visualises which keys you mistype most frequently. Keys are colour-coded from green (few/no errors) to red (many errors), helping you identify problem areas.',
  },
  {
    q: 'Can I use my own text for the accuracy test?',
    a: 'Yes! Enable "Custom Text" mode and paste any paragraph you want to practise — great for domain-specific vocabulary like programming keywords or medical terms.',
  },
  {
    q: 'What is the best finger placement for typing?',
    a: 'Place your left fingers on A–S–D–F and right fingers on J–K–L–;, with thumbs on the space bar. This home-row position minimises finger travel and reduces errors.',
  },
  {
    q: 'What is touch typing?',
    a: 'Touch typing is typing without looking at the keyboard, relying entirely on muscle memory. It is the most efficient typing method and greatly improves both speed and accuracy.',
  },
  {
    q: 'How long does it take to reach 95% accuracy?',
    a: 'Most beginners reach 90%–95% accuracy within one to three months of consistent daily practice. Advanced touch typists can sustain 99%+ accuracy.',
  },
  {
    q: 'Is a mechanical keyboard better for accuracy?',
    a: 'Mechanical keyboards provide tactile and auditory feedback that many typists find reduces errors. However, accuracy ultimately depends on practice, not hardware.',
  },
  {
    q: 'What sound effects does this test use?',
    a: 'Sounds are generated entirely via the Web Audio API — no external files are loaded. You hear a click on correct keys, a buzzer on errors, and a chord when you finish.',
  },
  {
    q: 'What does the accuracy graph show?',
    a: 'The line graph plots your accuracy percentage at regular intervals throughout the test, so you can see whether your precision improved or declined over time.',
  },
  {
    q: 'How do I improve my accuracy quickly?',
    a: 'Slow down deliberately, focus on hitting the right key first time, use the home-row position, and review your heatmap to target your weakest keys.',
  },
  {
    q: 'What timer mode should I choose?',
    a: 'Beginners benefit from 60 or 120 seconds to build endurance. Those working on burst accuracy can use 15 or 30 seconds. Unlimited mode tests accuracy over a full passage.',
  },
  {
    q: 'Can I share or export my results?',
    a: 'Yes — click "Copy Results" in the result modal to copy a formatted summary to your clipboard, ready to paste anywhere.',
  },
  {
    q: 'Does screen size affect the test?',
    a: 'No. The test is fully responsive and works on desktop, tablet, and mobile devices, though a physical keyboard generally produces higher accuracy than a touchscreen.',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AccuracyTestPage() {
  const [state, dispatch]       = useReducer(reducer, initState(60));
  const [showModal, setShowModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevErrRef  = useRef(0);

  // Resolve target text
  const targetText = useMemo(() => {
    if (state.useCustom && state.customText.trim()) return state.customText.trim();
    return DEFAULT_TEXT;
  }, [state.useCustom, state.customText]);

  // Derived values
  const accuracy = useMemo(() => (
    state.typed.length > 0
      ? Math.max(0, Math.round(((state.typed.length - state.errors) / state.typed.length) * 100))
      : 100
  ), [state.typed.length, state.errors]);

  const correctChars = Math.max(0, state.typed.length - state.errors);
  const progress     = Math.min(100, (state.typed.length / targetText.length) * 100);

  const wpm    = useMemo(() => calcWPM(correctChars, state.elapsed),          [correctChars, state.elapsed]);
  const rawWpm = useMemo(() => calcWPM(state.typed.length, state.elapsed),    [state.typed.length, state.elapsed]);
  const netWpm = useMemo(() => Math.max(0, wpm - Math.round(state.errors / (state.elapsed / 60 || 1))), [wpm, state.errors, state.elapsed]);
  const cpm    = useMemo(() => calcCPM(correctChars, state.elapsed),          [correctChars, state.elapsed]);

  // Init audio context on first interaction
  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioCtx();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  // Timer
  useEffect(() => {
    if (state.phase === 'running') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.phase]);

  // Auto-finish when countdown hits zero
  useEffect(() => {
    if (state.timerMode !== 0 && state.timeLeft === 0 && state.phase === 'running') {
      dispatch({ type: 'SET_PHASE', payload: 'done' });
      setShowModal(true);
      playFinish(audioCtxRef.current, state.muted);
    }
  }, [state.timeLeft, state.phase, state.timerMode, state.muted]);

  // Input handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      ensureAudio();
      const val = e.target.value.slice(0, targetText.length);

      if (state.phase === 'idle') dispatch({ type: 'SET_PHASE', payload: 'running' });
      if (state.phase === 'done') return;

      // Count errors per character
      let errs = 0;
      const newErrors  = { ...state.keyErrors };
      const newPresses = { ...state.keyPresses };

      for (let i = 0; i < val.length; i++) {
        if (val[i] !== targetText[i]) {
          errs++;
          const k = targetText[i].toLowerCase();
          newErrors[k]  = (newErrors[k]  || 0) + 1;
          newPresses[k] = (newPresses[k] || 0) + 1;
        } else {
          const k = targetText[i].toLowerCase();
          newPresses[k] = (newPresses[k] || 0) + 1;
        }
      }

      // Sound
      if (errs > prevErrRef.current) {
        playError(audioCtxRef.current, state.muted);
      } else if (val.length > state.typed.length) {
        playClick(audioCtxRef.current, state.muted);
      }
      prevErrRef.current = errs;

      const accPoint: AccuracyPoint = {
        time:     state.elapsed,
        accuracy: val.length > 0
          ? Math.max(0, Math.round(((val.length - errs) / val.length) * 100))
          : 100,
      };

      dispatch({ type: 'SET_TYPED', payload: { val, errs, newErrors, newPresses, accPoint } });

      // Complete
      if (val.length >= targetText.length) {
        dispatch({ type: 'SET_PHASE', payload: 'done' });
        setShowModal(true);
        playFinish(audioCtxRef.current, state.muted);
      }
    },
    [state.phase, state.typed, state.errors, state.elapsed, state.muted,
     state.keyErrors, state.keyPresses, targetText, ensureAudio],
  );

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET', payload: { timerMode: state.timerMode } });
    setShowModal(false);
    prevErrRef.current = 0;
    focusInput();
  }, [state.timerMode, focusInput]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleTimerChange = useCallback((v: TimerOption) => {
    dispatch({ type: 'SET_TIMER', payload: v });
    dispatch({ type: 'RESET', payload: { timerMode: v } });
    prevErrRef.current = 0;
    focusInput();
  }, [focusInput]);

  const handleApplyCustom = useCallback(() => {
    if (!customInput.trim()) { setCustomError('Please enter some text.'); return; }
    if (customInput.trim().length < 10) { setCustomError('Text must be at least 10 characters.'); return; }
    setCustomError('');
    dispatch({ type: 'SET_CUSTOM_TEXT', payload: customInput.trim() });
    dispatch({ type: 'TOGGLE_CUSTOM' }); // ensure on
    setShowCustomForm(false);
    handleReset();
  }, [customInput, handleReset]);

  const handleDisableCustom = useCallback(() => {
    dispatch({ type: 'SET_CUSTOM_TEXT', payload: '' });
    // Force useCustom off by re-checking
    if (state.useCustom) dispatch({ type: 'TOGGLE_CUSTOM' });
    setShowCustomForm(false);
    handleReset();
  }, [state.useCustom, handleReset]);

  // Timer display
  const timerDisplay = useMemo(() => {
    if (state.timerMode === 0) return formatTime(state.elapsed);
    return formatTime(state.timeLeft);
  }, [state.timerMode, state.timeLeft, state.elapsed]);

  const timerColor = useMemo(() => {
    if (state.timerMode === 0) return 'var(--neon-cyan)';
    if (state.timeLeft <= 5)  return 'var(--neon-red)';
    if (state.timeLeft <= 15) return 'var(--neon-orange)';
    return 'var(--neon-cyan)';
  }, [state.timerMode, state.timeLeft]);

  // Character rendering
  const renderedText = useMemo(() => {
    // Group into words for word-level error backgrounds
    return targetText.split('').map((char, i) => {
      let color = 'var(--text-muted)';
      let bg    = 'transparent';
      let isErr = false;

      if (i < state.typed.length) {
        const correct = state.typed[i] === char;
        color = correct ? 'var(--neon-green)' : 'var(--neon-red)';
        if (!correct) { bg = 'rgba(255,45,85,0.15)'; isErr = true; }
      } else if (i === state.typed.length) {
        bg = 'rgba(0,245,255,0.28)';
      }

      return { char, color, bg, isCursor: i === state.typed.length, isErr };
    });
  }, [targetText, state.typed]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <>
      <SEOHead />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Keyboard Tool</div>
          <h1 className="tool-title">Keyboard Accuracy Test</h1>
          <p className="tool-subtitle">
            Type the text with maximum accuracy — track WPM, CPM, errors, and more!
          </p>
        </div>

        {/* Timer Mode Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}>
            Timer Mode
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TIMER_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleTimerChange(value)}
                aria-pressed={state.timerMode === value}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  border: `1px solid ${state.timerMode === value ? 'var(--neon-cyan)' : 'var(--border)'}`,
                  background: state.timerMode === value ? 'rgba(0,245,255,0.1)' : 'transparent',
                  color: state.timerMode === value ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: state.timerMode === value ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}

            {/* Custom Text toggle */}
            <button
              onClick={() => setShowCustomForm(v => !v)}
              aria-pressed={state.useCustom}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                border: `1px solid ${state.useCustom ? 'var(--neon-orange)' : 'var(--border)'}`,
                background: state.useCustom ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: state.useCustom ? 'var(--neon-orange)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: state.useCustom ? 700 : 400,
                cursor: 'pointer',
                marginLeft: '0.5rem',
              }}
            >
              ✏️ Custom Text
            </button>

            {/* Mute toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
              aria-label={state.muted ? 'Unmute sounds' : 'Mute sounds'}
              title={state.muted ? 'Unmute' : 'Mute'}
              style={{
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: state.muted ? 'var(--neon-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              {state.muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* Custom Text Form */}
        {showCustomForm && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem',
            }}>
              Paste or type your custom text (min 10 characters):
            </div>
            <textarea
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Enter your custom text here…"
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${customError ? 'var(--neon-red)' : 'var(--border)'}`,
                borderRadius: '8px', padding: '0.75rem',
                color: '#fff', fontSize: '0.9rem',
                fontFamily: 'monospace', resize: 'vertical',
                outline: 'none',
              }}
            />
            {customError && (
              <div style={{ color: 'var(--neon-red)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                {customError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleApplyCustom}>
                Apply Custom Text
              </button>
              {state.useCustom && (
                <button className="btn btn-secondary" onClick={handleDisableCustom}>
                  Use Default Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <StatCard value={`${accuracy}%`}  label="Accuracy"  color="var(--neon-green)"  />
          <StatCard value={state.errors}    label="Errors"    color="var(--neon-red)"    />
          <StatCard value={correctChars}    label="Correct"   color="var(--neon-cyan)"   />
          <StatCard value={wpm}             label="WPM"       color="var(--neon-yellow)" />
          <StatCard value={cpm}             label="CPM"       color="var(--neon-orange)" />
          <StatCard
            value={timerDisplay}
            label={state.timerMode === 0 ? 'Elapsed' : 'Time Left'}
            color={timerColor}
          />
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Text Display */}
        {state.phase !== 'done' && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Typing area — click to focus"
            onClick={focusInput}
            onKeyDown={e => e.key === 'Enter' && focusInput()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.75rem',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              lineHeight: 2,
              marginBottom: '1rem',
              cursor: 'text',
              userSelect: 'none',
            }}
          >
            {renderedText.map(({ char, color, bg, isCursor }, i) => (
              <span
                key={i}
                style={{
                  color,
                  background: bg,
                  borderRadius: '2px',
                  ...(isCursor && !prefersReducedMotion
                    ? { animation: 'blink 1s step-start infinite' }
                    : {}),
                }}
              >
                {char}
              </span>
            ))}
          </div>
        )}

        {/* Hidden real input */}
        <input
          ref={inputRef}
          value={state.typed}
          onChange={handleChange}
          disabled={state.phase === 'done'}
          aria-hidden="true"
          aria-label="Typing input"
          style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0 }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Click-to-focus prompt */}
        {state.phase !== 'done' && (
          <div
            role="button"
            tabIndex={0}
            onClick={focusInput}
            onKeyDown={e => e.key === 'Enter' && focusInput()}
            aria-label="Click to focus typing area"
            style={{
              background: 'rgba(0,245,255,0.05)',
              border: '1px dashed rgba(0,245,255,0.2)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            {state.phase === 'idle'
              ? '👆 Click here or press any key to start typing!'
              : '⌨️ Focus on accuracy over speed…'}
          </div>
        )}

        {/* Reset */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset Test
          </button>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes blink {
            0%, 100% { background: rgba(0,245,255,0.28); }
            50%       { background: transparent; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes popIn {
            0%   { transform: scale(0.5); opacity: 0; }
            80%  { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>

        {/* ── SEO Article ──────────────────────────────────────────────────── */}
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />

        <article style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '0.95rem' }}>

          <h2 style={h2}>What is Keyboard Accuracy?</h2>
          <p style={p}>
            Keyboard accuracy is a measurement of how precisely a typist strikes the correct keys while composing
            text. It is expressed as a percentage — the ratio of correct keystrokes to total keystrokes — and is
            one of the two foundational metrics of typing proficiency, alongside speed (WPM). While speed
            determines how fast information is entered, accuracy determines how <em>correctly</em> that
            information is entered. A typist who produces 120 WPM with only 80% accuracy is, in practical
            terms, generating a flood of errors that must be corrected before any document, email, or line of
            code can be used. For this reason, seasoned professionals almost universally prioritise accuracy
            before chasing higher speeds.
          </p>
          <p style={p}>
            Modern typing tests measure accuracy in real time by comparing each character entered against the
            target passage. This tool logs every keystroke, identifies errors immediately, updates the accuracy
            percentage continuously, and produces a keyboard heatmap at the end of the session so you can see
            exactly which keys are causing the most trouble.
          </p>

          <h2 style={h2}>How Keyboard Accuracy Is Calculated</h2>
          <p style={p}>
            The formula is straightforward: <strong>Accuracy (%) = ((Total Typed − Errors) / Total Typed) × 100</strong>.
            An "error" is any character that does not match the corresponding character in the target text at that
            position. If you type the letter <em>e</em> where a <em>r</em> is expected, that counts as one error.
            Deleting and retyping does not remove previously recorded errors in most professional tests, because
            the goal is to capture raw keystroke accuracy, not corrected accuracy. This is why typing slowly and
            correctly from the start always produces a better final score than typing fast and correcting.
          </p>
          <p style={p}>
            This test also calculates <strong>Net WPM</strong>, which applies an error penalty to your raw speed,
            giving a realistic view of your effective output. Raw WPM counts every character typed; Net WPM
            subtracts for errors to approximate the actual usable text you produce per minute.
          </p>

          <h2 style={h2}>How to Improve Typing Accuracy</h2>
          <p style={p}>
            Improving accuracy is a deliberate, patient process. The single most effective strategy is to slow
            down intentionally until you can type a passage with near-zero errors, then gradually increase speed
            while maintaining that accuracy floor. This approach builds correct motor pathways instead of
            reinforcing sloppy habits at high speed. Other proven techniques include:
          </p>
          <ul style={ul}>
            <li style={li}><strong>Daily short sessions:</strong> Ten focused minutes outperform one hour of unfocused typing.</li>
            <li style={li}><strong>Targeting weak keys:</strong> Use the heatmap to identify your problem keys, then practise words that use them heavily.</li>
            <li style={li}><strong>Correct posture:</strong> Slouching or awkward wrist angles cause fatigue-driven errors. Sit upright with forearms parallel to the desk.</li>
            <li style={li}><strong>Eyes on the screen:</strong> Resist looking at your hands. Visual dependency breaks the neural feedback loop that enables touch typing.</li>
            <li style={li}><strong>Custom text practice:</strong> Use the Custom Text feature to practise domain-specific vocabulary you actually need — programming keywords, legal terminology, medical terms, etc.</li>
          </ul>

          <h2 style={h2}>Best Finger Placement for Typing</h2>
          <p style={p}>
            The home-row position is the foundation of accurate touch typing. Your left hand fingers rest on
            <strong> A–S–D–F</strong> and your right hand fingers on <strong>J–K–L–;</strong>. Both thumbs hover
            over the space bar. From this base position, each finger is responsible for a column of keys directly
            above and below it. Your index fingers, being the strongest, cover two columns each (F and G for
            left; J and H for right). The pinky fingers manage the outermost columns, including frequently used
            keys like Q, A, Z on the left and P, semicolon, and slash on the right.
          </p>
          <p style={p}>
            Anchoring to the home row means your fingers travel the minimum possible distance for every
            keystroke, which reduces both errors and fatigue. Many beginners skip this and develop idiosyncratic
            "hunt and peck" techniques that permanently cap their accuracy and speed.
          </p>

          <h2 style={h2}>Common Typing Mistakes</h2>
          <p style={p}>
            Most typing errors fall into predictable categories. Understanding them helps you target practice
            intelligently:
          </p>
          <ul style={ul}>
            <li style={li}><strong>Transpositions:</strong> Swapping adjacent letters (typing "teh" for "the") usually caused by one finger striking before another has fully lifted.</li>
            <li style={li}><strong>Substitutions:</strong> Hitting a neighbouring key instead of the intended one, most common at the edges of finger territories.</li>
            <li style={li}><strong>Omissions:</strong> Skipping a letter, often in common letter clusters the brain pre-empts.</li>
            <li style={li}><strong>Doublings:</strong> Repeating a letter unintentionally, especially on strong-finger keys like F, J, and D.</li>
            <li style={li}><strong>Capitalisation errors:</strong> Inconsistent Shift timing, often caused by releasing Shift too early or too late.</li>
          </ul>

          <h2 style={h2}>Accuracy vs. WPM — Which Matters More?</h2>
          <p style={p}>
            In almost every real-world context, accuracy matters more than raw speed. Consider that a legal
            transcriptionist who produces 80 WPM at 99% accuracy delivers a near-perfect document. The same
            typist at 120 WPM with 90% accuracy produces a document riddled with errors that requires
            substantial time to proofread and correct — negating any speed advantage. For programmers, a single
            mistyped character can cause a compilation error or a hard-to-trace runtime bug, making per-keystroke
            accuracy critically important.
          </p>
          <p style={p}>
            That said, accuracy and speed are not mutually exclusive. With sufficient practice, both improve
            simultaneously. The correct approach is to treat accuracy as a non-negotiable floor and let speed
            rise organically from consistent, error-free practice rather than the reverse.
          </p>

          <h2 style={h2}>Why Accuracy Matters in the Workplace</h2>
          <p style={p}>
            In professional environments, typing accuracy directly affects productivity, professionalism, and
            data integrity. Emails with typos create poor impressions. Reports with data-entry errors can lead
            to costly decisions. Code with syntax errors stalls development pipelines. A study of office workers
            found that professionals who maintained above 95% accuracy spent up to 40% less time in error-
            correction activities than those who typed quickly but carelessly.
          </p>

          <h2 style={h2}>Benefits of Daily Typing Practice</h2>
          <p style={p}>
            Consistent daily practice — even as little as ten minutes — has compounding benefits. Within the
            first two weeks, most beginners notice a measurable reduction in error rates. By the end of the first
            month, finger positioning becomes semi-automatic, freeing cognitive bandwidth for the content being
            composed rather than the mechanics of typing. Advanced typists who practise daily maintain or improve
            their accuracy even as they age, because the motor programmes are deeply embedded in procedural
            memory.
          </p>

          <h2 style={h2}>Best Keyboard for Typing Accuracy</h2>
          <p style={p}>
            The best keyboard for accuracy is largely the one you are most comfortable with. That said,
            keyboards with a consistent, well-defined actuation point help typists develop reliable muscle
            memory. Full-sized keyboards with dedicated number rows and function keys reduce finger travel to
            reach shared keys. Keyboards with enough key travel (1.5–2 mm minimum) provide the physical
            feedback necessary for accurate touch typing.
          </p>

          <h2 style={h2}>Mechanical vs. Membrane Keyboards</h2>
          <p style={p}>
            Mechanical keyboards use individual switches under each key that provide distinct tactile or auditory
            feedback at the actuation point. This feedback helps touch typists know precisely when a keystroke
            has registered without bottoming out the key — a technique called "light touch" typing that
            significantly reduces errors and fatigue during long sessions. Membrane keyboards use a continuous
            pressure pad and tend to have mushier, less distinct actuation, which can make it harder to develop
            consistent keystroke timing.
          </p>
          <p style={p}>
            Popular switch types for accuracy-focused typists include tactile switches (e.g., Cherry MX Brown,
            Topre) that provide a bump without a loud click, and clicky switches (e.g., Cherry MX Blue) that
            add an auditory confirmation. Silent linear switches are preferred in shared workspaces where noise
            is a concern.
          </p>

          <h2 style={h2}>Typing Tips for Beginners</h2>
          <ul style={ul}>
            <li style={li}>Start with the home-row lesson before attempting full passages.</li>
            <li style={li}>Use all ten fingers from day one — avoid building single-hand habits.</li>
            <li style={li}>Set a target accuracy (e.g., 90%) before increasing your speed.</li>
            <li style={li}>Take regular breaks — finger fatigue is a leading cause of accuracy drops.</li>
            <li style={li}>Use this tool's 15-second and 30-second modes for focused sprint practice.</li>
          </ul>

          <h2 style={h2}>Typing Tips for Programmers</h2>
          <p style={p}>
            Programmers face unique accuracy demands: brackets, semicolons, underscores, and camelCase patterns
            are unforgiving. Specific tips include:
          </p>
          <ul style={ul}>
            <li style={li}>Practise sequences like <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: '3px' }}>{'() => {}'}</code> and <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: '3px' }}>[]</code> in isolation.</li>
            <li style={li}>Use the Custom Text feature to paste real code snippets and practise them.</li>
            <li style={li}>Learn keyboard shortcuts to reduce mouse dependency, which breaks typing flow.</li>
            <li style={li}>Choose a keyboard layout optimised for programming (e.g., Programmer Dvorak, Colemak-DH).</li>
          </ul>

          <h2 style={h2}>Office Typing Accuracy Standards</h2>
          <p style={p}>
            Most office and administrative roles require a minimum of <strong>40–60 WPM</strong> with at least
            <strong> 95% accuracy</strong>. Executive assistants, legal secretaries, and medical transcriptionists
            typically face requirements of <strong>70–100 WPM</strong> at <strong>97%–99% accuracy</strong>.
            Many employers now include a timed typing test as a standard part of the hiring process, making it
            worthwhile to demonstrate verifiable accuracy benchmarks.
          </p>

          <h2 style={h2}>Typing Accuracy for Data-Entry Jobs</h2>
          <p style={p}>
            Data-entry positions are among the most accuracy-sensitive roles in the workforce. A single transposed
            digit in a financial record, a misspelled patient name in a medical database, or an incorrect postal
            code in a shipping system can cascade into costly downstream errors. Standards for data-entry
            professionals typically start at <strong>98%</strong> accuracy and often require verified certification
            from a recognised typing assessment. Using this tool's 120-second mode is an excellent way to
            simulate the endurance required for data-entry work.
          </p>

          <h2 style={h2}>How Long Does It Take to Improve Typing Accuracy?</h2>
          <p style={p}>
            Improvement timelines vary by starting level, practice consistency, and individual learning rate.
            As a general guide:
          </p>
          <ul style={ul}>
            <li style={li}><strong>2 weeks:</strong> Noticeable reduction in common errors with daily 10-minute practice.</li>
            <li style={li}><strong>1 month:</strong> Home-row positioning becomes automatic; accuracy typically reaches 90%+.</li>
            <li style={li}><strong>3 months:</strong> Touch typing is largely unconscious; accuracy stabilises above 95%.</li>
            <li style={li}><strong>6–12 months:</strong> Consistent 98%–100% accuracy is achievable with sustained practice.</li>
          </ul>
          <p style={p}>
            The most important variable is consistency. Five minutes every day will outperform one hour per week
            because the motor memory consolidation that happens during sleep requires recent, repeated activation
            of the same neural pathways.
          </p>

          {/* FAQ */}
          <div style={{
            marginTop: '3rem', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem',
          }}>
            <h2 style={{
              color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: 700,
              marginTop: 0, marginBottom: '1.25rem',
            }}>
              Frequently Asked Questions
            </h2>

            {FAQ_ITEMS.map(({ q, a }, idx) => (
              <details key={q} style={{
                marginBottom: idx < FAQ_ITEMS.length - 1 ? '1rem' : 0,
                borderBottom: idx < FAQ_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
                paddingBottom: idx < FAQ_ITEMS.length - 1 ? '1rem' : 0,
              }}>
                <summary style={{
                  cursor: 'pointer', color: '#fff', fontWeight: 600,
                  fontSize: '0.95rem', listStyle: 'none', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {q}
                  <span style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', marginLeft: '0.5rem' }}>+</span>
                </summary>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </article>
      </div>

      {/* Result Modal */}
      {showModal && (
        <ResultModal
          accuracy={accuracy}
          wpm={wpm}
          rawWpm={rawWpm}
          netWpm={netWpm}
          cpm={cpm}
          correctChars={correctChars}
          errors={state.errors}
          elapsed={state.elapsed}
          targetLen={targetText.length}
          typedLen={state.typed.length}
          onRestart={handleReset}
          onClose={handleModalClose}
          keyErrors={state.keyErrors}
          keyPresses={state.keyPresses}
          accuracyLog={state.accuracyLog}
        />
      )}
    </>
  );
}

// ─── Article style helpers ────────────────────────────────────────────────────

const h2: React.CSSProperties = {
  color: '#fff', fontSize: '1.4rem', fontWeight: 700,
  marginTop: '2.5rem', marginBottom: '0.75rem',
};
const p:  React.CSSProperties = { marginBottom: '1.25rem' };
const ul: React.CSSProperties = { paddingLeft: '1.25rem', marginBottom: '1.25rem' };
const li: React.CSSProperties = { marginBottom: '0.5rem' };

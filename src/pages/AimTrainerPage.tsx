/**
 * AimTrainerPage.tsx
 * Production-ready Aim Trainer — bug-fix pass
 *
 * Fixes in this revision:
 * - Cross-browser Fullscreen API (Chrome/Firefox/Edge/Safari + webkit fallback),
 *   support detection, graceful error handling, auto button state sync.
 * - Results MODAL restyled to exactly match the TypingTest results popup
 *   (same backdrop, gradient card, padding, stat-card layout, animations),
 *   and shown centered on screen the same way.
 * - Modal + inline ResultsPanel no longer render simultaneously — only the
 *   modal shows immediately on game end (like TypingTest); closing it reveals
 *   the inline panel (graph + history) instead of stacking both at once.
 * - All modal handlers wrapped in try/catch and null-guarded so a missing
 *   result, unmounted ref, or focus error can never crash the page.
 * - Custom duration fully wired through state -> refs -> timer -> progress bar -> results.
 * - Difficulty fully wired, switchable pre-game, instantly affects spawn/size/lifetime.
 * - Verified/corrected stats: accuracy, miss %, avg reaction time, hits/sec, max combo, grade.
 * - Keyboard shortcuts (Space/R/Esc) now ignore INPUT, TEXTAREA, SELECT and contentEditable.
 * - Mobile: passive:false touch guards, pointer events, larger touch targets, responsive modal.
 * - All timers/listeners cleaned up on unmount; no hardcoded duration left in logic.
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_HISTORY    = 10;
const CLICK_RATE_MS  = 30;

// ─── Difficulty Config ────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

interface DifficultyConfig {
  minSize: number;
  maxSize: number;
  spawnInterval: number;
  targetLifetime: number;
  maxTargets: number;
  label: string;
  color: string;
  scoreMultiplier: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  Easy: {
    minSize: 65, maxSize: 90, spawnInterval: 1200,
    targetLifetime: 3000, maxTargets: 3,
    label: 'Easy', color: 'var(--neon-green)', scoreMultiplier: 1,
  },
  Medium: {
    minSize: 40, maxSize: 70, spawnInterval: 800,
    targetLifetime: 2000, maxTargets: 5,
    label: 'Medium', color: 'var(--neon-cyan)', scoreMultiplier: 2,
  },
  Hard: {
    minSize: 25, maxSize: 50, spawnInterval: 500,
    targetLifetime: 1200, maxTargets: 7,
    label: 'Hard', color: 'var(--neon-orange)', scoreMultiplier: 3,
  },
  Impossible: {
    minSize: 15, maxSize: 35, spawnInterval: 280,
    targetLifetime: 700, maxTargets: 10,
    label: 'Impossible', color: 'var(--neon-red)', scoreMultiplier: 5,
  },
};

// ─── Duration Options ─────────────────────────────────────────────────────────
const DURATION_OPTIONS = [10, 30, 60, 120] as const;
type Duration = typeof DURATION_OPTIONS[number];
const DEFAULT_DURATION: Duration = 30;

// ─── Grade System ─────────────────────────────────────────────────────────────
type Grade = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

function calcGrade(acc: number, avgReaction: number, hitsPerSec: number): Grade {
  // Weighted score: accuracy 40%, reaction 30%, hits/s 30%
  const accScore      = acc; // 0–100
  const reactionScore = avgReaction === 0 ? 100 : Math.max(0, 100 - (avgReaction - 150) / 5); // lower=better
  const hpsScore      = Math.min(100, hitsPerSec * 20); // 5 hps = 100

  const total = accScore * 0.4 + reactionScore * 0.3 + hpsScore * 0.3;

  if (total >= 95) return 'S+';
  if (total >= 85) return 'S';
  if (total >= 72) return 'A';
  if (total >= 58) return 'B';
  if (total >= 42) return 'C';
  return 'D';
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  spawnTime: number; // performance.now() when spawned
}

interface SessionResult {
  score: number;
  misses: number;
  acc: number;
  missPct: number;
  avgReaction: number;
  hitsPerSec: number;
  combo: number;
  grade: Grade;
  duration: number;     // configured duration (s)
  totalTime: number;    // actual elapsed time (s)
  difficulty: Difficulty;
}

// Accuracy-over-time data point (recorded every second)
interface AccDataPoint {
  second: number;
  acc: number; // 0–100
}

type Phase = 'idle' | 'running' | 'paused' | 'done';

// ─── Sound Engine (Web Audio API) ─────────────────────────────────────────────
function playHit(ctx: AudioContext) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.3,  ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

function playMiss(ctx: AudioContext) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.2,  ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

function playCombo(ctx: AudioContext, level: number) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  const freq = 800 + level * 200;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const JSON_LD_APP = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Aim Trainer — Free Online Aim Training & Mouse Accuracy Test',
  description:
    'Free online aim trainer. Improve mouse accuracy, flick speed, and reaction time for FPS games like CS2, Valorant, Fortnite, and more. Track your accuracy, reaction time, and performance grade.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript and Web Audio API support.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Mouse accuracy training',
    'Reaction time measurement',
    'Combo streak system',
    'Performance grade',
    'Multiple difficulty levels',
    'Accuracy graph',
    'Fullscreen mode',
  ],
});

// ─── Safe JSON-LD Injector ────────────────────────────────────────────────────
function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type        = 'application/ld+json';
    script.textContent = data;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [data]);
  return null;
}

// ─── SEO Meta Tag Injector ────────────────────────────────────────────────────
function SeoMeta() {
  useEffect(() => {
    const CANONICAL = 'https://yoursite.com/aim-trainer'; // ← update to real URL
    const TITLE     = 'Aim Trainer – Free Online Aim Training & Mouse Accuracy Test';
    const DESC      =
      'Train your aim for free. Improve mouse accuracy, reaction time, and flick speed with our browser-based aim trainer. Track accuracy graphs, combos, and performance grades. No download needed.';
    const OG_IMAGE  = 'https://yoursite.com/og-aim-trainer.png'; // ← update

    const setMeta = (sel: string, attr: string, val: string): (() => void) => {
      let el = document.querySelector<HTMLMetaElement>(sel);
      let created = false;
      if (!el) {
        el = document.createElement('meta');
        const [a, v] = attr.split('=');
        el.setAttribute(a.trim(), v?.replace(/"/g, '') ?? attr);
        document.head.appendChild(el);
        created = true;
      }
      const prev = el.getAttribute('content') ?? '';
      el.setAttribute('content', val);
      return () => {
        if (created) {
          if (document.head.contains(el!)) document.head.removeChild(el!);
        } else {
          el!.setAttribute('content', prev);
        }
      };
    };

    const setLink = (rel: string, href: string): (() => void) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      let created = false;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
        created = true;
      }
      const prev = el.getAttribute('href') ?? '';
      el.setAttribute('href', href);
      return () => {
        if (created) {
          if (document.head.contains(el!)) document.head.removeChild(el!);
        } else {
          el!.setAttribute('href', prev);
        }
      };
    };

    const prevTitle = document.title;
    document.title = TITLE;

    const cleanups = [
      setMeta('meta[name="description"]',              'name="description"',                DESC),
      setMeta('meta[name="robots"]',                   'name="robots"',                     'index, follow'),
      setMeta('meta[name="theme-color"]',              'name="theme-color"',                '#0a0a0f'),
      setMeta('meta[property="og:type"]',              'property="og:type"',                'website'),
      setMeta('meta[property="og:title"]',             'property="og:title"',               TITLE),
      setMeta('meta[property="og:description"]',       'property="og:description"',         DESC),
      setMeta('meta[property="og:image"]',             'property="og:image"',               OG_IMAGE),
      setMeta('meta[property="og:url"]',               'property="og:url"',                 CANONICAL),
      setMeta('meta[property="og:site_name"]',         'property="og:site_name"',           'Aim Trainer'),
      setMeta('meta[name="twitter:card"]',             'name="twitter:card"',               'summary_large_image'),
      setMeta('meta[name="twitter:title"]',            'name="twitter:title"',              TITLE),
      setMeta('meta[name="twitter:description"]',      'name="twitter:description"',        DESC),
      setMeta('meta[name="twitter:image"]',            'name="twitter:image"',              OG_IMAGE),
      setLink('canonical',                             CANONICAL),
    ];

    return () => {
      document.title = prevTitle;
      cleanups.forEach(fn => fn());
    };
  }, []);
  return null;
}

// ─── Cross-Browser Fullscreen Helpers ─────────────────────────────────────────
// Covers standard API + webkit (Safari/old Chrome) + moz (old Firefox) + ms (old Edge/IE)
interface FsDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozFullScreenElement?: Element | null;
  mozCancelFullScreen?: () => Promise<void> | void;
  msFullscreenElement?: Element | null;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
}
interface FsElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): Element | null {
  const d = document as FsDocument;
  return (
    document.fullscreenElement ||
    d.webkitFullscreenElement ||
    d.mozFullScreenElement ||
    d.msFullscreenElement ||
    null
  );
}

function isFullscreenSupported(): boolean {
  const d = document as FsDocument;
  return !!(
    document.fullscreenEnabled ||
    d.webkitFullscreenEnabled ||
    d.mozFullScreenEnabled ||
    d.msFullscreenEnabled
  );
}

async function requestFs(el: HTMLElement): Promise<void> {
  const e = el as FsElement;
  try {
    if (e.requestFullscreen) {
      await e.requestFullscreen();
    } else if (e.webkitRequestFullscreen) {
      await e.webkitRequestFullscreen();
    } else if (e.mozRequestFullScreen) {
      await e.mozRequestFullScreen();
    } else if (e.msRequestFullscreen) {
      await e.msRequestFullscreen();
    }
  } catch {
    // Browser denied (user gesture missing, iOS Safari restrictions, etc.) — ignore quietly
  }
}

async function exitFs(): Promise<void> {
  const d = document as FsDocument;
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (d.webkitExitFullscreen) {
      await d.webkitExitFullscreen();
    } else if (d.mozCancelFullScreen) {
      await d.mozCancelFullScreen();
    } else if (d.msExitFullscreen) {
      await d.msExitFullscreen();
    }
  } catch {
    // Already exited or unsupported — ignore quietly
  }
}

const FS_CHANGE_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

// ─── Accuracy SVG Graph ───────────────────────────────────────────────────────
const AccuracyGraph = memo(function AccuracyGraph({
  data,
  duration,
}: {
  data: AccDataPoint[];
  duration: number;
}) {
  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;
  const safeDuration = duration > 0 ? duration : 1;

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map(d => ({
      x: PAD.left + (d.second / safeDuration) * chartW,
      y: PAD.top  + chartH - (d.acc / 100) * chartH,
      acc: d.acc,
      second: d.second,
    }));
  }, [data, safeDuration, chartW, chartH]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const bottom = PAD.top + chartH;
    return (
      points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${points[points.length - 1].x.toFixed(1)},${bottom} L${points[0].x.toFixed(1)},${bottom} Z`
    );
  }, [points, chartH]);

  if (data.length < 2) return null;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div
      role="img"
      aria-label="Accuracy over time graph"
      style={{ width: '100%', overflowX: 'auto' }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', minWidth: '280px', display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(0,245,255,0.35)" />
            <stop offset="100%" stopColor="rgba(0,245,255,0)"    />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {gridLines.map(pct => {
          const y = PAD.top + chartH - (pct / 100) * chartH;
          return (
            <g key={pct}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                stroke="rgba(255,255,255,0.07)" strokeWidth="1"
              />
              <text
                x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.35)"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.left} y1={PAD.top + chartH}
          x2={PAD.left + chartW} y2={PAD.top + chartH}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1"
        />

        {data
          .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0)
          .map(d => {
            const x = PAD.left + (d.second / safeDuration) * chartW;
            return (
              <text
                key={d.second}
                x={x} y={PAD.top + chartH + 18}
                textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)"
              >
                {d.second}s
              </text>
            );
          })}

        <path d={areaPath} fill="url(#accGrad)" />

        <path
          d={linePath}
          fill="none"
          stroke="rgba(0,245,255,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: 0,
            animation: 'graphDraw 1.2s ease forwards',
          }}
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="3"
            fill="rgba(0,245,255,0.9)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1"
          />
        ))}

        <text
          x={12} y={PAD.top + chartH / 2}
          textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)"
          transform={`rotate(-90,12,${PAD.top + chartH / 2})`}
        >
          Accuracy
        </text>
      </svg>
    </div>
  );
});

// ─── Grade Badge ──────────────────────────────────────────────────────────────
const GradeBadge = memo(function GradeBadge({ grade }: { grade: Grade }) {
  const colors: Record<Grade, { bg: string; text: string; glow: string }> = {
    'S+': { bg: 'rgba(255,215,0,0.15)',   text: '#FFD700', glow: '0 0 20px rgba(255,215,0,0.5)'   },
    'S':  { bg: 'rgba(0,245,255,0.15)',   text: '#00F5FF', glow: '0 0 20px rgba(0,245,255,0.4)'   },
    'A':  { bg: 'rgba(0,255,136,0.15)',   text: '#00FF88', glow: '0 0 20px rgba(0,255,136,0.4)'   },
    'B':  { bg: 'rgba(107,127,255,0.15)', text: '#6B7FFF', glow: '0 0 20px rgba(107,127,255,0.4)' },
    'C':  { bg: 'rgba(255,107,0,0.15)',   text: '#FF6B00', glow: '0 0 20px rgba(255,107,0,0.4)'   },
    'D':  { bg: 'rgba(255,45,85,0.15)',   text: '#FF2D55', glow: '0 0 20px rgba(255,45,85,0.4)'   },
  };
  const c = colors[grade] ?? colors['D'];
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '80px', height: '80px', borderRadius: '50%',
        background: c.bg, border: `3px solid ${c.text}`,
        boxShadow: c.glow, color: c.text,
        fontSize: '2rem', fontWeight: '900',
        animation: 'gradeReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
      aria-label={`Performance grade: ${grade}`}
    >
      {grade}
    </div>
  );
});

// ─── Results MODAL — restyled to exactly match TypingTest's results popup ────
// (same backdrop, centered gradient card, padding, fonts, animations, layout)
const ResultsModal = memo(function ResultsModal({
  result,
  onPlayAgain,
  onChangeDifficulty,
  onClose,
}: {
  result: SessionResult | null;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
  onClose: () => void;
}) {
  const dialogRef   = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap + ESC to close + initial focus — all wrapped so it can never crash the page
  useEffect(() => {
    try {
      closeBtnRef.current?.focus();
    } catch {
      /* ignore — element may not be mounted yet */
    }

    const handler = (e: KeyboardEvent) => {
      try {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key !== 'Tab') return;

        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } catch {
        /* never let a keyboard handler crash the page */
      }
    };

    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Guard: never render (or crash) if result isn't ready
  if (!result) return null;

  const safeClose = () => {
    try { onClose(); } catch { /* noop */ }
  };
  const safePlayAgain = () => {
    try { onPlayAgain(); } catch { /* noop */ }
  };
  const safeChangeDifficulty = () => {
    try { onChangeDifficulty(); } catch { /* noop */ }
  };

  // Top headline stats (3-col) — mirrors TypingTest's Accuracy/Words/Duration row
  const topStats: { value: string | number; label: string }[] = [
    { value: `${result.acc ?? 0}%`,      label: 'Accuracy' },
    { value: result.score ?? 0,          label: 'Hits' },
    { value: `${result.duration ?? 0}s`, label: 'Duration' },
  ];

  // Extended 4-col stats — mirrors TypingTest's Correct/Incorrect/Mistakes/Backspace row
  const extStats: { value: string | number; label: string; color: string }[] = [
    { value: result.score ?? 0,                                                  label: 'Correct',   color: 'var(--neon-green, #10b981)' },
    { value: result.misses ?? 0,                                                 label: 'Incorrect', color: 'var(--neon-red, #ff2d55)' },
    { value: (result.avgReaction ?? 0) > 0 ? `${result.avgReaction}ms` : 'N/A',  label: 'Reaction',  color: 'var(--neon-orange, #f97316)' },
    { value: `×${result.combo ?? 0}`,                                            label: 'Combo',     color: 'var(--text-secondary, #94a3b8)' },
  ];

  const gradeColors: Record<Grade, string> = {
    'S+': '#FFD700',
    'S':  'var(--neon-cyan, #00f5ff)',
    'A':  'var(--neon-orange, #f97316)',
    'B':  '#a855f7',
    'C':  'var(--neon-green, #10b981)',
    'D':  'var(--text-secondary, #94a3b8)',
  };
  const finalRatingColor = gradeColors[result.grade] ?? 'var(--neon-cyan, #00f5ff)';

  return (
    <>
      {/* Backdrop — identical to TypingTest */}
      <div
        onClick={safeClose}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out forwards',
        }}
      />

      {/* Dialog — identical positioning/background/border/shadow to TypingTest */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aim-results-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '380px',
          background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,255,136,0.08))',
          border: '2px solid rgba(0,245,255,0.3)',
          borderRadius: '20px',
          padding: '1.5rem 0.75rem 0.75rem 0.75rem',
          textAlign: 'center',
          zIndex: 1000,
          animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(0,255,136,0.1)',
        }}
      >
        <button
          ref={closeBtnRef}
          onClick={safeClose}
          aria-label="Close results"
          style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'rgba(0,245,255,0.1)',
            border: '1px solid rgba(0,245,255,0.3)',
            color: 'var(--neon-cyan)',
            width: '32px', height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>
          {result.difficulty ?? ''} · Your Result
        </div>

        <div
          id="aim-results-title"
          style={{
            fontSize: 'clamp(1.9rem, 5.5vw, 3rem)',
            fontWeight: '900',
            color: 'var(--neon-cyan)',
            fontVariantNumeric: 'tabular-nums',
            marginBottom: '0.05rem',
          }}
        >
          {result.score ?? 0}{' '}
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>HITS</span>
        </div>

        <div
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.3rem 0.85rem', borderRadius: '50px',
            background: `${finalRatingColor}20`,
            border: `2px solid ${finalRatingColor}50`,
            color: finalRatingColor,
            fontSize: '0.88rem', fontWeight: '700',
            marginBottom: '0.45rem',
          }}
        >
          Grade {result.grade ?? '-'}
        </div>

        {/* Top 3 stats — same layout/spacing as TypingTest */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.2rem', marginBottom: '0.35rem' }}>
          {topStats.map(s => (
            <div key={s.label} style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '0.3rem',
              border: '1px solid rgba(0,245,255,0.2)',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '0.45rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.04rem',
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Extended stats — same 4-col layout as TypingTest */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.2rem', marginBottom: '0.45rem' }}>
          {extStats.map(s => (
            <div key={s.label} style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '0.3rem',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.42rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={safeChangeDifficulty}
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
          >
            🔄 Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={safePlayAgain}
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
          >
            Try Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
});

// ─── Inline Results Panel (kept — includes accuracy graph + history) ─────────
// Only shown AFTER the modal above is closed, so the two never stack at once.
const ResultsPanel = memo(function ResultsPanel({
  result,
  accHistory,
  onPlayAgain,
  onReset,
}: {
  result: SessionResult | null;
  accHistory: AccDataPoint[];
  onPlayAgain: () => void;
  onReset: () => void;
}) {
  if (!result) return null;

  const stats = [
    { label: 'Hits',             value: result.score ?? 0,                         color: 'var(--neon-green)'  },
    { label: 'Misses',           value: result.misses ?? 0,                        color: 'var(--neon-red)'    },
    { label: 'Accuracy',         value: `${result.acc ?? 0}%`,                     color: 'var(--neon-cyan)'   },
    { label: 'Avg Reaction',     value: (result.avgReaction ?? 0) > 0 ? `${result.avgReaction}ms` : 'N/A', color: 'var(--neon-orange)' },
    { label: 'Targets/sec',      value: (result.hitsPerSec ?? 0).toFixed(2),       color: 'var(--neon-cyan)'   },
    { label: 'Best Combo',       value: `×${result.combo ?? 0}`,                   color: '#FFD700'             },
    { label: 'Miss %',           value: `${result.missPct ?? 0}%`,                 color: 'var(--neon-red)' },
  ];

  const safePlayAgain = () => { try { onPlayAgain(); } catch { /* noop */ } };
  const safeReset     = () => { try { onReset(); } catch { /* noop */ } };

  return (
    <section
      aria-label="Game results"
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '2rem', marginBottom: '2rem',
        animation: 'fadeSlideIn 0.4s ease forwards',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '0.5rem' }}>
          Session Complete — {result.difficulty ?? ''} · {result.duration ?? 0}s
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0 0 1rem 0' }}>
          🏁 Time&apos;s Up!
        </h2>
        <GradeBadge grade={result.grade ?? 'D'} />
      </div>

      <div
        className="aim-results-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
        role="list"
        aria-label="Performance statistics"
      >
        {stats.map(s => (
          <div
            key={s.label}
            role="listitem"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              borderRadius: '12px', padding: '0.9rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {accHistory.length >= 2 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
            📈 ACCURACY OVER TIME
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border)',
            padding: '1rem',
          }}>
            <AccuracyGraph data={accHistory} duration={result.duration ?? 0} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={safePlayAgain} aria-label="Play again with same settings">
          ▶ Play Again
        </button>
        <button className="btn btn-secondary" onClick={safeReset} aria-label="Reset to menu">
          🔄 Reset
        </button>
      </div>
    </section>
  );
});

// ─── Individual Target (memoized) ─────────────────────────────────────────────
const TargetEl = memo(function TargetEl({
  target,
  isHit,
  onHit,
}: {
  target: Target;
  isHit: boolean;
  onHit: (id: number, e: React.PointerEvent) => void;
}) {
  return (
    <div
      onPointerDown={e => onHit(target.id, e)}
      role="button"
      tabIndex={-1}
      aria-label="Target — click to hit"
      style={{
        position: 'absolute',
        left: target.x,
        top:  target.y,
        width:  target.size,
        height: target.size,
        borderRadius: '50%',
        transform: 'translate(-50%,-50%)',
        cursor: 'crosshair',
        touchAction: 'none',
        background: isHit
          ? 'radial-gradient(circle, rgba(255,255,255,0.95) 18%, rgba(255,200,0,0.9) 38%, transparent 38%, transparent 58%, rgba(255,200,0,0.9) 58%)'
          : 'radial-gradient(circle, rgba(255,255,255,0.9) 18%, rgba(255,45,85,0.95) 38%, transparent 38%, transparent 58%, rgba(255,45,85,0.85) 58%)',
        border: `3px solid ${isHit ? 'rgba(255,220,0,0.9)' : 'rgba(255,255,255,0.85)'}`,
        boxShadow: isHit
          ? '0 0 25px rgba(255,220,0,0.8), 0 0 50px rgba(255,220,0,0.4)'
          : '0 0 20px rgba(255,45,85,0.55)',
        animation: isHit
          ? 'target-hit 0.12s ease-out forwards'
          : 'target-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards',
        willChange: 'transform, opacity',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );
});

// ─── Combo Banner (memoized) ──────────────────────────────────────────────────
const ComboBanner = memo(function ComboBanner({
  combo,
  milestone,
}: {
  combo: number;
  milestone: boolean;
}) {
  if (combo < 2) return null;
  const isFire  = combo >= 20;
  const isGold  = combo >= 10;
  const color   = isFire ? '#FF6B00' : isGold ? '#FFD700' : 'var(--neon-cyan)';
  const label   = isFire ? '🔥 ON FIRE!' : isGold ? '⭐ COMBO!' : '✨ Streak';

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Combo streak: ${combo}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: '20px',
        background: `rgba(0,0,0,0.55)`,
        border: `1.5px solid ${color}`,
        color, fontWeight: '900', fontSize: '0.85rem',
        animation: milestone ? 'comboMilestone 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        boxShadow: milestone ? `0 0 20px ${color}55` : 'none',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '1rem' }}>×{combo}</span>
    </div>
  );
});

// ─── Keyboard Shortcut Hints ──────────────────────────────────────────────────
const ShortcutHints = memo(function ShortcutHints({ phase }: { phase: Phase }) {
  const hints =
    phase === 'idle'
      ? [{ key: 'Space', action: 'Start' }, { key: 'R', action: 'Reset' }]
      : phase === 'running'
      ? [{ key: 'Esc', action: 'Pause' },  { key: 'R', action: 'Reset' }]
      : phase === 'paused'
      ? [{ key: 'Esc', action: 'Resume' }, { key: 'R', action: 'Reset' }]
      : [{ key: 'Space', action: 'Play Again' }, { key: 'Esc', action: 'Close popup' }, { key: 'R', action: 'Reset' }];

  return (
    <div
      aria-label="Keyboard shortcuts"
      style={{
        display: 'flex', gap: '0.75rem', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '0.75rem',
      }}
    >
      {hints.map(h => (
        <div
          key={h.key + h.action}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
        >
          <kbd
            style={{
              padding: '2px 7px', borderRadius: '5px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.06)',
              fontFamily: 'monospace', fontSize: '0.75rem', color: '#fff',
              boxShadow: '0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {h.key}
          </kbd>
          <span>{h.action}</span>
        </div>
      ))}
    </div>
  );
});

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How to improve reaction time in FPS games?',
    a: "Train your brain's cognitive processing with daily aim sessions. Pair practice with a high-refresh monitor (144Hz+) and a low-latency mouse to physically reduce input lag. Focus on reading target spawn positions rather than reacting after they appear. Consistent sleep, hydration, and warm-up routines also measurably improve reaction time.",
  },
  {
    q: 'Does aim training help in Minecraft, Roblox, or League of Legends?',
    a: 'Yes. In Minecraft, tracking a strafing player while landing hits separates PvP masters from average players. In League of Legends, precise clicking prevents misclicks during team fights. In Roblox and Fortnite, fast accurate crosshair placement speeds up mechanical execution significantly.',
  },
  {
    q: 'What is the difference between arm aiming and wrist aiming?',
    a: 'Arm aiming (low DPI, large mouse movements) is better for large flicks and long-term wrist health. Wrist aiming (higher DPI, small movements) suits micro-adjustments. Most pro players use low DPI (400–800) and arm-aim for consistency.',
  },
  {
    q: 'What does polling rate mean for a gaming mouse?',
    a: 'Polling rate (Hz) is how often your mouse reports its position to the PC per second. A 1000Hz mouse reports every 1ms; a 125Hz mouse every 8ms. Higher polling rates (1000Hz+) result in smoother, more responsive cursor movement — critical in fast-paced FPS games.',
  },
  {
    q: 'How long should I aim train per day?',
    a: 'Research and pro player routines suggest 15–30 minutes of focused aim training before gaming sessions is optimal. Beyond 45 minutes, diminishing returns and mental fatigue can reduce accuracy gains. Quality and focus matter more than raw time.',
  },
] as const;

const GAMES = [
  'Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V',
  'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2',
  'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us',
  'Valorant', 'Apex Legends',
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AimTrainerPage() {
  // ── Game Config State ──────────────────────────────────────────────────────
  const [difficulty,   setDifficulty]   = useState<Difficulty>('Medium');
  const [gameDuration, setGameDuration] = useState<Duration>(DEFAULT_DURATION);

  // ── Game Runtime State ─────────────────────────────────────────────────────
  const [phase,    setPhase]    = useState<Phase>('idle');
  const [targets,  setTargets]  = useState<Target[]>([]);
  const [score,    setScore]    = useState(0);
  const [misses,   setMisses]   = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATION);
  const [hitIds,   setHitIds]   = useState<Set<number>>(new Set());
  const [combo,    setCombo]    = useState(0);
  const [milestone, setMilestone] = useState(false);
  const [soundOn,  setSoundOn]  = useState(true);

  // ── Fullscreen State ───────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsSupported]  = useState<boolean>(() =>
    typeof document !== 'undefined' ? isFullscreenSupported() : false,
  );
  const [exitFsOnEnd, setExitFsOnEnd] = useState(false);

  // ── Results State ──────────────────────────────────────────────────────────
  const [result,      setResult]      = useState<SessionResult | null>(null);
  const [accHistory,  setAccHistory]  = useState<AccDataPoint[]>([]);
  const [history,     setHistory]     = useState<SessionResult[]>([]);
  const [showModal,   setShowModal]   = useState(false);

  // ── Countdown State (3, 2, 1, GO!) ────────────────────────────────────────
  const [countdownNum, setCountdownNum] = useState<number | null>(null); // 3,2,1,0(=GO) or null when not counting
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs — avoid stale closures, no re-renders ─────────────────────────────
  const areaRef          = useRef<HTMLDivElement>(null);
  const containerRef     = useRef<HTMLDivElement>(null);
  const timerRef         = useRef<ReturnType<typeof setInterval>  | null>(null);
  const spawnRef         = useRef<ReturnType<typeof setInterval>  | null>(null);
  const targetTimeouts   = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const targetId         = useRef(0);
  const totalClicks      = useRef(0);
  const hitClicks        = useRef(0);
  const phaseRef         = useRef<Phase>('idle');
  const lastClickTime    = useRef(0);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const soundOnRef       = useRef(soundOn);
  const difficultyRef    = useRef<Difficulty>('Medium');
  const gameDurationRef  = useRef<number>(DEFAULT_DURATION);
  const comboRef         = useRef(0);
  const maxComboRef      = useRef(0);
  const reactionTimes    = useRef<number[]>([]);
  const accDataRef       = useRef<AccDataPoint[]>([]);
  const accSecondRef     = useRef(0);
  const startTimeRef     = useRef(0);
  const pausedAtRef      = useRef(0);     // remaining seconds snapshot when paused
  const exitFsOnEndRef   = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { soundOnRef.current    = soundOn;    }, [soundOn]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { exitFsOnEndRef.current = exitFsOnEnd; }, [exitFsOnEnd]);
  useEffect(() => {
    gameDurationRef.current = gameDuration;
    if (phaseRef.current === 'idle') {
      setTimeLeft(gameDuration);
    }
  }, [gameDuration]);

  // ── Audio Context ──────────────────────────────────────────────────────────
  const getAudioCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return audioCtxRef.current;
  }, []);

  const emitSound = useCallback((type: 'hit' | 'miss' | 'combo', comboLevel = 1) => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') void ctx.resume();
      if (type === 'hit')   playHit(ctx);
      else if (type === 'miss') playMiss(ctx);
      else playCombo(ctx, comboLevel);
    } catch { /* silently ignore audio errors */ }
  }, [getAudioCtx]);

  // ── Fullscreen (rewritten — robust, cross-browser) ─────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!fsSupported) return;
    const el = containerRef.current;
    if (!el) return;

    if (getFullscreenElement()) {
      void exitFs();
    } else {
      void requestFs(el);
    }
  }, [fsSupported]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!getFullscreenElement());
    FS_CHANGE_EVENTS.forEach(evt => document.addEventListener(evt, handler));
    handler(); // sync initial state
    return () => {
      FS_CHANGE_EVENTS.forEach(evt => document.removeEventListener(evt, handler));
    };
  }, []);

  // ── Prevent scroll during game (touch) ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'running') return;
    const prevent = (e: TouchEvent) => { e.preventDefault(); };
    const area = areaRef.current;
    area?.addEventListener('touchmove', prevent, { passive: false });
    area?.addEventListener('touchstart', prevent, { passive: false });
    return () => {
      area?.removeEventListener('touchmove', prevent);
      area?.removeEventListener('touchstart', prevent);
    };
  }, [phase]);

  // ── Global unmount cleanup ─────────────────────────────────────────────────
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
    targetTimeouts.current.forEach(t => clearTimeout(t));
    audioCtxRef.current?.close().catch(() => {});
  }, []);

  // ── Remove Target ──────────────────────────────────────────────────────────
  const removeTarget = useCallback((id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setHitIds(prev  => { const s = new Set(prev); s.delete(id); return s; });
    targetTimeouts.current.delete(id);
  }, []);

  // ── Record accuracy snapshot per second ───────────────────────────────────
  const recordAccSnapshot = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const second  = Math.floor(elapsed);
    if (second > accSecondRef.current) {
      accSecondRef.current = second;
      const acc = totalClicks.current > 0
        ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100;
      accDataRef.current = [...accDataRef.current, { second, acc }];
      setAccHistory([...accDataRef.current]);
    }
  }, []);

  // ── Spawn Target ───────────────────────────────────────────────────────────
  const spawnTarget = useCallback(() => {
    if (!areaRef.current || phaseRef.current !== 'running') return;
    const rect = areaRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const cfg  = DIFFICULTY_CONFIGS[difficultyRef.current];
    const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const x    = Math.max(size / 2, Math.min(rect.width  - size / 2, size / 2 + Math.random() * (rect.width  - size)));
    const y    = Math.max(size / 2, Math.min(rect.height - size / 2, size / 2 + Math.random() * (rect.height - size)));
    const id   = ++targetId.current;

    setTargets(prev => {
      if (prev.length >= cfg.maxTargets) return prev;
      return [...prev, { id, x, y, size, spawnTime: performance.now() }];
    });

    const t = setTimeout(() => removeTarget(id), cfg.targetLifetime);
    targetTimeouts.current.set(id, t);
  }, [removeTarget]);

  // ── End Game ───────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    if (phaseRef.current !== 'running' && phaseRef.current !== 'paused') return;
    phaseRef.current = 'done';

    if (timerRef.current) { clearInterval(timerRef.current);  timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current);  spawnRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setTargets([]);
    setPhase('done');

    const configuredDuration = gameDurationRef.current;
    const totalTime = Math.min(
      configuredDuration,
      Math.max(0.01, (performance.now() - startTimeRef.current) / 1000),
    );

    const totalAttempts = totalClicks.current;
    const acc       = totalAttempts > 0 ? Math.round((hitClicks.current / totalAttempts) * 100) : 0;
    const missCount = Math.max(0, totalAttempts - hitClicks.current);
    const missPct   = totalAttempts > 0 ? Math.round((missCount / totalAttempts) * 100) : 0;
    const avgReaction = reactionTimes.current.length > 0
      ? Math.round(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length) : 0;
    const hitsPerSec  = totalTime > 0 ? hitClicks.current / totalTime : 0;
    const grade       = calcGrade(acc, avgReaction, hitsPerSec);

    const r: SessionResult = {
      score: hitClicks.current,
      misses: missCount,
      acc,
      missPct,
      avgReaction,
      hitsPerSec,
      combo: maxComboRef.current,
      grade,
      duration: configuredDuration,
      totalTime,
      difficulty: difficultyRef.current,
    };
    setResult(r);
    setHistory(prev => [r, ...prev.slice(0, MAX_HISTORY - 1)]);
    setShowModal(true);

    if (exitFsOnEndRef.current && getFullscreenElement()) {
      void exitFs();
    }
  }, []);

  // ── Start Game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';

    const dur = gameDurationRef.current;

    setPhase('running');
    setScore(0);
    setMisses(0);
    setTimeLeft(dur);
    setTargets([]);
    setHitIds(new Set());
    setCombo(0);
    setMilestone(false);
    setResult(null);
    setAccHistory([]);
    setShowModal(false);

    totalClicks.current   = 0;
    hitClicks.current     = 0;
    targetId.current      = 0;
    lastClickTime.current = 0;
    comboRef.current      = 0;
    maxComboRef.current   = 0;
    reactionTimes.current = [];
    accDataRef.current    = [];
    accSecondRef.current  = 0;
    startTimeRef.current  = performance.now();

    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();

    spawnTarget();
    spawnRef.current = setInterval(spawnTarget, DIFFICULTY_CONFIGS[difficultyRef.current].spawnInterval);

    const start = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const left    = Math.max(0, dur - elapsed);
      setTimeLeft(left);
      recordAccSnapshot();
      if (left <= 0) endGame();
    }, 50);
  }, [spawnTarget, endGame, recordAccSnapshot]);

  // ── Countdown (3, 2, 1, GO!) — runs before startGame actually begins ──────
  const beginCountdown = useCallback(() => {
    try {
      // Don't stack countdowns and don't interrupt an active/paused round
      if (phaseRef.current === 'running' || phaseRef.current === 'paused') return;
      if (countdownTimeoutRef.current) return;

      setShowModal(false);

      let step = 3;
      setCountdownNum(step);

      const tick = () => {
        try {
          step -= 1;
          if (step >= 1) {
            setCountdownNum(step);
            countdownTimeoutRef.current = setTimeout(tick, 700);
          } else {
            setCountdownNum(0); // 0 renders as "GO!"
            countdownTimeoutRef.current = setTimeout(() => {
              countdownTimeoutRef.current = null;
              setCountdownNum(null);
              startGame();
            }, 500);
          }
        } catch {
          // Never let a countdown tick crash the page — fail safe into starting the game
          countdownTimeoutRef.current = null;
          setCountdownNum(null);
          startGame();
        }
      };

      countdownTimeoutRef.current = setTimeout(tick, 700);
    } catch {
      // Last-resort fallback: skip the countdown rather than break the app
      countdownTimeoutRef.current = null;
      setCountdownNum(null);
      startGame();
    }
  }, [startGame]);

  // ── Pause / Resume ─────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (phaseRef.current === 'running') {
      phaseRef.current = 'paused';
      setPhase('paused');
      if (timerRef.current) { clearInterval(timerRef.current);  timerRef.current = null; }
      if (spawnRef.current) { clearInterval(spawnRef.current);  spawnRef.current = null; }
      setTimeLeft(prev => { pausedAtRef.current = prev; return prev; });
    } else if (phaseRef.current === 'paused') {
      phaseRef.current = 'running';
      setPhase('running');
      spawnRef.current = setInterval(spawnTarget, DIFFICULTY_CONFIGS[difficultyRef.current].spawnInterval);
      const resumeLeft = pausedAtRef.current;
      const start      = performance.now();
      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - start) / 1000;
        const left    = Math.max(0, resumeLeft - elapsed);
        setTimeLeft(left);
        recordAccSnapshot();
        if (left <= 0) endGame();
      }, 50);
    }
  }, [spawnTarget, endGame, recordAccSnapshot]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) { clearInterval(timerRef.current);  timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current);  spawnRef.current = null; }
    if (countdownTimeoutRef.current) { clearTimeout(countdownTimeoutRef.current); countdownTimeoutRef.current = null; }
    setCountdownNum(null);
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();

    setPhase('idle');
    setScore(0);
    setMisses(0);
    setTimeLeft(gameDurationRef.current);
    setTargets([]);
    setHitIds(new Set());
    setCombo(0);
    setMilestone(false);
    setResult(null);
    setAccHistory([]);
    setShowModal(false);
    totalClicks.current   = 0;
    hitClicks.current     = 0;
    lastClickTime.current = 0;
    comboRef.current      = 0;
    maxComboRef.current   = 0;
    reactionTimes.current = [];
    accDataRef.current    = [];
  }, []);

  // ── Change duration (fully wired — no hardcoded values) ───────────────────
  const changeDuration = useCallback((d: Duration) => {
    if (phaseRef.current === 'running' || phaseRef.current === 'paused') return;
    setGameDuration(d);
    gameDurationRef.current = d;
    setTimeLeft(d);
  }, []);

  // ── Change difficulty (fully wired — instant effect pre-game) ─────────────
  const changeDifficulty = useCallback((d: Difficulty) => {
    if (phaseRef.current === 'running' || phaseRef.current === 'paused') return;
    setDifficulty(d);
    difficultyRef.current = d;
  }, []);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const closeModal = useCallback(() => setShowModal(false), []);
  const openDifficultyFromModal = useCallback(() => {
    setShowModal(false);
    resetGame();
  }, [resetGame]);

  // ── Hit Target ─────────────────────────────────────────────────────────────
  const hitTarget = useCallback((id: number, e: React.PointerEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;

    const now = performance.now();
    if (now - lastClickTime.current < CLICK_RATE_MS) return;
    lastClickTime.current = now;

    setTargets(prev => {
      const t = prev.find(x => x.id === id);
      if (t) {
        const rt = Math.round(now - t.spawnTime);
        reactionTimes.current = [...reactionTimes.current, rt];
      }
      return prev;
    });

    const timeout = targetTimeouts.current.get(id);
    if (timeout) { clearTimeout(timeout); targetTimeouts.current.delete(id); }

    setHitIds(prev => new Set(prev).add(id));
    setTimeout(() => removeTarget(id), 120);

    setScore(prev => prev + 1);
    hitClicks.current++;
    totalClicks.current++;

    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    if (newCombo > maxComboRef.current) maxComboRef.current = newCombo;
    setCombo(newCombo);

    const isMilestone = newCombo === 10 || newCombo === 20 || newCombo % 25 === 0;
    if (isMilestone) {
      setMilestone(true);
      emitSound('combo', newCombo);
      setTimeout(() => setMilestone(false), 500);
    } else {
      emitSound('hit');
    }

    spawnTarget();
  }, [spawnTarget, removeTarget, emitSound]);

  // ── Miss Click ─────────────────────────────────────────────────────────────
  const missClick = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (phaseRef.current !== 'running') return;

    const now = performance.now();
    if (now - lastClickTime.current < CLICK_RATE_MS) return;
    lastClickTime.current = now;

    setMisses(prev => prev + 1);
    totalClicks.current++;

    comboRef.current = 0;
    setCombo(0);
    emitSound('miss');
  }, [emitSound]);

  // ── Keyboard Shortcuts (fixed — ignores all input-like elements) ──────────
  const isTypingTarget = useCallback((target: EventTarget | null): boolean => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (countdownTimeoutRef.current) return; // already counting down — ignore extra presses
        if (phaseRef.current === 'idle') beginCountdown();
        else if (phaseRef.current === 'done') {
          setShowModal(false);
          beginCountdown();
        }
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        resetGame();
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        if (showModal) {
          setShowModal(false);
        } else if (phaseRef.current === 'running' || phaseRef.current === 'paused') {
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [startGame, beginCountdown, resetGame, togglePause, isTypingTarget, showModal]);

  // ── Derived values (memoized) ──────────────────────────────────────────────
  const acc = useMemo(
    () => totalClicks.current > 0
      ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [score, misses],
  );

  const progress = useMemo(
    () => gameDuration > 0 ? ((gameDuration - timeLeft) / gameDuration) * 100 : 0,
    [gameDuration, timeLeft],
  );

  const diffCfg = DIFFICULTY_CONFIGS[difficulty];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SeoMeta />
      <JsonLd data={JSON_LD_APP} />

      <style>{`
        @keyframes target-pop {
          0%   { transform: translate(-50%,-50%) scale(0.35); opacity: 0; }
          60%  { transform: translate(-50%,-50%) scale(1.1);  opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
        }
        @keyframes target-hit {
          0%   { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.4);  opacity: 0; }
        }
        @keyframes comboMilestone {
          0%   { transform: scale(1);    }
          40%  { transform: scale(1.25); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1);    }
        }
        @keyframes gradeReveal {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          70%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1)   rotate(0deg); opacity: 1; }
        }
        @keyframes countdownPop {
          0%   { transform: scale(0.3); opacity: 0; }
          55%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes graphDraw {
          from { stroke-dashoffset: 1200; }
          to   { stroke-dashoffset: 0;    }
        }
        @keyframes milestoneFloat {
          0%   { opacity: 0; transform: translateY(0)   scale(1);    }
          30%  { opacity: 1; transform: translateY(-8px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-28px) scale(0.9); }
        }
        .aim-fullscreen-btn:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        .aim-fullscreen-btn:disabled {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
        }
        .aim-difficulty-btn:focus-visible,
        .aim-duration-btn:focus-visible,
        .aim-sound-btn:focus-visible {
          outline: 2px solid var(--neon-cyan);
          outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .aim-stats-grid       { grid-template-columns: repeat(2,1fr) !important; gap: 0.6rem !important; }
          .aim-game-area        { height: 280px !important; }
          .aim-controls         { flex-direction: column !important; align-items: stretch !important; }
          .aim-controls .btn    { width: 100% !important; text-align: center !important; min-height: 44px; }
          .aim-settings-row     { flex-direction: column !important; gap: 0.75rem !important; }
          .aim-games-grid       { grid-template-columns: repeat(2,1fr) !important; }
          .aim-article-wrap     { padding: 1.25rem !important; }
          .aim-results-grid     { grid-template-columns: repeat(2,1fr) !important; }
          .aim-difficulty-btn, .aim-duration-btn, .aim-sound-btn, .aim-fullscreen-btn {
            min-height: 40px;
          }
        }
        @media (max-width: 380px) {
          .aim-stats-grid { gap: 0.4rem !important; }
        }
        *:focus-visible {
          outline: 2px solid var(--neon-cyan);
          outline-offset: 2px;
        }
      `}</style>

      <div ref={containerRef}>
        <main
          style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
          role="main"
          aria-label="Aim Trainer"
        >

          {/* ── Header ──────────────────────────────────────────────── */}
          <header style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div className="section-label">Aim Tool</div>
            <h1 className="tool-title">Aim Trainer</h1>
            <p className="tool-subtitle">
              Click targets as fast and accurately as possible — track your accuracy, combos, and grade
            </p>
          </header>

          {/* ── Top Controls Row ────────────────────────────────────── */}
          <div
            className="aim-settings-row"
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}
          >
            {/* Difficulty Selector */}
            <fieldset
              style={{ border: 'none', padding: 0, margin: 0 }}
              aria-label="Select difficulty"
            >
              <legend style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>
                Difficulty
              </legend>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(d => (
                  <button
                    key={d}
                    className="aim-difficulty-btn"
                    onClick={() => changeDifficulty(d)}
                    disabled={phase === 'running' || phase === 'paused'}
                    aria-pressed={difficulty === d}
                    aria-label={`Difficulty: ${d}`}
                    style={{
                      padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700',
                      border: `1.5px solid ${difficulty === d ? DIFFICULTY_CONFIGS[d].color : 'var(--border)'}`,
                      background: difficulty === d ? `${DIFFICULTY_CONFIGS[d].color}22` : 'var(--bg-card)',
                      color: difficulty === d ? DIFFICULTY_CONFIGS[d].color : 'var(--text-muted)',
                      cursor: phase === 'running' || phase === 'paused' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', opacity: phase === 'running' || phase === 'paused' ? 0.5 : 1,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Duration Selector */}
            <fieldset
              style={{ border: 'none', padding: 0, margin: 0 }}
              aria-label="Select game duration"
            >
              <legend style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>
                Duration
              </legend>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    className="aim-duration-btn"
                    onClick={() => changeDuration(d)}
                    disabled={phase === 'running' || phase === 'paused'}
                    aria-pressed={gameDuration === d}
                    aria-label={`${d} seconds`}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700',
                      border: `1.5px solid ${gameDuration === d ? 'var(--neon-cyan)' : 'var(--border)'}`,
                      background: gameDuration === d ? 'rgba(0,245,255,0.12)' : 'var(--bg-card)',
                      color: gameDuration === d ? 'var(--neon-cyan)' : 'var(--text-muted)',
                      cursor: phase === 'running' || phase === 'paused' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', opacity: phase === 'running' || phase === 'paused' ? 0.5 : 1,
                    }}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Sound + Fullscreen */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="aim-sound-btn"
                onClick={() => setSoundOn(v => !v)}
                aria-pressed={soundOn}
                aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to unmute'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  border: soundOn ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
                  background: soundOn ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
                  color: soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
                <span>{soundOn ? 'ON' : 'OFF'}</span>
              </button>

              <button
                className="aim-sound-btn"
                onClick={() => setExitFsOnEnd(v => !v)}
                aria-pressed={exitFsOnEnd}
                aria-label="Toggle exit fullscreen automatically when game ends"
                title="Exit fullscreen automatically when the game ends"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  border: exitFsOnEnd ? '1px solid var(--neon-orange)' : '1px solid var(--border)',
                  background: exitFsOnEnd ? 'rgba(255,107,0,0.1)' : 'var(--bg-card)',
                  color: exitFsOnEnd ? 'var(--neon-orange)' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                Auto-exit FS: {exitFsOnEnd ? 'ON' : 'OFF'}
              </button>

              <button
                className="aim-fullscreen-btn"
                onClick={toggleFullscreen}
                disabled={!fsSupported}
                aria-pressed={isFullscreen}
                aria-label={
                  !fsSupported
                    ? 'Fullscreen not supported in this browser'
                    : isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                }
                title={
                  !fsSupported
                    ? 'Fullscreen not supported in this browser'
                    : isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                }
                style={{
                  padding: '0.4rem 0.65rem', borderRadius: '8px',
                  border: `1px solid ${isFullscreen ? 'var(--neon-cyan)' : 'var(--border)'}`,
                  background: isFullscreen ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
                  color: isFullscreen ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  fontSize: '1rem', cursor: fsSupported ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span aria-hidden="true">{isFullscreen ? '⛶' : '⛶'}</span>
                <span style={{ fontSize: '0.75rem' }}>
                  {!fsSupported ? 'Unsupported' : isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </span>
              </button>
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────────────────────────── */}
          <div
            className="aim-stats-grid"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Hits: ${score}, Misses: ${misses}, Accuracy: ${acc}%, Time left: ${timeLeft.toFixed(1)} seconds, Combo: ${combo}`}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}
          >
            {[
              { value: score,                 label: 'Hits',     color: 'var(--neon-green)'  },
              { value: misses,                label: 'Misses',   color: 'var(--neon-red)'    },
              { value: `${acc}%`,             label: 'Accuracy', color: 'var(--neon-cyan)'   },
              { value: timeLeft.toFixed(1),   label: 'Seconds',  color: 'var(--neon-orange)' },
              { value: `×${combo}`,           label: 'Combo',    color: '#FFD700'             },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '0.75rem', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 'clamp(1.1rem,3.5vw,2rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Progress Bar ─────────────────────────────────────────── */}
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}
            aria-label="Game progress"
            style={{ marginBottom: '0.75rem' }}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* ── Combo Banner ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '28px', marginBottom: '0.5rem' }}>
            {phase === 'running' && <ComboBanner combo={combo} milestone={milestone} />}
          </div>

          {/* ── Keyboard Hints ───────────────────────────────────────── */}
          <ShortcutHints phase={phase} />

          {/* ── Game Area ────────────────────────────────────────────── */}
          <div
            ref={areaRef}
            onPointerDown={missClick}
            className="aim-game-area"
            role={phase === 'running' ? 'region' : undefined}
            aria-label={
              phase === 'running'
                ? 'Aim training area — click the targets'
                : phase === 'paused'
                ? 'Game paused'
                : undefined
            }
            style={{
              position: 'relative', width: '100%', height: '420px',
              background: 'var(--bg-card)',
              border: `2px solid ${
                phase === 'running' ? diffCfg.color :
                phase === 'paused'  ? 'var(--neon-orange)' :
                'var(--border)'
              }`,
              borderRadius: '16px', overflow: 'hidden',
              cursor: phase === 'running' ? 'crosshair' : 'default',
              marginBottom: '1.25rem',
              touchAction: phase === 'running' ? 'none' : 'auto',
              boxShadow: phase === 'running'
                ? `0 0 30px ${diffCfg.color}22`
                : 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {countdownNum !== null && (
              <div
                aria-live="assertive"
                aria-atomic="true"
                style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: 'rgba(0,0,0,0.78)', zIndex: 20,
                }}
              >
                <span
                  key={countdownNum}
                  style={{
                    fontSize: countdownNum === 0 ? 'clamp(2.5rem,9vw,4.5rem)' : 'clamp(4rem,14vw,7rem)',
                    fontWeight: '900',
                    color: countdownNum === 0 ? 'var(--neon-green)' : diffCfg.color,
                    textShadow: `0 0 30px ${countdownNum === 0 ? 'rgba(0,255,136,0.6)' : 'rgba(0,245,255,0.5)'}`,
                    animation: 'countdownPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {countdownNum === 0 ? 'GO!' : countdownNum}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {difficulty} · {gameDuration}s
                </span>
              </div>
            )}

            {phase === 'idle' && countdownNum === null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '4rem' }} aria-hidden="true">🎯</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click Start to Play</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {difficulty} · {gameDuration}s — Click targets as fast as you can!
                </span>
              </div>
            )}

            {phase === 'paused' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.75)', zIndex: 10 }}>
                <span style={{ fontSize: '3rem' }} aria-hidden="true">⏸</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--neon-orange)' }}>Paused</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Press Esc or click Resume to continue</span>
              </div>
            )}

            {phase === 'done' && !showModal && countdownNum === null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.7)', zIndex: 10 }}>
                <span style={{ fontSize: '3rem' }} aria-hidden="true">🏁</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--neon-cyan)' }}>Time&apos;s Up!</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-green)' }}>{score} Hits</span>
                <span style={{ color: 'var(--text-secondary)' }}>{acc}% Accuracy · ×{Math.max(combo, maxComboRef.current)} Max Combo</span>
                {result && (
                  <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ marginTop: '0.5rem' }}>
                    View Full Results
                  </button>
                )}
              </div>
            )}

            {targets.map(t => (
              <TargetEl
                key={t.id}
                target={t}
                isHit={hitIds.has(t.id)}
                onHit={hitTarget}
              />
            ))}
          </div>

          {/* ── Controls ─────────────────────────────────────────────── */}
          <div
            className="aim-controls"
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}
          >
            {phase !== 'running' && phase !== 'paused' && (
              <button
                className="btn btn-primary"
                onClick={beginCountdown}
                disabled={countdownNum !== null}
                aria-label={phase === 'done' ? 'Play again' : 'Start aim trainer'}
                style={{ opacity: countdownNum !== null ? 0.6 : 1, cursor: countdownNum !== null ? 'not-allowed' : 'pointer' }}
              >
                {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
              </button>
            )}
            {phase === 'running' && (
              <button className="btn btn-secondary" onClick={togglePause} aria-label="Pause game">
                ⏸ Pause
              </button>
            )}
            {phase === 'paused' && (
              <button className="btn btn-primary" onClick={togglePause} aria-label="Resume game">
                ▶ Resume
              </button>
            )}
            {phase !== 'idle' && (
              <button className="btn btn-secondary" onClick={resetGame} aria-label="Reset game">
                🔄 Reset
              </button>
            )}
          </div>

          {/*
            ── Results: MODAL or PANEL, never both ────────────────────
            On game end the centered popup (matching TypingTest) shows
            first. Closing it reveals the inline panel with the graph
            and a "Play Again"/"Reset" pair — they no longer stack.
          */}
          {showModal && result ? (
            <ResultsModal
              result={result}
              onPlayAgain={beginCountdown}
              onChangeDifficulty={openDifficultyFromModal}
              onClose={closeModal}
            />
          ) : (
            phase === 'done' && result && (
              <ResultsPanel
                result={result}
                accHistory={accHistory}
                onPlayAgain={beginCountdown}
                onReset={resetGame}
              />
            )
          )}

          {/* ── Session History ──────────────────────────────────────── */}
          {history.length > 0 && (
            <section
              aria-label="Session history"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}
            >
              <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
                📊 Session History
              </div>
              <div role="list" aria-label="Previous game results">
                {history.map((h, i) => (
                  <div
                    key={i}
                    role="listitem"
                    style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 1fr 1fr 2rem', gap: '0.5rem', alignItems: 'center', padding: '0.65rem 1.25rem', fontSize: '0.8rem', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
                    <span style={{ color: 'var(--neon-green)', fontWeight: '700' }}>{h.score} hits</span>
                    <span style={{ color: 'var(--neon-cyan)' }}>{h.acc}% acc</span>
                    <span style={{ color: 'var(--neon-orange)' }}>{h.avgReaction > 0 ? `${h.avgReaction}ms` : '—'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{h.difficulty} · {h.duration}s</span>
                    <span style={{ color: '#FFD700', fontWeight: '900', fontSize: '0.85rem' }}>{h.grade}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SEO ARTICLE — unchanged
          ══════════════════════════════════════════════════════════════ */}
          <article
            className="aim-article-wrap"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem', marginTop: '1rem' }}
          >
            <section style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.85' }}>

              <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1.25rem', color: 'var(--neon-cyan)', marginTop: '0', letterSpacing: '-0.5px' }}>
                The Ultimate Guide to Aim Training &amp; Mouse Accuracy
              </h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#d1d5db' }}>
                An <strong>Aim Trainer</strong> is a specialized browser tool designed to help gamers systematically test and improve their mouse reaction time, clicking accuracy, and spatial tracking. In competitive eSports, raw clicks-per-second statistics mean very little without precision behind them. Our 2D Aim Trainer isolates your mechanical mouse control, building stable neural pathways between your eyes and your hands — the same pathways that separate a Silver from a Global Elite.
              </p>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                Whether you play <strong>Counter-Strike 2</strong>, <strong>Valorant</strong>, <strong>Apex Legends</strong>, or even casual titles like <strong>Roblox</strong> or <strong>Fortnite</strong>, aim training transfers directly to in-game performance. This guide covers every aspect of aim training — from mouse hardware to daily routines — so you can go from your first session to measurable improvement within weeks.
              </p>

              <div style={{ background: 'rgba(0,255,136,0.05)', borderLeft: '4px solid var(--neon-green)', borderRadius: '0 12px 12px 0', padding: '1.5rem', marginBottom: '2.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '0', marginBottom: '0.4rem' }}>
                  🖱️ Use This as a New Mouse Sensor Check
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.92rem' }}>
                  Our Aim Trainer doubles as a <strong>new mouse check</strong>. By clicking small randomly spawning targets rapidly, you can immediately detect optical sensor spin-outs, confirm zero hardware acceleration, and dial in your DPI before any competitive match. If you notice jittery movements or missed clicks that feel responsive, your sensor — not your skill — may be the issue.
                </p>
              </div>

              <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to Increase Aim Accuracy
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Accuracy is the product of three combined factors: <em>muscle memory</em>, <em>visual processing speed</em>, and <em>hardware reliability</em>. Improving all three simultaneously accelerates your progress far faster than focusing on any one area.
              </p>
              <ul style={{ marginBottom: '1.5rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong style={{ color: '#fff' }}>Daily deliberate practice:</strong> Short focused sessions (15–20 min) build muscle memory faster than sporadic long sessions. Aim for consistency over duration.</li>
                <li><strong style={{ color: '#fff' }}>Lower your DPI:</strong> Many new players set DPI too high, which amplifies micro-tremors. Most pros use 400–800 DPI on large mousepads.</li>
                <li><strong style={{ color: '#fff' }}>Fix your crosshair placement:</strong> Pre-aim at head level where enemies appear. React less — predict more.</li>
                <li><strong style={{ color: '#fff' }}>Reduce input lag:</strong> A 60Hz monitor adds up to 16ms of display latency per frame. Upgrading to 144Hz or 240Hz gives your real reaction time a fair chance.</li>
                <li><strong style={{ color: '#fff' }}>Slow down to speed up:</strong> When accuracy drops below 70%, slow your movement and re-establish precision before ramping back up to speed.</li>
              </ul>

              <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Best DPI and Sensitivity for FPS Games
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                DPI (dots per inch) determines how far your cursor moves per inch of physical mouse movement. Despite what gaming peripheral marketing suggests, <em>higher DPI is not better</em> for accuracy. Here is how to find your optimal sensitivity:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '10px', border: '1px solid var(--border)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#9ca3af' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                  {[
                    { role: 'Rifler / Entry', dpi: '400–800', sens: '1.5–2.5', edpi: '600–2000' },
                    { role: 'AWPer / Sniper', dpi: '400–800', sens: '0.8–1.5', edpi: '320–1200' },
                    { role: 'Casual / Shooter', dpi: '800–1600', sens: '1.0–2.0', edpi: '800–3200' },
                  ].map(row => (
                    <div key={row.role}>
                      <div style={{ color: 'var(--neon-cyan)', fontWeight: '700', marginBottom: '0.3rem' }}>{row.role}</div>
                      <div>DPI: <strong style={{ color: '#fff' }}>{row.dpi}</strong></div>
                      <div>Sens: <strong style={{ color: '#fff' }}>{row.sens}</strong></div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>eDPI: {row.edpi}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                <strong style={{ color: '#fff' }}>eDPI</strong> (effective DPI = DPI × in-game sensitivity) is the universal comparison metric. Two players with different hardware settings but the same eDPI move their crosshairs identically. The sweet spot for most CS2 and Valorant pros sits between 800–1600 eDPI.
              </p>

              <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Mouse Polling Rate Guide
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Polling rate (measured in Hz) is how often your mouse reports its position to your PC each second. A <strong>1000Hz</strong> mouse sends a position update every 1 millisecond. A <strong>125Hz</strong> mouse only reports every 8ms — that 7ms gap can mean the difference between landing a flick and whiffing it entirely.
              </p>
              <ul style={{ marginBottom: '1.5rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong style={{ color: '#fff' }}>125Hz:</strong> Outdated. Avoid for competitive play. Cursor movement feels sluggish.</li>
                <li><strong style={{ color: '#fff' }}>500Hz:</strong> Acceptable entry level. Noticeable improvement over 125Hz.</li>
                <li><strong style={{ color: '#fff' }}>1000Hz:</strong> Industry standard. Covers the needs of 99% of competitive players.</li>
                <li><strong style={{ color: '#fff' }}>4000–8000Hz:</strong> Ultra-high polling. Measurable benefit on 240Hz+ monitors. Requires CPU overhead consideration.</li>
              </ul>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                Unless you are competing professionally with a 240Hz or higher display, 1000Hz is the practical ceiling where additional Hz offers almost zero perceptible benefit for most players.
              </p>

              <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Best Mouse for FPS Gaming
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                The best FPS mouse has the following characteristics regardless of brand or price tag:
              </p>
              <ul style={{ marginBottom: '1.5rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong style={{ color: '#fff' }}>Zero hardware acceleration:</strong> Your sensor must track pixel-for-pixel at all movement speeds. This is non-negotiable. Check independent sensor reviews.</li>
                <li><strong style={{ color: '#fff' }}>Light weight (under 80g):</strong> Lighter mice reduce wrist fatigue during long sessions and enable faster flick movements.</li>
                <li><strong style={{ color: '#fff' }}>Ambidextrous or ergonomic shape:</strong> Whichever grip style fits your hand reduces strain and improves consistency. Claw grip suits fast-action players; palm grip suits precision riflers.</li>
                <li><strong style={{ color: '#fff' }}>Quality switches:</strong> Optical switches eliminate debounce delay entirely. Mechanical switches with shorter debounce times (&lt;1ms) are the next best option.</li>
                <li><strong style={{ color: '#fff' }}>Low-friction feet:</strong> PTFE feet allow smooth, consistent glide on mousepads of any texture, reducing the micro-corrections that destroy accuracy.</li>
              </ul>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                Use our Aim Trainer immediately after unboxing a new mouse. The first 10-second session will reveal any sensor anomalies — jitter, spin-outs, or acceleration curves — before you take it into a ranked match.
              </p>

              <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Daily Aim Training Routine
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                A structured daily routine produces compounding improvement. Here is a proven 20-minute warm-up protocol used by semi-professional players:
              </p>
              <ol style={{ marginBottom: '1.5rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong style={{ color: '#fff' }}>5 minutes — Tracking (Easy mode):</strong> Start slow. Re-establish the mind-muscle connection before pushing for speed. Focus on smooth mouse movement.</li>
                <li><strong style={{ color: '#fff' }}>5 minutes — Click Timing (Medium mode):</strong> Hit targets at a comfortable rhythm. Prioritize hit rate over raw speed. Aim for 80%+ accuracy.</li>
                <li><strong style={{ color: '#fff' }}>5 minutes — Speed Challenge (Hard/Impossible mode):</strong> Push your limits. Miss more — that is expected. This stretches your ceiling.</li>
                <li><strong style={{ color: '#fff' }}>5 minutes — In-game warm-up:</strong> Drop into a bot lobby or deathmatch. Apply what you trained. Notice how your crosshair feels more controlled.</li>
              </ol>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                After four weeks of this routine, review your session history scores. Most players see a 15–30% improvement in average accuracy within the first month of consistent training.
              </p>

              <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Common Aim Mistakes Beginners Make
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Understanding what <em>not</em> to do is just as valuable as knowing what to practice. Here are the seven most common aim mistakes and how to fix them:
              </p>
              <ul style={{ marginBottom: '2rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li><strong style={{ color: '#fff' }}>1. Gripping the mouse too hard:</strong> Tension in your hand destroys micro-accuracy. Hold the mouse firmly enough to control it — not so tight that your arm tenses up. A relaxed grip produces smoother, more consistent flicks.</li>
                <li><strong style={{ color: '#fff' }}>2. DPI too high:</strong> High DPI amplifies every tiny tremor in your hand. Most beginners mistake "my cursor moves faster" for "I will aim better." Slow down your sensitivity and use larger arm movements.</li>
                <li><strong style={{ color: '#fff' }}>3. Looking at the cursor instead of the target:</strong> Train your eyes to focus on the target location, not your crosshair position. Your hands will follow your eyes more naturally when you stop watching the cursor.</li>
                <li><strong style={{ color: '#fff' }}>4. Skipping warm-up:</strong> Cold muscles and unprimed neural pathways result in the first 5–10 minutes of play being your worst. Always warm up before ranked matches.</li>
                <li><strong style={{ color: '#fff' }}>5. Training at maximum speed immediately:</strong> Speed before accuracy is the number-one mistake. Build accuracy first to 80%+, then gradually increase speed. Practicing sloppy clicks at high speed teaches your muscle memory to be sloppy.</li>
                <li><strong style={{ color: '#fff' }}>6. Inconsistent mousepad surface:</strong> Dirty or worn mousepads introduce variable friction that corrupts your muscle memory. Clean your mousepad weekly.</li>
                <li><strong style={{ color: '#fff' }}>7. Ignoring the combo system:</strong> In this trainer, missing breaks your combo streak. Treat each miss as a learning event — identify whether it was a reaction miss, a positioning miss, or a speed miss.</li>
              </ul>

              <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                What is Flick Aim?
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                <strong>Flick aiming</strong> is the technique of rapidly snapping your crosshair from its current position to a new target in one explosive motion, usually followed by a shot or click. The entire flick often takes place in under 100 milliseconds — faster than a conscious thought.
              </p>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Flick aim is trained through <em>subconscious distance estimation</em>. Your brain learns to predict exactly how far to move the mouse to land on a target at a given distance through thousands of repetitions. This is why flick aim feels effortless to experienced players — it has been automated into motor cortex memory.
              </p>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                To train flick aim specifically: use <strong>Hard</strong> or <strong>Impossible</strong> difficulty in this trainer with a 30-second session. Focus on single explosive movements rather than hunting — see how quickly you can snap to each target the moment it appears.
              </p>

              <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                What is Tracking Aim?
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                <strong>Tracking aim</strong> is the ability to maintain your crosshair on a moving target over time — used in games where enemies strafe unpredictably. Unlike flick aim (burst targeting), tracking requires sustained smooth mouse control that matches the exact speed and direction of movement.
              </p>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                Tracking is most critical in battle royale games where enemies at mid-range are almost always moving. Players with strong tracking aim deal consistent damage during sprays, while poor trackers chip individual shots and whiff the follow-up. Train tracking aim with a dedicated tracking trainer, then use flick aim training (this tool) for snap-targeting practice.
              </p>

              <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Static Aim vs Dynamic Aim
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                <strong>Static aim</strong> refers to clicking a stationary target — the fundamental test of precision and response speed that this trainer measures. Static aim builds the foundation: if you cannot reliably click a still circle, clicking a moving player head is nearly impossible.
              </p>
              <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
                <strong>Dynamic aim</strong> involves both you and the target moving simultaneously — the real-game scenario. In practice, dynamic aim is static aim plus reaction time plus spatial awareness. The hierarchy is: master static first → add tracking → combine under pressure in real matches. Our Aim Trainer covers the static layer, the most trainable and transferable layer, with measurable results.
              </p>

              <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Does Aim Training Really Improve Gaming?
              </h2>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Research in motor learning and eSports performance science consistently shows that structured repetitive targeting tasks improve both the speed and accuracy of motor responses. A 2021 study published in the journal <em>Human Movement Science</em> found that targeted click-training significantly reduced average reaction time after just two weeks of daily 15-minute sessions.
              </p>
              <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
                Anecdotally, thousands of competitive FPS players report measurable rank improvements after adding aim training to their routine. The key factors that determine improvement:
              </p>
              <ul style={{ marginBottom: '2rem', color: '#9ca3af', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong style={{ color: '#fff' }}>Consistency beats intensity:</strong> Daily 15-minute sessions outperform occasional 2-hour grind sessions for long-term skill retention.</li>
                <li><strong style={{ color: '#fff' }}>Apply immediately in-game:</strong> Train → play competitive → train. The transfer from aim trainer to in-game performance is strongest when practice is immediately followed by application.</li>
                <li><strong style={{ color: '#fff' }}>Track progress objectively:</strong> Use the accuracy graph and session history in this trainer to confirm whether your average accuracy is trending upward. Emotion-based self-assessment is unreliable.</li>
                <li><strong style={{ color: '#fff' }}>Hardware matters at the ceiling:</strong> Once you reach 85%+ accuracy consistently, hardware limitations (monitor Hz, mouse polling rate) become the next bottleneck worth addressing.</li>
              </ul>

              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0.5rem' }}>
                Why Aim Matters in These Top Games
              </h3>
              <div
                className="aim-games-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}
              >
                {GAMES.map(game => (
                  <div
                    key={game}
                    style={{ background: 'rgba(0,0,0,0.4)', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '7px' }}
                  >
                    <span style={{ color: 'var(--neon-green)' }} aria-hidden="true">🎯</span>
                    {game}
                  </div>
                ))}
              </div>

              <div
                itemScope
                itemType="https://schema.org/FAQPage"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
              >
                <h2 style={{ fontWeight: '800', fontSize: '1.6rem', marginBottom: '0', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Pro FPS Strategies &amp; FAQs
                </h2>

                {FAQS.map(({ q, a }, i) => (
                  <div
                    key={i}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <h3
                      itemProp="name"
                      style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', marginTop: 0 }}
                    >
                      {q}
                    </h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p itemProp="text" style={{ color: '#9ca3af', margin: 0, lineHeight: '1.75' }}>{a}</p>
                    </div>
                  </div>
                ))}

                <div style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--neon-orange)', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.4rem 0' }}>
                    💡 Pro Tip: Warm Up Before Every Ranked Session
                  </h4>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem', lineHeight: '1.7' }}>
                    Use this Aim Trainer for 5–10 minutes before launching competitive matches. Start on Easy to wake up your muscle memory, finish on Hard to sharpen your reflexes. Low DPI (400–800) arm-aiming builds consistency; save wrist aiming for micro-adjustments only. Your first in-game kills will confirm the difference.
                  </p>
                </div>
              </div>

            </section>
          </article>

        </main>
      </div>
    </>
  );
}

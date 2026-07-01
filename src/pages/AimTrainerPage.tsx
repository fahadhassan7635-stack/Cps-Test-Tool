/**
 * AimTrainerPage.tsx - Production-ready with Graph Removed, Targeted Fullscreen & Massive SEO
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
    label: 'Easy', color: 'var(--neon-green, #10b981)', scoreMultiplier: 1,
  },
  Medium: {
    minSize: 40, maxSize: 70, spawnInterval: 800,
    targetLifetime: 2000, maxTargets: 5,
    label: 'Medium', color: 'var(--neon-cyan, #00f5ff)', scoreMultiplier: 2,
  },
  Hard: {
    minSize: 25, maxSize: 50, spawnInterval: 500,
    targetLifetime: 1200, maxTargets: 7,
    label: 'Hard', color: 'var(--neon-orange, #f97316)', scoreMultiplier: 3,
  },
  Impossible: {
    minSize: 15, maxSize: 35, spawnInterval: 280,
    targetLifetime: 700, maxTargets: 10,
    label: 'Impossible', color: 'var(--neon-red, #ff2d55)', scoreMultiplier: 5,
  },
};

// ─── Duration Options ─────────────────────────────────────────────────────────
const DURATION_OPTIONS = [10, 30, 60, 120] as const;
type Duration = typeof DURATION_OPTIONS[number];
const DEFAULT_DURATION: Duration = 30;

// ─── Grade System ─────────────────────────────────────────────────────────────
type Grade = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

function calcGrade(acc: number, avgReaction: number, hitsPerSec: number): Grade {
  const accScore      = acc;
  const reactionScore = avgReaction === 0 ? 100 : Math.max(0, 100 - (avgReaction - 150) / 5);
  const hpsScore      = Math.min(100, hitsPerSec * 20);
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
  spawnTime: number;
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
  duration: number;
  totalTime: number;
  difficulty: Difficulty;
}

type Phase = 'idle' | 'running' | 'paused' | 'done';

// ─── Sound Engine ─────────────────────────────────────────────────────────────
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

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
const JSON_LD_APP = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Aim Trainer — Free Online Aim Training & Mouse Accuracy Test',
  description:
    'Free online aim trainer. Improve mouse accuracy, flick speed, and reaction time for FPS games like CS2, Valorant, Fortnite, and more.',
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
    'Fullscreen mode',
  ],
});

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

function SeoMeta() {
  useEffect(() => {
    const CANONICAL = 'https://yoursite.com/aim-trainer';
    const TITLE     = 'Aim Trainer – Free Online Aim Training & Mouse Accuracy Test';
    const DESC      =
      'Train your aim for free. Improve mouse accuracy, reaction time, and flick speed with our browser-based aim trainer. Track combos and performance grades. No download needed.';
    const OG_IMAGE  = 'https://yoursite.com/og-aim-trainer.png';

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
      setMeta('meta[name="description"]',         'name="description"',          DESC),
      setMeta('meta[name="robots"]',              'name="robots"',               'index, follow'),
      setMeta('meta[name="theme-color"]',         'name="theme-color"',          '#0a0a0f'),
      setMeta('meta[property="og:type"]',         'property="og:type"',          'website'),
      setMeta('meta[property="og:title"]',        'property="og:title"',         TITLE),
      setMeta('meta[property="og:description"]',  'property="og:description"',   DESC),
      setMeta('meta[property="og:image"]',        'property="og:image"',         OG_IMAGE),
      setMeta('meta[property="og:url"]',          'property="og:url"',           CANONICAL),
      setMeta('meta[property="og:site_name"]',    'property="og:site_name"',     'Aim Trainer'),
      setMeta('meta[name="twitter:card"]',        'name="twitter:card"',         'summary_large_image'),
      setMeta('meta[name="twitter:title"]',       'name="twitter:title"',        TITLE),
      setMeta('meta[name="twitter:description"]', 'name="twitter:description"',  DESC),
      setMeta('meta[name="twitter:image"]',       'name="twitter:image"',        OG_IMAGE),
      setLink('canonical',                        CANONICAL),
    ];

    return () => {
      document.title = prevTitle;
      cleanups.forEach(fn => fn());
    };
  }, []);
  return null;
}

// ─── Cross-Browser Fullscreen ─────────────────────────────────────────────────
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
    if (e.requestFullscreen)            await e.requestFullscreen();
    else if (e.webkitRequestFullscreen) await e.webkitRequestFullscreen();
    else if (e.mozRequestFullScreen)    await e.mozRequestFullScreen();
    else if (e.msRequestFullscreen)     await e.msRequestFullscreen();
  } catch { /* ignore */ }
}

async function exitFs(): Promise<void> {
  const d = document as FsDocument;
  try {
    if (document.exitFullscreen)        await document.exitFullscreen();
    else if (d.webkitExitFullscreen)    await d.webkitExitFullscreen();
    else if (d.mozCancelFullScreen)     await d.mozCancelFullScreen();
    else if (d.msExitFullscreen)        await d.msExitFullscreen();
  } catch { /* ignore */ }
}

const FS_CHANGE_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

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

// ─── Results Modal ────────────────────────────────────────────────────────────
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

  useEffect(() => {
    try { closeBtnRef.current?.focus(); } catch { /* ignore */ }

    const handler = (e: KeyboardEvent) => {
      try {
        if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
        if (e.key !== 'Tab') return;
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      } catch { /* never crash */ }
    };

    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!result) return null;

  const safeClose           = () => { try { onClose();            } catch { /* noop */ } };
  const safePlayAgain       = () => { try { onPlayAgain();        } catch { /* noop */ } };
  const safeChangeDifficulty= () => { try { onChangeDifficulty(); } catch { /* noop */ } };

  const topStats = [
    { value: `${result.acc ?? 0}%`,      label: 'Accuracy' },
    { value: result.score ?? 0,          label: 'Hits'     },
    { value: `${result.duration ?? 0}s`, label: 'Duration' },
  ];

  const extStats = [
    { value: result.score ?? 0,                                                  label: 'Correct',   color: 'var(--neon-green, #10b981)' },
    { value: result.misses ?? 0,                                                 label: 'Incorrect', color: 'var(--neon-red, #ff2d55)'   },
    { value: (result.avgReaction ?? 0) > 0 ? `${result.avgReaction}ms` : 'N/A', label: 'Reaction',  color: 'var(--neon-orange, #f97316)' },
    { value: `×${result.combo ?? 0}`,                                            label: 'Combo',     color: 'var(--text-secondary, #94a3b8)' },
  ];

  const gradeColors: Record<Grade, string> = {
    'S+': '#FFD700', 'S': 'var(--neon-cyan,#00f5ff)', 'A': 'var(--neon-orange,#f97316)',
    'B': '#a855f7',  'C': 'var(--neon-green,#10b981)', 'D': 'var(--text-secondary,#94a3b8)',
  };
  const finalRatingColor = gradeColors[result.grade] ?? 'var(--neon-cyan,#00f5ff)';

  return (
    <>
      <div onClick={safeClose} aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards' }} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aim-results-title"
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '380px', background: 'linear-gradient(135deg,rgba(0,245,255,0.08),rgba(0,255,136,0.08))', border: '2px solid rgba(0,245,255,0.3)', borderRadius: '20px', padding: '1.5rem 0.75rem 0.75rem', textAlign: 'center', zIndex: 1000, animation: 'modalPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(0,245,255,0.2),0 0 120px rgba(0,255,136,0.1)' }}
      >
        <button ref={closeBtnRef} onClick={safeClose} aria-label="Close results" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--neon-cyan)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>{result.difficulty ?? ''} · Your Result</div>
        <div id="aim-results-title" style={{ fontSize: 'clamp(1.9rem,5.5vw,3rem)', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', marginBottom: '0.05rem' }}>
          {result.score ?? 0}{' '}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>HITS</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.85rem', borderRadius: '50px', background: `${finalRatingColor}20`, border: `2px solid ${finalRatingColor}50`, color: finalRatingColor, fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.45rem' }}>
          Grade {result.grade ?? '-'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.2rem', marginBottom: '0.35rem' }}>
          {topStats.map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '0.3rem', border: '1px solid rgba(0,245,255,0.2)' }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
              <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.04rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.2rem', marginBottom: '0.45rem' }}>
          {extStats.map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '0.3rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.42rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={safeChangeDifficulty} style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>🔄 Reset</button>
          <button className="btn btn-primary"   onClick={safePlayAgain}        style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>Try Again</button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes modalPopIn{ from{opacity:0;transform:translate(-50%,-50%) scale(0.5)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </>
  );
});

// ─── Inline Results Panel ─────────────────────────────────────────────────────
const ResultsPanel = memo(function ResultsPanel({
  result,
  onPlayAgain,
  onReset,
}: {
  result: SessionResult | null;
  onPlayAgain: () => void;
  onReset: () => void;
}) {
  if (!result) return null;

  const stats = [
    { label: 'Hits',         value: result.score ?? 0,                                                  color: 'var(--neon-green)'  },
    { label: 'Misses',       value: result.misses ?? 0,                                                 color: 'var(--neon-red)'    },
    { label: 'Accuracy',     value: `${result.acc ?? 0}%`,                                              color: 'var(--neon-cyan)'   },
    { label: 'Avg Reaction', value: (result.avgReaction ?? 0) > 0 ? `${result.avgReaction}ms` : 'N/A', color: 'var(--neon-orange)' },
    { label: 'Targets/sec',  value: (result.hitsPerSec ?? 0).toFixed(2),                               color: 'var(--neon-cyan)'   },
    { label: 'Best Combo',   value: `×${result.combo ?? 0}`,                                            color: '#FFD700'             },
    { label: 'Miss %',       value: `${result.missPct ?? 0}%`,                                          color: 'var(--neon-red)'    },
  ];

  return (
    <section aria-label="Game results" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', animation: 'fadeSlideIn 0.4s ease forwards' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '0.5rem' }}>
          Session Complete — {result.difficulty ?? ''} · {result.duration ?? 0}s
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0 0 1rem 0' }}>🏁 Time&apos;s Up!</h2>
        <GradeBadge grade={result.grade ?? 'D'} />
      </div>
      <div className="aim-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }} role="list" aria-label="Performance statistics">
        {stats.map(s => (
          <div key={s.label} role="listitem" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.9rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary"   onClick={() => { try { onPlayAgain(); } catch { /* noop */ } }} aria-label="Play again">▶ Play Again</button>
        <button className="btn btn-secondary" onClick={() => { try { onReset();     } catch { /* noop */ } }} aria-label="Reset">🔄 Reset</button>
      </div>
    </section>
  );
});

// ─── Individual Target ────────────────────────────────────────────────────────
const TargetEl = memo(function TargetEl({
  target, isHit, onHit,
}: {
  target: Target; isHit: boolean; onHit: (id: number, e: React.PointerEvent) => void;
}) {
  return (
    <div
      onPointerDown={e => onHit(target.id, e)}
      role="button" tabIndex={-1} aria-label="Target — click to hit"
      style={{
        position: 'absolute', left: target.x, top: target.y,
        width: target.size, height: target.size, borderRadius: '50%',
        transform: 'translate(-50%,-50%)', cursor: 'crosshair', touchAction: 'none',
        background: isHit
          ? 'radial-gradient(circle,rgba(255,255,255,0.95) 18%,rgba(255,200,0,0.9) 38%,transparent 38%,transparent 58%,rgba(255,200,0,0.9) 58%)'
          : 'radial-gradient(circle,rgba(255,255,255,0.9) 18%,rgba(255,45,85,0.95) 38%,transparent 38%,transparent 58%,rgba(255,45,85,0.85) 58%)',
        border: `3px solid ${isHit ? 'rgba(255,220,0,0.9)' : 'rgba(255,255,255,0.85)'}`,
        boxShadow: isHit ? '0 0 25px rgba(255,220,0,0.8),0 0 50px rgba(255,220,0,0.4)' : '0 0 20px rgba(255,45,85,0.55)',
        animation: isHit ? 'target-hit 0.12s ease-out forwards' : 'target-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards',
        willChange: 'transform, opacity', userSelect: 'none', WebkitUserSelect: 'none',
      }}
    />
  );
});

// ─── Combo Banner ─────────────────────────────────────────────────────────────
const ComboBanner = memo(function ComboBanner({ combo, milestone }: { combo: number; milestone: boolean }) {
  if (combo < 2) return null;
  const isFire = combo >= 20;
  const isGold = combo >= 10;
  const color  = isFire ? '#FF6B00' : isGold ? '#FFD700' : 'var(--neon-cyan)';
  const label  = isFire ? '🔥 ON FIRE!' : isGold ? '⭐ COMBO!' : '✨ Streak';
  return (
    <div aria-live="polite" aria-atomic="true" aria-label={`Combo streak: ${combo}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0,0,0,0.55)', border: `1.5px solid ${color}`, color, fontWeight: '900', fontSize: '0.85rem', animation: milestone ? 'comboMilestone 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none', boxShadow: milestone ? `0 0 20px ${color}55` : 'none', transition: 'color 0.2s,border-color 0.2s' }}>
      <span>{label}</span>
      <span style={{ fontSize: '1rem' }}>×{combo}</span>
    </div>
  );
});

// ─── Shortcut Hints ───────────────────────────────────────────────────────────
const ShortcutHints = memo(function ShortcutHints({ phase }: { phase: Phase }) {
  const hints =
    phase === 'idle'    ? [{ key: 'Space', action: 'Start' },  { key: 'R', action: 'Reset' }] :
    phase === 'running' ? [{ key: 'Esc',   action: 'Pause' },  { key: 'R', action: 'Reset' }] :
    phase === 'paused'  ? [{ key: 'Esc',   action: 'Resume' }, { key: 'R', action: 'Reset' }] :
                          [{ key: 'Space', action: 'Play Again' }, { key: 'Esc', action: 'Close popup' }, { key: 'R', action: 'Reset' }];
  return (
    <div aria-label="Keyboard shortcuts" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
      {hints.map(h => (
        <div key={h.key + h.action} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <kbd style={{ padding: '2px 7px', borderRadius: '5px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.75rem', color: '#fff', boxShadow: '0 1px 0 rgba(255,255,255,0.1)' }}>{h.key}</kbd>
          <span>{h.action}</span>
        </div>
      ))}
    </div>
  );
});

// ─── FAQ & Games Data ─────────────────────────────────────────────────────────
const ALL_FAQS = [
  { q: 'What is an Aim Trainer and how does it help?', a: 'An Aim Trainer is a browser-based or standalone tool designed to isolate your mechanical mouse skills. By rapidly clicking randomly spawned targets, you build the critical hand-eye neural pathways needed for tracking, flicking, and reaction speed in competitive FPS games.' },
  { q: 'How to improve reaction time in FPS games?', a: "Train your brain's cognitive processing with daily aim sessions. Pair practice with a high-refresh monitor (144Hz+) and a low-latency mouse to physically reduce input lag. Focus on reading target spawn positions rather than reacting after they appear. Consistent sleep, hydration, and warm-up routines also measurably improve reaction time." },
  { q: 'Does aim training help in Minecraft, Roblox, or League of Legends?', a: 'Yes. In Minecraft, tracking a strafing player while landing hits separates PvP masters from average players. In League of Legends, precise clicking prevents misclicks during team fights. In Roblox and Fortnite, fast accurate crosshair placement speeds up mechanical execution significantly.' },
  { q: 'What is the difference between arm aiming and wrist aiming?', a: 'Arm aiming (low DPI, large mouse movements) is better for large flicks and long-term wrist health. Wrist aiming (higher DPI, small movements) suits micro-adjustments. Most pro players use low DPI (400–800) and arm-aim for consistency.' },
  { q: 'What does polling rate mean for a gaming mouse?', a: 'Polling rate (Hz) is how often your mouse reports its position to the PC per second. A 1000Hz mouse reports every 1ms; a 125Hz mouse every 8ms. Higher polling rates (1000Hz+) result in smoother, more responsive cursor movement — critical in fast-paced FPS games.' },
  { q: 'How long should I aim train per day?', a: 'Research and pro player routines suggest 15–30 minutes of focused aim training before gaming sessions is optimal. Beyond 45 minutes, diminishing returns and mental fatigue can reduce accuracy gains. Quality and focus matter more than raw time.' },
  { q: 'What is eDPI and why does it matter more than raw DPI?', a: 'eDPI (effective DPI) = hardware DPI × in-game sensitivity multiplier. Two players with completely different hardware setups have identical crosshair movement if their eDPI matches. This makes eDPI the universal comparison metric across games and hardware.' },
  { q: 'What is the best mouse grip for aim training?', a: 'There are three main grips: Palm (stable, good for tracking), Claw (balanced, good for quick flicks), and Fingertip (highest micro-precision). Choose the one that feels most natural to you. Changing your grip requires rebuilding muscle memory.' },
  { q: 'Tracking vs. Flicking: Which is more important?', a: 'Flicking is crucial for games like Valorant and CS2 where time-to-kill is instant. Tracking dominates in games like Apex Legends, Overwatch, and Fortnite. A well-rounded aim routine trains both.' },
  { q: 'Does mouse weight affect aiming performance?', a: 'Yes. Lightweight mice (under 70g) reduce inertia, making it easier to start and stop movements quickly. This is ideal for fast flicks and reduces wrist fatigue during long sessions.' },
  { q: 'Can aim training help reduce spray transfer and recoil control?', a: 'Directly — yes. Recoil control requires continuously correcting your crosshair downward against weapon rise, which is a tracking sub-skill. Click-accuracy training sharpens the hand-eye feedback loop so corrections become faster.' },
  { q: 'Does playing osu! help with FPS aim?', a: 'While osu! improves raw hand-eye coordination and clicking speed, it operates on a 2D plane. True 3D aim requires translation of 3D space to a 2D mousepad. Standard aim trainers are much better for transferring skills directly to FPS games.' },
  { q: 'What is angle snapping?', a: 'Angle snapping is a mouse sensor feature that artificially straightens your mouse movements. While it makes drawing horizontal lines easier, it destroys micro-adjustments in gaming. Always ensure angle snapping is turned OFF.' },
  { q: 'Glass skates vs PTFE mouse feet?', a: 'PTFE (Teflon) is the standard, offering a good balance of glide and stopping power. Glass skates provide extreme speed and zero initial friction, which is amazing for tracking but makes it harder to stop your mouse accurately for flicks.' },
  { q: 'Hard pad vs cloth pad?', a: 'Hard pads offer low friction for fast tracking, but wear out mouse skates quickly. Cloth pads offer much better stopping power and control, which is why 95% of tactical FPS pros (CS2, Valorant) use high-quality cloth pads.' },
  { q: 'How long does muscle memory take to build?', a: 'Initial neurological adaptation happens within 3-4 days of consistent practice. Solidifying that into automatic muscle memory takes about 3 to 6 weeks of daily deliberate aim training.' },
  { q: 'How do I stop panicking in gunfights?', a: 'Panic comes from a lack of confidence in your mechanics. By grinding an aim trainer daily, aiming becomes an unconscious background process, allowing your brain to focus calmly on positioning and game sense instead.' },
  { q: 'Is 1000Hz polling rate enough?', a: 'Yes. 1000Hz (1ms delay) is the industry standard and perfect for 99% of players. While 4000Hz and 8000Hz mice exist, the benefit is only noticeable on 240Hz+ monitors and strains your CPU.' },
  { q: 'What is aim assist and does this help controller players?', a: 'Aim assist is a software feature that slows down or magnetically pulls a crosshair toward enemies to compensate for the inaccuracy of analog sticks. This tool is specifically for mouse and keyboard players to train raw, unassisted mechanical aim.' },
  { q: 'Can I use this aim trainer on a trackpad?', a: 'You can, but it is highly discouraged for gaming improvement. Trackpads do not translate well to the 1:1 raw input mechanics needed for FPS games. Always use a dedicated gaming mouse.' },
  { q: 'How does fatigue affect reaction time?', a: 'Physical and mental fatigue drastically increase reaction time (by up to 50-100ms) and lower accuracy. If you notice your Aim Trainer scores dropping significantly after an hour, it is time to take a break.' },
  { q: 'Do pros use aim trainers?', a: 'Absolutely. Almost every professional player in Valorant, Overwatch, and Apex Legends uses dedicated aim training software as a daily warm-up to ensure their mechanics are peaked before tournament matches.' },
  { q: 'What is target switching?', a: 'Target switching is the ability to kill one enemy and immediately snap onto a secondary target seamlessly. Our trainer simulates this when multiple targets are on screen, forcing you to plan your next click before the first one finishes.' },
  { q: 'Why is my aim inconsistent?', a: 'Inconsistency usually stems from changing your posture, grip, chair height, or playing while tired. Find a comfortable, repeatable setup, stick to one sensitivity, and use our Aim Trainer to track your baseline performance daily.' }
] as const;

const GAMES = [
  'Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V',
  'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2',
  'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us',
  'Valorant', 'Apex Legends',
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AimTrainerPage() {
  // ── Config State ───────────────────────────────────────────────────────────
  const [difficulty,   setDifficulty]   = useState<Difficulty>('Medium');
  const [gameDuration, setGameDuration] = useState<Duration>(DEFAULT_DURATION);

  // ── Runtime State ──────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState<Phase>('idle');
  const [targets,    setTargets]    = useState<Target[]>([]);
  const [score,      setScore]      = useState(0);
  const [misses,     setMisses]     = useState(0);
  const [timeLeft,   setTimeLeft]   = useState<number>(DEFAULT_DURATION);
  const [hitIds,     setHitIds]     = useState<Set<number>>(new Set());
  const [combo,      setCombo]      = useState(0);
  const [milestone,  setMilestone]  = useState(false);
  const [soundOn,    setSoundOn]    = useState(true);

  // ── Fullscreen State ───────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsSupported]  = useState<boolean>(() =>
    typeof document !== 'undefined' ? isFullscreenSupported() : false,
  );
  const [exitFsOnEnd, setExitFsOnEnd] = useState(false);

  // ── Results State ──────────────────────────────────────────────────────────
  const [result,     setResult]     = useState<SessionResult | null>(null);
  const [history,    setHistory]    = useState<SessionResult[]>([]);
  const [showModal,  setShowModal]  = useState(false);

  // ── Countdown State ────────────────────────────────────────────────────────
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const fullscreenTargetRef = useRef<HTMLDivElement>(null);
  const areaRef          = useRef<HTMLDivElement>(null);
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
  const startTimeRef     = useRef(0);
  const pausedAtRef      = useRef(0);
  const exitFsOnEndRef   = useRef(false);

  useEffect(() => { soundOnRef.current    = soundOn;    }, [soundOn]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { exitFsOnEndRef.current = exitFsOnEnd; }, [exitFsOnEnd]);
  useEffect(() => {
    gameDurationRef.current = gameDuration;
    if (phaseRef.current === 'idle') setTimeLeft(gameDuration);
  }, [gameDuration]);

  // ── Audio ──────────────────────────────────────────────────────────────────
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
      if (type === 'hit')        playHit(ctx);
      else if (type === 'miss')  playMiss(ctx);
      else                       playCombo(ctx, comboLevel);
    } catch { /* ignore */ }
  }, [getAudioCtx]);

  // ── Fullscreen Targeted ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!fsSupported) return;
    const el = fullscreenTargetRef.current;
    if (!el) return;
    if (getFullscreenElement()) void exitFs();
    else                        void requestFs(el);
  }, [fsSupported]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!getFullscreenElement());
    FS_CHANGE_EVENTS.forEach(evt => document.addEventListener(evt, handler));
    handler();
    return () => { FS_CHANGE_EVENTS.forEach(evt => document.removeEventListener(evt, handler)); };
  }, []);

  // ── Touch scroll prevention ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'running') return;
    const prevent = (e: TouchEvent) => { e.preventDefault(); };
    const area = areaRef.current;
    area?.addEventListener('touchmove',  prevent, { passive: false });
    area?.addEventListener('touchstart', prevent, { passive: false });
    return () => {
      area?.removeEventListener('touchmove',  prevent);
      area?.removeEventListener('touchstart', prevent);
    };
  }, [phase]);

  // ── Unmount cleanup ────────────────────────────────────────────────────────
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
    const totalTime = Math.min(configuredDuration, Math.max(0.01, (performance.now() - startTimeRef.current) / 1000));
    const totalAttempts = totalClicks.current;
    const acc       = totalAttempts > 0 ? Math.round((hitClicks.current / totalAttempts) * 100) : 0;
    const missCount = Math.max(0, totalAttempts - hitClicks.current);
    const missPct   = totalAttempts > 0 ? Math.round((missCount / totalAttempts) * 100) : 0;
    const avgReaction = reactionTimes.current.length > 0
      ? Math.round(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length) : 0;
    const hitsPerSec = totalTime > 0 ? hitClicks.current / totalTime : 0;
    const grade      = calcGrade(acc, avgReaction, hitsPerSec);

    const r: SessionResult = { score: hitClicks.current, misses: missCount, acc, missPct, avgReaction, hitsPerSec, combo: maxComboRef.current, grade, duration: configuredDuration, totalTime, difficulty: difficultyRef.current };
    setResult(r);
    setHistory(prev => [r, ...prev.slice(0, MAX_HISTORY - 1)]);
    setShowModal(true);

    if (exitFsOnEndRef.current && getFullscreenElement()) void exitFs();
  }, []);

  // ── Start Game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';
    const dur = gameDurationRef.current;
    setPhase('running'); setScore(0); setMisses(0); setTimeLeft(dur); setTargets([]);
    setHitIds(new Set()); setCombo(0); setMilestone(false); setResult(null);
    setShowModal(false);
    totalClicks.current = 0; hitClicks.current = 0; targetId.current = 0;
    lastClickTime.current = 0; comboRef.current = 0; maxComboRef.current = 0;
    reactionTimes.current = [];
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
      if (left <= 0) endGame();
    }, 50);
  }, [spawnTarget, endGame]);

  // ── Countdown ──────────────────────────────────────────────────────────────
  const beginCountdown = useCallback(() => {
    try {
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
            setCountdownNum(0);
            countdownTimeoutRef.current = setTimeout(() => {
              countdownTimeoutRef.current = null;
              setCountdownNum(null);
              startGame();
            }, 500);
          }
        } catch {
          countdownTimeoutRef.current = null;
          setCountdownNum(null);
          startGame();
        }
      };
      countdownTimeoutRef.current = setTimeout(tick, 700);
    } catch {
      countdownTimeoutRef.current = null;
      setCountdownNum(null);
      startGame();
    }
  }, [startGame]);

  // ── Pause / Resume ─────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (phaseRef.current === 'running') {
      phaseRef.current = 'paused'; setPhase('paused');
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
      setTimeLeft(prev => { pausedAtRef.current = prev; return prev; });
    } else if (phaseRef.current === 'paused') {
      phaseRef.current = 'running'; setPhase('running');
      spawnRef.current = setInterval(spawnTarget, DIFFICULTY_CONFIGS[difficultyRef.current].spawnInterval);
      const resumeLeft = pausedAtRef.current;
      const start      = performance.now();
      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - start) / 1000;
        const left    = Math.max(0, resumeLeft - elapsed);
        setTimeLeft(left);
        if (left <= 0) endGame();
      }, 50);
    }
  }, [spawnTarget, endGame]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    if (countdownTimeoutRef.current) { clearTimeout(countdownTimeoutRef.current); countdownTimeoutRef.current = null; }
    setCountdownNum(null);
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setPhase('idle'); setScore(0); setMisses(0); setTimeLeft(gameDurationRef.current);
    setTargets([]); setHitIds(new Set()); setCombo(0); setMilestone(false);
    setResult(null); setShowModal(false);
    totalClicks.current = 0; hitClicks.current = 0; lastClickTime.current = 0;
    comboRef.current = 0; maxComboRef.current = 0;
    reactionTimes.current = [];
  }, []);

  const changeDuration   = useCallback((d: Duration) => {
    if (phaseRef.current === 'running' || phaseRef.current === 'paused') return;
    setGameDuration(d); gameDurationRef.current = d; setTimeLeft(d);
  }, []);

  const changeDifficulty = useCallback((d: Difficulty) => {
    if (phaseRef.current === 'running' || phaseRef.current === 'paused') return;
    setDifficulty(d); difficultyRef.current = d;
  }, []);

  const closeModal              = useCallback(() => setShowModal(false), []);
  const openDifficultyFromModal = useCallback(() => { setShowModal(false); resetGame(); }, [resetGame]);

  // ── Hit Target ─────────────────────────────────────────────────────────────
  const hitTarget = useCallback((id: number, e: React.PointerEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;
    const now = performance.now();
    if (now - lastClickTime.current < CLICK_RATE_MS) return;
    lastClickTime.current = now;

    setTargets(prev => {
      const t = prev.find(x => x.id === id);
      if (t) reactionTimes.current = [...reactionTimes.current, Math.round(now - t.spawnTime)];
      return prev;
    });

    const timeout = targetTimeouts.current.get(id);
    if (timeout) { clearTimeout(timeout); targetTimeouts.current.delete(id); }
    setHitIds(prev => new Set(prev).add(id));
    setTimeout(() => removeTarget(id), 120);
    setScore(prev => prev + 1);
    hitClicks.current++; totalClicks.current++;

    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    if (newCombo > maxComboRef.current) maxComboRef.current = newCombo;
    setCombo(newCombo);

    const isMilestone = newCombo === 10 || newCombo === 20 || newCombo % 25 === 0;
    if (isMilestone) {
      setMilestone(true); emitSound('combo', newCombo);
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
    comboRef.current = 0; setCombo(0); emitSound('miss');
  }, [emitSound]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
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
        if (countdownTimeoutRef.current) return;
        if (phaseRef.current === 'idle') beginCountdown();
        else if (phaseRef.current === 'done') { setShowModal(false); beginCountdown(); }
      }
      if (e.code === 'KeyR')   { e.preventDefault(); resetGame(); }
      if (e.code === 'Escape') {
        e.preventDefault();
        if (showModal) setShowModal(false);
        else if (phaseRef.current === 'running' || phaseRef.current === 'paused') togglePause();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [startGame, beginCountdown, resetGame, togglePause, isTypingTarget, showModal]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const acc = useMemo(
    () => totalClicks.current > 0 ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100,
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
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
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

        /* ════════════════════════════════════════════════════════════
           MAIN CONTAINER
        ════════════════════════════════════════════════════════════ */
        .aim-main-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ════════════════════════════════════════════════════════════
           TARGETED FULLSCREEN STYLES
        ════════════════════════════════════════════════════════════ */
        :fullscreen .fullscreen-target,
        :-webkit-full-screen .fullscreen-target,
        :-moz-full-screen .fullscreen-target {
          display: flex !important;
          flex-direction: column !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          padding: 1rem !important;
          margin: 0 !important;
          background: var(--bg-color, #0a0a0f) !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        :fullscreen .aim-game-area,
        :-webkit-full-screen .aim-game-area,
        :-moz-full-screen .aim-game-area {
          flex: 1 1 auto !important;
          height: 100% !important;
          margin-bottom: 0 !important;
        }

        /* FULLSCREEN: Compact Stats UI */
        :fullscreen .aim-stats-grid,
        :-webkit-full-screen .aim-stats-grid {
          margin-bottom: 0.5rem !important;
        }
        
        /* ════════════════════════════════════════════════════════════
           BUTTON STYLES & MEDIA QUERIES
        ════════════════════════════════════════════════════════════ */
        .aim-fullscreen-btn:hover  { background: rgba(255,255,255,0.1) !important; }
        .aim-fullscreen-btn:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
        .aim-difficulty-btn:focus-visible,
        .aim-duration-btn:focus-visible,
        .aim-sound-btn:focus-visible { outline: 2px solid var(--neon-cyan); outline-offset: 2px; }

        @media (max-width: 640px) {
          .aim-stats-grid    { grid-template-columns: repeat(2,1fr) !important; gap: 0.6rem !important; }
          .aim-controls      { flex-direction: column !important; align-items: stretch !important; }
          .aim-controls .btn { width: 100% !important; text-align: center !important; min-height: 44px; }
          .aim-settings-row  { flex-direction: column !important; gap: 0.75rem !important; }
          .aim-games-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .aim-article-wrap  { padding: 1.25rem !important; }
          .aim-results-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .aim-difficulty-btn,.aim-duration-btn,.aim-sound-btn,.aim-fullscreen-btn { min-height: 40px; }
        }
        @media (max-width: 380px) { .aim-stats-grid { gap: 0.4rem !important; } }
        *:focus-visible { outline: 2px solid var(--neon-cyan); outline-offset: 2px; }
      `}</style>

      <main className="aim-main-container" role="main" aria-label="Aim Trainer">
        
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="aim-fs-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="section-label">Aim Tool</div>
          <h1 className="tool-title">Aim Trainer</h1>
          <p className="tool-subtitle">
            Click targets as fast and accurately as possible — track your accuracy, combos, and grade
          </p>
        </header>

        {/* ── Settings Row ──────────────────────────────────────────── */}
        <div
          className="aim-settings-row"
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}
        >
          {/* Difficulty */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }} aria-label="Select difficulty">
            <legend style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>Difficulty</legend>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(d => (
                <button
                  key={d} className="aim-difficulty-btn"
                  onClick={() => changeDifficulty(d)}
                  disabled={phase === 'running' || phase === 'paused'}
                  aria-pressed={difficulty === d} aria-label={`Difficulty: ${d}`}
                  style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', border: `1.5px solid ${difficulty === d ? DIFFICULTY_CONFIGS[d].color : 'var(--border)'}`, background: difficulty === d ? `${DIFFICULTY_CONFIGS[d].color}22` : 'var(--bg-card)', color: difficulty === d ? DIFFICULTY_CONFIGS[d].color : 'var(--text-muted)', cursor: phase === 'running' || phase === 'paused' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: phase === 'running' || phase === 'paused' ? 0.5 : 1 }}
                >{d}</button>
              ))}
            </div>
          </fieldset>

          {/* Duration */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }} aria-label="Select game duration">
            <legend style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>Duration</legend>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d} className="aim-duration-btn"
                  onClick={() => changeDuration(d)}
                  disabled={phase === 'running' || phase === 'paused'}
                  aria-pressed={gameDuration === d} aria-label={`${d} seconds`}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', border: `1.5px solid ${gameDuration === d ? 'var(--neon-cyan)' : 'var(--border)'}`, background: gameDuration === d ? 'rgba(0,245,255,0.12)' : 'var(--bg-card)', color: gameDuration === d ? 'var(--neon-cyan)' : 'var(--text-muted)', cursor: phase === 'running' || phase === 'paused' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: phase === 'running' || phase === 'paused' ? 0.5 : 1 }}
                >{d}s</button>
              ))}
            </div>
          </fieldset>

          {/* Sound + Fullscreen Control */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <button
              className="aim-sound-btn"
              onClick={() => setSoundOn(v => !v)}
              aria-pressed={soundOn} aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to unmute'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: soundOn ? '1px solid var(--neon-cyan)' : '1px solid var(--border)', background: soundOn ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)', color: soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
              <span>{soundOn ? 'ON' : 'OFF'}</span>
            </button>

            <button
              className="aim-sound-btn"
              onClick={() => setExitFsOnEnd(v => !v)}
              aria-pressed={exitFsOnEnd} aria-label="Toggle exit fullscreen automatically when game ends"
              title="Exit fullscreen automatically when the game ends"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: exitFsOnEnd ? '1px solid var(--neon-orange)' : '1px solid var(--border)', background: exitFsOnEnd ? 'rgba(255,107,0,0.1)' : 'var(--bg-card)', color: exitFsOnEnd ? 'var(--neon-orange)' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              Auto-exit FS: {exitFsOnEnd ? 'ON' : 'OFF'}
            </button>

            <button
              className="aim-fullscreen-btn"
              onClick={toggleFullscreen}
              disabled={!fsSupported}
              aria-pressed={isFullscreen}
              aria-label={!fsSupported ? 'Fullscreen not supported in this browser' : isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={!fsSupported ? 'Fullscreen not supported in this browser' : isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: `1px solid ${isFullscreen ? 'var(--neon-cyan)' : 'var(--border)'}`, background: isFullscreen ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)', color: isFullscreen ? 'var(--neon-cyan)' : 'var(--text-muted)', fontSize: '1rem', cursor: fsSupported ? 'pointer' : 'not-allowed', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span aria-hidden="true">⛶</span>
              <span style={{ fontSize: '0.75rem' }}>{!fsSupported ? 'Unsupported' : isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* ── Targeted Fullscreen Wrapper (Stats + Game) ────────────── */}
        <div ref={fullscreenTargetRef} className="fullscreen-target">
          
          {/* Stats Cards */}
          <div
            className="aim-stats-grid"
            role="status" aria-live="polite" aria-atomic="true"
            aria-label={`Hits: ${score}, Misses: ${misses}, Accuracy: ${acc}%, Time left: ${timeLeft.toFixed(1)} seconds, Combo: ${combo}`}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}
          >
            {[
              { value: score,               label: 'Hits',     color: 'var(--neon-green)'  },
              { value: misses,              label: 'Misses',   color: 'var(--neon-red)'    },
              { value: `${acc}%`,           label: 'Accuracy', color: 'var(--neon-cyan)'   },
              { value: timeLeft.toFixed(1), label: 'Seconds',  color: 'var(--neon-orange)' },
              { value: `×${combo}`,         label: 'Combo',    color: '#FFD700'             },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.1rem,3.5vw,2rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Game progress" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Combo Banner */}
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '28px', marginBottom: '0.5rem' }}>
            {phase === 'running' && <ComboBanner combo={combo} milestone={milestone} />}
          </div>

          {/* Keyboard Hints */}
          <ShortcutHints phase={phase} />

          {/* Game Area */}
          <div
            ref={areaRef}
            onPointerDown={missClick}
            className="aim-game-area"
            role={phase === 'running' ? 'region' : undefined}
            aria-label={
              phase === 'running' ? 'Aim training area — click the targets' :
              phase === 'paused'  ? 'Game paused' : undefined
            }
            style={{
              position: 'relative',
              width: '100%',
              height: '420px',
              background: 'var(--bg-card)',
              border: `2px solid ${phase === 'running' ? diffCfg.color : phase === 'paused' ? 'var(--neon-orange)' : 'var(--border)'}`,
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: phase === 'running' ? 'crosshair' : 'default',
              marginBottom: '1.25rem',
              touchAction: phase === 'running' ? 'none' : 'auto',
              boxShadow: phase === 'running' ? `0 0 30px ${diffCfg.color}22` : 'none',
              transition: 'border-color 0.3s,box-shadow 0.3s',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {/* Countdown overlay */}
            {countdownNum !== null && (
              <div aria-live="assertive" aria-atomic="true" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.78)', zIndex: 20 }}>
                <span key={countdownNum} style={{ fontSize: countdownNum === 0 ? 'clamp(2.5rem,9vw,4.5rem)' : 'clamp(4rem,14vw,7rem)', fontWeight: '900', color: countdownNum === 0 ? 'var(--neon-green)' : diffCfg.color, textShadow: `0 0 30px ${countdownNum === 0 ? 'rgba(0,255,136,0.6)' : 'rgba(0,245,255,0.5)'}`, animation: 'countdownPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards', fontVariantNumeric: 'tabular-nums' }}>
                  {countdownNum === 0 ? 'GO!' : countdownNum}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{difficulty} · {gameDuration}s</span>
              </div>
            )}

            {phase === 'idle' && countdownNum === null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '4rem' }} aria-hidden="true">🎯</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click Start to Play</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{difficulty} · {gameDuration}s — Click targets as fast as you can!</span>
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
                  <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ marginTop: '0.5rem' }}>View Full Results</button>
                )}
              </div>
            )}

            {targets.map(t => (
              <TargetEl key={t.id} target={t} isHit={hitIds.has(t.id)} onHit={hitTarget} />
            ))}
          </div>
        </div>
        {/* ── End Targeted Fullscreen Wrapper ─────────────────────────── */}

        {/* ── Controls ──────────────────────────────────────────────── */}
        <div className="aim-controls" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {phase !== 'running' && phase !== 'paused' && (
            <button className="btn btn-primary" onClick={beginCountdown} disabled={countdownNum !== null} aria-label={phase === 'done' ? 'Play again' : 'Start aim trainer'} style={{ opacity: countdownNum !== null ? 0.6 : 1, cursor: countdownNum !== null ? 'not-allowed' : 'pointer' }}>
              {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
            </button>
          )}
          {phase === 'running' && (
            <button className="btn btn-secondary" onClick={togglePause} aria-label="Pause game">⏸ Pause</button>
          )}
          {phase === 'paused' && (
            <button className="btn btn-primary" onClick={togglePause} aria-label="Resume game">▶ Resume</button>
          )}
          {phase !== 'idle' && (
            <button className="btn btn-secondary" onClick={resetGame} aria-label="Reset game">🔄 Reset</button>
          )}
        </div>

        {/* ── Modal or Panel ────────────────────────────────────────── */}
        {showModal && result ? (
          <ResultsModal result={result} onPlayAgain={beginCountdown} onChangeDifficulty={openDifficultyFromModal} onClose={closeModal} />
        ) : (
          phase === 'done' && result && (
            <div className="aim-results-panel" style={{ marginTop: '1.5rem' }}>
              <ResultsPanel result={result} onPlayAgain={beginCountdown} onReset={resetGame} />
            </div>
          )
        )}

        {/* ── Session History ───────────────────────────────────────── */}
        {history.length > 0 && (
          <section className="aim-history-section" aria-label="Session history" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginTop: '2rem' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>📊 Session History</div>
            <div role="list" aria-label="Previous game results">
              {history.map((h, i) => (
                <div key={i} role="listitem" style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 1fr 1fr 2rem', gap: '0.5rem', alignItems: 'center', padding: '0.65rem 1.25rem', fontSize: '0.8rem', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
            SEO ARTICLE WITH 20+ H2 SECTIONS
        ══════════════════════════════════════════════════════════════ */}
        <hr className="aim-fs-hr" style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />

        <article className="aim-article-section aim-article-wrap" style={{ paddingTop: '1rem' }}>
          <section style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.85' }}>

            <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1.25rem', color: 'var(--neon-cyan)', marginTop: '0', letterSpacing: '-0.5px' }}>
              1. The Ultimate Guide to Aim Training & Mouse Accuracy
            </h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#d1d5db' }}>
              An <strong>Aim Trainer</strong> is a specialized browser tool designed to help gamers systematically test and improve their mouse reaction time, clicking accuracy, and spatial tracking. In competitive eSports, raw clicks-per-second statistics mean very little without precision behind them. Our 2D Aim Trainer isolates your mechanical mouse control, building stable neural pathways between your eyes and your hands.
            </p>

            <div style={{ borderLeft: '4px solid var(--neon-green)', borderRadius: '0 12px 12px 0', padding: '1.5rem', marginBottom: '2.5rem', background: 'rgba(16, 185, 129, 0.05)' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '0', marginBottom: '0.4rem' }}>🖱️ Use This as a New Mouse Sensor Check</h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.92rem' }}>
                Our Aim Trainer doubles as a <strong>new mouse check</strong>. By clicking small randomly spawning targets rapidly, you can immediately detect optical sensor spin-outs, confirm zero hardware acceleration, and dial in your DPI before any competitive match.
              </p>
            </div>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              2. How to Increase Aim Accuracy Consistently
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Accuracy is the product of three combined factors: <em>muscle memory</em>, <em>visual processing speed</em>, and <em>hardware reliability</em>. Improving all three simultaneously accelerates your progress far faster than focusing on any one area.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              3. Finding Your Perfect Mouse Sensitivity (eDPI)
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Your effective DPI (eDPI) dictates how far you must move your hand to look around in-game. A lower sensitivity generally promotes stability and smoother tracking, while a higher sensitivity allows for rapid 180-degree turns. We recommend finding a middle ground where you can comfortably do a 180-turn from the center to the edge of your mousepad.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              4. Tracking vs. Flicking: Understanding Aim Styles
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Flicking is the ability to instantly snap your crosshair to a target, critical for games like CS2 and Valorant. Tracking is the ability to smoothly follow a moving target, essential for Apex Legends and Overwatch. Our trainer helps build the initial hand-eye coordination for both.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              5. The Best Mouse Grip Styles for Gaming
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Palm grip offers high stability and tracking power. Claw grip provides a balanced mix of stability and micro-flicking. Fingertip grip offers pure vertical dexterity and micro-adjustments but lacks stability. Choose the one that prevents hand fatigue.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              6. Hardware vs. Skill: Does a Better Mouse Make You Better?
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              A top-tier mouse won't magically give you pro aim, but a bad mouse will actively hold you back. An optical sensor that skips or spins out makes it impossible to build consistent muscle memory. Invest in a flawless sensor first, then focus entirely on practice.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              7. How Posture and Seating Affects Your Aim
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Aim starts at your core. If your chair height changes daily, the angle of your arm on the desk changes, destroying your muscle memory. Keep your elbow roughly parallel with your desk surface and plant your forearm consistently to ensure repeatability.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              8. The Ultimate Warm-up Routine for Valorant and CS2
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Before hopping into ranked, play 5 minutes of our Aim Trainer on "Medium" to wake up your hand-eye coordination. Follow this up with 5 minutes on "Hard" to push your reaction times. Finish by shooting bots in-game to apply the raw mechanical skill to actual character models.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              9. The Importance of Crosshair Placement
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              The best flick in the world is slower than not having to flick at all. Crosshair placement means keeping your reticle exactly where an enemy's head will appear. Aim training helps you win the fights where perfect crosshair placement wasn't enough.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              10. How to Overcome Aiming Plateaus
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              If your scores stop improving, you've hit a plateau. To break it, artificially increase the difficulty. Play on our "Impossible" mode to intentionally fail. This forces your brain out of autopilot and builds new neural connections. When you return to "Medium," it will feel incredibly slow.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              11. Does Monitor Refresh Rate (144Hz/240Hz) Impact Aim?
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Yes. Upgrading from 60Hz to 144Hz reduces system latency and provides twice as many visual frames per second. This allows your eyes to track fast-moving targets smoothly, directly increasing your tracking scores and reaction time.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              12. Lightweight Mice vs. Heavy Mice
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              The eSports industry has heavily shifted toward ultra-lightweight mice (under 65 grams). Less weight means less inertia, allowing your hand to start and stop the mouse much faster, reducing wrist fatigue and improving micro-correction speed.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              13. Disabling Mouse Acceleration for Raw Input
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              "Enhance pointer precision" in Windows adds artificial mouse acceleration, meaning the distance your cursor moves depends on how *fast* you move the mouse, rather than just how *far*. Always disable this to ensure raw, 1:1 muscle memory building.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              14. How to Build Solid Muscle Memory
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Muscle memory thrives on repetition and sleep. Train in short, intense 15-minute bursts daily rather than a single 3-hour session once a week. Your brain solidifies these hand-eye coordination improvements overnight while you rest.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              15. Aim Training for Fortnite and Movement Shooters
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              In high-mobility games, targets move vertically and horizontally at extreme speeds. Our 2D aim trainer simulates this dynamic target acquisition. The faster you can click the small, randomly appearing targets on the screen, the faster you can edit and shoot.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              16. Dealing with Ranked Anxiety and Aim Shakes
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              "Aim shakes" happen when adrenaline floods your system during a clutch moment. The only cure is supreme confidence in your mechanics. By grinding your aim daily, aiming becomes subconscious, allowing you to stay relaxed under pressure.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              17. Measuring Your Progress in Aim Training
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Pay attention to your "Avg Reaction" and "Accuracy %" statistics at the end of each session. A high score means nothing if your accuracy drops below 85%. Always prioritize landing the shot smoothly over moving erratically fast.
            </p>

            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              18. Common Mistakes Beginners Make When Aiming
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              The biggest mistake is tensing the arm and gripping the mouse too tightly. Tension limits your range of motion and creates jittery aim. Focus on a relaxed shoulder, a loose grip, and smooth, gliding motions across your mousepad.
            </p>

            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              19. The Role of Mousepads in Accuracy
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              A good cloth mousepad provides friction—often called "stopping power." When you flick your mouse, you want it to stop precisely where your hand stops. Playing on a bare desk causes the mouse to slide past your intended target.
            </p>

            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              20. Applying 2D Training to 3D Environments
            </h2>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Browser-based aim trainers operate in a 2D space, which perfectly mirrors the flat sensor of your mouse moving on a flat desk. By mastering 2D cursor control here, you are directly training the physical hand movements required to control your 3D crosshair.
            </p>

            {/* Games Grid */}
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', marginTop: '2rem' }}>Why Aim Matters in These Top Games</h3>
            <div className="aim-games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
              {GAMES.map(game => (
                <div key={game} style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ color: 'var(--neon-green)' }} aria-hidden="true">🎯</span>{game}
                </div>
              ))}
            </div>

            {/* Massive FAQ Section (20+ Items) */}
            <div itemScope itemType="https://schema.org/FAQPage" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <h2 style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '0', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                Aim Training Frequently Asked Questions
              </h2>
              
              {ALL_FAQS.map(({ q, a }, i) => (
                <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name" style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', marginTop: 0 }}>{q}</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text" style={{ color: '#9ca3af', margin: 0, lineHeight: '1.75' }}>{a}</p>
                  </div>
                </div>
              ))}

              <div style={{ border: '1px solid rgba(255,107,0,0.2)', padding: '1.25rem 1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
                <h4 style={{ color: 'var(--neon-orange)', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.4rem 0' }}>💡 Pro Tip: Warm Up Before Every Ranked Session</h4>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem', lineHeight: '1.7' }}>
                  Use this Aim Trainer for 5–10 minutes before launching competitive matches. Start on Easy to wake up your muscle memory, finish on Hard to sharpen your reflexes, and watch your ranked performance soar.
                </p>
              </div>
            </div>

          </section>
        </article>

      </main>
    </>
  );
}

/**
 * AimTrainerPage.tsx - Production-ready
 * No Fullscreen | 2500+ Word SEO Article | 27 H2 Tags | Crash-Proof | Schema Included
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from 'react';

// ─── Constants & Safeties ─────────────────────────────────────────────────────
const MAX_HISTORY    = 10;
const CLICK_RATE_MS  = 30;

// Catch all global unhandled rejections to prevent complete crashes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    console.warn('Recovered from unhandled promise:', e.reason);
    e.preventDefault();
  });
}

// ─── Difficulty Config ────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

interface DifficultyConfig {
  minSize: number; maxSize: number; spawnInterval: number;
  targetLifetime: number; maxTargets: number; label: string;
  color: string; scoreMultiplier: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  Easy: {
    minSize: 65, maxSize: 90, spawnInterval: 1200, targetLifetime: 3000, maxTargets: 3,
    label: 'Easy', color: 'var(--neon-green, #10b981)', scoreMultiplier: 1,
  },
  Medium: {
    minSize: 40, maxSize: 70, spawnInterval: 800, targetLifetime: 2000, maxTargets: 5,
    label: 'Medium', color: 'var(--neon-cyan, #00f5ff)', scoreMultiplier: 2,
  },
  Hard: {
    minSize: 25, maxSize: 50, spawnInterval: 500, targetLifetime: 1200, maxTargets: 7,
    label: 'Hard', color: 'var(--neon-orange, #f97316)', scoreMultiplier: 3,
  },
  Impossible: {
    minSize: 15, maxSize: 35, spawnInterval: 280, targetLifetime: 700, maxTargets: 10,
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
  try {
    const reactionScore = avgReaction === 0 ? 100 : Math.max(0, 100 - (avgReaction - 150) / 5);
    const hpsScore      = Math.min(100, hitsPerSec * 20);
    const total = acc * 0.4 + reactionScore * 0.3 + hpsScore * 0.3;
    if (total >= 95) return 'S+';
    if (total >= 85) return 'S';
    if (total >= 72) return 'A';
    if (total >= 58) return 'B';
    if (total >= 42) return 'C';
    return 'D';
  } catch {
    return 'D';
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Target { id: number; x: number; y: number; size: number; spawnTime: number; }
interface SessionResult {
  score: number; misses: number; acc: number; missPct: number;
  avgReaction: number; hitsPerSec: number; combo: number; grade: Grade;
  duration: number; totalTime: number; difficulty: Difficulty;
}
type Phase = 'idle' | 'running' | 'paused' | 'done';

// ─── Sound Engine ─────────────────────────────────────────────────────────────
function playTone(ctx: AudioContext, type: OscillatorType, freqStart: number, freqEnd: number, dur: number, vol: number) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    if (freqStart !== freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + dur * 0.8);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch { /* Silent fail */ }
}

function playHit(ctx: AudioContext) { playTone(ctx, 'sine', 1200, 600, 0.1, 0.3); }
function playMiss(ctx: AudioContext) { playTone(ctx, 'triangle', 120, 60, 0.12, 0.2); }
function playCombo(ctx: AudioContext, lvl: number) { playTone(ctx, 'sine', 800 + lvl * 200, (800 + lvl * 200) * 1.5, 0.2, 0.25); }
function playCountdownBeep(ctx: AudioContext) { playTone(ctx, 'sine', 600, 600, 0.15, 0.28); }
function playCountdownGo(ctx: AudioContext) { playTone(ctx, 'sine', 800, 1300, 0.3, 0.32); }

// ─── JSON-LD & SEO ────────────────────────────────────────────────────────────
const JSON_LD_APP = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Aim Trainer — Free Online Aim Training & Mouse Accuracy Test',
  description: 'Free online aim trainer. Improve mouse accuracy, flick speed, and reaction time for FPS games like CS2, Valorant, and Fortnite.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
});

const JSON_LD_ARTICLE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Ultimate Guide to Aim Training and Mouse Accuracy",
  "description": "A comprehensive 2500+ word guide covering mechanical aim, hardware optimization, cognitive skills, and FPS improvement.",
  "author": { "@type": "Organization", "name": "Aim Trainer Pro" },
  "publisher": {
    "@type": "Organization", "name": "Aim Trainer Pro",
    "logo": { "@type": "ImageObject", "url": "https://yoursite.com/logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://yoursite.com/aim-trainer" }
});

function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = data;
      document.head.appendChild(script);
      return () => { if (document.head.contains(script)) document.head.removeChild(script); };
    } catch { return; }
  }, [data]);
  return null;
}

function SeoMeta() {
  useEffect(() => {
    try {
      document.title = 'Aim Trainer – Free Online Aim Training & Mouse Accuracy Test';
      const metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      metaDesc.content = "Train your aim for free. Improve mouse accuracy, reaction time, and flick speed with our browser-based aim trainer. 2500+ word guide included.";
      document.head.appendChild(metaDesc);
      return () => { if (document.head.contains(metaDesc)) document.head.removeChild(metaDesc); };
    } catch { return; }
  }, []);
  return null;
}

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
        background: c.bg, border: `3px solid ${c.text}`, boxShadow: c.glow, color: c.text,
        fontSize: '2rem', fontWeight: '900', animation: 'gradeReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
      aria-label={`Performance grade: ${grade}`}
    >
      {grade}
    </div>
  );
});

// ─── Results Modal ────────────────────────────────────────────────────────────
const ResultsModal = memo(function ResultsModal({
  result, onPlayAgain, onChangeDifficulty, onClose,
}: {
  result: SessionResult | null; onPlayAgain: () => void; onChangeDifficulty: () => void; onClose: () => void;
}) {
  if (!result) return null;

  const topStats = [
    { value: `${result.acc ?? 0}%`, label: 'Accuracy' },
    { value: result.score ?? 0, label: 'Hits' },
    { value: `${result.duration ?? 0}s`, label: 'Duration' },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 999,
        }}
      />
      <div
        role="dialog"
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '90%', maxWidth: '380px', background: 'var(--bg-card, #1e293b)',
          border: '2px solid rgba(0,245,255,0.3)', borderRadius: '20px', padding: '1.5rem',
          textAlign: 'center', zIndex: 1000, boxShadow: '0 0 60px rgba(0,245,255,0.2)',
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: 'var(--neon-cyan, #00f5ff)' }}>{result.score} HITS</h2>
        <GradeBadge grade={result.grade} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', margin: '20px 0' }}>
          {topStats.map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onChangeDifficulty}>Menu</button>
          <button className="btn btn-primary" onClick={onPlayAgain}>Try Again</button>
        </div>
      </div>
    </>
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
      role="button" tabIndex={-1}
      style={{
        position: 'absolute', left: target.x, top: target.y, width: target.size, height: target.size,
        borderRadius: '50%', transform: 'translate(-50%,-50%)', cursor: 'crosshair', touchAction: 'none',
        background: isHit ? 'rgba(255,200,0,0.9)' : 'rgba(255,45,85,0.9)',
        border: `3px solid ${isHit ? '#ff0' : '#fff'}`,
        boxShadow: isHit ? '0 0 25px rgba(255,220,0,0.8)' : '0 0 20px rgba(255,45,85,0.5)',
        animation: isHit ? 'target-hit 0.12s ease-out forwards' : 'target-pop 0.18s ease-out forwards',
      }}
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function AimTrainerPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [gameDuration, setGameDuration] = useState<Duration>(DEFAULT_DURATION);
  const [phase, setPhase] = useState<Phase>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATION);
  const [hitIds, setHitIds] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const targetId = useRef(0);
  const totalClicks = useRef(0);
  const hitClicks = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const lastClickTime = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reactionTimes = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const maxComboRef = useRef(0);

  // Safely get Audio Context
  const getAudioCtx = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioCtxRef.current;
    } catch { return null; }
  }, []);

  const emitSound = useCallback((type: 'hit' | 'miss' | 'combo' | 'countdown' | 'go', comboLevel = 1) => {
    if (!soundOn) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      if (type === 'hit') playHit(ctx);
      else if (type === 'miss') playMiss(ctx);
      else if (type === 'countdown') playCountdownBeep(ctx);
      else if (type === 'go') playCountdownGo(ctx);
      else playCombo(ctx, comboLevel);
    } catch { /* Suppress errors */ }
  }, [soundOn, getAudioCtx]);

  // Cleanups
  useEffect(() => () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
      targetTimeouts.current.forEach(t => clearTimeout(t));
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    } catch { /* ignore cleanup errors */ }
  }, []);

  const removeTarget = useCallback((id: number) => {
    try {
      setTargets(prev => prev.filter(t => t.id !== id));
      setHitIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      targetTimeouts.current.delete(id);
    } catch { /* ignore */ }
  }, []);

  const spawnTarget = useCallback(() => {
    try {
      if (!areaRef.current || phaseRef.current !== 'running') return;
      const rect = areaRef.current.getBoundingClientRect();
      const cfg = DIFFICULTY_CONFIGS[difficulty];
      const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
      const x = Math.max(size / 2, Math.min(rect.width - size / 2, size / 2 + Math.random() * (rect.width - size)));
      const y = Math.max(size / 2, Math.min(rect.height - size / 2, size / 2 + Math.random() * (rect.height - size)));
      const id = ++targetId.current;
      
      setTargets(prev => prev.length >= cfg.maxTargets ? prev : [...prev, { id, x, y, size, spawnTime: performance.now() }]);
      targetTimeouts.current.set(id, setTimeout(() => removeTarget(id), cfg.targetLifetime));
    } catch { console.warn("Spawn target skipped"); }
  }, [difficulty, removeTarget]);

  const endGame = useCallback(() => {
    try {
      if (phaseRef.current !== 'running' && phaseRef.current !== 'paused') return;
      phaseRef.current = 'done';
      setPhase('done');
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      targetTimeouts.current.forEach(t => clearTimeout(t));
      targetTimeouts.current.clear();
      setTargets([]);

      const totalTime = Math.min(gameDuration, Math.max(0.01, (performance.now() - startTimeRef.current) / 1000));
      const totalAtt = totalClicks.current;
      const acc = totalAtt > 0 ? Math.round((hitClicks.current / totalAtt) * 100) : 0;
      const missCount = Math.max(0, totalAtt - hitClicks.current);
      const missPct = totalAtt > 0 ? Math.round((missCount / totalAtt) * 100) : 0;
      const avgReaction = reactionTimes.current.length > 0
        ? Math.round(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length) : 0;
      const hitsPerSec = totalTime > 0 ? hitClicks.current / totalTime : 0;
      
      const r: SessionResult = {
        score: hitClicks.current, misses: missCount, acc, missPct,
        avgReaction, hitsPerSec, combo: maxComboRef.current,
        grade: calcGrade(acc, avgReaction, hitsPerSec),
        duration: gameDuration, totalTime, difficulty
      };
      
      setResult(r);
      setHistory(prev => [r, ...prev.slice(0, MAX_HISTORY - 1)]);
      setShowModal(true);
    } catch { setPhase('idle'); }
  }, [gameDuration, difficulty]);

  const startGame = useCallback(() => {
    try {
      phaseRef.current = 'running';
      setPhase('running'); setScore(0); setMisses(0); setTimeLeft(gameDuration);
      setTargets([]); setHitIds(new Set()); setCombo(0);
      totalClicks.current = 0; hitClicks.current = 0; lastClickTime.current = 0; maxComboRef.current = 0;
      reactionTimes.current = []; startTimeRef.current = performance.now();
      
      spawnTarget();
      spawnRef.current = setInterval(spawnTarget, DIFFICULTY_CONFIGS[difficulty].spawnInterval);
      
      const start = performance.now();
      timerRef.current = setInterval(() => {
        const left = Math.max(0, gameDuration - (performance.now() - start) / 1000);
        setTimeLeft(left);
        if (left <= 0) endGame();
      }, 50);
    } catch { setPhase('idle'); }
  }, [gameDuration, difficulty, spawnTarget, endGame]);

  const beginCountdown = useCallback(() => {
    try {
      setShowModal(false);
      let step = 3;
      setCountdownNum(step);
      emitSound('countdown');
      
      const tick = () => {
        step -= 1;
        if (step >= 1) {
          setCountdownNum(step); emitSound('countdown');
          countdownRef.current = setTimeout(tick, 700);
        } else {
          setCountdownNum(0); emitSound('go');
          countdownRef.current = setTimeout(() => {
            setCountdownNum(null); startGame();
          }, 500);
        }
      };
      countdownRef.current = setTimeout(tick, 700);
    } catch { startGame(); }
  }, [emitSound, startGame]);

  const resetGame = useCallback(() => {
    try {
      phaseRef.current = 'idle'; setPhase('idle');
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
      setCountdownNum(null); targetTimeouts.current.forEach(t => clearTimeout(t));
      setScore(0); setMisses(0); setTimeLeft(gameDuration); setTargets([]);
    } catch { /* safe */ }
  }, [gameDuration]);

  const hitTarget = useCallback((id: number, e: React.PointerEvent) => {
    try {
      e.stopPropagation();
      if (phaseRef.current !== 'running') return;
      const now = performance.now();
      if (now - lastClickTime.current < CLICK_RATE_MS) return;
      lastClickTime.current = now;

      setTargets(prev => {
        const t = prev.find(x => x.id === id);
        if (t) reactionTimes.current.push(Math.round(now - t.spawnTime));
        return prev;
      });

      const timeout = targetTimeouts.current.get(id);
      if (timeout) clearTimeout(timeout);
      setHitIds(prev => new Set(prev).add(id));
      setTimeout(() => removeTarget(id), 100);
      
      setScore(s => s + 1); hitClicks.current++; totalClicks.current++;
      setCombo(c => { const n = c + 1; if (n > maxComboRef.current) maxComboRef.current = n; emitSound('hit'); return n; });
      spawnTarget();
    } catch { /* safe */ }
  }, [removeTarget, emitSound, spawnTarget]);

  const missClick = useCallback((e: React.PointerEvent) => {
    try {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (phaseRef.current !== 'running') return;
      const now = performance.now();
      if (now - lastClickTime.current < CLICK_RATE_MS) return;
      lastClickTime.current = now;
      
      setMisses(m => m + 1); totalClicks.current++; setCombo(0); emitSound('miss');
    } catch { /* safe */ }
  }, [emitSound]);

  const acc = totalClicks.current > 0 ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100;
  const progress = gameDuration > 0 ? ((gameDuration - timeLeft) / gameDuration) * 100 : 0;
  const diffCfg = DIFFICULTY_CONFIGS[difficulty];

  // ─── 2500+ Word SEO Article Content Generation ─────────────────────────────────
  const SEO_SECTIONS = [
    { title: "1. The Evolution of Aim Training in eSports", content: "Aim training has evolved from a niche activity into a foundational pillar of modern eSports. In the early days of competitive gaming, players relied entirely on thousands of hours of standard gameplay to build their mechanics. Today, standalone browser applications and dedicated aiming software provide a highly concentrated environment designed specifically to isolate and hyper-train hand-eye coordination. Professional players from CS2, Valorant, Overwatch, and Apex Legends utilize these tools religiously as part of their daily routines. By stripping away game sense, movement, map knowledge, and tactical utility, an aim trainer forces the player's brain to focus 100% of its processing power on pure, raw mechanical mouse control. This focused, deliberate practice allows a player to cram what would normally be hours of scattered, infrequent in-game gunfights into a highly dense 15-minute training window, dramatically accelerating the rate at which muscle memory is built." },
    { title: "2. Mechanical vs. Cognitive Aiming Skills", content: "Aiming is not just moving a piece of plastic across a desk; it is a complex neurological process combining mechanical execution and cognitive processing. Mechanical aim involves the physical dexterity of your wrist, arm, and fingers—the actual muscle memory required to move the mouse precisely X millimeters. Cognitive aim, however, revolves around visual processing speed, spatial awareness, and target reading. When a target appears on your screen, your brain must recognize it, calculate the distance, and send an electrical signal down your arm to execute the flick. Most players mistakenly believe they lack mechanical skill, when in reality, their cognitive processing is slow. By utilizing a high-speed aim trainer, you essentially force your brain's neural pathways to fire faster, closing the gap between visual recognition and physical execution, yielding a lower, much faster reaction time." },
    { title: "3. The Physics of Mouse Movement: Friction and Inertia", content: "Understanding the basic physics of mouse movement is crucial for mastering your aim. Your mouse has a physical weight (mass), and your mousepad provides resistance (friction). When you flick your mouse to hit a target, you must overcome static friction to initiate movement, and kinetic friction to keep it moving. Once the mouse is moving, inertia dictates that it wants to keep moving. The true skill in flicking is not the speed of the movement, but the precision of the stop. If your mouse is too heavy, the inertia will carry it past the target, resulting in over-aiming. If your mousepad is too fast, you lose stopping power, making micro-adjustments nearly impossible. This is why the eSports industry has aggressively shifted toward ultra-lightweight mice (often under 60 grams) and high-quality cloth control pads, providing the perfect balance of low inertia for speed and high friction for stopping power." },
    { title: "4. Optimizing Your Gaming Setup for Perfect Aim", content: "A high-performance gaming setup doesn't magically bestow you with professional aim, but a poor setup will actively sabotage your progress. Your environment must be completely standardized to build consistent muscle memory. First, ensure your desk height allows your elbows to rest comfortably at a 90-degree angle, preventing shoulder tension. Second, use a monitor arm to pull your screen closer, reducing the visual distance between your eyes and the crosshair, which enhances target tracking. Third, ensure your mouse cord isn't dragging—invest in a mouse bungee or switch to a high-end wireless mouse to eliminate cable drag. Any external variable that alters the physical sensation of moving your mouse from one day to the next will reset your muscle memory adaptation. Consistency in your physical environment guarantees consistency in your mechanical performance inside the aim trainer." },
    { title: "5. Monitor Refresh Rates: 60Hz vs 144Hz vs 240Hz", content: "The refresh rate of your monitor represents the number of times per second the screen redraws the image. A 60Hz monitor redraws 60 times a second, whereas a 240Hz monitor redraws 240 times. When a target moves across your screen at 60Hz, it appears choppy, leaving physical gaps between the frames. Your brain is forced to guess where the target is in between those frames, adding milliseconds of delay to your reaction time. Jumping to 144Hz or 240Hz provides buttery-smooth visual feedback, allowing for seamless target tracking and instantaneous visual recognition. Furthermore, higher refresh rates drastically lower the overall system input latency. If you are serious about your aim, a 144Hz+ monitor is not a luxury; it is a mandatory hardware requirement that will instantly improve your tracking scores and flick accuracy." },
    { title: "6. Mouse Weight and Shape: Finding Your Endgame", content: "The gaming mouse market is saturated with hundreds of shapes, sizes, and weights. Your 'endgame' mouse is the one that perfectly complements your hand size and grip style. Ergonomic mice are molded for right-handed users, sloping downward to fill the palm, offering massive stability for long-range tracking. Symmetrical (ambidextrous) mice provide a uniform shape that excels in fast, chaotic flicking scenarios due to their lower profile. Beyond shape, weight is the deciding factor. Heavy mice (90g+) provide stability but induce wrist fatigue and slow down initial flick acceleration. Lightweight mice (50g-70g) allow for effortless micro-adjustments and explosive flick speed. If your current mouse forces you to adjust your natural grip, or if your wrist aches after an hour of aim training, you are using the wrong mouse shape, severely hindering your skill ceiling." },
    { title: "7. Mousepad Surfaces: Speed, Control, and Hybrid", content: "Your mousepad is the canvas upon which your aim is drawn. Broadly, pads fall into three categories: Speed, Control, and Hybrid. Speed pads (hard plastics, glass, tightly woven synthetics) offer minimal static friction. They are exceptional for tracking-heavy games like Apex Legends, as micro-adjustments feel effortless. However, they lack 'stopping power,' making precise flicks incredibly difficult. Control pads (soft, thick cloth) offer high friction, ensuring that when your hand stops, the mouse stops instantly. This is the preferred surface for tactical shooters like CS2 and Valorant where precision flicking is king. Hybrid pads attempt to offer the best of both worlds. Regardless of your choice, humidity and skin oils will degrade the glide over time. Washing your cloth pad regularly or replacing it every 6-8 months ensures a consistent surface for your aim trainer grinds." },
    { title: "8. Understanding eDPI and True Sensitivity", content: "DPI (Dots Per Inch) is a hardware measurement of how sensitive your mouse sensor is, but it means nothing without context. To compare sensitivities across different setups, players use eDPI (Effective DPI), calculated by multiplying your hardware DPI by your in-game sensitivity multiplier. For example, 400 DPI at 2.0 in-game is exactly the same as 800 DPI at 1.0 in-game (both are 800 eDPI). Another vital metric is cm/360, which measures how many centimeters of physical mousepad space you need to move your mouse to perform a 360-degree turn in-game. Standardizing your sensitivity using eDPI or cm/360 allows you to perfectly mirror your gaming sensitivity within an aim trainer. Avoid absurdly high sensitivities; the vast majority of professional players sit between 200 and 400 eDPI in tactical shooters, trading fast turn speeds for immaculate micro-precision." },
    { title: "9. The Impact of Input Lag on Reaction Time", content: "Input lag is the total sum of milliseconds between the moment you physically click your mouse and the moment the gun fires on your screen. This chain includes the mouse's internal processing, the USB polling rate, the CPU/GPU rendering time, and the monitor's response time. If your total system input lag is 40ms, and your biological reaction time is 180ms, you are operating at a 220ms disadvantage. Lowering input lag is essentially buying free reaction time. To minimize lag: play in exclusive full-screen mode, disable V-Sync, turn off Windows mouse acceleration, use a 1000Hz+ polling rate mouse, uncap your framerate, and enable technologies like NVIDIA Reflex. The closer your system latency is to zero, the more accurate and responsive your crosshair will feel during an intense aim training session." },
    { title: "10. Proper Posture for Esports Professionals", content: "You cannot build world-class aim with a slouching back and a contorted wrist. Posture dictates the geometry of your arm on the desk, which dictates the angle of your mouse movements. Sit with your back straight against the chair, feet flat on the floor, and your monitor precisely at eye level to prevent neck strain. Your desk height should allow your forearms to rest parallel to the floor. If your desk is too high, you will naturally hike your shoulders, causing extreme tension in your neck and restricting your arm's range of motion. This tension destroys the fluidity needed for smooth tracking. A relaxed shoulder allows the elbow to act as a natural pivot point for arm aiming, transferring the workload away from the delicate tendons in your wrist and into the larger muscle groups of your forearm." },
    { title: "11. Ergonomics and Preventing Wrist Injuries", content: "Aim training is a physically demanding activity that subjects your wrist to thousands of micro-repetitive motions per hour. Without proper care, this leads directly to Repetitive Strain Injury (RSI) or Carpal Tunnel Syndrome. Pain is your body's alarm system; if your wrist hurts, stop immediately. Prevention starts with technique: do not anchor your wrist heavily against the edge of the desk. Doing so compresses the median nerve. Instead, rest your forearm on the desk or armrest, allowing your wrist to hover or lightly glide. Additionally, implement hand stretches into your daily routine. Stretch your flexors and extensors for 30 seconds before and after every gaming session. Staying hydrated also ensures your tendons remain lubricated. Longevity in gaming is just as important as peaking; you cannot hit Radiant if your hand is in a brace." },
    { title: "12. Arm Aiming vs. Wrist Aiming: Pros and Cons", content: "The debate between arm aiming and wrist aiming boils down to sensitivity and physical health. Wrist aiming involves high sensitivities (usually under 20cm/360), planting the forearm on the desk, and using only wrist articulations to look around. This allows for incredibly fast 180-degree turns and uses very little desk space, but it forces the tiny wrist tendons to absorb all the strain, vastly increasing the risk of injury. Arm aiming utilizes lower sensitivities (usually over 35cm/360), utilizing the shoulder and elbow to make sweeping movements across a massive mousepad, reserving the wrist solely for fine micro-adjustments. Arm aiming is universally recommended by health professionals and eSports coaches alike. It utilizes larger, stronger muscle groups, offers significantly better long-range precision, and protects your wrist from long-term nerve damage. Making the switch takes weeks, but the consistency gained is unparalleled." },
    { title: "13. Warm-up Routines for FPS Gamers", content: "Hopping directly into a ranked match without a warm-up is the easiest way to lose your first game. Just like traditional athletes, gamers must warm up their nervous system and localized muscle groups. A proper aim trainer warm-up shouldn't last more than 10 to 15 minutes to avoid fatigue. Start with 3 minutes of large target, slow-paced tracking to get blood flowing to your arm and shoulder. Transition into 5 minutes of medium-sized target clicking, focusing entirely on accuracy rather than speed (aim for 95%+ accuracy). Finish with 5 minutes of intense, high-speed micro-flicking to wake up your reaction time and adrenaline response. Once you load into your actual game, spend 2 minutes in the game's native firing range to adapt to the specific engine's FOV and weapon recoil. This guarantees you are peaking from round one." },
    { title: "14. Nutrition and Hydration for Peak Performance", content: "Your brain consumes approximately 20% of your body's energy. If you are dehydrated or fueled by junk food, your cognitive processing, focus, and reaction times will plummet. Dehydration by even 2% leads to a measurable drop in visual-motor tracking skills. Keep a large bottle of water on your desk and sip it constantly during your aim training sessions. Furthermore, avoid massive sugar spikes from energy drinks before a session. The ensuing sugar crash will leave you fatigued, jittery, and entirely incapable of smooth crosshair control. Instead, rely on complex carbohydrates, balanced meals, and natural caffeine sources like tea or black coffee in moderation. A healthy body creates a healthy brain, which directly translates to faster synapses firing when you need to flick to a target in milliseconds." },
    { title: "15. Sleep: The Secret to Faster Reaction Times", content: "No amount of expensive hardware or energy drinks can compensate for a lack of sleep. Sleep is the biological mechanism by which your brain encodes short-term practice into long-term muscle memory. When you spend an hour aim training, you are merely telling your brain what it needs to learn. It is during the REM and Deep Sleep cycles that your brain actually wires those neural pathways together. If you only sleep for 4 or 5 hours, you interrupt this encoding process, effectively throwing away half of your training progress for that day. Furthermore, sleep deprivation drastically impairs your central nervous system, adding 50ms to 100ms to your reaction time and destroying your ability to maintain focus. Consistently sleeping 7-9 hours a night is the ultimate, free performance-enhancing tool for gamers." },
    { title: "16. Crosshair Placement: The Most Important Skill", content: "While aim trainers perfect your raw mechanical flicking, the golden rule of tactical shooters is to avoid having to flick at all. Crosshair placement is the art of keeping your reticle exactly at head-height, pre-aimed at the exact pixel where an enemy will peek from. A player with mediocre mechanical aim but flawless crosshair placement will consistently beat a player with god-tier aim but terrible crosshair placement. The time it takes to click the left mouse button is infinitely faster than the time it takes to move your mouse, stop it, and click. Use aim trainers to build the mechanical safety net for when enemies catch you off guard, but use your in-game hours to meticulously memorize map geometry, head heights, and common angles to minimize the distance your mouse ever has to travel." },
    { title: "17. Target Acquisition and Visual Focus", content: "A common mistake beginners make is staring at their crosshair instead of the target. Your crosshair is just a static overlay in the center of your screen; you should never actively look at it. Instead, your eyes should be intensely scanning the environment, searching for enemy models. This is known as target acquisition. When an enemy appears, your eyes lock onto the target, and your hand naturally moves the crosshair to where your eyes are looking. This hand-eye coordination loop is what aim training builds. To practice this, look at the randomly spawning targets on the screen, fixate your eyes on the center of the circle, and let your peripheral vision guide the mouse. This visual focus technique significantly speeds up the time it takes to recognize and engage an opponent." },
    { title: "18. Dealing with In-Game Anxiety and 'Aim Shakes'", content: "Ranked anxiety, or 'aim shakes,' occurs when adrenaline floods your system during a high-pressure clutch situation. Your heart races, your hands become cold, and your mouse movements become violently jittery, completely destroying your accuracy. This biological response is a result of a lack of confidence in your mechanics. The brain perceives the clutch as a massive threat and triggers a fight-or-flight response. The cure to aim shakes is relentless, daily practice in an aim trainer. By turning the act of aiming into a subconscious, automatic reflex, your brain no longer has to panic to execute the shot. Deep breathing exercises between rounds—specifically inhaling for 4 seconds, holding for 4, and exhaling for 4—will physically lower your heart rate and stabilize your hands, allowing your trained mechanics to take over smoothly." },
    { title: "19. Audio Cues and Spatial Awareness", content: "In a 3D gaming environment, aiming does not begin when you see the target; it begins when you hear them. High-quality stereo headphones provide directional audio cues that inform your brain exactly where an enemy is positioned before they even cross your screen. This allows you to pre-aim through walls and execute an immediate flick the millisecond they appear. Aim trainers strictly develop your visual reaction times, which is why it is crucial to combine raw mechanical training with active listening in-game. Do not use virtual 7.1 surround sound software; it heavily distorts spatial audio cues and makes it harder to pinpoint footsteps. Rely on pure stereo sound, keep your volume at a safe but audible level, and let your ears guide your crosshair to the target before your eyes even see them." },
    { title: "20. Developing Consistency Across Different Games", content: "Moving from a slow-paced tactical shooter like Counter-Strike to a hyper-mobile game like Apex Legends can feel jarring. The FOV (Field of View) is different, the engine handles mouse input differently, and the targets move at wildly different velocities. To maintain consistency across games, utilize a sensitivity converter to perfectly match your cm/360 measurement across every title you play. This ensures that a 5-inch swipe of the mouse translates to the exact same rotational distance on your screen, regardless of the game. Furthermore, using a neutral, browser-based aim trainer as your daily baseline calibrates your hand-eye coordination in a pure vacuum. Because the aim trainer isn't tied to any specific game engine, the raw mechanical tracking and clicking skills you develop will universally translate to any FPS title." },
    { title: "21. Adapting to New Sensitivities", content: "Sometimes, changing your sensitivity is necessary to break a plateau. If your aim is constantly jittery, you likely need to lower it. If you cannot track fast-moving targets up close without dislocating your shoulder, you likely need to raise it. Changing your sensitivity will completely destroy your muscle memory for a few days, leading to a temporary drop in performance. Do not panic and switch it back. Stick to the new sensitivity for at least 7 to 10 days. To accelerate the adaptation process, jump into an aim trainer on 'Hard' mode and run intensive flicking drills. By purposefully exposing yourself to highly difficult, rapid target acquisition scenarios, you force your brain to map out the new physical distances required to move the cursor, dramatically speeding up the neuroplasticity adjustment phase." },
    { title: "22. The Role of Aim Assist in Modern Crossplay", content: "With the rise of crossplay, mouse and keyboard (MnK) players constantly face controller players utilizing Aim Assist. Aim assist is a software algorithm that slows down crosshair sensitivity when hovering over an enemy, and in some games, physically pulls the crosshair to track target movement (Rotational Aim Assist). While MnK players possess infinite mechanical freedom and faster 180-degree turn speeds, they must manually react to instantaneous directional changes—a biological delay of around 150-200ms. Aim assist reacts in 0ms. To combat this in close-quarters combat, MnK players must rely on superior positioning, unpredictable movement, and absolute mastery of target tracking. Aim training specifically helps MnK players minimize their biological reaction delay, allowing them to track strafing targets almost as smoothly as an algorithmic assist." },
    { title: "23. Controller vs. Keyboard/Mouse Aiming", content: "The mechanics of aiming on a controller thumbstick are fundamentally different from aiming on a mouse. A mouse utilizes raw, 1:1 input based on physical distance traveled. A thumbstick utilizes velocity-based input; the further you push the stick from the center, the faster the camera turns over time. While browser aim trainers are explicitly designed for mouse users to build fast-twitch muscle fibers, the core concepts of cognitive processing, crosshair placement, and reaction time remain identical for controller players. A controller player must master the specific response curves of their thumbsticks (Linear vs. Exponential) and find the perfect deadzone to allow for micro-adjustments without stick drift. Ultimately, while the input methods vastly differ, the mental discipline required to master crosshair control remains universally the same." },
    { title: "24. The Psychology of Slumps and Plateaus", content: "Every gamer will eventually hit a plateau where their aim trainer scores stop climbing and their in-game performance stagnates. This is a natural part of the learning curve. Plateaus occur when your brain has perfectly optimized your current technique, meaning you can no longer improve without changing how you approach the task. A slump is worse; it is a regression in skill, usually caused by burnout, fatigue, or immense frustration. The best way to cure a slump is to take a complete 3-to-5-day break from gaming and aim training. Allow your central nervous system to recover. When you return, lower your expectations and focus solely on smoothness and accuracy rather than high scores. To break a plateau, artificially change the parameters: switch to 'Impossible' difficulty to force your brain out of its comfort zone and stimulate new neural connections." },
    { title: "25. VOD Reviewing to Fix Aim Mistakes", content: "Aim training operates in a vacuum, but real matches are chaotic. To truly fix your aim, you must record your gameplay (VODs) and analyze your gunfights. Watch your missed shots frame-by-frame. Are you constantly over-flicking (aiming past the enemy)? This means your sensitivity might be too high, or you lack stopping power. Are you shooting before your crosshair has fully settled on the target? This indicates a lack of patience and poor click timing. Are your crosshairs aiming at the floor when you peek a corner? This highlights a fundamental flaw in crosshair placement. Combining the isolated mechanical practice of an aim trainer with the analytical, critical thinking of VOD reviews creates a feedback loop that will elevate you from an average player to a highly tactical, mechanically gifted competitor." },
    { title: "26. The Future of Aim Training Software", content: "The future of aim training is moving beyond 2D browser clicks and simple 3D spheres. Developers are incorporating advanced AI routines that analyze your unique mouse telemetry to identify specific weaknesses, dynamically generating scenarios to fix those exact flaws. Furthermore, integration with in-game telemetry APIs will soon allow aim trainers to perfectly recreate actual missed gunfights from your recent matches, letting you replay the exact scenario until you hit the shot. Virtual Reality (VR) aim trainers are also emerging, training physical body mechanics alongside wrist movements. As the eSports industry continues to mature and the skill floor rises, the reliance on scientifically backed, data-driven aim training software will become as mandatory as gym sessions are for professional athletes." },
    { title: "27. Conclusion: Your Path to Radiant, Global Elite, and Beyond", content: "Achieving mastery in first-person shooters is a marathon, not a sprint. Using this Aim Trainer daily will guarantee noticeable improvements in your flicking speed, tracking smoothness, and cognitive reaction times. However, mechanical aim is just one piece of the puzzle. Combine your newfound mouse accuracy with flawless crosshair placement, intelligent map positioning, active communication, and a calm, tilt-free mindset. Treat your body with respect by maintaining proper posture, staying hydrated, and prioritizing a full night's sleep to lock in your muscle memory. Stay disciplined in your practice, analyze your mistakes without ego, and enjoy the gradual, rewarding process of self-improvement. The path to the highest competitive ranks requires dedication, and your journey to perfect aim starts right now with the very next click." },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <SeoMeta />
      <JsonLd data={JSON_LD_APP} />
      <JsonLd data={JSON_LD_ARTICLE} />

      <style>{`
        @keyframes target-pop { 0% { transform: translate(-50%,-50%) scale(0.3); opacity: 0; } 60% { transform: translate(-50%,-50%) scale(1.1); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; } }
        @keyframes target-hit { 0% { transform: translate(-50%,-50%) scale(1); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; } }
        @keyframes gradeReveal { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 70% { transform: scale(1.2) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        
        .aim-inner { width: 100%; max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; box-sizing: border-box; display: flex; flex-direction: column; min-height: 100vh; font-family: system-ui, sans-serif; color: #fff; }
        .aim-controls { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
        .btn { padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; }
        .btn-primary { background: var(--neon-cyan, #00f5ff); color: #000; }
        .btn-primary:hover { box-shadow: 0 0 15px rgba(0,245,255,0.6); }
        .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        
        .progress-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--neon-cyan, #00f5ff); transition: width 0.1s linear; }

        @media (max-width: 640px) {
          .aim-stats-grid { grid-template-columns: repeat(3,1fr) !important; gap: 0.5rem; }
          .aim-settings-row { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <main className="aim-inner" role="main" aria-label="Aim Trainer">
        
        <header style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ color: 'var(--neon-green, #10b981)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Aim Tool</div>
          <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem', color: 'var(--neon-cyan, #00f5ff)' }}>Aim Trainer</h1>
          <p style={{ color: '#9ca3af' }}>Click targets fast. Track accuracy, combo, and reaction time.</p>
        </header>

        {/* ─── Settings Row ────────────────────────────────────────────── */}
        <div className="aim-settings-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Difficulty</legend>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(d => (
                <button
                  key={d} onClick={() => setDifficulty(d)} disabled={phase !== 'idle' && phase !== 'done'}
                  style={{
                    padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid', cursor: 'pointer',
                    borderColor: difficulty === d ? DIFFICULTY_CONFIGS[d].color : '#333',
                    background: difficulty === d ? `${DIFFICULTY_CONFIGS[d].color}22` : 'transparent',
                    color: difficulty === d ? DIFFICULTY_CONFIGS[d].color : '#9ca3af',
                    opacity: (phase !== 'idle' && phase !== 'done') ? 0.5 : 1
                  }}
                >{d}</button>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Duration</legend>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d} onClick={() => { setGameDuration(d); setTimeLeft(d); }} disabled={phase !== 'idle' && phase !== 'done'}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid', cursor: 'pointer',
                    borderColor: gameDuration === d ? '#00f5ff' : '#333',
                    background: gameDuration === d ? 'rgba(0,245,255,0.1)' : 'transparent',
                    color: gameDuration === d ? '#00f5ff' : '#9ca3af',
                    opacity: (phase !== 'idle' && phase !== 'done') ? 0.5 : 1
                  }}
                >{d}s</button>
              ))}
            </div>
          </fieldset>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => setSoundOn(!soundOn)}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
                border: `1px solid ${soundOn ? '#00f5ff' : '#333'}`,
                background: soundOn ? 'rgba(0,245,255,0.1)' : 'transparent',
                color: soundOn ? '#00f5ff' : '#9ca3af',
              }}
            >
              {soundOn ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
          </div>
        </div>

        {/* ─── HUD & Game Area ─────────────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <div className="aim-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[
              { value: score, label: 'Hits', color: '#10b981' },
              { value: misses, label: 'Misses', color: '#ff2d55' },
              { value: `${acc}%`, label: 'Acc', color: '#00f5ff' },
              { value: timeLeft.toFixed(1), label: 'Secs', color: '#f97316' },
              { value: `×${combo}`, label: 'Combo', color: '#ffd700' },
            ].map(s => (
              <div key={s.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="progress-bar" style={{ marginBottom: '1rem' }}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

          <div
            ref={areaRef} onPointerDown={missClick}
            style={{
              position: 'relative', width: '100%', height: '420px', background: '#0f172a',
              border: `2px solid ${phase === 'running' ? diffCfg.color : '#334155'}`,
              borderRadius: '16px', overflow: 'hidden', cursor: phase === 'running' ? 'crosshair' : 'default',
              userSelect: 'none', touchAction: 'none'
            }}
          >
            {countdownNum !== null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 20 }}>
                <span style={{ fontSize: '5rem', fontWeight: '900', color: countdownNum === 0 ? '#10b981' : diffCfg.color }}>
                  {countdownNum === 0 ? 'GO!' : countdownNum}
                </span>
              </div>
            )}

            {phase === 'idle' && countdownNum === null && (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                  <span style={{ fontSize: '3rem' }}>🎯</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>Ready to Train</span>
                  <span style={{ color: '#9ca3af', marginTop: '5px' }}>{difficulty} Mode • {gameDuration}s</span>
               </div>
            )}

            {phase === 'done' && countdownNum === null && (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 10 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f5ff' }}>Time's Up!</span>
                  <span style={{ fontSize: '4rem', fontWeight: '900', color: '#10b981' }}>{score} Hits</span>
               </div>
            )}

            {targets.map(t => <TargetEl key={t.id} target={t} isHit={hitIds.has(t.id)} onHit={hitTarget} />)}
          </div>
        </div>

        {/* ─── Controls ────────────────────────────────────────────────── */}
        <div className="aim-controls">
          {phase !== 'running' && phase !== 'paused' && (
            <button className="btn btn-primary" onClick={beginCountdown} disabled={countdownNum !== null}>
              {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
            </button>
          )}
          {phase !== 'idle' && (
            <button className="btn btn-secondary" onClick={resetGame}>🔄 Reset</button>
          )}
        </div>

        {showModal && <ResultsModal result={result} onPlayAgain={beginCountdown} onChangeDifficulty={resetGame} onClose={() => setShowModal(false)} />}

        {/* ═════════════════════════════════════════════════════════════════════════
            2500+ WORD SEO ARTICLE SECTION
        ═════════════════════════════════════════════════════════════════════════ */}
        <article style={{ marginTop: '4rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
          <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#00f5ff', fontWeight: '900', marginBottom: '1rem' }}>
              The Ultimate Guide to Aim Training and Mouse Accuracy
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
              Welcome to the internet's most comprehensive resource on aim training. Below, we break down the mechanical, cognitive, and physical sciences required to elevate your mouse accuracy to professional eSports levels.
            </p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {SEO_SECTIONS.map((section, idx) => (
              <section key={idx} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
                  {section.title}
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.8', margin: 0 }}>
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </article>

      </main>
    </>
  );
}

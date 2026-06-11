/**
 * AimTrainerPage.tsx
 * - Hit sound (crisp pop) + Miss sound (dull thud) with ON/OFF toggle
 * - Donut target with instant visual reaction on click (shrink + flash)
 * - Pro SEO: semantic HTML, JSON-LD WebApplication + FAQPage schema
 * - Security: bounded refs, rate-limited clicks, memory-capped history,
 *   no dangerouslySetInnerHTML, full cleanup on unmount
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const GAME_DURATION   = 30;       // seconds
const SPAWN_INTERVAL  = 800;      // ms between auto-spawns
const TARGET_LIFETIME = 2000;     // ms before a target disappears
const MAX_TARGETS     = 5;        // max simultaneous targets on screen
const MAX_HISTORY     = 10;       // cap session history (memory safety)
const MIN_SIZE        = 40;       // px — minimum target diameter
const MAX_SIZE        = 80;       // px — maximum target diameter
const CLICK_RATE_MS   = 30;       // Security: ignore clicks faster than 30ms (bot guard)

// ─── Types ───────────────────────────────────────────────────────────────────
interface Target { id: number; x: number; y: number; size: number; }
type Phase = 'idle' | 'running' | 'done';

// ─── Sound engine (Web Audio API — zero deps) ─────────────────────────────────
function playHit(ctx: AudioContext) {
  // Crisp high pop — confirms a successful hit
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.3,  ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
}

function playMiss(ctx: AudioContext) {
  // Low dull thud — penalises a miss
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.2,  ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12);
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────
const JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Aim Trainer — Mouse Accuracy & Reaction Time Test',
  description: 'Free online aim trainer. Improve mouse accuracy, flick speed, and reaction time for FPS games like CS2, Valorant, Fortnite, and more.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

// ─── Safe JSON-LD injector ────────────────────────────────────────────────────
function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = data;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
  return null;
}

// ─── Static FAQ data ──────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How to improve reaction time in FPS games?',
    a: 'Train your brain\'s cognitive processing by daily aim sessions. Pair practice with a high-refresh monitor (144Hz+) and a low-latency mouse to physically reduce input lag. Focus on reading target spawn positions rather than reacting after they appear.',
  },
  {
    q: 'Does aim training help in Minecraft, Roblox, or League of Legends?',
    a: 'Yes. In Minecraft, tracking a strafing player while landing hits separates PvP masters from average players. In League of Legends, precise clicking prevents misclicks during team fights. In Roblox and Fortnite, fast accurate crosshair placement speeds up mechanical execution.',
  },
  {
    q: 'What is the difference between arm aiming and wrist aiming?',
    a: 'Arm aiming (low DPI, large mouse movements) is better for large flicks and long-term wrist health. Wrist aiming (higher DPI, small movements) suits micro-adjustments. Most pro players use low DPI (400–800) and arm-aim for consistency.',
  },
] as const;

const GAMES = [
  'Minecraft','Roblox','Fortnite','Grand Theft Auto V',
  'Call of Duty: Warzone','League of Legends','Counter-Strike 2',
  'PUBG: Battlegrounds','Genshin Impact','Among Us',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AimTrainerPage() {
  const [phase,    setPhase]    = useState<Phase>('idle');
  const [targets,  setTargets]  = useState<Target[]>([]);
  const [score,    setScore]    = useState(0);
  const [misses,   setMisses]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [history,  setHistory]  = useState<{ score: number; acc: number }[]>([]);
  const [soundOn,  setSoundOn]  = useState(true);
  // IDs of targets currently in "hit" animation
  const [hitIds,   setHitIds]   = useState<Set<number>>(new Set());

  const areaRef       = useRef<HTMLDivElement>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTimeouts= useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const targetId      = useRef(0);
  const totalClicks   = useRef(0);
  const hitClicks     = useRef(0);
  const phaseRef      = useRef<Phase>('idle');
  const lastClickTime = useRef(0);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const soundOnRef    = useRef(soundOn);

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: 'hit' | 'miss') => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      type === 'hit' ? playHit(ctx) : playMiss(ctx);
    } catch { /* silently ignore */ }
  }, [getAudioCtx]);

  // Cleanup all timers on unmount
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    targetTimeouts.current.forEach(t => clearTimeout(t));
    audioCtxRef.current?.close();
  }, []);

  const removeTarget = useCallback((id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setHitIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    targetTimeouts.current.delete(id);
  }, []);

  const spawnTarget = useCallback(() => {
    if (!areaRef.current || phaseRef.current !== 'running') return;
    const rect = areaRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Security: clamp size to known safe range
    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    const x    = Math.max(size / 2, Math.min(rect.width  - size / 2, size / 2 + Math.random() * (rect.width  - size)));
    const y    = Math.max(size / 2, Math.min(rect.height - size / 2, size / 2 + Math.random() * (rect.height - size)));
    const id   = ++targetId.current;

    // Security: cap simultaneous targets to prevent DOM flooding
    setTargets(prev => {
      if (prev.length >= MAX_TARGETS) return prev;
      return [...prev, { id, x, y, size }];
    });

    // Auto-expire target
    const t = setTimeout(() => removeTarget(id), TARGET_LIFETIME);
    targetTimeouts.current.set(id, t);
  }, [removeTarget]);

  const endGame = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setTargets([]);
    setPhase('done');
  }, []);

  const startGame = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';

    // Reset state
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setHitIds(new Set());
    totalClicks.current  = 0;
    hitClicks.current    = 0;
    targetId.current     = 0;
    lastClickTime.current = 0;
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();

    // Spawn first target immediately, then on interval
    spawnTarget();
    spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);

    // Countdown timer
    const start = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const left    = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) endGame();
    }, 50);
  }, [spawnTarget, endGame]);

  // Save history when game ends
  useEffect(() => {
    if (phase === 'done') {
      const acc = totalClicks.current > 0
        ? Math.round((hitClicks.current / totalClicks.current) * 100) : 0;
      // Security: cap history length
      setHistory(prev => [{ score: hitClicks.current, acc }, ...prev.slice(0, MAX_HISTORY - 1)]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const resetGame = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    targetTimeouts.current.forEach(t => clearTimeout(t));
    targetTimeouts.current.clear();
    setPhase('idle');
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setHitIds(new Set());
    totalClicks.current   = 0;
    hitClicks.current     = 0;
    lastClickTime.current = 0;
  }, []);

  const hitTarget = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phaseRef.current !== 'running') return;

    // Security: rate-limit rapid clicks (bot/auto-clicker guard)
    const now = performance.now();
    if (now - lastClickTime.current < CLICK_RATE_MS) return;
    lastClickTime.current = now;

    // Cancel auto-expire
    const t = targetTimeouts.current.get(id);
    if (t) { clearTimeout(t); targetTimeouts.current.delete(id); }

    // Trigger hit animation briefly, then remove
    setHitIds(prev => new Set(prev).add(id));
    setTimeout(() => removeTarget(id), 120);

    setScore(prev => prev + 1);
    hitClicks.current++;
    totalClicks.current++;
    playSound('hit');
    spawnTarget();
  }, [spawnTarget, removeTarget, playSound]);

  const missClick = useCallback(() => {
    if (phaseRef.current !== 'running') return;

    // Security: rate-limit
    const now = performance.now();
    if (now - lastClickTime.current < CLICK_RATE_MS) return;
    lastClickTime.current = now;

    setMisses(prev => prev + 1);
    totalClicks.current++;
    playSound('miss');
  }, [playSound]);

  // Derived
  const acc      = totalClicks.current > 0
    ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100;
  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;

  return (
    <>
      <JsonLd data={JSON_LD} />

      <main
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
        role="main"
        aria-label="Aim Trainer"
      >
        <style>{`
          @keyframes target-pop {
            0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0; }
            60%  { transform: translate(-50%,-50%) scale(1.08); opacity: 1; }
            100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          }
          @keyframes target-hit {
            0%   { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
            100% { transform: translate(-50%,-50%) scale(1.35); opacity: 0; }
          }
          @media (max-width: 600px) {
            .aim-stats-grid  { grid-template-columns: repeat(2,1fr) !important; gap: 0.6rem !important; }
            .aim-game-area   { height: 280px !important; }
            .aim-controls    { flex-direction: column !important; align-items: stretch !important; }
            .aim-controls button { width: 100% !important; }
            .aim-games-grid  { grid-template-columns: repeat(2,1fr) !important; }
            .aim-article-wrap { padding: 1.25rem !important; }
          }
        `}</style>

        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Aim Tool</div>
          <h1 className="tool-title">Aim Trainer</h1>
          <p className="tool-subtitle">Click targets as fast and accurately as possible</p>
        </header>

        {/* ── Sound Toggle ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setSoundOn(v => !v)}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to unmute'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.9rem', borderRadius: '8px',
              border: soundOn ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: soundOn ? 'rgba(0,245,255,0.12)' : 'var(--bg-card)',
              color: soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span>{soundOn ? '🔊' : '🔇'}</span>
            <span>{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div
          className="aim-stats-grid"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Hits: ${score}, Misses: ${misses}, Accuracy: ${acc}%, Time left: ${timeLeft.toFixed(1)} seconds`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1rem' }}
        >
          {[
            { value: score,               label: 'Hits',     color: 'var(--neon-green)'  },
            { value: misses,              label: 'Misses',   color: 'var(--neon-red)'    },
            { value: `${acc}%`,           label: 'Accuracy', color: 'var(--neon-cyan)'   },
            { value: timeLeft.toFixed(1), label: 'Seconds',  color: 'var(--neon-orange)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}
          aria-label="Game progress"
          style={{ marginBottom: '1rem' }}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Game Area ── */}
        <div
          ref={areaRef}
          onClick={missClick}
          className="aim-game-area"
          role={phase === 'running' ? 'region' : undefined}
          aria-label={phase === 'running' ? 'Aim training area — click the targets' : undefined}
          style={{
            position: 'relative', width: '100%', height: '400px',
            background: 'var(--bg-card)',
            border: `2px solid ${phase === 'running' ? 'var(--neon-green)' : 'var(--border)'}`,
            borderRadius: '16px', overflow: 'hidden',
            cursor: phase === 'running' ? 'crosshair' : 'default',
            marginBottom: '1.5rem',
            boxShadow: phase === 'running' ? '0 0 30px rgba(0,255,136,0.1)' : 'none',
          }}
        >
          {phase === 'idle' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '4rem' }} aria-hidden="true">🎯</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click Start to Play</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click the targets as fast as you can!</span>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.7)' }}>
              <span style={{ fontSize: '3rem' }} aria-hidden="true">🏁</span>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)' }}>Time's Up!</span>
              <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--neon-green)' }}>{score} Hits</span>
              <span style={{ color: 'var(--text-secondary)' }}>{acc}% Accuracy</span>
            </div>
          )}

          {/* ── Targets — donut design with hit animation ── */}
          {targets.map(t => {
            const isHit = hitIds.has(t.id);
            return (
              <div
                key={t.id}
                onClick={e => hitTarget(t.id, e)}
                role="button"
                aria-label="Target — click to hit"
                style={{
                  position: 'absolute',
                  left: t.x, top: t.y,
                  width: t.size, height: t.size,
                  borderRadius: '50%',
                  transform: 'translate(-50%,-50%)',
                  cursor: 'crosshair',
                  // Donut: thick border + transparent center ring
                  background: isHit
                    ? 'radial-gradient(circle, rgba(255,255,255,0.95) 18%, rgba(255,200,0,0.9) 38%, transparent 38%, transparent 58%, rgba(255,200,0,0.9) 58%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.9) 18%, rgba(255,45,85,0.95) 38%, transparent 38%, transparent 58%, rgba(255,45,85,0.85) 58%)',
                  border: `3px solid ${isHit ? 'rgba(255,220,0,0.9)' : 'rgba(255,255,255,0.85)'}`,
                  boxShadow: isHit
                    ? `0 0 25px rgba(255,220,0,0.8), 0 0 50px rgba(255,220,0,0.4)`
                    : `0 0 20px rgba(255,45,85,0.55)`,
                  animation: isHit ? 'target-hit 0.12s ease-out forwards' : 'target-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  transition: 'box-shadow 0.05s',
                  willChange: 'transform, opacity',
                }}
              />
            );
          })}
        </div>

        {/* ── Controls ── */}
        <div
          className="aim-controls"
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}
        >
          {phase !== 'running' && (
            <button className="btn btn-primary" onClick={startGame} aria-label={phase === 'done' ? 'Play again' : 'Start aim trainer'}>
              {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
            </button>
          )}
          {phase !== 'idle' && (
            <button className="btn btn-secondary" onClick={resetGame} aria-label="Reset game">
              🔄 Reset
            </button>
          )}
        </div>

        {/* ── Session History ── */}
        {history.length > 0 && (
          <section
            aria-label="Session history"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
              📊 Session History
            </div>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', fontSize: '0.875rem', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: '700' }}>{h.score} hits</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{h.acc}% acc</span>
              </div>
            ))}
          </section>
        )}

        {/* ── SEO Article ── */}
        <article
          className="aim-article-wrap"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem', marginTop: '3rem' }}
        >
          <section style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>

            <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--neon-cyan)', marginTop: '0', letterSpacing: '-0.5px' }}>
              The Ultimate Guide to Aim Training & Mouse Accuracy
            </h2>
            <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
              An <strong>Aim Trainer</strong> is a specialized tool designed to help gamers test and improve their mouse reaction time, clicking accuracy, and spatial tracking. In competitive eSports, raw CPS means nothing without precision. Our 2D Aim Trainer isolates your mechanical mouse control, building stable neural pathways between eyes and hands.
            </p>

            <div style={{ background: 'rgba(0,255,136,0.05)', borderLeft: '4px solid var(--neon-green)', borderRadius: '0 12px 12px 0', padding: '1.5rem', marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginTop: '0', marginBottom: '0.5rem' }}>
                🖱️ The Ultimate Mouse Sensor Check
              </h3>
              <p style={{ margin: 0, color: '#9ca3af' }}>
                Our Aim Trainer doubles as a <strong>new mouse check</strong>. By hitting small randomly spawning targets rapidly, you can immediately test your mouse's optical sensor for tracking spin-outs, verify zero acceleration, and dial in your DPI before a competitive match.
              </p>
            </div>

            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Why Aim Matters in These Top Global Games
            </h3>
            <div
              className="aim-games-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '3rem' }}
            >
              {GAMES.map(game => (
                <div key={game} style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--neon-green)' }} aria-hidden="true">🎯</span> {game}
                </div>
              ))}
            </div>

            {/* FAQ with Schema.org FAQPage markup */}
            <div
              itemScope
              itemType="https://schema.org/FAQPage"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <h2 style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '0', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                Pro FPS Strategies & FAQs
              </h2>

              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <h3 itemProp="name" style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem', marginTop: 0 }}>{q}</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text" style={{ color: '#9ca3af', margin: 0 }}>{a}</p>
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--neon-orange)', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                  💡 Pro Tip: Warm Up Before Ranked Play
                </h4>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                  Use this Aim Trainer for 5–10 minutes before launching competitive matches. Low DPI (400–800) arm-aiming builds consistency; save wrist aiming for micro-adjustments only. This prevents strain and produces far greater long-term accuracy.
                </p>
              </div>
            </div>

          </section>
        </article>
      </main>
    </>
  );
}

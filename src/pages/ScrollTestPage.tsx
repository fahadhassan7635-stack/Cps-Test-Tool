/**
 * ScrollTestPage.tsx
 * - Scroll sound (Web Audio API) with ON/OFF toggle
 * - Pro SEO: semantic HTML, JSON-LD (WebApplication + FAQPage schema)
 * - Security: bounded inputs, rate-limiting, memory cap, safe event handling,
 *   no dangerouslySetInnerHTML, cleanup on unmount
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DURATIONS        = [5, 10, 15, 30] as const;
const MAX_CUSTOM_SEC   = 300;   // Security: cap custom input at 5 min
const MIN_CUSTOM_SEC   = 1;
const DIRECTION_RESET  = 300;   // ms before direction indicator fades
const RATE_LIMIT_MS    = 16;    // ~60fps max scroll event processing

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'running' | 'done';
type Dir   = 'up' | 'down' | null;

interface Rank {
  name: string; emoji: string; color: string; stars: number; desc: string;
}

// ─── Sound engine (Web Audio API — zero external deps) ────────────────────────
function createScrollSound(ctx: AudioContext, dir: 'up' | 'down') {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  // Up scroll → higher pitch tick; Down scroll → lower pitch tick
  const freq = dir === 'up' ? 660 : 440;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.75, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.07);
}

// ─── Rating helper ────────────────────────────────────────────────────────────
const getRank = (cps: number): Rank => {
  if (cps >= 45) return { name: 'Machine', emoji: '🤖', color: 'var(--neon-red, #ff2d55)',        stars: 5, desc: 'Unbelievable dynamic velocity! Your flywheel rotations operate at cybernetic levels. Pure hardware mastery!' };
  if (cps >= 35) return { name: 'Cheetah', emoji: '🐆', color: 'var(--neon-orange, #f97316)',     stars: 4, desc: 'Blistering performance! Your continuous finger strokes cut through the scrolling matrix with relentless raw speed.' };
  if (cps >= 25) return { name: 'Fox',     emoji: '🦊', color: 'var(--neon-cyan, #00f5ff)',       stars: 3, desc: 'Sharp, tactical, and incredibly responsive. Excellent finger flick mechanics and scroll wheel coordination.' };
  if (cps >= 15) return { name: 'Turtle',  emoji: '🐢', color: 'var(--neon-green, #10b981)',      stars: 2, desc: 'Steady execution, but you are playing it safe. Try looser grip styles to unlock your real mechanical threshold!' };
  return               { name: 'Snail',   emoji: '🐌', color: 'var(--text-secondary, #94a3b8)', stars: 1, desc: 'Very passive crawl rhythm. Shake out your hand, align your index finger, and apply faster burst ticks!' };
};

// ─── Static FAQ data (never from user input — XSS safe) ──────────────────────
const FAQS = [
  {
    q: 'How is CPS (Scrolls Per Second) evaluated mathematically?',
    a: 'The tool divides your total raw input count by the elapsed time: Scroll Count ÷ Duration. Running the test over longer frames (e.g. 30 s) checks muscular endurance and consistency over raw burst limits.',
  },
  {
    q: 'What causes a mouse wheel to miss inputs or skip directions?',
    a: 'This usually stems from dusty rotary components or a failing mechanical encoder gear. Accumulating lint breaks down copper terminal sweeps, leading to intermittent signal drops or reverse ghost inputs.',
  },
  {
    q: 'Does this tool support infinite scroll wheels (free-spin mode)?',
    a: 'Yes! If your device (e.g. Logitech G502 or Razer Basilisk) features an unlocked fluid flywheel, you can achieve extraordinarily high burst values — the listener maps physical raw spin performance directly.',
  },
] as const;

// ─── Rank table rows (static) ─────────────────────────────────────────────────
const RANK_TABLE = [
  { name: 'Snail',   range: '< 15 CPS',  color: '#94a3b8',                  desc: 'Casual web browsing pace. Normal physical finger movement.'                      },
  { name: 'Turtle',  range: '15–24 CPS', color: 'var(--neon-green)',         desc: 'Standard gaming reflexes. Clean wheel step coordination.'                        },
  { name: 'Fox',     range: '25–34 CPS', color: 'var(--neon-cyan)',          desc: 'Advanced finger flicking or high-spec mechanical encoders.'                      },
  { name: 'Cheetah', range: '35–44 CPS', color: 'var(--neon-orange)',        desc: 'Exceptional mechanics. Typically reached via mouse hyper-scrolling.'             },
  { name: 'Machine', range: '45+ CPS',   color: 'var(--neon-red, #ff2d55)', desc: 'Top-tier physical burst limits or automated free-spin infinite wheel options.'   },
] as const;

// ─── JSON-LD structured data ──────────────────────────────────────────────────
const JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Scroll Wheel Test — CPS Speed & Hardware Diagnostic',
  description: 'Free online scroll wheel speed tester. Measure scroll inputs per second (CPS), check mouse encoder health, and benchmark your scroll reflex.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

// ─── Safe JSON-LD injector ────────────────────────────────────────────────────
function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = data; // textContent is XSS-safe
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScrollTestPage() {
  const [scrollCount,  setScrollCount]  = useState(0);
  const [upScrolls,    setUpScrolls]    = useState(0);
  const [downScrolls,  setDownScrolls]  = useState(0);
  const [direction,    setDirection]    = useState<Dir>(null);
  const [phase,        setPhase]        = useState<Phase>('idle');
  const [timeLeft,     setTimeLeft]     = useState(10);
  const [duration,     setDuration]     = useState(10);
  const [customTime,   setCustomTime]   = useState('');
  const [soundOn,      setSoundOn]      = useState(true);

  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const dirTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const startTime      = useRef(0);
  const zoneRef        = useRef<HTMLDivElement>(null);
  const durationRef    = useRef(duration);
  const phaseRef       = useRef<Phase>('idle');
  const lastWheelRef   = useRef(0); // rate-limit guard
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const soundOnRef     = useRef(soundOn);

  useEffect(() => { durationRef.current = duration; },  [duration]);
  useEffect(() => { soundOnRef.current  = soundOn;  },  [soundOn]);

  // Lazy-init AudioContext (browser autoplay policy)
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playScroll = useCallback((dir: 'up' | 'down') => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      createScrollSound(ctx, dir);
    } catch { /* silently ignore if audio unavailable */ }
  }, [getAudioCtx]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (dirTimerRef.current) clearTimeout(dirTimerRef.current);
    audioCtxRef.current?.close();
  }, []);

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPhase('done');
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';
    const dur = durationRef.current;

    setPhase('running');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    setTimeLeft(dur);
    startTime.current  = performance.now();
    lastWheelRef.current = 0;

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left    = Math.max(0, dur - elapsed);
      setTimeLeft(left);
      if (left <= 0) endTest();
    }, 50);

    zoneRef.current?.focus();
  }, [endTest]);

  const resetGame = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current)    { clearInterval(timerRef.current);  timerRef.current    = null; }
    if (dirTimerRef.current) { clearTimeout(dirTimerRef.current); dirTimerRef.current = null; }
    setPhase('idle');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    setDirection(null);
    setTimeLeft(durationRef.current);
    lastWheelRef.current = 0;
  }, []);

  // Security: sanitize and bound custom time input
  const handleCustomTimeSet = useCallback(() => {
    const raw  = parseInt(customTime, 10);
    if (!Number.isFinite(raw)) return;
    const time = Math.min(MAX_CUSTOM_SEC, Math.max(MIN_CUSTOM_SEC, raw));
    setDuration(time);
    durationRef.current = time;
    resetGame();
    setTimeLeft(time);
  }, [customTime, resetGame]);

  const handleCustomTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Security: digits only, max 4 chars
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCustomTime(val);
  }, []);

  // Wheel event handler (attached to zone div, passive: false to allow preventDefault)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (phaseRef.current !== 'running') return;
      e.preventDefault();

      // Security: rate-limit — ignore events faster than ~60fps
      const now = performance.now();
      if (now - lastWheelRef.current < RATE_LIMIT_MS) return;
      lastWheelRef.current = now;

      const dir: 'up' | 'down' = e.deltaY < 0 ? 'up' : 'down';
      setDirection(dir);
      setScrollCount(prev => prev + 1);
      if (dir === 'up') setUpScrolls(prev => prev + 1);
      else              setDownScrolls(prev => prev + 1);
      playScroll(dir);

      // Auto-clear direction indicator
      if (dirTimerRef.current) clearTimeout(dirTimerRef.current);
      dirTimerRef.current = setTimeout(() => setDirection(null), DIRECTION_RESET);
    };

    const el = zoneRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', handleWheel); };
  }, [playScroll]); // stable — phaseRef accessed by ref, not state

  // Scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  // Derived values
  const elapsed  = duration - timeLeft;
  const liveCps  = phase === 'running' && elapsed > 0
    ? (scrollCount / elapsed).toFixed(1) : '0.0';
  const finalCps = duration > 0 ? scrollCount / duration : 0;
  const progress = phase === 'running' ? (elapsed / duration) * 100
    : phase === 'done' ? 100 : 0;
  const currentRank = getRank(finalCps);

  return (
    <>
      <JsonLd data={JSON_LD} />

      <main
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
        role="main"
        aria-label="Scroll Wheel Speed Test"
      >
        <style>{`
          @keyframes fadeIn    { from { opacity: 0; }                                        to { opacity: 1; } }
          @keyframes modalPopIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
          }
        `}</style>

        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Mouse Tool</div>
          <h1 className="tool-title">Scroll Wheel Test</h1>
          <p className="tool-subtitle">Test your scroll wheel speed and sensitivity</p>
        </header>

        {/* ── Duration selector + Sound toggle ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
          {DURATIONS.map(d => (
            <button
              key={d}
              aria-pressed={duration === d && !customTime}
              onClick={() => { setDuration(d); durationRef.current = d; resetGame(); setTimeLeft(d); setCustomTime(''); }}
              disabled={phase === 'running'}
              style={{
                padding: '0.4rem 1rem', borderRadius: '8px',
                border: duration === d && !customTime ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
                background: duration === d && !customTime ? 'rgba(0,245,255,0.15)' : 'var(--bg-card)',
                color: duration === d && !customTime ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', transition: 'all 0.2s',
              }}
            >{d}s</button>
          ))}

          {/* Custom time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.2rem 0.2rem 0.2rem 0.6rem' }}>
            <label htmlFor="scroll-custom-time" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Custom:</label>
            <input
              id="scroll-custom-time"
              type="text"
              inputMode="numeric"
              value={customTime}
              onChange={handleCustomTimeChange}
              disabled={phase === 'running'}
              placeholder="sec"
              maxLength={4}
              autoComplete="off"
              aria-label="Custom duration in seconds"
              style={{ width: '50px', background: 'transparent', border: 'none', color: 'var(--neon-cyan)', fontWeight: '700', outline: 'none', textAlign: 'center', fontSize: '0.85rem' }}
            />
            <button
              onClick={handleCustomTimeSet}
              disabled={phase === 'running' || !customTime}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: '6px',
                background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
                color: 'var(--neon-cyan)', fontWeight: '700',
                cursor: phase === 'running' || !customTime ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', transition: 'all 0.2s',
              }}
            >Set</button>
          </div>

          {/* ── Sound Toggle ── */}
          <button
            onClick={() => setSoundOn(v => !v)}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to unmute'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.85rem', borderRadius: '8px',
              border: soundOn ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: soundOn ? 'rgba(0,245,255,0.12)' : 'var(--bg-card)',
              color: soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{soundOn ? '🔊' : '🔇'}</span>
            <span>{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Total: ${scrollCount}, Up: ${upScrolls}, Down: ${downScrolls}, CPS: ${phase === 'running' ? liveCps : finalCps.toFixed(2)}`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}
        >
          {[
            { value: scrollCount,                                                          label: 'Total',  color: 'var(--neon-cyan)'              },
            { value: upScrolls,                                                            label: '↑ Up',   color: 'var(--neon-green)'             },
            { value: downScrolls,                                                          label: '↓ Down', color: 'var(--neon-orange)'            },
            { value: phase === 'running' ? liveCps : finalCps.toFixed(1),                 label: 'CPS',    color: 'var(--neon-purple, #a855f7)'   },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Test progress"
          style={{ marginBottom: '1.25rem' }}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Main Interaction Zone ── */}
        <div
          ref={zoneRef}
          tabIndex={0}
          onClick={phase === 'idle' ? start : undefined}
          role={phase === 'idle' ? 'button' : 'region'}
          aria-label={
            phase === 'idle'    ? 'Click to start, then scroll inside this zone' :
            phase === 'running' ? 'Scroll zone — scroll your mouse wheel as fast as possible' :
            'Test complete'
          }
          style={{
            width: '100%', minHeight: '280px',
            background: 'var(--bg-card)',
            border: `2px solid ${
              phase === 'running'
                ? (direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--neon-cyan)')
                : 'var(--border)'
            }`,
            borderRadius: '16px',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '1rem', userSelect: 'none', outline: 'none', marginBottom: '1.5rem',
            transition: 'border-color 0.1s',
            boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.08)' : 'none',
            padding: '1.5rem',
          }}
        >
          {phase === 'idle' && (
            <>
              <div style={{ fontSize: '4rem' }} aria-hidden="true">🔄</div>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Click to Start</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Then scroll your mouse wheel as fast as possible!</span>
            </>
          )}

          {phase === 'running' && (
            <>
              <div
                aria-hidden="true"
                style={{
                  fontSize: '4rem',
                  transform: direction === 'up' ? 'translateY(-8px)' : direction === 'down' ? 'translateY(8px)' : 'translateY(0)',
                  transition: 'transform 0.1s',
                  color: direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--text-secondary)',
                }}
              >🔄</div>
              <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{scrollCount}</div>
              <span style={{ color: 'var(--text-secondary)' }}>🔄 Keep scrolling inside this box!</span>
              <span style={{ color: 'var(--neon-orange)', fontWeight: '700' }}>{timeLeft.toFixed(1)}s</span>
            </>
          )}

          {phase === 'done' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">🏁</span>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--neon-cyan)', lineHeight: 1 }}>
                {finalCps.toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>CPS</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: currentRank.color }}>
                Rank: {currentRank.name}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You scrolled <strong>{scrollCount}</strong> times in {duration} seconds.
              </span>
            </div>
          )}
        </div>

        {/* ── Reset button during test ── */}
        {phase === 'running' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
            <button
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              aria-label="Reset test"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#1e2235', border: '1px solid #2a3047', color: '#ffffff',
                padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#252a40'; e.currentTarget.style.borderColor = '#3b4363'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e2235'; e.currentTarget.style.borderColor = '#2a3047'; }}
            >
              <div style={{ background: '#3b82f6', color: 'white', borderRadius: '4px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </div>
              Reset
            </button>
          </div>
        )}

        {/* ── Result Modal ── */}
        {phase === 'done' && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
              }}
              onClick={() => resetGame()}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Result: ${currentRank.name} rank with ${finalCps.toFixed(2)} CPS`}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '95%', maxWidth: '560px', background: '#0d1117',
                border: `2px solid ${currentRank.color}`, borderRadius: '20px', padding: '2rem 1.5rem',
                textAlign: 'center', zIndex: 1000,
                animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                boxShadow: `0 0 40px ${currentRank.color}25`,
              }}
            >
              <button
                onClick={() => resetGame()}
                aria-label="Close result dialog"
                style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${currentRank.color}40`,
                  color: currentRank.color, width: '32px', height: '32px',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', alignItems: 'center', minHeight: '130px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '1rem', height: '100%' }}>
                  <span aria-hidden="true" style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${currentRank.color}40)` }}>
                    {currentRank.emoji}
                  </span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rank is</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: currentRank.color, fontStyle: 'italic', margin: '0.1rem 0' }}>{currentRank.name}!</div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }} aria-label={`${currentRank.stars} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} aria-hidden="true" style={{ fontSize: '1.2rem', color: i < currentRank.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    You scrolled at <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{finalCps.toFixed(2)}</strong> CPS
                  </div>
                </div>
              </div>

              <blockquote style={{
                background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '12px',
                borderLeft: `3px solid ${currentRank.color}`, fontStyle: 'italic', color: '#cbd5e1',
                fontSize: '0.88rem', textAlign: 'left', margin: '0 0 1.25rem 0', lineHeight: '1.5',
              }}>
                {currentRank.desc}
              </blockquote>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  { value: scrollCount,  label: 'Total Scrolls',  color: 'var(--neon-cyan)'   },
                  { value: upScrolls,    label: 'Up Scrolls ↑',   color: 'var(--neon-green)'  },
                  { value: downScrolls,  label: 'Down Scrolls ↓', color: 'var(--neon-orange)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '0.5rem 0.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => resetGame()}
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  🔄 Reset
                </button>
                <button className="btn btn-primary"
                  onClick={() => { resetGame(); setTimeout(() => start(), 100); }}
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: currentRank.color, borderColor: currentRank.color, color: '#000', fontWeight: '700' }}>
                  ▶ Try Again
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── SEO Article ── */}
        <article style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
          <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>

            <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
              What is a Scroll Wheel Test (CPS Checker)?
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A <strong>Scroll Wheel Test</strong> is a technical diagnostic utility that measures your hardware's scroll inputs per second (<strong>CPS</strong>). When you scroll a physical mouse wheel, the browser captures the <code>wheel</code> event and logs delta fluctuations. This tool is widely used by competitive gamers, web developers, and QA engineers to assess wheel step tactility, encoder responsiveness, and potential hardware degradation.
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
              Why Scroll Speed Matters for Gamers and Professionals
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              In tactical eSports like <em>Minecraft</em> (rapid inventory switching), <em>Apex Legends</em> (tap-strafing), or <em>Counter-Strike</em> (bunny-hop precision), the scroll wheel acts as a critical secondary execution layer. A quality mechanical or optical encoder translates fast continuous inputs into reliable in-game actions. For data analysts and developers, a smooth scroll engine ensures seamless navigation through spreadsheets or large codebases without fatigue.
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
              Scroll Speed (CPS) Performance Hierarchy
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: '#fff' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Rank</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>CPS Threshold</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Skill Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {RANK_TABLE.map(row => (
                    <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: row.color }}>{row.name}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{row.range}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FAQ with Schema.org FAQPage markup */}
            <div
              itemScope
              itemType="https://schema.org/FAQPage"
              style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}
            >
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
                Frequently Asked Questions (FAQs)
              </h3>
              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  style={{ marginBottom: i < FAQS.length - 1 ? '1.25rem' : 0 }}
                >
                  <h4 itemProp="name" style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>{q}</h4>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text" style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{a}</p>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </article>
      </main>
    </>
  );
}

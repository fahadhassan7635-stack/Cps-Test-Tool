import { useState, useRef, useCallback, useEffect } from 'react';

const DURATIONS = [1, 2, 5, 10, 15, 30, 60];

type Phase = 'idle' | 'running' | 'done';

interface ClickEvent { time: number; }

export default function CPSTestPage() {
  const [duration, setDuration] = useState(5);
  const [phase, setPhase] = useState<Phase>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [cps, setCps] = useState(0);
  const [maxCps, setMaxCps] = useState(0);
  const [history, setHistory] = useState<{ cps: number; clicks: number; duration: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickEvents = useRef<ClickEvent[]>([]);
  const rippleId = useRef(0);

  const getRating = (c: number) => {
    if (c >= 12) return { label: '🔥 Insane', color: 'var(--neon-red)' };
    if (c >= 9) return { label: '⚡ Elite', color: 'var(--neon-orange)' };
    if (c >= 7) return { label: '🎯 Pro', color: 'var(--neon-cyan)' };
    if (c >= 5) return { label: '✅ Good', color: 'var(--neon-green)' };
    return { label: '🐢 Beginner', color: 'var(--text-secondary)' };
  };

  const startTest = () => {
    setPhase('running');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(duration);
    clickEvents.current = [];
    startTime.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      // Calculate live CPS
      const now = performance.now();
      const recent = clickEvents.current.filter(e => now - e.time < 1000);
      const liveCps = recent.length;
      setCps(liveCps);
      setMaxCps(prev => Math.max(prev, liveCps));

      if (remaining <= 0) endTest();
    }, 50);
  };

  const endTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const totalClicks = clickEvents.current.length;
    const finalCps = parseFloat((totalClicks / duration).toFixed(2));
    setCps(finalCps);
    setClicks(totalClicks);
    setPhase('done');
    setTimeLeft(0);
    setHistory(prev => [{ cps: finalCps, clicks: totalClicks, duration }, ...prev.slice(0, 9)]);
  }, [duration]);

  const handleClick = (e: React.MouseEvent) => {
    if (phase === 'idle') { startTest(); return; }
    if (phase !== 'running') return;

    const now = performance.now();
    clickEvents.current.push({ time: now });
    setClicks(prev => prev + 1);

    // Ripple effect
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(duration);
    clickEvents.current = [];
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const rating = getRating(cps);
  const finalRating = phase === 'done' ? rating : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">CPS Test</h1>
        <p className="tool-subtitle">Clicks Per Second — How fast can you click?</p>
      </div>

      {/* Duration selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {DURATIONS.map(d => (
          <button
            key={d}
            onClick={() => { setDuration(d); resetTest(); setTimeLeft(d); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d ? '1px solid var(--neon-green)' : '1px solid var(--border)',
              background: duration === d ? 'rgba(0,255,136,0.15)' : 'var(--bg-card)',
              color: duration === d ? 'var(--neon-green)' : 'var(--text-secondary)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}
          >{d}s</button>
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: phase === 'idle' ? '0.00' : cps.toFixed ? cps.toFixed(2) : cps, label: 'CPS', color: 'var(--neon-cyan)' },
          { value: clicks, label: 'Clicks', color: 'var(--neon-green)' },
          { value: timeLeft.toFixed(1), label: 'Seconds Left', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Click Zone */}
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: '220px',
          borderRadius: '16px',
          border: phase === 'running'
            ? '2px solid var(--neon-green)'
            : phase === 'done'
            ? '2px solid var(--neon-orange)'
            : '2px solid var(--border)',
          background: phase === 'running'
            ? 'rgba(0,255,136,0.04)'
            : 'var(--bg-card)',
          cursor: phase === 'done' ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.75rem',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          marginBottom: '1.5rem',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,255,136,0.1)' : 'none',
        }}
      >
        {/* Ripples */}
        {ripples.map(r => (
          <span key={r.id} style={{
            position: 'absolute',
            left: r.x, top: r.y,
            width: '20px', height: '20px',
            borderRadius: '50%',
            background: 'rgba(0,255,136,0.5)',
            transform: 'translate(-50%,-50%) scale(0)',
            animation: 'ripple 0.6s ease-out forwards',
            pointerEvents: 'none',
          }} />
        ))}

        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '3rem' }}>🖱️</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click to Start!</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click anywhere in this area as fast as you can</span>
          </>
        )}

        {phase === 'running' && (
          <>
            <span style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-green)', fontVariantNumeric: 'tabular-nums' }}>{clicks}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Keep clicking! 🔥</span>
            <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{timeLeft.toFixed(1)}s remaining</span>
          </>
        )}

        {phase === 'done' && (
          <>
            <span style={{ fontSize: '3rem' }}>🏁</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Test Complete!</span>
          </>
        )}
      </div>

      {/* Results */}
      {phase === 'done' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Result</div>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
            {cps} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>CPS</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 1.2rem', borderRadius: '50px',
            background: `${finalRating?.color}15`,
            border: `1px solid ${finalRating?.color}30`,
            color: finalRating?.color,
            fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem',
          }}>{finalRating?.label}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { value: clicks, label: 'Total Clicks' },
              { value: `${maxCps}`, label: 'Peak CPS (1s)' },
              { value: `${duration}s`, label: 'Duration' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CPS scale */}
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CPS Rating Scale</div>
            {[
              { range: '1-4', label: 'Beginner', color: 'var(--text-secondary)' },
              { range: '5-7', label: 'Average', color: 'var(--neon-green)' },
              { range: '7-9', label: 'Pro', color: 'var(--neon-cyan)' },
              { range: '9-12', label: 'Elite', color: 'var(--neon-orange)' },
              { range: '12+', label: 'Insane', color: 'var(--neon-red)' },
            ].map(r => (
              <div key={r.range} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: r.color, fontWeight: '600' }}>{r.range} CPS</span>
                <span style={{ color: r.color }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {phase !== 'idle' && (
          <button className="btn btn-secondary" onClick={resetTest}>🔄 Reset</button>
        )}
        {phase === 'done' && (
          <button className="btn btn-primary" onClick={startTest}>▶ Try Again</button>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
            📊 Session History
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: '0.875rem',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.cps} CPS</span>
              <span style={{ color: 'var(--text-secondary)' }}>{h.clicks} clicks</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.duration}s test</span>
              <span style={{ color: getRating(h.cps).color, fontWeight: '600' }}>{getRating(h.cps).label.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.75rem', marginTop: '2rem',
      }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-cyan)' }}>About CPS Testing</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>CPS (Clicks Per Second)</strong> measures how fast you can click your mouse button. Professional gamers typically achieve 6-14 CPS, with elite players reaching 14+ using techniques like jitter clicking or butterfly clicking.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { title: '🖱️ Regular Click', desc: 'Standard clicking: 4-8 CPS. Good for most gaming.' },
            { title: '⚡ Jitter Click', desc: 'Vibrate your hand muscles: 8-14 CPS. Popular in PvP.' },
            { title: '🦋 Butterfly Click', desc: 'Two fingers alternating: 10-20 CPS. Risky for mice.' },
          ].map(tip => (
            <div key={tip.title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{tip.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

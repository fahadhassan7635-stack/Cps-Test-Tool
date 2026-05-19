import { useState, useEffect, useRef } from 'react';
 
export default function SpacebarPage() {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [duration, setDuration] = useState(10);
  const [history, setHistory] = useState<{ count: number; sps: number; duration: number }[]>([]);
  const [maxSps, setMaxSps] = useState(0);
 
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const pressEvents = useRef<number[]>([]);
  const phaseRef = useRef<'idle' | 'running' | 'done'>('idle'); // interval-এর ভেতর থেকে phase চেক করার জন্য
 
  const endTest = () => {
    if (phaseRef.current !== 'running') return; // একবারের বেশি call হলে ignore
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'done';
    setPhase('done');
  };
 
  const start = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'running';
    setPhase('running');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(duration);
    pressEvents.current = [];
    startTime.current = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
 
      const now = performance.now();
      const recent = pressEvents.current.filter(t => now - t < 1000);
      setMaxSps(prev => Math.max(prev, recent.length));
 
      if (left <= 0) endTest();
    }, 50);
  };
 
  const recordPress = () => {
    pressEvents.current.push(performance.now());
    setCount(prev => prev + 1);
  };
 
  const resetTest = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'idle';
    setPhase('idle');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(duration);
    pressEvents.current = [];
  };
 
  const handleSpacebar = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat) return;
    if (e.key !== ' ') return;
    if (phaseRef.current === 'idle') { start(); return; }
    if (phaseRef.current !== 'running') return;
    recordPress();
  };
 
  useEffect(() => {
    if (phase === 'done') {
      const sps = parseFloat((count / duration).toFixed(2));
      setHistory(prev => [{ count, sps, duration }, ...prev.slice(0, 9)]);
    }
  }, [phase]);
 
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return;
        if (phaseRef.current === 'idle') { start(); return; }
        if (phaseRef.current === 'running') recordPress();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration]);
 
  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);
 
  const sps = count > 0 && phase === 'running'
    ? ((count / Math.max(0.1, duration - timeLeft))).toFixed(1)
    : '0';
  const finalSps = parseFloat((count / duration).toFixed(2));
 
  const getRating = (n: number) => {
    if (n >= 15) return { label: '🔥 Machine', color: 'var(--neon-red)' };
    if (n >= 10) return { label: '⚡ Fast', color: 'var(--neon-orange)' };
    if (n >= 7)  return { label: '🎯 Good', color: 'var(--neon-cyan)' };
    if (n >= 4)  return { label: '✅ Average', color: 'var(--neon-green)' };
    return { label: '🐢 Slow', color: 'var(--text-secondary)' };
  };
 
  const progress = phase === 'running'
    ? ((duration - timeLeft) / duration) * 100
    : phase === 'done' ? 100 : 0;
 
  const finalRating = getRating(finalSps);
 
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Spacebar Counter</h1>
        <p className="tool-subtitle">Hit that spacebar as fast as you can!</p>
      </div>
 
      {/* Duration selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[5, 10, 15, 30, 60].map(d => (
          <button key={d}
            onClick={() => {
              setDuration(d);
              setPhase('idle');
              setCount(0);
              setTimeLeft(d);
              if (timerRef.current) clearInterval(timerRef.current);
            }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: duration === d ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
              color: duration === d ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}>{d}s</button>
        ))}
      </div>
 
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: count, label: 'Presses', color: 'var(--neon-cyan)' },
          { value: phase === 'running' ? sps : phase === 'done' ? finalSps.toFixed(2) : '0', label: 'Per Second', color: 'var(--neon-green)' },
          { value: timeLeft.toFixed(1), label: 'Seconds Left', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
 
      {/* Spacebar button */}
      <div
        tabIndex={0}
        onKeyDown={handleSpacebar}
        style={{ outline: 'none', marginBottom: '1.5rem' }}
      >
        <div style={{
          width: '100%', padding: '2.5rem 1rem', borderRadius: '16px',
          background: phase === 'running' ? 'rgba(0,245,255,0.05)' : 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? 'var(--neon-cyan)' : phase === 'done' ? 'var(--neon-orange)' : 'var(--border)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          cursor: 'default',
          userSelect: 'none',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.1)' : 'none',
          transition: 'all 0.2s',
        }}>
          {phase === 'idle' && (
            <>
              <span style={{ fontSize: '3rem' }}>▭</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>Press SPACE to Start</span>
            </>
          )}
          {phase === 'running' && (
            <>
              <div style={{ fontSize: '5rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{count}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Keep pressing SPACE! ⚡</div>
            </>
          )}
          {phase === 'done' && (
            <>
              <span style={{ fontSize: '3rem' }}>🏁</span>
              <button
                className="btn btn-primary"
                onClick={() => { resetTest(); setTimeout(() => start(), 300); }}
                style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}
              >▶ Try Again</button>
            </>
          )}
        </div>
 
        {/* Physical spacebar visual — hidden when done */}
        {phase !== 'done' && (
        <div style={{
          width: '100%', height: '52px', marginTop: '1rem',
          background: phase === 'running' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.06)',
          border: `2px solid ${phase === 'running' ? 'var(--neon-cyan)' : 'var(--border)'}`,
          borderBottom: `5px solid ${phase === 'running' ? 'rgba(0,180,200,0.8)' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: '700',
          color: phase === 'running' ? '#000' : 'var(--text-muted)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          transition: 'all 0.05s', cursor: 'default', userSelect: 'none',
          boxShadow: phase === 'running' ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
        }}>
          SPACEBAR
        </div>
        )}
      </div>
 
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {phase !== 'idle' && (
          <button className="btn btn-secondary" onClick={resetTest}>🔄 Reset</button>
        )}
      </div>
 
      {/* ── Results Modal (same style as CPS Test) ── */}
      {phase === 'done' && (
        <>
          {/* Backdrop */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={resetTest} />
 
          {/* Modal Card */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '360px',
            background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,255,136,0.08))',
            border: '2px solid rgba(0,245,255,0.3)',
            borderRadius: '20px',
            padding: '0.75rem',
            textAlign: 'center',
            zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(0,255,136,0.1)',
          }}>
            {/* Close Button */}
            <button onClick={resetTest} style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)',
              width: '32px', height: '32px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >✕</button>
 
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Your Result</div>
            <div style={{ fontSize: 'clamp(1.9rem, 5.5vw, 3rem)', fontWeight: '900', color: 'var(--neon-cyan)', marginBottom: '0.05rem', fontVariantNumeric: 'tabular-nums' }}>
              {finalSps.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>SPS</span>
            </div>
 
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3rem 0.85rem', borderRadius: '50px',
              background: `${finalRating.color}20`,
              border: `2px solid ${finalRating.color}50`,
              color: finalRating.color,
              fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.45rem',
            }}>{finalRating.label}</div>
 
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.2rem', marginBottom: '0.45rem' }}>
              {[
                { value: count, label: 'Total Presses' },
                { value: `${maxSps}`, label: 'Peak SPS (1s)' },
                { value: `${duration}s`, label: 'Duration' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                  padding: '0.3rem', border: '1px solid rgba(0,245,255,0.2)',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.04rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
 
            {/* SPS Rating Scale */}
            <div style={{
              textAlign: 'left', background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px', padding: '0.4rem', marginBottom: '0.45rem',
              border: '1px solid rgba(0,245,255,0.2)',
            }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>SPS Rating Scale</div>
              {[
                { range: '1-3',  label: 'Slow',    color: 'var(--text-secondary)' },
                { range: '4-6',  label: 'Average',  color: 'var(--neon-green)' },
                { range: '7-9',  label: 'Good',     color: 'var(--neon-cyan)' },
                { range: '10-14',label: 'Fast',     color: 'var(--neon-orange)' },
                { range: '15+',  label: 'Machine',  color: 'var(--neon-red)' },
              ].map(r => (
                <div key={r.range} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.1rem 0', fontSize: '0.6rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color: r.color, fontWeight: '600' }}>{r.range} SPS</span>
                  <span style={{ color: r.color }}>{r.label}</span>
                </div>
              ))}
            </div>
 
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.1rem' }}>
              <button className="btn btn-secondary" onClick={resetTest}
                style={{ animation: 'slideUp 0.4s ease-out 0.1s both', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                🔄 Reset
              </button>
              <button className="btn btn-primary" onClick={() => { resetTest(); setTimeout(() => start(), 300); }}
                style={{ animation: 'slideUp 0.4s ease-out 0.2s both', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                ▶ Try Again
              </button>
            </div>
          </div>
 
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalPopIn {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
              to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}
 
      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
            📊 Session History
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem', fontSize: '0.875rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.sps} SPS</span>
              <span style={{ color: 'var(--text-secondary)' }}>{h.count} presses</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.duration}s</span>
              <span style={{ color: getRating(h.sps).color, fontWeight: '600' }}>{getRating(h.sps).label.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';

export default function ScrollTestPage() {
  const [scrollCount, setScrollCount] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [duration, setDuration] = useState(10);
  const [upScrolls, setUpScrolls] = useState(0);
  const [downScrolls, setDownScrolls] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const zoneRef = useRef<HTMLDivElement>(null);

  const start = () => {
    setPhase('running');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    setTimeLeft(duration);
    startTime.current = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) { if (timerRef.current) clearInterval(timerRef.current); setPhase('done'); }
    }, 50);
    zoneRef.current?.focus();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (phase !== 'running') return;
    const dir = e.deltaY > 0 ? 'down' : 'up';
    setDirection(dir);
    setScrollCount(prev => prev + 1);
    if (dir === 'up') setUpScrolls(prev => prev + 1);
    else setDownScrolls(prev => prev + 1);
    setTimeout(() => setDirection(null), 300);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const sps = phase === 'running' && (duration - timeLeft) > 0
    ? (scrollCount / (duration - timeLeft)).toFixed(1)
    : '0';
  const finalSps = phase === 'done' && duration > 0 ? (scrollCount / duration).toFixed(2) : '0';
  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Scroll Wheel Test</h1>
        <p className="tool-subtitle">Test your scroll wheel speed and sensitivity</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[5, 10, 15, 30].map(d => (
          <button key={d} onClick={() => { setDuration(d); setPhase('idle'); setScrollCount(0); setTimeLeft(d); if (timerRef.current) clearInterval(timerRef.current); }}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: scrollCount, label: 'Total', color: 'var(--neon-cyan)' },
          { value: upScrolls, label: '↑ Up', color: 'var(--neon-green)' },
          { value: downScrolls, label: '↓ Down', color: 'var(--neon-orange)' },
          { value: phase === 'running' ? sps : finalSps, label: '/sec', color: 'var(--neon-purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Scroll zone */}
      <div
        ref={zoneRef}
        tabIndex={0}
        onWheel={handleWheel}
        onClick={phase === 'idle' ? start : undefined}
        style={{
          width: '100%', minHeight: '260px',
          background: 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? (direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--neon-cyan)') : 'var(--border)'}`,
          borderRadius: '16px', cursor: phase === 'idle' ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', userSelect: 'none', outline: 'none', marginBottom: '1.5rem',
          transition: 'border-color 0.1s',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.08)' : 'none',
        }}
      >
        <div style={{
          fontSize: '4rem',
          transform: direction === 'up' ? 'translateY(-8px)' : direction === 'down' ? 'translateY(8px)' : 'translateY(0)',
          transition: 'transform 0.1s',
          color: direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--text-secondary)',
        }}>🔄</div>

        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Click to Start</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Then scroll your mouse wheel as fast as possible!</span>
          </>
        )}
        {phase === 'running' && (
          <>
            <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{scrollCount}</div>
            <span style={{ color: 'var(--text-secondary)' }}>🔄 Keep scrolling!</span>
            <span style={{ color: 'var(--neon-orange)', fontWeight: '700' }}>{timeLeft.toFixed(1)}s</span>
          </>
        )}
        {phase === 'done' && (
          <>
            <span style={{ fontSize: '2.5rem' }}>🏁</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{scrollCount} scrolls</span>
            <span style={{ color: 'var(--neon-green)', fontWeight: '600' }}>{finalSps} per second</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setScrollCount(0); setUpScrolls(0); setDownScrolls(0); setTimeLeft(duration); }}>🔄 Reset</button>}
        {phase === 'done' && <button className="btn btn-primary" onClick={start}>▶ Try Again</button>}
      </div>
    </div>
  );
}

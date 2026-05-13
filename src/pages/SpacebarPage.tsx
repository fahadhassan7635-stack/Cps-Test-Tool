import { useState, useEffect, useRef } from 'react';

export default function SpacebarPage() {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [duration, setDuration] = useState(10);
  const [history, setHistory] = useState<{ count: number; sps: number; duration: number }[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);

  const start = () => {
    setPhase('running');
    setCount(0);
    setTimeLeft(duration);
    startTime.current = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) endTest();
    }, 50);
  };

  const endTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
  };

  const handleSpacebar = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e) e.preventDefault();
    if ('key' in e && e.key !== ' ') return;
    if (phase === 'idle') { start(); return; }
    if (phase !== 'running') return;
    setCount(prev => prev + 1);
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sps = count > 0 && phase === 'running' ? ((count / Math.max(0.1, duration - timeLeft))).toFixed(1) : '0';
  const finalSps = count > 0 ? (count / duration).toFixed(2) : '0';

  const getRating = (n: number) => {
    if (n >= 15) return { label: '🔥 Machine', color: 'var(--neon-red)' };
    if (n >= 10) return { label: '⚡ Fast', color: 'var(--neon-orange)' };
    if (n >= 7) return { label: '🎯 Good', color: 'var(--neon-cyan)' };
    if (n >= 4) return { label: '✅ Average', color: 'var(--neon-green)' };
    return { label: '🐢 Slow', color: 'var(--text-secondary)' };
  };

  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;

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
          <button key={d} onClick={() => { setDuration(d); setPhase('idle'); setCount(0); setTimeLeft(d); if (timerRef.current) clearInterval(timerRef.current); }}
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
          { value: phase === 'running' ? sps : phase === 'done' ? finalSps : '0', label: 'Per Second', color: 'var(--neon-green)' },
          { value: timeLeft.toFixed(1), label: 'Seconds Left', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
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
        onClick={phase === 'idle' ? start : handleSpacebar as any}
        style={{ outline: 'none', marginBottom: '1.5rem' }}
      >
        <div style={{
          width: '100%',
          padding: '2.5rem 1rem',
          borderRadius: '16px',
          background: phase === 'running' ? 'rgba(0,245,255,0.05)' : 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? 'var(--neon-cyan)' : 'var(--border)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          cursor: phase === 'done' ? 'default' : 'pointer',
          userSelect: 'none',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.1)' : 'none',
          transition: 'all 0.2s',
        }}>
          {phase === 'idle' && (
            <>
              <span style={{ fontSize: '3rem' }}>▭</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>Click or Press SPACE to Start</span>
            </>
          )}
          {phase === 'running' && (
            <>
              <div style={{
                fontSize: '5rem', fontWeight: '900', color: 'var(--neon-cyan)',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>{count}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Keep pressing SPACE! ⚡</div>
            </>
          )}
          {phase === 'done' && (
            <>
              <span style={{ fontSize: '3rem' }}>🏁</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Done! Great effort!</span>
            </>
          )}
        </div>

        {/* Physical spacebar visual */}
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
          transition: 'all 0.05s',
          cursor: 'pointer',
          userSelect: 'none',
          boxShadow: phase === 'running' ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
        }}>
          SPACEBAR
        </div>
      </div>

      {/* Results */}
      {phase === 'done' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '16px', padding: '1.75rem',
          marginBottom: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>{count}</div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Presses in {duration} seconds</div>
          <div style={{
            display: 'inline-flex', padding: '0.4rem 1.2rem', borderRadius: '50px',
            background: `${getRating(parseFloat(finalSps)).color}15`,
            border: `1px solid ${getRating(parseFloat(finalSps)).color}30`,
            color: getRating(parseFloat(finalSps)).color,
            fontWeight: '700', marginBottom: '1rem',
          }}>{getRating(parseFloat(finalSps)).label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-green)' }}>{finalSps} presses/sec</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setCount(0); setTimeLeft(duration); }}>🔄 Reset</button>}
        {phase === 'done' && <button className="btn btn-primary" onClick={start}>▶ Try Again</button>}
      </div>

      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>📊 Session History</div>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', fontSize: '0.875rem', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.count} presses</span>
              <span style={{ color: 'var(--neon-green)' }}>{h.sps}/s</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.duration}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

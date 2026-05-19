import { useState, useRef } from 'react';

export default function DoubleClickPage() {
  const [results, setResults] = useState<number[]>([]);
  const [lastInterval, setLastInterval] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const lastClick = useRef<number>(0);
  const THRESHOLD = 500; // ms for double click

  const handleClick = () => {
    const now = performance.now();
    const diff = now - lastClick.current;

    if (lastClick.current > 0 && diff < THRESHOLD) {
      setLastInterval(Math.round(diff));
      setResults(prev => [Math.round(diff), ...prev.slice(0, 19)]);
      setStatus(`✅ Double click! ${Math.round(diff)}ms interval`);
      lastClick.current = 0;
    } else {
      lastClick.current = now;
      setStatus('🖱️ Click again quickly!');
      setTimeout(() => {
        if (performance.now() - lastClick.current >= THRESHOLD) {
          setStatus('⏱️ Too slow — try again!');
          lastClick.current = 0;
        }
      }, THRESHOLD);
    }
  };

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best = results.length > 0 ? Math.min(...results) : null;

  const getRating = (ms: number) => {
    if (ms < 80) return { label: '🔥 Lightning', color: 'var(--neon-red)' };
    if (ms < 150) return { label: '⚡ Fast', color: 'var(--neon-orange)' };
    if (ms < 250) return { label: '✅ Normal', color: 'var(--neon-green)' };
    return { label: '🐢 Slow', color: 'var(--text-secondary)' };
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Double Click Test</h1>
        <p className="tool-subtitle">Test how fast you can double-click your mouse</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: lastInterval ? `${lastInterval}ms` : '—', label: 'Last Interval', color: 'var(--neon-cyan)' },
          { value: avg ? `${avg}ms` : '—', label: 'Average', color: 'var(--neon-green)' },
          { value: best ? `${best}ms` : '—', label: 'Best', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Click zone */}
      <div
        onClick={handleClick}
        style={{
          width: '100%', minHeight: '250px',
          background: 'var(--bg-card)', border: '2px solid var(--border)',
          borderRadius: '16px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', userSelect: 'none', marginBottom: '1.5rem',
          transition: 'all 0.1s ease',
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: '3rem' }}>🖱️</span>
        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
          {status || 'Click twice quickly!'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Double-click within {THRESHOLD}ms
        </span>
        {lastInterval && (
          <div style={{
            padding: '0.4rem 1rem', borderRadius: '50px',
            background: `${getRating(lastInterval).color}15`,
            border: `1px solid ${getRating(lastInterval).color}30`,
            color: getRating(lastInterval).color, fontWeight: '700',
          }}>{getRating(lastInterval).label}</div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>📊 Results ({results.length})</div>
          <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                padding: '0.3rem 0.75rem', borderRadius: '6px',
                background: i === 0 ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                fontSize: '0.8rem', fontWeight: '700',
                color: getRating(r).color,
              }}>{r}ms</div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={() => { setResults([]); setLastInterval(null); setStatus(''); lastClick.current = 0; }}>
        🔄 Reset
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '0.75rem', color: 'var(--neon-cyan)' }}>What is Double Click Speed?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7' }}>
          Double-click speed measures the time between two rapid clicks. Most mice register double-clicks within 200-500ms. Faster double-click speed means quicker item selection in games and productivity apps.
        </p>
      </div>
    </div>
  );
}

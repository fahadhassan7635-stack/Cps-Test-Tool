import { useState, useRef, useCallback } from 'react';

type Phase = 'idle' | 'waiting' | 'ready' | 'clicked' | 'early';

export default function ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const MAX_ROUNDS = 5;

  const startTime = useRef<number>(0);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startWaiting = () => {
    setPhase('waiting');
    const delay = 1500 + Math.random() * 3500;
    waitTimer.current = setTimeout(() => {
      setPhase('ready');
      startTime.current = performance.now();
    }, delay);
  };

  const handleClick = useCallback(() => {
    if (phase === 'idle') { startWaiting(); return; }

    if (phase === 'waiting') {
      if (waitTimer.current) clearTimeout(waitTimer.current);
      setPhase('early');
      return;
    }

    if (phase === 'ready') {
      const t = Math.round(performance.now() - startTime.current);
      setReactionTime(t);
      setResults(prev => [...prev, t]);
      setRound(prev => prev + 1);
      setPhase('clicked');
      return;
    }

    if (phase === 'clicked' || phase === 'early') {
      if (round >= MAX_ROUNDS) {
        setPhase('idle');
        setRound(0);
        setResults([]);
      } else {
        startWaiting();
      }
    }
  }, [phase, round]);

  const getRating = (ms: number) => {
    if (ms < 150) return { label: '🔥 Inhuman', color: 'var(--neon-red)' };
    if (ms < 200) return { label: '⚡ Elite', color: 'var(--neon-orange)' };
    if (ms < 250) return { label: '🎯 Great', color: 'var(--neon-cyan)' };
    if (ms < 300) return { label: '✅ Average', color: 'var(--neon-green)' };
    if (ms < 400) return { label: '😐 Slow', color: 'var(--text-secondary)' };
    return { label: '🐢 Very Slow', color: 'var(--text-muted)' };
  };

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best = results.length > 0 ? Math.min(...results) : null;

  const zoneColors = {
    idle: { bg: '#0d1421', border: 'var(--border)', text: 'var(--text-secondary)' },
    waiting: { bg: 'rgba(255,107,0,0.08)', border: 'rgba(255,107,0,0.4)', text: 'var(--neon-orange)' },
    ready: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.5)', text: 'var(--neon-green)' },
    clicked: { bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.4)', text: 'var(--neon-cyan)' },
    early: { bg: 'rgba(255,45,85,0.1)', border: 'rgba(255,45,85,0.4)', text: 'var(--neon-red)' },
  };

  const colors = zoneColors[phase];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Reaction Tool</div>
        <h1 className="tool-title">Reaction Time Test</h1>
        <p className="tool-subtitle">Test your reflexes — how fast do you respond?</p>
      </div>

      {/* Round indicator */}
      {round > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} style={{
              width: '40px', height: '8px', borderRadius: '4px',
              background: i < results.length ? 'var(--neon-cyan)' : 'var(--bg-card)',
              border: '1px solid var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* Main zone */}
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          minHeight: '320px',
          borderRadius: '20px',
          border: `2px solid ${colors.border}`,
          background: colors.bg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          marginBottom: '1.5rem',
          boxShadow: phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2)' : 'none',
        }}
      >
        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '4rem' }}>⚡</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>Click to Start</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {round === 0 ? `${MAX_ROUNDS} rounds • Wait for green, then click!` : 'All rounds done! Click to restart.'}
            </span>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <span style={{ fontSize: '4rem' }}>🔴</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Wait for it...</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Don't click yet!</span>
          </>
        )}

        {phase === 'ready' && (
          <>
            <span style={{ fontSize: '4rem' }}>🟢</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-green)' }}>CLICK NOW!</span>
          </>
        )}

        {phase === 'clicked' && reactionTime !== null && (
          <>
            <span style={{ fontSize: '3rem' }}>✅</span>
            <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>
              {reactionTime}<span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>ms</span>
            </div>
            <div style={{
              padding: '0.4rem 1rem', borderRadius: '50px',
              background: `${getRating(reactionTime).color}15`,
              border: `1px solid ${getRating(reactionTime).color}30`,
              color: getRating(reactionTime).color, fontWeight: '700',
            }}>{getRating(reactionTime).label}</div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {round >= MAX_ROUNDS ? 'Click to see summary' : `Click for round ${round + 1}`}
            </span>
          </>
        )}

        {phase === 'early' && (
          <>
            <span style={{ fontSize: '3rem' }}>❌</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-red)' }}>Too Early!</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the green signal. Click to retry.</span>
          </>
        )}
      </div>

      {/* Live results */}
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { value: avg ? `${avg}ms` : '—', label: 'Average', color: 'var(--neon-cyan)' },
            { value: best ? `${best}ms` : '—', label: 'Best', color: 'var(--neon-green)' },
            { value: `${results.length}/${MAX_ROUNDS}`, label: 'Rounds', color: 'var(--neon-orange)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results timeline */}
      {results.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Round Results</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem',
                textAlign: 'center', minWidth: '70px',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>R{i + 1}</div>
                <div style={{ fontWeight: '700', color: getRating(r).color }}>{r}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={() => { setPhase('idle'); setRound(0); setResults([]); setReactionTime(null); }}>
        🔄 Reset
      </button>

      {/* Info */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', marginTop: '2rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-cyan)' }}>Reaction Time Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { range: '< 150ms', label: 'Inhuman', color: 'var(--neon-red)' },
            { range: '150-200ms', label: 'Elite Gamer', color: 'var(--neon-orange)' },
            { range: '200-250ms', label: 'Great', color: 'var(--neon-cyan)' },
            { range: '250-300ms', label: 'Average', color: 'var(--neon-green)' },
            { range: '300-400ms', label: 'Below Avg', color: 'var(--text-secondary)' },
            { range: '400ms+', label: 'Slow', color: 'var(--text-muted)' },
          ].map(r => (
            <div key={r.range} style={{ background: `${r.color}10`, border: `1px solid ${r.color}30`, borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
              <div style={{ fontWeight: '700', color: r.color, fontSize: '0.9rem' }}>{r.range}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{r.label}</div>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
          * Average human reaction time is ~250ms. Professional FPS gamers typically react in 150-200ms.
        </p>
      </div>
    </div>
  );
}

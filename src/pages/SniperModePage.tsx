import { useState, useRef, useEffect, useCallback } from 'react';

interface Target { id: number; x: number; y: number; vx: number; vy: number; size: number; }

export default function SniperModePage() {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState<Target | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<Target | null>(null);
  const hitRef = useRef(0);
  const totalRef = useRef(0);

  const makeTarget = useCallback(() => {
    if (!areaRef.current) return null;
    const rect = areaRef.current.getBoundingClientRect();
    const size = 20;
    const t: Target = {
      id: Date.now(),
      x: size + Math.random() * (rect.width - size * 2),
      y: size + Math.random() * (rect.height - size * 2),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size,
    };
    return t;
  }, []);

  const animate = useCallback(() => {
    if (!areaRef.current || !targetRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const t = { ...targetRef.current };
    t.x += t.vx;
    t.y += t.vy;
    if (t.x <= t.size || t.x >= rect.width - t.size) t.vx *= -1;
    if (t.y <= t.size || t.y >= rect.height - t.size) t.vy *= -1;
    t.x = Math.max(t.size, Math.min(rect.width - t.size, t.x));
    t.y = Math.max(t.size, Math.min(rect.height - t.size, t.y));
    targetRef.current = t;
    setTarget({ ...t });
    animRef.current = requestAnimationFrame(animate);
  }, []);

  const start = () => {
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTimeLeft(30);
    hitRef.current = 0;
    totalRef.current = 0;
    const t = makeTarget();
    targetRef.current = t;
    setTarget(t);
    animRef.current = requestAnimationFrame(animate);
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, 30 - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        cancelAnimationFrame(animRef.current);
        setPhase('done');
        setTarget(null);
      }
    }, 100);
  };

  const hitTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    setScore(prev => prev + 100);
    hitRef.current++;
    totalRef.current++;
    const t = makeTarget();
    targetRef.current = t;
    setTarget(t);
  };

  const missClick = () => {
    if (phase !== 'running') return;
    setMisses(prev => prev + 1);
    totalRef.current++;
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const acc = totalRef.current > 0 ? Math.round((hitRef.current / totalRef.current) * 100) : 100;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Aim Tool</div>
        <h1 className="tool-title">Sniper Mode</h1>
        <p className="tool-subtitle">Track and hit the small moving target — precision matters!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: score, label: 'Score', color: 'var(--neon-cyan)' },
          { value: `${acc}%`, label: 'Accuracy', color: 'var(--neon-green)' },
          { value: misses, label: 'Misses', color: 'var(--neon-red)' },
          { value: timeLeft.toFixed(1), label: 'Time', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${((30 - timeLeft) / 30) * 100}%` }} />
      </div>

      <div
        ref={areaRef}
        onClick={missClick}
        style={{
          position: 'relative', width: '100%', height: '380px',
          background: '#0a0f18',
          border: `2px solid ${phase === 'running' ? 'rgba(255,45,85,0.5)' : 'var(--border)'}`,
          borderRadius: '16px', overflow: 'hidden',
          cursor: phase === 'running' ? 'crosshair' : 'default', marginBottom: '1.5rem',
        }}
      >
        {/* Crosshair lines */}
        {phase === 'running' && (
          <>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          </>
        )}

        {phase !== 'running' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '4rem' }}>🔭</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: phase === 'done' ? 'var(--neon-orange)' : 'var(--neon-red)' }}>
              {phase === 'done' ? `Final Score: ${score}` : 'Click Start — Hit the Moving Target'}
            </span>
            {phase === 'done' && <span style={{ color: 'var(--neon-green)' }}>{acc}% Accuracy</span>}
          </div>
        )}

        {target && phase === 'running' && (
          <div
            onClick={hitTarget}
            style={{
              position: 'absolute',
              left: target.x, top: target.y,
              width: target.size, height: target.size,
              borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgba(255,45,85,1) 20%, rgba(255,107,0,0.8) 60%, transparent 100%)',
              border: '2px solid rgba(255,255,255,0.9)',
              cursor: 'crosshair',
              boxShadow: '0 0 15px rgba(255,45,85,0.8)',
              zIndex: 10,
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {phase !== 'running' && <button className="btn btn-primary" onClick={start}>{phase === 'done' ? '▶ Play Again' : '🔭 Start Sniper Mode'}</button>}
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { cancelAnimationFrame(animRef.current); if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setTarget(null); }}>🔄 Reset</button>}
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';

interface Target { id: number; x: number; y: number; size: number; points: number; }

export default function MouseAccuracyPage() {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef = useRef(0);
  const hitRef = useRef(0);
  const totalRef = useRef(0);

  const spawnTarget = useCallback(() => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const size = 25 + Math.random() * 45;
    const x = size + Math.random() * (rect.width - size * 2);
    const y = size + Math.random() * (rect.height - size * 2);
    const id = ++targetIdRef.current;
    const points = Math.round(100 * (50 / (size + 1)));
    setTargets(prev => [...prev.filter(t => t.id !== id), { id, x, y, size, points }]);
    setTimeout(() => setTargets(prev => prev.filter(t => t.id !== id)), 1800);
  }, []);

  const start = () => {
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTotalTargets(0);
    setTargets([]);
    setTimeLeft(30);
    hitRef.current = 0;
    totalRef.current = 0;

    spawnTarget();
    const si = setInterval(spawnTarget, 700);

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, 30 - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        clearInterval(si);
        setPhase('done');
        setTargets([]);
      }
    }, 100);
  };

  const hitTarget = (id: number, pts: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(prev => prev + pts);
    hitRef.current++;
    totalRef.current++;
    setTotalTargets(t => t + 1);
    spawnTarget();
  };

  const missClick = () => {
    if (phase !== 'running') return;
    setMisses(prev => prev + 1);
    totalRef.current++;
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const acc = totalRef.current > 0 ? Math.round((hitRef.current / totalRef.current) * 100) : 100;
  const progress = ((30 - timeLeft) / 30) * 100;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Mouse Accuracy Test</h1>
        <p className="tool-subtitle">Click targets precisely — smaller targets = more points!</p>
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
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div
        ref={areaRef}
        onClick={missClick}
        style={{
          position: 'relative', width: '100%', height: '380px',
          background: 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? 'rgba(191,90,242,0.5)' : 'var(--border)'}`,
          borderRadius: '16px', overflow: 'hidden',
          cursor: phase === 'running' ? 'crosshair' : 'default', marginBottom: '1.5rem',
          boxShadow: phase === 'running' ? '0 0 30px rgba(191,90,242,0.1)' : 'none',
        }}
      >
        {phase !== 'running' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '4rem' }}>🎯</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: phase === 'done' ? 'var(--neon-orange)' : 'var(--neon-purple)' }}>
              {phase === 'done' ? `Score: ${score}` : 'Click Start to Play'}
            </span>
            {phase === 'done' && <span style={{ color: 'var(--neon-green)' }}>{acc}% Accuracy • {totalTargets} Targets Hit</span>}
          </div>
        )}
        {targets.map(t => (
          <div
            key={t.id}
            onClick={e => hitTarget(t.id, t.points, e)}
            style={{
              position: 'absolute',
              left: t.x, top: t.y,
              width: t.size, height: t.size,
              borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background: `radial-gradient(circle, hsl(${Math.random() * 60 + 180}deg, 100%, 60%) 0%, hsl(${Math.random() * 60 + 240}deg, 90%, 40%) 100%)`,
              border: '2px solid rgba(255,255,255,0.7)',
              cursor: 'crosshair',
              animation: 'target-appear 0.15s ease forwards',
              boxShadow: '0 0 15px rgba(191,90,242,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.6rem', fontWeight: '700',
            }}
          >
            {t.points}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {phase !== 'running' && <button className="btn btn-primary" onClick={start}>{phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}</button>}
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setTargets([]); }}>🔄 Reset</button>}
      </div>
    </div>
  );
}

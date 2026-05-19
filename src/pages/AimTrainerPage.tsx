import { useState, useRef, useCallback, useEffect } from 'react';

interface Target { id: number; x: number; y: number; size: number; }

type Phase = 'idle' | 'running' | 'done';

export default function AimTrainerPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [duration] = useState(30);
  const [history, setHistory] = useState<{ score: number; acc: number }[]>([]);

  const areaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetId = useRef(0);
  const totalClicks = useRef(0);
  const hitClicks = useRef(0);

  const spawnTarget = useCallback(() => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const size = 40 + Math.random() * 40;
    const x = size / 2 + Math.random() * (rect.width - size);
    const y = size / 2 + Math.random() * (rect.height - size);
    const id = ++targetId.current;
    setTargets(prev => [...prev.slice(-4), { id, x, y, size }]);

    // Auto remove after 2s
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const startGame = () => {
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTimeLeft(duration);
    setTargets([]);
    totalClicks.current = 0;
    hitClicks.current = 0;
    targetId.current = 0;

    spawnTarget();
    const spawnInterval = setInterval(spawnTarget, 800);

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        clearInterval(spawnInterval);
        setPhase('done');
        setTargets([]);
      }
    }, 100);

    return () => { clearInterval(spawnInterval); };
  };

  const hitTarget = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(prev => prev + 1);
    hitClicks.current++;
    totalClicks.current++;
    spawnTarget();
  };

  const missClick = () => {
    if (phase !== 'running') return;
    setMisses(prev => prev + 1);
    totalClicks.current++;
  };

  useEffect(() => {
    if (phase === 'done') {
      const acc = totalClicks.current > 0 ? Math.round((hitClicks.current / totalClicks.current) * 100) : 0;
      setHistory(prev => [{ score, acc }, ...prev.slice(0, 9)]);
    }
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const acc = totalClicks.current > 0 ? Math.round((hitClicks.current / totalClicks.current) * 100) : 100;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Aim Tool</div>
        <h1 className="tool-title">Aim Trainer</h1>
        <p className="tool-subtitle">Click targets as fast and accurately as possible</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: score, label: 'Hits', color: 'var(--neon-green)' },
          { value: misses, label: 'Misses', color: 'var(--neon-red)' },
          { value: `${acc}%`, label: 'Accuracy', color: 'var(--neon-cyan)' },
          { value: timeLeft.toFixed(1), label: 'Seconds', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Game area */}
      <div
        ref={areaRef}
        onClick={missClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          background: 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? 'var(--neon-green)' : 'var(--border)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: phase === 'running' ? 'crosshair' : 'default',
          marginBottom: '1.5rem',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,255,136,0.1)' : 'none',
        }}
      >
        {phase === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '4rem' }}>🎯</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click Start to Play</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click targets as fast as you can!</span>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.7)' }}>
            <span style={{ fontSize: '3rem' }}>🏁</span>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)' }}>Time's Up!</span>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--neon-green)' }}>{score} Hits</span>
            <span style={{ color: 'var(--text-secondary)' }}>{acc}% Accuracy</span>
          </div>
        )}

        {/* Targets */}
        {targets.map(t => (
          <div
            key={t.id}
            onClick={(e) => hitTarget(t.id, e)}
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y,
              width: t.size,
              height: t.size,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,45,85,0.9) 30%, rgba(255,107,0,0.7) 70%)',
              border: '3px solid rgba(255,255,255,0.8)',
              cursor: 'crosshair',
              animation: 'target-appear 0.15s ease forwards',
              boxShadow: '0 0 20px rgba(255,45,85,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: t.size * 0.3,
              height: t.size * 0.3,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
            }} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {phase !== 'running' && (
          <button className="btn btn-primary" onClick={startGame}>
            {phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}
          </button>
        )}
        {phase !== 'idle' && (
          <button className="btn btn-secondary" onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('idle'); setScore(0); setMisses(0); setTimeLeft(duration); setTargets([]);
          }}>🔄 Reset</button>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>📊 Session History</div>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', fontSize: '0.875rem', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-green)', fontWeight: '700' }}>{h.score} hits</span>
              <span style={{ color: 'var(--neon-cyan)' }}>{h.acc}% acc</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

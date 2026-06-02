import { useState, useRef, useCallback, useEffect } from 'react';

interface Target { 
  id: number; 
  x: number; 
  y: number; 
  size: number; 
  points: number; 
}

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

      {/* Grid Statistics Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: score, label: 'Score', color: 'var(--neon-cyan, #00f5ff)' },
          { value: `${acc}%`, label: 'Accuracy', color: 'var(--neon-green, #10b981)' },
          { value: misses, label: 'Misses', color: 'var(--neon-red, #ff2d55)' },
          { value: timeLeft.toFixed(1), label: 'Time', color: 'var(--neon-orange, #f97316)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Target Interaction Canvas Area */}
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
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
            <span style={{ fontSize: '4rem' }}>🎯</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: phase === 'done' ? 'var(--neon-orange, #f97316)' : 'var(--neon-purple, #a855f7)' }}>
              {phase === 'done' ? `Score: ${score}` : 'Click Start to Play'}
            </span>
            {phase === 'done' && (
              <span style={{ color: 'var(--neon-green, #10b981)', fontSize: '0.95rem', fontWeight: '600' }}>
                {acc}% Accuracy • {totalTargets} Targets Hit
              </span>
            )}
          </div>
        )}
        
        {targets.map(t => (
          <div
            key={t.id}
            onClick={e => hitTarget(t.id, t.points, e)}
            style={{
              position: 'absolute',
              left: `${t.x}px`, top: `${t.y}px`,
              width: `${t.size}px`, height: `${t.size}px`,
              borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, #00f5ff 0%, #a855f7 100%)',
              border: '2px solid rgba(255,255,255,0.85)',
              cursor: 'crosshair',
              animation: 'target-appear 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              boxShadow: '0 0 15px rgba(191,90,242,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.65rem', fontWeight: '800',
              userSelect: 'none'
            }}
          >
            {t.points}
          </div>
        ))}
      </div>

      {/* Control Actions Switches */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {phase !== 'running' && <button className="btn btn-primary" onClick={start}>{phase === 'done' ? '▶ Play Again' : '🎯 Start Game'}</button>}
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setTargets([]); }}>🔄 Reset</button>}
      </div>

      {/* ================= SEO ARTICLES & EDUCATION SECTION ================= */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What is a Mouse Accuracy Test and Why Should You Practice?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>Mouse Accuracy Test</strong> (commonly known as an Aim Trainer) is an interactive physical reflex utility engineered to evaluate and enhance your hand-eye coordination. By presenting moving or static scaling nodes across an isolated grid layout, this training simulator benchmarks spatial calibration metrics. Consistent tracking exercises help establish stable cognitive pathways, bridging the gap between physical intent and dynamic pixel precision.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            The Science of Muscle Memory in Gaming & Productivity
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Whether you are flicking onto heads in tactical shooters like <em>Valorant</em> and <em>Counter-Strike</em>, or swiftly navigating dense audio tracks in a digital audio workstation (DAW), accuracy relies heavily on <strong>Muscle Memory</strong>. 
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            When you initiate a cursor glide, your brain calculates the linear coordinate distance and cues your hand motor systems to fire. If your hardware settings are properly balanced, your hand naturally memorizes the physical distance required to clear the vector gap. Practicing on dynamic, adaptive targets allows you to refine fine-motor control, significantly minimizing unnecessary click overshoots or frustrating positional micro-stuttering.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            How to Optimize Your Hardware Settings for Better Accuracy
          </h3>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Disable Mouse Acceleration:</strong> Ensure "Enhance pointer precision" is turned off in your system settings. Mouse acceleration alters your travel distance based on physical hand velocity, completely disrupting mechanical consistency.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Find the Sweet Spot DPI:</strong> Most competitive players prefer native tracking resolutions between <strong>400 DPI and 1600 DPI</strong>. Lower values offer refined micro-correction tracking buffers, whereas higher values demand extreme finger dexterity.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Match Refresh Rates:</strong> Running a high-polling rate peripheral (such as 1000Hz or above) paired with a high refresh rate gaming monitor reduces input rendering delays, allowing you to catch target spawns instantly.
            </li>
          </ul>

          {/* FAQ Section */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How is the accuracy percentage calculated in this test?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Your accuracy score evaluates your net hitting efficiency: <code>(Registered Target Hits / Total Clicks Executed) * 100</code>. Clicking on empty spots inside the container canvas increases your <strong>Misses</strong> counter, dragging your total performance down.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Why do smaller targets award higher score multipliers?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Smaller nodes feature a compressed physical target zone bounding box, requiring stricter precision control. The engine calculates target value dynamically using <code>50 / (size + 1)</code> to incentivize precise aim over reckless speed.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Can using an aim trainer web tool improve my overall reaction speed?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Yes! Because new nodes spawn unpredictably inside the card body container at fixed 700ms phases, the setup conditions your visual cortex to spot and process peripheral positional updates much faster.
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* ================= SEO ARTICLES & EDUCATION SECTION END ================= */}
      
      <style>{`
        @keyframes target-appear {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
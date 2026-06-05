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
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
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

      {/* ================= MASSIVE SEO ARTICLE SECTION START ================= */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem', marginTop: '3rem' }}>
        <article style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
          
          <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--neon-cyan)', marginTop: '0', letterSpacing: '-0.5px' }}>
            The Ultimate Guide to Aim Training & Mouse Accuracy
          </h2>
          
          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
            An <strong>Aim Trainer</strong> is a specialized web-based tool designed to help gamers test and dramatically improve their mouse reaction time, clicking accuracy, and spatial tracking. In the competitive eSports world, raw clicking speed (CPS) means nothing if you can't hit your target. Our 2D Aim Trainer isolates your mechanical mouse control, allowing you to build stable neural pathways between your eyes and your hands without the distractions of in-game elements.
          </p>

          {/* New Mouse & Sensor Check */}
          <div style={{ background: 'rgba(0, 255, 136, 0.05)', borderLeft: '4px solid var(--neon-green)', borderRadius: '0 12px 12px 0', padding: '1.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginTop: '0', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🖱️ The Ultimate Mouse Sensor Check
            </h3>
            <p style={{ margin: 0, color: '#9ca3af' }}>
              Did you recently upgrade your gaming gear? Our Aim Trainer acts as an excellent <strong>new mouse check</strong>. By attempting to hit small, randomly spawning targets rapidly, you can immediately test your mouse's optical sensor for tracking spin-outs, verify zero mouse acceleration, and adjust your DPI settings to find your perfect sensitivity before launching a competitive match.
            </p>
          </div>

          <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Why Aim Matters in These Top Global Games
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Precision and speed are universally rewarded across almost every gaming genre. Regular practice on our aim tool translates into noticeable performance boosts in the following massively popular titles:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {['Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V', 'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2', 'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us'].map((game) => (
              <div key={game} style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--neon-green)' }}>🎯</span> {game}
              </div>
            ))}
          </div>

          {/* Detailed Q&A / How-To Section tailored for Aiming */}
          <h2 style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            Pro FPS Strategies & FAQs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Reaction Time & FPS generally */}
            <div>
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to improve reaction time in FPS games?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                In hyper-fast tactical shooters like <strong>Counter-Strike 2 (CS2)</strong> and fast-paced battle royales like <strong>Call of Duty: Warzone</strong>, split-second reaction time dictates who survives. To improve, you must train your brain's cognitive processing speed. Our aim trainer helps by forcing your eyes to quickly identify a new target spawn, process its location, and command your hand to move there. Pair daily aim training with a high refresh rate monitor (144Hz+) and a low-latency gaming mouse to physically reduce input lag.
              </p>
            </div>

            {/* Valorant / Micro Flicks */}
            <div>
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to increase clicking precision and flick speed in Valorant?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                Valorant heavily punishes players who miss their first shot. While raw CPS is rarely needed for rifles like the Vandal or Phantom, hitting micro-flicks is essential. To increase your precision, start by playing our aim trainer slowly. Focus entirely on achieving a <strong>95%+ accuracy rate</strong> before trying to speed up. Over time, your muscle memory will naturally adapt, allowing you to flick to enemy heads instantly without over-aiming.
              </p>
            </div>

            {/* PUBG / Tracking */}
            <div>
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to improve aiming and tracking in PUBG: Battlegrounds?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                In <strong>PUBG</strong>, engagements often happen over long distances against moving vehicles or running targets. This requires smooth tracking rather than just snapping. By using our aim trainer, you practice keeping your wrist steady while moving between targets. Also, combining high accuracy with controlled clicking speed will help you manage the harsh recoil of single-fire weapons like DMRs.
              </p>
            </div>

            {/* Minecraft, LoL, etc. */}
            <div>
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Does aim training help in Minecraft, Roblox, or League of Legends?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                Absolutely! While often associated with traditional shooters, mouse precision is critical everywhere. 
                <br/><br/>
                <strong>Minecraft:</strong> Excellent bow aiming and keeping your crosshair locked onto a player while strafing (combining tracking with fast CPS) is what separates average players from PvP masters. <br/>
                <strong>League of Legends:</strong> Misclicking the ground instead of an enemy champion during a chaotic team fight can lose the game. High accuracy ensures your skill shots land perfectly.<br/>
                <strong>Roblox & Fortnite:</strong> Whether playing Arsenal on Roblox or rapid-editing builds in Fortnite, fast and accurate crosshair placement speeds up your mechanical execution drastically.
              </p>
            </div>

            {/* Health & Form Tips */}
            <div style={{ background: 'rgba(255, 107, 0, 0.05)', border: '1px solid rgba(255,107,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--neon-orange)', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                💡 Pro Tip: Arm Aiming vs. Wrist Aiming
              </h4>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                For the best accuracy and long-term health, use a lower mouse DPI (e.g., 400 or 800) and practice "Arm Aiming" for large target flicks, saving "Wrist Aiming" only for micro-adjustments. This prevents wrist strain and provides much greater consistency. Warm up on this tool for 5-10 minutes before diving into your favorite games!
              </p>
            </div>

          </div>
        </article>
      </div>
      {/* ================= MASSIVE SEO ARTICLE SECTION END ================= */}

    </div>
  );
}
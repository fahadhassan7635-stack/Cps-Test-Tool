import React, { useState, useRef, useEffect, useCallback } from 'react';

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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {phase !== 'running' && <button className="btn btn-primary" onClick={start}>{phase === 'done' ? '▶ Play Again' : '🔭 Start Sniper Mode'}</button>}
        {phase !== 'idle' && <button className="btn btn-secondary" onClick={() => { cancelAnimationFrame(animRef.current); if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); setTarget(null); }}>🔄 Reset</button>}
      </div>

      {/* ================= MASSIVE SEO ARTICLES & EDUCATION SECTION ================= */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem', marginTop: '3rem' }}>
        <article style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
          
          <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--neon-red)', marginTop: '0', letterSpacing: '-0.5px' }}>
            The Ultimate Guide to Sniper Aiming & Target Tracking
          </h2>
          
          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
            The <strong>Sniper Mode Aim Trainer</strong> is an advanced visual calibration tool designed specifically to evaluate and sharpen your **Tracking Aim**. Unlike static clicking tools, tracking requires your hand muscles to maintain continuous synchronization with an unpredictable, moving target. Whether you are using a sniper rifle to hit a running player or tracking a fast-moving vehicle, mastering your dynamic cursor control is the ultimate key to dominating competitive tactical shooters.
          </p>

          {/* New Mouse Sensor Check Box */}
          <div style={{ background: 'rgba(255, 45, 85, 0.05)', borderLeft: '4px solid var(--neon-red)', borderRadius: '0 12px 12px 0', padding: '1.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginTop: '0', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🖱️ The Ultimate &quot;New Mouse&quot; Tracking Check
            </h3>
            <p style={{ margin: 0, color: '#9ca3af' }}>
              Just bought a premium gaming mouse? Our Sniper Mode is the absolute best way to perform a <strong>new mouse check</strong>. By tracking the small bouncing dot, you can instantly verify your sensor&apos;s polling rate stability (ensuring it doesn&apos;t stutter), test your PTFE mouse skates for smooth gliding, and fine-tune your DPI before stepping into ranked matches.
            </p>
          </div>

          <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Why Tracking Precision Dominates Modern Gaming
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Sniping and tracking are universally feared skills. A player who can consistently hit a moving target applies immense psychological pressure on the enemy team. Training your tracking aim dramatically boosts your performance in these popular games:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {['Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V', 'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2', 'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us'].map((game) => (
              <div key={game} style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--neon-red)' }}>🔭</span> {game}
              </div>
            ))}
          </div>

          {/* Detailed Q&A / Pro Strategies Section */}
          <h2 style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            Pro Sniping Strategies & Aim FAQs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* PUBG / Warzone Sniper Aiming */}
            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to improve Snipe and Tracking Aim in PUBG & Warzone?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                In large-scale Battle Royales like <strong>PUBG: Battlegrounds</strong> and <strong>Call of Duty: Warzone</strong>, enemies are rarely standing still. To hit a running target with a Kar98k or HDR, you must master the art of &quot;leading&quot; your shot. Our Sniper Mode helps you build the muscle memory required to track a target seamlessly without jittering your wrist. The constant directional changes of the red dot train your eyes to predict movement vectors perfectly.
              </p>
            </div>

            {/* Valorant / CS2 Flicks & Tracking */}
            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to increase precision with Sniper Rifles in CS2 & Valorant?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                Using the AWP in <strong>Counter-Strike 2</strong> or the Operator in Valorant requires extreme discipline. If you miss your first shot, you are likely dead. While holding angles (crosshair placement) is key, you must also be able to micro-track an enemy who &quot;jiggle-peeks&quot; or swings wide. Playing our Sniper Mode daily trains you to click the mouse exactly when your crosshair aligns with a tiny moving hitbox, drastically improving your single-shot accuracy.
              </p>
            </div>

            {/* Minecraft Bow Aiming */}
            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to get better Bow Aim and PvP Tracking in Minecraft?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                While &quot;Fast CPS&quot; is famous for sword combat in <strong>Minecraft</strong>, tracking is what wins ranged bow fights and keeps your cursor locked onto an enemy while both of you are strafing. If your crosshair slips off the enemy hitbox, your clicks won&apos;t register. Sniper mode forces you to keep your cursor glued to the target, enhancing your PvP tracking skills on popular servers like Hypixel.
              </p>
            </div>

            {/* Reaction Time */}
            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                How to improve reaction time to unpredictable movement in FPS games?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                When the target in this tool hits a wall, it bounces back instantly. This replicates an enemy suddenly changing direction (strafing) in games like <strong>Fortnite</strong>, <strong>Apex Legends</strong>, or <strong>Grand Theft Auto V</strong>. To improve your reaction time:
                <br/><br/>
                <strong>1. Don&apos;t Predict, React:</strong> Stop guessing where the dot will go. Keep your eyes locked on the dot itself, not your crosshair. <br/>
                <strong>2. Relax Your Grip:</strong> Tensing your hand to click fast actually slows down your tracking speed. A relaxed grip allows for smoother micro-adjustments.<br/>
                <strong>3. Higher Refresh Rate:</strong> Playing this tracking tool on a 144Hz or 240Hz monitor will make the target&apos;s movement appear significantly smoother, lowering your visual reaction latency.
              </p>
            </div>

            {/* Pro Tip Box */}
            <div style={{ background: 'rgba(255, 107, 0, 0.05)', border: '1px solid rgba(255,107,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--neon-orange)', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                💡 Pro Tip: Optimize Your Sensitivity (eDPI)
              </h4>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                If you find yourself constantly &quot;overshooting&quot; the red target, your mouse sensitivity is too high. If you are trailing behind it, your sensitivity might be too low (or your mousepad is too small). Lowering your DPI (e.g., to 400 or 800) and using your forearm to track movements provides exponentially higher consistency than relying solely on your wrist.
              </p>
            </div>

          </div>
        </article>
      </div>
      {/* ================= MASSIVE SEO ARTICLES & EDUCATION SECTION END ================= */}

    </div>
  );
}

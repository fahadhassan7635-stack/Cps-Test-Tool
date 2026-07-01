import { useState, useRef, useEffect, useCallback } from 'react';

const DURATIONS = [5, 10, 15, 30];

export default function ScrollTestPage() {
  const [scrollCount, setScrollCount] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [duration, setDuration] = useState(10);
  const [customTime, setCustomTime] = useState<string>('');
  const [upScrolls, setUpScrolls] = useState(0);
  const [downScrolls, setDownScrolls] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const zoneRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(duration);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const getRank = (cpsValue: number) => {
    if (cpsValue >= 45) return { 
      name: 'Machine', 
      emoji: '🤖', 
      color: 'var(--neon-red, #ff2d55)', 
      stars: 5, 
      desc: '"Unbelievable dynamic velocity! Your flywheel rotations operate at cybernetic levels. Pure hardware mastery!"' 
    };
    if (cpsValue >= 35) return { 
      name: 'Cheetah', 
      emoji: '🐆', 
      color: 'var(--neon-orange, #f97316)', 
      stars: 4, 
      desc: '"Blistering performance! Your continuous finger strokes cut through the scrolling matrix with relentless raw speed."' 
    };
    if (cpsValue >= 25) return { 
      name: 'Fox', 
      emoji: '🦊', 
      color: 'var(--neon-cyan, #00f5ff)', 
      stars: 3, 
      desc: '"Sharp, tactical, and incredibly responsive. Excellent finger flick mechanics and scroll wheel coordination."' 
    };
    if (cpsValue >= 15) return { 
      name: 'Turtle', 
      emoji: '🐢', 
      color: 'var(--neon-green, #10b981)', 
      stars: 2, 
      desc: '"Steady execution, but you are playing it safe. Try looser grip styles to unlock your real mechanical threshold!"' 
    };
    return { 
      name: 'Snail', 
      emoji: '🐌', 
      color: 'var(--text-secondary, #94a3b8)', 
      stars: 1, 
      desc: '"Very passive crawl rhythm. Shake out your hand, align your index finger, and apply faster burst ticks!"' 
    };
  };

  const endTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('done');
  }, []);

  const start = () => {
    setPhase('running');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    
    const currentDur = durationRef.current;
    setTimeLeft(currentDur);
    startTime.current = performance.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, currentDur - elapsed);
      setTimeLeft(left);
      if (left <= 0) { 
        endTest();
      }
    }, 50);
    zoneRef.current?.focus();
  };

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    setTimeLeft(durationRef.current);
  }, []);

  const handleCustomTimeSet = () => {
    const time = parseInt(customTime);
    if (time > 0) {
      setDuration(time);
      durationRef.current = time;
      resetGame();
      setTimeLeft(time);
    }
  };

  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      if (phase === 'running') {
        e.preventDefault();
        
        const dir = e.deltaY > 0 ? 'down' : 'up';
        setDirection(dir);
        setScrollCount(prev => prev + 1);
        if (dir === 'up') setUpScrolls(prev => prev + 1);
        else setDownScrolls(prev => prev + 1);
        
        const t = setTimeout(() => setDirection(null), 300);
        return () => clearTimeout(t);
      }
    };

    const zoneElement = zoneRef.current;
    if (zoneElement) {
      zoneElement.addEventListener('wheel', handleNativeWheel, { passive: false });
    }

    return () => {
      if (zoneElement) {
        zoneElement.removeEventListener('wheel', handleNativeWheel);
      }
    };
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  const liveCps = phase === 'running' && (duration - timeLeft) > 0
    ? (scrollCount / (duration - timeLeft)).toFixed(1)
    : '0.0';
    
  const finalCps = duration > 0 ? (scrollCount / duration).toFixed(2) : '0.00';
  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const currentRank = getRank(parseFloat(finalCps));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Scroll Wheel Test</h1>
        <p className="tool-subtitle">Test your scroll wheel speed and sensitivity</p>
      </div>

      {/* Duration selector with Custom Input */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        {DURATIONS.map(d => (
          <button key={d} onClick={() => { setDuration(d); durationRef.current = d; resetGame(); setTimeLeft(d); setCustomTime(''); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d && !customTime ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: duration === d && !customTime ? 'rgba(0,245,255,0.15)' : 'var(--bg-card)',
              color: duration === d && !customTime ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}>{d}s</button>
        ))}

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.3rem', 
          background: 'var(--bg-card)', border: '1px solid var(--border)', 
          borderRadius: '8px', padding: '0.2rem 0.2rem 0.2rem 0.6rem' 
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Custom:</span>
          <input 
            type="number" 
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            disabled={phase === 'running'}
            placeholder="sec"
            style={{ 
              width: '50px', background: 'transparent', border: 'none', 
              color: 'var(--neon-cyan)', fontWeight: '700', outline: 'none', 
              textAlign: 'center', fontSize: '0.85rem' 
            }}
          />
          <button 
            onClick={handleCustomTimeSet}
            disabled={phase === 'running' || !customTime}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '6px',
              background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)', fontWeight: '700', cursor: phase === 'running' || !customTime ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', transition: 'all 0.2s',
            }}
          >Set</button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: scrollCount, label: 'Total', color: 'var(--neon-cyan)' },
          { value: upScrolls, label: '↑ Up', color: 'var(--neon-green)' },
          { value: downScrolls, label: '↓ Down', color: 'var(--neon-orange)' },
          { value: phase === 'running' ? liveCps : parseFloat(finalCps).toFixed(1), label: 'CPS', color: 'var(--neon-purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Interaction Window */}
      <div
        ref={zoneRef}
        tabIndex={0}
        onClick={phase === 'idle' ? start : undefined}
        style={{
          width: '100%', minHeight: '280px',
          background: 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? (direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--neon-cyan)') : 'var(--border)'}`,
          borderRadius: '16px', cursor: phase === 'idle' ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', userSelect: 'none', outline: 'none', marginBottom: '1.5rem',
          transition: 'border-color 0.1s',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.08)' : 'none',
          padding: '1.5rem'
        }}
      >
        {phase === 'idle' && (
          <>
            <div style={{ fontSize: '4rem' }}>🔄</div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Click to Start</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Then scroll your mouse wheel as fast as possible!</span>
          </>
        )}

        {phase === 'running' && (
          <>
            <div style={{
              fontSize: '4rem',
              transform: direction === 'up' ? 'translateY(-8px)' : direction === 'down' ? 'translateY(8px)' : 'translateY(0)',
              transition: 'transform 0.1s',
              color: direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--text-secondary)',
            }}>🔄</div>
            <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{scrollCount}</div>
            <span style={{ color: 'var(--text-secondary)' }}>🔄 Keep scrolling inside this box!</span>
            <span style={{ color: 'var(--neon-orange)', fontWeight: '700' }}>{timeLeft.toFixed(1)}s</span>
          </>
        )}

        {phase === 'done' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🏁</span>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--neon-cyan)', lineHeight: 1 }}>
              {parseFloat(finalCps).toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>CPS</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: currentRank.color }}>
              Rank: {currentRank.name}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You scrolled <strong>{scrollCount}</strong> times in {duration} seconds.
            </span>
          </div>
        )}
      </div>

      {phase === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <button
            onClick={(e) => { e.stopPropagation(); resetGame(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#1e2235', border: '1px solid #2a3047',
              color: '#ffffff', padding: '0.6rem 1.25rem',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#252a40'; e.currentTarget.style.borderColor = '#3b4363'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e2235'; e.currentTarget.style.borderColor = '#2a3047'; }}
          >
            <div style={{
              background: '#3b82f6', color: 'white',
              borderRadius: '4px', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </div>
            Reset
          </button>
        </div>
      )}

      {/* ================= MODERN ANIMAL SPLIT RESULT MODAL ================= */}
      {phase === 'done' && currentRank && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => resetGame()} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '560px', background: '#0d1117',
            border: `2px solid ${currentRank.color}`, borderRadius: '20px', padding: '2rem 1.5rem',
            textAlign: 'center', zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: `0 0 40px ${currentRank.color}25`,
          }}>
            <button onClick={() => resetGame()} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${currentRank.color}40`,
              color: currentRank.color, width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', 
              alignItems: 'center', minHeight: '130px', marginBottom: '1.25rem' 
            }}>
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '1rem', height: '100%' 
              }}>
                <span style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${currentRank.color}40)` }}>
                  {currentRank.emoji}
                </span>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Rank is
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: currentRank.color, fontStyle: 'italic', margin: '0.1rem 0' }}>
                  {currentRank.name}!
                </div>
                
                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem', color: i < currentRank.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>
                      ★
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  You Scrolled with the speed of <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{parseFloat(finalCps).toFixed(2)}</strong> CPS
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '12px', 
              borderLeft: `3px solid ${currentRank.color}`, fontStyle: 'italic', color: '#cbd5e1', 
              fontSize: '0.88rem', textAlign: 'left', marginBottom: '1.25rem', lineHeight: '1.5' 
            }}>
              {currentRank.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { value: scrollCount, label: 'Total Scrolls', color: 'var(--neon-cyan)' },
                { value: upScrolls, label: 'Up Scrolls (↑)', color: 'var(--neon-green)' },
                { value: downScrolls, label: 'Down Scrolls (↓)', color: 'var(--neon-orange)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '0.5rem 0.25rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => resetGame()}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                🔄 Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { resetGame(); setTimeout(() => start(), 100); }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: currentRank.color, borderColor: currentRank.color, color: '#000', fontWeight: '700' }}
              >
                ▶ Try Again
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= SEO ARTICLES & EDUCATION SECTION ================= */}
      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What is a Scroll Wheel Test (CPS Checker)?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>Scroll Wheel Test</strong> is a technical diagnostic utility that measures your hardware's scroll inputs per second (<strong>CPS</strong>). When you scroll a physical mouse wheel, the browser captures the <code>wheel</code> event matrix and logs the delta fluctuations. This tool is widely used by competitive gamers, web developers, and quality assurance engineers to assess wheel step tactility, encoder responsiveness, and potential hardware degradation.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Why Scroll Speed (CPS) Matters for Gamers and Professionals
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            In tactical eSports like <em>Minecraft</em> (for rapid inventory switching), <em>Apex Legends</em> (for tap-strafing bindings), or <em>Counter-Strike</em> (for bunny hopping precision), your mouse wheel acts as a critical secondary execution layer. A high-quality mechanical or optical encoder translates fast continuous inputs into reliable in-game actions without missing individual actuation points. For office professionals and data analysts, a fluid scroll engine ensures seamless navigation through thousands of spreadsheet rows or code repositories without finger fatigue.
          </p>

          {/* Rank Reference Table */}
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Scroll Speed (CPS) Performance Hierarchy
          </h3>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: '#fff' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Rank Badge</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>CPS Threshold</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Skill Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: '#94a3b8' }}>Snail</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>Less than 15 CPS</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Casual web browsing pace. Normal physical finger movement.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-green)' }}>Turtle</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>15 - 24 CPS</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Standard gaming reflexes. Clean wheel step coordination.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Fox</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>25 - 34 CPS</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Advanced finger flicking techniques or high-spec mechanical encoders.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-orange)' }}>Cheetah</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>35 - 44 CPS</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Exceptional mechanics. Typically reached via advanced mouse hyper-scrolling.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-purple)' }}>Machine</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>45+ CPS</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Top-tier physical burst limits or automated free-spin infinite wheel options.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How is CPS (Scrolls Per Second) evaluated mathematically?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                The software divides your progressive raw input count by the time vector elapsed: <code>Scroll Count / Time Duration</code>. Running the test over longer frames (e.g., 30s) checks your muscular endurance and consistency over raw burst limits.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What causes a mouse wheel to miss inputs or skip directions?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                This performance degradation usually stems from dusty rotary components or a failing mechanical encoder wheel gear. Accumulating lint breaks down the physical copper terminal sweeps, leading to intermittent signal structural drops or reverse ghost inputs.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Does this script support infinite scroll wheels (Free-spin mode)?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Yes! If your hardware device (like the Logitech G502 series or Razer Basilisk) features an unlocked fluid flywheel design, you can achieve extraordinarily high burst values on our listener, directly mapping the physical raw spin performance.
              </p>
            </div>
          </div>
        </section>
    </div>
  );
}

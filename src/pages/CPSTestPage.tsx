import { useState, useRef, useCallback, useEffect } from 'react';

const DURATIONS = [1, 2, 5, 10, 15, 30, 60];

type Phase = 'idle' | 'running' | 'done';

interface ClickEvent { time: number; }

export default function CPSTestPage() {
  const [duration, setDuration] = useState(5);
  const [customTime, setCustomTime] = useState<string>(''); 
  const [phase, setPhase] = useState<Phase>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [cps, setCps] = useState(0);
  const [maxCps, setMaxCps] = useState(0);
  const [history, setHistory] = useState<{ cps: number; clicks: number; duration: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickEvents = useRef<ClickEvent[]>([]);
  const rippleId = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const durationRef = useRef(duration);

  useEffect(() => { durationRef.current = duration; }, [duration]);

  const recordClick = () => {
    const now = performance.now();
    clickEvents.current.push({ time: now });
    setClicks(prev => prev + 1);
  };

  const getRating = (c: number) => {
    if (c >= 12) return { 
      label: 'Machine', 
      emoji: '🤖', 
      color: 'var(--neon-red)', 
      stars: 5, 
      desc: '"Unbelievable processing! Your fingers execute inputs with cybernetic efficiency. Absolute dominance!"' 
    };
    if (c >= 9)  return { 
      label: 'Cheetah', 
      emoji: '🐆', 
      color: 'var(--neon-orange)', 
      stars: 4, 
      desc: '"Your fingers snap at blistering speed just like the speedie cat runs. Hail to the king of clicking!"' 
    };
    if (c >= 7)  return { 
      label: 'Fox', 
      emoji: '🦊', 
      color: 'var(--neon-cyan)', 
      stars: 3, 
      desc: '"Sharp, quick, and tactical. You navigate the trigger points with impressive agility and cunning wit."' 
    };
    if (c >= 5)  return { 
      label: 'Turtle', 
      emoji: '🐢', 
      color: 'var(--neon-green)', 
      stars: 2, 
      desc: '"Slow and steady pace. A safe execution strategy, but you need to unleash your inner explosive power!"' 
    };
    return { 
      label: 'Snail', 
      emoji: '🐌', 
      color: 'var(--text-secondary)', 
      stars: 1, 
      desc: '"One crawl at a time. Relax your forearm muscles, upgrade your grip pattern, and try again!"' 
    };
  };

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const dur = durationRef.current;
    const totalClicks = clickEvents.current.length;
    const finalCps = parseFloat((totalClicks / dur).toFixed(2));
    setCps(finalCps);
    setClicks(totalClicks);
    setPhase('done');
    setTimeLeft(0);
    setHistory(prev => [{ cps: finalCps, clicks: totalClicks, duration: dur }, ...prev.slice(0, 9)]);
  }, []);

  const startTest = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';

    const dur = durationRef.current;
    setPhase('running');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(dur);
    clickEvents.current = [];
    startTime.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const remaining = Math.max(0, dur - elapsed);
      setTimeLeft(remaining);

      const now = performance.now();
      const recent = clickEvents.current.filter(e => now - e.time < 1000);
      const liveCps = recent.length;
      setCps(liveCps);
      setMaxCps(prev => Math.max(prev, liveCps));

      if (remaining <= 0) endTest();
    }, 50);
  }, [endTest]);

  const resetTest = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('idle');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(durationRef.current);
    clickEvents.current = [];
  }, []);

  const handleCustomTimeSet = () => {
    const time = parseInt(customTime);
    if (time > 0) {
      setDuration(time);
      durationRef.current = time;
      resetTest();
      setTimeLeft(time);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 0) return;

    if (phaseRef.current === 'idle') { startTest(); return; }
    if (phaseRef.current !== 'running') return;

    recordClick();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  useEffect(() => {
    if (phase === 'done') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const finalRating = phase === 'done' ? getRating(cps) : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rippleAnim {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">CPS Test</h1>
        <p className="tool-subtitle">Clicks Per Second — How fast can you click?</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        {DURATIONS.map(d => (
          <button
            key={d}
            onClick={() => { setDuration(d); durationRef.current = d; resetTest(); setTimeLeft(d); setCustomTime(''); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d && !customTime ? '1px solid var(--neon-green)' : '1px solid var(--border)',
              background: duration === d && !customTime ? 'rgba(0,255,136,0.15)' : 'var(--bg-card)',
              color: duration === d && !customTime ? 'var(--neon-green)' : 'var(--text-secondary)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}
          >{d}s</button>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: phase === 'idle' ? '0.00' : typeof cps === 'number' && cps % 1 !== 0 ? cps.toFixed(2) : cps, label: 'CPS', color: 'var(--neon-cyan)' },
          { value: clicks, label: 'Clicks', color: 'var(--neon-green)' },
          { value: timeLeft.toFixed(1), label: 'Seconds Left', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div
        onClick={handleClick}
        style={{
          position: 'relative', overflow: 'hidden', width: '100%', minHeight: '220px',
          borderRadius: '16px',
          border: phase === 'running' ? '2px solid var(--neon-green)' : phase === 'done' ? '2px solid var(--neon-orange)' : '2px solid var(--border)',
          background: phase === 'running' ? 'rgba(0,255,136,0.04)' : 'var(--bg-card)',
          cursor: phase === 'done' ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '0.75rem', userSelect: 'none',
          transition: 'all 0.2s ease', 
          marginBottom: phase === 'running' ? '1rem' : '1.5rem',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,255,136,0.1)' : 'none',
        }}
      >
        {ripples.map(r => (
          <span key={r.id} style={{
            position: 'absolute', left: r.x, top: r.y, width: '20px', height: '20px',
            borderRadius: '50%', background: 'rgba(0,255,136,0.6)',
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'rippleAnim 0.6s ease-out forwards', pointerEvents: 'none',
          }} />
        ))}

        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '3rem' }}>🖱️</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-green)' }}>Click to Start!</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click anywhere in this area as fast as you can</span>
          </>
        )}
        {phase === 'running' && (
          <>
            <span style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-green)', fontVariantNumeric: 'tabular-nums', zIndex: 10 }}>{clicks}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', zIndex: 10 }}>Keep clicking! 🔥</span>
            <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', zIndex: 10 }}>{timeLeft.toFixed(1)}s remaining</span>
          </>
        )}
        {phase === 'done' && (
          <>
            <span style={{ fontSize: '3rem' }}>🏁</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Test Complete!</span>
          </>
        )}
      </div>

      {phase === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <button
            onClick={(e) => { e.stopPropagation(); resetTest(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#1e2235', border: '1px solid #2a3047',
              color: '#ffffff', padding: '0.6rem 1.25rem',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600',
              transition: 'all 0.2s ease',
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

      {/* ===== MODERN PROFILE SPLIT RESULT MODAL ===== */}
      {phase === 'done' && finalRating && (
        <>
          {/* Backdrop */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => resetTest()} />

          {/* Modal Container */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', 
            maxWidth: '560px',
            background: '#0d1117',
            border: `2px solid ${finalRating.color}`,
            borderRadius: '20px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: `0 0 40px ${finalRating.color}25`,
          }}>
            {/* Close button */}
            <button onClick={() => resetTest()} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${finalRating.color}40`,
              color: finalRating.color, width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            {/* Split Grid Layout (Animal vs Rank/Stats) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1.2fr', 
              gap: '1.25rem', 
              alignItems: 'center', 
              minHeight: '130px', 
              marginBottom: '1.25rem' 
            }}>
              
              {/* Left Column: Graphic Animal Badge */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRight: '1px solid rgba(255,255,255,0.08)', 
                paddingRight: '1rem', 
                height: '100%' 
              }}>
                <span style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${finalRating.color}40)` }}>
                  {finalRating.emoji}
                </span>
              </div>

              {/* Right Column: Score details */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Rank is
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: finalRating.color, fontStyle: 'italic', margin: '0.1rem 0' }}>
                  {finalRating.label}!
                </div>
                
                {/* Visual Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem', color: i < finalRating.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>
                      ★
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  You Clicked with the speed of <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{cps}</strong> CPS
                </div>
              </div>
            </div>

            {/* Graphic Subtitle Quote Box */}
            <div style={{ 
              background: 'rgba(0,0,0,0.25)', 
              padding: '0.85rem 1rem', 
              borderRadius: '12px', 
              borderLeft: `3px solid ${finalRating.color}`, 
              fontStyle: 'italic', 
              color: '#cbd5e1', 
              fontSize: '0.88rem', 
              textAlign: 'left', 
              marginBottom: '1.25rem', 
              lineHeight: '1.5' 
            }}>
              {finalRating.desc}
            </div>

            {/* Bottom mini counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { value: clicks, label: 'Total Clicks', color: 'var(--neon-green)' },
                { value: maxCps, label: 'Peak (1s)', color: 'var(--neon-cyan)' },
                { value: `${duration}s`, label: 'Duration', color: 'var(--neon-orange)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px', padding: '0.5rem 0.25rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action Control Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => resetTest()}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                🔄 Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { resetTest(); startTest(); }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: finalRating.color, borderColor: finalRating.color, color: '#000', fontWeight: '700' }}
              >
                ▶ Try Again
              </button>
            </div>
          </div>
        </>
      )}

      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
            📊 Session History
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: '0.875rem',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.cps} CPS</span>
              <span style={{ color: 'var(--text-secondary)' }}>{h.clicks} clicks</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.duration}s test</span>
              <span style={{ color: getRating(h.cps).color, fontWeight: '600' }}>{getRating(h.cps).label}</span>
            </div>
          ))}
        </div>
      )}

      {/* SEO ARTICLE SECTION */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What is a CPS Test and How Does It Work?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>CPS Test (Clicks Per Second Test)</strong> is an interactive online tool used to measure mouse clicking speed over a specific duration. Originally popular among competitive Minecraft PvP players, CPS speed checkers are now widely used by global eSports athletes to audit their physical reflexes and evaluate mouse hardware capabilities. The calculation is simple: your total recorded mouse clicks divided by the selected duration equals your raw CPS score.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Advanced Mouse Clicking Techniques Covered
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            While standard point-and-click actions typically yield average scores, advanced gaming communities have developed specialized muscle manipulation methods to break the limits of hardware:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: '🖱️ Regular Clicking', desc: 'The natural finger press used in daily operations. Typically limits users to a safe 4-8 CPS range.' },
              { title: '⚡ Jitter Clicking', desc: 'Controlled hand vibration. By straining forearm muscles, players transmit rapid micro-spasms to the finger, pushing output to 9-14 CPS.' },
              { title: '🦋 Butterfly Clicking', desc: 'Alternating index and middle fingers on a single mouse clicker, creating a rapid double-hit cycle resulting in 15-22+ CPS.' },
            ].map(tip => (
              <div key={tip.title} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--neon-green)' }}>{tip.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>{tip.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Why eSports Gamers Frequently Test Clicks Per Second
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            In tactical strategy titles and rapid battle arenas, actions-per-minute (APM) determine how quickly you execute inventory swaps, weapon triggers, or spell-casting queues. Consistently benchmarking your input speed ensures you are maintaining peak physical conditioning while checking if your mechanical mouse switches are suffering from double-click degradation or input lag.
          </p>

          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px dashed var(--border)' }}>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What is the world record for the highest CPS test?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                According to official gaming leaderboards, the absolute highest world records peak around <strong>22 to 27 CPS</strong>, typically accomplished via highly specialized drag-clicking or butterfly-clicking techniques on unbuffered gaming mice.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Does jitter clicking cause physical harm or carpal tunnel?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Extended strain can lead to wrist fatigue. If you are practicing intense vibration methods like jitter clicking, it is critical to take regular 5-minute stretching intervals to safeguard your joint health.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What is the best time frame to test actual speed?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                The <strong>5-second test</strong> is the industry standard benchmark because it balances raw human explosive power without introducing excessive physical muscle exhaustion.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
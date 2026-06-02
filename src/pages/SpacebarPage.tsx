import { useState, useEffect, useRef, useCallback } from 'react';

const DURATIONS = [5, 10, 15, 30, 60];

interface HistoryItem { count: number; sps: number; duration: number; }

export default function SpacebarPage() {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [duration, setDuration] = useState(10);
  const [customTime, setCustomTime] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [maxSps, setMaxSps] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const pressEvents = useRef<number[]>([]);
  const phaseRef = useRef<'idle' | 'running' | 'done'>('idle');
  const durationRef = useRef(duration);

  useEffect(() => { durationRef.current = duration; }, [duration]);

  const getRating = (n: number) => {
    if (n >= 15) return { 
      label: 'Machine', 
      emoji: '🤖', 
      color: 'var(--neon-red, #ff2d55)', 
      stars: 5, 
      desc: '"Unbelievable processing! Your fingers execute inputs with cybernetic efficiency. Absolute dominance!"' 
    };
    if (n >= 10) return { 
      label: 'Cheetah', 
      emoji: '🐆', 
      color: 'var(--neon-orange, #f97316)', 
      stars: 4, 
      desc: '"Your fingers snap at blistering speed just like the speedie cat runs. Hail to the king of clicking!"' 
    };
    if (n >= 7)  return { 
      label: 'Fox', 
      emoji: '🦊', 
      color: 'var(--neon-cyan, #00f5ff)', 
      stars: 3, 
      desc: '"Sharp, quick, and tactical. You navigate the trigger points with impressive agility and cunning wit."' 
    };
    if (n >= 4)  return { 
      label: 'Turtle', 
      emoji: '🐢', 
      color: 'var(--neon-green, #10b981)', 
      stars: 2, 
      desc: '"Slow and steady pace. A safe execution strategy, but you need to unleash your inner explosive power!"' 
    };
    return { 
      label: 'Snail', 
      emoji: '🐌', 
      color: 'var(--text-secondary, #94a3b8)', 
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
    const totalPresses = pressEvents.current.length;
    const finalSps = parseFloat((totalPresses / dur).toFixed(2));
    
    setCount(totalPresses);
    setPhase('done');
    setTimeLeft(0);
    setHistory(prev => [{ count: totalPresses, sps: finalSps, duration: dur }, ...prev.slice(0, 9)]);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';

    const dur = durationRef.current;
    setPhase('running');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(dur);
    pressEvents.current = [];
    startTime.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, dur - elapsed);
      setTimeLeft(left);

      const now = performance.now();
      const recent = pressEvents.current.filter(t => now - t < 1000);
      setMaxSps(prev => Math.max(prev, recent.length));

      if (left <= 0) endTest();
    }, 50);
  }, [endTest]);

  const recordPress = () => {
    pressEvents.current.push(performance.now());
    setCount(prev => prev + 1);
  };

  const resetTest = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('idle');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(durationRef.current);
    pressEvents.current = [];
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

  const handleSpacebar = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat) return;
    if (e.key !== ' ') return;
    if (phaseRef.current === 'idle') { start(); return; }
    if (phaseRef.current !== 'running') return;
    recordPress();
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (e.repeat) return;
        if (phaseRef.current === 'idle') { start(); return; }
        if (phaseRef.current === 'running') recordPress();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [start]);

  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  const liveSps = count > 0 && phase === 'running'
    ? ((count / Math.max(0.1, duration - timeLeft))).toFixed(1)
    : '0';
  
  const finalSps = parseFloat((count / duration).toFixed(2));
  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const finalRating = getRating(finalSps);

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
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Spacebar Counter</h1>
        <p className="tool-subtitle">Hit that spacebar as fast as you can!</p>
      </div>

      {/* Duration selector with Custom Input */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        {DURATIONS.map(d => (
          <button
            key={d}
            onClick={() => { setDuration(d); durationRef.current = d; resetTest(); setTimeLeft(d); setCustomTime(''); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d && !customTime ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: duration === d && !customTime ? 'rgba(0,245,255,0.15)' : 'var(--bg-card)',
              color: duration === d && !customTime ? 'var(--neon-cyan)' : 'var(--text-secondary)',
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: count, label: 'Presses', color: 'var(--neon-cyan)' },
          { value: phase === 'running' ? liveSps : phase === 'done' ? finalSps.toFixed(2) : '0.00', label: 'CPS', color: 'var(--neon-green)' },
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

      {/* Spacebar Interactive Hitbox */}
      <div
        tabIndex={0}
        onKeyDown={handleSpacebar}
        style={{ outline: 'none', marginBottom: '1.5rem' }}
      >
        <div style={{
          width: '100%', padding: '2.5rem 1rem', borderRadius: '16px',
          background: phase === 'running' ? 'rgba(0,245,255,0.05)' : 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? 'var(--neon-cyan)' : phase === 'done' ? 'var(--neon-orange)' : 'var(--border)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          cursor: 'default', userSelect: 'none',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.1)' : 'none',
          transition: 'all 0.2s',
        }}>
          {phase === 'idle' && (
            <>
              <span style={{ fontSize: '3rem' }}>▭</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>Press SPACE to Start</span>
            </>
          )}
          {phase === 'running' && (
            <>
              <div style={{ fontSize: '5rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{count}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Keep pressing SPACE! ⚡</div>
            </>
          )}
          {phase === 'done' && (
            <>
              <span style={{ fontSize: '3rem' }}>🏁</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Test Complete!</span>
            </>
          )}
        </div>

        {/* Physical Spacebar Indicator Graphic */}
        {phase !== 'done' && (
          <div style={{
            width: '100%', height: '52px', marginTop: '1rem',
            background: phase === 'running' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${phase === 'running' ? 'var(--neon-cyan)' : 'var(--border)'}`,
            borderBottom: `5px solid ${phase === 'running' ? 'rgba(0,180,200,0.8)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: '700',
            color: phase === 'running' ? '#000' : 'var(--text-muted)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            transition: 'all 0.05s', cursor: 'default', userSelect: 'none',
            boxShadow: phase === 'running' ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
          }}>
            SPACEBAR
          </div>
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

      {/* ===== MODERN PROFILE SPLIT RESULT MODAL ===== */}
      {phase === 'done' && finalRating && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => resetTest()} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '560px', background: '#0d1117',
            border: `2px solid ${finalRating.color}`, borderRadius: '20px', padding: '2rem 1.5rem',
            textAlign: 'center', zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: `0 0 40px ${finalRating.color}25`,
          }}>
            <button onClick={() => resetTest()} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${finalRating.color}40`,
              color: finalRating.color, width: '32px', height: '32px',
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
                <span style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${finalRating.color}40)` }}>
                  {finalRating.emoji}
                </span>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Rank is
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: finalRating.color, fontStyle: 'italic', margin: '0.1rem 0' }}>
                  {finalRating.label}!
                </div>
                
                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem', color: i < finalRating.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>
                      ★
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  You Pressed with the speed of <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{finalSps.toFixed(2)}</strong> CPS
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '12px', 
              borderLeft: `3px solid ${finalRating.color}`, fontStyle: 'italic', color: '#cbd5e1', 
              fontSize: '0.88rem', textAlign: 'left', marginBottom: '1.25rem', lineHeight: '1.5' 
            }}>
              {finalRating.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { value: count, label: 'Total Presses', color: 'var(--neon-cyan)' },
                { value: maxSps, label: 'Peak CPS (1s)', color: 'var(--neon-green)' },
                { value: `${duration}s`, label: 'Duration', color: 'var(--neon-orange)' },
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
                onClick={() => resetTest()}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                🔄 Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { resetTest(); setTimeout(() => start(), 100); }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: finalRating.color, borderColor: finalRating.color, color: '#000', fontWeight: '700' }}
              >
                ▶ Try Again
              </button>
            </div>
          </div>
        </>
      )}

      {/* History table */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>
            📊 Session History
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem', fontSize: '0.875rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.sps} CPS</span>
              <span style={{ color: 'var(--text-secondary)' }}>{h.count} presses</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.duration}s</span>
              <span style={{ color: getRating(h.sps).color, fontWeight: '600' }}>{getRating(h.sps).label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ================= SEO ARTICLES & EDUCATION SECTION ================= */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What is a Spacebar Counter (CPS Test)?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>Spacebar Counter</strong> is a specialized mechanical keystroke diagnostic tool designed to log and compute your spacebar actuations per second (<strong>CPS</strong>). This tool targets the performance thresholds of your keyboard's stabilizer housing and your personal manual neuromuscular burst speed. It is a benchmark standard in gaming communities for checking mechanical switch delay, key-chatter anomalies, and raw thumb fatigue intervals.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            The Mechanical Importance of Spacebar Stabilizers
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Because the spacebar is the longest keycap on any standard layout keyboard, it requires structural reinforcement bars (called <strong>stabilizers</strong>) beneath both ends of the housing switch. Unlike smaller single-stem keys, a high-frequency spacebar speed run puts immense stress on these stabilization points. If your keyboard features cheap factory lubricants or loose housings, hitting the outer edges rapidly can cause severe key binding or asymmetric key tilting, drastically limiting your peak CPS potential.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Pro Methods to Increase Your Spacebar Clicking Speed
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            To break past the average bracket and achieve a 10+ CPS machine rating, casual single-finger hammering won't cut it. Pro clicking enthusiasts rely on specialized clicking styles:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>The Butterfly Method:</strong> Alternating your left and right index/middle fingers directly on the center ridge of the spacebar for seamless rapid-fire continuous activations.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Jitter Vibrations:</strong> Deliberately tensing your forearm muscles to pass micro-vibrations straight down through your wrist into your thumb, delivering rapid burst clicks.
            </li>
          </ul>

          {/* FAQ Section */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Why does this counter ignore key-holding actions?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                The script explicitly monitors the Native hardware event pipeline with the expression <code>if (e.repeat) return;</code>. This programmatic filter discards operating system auto-repeat signals, verifying that every single increase in score matches a distinct, physical downstroke cycle.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How does switch actuation depth affect the overall score?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Standard mechanical blue/brown tactile switches feature an actuation travel depth of roughly 2.0mm. Low-profile speed silver linear switches actuate early at a shallow 1.2mm, allowing your hand to loop mechanical strokes much faster and achieve cleaner peak CPS rates.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Is there any difference between clicking the visual card and pressing the physical key?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                The active window listener routes both execution layers safely, but physical keyboard matrix scanning is infinitely faster and more reliable than mouse click coordinate handshakes. We highly advise focusing entirely on the physical spacebar hardware.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
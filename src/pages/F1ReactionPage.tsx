import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'idle' | 'lighting' | 'ready' | 'foul' | 'result';
type Mode = 'Rookie' | 'Pro' | 'F1 Elite';

interface HistoryItem {
  id: string;
  time: number;
  mode: Mode;
  date: number;
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  check: (hist: HistoryItem[]) => boolean;
}

export default function F1ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('Pro');
  const [lights, setLights] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<{ id: number; color: string; left: string; size: string; delay: string; radius: string }[]>([]);
  
  // FAQ state for SEO section
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const startTime = useRef<number>(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);

  const theme = {
    bg: '#070b12',
    cardBg: '#111823',
    border: '#1b2636',
    cyan: '#00e5ff',
    green: '#00f5b4',
    orange: '#ff7a00',
    textMuted: '#64748b',
    textLight: '#f8fafc',
    f1Red: '#ff2a4b'
  };

  const initAudio = () => {
    if (!audioCtx.current && !isMuted) {
      try {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const playTone = (freq: number, type: OscillatorType, dur: number, freqEnd?: number) => {
    if (isMuted || !audioCtx.current) return;
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
    
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    if (freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.current.currentTime + dur);
    }
    
    gain.gain.setValueAtTime(0.4, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + dur);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    osc.start();
    osc.stop(audioCtx.current.currentTime + dur);
  };

  const playLight = () => playTone(440, 'sine', 0.08);
  const playFoul = () => playTone(150, 'sawtooth', 0.35, 50);
  
  const playRecord = () => {
    if (isMuted || !audioCtx.current) return;
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
    
    const notes: [number, number][] = [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.35]];
    notes.forEach(([f, t]) => {
      if (!audioCtx.current) return;
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, audioCtx.current.currentTime + t);
      gain.gain.setValueAtTime(0, audioCtx.current.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.35, audioCtx.current.currentTime + t + 0.02);
      gain.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + t + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start(audioCtx.current.currentTime + t);
      osc.stop(audioCtx.current.currentTime + t + 0.15);
    });
  };

  const vibrate = (pattern: number | number[]) => {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    try {
      const h = localStorage.getItem('f1rt_hist');
      const f = localStorage.getItem('f1rt_fouls');
      const m = localStorage.getItem('f1rt_muted');
      if (h) setHistory(JSON.parse(h));
      if (f) setFalseStarts(parseInt(f) || 0);
      if (m) setIsMuted(m === 'true');
    } catch (e) {}
  }, []);

  const spawnConfetti = () => {
    const colors = [theme.cyan, theme.green, theme.orange, '#fff'];
    const pieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      size: `${4 + Math.random() * 8}px`,
      delay: `${Math.random() * 0.5}s`,
      radius: Math.random() > 0.5 ? '50%' : '2px'
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3000);
  };

  const startSequence = useCallback(() => {
    initAudio();
    clearTimers();
    setReactionTime(null);
    setIsNewRecord(false);
    setPhase('lighting');
    setLights(0);

    for (let i = 1; i <= 5; i++) {
      const t = setTimeout(() => {
        setLights(i);
        playLight();
        vibrate(20);
      }, i * 900);
      timers.current.push(t);
    }

    const delays = { 'Rookie': [800, 2500], 'Pro': [1500, 4000], 'F1 Elite': [2500, 6000] };
    const [min, max] = delays[mode] || [1500, 4000];
    const rand = Math.random() * (max - min) + min;

    const tGo = setTimeout(() => {
      setPhase('ready');
      setLights(0);
      startTime.current = performance.now();
    }, 4500 + rand);
    timers.current.push(tGo);
  }, [mode, isMuted]);

  const handleInteraction = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      if (e.type === 'touchstart') e.preventDefault();
      e.stopPropagation();
    }
    vibrate(30);

    if (phase === 'idle' || phase === 'result' || phase === 'foul') {
      startSequence();
    } else if (phase === 'lighting') {
      clearTimers();
      setPhase('foul');
      setLights(0);
      setFalseStarts(prev => {
        const next = prev + 1;
        localStorage.setItem('f1rt_fouls', next.toString());
        return next;
      });
      playFoul();
      vibrate([100, 50, 100]);
    } else if (phase === 'ready') {
      const time = Math.round(performance.now() - startTime.current);
      setReactionTime(time);
      setPhase('result');
      
      const pb = history.length ? Math.min(...history.map(h => h.time)) : Infinity;
      const record = time < pb;
      setIsNewRecord(record);

      if (record) {
        playRecord();
        spawnConfetti();
        vibrate([50, 30, 50, 30, 100]);
      }

      const newHistory: HistoryItem[] = [
        { id: Math.random().toString(36).slice(2, 9), time, mode, date: Date.now() },
        ...history
      ];
      setHistory(newHistory);
      localStorage.setItem('f1rt_hist', JSON.stringify(newHistory));
    }
  }, [phase, mode, history, startSequence]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleInteraction();
      }
      if (e.key.toLowerCase() === 'r') {
        if (phase !== 'lighting') startSequence();
      }
      if (e.key.toLowerCase() === 's') {
        setIsMuted(prev => {
          localStorage.setItem('f1rt_muted', (!prev).toString());
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleInteraction, startSequence]);

  const getRating = (ms: number) => {
    if (ms < 150) return { text: 'F1 Driver Level', color: '#e040fb' };
    if (ms < 200) return { text: 'Alien Reflexes', color: theme.cyan };
    if (ms < 250) return { text: 'Excellent', color: theme.green };
    if (ms < 300) return { text: 'Great', color: theme.orange };
    if (ms < 400) return { text: 'Average', color: '#94a3b8' };
    return { text: 'Rookie', color: theme.textMuted };
  };

  const getBarColor = (ms: number) => {
    if (ms < 150) return '#e040fb';
    if (ms < 200) return theme.cyan;
    if (ms < 250) return theme.green;
    if (ms < 300) return theme.orange;
    return '#334155';
  };

  const pbValue = history.length ? Math.min(...history.map(h => h.time)) : null;
  const recentTimes = history.slice(0, 10).map(h => h.time);
  const avgValue = recentTimes.length ? Math.round(recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length) : null;

  const ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', icon: '🏁', label: 'First Race', check: (h) => h.length >= 1 },
    { id: 'a2', icon: '⚡', label: 'Sub 300ms', check: (h) => h.some(x => x.time < 300) },
    { id: 'a3', icon: '🔥', label: 'Sub 250ms', check: (h) => h.some(x => x.time < 250) },
    { id: 'a4', icon: '🚀', label: 'Sub 200ms', check: (h) => h.some(x => x.time < 200) },
    { id: 'a5', icon: '👽', label: 'Sub 150ms', check: (h) => h.some(x => x.time < 150) },
    { id: 'a6', icon: '🥈', label: '10 Races', check: (h) => h.length >= 10 },
    { id: 'a7', icon: '🥇', label: '50 Races', check: (h) => h.length >= 50 },
    { id: 'a8', icon: '🏆', label: '100 Races', check: (h) => h.length >= 100 },
  ];

  const shareScore = async () => {
    if (!reactionTime) return;
    const r = getRating(reactionTime);
    const text = `🏎️ F1 Lights Out Reaction Test\n⏱️ My time: ${reactionTime}ms\n🏆 Rating: ${r.text}\nCan you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'F1 Reaction Test', text });
      } else {
        await navigator.clipboard.writeText(text + '\n' + window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {}
  };

  const recentReverse = history.slice(0, 10).reverse();
  const maxTime = recentReverse.length ? Math.max(...recentReverse.map(h => h.time)) : 1;
  const minTime = recentReverse.length ? Math.min(...recentReverse.map(h => h.time)) : 0;
  const timeRange = maxTime - minTime || 1;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      backgroundImage: `
        linear-gradient(rgba(27, 38, 54, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(27, 38, 54, 0.15) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      color: theme.textLight, 
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh', 
      padding: '2rem 1rem', 
      overflowX: 'hidden', 
      WebkitTapHighlightColor: 'transparent'
    }}>
      
      {/* Confetti */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
        {confetti.map(piece => (
          <div key={piece.id} style={{
            position: 'absolute', top: '-10px', left: piece.left, backgroundColor: piece.color,
            width: piece.size, height: piece.size, borderRadius: piece.radius,
            animation: `fall ${1.5 + Math.random() * 2}s ${piece.delay} linear forwards`
          }} />
        ))}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Block */}
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 229, 255, 0.05)', border: `1px solid rgba(0, 229, 255, 0.2)`, color: theme.cyan, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '2px', padding: '5px 14px', borderRadius: '100px', marginBottom: '12px', textTransform: 'uppercase' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.cyan }} />
              F1 LIGHTS OUT
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>
              F1 REACTION<br /><span style={{ color: theme.green }}>TIME TEST</span>
            </h1>
            <p style={{ fontSize: '.95rem', color: '#64748b', opacity: 0.9, fontWeight: 400, maxWidth: '500px', lineHeight: 1.4 }}>
              Wait for all 5 red lights — when they go out, react instantly.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            <div style={{ display: 'flex', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '4px', gap: '2px' }}>
              {(['Rookie', 'Pro', 'F1 Elite'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => phase !== 'lighting' && setMode(m)}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '.5px', padding: '6px 14px', border: 'none', borderRadius: '7px', cursor: phase === 'lighting' ? 'not-allowed' : 'pointer', transition: 'all .15s',
                    backgroundColor: mode === m ? theme.green : 'transparent',
                    color: mode === m ? '#000' : theme.textMuted,
                    boxShadow: mode === m ? `0 2px 12px rgba(0, 245, 180, 0.4)` : 'none'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsMuted(prev => !prev);
                localStorage.setItem('f1rt_muted', (!isMuted).toString());
              }}
              style={{ width: '40px', height: '40px', border: `1px solid ${theme.border}`, borderRadius: '10px', backgroundColor: theme.cardBg, color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </header>

        {/* Dynamic Gantry Arena Container */}
        <main
          onMouseDown={(e) => { if (e.button === 0) handleInteraction(e); }}
          onTouchStart={handleInteraction}
          style={{
            position: 'relative', borderRadius: '16px', border: `1px solid ${phase === 'foul' ? 'rgba(255,42,75,0.3)' : phase === 'ready' ? 'rgba(0,245,180,0.2)' : theme.border}`,
            backgroundColor: phase === 'foul' ? 'rgba(255,42,75,0.03)' : phase === 'ready' ? 'rgba(0,245,180,0.02)' : theme.cardBg,
            cursor: 'pointer', userSelect: 'none', touchAction: 'manipulation', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '2rem 1rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,transparent,${theme.cyan},transparent)`, opacity: 0.3 }} />
          
          {/* Gantry Box Component */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem', zIndex: 2 }}>
            <div style={{ background: '#090d14', border: `1px solid ${theme.border}`, borderRadius: '14px', padding: 'clamp(12px,3vw,20px) clamp(14px,4vw,28px)', display: 'flex', gap: 'clamp(10px,2.5vw,20px)', boxShadow: 'inset 0 8px 24px rgba(0,0,0,.5)' }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const isOn = lights > i;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,2vw,14px)' }}>
                    <div style={{
                      width: 'clamp(36px,8vw,60px)', height: 'clamp(36px,8vw,60px)', borderRadius: '50%', border: '3px solid #1a2332',
                      backgroundColor: isOn ? theme.f1Red : '#070a0f', boxShadow: isOn ? `0 0 20px ${theme.f1Red}, 0 0 40px rgba(255,42,75,0.4)` : 'none', transition: 'all 60ms linear'
                    }} />
                    <div style={{
                      width: 'clamp(36px,8vw,60px)', height: 'clamp(36px,8vw,60px)', borderRadius: '50%', border: '3px solid #1a2332',
                      backgroundColor: isOn ? theme.f1Red : '#070a0f', boxShadow: isOn ? `0 0 20px ${theme.f1Red}, 0 0 40px rgba(255,42,75,0.4)` : 'none', transition: 'all 60ms linear'
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', letterSpacing: '3px', color: theme.textMuted, textTransform: 'uppercase' }}>Starting Lights Gantry</div>
          </div>

          {/* Core Display State Machine */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '.75rem', zIndex: 2, minHeight: '140px', justifyContent: 'center' }}>
            {phase === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>Ready to Test?</h2>
                <p style={{ fontSize: '.85rem', color: theme.textMuted }}>Tap the screen or press SPACE when the lights go out.</p>
                <button onClick={(e) => { e.stopPropagation(); handleInteraction(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: theme.green, color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', padding: '14px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px rgba(0, 245, 180, 0.3)` }}>
                  🏁 Start Engine
                </button>
              </div>
            )}

            {phase === 'lighting' && (
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: theme.f1Red }}>
                <h2>Wait For Lights...</h2>
              </div>
            )}

            {phase === 'ready' && (
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(3rem,10vw,6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: theme.cyan, textShadow: `0 0 30px rgba(0,229,255,.4)` }}>
                <h2>TAP NOW!</h2>
              </div>
            )}

            {phase === 'foul' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, textTransform: 'uppercase', color: theme.f1Red, letterSpacing: '2px' }}>⛔ Jump Start!</h2>
                <p style={{ fontSize: '.85rem', color: '#f87171', marginTop: '4px' }}>You reacted before the lights went out.</p>
                <p style={{ fontSize: '.75rem', color: theme.textMuted, marginTop: '8px' }}>Tap anywhere to try again</p>
              </div>
            )}

            {phase === 'result' && reactionTime !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                {isNewRecord && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '.85rem', fontWeight: 700, letterSpacing: '3px', color: theme.orange, textTransform: 'uppercase' }}>★ New Personal Best ★</div>}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(3.5rem,12vw,7rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px', color: getRating(reactionTime).color }}>
                  {reactionTime}<span style={{ fontSize: 'clamp(1.2rem,3vw,2rem)', fontWeight: 400, color: theme.textMuted, marginLeft: '4px' }}>ms</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px', color: '#fff', textTransform: 'uppercase' }}>
                  Rating: {getRating(reactionTime).text}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={(e) => { e.stopPropagation(); startSequence(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', border: `1px solid ${theme.border}`, color: '#f0f0f0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                    ↺ Retry
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); shareScore(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: theme.cyan, border: 'none', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', boxShadow: `0 2px 10px rgba(0,229,255,0.3)` }}>
                    {copied ? '✓ Copied!' : '↗ Share'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <div style={{ textAlign: 'center', fontSize: '.75rem', color: theme.textMuted, letterSpacing: '.5px', marginTop: '.5rem' }}>
          [SPACE / ENTER] React &nbsp;•&nbsp; [R] Restart &nbsp;•&nbsp; [S] Toggle Sound
        </div>

        {/* Dashboard Analytics Viewport */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.75rem', marginTop: '1rem' }}>
          {[
            { icon: '🏆', label: 'Personal Best', value: pbValue ? `${pbValue}ms` : '—', color: theme.cyan },
            { icon: '📊', label: 'Avg (Last 10)', value: avgValue ? `${avgValue}ms` : '—', color: theme.green },
            { icon: '🏎️', label: 'Total Races', value: history.length.toString(), color: theme.textLight },
            { icon: '⚡', label: 'False Starts', value: falseStarts.toString(), color: theme.orange }
          ].map((stat, idx) => (
            <div key={idx} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '.75rem', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1e293b', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '.75rem', marginTop: '.75rem' }}>
          
          <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: theme.cyan, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🏅</span>Achievements
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {ACHIEVEMENTS.map(achv => {
                const unlocked = achv.check(history);
                const isGold = unlocked && (achv.id === 'a5' || achv.id === 'a8');
                return (
                  <div key={achv.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', transition: 'all .2s',
                    border: `1px solid ${isGold ? 'rgba(255,122,0,.3)' : unlocked ? theme.border : '#1e293b'}`,
                    backgroundColor: isGold ? 'rgba(255,122,0,.1)' : unlocked ? '#1e293b' : 'transparent',
                    color: isGold ? theme.orange : unlocked ? '#fff' : '#334155',
                    opacity: unlocked ? 1 : 0.3,
                  }}>
                    {achv.icon} {achv.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: theme.green, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>📈</span>Recent History
            </div>
            
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted, fontSize: '.85rem' }}>Complete a race to see history.</div>
            ) : (
              <>
                <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '.75rem', padding: '0 2px' }}>
                  {recentReverse.map(h => {
                    const heightPct = 20 + ((h.time - minTime) / timeRange) * 80;
                    return (
                      <div key={h.id} style={{
                        flex: 1, borderRadius: '3px 3px 0 0', minHeight: '4px',
                        height: `${heightPct}%`, backgroundColor: getBarColor(h.time), opacity: 0.85
                      }} title={`${h.time}ms`} />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', maxHeight: '170px', overflowY: 'auto' }}>
                  {history.slice(0, 20).map((h, i) => {
                    const rating = getRating(h.time);
                    const isPB = h.time === Math.min(...history.map(x => x.time));
                    return (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0c111a', border: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: '.7rem', color: theme.textMuted, fontFamily: "'JetBrains Mono', monospace", width: '28px' }}>#{history.length - i}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, color: rating.color }}>{h.time}ms{isPB ? ' ★' : ''}</span>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.textMuted, backgroundColor: theme.cardBg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${theme.border}` }}>{h.mode}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO FRIENDLY ARTICLE SECTION */}
        <section style={{ marginTop: '4rem', borderTop: `1px solid ${theme.border}`, paddingTop: '2.5rem', lineHeight: '1.7' }}>
          
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
            F1 Reaction Time Test: Ultimate Benchmark for Reflexes & CPS Performance
          </h2>
          
          <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            In high-stakes competitive esports and real-life motorsports, victory is decided in fractions of a millisecond. Whether you are aiming to lock down an absolute precision headshot in FPS titles or looking to pull off the ultimate grid launch on a Formula 1 track, your <strong>Reaction Time</strong> is the ultimate baseline. Our professional <strong>F1 Reaction Test</strong> (popularly known as the <em>F1 Lights Out Test</em>) perfectly replicates the official FIA Grand Prix starting light sequence to help casual gamers, pro esports players, and enthusiasts measure, optimize, and dominate their split-second cognitive response.
          </p>

          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: theme.cyan, textTransform: 'uppercase', margin: '2rem 0 1rem 0' }}>
            Why F1 Lights Out Test is Critical for CPS Test Tools
          </h3>
          <p style={{ fontSize: '0.98rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Many players believe that scaling up your score on a <strong>CPS Test (Clicks Per Second)</strong> is exclusively a matter of finger muscle speed. However, clicking velocity is highly tethered to neuromuscular response latency—which dictates exactly <em>when</em> your brain processes a visual trigger to initiate that physical finger movement. 
          </p>
          <p style={{ fontSize: '0.98rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Integrating consistent runs on our F1 reaction timer accelerates your core throughput on clicking benches due to:
          </p>
          
          <ul style={{ color: '#94a3b8', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Optimizing Click Latency:</strong> Training your mind to react immediately to the extinction of the red lights translates to dropping your starting delay time on high-speed CPS test engines to near zero.</li>
            <li><strong>Reducing Misclicks & Jump Starts:</strong> Advanced mechanics like Jitter Clicking or Butterfly Clicking require incredible rhythm control. The strict <em>Jump Start</em> penalty engine built into this F1 simulation trains you to avoid trigger-happy fouls.</li>
            <li><strong>Shifting into Elite Pro Tiers:</strong> While the global median reaction time sits around 250ms, elite esports professionals and actual F1 grid drivers operate closer to the sub-150ms mark. Regular training actively conditions your neural pathways to narrow down that window.</li>
          </ul>

          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: theme.green, textTransform: 'uppercase', margin: '2rem 0 1rem 0' }}>
            Understanding Your Reflex Score Tiers
          </h3>
          <p style={{ fontSize: '0.98rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            To track your ongoing progress, our analytics matrix ranks your performance across distinct diagnostic reflex rankings:
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem', border: `1px solid ${theme.border}`, borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Reaction Time Range</th>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Reflex Rating Rank</th>
                  <th style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Real-World Equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, color: '#e040fb', fontWeight: 'bold' }}>&lt; 150 ms</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>F1 Driver Level</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>God-Tier Speed (Verstappen/Hamilton Level)</td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(25, 30, 45, 0.4)' }}>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, color: theme.cyan, fontWeight: 'bold' }}>150 - 200 ms</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Alien Reflexes</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Tier-1 Esports Professional Athlete</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, color: theme.green, fontWeight: 'bold' }}>200 - 250 ms</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Excellent</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Hardcore High-Tier Competitive Gamer</td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(25, 30, 45, 0.4)' }}>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, color: theme.orange, fontWeight: 'bold' }}>250 - 300 ms</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Great</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>Standard Average Human Response baseline</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 'bold' }}>&gt; 400 ms</td>
                  <td style={{ padding: '12px 16px' }}>Rookie</td>
                  <td style={{ padding: '12px 16px' }}>Needs dedicated warm-ups and focus training</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FAQ Section */}
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', margin: '2.5rem 0 1rem 0' }}>
            Frequently Asked Questions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              {
                q: "What makes the F1 Reaction Test different from standard reaction tests?",
                a: "A regular reaction utility usually relies on a simple, unpredictable full-screen color shift. The F1 variant builds anticipation with five sequential warning lamps followed by a highly randomized suspension phase before turning off, mirroring the high-stress conditions found in competitive gaming."
              },
              {
                q: "Can this tool directly help increase my maximum CPS click capacity?",
                a: "Yes. By diminishing the inherent visual processing lag, it directly compresses your execution latency when you click down to trigger standard counting tools, yielding cleaner initial bursts."
              },
              {
                q: "How can I shave down milliseconds on my personal best score?",
                a: "Minimize hardware processing latency by leveraging high polling-rate gaming gear, ensure you are fully hydrated, eliminate background distractions, and consistently practice short intervals daily."
              }
            ].map((faq, index) => (
              <div key={index} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={{ width: '100%', padding: '14px 20px', backgroundColor: 'transparent', border: 'none', color: '#fff', textAlign: 'left', fontWeight: '6px', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: theme.cyan }}>{openFaq === index ? '▲' : '▼'}</span>
                </button>
                {openFaq === index && (
                  <div style={{ padding: '0 20px 14px 20px', color: '#94a3b8', fontSize: '0.92rem', borderTop: `1px solid ${theme.border}`, paddingTop: '10px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

      </div>
      
      {/* Global Style Rules Injector */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
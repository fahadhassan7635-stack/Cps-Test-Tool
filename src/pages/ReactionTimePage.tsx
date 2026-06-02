import { useState, useRef, useCallback } from 'react';

type Phase = 'idle' | 'waiting' | 'ready' | 'clicked' | 'early';

export default function ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const MAX_ROUNDS = 5;

  const startTime = useRef<number>(0);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startWaiting = () => {
    setPhase('waiting');
    const delay = 1500 + Math.random() * 3500;
    waitTimer.current = setTimeout(() => {
      setPhase('ready');
      startTime.current = performance.now();
    }, delay);
  };

  const handleClick = useCallback(() => {
    if (phase === 'idle') { startWaiting(); return; }

    if (phase === 'waiting') {
      if (waitTimer.current) clearTimeout(waitTimer.current);
      setPhase('early');
      return;
    }

    if (phase === 'ready') {
      const t = Math.round(performance.now() - startTime.current);
      setReactionTime(t);
      setResults(prev => [...prev, t]);
      setRound(prev => prev + 1);
      setPhase('clicked');
      return;
    }

    if (phase === 'clicked' || phase === 'early') {
      if (round >= MAX_ROUNDS) {
        setPhase('idle');
        setRound(0);
        setResults([]);
      } else {
        startWaiting();
      }
    }
  }, [phase, round]);

  const getRating = (ms: number) => {
    if (ms < 150) return { label: '🔥 Inhuman', color: '#ff2d55' };
    if (ms < 200) return { label: '⚡ Elite', color: '#ff6b00' };
    if (ms < 250) return { label: '🎯 Great', color: '#00f5ff' };
    if (ms < 300) return { label: '✅ Average', color: '#00ff88' };
    if (ms < 400) return { label: '😐 Slow', color: '#8e9aa8' };
    return { label: '🐢 Very Slow', color: '#566275' };
  };

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best = results.length > 0 ? Math.min(...results) : null;

  const zoneColors = {
    idle: { bg: '#0d1421', border: '#1e293b', text: '#8e9aa8' },
    waiting: { bg: 'rgba(255,107,0,0.08)', border: 'rgba(255,107,0,0.4)', text: '#ff6b00' },
    ready: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.5)', text: '#00ff88' },
    clicked: { bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.4)', text: '#00f5ff' },
    early: { bg: 'rgba(255,45,85,0.1)', border: 'rgba(255,45,85,0.4)', text: '#ff2d55' },
  };

  const colors = zoneColors[phase];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#070a12', color: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: '#00f5ff', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>Reaction Tool</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', color: '#ffffff' }}>Reaction Time Test</h1>
        <p style={{ color: '#8e9aa8', margin: '0' }}>Test your reflexes — how fast do you respond?</p>
      </div>

      {/* Round indicator */}
      {round > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} style={{
              width: '40px', height: '8px', borderRadius: '4px',
              background: i < results.length ? '#00f5ff' : '#1e293b',
              border: '1px solid #334155',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* Main zone */}
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          minHeight: '320px',
          borderRadius: '20px',
          border: `2px solid ${colors.border}`,
          background: colors.bg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          marginBottom: '1.5rem',
          boxShadow: phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2)' : 'none',
        }}
      >
        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '4rem' }}>⚡</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00f5ff' }}>Click to Start</span>
            <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>
              {round === 0 ? `${MAX_ROUNDS} rounds • Wait for green, then click!` : 'All rounds done! Click to restart.'}
            </span>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <span style={{ fontSize: '4rem' }}>🔴</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ff6b00' }}>Wait for it...</span>
            <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>Don't click yet!</span>
          </>
        )}

        {phase === 'ready' && (
          <>
            <span style={{ fontSize: '4rem' }}>🟢</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00ff88' }}>CLICK NOW!</span>
          </>
        )}

        {phase === 'clicked' && reactionTime !== null && (
          <>
            <span style={{ fontSize: '3rem' }}>✅</span>
            <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: '900', color: '#00f5ff', fontVariantNumeric: 'tabular-nums' }}>
              {reactionTime}<span style={{ fontSize: '1.5rem', color: '#8e9aa8', marginLeft: '0.25rem' }}>ms</span>
            </div>
            <div style={{
              padding: '0.4rem 1rem', borderRadius: '50px',
              background: `${getRating(reactionTime).color}20`,
              border: `1px solid ${getRating(reactionTime).color}40`,
              color: getRating(reactionTime).color, fontWeight: '700',
            }}>{getRating(reactionTime).label}</div>
            <span style={{ color: '#566275', fontSize: '0.85rem' }}>
              {round >= MAX_ROUNDS ? 'Click to see summary' : `Click for round ${round + 1}`}
            </span>
          </>
        )}

        {phase === 'early' && (
          <>
            <span style={{ fontSize: '3rem' }}>❌</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ff2d55' }}>Too Early!</span>
            <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>Wait for the green signal. Click to retry.</span>
          </>
        )}
      </div>

      {/* Live results */}
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { value: avg ? `${avg}ms` : '—', label: 'Average', color: '#00f5ff' },
            { value: best ? `${best}ms` : '—', label: 'Best', color: '#00ff88' },
            { value: `${results.length}/${MAX_ROUNDS}`, label: 'Rounds', color: '#ff6b00' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#566275', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results timeline */}
      {results.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#566275', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Round Results</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem',
                textAlign: 'center', minWidth: '70px',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#566275', marginBottom: '0.2rem' }}>R{i + 1}</div>
                <div style={{ fontWeight: '700', color: getRating(r).color }}>{r}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button (Now Centered Perfectly) */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button 
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setPhase('idle'); setRound(0); setResults([]); setReactionTime(null); }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Info Reference Box */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.75rem', marginTop: '2rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: '#00f5ff', margin: '0 0 1rem 0' }}>Reaction Time Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { range: '< 150ms', label: 'Inhuman', color: '#ff2d55' },
            { range: '150-200ms', label: 'Elite Gamer', color: '#ff6b00' },
            { range: '200-250ms', label: 'Great', color: '#00f5ff' },
            { range: '250-300ms', label: 'Average', color: '#00ff88' },
            { range: '300-400ms', label: 'Below Avg', color: '#8e9aa8' },
            { range: '400ms+', label: 'Slow', color: '#566275' },
          ].map(r => (
            <div key={r.range} style={{ background: `${r.color}10`, border: `1px solid ${r.color}30`, borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
              <div style={{ fontWeight: '700', color: r.color, fontSize: '0.9rem' }}>{r.range}</div>
              <div style={{ color: '#8e9aa8', fontSize: '0.75rem' }}>{r.label}</div>
            </div>
          ))}
        </div>
        <p style={{ color: '#566275', fontSize: '0.85rem', marginTop: '1rem', lineHeight: '1.5', margin: '1rem 0 0 0' }}>
          * Average human reaction time is ~250ms. Professional FPS gamers typically react in 150-200ms.
        </p>
      </div>

      {/* --- SEO FRIENDLY ARTICLE SECTION --- */}
      <article style={{ marginTop: '3.5rem', borderTop: '1px solid #1e293b', paddingTop: '2.5rem', color: '#cbd5e1', lineHeight: '1.7' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', marginTop: '0' }}>
          What is a Reaction Time Test and Why Does It Matter?
        </h2>
        <p style={{ marginBottom: '1.25rem' }}>
          Have you ever wondered how fast your brain processes visual information? Whether you are trying to dodge an enemy bullet in a high-stakes FPS game or slamming on the brakes when a car suddenly stops ahead of you, your <strong>reaction time</strong> plays a critical role. 
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          A reaction time test measures how quickly you respond to a specific stimulus. In this digital tool, the stimulus is simple: a color shift from red to green. The millisecond count you see after clicking represents the exact duration it took for the light to enter your eyes, travel to your brain, and send a signal down to your finger to click that mouse button.
        </p>

        <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', marginTop: '2rem', marginBottom: '0.75rem' }}>
          What is the Average Human Reaction Time?
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          For most individuals, the <strong>average human reaction time</strong> sits somewhere around <strong>250 milliseconds (ms)</strong> for visual cues. However, this is far from a fixed number. Exceptional esports players and professional athletes frequently pull off reaction speeds between <strong>150ms and 200ms</strong>. 
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          If your scores lean toward the 300ms+ territory, do not panic. Your response rate fluctuates wildly based on daily variables like fatigue, caffeine intake, stress levels, and even your monitor’s refresh rate!
        </p>

        <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Can You Train to Get Faster Reflexes?
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          Absolutely. While genetics lay down the baseline, your central nervous system behaves a lot like a muscle. You can sharpen your reflexes and lower your millisecond score with a few deliberate habits:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <strong>Practice Consistency:</strong> Regularly taking reflex tests or playing fast-paced video games trains your brain to pick up visual triggers much faster.
          </li>
          <li>
            <strong>Prioritize Sleep:</strong> Sleep deprivation is the absolute enemy of quick reflexes. Even a single night of poor sleep can drag your response times down significantly.
          </li>
          <li>
            <strong>Optimize Your Gaming Setup:</strong> Hardware latency is real. Utilizing a high-refresh-rate monitor (144Hz or higher) and a low-latency mechanical mouse can immediately shave off 10-20ms from your score.
          </li>
        </ul>

        <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', marginTop: '2rem', marginBottom: '0.75rem' }}>
          How This Test Works
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          This reflex tool runs over a span of <strong>5 distinct rounds</strong> to give you a highly accurate benchmark. Each round introduces a completely randomized delay timer so your brain cannot simply guess when the green box will appear. Once you wrap up all 5 attempts, the tool calculates your ultimate average and best scores to show you where you stand on the competitive ladder. 
        </p>
        <p style={{ fontStyle: 'italic', color: '#566275', margin: '0' }}>
          Ready to beat your high score? Hit the reset button, stay focused, and see if you can break into the elite gaming tier!
        </p>
      </article>
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from 'react';

const WORD_LISTS = {
  easy: 'the and for are but not you all can her was one our out day get has him his how man new now old see two way who boy did its let put say she too use'.split(' '),
  medium: 'about after again below could every first found great happy large later light might never other place plant point right small sound spell still study their there these thing think three water where which world would write'.split(' '),
  hard: 'beautiful believe between business children complete consider continue describe different difficult environment experience government important including information knowledge language national original particular performance political position possible practice president probably problem provide question recognize relationship remember represent responsible situation something sometimes structure thousand together usually whatever'.split(' '),
};

type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'idle' | 'running' | 'done';

function generateText(diff: Difficulty, count = 40) {
  const list = WORD_LISTS[diff];
  return Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)]).join(' ');
}

export default function TypingTestPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState(() => generateText('medium'));
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [history, setHistory] = useState<{ wpm: number; acc: number; diff: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback((diff = difficulty, dur = duration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setText(generateText(diff, 80));
    setTyped('');
    setPhase('idle');
    setTimeLeft(dur);
    setWpm(0);
    setAccuracy(100);
  }, [difficulty, duration]);

  const endTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (phase === 'idle') {
      setPhase('running');
      startTime.current = performance.now();
      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTime.current) / 1000;
        const left = Math.max(0, duration - elapsed);
        setTimeLeft(left);
        if (left <= 0) endTest();
      }, 100);
    }

    setTyped(val);

    // Calculate stats
    const words = val.trim().split(' ').filter(Boolean);
    const elapsed = Math.max(1, (performance.now() - startTime.current) / 60000);
    const correctWords = words.filter((w, i) => w === text.split(' ')[i]).length;
    setWpm(Math.round(correctWords / elapsed));

    // Accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    // Check if completed
    if (val.length >= text.length) endTest();
  };

  useEffect(() => {
    if (phase === 'done') {
      setHistory(prev => [{ wpm, acc: accuracy, diff: difficulty }, ...prev.slice(0, 9)]);
    }
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const getRating = (w: number) => {
    if (w >= 120) return { label: '🔥 Blazing Fast', color: 'var(--neon-red)' };
    if (w >= 80) return { label: '⚡ Speed Typist', color: 'var(--neon-orange)' };
    if (w >= 60) return { label: '🎯 Proficient', color: 'var(--neon-cyan)' };
    if (w >= 40) return { label: '✅ Average', color: 'var(--neon-green)' };
    return { label: '🐢 Beginner', color: 'var(--text-secondary)' };
  };

  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const cursorPos = typed.length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Typing Speed Test</h1>
        <p className="tool-subtitle">Test your WPM — Words Per Minute</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => { setDifficulty(d); reset(d, duration); }} disabled={phase === 'running'}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px',
                border: difficulty === d ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
                background: difficulty === d ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
                color: difficulty === d ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontWeight: '600', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s',
              }}>{d}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[15, 30, 60, 120].map(d => (
            <button key={d} onClick={() => { setDuration(d); reset(difficulty, d); }} disabled={phase === 'running'}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: '8px',
                border: duration === d ? '1px solid var(--neon-orange)' : '1px solid var(--border)',
                background: duration === d ? 'rgba(255,107,0,0.1)' : 'var(--bg-card)',
                color: duration === d ? 'var(--neon-orange)' : 'var(--text-secondary)',
                fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', transition: 'all 0.2s',
              }}>{d}s</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: wpm, label: 'WPM', color: 'var(--neon-cyan)' },
          { value: `${accuracy}%`, label: 'Accuracy', color: 'var(--neon-green)' },
          { value: timeLeft.toFixed(0), label: 'Seconds', color: 'var(--neon-orange)' },
          { value: typed.length, label: 'Chars', color: 'var(--neon-purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Text Display */}
      {phase !== 'done' && (
        <div
          ref={containerRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '1.75rem',
            fontFamily: "'Courier New', monospace",
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            lineHeight: '2',
            letterSpacing: '0.03em',
            cursor: 'text',
            marginBottom: '1rem',
            maxHeight: '200px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {text.split('').map((char, i) => {
            let color = 'var(--text-muted)';
            let bg = 'transparent';
            let fontWeight: string | number = '400';
            if (i < typed.length) {
              if (typed[i] === char) { color = 'var(--neon-green)'; }
              else { color = 'var(--neon-red)'; bg = 'rgba(255,45,85,0.1)'; }
            } else if (i === cursorPos) {
              bg = 'rgba(0,245,255,0.3)';
              color = 'var(--text-primary)';
              fontWeight = '700';
            }
            return (
              <span key={i} style={{ color, background: bg, fontWeight, borderRadius: '2px', transition: 'color 0.1s' }}>
                {char}
              </span>
            );
          })}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        value={typed}
        onChange={handleInput}
        disabled={phase === 'done'}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {phase !== 'done' && (
        <div style={{
          background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)',
          borderRadius: '10px', padding: '1rem', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem',
          cursor: 'pointer',
        }} onClick={() => inputRef.current?.focus()}>
          {phase === 'idle' ? '👆 Click here or on the text above and start typing to begin!' : '⌨️ Keep typing...'}
        </div>
      )}

      {/* Results */}
      {phase === 'done' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '16px', padding: '2rem',
          marginBottom: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Speed</div>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
            {wpm} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>WPM</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 1.2rem', borderRadius: '50px',
            background: `${getRating(wpm).color}15`, border: `1px solid ${getRating(wpm).color}30`,
            color: getRating(wpm).color, fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem',
          }}>{getRating(wpm).label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { value: `${accuracy}%`, label: 'Accuracy' },
              { value: typed.split(' ').filter(Boolean).length, label: 'Words Typed' },
              { value: duration - Math.round(timeLeft), label: 'Time Used (s)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => reset()}>🔄 New Text</button>
        {phase === 'done' && <button className="btn btn-primary" onClick={() => reset()}>▶ Try Again</button>}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>📊 Session History</div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem', fontSize: '0.875rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.wpm} WPM</span>
              <span style={{ color: 'var(--neon-green)' }}>{h.acc}% acc</span>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{h.diff}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

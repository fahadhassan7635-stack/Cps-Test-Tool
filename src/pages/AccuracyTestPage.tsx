import { useState, useRef } from 'react';

const WORDS = 'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump'.split(' ');

export default function AccuracyTestPage() {
  const [text] = useState(WORDS.slice(0, 30).join(' '));
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (phase === 'idle') setPhase('running');
    setTyped(val);

    let errs = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== text[i]) errs++;
    }
    setErrors(errs);

    if (val.length >= text.length) setPhase('done');
  };

  const accuracy = typed.length > 0 ? Math.round(((typed.length - errors) / typed.length) * 100) : 100;
  const correctChars = typed.length - errors;
  const progress = (typed.length / text.length) * 100;

  const getRating = (acc: number) => {
    if (acc >= 99) return { label: '🏆 Perfect', color: 'var(--neon-yellow)' };
    if (acc >= 95) return { label: '✅ Excellent', color: 'var(--neon-green)' };
    if (acc >= 90) return { label: '👍 Good', color: 'var(--neon-cyan)' };
    if (acc >= 80) return { label: '📝 Average', color: 'var(--neon-orange)' };
    return { label: '❌ Needs Practice', color: 'var(--neon-red)' };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Keyboard Accuracy Test</h1>
        <p className="tool-subtitle">Type the text with maximum accuracy — no rushing!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: `${accuracy}%`, label: 'Accuracy', color: 'var(--neon-green)' },
          { value: errors, label: 'Errors', color: 'var(--neon-red)' },
          { value: correctChars, label: 'Correct', color: 'var(--neon-cyan)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {phase !== 'done' && (
        <div
          onClick={() => inputRef.current?.focus()}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: 2, marginBottom: '1rem', cursor: 'text' }}
        >
          {text.split('').map((char, i) => {
            let color = 'var(--text-muted)';
            let bg = 'transparent';
            if (i < typed.length) {
              color = typed[i] === char ? 'var(--neon-green)' : 'var(--neon-red)';
              if (typed[i] !== char) bg = 'rgba(255,45,85,0.1)';
            } else if (i === typed.length) {
              bg = 'rgba(0,245,255,0.25)';
            }
            return <span key={i} style={{ color, background: bg, borderRadius: '2px' }}>{char}</span>;
          })}
        </div>
      )}

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        disabled={phase === 'done'}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      />

      {phase !== 'done' && (
        <div style={{ background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)', borderRadius: '10px', padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', cursor: 'pointer' }}
          onClick={() => inputRef.current?.focus()}>
          {phase === 'idle' ? '👆 Click here and start typing!' : '⌨️ Focus on accuracy over speed…'}
        </div>
      )}

      {phase === 'done' && (
        <div style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-green)', marginBottom: '0.5rem' }}>{accuracy}%</div>
          <div style={{ display: 'inline-flex', padding: '0.4rem 1.2rem', borderRadius: '50px', background: `${getRating(accuracy).color}15`, border: `1px solid ${getRating(accuracy).color}30`, color: getRating(accuracy).color, fontWeight: '700', marginBottom: '1rem' }}>{getRating(accuracy).label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[{ v: correctChars, l: 'Correct' }, { v: errors, l: 'Errors' }, { v: text.length, l: 'Total Chars' }].map(s => (
              <div key={s.l} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.v}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => { setTyped(''); setPhase('idle'); setErrors(0); inputRef.current?.focus(); }}>🔄 Reset</button>
      </div>
    </div>
  );
}

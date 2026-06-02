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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button className="btn btn-secondary" onClick={() => { setTyped(''); setPhase('idle'); setErrors(0); inputRef.current?.focus(); }}>🔄 Reset Test</button>
      </div>

      {/* ================= SEO ARTICLE SECTION START ================= */}
      <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '3rem 0' }} />

      <section style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>
          Why is Keyboard Accuracy Important?
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          When practicing typing, most people focus purely on <strong>WPM (Words Per Minute)</strong>. However, typing speed is practically useless without precision. Every time you make a mistake, you have to press backspace and correct it, which drastically reduces your overall typing rhythm and efficiency. Taking a regular <strong>Keyboard Accuracy Test</strong> helps train your muscle memory to hit the correct keys first time, every time.
        </p>

        <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
          Key Benefits of Improving Your Typing Precision
        </h3>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Saves Professional Time:</strong> Programmers, writers, and data entry specialists save hours each week by minimizing typos.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Reduces Cognitive Fatigue:</strong> When you type accurately without looking at the keyboard, your brain focuses on creativity and logic rather than error correction.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Boosts Long-term WPM:</strong> Smooth, error-free typing naturally creates a faster and more stable typing flow over time.</li>
        </ul>

        <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
          How to Practice and Pass the Accuracy Test
        </h3>
        <p style={{ marginBottom: '1.5rem' }}>
          To achieve a 100% perfect rating on this online accuracy checker, follow a simple rule: <strong>Slow down to speed up</strong>. Sit in a comfortable posture, place your fingers correctly on the home row keys, and focus entirely on making zero errors. Once your muscle memory solidifies, your raw speed will catch up effortlessly.
        </p>

        {/* FAQ Section */}
        <div style={{ marginTop: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
            Frequently Asked Questions (FAQs)
          </h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
              What is a good score on a typing accuracy test?
            </h4>
            <p style={{ margin: '0', color: 'var(--text-muted)' }}>
              A typing accuracy score of <strong>95% or higher</strong> is generally considered good for office and data entry jobs. Professional transcriptionists and legal typists usually aim for <strong>98% to 100%</strong> accuracy.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
              Does making mistakes slow down your WPM?
            </h4>
            <p style={{ margin: '0', color: 'var(--text-muted)' }}>
              Yes, absolutely. Correcting a single mistake requires at least two extra keystrokes (Backspace + the correct key), which breaks your cadence and drops your real-time performance.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
              How often should I test my keyboard accuracy?
            </h4>
            <p style={{ margin: '0', color: 'var(--text-muted)' }}>
              Practicing for just 5 to 10 minutes daily on this accuracy trainer can show noticeable improvements in your touch-typing muscle memory within two weeks.
            </p>
          </div>
        </div>
      </section>
      {/* ================= SEO ARTICLE SECTION END ================= */}
    </div>
  );
}
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const WORD_LISTS = {
  easy: 'the and for are but not you all can her was one our out day get has him his how man new now old see two way who boy did its let put say she too use'.split(' '),
  medium: 'about after again below could every first found great happy large later light might never other place plant point right small sound spell still study their there these thing think three water where which world would write'.split(' '),
  hard: 'beautiful believe between business children complete consider continue describe different difficult environment experience government important including information knowledge language national original particular performance political position possible practice president probably problem provide question recognize relationship remember represent responsible situation something sometimes structure thousand together usually whatever'.split(' '),
};

type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'idle' | 'running' | 'done';

interface HistoryItem {
  wpm: number;
  acc: number;
  diff: string;
  dur: number;
}

function generateText(diff: Difficulty, count = 80) {
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
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const phaseRef = useRef<Phase>('idle');
  const lastScrolledLine = useRef<number>(-1);
  const containerOffsetRef = useRef<number>(0);
  const finalWpm = useRef(0);
  const finalAcc = useRef(100);

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'done';
    setPhase('done');
  }, []);

  const reset = useCallback((diff: Difficulty = difficulty, dur: number = duration) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'idle';
    const newText = generateText(diff, 80);
    setText(newText);
    setTyped('');
    setPhase('idle');
    setTimeLeft(dur);
    setWpm(0);
    setAccuracy(100);
    lastScrolledLine.current = -1;
    containerOffsetRef.current = 0;
    wordRefs.current = [];
    if (wordsContainerRef.current) {
      wordsContainerRef.current.style.transition = 'none';
      wordsContainerRef.current.style.transform = 'translateY(0px)';
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, duration]);

  const scrollToCursor = useCallback((currentWordIndex: number) => {
    const container = wordsContainerRef.current;
    const currentWordEl = wordRefs.current[currentWordIndex];
    const firstWordEl = wordRefs.current[0];
    if (!container || !currentWordEl || !firstWordEl) return;

    const lineH = currentWordEl.offsetHeight + 8;
    const wordNaturalTop = currentWordEl.offsetTop;
    const firstNaturalTop = firstWordEl.offsetTop;
    const currentLine = Math.round((wordNaturalTop - firstNaturalTop) / lineH);

    if (currentLine > 1 && currentLine !== lastScrolledLine.current) {
      lastScrolledLine.current = currentLine;
      const newOffset = -((currentLine - 1) * lineH);
      containerOffsetRef.current = newOffset;
      container.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.transform = `translateY(${newOffset}px)`;
    }
  }, []);

  const textWordsArr = useMemo(() => {
    const arr = [];
    let temp = [];
    for (let i = 0; i < text.length; i++) {
      temp.push({ char: text[i], index: i });
      if (text[i] === ' ') {
        arr.push(temp);
        temp = [];
      }
    }
    if (temp.length > 0) arr.push(temp);
    return arr;
  }, [text]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (phaseRef.current === 'idle') {
      phaseRef.current = 'running';
      setPhase('running');
      startTime.current = performance.now();
      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTime.current) / 1000;
        const left = Math.max(0, duration - elapsed);
        setTimeLeft(left);
        if (left <= 0) endTest();
      }, 100);
    }

    if (phaseRef.current !== 'running') return;

    setTyped(val);

    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);
    finalAcc.current = acc;

    const elapsedMin = Math.max(0.01, (performance.now() - startTime.current) / 60000);
    const liveWpm = Math.round((correct / 5) / elapsedMin);
    setWpm(liveWpm);
    finalWpm.current = liveWpm;

    const activeWordIndex = textWordsArr.findIndex(w => w.some(c => c.index === val.length));
    const safeWordIndex = activeWordIndex !== -1 ? activeWordIndex : textWordsArr.length - 1;
    scrollToCursor(safeWordIndex);

    if (val.length >= text.length) endTest();
  };

  useEffect(() => {
    if (phase === 'done') {
      setHistory(prev => [{ wpm: finalWpm.current, acc: finalAcc.current, diff: difficulty, dur: duration }, ...prev.slice(0, 9)]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase, difficulty, duration]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const getRating = (w: number) => {
    if (w >= 120) return { label: '🔥 Blazing Fast', color: 'var(--neon-red, #ff2d55)' };
    if (w >= 80)  return { label: '⚡ Speed Typist', color: 'var(--neon-orange, #f97316)' };
    if (w >= 60)  return { label: '🎯 Proficient', color: 'var(--neon-cyan, #00f5ff)' };
    if (w >= 40)  return { label: '✅ Average', color: 'var(--neon-green, #10b981)' };
    return { label: '🐢 Beginner', color: 'var(--text-secondary, #94a3b8)' };
  };

  const progress = phase === 'running'
    ? ((duration - timeLeft) / duration) * 100
    : phase === 'done' ? 100 : 0;

  const finalRating = getRating(finalWpm.current);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Typing Speed Test</h1>
        <p className="tool-subtitle">Test your WPM — Words Per Minute</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button key={d}
              onClick={() => { setDifficulty(d); reset(d, duration); }}
              disabled={phase === 'running'}
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
            <button key={d}
              onClick={() => { setDuration(d); reset(difficulty, d); }}
              disabled={phase === 'running'}
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
          onClick={() => inputRef.current?.focus()}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${phase === 'running' ? 'var(--neon-cyan)' : 'var(--border)'}`,
            boxShadow: phase === 'running' ? '0 0 20px rgba(0,245,255,0.07)' : 'none',
            borderRadius: '16px', padding: '1.75rem', cursor: 'text', marginBottom: '1rem',
            height: '170px', overflow: 'hidden', position: 'relative', transition: 'border 0.2s, box-shadow 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '30px',
            background: 'linear-gradient(to bottom, var(--bg-card) 30%, transparent)',
            zIndex: 2, borderRadius: '16px 16px 0 0', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
            background: 'linear-gradient(to top, var(--bg-card) 30%, transparent)',
            zIndex: 2, borderRadius: '0 0 16px 16px', pointerEvents: 'none',
          }} />

          <div
            ref={wordsContainerRef}
            style={{
              fontFamily: "'Courier New', monospace", fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              lineHeight: '2', letterSpacing: '0.03em', display: 'flex', flexWrap: 'wrap',
              alignContent: 'flex-start', willChange: 'transform',
            }}
          >
            {textWordsArr.map((wordObj, wIdx) => (
              <span
                key={wIdx}
                ref={el => { wordRefs.current[wIdx] = el; }}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
              >
                {wordObj.map(({ char, index }) => {
                  const isTyped = index < typed.length;
                  const isCursor = index === typed.length;
                  const typedChar = typed[index];
                  const isCorrect = isTyped && typedChar === char;

                  let color = 'var(--text-muted)';
                  let bg = 'transparent';
                  let bb = 'none';

                  if (isCursor) {
                    color = 'var(--text-primary)';
                    bg = 'rgba(0,245,255,0.28)';
                    bb = '2px solid var(--neon-cyan)';
                  } else if (isTyped) {
                    color = isCorrect ? 'var(--neon-green)' : 'var(--neon-red)';
                    bg = isCorrect ? 'transparent' : 'rgba(255,45,85,0.12)';
                  }

                  return (
                    <span
                      key={index}
                      style={{
                        color, background: bg, borderBottom: bb, borderRadius: '2px',
                        fontWeight: isCursor ? '700' : '400', transition: 'color 0.08s, background 0.08s'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        </div>
      )}

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
          color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', cursor: 'pointer',
        }} onClick={() => inputRef.current?.focus()}>
          {phase === 'idle' ? '👆 Click here or on the text above and start typing!' : '⌨️ Keep typing...'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => reset()}>🔄 New Text</button>
      </div>

      {/* ── Results Modal ── */}
      {phase === 'done' && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 999,
            animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => reset()} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '360px',
            background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,255,136,0.08))',
            border: '2px solid rgba(0,245,255,0.3)', borderRadius: '20px', padding: '1.5rem 0.75rem 0.75rem 0.75rem',
            textAlign: 'center', zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(0,255,136,0.1)',
          }}>
            <button onClick={() => reset()} style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)', width: '32px', height: '32px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Your Result</div>

            <div style={{ fontSize: 'clamp(1.9rem, 5.5vw, 3rem)', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', marginBottom: '0.05rem' }}>
              {finalWpm.current} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>WPM</span>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.85rem', borderRadius: '50px',
              background: `${finalRating.color}20`, border: `2px solid ${finalRating.color}50`,
              color: finalRating.color, fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.45rem',
            }}>{finalRating.label}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.2rem', marginBottom: '0.45rem' }}>
              {[
                { value: `${finalAcc.current}%`, label: 'Accuracy' },
                { value: Math.round(typed.length / 5), label: 'Words' },
                { value: `${duration}s`, label: 'Duration' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                  padding: '0.3rem', border: '1px solid rgba(0,245,255,0.2)',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.04rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* WPM Rating Scale */}
            <div style={{
              textAlign: 'left', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
              padding: '0.4rem', marginBottom: '0.45rem', border: '1px solid rgba(0,245,255,0.2)',
            }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>WPM Rating Scale</div>
              {[
                { range: '1–39',   label: 'Beginner',    color: 'var(--text-secondary, #94a3b8)' },
                { range: '40–59',  label: 'Average',     color: 'var(--neon-green, #10b981)' },
                { range: '60–79',  label: 'Proficient',  color: 'var(--neon-cyan, #00f5ff)' },
                { range: '80–119', label: 'Speed Typist', color: 'var(--neon-orange, #f97316)' },
                { range: '120+',   label: 'Blazing Fast', color: 'var(--neon-red, #ff2d55)' },
              ].map(r => (
                <div key={r.range} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0', fontSize: '0.6rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color: r.color, fontWeight: '600' }}>{r.range} WPM</span>
                  <span style={{ color: r.color }}>{r.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => reset()} style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>🔄 Reset</button>
              <button className="btn btn-primary" onClick={() => { reset(); setTimeout(() => inputRef.current?.focus(), 150); }} style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>▶ Try Again</button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalPopIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
          `}</style>
        </>
      )}

      {/* History */}
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
              <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.wpm} WPM</span>
              <span style={{ color: 'var(--neon-green)' }}>{h.acc}% acc</span>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{h.diff}</span>
              <span style={{ color: 'var(--text-muted)' }}>{h.dur}s</span>
            </div>
          ))}
        </div>
      )}

      {/* ================= SEO ARTICLES & EDUCATION SECTION ================= */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            Understanding WPM & How Typing Tests Calculate Speed
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>Typing Speed Test</strong> is more than just a metric of how fast your fingers can fly across a layout; it is a standardized professional evaluation tool. The standard unit of measurement is <strong>WPM (Words Per Minute)</strong>. To keep things fair across different languages and long words, a single standardized "word" is globally defined as exactly <strong>5 keystrokes</strong> (including spaces and punctuation).
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            The Scientific Formula Behind WPM and Accuracy
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Many modern platforms use confusing logic, but the industry benchmark logic running natively in this test follows strict mathematical constraints:
          </p>
          
          {/* ⚠️ CLEANED TRANSFORMATION FROM CODE BLOCK TO BALANCED PARAGRAPH TEXT ⚠️ */}
          <p style={{ margin: '1rem 0 1.5rem 0', fontWeight: '500', color: 'var(--text-primary, #fff)' }}>
            Gross WPM = (Total Typed Characters / 5) / Time Elapsed (Minutes)<br />
            Net WPM = (Correct Characters / 5) / Time Elapsed (Minutes)
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            By focusing on <em>Correct Characters</em> directly under our <code>liveWpm</code> calculator state, we ensure your results perfectly match professional micro-typing criteria, eliminating accidental mash-cheating.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Tips to Transition to Touch Typing
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            If you are still looking down at your keys while typing, you are hitting an artificial performance ceiling. Moving up to an advanced speed typist tier requires <strong>Touch Typing</strong>—typing relying solely on muscle memory without visual guidance:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>The Home Row anchor:</strong> Always reset your fingers back to the home baseline row (<code>A-S-D-F</code> for the left hand, and <code>J-K-L-;</code> for the right hand). Look for the physical tactile bumps on the <strong>F</strong> and <strong>J</strong> keys.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong>Prioritize Accuracy First:</strong> Speed is naturally built over time through consistent cognitive sub-routines. Rushing your inputs causes frequent typos, triggering a heavy cascade penalty on your live Net WPM calculations.
            </li>
          </ul>

          {/* FAQ Section */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--neon-purple, #a855f7)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What is considered a good typing speed?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                An average typing speed hovers around 40 WPM. Hitting a consistent bracket between 60 to 79 WPM is deemed highly proficient for office productivity, while anything scaling beyond 120+ WPM places you in the elite bracket of computational data specialists.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How does this layout deal with word-wrapping and line jumps?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                The script calculates structural element boundaries inside the <code>scrollToCursor</code> hook callback. When it identifies that your cursor index has moved to a lower offset container height, it fires an accelerated CSS transition <code>translateY</code> adjustment to smoothly pan the text matrix without disorienting your focus.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Does using a mechanical keyboard improve WPM scores?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Yes. Standard membrane dome keypads suffer from heavy ghosting and mushy tactile lockouts. Premium mechanical switches provide rapid, clean actuation handshakes with auditory and physical feedback loops, minimizing finger fatigue during extended sessions.
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* ================= SEO ARTICLES & EDUCATION SECTION END ================= */}
    </div>
  );
}
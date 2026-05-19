import { useState, useRef, useEffect, useCallback } from 'react';
 
const WORD_LISTS = {
  easy: 'the and for are but not you all can her was one our out day get has him his how man new now old see two way who boy did its let put say she too use'.split(' '),
  medium: 'about after again below could every first found great happy large later light might never other place plant point right small sound spell still study their there these thing think three water where which world would write'.split(' '),
  hard: 'beautiful believe between business children complete consider continue describe different difficult environment experience government important including information knowledge language national original particular performance political position possible practice president probably problem provide question recognize relationship remember represent responsible situation something sometimes structure thousand together usually whatever'.split(' '),
};
 
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'idle' | 'running' | 'done';
 
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
  const [history, setHistory] = useState<{ wpm: number; acc: number; diff: string; dur: number }[]>([]);
 
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const phaseRef = useRef<Phase>('idle');
  const lastScrolledLine = useRef<number>(-1);
  const containerOffsetRef = useRef<number>(0);
  // store final values for modal
  const finalWpm = useRef(0);
  const finalAcc = useRef(100);
  const finalTyped = useRef('');
 
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
 
    // scroll when cursor reaches line 2 (keep 1 line of context above)
    if (currentLine > 1 && currentLine !== lastScrolledLine.current) {
      lastScrolledLine.current = currentLine;
      const newOffset = -((currentLine - 1) * lineH);
      containerOffsetRef.current = newOffset;
      container.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.transform = `translateY(${newOffset}px)`;
    }
  }, []);
 
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
    finalTyped.current = val;
 
    // WPM: সব word শেষ হলে last word সহ count করো, নইলে শুধু completed (space-separated) words
    const typedWordsFull = val.split(' ');
    const textWords = text.split(' ');
    const allDone = typedWordsFull.length >= textWords.length;
    const wordsToCount = allDone ? typedWordsFull : typedWordsFull.slice(0, -1);
    const correctCount = wordsToCount.filter((w, i) => w === textWords[i]).length;
    const elapsedMin = Math.max(0.01, (performance.now() - startTime.current) / 60000);
    const liveWpm = Math.round(correctCount / elapsedMin);
    setWpm(liveWpm);
    finalWpm.current = liveWpm;
 
    // Accuracy: character level over entire typed string
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);
    finalAcc.current = acc;
 
    const currentWordIndex = val.split(' ').length - 1;
    scrollToCursor(currentWordIndex);
 
    // শেষ word টাইপ হয়ে গেলেই end — length নয়, word count দিয়ে
    const allWordsTyped = typedWordsFull.length >= textWords.length;
    const lastWordCorrect = typedWordsFull[textWords.length - 1] === textWords[textWords.length - 1];
    if (allWordsTyped || lastWordCorrect || val.length >= text.length) endTest();
  };
 
  useEffect(() => {
    if (phase === 'done') {
      // use refs for accurate final values
      setHistory(prev => [{ wpm: finalWpm.current, acc: finalAcc.current, diff: difficulty, dur: duration }, ...prev.slice(0, 9)]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase]);
 
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
 
  const getRating = (w: number) => {
    if (w >= 120) return { label: '🔥 Blazing Fast', color: 'var(--neon-red)' };
    if (w >= 80)  return { label: '⚡ Speed Typist', color: 'var(--neon-orange)' };
    if (w >= 60)  return { label: '🎯 Proficient', color: 'var(--neon-cyan)' };
    if (w >= 40)  return { label: '✅ Average', color: 'var(--neon-green)' };
    return { label: '🐢 Beginner', color: 'var(--text-secondary)' };
  };
 
  const progress = phase === 'running'
    ? ((duration - timeLeft) / duration) * 100
    : phase === 'done' ? 100 : 0;
 
  const textWords = text.split(' ');
  const typedWords = typed.split(' ');
  const finalRating = getRating(finalWpm.current);
 
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
            borderRadius: '16px',
            padding: '1.75rem',
            cursor: 'text',
            marginBottom: '1rem',
            height: '170px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Top fade */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '30px',
            background: 'linear-gradient(to bottom, var(--bg-card) 30%, transparent)',
            zIndex: 2, borderRadius: '16px 16px 0 0', pointerEvents: 'none',
          }} />
          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
            background: 'linear-gradient(to top, var(--bg-card) 30%, transparent)',
            zIndex: 2, borderRadius: '0 0 16px 16px', pointerEvents: 'none',
          }} />
 
          <div
            ref={wordsContainerRef}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              lineHeight: '2',
              letterSpacing: '0.03em',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 0.4em',
              alignContent: 'flex-start',
              willChange: 'transform',
            }}
          >
            {textWords.map((word, wordIndex) => {
              const isCurrentWord = wordIndex === typedWords.length - 1;
              const isPastWord = wordIndex < typedWords.length - 1;
              const typedWord = typedWords[wordIndex] ?? '';
 
              let wordContent: React.ReactNode;
 
              if (isPastWord) {
                wordContent = word.split('').map((ch, ci) => {
                  const correct = (typedWords[wordIndex] ?? '')[ci] === ch;
                  return (
                    <span key={ci} style={{
                      color: correct ? 'var(--neon-green)' : 'var(--neon-red)',
                      background: correct ? 'transparent' : 'rgba(255,45,85,0.12)',
                      borderRadius: '2px',
                    }}>{ch}</span>
                  );
                });
              } else if (isCurrentWord) {
                wordContent = word.split('').map((ch, ci) => {
                  const isCursor = ci === typedWord.length;
                  const isTyped = ci < typedWord.length;
                  const correct = isTyped && typedWord[ci] === ch;
                  const wrong = isTyped && typedWord[ci] !== ch;
                  return (
                    <span key={ci} style={{
                      color: wrong ? 'var(--neon-red)' : isTyped ? 'var(--neon-green)' : isCursor ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: wrong ? 'rgba(255,45,85,0.12)' : isCursor ? 'rgba(0,245,255,0.28)' : 'transparent',
                      borderRadius: '2px',
                      fontWeight: isCursor ? '700' : '400',
                      borderBottom: isCursor ? '2px solid var(--neon-cyan)' : 'none',
                      transition: 'color 0.08s, background 0.08s',
                    }}>{ch}</span>
                  );
                });
              } else {
                wordContent = <span style={{ color: 'var(--text-muted)' }}>{word}</span>;
              }
 
              return (
                <span
                  key={wordIndex}
                  ref={el => { wordRefs.current[wordIndex] = el; }}
                  style={{
                    display: 'inline-block',
                    borderBottom: isCurrentWord ? '1px solid rgba(0,245,255,0.2)' : 'none',
                    paddingBottom: isCurrentWord ? '1px' : '0',
                  }}
                >
                  {wordContent}
                </span>
              );
            })}
          </div>
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
          background: 'rgba(0,245,255,0.05)',
          border: '1px dashed rgba(0,245,255,0.2)',
          borderRadius: '10px', padding: '1rem', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem',
          cursor: 'pointer',
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
          {/* Backdrop */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => reset()} />
 
          {/* Modal */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '400px',
            background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,255,136,0.08))',
            border: '2px solid rgba(0,245,255,0.3)',
            borderRadius: '20px',
            padding: '1rem 0.85rem 0.85rem',
            textAlign: 'center',
            zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(0,255,136,0.1)',
          }}>
            {/* Close */}
            <button onClick={() => reset()} style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)',
              width: '32px', height: '32px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; }}
            >✕</button>
 
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Your Result</div>
 
            {/* WPM big */}
            <div style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', marginBottom: '0.1rem' }}>
              {finalWpm.current} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>WPM</span>
            </div>
 
            {/* Rating badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.3rem 0.85rem', borderRadius: '50px',
              background: `${finalRating.color}20`,
              border: `2px solid ${finalRating.color}50`,
              color: finalRating.color,
              fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.5rem',
            }}>{finalRating.label}</div>
 
            {/* 3 stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginBottom: '0.5rem' }}>
              {[
                { value: `${finalAcc.current}%`, label: 'Accuracy' },
                { value: finalTyped.current.trim().split(/\s+/).filter(Boolean).length, label: 'Words Typed' },
                { value: `${duration}s`, label: 'Duration' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                  padding: '0.4rem', border: '1px solid rgba(0,245,255,0.2)',
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.1rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
 
            {/* WPM Rating Scale */}
            <div style={{
              textAlign: 'left', background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px', padding: '0.5rem', marginBottom: '0.5rem',
              border: '1px solid rgba(0,245,255,0.2)',
            }}>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>WPM Rating Scale</div>
              {[
                { range: '1–39',   label: 'Beginner',     color: 'var(--text-secondary)' },
                { range: '40–59',  label: 'Average',      color: 'var(--neon-green)' },
                { range: '60–79',  label: 'Proficient',   color: 'var(--neon-cyan)' },
                { range: '80–119', label: 'Speed Typist', color: 'var(--neon-orange)' },
                { range: '120+',   label: 'Blazing Fast', color: 'var(--neon-red)' },
              ].map(r => (
                <div key={r.range} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.1rem 0', fontSize: '0.6rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color: r.color, fontWeight: '600' }}>{r.range} WPM</span>
                  <span style={{ color: r.color }}>{r.label}</span>
                </div>
              ))}
            </div>
 
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => reset()}
                style={{ animation: 'slideUp 0.4s ease-out 0.1s both', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                🔄 Reset
              </button>
              <button className="btn btn-primary" onClick={() => { reset(); setTimeout(() => inputRef.current?.focus(), 150); }}
                style={{ animation: 'slideUp 0.4s ease-out 0.2s both', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                ▶ Try Again
              </button>
            </div>
          </div>
 
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes modalPopIn {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
              to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}
 
      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
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
    </div>
  );
}
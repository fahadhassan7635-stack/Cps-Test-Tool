import { useState, useEffect, useCallback } from 'react';

interface KeyState { [key: string]: boolean; }
interface KeyHistory { key: string; time: number; }

const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Win', 'Alt', ' ', 'Alt', 'Ctrl'],
];

const WIDE_KEYS = ['Backspace', 'Tab', 'CapsLock', 'Enter', 'Shift', 'Ctrl', 'Win', 'Alt', ' '];

const KEY_LABELS: Record<string, string> = {
  ' ': 'Space', 'Backspace': '⌫', 'Enter': '↵', 'Shift': '⇧', 'CapsLock': 'Caps',
  'Tab': 'Tab', 'Ctrl': 'Ctrl', 'Win': '⊞', 'Alt': 'Alt',
};

export default function KeyVisualizerPage() {
  const [activeKeys, setActiveKeys] = useState<KeyState>({});
  const [keyHistory, setKeyHistory] = useState<KeyHistory[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [keyCount, setKeyCount] = useState<Record<string, number>>({});

  const normalize = (key: string) => {
    if (key === ' ') return ' ';
    return key.toLowerCase();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const key = e.key;
    const norm = normalize(key);
    setActiveKeys(prev => ({ ...prev, [norm]: true }));
    setTotalKeys(prev => prev + 1);
    setKeyHistory(prev => [{ key, time: Date.now() }, ...prev.slice(0, 19)]);
    setKeyCount(prev => ({ ...prev, [norm]: (prev[norm] || 0) + 1 }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = normalize(e.key);
    setActiveKeys(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const topKeys = Object.entries(keyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Key Visualizer</h1>
        <p className="tool-subtitle">Real-time keyboard display — see every keystroke light up</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { value: totalKeys, label: 'Total Keys', color: 'var(--neon-cyan)' },
          { value: Object.keys(activeKeys).length, label: 'Active Keys', color: 'var(--neon-green)' },
          { value: Object.keys(keyCount).length, label: 'Unique Keys', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Focus notice */}
      <div style={{
        background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)',
        borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem',
      }}>
        ⌨️ Click anywhere on the page and start typing to see keys light up!
      </div>

      {/* Keyboard */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.5rem',
        marginBottom: '2rem', overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '600px' }}>
          {KEYBOARD_LAYOUT.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {row.map((key, keyIdx) => {
                const norm = normalize(key);
                const isActive = activeKeys[norm] || activeKeys[key.toLowerCase()];
                const isWide = WIDE_KEYS.includes(key);
                const isSpace = key === ' ';
                return (
                  <div key={keyIdx} style={{
                    height: '42px',
                    width: isSpace ? '200px' : isWide ? '80px' : '42px',
                    minWidth: isSpace ? '200px' : isWide ? '80px' : '42px',
                    background: isActive
                      ? 'var(--neon-cyan)'
                      : 'rgba(255,255,255,0.04)',
                    border: isActive
                      ? '1px solid var(--neon-cyan)'
                      : '1px solid var(--border)',
                    borderBottom: isActive ? '3px solid rgba(0,180,200,0.8)' : '3px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isWide || isSpace ? '0.65rem' : '0.7rem',
                    fontWeight: '600',
                    color: isActive ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.06s ease',
                    boxShadow: isActive ? '0 0 15px rgba(0,245,255,0.5)' : 'none',
                    userSelect: 'none',
                    textTransform: 'uppercase',
                  }}>
                    {KEY_LABELS[key] || key}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Key history */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>⌨️ Key Log</div>
          <div style={{ padding: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {keyHistory.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Start typing…</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0.5rem' }}>
                {keyHistory.map((k, i) => (
                  <span key={i} style={{
                    padding: '0.2rem 0.5rem', borderRadius: '4px',
                    background: i === 0 ? 'rgba(0,245,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                    fontSize: '0.75rem', fontWeight: '600',
                    color: i === 0 ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    fontFamily: 'monospace',
                  }}>{k.key === ' ' ? '␣' : k.key}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top keys */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-orange)' }}>🏆 Most Used Keys</div>
          <div style={{ padding: '0.5rem' }}>
            {topKeys.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No data yet…</div>
            ) : (
              topKeys.map(([key, count]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.5rem' }}>
                  <span style={{
                    width: '32px', height: '28px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'monospace',
                    color: 'var(--neon-cyan)',
                  }}>{key === ' ' ? '␣' : key.toUpperCase()}</span>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      background: 'var(--neon-orange)',
                      width: `${Math.min(100, (count / (topKeys[0][1])) * 100)}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--neon-orange)', minWidth: '30px', textAlign: 'right' }}>{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={() => { setActiveKeys({}); setKeyHistory([]); setTotalKeys(0); setKeyCount({}); }}>
        🔄 Reset
      </button>
    </div>
  );
}

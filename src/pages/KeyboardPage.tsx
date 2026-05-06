import { Link } from 'react-router-dom';

const tools = [
  { to: '/typing-test', icon: '⌨️', title: 'Typing Speed Test', desc: 'Measure your WPM across multiple difficulties and durations. Track your improvement over time.', color: 'var(--neon-cyan)', tag: 'Most Popular' },
  { to: '/key-visualizer', icon: '👁️', title: 'Key Visualizer', desc: 'See every keystroke light up on a real-time keyboard display. Track your key usage patterns.', color: 'var(--neon-purple)', tag: '' },
  { to: '/spacebar', icon: '▭', title: 'Spacebar Counter', desc: 'Hit that spacebar as fast as you can! Great for clicking speed warm-ups.', color: 'var(--neon-green)', tag: '' },
  { to: '/accuracy', icon: '🎯', title: 'Accuracy Test', desc: 'Type provided text as accurately as possible. Focus on precision, not just speed.', color: 'var(--neon-orange)', tag: '' },
];

export default function KeyboardPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label">Category</div>
        <h1 className="tool-title">Keyboard Tools</h1>
        <p className="tool-subtitle">Master your typing speed, accuracy, and keyboard skills</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {tools.map(tool => (
          <Link key={tool.to} to={tool.to} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '1.75rem', textDecoration: 'none',
            color: 'var(--text-primary)', display: 'block', transition: 'all 0.3s ease',
            position: 'relative',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tool.color; el.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; }}
          >
            {tool.tag && <span style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', background: `${tool.color}20`, color: tool.color, textTransform: 'uppercase' }}>{tool.tag}</span>}
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tool.icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: tool.color, marginBottom: '0.5rem' }}>{tool.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{tool.desc}</p>
            <span style={{ color: tool.color, fontWeight: '600', fontSize: '0.875rem' }}>Start Test →</span>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-cyan)' }}>⌨️ Typing Improvement Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { t: 'Touch Typing', d: 'Learn to type without looking at the keyboard. Use all 10 fingers.' },
            { t: 'Practice Daily', d: '15-30 minutes of focused practice daily yields rapid improvement.' },
            { t: 'Focus on Accuracy', d: 'Accuracy first, then speed. Mistakes slow you down more than careful typing.' },
            { t: 'Proper Posture', d: 'Sit upright, elbows at 90°, wrists neutral. Reduces fatigue and errors.' },
          ].map(tip => (
            <div key={tip.t} style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--neon-cyan)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{tip.t}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{tip.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

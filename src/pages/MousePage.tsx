import { Link } from 'react-router-dom';

const tools = [
  { to: '/cps-test', icon: '⚡', title: 'CPS Test', desc: 'Click as fast as possible. Measure your Clicks Per Second over multiple duration options.', color: 'var(--neon-green)', tag: 'Most Popular' },
  { to: '/double-click', icon: '🖱️', title: 'Double Click Test', desc: 'Measure the interval between double-clicks. Test your mouse\'s double-click speed.', color: 'var(--neon-cyan)', tag: '' },
  { to: '/scroll-test', icon: '🔄', title: 'Scroll Wheel Test', desc: 'Test your scroll wheel speed and sensitivity. Count scrolls per second in both directions.', color: 'var(--neon-orange)', tag: '' },
  { to: '/mouse-accuracy', icon: '🎯', title: 'Mouse Accuracy', desc: 'Click targets of varying sizes to test your mouse precision. Smaller targets = more points.', color: 'var(--neon-purple)', tag: '' },
];

export default function MousePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label">Category</div>
        <h1 className="tool-title">Mouse Tools</h1>
        <p className="tool-subtitle">Test and measure every aspect of your mouse performance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {tools.map(tool => (
          <Link key={tool.to} to={tool.to} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '1.75rem', textDecoration: 'none',
            color: 'var(--text-primary)', display: 'block', transition: 'all 0.3s ease',
            position: 'relative',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tool.color; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 15px 40px rgba(0,0,0,0.4)`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
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
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-green)' }}>🖱️ Mouse Performance Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { t: 'DPI Settings', d: 'Most pro gamers use 400-1600 DPI. Lower DPI = more precision.' },
            { t: 'Polling Rate', d: '1000Hz polling rate gives smoother cursor movement.' },
            { t: 'Mouse Grip', d: 'Claw grip allows faster clicking; palm grip is more ergonomic.' },
            { t: 'Surface Matters', d: 'A quality mousepad reduces jitter and improves accuracy.' },
          ].map(tip => (
            <div key={tip.t} style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--neon-green)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{tip.t}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{tip.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

const tools = [
  { to: '/reaction-time', icon: '⚡', title: 'Reaction Time Test', desc: 'Click when the screen turns green. Measure your average reaction time across 5 rounds.', color: 'var(--neon-orange)', tag: 'Most Popular' },
  { to: '/aim-trainer', icon: '🎯', title: 'Aim Trainer', desc: 'Click moving targets as fast as possible. Track your hits, misses, and accuracy.', color: 'var(--neon-red)', tag: '' },
  { to: '/sniper-mode', icon: '🔭', title: 'Sniper Mode', desc: 'Track and hit a small moving target. Tests precision and tracking ability.', color: 'var(--neon-cyan)', tag: '' },
];

export default function AimPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label">Category</div>
        <h1 className="tool-title">Aim & Reaction</h1>
        <p className="tool-subtitle">Sharpen your reflexes and precision for competitive gaming</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-orange)' }}>⚡ Reaction Time Science</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
          Human reaction time averages ~250ms for visual stimuli. Elite gamers achieve 150-200ms through training, proper sleep, and warm-up routines.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { t: 'Sleep Quality', d: '7-9 hours improves reaction by up to 30%.' },
            { t: 'Warm-Up', d: '10 min of aim training before matches reduces reaction time.' },
            { t: 'Caffeine', d: 'Small doses improve alertness and reaction speed.' },
            { t: 'Hydration', d: 'Even mild dehydration slows reaction time significantly.' },
          ].map(tip => (
            <div key={tip.t} style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.1)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--neon-orange)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{tip.t}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{tip.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

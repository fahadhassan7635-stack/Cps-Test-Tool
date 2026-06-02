import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

const leaderboardData = {
  cps: [
    { rank: 1, name: 'Arpon', score: '14.2 CPS', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'RapidFire99', score: '13.8 CPS', country: '🇺🇸', avatar: '🔥' },
    { rank: 3, name: 'ClickMaster', score: '13.1 CPS', country: '🇧🇷', avatar: '💥' },
    { rank: 4, name: 'XSpeedX', score: '12.9 CPS', country: '🇯🇵', avatar: '🎯' },
    { rank: 5, name: 'ProClicker', score: '12.7 CPS', country: '🇩🇪', avatar: '🏆' },
  ],
  wpm: [
    { rank: 1, name: 'Typeking', score: '187 WPM', country: '🇺🇸', avatar: '⌨️' },
    { rank: 2, name: 'KeyboardNinja', score: '174 WPM', country: '🇸🇬', avatar: '🥷' },
    { rank: 3, name: 'SpeedTyper', score: '168 WPM', country: '🇬🇧', avatar: '💨' },
    { rank: 4, name: 'WPMKing', score: '162 WPM', country: '🇨🇳', avatar: '👑' },
    { rank: 5, name: 'FastFingers', score: '158 WPM', country: '🇮🇳', avatar: '🚀' },
  ],
  reaction: [
    { rank: 1, name: 'Reflexking', score: '118ms', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'QuickDraw', score: '124ms', country: '🇺🇸', avatar: '🎯' },
    { rank: 3, name: 'NeuralLink', score: '131ms', country: '🇯🇵', avatar: '🧠' },
    { rank: 4, name: 'SpeedBot', score: '138ms', country: '🇩🇪', avatar: '🤖' },
    { rank: 5, name: 'FastReact', score: '142ms', country: '🇧🇷', avatar: '💫' },
  ],
};

const tools = [
  { to: '/typing-test', icon: '⌨️', name: 'Typing Speed', tag: 'WPM Test', accent: 'var(--neon-cyan)' },
  { to: '/cps-test', icon: '🖱️', name: 'CPS Test', tag: 'Click Speed', accent: 'var(--neon-green)' },
  { to: '/reaction-time', icon: '⚡', name: 'Reaction Time', tag: 'Reflex Test', accent: 'var(--neon-orange)' },
  { to: '/aim-trainer', icon: '🎯', name: 'Aim Trainer', tag: 'FPS Skills', accent: 'var(--neon-red)' },
  { to: '/spacebar', icon: '▭', name: 'Spacebar Counter', tag: 'Key Smash', accent: 'var(--neon-cyan)' },
  { to: '/key-visualizer', icon: '👁️', name: 'Key Visualizer', tag: 'Real-Time', accent: 'var(--neon-purple)' },
  { to: '/double-click', icon: '🖱️', name: 'Double Click', tag: 'Mouse Test', accent: 'var(--neon-green)' },
  { to: '/accuracy', icon: '📏', name: 'Accuracy Test', tag: 'Precision', accent: 'var(--neon-yellow)' },
  { to: '/scroll-test', icon: '↕️', name: 'Scroll Test', tag: 'Scroll Speed', accent: 'var(--neon-cyan)' },
  { to: '/mouse-accuracy', icon: '🖲️', name: 'Mouse Accuracy', tag: 'Tracking', accent: 'var(--neon-green)' },
  { to: '/sniper-mode', icon: '🔭', name: 'Sniper Mode', tag: 'Micro-Flicks', accent: 'var(--neon-red)' },
  { to: '/space-defense', icon: '🚀', name: 'Space Defense', tag: 'Skill Game', accent: 'var(--neon-purple)' },
  { to: '/voyager-game', icon: '🌌', name: 'Voyager Game', tag: 'Endless', accent: 'var(--neon-cyan)' },
];

const gearItems = [
  { icon: '🖱️', brand: 'Logitech', name: 'G Pro X Superlight 2', desc: '60g ultralight. 32K DPI. Used by pro FPS players worldwide.', price: '$159.99' },
  { icon: '⌨️', brand: 'Keychron', name: 'Q1 Pro Wireless', desc: 'Gasket-mounted TKL. Perfect for max WPM scores and typing comfort.', price: '$199.99' },
  { icon: '🖥️', brand: 'ASUS', name: 'ROG Swift 360Hz', desc: '360Hz for silky-smooth aim training. Every ms counts at elite level.', price: '$699.99' },
  { icon: '🎧', brand: 'SteelSeries', name: 'Arctis Nova Pro', desc: 'Hi-res audio with active noise cancellation for full focus mode.', price: '$349.99' },
];

const blogPosts = [
  { to: '/blog', emoji: '⌨️', tag: 'Typing', tagColor: 'var(--neon-cyan)', date: 'May 2, 2025', title: 'How to Go From 60 to 120 WPM in 30 Days', excerpt: 'A proven training routine used by competitive typists to double their speed.' },
  { to: '/blog', emoji: '🖱️', tag: 'Mouse', tagColor: 'var(--neon-green)', date: 'Apr 28, 2025', title: 'Best Gaming Mice for High CPS', excerpt: 'Which mice enable the fastest click speeds? We tested 12 mice to find out.' },
  { to: '/blog', emoji: '⚡', tag: 'Reaction', tagColor: 'var(--neon-orange)', date: 'Apr 20, 2025', title: 'Methods to Reduce Reaction Time', excerpt: 'Training schedules and warm-up drills that elite FPS players use daily.' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'cps' | 'wpm' | 'reaction'>('cps');
  const [challengeTime, setChallengeTime] = useState('00:00:00');

  const tick = useCallback(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    
    if (diff <= 0) {
      setChallengeTime('00:00:00');
      return;
    }

    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    setChallengeTime(`${h}:${m}:${s}`);
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const lbData = leaderboardData[activeTab];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '3rem' }}>

      <section style={{ textAlign: 'center', padding: '5rem 1rem 4rem' }}>
        <div className="fade-in-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 1rem',
          background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)',
          borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600',
          color: 'var(--neon-cyan)', marginBottom: '2rem',
          letterSpacing: '0.05em',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--neon-green)', display: 'inline-block',
            boxShadow: '0 0 8px var(--neon-green)',
            animation: 'pulse-glow 2s infinite',
          }} />
          v2.0 — Daily Challenges Live
        </div>

        <h1 className="fade-in-up d1" style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '900',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
        }}>
          <span style={{ display: 'block', color: 'var(--text-primary)' }}>Test Train </span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-green) 50%, var(--neon-cyan) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Dominate </span>
        </h1>

        <p className="fade-in-up d2" style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px', margin: '0 auto 2.5rem',
          lineHeight: '1.7',
        }}>
          Test your clicking speed with our free CPS Test tool. Find out your clicks per second, practice jitter or butterfly clicking, and beat the record!
        </p>

        <div className="fade-in-up d3" style={{
          display: 'flex', justifyContent: 'center', gap: '3rem',
          flexWrap: 'wrap', marginBottom: '2.5rem',
        }}>
          {[
            { value: '247K+', label: 'Players Tested' },
            { value: '18', label: 'Free Tools' },
            { value: '4.9★', label: 'Avg Rating' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="fade-in-up d4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cps-test" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⚡ Start CPS Test
          </Link>
          <Link to="/typing-test" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⌨️ Typing Speed Test
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Tools & Games</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Choose Your Arena</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Precision tools and skill games. Free, instant, no signup required.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            {
              to: '/keyboard', icon: '⌨️', title: 'Keyboard Tools',
              desc: 'Test and improve your typing speed, accuracy, and keyboard mastery. From WPM records to key visualizers.',
              color: 'var(--neon-cyan)',
              pills: [
                { to: '/typing-test', label: '⌨ Typing Speed' },
                { to: '/key-visualizer', label: '👁 Key Visualizer' },
              ],
            },
            {
              to: '/mouse', icon: '🖱️', title: 'Mouse Tools',
              desc: 'Measure clicks per second, test double-click intervals, and challenge your overall mouse precision.',
              color: 'var(--neon-green)',
              pills: [
                { to: '/cps-test', label: '⚡ CPS Test' },
                { to: '/double-click', label: '🖱 Double Click' },
              ],
            },
            {
              to: '/aim', icon: '🎯', title: 'Aim & Reaction',
              desc: 'Train your reflexes, sharpen your aim, and simulate real FPS-style scenarios with moving targets.',
              color: 'var(--neon-orange)',
              pills: [
                { to: '/reaction-time', label: '⚡ Reaction Time' },
                { to: '/aim-trainer', label: '🎯 Aim Trainer' },
              ],
            },
            {
              to: '/hall-of-fame', icon: '🏆', title: 'Compete Globally',
              desc: 'Submit your scores, track your history, complete daily challenges, and climb the worldwide leaderboard.',
              color: 'var(--neon-yellow)',
              pills: [
                { to: '/hall-of-fame', label: '🏆 Hall of Fame' },
                { to: '/cps-test', label: '📅 Daily Challenge' },
              ],
            },
            {
              to: '/games', icon: '🎮', title: 'Skill Games',
              desc: 'Try our interactive games to develop your reaction time and CPS skills in a highly engaging environment.',
              color: 'var(--neon-purple)',
              pills: [
                { to: '/space-defense', label: '🚀 Space Defense' },
                { to: '/voyager-game', label: '🌌 Voyager Game' },
              ],
            },
          ].map(cat => (
            <Link
              key={cat.to}
              to={cat.to}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--border)`,
                borderRadius: '16px',
                padding: '1.75rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'block',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = cat.color;
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${cat.color}20`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: cat.color }}>{cat.title}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{cat.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.pills.map(p => (
                  <span key={p.label} style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: `${cat.color}15`,
                    color: cat.color,
                    border: `1px solid ${cat.color}30`,
                  }}>{p.label}</span>
                ))}
              </div>
              <span style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                fontSize: '1.25rem', color: cat.color, opacity: 0.6,
              }}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Quick Launch</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Jump In Instantly</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>No setup required. Click a tool and start testing in under 3 seconds.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {tools.map(tool => (
            <Link
              key={tool.to}
              to={tool.to}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = tool.accent;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = `0 10px 25px rgba(0,0,0,0.3), 0 0 20px ${tool.accent}20`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '2rem' }}>{tool.icon}</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.75rem', color: tool.accent }}>{tool.tag}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}>
          <div>
            <div className="section-label">Records</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              Hall of Fame: Benchmark Scores
            </h2>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-yellow)' }}>
                  🏆 ALL-TIME HIGH
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {(['cps', 'wpm', 'reaction'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: activeTab === tab ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >{tab}</button>
                  ))}
                </div>
              </div>

              {lbData.map((entry, i) => (
                <div key={entry.name} className="lb-row" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < lbData.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    width: '28px', textAlign: 'center', fontWeight: '700',
                    fontSize: '0.9rem',
                    color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <span style={{ fontSize: '1.25rem' }}>{entry.avatar}</span>
                  <span style={{ flex: 1, fontWeight: '500', fontSize: '0.9rem' }}>{entry.name}</span>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.9rem' }}>{entry.score}</span>
                  <span style={{ fontSize: '1rem' }}>{entry.country}</span>
                </div>
              ))}
            </div>

            <Link to="/hall-of-fame" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              View All Targets →
            </Link>
          </div>

          <div>
            <div className="section-label">Daily</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Today's Challenge</h2>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)',
                borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700',
                color: 'var(--neon-orange)', marginBottom: '1rem',
              }}>🔥 Day 47 Streak</div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Speed Demon Mode</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Achieve 10+ CPS for 5 seconds straight using only left-click. One attempt per day. Top 50 scores make the wall of fame.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                  { icon: '🏅', label: 'Badge', value: 'Speed Demon' },
                  { icon: '⭐', label: 'Points', value: '+500' },
                ].map(r => (
                  <div key={r.label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', fontSize: '0.875rem',
                  }}>
                    <span>{r.icon}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}: </span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem',
                textAlign: 'center', marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Resets in</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>
                  {challengeTime}
                </div>
              </div>

              <Link to="/cps-test" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⚡ Accept Challenge
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div>
            <div className="section-label">Knowledge Base</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Improve Your Game</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {blogPosts.map(post => (
                <Link 
                  key={post.title} 
                  to={post.to} 
                  style={{ 
                    display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = post.tagColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ 
                    width: '70px', height: '70px', flexShrink: 0, 
                    background: `linear-gradient(135deg, ${post.tagColor}15, transparent)`, 
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2rem', border: `1px solid ${post.tagColor}30`
                  }}>
                    {post.emoji}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', background: `${post.tagColor}15`, color: post.tagColor, textTransform: 'uppercase' }}>
                        {post.tag}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{post.date}</span>
                    </div>
                    <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', marginBottom: '0.3rem', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <Link to="/blog" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                Read All Articles →
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section style={{
        marginBottom: '4rem',
        background: 'rgba(8,13,20,0.6)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '3rem 2rem',
      }}>
        <div className="section-label">Gear Up</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Top Gaming Gear Picks</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Equipment used by top performers on our leaderboard. Affiliate links help keep this platform free.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {gearItems.map(gear => (
            <a key={gear.name} href="#affiliate" className="gear-card" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>{gear.icon}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{gear.brand}</div>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>{gear.name}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '1rem' }}>{gear.desc}</p>
              <div style={{ color: 'var(--neon-green)', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{gear.price}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>*Affiliate link — commission earned</div>
            </a>
          ))}
        </div>
      </section>

      <hr style={{ borderColor: 'var(--border)', margin: '5rem 0 4rem' }} />
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2.5rem', marginTop: '3rem' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          
          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>
            Why Your Click Speed and Typing WPM Actually Matter (And How to Improve)
          </h2>
          
          <p style={{ marginBottom: '2rem' }}>
            We've all been there—you miss a crucial shot in Valorant, lose a 1v1 in Minecraft bedwars, or find yourself buried under emails at work, wishing you could just type a little faster. You might even find yourself blaming your mouse or keyboard. But how much of it is your gear, and how much of it is raw skill? That’s exactly why we built this platform: to give you a free, no-nonsense way to test your limits and actually get better.
          </p>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              ⚡ Mastering the CPS Test (Clicks Per Second)
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              If you’re a gamer, you know that your clicking speed can make or break a match. A standard user usually clicks around 5 to 7 times per second. But competitive players? They easily hit 10 to 14 CPS. 
            </p>
            <p style={{ margin: '0' }}>
              Our <strong>CPS Test</strong> isn't just a fun mini-game; it's a training ground. Whether you are practicing "Jitter clicking" (vibrating your hand to generate rapid clicks) or "Butterfly clicking" (using two fingers to alternate clicks on the same button), testing your speed daily builds muscle memory. It helps you figure out the exact clicking technique that won't ruin your aim.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              ⌨️ Typing Speed: Going Beyond the Average WPM
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Typing fast isn't just a flex for your resume anymore. Whether you're a programmer, a student writing a last-minute essay, or a remote worker on Slack, your <strong>Words Per Minute (WPM)</strong> dictates your workflow. The global average is around 40 WPM, but with a bit of practice, hitting 80 or even 100+ WPM is completely achievable.
            </p>
            <p style={{ margin: '0' }}>
              Taking a <strong>Typing Speed Test</strong> regularly helps you identify bad habits. Are you looking down at your keyboard too much? Do you rely heavily on your index fingers? Our tools help you spot these errors, track your accuracy, and slowly transition into a true touch-typer. Plus, climbing our global WPM leaderboard is surprisingly addictive!
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              🎯 Reaction Time and Aim Training
            </h3>
            <p style={{ margin: '0' }}>
              Have you ever wondered if your reflexes are naturally fast? Human reaction time to visual stimuli averages around 250 milliseconds. However, elite esports athletes can push that down to 150ms. Using our <strong>Reaction Time Test</strong> and <strong>Aim Trainer</strong>, you can warm up your eyes and hands before jumping into a ranked match. Think of it as stretching before a workout—it wakes up your nervous system and gets you locked in.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              🛠️ Does Your Gear Actually Make a Difference?
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Here is the truth: a $150 gaming mouse won't magically make you a pro, but a bad mouse will definitely hold you back. Using our suite, you can actually test your hardware. 
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Got a new mouse? Run a <strong>Double Click Test</strong> to make sure the switches aren't faulty.</li>
              <li style={{ marginBottom: '0.5rem' }}>Bought a mechanical keyboard? Use our <strong>Key Visualizer</strong> and <strong>Spacebar Counter</strong> to check for ghosting and verify that every keystroke registers instantly.</li>
            </ul>
          </div>

          <div style={{ marginTop: '3.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>
              Ready to set a new personal record?
            </h4>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)' }}>
              No downloads, no sketchy background apps, and no forced sign-ups. Just pure, browser-based performance testing that works on Windows, Mac, and Chromebooks alike.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/cps-test" style={{ color: 'var(--neon-cyan)', fontWeight: '600', textDecoration: 'none' }}>→ Try the CPS Test</Link>
              <Link to="/typing-test" style={{ color: 'var(--neon-green)', fontWeight: '600', textDecoration: 'none' }}>→ Check your Typing WPM</Link>
              <Link to="/reaction-time" style={{ color: 'var(--neon-orange)', fontWeight: '600', textDecoration: 'none' }}>→ Test Reaction Speed</Link>
            </div>
          </div>

        </section>
      </div>

    </div>
  );
}
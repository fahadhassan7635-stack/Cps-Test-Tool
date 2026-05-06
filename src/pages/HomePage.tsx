import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const leaderboardData = {
  cps: [
    { rank: 1, name: 'FlashClick', score: '14.2 CPS', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'RapidFire99', score: '13.8 CPS', country: '🇺🇸', avatar: '🔥' },
    { rank: 3, name: 'ClickMaster', score: '13.1 CPS', country: '🇧🇷', avatar: '💥' },
    { rank: 4, name: 'XSpeedX', score: '12.9 CPS', country: '🇯🇵', avatar: '🎯' },
    { rank: 5, name: 'ProClicker', score: '12.7 CPS', country: '🇩🇪', avatar: '🏆' },
  ],
  wpm: [
    { rank: 1, name: 'TypeGod', score: '187 WPM', country: '🇺🇸', avatar: '⌨️' },
    { rank: 2, name: 'KeyboardNinja', score: '174 WPM', country: '🇸🇬', avatar: '🥷' },
    { rank: 3, name: 'SpeedTyper', score: '168 WPM', country: '🇬🇧', avatar: '💨' },
    { rank: 4, name: 'WPMKing', score: '162 WPM', country: '🇨🇳', avatar: '👑' },
    { rank: 5, name: 'FastFingers', score: '158 WPM', country: '🇮🇳', avatar: '🚀' },
  ],
  reaction: [
    { rank: 1, name: 'ReflexGod', score: '118ms', country: '🇰🇷', avatar: '⚡' },
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
  { to: '/sniper-mode', icon: '🔭', name: 'Sniper Mode', tag: 'Precision', accent: 'var(--neon-orange)' },
];

const gearItems = [
  { icon: '🖱️', brand: 'Logitech', name: 'G Pro X Superlight 2', desc: '60g ultralight. 32K DPI. Used by pro FPS players worldwide.', price: '$159.99' },
  { icon: '⌨️', brand: 'Keychron', name: 'Q1 Pro Wireless', desc: 'Gasket-mounted TKL. Perfect for max WPM scores and typing comfort.', price: '$199.99' },
  { icon: '🖥️', brand: 'ASUS', name: 'ROG Swift 360Hz', desc: '360Hz for silky-smooth aim training. Every ms counts at elite level.', price: '$699.99' },
  { icon: '🎧', brand: 'SteelSeries', name: 'Arctis Nova Pro', desc: 'Hi-res audio with active noise cancellation for full focus mode.', price: '$349.99' },
];

const blogPosts = [
  { to: '/blog', emoji: '⌨️', tag: 'Typing', tagColor: 'var(--neon-cyan)', date: 'May 2, 2025', title: 'How to Go From 60 to 120 WPM in 30 Days', excerpt: 'A proven training routine used by competitive typists to double their speed without sacrificing accuracy.' },
  { to: '/blog', emoji: '🖱️', tag: 'Mouse', tagColor: 'var(--neon-green)', date: 'Apr 28, 2025', title: 'Best Gaming Mice for High CPS — 2025 Roundup', excerpt: 'Which mice enable the fastest click speeds? We tested 12 mice over 10,000 clicks each to find out.' },
  { to: '/blog', emoji: '⚡', tag: 'Reaction', tagColor: 'var(--neon-orange)', date: 'Apr 20, 2025', title: 'Science-Backed Methods to Reduce Your Reaction Time', excerpt: 'Sleep, training schedules, and warm-up drills that elite FPS players use to stay at peak performance.' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'cps' | 'wpm' | 'reaction'>('cps');
  const [challengeTime, setChallengeTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setChallengeTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const lbData = leaderboardData[activeTab];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* ── HERO ── */}
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
          <span style={{ display: 'block', color: 'var(--text-primary)' }}>Test. Train.</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-green) 50%, var(--neon-cyan) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Dominate.</span>
        </h1>

        <p className="fade-in-up d2" style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px', margin: '0 auto 2.5rem',
          lineHeight: '1.7',
        }}>
          The ultimate skill-testing platform for gamers. Measure your typing speed, mouse precision, reaction time, and aim — then climb the global leaderboard.
        </p>

        {/* Stats */}
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

        {/* CTA Buttons */}
        <div className="fade-in-up d4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cps-test" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⚡ Start CPS Test
          </Link>
          <Link to="/typing-test" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⌨️ Typing Speed Test
          </Link>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="ad-space ad-leaderboard" style={{ marginBottom: '3rem' }}>
        📢 Ad Space — 728×90 Leaderboard (Google AdSense Ready)
      </div>

      {/* ── CATEGORIES ── */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Tools</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Choose Your Arena</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>14 precision tools across 4 skill categories. Free, instant, no signup required.</p>

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
                { to: '/spacebar', label: '▭ Spacebar Counter' },
                { to: '/accuracy', label: '🎯 Accuracy Test' },
              ],
            },
            {
              to: '/mouse', icon: '🖱️', title: 'Mouse Tools',
              desc: 'Measure clicks per second, test double-click intervals, and challenge your mouse precision.',
              color: 'var(--neon-green)',
              pills: [
                { to: '/cps-test', label: '⚡ CPS Test' },
                { to: '/double-click', label: '🖱 Double Click' },
                { to: '/scroll-test', label: '🔄 Scroll Test' },
                { to: '/mouse-accuracy', label: '🎯 Accuracy' },
              ],
            },
            {
              to: '/aim', icon: '🎯', title: 'Aim & Reaction',
              desc: 'Train your reflexes, sharpen your aim, and simulate real FPS-style scenarios with moving targets.',
              color: 'var(--neon-orange)',
              pills: [
                { to: '/reaction-time', label: '⚡ Reaction Time' },
                { to: '/aim-trainer', label: '🎯 Aim Trainer' },
                { to: '/sniper-mode', label: '🔭 Sniper Mode' },
              ],
            },
            {
              to: '/leaderboard', icon: '🏆', title: 'Compete Globally',
              desc: 'Submit your scores, track your history, complete daily challenges, and climb the worldwide leaderboard.',
              color: 'var(--neon-yellow)',
              pills: [
                { to: '/leaderboard', label: '🏆 Leaderboard' },
                { to: '/cps-test', label: '📅 Daily Challenge' },
                { to: '/leaderboard', label: '📊 Score History' },
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
                (e.currentTarget as HTMLElement).style.borderColor = cat.color;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${cat.color}20`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: cat.color }}>{cat.title}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{cat.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.pills.map(p => (
                  <span key={p.to} style={{
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

      {/* ── QUICK LAUNCH ── */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Quick Launch</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Jump In Instantly</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>No setup. Click a tool and start testing in under 3 seconds.</p>

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

      {/* ── LEADERBOARD + DAILY CHALLENGE ── */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}>
          {/* Leaderboard */}
          <div>
            <div className="section-label">Competition</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Global Leaderboard</h2>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-yellow)' }}>
                  🏆 TOP PERFORMERS
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

              {/* Entries */}
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

            <Link to="/leaderboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              View Full Leaderboard →
            </Link>
          </div>

          {/* Daily Challenge */}
          <div>
            <div className="section-label">Daily</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Today's Challenge</h2>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '16px',
              padding: '1.75rem',
              marginBottom: '1rem',
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

            {/* Sidebar Ad */}
            <div className="ad-space ad-sidebar" style={{ minHeight: '120px' }}>
              📢 Ad Space — 300×250 Rectangle (Google AdSense Ready)
            </div>
          </div>
        </div>
      </section>

      {/* ── GEAR ── */}
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

      {/* ── BLOG ── */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Knowledge Base</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Improve Your Game</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Guides, tips, and insights from our team of competitive gamers and typing champions.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {blogPosts.map(post => (
            <Link key={post.title} to={post.to} className="blog-card">
              <div style={{
                height: '120px',
                background: `linear-gradient(135deg, ${post.tagColor}15, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3.5rem',
                borderBottom: '1px solid var(--border)',
              }}>{post.emoji}</div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700',
                    background: `${post.tagColor}15`, color: post.tagColor,
                  }}>{post.tag}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.date}</span>
                </div>
                <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/blog" className="btn btn-secondary">Read All Articles →</Link>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="ad-space ad-banner" style={{ marginBottom: '2rem' }}>
        📢 Ad Space — 728×90 Banner (Google AdSense Ready)
      </div>
    </div>
  );
}

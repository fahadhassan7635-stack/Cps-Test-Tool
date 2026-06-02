import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const mouseIcon = '/mouse-icon.jpg';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  // নেভিগেশন আইটেম (Games কে আলাদা পেজের লিংক করা হয়েছে)
  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/keyboard', label: 'Keyboard' },
    { to: '/mouse', label: 'Mouse' },
    { to: '/aim', label: 'Aim & Reaction' },
    { to: '/hall-of-fame', label: 'Hall of Fame' },
    { to: '/games', label: '🎮 Games' }, 
    { to: '/blog', label: '📖 Blog' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="grid-bg" />

      {/* NAV BAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,13,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.05)',
          }}>
            <img
              src={mouseIcon}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            CPS<span style={{ color: 'var(--neon-cyan)' }}>Test</span> Tools
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          listStyle: 'none', margin: 0, padding: 0,
        }} className="desktop-nav">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                style={({ isActive }) => {
                  const isGame = item.label.includes('Games');
                  return {
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-secondary)',
                    background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                    transition: 'all 0.2s',
                    display: 'block',
                    whiteSpace: 'nowrap'
                  };
                }}
              >{item.label}</NavLink>
            </li>
          ))}
          <li>
            <Link to="/cps-test" style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#000',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))',
              display: 'block',
              whiteSpace: 'nowrap',
              marginLeft: '10px'
            }}>⚡ CPS Test</Link>
          </li>
        </ul>

        {/* Hamburger Mobile Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', flexDirection: 'column', gap: '5px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px',
          }}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: '24px', height: '2px',
              background: 'var(--neon-cyan)',
              borderRadius: '2px',
              transition: 'all 0.3s',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(8,13,20,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 2rem',
          zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => {
                const isGame = item.label.includes('Games');
                return {
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-primary)',
                  background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                };
              }}
            >{item.label}</NavLink>
          ))}
          <Link
            to="/cps-test"
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none', fontSize: '1rem', fontWeight: '700',
              color: '#000',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))',
              textAlign: 'center', marginTop: '0.5rem',
            }}
          >⚡ CPS Test</Link>
        </div>
      )}

      {/* Main Page Render View */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>

      {/* FOOTER SECTION */}
      <footer style={{
        background: 'rgba(8,13,20,0.95)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 2rem 1.5rem',
        marginTop: '4rem',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand Info Grid */}
          <div>
            <Link to="/" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              textDecoration: 'none', marginBottom: '1rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
              }}>
                <img
                  src={mouseIcon}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                CPS<span style={{ color: 'var(--neon-cyan)' }}>Test</span> Tools
              </span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              The ultimate free platform for gamers and typists to test, train, and compete. No signup required.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['𝕏', '💬', '▶', '🤖'].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}>{icon}</a>
              ))}
            </div>
          </div>

          {/* Keyboard Tools Grid */}
          <div>
            <h4 style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Keyboard</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
              {[
                { to: '/typing-test', label: 'Typing Speed Test' },
                { to: '/key-visualizer', label: 'Key Visualizer' },
                { to: '/spacebar', label: 'Spacebar Counter' },
                { to: '/accuracy', label: 'Accuracy Test' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--neon-cyan)'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mouse Tools Grid */}
          <div>
            <h4 style={{ color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Mouse</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
              {[
                { to: '/cps-test', label: 'CPS Test' },
                { to: '/double-click', label: 'Double Click Test' },
                { to: '/scroll-test', label: 'Scroll Wheel Test' },
                { to: '/mouse-accuracy', label: 'Mouse Accuracy' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--neon-green)'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Games Grid */}
          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>🚀 Arcade Games</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
              {[
                { to: '/games', label: '🎮 All Games Center' },
                { to: '/space-defense', label: '🚀 Space Defense' },
                { to: '/voyager-game', label: '🛸 Voyager Game' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = '#ff6b35'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Hub Grid */}
          <div>
            <h4 style={{ color: 'var(--neon-orange)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
              {[
                { to: '/hall-of-fame', label: 'Leaderboard' },
                { to: '/aim-trainer', label: 'Aim Trainer' },
                { to: '/reaction-time', label: 'Reaction Time' },
                { to: '/blog', label: '📖 Blog' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--neon-orange)'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Rights */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            © 2026 CPS Test Tools — All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {[
              { to: '/privacy-policy', label: 'Privacy Policy' },
              { to: '/terms', label: 'Terms of Service' },
              { to: '/contact', label: 'Contact' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--neon-cyan)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
              >{l.label}</Link>
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            Built for gamers, by gamers. 🎮
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
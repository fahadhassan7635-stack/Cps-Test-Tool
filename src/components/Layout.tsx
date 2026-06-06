import { useState, useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

// Fixed the image path here
const mouseIcon = '/logo.png';

interface ToolItem {
  to: string;
  label: string;
  category: 'mouse' | 'keyboard' | 'aim' | 'games' | 'misc';
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/keyboard', label: 'Keyboard' },
    { to: '/mouse', label: 'Mouse' },
    { to: '/aim', label: 'Aim & Reaction' },
    { to: '/hall-of-fame', label: 'Hall of Fame' },
    { to: '/games', label: 'Games' }, 
    { to: '/blog', label: 'Blog' },
  ];

  const toolsList: (ToolItem & { icon: string })[] = [
    // Mouse Tools
    { to: '/cps-test', label: 'CPS Test', category: 'mouse', icon: '⚡' },
    { to: '/double-click', label: 'Double Click Test', category: 'mouse', icon: '🖱️' },
    { to: '/scroll-test', label: 'Scroll Wheel Test', category: 'mouse', icon: '📜' },
    { to: '/mouse-accuracy', label: 'Mouse Accuracy', category: 'mouse', icon: '🎯' },
    { to: '/cps-rush', label: 'CPS Rush', category: 'mouse', icon: '🔥' },
    
    // Keyboard Tools
    { to: '/typing-test', label: 'Typing Speed Test', category: 'keyboard', icon: '⌨️' },
    { to: '/key-visualizer', label: 'Key Visual', category: 'keyboard', icon: '🖥️' },
    { to: '/spacebar', label: 'Spacebar Counter', category: 'keyboard', icon: '➖' },
    { to: '/accuracy', label: 'Accuracy Test', category: 'keyboard', icon: '✔️' },
    
    // Aim & Reaction Tools
    { to: '/reaction-time', label: 'Reaction Time Test', category: 'aim', icon: '⏱️' },
    { to: '/aim-trainer', label: 'Aim Trainer', category: 'aim', icon: '🔫' },
    { to: '/sniper-mode', label: 'Sniper Mode', category: 'aim', icon: '🔭' },
    { to: '/f1-reaction', label: 'F1 Reaction', category: 'aim', icon: '🏎️' },
    
    // Games
    { to: '/space-defense', label: 'Space Defense', category: 'games', icon: '🚀' },
    { to: '/voyager-game', label: 'Voyager Game', category: 'games', icon: '🛸' },
    
    // Misc / Others (Blog & Hall of Record)
    { to: '/blog', label: 'Blog', category: 'misc', icon: '📝' },
    { to: '/hall-of-fame', label: 'Hall of Record', category: 'misc', icon: '🏆' },
  ];

  const filteredTools = useMemo(() => {
    if (selectedCategory === 'all') return toolsList;
    return toolsList.filter(tool => tool.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-bg" />

      {/* TOP NAVIGATION BAR */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', background: 'rgba(255,255,255,0.05)',
            }}>
              <img src={mouseIcon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              CPS<span style={{ color: 'var(--neon-cyan)' }}>Test</span> Tools
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                style={({ isActive }) => {
                  const isGame = item.label.includes('Games');
                  return {
                    padding: '0.4rem 0.9rem', borderRadius: '6px', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: '500',
                    color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-secondary)',
                    background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                    transition: 'all 0.2s', display: 'block', whiteSpace: 'nowrap'
                  };
                }}
              >{item.label}</NavLink>
            </li>
          ))}
          <li>
            <Link to="/cps-test" style={{
              padding: '0.45rem 1.1rem', borderRadius: '6px', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: '700', color: '#000',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))',
              display: 'block', whiteSpace: 'nowrap', marginLeft: '10px'
            }}>⚡ CPS Test</Link>
          </li>
        </ul>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: '24px', height: '2px', background: 'var(--neon-cyan)', borderRadius: '2px', transition: 'all 0.3s' }} />
          ))}
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(8,13,20,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '1rem 2rem', zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          maxHeight: 'calc(100vh - 64px)', overflowY: 'auto'
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.exact}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => {
                const isGame = item.label.includes('Games');
                return {
                  padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '1rem', fontWeight: '500',
                  color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-primary)',
                  background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                };
              }}
            >{item.label}</NavLink>
          ))}
          <Link
            to="/cps-test" onClick={() => setMenuOpen(false)}
            style={{
              padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
              fontSize: '1rem', fontWeight: '700', color: '#000',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))',
              textAlign: 'center', marginTop: '0.5rem',
            }}
          >⚡ CPS Test</Link>
        </div>
      )}

      {/* BODY SECTION */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* SIDEBAR PANEL */}
        <aside className="sidebar-pannel" style={{
          width: sidebarOpen ? '280px' : '85px', 
          opacity: 1,
          visibility: 'visible',
          background: 'transparent',
          backdropFilter: 'none',
          borderRight: '1px solid var(--border)',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          padding: sidebarOpen ? '1.25rem' : '1.25rem 0.5rem',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden' 
        }}>

          {/* IN-SIDEBAR HEADER: ALL TOOLS BADGE & TOGGLE ARROW */}
          <div style={{ 
            display: 'flex', 
            justifyContent: sidebarOpen ? 'space-between' : 'center', 
            alignItems: 'center',
            marginBottom: '1rem',
            paddingRight: sidebarOpen ? '0.5rem' : '0'
          }}>
            
            {/* "All Tools" styled label */}
            {sidebarOpen && (
              <div style={{
                background: 'linear-gradient(135deg, #00f5ff, #0cf991)',
                color: '#000',
                fontSize: '1rem',
                fontWeight: '800',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 10px rgba(0, 245, 255, 0.2)',
                whiteSpace: 'nowrap'
              }}>
                🛠️ All Tools
              </div>
            )}

            {/* TOGGLE BUTTON */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--neon-cyan)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              aria-label="Toggle Sidebar"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {sidebarOpen ? (
                /* Left Arrow (When Open) */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              ) : (
                /* Right Arrow (When Closed) */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>

          {/* FILTER DROPDOWN - Hides when mini-sidebar is active */}
          <div style={{ display: sidebarOpen ? 'flex' : 'none', alignItems: 'center', marginBottom: '1.25rem' }}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              <option value="all">FILTER BY TYPE</option>
              <option value="mouse">MOUSE TOOLS</option>
              <option value="keyboard">KEYBOARD TOOLS</option>
              <option value="aim">AIM & REACTION</option>
              <option value="games">ARCADE GAMES</option>
              <option value="misc">OTHER SECTIONS</option>
            </select>
          </div>

          {/* SCROLLABLE TOOLS LIST */}
          <div className="sidebar-scroll" style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.35rem',
            paddingRight: '4px'
          }}>
            {filteredTools.map((tool) => {
              const isCurrentActive = location.pathname === tool.to;
              const isPinned = tool.to === '/cps-test'; // CPS Test Check
              
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    gap: sidebarOpen ? '0.75rem' : '0.4rem',
                    padding: sidebarOpen ? '0.65rem 0.85rem' : '0.65rem 0.25rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    // PINNED STICKY LOGIC
                    position: isPinned ? 'sticky' : 'static',
                    top: isPinned ? 0 : 'auto',
                    zIndex: isPinned ? 10 : 1,
                    background: isPinned 
                      ? (isCurrentActive ? 'rgba(0, 245, 255, 0.15)' : 'rgba(15, 23, 42, 0.95)') 
                      : (isCurrentActive ? 'rgba(0, 245, 255, 0.08)' : 'transparent'),
                    backdropFilter: isPinned ? 'blur(5px)' : 'none',
                    border: isCurrentActive ? '1px solid rgba(0, 245, 255, 0.3)' : '1px solid transparent',
                    borderBottom: (isPinned && !isCurrentActive) ? '1px solid rgba(255,255,255,0.05)' : undefined,
                    marginBottom: isPinned ? '5px' : '0',

                    fontSize: '0.85rem',
                    fontWeight: isCurrentActive ? '600' : '500',
                    color: isCurrentActive ? '#00f5ff' : 'var(--text-secondary)',
                    transition: 'all 0.3s ease', // Smooth hover transition
                    transform: 'translateX(0)' // Default state for animation
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentActive) {
                      e.currentTarget.style.background = isPinned ? 'rgba(0, 245, 255, 0.15)' : 'rgba(0, 245, 255, 0.1)';
                      e.currentTarget.style.color = '#00f5ff'; 
                      e.currentTarget.style.transform = 'translateX(6px)'; 
                      e.currentTarget.style.border = '1px solid rgba(0, 245, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentActive) {
                      e.currentTarget.style.background = isPinned ? 'rgba(15, 23, 42, 0.95)' : 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{tool.icon}</span>
                  {/* TEXT VISIBILITY LOGIC */}
                  <span style={{ 
                    display: (sidebarOpen || isPinned) ? 'block' : 'none', 
                    textTransform: 'uppercase', 
                    fontSize: (!sidebarOpen && isPinned) ? '0.65rem' : '0.75rem', 
                    letterSpacing: '0.02em', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {tool.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MAIN DYNAMIC CONTENT */}
        <main style={{ 
          flex: 1, 
          position: 'relative', 
          zIndex: 1, 
          padding: '2rem',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Outlet />
        </main>
      </div>

      {/* FOOTER SECTION */}
      <footer style={{
        background: 'rgba(8,13,20,0.95)', borderTop: '1px solid var(--border)',
        padding: '3rem 2rem 1.5rem', position: 'relative', zIndex: 1, marginTop: 'auto'
      }}>
        <div className="footer-grid" style={{
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gap: '2rem', marginBottom: '3rem',
        }}>
          
          {/* Brand Col */}
          <div style={{ paddingRight: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', background: 'rgba(255,255,255,0.05)',
              }}>
                <img src={mouseIcon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                CPS<span style={{ color: 'var(--neon-cyan, #00f5ff)' }}>Test</span> Tools
              </span>
            </Link>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              The ultimate free platform for gamers and typists to test, train, and compete. No signup required.
            </p>
            
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#" className="social-btn">𝕏</a>
              <a href="#" className="social-btn">💬</a>
              <a href="#" className="social-btn">▶</a>
              <a href="#" className="social-btn">🤖</a>
            </div>
          </div>

          {/* Keyboard Col */}
          <div>
            <h4 style={{ color: 'var(--neon-cyan, #00f5ff)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>KEYBOARD</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[{ to: '/typing-test', label: 'Typing Speed Test' }, { to: '/key-visualizer', label: 'Key Visualizer' }, { to: '/spacebar', label: 'Spacebar Counter' }, { to: '/accuracy', label: 'Accuracy Test' }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mouse Col */}
          <div>
            <h4 style={{ color: 'var(--neon-green, #0cf991)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>MOUSE</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[{ to: '/cps-test', label: 'CPS Test' }, { to: '/double-click', label: 'Double Click Test' }, { to: '/scroll-test', label: 'Scroll Wheel Test' }, { to: '/mouse-accuracy', label: 'Mouse Accuracy' }, { to: '/cps-rush', label: 'CPS Rush' }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Arcade Games Col */}
          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>🚀 ARCADE GAMES</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[{ to: '/games', label: '🎮 All Games Center' }, { to: '/space-defense', label: '🚀 Space Defense' }, { to: '/voyager-game', label: '🛸 Voyager Game' }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Col */}
          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>EXPLORE</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[{ to: '/hall-of-fame', label: 'Leaderboard' }, { to: '/aim-trainer', label: 'Aim Trainer' }, { to: '/reaction-time', label: 'Reaction Time' }, { to: '/blog', label: '📖 Blog' }].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar Container */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 0 0 0', 
          maxWidth: '1200px', margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
             © Best CPS Test Tools — All rights reserved.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/contact" className="footer-bottom-link">Contact</Link>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
             Built for gamers, by gamers. 🎮
          </p>
        </div>
      </footer>

      {/* STYLES */}
      <style>{`
        /* Desktop Footer Layout */
        .footer-grid {
          grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
        }
        
        /* New Custom CSS for Footer Links & Icons */
        .footer-link {
          color: #8892b0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--text-primary, #ffffff);
        }
        
        .footer-bottom-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s;
        }
        .footer-bottom-link:hover {
          color: var(--text-primary, #ffffff);
        }
        
        .social-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          color: #8892b0; text-decoration: none; font-size: 1.1rem;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary, #ffffff);
        }

        /* Existing Media Queries & Scrollbars */
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .sidebar-pannel { display: none !important; }
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--neon-cyan);
        }
      `}</style>
    </div>
  );
}

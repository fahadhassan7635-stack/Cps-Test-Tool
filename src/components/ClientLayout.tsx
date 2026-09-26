"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const mouseIcon = '/gun-pfp.png';

interface ToolItem {
  to: string;
  label: string;
  category: 'mouse' | 'keyboard' | 'aim' | 'games' | 'misc';
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/keyboard', label: 'Keyboard' },
  { to: '/mouse', label: 'Mouse' },
  { to: '/aim', label: 'Aim & Reaction' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/games', label: 'Games' },
  { to: '/blog', label: 'Blog' },
];

const TOOLS_LIST: (ToolItem & { icon: string })[] = [
  { to: '/cps-test', label: 'CPS Test', category: 'mouse', icon: '⚡' },
  { to: '/double-click', label: 'Double Click Test', category: 'mouse', icon: '🖱️' },
  { to: '/scroll-test', label: 'Scroll Wheel Test', category: 'mouse', icon: '📜' },
  { to: '/mouse-accuracy', label: 'Mouse Accuracy', category: 'mouse', icon: '🎯' },
  { to: '/cps-rush', label: 'CPS Rush', category: 'mouse', icon: '🔥' },

  { to: '/typing-test', label: 'Typing Speed Test', category: 'keyboard', icon: '⌨️' },
  { to: '/key-visualizer', label: 'Key Visual', category: 'keyboard', icon: '🖥️' },
  { to: '/spacebar', label: 'Spacebar Counter', category: 'keyboard', icon: '➖' },
  { to: '/accuracy', label: 'Accuracy Test', category: 'keyboard', icon: '✔️' },

  { to: '/reaction-time', label: 'Reaction Time Test', category: 'aim', icon: '⏱️' },
  { to: '/aim-trainer', label: '2D Aim Trainer', category: 'aim', icon: '🎯' },
  { to: '/3d-aim-trainer', label: '3D Aim Trainer', category: 'aim', icon: '🎯' },
  { to: '/f1-reaction', label: 'F1 Reaction', category: 'aim', icon: '🏎️' },

  { to: '/space-defense', label: 'Space Defense', category: 'games', icon: '🚀' },
  { to: '/voyager-game', label: 'Voyager Game', category: 'games', icon: '🛸' },
  { to: '/space-waves', label: 'Space Waves', category: 'games', icon: '🌊' },

  { to: '/blog', label: 'Blog', category: 'misc', icon: '📝' },
  { to: '/hall-of-fame', label: 'Hall of Record', category: 'misc', icon: '🏆' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTool, setHoveredTool] = useState<{ label: string; top: number; left: number } | null>(null);
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filteredTools = useMemo(() => {
    if (selectedCategory === 'all') return TOOLS_LIST;
    return TOOLS_LIST.filter(tool => tool.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <div className="grid-bg" />

      {/* TOP NAVIGATION BAR */}
      <nav className="top-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,13,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
            <div style={{
              width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
            }}>
              <Image src={mouseIcon} alt="Logo" width={44} height={44} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.7)) drop-shadow(0 0 14px rgba(0,245,255,0.4))' }} priority />
            </div>
            <span style={{
              fontWeight: '700', fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em',
              textShadow: '0 0 8px rgba(0,245,255,0.6), 0 0 18px rgba(0,245,255,0.35)'
            }}>
              Fixed <span style={{
                color: 'var(--neon-cyan)',
                textShadow: '0 0 8px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
              }}>Aim</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? pathname === item.to : pathname?.startsWith(item.to);
            const isGame = item.label.includes('Games');
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className="top-nav-link"
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '6px', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: '500',
                    color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-secondary)',
                    background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                    transition: 'all 0.2s', display: 'block', whiteSpace: 'nowrap'
                  }}
                >{item.label}</Link>
              </li>
            );
          })}
          <li>
            <Link href="/cps-test" style={{
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
        <div className="mobile-menu-overlay" style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(8,13,20,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? pathname === item.to : pathname?.startsWith(item.to);
            const isGame = item.label.includes('Games');
            return (
              <Link
                key={item.to} href={item.to}
                onClick={() => setMenuOpen(false)}
                className="mobile-nav-link"
                style={{
                  padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '1rem', fontWeight: '500',
                  color: isActive ? (isGame ? '#ff6b35' : 'var(--neon-cyan)') : 'var(--text-primary)',
                  background: isActive ? (isGame ? 'rgba(255,107,53,0.12)' : 'rgba(0,245,255,0.1)') : 'transparent',
                }}
              >{item.label}</Link>
            );
          })}
          <Link
            href="/cps-test" onClick={() => setMenuOpen(false)}
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
      <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', alignItems: 'flex-start' }}>

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
          overflow: 'visible',
          boxSizing: 'border-box'
        }}>

          {/* IN-SIDEBAR HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingRight: sidebarOpen ? '0.5rem' : '0'
          }}>
            {sidebarOpen && (
              <div style={{
                background: 'linear-gradient(135deg, #00f5ff, #0cf991)',
                color: '#000', fontSize: '1rem', fontWeight: '800',
                padding: '0.4rem 0.8rem', borderRadius: '8px',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                boxShadow: '0 4px 10px rgba(0, 245, 255, 0.2)', whiteSpace: 'nowrap'
              }}>
                🛠️ All Tools
              </div>
            )}

            {/* TOGGLE BUTTON */}
            <div className="sidebar-toggle-wrap">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '6px', borderRadius: '6px', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--neon-cyan)'; e.currentTarget.style.background = 'rgba(0,245,255,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {sidebarOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                )}
              </button>

              <span className="sidebar-toggle-tooltip">
                {sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              </span>
            </div>
          </div>

          {/* FILTER DROPDOWN */}
          <div style={{ display: sidebarOpen ? 'flex' : 'none', alignItems: 'center', marginBottom: '1.25rem' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600',
                outline: 'none', cursor: 'pointer', letterSpacing: '0.05em'
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
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '4px'
          }}>
            {filteredTools.map((tool) => {
              const isCurrentActive = pathname === tool.to;
              const isPinned = tool.to === '/cps-test';
              const showLabel = sidebarOpen || isPinned;
              return (
                <div key={tool.to} style={{ position: 'relative' }}>
                  <Link
                    href={tool.to}
                    onMouseEnter={(e) => {
                      if (!isCurrentActive) {
                        e.currentTarget.style.background = isPinned ? 'rgba(0, 245, 255, 0.15)' : 'rgba(0, 245, 255, 0.1)';
                        e.currentTarget.style.color = '#00f5ff';
                        e.currentTarget.style.transform = 'translateX(6px)';
                        e.currentTarget.style.borderTop = '1px solid rgba(0, 245, 255, 0.1)';
                        e.currentTarget.style.borderRight = '1px solid rgba(0, 245, 255, 0.1)';
                        e.currentTarget.style.borderBottom = '1px solid rgba(0, 245, 255, 0.1)';
                        e.currentTarget.style.borderLeft = '1px solid rgba(0, 245, 255, 0.1)';
                        e.currentTarget.style.textShadow = '0 0 8px rgba(0,245,255,0.6)';
                      }
                      if (!sidebarOpen) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredTool({ label: tool.label, top: rect.top + rect.height / 2, left: rect.right + 10 });
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentActive) {
                        e.currentTarget.style.background = isPinned ? 'rgba(15, 23, 42, 0.95)' : 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.borderTop = '1px solid transparent';
                        e.currentTarget.style.borderRight = '1px solid transparent';
                        e.currentTarget.style.borderBottom = isPinned ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent';
                        e.currentTarget.style.borderLeft = '1px solid transparent';
                        e.currentTarget.style.textShadow = 'none';
                      }
                      setHoveredTool(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      gap: sidebarOpen ? '0.75rem' : '0.4rem',
                      padding: sidebarOpen ? '0.65rem 0.85rem' : '0.65rem 0.25rem',
                      borderRadius: '6px', textDecoration: 'none',
                      position: isPinned ? 'sticky' : 'static', top: isPinned ? 0 : 'auto', zIndex: isPinned ? 10 : 1,
                      background: isPinned ? (isCurrentActive ? 'rgba(0, 245, 255, 0.15)' : 'rgba(15, 23, 42, 0.95)') : (isCurrentActive ? 'rgba(0, 245, 255, 0.08)' : 'transparent'),
                      backdropFilter: isPinned ? 'blur(5px)' : 'none',
                      borderTop: isCurrentActive ? '1px solid rgba(0, 245, 255, 0.3)' : '1px solid transparent',
                      borderRight: isCurrentActive ? '1px solid rgba(0, 245, 255, 0.3)' : '1px solid transparent',
                      borderBottom: isCurrentActive ? '1px solid rgba(0, 245, 255, 0.3)' : (isPinned ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'),
                      borderLeft: isCurrentActive ? '1px solid rgba(0, 245, 255, 0.3)' : '1px solid transparent',
                      marginBottom: isPinned ? '5px' : '0',
                      fontSize: '0.85rem', fontWeight: isCurrentActive ? '600' : '500',
                      color: isCurrentActive ? '#00f5ff' : 'var(--text-secondary)',
                      textShadow: isCurrentActive ? '0 0 8px rgba(0,245,255,0.6)' : 'none',
                      transition: 'all 0.3s ease', transform: 'translateX(0)'
                    }}
                  >
                    <span style={{
                      fontSize: '1.1rem',
                      filter: isCurrentActive
                        ? 'drop-shadow(0 0 6px rgba(0,245,255,0.9)) drop-shadow(0 0 14px rgba(0,245,255,0.5))'
                        : 'drop-shadow(0 0 4px rgba(0,245,255,0.35))'
                    }}>{tool.icon}</span>
                    <span style={{
                      display: showLabel ? 'block' : 'none',
                      textTransform: 'uppercase', fontSize: (!sidebarOpen && isPinned) ? '0.65rem' : '0.75rem',
                      letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {tool.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </aside>

        {/* FIXED GLOBAL TOOLTIP */}
        <span
          style={{
            position: 'fixed',
            top: hoveredTool ? hoveredTool.top : 0,
            left: hoveredTool ? hoveredTool.left : 0,
            transform: hoveredTool ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-6px)',
            background: 'rgba(0,245,255,0.12)',
            border: '1px solid rgba(0,245,255,0.4)',
            color: '#00f5ff',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '6px 10px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,245,255,0.25)',
            textShadow: '0 0 6px rgba(0,245,255,0.6)',
            opacity: hoveredTool ? 1 : 0,
            visibility: hoveredTool ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.18s ease, transform 0.18s ease, visibility 0.18s',
            transitionDelay: hoveredTool ? '0.3s' : '0s',
            zIndex: 200
          }}
        >
          {hoveredTool?.label}
        </span>

        {/* MAIN DYNAMIC CONTENT */}
        <main className="main-content" style={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          {children}
        </main>
      </div>
    </>
  );
}
import Link from 'next/link';
import Image from 'next/image';
const mouseIcon = '/gun-pfp.png';
export default function Footer() {
  return (
      <footer className="main-footer" style={{
        background: 'rgba(8,13,20,0.95)', borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1, marginTop: 'auto', width: '100%', boxSizing: 'border-box'
      }}>
        <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '2rem', marginBottom: '3rem' }}>

          <div style={{ paddingRight: '2rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                <Image src={mouseIcon} alt="Logo" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(0,245,255,0.7)) drop-shadow(0 0 12px rgba(0,245,255,0.4))' }} />
              </div>
              <span style={{
                fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)',
                textShadow: '0 0 8px rgba(0,245,255,0.6), 0 0 18px rgba(0,245,255,0.35)'
              }}>
                Fixed <span style={{
                  color: 'var(--neon-cyan)',
                  textShadow: '0 0 8px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
                }}>Aim</span>
              </span>
            </Link>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>The ultimate free platform for gamers and typists to test, train, and compete. No signup required.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#" className="social-btn">𝕏</a>
              <a href="#" className="social-btn">💬</a>
              <a href="#" className="social-btn">▶</a>
              <a href="#" className="social-btn">🤖</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>KEYBOARD</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[
                { to: '/typing-test', label: 'Typing Speed Test' },
                { to: '/key-visualizer', label: 'Key Visualizer' },
                { to: '/spacebar', label: 'Spacebar Counter' },
                { to: '/accuracy', label: 'Accuracy Test' }
              ].map(l => (
                <li key={l.to}><Link href={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>MOUSE</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[
                { to: '/cps-test', label: 'CPS Test' },
                { to: '/double-click', label: 'Double Click Test' },
                { to: '/scroll-test', label: 'Scroll Wheel Test' },
                { to: '/mouse-accuracy', label: 'Mouse Accuracy' },
                { to: '/cps-rush', label: 'CPS Rush' }
              ].map(l => (
                <li key={l.to}><Link href={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>🚀 ARCADE GAMES</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[
                { to: '/games', label: '🎮 All Games Center' },
                { to: '/space-defense', label: '🚀 Space Defense' },
                { to: '/voyager-game', label: '🛸 Voyager Game' },
                { to: '/space-waves', label: '🌊 Space Waves' },
              ].map(l => (
                <li key={l.to}><Link href={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>EXPLORE</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
              {[
                { to: '/hall-of-fame', label: 'Leaderboard' },
                { to: '/aim-trainer', label: '2D Aim Trainer' },
                { to: '/reaction-time', label: 'Reaction Time' },
                { to: '/blog', label: '📖 Blog' }
              ].map(l => (
                <li key={l.to}><Link href={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
            </div>
          </div>

          {/* SEO Gaming Links */}
          <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              🔥 Popular Games & Gaming Platforms
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <a href="https://www.counter-strike.net/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Aim & FPS training">CS2</a>
              <span>·</span>
              <a href="https://playvalorant.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Aim training">VALORANT</a>
              <span>·</span>
              <a href="https://www.minecraft.net/" target="_blank" rel="noopener noreferrer" className="footer-link" title="PvP / clicking practice">Minecraft</a>
              <span>·</span>
              <a href="https://pubg.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="reaction & aiming">PUBG</a>
              <span>·</span>
              <a href="https://www.callofduty.com/warzone" target="_blank" rel="noopener noreferrer" className="footer-link" title="FPS practice">Warzone</a>
              <span>·</span>
              <a href="https://www.rockstargames.com/VI" target="_blank" rel="noopener noreferrer" className="footer-link" title="Game info">GTA VI</a>
              <span>·</span>
              <a href="https://www.crazygames.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Free browser games">CrazyGames</a>
              <span>·</span>
              <a href="https://zone.msn.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Online games">MSN Games</a>
              <span>·</span>
              <a href="https://geometrydash.io/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Rhythm & clicking">Geometry Dash</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 0 0 0', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>© FixedAim — All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-bottom-link">Terms of Service</Link>
            <Link href="/contact" className="footer-bottom-link">Contact</Link>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Built for gamers, by gamers. 🎮</p>
        </div>
      </footer>
      );
}

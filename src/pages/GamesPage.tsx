import { Link } from 'react-router-dom';

export default function GamesPage() {
  const games = [
    {
      to: '/space-defense',
      icon: '🚀',
      title: 'Space Defense',
      desc: 'Defend your base from incoming asteroids! This game trains your tracking precision, reaction time, and clicking speed in high-pressure scenarios.',
      color: '#ff6b35',
      badge: 'SKILL BUILDER'
    },
    {
      to: '/voyager-game',
      icon: '🛸',
      title: 'Voyager Game',
      desc: 'Navigate through the asteroid field using your spacebar or clicking speed. Test your endurance and boost your reflexes.',
      color: 'var(--neon-purple)',
      badge: 'MOST POPULAR'
    },
    {
      to: '/cps-rush',
      icon: '⚡',
      title: 'CPS Rush',
      desc: 'The faster you click or smash the spacebar, the faster your speed and higher you bounce! Can you avoid obstacles and reach the final Cyber Gate?',
      color: '#06b6d4',
      badge: 'NEW REFLEX'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      {/* HEADER SECTION (Standardized to match other pages) */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label">Category</div>
        <h1 className="tool-title">Arcade <span style={{ color: '#ff6b35' }}>Games</span></h1>
        <p className="tool-subtitle">Play interactive skill games to improve your reaction time, clicking speed, and keyboard accuracy.</p>
      </div>

      {/* GAMES GRID (Matched grid size and flex setup) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {games.map((game) => {
          // Maintaining your custom logic for the Voyager game badge color
          const badgeColor = game.color === 'var(--neon-purple)' ? 'var(--neon-cyan)' : game.color;

          return (
            <Link
              key={game.to}
              to={game.to}
              style={{
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)',
                borderRadius: '16px', 
                padding: '1.75rem', 
                textDecoration: 'none',
                color: 'var(--text-primary)', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                justifyContent: 'space-between', 
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = game.color;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'var(--border)';
              }}
            >
              <div>
                {/* Badge */}
                {game.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    background: `${badgeColor}20`,
                    color: badgeColor,
                    textTransform: 'uppercase'
                  }}>
                    {game.badge}
                  </span>
                )}

                {/* Icon (Simplified to match Aim/Mouse pages) */}
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  {game.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: game.color,
                  marginBottom: '0.5rem'
                }}>
                  {game.title}
                </h3>
                
                {/* Description */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  marginBottom: '1.25rem'
                }}>
                  {game.desc}
                </p>
              </div>

              {/* CTA */}
              <span style={{
                color: game.color,
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                Start Game →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

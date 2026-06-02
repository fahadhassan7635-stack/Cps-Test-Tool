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
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', minHeight: '80vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.4rem 1rem',
          borderRadius: '50px',
          border: '1px solid rgba(0, 245, 255, 0.3)',
          background: 'rgba(0, 245, 255, 0.05)',
          color: 'var(--neon-cyan)',
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem'
        }}>
          Category
        </span>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '900',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Arcade <span style={{ color: '#ff6b35' }}>Games</span>
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Play interactive skill games to improve your reaction time, clicking speed, and keyboard accuracy.
        </p>
      </div>

      {/* GAMES GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {games.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            style={{
              display: 'block',
              background: '#0f1724',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '2.5rem',
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-5px)';
              el.style.borderColor = game.color;
              el.style.boxShadow = `0 10px 30px ${game.color}20`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(0)';
              el.style.borderColor = 'rgba(255,255,255,0.05)';
              el.style.boxShadow = 'none';
            }}
          >
            {/* Badge */}
            {game.badge && (
              <span style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '0.7rem',
                fontWeight: '800',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {game.badge}
              </span>
            )}

            {/* Icon */}
            <div style={{
              width: '60px', height: '60px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {game.icon}
            </div>

            {/* Title */}
            <h2 style={{
              color: game.color,
              fontSize: '1.5rem',
              fontWeight: '800',
              marginBottom: '1rem'
            }}>
              {game.title}
            </h2>
            
            {/* Description */}
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {game.desc}
            </p>

            {/* CTA */}
            <div style={{
              color: game.color,
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Start Game →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
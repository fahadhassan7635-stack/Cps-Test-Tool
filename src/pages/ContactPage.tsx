import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 1.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}>
        ← Back to Home
      </Link>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: '#fff' }}>Contact Us</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        Have questions or feedback? Feel free to reach out to us.
      </p>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Official Email</div>
        <a href="mailto:support@cps-tests.com" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-cyan)', textDecoration: 'none' }}>
          support@cps-tests.com
        </a>
      </div>
    </div>
  );
}
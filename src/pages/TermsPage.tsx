import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
      <Link to="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}>
        ← Back to Home
      </Link>
      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', color: '#fff' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Last Updated: May 24, 2026</p>
      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
        <p>Welcome to Cps Test Tools! By using our website, you agree to these terms.</p>
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>1. User Conduct</h2>
        <p>You agree not to use auto-clickers, scripts, or bots to manipulate scoreboard ranks or test results.</p>
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>2. Intellectual Property</h2>
        <p>All custom layouts, UI design, and textual content are the intellectual property of the site owner.</p>
      </div>
    </div>
  );
}
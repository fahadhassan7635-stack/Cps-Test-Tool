import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us | FixedAim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Get in touch with the FixedAim team. Have questions, feedback, or a bug report? We typically respond within 1–3 business days.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Get in touch with the FixedAim team. Have questions, feedback, or a bug report? We typically respond within 1–3 business days.';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Fixed Aim – Free CPS Test, Aim Trainer & Gaming Tools';
    };
  }, []);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 1.5rem', color: 'var(--text-primary)' }}>
      <Link to="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}>
        ← Back to Home
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Contact Us
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
          Have a question, bug report, or feedback about our tools? We'd love to hear from you.
          Reach out and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* Email Card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2rem', textAlign: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 0 24px rgba(0,245,255,0.05)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
          Official Email
        </div>
        <a
          href="mailto:supportfixedaim@gmail.com"
          style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--neon-cyan)', textDecoration: 'none' }}
        >
          supportfixedaim@gmail.com
        </a>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: 0 }}>
          We typically respond within 1–3 business days.
        </p>
      </div>

      {/* What to include */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem'
      }}>
        <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', marginTop: 0 }}>
          💡 What to Include in Your Message
        </h2>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: '2', margin: 0, fontSize: '0.95rem' }}>
          <li>Your browser and operating system (e.g. Chrome on Windows 11)</li>
          <li>The tool or page where you experienced the issue</li>
          <li>A brief description of the problem or suggestion</li>
          <li>Any screenshots if relevant</li>
        </ul>
      </div>

      {/* Topics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '🐛', title: 'Bug Reports', desc: 'Found something broken? Let us know.' },
          { icon: '💬', title: 'Feedback', desc: 'Suggestions to improve our tools.' },
          { icon: '🤝', title: 'Partnerships', desc: 'Collaboration or sponsorship inquiries.' },
          { icon: '⚖️', title: 'Legal & Privacy', desc: 'DMCA, data requests, or policy questions.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.25rem',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.7' }}>
        Fixed Aim is a free, independent project. We appreciate your patience and every piece of feedback
        helps us make the tools better for everyone. 🎯
      </p>
    </div>
  );
}

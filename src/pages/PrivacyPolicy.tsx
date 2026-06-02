import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
      <Link to="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}>
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Last updated: May 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
        <p>At cps-tests.co, accessible from <span style={{ color: 'var(--neon-cyan)' }}>https://cps-tests.co</span>, one of our top priorities is the privacy of our visitors. This Privacy Policy document explains the types of information that are collected and recorded by cps-tests.co and how we use it.</p>

        <p>If you have any questions or need more information about our Privacy Policy, feel free to contact us.</p>

        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>Log Files</h2>
        <p>cps-tests.co follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting service analytics.</p>
        <p>The information collected by log files may include:</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Internet Protocol (IP) addresses</li>
          <li>Browser type</li>
          <li>Internet Service Provider (ISP)</li>
          <li>Date and time stamp</li>
          <li>Referring/exit pages</li>
          <li>Number of clicks</li>
        </ul>

        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>Cookies and Web Beacons</h2>
        <p>Like most websites, cps-tests.co uses cookies. These cookies store information such as visitor preferences and pages visited to improve user experience.</p>

        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>Google DoubleClick DART Cookie</h2>
        <p>Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads based on users' visits to our site.</p>

        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', fontSize: '1.3rem', fontWeight: '700' }}>Consent</h2>
        <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>

        <hr style={{ borderColor: 'var(--border)', margin: '2.5rem 0' }} />

        <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700' }}>Contact Us</h2>
        <p>We love hearing from our users! Whether you have questions about our click speed test or feedback, feel free to contact us.</p>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:cpstestshelpline@gmail.com" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              cpstestshelpline@gmail.com
            </a>
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            <strong>Response Time:</strong> Monday to Friday (9:00 AM – 5:00 PM)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
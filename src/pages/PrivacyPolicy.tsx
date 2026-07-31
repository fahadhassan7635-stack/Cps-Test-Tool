import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | FixedAim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Read the FixedAim Privacy Policy to learn how we handle data, cookies, analytics, advertising, and your privacy while using our free online tools.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Read the FixedAim Privacy Policy to learn how we handle data, cookies, analytics, advertising, and your privacy while using our free online tools.';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Fixed Aim – Free CPS Test, Aim Trainer & Gaming Tools';
    };
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
      <Link to="/" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}>
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Last updated: July 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>

        <p>
          At <strong style={{ color: 'var(--text-primary)' }}>Fixed Aim</strong>, accessible from{' '}
          <a href="https://fixedaim.com" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>https://fixedaim.com</a>,
          one of our top priorities is the privacy of our visitors. This Privacy Policy document
          describes what information we collect, how we use it, and what rights you have regarding your data.
        </p>
        <p>
          Fixed Aim is a completely free platform — no sign-up, no login, and no account is required
          to use any of our tools. We do not collect any personal information from our visitors.
        </p>

        {/* ── 1. Information We Collect ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          1. Information We Collect
        </h2>
        <p>
          We do not require you to provide any personal information to use Fixed Aim. However, like
          all websites, our hosting provider automatically records standard server log data when you
          visit. This may include:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Internet Protocol (IP) address</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Internet Service Provider (ISP)</li>
          <li>Date and time of visit</li>
          <li>Referring and exit pages</li>
          <li>Number of page clicks</li>
        </ul>
        <p>
          We do not sell your personal information. Server logs may be processed by our hosting
          provider only for security, maintenance, and legal compliance.
        </p>

        {/* ── 2. Local Data Storage ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          2. Local Data Storage
        </h2>
        <p>
          Some of our tools — such as the CPS Test, Aim Trainer, and arcade games — save your scores
          and preferences locally in your browser using{' '}
          <code style={{ color: 'var(--neon-cyan)', background: 'rgba(0,245,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>localStorage</code>.
          This data is stored entirely on your own device and is never transmitted to our servers.
          You can clear it at any time by clearing your browser's site data.
        </p>

        {/* ── 3. Third-Party Services ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          3. Third-Party Services
        </h2>
        <p>We may use the following third-party services to help us understand site usage and support advertising:</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Google Analytics</strong> — We configure
            Google Analytics to help us understand website usage. Data is collected according to
            Google's privacy practices and may include anonymized usage information.
          </li>
          <li>
            <strong style={{ color: 'var(--text-primary)' }}>Google AdSense</strong> — may display
            relevant advertisements on our site. Google and its partners may use cookies to
            personalize ads and measure advertising performance. You can opt out via{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              Google's Ad Settings
            </a>.
          </li>
        </ul>
        <p>
          These services operate under their own privacy policies. We have no control over and assume
          no responsibility for their data practices.
        </p>

        {/* ── 4. Cookies ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          4. Cookies
        </h2>
        <p>
          Fixed Aim may use cookies and similar technologies to improve functionality, remember
          preferences, analyze traffic, and support advertising through third-party services such
          as Google AdSense and Google Analytics.
        </p>
        <p>
          You can disable cookies through your browser settings at any time. Note that disabling
          cookies may affect the functionality of some features on the site.
        </p>

        {/* ── 5. Children's Privacy ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          5. Children's Privacy
        </h2>
        <p>
          Fixed Aim does not knowingly collect any personal information from children under the age of 13.
          Our tools are general-purpose gaming utilities suitable for all ages. Since no account or
          personal data is required, children can use our tools safely. If you believe a child has
          somehow submitted personal information to us, please contact us and we will promptly
          remove it.
        </p>

        {/* ── 6. Your Rights ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          6. Your Rights
        </h2>
        <p>
          Since we do not collect or store personal data, there is very little data to manage.
          However, you always have the right to:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Clear your locally stored scores and preferences via your browser settings</li>
          <li>
            Opt out of Google Analytics via the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              Google Analytics Opt-out Add-on
            </a>
          </li>
          <li>Contact us with any privacy-related concerns or questions</li>
        </ul>

        {/* ── 7. Changes ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          7. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be reflected on this
          page with an updated revision date. We encourage you to review this page periodically.
          Continued use of the website after any changes constitutes your acceptance of the updated policy.
        </p>

        {/* ── 8. Cookies (AdSense requirement) ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          8. Consent
        </h2>
        <p>
          By using Fixed Aim, you agree to this Privacy Policy.
        </p>

        <hr style={{ borderColor: 'var(--border)', margin: '2.5rem 0' }} />

        {/* ── Contact ── */}
        <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700' }}>
          Contact Us
        </h2>
        <p>
          Have a question or concern about this Privacy Policy? We're happy to help.
        </p>

        <div style={{
          background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px',
          marginTop: '1rem', border: '1px solid var(--border)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Website:</strong>{' '}
            <a href="https://fixedaim.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              fixedaim.com
            </a>
          </p>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:supportfixedaim@gmail.com" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              supportfixedaim@gmail.com
            </a>
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            <strong>Response Time:</strong> We typically respond within 1–3 business days.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;

import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service | FixedAim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Read the FixedAim Terms of Service to understand the rules, limitations, and guidelines for using our free online gaming and typing tools.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Read the FixedAim Terms of Service to understand the rules, limitations, and guidelines for using our free online gaming and typing tools.';
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
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Last updated: July 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>

        <p>
          Welcome to <strong style={{ color: 'var(--text-primary)' }}>Fixed Aim</strong>, accessible
          at{' '}
          <a href="https://fixedaim.com" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
            https://fixedaim.com
          </a>. By accessing or using our website, you agree to be bound by these Terms of Service.
          Please read them carefully before using any of our tools or features.
        </p>
        <p>
          If you do not agree with any part of these terms, you must discontinue use of the website immediately.
        </p>

        {/* ── 1. Acceptance ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          1. Acceptance of Terms
        </h2>
        <p>
          By using Fixed Aim — including all tools, games, and content available on the website —
          you confirm that you have read, understood, and agree to these Terms of Service, as well as
          our{' '}
          <Link to="/privacy-policy" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
            Privacy Policy
          </Link>. These terms apply to all visitors and users of the website.
        </p>

        {/* ── 2. Use of the Website ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          2. Use of the Website
        </h2>
        <p>Fixed Aim is provided free of charge for personal, non-commercial use. You agree to use the website only for lawful purposes. You must not:</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Use auto-clickers, bots, scripts, or any automated tools to manipulate test results or leaderboard scores</li>
          <li>Attempt to exploit, reverse-engineer, or interfere with any part of the website</li>
          <li>Use the website in any way that could damage, disable, or overburden our servers or infrastructure</li>
          <li>Scrape, copy, or reproduce any content from the website without prior written permission</li>
          <li>Use the website for any illegal, harmful, or fraudulent activity</li>
        </ul>

        {/* ── 3. No Account Required ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          3. No Account Required
        </h2>
        <p>
          Fixed Aim does not require registration or login to use any of its tools. All features are
          freely accessible without creating an account. Any scores or preferences saved locally in
          your browser are stored on your device only and are not linked to any user profile.
        </p>

        {/* ── 4. Intellectual Property ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          4. Intellectual Property
        </h2>
        <p>
          All content on Fixed Aim — including but not limited to UI design, layout, graphics, tool
          logic, game code, and written content — is the intellectual property of Fixed Aim and is
          protected under applicable copyright laws. You may not reproduce, distribute, or create
          derivative works from any part of this website without explicit written permission from
          the site owner.
        </p>

        {/* ── 5. Disclaimer ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          5. Disclaimer of Warranties
        </h2>
        <p>
          Fixed Aim is provided on an <strong style={{ color: 'var(--text-primary)'}}>"as is"</strong> and{' '}
          <strong style={{ color: 'var(--text-primary)' }}>"as available"</strong> basis without any
          warranties of any kind, either express or implied. We do not guarantee that:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>The website will be available at all times without interruption</li>
          <li>Test results will be accurate across all devices, browsers, or network conditions</li>
          <li>The website will be free from errors, bugs, or security vulnerabilities</li>
        </ul>
        <p>
          Use of the website and reliance on any results is entirely at your own risk.
        </p>

        {/* ── 6. Limitation of Liability ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          6. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, Fixed Aim and its owner shall not be liable for
          any direct, indirect, incidental, or consequential damages arising from your use of — or
          inability to use — the website, its tools, or any content hosted on it.
        </p>

        {/* ── 7. Third-Party Links & Services ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          7. Third-Party Links & Services
        </h2>
        <p>
          Our website may contain links to third-party websites or display ads served by third-party
          providers such as Google AdSense. These are governed by their own terms and privacy policies.
          We have no control over and accept no responsibility for any third-party content, products,
          or services.
        </p>

        {/* ── 8. Changes to Terms ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          8. Changes to These Terms
        </h2>
        <p>
          We reserve the right to update or modify these Terms of Service at any time. Any changes
          will be posted on this page with an updated revision date. Continued use of the website
          after changes are posted constitutes your acceptance of the revised terms. We encourage
          you to review this page periodically.
        </p>

        {/* ── 9. Governing Law ── */}
        <h2 style={{ color: 'var(--neon-cyan)', marginTop: '2.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
          9. Governing Law
        </h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with applicable
          laws. Any disputes arising from the use of this website shall be subject to the exclusive
          jurisdiction of the relevant courts.
        </p>

        <hr style={{ borderColor: 'var(--border)', margin: '2.5rem 0' }} />

        {/* ── Contact ── */}
        <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem', fontWeight: '700' }}>
          Contact Us
        </h2>
        <p>
          If you have any questions about these Terms of Service, feel free to reach out.
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
}

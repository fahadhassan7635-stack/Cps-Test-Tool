import Link from 'next/link';

const benchmarks = [
  {
    to: '/internet-speed',
    icon: '🌐',
    title: 'Internet Speed Test',
    desc: 'Measure your real-time download speed, upload speed, ping latency, jitter, and packet loss in seconds.',
    color: '#00f5ff',
    tag: 'BENCHMARK'
  },
];

export default function BenchmarkPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '80vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fixedaim.com/' },
              { '@type': 'ListItem', position: 2, name: 'Benchmark', item: 'https://fixedaim.com/benchmark' },
            ],
          }),
        }}
      />

      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label">Category</div>
        <h1 className="tool-title">Benchmark <span style={{ color: 'var(--neon-cyan)' }}>Hub</span></h1>
        <p className="tool-subtitle">
          Benchmark your network speed, ping latency, jitter, and packet loss with real-time analytics and live performance graphs.
        </p>
      </div>

      {/* BENCHMARK GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {benchmarks.map((tool) => (
          <Link
            key={tool.to}
            href={tool.to}
            className="hub-tool-card"
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
          >
            <div>
              {tool.tag && (
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  background: `${tool.color}20`,
                  color: tool.color,
                  textTransform: 'uppercase'
                }}>
                  {tool.tag}
                </span>
              )}
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tool.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: tool.color, marginBottom: '0.5rem' }}>{tool.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{tool.desc}</p>
            </div>
            <span style={{ color: tool.color, fontWeight: '600', fontSize: '0.875rem' }}>Start Benchmark →</span>
          </Link>
        ))}
      </div>

      {/* PERFORMANCE TIPS SECTION */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--neon-cyan)' }}>📊 System & Network Benchmark Tips</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
          Reliable benchmark numbers require a clean testing environment. Follow these guidelines before testing your network, latency, or peripheral performance.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { t: 'Close Background Apps', d: 'Background downloads, cloud backups, and game updates introduce ping jitter and reduce available bandwidth.' },
            { t: 'Use Ethernet for Network', d: 'Wired Ethernet provides 0% packet loss and the lowest possible latency compared to 2.4GHz Wi-Fi.' },
            { t: 'Monitor Polling Rate', d: 'Ensure your mouse and keyboard are operating at 1000Hz+ polling rate for sub-millisecond input registration.' },
            { t: 'Run Multiple Passes', d: 'Run tests 2-3 times to compute a representative average and eliminate momentary routing anomalies.' },
          ].map((tip) => (
            <div key={tip.t} style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--neon-cyan)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{tip.t}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>{tip.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

const DATA = {
  cps: [
    { rank: 1, name: 'FlashClick', score: '14.2 CPS', country: '🇰🇷', avatar: '⚡', badge: 'Speed Demon' },
    { rank: 2, name: 'RapidFire99', score: '13.8 CPS', country: '🇺🇸', avatar: '🔥', badge: 'Elite Clicker' },
    { rank: 3, name: 'ClickMaster', score: '13.1 CPS', country: '🇧🇷', avatar: '💥', badge: 'Pro' },
    { rank: 4, name: 'XSpeedX', score: '12.9 CPS', country: '🇯🇵', avatar: '🎯', badge: '' },
    { rank: 5, name: 'ProClicker', score: '12.7 CPS', country: '🇩🇪', avatar: '🏆', badge: '' },
    { rank: 6, name: 'ClickGod420', score: '12.4 CPS', country: '🇬🇧', avatar: '👾', badge: '' },
    { rank: 7, name: 'FastFinger7', score: '12.1 CPS', country: '🇫🇷', avatar: '🦅', badge: '' },
    { rank: 8, name: 'GG_Click', score: '11.9 CPS', country: '🇨🇦', avatar: '⭐', badge: '' },
    { rank: 9, name: 'NoobSlayer', score: '11.7 CPS', country: '🇦🇺', avatar: '💀', badge: '' },
    { rank: 10, name: 'MouseWizard', score: '11.5 CPS', country: '🇸🇪', avatar: '🧙', badge: '' },
  ],
  wpm: [
    { rank: 1, name: 'TypeGod', score: '187 WPM', country: '🇺🇸', avatar: '⌨️', badge: 'Speed Typist' },
    { rank: 2, name: 'KeyboardNinja', score: '174 WPM', country: '🇸🇬', avatar: '🥷', badge: 'Elite' },
    { rank: 3, name: 'SpeedTyper', score: '168 WPM', country: '🇬🇧', avatar: '💨', badge: '' },
    { rank: 4, name: 'WPMKing', score: '162 WPM', country: '🇨🇳', avatar: '👑', badge: '' },
    { rank: 5, name: 'FastFingers', score: '158 WPM', country: '🇮🇳', avatar: '🚀', badge: '' },
    { rank: 6, name: 'TypeRacer99', score: '154 WPM', country: '🇵🇱', avatar: '🏎️', badge: '' },
    { rank: 7, name: 'KeySmash', score: '149 WPM', country: '🇷🇺', avatar: '💪', badge: '' },
    { rank: 8, name: 'WarpTypist', score: '145 WPM', country: '🇩🇪', avatar: '🌀', badge: '' },
    { rank: 9, name: 'ClickType', score: '141 WPM', country: '🇯🇵', avatar: '✨', badge: '' },
    { rank: 10, name: 'SwiftKeys', score: '138 WPM', country: '🇧🇷', avatar: '🎹', badge: '' },
  ],
  reaction: [
    { rank: 1, name: 'ReflexGod', score: '118ms', country: '🇰🇷', avatar: '⚡', badge: 'Flash' },
    { rank: 2, name: 'QuickDraw', score: '124ms', country: '🇺🇸', avatar: '🎯', badge: 'Pro' },
    { rank: 3, name: 'NeuralLink', score: '131ms', country: '🇯🇵', avatar: '🧠', badge: '' },
    { rank: 4, name: 'SpeedBot', score: '138ms', country: '🇩🇪', avatar: '🤖', badge: '' },
    { rank: 5, name: 'FastReact', score: '142ms', country: '🇧🇷', avatar: '💫', badge: '' },
    { rank: 6, name: 'Reflex_X', score: '147ms', country: '🇬🇧', avatar: '👁️', badge: '' },
    { rank: 7, name: 'LightSpeed', score: '153ms', country: '🇨🇦', avatar: '🌩️', badge: '' },
    { rank: 8, name: 'ReactionKing', score: '158ms', country: '🇸🇪', avatar: '⭐', badge: '' },
    { rank: 9, name: 'ZeroLatency', score: '162ms', country: '🇦🇺', avatar: '🎮', badge: '' },
    { rank: 10, name: 'ProGamer99', score: '167ms', country: '🇫🇷', avatar: '🏆', badge: '' },
  ],
  aim: [
    { rank: 1, name: 'AimBot_Real', score: '487 hits', country: '🇰🇷', avatar: '🎯', badge: 'Sharpshooter' },
    { rank: 2, name: 'Headshot_Pro', score: '462 hits', country: '🇺🇸', avatar: '🔫', badge: 'Elite' },
    { rank: 3, name: 'NoscoperXD', score: '448 hits', country: '🇩🇪', avatar: '🔭', badge: '' },
    { rank: 4, name: 'AimGod420', score: '431 hits', country: '🇬🇧', avatar: '💎', badge: '' },
    { rank: 5, name: 'PrecisionX', score: '419 hits', country: '🇯🇵', avatar: '⭐', badge: '' },
  ],
};

type Tab = 'cps' | 'wpm' | 'reaction' | 'aim';

const tabConfig: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'cps', label: 'CPS', icon: '🖱️', color: 'var(--neon-green)' },
  { id: 'wpm', label: 'WPM', icon: '⌨️', color: 'var(--neon-cyan)' },
  { id: 'reaction', label: 'Reaction', icon: '⚡', color: 'var(--neon-orange)' },
  { id: 'aim', label: 'Aim', icon: '🎯', color: 'var(--neon-red)' },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('cps');
  const entries = DATA[tab];
  const activeConfig = tabConfig.find(t => t.id === tab)!;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Competition</div>
        <h1 className="tool-title">Global Leaderboard</h1>
        <p className="tool-subtitle">Top performers from around the world</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {tabConfig.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px',
            border: tab === t.id ? `1px solid ${t.color}` : '1px solid var(--border)',
            background: tab === t.id ? `${t.color}15` : 'var(--bg-card)',
            color: tab === t.id ? t.color : 'var(--text-secondary)',
            fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Podium for top 3 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[entries[1], entries[0], entries[2]].map((e, i) => {
          const medals = ['🥈', '🥇', '🥉'];
          const heights = ['120px', '160px', '100px'];
          return e ? (
            <div key={e.rank} style={{ textAlign: 'center', flex: '0 0 140px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{e.avatar}</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{e.name}</div>
              <div style={{ color: activeConfig.color, fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{e.score}</div>
              <div style={{
                height: heights[i],
                background: i === 1 ? `${activeConfig.color}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === 1 ? activeConfig.color : 'var(--border)'}`,
                borderRadius: '8px 8px 0 0',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.5rem',
                fontSize: '1.75rem',
              }}>
                {medals[i]}
              </div>
            </div>
          ) : null;
        })}
      </div>

      {/* Full table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700', color: activeConfig.color }}>🏆 {activeConfig.icon} Full Rankings</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updated daily</span>
        </div>
        {entries.map((entry, i) => (
          <div key={entry.rank} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 1.5rem',
            borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
            background: i === 0 ? `${activeConfig.color}05` : 'transparent',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i === 0 ? `${activeConfig.color}05` : 'transparent'}
          >
            <span style={{
              width: '32px', textAlign: 'center', fontWeight: '800', fontSize: '1rem',
              color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
            }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
            </span>
            <span style={{ fontSize: '1.5rem' }}>{entry.avatar}</span>
            <span style={{ flex: 1, fontWeight: '600' }}>{entry.name}</span>
            {entry.badge && (
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', background: `${activeConfig.color}20`, color: activeConfig.color, textTransform: 'uppercase' }}>{entry.badge}</span>
            )}
            <span style={{ fontWeight: '800', color: activeConfig.color, fontSize: '1rem', minWidth: '80px', textAlign: 'right' }}>{entry.score}</span>
            <span style={{ fontSize: '1.1rem' }}>{entry.country}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: '12px', padding: '1.25rem', marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          🎮 Think you can make the top 10? Take the test and submit your score!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          {[{ to: '/cps-test', label: 'CPS Test' }, { to: '/typing-test', label: 'Typing Test' }, { to: '/reaction-time', label: 'Reaction Test' }].map(l => (
            <a key={l.to} href={`#${l.to}`} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

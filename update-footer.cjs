const fs = require('fs');

let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const replacement = `</ul>
            </div>
          </div>

          {/* SEO Gaming Links */}
          <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              🔥 Popular Games & Gaming Platforms
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <a href="https://www.counter-strike.net/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Aim & FPS training">CS2</a>
              <span>·</span>
              <a href="https://playvalorant.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Aim training">VALORANT</a>
              <span>·</span>
              <a href="https://www.minecraft.net/" target="_blank" rel="noopener noreferrer" className="footer-link" title="PvP / clicking practice">Minecraft</a>
              <span>·</span>
              <a href="https://pubg.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="reaction & aiming">PUBG</a>
              <span>·</span>
              <a href="https://www.callofduty.com/warzone" target="_blank" rel="noopener noreferrer" className="footer-link" title="FPS practice">Warzone</a>
              <span>·</span>
              <a href="https://www.rockstargames.com/VI" target="_blank" rel="noopener noreferrer" className="footer-link" title="Game info">GTA VI</a>
              <span>·</span>
              <a href="https://www.crazygames.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Free browser games">CrazyGames</a>
              <span>·</span>
              <a href="https://zone.msn.com/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Online games">MSN Games</a>
              <span>·</span>
              <a href="https://geometrydash.io/" target="_blank" rel="noopener noreferrer" className="footer-link" title="Rhythm & clicking">Geometry Dash</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba`;

code = code.replace(/<\/ul>\s*<\/div>\s*<\/div>\s*<div style={{ borderTop: '1px solid rgba/, replacement);
fs.writeFileSync('src/components/Layout.tsx', code);
console.log('Successfully updated Layout.tsx');

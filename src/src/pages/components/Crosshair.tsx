import { useEffect, useState } from 'react';

export default function Crosshair() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y, pointerEvents: 'none', zIndex: 9999,
      transform: 'translate(-50%, -50%)',
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none">
        <circle cx="20" cy="20" r="12" stroke="rgba(255,255,255,0.5)" />
        <line x1="20" y1="0" x2="20" y2="10" />
        <line x1="20" y1="30" x2="20" y2="40" />
        <line x1="0" y1="20" x2="10" y2="20" />
        <line x1="30" y1="20" x2="40" y2="20" />
        <circle cx="20" cy="20" r="2" fill="red" stroke="none" />
      </svg>
    </div>
  );
}

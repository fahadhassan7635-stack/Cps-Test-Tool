
export default function TargetSVG() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            .target-text {
              fill: white;
              font-family: 'Arial', sans-serif;
              font-weight: 900;
              text-anchor: middle;
              dominant-baseline: central;
              stroke: #0a0a0a;
              stroke-width: 6px;
              paint-order: stroke fill;
            }
          `}
        </style>
      </defs>

      {/* Main Black Silhouette */}
      <path 
        d="M 15 320 
           L 15 170 
           C 15 130, 40 120, 75 110 
           C 75 110, 65 90, 65 60 
           A 35 35 0 1 1 135 60 
           C 135 90, 125 110, 125 110 
           C 160 120, 185 130, 185 170 
           L 185 320 
           Z" 
        fill="#0a0a0a" 
        stroke="white" 
        strokeWidth="2"
      />

      {/* Concentric Rings */}
      <g fill="none" stroke="white" strokeWidth="2.5">
        {/* Ring 7 */}
        <rect x="30" y="95" width="140" height="230" rx="70" />
        {/* Ring 8 */}
        <rect x="45" y="120" width="110" height="180" rx="55" />
        {/* Ring 9 */}
        <rect x="60" y="145" width="80" height="130" rx="40" />
        {/* Ring 10 */}
        <rect x="75" y="170" width="50" height="80" rx="25" />
        {/* Center X Ring */}
        <rect x="90" y="190" width="20" height="40" rx="10" />
      </g>

      {/* Labels */}
      <g className="target-text" fontSize="11">
        {/* Center */}
        <text x="100" y="210" fill="#ef4444" fontSize="13">X</text>

        {/* 10s */}
        <text x="100" y="180">10</text>
        <text x="100" y="240">10</text>
        <text x="82" y="210">10</text>
        <text x="118" y="210">10</text>

        {/* 9s */}
        <text x="100" y="157">9</text>
        <text x="100" y="262">9</text>
        <text x="67" y="210">9</text>
        <text x="133" y="210">9</text>

        {/* 8s */}
        <text x="100" y="132">8</text>
        <text x="100" y="287">8</text>
        <text x="52" y="210">8</text>
        <text x="148" y="210">8</text>

        {/* 7s */}
        <text x="100" y="107">7</text>
        <text x="100" y="312">7</text>
        <text x="37" y="210">7</text>
        <text x="163" y="210">7</text>
      </g>

      {/* Headshot Zone */}
      <text x="100" y="35" className="target-text" fontSize="12" letterSpacing="0.5">HEADSHOT</text>
      <circle cx="100" cy="50" r="6" fill="#ef4444" />
    </svg>
  );
}

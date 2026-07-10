'use client';

interface MascotProps {
  state: 'smiling' | 'crying' | 'determined' | 'celebrating';
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function Mascot({ state, size = 120, className = '', animate = true }: MascotProps) {
  // Styles for dynamic bouncing/floating mascot
  const animationStyle = animate 
    ? { animation: state === 'celebrating' ? 'mascot-jump 0.5s infinite alternate' : 'mascot-float 3s ease-in-out infinite' }
    : {};

  return (
    <div 
      className={`mascot-container ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...animationStyle
      }}
    >
      <svg 
        viewBox="0 0 160 160" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes mascot-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            @keyframes mascot-jump {
              0% { transform: translateY(0) scale(1); }
              100% { transform: translateY(-16px) scale(1.05); }
            }
          `}</style>
          {/* Shadow filter */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.1" />
          </filter>
        </defs>

        <g filter="url(#shadow)">
          {/* FEET (Orange) */}
          <ellipse cx="60" cy="140" rx="14" ry="8" fill="#ff9600" />
          <ellipse cx="100" cy="140" rx="14" ry="8" fill="#ff9600" />

          {/* MAIN BODY (Duolingo Green) */}
          <path 
            d="M 30,70 C 30,30 130,30 130,70 C 130,110 120,135 80,135 C 40,135 30,110 30,70 Z" 
            fill="#58cc02" 
          />

          {/* BELLY PATCH (Light Green) */}
          <path 
            d="M 50,85 C 50,65 110,65 110,85 C 110,115 50,115 50,85 Z" 
            fill="#78e31b" 
          />

          {/* WINGS */}
          {state === 'celebrating' ? (
            <>
              {/* Wings raised high */}
              <path d="M 32,60 C 15,35 25,20 35,35 Z" fill="#46a302" />
              <path d="M 128,60 C 145,35 135,20 125,35 Z" fill="#46a302" />
            </>
          ) : state === 'determined' ? (
            <>
              {/* Wings on hips */}
              <path d="M 32,70 C 18,72 18,88 32,90 Z" fill="#46a302" />
              <path d="M 128,70 C 142,72 142,88 128,90 Z" fill="#46a302" />
            </>
          ) : state === 'crying' ? (
            <>
              {/* Wings downcast */}
              <path d="M 32,75 C 22,88 32,105 38,100 Z" fill="#46a302" />
              <path d="M 128,75 C 138,88 128,105 122,100 Z" fill="#46a302" />
            </>
          ) : (
            <>
              {/* Smiling: Waving wing left, normal wing right */}
              <path d="M 32,70 C 15,55 20,40 30,50 Z" fill="#46a302" />
              <path d="M 128,70 C 138,85 132,95 125,90 Z" fill="#46a302" />
            </>
          )}

          {/* FACE EYES & BEAK */}
          {/* Eyes Base (White) */}
          <circle cx="58" cy="65" r="22" fill="#ffffff" />
          <circle cx="102" cy="65" r="22" fill="#ffffff" />

          {/* Pupils */}
          {state === 'crying' ? (
            <>
              {/* Sad, closed downcast arcs */}
              <path d="M 46,65 Q 58,75 70,65" stroke="#3c3c3c" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 90,65 Q 102,75 114,65" stroke="#3c3c3c" strokeWidth="4" fill="none" strokeLinecap="round" />
              
              {/* Large blue teardrops */}
              <path d="M 52,72 C 52,80 44,80 44,72 C 44,66 52,62 52,72 Z" fill="#1cb0f6" />
              <path d="M 108,72 C 108,80 116,80 116,72 C 116,66 108,62 108,72 Z" fill="#1cb0f6" />
            </>
          ) : state === 'celebrating' || state === 'smiling' ? (
            <>
              {/* Curved happy arcs */}
              <path d="M 46,65 Q 58,52 70,65" stroke="#3c3c3c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M 90,65 Q 102,52 114,65" stroke="#3c3c3c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Determined / Normal (Large Pupils looking at you) */}
              <circle cx="58" cy="65" r="9" fill="#3c3c3c" />
              <circle cx="102" cy="65" r="9" fill="#3c3c3c" />
              <circle cx="56" cy="62" r="3" fill="#ffffff" />
              <circle cx="100" cy="62" r="3" fill="#ffffff" />
            </>
          )}

          {/* BEAK (Orange Triangle) */}
          <path d="M 72,74 L 88,74 L 80,90 Z" fill="#ff9600" stroke="#ff9600" strokeWidth="2" strokeLinejoin="round" />

          {/* EYE DETAILS (Orange Feathers on Sides) */}
          <path d="M 33,56 C 24,56 26,46 35,48 Z" fill="#ffc800" />
          <path d="M 127,56 C 136,56 134,46 125,48 Z" fill="#ffc800" />

          {/* DETERMINED SWEATBAND */}
          {state === 'determined' && (
            <>
              {/* Red sweatband across forehead */}
              <rect x="38" y="32" width="84" height="12" rx="4" fill="#ff4b4b" />
              {/* Sweatband line detail */}
              <line x1="44" y1="38" x2="116" y2="38" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Celebrating Sparkles */}
        {state === 'celebrating' && (
          <g>
            <path d="M 20,25 L 25,20 L 30,25 L 25,30 Z" fill="#ffc800" />
            <path d="M 135,25 L 140,20 L 145,25 L 140,30 Z" fill="#ffc800" />
            <path d="M 15,100 L 18,97 L 21,100 L 18,103 Z" fill="#ff9600" />
            <path d="M 145,100 L 148,97 L 151,100 L 148,103 Z" fill="#ff9600" />
          </g>
        )}
      </svg>
    </div>
  );
}

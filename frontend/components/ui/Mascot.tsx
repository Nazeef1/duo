'use client';

interface MascotProps {
  state: 'smiling' | 'crying' | 'determined' | 'celebrating';
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function Mascot({ state, size = 120, className = '', animate = true }: MascotProps) {
  // Map state to downloaded asset path
  const assetMap = {
    smiling: '/mascot/goodjobduo.gif',
    crying: '/mascot/sad_duo.gif',
    determined: '/mascot/duostrong.gif',
    celebrating: '/mascot/happy duo.gif',
  };

  const selectedAsset = assetMap[state] || '/mascot/goodjobduo.gif';

  // Apply custom CSS floating animations for static pngs or standard sizing
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
        position: 'relative',
        ...animationStyle
      }}
    >
      <img 
        src={selectedAsset} 
        alt={`Duo ${state}`} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain'
        }} 
        onError={(e) => {
          // If the GIF is missing, fall back to a local static png or default icon
          (e.target as HTMLImageElement).src = '/mascot/mainicon.png';
        }}
      />
    </div>
  );
}

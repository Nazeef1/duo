'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Heart, PlusCircle } from 'lucide-react';

export default function TopBar() {
  const { streak, gems, hearts, xp, fetchUser, refillHearts } = useUserStore();
  const [refilling, setRefilling] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRefill = async (e: React.MouseEvent) => {
    e.preventDefault();
    setRefilling(true);
    await refillHearts();
    setRefilling(false);
  };

  return (
    <div className="topbar" style={{ borderBottom: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
        {/* Target Language Flag */}
        <div className="stat-item language" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', fontWeight: 'bold' }}>
          <img 
            src="/icons/spain.png" 
            alt="Spanish" 
            style={{ width: '28px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} 
          />
          <span style={{ fontSize: '15px' }}>15</span>
        </div>

        {/* Streak */}
        <div className="stat-item streak" title="Day Streak" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-orange)' }}>
          <img 
            src="/icons/fire.png" 
            alt="Streak" 
            style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '15px' }}>{streak}</span>
        </div>
        
        {/* Gems */}
        <div className="stat-item gems" title="Gems" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-blue)' }}>
          <img 
            src="/icons/gem.png" 
            alt="Gems" 
            style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '15px' }}>{gems}</span>
        </div>
        
        {/* Hearts */}
        <div className="stat-item hearts" title="Hearts" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-red)' }}>
          <Heart size={24} fill="var(--color-red)" stroke="none" />
          <span style={{ fontSize: '15px' }}>{hearts}</span>
        </div>
      </div>
    </div>
  );
}

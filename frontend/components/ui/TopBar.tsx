'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Flame, Gem, Heart, PlusCircle } from 'lucide-react';

export default function TopBar() {
  const { streak, gems, hearts, fetchUser, refillHearts, isLoading } = useUserStore();
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
    <div className="topbar">
      <div className="stat-item streak" title="Streak count">
        <Flame size={22} fill="currentColor" stroke="none" />
        <span>{streak}</span>
      </div>
      
      <div className="stat-item gems" title="Gems">
        <Gem size={22} fill="currentColor" stroke="none" />
        <span>{gems}</span>
      </div>
      
      <div className="stat-item hearts" title="Hearts (Click + to refill)">
        <Heart size={22} fill="currentColor" stroke="none" />
        <span>{hearts}</span>
        {hearts < 5 && (
          <button 
            onClick={handleRefill} 
            disabled={refilling}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--color-green)',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '2px'
            }}
            title="Refill Hearts"
          >
            <PlusCircle size={18} fill="none" stroke="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}

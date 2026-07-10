'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/ui/TopBar';
import Mascot from '@/components/ui/Mascot';
import { Heart, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function ShopPage() {
  const { gems, hearts, fetchUser, refillHearts } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRefillPurchase = async () => {
    if (hearts >= 5) {
      alert('Your hearts are already full!');
      return;
    }
    
    setLoading(true);
    try {
      // Direct refill trigger
      await refillHearts();
      setSuccessMsg('Hearts refilled successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to purchase heart refill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="shop-layout">
        {/* Success toast alerts */}
        {successMsg && (
          <div className="toast-container">
            <div className="toast">
              <Sparkles size={16} />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* Super Promotion Banner */}
        <div className="shop-banner" style={{ background: 'linear-gradient(90deg, var(--bg-primary) 0%, var(--color-purple) 100%)', border: 'none', padding: '32px', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: 'white' }}>
                Start a family plan!
              </h2>
              <p style={{ fontSize: '15px', color: 'white', fontWeight: 600, marginBottom: '24px' }}>
                Save on <span style={{ fontWeight: 900 }}>Super Duolingo</span> when you learn with friends
              </p>
              <button 
                className="btn-3d"
                style={{ backgroundColor: 'white', color: 'var(--color-purple-dark)', borderColor: 'white', padding: '12px 24px', fontSize: '14px', width: '250px' }}
                onClick={() => alert("Family Plan Activated!")}
              >
                LEARN MORE
              </button>
            </div>
            <div style={{ transform: 'rotate(-5deg)' }}>
              <img src="/mascot/duostrong.gif" alt="Family Plan" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Hearts Section */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          Hearts
        </h3>

        {/* Purchase Refill */}
        <div className="shop-item-card" style={{ borderTop: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '24px 0', backgroundColor: 'transparent' }}>
          <div style={{ marginRight: '24px' }}>
            <Heart size={48} fill="var(--color-red)" stroke="white" strokeWidth={1} />
          </div>
          <div className="shop-item-info">
            <h4 className="shop-item-title" style={{ fontSize: '18px' }}>Refill Hearts</h4>
            <p className="shop-item-desc" style={{ fontSize: '15px' }}>
              Get full hearts so you can worry less about making mistakes in a lesson
            </p>
          </div>
          <div>
            <button 
              onClick={handleRefillPurchase}
              disabled={loading || hearts >= 5}
              className="btn-3d"
              style={{ 
                padding: '12px 24px', 
                fontSize: '14px', 
                minWidth: '140px',
                backgroundColor: 'transparent',
                color: hearts >= 5 ? 'var(--text-muted)' : 'var(--color-green)',
                borderColor: hearts >= 5 ? 'var(--border-color)' : 'var(--color-green)',
                boxShadow: hearts >= 5 ? 'none' : '0 4px 0 var(--color-green)',
                cursor: hearts >= 5 ? 'default' : 'pointer'
              }}
            >
              {hearts >= 5 ? 'FULL' : 'BUY'}
            </button>
          </div>
        </div>

        {/* Unlimited Hearts Promo */}
        <div className="shop-item-card" style={{ borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '24px 0', backgroundColor: 'transparent' }}>
          <div style={{ marginRight: '24px' }}>
            <div style={{ background: 'linear-gradient(45deg, var(--color-blue), var(--color-purple))', borderRadius: '50%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '24px' }}>∞</span>
            </div>
          </div>
          <div className="shop-item-info">
            <h4 className="shop-item-title" style={{ fontSize: '18px' }}>Unlimited Hearts</h4>
            <p className="shop-item-desc" style={{ fontSize: '15px' }}>
              Never run out of hearts with Super!
            </p>
          </div>
          <div>
            <button 
              className="btn-3d"
              style={{ 
                padding: '12px 24px', 
                fontSize: '14px', 
                minWidth: '140px',
                backgroundColor: 'transparent',
                color: 'var(--color-purple)',
                borderColor: 'var(--color-purple)',
                boxShadow: '0 4px 0 var(--color-purple)'
              }}
              onClick={() => alert("Unlimited Hearts Trial Started!")}
            >
              FREE TRIAL
            </button>
          </div>
        </div>

        {/* Power-ups Section */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '32px 0 16px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          Power-Ups
        </h3>

        {/* Streak Freeze */}
        <div className="shop-item-card" style={{ borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '24px 0', backgroundColor: 'transparent' }}>
          <div style={{ marginRight: '24px' }}>
            <img src="/icons/fire.png" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'hue-rotate(180deg)' }} alt="Streak Freeze" />
          </div>
          <div className="shop-item-info">
            <h4 className="shop-item-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Streak Freeze
              <span style={{ fontSize: '13px', color: 'var(--color-green)', fontWeight: 800 }}>2/2 EQUIPPED</span>
            </h4>
            <p className="shop-item-desc" style={{ fontSize: '15px' }}>
              Allows your streak to remain in place if you miss a day of practice.
            </p>
          </div>
          <div>
            <button 
              disabled
              className="btn-3d"
              style={{ 
                padding: '12px 24px', 
                fontSize: '14px', 
                minWidth: '140px', 
                cursor: 'default',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                borderColor: 'var(--border-color)',
                boxShadow: 'none'
              }}
            >
              EQUIPPED
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

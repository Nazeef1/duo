'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import TopBar from '@/components/ui/TopBar';
import { useUserStore } from '@/store/useUserStore';
import { Trophy, Award, Star } from 'lucide-react';

const LEAGUE_BADGES = [
  { name: 'Gold', src: '/icons/gold.svg', isCurrent: false, isLocked: false },
  { name: 'Sapphire', src: '/icons/bluebadge.svg', isCurrent: false, isLocked: false },
  { name: 'Ruby', src: '/icons/redbadge.svg', isCurrent: false, isLocked: false },
  { name: 'Emerald', src: '/icons/emeraldbadge.svg', isCurrent: true, isLocked: false },
  { name: 'Locked 1', src: '/icons/lockedbadge.svg', isCurrent: false, isLocked: true },
  { name: 'Locked 2', src: '/icons/lockedbadge.svg', isCurrent: false, isLocked: true },
  { name: 'Locked 3', src: '/icons/lockedbadge.svg', isCurrent: false, isLocked: true },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>('💪');
  const { username } = useUserStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setEntries(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard entries');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const currentUserEntry = entries.find(e => e.username === username || e.username === 'learner');
  const currentRank = currentUserEntry?.rank ?? entries.length;
  const totalEntries = entries.length;
  // For demo: user is in Bronze league, top 3 promote
  const promotionZone = Math.ceil(totalEntries * 0.3);
  const demotionZone = totalEntries - Math.ceil(totalEntries * 0.2);

  // Time remaining in league (dummy - 2 days for demo)
  const timeRemaining = '2 days';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
          Loading leaderboard rankings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--color-red)', fontWeight: 800 }}>{error}</div>
          <button onClick={() => window.location.reload()} className="btn-3d btn-blue">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      
      <div style={{ display: 'flex', flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div className="leaderboard-layout" style={{ flex: 1, paddingRight: '24px' }}>
        {/* League Tier Icons Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '12px', 
          marginBottom: '24px',
          padding: '0 8px'
        }}>
          {LEAGUE_BADGES.map((badge) => {
            return (
              <div
                key={badge.name}
                title={badge.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: badge.isCurrent ? '72px' : '52px',
                  height: badge.isCurrent ? '72px' : '52px',
                  transform: badge.isCurrent ? 'scale(1.1)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <img 
                  src={badge.src} 
                  alt={badge.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    opacity: badge.isLocked ? 0.5 : 1
                  }} 
                />
              </div>
            );
          })}
        </div>

        {/* League Title & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 className="leaderboard-title">Emerald League</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>
            Top 11 advance to the next league
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--color-orange)', 
            fontWeight: 800, 
            marginTop: '4px' 
          }}>
            23 hours remaining
          </p>
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-list" style={{ marginTop: '24px' }}>
          {entries.map((entry, idx) => {
            const isCurrentUser = entry.username === username || entry.username === 'learner';
            const isPromotion = entry.rank <= promotionZone;
            const isDemotion = entry.rank > demotionZone;
            
            // Determine special styling or icon for top ranks
            let rankIcon = null;
            if (entry.rank === 1) rankIcon = <Trophy size={18} fill="currentColor" />;
            else if (entry.rank === 2) rankIcon = <Award size={18} fill="currentColor" />;
            else if (entry.rank === 3) rankIcon = <Award size={18} fill="currentColor" />;

            return (
              <div key={entry.username}>
                {/* Promotion zone separator */}
                {idx === promotionZone && (
                  <div style={{ 
                    padding: '8px 24px', 
                    background: 'var(--color-red-light)',
                    borderTop: `2px dashed var(--color-red)`,
                    borderBottom: `2px dashed var(--color-red)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-red)',
                    fontSize: '12px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ⚠️ Demotion Zone — Stay above this line!
                  </div>
                )}
                <div 
                  className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                  style={{
                    backgroundColor: isCurrentUser ? 'var(--bg-secondary)' : undefined,
                    borderRadius: '16px',
                    padding: '12px 24px',
                    margin: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  {/* Rank display */}
                  <div className={`leaderboard-rank leaderboard-rank-${entry.rank}`}>
                    {entry.rank <= 3 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {entry.rank} {rankIcon}
                      </span>
                    ) : (
                      <span>{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar circle */}
                  <div 
                    className="leaderboard-avatar"
                    style={{
                      backgroundColor: isCurrentUser ? 'var(--color-blue)' : `hsl(${entry.username.charCodeAt(0) * 13 % 360}, 60%, 45%)`,
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 900,
                      position: 'relative'
                    }}
                  >
                    {entry.username[0].toUpperCase()}
                    {isCurrentUser && selectedEmoji && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '-8px', 
                          right: '-8px', 
                          backgroundColor: 'var(--bg-secondary)', 
                          border: '1.5px solid var(--border-color)', 
                          borderRadius: '50%', 
                          width: '22px', 
                          height: '22px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '12px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                          zIndex: 10
                        }}
                      >
                        {selectedEmoji}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="leaderboard-username" style={{ color: isCurrentUser ? 'var(--color-green)' : 'var(--text-dark)', fontWeight: 800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{entry.username}</span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="leaderboard-xp" style={{ color: isCurrentUser ? 'var(--color-green)' : 'var(--text-dark)', marginLeft: 'auto', fontWeight: 800 }}>
                    {entry.total_xp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentUserEntry && (
          <div style={{ 
            marginTop: '24px', 
            padding: '16px 20px',
            border: '2px solid var(--border-color)',
            borderBottom: '4px solid var(--border-color)',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900 }}>
                You're ranked <span style={{ color: 'var(--color-green)' }}>#{currentRank}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                {currentRank <= promotionZone 
                  ? '🎉 You are in the promotion zone!' 
                  : `${promotionZone - currentRank + 1 > 0 ? promotionZone - currentRank + 1 : 0} ranks away from promotion zone`}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-gold)' }}>
              {currentUserEntry.total_xp} XP
            </div>
          </div>
        )}
        </div>

        {/* Fixed Right Sidebar Widget Panels */}
        <div className="right-sidebar" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
          {/* Set your status mock */}
          <div 
            style={{ 
              border: '2px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '24px', 
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Set your status</h3>
              {selectedEmoji && (
                <button 
                  onClick={() => setSelectedEmoji(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-blue)', 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative' }}>
                {/* Circular Avatar */}
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '32px', fontWeight: 900 }}>
                  {username[0].toUpperCase()}
                </div>
                {/* Selected status speech bubble */}
                {selectedEmoji && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '-8px', 
                      right: '-8px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '2px solid var(--border-color)', 
                      borderRadius: '50%', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '16px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      zIndex: 10
                    }}
                  >
                    {selectedEmoji}
                  </div>
                )}
                {/* Online status green dot */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: '50%', padding: '4px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-green)', borderRadius: '50%' }}></div>
                </div>
              </div>
            </div>

            {/* 12 selectable emojis, matching the grid on the reference image */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {['😎', '🎉', '💪', '👀', '🍿', '🇪🇸', '🦉', '💯', '💩', '🏆', '👑', '🐱'].map((emoji) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button 
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    style={{ 
                      height: '36px', 
                      borderRadius: '8px', 
                      backgroundColor: isSelected ? 'rgba(28, 176, 246, 0.15)' : 'var(--bg-primary)', 
                      border: isSelected ? '2px solid #1cb0f6' : '2px solid var(--border-color)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

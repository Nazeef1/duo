'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import TopBar from '@/components/ui/TopBar';
import { useUserStore } from '@/store/useUserStore';
import { Trophy, Award, Star } from 'lucide-react';

const LEAGUES = [
  { name: 'Bronze', color: '#cd7f32', icon: '🥉' },
  { name: 'Silver', color: '#afafaf', icon: '🥈' },
  { name: 'Gold', color: '#ffc800', icon: '🥇' },
  { name: 'Emerald', color: '#58cc02', icon: '💚' },
  { name: 'Obsidian', color: '#a560e8', icon: '💜' },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          gap: '8px', 
          marginBottom: '32px',
          padding: '0 8px'
        }}>
          {LEAGUES.map((league, idx) => {
            const isActive = league.name === 'Bronze';
            const isLocked = idx > 0;
            return (
              <div
                key={league.name}
                title={league.name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isActive ? `3px solid ${league.color}` : '2px solid var(--border-color)',
                  backgroundColor: isActive ? 'transparent' : 'var(--bg-secondary)',
                  opacity: isLocked ? 0.4 : 1,
                  fontSize: '28px',
                  cursor: 'default',
                  boxShadow: isActive ? `0 0 12px ${league.color}55` : 'none',
                }}
              >
                {league.icon}
              </div>
            );
          })}
        </div>

        {/* League Title & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 className="leaderboard-title">Bronze League</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>
            Top {promotionZone} advance to the next league
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--color-orange)', 
            fontWeight: 800, 
            marginTop: '4px' 
          }}>
            {timeRemaining} remaining
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
                      fontWeight: 900
                    }}
                  >
                    {entry.username[0].toUpperCase()}
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Set your status</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#a560e8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: '32px' }}>😎</span>
                <div style={{ position: 'absolute', bottom: 0, right: -10, backgroundColor: 'white', borderRadius: '50%', padding: '4px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-green)', borderRadius: '50%' }}></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {['🔥', '💪', '👀', '🍿', '🇪🇸', '💯', '💩', '🏆', '👑', '😹'].map((emoji, i) => (
                <div key={i} style={{ 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: i === 0 ? 'rgba(88, 204, 2, 0.2)' : 'var(--bg-primary)', 
                  border: i === 0 ? '2px solid var(--color-green)' : '2px solid transparent',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

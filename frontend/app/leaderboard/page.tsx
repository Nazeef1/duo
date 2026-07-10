'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import TopBar from '@/components/ui/TopBar';
import { Trophy, Award, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      <div className="leaderboard-layout">
        <h2 className="leaderboard-title">Bronze League</h2>
        <p className="leaderboard-subtitle">Compete with learners around the world. Top learners unlock achievements!</p>

        <div className="leaderboard-list">
          {entries.map((entry) => {
            const isCurrentUser = entry.username === 'learner';
            
            // Determine special styling or icon for top ranks
            let rankIcon = null;
            if (entry.rank === 1) rankIcon = <Trophy size={18} fill="currentColor" />;
            else if (entry.rank === 2) rankIcon = <Award size={18} fill="currentColor" />;
            else if (entry.rank === 3) rankIcon = <Award size={18} fill="currentColor" />;

            return (
              <div 
                key={entry.username} 
                className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                style={{
                  borderLeft: isCurrentUser ? '4px solid var(--color-blue)' : '4px solid transparent'
                }}
              >
                {/* Rank display */}
                <div className={`leaderboard-rank leaderboard-rank-${entry.rank}`}>
                  {entry.rank === 1 || entry.rank === 2 || entry.rank === 3 ? (
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
                    backgroundColor: isCurrentUser ? 'var(--color-blue)' : '#e5e5e5',
                    color: isCurrentUser ? 'white' : 'var(--text-dark)'
                  }}
                >
                  {entry.username[0]}
                </div>

                {/* Username */}
                <div className="leaderboard-username">
                  {entry.username}
                  {isCurrentUser && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '11px', 
                      backgroundColor: 'var(--color-blue)', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '8px',
                      fontWeight: 800
                    }}>
                      YOU
                    </span>
                  )}
                </div>

                {/* XP */}
                <div className="leaderboard-xp">
                  {entry.total_xp} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

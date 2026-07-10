'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/ui/TopBar';
import { Zap, Volume2, Star } from 'lucide-react';

export default function QuestsPage() {
  const { xp, streak, fetchUser, username } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Daily quest calculations based on real data
  const dailyXpGoal = 10;
  const dailyXpProgress = Math.min(dailyXpGoal, xp);
  const dailyXpPercent = (dailyXpProgress / dailyXpGoal) * 100;

  // Combo XP quest: requires 10 correct answers in a row (simulated via xp > threshold)
  const comboGoal = 10;
  // Approximate combo progress: if XP >= 20 (completed 2 lessons or more), show some progress
  const comboProgress = Math.min(comboGoal, Math.floor(xp / 3));
  const comboPercent = (comboProgress / comboGoal) * 100;

  // Listening exercises: count based on XP (each lesson has ~2 translate exercises)
  const listeningGoal = 7;
  const listeningProgress = Math.min(listeningGoal, Math.floor(xp / 2));
  const listeningPercent = (listeningProgress / listeningGoal) * 100;

  // Monthly quests with all completed indicator
  const monthlyQuests = [
    { name: 'Complete 3 lessons', progress: Math.min(3, Math.floor(xp / 10)), goal: 3 },
    { name: 'Earn a 3-day streak', progress: Math.min(3, streak), goal: 3 },
    { name: 'Complete 10 exercises', progress: Math.min(10, xp), goal: 10 },
    { name: 'Get a perfect lesson', progress: Math.min(1, xp > 15 ? 1 : 0), goal: 1 },
    { name: 'Learn 20 new words', progress: Math.min(20, Math.floor(xp * 0.8)), goal: 20 },
  ];
  const monthlyCompleted = monthlyQuests.filter(q => q.progress >= q.goal).length;
  const monthlyTotal = 20; // Total quests in the July challenge
  const monthlyProgressPercent = Math.round((monthlyCompleted / monthlyTotal) * 100);

  // Monthly badges data with static character image icons
  const monthlyBadges = [
    { name: 'May Quest', date: 'May 2026', avatar: '/mascot/Junior_icon.jpg' },
    { name: 'March Quest', date: 'March 2026', avatar: '/mascot/Eddy_icon.jpg' },
    { name: 'January Quest', date: 'January 2026', avatar: '/mascot/Lucy.png' },
    { name: "Lily's Haunted House", date: 'October 2025', avatar: '/mascot/lily.jpg' },
    { name: "Eddy's Epic Summer", date: 'July 2025', avatar: '/mascot/Falstaff_current.png' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="quest-page-layout">
        <div className="quest-main-container">
          
          {/* LEFT COLUMN: Quests Progress & Lists */}
          <div>
            {/* Monthly Banner matching references */}
            <div className="quest-banner-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="quest-banner-subtitle">July Quest</p>
                  <h2 className="quest-banner-title">Complete 20 quests</h2>
                  <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '8px', fontWeight: 800 }}>⏳ 21 DAYS REMAINING</p>
                </div>
                <div>
                  <img 
                    src="/icons/treasure-chest.png" 
                    alt="Gold Chest" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <div className="quest-progress-bar">
                  <div className="quest-progress-fill" style={{ width: `${monthlyProgressPercent}%` }} />
                </div>
                <div 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--color-blue)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {username[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 900 }}>{monthlyCompleted} / {monthlyTotal}</span>
              </div>
            </div>

            {/* Daily Quests Title */}
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Daily Quests</h3>

            {/* Quest 1: Earn 10 XP */}
            <div className="quest-row-item">
              <div style={{ color: 'var(--color-orange)', backgroundColor: 'var(--color-orange-light)', padding: '10px', borderRadius: '12px' }}>
                <Zap size={24} fill="currentColor" stroke="none" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Earn 10 XP</h4>
                  {dailyXpProgress >= dailyXpGoal && (
                    <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 900 }}>✓ COMPLETE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="quest-progress-bar">
                    <div className="quest-progress-fill" style={{ width: `${dailyXpPercent}%`, backgroundColor: 'var(--color-orange)' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px' }}>{dailyXpProgress}/{dailyXpGoal}</span>
                </div>
              </div>
              {dailyXpProgress >= dailyXpGoal && (
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold-light)',
                  border: '2px solid var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🎁
                </div>
              )}
            </div>

            {/* Quest 2: Combo Bonus XP */}
            <div className="quest-row-item">
              <div style={{ color: 'var(--color-gold)', backgroundColor: 'var(--color-gold-light)', padding: '10px', borderRadius: '12px' }}>
                <Zap size={24} fill="currentColor" stroke="none" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Earn 10 Combo Bonus XP</h4>
                  {comboProgress >= comboGoal && (
                    <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 900 }}>✓ COMPLETE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="quest-progress-bar">
                    <div className="quest-progress-fill" style={{ width: `${comboPercent}%`, backgroundColor: 'var(--color-gold)' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px' }}>{comboProgress}/{comboGoal}</span>
                </div>
              </div>
              {comboProgress >= comboGoal && (
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold-light)',
                  border: '2px solid var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🎁
                </div>
              )}
            </div>

            {/* Quest 3: Listen Exercises */}
            <div className="quest-row-item">
              <div style={{ color: 'var(--color-blue)', backgroundColor: 'var(--color-blue-light)', padding: '10px', borderRadius: '12px' }}>
                <Volume2 size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Listen to 7 exercises</h4>
                  {listeningProgress >= listeningGoal && (
                    <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 900 }}>✓ COMPLETE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="quest-progress-bar">
                    <div className="quest-progress-fill" style={{ width: `${listeningPercent}%`, backgroundColor: 'var(--color-blue)' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px' }}>{listeningProgress}/{listeningGoal}</span>
                </div>
              </div>
              {listeningProgress >= listeningGoal && (
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold-light)',
                  border: '2px solid var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🎁
                </div>
              )}
            </div>

            {/* Quest 4: Streak quest */}
            <div className="quest-row-item">
              <div style={{ color: 'var(--color-orange)', backgroundColor: 'var(--color-orange-light)', padding: '10px', borderRadius: '12px' }}>
                <Star size={24} fill="currentColor" stroke="none" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Reach a 3-day streak</h4>
                  {streak >= 3 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 900 }}>✓ COMPLETE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="quest-progress-bar">
                    <div className="quest-progress-fill" style={{ width: `${Math.min(100, (streak / 3) * 100)}%`, backgroundColor: 'var(--color-orange)' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px' }}>{Math.min(streak, 3)}/3</span>
                </div>
              </div>
              {streak >= 3 && (
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold-light)',
                  border: '2px solid var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🎁
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Monthly Badges */}
          <div>
            <div style={{ border: '2px solid var(--border-color)', borderBottom: '4px solid var(--border-color)', borderRadius: '16px', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900 }}>Monthly Badges</h4>
                <span style={{ fontSize: '12px', color: 'var(--color-blue)', fontWeight: 800, cursor: 'pointer' }}>VIEW ALL</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {monthlyBadges.map((badge) => (
                  <div key={badge.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '50%', 
                        overflow: 'hidden', 
                        backgroundColor: 'var(--bg-primary)',
                        border: '2px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <img 
                        src={badge.avatar} 
                        alt={badge.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900 }}>{badge.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{badge.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Shield Card */}
            <div style={{ 
              border: '2px solid var(--border-color)', 
              borderBottom: '4px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '20px', 
              backgroundColor: 'var(--bg-secondary)',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '36px' }}>🛡️</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, marginBottom: '4px' }}>Streak Shield</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {streak > 0 
                      ? `${streak} day streak active! Keep going!`
                      : 'Complete a lesson to start your streak!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

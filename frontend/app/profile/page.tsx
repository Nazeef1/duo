'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { ProfileResponse } from '@/lib/types';
import TopBar from '@/components/ui/TopBar';
import { Flame, Zap, Gem, Award, Calendar, Target } from 'lucide-react';

// Color palette for avatar backgrounds
const AVATAR_COLORS = [
  '#ff4b4b', '#ff9600', '#58cc02', '#1cb0f6', '#a560e8',
  '#ff6b6b', '#ffd700', '#00b4d8', '#7b2d8b', '#e63946'
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProfilePage() {
  const { fetchUser, updateDailyGoal, updateUsername } = useUserStore();
  
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form states
  const [usernameInput, setUsernameInput] = useState('');
  const [dailyGoalInput, setDailyGoalInput] = useState(30);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
        setUsernameInput(data.username);
        setDailyGoalInput(data.daily_xp_goal);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      const updated = await api.updateProfile({
        username: usernameInput,
        daily_xp_goal: dailyGoalInput
      });
      setProfile(updated);
      updateUsername(updated.username);
      updateDailyGoal(updated.daily_xp_goal);
      
      // Update global user store stats
      fetchUser();
      
      setSuccessMsg(true);
      setEditMode(false);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: 'var(--text-muted)' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
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

  const avatarColor = getAvatarColor(profile.username);
  const joinedDate = new Date(profile.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  const allAchievements = [
    {
      code: 'first_lesson',
      name: 'First Steps',
      desc: 'Completed your very first lesson.',
      emoji: '🌱'
    },
    {
      code: 'perfect_lesson',
      name: 'Perfect Master',
      desc: 'Completed a lesson with zero mistakes.',
      emoji: '⭐'
    },
    {
      code: 'streak_7',
      name: 'Seven Day Legend',
      desc: 'Achieved a streak of 7 active days.',
      emoji: '🔥'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div style={{ display: 'flex', flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        
        {/* Profile layout: Two Columns */}
        <div style={{ display: 'flex', gap: '48px', width: '100%' }}>
          
          {/* LEFT COLUMN: Profile info, stats, and achievements */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* Profile banner card */}
            <div style={{ position: 'relative', marginBottom: '80px' }}>
              <div style={{
                height: '200px',
                backgroundColor: '#dcb8ff', /* Purple solid banner */
                borderRadius: '16px',
                position: 'relative'
              }}>
                {/* Edit profile button */}
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'white',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <img src="/icons/pencil.png" alt="Edit" style={{ width: '16px', height: '16px', filter: 'grayscale(100%)' }} />
                </button>
              </div>
              
              {/* Overlapping circular avatar */}
              <div style={{
                position: 'absolute',
                bottom: '-60px',
                left: '24px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: avatarColor,
                border: '4px solid var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                fontWeight: 900,
                color: 'white',
                overflow: 'hidden'
              }}>
                {profile.username[0].toUpperCase()}
              </div>
            </div>

            {/* Profile user details */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '8px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '2px', color: 'var(--text-dark)' }}>
                  {profile.username}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                  @{profile.username}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} />
                  <span>Joined {joinedDate}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '15px', fontWeight: 800 }}>
                  <span style={{ color: 'var(--color-blue)', cursor: 'pointer' }}>5 Following</span>
                  <span style={{ color: 'var(--color-blue)', cursor: 'pointer' }}>14 Followers</span>
                </div>
              </div>
              
              {/* Flag image */}
              <div>
                <img src="/icons/spain.png" alt="Spanish Flag" style={{ width: '28px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Profile editing form */}
            {editMode && (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-color)', borderBottom: '4px solid var(--border-color)', borderRadius: '16px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Edit Profile Settings</h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Username</label>
                    <input 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-dark)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Daily Goal (XP)</label>
                    <select 
                      value={dailyGoalInput}
                      onChange={(e) => setDailyGoalInput(Number(e.target.value))}
                      className="form-input"
                      style={{ width: '100%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-dark)' }}
                    >
                      <option value={10}>Casual (10 XP)</option>
                      <option value={20}>Regular (20 XP)</option>
                      <option value={30}>Serious (30 XP)</option>
                      <option value={50}>Intense (50 XP)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="submit" className="btn-3d btn-green" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-3d btn-gray" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </div>
                  {successMsg && <div style={{ color: 'var(--color-green)', fontWeight: 800 }}>Profile updated successfully!</div>}
                </form>
              </div>
            )}

            {/* LinkedIn Score Share Card */}
            <div 
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                border: '2px solid var(--border-color)',
                borderBottom: '5px solid var(--border-color)',
                borderRadius: '16px', 
                padding: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '32px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '16px' }}>
                  Add your Duolingo Score<br/>to LinkedIn!
                </h3>
                <button className="btn-3d btn-blue" style={{ padding: '10px 20px', fontSize: '13px', width: '160px' }}>
                  Get Started
                </button>
              </div>
              <div>
                <img src="/mascot/duojump.png?v=5" alt="Duo LinkedIn" style={{ width: '90px', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Statistics */}
            <h3 className="profile-section-title" style={{ fontSize: '22px', fontWeight: 900, marginBottom: '16px' }}>Statistics</h3>
            <div className="profile-grid">
              <div className="profile-stat-box">
                <div className="profile-stat-icon" style={{ color: 'var(--color-orange)' }}>
                  <Flame size={32} fill="currentColor" stroke="none" />
                </div>
                <div>
                  <div className="profile-stat-box-value">{profile.streak}</div>
                  <div className="profile-stat-box-label">Day Streak</div>
                </div>
              </div>

              <div className="profile-stat-box">
                <div className="profile-stat-icon" style={{ color: 'var(--color-gold)' }}>
                  <Zap size={32} fill="currentColor" stroke="none" />
                </div>
                <div>
                  <div className="profile-stat-box-value">{profile.total_xp}</div>
                  <div className="profile-stat-box-label">Total XP</div>
                </div>
              </div>

              <div className="profile-stat-box">
                <div className="profile-stat-icon" style={{ color: 'var(--color-blue)' }}>
                  <Gem size={32} fill="currentColor" stroke="none" />
                </div>
                <div>
                  <div className="profile-stat-box-value">{profile.gems}</div>
                  <div className="profile-stat-box-label">Gems</div>
                </div>
              </div>

              <div className="profile-stat-box">
                <div className="profile-stat-icon" style={{ color: 'var(--color-green)' }}>
                  <Award size={32} fill="currentColor" stroke="none" />
                </div>
                <div>
                  <div className="profile-stat-box-value">{profile.skills_completed}</div>
                  <div className="profile-stat-box-label">Skills Completed</div>
                </div>
              </div>
            </div>

            {/* Daily Goal Status Banner */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px 20px',
                border: '2px solid var(--border-color)',
                borderBottom: '4px solid var(--border-color)',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-secondary)',
                marginBottom: '40px'
              }}
            >
              <Target size={24} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>
                  Daily XP Goal: <span style={{ color: 'var(--color-green)' }}>{profile.daily_xp_goal} XP</span>
                </div>
                <div style={{ 
                  height: '8px', 
                  backgroundColor: 'var(--bg-primary)', 
                  borderRadius: '4px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (profile.total_xp % Math.max(profile.daily_xp_goal, 1) / profile.daily_xp_goal) * 100)}%`,
                    backgroundColor: 'var(--color-green)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Achievements */}
            <h3 className="profile-section-title" style={{ fontSize: '22px', fontWeight: 900, marginBottom: '16px' }}>Achievements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allAchievements.map(item => {
                const isUnlocked = profile.achievements.includes(item.code);
                return (
                  <div 
                    key={item.code} 
                    className="achievement-item"
                    style={{
                      opacity: isUnlocked ? 1 : 0.5,
                      backgroundColor: isUnlocked ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      margin: 0
                    }}
                  >
                    <div 
                      className="achievement-icon"
                      style={{
                        backgroundColor: isUnlocked ? 'var(--color-purple-light)' : 'var(--bg-secondary)',
                        color: isUnlocked ? 'var(--color-purple)' : 'var(--text-muted)',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.emoji}
                    </div>
                    <div className="achievement-info">
                      <h4 className="achievement-name" style={{ color: isUnlocked ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                        {item.name}
                      </h4>
                      <p className="achievement-desc">{item.desc}</p>
                    </div>
                    <div>
                      {isUnlocked ? (
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-green)' }}>
                          ✓ Unlocked
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Followers/Friends list card */}
          <div style={{ width: '360px', flexShrink: 0 }}>
            <div 
              style={{ 
                border: '2px solid var(--border-color)', 
                borderBottom: '5px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '24px', 
                backgroundColor: 'var(--bg-secondary)' 
              }}
            >
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ flex: 1, textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--color-blue)', color: 'var(--color-blue)', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
                  Following
                </div>
                <div style={{ flex: 1, textAlign: 'center', paddingBottom: '12px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
                  Followers
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#58cc02', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>D</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>Duo</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>12,039 XP</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1cb0f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>L</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>Lily</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>8,900 XP</div>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn-3d" 
                style={{ 
                  width: '100%', 
                  marginTop: '24px', 
                  padding: '12px', 
                  fontSize: '13px', 
                  backgroundColor: 'transparent', 
                  color: 'var(--color-blue)', 
                  borderColor: 'var(--border-color)' 
                }}
              >
                Find Friends
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { ProfileResponse } from '@/lib/types';
import TopBar from '@/components/ui/TopBar';
import { Flame, Zap, Gem, Award, ShieldAlert, Check } from 'lucide-react';

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
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
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

  const allAchievements = [
    {
      code: 'first_lesson',
      name: 'First Steps',
      desc: 'Completed your very first lesson.'
    },
    {
      code: 'perfect_lesson',
      name: 'Perfect Master',
      desc: 'Completed a lesson with zero mistakes.'
    },
    {
      code: 'streak_7',
      name: 'Seven Day Legend',
      desc: 'Achieved a streak of 7 active days.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      
      <div className="profile-layout">
        {/* Profile Card Header */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {profile.username[0]}
          </div>
          <div className="profile-info-content">
            <h2 className="profile-name">{profile.username}</h2>
            <p className="profile-joined">
              Joined {new Date(profile.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <h3 className="profile-section-title">Statistics</h3>
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
            <div className="profile-stat-icon" style={{ color: 'var(--color-orange)' }}>
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
            <div className="profile-stat-icon" style={{ color: 'var(--color-gold)' }}>
              <Award size={32} fill="currentColor" stroke="none" />
            </div>
            <div>
              <div className="profile-stat-box-value">{profile.skills_completed}</div>
              <div className="profile-stat-box-label">Skills Completed</div>
            </div>
          </div>
        </div>

        {/* Profile Settings adjustment */}
        <h3 className="profile-section-title">Edit Goals</h3>
        <form onSubmit={handleSaveProfile} className="edit-goal-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="form-input"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Daily XP Goal</label>
            <select
              value={dailyGoalInput}
              onChange={(e) => setDailyGoalInput(parseInt(e.target.value))}
              className="form-input"
              style={{ background: 'white' }}
            >
              <option value={10}>10 XP (Casual)</option>
              <option value={30}>30 XP (Regular)</option>
              <option value={50}>50 XP (Serious)</option>
              <option value={100}>100 XP (Insane)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <button 
              type="submit" 
              disabled={saving}
              className="btn-3d btn-green"
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            {successMsg && (
              <span style={{ color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 800 }}>
                <Check size={16} /> Saved successfully!
              </span>
            )}
          </div>
        </form>

        {/* Achievements list */}
        <h3 className="profile-section-title">Achievements</h3>
        <div>
          {allAchievements.map(item => {
            const isUnlocked = profile.achievements.includes(item.code);
            return (
              <div 
                key={item.code} 
                className="achievement-item"
                style={{
                  opacity: isUnlocked ? 1 : 0.5,
                  backgroundColor: isUnlocked ? 'white' : 'var(--bg-secondary)',
                }}
              >
                <div 
                  className="achievement-icon"
                  style={{
                    backgroundColor: isUnlocked ? 'var(--color-purple-light)' : '#e5e5e5',
                    color: isUnlocked ? 'var(--color-purple)' : 'var(--text-muted)'
                  }}
                >
                  <Award size={24} />
                </div>
                <div className="achievement-info">
                  <h4 className="achievement-name" style={{ color: isUnlocked ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                    {item.name}
                  </h4>
                  <p className="achievement-desc">{item.desc}</p>
                </div>
                <div>
                  {isUnlocked ? (
                    <span className="achievement-status" style={{ fontSize: '13px', fontWeight: 800 }}>
                      Unlocked
                    </span>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/ui/TopBar';

export default function SettingsPage() {
  const {
    soundEffectsEnabled,
    animationsEnabled,
    motivationalMessagesEnabled,
    theme,
    setSoundEffects,
    setAnimations,
    setMotivationalMessages,
    setTheme,
    loadPreferences,
  } = useUserStore();

  const [listeningExercisesEnabled, setListeningExercisesEnabled] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const accountTabs = [
    { name: 'Account', active: false },
    { name: 'Preferences', active: true },
    { name: 'Profile', active: false },
    { name: 'Notifications', active: false },
    { name: 'Courses', active: false },
    { name: 'Score on LinkedIn', active: false },
    { name: 'Duolingo for Schools', active: false },
    { name: 'Social accounts', active: false },
    { name: 'Privacy settings', active: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="quest-page-layout">
        <div className="quest-main-container">
          
          {/* LEFT COLUMN: Preferences Forms */}
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>Preferences</h2>
            
            {/* Lesson Experience Toggles */}
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Lesson experience
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              {/* Sound Effects */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Sound effects</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={soundEffectsEnabled} 
                    onChange={(e) => setSoundEffects(e.target.checked)} 
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Animations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Animations</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={animationsEnabled} 
                    onChange={(e) => setAnimations(e.target.checked)} 
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Motivational Messages */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Motivational messages</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={motivationalMessagesEnabled} 
                    onChange={(e) => setMotivationalMessages(e.target.checked)} 
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Listening Exercises */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Listening exercises</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={listeningExercisesEnabled} 
                    onChange={(e) => setListeningExercisesEnabled(e.target.checked)} 
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            {/* Appearance settings */}
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Appearance
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Dark mode</span>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="form-input"
                style={{ 
                  width: '100%', 
                  maxWidth: '300px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '2px solid var(--border-color)',
                  color: 'var(--text-dark)',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <option value="system">SYSTEM DEFAULT</option>
                <option value="light">LIGHT</option>
                <option value="dark">DARK</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: Account settings sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '12px', backgroundColor: 'var(--bg-secondary)' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {accountTabs.map((tab) => (
                  <li key={tab.name}>
                    <button 
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '10px 16px', 
                        borderRadius: '12px',
                        border: 'none',
                        background: tab.active ? 'var(--bg-primary)' : 'none',
                        color: tab.active ? 'var(--color-blue)' : 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                      onClick={() => {
                        if (!tab.active) alert(`${tab.name} settings module initialized.`);
                      }}
                    >
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscription Box */}
            <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>Subscription</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>Manage your plan or upgrade to Super.</p>
              <button 
                className="btn-3d btn-green" 
                style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                onClick={() => alert("Redirecting to purchase page...")}
              >
                Choose a plan
              </button>
            </div>

            {/* Support Box */}
            <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>Support</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Need help? Browse our FAQ sections.</p>
              <button 
                className="btn-3d btn-gray" 
                style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                onClick={() => alert("Opening Help Desk portal...")}
              >
                Visit Help Center
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

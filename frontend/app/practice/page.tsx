'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { Heart, PlusCircle, Headphones, AlertTriangle } from 'lucide-react';

export default function PracticeHubPage() {
  const { xp, dailyGoal, fetchUser, streak, gems, hearts, refillHearts, username } = useUserStore();
  const [refilling, setRefilling] = useState(false);
  const [flagHovered, setFlagHovered] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRefill = async () => {
    if (gems < 350) {
      alert("You need at least 350 gems to refill hearts!");
      return;
    }
    const confirmRefill = window.confirm("Refill hearts for 350 gems?");
    if (!confirmRefill) return;

    setRefilling(true);
    try {
      await refillHearts();
    } catch (err) {
      console.error(err);
    } finally {
      setRefilling(false);
    }
  };

  const dailyProgressPercent = Math.min(100, (xp / dailyGoal) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Solid mask overlay to hide scrolled elements in the top 24px margin */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '24px', 
          backgroundColor: 'var(--bg-primary)', 
          zIndex: 85 
        }} 
      />

      <div style={{ display: 'flex', flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        
        {/* LEFT COLUMN: Practice Hub Content */}
        <div className="path-layout" style={{ position: 'relative', flex: 1, paddingTop: '24px', paddingRight: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Section 1: Today's Review */}
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-dark)' }}>
                Today's Review
              </h3>
              
              {/* Target Practice Card */}
              <div 
                style={{ 
                  borderRadius: '20px', 
                  padding: '32px', 
                  background: 'linear-gradient(135deg, #101F30 0%, #201E3C 100%)',
                  border: '2px solid var(--border-color)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <span 
                    style={{ 
                      background: 'linear-gradient(90deg, #ff007f 0%, #7f00ff 100%)',
                      color: '#ffffff', 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      display: 'inline-block',
                      marginBottom: '16px'
                    }}
                  >
                    Super
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0' }}>
                    Target Practice
                  </h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, margin: '0 0 24px 0', lineHeight: '1.4' }}>
                    Tackle weak areas with this customized session
                  </p>
                  <Link 
                    href="/lesson/1?isPractice=true"
                    className="btn-3d"
                    style={{ 
                      padding: '12px 32px', 
                      fontSize: '14px', 
                      backgroundColor: '#ffffff', 
                      color: '#1a1a1a',
                      border: 'none',
                      borderBottom: '4px solid #d9d9d9',
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Start Practice
                  </Link>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src="/mascot/duostrong.gif" 
                    alt="Target Practice Mascot" 
                    style={{ width: '130px', height: '130px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Conversation */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-dark)' }}>
                Conversation
              </h3>
              
              {/* Listen Card */}
              <div 
                style={{ 
                  borderRadius: '20px', 
                  padding: '24px', 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>Listen</h4>
                    <span 
                      style={{ 
                        background: 'linear-gradient(90deg, #ff007f 0%, #7f00ff 100%)',
                        color: '#ffffff', 
                        fontSize: '9px', 
                        fontWeight: 900, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Super
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 16px 0' }}>
                    Boost your listening skills with an audio-only session
                  </p>
                  <Link 
                    href="/lesson/2?isPractice=true"
                    className="btn-3d btn-blue"
                    style={{ 
                      padding: '8px 24px', 
                      fontSize: '12px', 
                      borderRadius: '10px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Start Session
                  </Link>
                </div>
                <div style={{ color: '#ff007f', backgroundColor: 'rgba(255, 0, 127, 0.1)', padding: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Headphones size={44} />
                </div>
              </div>
            </div>

            {/* Section 3: Your Collections */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-dark)' }}>
                Your collections
              </h3>
              
              {/* Mistakes Card */}
              <div 
                style={{ 
                  borderRadius: '20px', 
                  padding: '24px', 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>Mistakes</h4>
                    <span 
                      style={{ 
                        background: 'linear-gradient(90deg, #ff007f 0%, #7f00ff 100%)',
                        color: '#ffffff', 
                        fontSize: '9px', 
                        fontWeight: 900, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Super
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 16px 0' }}>
                    Review and correct your past errors
                  </p>
                  <Link 
                    href="/lesson/3?isPractice=true"
                    className="btn-3d btn-green"
                    style={{ 
                      padding: '8px 24px', 
                      fontSize: '12px', 
                      borderRadius: '10px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Start Review
                  </Link>
                </div>
                <div style={{ color: 'var(--color-orange)', backgroundColor: 'var(--color-orange-light)', padding: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={44} />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar Stats & Cards */}
          <div className="right-sidebar" style={{ zIndex: 90, alignSelf: 'flex-start' }}>
            
            {/* Stats row at the top */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px 8px 8px', marginBottom: '12px' }}>
              {/* Language Flag with hover courses dropdown */}
              <div 
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}
                onMouseEnter={() => setFlagHovered(true)}
                onMouseLeave={() => setFlagHovered(false)}
              >
                <img 
                  src="/icons/spanish.svg" 
                  alt="Spanish" 
                  style={{ width: '32px', height: '24px', borderRadius: '4px', objectFit: 'contain', cursor: 'pointer' }} 
                />

                {flagHovered && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '2px solid var(--border-color)',
                      borderBottom: '5px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '16px',
                      width: '220px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left' }}>
                      My Courses
                    </span>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        backgroundColor: 'rgba(28, 176, 246, 0.1)',
                        border: '2px solid #1cb0f6',
                        borderRadius: '12px',
                        cursor: 'default'
                      }}
                    >
                      <img 
                        src="/icons/spanish.svg" 
                        alt="Spanish" 
                        style={{ width: '28px', height: '22px', borderRadius: '4px', objectFit: 'contain' }} 
                      />
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1cb0f6' }}>Spanish</span>
                    </div>
                    <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '8px' }}>
                      <button 
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                        onClick={() => alert("More courses coming soon!")}
                      >
                        <span>+</span>
                        <span>Add a new course</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Streak */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-orange)' }}>
                <img 
                  src="/icons/fire.svg" 
                  alt="Streak" 
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
                />
                <span style={{ fontSize: '18px', fontWeight: 900 }}>{streak}</span>
              </div>

              {/* Gems */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-blue)' }}>
                <img 
                  src="/icons/gems.svg" 
                  alt="Gems" 
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
                />
                <span style={{ fontSize: '18px', fontWeight: 900 }}>{gems}</span>
              </div>

              {/* Hearts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-red)' }}>
                <Heart size={24} fill="var(--color-red)" stroke="none" />
                <span style={{ fontSize: '18px', fontWeight: 900 }}>{hearts}</span>
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

            {/* 1. Super Duolingo Card */}
            <div 
              style={{ 
                border: '2px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '24px', 
                background: 'linear-gradient(135deg, #a560e8 0%, #7622c8 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(165, 96, 232, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      color: '#7622c8', 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      padding: '3px 10px', 
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
                  >
                    Super
                  </span>
                  <h4 style={{ fontSize: '18px', fontWeight: 900, marginTop: '12px', color: '#ffffff', margin: '8px 0 0 0' }}>Try Super for free</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginTop: '6px', lineHeight: '1.4' }}>
                    No ads, personalized practice, and unlimited Legendary!
                  </p>
                </div>
                <div style={{ transform: 'rotate(-5deg)', marginLeft: '8px' }}>
                  <img 
                    src="/mascot/duosword.png" 
                    alt="Super Duo" 
                    style={{ width: '78px', height: '78px', objectFit: 'contain' }} 
                  />
                </div>
              </div>
              <button 
                className="btn-3d" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '14px', 
                  backgroundColor: '#ffffff', 
                  color: '#7622c8',
                  border: 'none',
                  borderBottom: '4px solid #e5e5e5',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
                onClick={() => alert("Super Duolingo Trial Activated!")}
              >
                Try 1 Week Free
              </button>
            </div>

            {/* 2. Bronze League Rank Card */}
            <div 
              style={{ 
                border: '2px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '24px', 
                background: 'linear-gradient(135deg, #ff8a00 0%, #da1b60 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(218, 27, 96, 0.25)' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Bronze League</h4>
                <Link href="/leaderboard" style={{ fontSize: '12px', color: '#ffffff', fontWeight: 900, textDecoration: 'none', borderBottom: '1px dashed rgba(255,255,255,0.8)', opacity: 0.9 }}>VIEW LEAGUE</Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>🥉</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900 }}>
                    You're ranked <span style={{ color: '#ffffff', textDecoration: 'underline' }}>#5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginTop: '4px' }}>
                    🎉 You are in the promotion zone!
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Daily Quests Card */}
            <div 
              style={{ 
                border: '2px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '24px', 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(17, 153, 142, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Daily Quests</h4>
                <Link href="/quests" style={{ fontSize: '12px', color: '#ffffff', fontWeight: 900, textDecoration: 'none', borderBottom: '1px dashed rgba(255,255,255,0.8)', opacity: 0.9 }}>VIEW ALL</Link>
              </div>
              
              {/* Quest 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src="/icons/fire.svg" 
                  alt="Streak Icon" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Earn {dailyGoal} XP</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div className="progress-bar-container" style={{ height: '8px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                      <div className="progress-bar-fill" style={{ width: `${dailyProgressPercent}%`, backgroundColor: '#ffc800' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 800 }}>{xp}/{dailyGoal}</span>
                  </div>
                </div>
              </div>

              {/* Quest 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px', lineHeight: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>⏱️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Spend 15 minutes learning</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div className="progress-bar-container" style={{ height: '8px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                      <div className="progress-bar-fill" style={{ width: '66%', backgroundColor: '#1cb0f6' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 800 }}>10/15</span>
                  </div>
                </div>
              </div>

              {/* Quest 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px', lineHeight: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>⚡</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Get 5 correct in a row</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div className="progress-bar-container" style={{ height: '8px', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                      <div className="progress-bar-fill" style={{ width: '60%', backgroundColor: '#ff9600' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 800 }}>3/5</span>
                  </div>
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

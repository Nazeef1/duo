'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CoursePath, LeaderboardEntry } from '@/lib/types';
import { useUserStore } from '@/store/useUserStore';
import UnitHeader from '@/components/path/UnitHeader';
import SkillNode from '@/components/path/SkillNode';
import { Heart, PlusCircle } from 'lucide-react';

export default function LearnPage() {
  const [pathData, setPathData] = useState<CoursePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  
  // Hoisted popover state: only one node popover can be open at a time
  const [activePopoverIndex, setActivePopoverIndex] = useState<number | null>(null);
  const [lilyBubbleOpen, setLilyBubbleOpen] = useState(false);
  const [duoBubbleOpen, setDuoBubbleOpen] = useState(false);
  const [flagHovered, setFlagHovered] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.skill-node-wrapper') && !target.closest('.skill-popover')) {
        setActivePopoverIndex(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const { xp, dailyGoal, fetchUser, streak, gems, hearts, refillHearts, username } = useUserStore();
  const [refilling, setRefilling] = useState(false);

  useEffect(() => {
    fetchUser();
    
    const fetchPath = async () => {
      try {
        const data = await api.getCoursePath(1); // Spanish
        setPathData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load learning path');
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setLeaderboardEntries(data);
      } catch {
        // Non-critical, ignore leaderboard fetch errors
      }
    };

    fetchPath();
    fetchLeaderboard();
  }, [fetchUser]);

  const handleRefill = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (hearts >= 5) {
      alert("Hearts are already full!");
      return;
    }
    if (gems < 350) {
      alert("Insufficient gems! You need 350 gems to refill hearts.");
      return;
    }
    if (window.confirm("Spend 350 gems to refill hearts?")) {
      setRefilling(true);
      try {
        await refillHearts();
        alert("Hearts refilled successfully!");
      } catch (err: any) {
        alert(err.message || "Failed to refill hearts");
      } finally {
        setRefilling(false);
      }
    }
  };

  // Calculate daily goal progress
  const dailyProgressPercent = Math.min(100, Math.round((xp / dailyGoal) * 100));

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: 'var(--text-muted)' }}>
        Loading your learning path...
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--color-red)', fontWeight: 800, fontSize: '18px' }}>
          Error loading path: {error}
        </div>
        <button onClick={() => window.location.reload()} className="btn-3d btn-blue">
          Retry
        </button>
      </div>
    );
  }

  // Winding pattern index counter
  let flatIndex = 0;

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
        
        {/* Winding Path Area */}
        <div className="path-layout" style={{ position: 'relative', flex: 1, paddingTop: '24px' }}>
          {pathData.units.map((unit, unitIdx) => {
            return (
              <div key={unit.id} style={{ marginBottom: '56px', position: 'relative' }}>
                {/* Sticky Unit Header */}
                <UnitHeader title={unit.title} index={unitIdx} />
                
                <div className="skill-path-container" style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Skill Node Sequence with interspersed Chest and Trophy Cup */}
                  {unit.skills.map((skill, skillIdx) => {
                    const nodesToRender = [];
                    const currentIdx = flatIndex;
                    flatIndex += 1;

                    // Zig-zag pattern logic - Widen swings to 150px for a more pronounced curve
                    const pattern = [0, -75, -150, -75, 0, 75, 150, 75];
                    const offset = pattern[currentIdx % pattern.length];
 
                    // Render primary Skill Node
                    nodesToRender.push(
                      <div key={`skill-wrapper-${skill.id}`} style={{ position: 'relative', transform: `translateX(${offset}px)`, zIndex: activePopoverIndex === currentIdx ? 99 : 1 }}>
                        {/* 1. Animated mascot Lily clapping GIF next to Unit 1, Skill 2 (right side empty space - midway) */}
                        {unitIdx === 0 && skillIdx === 1 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLilyBubbleOpen(!lilyBubbleOpen);
                              setDuoBubbleOpen(false);
                            }}
                            style={{ 
                              position: 'absolute', 
                              right: '-195px', 
                              top: '-30px', 
                              zIndex: 15, 
                              width: '190px', 
                              height: '190px', 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src="/mascot/claplyn.gif" 
                              alt="Lily Clapping" 
                              style={{ width: '165px', height: '165px', objectFit: 'contain' }} 
                            />
                            {lilyBubbleOpen && (
                              <div style={{
                                position: 'absolute',
                                bottom: '165px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '2px solid var(--border-color)',
                                borderBottom: '4px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                width: '160px',
                                fontSize: '13px',
                                fontWeight: 800,
                                zIndex: 100,
                                color: 'var(--text-dark)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }}>
                                Ugh, a lesson. If you must... 🙄
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-8px',
                                  left: '50%',
                                  transform: 'translateX(-50%) rotate(45deg)',
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderRight: '2px solid var(--border-color)',
                                  borderBottom: '2px solid var(--border-color)'
                                }} />
                              </div>
                            )}
                          </div>
                        )}
 
                        {/* 2. Animated Flexing Duo GIF next to Unit 2, Skill 2 (left side empty space - midway) */}
                        {unitIdx === 1 && skillIdx === 1 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuoBubbleOpen(!duoBubbleOpen);
                              setLilyBubbleOpen(false);
                            }}
                            style={{ 
                              position: 'absolute', 
                              left: '-240px', 
                              top: '-30px', 
                              zIndex: 15, 
                              width: '190px', 
                              height: '190px', 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src="/mascot/duostrong.gif" 
                              alt="Strong Duo" 
                              style={{ width: '165px', height: '165px', objectFit: 'contain' }} 
                            />
                            {duoBubbleOpen && (
                              <div style={{
                                position: 'absolute',
                                bottom: '165px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '2px solid var(--border-color)',
                                borderBottom: '4px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                width: '160px',
                                fontSize: '13px',
                                fontWeight: 800,
                                zIndex: 100,
                                color: 'var(--text-dark)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }}>
                                You're doing great! Keep it up! 🦉💪
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-8px',
                                  left: '50%',
                                  transform: 'translateX(-50%) rotate(45deg)',
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderRight: '2px solid var(--border-color)',
                                  borderBottom: '2px solid var(--border-color)'
                                }} />
                              </div>
                            )}
                          </div>
                        )}

                        <SkillNode 
                          skill={skill} 
                          index={currentIdx} 
                          type="skill"
                          activePopoverIndex={activePopoverIndex}
                          setActivePopoverIndex={setActivePopoverIndex}
                          themeColor={unitIdx === 0 ? '#1cb0f6' : '#a560e8'}
                        />
                      </div>
                    );

                    // Insert Chest Node after appropriate intervals (e.g. 2nd skill node in Unit 1)
                    if (unitIdx === 0 && skillIdx === 1) {
                      const chestIdx = flatIndex;
                      flatIndex += 1;
                      const chestOffset = pattern[chestIdx % pattern.length];
                      nodesToRender.push(
                        <div key={`chest-wrapper-1`} style={{ position: 'relative', transform: `translateX(${chestOffset}px)`, zIndex: activePopoverIndex === chestIdx ? 99 : 1 }}>
                          <SkillNode
                            key={`chest-unit1`}
                            index={chestIdx}
                            type="chest"
                            chestId="chest_unit1"
                            isLocked={skill.status !== 'completed'}
                            activePopoverIndex={activePopoverIndex}
                            setActivePopoverIndex={setActivePopoverIndex}
                            themeColor="#1cb0f6"
                          />
                        </div>
                      );
                    } else if (unitIdx === 1 && skillIdx === 0) {
                      const chestIdx = flatIndex;
                      flatIndex += 1;
                      const chestOffset = pattern[chestIdx % pattern.length];
                      nodesToRender.push(
                        <div key={`chest-wrapper-2`} style={{ position: 'relative', transform: `translateX(${chestOffset}px)`, zIndex: activePopoverIndex === chestIdx ? 99 : 1 }}>
                          <SkillNode
                            key={`chest-unit2`}
                            index={chestIdx}
                            type="chest"
                            chestId="chest_unit2"
                            isLocked={skill.status !== 'completed'}
                            activePopoverIndex={activePopoverIndex}
                            setActivePopoverIndex={setActivePopoverIndex}
                            themeColor="#a560e8"
                          />
                        </div>
                      );
                    }

                    // Insert Unit Cup Trophy at the end of the unit
                    if (skillIdx === unit.skills.length - 1) {
                      const trophyIdx = flatIndex;
                      flatIndex += 1;
                      const trophyOffset = pattern[trophyIdx % pattern.length];
                      nodesToRender.push(
                        <div key={`trophy-wrapper-unit-${unit.id}`} style={{ position: 'relative', transform: `translateX(${trophyOffset}px)`, zIndex: activePopoverIndex === trophyIdx ? 99 : 1 }}>
                          <SkillNode
                            key={`trophy-unit-${unit.id}`}
                            index={trophyIdx}
                            type="trophy"
                            isLocked={skill.status !== 'completed'}
                            activePopoverIndex={activePopoverIndex}
                            setActivePopoverIndex={setActivePopoverIndex}
                            themeColor={unitIdx === 0 ? '#1cb0f6' : '#a560e8'}
                          />
                        </div>
                      );
                    }

                    return nodesToRender;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Right Sidebar Widget Panels */}
        <div className="right-sidebar">
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
          {(() => {
            const currentEntry = leaderboardEntries.find(e => e.username === username || e.username === 'learner');
            const myRank = currentEntry?.rank ?? leaderboardEntries.length;
            const total = leaderboardEntries.length;
            const promotionZone = Math.ceil(total * 0.3);
            const ranksToPromotion = Math.max(0, myRank - promotionZone);
            return (
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
                      You're ranked <span style={{ color: '#ffffff', textDecoration: 'underline' }}>#{myRank}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginTop: '4px' }}>
                      {ranksToPromotion > 0 
                        ? `${ranksToPromotion} ranks away from promotion!`
                        : '🎉 You are in the promotion zone!'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
            
            {/* Quest 1: XP Quest */}
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

            {/* Quest 2: Time Quest */}
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

            {/* Quest 3: Streak Quest */}
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

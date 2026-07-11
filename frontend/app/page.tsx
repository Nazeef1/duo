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
    setRefilling(true);
    await refillHearts();
    setRefilling(false);
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
      <div style={{ display: 'flex', flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        
        {/* Winding Path Area */}
        <div className="path-layout" style={{ position: 'relative', flex: 1 }}>
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

                    // Zig-zag pattern logic - Widen swings to 120px for a more pronounced curve
                    const pattern = [0, -60, -120, -60, 0, 60, 120, 60];
                    const offset = pattern[currentIdx % pattern.length];

                    // Render primary Skill Node
                    nodesToRender.push(
                      <div key={`skill-wrapper-${skill.id}`} style={{ position: 'relative', transform: `translateX(${offset}px)`, zIndex: activePopoverIndex === currentIdx ? 99 : 1 }}>
                        {/* 1. Animated mascot Lily clapping GIF next to Unit 1, Skill 1 (right side empty space) */}
                        {unitIdx === 0 && skillIdx === 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLilyBubbleOpen(!lilyBubbleOpen);
                              setDuoBubbleOpen(false);
                            }}
                            style={{ 
                              position: 'absolute', 
                              right: '-180px', 
                              top: '-20px', 
                              zIndex: 15, 
                              width: '150px', 
                              height: '150px', 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src="/mascot/claplyn.gif" 
                              alt="Lily Clapping" 
                              style={{ width: '130px', height: '130px', objectFit: 'contain' }} 
                            />
                            {lilyBubbleOpen && (
                              <div style={{
                                position: 'absolute',
                                bottom: '130px',
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

                        {/* 2. Animated Flexing Duo GIF next to Unit 2, Skill 1 (left side empty space) */}
                        {unitIdx === 1 && skillIdx === 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuoBubbleOpen(!duoBubbleOpen);
                              setLilyBubbleOpen(false);
                            }}
                            style={{ 
                              position: 'absolute', 
                              left: '-180px', 
                              top: '-20px', 
                              zIndex: 15, 
                              width: '150px', 
                              height: '150px', 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src="/mascot/duostrong.gif" 
                              alt="Strong Duo" 
                              style={{ width: '130px', height: '130px', objectFit: 'contain' }} 
                            />
                            {duoBubbleOpen && (
                              <div style={{
                                position: 'absolute',
                                bottom: '130px',
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
        <div className="right-sidebar" style={{ top: '24px', height: 'calc(100vh - 48px)' }}>
          {/* Stats row at the top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '8px' }}>
            {/* Language Flag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
              <img 
                src="/icons/spain.png" 
                alt="Spanish" 
                style={{ width: '28px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} 
              />
            </div>

            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-orange)' }}>
              <img 
                src="/icons/fire.png" 
                alt="Streak" 
                style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
              />
              <span style={{ fontSize: '16px', fontWeight: 900 }}>{streak}</span>
            </div>

            {/* Gems */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-blue)' }}>
              <img 
                src="/icons/gem.png" 
                alt="Gems" 
                style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
              />
              <span style={{ fontSize: '16px', fontWeight: 900 }}>{gems}</span>
            </div>

            {/* Hearts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-red)' }}>
              <Heart size={20} fill="var(--color-red)" stroke="none" />
              <span style={{ fontSize: '16px', fontWeight: 900 }}>{hearts}</span>
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
                  <PlusCircle size={16} fill="none" stroke="currentColor" />
                </button>
              )}
            </div>
          </div>

          {/* 1. Super Duolingo Card */}
          <div 
            style={{ 
              border: '2px solid var(--border-color)', 
              borderBottom: '5px solid var(--border-color)',
              borderRadius: '16px', 
              padding: '16px', 
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span 
                  style={{ 
                    backgroundColor: 'var(--color-purple)', 
                    color: 'white', 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    padding: '2px 8px', 
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Super
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 900, marginTop: '8px' }}>Try Super for free</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', lineHeight: '1.4' }}>
                  No ads, personalized practice, and unlimited Legendary!
                </p>
              </div>
              <div style={{ transform: 'rotate(-5deg)', marginLeft: '8px' }}>
                <img 
                  src="/mascot/duosword.png" 
                  alt="Super Duo" 
                  style={{ width: '52px', height: '52px', objectFit: 'contain' }} 
                />
              </div>
            </div>
            <button 
              className="btn-3d btn-purple" 
              style={{ width: '100%', padding: '10px', fontSize: '13px', backgroundColor: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}
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
              <div style={{ border: '2px solid var(--border-color)', borderBottom: '5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Bronze League</h4>
                  <Link href="/leaderboard" style={{ fontSize: '12px', color: 'var(--color-blue)', fontWeight: 800, textDecoration: 'none' }}>VIEW LEAGUE</Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '28px' }}>🥉</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900 }}>
                      You're ranked <span style={{ color: 'var(--color-green)' }}>#{myRank}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
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
          <div style={{ border: '2px solid var(--border-color)', borderBottom: '5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 900 }}>Daily Quests</h4>
              <Link href="/quests" style={{ fontSize: '12px', color: 'var(--color-blue)', fontWeight: 800, textDecoration: 'none' }}>VIEW ALL</Link>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="/icons/fire.png" 
                alt="Streak Icon" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 800 }}>Earn {dailyGoal} XP</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div className="progress-bar-container" style={{ height: '8px', flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${dailyProgressPercent}%`, backgroundColor: 'var(--color-gold)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>{xp}/{dailyGoal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

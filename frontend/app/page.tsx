'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CoursePath } from '@/lib/types';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/ui/TopBar';
import UnitHeader from '@/components/path/UnitHeader';
import SkillNode from '@/components/path/SkillNode';
import Mascot from '@/components/ui/Mascot';
import { Trophy, Target, ShieldCheck, HelpCircle } from 'lucide-react';

export default function LearnPage() {
  const [pathData, setPathData] = useState<CoursePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { xp, dailyGoal, fetchUser } = useUserStore();

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

    fetchPath();
  }, [fetchUser]);

  // Calculate daily goal progress
  const dailyProgressPercent = Math.min(100, Math.round((xp / dailyGoal) * 100));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: 'var(--text-muted)' }}>
          Loading your learning path...
        </div>
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ color: 'var(--color-red)', fontWeight: 800, fontSize: '18px' }}>
            Error loading path: {error}
          </div>
          <button onClick={() => window.location.reload()} className="btn-3d btn-blue">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Winding pattern index counter
  let flatIndex = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Winding Path Area */}
        <div className="path-layout" style={{ position: 'relative' }}>
          
          {/* Decorative Floating Mascot next to Unit 1 */}
          <div 
            style={{ 
              position: 'absolute', 
              left: '60px', 
              top: '220px', 
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            <Mascot state="smiling" size={100} />
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-dark)',
              textAlign: 'center',
              marginTop: '4px',
              whiteSpace: 'nowrap'
            }}>
              Let's learn Spanish!
            </div>
          </div>

          {/* Decorative Floating Mascot next to Unit 2 */}
          <div 
            style={{ 
              position: 'absolute', 
              right: '60px', 
              top: '800px', 
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            <Mascot state="determined" size={100} />
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-dark)',
              textAlign: 'center',
              marginTop: '4px',
              whiteSpace: 'nowrap'
            }}>
              Practice makes perfect!
            </div>
          </div>

          {pathData.units.map((unit, unitIdx) => {
            // Draw a vertical connecting path-line behind nodes
            // height estimated dynamically based on children counts
            const totalNodes = unit.skills.length + 2; // Skills + Chest + Trophy
            const lineHeight = totalNodes * 128; 
            
            return (
              <div key={unit.id} style={{ marginBottom: '56px', position: 'relative' }}>
                <UnitHeader title={unit.title} index={unitIdx} />
                
                {/* Connecting Path line behind nodes */}
                <div 
                  className="path-line" 
                  style={{ 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    top: '120px', 
                    height: `${lineHeight - 64}px` 
                  }} 
                />

                <div className="skill-path-container" style={{ paddingTop: '20px' }}>
                  {/* Skill Node Sequence with interspersed Chest and Trophy Cup */}
                  {unit.skills.map((skill, skillIdx) => {
                    const nodesToRender = [];
                    const currentIdx = flatIndex;
                    flatIndex += 1;

                    // Render primary Skill Node
                    nodesToRender.push(
                      <SkillNode 
                        key={`skill-${skill.id}`} 
                        skill={skill} 
                        index={currentIdx} 
                        type="skill"
                      />
                    );

                    // Insert Chest Node after appropriate intervals (e.g. 2nd skill node in Unit 1)
                    if (unitIdx === 0 && skillIdx === 1) {
                      const chestIdx = flatIndex;
                      flatIndex += 1;
                      nodesToRender.push(
                        <SkillNode
                          key={`chest-unit1`}
                          index={chestIdx}
                          type="chest"
                          chestId="chest_unit1"
                          isLocked={skill.status !== 'completed'}
                        />
                      );
                    } else if (unitIdx === 1 && skillIdx === 0) {
                      const chestIdx = flatIndex;
                      flatIndex += 1;
                      nodesToRender.push(
                        <SkillNode
                          key={`chest-unit2`}
                          index={chestIdx}
                          type="chest"
                          chestId="chest_unit2"
                          isLocked={skill.status !== 'completed'}
                        />
                      );
                    }

                    // Insert Unit Cup Trophy at the end of the unit
                    if (skillIdx === unit.skills.length - 1) {
                      const trophyIdx = flatIndex;
                      flatIndex += 1;
                      nodesToRender.push(
                        <SkillNode
                          key={`trophy-unit-${unit.id}`}
                          index={trophyIdx}
                          type="trophy"
                          isLocked={skill.status !== 'completed'}
                        />
                      );
                    }

                    return nodesToRender;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar Widgets */}
        <div className="right-sidebar">
          {/* Daily Goal Card */}
          <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--color-orange)', backgroundColor: 'var(--color-orange-light)', padding: '8px', borderRadius: '10px' }}>
                <Target size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 900 }}>Daily Quest</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Earn {dailyGoal} XP today</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '13px', marginBottom: '8px', fontWeight: 800 }}>
              <span>XP Goal Progress</span>
              <span style={{ marginLeft: 'auto', color: 'var(--color-orange)' }}>{xp} / {dailyGoal} XP</span>
            </div>
            <div className="progress-bar-container" style={{ height: '12px' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${dailyProgressPercent}%`, 
                  backgroundColor: 'var(--color-orange)' 
                }} 
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
              {dailyProgressPercent >= 100 
                ? "Quest completed! Awesome job!" 
                : `${dailyGoal - xp} XP remaining to reach your goal.`}
            </p>
          </div>

          {/* Super Promo Card matching official screenshot */}
          <div style={{ 
            border: '2px solid var(--border-color)', 
            borderRadius: '16px', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #a560e8, #1cb0f6)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              fontSize: '11px',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Super Promo
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>Try Super for free</h4>
            <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.4', marginBottom: '16px', fontWeight: 600 }}>
              No ads, personalized practice, and unlimited hearts for learning Spanish!
            </p>
            <button 
              className="btn-3d btn-blue" 
              style={{ width: '100%', backgroundColor: '#ffffff', color: 'var(--color-purple-dark)', borderColor: '#ffffff', padding: '10px' }}
              onClick={() => alert("Super is active! Mock Gem charges refilled.")}
            >
              Start 1 Week Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

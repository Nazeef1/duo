'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CoursePath } from '@/lib/types';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/ui/TopBar';
import UnitHeader from '@/components/path/UnitHeader';
import SkillNode from '@/components/path/SkillNode';
import { Trophy, Flame, Target } from 'lucide-react';

export default function LearnPage() {
  const [pathData, setPathData] = useState<CoursePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { xp, dailyGoal, fetchUser } = useUserStore();

  useEffect(() => {
    // Initial fetch
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

  // Compute total skills across path
  let skillIndex = 0;

  // Calculate daily goal progress
  const dailyProgressPercent = Math.min(100, Math.round((xp / dailyGoal) * 100));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: 'var(--text-muted)' }}>
          Loading your learning path...
        </div>
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Winding Path Area */}
        <div className="path-layout">
          {pathData.units.map((unit, unitIdx) => (
            <div key={unit.id} style={{ marginBottom: '56px' }}>
              <UnitHeader title={unit.title} index={unitIdx} />
              
              <div className="skill-path-container">
                {unit.skills.map((skill) => {
                  const currentIdx = skillIndex;
                  skillIndex += 1;
                  return (
                    <SkillNode 
                      key={skill.id} 
                      skill={skill} 
                      index={currentIdx} 
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar Widgets */}
        <div className="right-sidebar">
          {/* Daily Goal Card */}
          <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
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

          {/* Tips Card */}
          <div style={{ border: '2px solid var(--border-color)', borderRadius: '16px', padding: '20px', backgroundColor: '#fcfcfc' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} style={{ color: 'var(--color-gold)' }} />
              <span>Pro Tip!</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.5', fontWeight: 600 }}>
              Complete lessons with full hearts to unlock the **Perfect Lesson** achievement and earn a **+5 XP** bonus!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

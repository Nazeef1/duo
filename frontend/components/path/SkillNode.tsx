'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Star, Lock, Trophy, ShieldAlert } from 'lucide-react';
import { SkillPath } from '@/lib/types';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { sound } from '@/lib/sound';

interface SkillNodeProps {
  skill?: SkillPath;
  index: number;
  type?: 'skill' | 'chest' | 'trophy';
  chestId?: string;
  isLocked?: boolean;
  activePopoverIndex?: number | null;
  setActivePopoverIndex?: (idx: number | null) => void;
}

export default function SkillNode({ 
  skill, 
  index, 
  type = 'skill', 
  chestId = '', 
  isLocked = false,
  activePopoverIndex = null,
  setActivePopoverIndex = () => {}
}: SkillNodeProps) {
  const popoverOpen = activePopoverIndex === index;
  const [targetLessonId, setTargetLessonId] = useState<number | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const { openedChests, openChest } = useUserStore();

  const handleNodeClick = async () => {
    if (type === 'skill') {
      if (!skill || skill.status === 'locked') return;
      
      // Hoisted state toggle closes all other open popovers
      setActivePopoverIndex(popoverOpen ? null : index);

      if (!targetLessonId && !loadingLesson) {
        setLoadingLesson(true);
        try {
          const lessons = await api.getSkillLessons(skill.id);
          const nextLesson = lessons.find(l => l.status === 'available') || lessons[0];
          if (nextLesson) {
            setTargetLessonId(nextLesson.id);
          }
        } catch (err) {
          console.error('Error fetching lessons', err);
        } finally {
          setLoadingLesson(false);
        }
      }
    } else if (type === 'chest') {
      if (isLocked) return;
      const isAlreadyOpened = openedChests.includes(chestId);
      if (isAlreadyOpened) return;
      setActivePopoverIndex(popoverOpen ? null : index);
    }
  };

  if (type === 'chest') {
    const isOpen = openedChests.includes(chestId);
    
    return (
      <div 
        className="skill-node-wrapper"
      >
        <button
          onClick={handleNodeClick}
          className={`chest-node-circle ${isOpen ? 'opened' : ''} ${isLocked ? 'locked' : ''}`}
          disabled={isLocked || isOpen}
          style={{ cursor: isLocked || isOpen ? 'default' : 'pointer' }}
        >
          <div className="chest-node-inner">
            {isOpen ? (
              <span style={{ fontSize: '24px', opacity: 0.5 }}>💨</span>
            ) : isLocked ? (
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#37464f', 
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #202f36'
                }}
              >
                <Lock size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
            ) : (
              <img 
                src="/icons/treasure-chest.png" 
                alt="Treasure Chest" 
                style={{ width: '84px', height: '84px', objectFit: 'contain' }}
              />
            )}
          </div>
        </button>

        <div className="skill-node-title" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-dark)', fontSize: '13px' }}>
          {isOpen ? 'Claimed' : 'Bonus Chest'}
        </div>

        {popoverOpen && !isOpen && !isLocked && (
          <div className="skill-popover">
            <h4 className="skill-popover-title">Bonus Chest</h4>
            <p className="skill-popover-subtitle">Claim your path bonus reward!</p>
            <button
              onClick={async () => {
                setActivePopoverIndex(null);
                sound.playComplete();
                await openChest(chestId);
                setShowRewardModal(true);
              }}
              className="btn-3d btn-green"
              style={{ width: '100%', padding: '10px 20px', fontSize: '14px' }}
            >
              Claim +20 Gems
            </button>
          </div>
        )}

        {/* Chest reward popup modal - Rendered outside transformed hierarchy */}
        {showRewardModal && typeof document !== 'undefined' && createPortal(
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                🎁
              </div>
              <h2 className="modal-title">Chest Claimed!</h2>
              <div className="modal-body">
                You opened a secret path chest and earned <span style={{ color: 'var(--color-blue)', fontWeight: 900 }}>+20 Gems</span>!
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => setShowRewardModal(false)}
                  className="btn-3d btn-green"
                  style={{ width: '100%' }}
                >
                  Awesome!
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  if (type === 'trophy') {
    return (
      <div 
        className="skill-node-wrapper"
      >
        <button
          onClick={() => {
            if (!isLocked) {
              setActivePopoverIndex(popoverOpen ? null : index);
            }
          }}
          className="skill-node-circle"
          style={{ cursor: isLocked ? 'default' : 'pointer', border: 'none', background: 'none' }}
        >
          <div 
            className="skill-node-inner"
            style={{
              backgroundColor: isLocked ? '#37464f' : 'var(--color-gold)',
              borderColor: isLocked ? '#202f36' : 'var(--color-gold-dark)',
              boxShadow: isLocked ? '0 6px 0 #202f36' : '0 6px 0 var(--color-gold-dark)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trophy size={32} fill={isLocked ? 'none' : 'currentColor'} style={{ color: isLocked ? 'var(--text-muted)' : 'var(--bg-primary)' }} />
          </div>
        </button>
        <div className="skill-node-title" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-dark)', fontSize: '14px', fontWeight: '900' }}>
          Unit Review
        </div>

        {popoverOpen && !isLocked && (
          <div className="skill-popover">
            <h4 className="skill-popover-title">Unit Review</h4>
            <p className="skill-popover-subtitle">Practice unit exercises and test your skills!</p>
            <Link 
              href="/lesson/1"
              className="btn-3d btn-green"
              style={{ padding: '10px 20px', fontSize: '14px', width: '100%' }}
              onClick={() => setActivePopoverIndex(null)}
            >
              Start Review (+20 XP)
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Render Skill Node
  if (!skill) return null;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = skill.total_lessons > 0 ? (skill.crowns / skill.total_lessons) : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  // Check if this skill is in legendary status
  // In our schema, we can check: if crowns == total_lessons and status is completed, the user can upgrade it to legendary!
  // Let's store legendary in local state or derive: if crowns == total_lessons and user completed legendary challenge, it turns legendary.
  // Let's check if the crowns are completed. If crowns == total_lessons, they can unlock Legendary challenge!
  const isCompleted = skill.status === 'completed';

  return (
    <div 
      className="skill-node-wrapper"
    >
      <button 
        onClick={handleNodeClick}
        className={`skill-node-circle ${skill.status}`}
      >
        {skill.status !== 'locked' && (
          <svg 
            width="96" 
            height="96" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              transform: 'rotate(-90deg)', 
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <circle 
              cx="48" 
              cy="48" 
              r={radius} 
              fill="transparent" 
              stroke="var(--bg-secondary)" 
              strokeWidth="6" 
            />
            <circle 
              cx="48" 
              cy="48" 
              r={radius} 
              fill="transparent" 
              stroke={skill.status === 'completed' ? 'var(--color-gold)' : 'var(--color-green)'} 
              strokeWidth="6" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        )}

        <div className="skill-node-inner">
          {skill.status === 'locked' ? (
            <Lock size={28} />
          ) : (
            <Star size={28} fill="currentColor" />
          )}
        </div>
      </button>

      {skill.status !== 'locked' && skill.crowns > 0 && (
        <div className="skill-node-crowns">
          <Star size={11} fill="currentColor" stroke="none" />
          <span>{skill.crowns}</span>
        </div>
      )}

      <div className={`skill-node-title ${skill.status === 'locked' ? 'locked' : ''}`}>
        {skill.title}
      </div>

      {popoverOpen && (
        <div className="skill-popover">
          <h4 className="skill-popover-title">{skill.title}</h4>
          <p className="skill-popover-subtitle">
            {isCompleted 
              ? 'Skill completed!' 
              : `Lesson ${skill.crowns} of ${skill.total_lessons}`}
          </p>
          
          {loadingLesson ? (
            <div style={{ padding: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Loading lesson...
            </div>
          ) : targetLessonId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {isCompleted ? (
                <>
                  <Link 
                    href={`/lesson/${targetLessonId}?legendary=true`}
                    className="btn-3d btn-blue"
                    style={{ padding: '10px 16px', fontSize: '13px', width: '100%', backgroundColor: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}
                  >
                    🏆 Legendary (+40 XP)
                  </Link>
                  <Link 
                    href={`/lesson/${targetLessonId}`}
                    className="btn-3d btn-gray"
                    style={{ padding: '10px 16px', fontSize: '13px', width: '100%' }}
                  >
                    Review (+10 XP)
                  </Link>
                </>
              ) : (
                <Link 
                  href={`/lesson/${targetLessonId}`}
                  className="btn-3d btn-green"
                  style={{ padding: '10px 20px', fontSize: '14px', width: '100%' }}
                >
                  Start +10 XP
                </Link>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--color-red)' }}>
              No lessons available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

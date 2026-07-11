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
  themeColor?: string;
}

export default function SkillNode({ 
  skill, 
  index, 
  type = 'skill', 
  chestId = '', 
  isLocked = false,
  activePopoverIndex = null,
  setActivePopoverIndex = () => {},
  themeColor = '#1cb0f6'
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
              <img 
                src="/icons/chest_opened.svg" 
                alt="Chest Opened" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            ) : isLocked ? (
              <img 
                src="/icons/chest_locked.svg" 
                alt="Chest Locked" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
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
              backgroundColor: isLocked ? '#37464f' : '#ffc800',
              borderColor: isLocked ? '#202f36' : '#e6a100',
              boxShadow: isLocked ? '0 6px 0 #202f36' : '0 6px 0 #e6a100',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLocked ? (
              <img 
                src="/icons/final_review_lesson_locked.svg" 
                alt="Final Review Locked" 
                style={{ width: '42px', height: '34px', objectFit: 'contain' }}
              />
            ) : (
              <img 
                src="/icons/final_review_lesson_completed.svg" 
                alt="Final Review Completed" 
                style={{ width: '42px', height: '34px', objectFit: 'contain' }}
              />
            )}
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

  const isCompleted = skill.status === 'completed';

  const getCircleStyle = () => {
    if (skill.status === 'locked') {
      return {
        backgroundColor: '#37464f',
        borderColor: '#202f36',
        boxShadow: '0 6px 0 #202f36'
      };
    }
    return {
      backgroundColor: themeColor,
      borderColor: getThemeDark(themeColor),
      boxShadow: `0 6px 0 ${getThemeDark(themeColor)}`
    };
  };

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

        <div 
          className="skill-node-inner"
          style={{
            ...getCircleStyle(),
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {skill.status === 'locked' ? (
            <StarIcon fill="#52656D" />
          ) : skill.status === 'completed' ? (
            <img 
              src={themeColor === '#1cb0f6' ? '/icons/lessons_blue.svg' : '/icons/lessons_purple.svg'} 
              alt="Completed Checkmark" 
              style={{ width: '42px', height: '34px', objectFit: 'contain' }}
            />
          ) : (
            <StarIcon fill="#ffffff" />
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
        <div 
          className="skill-popover"
          style={{
            ['--popover-bg' as any]: themeColor,
            ['--popover-bg-dark' as any]: getThemeDark(themeColor),
            color: '#ffffff'
          }}
        >
          <h4 className="skill-popover-title" style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: 800 }}>{skill.title}</h4>
          <p 
            className="skill-popover-subtitle" 
            style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '13px', 
              fontWeight: 700, 
              marginTop: '4px',
              marginBottom: '16px' 
            }}
          >
            {isCompleted 
              ? 'Prove your proficiency with Legendary' 
              : `Lesson ${skill.crowns} of ${skill.total_lessons}`}
          </p>
          
          {loadingLesson ? (
            <div style={{ padding: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              Loading lesson...
            </div>
          ) : targetLessonId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {isCompleted ? (
                <>
                  <Link 
                    href={`/lesson/${targetLessonId}?legendary=true`}
                    className="btn-3d"
                    style={{ 
                      padding: '11px 16px', 
                      fontSize: '13px', 
                      width: '100%', 
                      backgroundColor: '#ffc800', 
                      color: '#ffffff',
                      border: 'none',
                      borderBottom: '4px solid #e6a100',
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Legendary +40 XP
                  </Link>
                  <Link 
                    href={`/lesson/${targetLessonId}`}
                    className="btn-3d"
                    style={{ 
                      padding: '11px 16px', 
                      fontSize: '13px', 
                      width: '100%',
                      backgroundColor: '#ffffff',
                      color: themeColor,
                      border: 'none',
                      borderBottom: '4px solid #d9d9d9',
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Practice +10 XP
                  </Link>
                </>
              ) : (
                <Link 
                  href={`/lesson/${targetLessonId}`}
                  className="btn-3d"
                  style={{ 
                    padding: '12px 20px', 
                    fontSize: '14px', 
                    width: '100%',
                    backgroundColor: '#ffffff',
                    color: themeColor,
                    border: 'none',
                    borderBottom: '4px solid #d9d9d9',
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                >
                  Start +10 XP
                </Link>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
              No lessons available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Darker shade logic for 3D bottom border of the themed popovers
function getThemeDark(color: string): string {
  if (color === '#1cb0f6') return '#1485ba'; // dark blue
  if (color === '#a560e8') return '#843cd0'; // dark purple
  return '#1485ba';
}

// Inline StarIcon drawing the shape of lesson_locked.svg but with a dynamic fill
function StarIcon({ fill }: { fill: string }) {
  return (
    <svg width="30" height="28" viewBox="0 0 31 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M13.0456 2.34516C13.9532 0.463071 16.6337 0.463071 17.5414 2.34516L20.1473 7.74877C20.5184 8.51827 21.2574 9.04448 22.1059 9.14351L28.0841 9.84121C30.2204 10.0905 31.0618 12.745 29.4593 14.1795L25.1779 18.0121C24.5174 18.6033 24.2201 19.5006 24.3969 20.3693L25.5403 25.9866C25.9618 28.0576 23.7792 29.6823 21.9162 28.6842L16.472 25.7675C15.7358 25.3731 14.8511 25.3731 14.1149 25.7675L8.67068 28.6842C6.80774 29.6823 4.62508 28.0576 5.04661 25.9866L6.18997 20.3693C6.36679 19.5006 6.06951 18.6033 5.40899 18.0121L1.12761 14.1795C-0.474924 12.745 0.366528 10.0905 2.50284 9.84121L8.48098 9.14351C9.32953 9.04448 10.0685 8.51827 10.4396 7.74877L13.0456 2.34516Z" 
        fill={fill}
      />
    </svg>
  );
}

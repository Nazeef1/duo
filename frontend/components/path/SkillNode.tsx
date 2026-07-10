'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Lock, Gift, Trophy, Sparkles } from 'lucide-react';
import { SkillPath } from '@/lib/types';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { sound } from '@/lib/sound';

interface SkillNodeProps {
  skill?: SkillPath; // Optional if rendering generic Chest or Trophy
  index: number;
  type?: 'skill' | 'chest' | 'trophy';
  chestId?: string;
  isLocked?: boolean;
}

export default function SkillNode({ 
  skill, 
  index, 
  type = 'skill', 
  chestId = '', 
  isLocked = false 
}: SkillNodeProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<number | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const { openedChests, openChest } = useUserStore();

  // Winding pattern offsets matching the official screenshot
  const getOffset = (idx: number) => {
    const pattern = [0, -32, -64, -32, 0, 32, 64, 32];
    return pattern[idx % pattern.length];
  };

  const handleNodeClick = async () => {
    if (type === 'skill') {
      if (!skill || skill.status === 'locked') return;
      setPopoverOpen(!popoverOpen);

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

      // Play victory complete chime
      sound.playComplete();
      
      // Open chest and show modal
      await openChest(chestId);
      setShowRewardModal(true);
    }
  };

  if (type === 'chest') {
    const isOpen = openedChests.includes(chestId);
    
    return (
      <div 
        className="skill-node-wrapper"
        style={{ transform: `translateX(${getOffset(index)}px)` }}
      >
        <button
          onClick={handleNodeClick}
          className={`chest-node-circle ${isOpen ? 'opened' : ''} ${isLocked ? 'locked' : ''}`}
          disabled={isLocked || isOpen}
          style={{ cursor: isLocked || isOpen ? 'default' : 'pointer' }}
        >
          <div 
            className="chest-node-inner"
            style={{
              backgroundColor: isOpen ? 'var(--bg-secondary)' : isLocked ? '#37464f' : 'var(--color-orange)',
              borderColor: isOpen ? 'var(--border-color)' : isLocked ? '#202f36' : 'var(--color-gold)',
              boxShadow: isOpen ? '0 4px 0 rgba(0,0,0,0.1)' : isLocked ? '0 6px 0 #202f36' : '0 6px 0 var(--color-orange-dark)'
            }}
          >
            {isOpen ? (
              <span style={{ fontSize: '24px' }}>💨</span> // empty puff
            ) : isLocked ? (
              <Lock size={28} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <Gift size={28} className="animate-bounce" />
            )}
          </div>
        </button>

        <div className="skill-node-title" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-dark)', fontSize: '13px' }}>
          {isOpen ? 'Claimed' : 'Bonus Chest'}
        </div>

        {/* Chest reward modal */}
        {showRewardModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ color: 'var(--color-gold)', fontSize: '64px', marginBottom: '16px' }}>
                🎁
              </div>
              <h2 className="modal-title">Chest Claimed!</h2>
              <p className="modal-body">
                You found a secret treasure chest and unlocked **+20 Gems**!
              </p>
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
          </div>
        )}
      </div>
    );
  }

  if (type === 'trophy') {
    return (
      <div 
        className="skill-node-wrapper"
        style={{ transform: `translateX(${getOffset(index)}px)` }}
      >
        <div 
          className="skill-node-inner"
          style={{
            backgroundColor: isLocked ? '#37464f' : 'var(--color-gold)',
            borderColor: isLocked ? '#202f36' : 'var(--color-gold-dark)',
            boxShadow: isLocked ? '0 6px 0 #202f36' : '0 6px 0 var(--color-gold-dark)',
            width: '80px',
            height: '80px',
            borderRadius: '50%'
          }}
        >
          <Trophy size={32} fill={isLocked ? 'none' : 'currentColor'} style={{ color: isLocked ? 'var(--text-muted)' : 'var(--bg-primary)' }} />
        </div>
        <div className="skill-node-title" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-dark)', fontSize: '14px', fontWeight: '900' }}>
          Trophy Cup
        </div>
      </div>
    );
  }

  // Render Skill Node
  if (!skill) return null;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = skill.total_lessons > 0 ? (skill.crowns / skill.total_lessons) : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div 
      className="skill-node-wrapper"
      style={{ transform: `translateX(${getOffset(index)}px)` }}
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
          <Star size={12} fill="currentColor" stroke="none" />
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
            {skill.status === 'completed' 
              ? 'Skill completed!' 
              : `Lesson ${skill.crowns} of ${skill.total_lessons}`}
          </p>
          
          {loadingLesson ? (
            <div style={{ padding: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Loading lesson...
            </div>
          ) : targetLessonId ? (
            <Link 
              href={`/lesson/${targetLessonId}`}
              className="btn-3d btn-green"
              style={{ padding: '10px 20px', fontSize: '14px', width: '100%' }}
            >
              Start +10 XP
            </Link>
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

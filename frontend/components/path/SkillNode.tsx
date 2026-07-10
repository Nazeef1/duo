'use client';

import { useState } from 'react';
import useRouter from 'next/router';
import Link from 'next/link';
import { Star, Lock, BookOpen } from 'lucide-react';
import { SkillPath } from '@/lib/types';
import { api } from '@/lib/api';

interface SkillNodeProps {
  skill: SkillPath;
  index: number;
}

export default function SkillNode({ skill, index }: SkillNodeProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<number | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Calculate winding offset: center -> left -> center -> right -> center
  // pattern: 0, -48, -96, -48, 0, 48, 96, 48
  const getOffset = (idx: number) => {
    const pattern = [0, -40, -80, -40, 0, 40, 80, 40];
    return pattern[idx % pattern.length];
  };

  const handleNodeClick = async () => {
    if (skill.status === 'locked') return;

    setPopoverOpen(!popoverOpen);

    if (!targetLessonId && !loadingLesson) {
      setLoadingLesson(true);
      try {
        const lessons = await api.getSkillLessons(skill.id);
        // Next lesson is lesson[crowns] or lesson[0]
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
  };

  // Radial progress circumference logic
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = skill.total_lessons > 0 ? (skill.crowns / skill.total_lessons) : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div 
      className="skill-node-wrapper"
      style={{ transform: `translateX(${getOffset(index)}px)` }}
    >
      {/* Skill Node Circular Button with dynamic SVG border ring */}
      <button 
        onClick={handleNodeClick}
        className={`skill-node-circle ${skill.status}`}
      >
        {/* Progress Border (drawn only for available/completed) */}
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
              stroke="#e5e5e5" 
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
            <Lock size={32} />
          ) : (
            <Star size={32} fill="currentColor" />
          )}
        </div>
      </button>

      {/* crowns count badge */}
      {skill.status !== 'locked' && skill.crowns > 0 && (
        <div className="skill-node-crowns">
          <Star size={12} fill="currentColor" stroke="none" />
          <span>{skill.crowns}</span>
        </div>
      )}

      {/* Skill Title */}
      <div className={`skill-node-title ${skill.status === 'locked' ? 'locked' : ''}`}>
        {skill.title}
      </div>

      {/* Popover Detail Panel */}
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

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lesson, Exercise } from '@/lib/types';
import { useUserStore } from '@/store/useUserStore';
import ExerciseRenderer from '@/components/lesson/ExerciseRenderer';
import { X, Heart, CheckCircle2, AlertCircle, Award, Zap, RefreshCw } from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  
  // Resolve params using React.use() per Next.js 15 guidelines
  const resolvedParams = use(params);
  const lessonId = parseInt(resolvedParams.lessonId);

  const { hearts, refillHearts, reconcileHearts, updateLocalStats } = useUserStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active exercise states
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  // Result modals
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Complete stats summary
  const [completeStats, setCompleteStats] = useState<{
    xp_earned: number;
    perfect: boolean;
    achievements: string[];
  } | null>(null);

  useEffect(() => {
    const initLesson = async () => {
      try {
        setLoading(true);
        // 1. Start lesson attempt
        const attempt = await api.startAttempt(lessonId);
        setAttemptId(attempt.attempt_id);
        reconcileHearts(attempt.hearts_remaining);

        // 2. Fetch exercises
        const data = await api.getLesson(lessonId);
        setLesson(data);
        
        if (attempt.hearts_remaining <= 0) {
          setShowHeartsModal(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize lesson');
      } finally {
        setLoading(false);
      }
    };

    initLesson();
  }, [lessonId, reconcileHearts]);

  // If loading or error
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
        Preparing your lesson...
      </div>
    );
  }

  if (error || !lesson || lesson.exercises.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ color: 'var(--color-red)', fontWeight: 800, fontSize: '18px' }}>
          {error || 'No exercises found in this lesson.'}
        </div>
        <button onClick={() => router.push('/')} className="btn-3d btn-blue">
          Return to Path
        </button>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentIdx];
  const progressPercent = Math.round((currentIdx / lesson.exercises.length) * 100);

  // Check correctness of answer client-side
  const checkAnswer = async () => {
    if (isAnswerChecked || !currentExercise || !attemptId) return;

    let isCorrect = false;
    const data = currentExercise.data;

    if (currentExercise.type === 'multiple_choice') {
      isCorrect = selectedAnswer === data.answer;
    } else if (currentExercise.type === 'translate') {
      isCorrect = Array.isArray(selectedAnswer) && 
        selectedAnswer.length === data.answer.length &&
        selectedAnswer.every((val, i) => val === data.answer[i]);
    } else if (currentExercise.type === 'match_pairs') {
      isCorrect = selectedAnswer === true;
    } else if (currentExercise.type === 'fill_blank') {
      isCorrect = selectedAnswer === data.answer;
    } else if (currentExercise.type === 'type_answer') {
      const typed = (selectedAnswer as string || '').trim().toLowerCase();
      const primaryAnswer = data.answer.toLowerCase();
      const alternates = (data.accepted_alternates || []).map((a: string) => a.toLowerCase());
      isCorrect = typed === primaryAnswer || alternates.includes(typed);
    }

    setIsAnswerCorrect(isCorrect);
    setIsAnswerChecked(true);

    try {
      const res = await api.submitAnswer(attemptId, currentExercise.id, selectedAnswer, isCorrect);
      reconcileHearts(res.hearts_remaining);

      if (res.hearts_remaining <= 0) {
        setShowHeartsModal(true);
      }
    } catch (err) {
      console.error('Error submitting answer', err);
    }
  };

  const handleContinue = async () => {
    if (!isAnswerChecked || !attemptId) return;

    if (hearts <= 0) {
      setShowHeartsModal(true);
      return;
    }

    if (currentIdx < lesson.exercises.length - 1) {
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsAnswerCorrect(null);
      setCurrentIdx(currentIdx + 1);
    } else {
      setSubmittingComplete(true);
      try {
        const res = await api.completeAttempt(attemptId);
        setCompleteStats({
          xp_earned: res.xp_earned,
          perfect: res.perfect,
          achievements: res.achievements_unlocked
        });
        
        updateLocalStats({ xp_earned: res.xp_earned, streak: res.streak });
        setShowCompleteModal(true);
      } catch (err) {
        console.error('Error completing lesson', err);
      } finally {
        setSubmittingComplete(false);
      }
    }
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to quit? You will lose any progress in this lesson.')) {
      router.push('/');
    }
  };

  const handleRefillAndRetry = async () => {
    await refillHearts();
    setShowHeartsModal(false);
    window.location.reload();
  };

  const getCorrectAnswerText = (): string => {
    if (!currentExercise) return '';
    const data = currentExercise.data;
    if (currentExercise.type === 'translate') {
      return Array.isArray(data.answer) ? data.answer.join(' ') : data.answer;
    }
    return data.answer;
  };

  const isCheckDisabled = selectedAnswer === null || 
    (Array.isArray(selectedAnswer) && selectedAnswer.length === 0) ||
    (typeof selectedAnswer === 'string' && selectedAnswer.trim() === '');

  return (
    <div className="lesson-player-container">
      <header className="lesson-header">
        <button onClick={handleClose} className="lesson-close-btn" title="Quit Lesson">
          <X size={28} />
        </button>
        
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div className="lesson-hearts" title="Hearts remaining">
          <Heart size={24} fill="currentColor" />
          <span>{hearts}</span>
        </div>
      </header>

      <main className="lesson-content">
        <ExerciseRenderer
          exercise={currentExercise}
          selectedAnswer={selectedAnswer}
          onChange={setSelectedAnswer}
          disabled={isAnswerChecked}
        />
      </main>

      <div 
        className={`feedback-bar ${
          isAnswerChecked 
            ? isAnswerCorrect 
              ? 'correct' 
              : 'incorrect' 
            : ''
        }`}
        style={{
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {isAnswerChecked ? (
          <>
            <div className="feedback-info">
              <div className="feedback-icon-circle" style={{ color: isAnswerCorrect ? 'var(--color-green)' : 'var(--color-red)' }}>
                {isAnswerCorrect ? (
                  <CheckCircle2 size={32} fill="currentColor" stroke="white" />
                ) : (
                  <AlertCircle size={32} fill="currentColor" stroke="white" />
                )}
              </div>
              <div>
                <h3 className="feedback-title">
                  {isAnswerCorrect ? 'Superb!' : 'Correct solution:'}
                </h3>
                <p className="feedback-desc">
                  {isAnswerCorrect 
                    ? 'Excellent job!' 
                    : getCorrectAnswerText()}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              className={`btn-3d ${isAnswerCorrect ? 'btn-green' : 'btn-red'}`}
              style={{ minWidth: '150px' }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              Think carefully before checking!
            </span>
            <button
              disabled={isCheckDisabled}
              onClick={checkAnswer}
              className={`btn-3d ${isCheckDisabled ? 'btn-gray' : 'btn-green'}`}
              style={{ minWidth: '150px' }}
            >
              Check
            </button>
          </>
        )}
      </div>

      {showHeartsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ color: 'var(--color-red)', marginBottom: '16px' }}>
              <Heart size={64} fill="currentColor" />
            </div>
            <h2 className="modal-title">No Hearts Left!</h2>
            <p className="modal-body">
              You lost all your hearts in this lesson. Don't worry! You can refill your hearts for free to try again.
            </p>
            <div className="modal-footer">
              <button 
                onClick={handleRefillAndRetry}
                className="btn-3d btn-green"
                style={{ width: '100%' }}
              >
                Refill & Restart
              </button>
              <button 
                onClick={() => router.push('/')}
                className="btn-3d btn-gray"
                style={{ width: '100%' }}
              >
                Return to Path
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && completeStats && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ color: 'var(--color-gold)', marginBottom: '16px' }}>
              <Award size={64} fill="currentColor" stroke="white" />
            </div>
            <h2 className="modal-title">Lesson Complete!</h2>
            <p className="modal-body" style={{ marginBottom: '24px' }}>
              You completed the lesson! Look at your amazing results:
            </p>

            <div className="complete-stats-grid">
              <div className="complete-stat-card xp">
                <span className="complete-stat-value">+{completeStats.xp_earned}</span>
                <span className="complete-stat-label">Total XP</span>
              </div>
              <div className="complete-stat-card accuracy">
                <span className="complete-stat-value">
                  {completeStats.perfect ? '100%' : 'Great'}
                </span>
                <span className="complete-stat-label">Accuracy</span>
              </div>
            </div>

            {completeStats.perfect && (
              <div style={{ 
                backgroundColor: 'var(--color-gold-light)', 
                border: '2px solid var(--color-gold)', 
                borderRadius: '12px', 
                padding: '12px', 
                width: '100%', 
                marginBottom: '24px',
                color: 'var(--color-gold-dark)',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                🎉 Perfect Lesson Bonus Unlocked (+5 XP)!
              </div>
            )}

            {completeStats.achievements.length > 0 && (
              <div style={{ marginBottom: '24px', textAlign: 'left', width: '100%' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
                  Achievements Earned:
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {completeStats.achievements.map(ach => (
                    <span 
                      key={ach} 
                      style={{ 
                        backgroundColor: 'var(--color-purple-light)', 
                        color: 'var(--color-purple-dark)', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 800,
                        border: '1px solid var(--color-purple)'
                      }}
                    >
                      🏆 {ach.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button 
                onClick={() => router.push('/')}
                className="btn-3d btn-green"
                style={{ width: '100%' }}
              >
                Continue to Path
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

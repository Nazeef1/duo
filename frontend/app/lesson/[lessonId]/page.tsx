'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lesson, Exercise } from '@/lib/types';
import { useUserStore } from '@/store/useUserStore';
import ExerciseRenderer from '@/components/lesson/ExerciseRenderer';
import Mascot from '@/components/ui/Mascot';
import { sound } from '@/lib/sound';
import { speech } from '@/lib/speech';
import { X, Heart, CheckCircle2, AlertCircle, Award, Volume2, Sparkles, Smile } from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  
  // Resolve params using React.use()
  const resolvedParams = use(params);
  const lessonId = parseInt(resolvedParams.lessonId);

  const { hearts, refillHearts, reconcileHearts, updateLocalStats, openChest } = useUserStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [exercisesQueue, setExercisesQueue] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLegendary, setIsLegendary] = useState(false);

  // Active exercise states
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  // Mistake Review & Redo States
  const [failedExercises, setFailedExercises] = useState<Exercise[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showReviewSplash, setShowReviewSplash] = useState(false);

  // Gamification & Streak States
  const [correctStreak, setCorrectStreak] = useState(0);
  const [mascotBubble, setMascotBubble] = useState<string | null>(null);

  // Result modals
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Complete stats summary
  const [completeStats, setCompleteStats] = useState<{
    xp_earned: number;
    perfect: boolean;
    achievements: string[];
  } | null>(null);

  // Animating complete stats
  const [xpDisplay, setXpDisplay] = useState(0);
  const [streakDisplay, setStreakDisplay] = useState(0);
  const [flameActive, setFlameActive] = useState(false);
  const [streakPulse, setStreakPulse] = useState(false);

  useEffect(() => {
    if (showCompleteModal && completeStats) {
      // 1. Roll up XP
      const targetXp = completeStats.xp_earned;
      if (targetXp > 0) {
        let currentXp = 0;
        const duration = 800; // ms
        const stepTime = Math.max(20, Math.floor(duration / targetXp));
        const timer = setInterval(() => {
          currentXp += 1;
          if (currentXp >= targetXp) {
            setXpDisplay(targetXp);
            clearInterval(timer);
          } else {
            setXpDisplay(currentXp);
          }
        }, stepTime);
      } else {
        setXpDisplay(0);
      }

      // 2. Roll up Streak
      const finalStreak = useUserStore.getState().streak;
      const initialStreak = Math.max(0, finalStreak - 1);
      setStreakDisplay(initialStreak);

      const triggerStreak = setTimeout(() => {
        setFlameActive(true);
        setStreakDisplay(finalStreak);
        setStreakPulse(true);
        setTimeout(() => setStreakPulse(false), 500);
      }, 700);

      return () => {
        clearTimeout(triggerStreak);
      };
    }
  }, [showCompleteModal, completeStats]);

  useEffect(() => {
    const initLesson = async () => {
      try {
        setLoading(true);
        const isLeg = typeof window !== 'undefined' ? window.location.search.includes('legendary=true') : false;
        setIsLegendary(isLeg);

        // 1. Start lesson attempt
        const attempt = await api.startAttempt(lessonId, isLeg);
        setAttemptId(attempt.attempt_id);
        reconcileHearts(attempt.hearts_remaining);

        // 2. Fetch exercises
        const data = await api.getLesson(lessonId);
        setLesson(data);
        setExercisesQueue(data.exercises);
        
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

  // Handle speaker click for Spanish Text-to-Speech
  const handleSpeak = () => {
    if (!currentExercise) return;
    const data = currentExercise.data;
    let textToSpeak = '';

    if (currentExercise.type === 'translate') {
      textToSpeak = Array.isArray(data.answer) ? data.answer.join(' ') : data.answer;
    } else if (currentExercise.type === 'fill_blank') {
      textToSpeak = data.prompt.replace('___', data.answer);
    } else if (currentExercise.type === 'type_answer') {
      textToSpeak = data.answer;
    } else if (currentExercise.type === 'multiple_choice') {
      textToSpeak = data.answer;
    } else {
      textToSpeak = currentExercise.data.prompt;
    }

    if (textToSpeak) {
      speech.speak(textToSpeak);
    }
  };

  // Trigger speak automatically on load of a new question
  useEffect(() => {
    if (exercisesQueue.length > 0 && currentIdx < exercisesQueue.length) {
      // Small timeout to allow browser layout to complete
      const timer = setTimeout(() => {
        handleSpeak();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, exercisesQueue]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-dark)' }}>
        Preparing your lesson...
      </div>
    );
  }

  if (error || !lesson || exercisesQueue.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-dark)' }}>
        <div style={{ color: 'var(--color-red)', fontWeight: 800, fontSize: '18px' }}>
          {error || 'No exercises found in this lesson.'}
        </div>
        <button onClick={() => router.push('/')} className="btn-3d btn-blue">
          Return to Path
        </button>
      </div>
    );
  }

  const currentExercise = exercisesQueue[currentIdx];
  const progressPercent = Math.round((currentIdx / exercisesQueue.length) * 100);

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

    // Play chimes based on correctness
    if (isCorrect) {
      sound.playCorrect();
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);

      // Trigger streak messages from Duo the Owl
      if (nextStreak === 2) {
        setMascotBubble('Great job! 2 in a row!');
        setTimeout(() => setMascotBubble(null), 3000);
      } else if (nextStreak === 5) {
        setMascotBubble('Unstoppable! 5 in a row!');
        setTimeout(() => setMascotBubble(null), 3000);
      } else if (nextStreak === 8) {
        setMascotBubble("You're a legend! 8 in a row!");
        setTimeout(() => setMascotBubble(null), 3000);
      }
    } else {
      sound.playIncorrect();
      setCorrectStreak(0);
      
      // Add current exercise to failed list for mistakes review redo
      setFailedExercises((prev) => [...prev, currentExercise]);
    }

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

    if (currentIdx < exercisesQueue.length - 1) {
      // Move to next exercise in current queue
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsAnswerCorrect(null);
      setCurrentIdx(currentIdx + 1);
    } else {
      // End of active queue. Check if we have failed questions to review
      if (failedExercises.length > 0) {
        // Prepare mistakes review mode
        setExercisesQueue(failedExercises);
        setFailedExercises([]);
        setCurrentIdx(0);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setIsAnswerCorrect(null);
        setIsReviewMode(true);
        setShowReviewSplash(true);
      } else {
        // No mistakes remaining, complete the lesson!
        setSubmittingComplete(true);
        sound.playComplete();
        try {
          const res = await api.completeAttempt(attemptId);
          
          // Check if this is a Unit Review attempt and record completion in database
          if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('isUnitReview') === 'true') {
              const uId = searchParams.get('unitId');
              if (uId) {
                try {
                  await openChest(`unit_review_${uId}`);
                } catch (chestErr) {
                  console.error('Error recording unit review chest completion:', chestErr);
                }
              }
            }
          }

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
    }
  };



  const handleClose = () => {
    setShowQuitModal(true);
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

  if (showCompleteModal && completeStats) {
    const accuracy = completeStats.perfect ? 100 : Math.round(((exercisesQueue.length - failedExercises.length) / Math.max(exercisesQueue.length, 1)) * 100);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-dark)',
        fontFamily: 'var(--font-nunito)',
        padding: '24px'
      }}>
        {/* Main Content Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          flex: 1,
          justifyContent: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          {/* Mascot Animation */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/mascot/nice_job.gif" 
              alt="Nice Job!" 
              style={{ width: '240px', height: '180px', objectFit: 'contain' }} 
            />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              color: '#ffc800',
              fontSize: '36px',
              fontWeight: 900,
              textTransform: 'none',
              marginBottom: '8px'
            }}>
              {completeStats.perfect ? 'Perfect lesson!' : 'Lesson complete!'}
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '18px',
              fontWeight: 700
            }}>
              {completeStats.perfect ? 'You made no mistakes in this lesson' : 'You did an amazing job!'}
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'flex',
            gap: '24px',
            width: '100%',
            justifyContent: 'center',
            marginTop: '12px'
          }}>
            {/* XP Card */}
            <div style={{
              width: '160px',
              borderRadius: '20px',
              border: '2px solid #ffc800',
              overflow: 'hidden',
              boxShadow: '0 4px 0 #ffc800'
            }}>
              <div style={{
                backgroundColor: '#ffc800',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                XP EARNED
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px 12px',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <img src="/icons/lightning.png" alt="XP" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#ffc800' }}>
                  {xpDisplay}
                </span>
              </div>
            </div>

            {/* Streak Card */}
            <div style={{
              width: '160px',
              borderRadius: '20px',
              border: '2px solid #ff9600',
              overflow: 'hidden',
              boxShadow: '0 4px 0 #ff9600'
            }}>
              <div style={{
                backgroundColor: '#ff9600',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                STREAK
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px 12px',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <img 
                  src="/icons/fire.svg" 
                  alt="Streak" 
                  className={flameActive ? 'flame-active' : ''}
                  style={{ width: '32px', height: '32px', objectFit: 'contain', transition: 'transform 0.3s ease' }} 
                />
                <span 
                  className={streakPulse ? 'number-pulse' : ''}
                  style={{ fontSize: '28px', fontWeight: 900, color: '#ff9600', display: 'inline-block' }}
                >
                  {streakDisplay}
                </span>
              </div>
            </div>

            {/* Accuracy Card */}
            <div style={{
              width: '160px',
              borderRadius: '20px',
              border: '2px solid #58cc02',
              overflow: 'hidden',
              boxShadow: '0 4px 0 #58cc02'
            }}>
              <div style={{
                backgroundColor: '#58cc02',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                {completeStats.perfect ? 'AMAZING' : 'ACCURACY'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px 12px',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <img src="/icons/target.png" alt="Accuracy" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#58cc02' }}>
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          borderTop: '2px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <button
            onClick={() => {
              router.push('/');
            }}
            className="btn-3d"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '2px solid var(--border-color)',
              borderBottom: '4px solid var(--border-color)',
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              borderRadius: '16px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Review Lesson
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="btn-3d btn-green"
            style={{
              backgroundColor: '#58cc02',
              borderColor: '#58cc02',
              boxShadow: '0 4px 0 #46a302',
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              borderRadius: '16px'
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  const isCheckDisabled = selectedAnswer === null || 
    (Array.isArray(selectedAnswer) && selectedAnswer.length === 0) ||
    (typeof selectedAnswer === 'string' && selectedAnswer.trim() === '');

  return (
    <div className="lesson-player-container">
      <header className="lesson-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'auto', padding: '16px 40px', gap: '24px' }}>
        <button onClick={handleClose} className="lesson-close-btn" title="Quit Lesson">
          <X size={28} />
        </button>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {correctStreak >= 2 && (
            <span style={{ color: 'var(--color-orange)', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {correctStreak} IN A ROW
            </span>
          )}
          <div className="progress-bar-container" style={{ width: '100%' }}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        
        <div className="lesson-hearts" title="Hearts remaining">
          <Heart size={24} fill="currentColor" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Slide-in Mascot Encouragement Bubble */}
      {mascotBubble && (
        <div className="mascot-motivation-banner">
          <Mascot state="smiling" size={90} />
          <div className="mascot-bubble">
            {mascotBubble}
          </div>
        </div>
      )}

      {/* Main Exercise Area */}
      <main className="lesson-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          {isReviewMode && (
            <span style={{ 
              backgroundColor: 'var(--color-orange-light)', 
              color: 'var(--color-orange)', 
              padding: '4px 10px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mistakes Review
            </span>
          )}
          {/* TTS Speaker Icon Button */}
          {currentExercise.type !== 'match_pairs' && (
            <button 
              onClick={handleSpeak}
              className="btn-3d btn-blue"
              style={{
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Speak phrase"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>

        <ExerciseRenderer
          exercise={currentExercise}
          selectedAnswer={selectedAnswer}
          onChange={setSelectedAnswer}
          disabled={isAnswerChecked}
          isChecked={isAnswerChecked}
          isCorrect={isAnswerCorrect ?? undefined}
        />
      </main>

      {/* Check/Continue Bottom Control Bar */}
      <div 
        className={`feedback-bar ${
          isAnswerChecked 
            ? isAnswerCorrect 
              ? 'correct' 
              : 'incorrect' 
            : ''
        }`}
        style={{
          boxShadow: '0 -4px 12px rgba(0,0,0,0.2)'
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
                  {isAnswerCorrect ? 'Correct!' : 'Correct solution:'}
                </h3>
                <p className="feedback-desc">
                  {isAnswerCorrect 
                    ? 'Great job! Keep it up!' 
                    : getCorrectAnswerText()}
                </p>
              </div>
            </div>
            
             <button
              onClick={handleContinue}
              className={`btn-3d ${isAnswerCorrect ? isLegendary ? 'btn-purple' : 'btn-green' : 'btn-red'}`}
              style={{ 
                minWidth: '150px',
                ...(isLegendary && isAnswerCorrect ? { backgroundColor: 'var(--color-purple)', borderColor: 'var(--color-purple)' } : {})
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedAnswer(currentExercise.type === 'translate' ? [] : '');
                setIsAnswerChecked(true);
                setIsAnswerCorrect(false);
                sound.playIncorrect();
                setCorrectStreak(0);
                setFailedExercises((prev) => [...prev, currentExercise]);
                if (attemptId) {
                  api.submitAnswer(attemptId, currentExercise.id, null, false)
                    .then(res => reconcileHearts(res.hearts_remaining))
                    .catch(console.error);
                }
              }}
              className="btn-3d"
              style={{ 
                minWidth: '120px', 
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                borderColor: 'var(--border-color)',
                boxShadow: 'none',
                borderWidth: '2px'
              }}
            >
              SKIP
            </button>
            <button
              disabled={isCheckDisabled}
              onClick={checkAnswer}
              className={`btn-3d ${isCheckDisabled ? '' : isLegendary ? 'btn-purple' : 'btn-green'}`}
              style={{ 
                minWidth: '150px',
                ...(isCheckDisabled ? {
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  borderColor: 'var(--bg-secondary)',
                  boxShadow: 'none',
                  cursor: 'default'
                } : {}),
                ...(isLegendary && !isCheckDisabled ? { backgroundColor: 'var(--color-purple)', borderColor: 'var(--color-purple)' } : {})
              }}
            >
              CHECK
            </button>
          </>
        )}
      </div>

      {/* Mistakes Review Splash Screen */}
      {showReviewSplash && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Mascot state="determined" size={120} />
            </div>
            <h2 className="modal-title">Review Mistakes</h2>
            <p className="modal-body">
              Let's redo the questions you missed. You can do this!
            </p>
            <div className="modal-footer">
              <button 
                onClick={() => setShowReviewSplash(false)}
                className="btn-3d btn-green"
                style={{ width: '100%' }}
              >
                Start Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Hearts Modal Popup */}
      {showHeartsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ marginBottom: '16px' }}>
              <Mascot state="crying" size={120} />
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

      {/* Lesson Complete Modal Popup */}
      {showCompleteModal && completeStats && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ marginBottom: '16px' }}>
              <img 
                src="/mascot/duolingo_lesson_end.gif" 
                alt="Lesson Complete" 
                style={{ width: '180px', height: '180px', objectFit: 'contain' }} 
              />
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
                  {completeStats.perfect ? '100%' : Math.round(((exercisesQueue.length - failedExercises.length) / Math.max(exercisesQueue.length, 1)) * 100) + '%'}
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
      {/* Custom Quit Confirmation Modal Popup */}
      {showQuitModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Mascot state="crying" size={120} />
            </div>
            <h2 className="modal-title">Wait, don't go yet!</h2>
            <p className="modal-body" style={{ marginBottom: '24px' }}>
              You are so close to completing this lesson! If you quit now, you'll lose all your progress in this lesson.
            </p>
            <div className="modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => setShowQuitModal(false)}
                className="btn-3d btn-green"
                style={{ width: '100%' }}
              >
                KEEP LEARNING
              </button>
              <button 
                onClick={() => router.push('/')}
                className="btn-3d btn-gray"
                style={{ width: '100%', color: 'var(--color-red)' }}
              >
                QUIT ANYWAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

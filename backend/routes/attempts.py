import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend import models, schemas

router = APIRouter(tags=["attempts"])

def regenerate_hearts(user: models.User, db: Session):
    if user.hearts >= 5:
        return
    if not user.hearts_last_lost_at:
        return
    
    now = datetime.datetime.utcnow()
    time_diff = now - user.hearts_last_lost_at
    # 1 heart recovered every 5 minutes (300 seconds) for demo/testing purposes
    heart_recovery_interval_seconds = 300
    hearts_to_add = int(time_diff.total_seconds() // heart_recovery_interval_seconds)
    
    if hearts_to_add > 0:
        user.hearts = min(5, user.hearts + hearts_to_add)
        if user.hearts == 5:
            user.hearts_last_lost_at = None
        else:
            user.hearts_last_lost_at += datetime.timedelta(seconds=hearts_to_add * heart_recovery_interval_seconds)
        db.commit()

def compute_streak(user_id: int, db: Session) -> int:
    logs = db.query(models.StreakLog.date).filter(
        models.StreakLog.user_id == user_id
    ).order_by(models.StreakLog.date.desc()).all()
    
    if not logs:
        return 0
        
    dates = [log.date for log in logs]
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    
    if dates[0] not in (today, yesterday):
        return 0
        
    streak = 1
    current_date = dates[0]
    for d in dates[1:]:
        if (current_date - d).days == 1:
            streak += 1
            current_date = d
        elif (current_date - d).days == 0:
            continue
        else:
            break
            
    return streak

@router.post("/lessons/{lesson_id}/attempts", response_model=schemas.StartAttemptResponse)
def start_attempt(lesson_id: int, db: Session = Depends(get_db)):
    user_id = 1
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Apply heart regeneration first
    regenerate_hearts(user, db)
    
    # Check if user has hearts
    if user.hearts <= 0:
        raise HTTPException(status_code=400, detail="Cannot start lesson with 0 hearts. Refill needed.")
        
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    attempt = models.LessonAttempt(
        user_id=user_id,
        lesson_id=lesson_id,
        status="in_progress",
        started_at=datetime.datetime.utcnow()
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    return {
        "attempt_id": attempt.id,
        "hearts_remaining": user.hearts
    }

@router.post("/attempts/{attempt_id}/answers", response_model=schemas.AnswerSubmitResponse)
def submit_answer(attempt_id: int, payload: schemas.AnswerSubmitRequest, db: Session = Depends(get_db)):
    attempt = db.query(models.LessonAttempt).filter(models.LessonAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail=f"Attempt already finished with status: {attempt.status}")
        
    user = db.query(models.User).filter(models.User.id == attempt.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Record the answer
    answer = models.Answer(
        attempt_id=attempt_id,
        exercise_id=payload.exercise_id,
        is_correct=payload.is_correct,
        answered_at=datetime.datetime.utcnow()
    )
    db.add(answer)
    
    if not payload.is_correct:
        # Lose a heart
        user.hearts = max(0, user.hearts - 1)
        attempt.hearts_lost += 1
        
        # If user lost a heart, set hearts_last_lost_at if not already set
        if user.hearts_last_lost_at is None:
            user.hearts_last_lost_at = datetime.datetime.utcnow()
            
        if user.hearts <= 0:
            attempt.status = "failed"
            attempt.completed_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(user)
    db.refresh(attempt)
    
    return {
        "hearts_remaining": user.hearts,
        "attempt_status": attempt.status
    }

@router.post("/attempts/{attempt_id}/complete", response_model=schemas.CompleteAttemptResponse)
def complete_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(models.LessonAttempt).filter(models.LessonAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if attempt.status == "failed":
        raise HTTPException(status_code=400, detail="Cannot complete a failed attempt")
        
    user = db.query(models.User).filter(models.User.id == attempt.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if attempt.status == "in_progress":
        attempt.status = "completed"
        attempt.completed_at = datetime.datetime.utcnow()

    # Calculate XP
    base_xp = 10
    bonus_xp = 5 if attempt.hearts_lost == 0 else 0
    total_xp_earned = base_xp + bonus_xp
    
    # Save transactions
    base_tx = models.XPTransaction(user_id=user.id, amount=base_xp, source="lesson_complete")
    db.add(base_tx)
    if bonus_xp > 0:
        bonus_tx = models.XPTransaction(user_id=user.id, amount=bonus_xp, source="perfect_lesson_bonus")
        db.add(bonus_tx)

    # Update progress
    lesson = attempt.lesson
    skill_id = lesson.skill_id
    progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == user.id,
        models.UserProgress.skill_id == skill_id
    ).first()
    
    if not progress:
        progress = models.UserProgress(user_id=user.id, skill_id=skill_id, status="available", crowns=0)
        db.add(progress)
        db.commit()
        db.refresh(progress)

    # Increment crowns
    total_lessons_in_skill = db.query(models.Lesson).filter(models.Lesson.skill_id == skill_id).count()
    progress.crowns = min(total_lessons_in_skill, progress.crowns + 1)
    
    if progress.crowns >= total_lessons_in_skill:
        progress.status = "completed"
        
    db.commit()

    # Record streak
    today = datetime.date.today()
    existing_streak_log = db.query(models.StreakLog).filter(
        models.StreakLog.user_id == user.id,
        models.StreakLog.date == today
    ).first()
    
    if not existing_streak_log:
        streak_log = models.StreakLog(user_id=user.id, date=today)
        db.add(streak_log)
        db.commit()
        
    # Recalculate streak
    current_streak = compute_streak(user.id, db)

    # Check achievements
    achievements_unlocked = []
    
    # 1. Perfect lesson
    if attempt.hearts_lost == 0:
        existing_ach = db.query(models.Achievement).filter(
            models.Achievement.user_id == user.id,
            models.Achievement.code == "perfect_lesson"
        ).first()
        if not existing_ach:
            db.add(models.Achievement(user_id=user.id, code="perfect_lesson"))
            achievements_unlocked.append("perfect_lesson")
            
    # 2. First lesson
    existing_first = db.query(models.Achievement).filter(
        models.Achievement.user_id == user.id,
        models.Achievement.code == "first_lesson"
    ).first()
    if not existing_first:
        db.add(models.Achievement(user_id=user.id, code="first_lesson"))
        achievements_unlocked.append("first_lesson")

    # 3. Streak 7
    if current_streak >= 7:
        existing_streak_7 = db.query(models.Achievement).filter(
            models.Achievement.user_id == user.id,
            models.Achievement.code == "streak_7"
        ).first()
        if not existing_streak_7:
            db.add(models.Achievement(user_id=user.id, code="streak_7"))
            achievements_unlocked.append("streak_7")

    db.commit()
    
    return {
        "xp_earned": total_xp_earned,
        "perfect": attempt.hearts_lost == 0,
        "new_crowns": progress.crowns,
        "streak": current_streak,
        "achievements_unlocked": achievements_unlocked
    }

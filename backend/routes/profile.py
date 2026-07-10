from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db import get_db
from backend import models, schemas
from backend.routes.attempts import compute_streak, regenerate_hearts

router = APIRouter(tags=["profile"])

@router.get("/profile", response_model=schemas.ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    user_id = 1
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Fail-safe auto-create
        user = models.User(id=1, username="learner")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Apply heart regeneration
    regenerate_hearts(user, db)

    # Compute total XP
    total_xp = db.query(func.sum(models.XPTransaction.amount)).filter(
        models.XPTransaction.user_id == user_id
    ).scalar() or 0

    # Compute streak
    streak = compute_streak(user_id, db)

    # Skills completed
    skills_completed = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == user_id,
        models.UserProgress.status == "completed"
    ).count()

    achievements_list = [ach.code for ach in user.achievements]

    return {
        "username": user.username,
        "total_xp": total_xp,
        "streak": streak,
        "hearts": user.hearts,
        "gems": user.gems,
        "achievements": achievements_list,
        "skills_completed": skills_completed,
        "joined_at": user.created_at,
        "daily_xp_goal": user.daily_xp_goal
    }

@router.patch("/profile", response_model=schemas.ProfileResponse)
def update_profile(payload: schemas.ProfileUpdateRequest, db: Session = Depends(get_db)):
    user_id = 1
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.username is not None:
        user.username = payload.username
    if payload.daily_xp_goal is not None:
        user.daily_xp_goal = payload.daily_xp_goal

    db.commit()
    db.refresh(user)

    # Return profile data
    return get_profile(db)

@router.post("/hearts/refill", response_model=schemas.RefillHeartsResponse)
def refill_hearts(db: Session = Depends(get_db)):
    user_id = 1
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = 5
    user.hearts_last_lost_at = None
    db.commit()
    
    return {"hearts": 5}

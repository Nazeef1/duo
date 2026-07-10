from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.db import get_db
from backend import models, schemas

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    # Query all users
    users = db.query(models.User).all()
    
    leaderboard_data = []
    for user in users:
        # Sum total XP for this user
        total_xp = db.query(func.sum(models.XPTransaction.amount)).filter(
            models.XPTransaction.user_id == user.id
        ).scalar() or 0
        
        leaderboard_data.append({
            "username": user.username,
            "total_xp": total_xp
        })
        
    # Sort by total_xp desc
    leaderboard_data.sort(key=lambda x: x["total_xp"], reverse=True)
    
    # Assign ranks
    response = []
    for idx, data in enumerate(leaderboard_data):
        response.append({
            "rank": idx + 1,
            "username": data["username"],
            "total_xp": data["total_xp"]
        })
        
    return response

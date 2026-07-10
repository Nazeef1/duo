import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db import get_db
from backend import models, schemas

router = APIRouter(tags=["lessons"])

@router.get("/skills/{skill_id}/lessons", response_model=List[schemas.LessonListSchema])
def get_skill_lessons(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    lessons = db.query(models.Lesson).filter(models.Lesson.skill_id == skill_id).order_by(models.Lesson.order_index).all()
    
    # Get user progress to check completed lessons (crowns count)
    user_id = 1
    prog = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == user_id,
        models.UserProgress.skill_id == skill_id
    ).first()
    crowns = prog.crowns if prog else 0

    response = []
    for idx, lesson in enumerate(lessons):
        # If order_index < crowns, it's completed
        # If order_index == crowns, it's available (next one to play)
        # If order_index > crowns, it's locked
        if lesson.order_index < crowns:
            status = "completed"
        elif lesson.order_index == crowns:
            status = "available"
        else:
            status = "locked"
            
        response.append({
            "id": lesson.id,
            "order_index": lesson.order_index,
            "status": status
        })
    return response

@router.get("/lessons/{lesson_id}", response_model=schemas.LessonSchema)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises = db.query(models.Exercise).filter(models.Exercise.lesson_id == lesson_id).order_by(models.Exercise.order_index).all()

    exercises_response = []
    for ex in exercises:
        try:
            parsed_data = json.loads(ex.data_json)
        except Exception:
            parsed_data = {}
            
        exercises_response.append({
            "id": ex.id,
            "order_index": ex.order_index,
            "type": ex.type,
            "data": parsed_data
        })

    return {
        "id": lesson.id,
        "skill_id": lesson.skill_id,
        "exercises": exercises_response
    }

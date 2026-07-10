from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db import get_db
from backend import models, schemas

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("", response_model=List[schemas.CourseSchema])
def get_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@router.get("/{course_id}/path", response_model=schemas.CoursePathSchema)
def get_course_path(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch user progress (assume single user, user_id=1)
    user_id = 1
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Auto-create user if not exists (fail-safe)
        user = models.User(id=1, username="learner")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Fetch all units and skills for this course, ordered
    units = db.query(models.Unit).filter(models.Unit.course_id == course_id).order_by(models.Unit.order_index).all()
    
    # We want to build a flat list of skills in logical order to compute dynamic locks
    flat_skills = []
    skill_unit_map = {}
    for unit in units:
        skills = db.query(models.Skill).filter(models.Skill.unit_id == unit.id).order_by(models.Skill.order_index).all()
        for skill in skills:
            flat_skills.append(skill)
            skill_unit_map[skill.id] = unit.id

    # Fetch existing UserProgress rows
    progress_map = {}
    db_progress = db.query(models.UserProgress).filter(models.UserProgress.user_id == user_id).all()
    for prog in db_progress:
        progress_map[prog.skill_id] = prog

    # Determine dynamic statuses
    # Linear progression: First skill is available.
    # Subsequent skills are available if the previous one is completed.
    resolved_skills = {}
    previous_completed = True  # The "before first" skill is considered completed to unlock the first one

    for index, skill in enumerate(flat_skills):
        prog = progress_map.get(skill.id)
        crowns = prog.crowns if prog else 0
        total_lessons = len(skill.lessons)

        # Check completed status
        is_completed = (prog and prog.status == "completed") or (total_lessons > 0 and crowns >= total_lessons)
        
        if is_completed:
            status = "completed"
            # In case the database row isn't marked completed yet, sync it
            if not prog:
                prog = models.UserProgress(user_id=user_id, skill_id=skill.id, status="completed", crowns=crowns)
                db.add(prog)
                db.commit()
                progress_map[skill.id] = prog
            elif prog.status != "completed":
                prog.status = "completed"
                db.commit()
        elif previous_completed:
            status = "available"
            if prog and prog.status != "available":
                prog.status = "available"
                db.commit()
        else:
            status = "locked"
            if prog and prog.status != "locked":
                prog.status = "locked"
                db.commit()

        resolved_skills[skill.id] = {
            "id": skill.id,
            "title": skill.title,
            "icon": skill.icon,
            "order_index": skill.order_index,
            "status": status,
            "crowns": crowns,
            "total_lessons": total_lessons
        }

        # For the next skill, check if this one is completed
        previous_completed = is_completed

    # Now assemble the nested response structure
    units_response = []
    for unit in units:
        unit_skills_response = []
        skills = db.query(models.Skill).filter(models.Skill.unit_id == unit.id).order_by(models.Skill.order_index).all()
        for skill in skills:
            unit_skills_response.append(resolved_skills[skill.id])
        
        units_response.append({
            "id": unit.id,
            "title": unit.title,
            "order_index": unit.order_index,
            "skills": unit_skills_response
        })

    return {
        "course_id": course_id,
        "units": units_response
    }

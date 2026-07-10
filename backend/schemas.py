from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union
from datetime import datetime, date

class CourseSchema(BaseModel):
    id: int
    name: str
    language_code: str

    class Config:
        from_attributes = True

# Path Schema
class SkillPathSchema(BaseModel):
    id: int
    title: str
    icon: str
    order_index: int
    status: str  # 'locked' | 'available' | 'completed'
    crowns: int
    total_lessons: int

    class Config:
        from_attributes = True

class UnitPathSchema(BaseModel):
    id: int
    title: str
    order_index: int
    skills: List[SkillPathSchema]

    class Config:
        from_attributes = True

class CoursePathSchema(BaseModel):
    course_id: int
    units: List[UnitPathSchema]

    class Config:
        from_attributes = True

# Lesson Schema
class LessonListSchema(BaseModel):
    id: int
    order_index: int
    status: str

    class Config:
        from_attributes = True

class ExerciseSchema(BaseModel):
    id: int
    order_index: int
    type: str
    data: Any  # Parsed JSON content

    class Config:
        from_attributes = True

class LessonSchema(BaseModel):
    id: int
    skill_id: int
    exercises: List[ExerciseSchema]

    class Config:
        from_attributes = True

# Attempt Schema
class StartAttemptResponse(BaseModel):
    attempt_id: int
    hearts_remaining: int

class AnswerSubmitRequest(BaseModel):
    exercise_id: int
    submitted_answer: Any  # string or list of strings or pair arrays depending on exercise type
    is_correct: bool

class AnswerSubmitResponse(BaseModel):
    hearts_remaining: int
    attempt_status: str  # 'in_progress' | 'completed' | 'failed'

class CompleteAttemptResponse(BaseModel):
    xp_earned: int
    perfect: bool
    new_crowns: int
    streak: int
    achievements_unlocked: List[str]

# Profile Schema
class AchievementSchema(BaseModel):
    code: str
    earned_at: datetime

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    username: str
    total_xp: int
    streak: int
    hearts: int
    gems: int
    achievements: List[str]
    skills_completed: int
    joined_at: datetime
    daily_xp_goal: int

    class Config:
        from_attributes = True

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    daily_xp_goal: Optional[int] = None

# Leaderboard Schema
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_xp: int

    class Config:
        from_attributes = True

class RefillHeartsResponse(BaseModel):
    hearts: int

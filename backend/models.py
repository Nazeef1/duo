import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    hearts = Column(Integer, default=5)
    hearts_last_lost_at = Column(DateTime, nullable=True)
    gems = Column(Integer, default=500)
    daily_xp_goal = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("LessonAttempt", back_populates="user", cascade="all, delete-orphan")
    xp_transactions = relationship("XPTransaction", back_populates="user", cascade="all, delete-orphan")
    streak_logs = relationship("StreakLog", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # e.g., "Spanish"
    language_code = Column(String)  # e.g., "es"

    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    order_index = Column(Integer)

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    title = Column(String)
    icon = Column(String)  # e.g., "wave", "apple"
    order_index = Column(Integer)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="skill", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    order_index = Column(Integer)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")
    attempts = relationship("LessonAttempt", back_populates="lesson", cascade="all, delete-orphan")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    order_index = Column(Integer)
    type = Column(String)  # 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer'
    data_json = Column(String)  # full exercise payload (JSON string)

    lesson = relationship("Lesson", back_populates="exercises")
    answers = relationship("Answer", back_populates="exercise", cascade="all, delete-orphan")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    status = Column(String)  # 'locked' | 'available' | 'completed'
    crowns = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)

    user = relationship("User", back_populates="progress")
    skill = relationship("Skill", back_populates="user_progress")

class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    hearts_lost = Column(Integer, default=0)
    status = Column(String)  # 'in_progress' | 'completed' | 'failed'

    user = relationship("User", back_populates="attempts")
    lesson = relationship("Lesson", back_populates="attempts")
    answers = relationship("Answer", back_populates="attempt", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("lesson_attempts.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    is_correct = Column(Boolean)
    answered_at = Column(DateTime, default=datetime.datetime.utcnow)

    attempt = relationship("LessonAttempt", back_populates="answers")
    exercise = relationship("Exercise", back_populates="answers")

class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    source = Column(String)  # 'lesson_complete' | 'perfect_lesson_bonus' | 'streak_bonus'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="xp_transactions")

class StreakLog(Base):
    __tablename__ = "streak_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.date.today)

    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_streak_date"),)

    user = relationship("User", back_populates="streak_logs")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code = Column(String)  # 'perfect_lesson' | 'streak_7' | 'first_lesson'
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="achievements")

export interface Course {
  id: number;
  name: string;
  language_code: string;
}

export interface SkillPath {
  id: number;
  title: string;
  icon: string;
  order_index: number;
  status: 'locked' | 'available' | 'completed';
  crowns: number;
  total_lessons: number;
}

export interface UnitPath {
  id: number;
  title: string;
  order_index: number;
  skills: SkillPath[];
}

export interface CoursePath {
  course_id: number;
  units: UnitPath[];
}

export interface LessonList {
  id: number;
  order_index: number;
  status: 'locked' | 'available' | 'completed';
}

export interface Exercise {
  id: number;
  order_index: number;
  type: 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer';
  data: any;
}

export interface Lesson {
  id: number;
  skill_id: number;
  exercises: Exercise[];
}

export interface StartAttemptResponse {
  attempt_id: number;
  hearts_remaining: number;
}

export interface AnswerSubmitRequest {
  exercise_id: number;
  submitted_answer: any;
  is_correct: boolean;
}

export interface AnswerSubmitResponse {
  hearts_remaining: number;
  attempt_status: 'in_progress' | 'completed' | 'failed';
}

export interface CompleteAttemptResponse {
  xp_earned: number;
  perfect: boolean;
  new_crowns: number;
  streak: number;
  achievements_unlocked: string[];
}

export interface ProfileResponse {
  username: string;
  total_xp: number;
  streak: number;
  hearts: number;
  gems: number;
  achievements: string[];
  skills_completed: number;
  joined_at: string;
  daily_xp_goal: number;
  opened_chests: string[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_xp: number;
}

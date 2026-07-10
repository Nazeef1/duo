import {
  Course,
  CoursePath,
  LessonList,
  Lesson,
  StartAttemptResponse,
  AnswerSubmitResponse,
  CompleteAttemptResponse,
  ProfileResponse,
  LeaderboardEntry
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCourses: () => fetchJson<Course[]>('/courses'),
  
  getCoursePath: (courseId: number) => fetchJson<CoursePath>(`/courses/${courseId}/path`),
  
  getSkillLessons: (skillId: number) => fetchJson<LessonList[]>(`/skills/${skillId}/lessons`),
  
  getLesson: (lessonId: number) => fetchJson<Lesson>(`/lessons/${lessonId}`),
  
  startAttempt: (lessonId: number, isLegendary: boolean = false) => 
    fetchJson<StartAttemptResponse>(`/lessons/${lessonId}/attempts?is_legendary=${isLegendary}`, { method: 'POST' }),
  
  submitAnswer: (attemptId: number, exerciseId: number, submittedAnswer: any, isCorrect: boolean) => 
    fetchJson<AnswerSubmitResponse>(`/attempts/${attemptId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ exercise_id: exerciseId, submitted_answer: submittedAnswer, is_correct: isCorrect }),
    }),
  
  completeAttempt: (attemptId: number) => 
    fetchJson<CompleteAttemptResponse>(`/attempts/${attemptId}/complete`, { method: 'POST' }),
  
  getProfile: () => fetchJson<ProfileResponse>('/profile'),
  
  updateProfile: (data: { username?: string; daily_xp_goal?: number }) => 
    fetchJson<ProfileResponse>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  getLeaderboard: () => fetchJson<LeaderboardEntry[]>('/leaderboard'),
  
  refillHearts: () => fetchJson<{ hearts: number; gems: number }>('/hearts/refill', { method: 'POST' }),
  
  openChest: (chestId: string) => fetchJson<{ chest_id: string; gems_earned: number; total_gems: number }>('/chests/open', {
    method: 'POST',
    body: JSON.stringify({ chest_id: chestId })
  }),
};

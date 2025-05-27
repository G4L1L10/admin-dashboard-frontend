// src/types/lesson.ts
export interface Lesson {
  id: string;
  course_id: string;
  unit: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  crowns_reward: number;
  created_at: string;
  updated_at: string;
}

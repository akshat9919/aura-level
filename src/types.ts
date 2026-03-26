export type ClassType = 'Fighter' | 'Assassin' | 'Tanker';
export type RankType = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type QuestType = 'Daily' | 'Penalty' | 'Boss';
export type QuestStatus = 'Active' | 'Completed' | 'Failed';
export type AIPersonality = 'strict' | 'sigma' | 'chad' | 'humble';
export type UnitType = 'metric' | 'imperial';

export interface UserStats {
  strength: number;
  agility: number;
  sense: number;
  vitality: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  gender: 'Male' | 'Female' | 'Other';
  class: ClassType;
  goal: string;
  level: number;
  xp: number;
  rank: RankType;
  stats: UserStats;
  streak: number;
  lastWorkout?: string;
  mana: number;
  auraDensity: number;
  manaCore: number;
  personality: AIPersonality;
  units: UnitType;
  notificationsEnabled?: boolean;
}

export interface Exercise {
  name: string;
  reps: number;
  sets: number;
  xpGained: number;
}

export interface WorkoutSession {
  id?: string;
  uid: string;
  date: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  totalXp: number;
  calories: number;
}

export interface Quest {
  id?: string;
  uid: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  rewardXp: number;
  deadline: string;
}

export interface NutritionLog {
  id?: string;
  uid: string;
  date: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  water: number;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

export interface MealPlan {
  id?: string;
  uid: string;
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatHistory {
  uid: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface TrainingDay {
  date: string;
  type: 'Training' | 'Rest';
  intensity?: 'Low' | 'Medium' | 'High';
  workoutId?: string;
}

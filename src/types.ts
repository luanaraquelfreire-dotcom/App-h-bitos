export type HabitColor = "green" | "blue" | "red" | "yellow" | "purple";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: HabitColor;
  /** 0 = domingo ... 6 = sábado */
  daysOfWeek: number[];
  createdAt: string; // ISO date (yyyy-MM-dd)
  archived: boolean;
  /** horário programado, formato "HH:mm" (opcional) */
  time?: string;
}

/** habitId -> array de datas (yyyy-MM-dd) em que o hábito foi concluído */
export type CompletionMap = Record<string, string[]>;

export interface ProcrastinatedTask {
  id: string;
  text: string;
  createdAt: string; // ISO date (yyyy-MM-dd)
}

export type GoalType = "single" | "progress";

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  createdAt: string; // ISO date (yyyy-MM-dd)
  /** usado apenas em metas do tipo "single" */
  done: boolean;
  /** usado apenas em metas do tipo "progress" */
  targetCount?: number;
  unitLabel?: string;
  linkedHabitId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  /** para quantas pessoas a lista de ingredientes abaixo rende */
  servings: number;
  ingredients: Ingredient[];
  createdAt: string;
}

export type MealType = "cafe" | "almoco" | "janta" | "lanche";

export interface MealPlanEntry {
  id: string;
  recipeId: string;
  mealType: MealType;
  /** 0 = domingo ... 6 = sábado */
  daysOfWeek: number[];
  createdAt: string;
}

export interface HabitState {
  habits: Habit[];
  completions: CompletionMap;
  xp: number;
  tasks: ProcrastinatedTask[];
  drawnTaskId: string | null;
  completedTasksCount: number;
  goals: Goal[];
  recipes: Recipe[];
  mealPlans: MealPlanEntry[];
  peopleCount: number;
  /** "yyyy-MM" -> chaves de itens já marcados como comprados naquele mês */
  shoppingChecked: Record<string, string[]>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id">>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isCompleted: (habitId: string, date: string) => boolean;
  addTask: (text: string) => void;
  removeTask: (id: string) => void;
  completeTask: (id: string) => void;
  drawTask: () => void;
  clearDrawnTask: () => void;
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "done">) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  toggleGoalDone: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt">) => void;
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, "id">>) => void;
  removeRecipe: (id: string) => void;
  addMealPlan: (entry: Omit<MealPlanEntry, "id" | "createdAt">) => void;
  updateMealPlan: (id: string, updates: Partial<Omit<MealPlanEntry, "id">>) => void;
  removeMealPlan: (id: string) => void;
  setPeopleCount: (count: number) => void;
  toggleShoppingChecked: (monthKey: string, itemKey: string) => void;
}

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
  /** id de HouseholdMember responsável (opcional) */
  assignedTo?: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
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
  /** usado apenas em metas do tipo "single": data escolhida para fazer, yyyy-MM-dd (opcional) */
  scheduledDate?: string;
  /** usado apenas em metas do tipo "single", junto de scheduledDate */
  time?: string;
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

export type TransactionType = "income" | "expense";
export type TransactionCategory = "fixed" | "variable";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // yyyy-MM-dd
  createdAt: string;
}

export interface Chore {
  id: string;
  name: string;
  emoji: string;
  /** repetir a cada quantos dias */
  intervalDays: number;
  /** yyyy-MM-dd da última vez que foi feita (undefined = nunca feita) */
  lastDoneAt?: string;
  createdAt: string;
  /** id de HouseholdMember responsável (opcional) */
  assignedTo?: string;
  /** horário programado, formato "HH:mm" (opcional), para aparecer na agenda do dia */
  time?: string;
}

export type StudyType = "course" | "reading" | "language";
export type StudyStatus = "in_progress" | "completed" | "paused";

export interface StudyNote {
  id: string;
  text: string;
  createdAt: string; // yyyy-MM-dd
}

export interface StudySession {
  id: string;
  date: string; // yyyy-MM-dd
  minutes: number;
}

export interface StudyItem {
  id: string;
  type: StudyType;
  title: string;
  emoji: string;
  status: StudyStatus;
  notes: StudyNote[];
  sessions: StudySession[];
  /** meta semanal opcional */
  targetDaysPerWeek?: number;
  targetHoursPerWeek?: number;
  createdAt: string;
  /** dias da semana para aparecer na agenda do dia (0 = domingo ... 6 = sábado), opcional */
  daysOfWeek?: number[];
  /** horário programado, formato "HH:mm" (opcional), junto de daysOfWeek */
  time?: string;
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
  transactions: Transaction[];
  chores: Chore[];
  studyItems: StudyItem[];
  householdMembers: HouseholdMember[];
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
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  removeTransaction: (id: string) => void;
  addChore: (chore: Omit<Chore, "id" | "createdAt" | "lastDoneAt">) => void;
  updateChore: (id: string, updates: Partial<Omit<Chore, "id">>) => void;
  removeChore: (id: string) => void;
  markChoreDone: (id: string) => void;
  addStudyItem: (item: Omit<StudyItem, "id" | "createdAt" | "notes" | "sessions">) => void;
  updateStudyItem: (
    id: string,
    updates: Partial<Omit<StudyItem, "id" | "notes" | "sessions">>,
  ) => void;
  removeStudyItem: (id: string) => void;
  addStudyNote: (itemId: string, text: string) => void;
  removeStudyNote: (itemId: string, noteId: string) => void;
  addStudySession: (itemId: string, minutes: number) => void;
  removeStudySession: (itemId: string, sessionId: string) => void;
  addHouseholdMember: (name: string) => void;
  renameHouseholdMember: (id: string, name: string) => void;
  removeHouseholdMember: (id: string) => void;
}

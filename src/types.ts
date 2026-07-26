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
}

/** habitId -> array de datas (yyyy-MM-dd) em que o hábito foi concluído */
export type CompletionMap = Record<string, string[]>;

export interface HabitState {
  habits: Habit[];
  completions: CompletionMap;
  xp: number;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id">>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isCompleted: (habitId: string, date: string) => boolean;
}

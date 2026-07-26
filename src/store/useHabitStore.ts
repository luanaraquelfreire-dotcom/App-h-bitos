import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, HabitState } from "../types";
import { todayKey } from "../utils/date";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      xp: 0,

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: generateId(),
          createdAt: todayKey(),
          archived: false,
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      removeHabit: (id) => {
        set((state) => {
          const completions = { ...state.completions };
          delete completions[id];
          return {
            habits: state.habits.filter((h) => h.id !== id),
            completions,
          };
        });
      },

      toggleCompletion: (habitId, date) => {
        const state = get();
        const existing = state.completions[habitId] ?? [];
        const alreadyDone = existing.includes(date);
        const updated = alreadyDone
          ? existing.filter((d) => d !== date)
          : [...existing, date];
        set({
          completions: { ...state.completions, [habitId]: updated },
        });
      },

      isCompleted: (habitId, date) => {
        return get().completions[habitId]?.includes(date) ?? false;
      },
    }),
    {
      name: "habitos-app-storage",
    },
  ),
);

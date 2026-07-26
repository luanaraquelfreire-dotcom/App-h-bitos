import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, Habit, HabitState, MealPlanEntry, Recipe, Transaction } from "../types";
import { todayKey } from "../utils/date";
import { generateId } from "../utils/id";

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      xp: 0,
      tasks: [],
      drawnTaskId: null,
      completedTasksCount: 0,
      goals: [],
      recipes: [],
      mealPlans: [],
      peopleCount: 2,
      shoppingChecked: {},
      transactions: [],

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
            goals: state.goals.map((g) =>
              g.linkedHabitId === id ? { ...g, linkedHabitId: undefined } : g,
            ),
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

      addTask: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const newTask = { id: generateId(), text: trimmed, createdAt: todayKey() };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          drawnTaskId: state.drawnTaskId === id ? null : state.drawnTaskId,
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          drawnTaskId: state.drawnTaskId === id ? null : state.drawnTaskId,
          completedTasksCount: state.completedTasksCount + 1,
        }));
      },

      drawTask: () => {
        const { tasks, drawnTaskId } = get();
        if (tasks.length === 0) return;
        const candidates =
          tasks.length > 1 ? tasks.filter((t) => t.id !== drawnTaskId) : tasks;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        set({ drawnTaskId: pick.id });
      },

      clearDrawnTask: () => {
        set({ drawnTaskId: null });
      },

      addGoal: (goal) => {
        const newGoal: Goal = { ...goal, id: generateId(), createdAt: todayKey(), done: false };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      removeGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },

      toggleGoalDone: (id) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
        }));
      },

      addRecipe: (recipe) => {
        const newRecipe: Recipe = { ...recipe, id: generateId(), createdAt: todayKey() };
        set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      },

      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      removeRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
          mealPlans: state.mealPlans.filter((p) => p.recipeId !== id),
        }));
      },

      addMealPlan: (entry) => {
        const newEntry: MealPlanEntry = { ...entry, id: generateId(), createdAt: todayKey() };
        set((state) => ({ mealPlans: [...state.mealPlans, newEntry] }));
      },

      updateMealPlan: (id, updates) => {
        set((state) => ({
          mealPlans: state.mealPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      removeMealPlan: (id) => {
        set((state) => ({ mealPlans: state.mealPlans.filter((p) => p.id !== id) }));
      },

      setPeopleCount: (count) => {
        set({ peopleCount: Math.max(1, count) });
      },

      toggleShoppingChecked: (monthKey, itemKey) => {
        set((state) => {
          const existing = state.shoppingChecked[monthKey] ?? [];
          const updated = existing.includes(itemKey)
            ? existing.filter((k) => k !== itemKey)
            : [...existing, itemKey];
          return { shoppingChecked: { ...state.shoppingChecked, [monthKey]: updated } };
        });
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          createdAt: todayKey(),
        };
        set((state) => ({ transactions: [...state.transactions, newTransaction] }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },
    }),
    {
      name: "habitos-app-storage",
    },
  ),
);

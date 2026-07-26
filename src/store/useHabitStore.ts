import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Chore,
  Goal,
  Habit,
  HabitState,
  HouseholdMember,
  MealPlanEntry,
  Recipe,
  StudyItem,
  Transaction,
} from "../types";
import { todayKey } from "../utils/date";
import { generateId } from "../utils/id";

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      tasks: [],
      drawnTaskId: null,
      completedTasksCount: 0,
      goals: [],
      recipes: [],
      mealPlans: [],
      peopleCount: 2,
      shoppingChecked: {},
      transactions: [],
      chores: [],
      studyItems: [],
      householdMembers: [
        { id: generateId(), name: "Eu" },
        { id: generateId(), name: "Parceiro(a)" },
      ],

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
        const habit = state.habits.find((h) => h.id === habitId);
        const times = habit?.times ?? [];
        const existing = state.completions[habitId] ?? [];
        const alreadyDone = existing.includes(date);

        if (times.length > 0) {
          // hábito com múltiplos horários: alterna o dia inteiro (todos os horários juntos)
          const withoutDay = existing.filter(
            (k) => k !== date && !times.some((t) => k === `${date}::${t}`),
          );
          const updated = alreadyDone
            ? withoutDay
            : [...withoutDay, date, ...times.map((t) => `${date}::${t}`)];
          set({ completions: { ...state.completions, [habitId]: updated } });
          return;
        }

        const updated = alreadyDone
          ? existing.filter((d) => d !== date)
          : [...existing, date];
        set({
          completions: { ...state.completions, [habitId]: updated },
        });
      },

      toggleHabitTime: (habitId, date, time) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        const allTimes = habit?.times ?? [];
        const slotKey = `${date}::${time}`;
        const existing = state.completions[habitId] ?? [];
        const hasSlot = existing.includes(slotKey);
        let updated = hasSlot ? existing.filter((k) => k !== slotKey) : [...existing, slotKey];

        const allDone = allTimes.length > 0 && allTimes.every((t) => updated.includes(`${date}::${t}`));
        const hasDayEntry = updated.includes(date);
        if (allDone && !hasDayEntry) {
          updated = [...updated, date];
        } else if (!allDone && hasDayEntry) {
          updated = updated.filter((k) => k !== date);
        }

        set({
          completions: { ...state.completions, [habitId]: updated },
        });
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

      addChore: (chore) => {
        const newChore: Chore = { ...chore, id: generateId(), createdAt: todayKey() };
        set((state) => ({ chores: [...state.chores, newChore] }));
      },

      updateChore: (id, updates) => {
        set((state) => ({
          chores: state.chores.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeChore: (id) => {
        set((state) => ({ chores: state.chores.filter((c) => c.id !== id) }));
      },

      markChoreDone: (id) => {
        set((state) => ({
          chores: state.chores.map((c) => (c.id === id ? { ...c, lastDoneAt: todayKey() } : c)),
        }));
      },

      addStudyItem: (item) => {
        const newItem: StudyItem = {
          ...item,
          id: generateId(),
          createdAt: todayKey(),
          notes: [],
          sessions: [],
        };
        set((state) => ({ studyItems: [...state.studyItems, newItem] }));
      },

      updateStudyItem: (id, updates) => {
        set((state) => ({
          studyItems: state.studyItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
      },

      removeStudyItem: (id) => {
        set((state) => ({ studyItems: state.studyItems.filter((i) => i.id !== id) }));
      },

      addStudyNote: (itemId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => ({
          studyItems: state.studyItems.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  notes: [...i.notes, { id: generateId(), text: trimmed, createdAt: todayKey() }],
                }
              : i,
          ),
        }));
      },

      removeStudyNote: (itemId, noteId) => {
        set((state) => ({
          studyItems: state.studyItems.map((i) =>
            i.id === itemId ? { ...i, notes: i.notes.filter((n) => n.id !== noteId) } : i,
          ),
        }));
      },

      addStudySession: (itemId, minutes) => {
        if (minutes <= 0) return;
        set((state) => ({
          studyItems: state.studyItems.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  sessions: [...i.sessions, { id: generateId(), date: todayKey(), minutes }],
                }
              : i,
          ),
        }));
      },

      removeStudySession: (itemId, sessionId) => {
        set((state) => ({
          studyItems: state.studyItems.map((i) =>
            i.id === itemId
              ? { ...i, sessions: i.sessions.filter((s) => s.id !== sessionId) }
              : i,
          ),
        }));
      },

      addHouseholdMember: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const newMember: HouseholdMember = { id: generateId(), name: trimmed };
        set((state) => ({ householdMembers: [...state.householdMembers, newMember] }));
      },

      renameHouseholdMember: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          householdMembers: state.householdMembers.map((m) =>
            m.id === id ? { ...m, name: trimmed } : m,
          ),
        }));
      },

      removeHouseholdMember: (id) => {
        set((state) => ({
          householdMembers: state.householdMembers.filter((m) => m.id !== id),
          habits: state.habits.map((h) =>
            h.assignedTo === id ? { ...h, assignedTo: undefined } : h,
          ),
          chores: state.chores.map((c) =>
            c.assignedTo === id ? { ...c, assignedTo: undefined } : c,
          ),
        }));
      },
    }),
    {
      name: "habitos-app-storage",
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityEntry,
  Chore,
  Goal,
  Habit,
  HabitState,
  HouseholdMember,
  MealPlanEntry,
  PlannedPurchase,
  Recipe,
  StudyItem,
  Transaction,
} from "../types";
import { todayKey } from "../utils/date";
import { generateId } from "../utils/id";

const MAX_ACTIVITY_LOG = 300;

function pushActivity(
  log: ActivityEntry[],
  message: string,
  actorId: string | null,
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: generateId(),
    actorId: actorId ?? undefined,
    message,
    createdAt: new Date().toISOString(),
  };
  const next = [...log, entry];
  return next.length > MAX_ACTIVITY_LOG ? next.slice(next.length - MAX_ACTIVITY_LOG) : next;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      tasks: [],
      drawnTaskId: null,
      completedTasksCount: 0,
      choresDoneCount: 0,
      goals: [],
      recipes: [],
      mealPlans: [],
      peopleCount: 2,
      shoppingChecked: {},
      transactions: [],
      plannedPurchases: [],
      chores: [],
      studyItems: [],
      householdMembers: [
        { id: generateId(), name: "Eu" },
        { id: generateId(), name: "Parceiro(a)" },
      ],
      activityLog: [],
      currentMemberId: null,
      lastSeenActivityAt: null,

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: generateId(),
          createdAt: todayKey(),
          archived: false,
        };
        set((state) => ({
          habits: [...state.habits, newHabit],
          activityLog: pushActivity(
            state.activityLog,
            `criou o hábito "${newHabit.name}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => {
          const original = state.habits.find((h) => h.id === id);
          if (!original) return {};
          return {
            habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
            activityLog: pushActivity(
              state.activityLog,
              `editou o hábito "${original.name}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeHabit: (id) => {
        set((state) => {
          const removed = state.habits.find((h) => h.id === id);
          const completions = { ...state.completions };
          delete completions[id];
          return {
            habits: state.habits.filter((h) => h.id !== id),
            completions,
            goals: state.goals.map((g) =>
              g.linkedHabitId === id ? { ...g, linkedHabitId: undefined } : g,
            ),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu o hábito "${removed.name}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      toggleCompletion: (habitId, date) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        const times = habit?.times ?? [];
        const existing = state.completions[habitId] ?? [];
        const alreadyDone = existing.includes(date);
        const activityLog = habit
          ? pushActivity(
              state.activityLog,
              alreadyDone
                ? `desmarcou "${habit.name}"`
                : `marcou "${habit.name}" como feito`,
              state.currentMemberId,
            )
          : state.activityLog;

        if (times.length > 0) {
          // hábito com múltiplos horários: alterna o dia inteiro (todos os horários juntos)
          const withoutDay = existing.filter(
            (k) => k !== date && !times.some((t) => k === `${date}::${t}`),
          );
          const updated = alreadyDone
            ? withoutDay
            : [...withoutDay, date, ...times.map((t) => `${date}::${t}`)];
          set({ completions: { ...state.completions, [habitId]: updated }, activityLog });
          return;
        }

        const updated = alreadyDone
          ? existing.filter((d) => d !== date)
          : [...existing, date];
        set({
          completions: { ...state.completions, [habitId]: updated },
          activityLog,
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
          activityLog: habit
            ? pushActivity(
                state.activityLog,
                hasSlot
                  ? `desmarcou "${habit.name}" (${time})`
                  : `marcou "${habit.name}" (${time}) como feito`,
                state.currentMemberId,
              )
            : state.activityLog,
        });
      },

      addTask: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const newTask = { id: generateId(), text: trimmed, createdAt: todayKey() };
        set((state) => ({
          tasks: [...state.tasks, newTask],
          activityLog: pushActivity(
            state.activityLog,
            "adicionou uma tarefa na procrastinação",
            state.currentMemberId,
          ),
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          drawnTaskId: state.drawnTaskId === id ? null : state.drawnTaskId,
          activityLog: pushActivity(
            state.activityLog,
            "removeu uma tarefa da procrastinação",
            state.currentMemberId,
          ),
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          drawnTaskId: state.drawnTaskId === id ? null : state.drawnTaskId,
          completedTasksCount: state.completedTasksCount + 1,
          activityLog: pushActivity(
            state.activityLog,
            "concluiu a tarefa sorteada",
            state.currentMemberId,
          ),
        }));
      },

      drawTask: () => {
        const { tasks, drawnTaskId, activityLog, currentMemberId } = get();
        if (tasks.length === 0) return;
        const candidates =
          tasks.length > 1 ? tasks.filter((t) => t.id !== drawnTaskId) : tasks;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        set({
          drawnTaskId: pick.id,
          activityLog: pushActivity(activityLog, "sorteou uma nova tarefa", currentMemberId),
        });
      },

      clearDrawnTask: () => {
        set({ drawnTaskId: null });
      },

      addGoal: (goal) => {
        const newGoal: Goal = { ...goal, id: generateId(), createdAt: todayKey(), done: false };
        set((state) => ({
          goals: [...state.goals, newGoal],
          activityLog: pushActivity(
            state.activityLog,
            `criou a meta "${newGoal.title}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => {
          const original = state.goals.find((g) => g.id === id);
          if (!original) return {};
          return {
            goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
            activityLog: pushActivity(
              state.activityLog,
              `editou a meta "${original.title}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeGoal: (id) => {
        set((state) => {
          const removed = state.goals.find((g) => g.id === id);
          return {
            goals: state.goals.filter((g) => g.id !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu a meta "${removed.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      toggleGoalDone: (id) => {
        set((state) => {
          const goal = state.goals.find((g) => g.id === id);
          return {
            goals: state.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
            activityLog: goal
              ? pushActivity(
                  state.activityLog,
                  goal.done
                    ? `desmarcou a meta "${goal.title}"`
                    : `marcou a meta "${goal.title}" como concluída`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addRecipe: (recipe) => {
        const newRecipe: Recipe = { ...recipe, id: generateId(), createdAt: todayKey() };
        set((state) => ({
          recipes: [...state.recipes, newRecipe],
          activityLog: pushActivity(
            state.activityLog,
            `criou a receita "${newRecipe.name}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateRecipe: (id, updates) => {
        set((state) => {
          const original = state.recipes.find((r) => r.id === id);
          if (!original) return {};
          return {
            recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
            activityLog: pushActivity(
              state.activityLog,
              `editou a receita "${original.name}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeRecipe: (id) => {
        set((state) => {
          const removed = state.recipes.find((r) => r.id === id);
          return {
            recipes: state.recipes.filter((r) => r.id !== id),
            mealPlans: state.mealPlans.filter((p) => p.recipeId !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu a receita "${removed.name}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addMealPlan: (entry) => {
        const newEntry: MealPlanEntry = { ...entry, id: generateId(), createdAt: todayKey() };
        set((state) => {
          const recipe = state.recipes.find((r) => r.id === entry.recipeId);
          return {
            mealPlans: [...state.mealPlans, newEntry],
            activityLog: pushActivity(
              state.activityLog,
              recipe ? `planejou a refeição "${recipe.name}"` : "planejou uma refeição",
              state.currentMemberId,
            ),
          };
        });
      },

      updateMealPlan: (id, updates) => {
        set((state) => ({
          mealPlans: state.mealPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          activityLog: pushActivity(
            state.activityLog,
            "editou um planejamento de refeição",
            state.currentMemberId,
          ),
        }));
      },

      removeMealPlan: (id) => {
        set((state) => ({
          mealPlans: state.mealPlans.filter((p) => p.id !== id),
          activityLog: pushActivity(
            state.activityLog,
            "removeu um planejamento de refeição",
            state.currentMemberId,
          ),
        }));
      },

      setPeopleCount: (count) => {
        const value = Math.max(1, count);
        set((state) => ({
          peopleCount: value,
          activityLog: pushActivity(
            state.activityLog,
            `atualizou o número de pessoas para ${value}`,
            state.currentMemberId,
          ),
        }));
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
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          activityLog: pushActivity(
            state.activityLog,
            `registrou a transação "${newTransaction.description}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const original = state.transactions.find((t) => t.id === id);
          if (!original) return {};
          return {
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            activityLog: pushActivity(
              state.activityLog,
              `editou a transação "${original.description}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeTransaction: (id) => {
        set((state) => {
          const removed = state.transactions.find((t) => t.id === id);
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu a transação "${removed.description}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addPlannedPurchase: (purchase) => {
        const newPurchase: PlannedPurchase = {
          ...purchase,
          id: generateId(),
          createdAt: todayKey(),
        };
        set((state) => ({
          plannedPurchases: [...state.plannedPurchases, newPurchase],
          activityLog: pushActivity(
            state.activityLog,
            `planejou comprar "${newPurchase.name}"`,
            state.currentMemberId,
          ),
        }));
      },

      updatePlannedPurchase: (id, updates) => {
        set((state) => {
          const original = state.plannedPurchases.find((p) => p.id === id);
          if (!original) return {};
          return {
            plannedPurchases: state.plannedPurchases.map((p) =>
              p.id === id ? { ...p, ...updates } : p,
            ),
            activityLog: pushActivity(
              state.activityLog,
              `editou o item planejado "${original.name}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removePlannedPurchase: (id) => {
        set((state) => {
          const removed = state.plannedPurchases.find((p) => p.id === id);
          return {
            plannedPurchases: state.plannedPurchases.filter((p) => p.id !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `removeu "${removed.name}" do planejamento de compras`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addChore: (chore) => {
        const newChore: Chore = { ...chore, id: generateId(), createdAt: todayKey() };
        set((state) => ({
          chores: [...state.chores, newChore],
          activityLog: pushActivity(
            state.activityLog,
            `criou a tarefa de casa "${newChore.name}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateChore: (id, updates) => {
        set((state) => {
          const original = state.chores.find((c) => c.id === id);
          if (!original) return {};
          return {
            chores: state.chores.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            activityLog: pushActivity(
              state.activityLog,
              `editou a tarefa de casa "${original.name}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeChore: (id) => {
        set((state) => {
          const removed = state.chores.find((c) => c.id === id);
          return {
            chores: state.chores.filter((c) => c.id !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu a tarefa de casa "${removed.name}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      markChoreDone: (id) => {
        set((state) => {
          const today = todayKey();
          const chore = state.chores.find((c) => c.id === id);
          const alreadyDoneToday = chore?.lastDoneAt === today;
          return {
            chores: state.chores.map((c) => (c.id === id ? { ...c, lastDoneAt: today } : c)),
            choresDoneCount: alreadyDoneToday ? state.choresDoneCount : state.choresDoneCount + 1,
            activityLog:
              chore && !alreadyDoneToday
                ? pushActivity(
                    state.activityLog,
                    `marcou "${chore.name}" como feita`,
                    state.currentMemberId,
                  )
                : state.activityLog,
          };
        });
      },

      addStudyItem: (item) => {
        const newItem: StudyItem = {
          ...item,
          id: generateId(),
          createdAt: todayKey(),
          notes: [],
          sessions: [],
        };
        set((state) => ({
          studyItems: [...state.studyItems, newItem],
          activityLog: pushActivity(
            state.activityLog,
            `criou o item de estudo "${newItem.title}"`,
            state.currentMemberId,
          ),
        }));
      },

      updateStudyItem: (id, updates) => {
        set((state) => {
          const original = state.studyItems.find((i) => i.id === id);
          if (!original) return {};
          return {
            studyItems: state.studyItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
            activityLog: pushActivity(
              state.activityLog,
              `editou o item de estudo "${original.title}"`,
              state.currentMemberId,
            ),
          };
        });
      },

      removeStudyItem: (id) => {
        set((state) => {
          const removed = state.studyItems.find((i) => i.id === id);
          return {
            studyItems: state.studyItems.filter((i) => i.id !== id),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `excluiu o item de estudo "${removed.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addStudyNote: (itemId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => {
          const item = state.studyItems.find((i) => i.id === itemId);
          return {
            studyItems: state.studyItems.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    notes: [...i.notes, { id: generateId(), text: trimmed, createdAt: todayKey() }],
                  }
                : i,
            ),
            activityLog: item
              ? pushActivity(
                  state.activityLog,
                  `adicionou uma anotação em "${item.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      removeStudyNote: (itemId, noteId) => {
        set((state) => {
          const item = state.studyItems.find((i) => i.id === itemId);
          return {
            studyItems: state.studyItems.map((i) =>
              i.id === itemId ? { ...i, notes: i.notes.filter((n) => n.id !== noteId) } : i,
            ),
            activityLog: item
              ? pushActivity(
                  state.activityLog,
                  `removeu uma anotação de "${item.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addStudySession: (itemId, minutes) => {
        if (minutes <= 0) return;
        set((state) => {
          const item = state.studyItems.find((i) => i.id === itemId);
          return {
            studyItems: state.studyItems.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    sessions: [...i.sessions, { id: generateId(), date: todayKey(), minutes }],
                  }
                : i,
            ),
            activityLog: item
              ? pushActivity(
                  state.activityLog,
                  `registrou ${minutes} min de estudo em "${item.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      removeStudySession: (itemId, sessionId) => {
        set((state) => {
          const item = state.studyItems.find((i) => i.id === itemId);
          return {
            studyItems: state.studyItems.map((i) =>
              i.id === itemId
                ? { ...i, sessions: i.sessions.filter((s) => s.id !== sessionId) }
                : i,
            ),
            activityLog: item
              ? pushActivity(
                  state.activityLog,
                  `removeu uma sessão de estudo de "${item.title}"`,
                  state.currentMemberId,
                )
              : state.activityLog,
          };
        });
      },

      addHouseholdMember: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const newMember: HouseholdMember = { id: generateId(), name: trimmed };
        set((state) => ({
          householdMembers: [...state.householdMembers, newMember],
          activityLog: pushActivity(
            state.activityLog,
            `adicionou "${trimmed}" à casa`,
            state.currentMemberId,
          ),
        }));
      },

      renameHouseholdMember: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          householdMembers: state.householdMembers.map((m) =>
            m.id === id ? { ...m, name: trimmed } : m,
          ),
          activityLog: pushActivity(
            state.activityLog,
            `renomeou um integrante da casa para "${trimmed}"`,
            state.currentMemberId,
          ),
        }));
      },

      removeHouseholdMember: (id) => {
        set((state) => {
          const removed = state.householdMembers.find((m) => m.id === id);
          return {
            householdMembers: state.householdMembers.filter((m) => m.id !== id),
            habits: state.habits.map((h) =>
              h.assignedTo === id ? { ...h, assignedTo: undefined } : h,
            ),
            chores: state.chores.map((c) =>
              c.assignedTo === id ? { ...c, assignedTo: undefined } : c,
            ),
            activityLog: removed
              ? pushActivity(
                  state.activityLog,
                  `removeu "${removed.name}" da casa`,
                  state.currentMemberId,
                )
              : state.activityLog,
            currentMemberId: state.currentMemberId === id ? null : state.currentMemberId,
          };
        });
      },

      setCurrentMemberId: (id) => {
        set({ currentMemberId: id });
      },

      markActivitySeen: () => {
        set({ lastSeenActivityAt: new Date().toISOString() });
      },
    }),
    {
      name: "habitos-app-storage",
    },
  ),
);

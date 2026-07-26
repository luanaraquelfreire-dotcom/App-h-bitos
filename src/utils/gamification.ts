import { addDays, parseISO } from "date-fns";
import type { CompletionMap, Goal, Habit } from "../types";
import { toDateKey } from "./date";

export const XP_PER_COMPLETION = 10;
export const XP_PER_PROCRASTINATED_TASK = 20;

export function totalCompletions(completions: CompletionMap): number {
  return Object.values(completions).reduce((sum, dates) => sum + dates.length, 0);
}

export function calcXp(completions: CompletionMap, completedTasksCount = 0): number {
  return (
    totalCompletions(completions) * XP_PER_COMPLETION +
    completedTasksCount * XP_PER_PROCRASTINATED_TASK
  );
}

/** Nível cresce progressivamente: cada nível exige mais XP que o anterior. */
export function levelFromXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  let remaining = xp;
  let threshold = 50;
  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = Math.round(50 + level * 15);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: threshold };
}

function habitsScheduledOn(habits: Habit[], date: Date): Habit[] {
  const dateKey = toDateKey(date);
  const weekday = date.getDay();
  return habits.filter(
    (h) => !h.archived && h.daysOfWeek.includes(weekday) && h.createdAt <= dateKey,
  );
}

function isDayFullyDone(habits: Habit[], completions: CompletionMap, date: Date): boolean {
  const scheduled = habitsScheduledOn(habits, date);
  if (scheduled.length === 0) return true;
  return scheduled.every((h) => completions[h.id]?.includes(toDateKey(date)));
}

/**
 * Sequência atual de dias em que todas as metas do dia foram cumpridas.
 * O dia de hoje só entra na contagem se já estiver 100% concluído;
 * caso contrário, a sequência ainda é considerada "viva" (não quebrada).
 */
export function currentStreak(habits: Habit[], completions: CompletionMap): number {
  if (habits.length === 0) return 0;
  const today = new Date();
  let cursor = today;
  let streak = 0;
  const earliestCreation = habits.reduce(
    (min, h) => (h.createdAt < min ? h.createdAt : min),
    habits[0].createdAt,
  );

  for (let i = 0; i < 3650; i++) {
    const scheduled = habitsScheduledOn(habits, cursor);
    const fullyDone = isDayFullyDone(habits, completions, cursor);

    if (scheduled.length === 0) {
      if (toDateKey(cursor) < earliestCreation) break;
      cursor = addDays(cursor, -1);
      continue;
    }

    if (fullyDone) {
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    if (toDateKey(cursor) === toDateKey(today)) {
      // hoje ainda não terminou: não quebra a sequência, apenas não conta ainda
      cursor = addDays(cursor, -1);
      continue;
    }

    break;
  }

  return streak;
}

export function longestStreak(habits: Habit[], completions: CompletionMap): number {
  if (habits.length === 0) return 0;
  const earliestCreation = habits.reduce(
    (min, h) => (h.createdAt < min ? h.createdAt : min),
    habits[0].createdAt,
  );
  const start = parseISO(earliestCreation);
  const today = new Date();

  let longest = 0;
  let running = 0;
  let cursor = start;

  while (cursor <= today) {
    const scheduled = habitsScheduledOn(habits, cursor);
    if (scheduled.length === 0) {
      cursor = addDays(cursor, 1);
      continue;
    }
    const fullyDone = isDayFullyDone(habits, completions, cursor);
    if (fullyDone) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
    cursor = addDays(cursor, 1);
  }

  return longest;
}

export function dayCompletionRatio(habits: Habit[], completions: CompletionMap, date: Date): number {
  const scheduled = habitsScheduledOn(habits, date);
  if (scheduled.length === 0) return -1;
  const done = scheduled.filter((h) => completions[h.id]?.includes(toDateKey(date))).length;
  return done / scheduled.length;
}

export function goalProgress(goal: Goal, completions: CompletionMap): number {
  if (goal.type !== "progress" || !goal.linkedHabitId) return 0;
  return completions[goal.linkedHabitId]?.length ?? 0;
}

export function goalForHabit(goals: Goal[], habitId: string): Goal | undefined {
  return goals.find((g) => g.type === "progress" && g.linkedHabitId === habitId);
}

export { habitsScheduledOn };

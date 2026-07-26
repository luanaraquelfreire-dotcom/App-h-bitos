import type { Chore, CompletionMap, Habit, StudyItem, Transaction } from "../types";
import { toDateKey, weekDays } from "./date";

export interface WeeklySummaryData {
  habitsDone: number;
  habitsScheduled: number;
  studyHours: number;
  choresDone: number;
  income: number;
  expense: number;
  balance: number;
}

export function computeWeeklySummary(
  habits: Habit[],
  completions: CompletionMap,
  studyItems: StudyItem[],
  chores: Chore[],
  transactions: Transaction[],
  reference: Date = new Date(),
): WeeklySummaryData {
  const week = weekDays(reference);
  const weekKeys = new Set(week.map(toDateKey));

  let habitsDone = 0;
  let habitsScheduled = 0;
  const activeHabits = habits.filter((h) => !h.archived);
  for (const h of activeHabits) {
    for (const d of week) {
      if (h.daysOfWeek.includes(d.getDay()) && h.createdAt <= toDateKey(d)) {
        habitsScheduled += 1;
        if (completions[h.id]?.includes(toDateKey(d))) habitsDone += 1;
      }
    }
  }

  let studyMinutes = 0;
  for (const item of studyItems) {
    for (const session of item.sessions) {
      if (weekKeys.has(session.date)) studyMinutes += session.minutes;
    }
  }

  const choresDone = chores.filter((c) => c.lastDoneAt && weekKeys.has(c.lastDoneAt)).length;

  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!weekKeys.has(t.date)) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }

  return {
    habitsDone,
    habitsScheduled,
    studyHours: studyMinutes / 60,
    choresDone,
    income,
    expense,
    balance: income - expense,
  };
}

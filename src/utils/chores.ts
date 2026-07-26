import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Chore } from "../types";

export type ChoreUrgency = "never" | "overdue" | "dueToday" | "upcoming";

export interface ChoreStatus {
  daysSinceLastDone: number | null;
  daysUntilDue: number;
  urgency: ChoreUrgency;
}

export function choreStatusOn(chore: Chore, reference: Date): ChoreStatus {
  if (!chore.lastDoneAt) {
    return { daysSinceLastDone: null, daysUntilDue: 0, urgency: "never" };
  }
  const daysSinceLastDone = differenceInCalendarDays(reference, parseISO(chore.lastDoneAt));
  const daysUntilDue = chore.intervalDays - daysSinceLastDone;
  const urgency: ChoreUrgency =
    daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "dueToday" : "upcoming";
  return { daysSinceLastDone, daysUntilDue, urgency };
}

export function choreStatus(chore: Chore): ChoreStatus {
  return choreStatusOn(chore, new Date());
}

/** Se a tarefa está vencida ou a vencer hoje, tomando como referência a data informada. */
export function isChoreDueOn(chore: Chore, reference: Date): boolean {
  return choreStatusOn(chore, reference).urgency !== "upcoming";
}

const URGENCY_ORDER: Record<ChoreUrgency, number> = {
  never: 0,
  overdue: 1,
  dueToday: 2,
  upcoming: 3,
};

export function sortChoresByUrgency(chores: Chore[]): Chore[] {
  return [...chores].sort((a, b) => {
    const statusA = choreStatus(a);
    const statusB = choreStatus(b);
    const orderDiff = URGENCY_ORDER[statusA.urgency] - URGENCY_ORDER[statusB.urgency];
    if (orderDiff !== 0) return orderDiff;
    return statusA.daysUntilDue - statusB.daysUntilDue;
  });
}

export const CHORE_INTERVAL_PRESETS: { label: string; days: number }[] = [
  { label: "Diária", days: 1 },
  { label: "2 em 2 dias", days: 2 },
  { label: "3 em 3 dias", days: 3 },
  { label: "Semanal", days: 7 },
  { label: "Quinzenal", days: 14 },
  { label: "Mensal", days: 30 },
];

export const CHORE_EMOJIS = [
  "🧹", "🧺", "🧽", "🧼", "🚮", "🪣", "🧴", "🛁",
  "🚿", "🪟", "🛏️", "🍽️", "🌱", "🐾", "🔌", "🗑️",
];

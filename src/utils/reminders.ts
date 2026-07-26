import type { Chore, CompletionMap, Goal, Habit, StudyItem } from "../types";
import { isChoreDueOn } from "./chores";
import { toDateKey } from "./date";
import { habitsScheduledOn } from "./gamification";
import { studyDoneOn, studyItemsScheduledOn } from "./study";

export interface ReminderItem {
  id: string;
  time: string;
  emoji: string;
  name: string;
}

/** Itens com horário marcado, agendados para "now" e ainda não concluídos. */
export function getTodayReminders(
  habits: Habit[],
  completions: CompletionMap,
  chores: Chore[],
  goals: Goal[],
  studyItems: StudyItem[],
  now: Date,
): ReminderItem[] {
  const dateKey = toDateKey(now);
  const items: ReminderItem[] = [];

  for (const h of habitsScheduledOn(habits, now)) {
    if (h.times && h.times.length > 0) {
      for (const t of h.times) {
        if (!completions[h.id]?.includes(`${dateKey}::${t}`)) {
          items.push({ id: `habit-${h.id}-${t}`, time: t, emoji: h.emoji, name: h.name });
        }
      }
    } else if (h.time && !completions[h.id]?.includes(dateKey)) {
      items.push({ id: `habit-${h.id}`, time: h.time, emoji: h.emoji, name: h.name });
    }
  }

  for (const c of chores) {
    if (c.time && isChoreDueOn(c, now) && c.lastDoneAt !== dateKey) {
      items.push({ id: `chore-${c.id}`, time: c.time, emoji: c.emoji, name: c.name });
    }
  }

  for (const g of goals) {
    if (g.type === "single" && g.time && g.scheduledDate === dateKey && !g.done) {
      items.push({ id: `goal-${g.id}`, time: g.time, emoji: "🎯", name: g.title });
    }
  }

  for (const s of studyItemsScheduledOn(studyItems, now)) {
    if (s.time && !studyDoneOn(s, dateKey)) {
      items.push({ id: `study-${s.id}`, time: s.time, emoji: s.emoji, name: s.title });
    }
  }

  return items;
}

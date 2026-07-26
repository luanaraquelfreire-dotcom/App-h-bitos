import type { StudyItem, StudyStatus, StudyType } from "../types";
import { toDateKey, weekDays } from "./date";

export const STUDY_TYPE_LABELS: Record<StudyType, string> = {
  course: "Curso",
  reading: "Leitura",
  language: "Idioma",
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  paused: "Pausado",
};

export const STUDY_EMOJIS = [
  "📘", "📖", "🗣️", "🎓", "💻", "🧠", "✏️", "🌍",
  "🎧", "📝", "🔬", "🧮", "🖋️", "📐", "🧪", "🎨",
];

export interface WeeklyStudyProgress {
  daysStudied: number;
  hoursStudied: number;
}

/** Progresso da semana (domingo a sábado) que contém a data de referência. */
export function weeklyStudyProgress(item: StudyItem, reference: Date): WeeklyStudyProgress {
  const weekKeys = new Set(weekDays(reference).map(toDateKey));
  const sessionsThisWeek = item.sessions.filter((s) => weekKeys.has(s.date));
  const daysStudied = new Set(sessionsThisWeek.map((s) => s.date)).size;
  const minutesStudied = sessionsThisWeek.reduce((sum, s) => sum + s.minutes, 0);
  return { daysStudied, hoursStudied: minutesStudied / 60 };
}

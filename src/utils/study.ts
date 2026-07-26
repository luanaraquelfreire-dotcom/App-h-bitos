import type { StudyStatus, StudyType } from "../types";

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

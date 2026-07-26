import { useHabitStore } from "../store/useHabitStore";
import { todayKey } from "./date";

const BACKUP_KEYS = [
  "habits",
  "completions",
  "xp",
  "tasks",
  "drawnTaskId",
  "completedTasksCount",
  "goals",
  "recipes",
  "mealPlans",
  "peopleCount",
  "shoppingChecked",
  "transactions",
  "chores",
  "studyItems",
  "householdMembers",
] as const;

export function exportBackup(): void {
  const state = useHabitStore.getState();
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    data[key] = state[key];
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `habitos-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Arquivo inválido");
        }
        useHabitStore.setState(parsed);
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Arquivo inválido"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}

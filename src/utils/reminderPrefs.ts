const KEY = "habitos-reminders-enabled";

export function getRemindersEnabled(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export function setRemindersEnabled(enabled: boolean): void {
  localStorage.setItem(KEY, enabled ? "1" : "0");
}

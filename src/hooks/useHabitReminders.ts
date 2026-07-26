import { useEffect, useRef } from "react";
import { useHabitStore } from "../store/useHabitStore";
import { toDateKey } from "../utils/date";
import { getRemindersEnabled } from "../utils/reminderPrefs";
import { getTodayReminders, type ReminderItem } from "../utils/reminders";

const CHECK_INTERVAL_MS = 20_000;

function fireNotification(item: ReminderItem) {
  const body = `${item.emoji} ${item.name}`;
  const iconUrl = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Hora de cuidar da sua rotina", { body, icon: iconUrl });
    });
  } else {
    new Notification("Hora de cuidar da sua rotina", { body, icon: iconUrl });
  }
}

/** Verifica periodicamente se algum hábito/tarefa/meta/estudo agendado está na
 * hora certa e ainda não foi concluído, disparando uma notificação local.
 * Só funciona enquanto o app estiver aberto (ou tiver sido aberto há pouco
 * tempo, com o service worker ainda ativo) — não é um push de servidor. */
export function useHabitReminders(): void {
  const notifiedRef = useRef<Set<string>>(new Set());
  const lastDateRef = useRef<string>("");

  useEffect(() => {
    if (typeof Notification === "undefined") return;

    function check() {
      if (!getRemindersEnabled() || Notification.permission !== "granted") return;

      const now = new Date();
      const dateKey = toDateKey(now);
      if (dateKey !== lastDateRef.current) {
        notifiedRef.current = new Set();
        lastDateRef.current = dateKey;
      }

      const state = useHabitStore.getState();
      const items = getTodayReminders(
        state.habits,
        state.completions,
        state.chores,
        state.goals,
        state.studyItems,
        now,
      );
      const hhmm = now.toTimeString().slice(0, 5);

      for (const item of items) {
        if (item.time !== hhmm) continue;
        const key = `${dateKey}:${item.id}`;
        if (notifiedRef.current.has(key)) continue;
        notifiedRef.current.add(key);
        fireNotification(item);
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}

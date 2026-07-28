import { useEffect, useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import TopBar from "./components/TopBar";
import { useHabitReminders } from "./hooks/useHabitReminders";
import CalendarPage from "./pages/CalendarPage";
import FinancePage from "./pages/FinancePage";
import FoodPage from "./pages/FoodPage";
import ProfilePage from "./pages/ProfilePage";
import RoutinePage from "./pages/RoutinePage";
import TasksPage from "./pages/TasksPage";
import { useHabitStore } from "./store/useHabitStore";
import { calcXp, currentStreak } from "./utils/gamification";

const ROUTINE_SEED_FLAG = "habitos-app-routine-seeded-v1";
const MULTI_TIME_SEED_FLAG = "habitos-app-multitime-seeded-v1";

/** Horários padrão sugeridos para hábitos que se repetem várias vezes ao dia. */
const MULTI_TIME_DEFAULTS: Record<string, string[]> = {
  "beber água (protocolo)": ["08:00", "11:00", "14:00", "17:00", "20:00"],
  "pausa de 5 min a cada hora": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
};

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

/** Rotina extraída de "Rotina em construção": sono, água, alimentação, casa e leitura. */
const ROUTINE_HABITS = [
  { name: "Acordar com luz natural", emoji: "☀️", color: "yellow" as const, daysOfWeek: ALL_DAYS, time: "07:00" },
  { name: "Movimento leve", emoji: "🏃", color: "green" as const, daysOfWeek: [1, 3, 5], time: "07:10" },
  { name: "Café da manhã sentada, sem tela", emoji: "🍎", color: "yellow" as const, daysOfWeek: ALL_DAYS, time: "07:30" },
  { name: "Beber água (protocolo)", emoji: "💧", color: "blue" as const, daysOfWeek: ALL_DAYS },
  { name: "Pausa de 5 min a cada hora", emoji: "🚶", color: "blue" as const, daysOfWeek: WEEKDAYS },
  { name: "Organizar a casa (20 min)", emoji: "🧹", color: "purple" as const, daysOfWeek: ALL_DAYS },
  { name: "Lista de tarefas pendentes", emoji: "📝", color: "purple" as const, daysOfWeek: ALL_DAYS, time: "22:15" },
  { name: "Banho e cuidados pessoais", emoji: "🚿", color: "blue" as const, daysOfWeek: ALL_DAYS, time: "22:30" },
  { name: "Celular fora do quarto", emoji: "📵", color: "red" as const, daysOfWeek: ALL_DAYS, time: "23:00" },
  { name: "Leitura (15 min)", emoji: "📚", color: "purple" as const, daysOfWeek: ALL_DAYS, time: "23:00" },
  { name: "Deitar", emoji: "😴", color: "green" as const, daysOfWeek: ALL_DAYS, time: "23:15" },
  { name: "Preparo de refeições da semana", emoji: "🍲", color: "green" as const, daysOfWeek: [0] },
  { name: "Reset de quarta (arroz e proteína)", emoji: "🍳", color: "yellow" as const, daysOfWeek: [3] },
];

function App() {
  const [tab, setTab] = useState<Tab>("calendar");
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);

  useEffect(() => {
    if (!localStorage.getItem(ROUTINE_SEED_FLAG)) {
      localStorage.setItem(ROUTINE_SEED_FLAG, "1");
      const existingNames = new Set(habits.map((h) => h.name.trim().toLowerCase()));
      ROUTINE_HABITS.forEach((h) => {
        if (!existingNames.has(h.name.toLowerCase())) {
          addHabit(h);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(MULTI_TIME_SEED_FLAG)) {
      localStorage.setItem(MULTI_TIME_SEED_FLAG, "1");
      const currentHabits = useHabitStore.getState().habits;
      currentHabits.forEach((h) => {
        const defaults = MULTI_TIME_DEFAULTS[h.name.trim().toLowerCase()];
        if (defaults && (!h.times || h.times.length === 0)) {
          updateHabit(h.id, { times: defaults, time: undefined });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedTasksCount = useHabitStore((s) => s.completedTasksCount);
  const choresDoneCount = useHabitStore((s) => s.choresDoneCount);
  const studyItems = useHabitStore((s) => s.studyItems);
  const xp = calcXp(habits, completions, completedTasksCount, choresDoneCount, studyItems);
  const streak = currentStreak(habits, completions);

  useHabitReminders();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#fbfbfb]">
      <TopBar streak={streak} xp={xp} />
      <main className="flex-1 pb-6">
        {tab === "calendar" && <CalendarPage />}
        {tab === "habits" && <RoutinePage />}
        {tab === "food" && <FoodPage />}
        {tab === "finance" && <FinancePage />}
        {tab === "tasks" && <TasksPage />}
        {tab === "profile" && <ProfilePage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;

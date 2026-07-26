import { useEffect, useState } from "react";
import BottomNav, { type Tab } from "./components/BottomNav";
import TopBar from "./components/TopBar";
import HabitsPage from "./pages/HabitsPage";
import MonthPage from "./pages/MonthPage";
import ProfilePage from "./pages/ProfilePage";
import TodayPage from "./pages/TodayPage";
import WeekPage from "./pages/WeekPage";
import { useHabitStore } from "./store/useHabitStore";
import { calcXp, currentStreak } from "./utils/gamification";

const SEED_FLAG = "habitos-app-seeded";

const SEED_HABITS = [
  { name: "Beber água", emoji: "💧", color: "blue" as const, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  { name: "Exercitar-se", emoji: "🏃", color: "green" as const, daysOfWeek: [1, 3, 5] },
  { name: "Ler 10 páginas", emoji: "📚", color: "purple" as const, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  { name: "Meditar", emoji: "🧘", color: "yellow" as const, daysOfWeek: [1, 2, 3, 4, 5] },
];

function App() {
  const [tab, setTab] = useState<Tab>("today");
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const addHabit = useHabitStore((s) => s.addHabit);

  useEffect(() => {
    if (!localStorage.getItem(SEED_FLAG)) {
      localStorage.setItem(SEED_FLAG, "1");
      if (habits.length === 0) {
        SEED_HABITS.forEach((h) => addHabit(h));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xp = calcXp(completions);
  const streak = currentStreak(habits, completions);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#fbfbfb]">
      <TopBar streak={streak} xp={xp} />
      <main className="flex-1 pb-6">
        {tab === "today" && <TodayPage />}
        {tab === "week" && <WeekPage />}
        {tab === "month" && <MonthPage />}
        {tab === "habits" && <HabitsPage />}
        {tab === "profile" && <ProfilePage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;

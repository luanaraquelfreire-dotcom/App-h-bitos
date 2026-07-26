import { Award, Flame, Gem, Trophy } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import WeeklySummaryCard from "../components/WeeklySummaryCard";
import HouseholdMembersCard from "../components/HouseholdMembersCard";
import RemindersCard from "../components/RemindersCard";
import SyncStatusCard from "../components/SyncStatusCard";
import { useHabitStore } from "../store/useHabitStore";
import {
  calcXp,
  currentStreak,
  levelFromXp,
  longestStreak,
  totalCompletions,
} from "../utils/gamification";

interface Achievement {
  id: string;
  label: string;
  emoji: string;
  achieved: boolean;
}

export default function ProfilePage() {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const completedTasksCount = useHabitStore((s) => s.completedTasksCount);

  const xp = calcXp(habits, completions, completedTasksCount);
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(xp);
  const streak = currentStreak(habits, completions);
  const best = longestStreak(habits, completions);
  const total = totalCompletions(completions);
  const activeHabits = habits.filter((h) => !h.archived);

  const achievements: Achievement[] = [
    { id: "start", label: "Primeiro passo", emoji: "🌱", achieved: total >= 1 },
    { id: "streak3", label: "3 dias seguidos", emoji: "🔥", achieved: best >= 3 },
    { id: "streak7", label: "1 semana de foco", emoji: "⚡", achieved: best >= 7 },
    { id: "streak30", label: "1 mês de disciplina", emoji: "🏆", achieved: best >= 30 },
    { id: "completions25", label: "25 hábitos concluídos", emoji: "🎯", achieved: total >= 25 },
    { id: "completions100", label: "100 hábitos concluídos", emoji: "💎", achieved: total >= 100 },
    { id: "tasks5", label: "5 procrastinações vencidas", emoji: "🎲", achieved: completedTasksCount >= 5 },
  ];

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold text-duo-text">Perfil</h1>

      <WeeklySummaryCard />

      <div className="mb-5 flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-6">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-duo-purple-dark text-3xl font-semibold text-white">
          {level}
        </span>
        <p className="mt-2 font-semibold text-duo-text">Nível {level}</p>
        <div className="mt-3 w-2/3">
          <ProgressBar value={xpIntoLevel / xpForNextLevel} colorClass="bg-duo-purple-dark" />
          <p className="mt-1 text-center text-xs font-medium text-duo-gray-dark">
            {xpIntoLevel} / {xpForNextLevel} XP para o próximo nível
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <Flame className="fill-duo-yellow text-duo-yellow-dark" size={26} />
          <span className="mt-1 text-lg font-semibold text-duo-text">{streak}</span>
          <span className="text-[11px] font-medium text-duo-gray-dark">Sequência</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <Trophy className="fill-duo-yellow text-duo-yellow-dark" size={26} />
          <span className="mt-1 text-lg font-semibold text-duo-text">{best}</span>
          <span className="text-[11px] font-medium text-duo-gray-dark">Recorde</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <Gem className="fill-duo-blue text-duo-blue-dark" size={26} />
          <span className="mt-1 text-lg font-semibold text-duo-text">{xp}</span>
          <span className="text-[11px] font-medium text-duo-gray-dark">XP total</span>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl p-4">
        <p className="text-sm font-medium text-duo-gray-dark">
          {activeHabits.length} hábito{activeHabits.length !== 1 ? "s" : ""} ativo
          {activeHabits.length !== 1 ? "s" : ""} · {total} conclus{total !== 1 ? "ões" : "ão"} no total ·{" "}
          {completedTasksCount} tarefa{completedTasksCount !== 1 ? "s" : ""} vencida
          {completedTasksCount !== 1 ? "s" : ""} no sorteio
        </p>
      </div>

      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase text-duo-gray-dark">
        <Award size={16} /> Conquistas
      </h2>
      <div className="grid grid-cols-3 gap-2.5">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex flex-col items-center rounded-2xl border-2 py-4 text-center ${
              a.achieved ? "border-duo-yellow-dark bg-duo-yellow/15" : "border-duo-gray/60 bg-white/55 backdrop-blur-xl opacity-50"
            }`}
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="mt-1 px-1 text-[11px] font-medium text-duo-text">{a.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <RemindersCard />
        <SyncStatusCard />
        <HouseholdMembersCard />
      </div>
    </div>
  );
}

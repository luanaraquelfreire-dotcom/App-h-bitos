import { BookOpen, Home, ListChecks, Wallet } from "lucide-react";
import { useHabitStore } from "../store/useHabitStore";
import { formatWeekRange, weekDays } from "../utils/date";
import { formatCurrency } from "../utils/finance";
import { computeWeeklySummary } from "../utils/weeklySummary";

export default function WeeklySummaryCard() {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const studyItems = useHabitStore((s) => s.studyItems);
  const chores = useHabitStore((s) => s.chores);
  const transactions = useHabitStore((s) => s.transactions);

  const reference = new Date();
  const week = weekDays(reference);
  const summary = computeWeeklySummary(habits, completions, studyItems, chores, transactions, reference);

  const habitRatio = summary.habitsScheduled > 0 ? summary.habitsDone / summary.habitsScheduled : null;

  let message = "Cadastre hábitos para acompanhar sua semana.";
  if (habitRatio !== null) {
    if (habitRatio >= 0.8) message = "Semana muito boa, continue assim! 🎉";
    else if (habitRatio >= 0.5) message = "Boa semana, dá pra melhorar um pouco mais.";
    else message = "Semana mais parada. Bora recuperar o ritmo?";
  }

  return (
    <div className="mb-5 rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl p-4">
      <p className="mb-1 text-xs font-semibold uppercase text-duo-gray-dark">
        Resumo da semana
      </p>
      <p className="mb-3 text-xs font-semibold capitalize text-duo-gray-dark">
        {formatWeekRange(week)}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 rounded-xl bg-duo-green/10 px-3 py-2.5">
          <ListChecks size={18} className="shrink-0 text-duo-green-dark" />
          <span className="text-sm font-semibold text-duo-green-dark">
            {summary.habitsDone}/{summary.habitsScheduled}
            <span className="block text-[10px] font-medium text-duo-gray-dark">hábitos</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-duo-purple/10 px-3 py-2.5">
          <BookOpen size={18} className="shrink-0 text-duo-purple-dark" />
          <span className="text-sm font-semibold text-duo-purple-dark">
            {summary.studyHours.toFixed(1)}h
            <span className="block text-[10px] font-medium text-duo-gray-dark">estudadas</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-duo-yellow/15 px-3 py-2.5">
          <Home size={18} className="shrink-0 text-duo-yellow-dark" />
          <span className="text-sm font-semibold text-duo-yellow-dark">
            {summary.choresDone}
            <span className="block text-[10px] font-medium text-duo-gray-dark">tarefas de casa</span>
          </span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${
            summary.balance >= 0 ? "bg-duo-blue/10" : "bg-duo-red/10"
          }`}
        >
          <Wallet size={18} className={`shrink-0 ${summary.balance >= 0 ? "text-duo-blue-dark" : "text-duo-red-dark"}`} />
          <span
            className={`text-sm font-semibold ${summary.balance >= 0 ? "text-duo-blue-dark" : "text-duo-red-dark"}`}
          >
            {formatCurrency(summary.balance)}
            <span className="block text-[10px] font-medium text-duo-gray-dark">saldo</span>
          </span>
        </div>
      </div>

      <p className="text-xs font-semibold text-duo-gray-dark">{message}</p>
    </div>
  );
}

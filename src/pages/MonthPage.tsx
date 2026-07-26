import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import HabitCard from "../components/HabitCard";
import ProgressBar from "../components/ProgressBar";
import { useHabitStore } from "../store/useHabitStore";
import { COLOR_MAP } from "../utils/colors";
import { dayCompletionRatio, goalForHabit, goalProgress } from "../utils/gamification";
import {
  DAY_LABELS,
  formatLong,
  formatMonthYear,
  formatWeekRange,
  isSameMonthAs,
  isToday,
  monthGrid,
  nextMonth,
  nextWeek,
  prevMonth,
  prevWeek,
  toDateKey,
  weekDays,
} from "../utils/date";

function ratioColorClass(ratio: number): string {
  if (ratio < 0) return "bg-transparent";
  if (ratio === 0) return "bg-duo-gray";
  if (ratio < 1) return "bg-duo-yellow";
  return "bg-duo-green";
}

export default function MonthPage() {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const goals = useHabitStore((s) => s.goals);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const [reference, setReference] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const days = monthGrid(reference);
  const activeHabits = habits.filter((h) => !h.archived);

  const selectedKey = toDateKey(selected);
  const selectedWeekday = selected.getDay();
  const selectedHabits = activeHabits
    .filter((h) => h.daysOfWeek.includes(selectedWeekday) && h.createdAt <= selectedKey)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  const week = weekDays(selected);
  let weekScheduled = 0;
  let weekDone = 0;
  for (const h of activeHabits) {
    for (const d of week) {
      if (h.daysOfWeek.includes(d.getDay()) && h.createdAt <= toDateKey(d)) {
        weekScheduled += 1;
        if (completions[h.id]?.includes(toDateKey(d))) weekDone += 1;
      }
    }
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Mês</h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setReference((r) => prevMonth(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-extrabold text-duo-text">{formatMonthYear(reference)}</span>
        <button
          onClick={() => setReference((r) => nextMonth(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs font-bold text-duo-gray-dark">
        {DAY_LABELS.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = isSameMonthAs(d, reference);
          const ratio = dayCompletionRatio(activeHabits, completions, d);
          const isSelected = toDateKey(d) === toDateKey(selected);
          return (
            <button
              key={i}
              onClick={() => setSelected(d)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold ${
                inMonth ? "text-duo-text" : "text-duo-gray-dark/50"
              } ${isSelected ? "ring-2 ring-duo-blue" : ""} ${isToday(d) ? "bg-duo-blue/10" : ""}`}
            >
              <span>{d.getDate()}</span>
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${ratioColorClass(ratio)}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold text-duo-gray-dark">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-duo-green" /> Completo
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-duo-yellow" /> Parcial
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-duo-gray" /> Pendente
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setSelected((s) => prevWeek(s))}
            className="grid h-8 w-8 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-sm font-extrabold capitalize text-duo-text">
            Semana de {formatWeekRange(week)}
          </h2>
          <button
            onClick={() => setSelected((s) => nextWeek(s))}
            className="grid h-8 w-8 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {weekScheduled > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-sm font-bold text-duo-gray-dark">
              <span>
                {weekDone} de {weekScheduled} concluídos
              </span>
              <span>{Math.round((weekDone / weekScheduled) * 100)}%</span>
            </div>
            <ProgressBar value={weekDone / weekScheduled} colorClass="bg-duo-blue" />
          </div>
        )}

        {activeHabits.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
            <p className="font-extrabold text-duo-text">Nenhum hábito cadastrado</p>
            <p className="text-sm text-duo-gray-dark">Crie hábitos na aba "Hábitos".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="w-32 text-left text-xs font-bold uppercase text-duo-gray-dark">
                    Hábito
                  </th>
                  {week.map((d, i) => (
                    <th key={i} className="w-10 text-center text-xs font-bold text-duo-gray-dark">
                      <div>{DAY_LABELS[d.getDay()]}</div>
                      <div className={isToday(d) ? "text-duo-blue-dark" : ""}>{d.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeHabits.map((h) => {
                  const colors = COLOR_MAP[h.color];
                  const hasGoal = Boolean(goalForHabit(goals, h.id));
                  return (
                    <tr key={h.id} className="rounded-xl bg-white">
                      <td className="rounded-l-xl py-2 pl-3 text-sm font-bold text-duo-text">
                        <span className="mr-1.5">{h.emoji}</span>
                        {h.name}
                        {hasGoal && <span className="ml-1">🎯</span>}
                      </td>
                      {week.map((d, i) => {
                        const dateKey = toDateKey(d);
                        const scheduled = h.daysOfWeek.includes(d.getDay()) && h.createdAt <= dateKey;
                        const done = completions[h.id]?.includes(dateKey) ?? false;
                        return (
                          <td
                            key={i}
                            className={`py-2 text-center ${i === week.length - 1 ? "rounded-r-xl pr-2" : ""}`}
                          >
                            {scheduled ? (
                              <button
                                onClick={() => toggleCompletion(h.id, dateKey)}
                                className={`mx-auto grid h-7 w-7 place-items-center rounded-full border-2 ${
                                  done
                                    ? `${colors.bg} ${colors.border} text-white`
                                    : "border-duo-gray bg-white text-transparent"
                                }`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                            ) : (
                              <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-duo-gray" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-extrabold capitalize text-duo-text">
          {formatLong(selected)}
        </h2>
        {selectedHabits.length === 0 ? (
          <p className="text-sm text-duo-gray-dark">Nada programado para este dia.</p>
        ) : (
          <div className="space-y-2.5">
            {selectedHabits.map((h) => {
              const goal = goalForHabit(goals, h.id);
              return (
                <HabitCard
                  key={h.id}
                  habit={h}
                  done={completions[h.id]?.includes(selectedKey) ?? false}
                  onToggle={() => toggleCompletion(h.id, selectedKey)}
                  goalBadge={
                    goal
                      ? {
                          current: goalProgress(goal, completions),
                          target: goal.targetCount ?? 0,
                          unitLabel: goal.unitLabel,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

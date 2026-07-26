import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import { useHabitStore } from "../store/useHabitStore";
import { COLOR_MAP } from "../utils/colors";
import {
  DAY_LABELS,
  formatWeekRange,
  isToday,
  nextWeek,
  prevWeek,
  toDateKey,
  weekDays,
} from "../utils/date";
import { goalForHabit } from "../utils/gamification";

interface WeekPageProps {
  embedded?: boolean;
}

export default function WeekPage({ embedded }: WeekPageProps = {}) {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const goals = useHabitStore((s) => s.goals);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const [reference, setReference] = useState(new Date());

  const week = weekDays(reference);
  const activeHabits = habits.filter((h) => !h.archived);

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
    <div className={embedded ? "" : "px-4 py-4"}>
      {!embedded && <h1 className="mb-4 text-2xl font-semibold text-duo-text">Semana</h1>}

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setReference((r) => prevWeek(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold capitalize text-duo-text">{formatWeekRange(week)}</span>
        <button
          onClick={() => setReference((r) => nextWeek(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {weekScheduled > 0 && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-duo-gray-dark">
            <span>
              {weekDone} de {weekScheduled} concluídos
            </span>
            <span>{Math.round((weekDone / weekScheduled) * 100)}%</span>
          </div>
          <ProgressBar value={weekDone / weekScheduled} colorClass="bg-duo-blue-dark" />
        </div>
      )}

      {activeHabits.length === 0 ? (
        <EmptyState
          title="Nenhum hábito cadastrado"
          description='Crie hábitos na aba "Hábitos".'
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-32 text-left text-xs font-medium uppercase text-duo-gray-dark">
                  Hábito
                </th>
                {week.map((d, i) => (
                  <th key={i} className="w-10 text-center text-xs font-medium text-duo-gray-dark">
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
                    <td className="rounded-l-xl py-2 pl-3 text-sm font-medium text-duo-text">
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
                                  ? `${colors.bgStrong} ${colors.border} text-white`
                                  : "border-duo-gray/60 bg-white/55 backdrop-blur-xl text-transparent"
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
  );
}

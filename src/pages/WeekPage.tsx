import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
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

export default function WeekPage() {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const [reference, setReference] = useState(new Date());

  const days = weekDays(reference);
  const activeHabits = habits.filter((h) => !h.archived);

  let totalScheduled = 0;
  let totalDone = 0;
  for (const h of activeHabits) {
    for (const d of days) {
      if (h.daysOfWeek.includes(d.getDay()) && h.createdAt <= toDateKey(d)) {
        totalScheduled += 1;
        if (completions[h.id]?.includes(toDateKey(d))) totalDone += 1;
      }
    }
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Semana</h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setReference((r) => prevWeek(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-extrabold capitalize text-duo-text">{formatWeekRange(days)}</span>
        <button
          onClick={() => setReference((r) => nextWeek(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {totalScheduled > 0 && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-bold text-duo-gray-dark">
            <span>
              {totalDone} de {totalScheduled} concluídos
            </span>
            <span>{Math.round((totalDone / totalScheduled) * 100)}%</span>
          </div>
          <ProgressBar value={totalDone / totalScheduled} colorClass="bg-duo-blue" />
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
                {days.map((d, i) => (
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
                return (
                  <tr key={h.id} className="rounded-xl bg-white">
                    <td className="rounded-l-xl py-2 pl-3 text-sm font-bold text-duo-text">
                      <span className="mr-1.5">{h.emoji}</span>
                      {h.name}
                    </td>
                    {days.map((d, i) => {
                      const dateKey = toDateKey(d);
                      const scheduled = h.daysOfWeek.includes(d.getDay()) && h.createdAt <= dateKey;
                      const done = completions[h.id]?.includes(dateKey) ?? false;
                      return (
                        <td key={i} className={`py-2 text-center ${i === days.length - 1 ? "rounded-r-xl pr-2" : ""}`}>
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
  );
}

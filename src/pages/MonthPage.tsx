import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import HabitCard from "../components/HabitCard";
import { useHabitStore } from "../store/useHabitStore";
import { dayCompletionRatio, goalForHabit, goalProgress } from "../utils/gamification";
import { memberName } from "../utils/household";
import {
  DAY_LABELS,
  formatLong,
  formatMonthYear,
  isSameMonthAs,
  isToday,
  monthGrid,
  nextMonth,
  prevMonth,
  toDateKey,
} from "../utils/date";

function ratioColorClass(ratio: number): string {
  if (ratio < 0) return "bg-transparent";
  if (ratio === 0) return "bg-duo-gray";
  if (ratio < 1) return "bg-duo-yellow";
  return "bg-duo-green";
}

interface MonthPageProps {
  embedded?: boolean;
}

export default function MonthPage({ embedded }: MonthPageProps = {}) {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const goals = useHabitStore((s) => s.goals);
  const householdMembers = useHabitStore((s) => s.householdMembers);
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

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      {!embedded && <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Mês</h1>}

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
                  assigneeName={memberName(householdMembers, h.assignedTo)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

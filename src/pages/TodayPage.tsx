import { PartyPopper, Plus } from "lucide-react";
import { useState } from "react";
import HabitCard from "../components/HabitCard";
import ProgressBar from "../components/ProgressBar";
import HabitFormModal from "../components/HabitFormModal";
import { useHabitStore } from "../store/useHabitStore";
import { formatLong, todayKey } from "../utils/date";
import { goalForHabit, goalProgress } from "../utils/gamification";
import { memberName } from "../utils/household";

interface TodayPageProps {
  embedded?: boolean;
}

export default function TodayPage({ embedded }: TodayPageProps = {}) {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const goals = useHabitStore((s) => s.goals);
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const addHabit = useHabitStore((s) => s.addHabit);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date();
  const key = todayKey();
  const weekday = today.getDay();

  const todayHabits = habits
    .filter((h) => !h.archived && h.daysOfWeek.includes(weekday))
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  const doneCount = todayHabits.filter((h) => completions[h.id]?.includes(key)).length;
  const allDone = todayHabits.length > 0 && doneCount === todayHabits.length;
  const ratio = todayHabits.length > 0 ? doneCount / todayHabits.length : 0;

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      <p className={`text-sm font-bold capitalize text-duo-gray-dark ${embedded ? "mb-4" : "mb-1"}`}>
        {formatLong(today)}
      </p>
      {!embedded && <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Meta de hoje</h1>}

      {todayHabits.length > 0 && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-bold text-duo-gray-dark">
            <span>
              {doneCount} de {todayHabits.length} concluídos
            </span>
            <span>{Math.round(ratio * 100)}%</span>
          </div>
          <ProgressBar value={ratio} />
        </div>
      )}

      {allDone && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-duo-green-dark bg-duo-green/10 px-4 py-3 text-duo-green-dark">
          <PartyPopper size={26} />
          <div>
            <p className="font-extrabold">Mandou bem!</p>
            <p className="text-sm font-semibold">Você concluiu todos os hábitos de hoje.</p>
          </div>
        </div>
      )}

      {todayHabits.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
          <p className="mb-1 font-extrabold text-duo-text">Nada programado para hoje</p>
          <p className="text-sm text-duo-gray-dark">Adicione um hábito para começar sua rotina.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {todayHabits.map((h) => {
          const goal = goalForHabit(goals, h.id);
          return (
            <HabitCard
              key={h.id}
              habit={h}
              done={completions[h.id]?.includes(key) ?? false}
              onToggle={() => toggleCompletion(h.id, key)}
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

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
      >
        <Plus size={20} strokeWidth={3} />
        Novo hábito
      </button>

      {showAdd && (
        <HabitFormModal
          householdMembers={householdMembers}
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addHabit(data);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

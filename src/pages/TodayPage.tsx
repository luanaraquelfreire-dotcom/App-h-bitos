import { PartyPopper, Plus } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
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
  const toggleHabitTime = useHabitStore((s) => s.toggleHabitTime);
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
        <EmptyState
          title="Nada programado para hoje"
          description="Adicione um hábito para começar sua rotina."
        />
      )}

      <div className="space-y-2.5">
        {todayHabits.flatMap((h) => {
          const goal = goalForHabit(goals, h.id);
          const goalBadge = goal
            ? {
                current: goalProgress(goal, completions),
                target: goal.targetCount ?? 0,
                unitLabel: goal.unitLabel,
              }
            : undefined;
          const assigneeName = memberName(householdMembers, h.assignedTo);

          if (h.times && h.times.length > 0) {
            return h.times.map((t) => (
              <HabitCard
                key={`${h.id}-${t}`}
                habit={{ ...h, time: t }}
                done={completions[h.id]?.includes(`${key}::${t}`) ?? false}
                onToggle={() => toggleHabitTime(h.id, key, t)}
                goalBadge={goalBadge}
                assigneeName={assigneeName}
              />
            ));
          }

          return [
            <HabitCard
              key={h.id}
              habit={h}
              done={completions[h.id]?.includes(key) ?? false}
              onToggle={() => toggleCompletion(h.id, key)}
              goalBadge={goalBadge}
              assigneeName={assigneeName}
            />,
          ];
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

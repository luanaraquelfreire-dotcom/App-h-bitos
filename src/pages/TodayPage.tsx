import { Check, PartyPopper, Plus, User } from "lucide-react";
import { useState } from "react";
import ChoreFormModal from "../components/ChoreFormModal";
import EmptyState from "../components/EmptyState";
import HabitCard from "../components/HabitCard";
import ProgressBar from "../components/ProgressBar";
import HabitFormModal from "../components/HabitFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { Chore } from "../types";
import { isChoreDueOn } from "../utils/chores";
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
  const chores = useHabitStore((s) => s.chores);
  const markChoreDone = useHabitStore((s) => s.markChoreDone);
  const updateChore = useHabitStore((s) => s.updateChore);
  const removeChore = useHabitStore((s) => s.removeChore);
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const toggleHabitTime = useHabitStore((s) => s.toggleHabitTime);
  const addHabit = useHabitStore((s) => s.addHabit);
  const [showAdd, setShowAdd] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const today = new Date();
  const key = todayKey();
  const weekday = today.getDay();

  const todayHabits = habits
    .filter((h) => !h.archived && h.daysOfWeek.includes(weekday))
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  const doneCount = todayHabits.filter((h) => completions[h.id]?.includes(key)).length;
  const allDone = todayHabits.length > 0 && doneCount === todayHabits.length;
  const ratio = todayHabits.length > 0 ? doneCount / todayHabits.length : 0;

  const todayChores = chores.filter((c) => isChoreDueOn(c, today) || c.lastDoneAt === key);

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      <p className={`text-sm font-medium capitalize text-duo-gray-dark ${embedded ? "mb-4" : "mb-1"}`}>
        {formatLong(today)}
      </p>
      {!embedded && <h1 className="mb-4 text-2xl font-semibold text-duo-text">Meta de hoje</h1>}

      {todayHabits.length > 0 && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-duo-gray-dark">
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
            <p className="font-semibold">Mandou bem!</p>
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

      {todayChores.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold uppercase text-duo-gray-dark">
            Tarefas de casa
          </h2>
          <div className="space-y-2.5">
            {todayChores.map((c) => {
              const done = c.lastDoneAt === key;
              const assignee = memberName(householdMembers, c.assignedTo);
              return (
                <div
                  key={c.id}
                  className={`duo-card flex items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3 transition-opacity ${
                    done ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={() => setEditingChore(c)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-duo-purple/15 text-xl">
                      {c.emoji}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-medium ${done ? "text-duo-gray-dark line-through" : "text-duo-text"}`}
                      >
                        {c.name}
                      </span>
                      <span
                        className={`mt-0.5 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          assignee
                            ? "bg-duo-purple/15 text-duo-purple-dark"
                            : "bg-duo-gray/60 text-duo-gray-dark"
                        }`}
                      >
                        <User size={10} />
                        {assignee ?? "Definir responsável"}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => markChoreDone(c.id)}
                    className={`duo-btn grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
                      done
                        ? "border-duo-purple-dark bg-duo-purple-dark text-white"
                        : "border-duo-gray/60 bg-white/55 backdrop-blur-xl text-duo-gray"
                    }`}
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue-dark py-3.5 font-semibold uppercase tracking-wide text-white"
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

      {editingChore && (
        <ChoreFormModal
          initial={editingChore}
          householdMembers={householdMembers}
          onClose={() => setEditingChore(null)}
          onSave={(data) => {
            updateChore(editingChore.id, data);
            setEditingChore(null);
          }}
          onDelete={() => {
            removeChore(editingChore.id);
            setEditingChore(null);
          }}
        />
      )}
    </div>
  );
}

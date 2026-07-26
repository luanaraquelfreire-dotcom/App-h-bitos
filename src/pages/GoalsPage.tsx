import { Check, Target } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import GoalFormModal from "../components/GoalFormModal";
import ProgressBar from "../components/ProgressBar";
import { useHabitStore } from "../store/useHabitStore";
import type { Goal, Habit, HabitColor } from "../types";
import { daysUntilYearEnd } from "../utils/date";
import { goalProgress } from "../utils/gamification";

interface GoalsPageProps {
  embedded?: boolean;
}

export default function GoalsPage({ embedded }: GoalsPageProps = {}) {
  const goals = useHabitStore((s) => s.goals);
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const addGoal = useHabitStore((s) => s.addGoal);
  const updateGoal = useHabitStore((s) => s.updateGoal);
  const removeGoal = useHabitStore((s) => s.removeGoal);
  const toggleGoalDone = useHabitStore((s) => s.toggleGoalDone);
  const addHabit = useHabitStore((s) => s.addHabit);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const daysLeft = daysUntilYearEnd();

  function createHabitAndLink(data: {
    name: string;
    emoji: string;
    color: HabitColor;
    daysOfWeek: number[];
    time?: string;
    times?: string[];
    assignedTo?: string;
  }): string {
    addHabit(data);
    const latest = useHabitStore.getState().habits;
    return latest[latest.length - 1].id;
  }

  const activeHabits = habits.filter((h: Habit) => !h.archived);

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      {!embedded && <h1 className="mb-1 text-2xl font-semibold text-duo-text">Metas do ano</h1>}
      <p className="mb-4 text-sm font-semibold text-duo-gray-dark">
        Faltam {daysLeft} dias para o fim do ano.
      </p>

      {goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta cadastrada"
          description='Cadastre um objetivo do ano: uma tarefa única (ex: renovar a CNH) ou uma meta que precisa virar hábito (ex: praticar exercícios 200 dias).'
        />
      ) : (
        <div className="mb-5 space-y-2.5">
          {goals.map((g) => {
            if (g.type === "single") {
              return (
                <div
                  key={g.id}
                  className="duo-card flex items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3"
                >
                  <button
                    onClick={() => toggleGoalDone(g.id)}
                    className={`duo-btn grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
                      g.done
                        ? "border-duo-green-dark bg-duo-green-dark text-white"
                        : "border-duo-gray/60 bg-white/55 backdrop-blur-xl text-duo-gray"
                    }`}
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => setEditing(g)}
                    className={`flex-1 text-left font-medium ${
                      g.done ? "text-duo-gray-dark line-through" : "text-duo-text"
                    }`}
                  >
                    {g.title}
                  </button>
                </div>
              );
            }

            const habit = habits.find((h) => h.id === g.linkedHabitId);
            const current = goalProgress(g, completions);
            const target = g.targetCount ?? 0;
            const ratio = target > 0 ? Math.min(current / target, 1) : 0;
            const remaining = Math.max(target - current, 0);
            const perWeek =
              daysLeft > 0 && remaining > 0 ? (remaining / (daysLeft / 7)).toFixed(1) : null;

            return (
              <button
                key={g.id}
                onClick={() => setEditing(g)}
                className="duo-card block w-full rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3 text-left"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-medium text-duo-text">{g.title}</span>
                  <span className="shrink-0 text-xs font-semibold text-duo-purple-dark">
                    {current}/{target} {g.unitLabel}
                  </span>
                </div>
                <ProgressBar value={ratio} colorClass="bg-duo-purple-dark" />
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-duo-gray-dark">
                  <span>{habit ? `${habit.emoji} ${habit.name}` : "Sem hábito vinculado"}</span>
                  {remaining === 0 ? (
                    <span className="text-duo-green-dark">Meta batida! 🎉</span>
                  ) : (
                    perWeek && <span>~{perWeek}x/semana até 31/12</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-yellow-dark bg-duo-yellow-dark py-3.5 font-semibold uppercase tracking-wide text-white"
      >
        <Target size={20} />
        Nova meta
      </button>

      {showAdd && (
        <GoalFormModal
          habits={activeHabits}
          householdMembers={householdMembers}
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addGoal(data);
            setShowAdd(false);
          }}
          onCreateHabit={createHabitAndLink}
        />
      )}

      {editing && (
        <GoalFormModal
          initial={editing}
          habits={activeHabits}
          householdMembers={householdMembers}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            updateGoal(editing.id, data);
            setEditing(null);
          }}
          onDelete={() => {
            removeGoal(editing.id);
            setEditing(null);
          }}
          onCreateHabit={createHabitAndLink}
        />
      )}
    </div>
  );
}

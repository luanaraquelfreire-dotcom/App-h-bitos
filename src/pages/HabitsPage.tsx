import { Plus } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import HabitFormModal from "../components/HabitFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { Habit } from "../types";
import { COLOR_MAP } from "../utils/colors";
import { DAY_LABELS } from "../utils/date";
import { goalForHabit, goalProgress } from "../utils/gamification";
import { memberName } from "../utils/household";

interface HabitsPageProps {
  embedded?: boolean;
}

export default function HabitsPage({ embedded }: HabitsPageProps = {}) {
  const habits = useHabitStore((s) => s.habits);
  const goals = useHabitStore((s) => s.goals);
  const completions = useHabitStore((s) => s.completions);
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [personFilter, setPersonFilter] = useState<string>("all");

  const activeHabits = habits
    .filter((h) => !h.archived)
    .filter((h) => personFilter === "all" || h.assignedTo === personFilter);

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      {!embedded && <h1 className="mb-4 text-2xl font-semibold text-duo-text">Meus hábitos</h1>}

      {householdMembers.length > 0 && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setPersonFilter("all")}
            className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
              personFilter === "all"
                ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            Todos
          </button>
          {householdMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setPersonFilter(m.id)}
              className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                personFilter === m.id
                  ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {activeHabits.length === 0 ? (
        <EmptyState
          title="Você ainda não tem hábitos"
          description="Toque no botão abaixo para criar o primeiro."
        />
      ) : (
        <div className="space-y-2.5">
          {activeHabits.map((h) => {
            const colors = COLOR_MAP[h.color];
            const daysLabel =
              h.daysOfWeek.length === 7
                ? "Todos os dias"
                : h.daysOfWeek.map((d) => DAY_LABELS[d]).join(" ");
            const detailLabel =
              h.times && h.times.length > 0
                ? `${h.times.length}x ao dia · ${daysLabel}`
                : h.time
                  ? `${h.time} · ${daysLabel}`
                  : daysLabel;
            const goal = goalForHabit(goals, h.id);
            const assignee = memberName(householdMembers, h.assignedTo);
            return (
              <button
                key={h.id}
                onClick={() => setEditing(h)}
                className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3 text-left"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl ${colors.bgSoft}`}>
                  {h.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-duo-text">{h.name}</span>
                  <span className="block text-xs font-semibold text-duo-gray-dark">{detailLabel}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {goal && (
                      <span className="inline-block truncate rounded-full bg-duo-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-duo-yellow-dark">
                        🎯 {goal.title} · {goalProgress(goal, completions)}/{goal.targetCount}{" "}
                        {goal.unitLabel}
                      </span>
                    )}
                    {assignee && (
                      <span className="inline-block rounded-full bg-duo-blue/15 px-2 py-0.5 text-[10px] font-semibold text-duo-blue-dark">
                        {assignee}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
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

      {editing && (
        <HabitFormModal
          initial={editing}
          householdMembers={householdMembers}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            updateHabit(editing.id, data);
            setEditing(null);
          }}
          onDelete={() => {
            removeHabit(editing.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

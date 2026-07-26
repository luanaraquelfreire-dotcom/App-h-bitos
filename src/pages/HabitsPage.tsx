import { Plus } from "lucide-react";
import { useState } from "react";
import HabitFormModal from "../components/HabitFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { Habit } from "../types";
import { COLOR_MAP } from "../utils/colors";
import { DAY_LABELS } from "../utils/date";

export default function HabitsPage() {
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const activeHabits = habits.filter((h) => !h.archived);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Meus hábitos</h1>

      {activeHabits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
          <p className="mb-1 font-extrabold text-duo-text">Você ainda não tem hábitos</p>
          <p className="text-sm text-duo-gray-dark">Toque no botão abaixo para criar o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeHabits.map((h) => {
            const colors = COLOR_MAP[h.color];
            const daysLabel =
              h.daysOfWeek.length === 7
                ? "Todos os dias"
                : h.daysOfWeek.map((d) => DAY_LABELS[d]).join(" ");
            const detailLabel = h.time ? `${h.time} · ${daysLabel}` : daysLabel;
            return (
              <button
                key={h.id}
                onClick={() => setEditing(h)}
                className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl ${colors.bgSoft}`}>
                  {h.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-duo-text">{h.name}</span>
                  <span className="block text-xs font-semibold text-duo-gray-dark">{detailLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
      >
        <Plus size={20} strokeWidth={3} />
        Novo hábito
      </button>

      {showAdd && (
        <HabitFormModal
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

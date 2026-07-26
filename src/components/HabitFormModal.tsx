import { useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Habit, HabitColor } from "../types";
import { COLOR_MAP, HABIT_COLORS, HABIT_EMOJIS } from "../utils/colors";
import { DAY_LABELS } from "../utils/date";

interface HabitFormModalProps {
  initial?: Habit;
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    color: HabitColor;
    daysOfWeek: number[];
    time?: string;
  }) => void;
  onDelete?: () => void;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function HabitFormModal({ initial, onClose, onSave, onDelete }: HabitFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState<HabitColor>(initial?.color ?? "green");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.daysOfWeek ?? ALL_DAYS);
  const [time, setTime] = useState(initial?.time ?? "");

  const canSave = name.trim().length > 0 && daysOfWeek.length > 0;

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave({ name: name.trim(), emoji, color, daysOfWeek, time: time || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-duo-text">
            {initial ? "Editar hábito" : "Novo hábito"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
          >
            <X size={20} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Nome do hábito
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Beber água"
          maxLength={40}
          className="mb-4 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Ícone</label>
        <div className="mb-4 grid grid-cols-8 gap-2">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`grid aspect-square place-items-center rounded-xl border-2 text-lg ${
                emoji === e ? "border-duo-blue bg-duo-blue/10" : "border-transparent bg-duo-gray/40"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Cor</label>
        <div className="mb-4 flex gap-3">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-9 w-9 rounded-full ${COLOR_MAP[c].bg} ${
                color === c ? "ring-2 ring-offset-2 " + COLOR_MAP[c].ring : ""
              }`}
              aria-label={c}
            />
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Horário (opcional)
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Repetir nos dias
        </label>
        <div className="mb-6 flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-extrabold ${
                daysOfWeek.includes(i)
                  ? "border-duo-green-dark bg-duo-green text-white"
                  : "border-duo-gray bg-white text-duo-gray-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 text-center font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Criar hábito"}
        </button>

        {initial && onDelete && (
          <button
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-extrabold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir hábito
          </button>
        )}
      </div>
    </div>
  );
}

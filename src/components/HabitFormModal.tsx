import { useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Habit, HabitColor, HouseholdMember } from "../types";
import { COLOR_MAP, HABIT_COLORS, HABIT_EMOJIS } from "../utils/colors";
import { DAY_LABELS } from "../utils/date";
import ConfirmDialog from "./ConfirmDialog";
import ModalShell from "./ModalShell";

interface HabitFormModalProps {
  initial?: Habit;
  householdMembers: HouseholdMember[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    color: HabitColor;
    daysOfWeek: number[];
    time?: string;
    times?: string[];
    assignedTo?: string;
  }) => void;
  onDelete?: () => void;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function HabitFormModal({
  initial,
  householdMembers,
  onClose,
  onSave,
  onDelete,
}: HabitFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState<HabitColor>(initial?.color ?? "green");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.daysOfWeek ?? ALL_DAYS);
  const [times, setTimes] = useState<string[]>(
    initial?.times && initial.times.length > 0
      ? initial.times
      : initial?.time
        ? [initial.time]
        : [""],
  );
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = name.trim().length > 0 && daysOfWeek.length > 0;

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function updateTimeAt(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addTimeSlot() {
    setTimes((prev) => [...prev, ""]);
  }

  function removeTimeSlot(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!canSave) return;
    const filledTimes = times.map((t) => t.trim()).filter(Boolean);
    onSave({
      name: name.trim(),
      emoji,
      color,
      daysOfWeek,
      time: filledTimes.length === 1 ? filledTimes[0] : undefined,
      times: filledTimes.length > 1 ? filledTimes : undefined,
      assignedTo: assignedTo || undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Editar hábito" : "Novo hábito"} onClose={onClose}>

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Nome do hábito
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Beber água"
          maxLength={40}
          className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">Ícone</label>
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

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">Cor</label>
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

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Horários (opcional)
        </label>
        <p className="mb-2 text-xs font-semibold text-duo-gray-dark">
          Adicione mais de um horário se o hábito se repete ao longo do dia (ex: beber água).
        </p>
        <div className="mb-2 space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={t}
                onChange={(e) => updateTimeAt(i, e.target.value)}
                className="flex-1 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
              />
              {times.length > 1 && (
                <button
                  onClick={() => removeTimeSlot(i)}
                  aria-label="Remover horário"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addTimeSlot}
          className="mb-4 text-sm font-semibold text-duo-blue-dark"
        >
          + Adicionar horário
        </button>

        {householdMembers.length > 0 && (
          <>
            <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
              Responsável (opcional)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
            >
              <option value="">Qualquer um</option>
              {householdMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Repetir nos dias
        </label>
        <div className="mb-6 flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold ${
                daysOfWeek.includes(i)
                  ? "border-duo-green-dark bg-duo-green-dark text-white"
                  : "border-duo-gray/60 bg-white/55 backdrop-blur-xl text-duo-gray-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green-dark py-3.5 text-center font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Criar hábito"}
        </button>

        {initial && onDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir hábito
          </button>
        )}

        {confirmingDelete && onDelete && (
          <ConfirmDialog
            title="Excluir hábito?"
            message={`Isso vai apagar "${name}" e todo o histórico de conclusões dele. Essa ação não pode ser desfeita.`}
            onConfirm={onDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
    </ModalShell>
  );
}

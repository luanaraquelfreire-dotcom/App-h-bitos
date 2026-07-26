import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Chore, HouseholdMember } from "../types";
import { CHORE_EMOJIS, CHORE_INTERVAL_PRESETS } from "../utils/chores";
import ConfirmDialog from "./ConfirmDialog";
import ModalShell from "./ModalShell";

interface ChoreFormModalProps {
  initial?: Chore;
  householdMembers: HouseholdMember[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    intervalDays: number;
    assignedTo?: string;
    time?: string;
  }) => void;
  onDelete?: () => void;
}

export default function ChoreFormModal({
  initial,
  householdMembers,
  onClose,
  onSave,
  onDelete,
}: ChoreFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? CHORE_EMOJIS[0]);
  const [intervalDays, setIntervalDays] = useState(initial?.intervalDays?.toString() ?? "7");
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = name.trim().length > 0 && Number(intervalDays) > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      emoji,
      intervalDays: Number(intervalDays),
      assignedTo: assignedTo || undefined,
      time: time || undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Editar tarefa" : "Nova tarefa de casa"} onClose={onClose}>
        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Nome da tarefa
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Trocar toalhas"
          maxLength={50}
          className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">Ícone</label>
        <div className="mb-4 grid grid-cols-8 gap-2">
          {CHORE_EMOJIS.map((e) => (
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

        <label className="mb-2 block text-xs font-medium uppercase text-duo-gray-dark">
          Repetir a cada quantos dias
        </label>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {CHORE_INTERVAL_PRESETS.map((preset) => (
            <button
              key={preset.days}
              onClick={() => setIntervalDays(preset.days.toString())}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                Number(intervalDays) === preset.days
                  ? "border-duo-green-dark bg-duo-green/10 text-duo-green-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mb-6 flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            className="w-24 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
          />
          <span className="text-sm font-semibold text-duo-gray-dark">dias</span>
        </div>

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Horário (opcional)
        </label>
        <p className="mb-2 text-xs font-semibold text-duo-gray-dark">
          Define um horário pra essa tarefa aparecer na agenda do dia, quando estiver vencida.
        </p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-6 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
        />

        {householdMembers.length > 0 && (
          <>
            <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
              Responsável (opcional)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="mb-6 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
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

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green-dark py-3.5 text-center font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Criar tarefa"}
        </button>

        {initial && onDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir tarefa
          </button>
        )}

        {confirmingDelete && onDelete && (
          <ConfirmDialog
            title="Excluir tarefa?"
            message={`Isso vai apagar "${name}" e o histórico de quando foi feita. Essa ação não pode ser desfeita.`}
            onConfirm={onDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
    </ModalShell>
  );
}

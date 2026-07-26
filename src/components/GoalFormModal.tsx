import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Goal, GoalType, Habit, HabitColor, HouseholdMember } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import HabitFormModal from "./HabitFormModal";
import ModalShell from "./ModalShell";

interface GoalFormModalProps {
  initial?: Goal;
  habits: Habit[];
  householdMembers: HouseholdMember[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: GoalType;
    targetCount?: number;
    unitLabel?: string;
    linkedHabitId?: string;
    scheduledDate?: string;
    time?: string;
  }) => void;
  onDelete?: () => void;
  onCreateHabit: (data: {
    name: string;
    emoji: string;
    color: HabitColor;
    daysOfWeek: number[];
    time?: string;
    times?: string[];
    assignedTo?: string;
  }) => string;
}

export default function GoalFormModal({
  initial,
  habits,
  householdMembers,
  onClose,
  onSave,
  onDelete,
  onCreateHabit,
}: GoalFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<GoalType>(initial?.type ?? "single");
  const [targetCount, setTargetCount] = useState(initial?.targetCount?.toString() ?? "200");
  const [unitLabel, setUnitLabel] = useState(initial?.unitLabel ?? "vezes");
  const [linkedHabitId, setLinkedHabitId] = useState(initial?.linkedHabitId ?? "");
  const [showHabitCreator, setShowHabitCreator] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(initial?.scheduledDate ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave =
    title.trim().length > 0 &&
    (type === "single" || (Number(targetCount) > 0 && linkedHabitId.length > 0));

  function handleSave() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      type,
      targetCount: type === "progress" ? Number(targetCount) : undefined,
      unitLabel: type === "progress" ? unitLabel.trim() || "vezes" : undefined,
      linkedHabitId: type === "progress" ? linkedHabitId : undefined,
      scheduledDate: type === "single" ? scheduledDate || undefined : undefined,
      time: type === "single" ? time || undefined : undefined,
    });
  }

  return (
    <>
      <ModalShell title={initial ? "Editar meta" : "Nova meta do ano"} onClose={onClose}>
          <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
            Título da meta
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Renovar minha CNH"
            maxLength={60}
            className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
          />

          <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
            Tipo de meta
          </label>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setType("single")}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
                type === "single"
                  ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              Tarefa única
            </button>
            <button
              onClick={() => setType("progress")}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
                type === "progress"
                  ? "border-duo-purple-dark bg-duo-purple/10 text-duo-purple-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              Meta de progresso
            </button>
          </div>

          {type === "single" ? (
            <>
              <p className="mb-4 text-xs font-semibold text-duo-gray-dark">
                Uma meta pontual: você marca como concluída quando resolver, sem hábito
                vinculado.
              </p>

              <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
                Agendar no calendário (opcional)
              </label>
              <div className="mb-6 flex gap-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="flex-1 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-32 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
                />
              </div>
            </>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
                Uma meta que só é alcançada com repetição. Vincule a um hábito: cada
                conclusão dele soma um ponto aqui.
              </p>

              <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
                Quantas vezes até o fim do ano
              </label>
              <div className="mb-4 flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  className="w-24 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
                />
                <input
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="unidade (dias, vezes...)"
                  className="flex-1 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
                />
              </div>

              <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
                Hábito vinculado
              </label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="mb-2 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
              >
                <option value="">Selecione um hábito</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.emoji} {h.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowHabitCreator(true)}
                className="mb-4 text-sm font-semibold text-duo-blue-dark"
              >
                + Criar novo hábito para esta meta
              </button>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green-dark py-3.5 text-center font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
          >
            {initial ? "Salvar alterações" : "Criar meta"}
          </button>

          {initial && onDelete && (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold uppercase tracking-wide text-duo-red-dark"
            >
              <Trash2 size={18} />
              Excluir meta
            </button>
          )}

          {confirmingDelete && onDelete && (
            <ConfirmDialog
              title="Excluir meta?"
              message={`Isso vai apagar a meta "${title}". Essa ação não pode ser desfeita.`}
              onConfirm={onDelete}
              onCancel={() => setConfirmingDelete(false)}
            />
          )}
      </ModalShell>

      {showHabitCreator && (
        <HabitFormModal
          householdMembers={householdMembers}
          onClose={() => setShowHabitCreator(false)}
          onSave={(data) => {
            const id = onCreateHabit(data);
            setLinkedHabitId(id);
            setShowHabitCreator(false);
          }}
        />
      )}
    </>
  );
}

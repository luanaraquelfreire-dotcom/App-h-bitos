import { Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Goal, GoalType, Habit, HabitColor } from "../types";
import HabitFormModal from "./HabitFormModal";

interface GoalFormModalProps {
  initial?: Goal;
  habits: Habit[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: GoalType;
    targetCount?: number;
    unitLabel?: string;
    linkedHabitId?: string;
  }) => void;
  onDelete?: () => void;
  onCreateHabit: (data: {
    name: string;
    emoji: string;
    color: HabitColor;
    daysOfWeek: number[];
    time?: string;
  }) => string;
}

export default function GoalFormModal({
  initial,
  habits,
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
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-duo-text">
              {initial ? "Editar meta" : "Nova meta do ano"}
            </h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
            >
              <X size={20} />
            </button>
          </div>

          <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
            Título da meta
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Renovar minha CNH"
            maxLength={60}
            className="mb-4 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
          />

          <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
            Tipo de meta
          </label>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setType("single")}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold ${
                type === "single"
                  ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              Tarefa única
            </button>
            <button
              onClick={() => setType("progress")}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold ${
                type === "progress"
                  ? "border-duo-purple-dark bg-duo-purple/10 text-duo-purple-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              Meta de progresso
            </button>
          </div>

          {type === "single" ? (
            <p className="mb-4 text-xs font-semibold text-duo-gray-dark">
              Uma meta pontual: você marca como concluída quando resolver, sem hábito
              vinculado.
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
                Uma meta que só é alcançada com repetição. Vincule a um hábito: cada
                conclusão dele soma um ponto aqui.
              </p>

              <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
                Quantas vezes até o fim do ano
              </label>
              <div className="mb-4 flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  className="w-24 rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
                />
                <input
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="unidade (dias, vezes...)"
                  className="flex-1 rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
                />
              </div>

              <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
                Hábito vinculado
              </label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="mb-2 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
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
                className="mb-4 text-sm font-extrabold text-duo-blue-dark"
              >
                + Criar novo hábito para esta meta
              </button>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 text-center font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
          >
            {initial ? "Salvar alterações" : "Criar meta"}
          </button>

          {initial && onDelete && (
            <button
              onClick={onDelete}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-extrabold uppercase tracking-wide text-duo-red-dark"
            >
              <Trash2 size={18} />
              Excluir meta
            </button>
          )}
        </div>
      </div>

      {showHabitCreator && (
        <HabitFormModal
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

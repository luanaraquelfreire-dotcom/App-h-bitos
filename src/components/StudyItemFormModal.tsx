import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { StudyItem, StudyStatus, StudyType } from "../types";
import { DAY_LABELS } from "../utils/date";
import { STUDY_EMOJIS, STUDY_STATUS_LABELS, STUDY_TYPE_LABELS } from "../utils/study";
import ModalShell from "./ModalShell";

interface StudyItemFormModalProps {
  initial?: StudyItem;
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: StudyType;
    emoji: string;
    status: StudyStatus;
    targetDaysPerWeek?: number;
    targetHoursPerWeek?: number;
    daysOfWeek?: number[];
    time?: string;
  }) => void;
  onDelete?: () => void;
}

const TYPES: StudyType[] = ["course", "reading", "language"];
const STATUSES: StudyStatus[] = ["in_progress", "completed", "paused"];

export default function StudyItemFormModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: StudyItemFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<StudyType>(initial?.type ?? "course");
  const [emoji, setEmoji] = useState(initial?.emoji ?? STUDY_EMOJIS[0]);
  const [status, setStatus] = useState<StudyStatus>(initial?.status ?? "in_progress");
  const [targetDays, setTargetDays] = useState(initial?.targetDaysPerWeek?.toString() ?? "");
  const [targetHours, setTargetHours] = useState(initial?.targetHoursPerWeek?.toString() ?? "");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.daysOfWeek ?? []);
  const [time, setTime] = useState(initial?.time ?? "");

  const canSave = title.trim().length > 0;

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      type,
      emoji,
      status,
      targetDaysPerWeek: targetDays ? Number(targetDays) : undefined,
      targetHoursPerWeek: targetHours ? Number(targetHours) : undefined,
      daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
      time: time || undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Editar item" : "Novo item de estudo"} onClose={onClose}>
        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Título
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Curso de React, Sapiens, Inglês"
          maxLength={60}
          className="mb-4 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Tipo</label>
        <div className="mb-4 flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold ${
                type === t
                  ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              {STUDY_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Ícone</label>
        <div className="mb-4 grid grid-cols-8 gap-2">
          {STUDY_EMOJIS.map((e) => (
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

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Status
        </label>
        <div className="mb-6 flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-extrabold ${
                status === s
                  ? "border-duo-green-dark bg-duo-green/10 text-duo-green-dark"
                  : "border-duo-gray text-duo-gray-dark"
              }`}
            >
              {STUDY_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Meta semanal (opcional)
        </label>
        <p className="mb-2 text-xs font-semibold text-duo-gray-dark">
          Ex: estudar inglês 3 dias por semana, totalizando 5 horas.
        </p>
        <div className="mb-6 flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              min={0}
              max={7}
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
            />
            <span className="mt-1 block text-center text-[11px] font-bold text-duo-gray-dark">
              dias / semana
            </span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              min={0}
              step="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
            />
            <span className="mt-1 block text-center text-[11px] font-bold text-duo-gray-dark">
              horas / semana
            </span>
          </div>
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Agendar na semana (opcional)
        </label>
        <p className="mb-2 text-xs font-semibold text-duo-gray-dark">
          Escolha os dias e um horário pra esse item aparecer na agenda do dia.
        </p>
        <div className="mb-3 flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-extrabold ${
                daysOfWeek.includes(i)
                  ? "border-duo-blue-dark bg-duo-blue text-white"
                  : "border-duo-gray bg-white text-duo-gray-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-6 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 text-center font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Criar item"}
        </button>

        {initial && onDelete && (
          <button
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-extrabold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir item
          </button>
        )}
    </ModalShell>
  );
}

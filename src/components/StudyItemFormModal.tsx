import { Trash2, X } from "lucide-react";
import { useState } from "react";
import type { StudyItem, StudyStatus, StudyType } from "../types";
import { STUDY_EMOJIS, STUDY_STATUS_LABELS, STUDY_TYPE_LABELS } from "../utils/study";

interface StudyItemFormModalProps {
  initial?: StudyItem;
  onClose: () => void;
  onSave: (data: { title: string; type: StudyType; emoji: string; status: StudyStatus }) => void;
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

  const canSave = title.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({ title: title.trim(), type, emoji, status });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-duo-text">
            {initial ? "Editar item" : "Novo item de estudo"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
          >
            <X size={20} />
          </button>
        </div>

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
      </div>
    </div>
  );
}

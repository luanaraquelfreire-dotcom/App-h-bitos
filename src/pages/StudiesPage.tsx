import {
  ChevronLeft,
  GraduationCap,
  Languages,
  BookOpen,
  Pencil,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import StudyItemFormModal from "../components/StudyItemFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { StudyItem, StudyType } from "../types";
import { STUDY_STATUS_LABELS, STUDY_TYPE_LABELS } from "../utils/study";

type Filter = "all" | StudyType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "course", label: "Cursos" },
  { id: "reading", label: "Leituras" },
  { id: "language", label: "Idiomas" },
];

const TYPE_ICONS: Record<StudyType, typeof BookOpen> = {
  course: GraduationCap,
  reading: BookOpen,
  language: Languages,
};

function formatNoteDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("pt-BR");
}

export default function StudiesPage() {
  const studyItems = useHabitStore((s) => s.studyItems);
  const addStudyItem = useHabitStore((s) => s.addStudyItem);
  const updateStudyItem = useHabitStore((s) => s.updateStudyItem);
  const removeStudyItem = useHabitStore((s) => s.removeStudyItem);
  const addStudyNote = useHabitStore((s) => s.addStudyNote);
  const removeStudyNote = useHabitStore((s) => s.removeStudyNote);

  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StudyItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const selected = studyItems.find((i) => i.id === selectedId) ?? null;

  if (selected) {
    const sortedNotes = [...selected.notes].reverse();

    function handleAddNote() {
      if (!noteText.trim() || !selected) return;
      addStudyNote(selected.id, noteText);
      setNoteText("");
    }

    return (
      <div className="px-4 py-4">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-4 flex items-center gap-1 text-sm font-extrabold text-duo-gray-dark"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>

        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-duo-blue/15 text-2xl">
            {selected.emoji}
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-duo-text">{selected.title}</h1>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-duo-gray/50 px-2 py-0.5 text-[10px] font-extrabold text-duo-gray-dark">
                {STUDY_TYPE_LABELS[selected.type]}
              </span>
              <span className="rounded-full bg-duo-green/15 px-2 py-0.5 text-[10px] font-extrabold text-duo-green-dark">
                {STUDY_STATUS_LABELS[selected.status]}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(selected)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
            aria-label="Editar item"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="mb-5 flex gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escreva uma anotação..."
            rows={3}
            className="flex-1 resize-none rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-semibold text-duo-text outline-none focus:border-duo-blue"
          />
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim()}
            aria-label="Adicionar anotação"
            className="duo-btn grid h-12 w-12 shrink-0 place-items-center self-end rounded-xl border-duo-blue-dark bg-duo-blue text-white disabled:border-duo-gray-dark disabled:bg-duo-gray"
          >
            <Send size={18} />
          </button>
        </div>

        {sortedNotes.length === 0 ? (
          <p className="text-sm text-duo-gray-dark">
            Nenhuma anotação ainda. Escreva o que aprendeu, dúvidas ou próximos passos.
          </p>
        ) : (
          <div className="space-y-2.5">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className="duo-card flex items-start gap-2 rounded-2xl border-duo-gray bg-white px-4 py-3"
              >
                <div className="flex-1">
                  <p className="whitespace-pre-wrap font-semibold text-duo-text">{note.text}</p>
                  <p className="mt-1 text-xs font-bold text-duo-gray-dark">
                    {formatNoteDate(note.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => removeStudyNote(selected.id, note.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
                  aria-label="Remover anotação"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <StudyItemFormModal
            initial={editing}
            onClose={() => setEditing(null)}
            onSave={(data) => {
              updateStudyItem(editing.id, data);
              setEditing(null);
            }}
            onDelete={() => {
              removeStudyItem(editing.id);
              setEditing(null);
              setSelectedId(null);
            }}
          />
        )}
      </div>
    );
  }

  const filteredItems = studyItems.filter((i) => filter === "all" || i.type === filter);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-2xl font-extrabold text-duo-text">Estudos</h1>
      <p className="mb-4 text-sm font-semibold text-duo-gray-dark">
        Seus cursos, leituras e idiomas, com um caderno de anotações para cada um.
      </p>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-duo-gray/40 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-extrabold ${
              filter === f.id ? "bg-white text-duo-blue-dark shadow" : "text-duo-gray-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
          <p className="mb-1 font-extrabold text-duo-text">Nada por aqui ainda</p>
          <p className="text-sm text-duo-gray-dark">
            Adicione um curso, leitura ou idioma para começar seu caderno de anotações.
          </p>
        </div>
      ) : (
        <div className="mb-5 space-y-2.5">
          {filteredItems.map((item) => {
            const TypeIcon = TYPE_ICONS[item.type];
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-duo-blue/15 text-xl">
                  {item.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-duo-text">{item.title}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-duo-gray-dark">
                    <TypeIcon size={12} />
                    {STUDY_TYPE_LABELS[item.type]} · {STUDY_STATUS_LABELS[item.status]} ·{" "}
                    {item.notes.length} anotaç{item.notes.length !== 1 ? "ões" : "ão"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
      >
        <Plus size={20} strokeWidth={3} />
        Novo item de estudo
      </button>

      {showAdd && (
        <StudyItemFormModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addStudyItem(data);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import ChoreFormModal from "../components/ChoreFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { Chore } from "../types";
import { choreStatus, sortChoresByUrgency, type ChoreUrgency } from "../utils/chores";

const URGENCY_BADGE: Record<ChoreUrgency, string> = {
  never: "bg-duo-blue/15 text-duo-blue-dark",
  overdue: "bg-duo-red/15 text-duo-red-dark",
  dueToday: "bg-duo-yellow/20 text-duo-yellow-dark",
  upcoming: "bg-duo-green/15 text-duo-green-dark",
};

function statusLabel(chore: Chore): string {
  const status = choreStatus(chore);
  if (status.urgency === "never") return "Nunca feita";
  if (status.urgency === "overdue") {
    const days = Math.abs(status.daysUntilDue);
    return `Atrasada há ${days} dia${days !== 1 ? "s" : ""}`;
  }
  if (status.urgency === "dueToday") return "Vence hoje";
  return `Faltam ${status.daysUntilDue} dia${status.daysUntilDue !== 1 ? "s" : ""}`;
}

export default function ChoresPage() {
  const chores = useHabitStore((s) => s.chores);
  const addChore = useHabitStore((s) => s.addChore);
  const updateChore = useHabitStore((s) => s.updateChore);
  const removeChore = useHabitStore((s) => s.removeChore);
  const markChoreDone = useHabitStore((s) => s.markChoreDone);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Chore | null>(null);

  const sortedChores = sortChoresByUrgency(chores);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-2xl font-extrabold text-duo-text">Tarefas de casa</h1>
      <p className="mb-4 text-sm font-semibold text-duo-gray-dark">
        Cadastre os afazeres domésticos e a recorrência de cada um.
      </p>

      {sortedChores.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
          <p className="mb-1 font-extrabold text-duo-text">Nenhuma tarefa cadastrada</p>
          <p className="text-sm text-duo-gray-dark">
            Ex: trocar toalhas a cada 7 dias, limpar geladeira a cada 30 dias.
          </p>
        </div>
      ) : (
        <div className="mb-5 space-y-2.5">
          {sortedChores.map((c) => {
            const badgeClass = URGENCY_BADGE[choreStatus(c).urgency];
            return (
              <div
                key={c.id}
                className="duo-card flex items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3"
              >
                <button
                  onClick={() => setEditing(c)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-duo-gray/40 text-xl">
                    {c.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-duo-text">{c.name}</span>
                    <span className="block text-xs font-semibold text-duo-gray-dark">
                      A cada {c.intervalDays} dia{c.intervalDays !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${badgeClass}`}
                    >
                      {statusLabel(c)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => markChoreDone(c.id)}
                  className="duo-btn grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-duo-green-dark bg-duo-green text-white"
                  aria-label="Marcar como feita"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
      >
        <Plus size={20} strokeWidth={3} />
        Nova tarefa
      </button>

      {showAdd && (
        <ChoreFormModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addChore(data);
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <ChoreFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            updateChore(editing.id, data);
            setEditing(null);
          }}
          onDelete={() => {
            removeChore(editing.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

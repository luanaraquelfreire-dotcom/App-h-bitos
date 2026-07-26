import { Check, Dices, Eye, EyeOff, PartyPopper, Plus, Shuffle, Timer, X } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import PomodoroModal from "../components/PomodoroModal";
import { useHabitStore } from "../store/useHabitStore";

const SPIN_DURATION_MS = 1200;
const SPIN_TICK_MS = 80;

export default function TasksPage() {
  const tasks = useHabitStore((s) => s.tasks);
  const drawnTaskId = useHabitStore((s) => s.drawnTaskId);
  const addTask = useHabitStore((s) => s.addTask);
  const removeTask = useHabitStore((s) => s.removeTask);
  const completeTask = useHabitStore((s) => s.completeTask);
  const drawTask = useHabitStore((s) => s.drawTask);
  const clearDrawnTask = useHabitStore((s) => s.clearDrawnTask);

  const [newTaskText, setNewTaskText] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [spinText, setSpinText] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [showTimer, setShowTimer] = useState(false);

  const drawnTask = tasks.find((t) => t.id === drawnTaskId) ?? null;

  function handleAdd() {
    if (!newTaskText.trim()) return;
    addTask(newTaskText);
    setNewTaskText("");
  }

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDraw() {
    if (tasks.length === 0 || spinning) return;
    setSpinning(true);
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const random = tasks[Math.floor(Math.random() * tasks.length)];
      setSpinText(random.text);
      if (Date.now() - startedAt >= SPIN_DURATION_MS) {
        clearInterval(interval);
        drawTask();
        setSpinning(false);
      }
    }, SPIN_TICK_MS);
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-2xl font-extrabold text-duo-text">Procrastinação</h1>
      <p className="mb-1 text-sm font-semibold text-duo-gray-dark">
        Cadastre o que você anda procrastinando e deixe o sorteio escolher por você.
      </p>
      <p className="mb-4 flex items-center gap-1.5 text-xs font-bold text-duo-purple-dark">
        <PartyPopper size={14} />
        Tarefas concluídas pelo sorteio valem XP em dobro.
      </p>

      {(spinning || drawnTask) && (
        <div className="mb-5 rounded-2xl border-2 border-duo-purple-dark bg-duo-purple/10 px-4 py-5 text-center">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-duo-purple-dark">
            {spinning ? "Sorteando..." : "Sua missão agora"}
          </p>
          <p className="mb-4 text-lg font-extrabold text-duo-text">
            {spinning ? spinText : drawnTask?.text}
          </p>

          {!spinning && drawnTask && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => completeTask(drawnTask.id)}
                  className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-duo-green-dark bg-duo-green py-3 font-extrabold uppercase tracking-wide text-white"
                >
                  <Check size={18} strokeWidth={3} />
                  Concluí!
                </button>
                <button
                  onClick={() => setShowTimer(true)}
                  className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-duo-yellow-dark bg-duo-yellow py-3 font-extrabold uppercase tracking-wide text-white"
                >
                  <Timer size={18} />
                  Cronômetro
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={handleDraw}
                  className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3 font-extrabold uppercase tracking-wide text-white"
                >
                  <Shuffle size={18} />
                  Sortear outra
                </button>
                <button
                  onClick={clearDrawnTask}
                  className="rounded-2xl px-3 py-3 text-sm font-extrabold uppercase tracking-wide text-duo-gray-dark"
                >
                  Depois
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showTimer && drawnTask && (
        <PomodoroModal
          title={drawnTask.text}
          onClose={() => setShowTimer(false)}
          onComplete={() => completeTask(drawnTask.id)}
        />
      )}

      <div className="mb-4 flex gap-2">
        <input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Ex: Organizar o guarda-roupa"
          maxLength={80}
          className="flex-1 rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />
        <button
          onClick={handleAdd}
          disabled={!newTaskText.trim()}
          className="duo-btn grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl border-duo-blue-dark bg-duo-blue text-white disabled:border-duo-gray-dark disabled:bg-duo-gray"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa cadastrada"
          description="Adicione aquilo que você vem enrolando para fazer e sorteie uma para começar."
        />
      ) : (
        <>
          <p className="mb-2 text-xs font-semibold text-duo-gray-dark">
            As tarefas ficam ocultas. Toque em cada uma para revelar o que é.
          </p>
          <div className="mb-5 space-y-2.5">
            {tasks.map((t) => {
              const isRevealed = revealedIds.has(t.id);
              return (
                <div
                  key={t.id}
                  className={`duo-card flex items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 ${
                    t.id === drawnTaskId ? "ring-2 ring-duo-purple" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleReveal(t.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {isRevealed ? (
                      <Eye size={16} className="shrink-0 text-duo-gray-dark" />
                    ) : (
                      <EyeOff size={16} className="shrink-0 text-duo-gray-dark" />
                    )}
                    <span
                      className={`font-bold ${
                        isRevealed ? "text-duo-text" : "italic text-duo-gray-dark"
                      }`}
                    >
                      {isRevealed ? t.text : "Tarefa oculta · toque para ver"}
                    </span>
                  </button>
                  <button
                    onClick={() => removeTask(t.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
                    aria-label="Remover tarefa"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDraw}
            disabled={spinning}
            className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-purple-dark bg-duo-purple py-3.5 font-extrabold uppercase tracking-wide text-white disabled:opacity-70"
          >
            <Dices size={20} />
            Sortear tarefa
          </button>
        </>
      )}
    </div>
  );
}

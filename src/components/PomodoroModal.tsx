import { Check, Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PomodoroModalProps {
  title: string;
  emoji?: string;
  onClose: () => void;
  onComplete?: () => void;
}

const PRESETS_MIN = [5, 15, 25, 45];
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroModal({ title, emoji, onClose, onComplete }: PomodoroModalProps) {
  const [durationMin, setDurationMin] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const finished = remaining === 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function selectPreset(min: number) {
    if (running) return;
    setDurationMin(min);
    setRemaining(min * 60);
  }

  function reset() {
    setRunning(false);
    setRemaining(durationMin * 60);
  }

  const totalSeconds = durationMin * 60;
  const progress = totalSeconds === 0 ? 0 : remaining / totalSeconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="truncate text-lg font-extrabold text-duo-text">
            {emoji ? `${emoji} ` : ""}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative mx-auto my-4 h-56 w-56">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} strokeWidth="10" className="fill-none stroke-duo-gray" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              strokeWidth="10"
              strokeLinecap="round"
              className="fill-none stroke-duo-purple-dark transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-extrabold tabular-nums text-duo-text">
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        {finished ? (
          <div className="mb-4 text-center">
            <p className="mb-3 font-extrabold text-duo-green-dark">Tempo esgotado! 🎉</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {onComplete && (
                <button
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-duo-green-dark bg-duo-green py-3 font-extrabold uppercase tracking-wide text-white"
                >
                  <Check size={18} strokeWidth={3} />
                  Concluir
                </button>
              )}
              <button
                onClick={reset}
                className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3 font-extrabold uppercase tracking-wide text-white"
              >
                <RotateCcw size={18} />
                Repetir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center gap-2">
              {PRESETS_MIN.map((min) => (
                <button
                  key={min}
                  onClick={() => selectPreset(min)}
                  disabled={running}
                  className={`rounded-full border-2 px-3 py-1.5 text-sm font-extrabold disabled:opacity-40 ${
                    durationMin === min
                      ? "border-duo-purple-dark bg-duo-purple/15 text-duo-purple-dark"
                      : "border-duo-gray text-duo-gray-dark"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="grid h-12 w-12 place-items-center rounded-full border-2 border-duo-gray text-duo-gray-dark"
                aria-label="Reiniciar"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="duo-btn grid h-16 w-16 place-items-center rounded-full border-duo-purple-dark bg-duo-purple text-white"
                aria-label={running ? "Pausar" : "Iniciar"}
              >
                {running ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
              </button>
              <div className="h-12 w-12" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

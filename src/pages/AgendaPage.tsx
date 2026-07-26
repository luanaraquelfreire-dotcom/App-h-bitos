import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Habit } from "../types";
import { useHabitStore } from "../store/useHabitStore";
import { COLOR_MAP } from "../utils/colors";
import { formatLong, isToday, nextDay, prevDay, toDateKey } from "../utils/date";
import { habitsScheduledOn } from "../utils/gamification";

const HOUR_HEIGHT = 72;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;
/** duração assumida de cada hábito na agenda, só para fins de layout visual */
const EVENT_DURATION_MIN = 30;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface PositionedEvent {
  habit: Habit;
  start: number;
  colIndex: number;
  colCount: number;
}

/** Posiciona eventos em colunas lado a lado quando os horários colidem, como um calendário. */
function layoutEvents(habits: Habit[]): PositionedEvent[] {
  const events = habits
    .map((h) => {
      const start = timeToMinutes(h.time as string);
      return { habit: h, start, end: start + EVENT_DURATION_MIN };
    })
    .sort((a, b) => a.start - b.start);

  const result: PositionedEvent[] = [];
  let cluster: typeof events = [];
  let clusterEnd = -Infinity;

  function flushCluster() {
    if (cluster.length === 0) return;
    const columnEnds: number[] = [];
    const assigned: { ev: (typeof cluster)[number]; col: number }[] = [];
    for (const ev of cluster) {
      let col = columnEnds.findIndex((end) => end <= ev.start);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(ev.end);
      } else {
        columnEnds[col] = ev.end;
      }
      assigned.push({ ev, col });
    }
    const colCount = columnEnds.length;
    for (const { ev, col } of assigned) {
      result.push({ habit: ev.habit, start: ev.start, colIndex: col, colCount });
    }
    cluster = [];
  }

  for (const ev of events) {
    if (cluster.length === 0 || ev.start < clusterEnd) {
      cluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.end);
    } else {
      flushCluster();
      cluster = [ev];
      clusterEnd = ev.end;
    }
  }
  flushCluster();

  return result;
}

export default function AgendaPage() {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);

  const [selected, setSelected] = useState(new Date());
  const dateKey = toDateKey(selected);
  const viewingToday = isToday(selected);

  const scheduled = habitsScheduledOn(habits, selected);
  const timedHabits = scheduled.filter((h) => h.time);
  const allDayHabits = scheduled.filter((h) => !h.time);

  const positioned = useMemo(() => layoutEvents(timedHabits), [timedHabits]);

  const nowTop = (currentMinutes() / 60) * HOUR_HEIGHT;
  const eventHeight = (EVENT_DURATION_MIN / 60) * HOUR_HEIGHT - 3;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Agenda</h1>

      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setSelected((d) => prevDay(d))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <span className="block font-extrabold capitalize text-duo-text">
            {formatLong(selected)}
          </span>
          {!viewingToday && (
            <button
              onClick={() => setSelected(new Date())}
              className="text-xs font-extrabold text-duo-blue-dark"
            >
              Ir para hoje
            </button>
          )}
        </div>
        <button
          onClick={() => setSelected((d) => nextDay(d))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {allDayHabits.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 border-b-2 border-duo-gray pb-3">
          {allDayHabits.map((h) => {
            const colors = COLOR_MAP[h.color];
            const done = completions[h.id]?.includes(dateKey) ?? false;
            return (
              <button
                key={h.id}
                onClick={() => toggleCompletion(h.id, dateKey)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${colors.bgSoft} ${colors.text} ${
                  done ? "opacity-50 line-through" : ""
                }`}
              >
                {h.emoji} {h.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative overflow-y-auto" style={{ maxHeight: "65vh" }}>
        <div className="relative" style={{ height: TOTAL_HEIGHT }}>
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-duo-gray"
              style={{ top: hour * HOUR_HEIGHT }}
            >
              <span className="-mt-2 ml-0 inline-block w-12 pr-2 text-right text-[11px] font-bold text-duo-gray-dark">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}

          {viewingToday && (
            <div
              className="absolute left-12 right-0 z-10 flex items-center"
              style={{ top: nowTop }}
            >
              <span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-duo-red" />
              <span className="h-[2px] flex-1 bg-duo-red" />
            </div>
          )}

          {positioned.map(({ habit: h, start, colIndex, colCount }) => {
            const colors = COLOR_MAP[h.color];
            const done = completions[h.id]?.includes(dateKey) ?? false;
            const widthPct = 100 / colCount;
            const top = (start / 60) * HOUR_HEIGHT;
            return (
              <button
                key={h.id}
                onClick={() => toggleCompletion(h.id, dateKey)}
                className={`duo-card absolute flex items-center gap-1 overflow-hidden rounded-lg border px-1.5 py-0.5 text-left ${colors.bgSoft} ${colors.border} ${
                  done ? "opacity-50" : ""
                }`}
                style={{
                  top: top + 1,
                  height: eventHeight,
                  left: `calc(3.25rem + ${colIndex * widthPct}%)`,
                  width: `calc(${widthPct}% - 0.375rem)`,
                }}
              >
                <span className="shrink-0 text-sm">{h.emoji}</span>
                <span
                  className={`truncate text-[11px] font-extrabold ${colors.text} ${
                    done ? "line-through" : ""
                  }`}
                >
                  {h.name}
                  <span className="ml-1 font-bold text-duo-gray-dark">{h.time}</span>
                </span>
                {done && <Check size={12} className={`ml-auto shrink-0 ${colors.text}`} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {timedHabits.length === 0 && allDayHabits.length === 0 && (
        <p className="mt-3 text-center text-sm text-duo-gray-dark">
          Nada programado para este dia.
        </p>
      )}
    </div>
  );
}

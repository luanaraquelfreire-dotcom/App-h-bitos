import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import PomodoroModal from "../components/PomodoroModal";
import { useHabitStore } from "../store/useHabitStore";
import type { StudyItem } from "../types";
import { COLOR_MAP, type ColorSet } from "../utils/colors";
import { isChoreDueOn } from "../utils/chores";
import { formatLong, isToday, nextDay, prevDay, toDateKey } from "../utils/date";
import { habitsScheduledOn } from "../utils/gamification";
import { studyDoneOn, studyItemsScheduledOn } from "../utils/study";

const HOUR_HEIGHT = 72;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;
/** duração assumida de cada item na agenda, só para fins de layout visual */
const EVENT_DURATION_MIN = 30;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface AgendaItem {
  id: string;
  name: string;
  emoji: string;
  time?: string;
  done: boolean;
  colors: ColorSet;
  onToggle: () => void;
}

interface PositionedItem extends AgendaItem {
  start: number;
  colIndex: number;
  colCount: number;
}

/** Posiciona itens em colunas lado a lado quando os horários colidem, como um calendário. */
function layoutItems(items: AgendaItem[]): PositionedItem[] {
  const events = items
    .map((it) => {
      const start = timeToMinutes(it.time as string);
      return { item: it, start, end: start + EVENT_DURATION_MIN };
    })
    .sort((a, b) => a.start - b.start);

  const result: PositionedItem[] = [];
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
      result.push({ ...ev.item, start: ev.start, colIndex: col, colCount });
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

interface AgendaPageProps {
  embedded?: boolean;
}

export default function AgendaPage({ embedded }: AgendaPageProps = {}) {
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const toggleHabitTime = useHabitStore((s) => s.toggleHabitTime);
  const chores = useHabitStore((s) => s.chores);
  const markChoreDone = useHabitStore((s) => s.markChoreDone);
  const goals = useHabitStore((s) => s.goals);
  const toggleGoalDone = useHabitStore((s) => s.toggleGoalDone);
  const studyItems = useHabitStore((s) => s.studyItems);
  const addStudySession = useHabitStore((s) => s.addStudySession);

  const [selected, setSelected] = useState(new Date());
  const [studyTimerFor, setStudyTimerFor] = useState<StudyItem | null>(null);
  const dateKey = toDateKey(selected);
  const viewingToday = isToday(selected);

  const scheduledHabits = habitsScheduledOn(habits, selected);
  const dueChores = chores.filter((c) => isChoreDueOn(c, selected) || c.lastDoneAt === dateKey);
  const scheduledGoals = goals.filter((g) => g.type === "single" && g.scheduledDate === dateKey);
  const scheduledStudy = studyItemsScheduledOn(studyItems, selected);

  const habitItems: AgendaItem[] = scheduledHabits.flatMap((h) => {
    if (h.times && h.times.length > 0) {
      return h.times.map((t) => ({
        id: `habit-${h.id}-${t}`,
        name: h.name,
        emoji: h.emoji,
        time: t,
        done: completions[h.id]?.includes(`${dateKey}::${t}`) ?? false,
        colors: COLOR_MAP[h.color],
        onToggle: () => toggleHabitTime(h.id, dateKey, t),
      }));
    }
    return [
      {
        id: `habit-${h.id}`,
        name: h.name,
        emoji: h.emoji,
        time: h.time,
        done: completions[h.id]?.includes(dateKey) ?? false,
        colors: COLOR_MAP[h.color],
        onToggle: () => toggleCompletion(h.id, dateKey),
      },
    ];
  });

  const allItems: AgendaItem[] = [
    ...habitItems,
    ...dueChores.map((c) => ({
      id: `chore-${c.id}`,
      name: c.name,
      emoji: c.emoji,
      time: c.time,
      done: c.lastDoneAt === dateKey,
      colors: COLOR_MAP.purple,
      onToggle: () => markChoreDone(c.id),
    })),
    ...scheduledGoals.map((g) => ({
      id: `goal-${g.id}`,
      name: g.title,
      emoji: "🎯",
      time: g.time,
      done: g.done,
      colors: COLOR_MAP.yellow,
      onToggle: () => toggleGoalDone(g.id),
    })),
    ...scheduledStudy.map((s) => ({
      id: `study-${s.id}`,
      name: s.title,
      emoji: s.emoji,
      time: s.time,
      done: studyDoneOn(s, dateKey),
      colors: COLOR_MAP.blue,
      onToggle: () => setStudyTimerFor(s),
    })),
  ];

  const timedItems = allItems.filter((it) => it.time);
  const allDayItems = allItems.filter((it) => !it.time);

  const positioned = useMemo(() => layoutItems(timedItems), [timedItems]);

  const nowTop = (currentMinutes() / 60) * HOUR_HEIGHT;
  const eventHeight = (EVENT_DURATION_MIN / 60) * HOUR_HEIGHT - 3;

  return (
    <div className={embedded ? "" : "px-4 py-4"}>
      {!embedded && <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Agenda</h1>}

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

      {allDayItems.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 border-b-2 border-duo-gray pb-3">
          {allDayItems.map((it) => (
            <button
              key={it.id}
              onClick={it.onToggle}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${it.colors.bgSoft} ${it.colors.text} ${
                it.done ? "opacity-50 line-through" : ""
              }`}
            >
              {it.emoji} {it.name}
            </button>
          ))}
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

          {positioned.map((it) => {
            const widthPct = 100 / it.colCount;
            const top = (it.start / 60) * HOUR_HEIGHT;
            return (
              <button
                key={it.id}
                onClick={it.onToggle}
                className={`duo-card absolute flex items-center gap-1 overflow-hidden rounded-lg border px-1.5 py-0.5 text-left ${it.colors.bgSoft} ${it.colors.border} ${
                  it.done ? "opacity-50" : ""
                }`}
                style={{
                  top: top + 1,
                  height: eventHeight,
                  left: `calc(3.25rem + ${it.colIndex * widthPct}%)`,
                  width: `calc(${widthPct}% - 0.375rem)`,
                }}
              >
                <span className="shrink-0 text-sm">{it.emoji}</span>
                <span
                  className={`truncate text-[11px] font-extrabold ${it.colors.text} ${
                    it.done ? "line-through" : ""
                  }`}
                >
                  {it.name}
                  <span className="ml-1 font-bold text-duo-gray-dark">{it.time}</span>
                </span>
                {it.done && (
                  <Check size={12} className={`ml-auto shrink-0 ${it.colors.text}`} strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {allItems.length === 0 && (
        <p className="mt-3 text-center text-sm text-duo-gray-dark">
          Nada programado para este dia.
        </p>
      )}

      {studyTimerFor && (
        <PomodoroModal
          title={studyTimerFor.title}
          emoji={studyTimerFor.emoji}
          onClose={() => setStudyTimerFor(null)}
          onComplete={(minutes) => {
            addStudySession(studyTimerFor.id, minutes);
            setStudyTimerFor(null);
          }}
        />
      )}
    </div>
  );
}

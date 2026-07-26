import { Check, Timer, User } from "lucide-react";
import { useState } from "react";
import type { Habit } from "../types";
import { COLOR_MAP } from "../utils/colors";
import PomodoroModal from "./PomodoroModal";

interface GoalBadge {
  current: number;
  target: number;
  unitLabel?: string;
}

interface HabitCardProps {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
  goalBadge?: GoalBadge;
  assigneeName?: string;
}

export default function HabitCard({ habit, done, onToggle, goalBadge, assigneeName }: HabitCardProps) {
  const colors = COLOR_MAP[habit.color];
  const [showTimer, setShowTimer] = useState(false);

  return (
    <div
      className={`duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3 transition-opacity ${
        done ? "opacity-60" : ""
      }`}
    >
      <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl ${colors.bgSoft}`}>
          {habit.emoji}
        </span>
        <span className="flex-1">
          <span className={`block font-medium ${done ? "text-duo-gray-dark line-through" : "text-duo-text"}`}>
            {habit.name}
          </span>
          {habit.time && (
            <span className="block text-xs font-semibold text-duo-gray-dark">{habit.time}</span>
          )}
          {goalBadge && (
            <span className="mt-0.5 mr-1 inline-block truncate rounded-full bg-duo-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-duo-yellow-dark">
              🎯 {goalBadge.current}/{goalBadge.target} {goalBadge.unitLabel ?? ""}
            </span>
          )}
          {assigneeName && (
            <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-duo-blue/15 px-2 py-0.5 text-[10px] font-semibold text-duo-blue-dark">
              <User size={10} />
              {assigneeName}
            </span>
          )}
        </span>
      </button>

      <button
        onClick={() => setShowTimer(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
        aria-label="Iniciar cronômetro"
      >
        <Timer size={20} />
      </button>

      <button
        onClick={onToggle}
        className={`duo-btn grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
          done
            ? `${colors.bgStrong} ${colors.border} text-white`
            : "border-duo-gray/60 bg-white/55 backdrop-blur-xl text-duo-gray"
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </button>

      {showTimer && (
        <PomodoroModal
          title={habit.name}
          emoji={habit.emoji}
          onClose={() => setShowTimer(false)}
          onComplete={() => {
            if (!done) onToggle();
          }}
        />
      )}
    </div>
  );
}

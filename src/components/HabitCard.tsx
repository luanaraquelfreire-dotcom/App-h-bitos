import { Check } from "lucide-react";
import type { Habit } from "../types";
import { COLOR_MAP } from "../utils/colors";

interface HabitCardProps {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
}

export default function HabitCard({ habit, done, onToggle }: HabitCardProps) {
  const colors = COLOR_MAP[habit.color];

  return (
    <button
      onClick={onToggle}
      className={`duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left transition-opacity ${
        done ? "opacity-60" : ""
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl ${colors.bgSoft}`}>
        {habit.emoji}
      </span>
      <span className="flex-1">
        <span className={`block font-bold ${done ? "text-duo-gray-dark line-through" : "text-duo-text"}`}>
          {habit.name}
        </span>
        {habit.time && (
          <span className="block text-xs font-semibold text-duo-gray-dark">{habit.time}</span>
        )}
      </span>
      <span
        className={`duo-btn grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
          done
            ? `${colors.bg} ${colors.border} text-white`
            : "border-duo-gray bg-white text-duo-gray"
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </span>
    </button>
  );
}

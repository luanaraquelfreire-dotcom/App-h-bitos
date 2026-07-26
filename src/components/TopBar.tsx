import { Flame, Gem } from "lucide-react";
import { levelFromXp } from "../utils/gamification";

interface TopBarProps {
  streak: number;
  xp: number;
}

export default function TopBar({ streak, xp }: TopBarProps) {
  const { level } = levelFromXp(xp);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-duo-gray bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-1.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-duo-purple text-sm font-extrabold text-white">
          {level}
        </span>
        <span className="text-xs font-bold text-duo-gray-dark">Nível</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Flame
            className={streak > 0 ? "fill-duo-yellow text-duo-yellow-dark" : "text-duo-gray-dark"}
            size={22}
          />
          <span className="font-extrabold text-duo-text">{streak}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gem className="fill-duo-blue text-duo-blue-dark" size={20} />
          <span className="font-extrabold text-duo-text">{xp}</span>
        </div>
      </div>
    </header>
  );
}

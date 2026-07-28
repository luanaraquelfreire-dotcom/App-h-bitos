import { Bell, Flame, Gem } from "lucide-react";
import { useState } from "react";
import { useHabitStore } from "../store/useHabitStore";
import { unreadActivityCount } from "../utils/activity";
import { levelFromXp } from "../utils/gamification";
import NotificationsModal from "./NotificationsModal";

interface TopBarProps {
  streak: number;
  xp: number;
}

export default function TopBar({ streak, xp }: TopBarProps) {
  const { level } = levelFromXp(xp);
  const activityLog = useHabitStore((s) => s.activityLog);
  const currentMemberId = useHabitStore((s) => s.currentMemberId);
  const lastSeenActivityAt = useHabitStore((s) => s.lastSeenActivityAt);
  const [showNotifications, setShowNotifications] = useState(false);

  const unread = unreadActivityCount(activityLog, currentMemberId, lastSeenActivityAt);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/50 bg-white/60 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-duo-purple-dark text-sm font-semibold text-white">
            {level}
          </span>
          <span className="text-xs font-medium text-duo-gray-dark">Nível</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Flame
              className={streak > 0 ? "fill-duo-yellow text-duo-yellow-dark" : "text-duo-gray-dark"}
              size={22}
            />
            <span className="font-semibold text-duo-text">{streak}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gem className="fill-duo-blue text-duo-blue-dark" size={20} />
            <span className="font-semibold text-duo-text">{xp}</span>
          </div>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray/60"
            aria-label="Notificações"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-duo-red-dark px-1 text-[10px] font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </header>

      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}

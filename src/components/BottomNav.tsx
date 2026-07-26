import { CalendarDays, CalendarRange, ListChecks, Sun, User } from "lucide-react";

export type Tab = "today" | "week" | "month" | "habits" | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: "today", label: "Hoje", icon: Sun },
  { id: "week", label: "Semana", icon: CalendarDays },
  { id: "month", label: "Mês", icon: CalendarRange },
  { id: "habits", label: "Hábitos", icon: ListChecks },
  { id: "profile", label: "Perfil", icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-20 flex border-t-2 border-duo-gray bg-white pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
              isActive ? "text-duo-blue-dark" : "text-duo-gray-dark"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

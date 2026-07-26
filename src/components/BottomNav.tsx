import {
  CalendarDays,
  CalendarRange,
  Dices,
  ListChecks,
  Sun,
  Target,
  User,
  UtensilsCrossed,
} from "lucide-react";

export type Tab =
  | "today"
  | "week"
  | "month"
  | "habits"
  | "goals"
  | "tasks"
  | "food"
  | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: "today", label: "Hoje", icon: Sun },
  { id: "week", label: "Semana", icon: CalendarDays },
  { id: "month", label: "Mês", icon: CalendarRange },
  { id: "habits", label: "Hábitos", icon: ListChecks },
  { id: "goals", label: "Metas", icon: Target },
  { id: "food", label: "Alimentação", icon: UtensilsCrossed },
  { id: "tasks", label: "Procrastinação", icon: Dices },
  { id: "profile", label: "Perfil", icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="no-scrollbar sticky bottom-0 z-20 flex overflow-x-auto border-t-2 border-duo-gray bg-white pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex w-[68px] shrink-0 flex-col items-center gap-0.5 px-1 py-2 text-center text-[10px] font-bold leading-tight transition-colors ${
              isActive ? "text-duo-blue-dark" : "text-duo-gray-dark"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

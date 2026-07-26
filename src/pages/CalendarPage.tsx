import { useState } from "react";
import AgendaPage from "./AgendaPage";
import MonthPage from "./MonthPage";
import WeekPage from "./WeekPage";

type View = "day" | "week" | "month";

const VIEWS: { id: View; label: string }[] = [
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
];

export default function CalendarPage() {
  const [view, setView] = useState<View>("day");

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Calendário</h1>

      <div className="mb-4 flex gap-1 rounded-2xl bg-duo-gray/40 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-extrabold ${
              view === v.id ? "bg-white text-duo-blue-dark shadow" : "text-duo-gray-dark"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "day" && <AgendaPage embedded />}
      {view === "week" && <WeekPage embedded />}
      {view === "month" && <MonthPage embedded />}
    </div>
  );
}

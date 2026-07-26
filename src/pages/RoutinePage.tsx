import { useState } from "react";
import ChoresPage from "./ChoresPage";
import GoalsPage from "./GoalsPage";
import HabitsPage from "./HabitsPage";

type View = "habits" | "goals" | "chores";

const VIEWS: { id: View; label: string }[] = [
  { id: "habits", label: "Hábitos" },
  { id: "goals", label: "Metas" },
  { id: "chores", label: "Casa" },
];

export default function RoutinePage() {
  const [view, setView] = useState<View>("habits");

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Hábitos</h1>

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

      {view === "habits" && <HabitsPage embedded />}
      {view === "goals" && <GoalsPage embedded />}
      {view === "chores" && <ChoresPage embedded />}
    </div>
  );
}

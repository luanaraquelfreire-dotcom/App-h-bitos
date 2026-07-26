import { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import ChoresPage from "./ChoresPage";
import GoalsPage from "./GoalsPage";
import HabitsPage from "./HabitsPage";
import StudiesPage from "./StudiesPage";

type View = "habits" | "goals" | "chores" | "studies";

const VIEWS: { id: View; label: string }[] = [
  { id: "habits", label: "Hábitos" },
  { id: "goals", label: "Metas" },
  { id: "chores", label: "Casa" },
  { id: "studies", label: "Estudos" },
];

export default function RoutinePage() {
  const [view, setView] = useState<View>("habits");

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold text-duo-text">Hábitos</h1>

      <SegmentedControl options={VIEWS} value={view} onChange={setView} />

      {view === "habits" && <HabitsPage embedded />}
      {view === "goals" && <GoalsPage embedded />}
      {view === "chores" && <ChoresPage embedded />}
      {view === "studies" && <StudiesPage embedded />}
    </div>
  );
}

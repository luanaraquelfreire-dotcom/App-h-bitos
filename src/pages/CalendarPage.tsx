import { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import AgendaPage from "./AgendaPage";
import MonthPage from "./MonthPage";
import TodayPage from "./TodayPage";
import WeekPage from "./WeekPage";

type View = "today" | "day" | "week" | "month";

const VIEWS: { id: View; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
];

export default function CalendarPage() {
  const [view, setView] = useState<View>("today");

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold text-duo-text">Calendário</h1>

      <SegmentedControl options={VIEWS} value={view} onChange={setView} />

      {view === "today" && <TodayPage embedded />}
      {view === "day" && <AgendaPage embedded />}
      {view === "week" && <WeekPage embedded />}
      {view === "month" && <MonthPage embedded />}
    </div>
  );
}

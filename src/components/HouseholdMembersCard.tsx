import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useHabitStore } from "../store/useHabitStore";

export default function HouseholdMembersCard() {
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const addHouseholdMember = useHabitStore((s) => s.addHouseholdMember);
  const renameHouseholdMember = useHabitStore((s) => s.renameHouseholdMember);
  const removeHouseholdMember = useHabitStore((s) => s.removeHouseholdMember);
  const [newName, setNewName] = useState("");

  function handleAdd() {
    if (!newName.trim()) return;
    addHouseholdMember(newName);
    setNewName("");
  }

  return (
    <div className="rounded-2xl border-2 border-duo-gray bg-white p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold uppercase text-duo-gray-dark">
        <Users size={16} /> Pessoas da casa
      </h2>
      <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
        Usadas para atribuir um responsável em hábitos e tarefas de casa.
      </p>

      <div className="mb-3 space-y-2">
        {householdMembers.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <input
              value={m.name}
              onChange={(e) => renameHouseholdMember(m.id, e.target.value)}
              className="flex-1 rounded-xl border-2 border-duo-gray bg-white px-3 py-2 text-sm font-bold text-duo-text outline-none focus:border-duo-blue"
            />
            <button
              onClick={() => removeHouseholdMember(m.id)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
              aria-label="Remover pessoa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nome da pessoa"
          className="flex-1 rounded-xl border-2 border-duo-gray bg-white px-3 py-2 text-sm font-bold text-duo-text outline-none focus:border-duo-blue"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="duo-btn grid h-10 w-10 shrink-0 place-items-center rounded-xl border-duo-blue-dark bg-duo-blue text-white disabled:border-duo-gray-dark disabled:bg-duo-gray"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

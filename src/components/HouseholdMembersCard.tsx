import { Check, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useHabitStore } from "../store/useHabitStore";
import type { HouseholdMember } from "../types";
import ConfirmDialog from "./ConfirmDialog";

interface MemberRowProps {
  member: HouseholdMember;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

function MemberRow({ member, onRename, onRemove }: MemberRowProps) {
  const [value, setValue] = useState(member.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setValue(member.name);
  }, [member.name]);

  const trimmed = value.trim();
  const dirty = trimmed.length > 0 && trimmed !== member.name;

  function handleSave() {
    if (!dirty) return;
    onRename(member.id, trimmed);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        className="flex-1 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-3 py-2 text-sm font-medium text-duo-text outline-none focus:border-duo-blue"
      />
      <button
        onClick={handleSave}
        disabled={!dirty}
        aria-label="Salvar nome"
        className="duo-btn grid h-9 w-9 shrink-0 place-items-center rounded-xl border-duo-green-dark bg-duo-green-dark text-white disabled:border-duo-gray-dark disabled:bg-duo-gray"
      >
        <Check size={16} strokeWidth={3} />
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
        aria-label="Remover pessoa"
      >
        <Trash2 size={16} />
      </button>

      {confirmingDelete && (
        <ConfirmDialog
          title="Remover pessoa?"
          message={`"${member.name}" deixa de aparecer como responsável em hábitos e tarefas de casa já atribuídos a ela.`}
          confirmLabel="Remover"
          onConfirm={() => {
            onRemove(member.id);
            setConfirmingDelete(false);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}

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
    <div className="rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase text-duo-gray-dark">
        <Users size={16} /> Pessoas da casa
      </h2>
      <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
        Usadas para atribuir um responsável em hábitos e tarefas de casa.
      </p>

      <div className="mb-3 space-y-2">
        {householdMembers.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            onRename={renameHouseholdMember}
            onRemove={removeHouseholdMember}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nome da pessoa"
          className="flex-1 rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-3 py-2 text-sm font-medium text-duo-text outline-none focus:border-duo-blue"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="duo-btn grid h-10 w-10 shrink-0 place-items-center rounded-xl border-duo-blue-dark bg-duo-blue-dark text-white disabled:border-duo-gray-dark disabled:bg-duo-gray"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

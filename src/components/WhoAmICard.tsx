import { UserCheck } from "lucide-react";
import { useHabitStore } from "../store/useHabitStore";

/** Define qual pessoa da casa usa este aparelho, pra que as notificações
 * consigam distinguir "minhas" mudanças das da outra pessoa. */
export default function WhoAmICard() {
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const currentMemberId = useHabitStore((s) => s.currentMemberId);
  const setCurrentMemberId = useHabitStore((s) => s.setCurrentMemberId);

  if (householdMembers.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl p-4">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold uppercase text-duo-gray-dark">
        <UserCheck size={16} /> Quem é você nesse aparelho?
      </h2>
      <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
        Assim as notificações mostram só o que a outra pessoa mudou, não suas próprias ações.
      </p>
      <div className="flex flex-wrap gap-2">
        {householdMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setCurrentMemberId(currentMemberId === m.id ? null : m.id)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${
              currentMemberId === m.id
                ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}

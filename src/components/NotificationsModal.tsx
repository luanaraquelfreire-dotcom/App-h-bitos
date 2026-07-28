import { Bell } from "lucide-react";
import { useEffect } from "react";
import { useHabitStore } from "../store/useHabitStore";
import { formatRelativeTime } from "../utils/activity";
import { memberName } from "../utils/household";
import ModalShell from "./ModalShell";

interface NotificationsModalProps {
  onClose: () => void;
}

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
  const activityLog = useHabitStore((s) => s.activityLog);
  const householdMembers = useHabitStore((s) => s.householdMembers);
  const currentMemberId = useHabitStore((s) => s.currentMemberId);
  const markActivitySeen = useHabitStore((s) => s.markActivitySeen);

  useEffect(() => {
    markActivitySeen();
  }, [markActivitySeen]);

  const sorted = [...activityLog].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ModalShell title="Notificações" onClose={onClose}>
      {sorted.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
          <Bell className="mx-auto mb-2 text-duo-gray-dark" size={28} />
          <p className="mb-1 font-semibold text-duo-text">Nada por aqui ainda</p>
          <p className="text-sm text-duo-gray-dark">
            As mudanças feitas no app vão aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {sorted.map((entry) => {
            const isMe = Boolean(currentMemberId && entry.actorId === currentMemberId);
            const actor = entry.actorId ? memberName(householdMembers, entry.actorId) : undefined;
            return (
              <div
                key={entry.id}
                className={`rounded-2xl border border-white/60 px-4 py-3 backdrop-blur-xl ${
                  isMe ? "bg-white/35 opacity-70" : "bg-white/60"
                }`}
              >
                <p className="text-sm font-medium text-duo-text">
                  <span className="font-semibold text-duo-purple-dark">
                    {isMe ? "Você" : (actor ?? "Alguém")}
                  </span>{" "}
                  {entry.message}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-duo-gray-dark">
                  {formatRelativeTime(entry.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}

import type { ActivityEntry } from "../types";

/** Quantas entradas do log foram feitas por outra pessoa (não o "eu" deste
 * aparelho) desde a última vez que as notificações foram abertas. */
export function unreadActivityCount(
  log: ActivityEntry[],
  currentMemberId: string | null,
  lastSeenActivityAt: string | null,
): number {
  return log.filter((entry) => {
    if (currentMemberId && entry.actorId === currentMemberId) return false;
    if (!lastSeenActivityAt) return true;
    return entry.createdAt > lastSeenActivityAt;
  }).length;
}

/** Formata um ISO datetime como "agora", "há 5 min", "há 3h" ou "há 2 dias". */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
}

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useHabitStore } from "../store/useHabitStore";

const SYNC_KEYS = [
  "habits",
  "completions",
  "xp",
  "tasks",
  "drawnTaskId",
  "completedTasksCount",
  "goals",
  "recipes",
  "mealPlans",
  "peopleCount",
  "shoppingChecked",
  "transactions",
  "chores",
  "studyItems",
  "householdMembers",
] as const;

export type SyncStatus = "connecting" | "online" | "offline";

function snapshot(): Record<string, unknown> {
  const state = useHabitStore.getState();
  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    data[key] = state[key];
  }
  return data;
}

/** Sincroniza o estado local com a linha `app_state` do Supabase para o código
 * de família informado: puxa o estado remoto (ou publica o local se ainda não
 * existir), escuta atualizações em tempo real do parceiro e envia mudanças
 * locais (debounced). Retorna uma função de limpeza. */
export function startHouseholdSync(
  code: string,
  onStatusChange: (status: SyncStatus) => void,
): () => void {
  if (!supabase) {
    onStatusChange("offline");
    return () => {};
  }
  const client = supabase;

  let stopped = false;
  let applyingRemote = false;
  let lastSyncedJson = "";
  let pushTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribeStore: (() => void) | null = null;
  let channel: RealtimeChannel | null = null;

  function applyRemoteData(data: Record<string, unknown>) {
    applyingRemote = true;
    lastSyncedJson = JSON.stringify(data);
    useHabitStore.setState(data);
    queueMicrotask(() => {
      applyingRemote = false;
    });
  }

  async function pushLocalState() {
    if (stopped) return;
    const data = snapshot();
    const json = JSON.stringify(data);
    if (json === lastSyncedJson) return;
    lastSyncedJson = json;
    await client.from("app_state").upsert({ code, data, updated_at: new Date().toISOString() });
  }

  function schedulePush() {
    if (applyingRemote || stopped) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(pushLocalState, 800);
  }

  async function init() {
    onStatusChange("connecting");
    const { data: row, error } = await client
      .from("app_state")
      .select("data")
      .eq("code", code)
      .maybeSingle();

    if (stopped) return;

    if (error) {
      onStatusChange("offline");
      return;
    }

    if (row) {
      applyRemoteData(row.data as Record<string, unknown>);
    } else {
      await pushLocalState();
    }

    unsubscribeStore = useHabitStore.subscribe(() => schedulePush());

    channel = client
      .channel(`app_state:${code}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_state", filter: `code=eq.${code}` },
        (payload) => {
          const incoming = payload.new as { data: Record<string, unknown> };
          if (JSON.stringify(incoming.data) === lastSyncedJson) return;
          applyRemoteData(incoming.data);
        },
      )
      .subscribe((status) => {
        if (stopped) return;
        if (status === "SUBSCRIBED") onStatusChange("online");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          onStatusChange("offline");
        }
      });
  }

  init();

  return () => {
    stopped = true;
    if (pushTimer) clearTimeout(pushTimer);
    unsubscribeStore?.();
    channel?.unsubscribe();
  };
}

import { createContext, useContext } from "react";
import type { SyncStatus } from "../sync/householdSync";

export interface HouseholdSyncContextValue {
  code: string | null;
  status: SyncStatus | "disabled";
  leave: () => void;
}

export const HouseholdSyncContext = createContext<HouseholdSyncContextValue>({
  code: null,
  status: "disabled",
  leave: () => {},
});

export function useHouseholdSync(): HouseholdSyncContextValue {
  return useContext(HouseholdSyncContext);
}

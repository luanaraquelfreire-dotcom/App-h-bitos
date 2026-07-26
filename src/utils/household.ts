import type { HouseholdMember } from "../types";

export function memberName(members: HouseholdMember[], id?: string): string | undefined {
  if (!id) return undefined;
  return members.find((m) => m.id === id)?.name;
}

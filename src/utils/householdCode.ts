const KEY = "habitos-household-code";

export function getHouseholdCode(): string | null {
  return localStorage.getItem(KEY);
}

export function setHouseholdCode(code: string): void {
  localStorage.setItem(KEY, code);
}

export function clearHouseholdCode(): void {
  localStorage.removeItem(KEY);
}

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
export const DAY_LABELS_FULL = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function weekDays(reference: Date): Date[] {
  const start = startOfWeek(reference, { weekStartsOn: 0 });
  const end = endOfWeek(reference, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function monthGrid(reference: Date): Date[] {
  const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(reference), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function isSameMonthAs(date: Date, reference: Date): boolean {
  return isSameMonth(date, reference);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function nextMonth(reference: Date): Date {
  return addMonths(reference, 1);
}

export function prevMonth(reference: Date): Date {
  return subMonths(reference, 1);
}

export function nextWeek(reference: Date): Date {
  return addDays(reference, 7);
}

export function prevWeek(reference: Date): Date {
  return addDays(reference, -7);
}

export function formatLong(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatMonthYear(date: Date): string {
  const s = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatWeekRange(days: Date[]): string {
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];
  const sameMonth = isSameMonth(first, last);
  if (sameMonth) {
    return `${format(first, "d")} - ${format(last, "d 'de' MMMM", { locale: ptBR })}`;
  }
  return `${format(first, "d MMM", { locale: ptBR })} - ${format(last, "d MMM", { locale: ptBR })}`;
}

export function daysUntilYearEnd(): number {
  return Math.max(differenceInCalendarDays(endOfYear(new Date()), new Date()), 0);
}

import type { Transaction } from "../types";
import { monthKey } from "./date";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  fixedExpense: number;
  variableExpense: number;
}

export function transactionsForMonth(transactions: Transaction[], reference: Date): Transaction[] {
  const key = monthKey(reference);
  return transactions.filter((t) => t.date.startsWith(key));
}

export function monthlySummary(transactions: Transaction[], reference: Date): MonthlySummary {
  const monthTransactions = transactionsForMonth(transactions, reference);
  let income = 0;
  let expense = 0;
  let fixedExpense = 0;
  let variableExpense = 0;

  for (const t of monthTransactions) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      if (t.category === "fixed") fixedExpense += t.amount;
      else variableExpense += t.amount;
    }
  }

  return { income, expense, balance: income - expense, fixedExpense, variableExpense };
}

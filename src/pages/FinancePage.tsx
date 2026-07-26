import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import SegmentedControl from "../components/SegmentedControl";
import TransactionFormModal from "../components/TransactionFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { Transaction, TransactionType } from "../types";
import { formatMonthYear, nextMonth, prevMonth } from "../utils/date";
import { formatCurrency, monthlySummary, transactionsForMonth } from "../utils/finance";

type FilterType = "all" | TransactionType;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "income", label: "Entradas" },
  { id: "expense", label: "Saídas" },
];

export default function FinancePage() {
  const transactions = useHabitStore((s) => s.transactions);
  const addTransaction = useHabitStore((s) => s.addTransaction);
  const updateTransaction = useHabitStore((s) => s.updateTransaction);
  const removeTransaction = useHabitStore((s) => s.removeTransaction);

  const [reference, setReference] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const summary = monthlySummary(transactions, reference);
  const monthTransactions = transactionsForMonth(transactions, reference)
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const expenseTotal = summary.fixedExpense + summary.variableExpense;
  const fixedRatio = expenseTotal > 0 ? summary.fixedExpense / expenseTotal : 0;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold text-duo-text">Finanças</h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setReference((r) => prevMonth(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-duo-text">{formatMonthYear(reference)}</span>
        <button
          onClick={() => setReference((r) => nextMonth(r))}
          className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <TrendingUp className="text-duo-green-dark" size={22} />
          <span className="mt-1 text-sm font-semibold text-duo-green-dark">
            {formatCurrency(summary.income)}
          </span>
          <span className="text-[11px] font-medium text-duo-gray-dark">Entradas</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <TrendingDown className="text-duo-red-dark" size={22} />
          <span className="mt-1 text-sm font-semibold text-duo-red-dark">
            {formatCurrency(summary.expense)}
          </span>
          <span className="text-[11px] font-medium text-duo-gray-dark">Saídas</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl py-4">
          <Wallet className={summary.balance >= 0 ? "text-duo-blue-dark" : "text-duo-red-dark"} size={22} />
          <span
            className={`mt-1 text-sm font-semibold ${
              summary.balance >= 0 ? "text-duo-blue-dark" : "text-duo-red-dark"
            }`}
          >
            {formatCurrency(summary.balance)}
          </span>
          <span className="text-[11px] font-medium text-duo-gray-dark">Saldo</span>
        </div>
      </div>

      {expenseTotal > 0 && (
        <div className="mb-5 rounded-2xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl p-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-duo-gray-dark">
            <span>Fixas: {formatCurrency(summary.fixedExpense)}</span>
            <span>Variáveis: {formatCurrency(summary.variableExpense)}</span>
          </div>
          <ProgressBar value={fixedRatio} colorClass="bg-duo-blue-dark" />
        </div>
      )}

      <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />

      {monthTransactions.length === 0 ? (
        <EmptyState
          title="Nada registrado neste mês"
          description="Registre tudo o que entrou e o que saiu para acompanhar seu saldo."
        />
      ) : (
        <div className="mb-5 space-y-2.5">
          {monthTransactions.map((t) => (
            <button
              key={t.id}
              onClick={() => setEditing(t)}
              className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3 text-left"
            >
              {t.type === "income" ? (
                <TrendingUp className="shrink-0 text-duo-green-dark" size={22} />
              ) : (
                <TrendingDown className="shrink-0 text-duo-red-dark" size={22} />
              )}
              <span className="flex-1">
                <span className="block font-medium text-duo-text">{t.description}</span>
                <span className="block text-xs font-semibold text-duo-gray-dark">
                  {t.category === "fixed" ? "Fixa" : "Variável"} ·{" "}
                  {new Date(`${t.date}T00:00:00`).toLocaleDateString("pt-BR")}
                </span>
              </span>
              <span
                className={`shrink-0 font-semibold ${
                  t.type === "income" ? "text-duo-green-dark" : "text-duo-red-dark"
                }`}
              >
                {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue-dark py-3.5 font-semibold uppercase tracking-wide text-white"
      >
        <Plus size={20} strokeWidth={3} />
        Nova transação
      </button>

      {showAdd && (
        <TransactionFormModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addTransaction(data);
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <TransactionFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            updateTransaction(editing.id, data);
            setEditing(null);
          }}
          onDelete={() => {
            removeTransaction(editing.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

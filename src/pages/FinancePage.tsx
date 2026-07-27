import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import PlannedPurchaseFormModal from "../components/PlannedPurchaseFormModal";
import ProgressBar from "../components/ProgressBar";
import SegmentedControl from "../components/SegmentedControl";
import TransactionFormModal from "../components/TransactionFormModal";
import { useHabitStore } from "../store/useHabitStore";
import type { PlannedPurchase, Transaction, TransactionType } from "../types";
import { daysSince, formatMonthYear, nextMonth, prevMonth } from "../utils/date";
import { formatCurrency, monthlySummary, transactionsForMonth } from "../utils/finance";

type FilterType = "all" | TransactionType;
type SubView = "transactions" | "planned";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "income", label: "Entradas" },
  { id: "expense", label: "Saídas" },
];

const SUB_TABS: { id: SubView; label: string }[] = [
  { id: "transactions", label: "Transações" },
  { id: "planned", label: "Planejamento de compras" },
];

export default function FinancePage() {
  const transactions = useHabitStore((s) => s.transactions);
  const addTransaction = useHabitStore((s) => s.addTransaction);
  const updateTransaction = useHabitStore((s) => s.updateTransaction);
  const removeTransaction = useHabitStore((s) => s.removeTransaction);
  const plannedPurchases = useHabitStore((s) => s.plannedPurchases);
  const addPlannedPurchase = useHabitStore((s) => s.addPlannedPurchase);
  const updatePlannedPurchase = useHabitStore((s) => s.updatePlannedPurchase);
  const removePlannedPurchase = useHabitStore((s) => s.removePlannedPurchase);

  const [subView, setSubView] = useState<SubView>("transactions");
  const [reference, setReference] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showPlanAdd, setShowPlanAdd] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlannedPurchase | null>(null);
  const [buying, setBuying] = useState<PlannedPurchase | null>(null);

  const summary = monthlySummary(transactions, reference);
  const monthTransactions = transactionsForMonth(transactions, reference)
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const expenseTotal = summary.fixedExpense + summary.variableExpense;
  const fixedRatio = expenseTotal > 0 ? summary.fixedExpense / expenseTotal : 0;

  const sortedPlanned = [...plannedPurchases].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold text-duo-text">Finanças</h1>

      <SegmentedControl options={SUB_TABS} value={subView} onChange={setSubView} />

      {subView === "transactions" ? (
        <>
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
              <Wallet
                className={summary.balance >= 0 ? "text-duo-blue-dark" : "text-duo-red-dark"}
                size={22}
              />
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
        </>
      ) : (
        <>
          <p className="mb-4 text-sm font-medium text-duo-gray-dark">
            Antes de comprar, anote aqui e deixe a ideia esfriar por uns dias. Se ainda fizer
            sentido depois, é só marcar como comprado.
          </p>

          {sortedPlanned.length === 0 ? (
            <EmptyState
              title="Nada planejado ainda"
              description="Anote aqui o que você quer comprar antes de sair comprando por impulso."
            />
          ) : (
            <div className="mb-5 space-y-2.5">
              {sortedPlanned.map((p) => {
                const waiting = daysSince(p.createdAt);
                return (
                  <div
                    key={p.id}
                    className="duo-card flex items-center gap-3 rounded-2xl border-duo-gray/60 bg-white/55 backdrop-blur-xl px-4 py-3"
                  >
                    <button onClick={() => setEditingPlan(p)} className="flex-1 text-left">
                      <span className="block font-medium text-duo-text">{p.name}</span>
                      <span className="block text-xs font-semibold text-duo-gray-dark">
                        há {waiting} {waiting === 1 ? "dia" : "dias"} na lista
                        {p.estimatedPrice ? ` · ${formatCurrency(p.estimatedPrice)}` : ""}
                      </span>
                    </button>
                    <button
                      onClick={() => setBuying(p)}
                      className="duo-btn shrink-0 rounded-xl border-duo-purple-dark bg-duo-purple-dark px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white"
                    >
                      Comprar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowPlanAdd(true)}
            className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-purple-dark bg-duo-purple-dark py-3.5 font-semibold uppercase tracking-wide text-white"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            Planejar uma compra
          </button>

          {showPlanAdd && (
            <PlannedPurchaseFormModal
              onClose={() => setShowPlanAdd(false)}
              onSave={(data) => {
                addPlannedPurchase(data);
                setShowPlanAdd(false);
              }}
            />
          )}

          {editingPlan && (
            <PlannedPurchaseFormModal
              initial={editingPlan}
              onClose={() => setEditingPlan(null)}
              onSave={(data) => {
                updatePlannedPurchase(editingPlan.id, data);
                setEditingPlan(null);
              }}
              onDelete={() => {
                removePlannedPurchase(editingPlan.id);
                setEditingPlan(null);
              }}
            />
          )}

          {buying && (
            <TransactionFormModal
              prefill={{
                type: "expense",
                category: "variable",
                description: buying.name,
                amount: buying.estimatedPrice,
              }}
              onClose={() => setBuying(null)}
              onSave={(data) => {
                addTransaction(data);
                removePlannedPurchase(buying.id);
                setBuying(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Transaction, TransactionCategory, TransactionType } from "../types";
import { todayKey } from "../utils/date";
import ConfirmDialog from "./ConfirmDialog";
import ModalShell from "./ModalShell";

interface TransactionFormModalProps {
  initial?: Transaction;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    amount: number;
    date: string;
  }) => void;
  onDelete?: () => void;
}

export default function TransactionFormModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: TransactionFormModalProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<TransactionCategory>(initial?.category ?? "variable");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = description.trim().length > 0 && Number(amount) > 0 && date.length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
    });
  }

  return (
    <ModalShell title={initial ? "Editar transação" : "Nova transação"} onClose={onClose}>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setType("income")}
            className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
              type === "income"
                ? "border-duo-green-dark bg-duo-green/10 text-duo-green-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            Entrada
          </button>
          <button
            onClick={() => setType("expense")}
            className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
              type === "expense"
                ? "border-duo-red-dark bg-duo-red/10 text-duo-red-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            Saída
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Descrição
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Aluguel, salário, mercado..."
          maxLength={60}
          className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
        />

        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
              Valor (R$)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-3 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
            />
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
          Categoria
        </label>
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setCategory("fixed")}
            className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
              category === "fixed"
                ? "border-duo-blue-dark bg-duo-blue/10 text-duo-blue-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            Fixa
          </button>
          <button
            onClick={() => setCategory("variable")}
            className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
              category === "variable"
                ? "border-duo-purple-dark bg-duo-purple/10 text-duo-purple-dark"
                : "border-duo-gray text-duo-gray-dark"
            }`}
          >
            Variável
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green-dark py-3.5 text-center font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Adicionar transação"}
        </button>

        {initial && onDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir transação
          </button>
        )}

        {confirmingDelete && onDelete && (
          <ConfirmDialog
            title="Excluir transação?"
            message={`Isso vai apagar "${description}" do seu histórico financeiro. Essa ação não pode ser desfeita.`}
            onConfirm={onDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
    </ModalShell>
  );
}

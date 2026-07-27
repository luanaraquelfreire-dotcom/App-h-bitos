import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { PlannedPurchase } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import ModalShell from "./ModalShell";

interface PlannedPurchaseFormModalProps {
  initial?: PlannedPurchase;
  onClose: () => void;
  onSave: (data: { name: string; estimatedPrice?: number; notes?: string }) => void;
  onDelete?: () => void;
}

export default function PlannedPurchaseFormModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: PlannedPurchaseFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [estimatedPrice, setEstimatedPrice] = useState(initial?.estimatedPrice?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      estimatedPrice: estimatedPrice.trim() ? Number(estimatedPrice) : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  }

  return (
    <ModalShell title={initial ? "Editar item planejado" : "Planejar uma compra"} onClose={onClose}>
      <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">O que você quer comprar?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Tênis novo, fone de ouvido..."
        maxLength={60}
        className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
      />

      <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
        Preço estimado (opcional)
      </label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={estimatedPrice}
        onChange={(e) => setEstimatedPrice(e.target.value)}
        placeholder="0,00"
        className="mb-4 w-full rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
      />

      <label className="mb-1 block text-xs font-medium uppercase text-duo-gray-dark">
        Por que você quer isso? (opcional)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ajuda a lembrar se ainda faz sentido daqui a uns dias..."
        rows={3}
        maxLength={200}
        className="mb-6 w-full resize-none rounded-xl border border-white/60 bg-white/55 shadow-[0_8px_30px_-8px_rgba(120,110,160,0.28)] backdrop-blur-xl px-4 py-3 font-medium text-duo-text outline-none focus:border-duo-blue"
      />

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="duo-btn w-full rounded-2xl border-duo-purple-dark bg-duo-purple-dark py-3.5 text-center font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
      >
        {initial ? "Salvar alterações" : "Adicionar à lista"}
      </button>

      {initial && onDelete && (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold uppercase tracking-wide text-duo-red-dark"
        >
          <Trash2 size={18} />
          Remover da lista
        </button>
      )}

      {confirmingDelete && onDelete && (
        <ConfirmDialog
          title="Remover da lista?"
          message={`Isso vai apagar "${name}" do seu planejamento de compras.`}
          confirmLabel="Remover"
          onConfirm={onDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </ModalShell>
  );
}

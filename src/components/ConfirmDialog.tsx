import type { MouseEvent } from "react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo de confirmação para ações destrutivas (excluir/remover), com
 * fechar (cancelar) por Esc ou clique fora. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
      onClick={handleBackdropClick}
    >
      <div className="glass w-full max-w-sm rounded-3xl p-5">
        <h3 className="mb-2 text-lg font-semibold text-duo-text">{title}</h3>
        <p className="mb-5 text-sm font-semibold text-duo-gray-dark">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-duo-gray/60 py-3 font-semibold uppercase tracking-wide text-duo-gray-dark"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="duo-btn flex-1 rounded-2xl border-duo-red-dark bg-duo-red-dark py-3 font-semibold uppercase tracking-wide text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

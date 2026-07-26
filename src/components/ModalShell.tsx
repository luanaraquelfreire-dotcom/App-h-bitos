import { X } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";

interface ModalShellProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** Estrutura compartilhada por todos os modais: fundo escurecido, folha
 * inferior/central com cabeçalho (título + fechar), fecha com Esc ou clique
 * fora do conteúdo. */
export default function ModalShell({ title, onClose, children }: ModalShellProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleBackdropClick}
    >
      <div className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="truncate text-lg font-semibold text-duo-text">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

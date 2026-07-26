import { Download, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { exportBackup, importBackup } from "../utils/backup";

export default function BackupCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await importBackup(file);
      setMessage("Backup importado com sucesso!");
    } catch {
      setMessage("Não foi possível importar esse arquivo.");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-duo-gray bg-white p-4">
      <h2 className="mb-1 text-sm font-extrabold uppercase text-duo-gray-dark">Backup</h2>
      <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
        Seus dados ficam salvos só neste navegador. Exporte um backup de vez em quando para não
        perder nada.
      </p>
      <div className="flex gap-2">
        <button
          onClick={exportBackup}
          className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-xl border-duo-green-dark bg-duo-green py-2.5 text-sm font-extrabold uppercase tracking-wide text-white"
        >
          <Download size={16} />
          Exportar
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="duo-btn flex flex-1 items-center justify-center gap-2 rounded-xl border-duo-blue-dark bg-duo-blue py-2.5 text-sm font-extrabold uppercase tracking-wide text-white"
        >
          <Upload size={16} />
          Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {message && <p className="mt-2 text-xs font-bold text-duo-gray-dark">{message}</p>}
    </div>
  );
}

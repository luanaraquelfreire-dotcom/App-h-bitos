import { LogOut, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useHouseholdSync } from "../context/HouseholdSyncContext";

export default function SyncStatusCard() {
  const { code, status, leave } = useHouseholdSync();

  if (status === "disabled") return null;

  return (
    <div className="mb-6 rounded-2xl border-2 border-duo-gray bg-white p-4">
      <h2 className="mb-2 text-sm font-extrabold uppercase text-duo-gray-dark">
        Sincronização em tempo real
      </h2>
      <div className="mb-3 flex items-center gap-2">
        {status === "online" && <Wifi size={18} className="text-duo-green-dark" />}
        {status === "connecting" && (
          <RefreshCw size={18} className="animate-spin text-duo-blue-dark" />
        )}
        {status === "offline" && <WifiOff size={18} className="text-duo-red-dark" />}
        <span className="text-sm font-bold text-duo-text">
          {status === "online" && `Conectado · código "${code}"`}
          {status === "connecting" && "Conectando..."}
          {status === "offline" && "Sem conexão com o servidor"}
        </span>
      </div>
      <button
        onClick={leave}
        className="flex items-center gap-2 text-sm font-extrabold text-duo-red-dark"
      >
        <LogOut size={16} />
        Sair deste código compartilhado
      </button>
    </div>
  );
}

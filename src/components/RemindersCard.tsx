import { Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { getRemindersEnabled, setRemindersEnabled } from "../utils/reminderPrefs";

const isSupported = typeof Notification !== "undefined";

export default function RemindersCard() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "denied",
  );
  const [enabled, setEnabled] = useState(getRemindersEnabled());

  async function handleToggle() {
    if (!isSupported) return;

    if (enabled) {
      setEnabled(false);
      setRemindersEnabled(false);
      return;
    }

    if (Notification.permission === "granted") {
      setEnabled(true);
      setRemindersEnabled(true);
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setEnabled(true);
      setRemindersEnabled(true);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-duo-gray bg-white p-4">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-extrabold uppercase text-duo-gray-dark">
        {enabled ? <Bell size={16} /> : <BellOff size={16} />} Lembretes
      </h2>
      <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
        Manda uma notificação nos horários dos hábitos, tarefas de casa, metas e
        estudos agendados. Só funciona com o app aberto (ou recém aberto) no
        celular — não é um aviso de servidor, então não substitui um alarme se o
        app ficar fechado por muito tempo.
      </p>

      {!isSupported ? (
        <p className="text-xs font-bold text-duo-red-dark">
          Seu navegador não tem suporte a notificações.
        </p>
      ) : permission === "denied" ? (
        <p className="text-xs font-bold text-duo-red-dark">
          Notificações bloqueadas nas configurações do navegador. Ative manualmente
          pra usar essa função.
        </p>
      ) : (
        <button
          onClick={handleToggle}
          className={`duo-btn w-full rounded-xl border-2 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white ${
            enabled ? "border-duo-gray-dark bg-duo-gray-dark" : "border-duo-green-dark bg-duo-green"
          }`}
        >
          {enabled ? "Desativar lembretes" : "Ativar lembretes"}
        </button>
      )}
    </div>
  );
}

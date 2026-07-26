import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { HouseholdSyncContext } from "../context/HouseholdSyncContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { startHouseholdSync, type SyncStatus } from "../sync/householdSync";
import { clearHouseholdCode, getHouseholdCode, setHouseholdCode } from "../utils/householdCode";

const CODE_PATTERN = /^[a-zA-Z0-9_-]{3,40}$/;

interface HouseholdCodeGateProps {
  children: ReactNode;
}

export default function HouseholdCodeGate({ children }: HouseholdCodeGateProps) {
  const [code, setCode] = useState<string | null>(() => getHouseholdCode());
  const [status, setStatus] = useState<SyncStatus>("connecting");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !code) return;
    const stop = startHouseholdSync(code, setStatus);
    return stop;
  }, [code]);

  if (!isSupabaseConfigured) {
    return (
      <HouseholdSyncContext.Provider value={{ code: null, status: "disabled", leave: () => {} }}>
        {children}
      </HouseholdSyncContext.Provider>
    );
  }

  if (!code) {
    function handleSubmit(e: FormEvent) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!CODE_PATTERN.test(trimmed)) {
        setError("Use de 3 a 40 letras, números, - ou _ (sem espaços ou acentos).");
        return;
      }
      setHouseholdCode(trimmed);
      setCode(trimmed);
    }

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#fbfbfb] px-6">
        <div className="w-full rounded-3xl border-2 border-duo-gray bg-white p-6 text-center">
          <div className="mb-3 text-4xl">🔗</div>
          <h1 className="mb-2 text-xl font-extrabold text-duo-text">Código da família</h1>
          <p className="mb-4 text-sm font-semibold text-duo-gray-dark">
            Combine uma palavra com seu parceiro(a) e digite a mesma nos dois celulares.
            Quem digitar primeiro cria os dados compartilhados; o segundo entra
            automaticamente nos mesmos dados.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: casal2026"
              maxLength={40}
              autoFocus
              className="mb-2 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 text-center font-bold text-duo-text outline-none focus:border-duo-blue"
            />
            {error && <p className="mb-2 text-xs font-bold text-duo-red-dark">{error}</p>}
            <button
              type="submit"
              className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 font-extrabold uppercase tracking-wide text-white"
            >
              Continuar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <HouseholdSyncContext.Provider
      value={{
        code,
        status,
        leave: () => {
          clearHouseholdCode();
          setCode(null);
        },
      }}
    >
      {children}
    </HouseholdSyncContext.Provider>
  );
}
